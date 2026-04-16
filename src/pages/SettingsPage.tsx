import { Card } from '../components/Card';
import { Camera, Bell, Shield, Clock } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card title="Cài đặt chung">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] text-foreground mb-1" style={{ fontWeight: 500 }}>Tên trường</label>
            <input defaultValue="Học viện Quốc tế An Noor" className="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <div>
            <label className="block text-[13px] text-foreground mb-1" style={{ fontWeight: 500 }}>Năm học</label>
            <input defaultValue="2025-2026" className="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <div>
            <label className="block text-[13px] text-foreground mb-1" style={{ fontWeight: 500 }}>Múi giờ</label>
            <select className="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20">
              <option>Asia/Ho_Chi_Minh (GMT+7)</option>
              <option>Asia/Bangkok (GMT+7)</option>
              <option>Asia/Singapore (GMT+8)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Cài đặt điểm danh">
        <div className="space-y-4">
          {[
            { icon: Clock, label: 'Ngưỡng muộn (phút)', type: 'number', defaultVal: '10' },
            { icon: Camera, label: 'Độ phân giải camera', type: 'select', options: ['720p', '1080p', '4K'] },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><s.icon className="w-4 h-4 text-navy" /></div>
              <div className="flex-1">
                <label className="block text-[13px] text-foreground mb-1" style={{ fontWeight: 500 }}>{s.label}</label>
                {s.type === 'number' ? (
                  <input type="number" defaultValue={s.defaultVal} className="w-32 px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
                ) : (
                  <select className="w-48 px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20">
                    {s.options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-navy" />
              <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>Bật kiểm tra sinh trắc</span>
            </div>
            <button className="w-10 h-6 bg-navy rounded-full relative transition-colors">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
            </button>
          </div>
        </div>
      </Card>

      <Card title="Cài đặt thông báo">
        <div className="space-y-3">
          {['Cảnh báo khuôn mặt lạ', 'Lần thử sinh trắc thất bại', 'Tóm tắt điểm danh hằng ngày', 'Thông báo học viên đến muộn'].map((n, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>{n}</span>
              </div>
              <button className={`w-10 h-6 rounded-full relative transition-colors ${i < 2 ? 'bg-navy' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${i < 2 ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-navy text-white rounded-lg text-[13px] hover:bg-navy-light transition-colors" style={{ fontWeight: 500 }}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}