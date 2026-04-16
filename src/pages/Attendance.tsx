import { useState, useEffect } from 'react';
import {
  Camera, CheckCircle2, XCircle, Scan, Eye, RotateCcw,
  UserCheck, Clock, Users, Wifi, Shield, AlertTriangle
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../context/LanguageContext';

type ScanState = 'idle' | 'scanning' | 'liveness' | 'success' | 'failed';

export function Attendance() {
  const { t } = useLanguage();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [recognizedName, setRecognizedName] = useState('');
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [currentLivenessStep, setCurrentLivenessStep] = useState(0);
  const [logs, setLogs] = useState([
    { name: 'Nguyễn Văn An', id: 'STU001', time: '08:02', class: 'CS-301' },
    { name: 'Lê Hoàng Cường', id: 'STU003', time: '08:00', class: 'CS-301' },
    { name: 'Hoàng Minh Đức', id: 'STU005', time: '07:58', class: 'CS-301' },
    { name: 'Trần Thị Ngọc', id: 'STU008', time: '07:55', class: 'CS-301' },
  ]);
  const [scanCount, setScanCount] = useState(4);

  const livenessSteps = [t('attendLivenessStep1'), t('attendLivenessStep2'), t('attendLivenessStep3')];

  useEffect(() => {
    if (scanState === 'scanning') {
      const timer = setTimeout(() => setScanState('liveness'), 2200);
      return () => clearTimeout(timer);
    }
    if (scanState === 'liveness') {
      setLivenessProgress(0);
      setCurrentLivenessStep(0);
      let step = 0;
      let progress = 0;
      const interval = setInterval(() => {
        progress += 3;
        setLivenessProgress(Math.min(progress, 100));
        if (progress % 34 === 0 && step < 2) { step++; setCurrentLivenessStep(step); }
        if (progress >= 100) {
          clearInterval(interval);
          const success = Math.random() > 0.2;
          if (success) { setRecognizedName('Trần Thị Bảo'); setScanState('success'); setScanCount(c => c + 1); }
          else setScanState('failed');
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scanState]);

  useEffect(() => {
    if (scanState === 'success') {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setLogs(prev => [{ name: recognizedName, id: 'STU002', time: timeStr, class: 'CS-301' }, ...prev.slice(0, 3)]);
    }
  }, [scanState]);

  const startScan = () => { setScanState('scanning'); setRecognizedName(''); setLivenessProgress(0); setCurrentLivenessStep(0); };
  const reset = () => setScanState('idle');
  const isProcessing = scanState === 'scanning' || scanState === 'liveness';

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Status bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 text-[13px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-600" style={{ fontWeight: 500 }}>{t('attendCameraOnline')}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 text-gray-500">
            <Wifi className="w-4 h-4 text-green-500" />
            <span>{t('attendGoodConn')}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5 text-gray-500">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>{t('attendLivenessOn')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-[12px] px-3 py-1.5 rounded-lg border border-green-200">
            <Users className="w-3.5 h-3.5" />
            <span style={{ fontWeight: 600 }}>{scanCount} {t('attendedToday')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('attendClass')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CAMERA PANEL */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-600" />
                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('attendCameraTitle')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[12px] text-red-600" style={{ fontWeight: 600 }}>{t('attendLive')}</span>
              </div>
            </div>

            {/* Camera viewport */}
            <div className="relative bg-gray-950 overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950" />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-6 h-6`}>
                  <div className={`absolute inset-0 border-white/20 ${i === 0 ? 'border-t border-l rounded-tl' : i === 1 ? 'border-t border-r rounded-tr' : i === 2 ? 'border-b border-l rounded-bl' : 'border-b border-r rounded-br'}`} style={{ borderWidth: 2 }} />
                </div>
              ))}

              {scanState === 'scanning' && (
                <div className="absolute left-0 right-0 h-px overflow-hidden"
                  style={{ background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)', animation: 'scanline 2s ease-in-out infinite', top: '40%' }} />
              )}

              {scanState === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center mb-4">
                    <Camera className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-white/40 text-[15px]" style={{ fontWeight: 500 }}>Camera ready</p>
                  <p className="text-white/20 text-[13px] mt-1">{t('attendGuideIdle')}</p>
                </div>
              )}

              {scanState !== 'idle' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`relative transition-all duration-500 ${scanState === 'success' ? 'scale-105' : ''}`} style={{ width: 180, height: 220 }}>
                      <div className={`absolute inset-0 rounded-2xl border-2 transition-colors duration-500 ${scanState === 'success' ? 'border-green-400' : scanState === 'failed' ? 'border-red-400' : scanState === 'liveness' ? 'border-yellow-400' : 'border-blue-400'}`}>
                        {['-top-1 -left-1 border-t-2 border-l-2 rounded-tl-md', '-top-1 -right-1 border-t-2 border-r-2 rounded-tr-md', '-bottom-1 -left-1 border-b-2 border-l-2 rounded-bl-md', '-bottom-1 -right-1 border-b-2 border-r-2 rounded-br-md'].map((cls, i) => (
                          <div key={i} className={`absolute w-5 h-5 border-current ${cls}`} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-30">
                        <div className="w-16 h-16 rounded-full border-2 border-white" />
                        <div className="w-24 h-8 rounded-full border-2 border-white mt-2" />
                      </div>
                      {scanState === 'success' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl">
                          <CheckCircle2 className="w-16 h-16 text-green-400" />
                        </div>
                      )}
                      {scanState === 'failed' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-2xl">
                          <XCircle className="w-16 h-16 text-red-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm text-[13px] ${scanState === 'success' ? 'bg-green-900/60 text-green-300' : scanState === 'failed' ? 'bg-red-900/60 text-red-300' : scanState === 'liveness' ? 'bg-yellow-900/60 text-yellow-300' : 'bg-blue-900/60 text-blue-300'}`} style={{ fontWeight: 600 }}>
                      {scanState === 'scanning' && <><Scan className="w-4 h-4 animate-spin" style={{ animationDuration: '2s' }} /> {t('attendDetecting')}</>}
                      {scanState === 'liveness' && <><Eye className="w-4 h-4 animate-pulse" /> {t('attendLivenessCheck')}</>}
                      {scanState === 'success' && <><CheckCircle2 className="w-4 h-4" /> {t('attendVerifySuccess')}</>}
                      {scanState === 'failed' && <><XCircle className="w-4 h-4" /> {t('attendVerifyFailed')}</>}
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[11px] text-white/60">
                      {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    {scanState === 'liveness' && (
                      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex justify-between text-[12px] mb-2">
                          <span className="text-yellow-300" style={{ fontWeight: 600 }}>{livenessSteps[currentLivenessStep]}</span>
                          <span className="text-white/50">{Math.round(livenessProgress)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-100"
                            style={{ width: `${livenessProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {scanState === 'success' && (
                      <div className="bg-green-900/70 backdrop-blur-sm border border-green-500/30 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-5 h-5 text-green-400 shrink-0" />
                          <div>
                            <p className="text-green-300 text-[14px]" style={{ fontWeight: 700 }}>{recognizedName}</p>
                            <p className="text-green-400/70 text-[12px]">STU002 · CS-301 · ✓ {t('attendPresent')}</p>
                          </div>
                          <CheckCircle2 className="w-6 h-6 text-green-400 ml-auto shrink-0" />
                        </div>
                      </div>
                    )}
                    {scanState === 'failed' && (
                      <div className="bg-red-900/70 backdrop-blur-sm border border-red-500/30 rounded-xl p-3 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                        <div>
                          <p className="text-red-300 text-[14px]" style={{ fontWeight: 600 }}>{t('attendLivenessFailTitle')}</p>
                          <p className="text-red-400/70 text-[12px]">{t('attendLivenessFailDesc')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 items-center">
              <button onClick={isProcessing ? undefined : startScan} disabled={isProcessing}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] transition-all ${isProcessing ? 'bg-blue-50 text-blue-400 border-2 border-blue-200 cursor-not-allowed' : 'bg-[#1e3a5f] hover:bg-[#2d5a8e] text-white shadow-md shadow-blue-900/20'}`}
                style={{ fontWeight: 600 }}>
                {isProcessing ? (
                  <><div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    {scanState === 'scanning' ? t('attendScanning') : t('attendChecking')}</>
                ) : (
                  <><Camera className="w-4 h-4" />
                    {scanState === 'idle' ? t('attendStartBtn') : t('attendScanNextBtn')}</>
                )}
              </button>
              {(scanState === 'success' || scanState === 'failed') && (
                <button onClick={reset}
                  className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-[14px] text-gray-600 hover:bg-gray-100 transition-colors"
                  style={{ fontWeight: 500 }}>
                  <RotateCcw className="w-4 h-4" /> {t('attendResetBtn')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('attendInstructions')}</h3>
            <div className={`p-3.5 rounded-xl text-[13px] mb-4 transition-all ${scanState === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : scanState === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' : scanState === 'liveness' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : scanState === 'scanning' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`} style={{ fontWeight: 500 }}>
              {scanState === 'idle' && t('attendGuideIdle')}
              {scanState === 'scanning' && t('attendGuideScanning')}
              {scanState === 'liveness' && t('attendGuideLiveness')}
              {scanState === 'success' && `✅ ${recognizedName} ${t('attendSuccessMsg')}`}
              {scanState === 'failed' && t('attendGuideFailed')}
            </div>
            <div className="space-y-2">
              <p className="text-[12px] text-gray-500" style={{ fontWeight: 600 }}>{t('attendLivenessSteps')}</p>
              {livenessSteps.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${scanState === 'liveness' && currentLivenessStep === i ? 'bg-yellow-50 border border-yellow-200' : scanState === 'liveness' && currentLivenessStep > i ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 transition-all ${scanState === 'liveness' && currentLivenessStep > i ? 'bg-green-500 text-white' : scanState === 'liveness' && currentLivenessStep === i ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-500'}`} style={{ fontWeight: 700 }}>
                    {scanState === 'liveness' && currentLivenessStep > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-[13px] ${scanState === 'liveness' && currentLivenessStep === i ? 'text-yellow-700 font-medium' : 'text-gray-600'}`}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('attendSessionStats')}</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { val: scanCount, label: t('attendScanned'), color: 'text-blue-600', bg: 'bg-blue-50' },
                { val: scanCount - 1, label: t('attendPresent'), color: 'text-green-600', bg: 'bg-green-50' },
                { val: 1, label: t('attendAbsent'), color: 'text-red-500', bg: 'bg-red-50' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-2.5 text-center`}>
                  <p className={s.color} style={{ fontWeight: 800, fontSize: '1.3rem' }}>{s.val}</p>
                  <p className="text-[11px] text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('attendRecentRec')}</h3>
            <div className="space-y-2">
              {logs.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[11px] text-indigo-700 shrink-0" style={{ fontWeight: 700 }}>
                    {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800 truncate" style={{ fontWeight: 500 }}>{r.name}</p>
                    <p className="text-[11px] text-gray-400">{r.id} · {r.class}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status="present" />
                    <p className="text-[11px] text-gray-400 mt-1">{r.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 20%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}