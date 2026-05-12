import { Card } from '../components/Card';
import { AlertTriangle, Eye, ShieldX, UserX } from 'lucide-react';

export function Alerts() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 opacity-70">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><UserX className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-[12px] text-red-600/70" style={{ fontWeight: 500 }}>Khuôn mặt lạ</p><p className="text-[22px] text-red-700" style={{ fontWeight: 700 }}>0</p></div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 opacity-70">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Eye className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-[12px] text-amber-600/70" style={{ fontWeight: 500 }}>Sinh trắc thất bại</p><p className="text-[22px] text-amber-700" style={{ fontWeight: 700 }}>0</p></div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 opacity-70">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><ShieldX className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-[12px] text-blue-600/70" style={{ fontWeight: 500 }}>Lượt thử đáng ngờ</p><p className="text-[22px] text-blue-700" style={{ fontWeight: 700 }}>0</p></div>
        </div>
      </div>

      <Card title="Cảnh báo bảo mật">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px]" style={{ fontWeight: 600 }}>Chưa có backend cho security alerts.</p>
            <p className="text-[12px] opacity-80 mt-1">Phần này sẽ lấy từ bảng notifications/audit_logs hoặc FaceID service ở phase sau.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
