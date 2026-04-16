import { NavLink } from 'react-router';
import {
  LayoutDashboard, Camera, BookOpen, Users, FileBarChart,
  ShieldAlert, Settings, LogOut, GraduationCap
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/attendance', icon: Camera, label: 'Điểm danh' },
  { to: '/classes', icon: BookOpen, label: 'Lớp học' },
  { to: '/students', icon: Users, label: 'Học viên' },
  { to: '/reports', icon: FileBarChart, label: 'Báo cáo' },
  { to: '/alerts', icon: ShieldAlert, label: 'Cảnh báo' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-[260px] bg-navy-dark text-white z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[15px]" style={{ fontWeight: 600 }}>SmartAttend</div>
            <div className="text-[11px] text-white/50">Hệ thống Nhận diện Khuôn mặt</div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                }`
              }
              style={({ isActive }) => ({ fontWeight: isActive ? 500 : 400 })}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-navy-light flex items-center justify-center text-[12px]" style={{ fontWeight: 600 }}>AD</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] truncate" style={{ fontWeight: 500 }}>Quản trị viên</div>
              <div className="text-[11px] text-white/40">Quản trị</div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-white/40 hover:text-white/70 text-[13px] transition-colors w-full">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
}