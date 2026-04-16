import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Camera, BookOpen, Users, FileBarChart,
  ShieldAlert, Settings, LogOut, GraduationCap, Bell, Menu, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('adminSideNavOverview') },
    { to: '/admin/attendance', icon: Camera, label: t('adminSideNavAttendance') },
    { to: '/admin/classes', icon: BookOpen, label: t('adminSideNavClasses') },
    { to: '/admin/students', icon: Users, label: t('adminSideNavStudents') },
    { to: '/admin/reports', icon: FileBarChart, label: t('adminSideNavReports') },
    { to: '/admin/alerts', icon: ShieldAlert, label: t('adminSideNavAlerts') },
    { to: '/admin/settings', icon: Settings, label: t('adminSideNavSettings') },
  ];

  const pageTitles: Record<string, string> = {
    '/admin': t('pageTitleAdminOverview'),
    '/admin/attendance': t('pageTitleAdminAttendance'),
    '/admin/classes': t('pageTitleAdminClasses'),
    '/admin/students': t('pageTitleAdminStudents'),
    '/admin/reports': t('pageTitleAdminReports'),
    '/admin/alerts': t('pageTitleAdminAlerts'),
    '/admin/settings': t('pageTitleAdminSettings'),
  };

  const title = pageTitles[location.pathname] || t('pageTitleAdminOverview');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-[260px] z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #0f2440 0%, #1e3a5f 100%)' }}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[15px] text-white" style={{ fontWeight: 700 }}>{t('brandName')}</div>
              <div className="text-[11px] text-white/40">{t('brandTagline')}</div>
            </div>
          </div>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-2 mx-3 mt-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[11px] text-white/40 mb-0.5">{t('adminLoggedInAs')}</p>
          <p className="text-[12px] text-white/80" style={{ fontWeight: 600 }}>{t('adminRole')}</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                }`
              }
              style={({ isActive }) => ({ fontWeight: isActive ? 600 : 400 })}>
              {({ isActive }) => (
                <>
                  <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-blue-300' : ''}`} />
                  <span>{item.label}</span>
                  {item.label === t('adminSideNavAlerts') && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 700 }}>3</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 700 }}>
              {user?.name ? user.name.split(' ').slice(-1)[0][0] : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-white truncate" style={{ fontWeight: 600 }}>{user?.name || t('adminRole')}</div>
              <div className="text-[11px] text-white/40">{t('adminRole')}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 text-[13px] transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-white/5">
            <LogOut className="w-4 h-4" />
            {t('adminLogout')}
          </button>
        </div>
      </aside>

      <div className="lg:ml-[260px]">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-[60px] flex items-center px-4 lg:px-6 gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] text-gray-900" style={{ fontWeight: 700 }}>{title}</h1>
            <div className="flex items-center gap-1 text-[12px] text-gray-400">
              <span>{t('adminBreadcrumbHome')}</span>
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 space-y-1 z-50">
                <div className="flex justify-between items-center px-2 pb-2 border-b border-gray-100">
                  <span className="text-[13px] text-gray-900" style={{ fontWeight: 600 }}>{t('adminNotifTitle')}</span>
                  <span className="text-[11px] text-blue-600" style={{ fontWeight: 500 }}>{t('adminMarkRead')}</span>
                </div>
                {[
                  { msg: t('adminNotif1'), time: t('adminNotif1Time'), dot: 'bg-red-500' },
                  { msg: t('adminNotif2'), time: t('adminNotif2Time'), dot: 'bg-amber-500' },
                  { msg: t('adminNotif3'), time: t('adminNotif3Time'), dot: 'bg-blue-500' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className={`w-2 h-2 rounded-full ${n.dot} mt-1.5 shrink-0`} />
                    <div>
                      <p className="text-[13px] text-gray-800" style={{ fontWeight: 500 }}>{n.msg}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 700 }}>
              {user?.name ? user.name.split(' ').slice(-1)[0][0] : 'A'}
            </div>
            <div className="hidden sm:block">
              <div className="text-[13px] text-gray-800" style={{ fontWeight: 600 }}>{user?.name || 'Admin'}</div>
              <div className="text-[11px] text-gray-400">{t('adminRole')}</div>
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