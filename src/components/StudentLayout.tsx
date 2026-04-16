import { Outlet, NavLink, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { LayoutDashboard, Calendar, LogOut, GraduationCap, Bell, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/student', icon: LayoutDashboard, label: t('studentSideNavOverview') },
    { to: '/student/history', icon: Calendar, label: t('studentSideNavHistory') },
  ];

  const pageTitles: Record<string, string> = {
    '/student': t('pageTitleStudentOverview'),
    '/student/history': t('pageTitleStudentHistory'),
  };

  const title = pageTitles[location.pathname] || t('pageTitleStudentOverview');
  const handleLogout = () => { logout(); navigate('/'); };

  const now = new Date();
  const greet = now.getHours() < 12 ? t('studentGreetMorning') : now.getHours() < 18 ? t('studentGreetAfternoon') : t('studentGreetEvening');

  return (
    <div className="min-h-screen bg-[#f5f7ff]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-[220px] z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #2d1b69 0%, #4c3eb3 60%, #6366f1 100%)' }}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[14px] text-white" style={{ fontWeight: 700 }}>{t('brandName')}</div>
              <div className="text-[10px] text-white/40">{t('studentPortal')}</div>
            </div>
          </div>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-3 mt-4 p-3 rounded-2xl bg-white/10 border border-white/15 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-300 to-indigo-400 flex items-center justify-center text-white mx-auto mb-2" style={{ fontWeight: 700, fontSize: '1.3rem' }}>
            {user?.name ? user.name.split(' ').slice(-1)[0][0] : 'S'}
          </div>
          <p className="text-[13px] text-white truncate" style={{ fontWeight: 600 }}>{user?.name || t('studentRole')}</p>
          <p className="text-[11px] text-white/50 mt-0.5">{t('studentCode')}: {user?.id || 'STU001'}</p>
          {user?.class && (
            <span className="inline-block mt-1.5 bg-white/15 text-white/80 text-[11px] px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
              {t('studentClass')} {user.class}
            </span>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-white/30 px-3 mb-2 mt-1" style={{ fontWeight: 600, letterSpacing: '0.08em' }}>MENU</p>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/student'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90'
                }`
              }
              style={({ isActive }) => ({ fontWeight: isActive ? 600 : 400 })}>
              <item.icon className="w-[17px] h-[17px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 text-[13px] transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5">
            <LogOut className="w-4 h-4" />
            {t('studentLogout')}
          </button>
        </div>
      </aside>

      <div className="lg:ml-[220px]">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-[60px] flex items-center px-4 lg:px-6 gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1">
            <h1 className="text-[16px] text-gray-900" style={{ fontWeight: 700 }}>{title}</h1>
            <div className="flex items-center gap-1 text-[12px] text-gray-400">
              <span>{greet}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-purple-600" style={{ fontWeight: 500 }}>{user?.name?.split(' ').slice(-1)[0]}</span>
            </div>
          </div>

          <LanguageSwitcher variant="light" />

          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 700 }}>
              {user?.name ? user.name.split(' ').slice(-1)[0][0] : 'S'}
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>{user?.name || t('studentRole')}</div>
              <div className="text-[11px] text-gray-400">{t('studentRole')} · {user?.class || 'CS-301'}</div>
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