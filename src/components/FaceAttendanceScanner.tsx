import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CheckCircle2, Loader2, ScanFace, ShieldCheck, UserX, Users, VideoOff } from 'lucide-react';
import { checkInByFace, recognizeFace, type FaceRecognizeResponse } from '../services/smartAttendApi';

const PROCESS_EVERY_N_FRAMES = 8;
const RESULT_CACHE_MS = 3000;
const MOTION_THRESHOLD = 10;
const REQUIRED_STABLE_FRAMES = 5;
const FACE_MATCH_THRESHOLD = Number(import.meta.env.VITE_FACE_MATCH_THRESHOLD || 0.6);
const MAX_FRAME_SIDE = 320;

type ScanStatus = 'idle' | 'camera' | 'scanning' | 'verifying' | 'success' | 'no-face' | 'multiple' | 'low-confidence' | 'error';

interface StableMatch {
  studentId: string;
  studentName: string;
  confidences: number[];
}

interface FaceAttendanceScannerProps {
  sessionId: string;
  disabled?: boolean;
  onCheckedIn: () => Promise<void> | void;
}

function statusText(status: ScanStatus, lastResult: FaceRecognizeResponse | null) {
  if (status === 'success') return 'Nhan dien thanh cong';
  if (status === 'verifying') return 'Dang xac minh...';
  if (status === 'no-face') return 'Khong tim thay khuon mat';
  if (status === 'multiple') return 'Co nhieu khuon mat trong khung';
  if (status === 'low-confidence') return `Do tin cay thap${lastResult ? ` (${Math.round(lastResult.confidence * 100)}%)` : ''}`;
  if (status === 'error') return 'Khong the quet khuon mat';
  if (status === 'camera') return 'Dang mo camera...';
  return 'Dua khuon mat vao khung';
}

function statusIcon(status: ScanStatus) {
  if (status === 'success') return <CheckCircle2 className="w-4 h-4" />;
  if (status === 'no-face') return <UserX className="w-4 h-4" />;
  if (status === 'multiple') return <Users className="w-4 h-4" />;
  if (status === 'error') return <VideoOff className="w-4 h-4" />;
  if (status === 'verifying' || status === 'scanning') return <Loader2 className="w-4 h-4 animate-spin" />;
  return <ScanFace className="w-4 h-4" />;
}

export function FaceAttendanceScanner({ sessionId, disabled, onCheckedIn }: FaceAttendanceScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const frameIndexRef = useRef(0);
  const previousMotionFrameRef = useRef<Uint8ClampedArray | null>(null);
  const cachedResultRef = useRef<{ result: FaceRecognizeResponse; expiresAt: number } | null>(null);
  const inFlightRef = useRef(false);
  const stableRef = useRef<StableMatch | null>(null);
  const checkedInRef = useRef(false);

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [lastResult, setLastResult] = useState<FaceRecognizeResponse | null>(null);
  const [stableFrames, setStableFrames] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [message, setMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const isScanning = cameraActive;

  const progress = useMemo(() => Math.min(100, Math.round((stableFrames / REQUIRED_STABLE_FRAMES) * 100)), [stableFrames]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    inFlightRef.current = false;
    frameIndexRef.current = 0;
    previousMotionFrameRef.current = null;
    cachedResultRef.current = null;
    setCameraActive(false);
  }, []);

  const resetStableMatch = useCallback(() => {
    stableRef.current = null;
    setStableFrames(0);
    setAverageConfidence(0);
  }, []);

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

  const handleRecognizedMatch = useCallback(async (result: FaceRecognizeResponse) => {
    const studentId = result.student_id || '';
    const studentName = result.student_name || studentId;
    const current = stableRef.current;
    const confidences = current?.studentId === studentId
      ? [...current.confidences, result.confidence].slice(-REQUIRED_STABLE_FRAMES)
      : [result.confidence];

    stableRef.current = { studentId, studentName, confidences };
    setStableFrames(confidences.length);
    const average = confidences.reduce((sum, value) => sum + value, 0) / confidences.length;
    setAverageConfidence(average);

    if (confidences.length >= REQUIRED_STABLE_FRAMES && average >= FACE_MATCH_THRESHOLD && !checkedInRef.current) {
      checkedInRef.current = true;
      setStatus('verifying');
      setMessage(`Dang ghi diem danh cho ${studentName}...`);
      const response = await checkInByFace(studentId, sessionId, average);
      setStatus('success');
      setMessage(response.status === 'already_checked_in' ? `${studentName} da diem danh trong phien nay.` : `${studentName} da diem danh thanh cong.`);
      stopCamera();
      await onCheckedIn();
    } else {
      setStatus('verifying');
      setMessage(`${studentName} - ${confidences.length}/${REQUIRED_STABLE_FRAMES} frame on dinh`);
    }
  }, [onCheckedIn, sessionId, stopCamera]);

  const scanOnce = useCallback(async () => {
    if (disabled || checkedInRef.current || inFlightRef.current || document.visibilityState !== 'visible') return;

    const cached = cachedResultRef.current;
    if (cached && cached.expiresAt > Date.now()) {
      await handleRecognizedMatch(cached.result);
      return;
    }

    if (!isFrameStable()) {
      setStatus('scanning');
      setMessage('Giu khuon mat on dinh them mot chut truoc khi xac minh.');
      return;
    }

    const image = captureFrame();
    if (!image) return;

    inFlightRef.current = true;
    try {
      const result = await recognizeFace(image, sessionId);
      setLastResult(result);

      if (result.matched && result.student_id) {
        cachedResultRef.current = {
          result,
          expiresAt: Date.now() + RESULT_CACHE_MS,
        };
        await handleRecognizedMatch(result);
        return;
      }

      resetStableMatch();
      if (result.reason === 'NO_FACE') {
        setStatus('no-face');
        setMessage('Canh chinh mat vao khung oval.');
      } else if (result.reason === 'MULTIPLE_FACES') {
        setStatus('multiple');
        setMessage('Chi giu mot khuon mat trong khung.');
      } else if (result.reason === 'LOW_CONFIDENCE') {
        setStatus('low-confidence');
        setMessage('Tien lai gan camera hon hoac tang anh sang.');
      } else {
        setStatus('low-confidence');
        setMessage('Chua co khuon mat da dang ky phu hop.');
      }
    } catch (error) {
      resetStableMatch();
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Khong the nhan dien khuon mat.');
    } finally {
      inFlightRef.current = false;
    }
  }, [captureFrame, disabled, handleRecognizedMatch, isFrameStable, resetStableMatch, sessionId]);

  const scanLoop = useCallback(() => {
    frameIndexRef.current += 1;
    if (frameIndexRef.current % PROCESS_EVERY_N_FRAMES === 0) {
      scanOnce();
    }
    rafRef.current = window.requestAnimationFrame(scanLoop);
  }, [scanOnce]);

  const startCamera = useCallback(async () => {
    if (disabled || isScanning) return;
    checkedInRef.current = false;
    resetStableMatch();
    setLastResult(null);
    setMessage('');
    setStatus('camera');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('scanning');
      rafRef.current = window.requestAnimationFrame(scanLoop);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Trinh duyet khong mo duoc camera.');
    }
  }, [disabled, isScanning, resetStableMatch, scanLoop]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (disabled) {
      stopCamera();
      setStatus('idle');
      resetStableMatch();
    }
  }, [disabled, resetStableMatch, stopCamera]);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Camera className="w-4 h-4 text-blue-600" /> FaceID real-time</h3>
          <p className="text-[12px] text-gray-500 mt-1">Session: {sessionId || 'chua co phien mo'}</p>
        </div>
        <div className="flex gap-2">
          <button disabled={disabled || isScanning} onClick={startCamera} className="px-3 py-2 bg-navy disabled:bg-gray-300 text-white rounded-lg text-[13px] flex items-center gap-2">
            <ScanFace className="w-4 h-4" /> Bat dau quet
          </button>
          <button disabled={!isScanning} onClick={() => { stopCamera(); setStatus('idle'); resetStableMatch(); }} className="px-3 py-2 border border-gray-200 disabled:text-gray-300 disabled:bg-gray-50 text-gray-700 rounded-lg text-[13px] flex items-center gap-2">
            <VideoOff className="w-4 h-4" /> Dung
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)] gap-0">
        <div className="relative bg-gray-950 aspect-video overflow-hidden">
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={motionCanvasRef} className="hidden" />
          {!isScanning && status !== 'success' && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px]">
              Camera preview
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`relative w-[48%] max-w-[280px] aspect-[0.72] rounded-[50%] border-2 ${status === 'success' ? 'border-green-400' : status === 'multiple' || status === 'error' ? 'border-red-400' : 'border-white/85'} shadow-[0_0_0_999px_rgba(0,0,0,0.38)]`}>
              <div className={`absolute left-[-8%] right-[-8%] h-0.5 bg-blue-300/90 shadow-[0_0_18px_rgba(96,165,250,0.95)] ${isScanning ? 'animate-pulse' : ''}`} style={{ top: `${20 + (progress * 0.55)}%` }} />
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-5">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] ${status === 'success' ? 'bg-green-50 text-green-700' : status === 'error' || status === 'multiple' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              {statusIcon(status)}
              {statusText(status, lastResult)}
            </div>
            <p className="mt-4 text-[13px] text-gray-600 min-h-5">{message || 'Dua khuon mat vao giua khung va giu on dinh trong vai giay.'}</p>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[12px] text-gray-500 mb-1">
                <span>Frame on dinh</span>
                <span>{stableFrames}/{REQUIRED_STABLE_FRAMES}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px] text-gray-500">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Threshold</span>
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
