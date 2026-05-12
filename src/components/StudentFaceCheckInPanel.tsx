import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, Loader2, RefreshCcw, ScanFace, ShieldCheck, UserX, VideoOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  checkInByFace,
  listOpenFaceSessions,
  recognizeFace,
  type FaceRecognizeResponse,
  type OpenFaceSession,
} from '../services/smartAttendApi';

const PROCESS_EVERY_N_FRAMES = 8;
const RESULT_CACHE_MS = 3000;
const MOTION_THRESHOLD = 10;
const REQUIRED_STABLE_FRAMES = 5;
const FACE_MATCH_THRESHOLD = Number(import.meta.env.VITE_FACE_MATCH_THRESHOLD || 0.6);
const MAX_FRAME_SIDE = 320;

type ScanStatus = 'idle' | 'loading' | 'camera' | 'scanning' | 'verifying' | 'success' | 'no-face' | 'multiple' | 'wrong-user' | 'low-confidence' | 'error';

function statusText(status: ScanStatus) {
  if (status === 'loading') return 'Đang tìm phiên mở...';
  if (status === 'camera') return 'Đang mở camera...';
  if (status === 'scanning') return 'Đưa khuôn mặt vào khung';
  if (status === 'verifying') return 'Đang xác minh...';
  if (status === 'success') return 'Điểm danh thành công';
  if (status === 'no-face') return 'Không tìm thấy khuôn mặt';
  if (status === 'multiple') return 'Có nhiều khuôn mặt trong khung';
  if (status === 'wrong-user') return 'Khuôn mặt không khớp tài khoản';
  if (status === 'low-confidence') return 'Độ tin cậy thấp';
  if (status === 'error') return 'Không thể điểm danh';
  return 'FaceID realtime check-in';
}

export function StudentFaceCheckInPanel() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const frameIndexRef = useRef(0);
  const previousMotionFrameRef = useRef<Uint8ClampedArray | null>(null);
  const cachedResultRef = useRef<{ result: FaceRecognizeResponse; expiresAt: number } | null>(null);
  const inFlightRef = useRef(false);
  const checkedInRef = useRef(false);
  const stableRef = useRef<number[]>([]);

  const [sessions, setSessions] = useState<OpenFaceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState('Chọn phiên đang mở rồi bật camera để điểm danh bằng khuôn mặt.');
  const [stableFrames, setStableFrames] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId),
    [selectedSessionId, sessions],
  );
  const scanning = status === 'camera' || status === 'scanning' || status === 'verifying' || status === 'no-face' || status === 'multiple' || status === 'wrong-user' || status === 'low-confidence';
  const progress = Math.min(100, Math.round((stableFrames / REQUIRED_STABLE_FRAMES) * 100));

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    inFlightRef.current = false;
    frameIndexRef.current = 0;
    previousMotionFrameRef.current = null;
    cachedResultRef.current = null;
  }, []);

  const resetStability = useCallback(() => {
    stableRef.current = [];
    setStableFrames(0);
    setAverageConfidence(0);
  }, []);

  const refreshSessions = useCallback(async () => {
    if (!user?.id) return;
    try {
      setStatus((current) => current === 'idle' ? 'loading' : current);
      const nextSessions = await listOpenFaceSessions(user.id);
      setSessions(nextSessions);
      setSelectedSessionId((current) => current || nextSessions[0]?.id || '');
      setMessage(nextSessions.length ? 'Có phiên đang mở. Bạn có thể bắt đầu quét FaceID.' : 'Hiện chưa có phiên điểm danh nào đang mở cho lớp của bạn.');
      setStatus((current) => current === 'loading' ? 'idle' : current);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Không tải được phiên điểm danh đang mở.');
    }
  }, [user?.id]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return '';

    const sourceWidth = video.videoWidth || 640;
    const sourceHeight = video.videoHeight || 480;
    const scale = Math.min(1, MAX_FRAME_SIDE / Math.max(sourceWidth, sourceHeight));
    const width = Math.round(sourceWidth * scale);
    const height = Math.round(sourceHeight * scale);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return '';
    context.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.65);
  }, []);

  const isFrameStable = useCallback(() => {
    const video = videoRef.current;
    const canvas = motionCanvasRef.current;
    if (!video || !canvas || video.readyState < 2) return false;

    const width = 32;
    const height = 24;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;

    context.drawImage(video, 0, 0, width, height);
    const data = context.getImageData(0, 0, width, height).data;
    const previous = previousMotionFrameRef.current;
    previousMotionFrameRef.current = new Uint8ClampedArray(data);
    if (!previous) return true;

    let diff = 0;
    for (let index = 0; index < data.length; index += 4) {
      const currentGray = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const previousGray = (previous[index] + previous[index + 1] + previous[index + 2]) / 3;
      diff += Math.abs(currentGray - previousGray);
    }

    return diff / (width * height) < MOTION_THRESHOLD;
  }, []);

  const handleResult = useCallback(async (result: FaceRecognizeResponse) => {
    if (!user?.id || !selectedSessionId) return;

    if (!result.matched || !result.student_id) {
      resetStability();
      if (result.reason === 'NO_FACE') {
        setStatus('no-face');
        setMessage('Đưa khuôn mặt vào giữa khung oval.');
      } else if (result.reason === 'MULTIPLE_FACES') {
        setStatus('multiple');
        setMessage('Chỉ để một khuôn mặt trong khung.');
      } else {
        setStatus('low-confidence');
        setMessage('Tiến gần camera hơn hoặc tăng ánh sáng.');
      }
      return;
    }

    if (result.student_id !== user.id) {
      resetStability();
      setStatus('wrong-user');
      setMessage(`Nhận ra ${result.student_name || result.student_id}, không phải tài khoản hiện tại.`);
      return;
    }

    const confidences = [...stableRef.current, result.confidence].slice(-REQUIRED_STABLE_FRAMES);
    stableRef.current = confidences;
    setStableFrames(confidences.length);
    const average = confidences.reduce((sum, value) => sum + value, 0) / confidences.length;
    setAverageConfidence(average);
    setStatus('verifying');
    setMessage(`${user.name} - ${confidences.length}/${REQUIRED_STABLE_FRAMES} frame ổn định`);

    if (confidences.length >= REQUIRED_STABLE_FRAMES && average >= FACE_MATCH_THRESHOLD && !checkedInRef.current) {
      checkedInRef.current = true;
      const response = await checkInByFace(user.id, selectedSessionId, average);
      setStatus('success');
      setMessage(response.status === 'already_checked_in' ? 'Bạn đã điểm danh trong phiên này rồi.' : 'Điểm danh bằng khuôn mặt thành công.');
      stopCamera();
      await refreshSessions();
    }
  }, [refreshSessions, resetStability, selectedSessionId, stopCamera, user?.id, user?.name]);

  const scanOnce = useCallback(async () => {
    if (inFlightRef.current || checkedInRef.current || document.visibilityState !== 'visible') return;

    const cached = cachedResultRef.current;
    if (cached && cached.expiresAt > Date.now()) {
      await handleResult(cached.result);
      return;
    }

    if (!isFrameStable()) {
      setStatus('scanning');
      setMessage('Giữ khuôn mặt ổn định thêm một chút trước khi xác minh.');
      return;
    }

    const image = captureFrame();
    if (!image) return;

    inFlightRef.current = true;
    try {
      const result = await recognizeFace(image, selectedSessionId);
      if (result.matched) {
        cachedResultRef.current = {
          result,
          expiresAt: Date.now() + RESULT_CACHE_MS,
        };
      }
      await handleResult(result);
    } catch (error) {
      resetStability();
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Không thể nhận diện khuôn mặt.');
    } finally {
      inFlightRef.current = false;
    }
  }, [captureFrame, handleResult, isFrameStable, resetStability, selectedSessionId]);

  const scanLoop = useCallback(() => {
    frameIndexRef.current += 1;
    if (frameIndexRef.current % PROCESS_EVERY_N_FRAMES === 0) {
      scanOnce();
    }
    rafRef.current = window.requestAnimationFrame(scanLoop);
  }, [scanOnce]);

  const startScan = useCallback(async () => {
    if (!selectedSessionId || scanning) return;
    checkedInRef.current = false;
    resetStability();
    try {
      setStatus('camera');
      setMessage('Đang mở webcam...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('scanning');
      setMessage('Nhìn thẳng vào camera và giữ yên vài giây.');
      rafRef.current = window.requestAnimationFrame(scanLoop);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Trình duyệt không mở được webcam.');
    }
  }, [resetStability, scanLoop, scanning, selectedSessionId]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-green-600" />
            Điểm danh khuôn mặt realtime
          </h3>
          <p className="text-[12px] text-gray-500 mt-1">Camera chạy liên tục, AI chỉ xử lý mỗi 8 frame và cache match 3 giây.</p>
        </div>
        <select value={selectedSessionId} onChange={(event) => setSelectedSessionId(event.target.value)} className="px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white min-w-[260px]">
          <option value="">Chưa có phiên đang mở</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.course_code} - {session.course_name}
            </option>
          ))}
        </select>
        <button onClick={refreshSessions} className="px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-[13px] flex items-center gap-2">
          <RefreshCcw className="w-4 h-4" /> Làm mới
        </button>
        <button disabled={!selectedSessionId || scanning} onClick={startScan} className="px-3 py-2 bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-[13px] flex items-center gap-2">
          <Camera className="w-4 h-4" /> Bắt đầu quét
        </button>
        <button disabled={!scanning} onClick={() => { stopCamera(); setStatus('idle'); resetStability(); }} className="px-3 py-2 border border-gray-200 disabled:text-gray-300 disabled:bg-gray-50 text-gray-700 rounded-lg text-[13px] flex items-center gap-2">
          <VideoOff className="w-4 h-4" /> Dừng
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        <div className="relative bg-gray-950 aspect-video overflow-hidden">
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={motionCanvasRef} className="hidden" />
          {!scanning && status !== 'success' && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px]">
              Webcam realtime scan
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`relative w-[48%] max-w-[260px] aspect-[0.72] rounded-[50%] border-2 ${status === 'success' ? 'border-green-400' : status === 'error' || status === 'wrong-user' || status === 'multiple' ? 'border-red-400' : 'border-white/85'} shadow-[0_0_0_999px_rgba(0,0,0,0.38)]`}>
              <div className="absolute left-[-8%] right-[-8%] h-0.5 bg-green-300/90 shadow-[0_0_18px_rgba(74,222,128,0.95)] animate-pulse" style={{ top: `${22 + progress * 0.55}%` }} />
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-5">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] ${status === 'success' ? 'bg-green-50 text-green-700' : status === 'error' || status === 'wrong-user' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : status === 'no-face' || status === 'wrong-user' ? <UserX className="w-4 h-4" /> : scanning || status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {statusText(status)}
            </div>
            <p className="mt-4 text-[13px] text-gray-600 leading-6">{message}</p>
            {selectedSession && (
              <p className="mt-3 text-[12px] text-gray-400">
                Session: {selectedSession.id}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[12px] text-gray-500 mb-1">
                <span>Frame ổn định</span>
                <span>{stableFrames}/{REQUIRED_STABLE_FRAMES}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-green-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px] text-gray-500">
              <span>Threshold</span>
              <span>{Math.round(FACE_MATCH_THRESHOLD * 100)}%</span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-gray-500">
              <span>Confidence TB</span>
              <span>{averageConfidence ? `${Math.round(averageConfidence * 100)}%` : '--'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
