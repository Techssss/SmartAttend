import { Card } from '../components/Card';
import { AlertTriangle, Camera, Eye, UserX, ShieldX, Clock } from 'lucide-react';

const alertsData = [
  { type: 'unknown', msg: 'Phát hiện khuôn mặt lạ', location: 'Camera A - Cổng chính', time: '08:23', date: '08/04/2026', severity: 'high' },
  { type: 'liveness', msg: 'Kiểm tra sinh trắc thất bại (3 lần thử)', location: 'Phòng 202 - Thiết bị Lab', time: '08:18', date: '08/04/2026', severity: 'medium' },
  { type: 'unknown', msg: 'Phát hiện khuôn mặt lạ', location: 'Camera B - Tòa nhà Lab', time: '08:12', date: '08/04/2026', severity: 'high' },
  { type: 'suspicious', msg: 'Nhiều lần quét liên tục đáng ngờ', location: 'Phòng 105 - Giảng đường', time: '08:05', date: '08/04/2026', severity: 'high' },
  { type: 'liveness', msg: 'Kiểm tra sinh trắc thất bại (phát hiện ảnh)', location: 'Camera A - Cổng chính', time: '07:55', date: '08/04/2026', severity: 'medium' },
  { type: 'unknown', msg: 'Phát hiện khuôn mặt lạ', location: 'Camera C - Cổng phụ', time: '07:48', date: '08/04/2026', severity: 'low' },
  { type: 'liveness', msg: 'Kiểm tra sinh trắc thất bại', location: 'Phòng 301 - Hội thảo', time: '07:40', date: '07/04/2026', severity: 'medium' },
  { type: 'suspicious', msg: 'Thử nhiều lần từ cùng một thiết bị', location: 'Tòa nhà Lab B', time: '15:22', date: '07/04/2026', severity: 'high' },
];

const iconMap: Record<string, typeof AlertTriangle> = {
  unknown: UserX,
  liveness: Eye,
  suspicious: ShieldX,
};

const severityStyles: Record<string, string> = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low: 'bg-blue-50 border-blue-200 text-blue-700',
};

const severityDot: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

const severityLabel: Record<string, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};

export function Alerts() {
  const highCount = alertsData.filter(a => a.severity === 'high').length;
  const medCount = alertsData.filter(a => a.severity === 'medium').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><UserX className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-[12px] text-red-600/70" style={{ fontWeight: 500 }}>Khuôn mặt lạ</p>
            <p className="text-[22px] text-red-700" style={{ fontWeight: 700 }}>3</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Eye className="w-5 h-5 text-amber-600" /></div>
          <div>
            <p className="text-[12px] text-amber-600/70" style={{ fontWeight: 500 }}>Sinh trắc thất bại</p>
            <p className="text-[22px] text-amber-700" style={{ fontWeight: 700 }}>3</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><ShieldX className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-[12px] text-blue-600/70" style={{ fontWeight: 500 }}>Lượt thử đáng ngờ</p>
            <p className="text-[22px] text-blue-700" style={{ fontWeight: 700 }}>2</p>
          </div>
        </div>
      </div>

      {/* Alert List */}
      <Card title="Cảnh báo bảo mật" action={
        <div className="flex items-center gap-2 text-[12px]">
          <span className="flex items-center gap-1 text-red-600" style={{ fontWeight: 500 }}><span className="w-2 h-2 rounded-full bg-red-500" />{highCount} Cao</span>
          <span className="flex items-center gap-1 text-amber-600" style={{ fontWeight: 500 }}><span className="w-2 h-2 rounded-full bg-amber-500" />{medCount} Trung bình</span>
        </div>
      }>
        <div className="space-y-3">
          {alertsData.map((alert, i) => {
            const Icon = iconMap[alert.type] || AlertTriangle;
            return (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-lg border ${severityStyles[alert.severity]}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  alert.severity === 'high' ? 'bg-red-100' : alert.severity === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px]" style={{ fontWeight: 600 }}>{alert.msg}</p>
                      <div className="flex items-center gap-3 mt-1 text-[12px] opacity-70">
                        <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {alert.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${severityDot[alert.severity]}`} />
                      <span className="text-[11px]" style={{ fontWeight: 500 }}>{severityLabel[alert.severity]}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}