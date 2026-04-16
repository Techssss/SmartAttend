import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Camera, BookOpen, FileBarChart, LogOut, GraduationCap, Bell, Menu, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/teacher', icon: LayoutDashboard, label: t('teacherSideNavOverview') },
    { to: '/teacher/classes', icon: BookOpen, label: t('teacherSideNavClasses') },
    { to: '/teacher/attendance', icon: Camera, label: t('teacherSideNavAttendance') },
    { to: '/teacher/reports', icon: FileBarChart, label: t('teacherSideNavReports') },
  ];

  const pageTitles: Record<string, string> = {
    '/teacher': t('pageTitleTeacherOverview'),
    '/teacher/classes': t('pageTitleTeacherClasses'),
    '/teacher/attendance': t('pageTitleTeacherAttendance'),
    '/teacher/reports': t('pageTitleTeacherReports'),
  };

  const title = pageTitles[location.pathname] || t('pageTitleTeacherOverview');
  const handleLogout = () => { logout(); navigate('/'); };
  const now = new Date();
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' });

  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-[240px] z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #1a1f5e 0%, #2d3a99 60%, #3730a3 100%)' }}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[15px] text-white" style={{ fontWeight: 700 }}>{t('brandName')}</div>
              <div className="text-[11px] text-white/40">{t('teacherPortal')}</div>
            </div>
          </div>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-3 mt-4 p-3 rounded-xl bg-white/10 border border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-[13px]" style={{ fontWeight: 700 }}>
              {user?.name ? user.name.split(' ').slice(-1)[0][0] : 'G'}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-white truncate" style={{ fontWeight: 600 }}>{user?.name || t('teacherRole')}</p>
              <p className="text-[11px] text-white/40">{user?.department || t('teacherDept')}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-white/30 px-3 mb-2 mt-1" style={{ fontWeight: 600, letterSpacing: '0.08em' }}>MENU</p>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/teacher'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                }`
              }
              style={({ isActive }) => ({ fontWeight: isActive ? 600 : 400 })}>
              {({ isActive }) => (
                <>
                  <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-300' : ''}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 text-[13px] transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5">
            <LogOut className="w-4 h-4" />
            {t('teacherLogout')}
          </button>
        </div>
      </aside>

      <div className="lg:ml-[240px]">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-[60px] flex items-center px-4 lg:px-6 gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] text-gray-900" style={{ fontWeight: 700 }}>{title}</h1>
            <div className="flex items-center gap-1 text-[12px] text-gray-400">
              <span>{t('teacherBreadcrumb')}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-600" style={{ fontWeight: 500 }}>{title}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[13px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span>{dateStr}</span>
            <span className="text-gray-800 ml-1" style={{ fontWeight: 600 }}>{timeStr}</span>
          </div>

          <LanguageSwitcher variant="light" />

          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-50">
                <p className="text-[13px] text-gray-700 px-2 pb-2 border-b border-gray-100" style={{ fontWeight: 600 }}>{t('adminNotifTitle')}</p>
                {[t('teacherNotif1'), t('teacherNotif2')].map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    <p className="text-[13px] text-gray-700">{n}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 700 }}>
              {user?.name ? user.name.split(' ').slice(-1)[0][0] : 'G'}
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>{user?.name || t('teacherRole')}</div>
              <div className="text-[11px] text-gray-400">{t('teacherRole')}</div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}