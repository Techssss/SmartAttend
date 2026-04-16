import { Bell, Menu, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router';
import { useState } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Tổng quan',
  '/attendance': 'Điểm danh',
  '/classes': 'Quản lý Lớp học',
  '/students': 'Quản lý Học viên',
  '/reports': 'Báo cáo',
  '/alerts': 'Cảnh báo & Bảo mật',
  '/settings': 'Cài đặt',
};

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const [showNotifs, setShowNotifs] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border h-[60px] flex items-center px-4 lg:px-6 gap-4">
      <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-md hover:bg-muted">
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-[17px] text-foreground" style={{ fontWeight: 600 }}>{title}</h1>
        <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <span>Trang chủ</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground" style={{ fontWeight: 500 }}>{title}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1.5 text-[13px] text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
        <span>{dateStr}</span>
        <span className="text-foreground" style={{ fontWeight: 600 }}>{timeStr}</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
        </button>
        {showNotifs && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-xl shadow-lg p-3 space-y-2">
            <div className="text-[13px]" style={{ fontWeight: 600 }}>Thông báo</div>
            {['Phát hiện khuôn mặt lạ - Camera A', 'Kiểm tra sinh trắc thất bại - Phòng 202', '3 học viên đến muộn'].map((n, i) => (
              <div key={i} className="text-[12px] text-muted-foreground p-2 rounded-lg hover:bg-muted cursor-pointer">{n}</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 600 }}>AD</div>
        <div className="hidden sm:block">
          <div className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>Quản trị</div>
          <div className="text-[11px] text-muted-foreground">Quản trị viên</div>
        </div>
      </div>
    </header>
  );
}