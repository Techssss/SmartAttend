import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Loader2, RotateCcw, ScanFace, ShieldCheck, VideoOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerFace } from '../services/smartAttendApi';

type RegisterStatus = 'idle' | 'camera' | 'ready' | 'saving' | 'success' | 'error';

function statusCopy(status: RegisterStatus) {
  if (status === 'camera') return 'Đang mở camera...';
  if (status === 'ready') return 'Đưa khuôn mặt vào khung';
  if (status === 'saving') return 'Đang lưu khuôn mặt...';
  if (status === 'success') return 'Đăng ký khuôn mặt thành công';
  if (status === 'error') return 'Chưa lưu được khuôn mặt';
  return 'Sẵn sàng đăng ký FaceID';
}

export function FaceRegistrationPanel() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<RegisterStatus>('idle');
  const [message, setMessage] = useState('Mỗi sinh viên có thể lưu nhiều mẫu khuôn mặt ở các góc hoặc điều kiện ánh sáng khác nhau.');
  const [lastQuality, setLastQuality] = useState<number | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus((current) => (current === 'ready' || current === 'camera' ? 'idle' : current));
  }, []);

  const startCamera = useCallback(async () => {
    if (!user?.id) {
      setStatus('error');
      setMessage('Không tìm thấy mã sinh viên trong phiên đăng nhập.');
      return;
    }

    try {
      setStatus('camera');
      setMessage('Cho phép trình duyệt truy cập webcam để chụp ảnh đăng ký.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('ready');
      setMessage('Nhìn thẳng vào camera, giữ khuôn mặt nằm gọn trong khung oval.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Trình duyệt không mở được webcam.');
    }
  }, [user?.id]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return '';

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return '';
    context.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  const handleCapture = useCallback(async () => {
    if (!user?.id) return;
    const image = captureFrame();
    if (!image) {
      setStatus('error');
      setMessage('Camera chưa sẵn sàng, thử lại sau một chút.');
      return;
    }

    try {
      setStatus('saving');
      setMessage('Đang detect đúng 1 khuôn mặt và lưu embedding 512D...');
      const result = await registerFace(user.id, image) as {
        image_quality_score?: number | null;
      };
      setLastQuality(typeof result.image_quality_score === 'number' ? result.image_quality_score : null);
      setStatus('success');
      setMessage('Đã lưu mẫu khuôn mặt. Bạn có thể chụp thêm một mẫu khác nếu muốn tăng độ ổn định.');
      stopCamera();
    } catch (error) {
      setStatus('error');
      const text = error instanceof Error ? error.message : 'Không thể đăng ký khuôn mặt.';
      if (text.includes('NO_FACE')) setMessage('Không tìm thấy khuôn mặt. Hãy tăng ánh sáng và nhìn thẳng camera.');
      else if (text.includes('MULTIPLE_FACES')) setMessage('Có nhiều khuôn mặt trong ảnh. Chỉ để một người trong khung.');
      else if (text.includes('STUDENT_NOT_FOUND')) setMessage('Không tìm thấy sinh viên trong database.');
      else setMessage(text);
    }
  }, [captureFrame, stopCamera, user?.id]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const active = status === 'camera' || status === 'ready' || status === 'saving';

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <ScanFace className="w-4 h-4 text-indigo-600" />
            Đăng ký khuôn mặt
          </h3>
          <p className="text-[12px] text-gray-500 mt-1">Student ID: {user?.id || '--'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={active} onClick={startCamera} className="px-3 py-2 bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg text-[13px] flex items-center gap-2">
            <Camera className="w-4 h-4" /> Mở camera
          </button>
          <button disabled={status !== 'ready'} onClick={handleCapture} className="px-3 py-2 bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-[13px] flex items-center gap-2">
            {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Chụp & lưu
          </button>
          <button disabled={!active} onClick={stopCamera} className="px-3 py-2 border border-gray-200 disabled:text-gray-300 disabled:bg-gray-50 text-gray-700 rounded-lg text-[13px] flex items-center gap-2">
            <VideoOff className="w-4 h-4" /> Dừng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
        <div className="relative bg-gray-950 aspect-video overflow-hidden">
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          {!active && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[13px]">
              Webcam preview
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`w-[48%] max-w-[260px] aspect-[0.72] rounded-[50%] border-2 ${status === 'success' ? 'border-green-400' : status === 'error' ? 'border-red-400' : 'border-white/85'} shadow-[0_0_0_999px_rgba(0,0,0,0.38)]`} />
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-5">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] ${status === 'success' ? 'bg-green-50 text-green-700' : status === 'error' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'}`}>
              {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : status === 'saving' || status === 'camera' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanFace className="w-4 h-4" />}
              {statusCopy(status)}
            </div>
            <p className="mt-4 text-[13px] text-gray-600 leading-6">{message}</p>
          </div>

          <div className="space-y-2 text-[12px] text-gray-500">
            <div className="flex items-center justify-between">
              <span>Model</span>
              <span>InsightFace buffalo_s</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Embedding</span>
              <span>512D normalized</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Quality score</span>
              <span>{lastQuality ? lastQuality.toFixed(3) : '--'}</span>
            </div>
            {status === 'success' && (
              <button onClick={startCamera} className="mt-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Chụp thêm mẫu
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
