import { CheckCircle2, Clock, XCircle, TrendingUp, CalendarDays, Camera, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const radialData = [{ name: 'Rate', value: 87, fill: '#6366f1' }];
const monthlyStats = [
  { month: 'Jan', rate: 90 }, { month: 'Feb', rate: 85 },
  { month: 'Mar', rate: 92 }, { month: 'Apr', rate: 87 },
];

export function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const attendanceHistory = [
    { date: '08/04/2026', subject: t('studentSubjectCS'), time: '08:02', status: 'present' as const, method: t('studentMethod') },
    { date: '07/04/2026', subject: t('studentSubjectCS'), time: '08:15', status: 'late' as const, method: t('studentMethod') },
    { date: '06/04/2026', subject: t('studentSubjectMath'), time: '10:00', status: 'present' as const, method: t('studentMethod') },
    { date: '05/04/2026', subject: t('studentSubjectCS'), time: '--', status: 'absent' as const, method: t('studentNoMethod') },
    { date: '04/04/2026', subject: t('studentSubjectMath'), time: '10:02', status: 'present' as const, method: t('studentMethod') },
    { date: '03/04/2026', subject: t('studentSubjectPhysics'), time: '13:00', status: 'present' as const, method: t('studentMethod') },
    { date: '02/04/2026', subject: t('studentSubjectCS'), time: '08:00', status: 'present' as const, method: t('studentMethod') },
  ];

  const statusConfig = {
    present: { label: t('statusPresent'), color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: CheckCircle2, iconColor: 'text-green-500' },
    late: { label: t('statusLate'), color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: Clock, iconColor: 'text-amber-500' },
    absent: { label: t('statusAbsent'), color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: XCircle, iconColor: 'text-red-500' },
  };

  const presentCount = attendanceHistory.filter(a => a.status === 'present').length;
  const lateCount = attendanceHistory.filter(a => a.status === 'late').length;
  const absentCount = attendanceHistory.filter(a => a.status === 'absent').length;
  const rate = Math.round((presentCount / attendanceHistory.length) * 100);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4c3eb3 60%, #6366f1 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="relative">
          <p className="text-white/70 text-[14px] mb-1">{t('studentWelcomeBack')}</p>
          <h2 className="text-white mb-4" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{user?.name || t('studentRole')} 👋</h2>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <p className="text-white/60 text-[11px]" style={{ fontWeight: 500 }}>{t('studentId')}</p>
              <p className="text-white" style={{ fontWeight: 700 }}>{user?.id || 'STU001'}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <p className="text-white/60 text-[11px]" style={{ fontWeight: 500 }}>{t('studentClass')}</p>
              <p className="text-white" style={{ fontWeight: 700 }}>{user?.class || 'CS-301'}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <p className="text-white/60 text-[11px]" style={{ fontWeight: 500 }}>{t('studentSemester')}</p>
              <p className="text-white" style={{ fontWeight: 700 }}>HK2 — 2025/2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('studentPresent'), val: presentCount, total: attendanceHistory.length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
          { label: t('studentLate'), val: lateCount, total: attendanceHistory.length, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
          { label: t('studentAbsent'), val: absentCount, total: attendanceHistory.length, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
          { label: t('studentTotal'), val: attendanceHistory.length, total: 30, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: CalendarDays },
        ].map((s, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-gray-500" style={{ fontWeight: 500 }}>{s.label}</p>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className={`${s.color} mb-1`} style={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>{s.val}</p>
            <p className="text-[12px] text-gray-400">/ {s.total} {t('studentSessions')}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-[14px] text-gray-700 mb-2" style={{ fontWeight: 600 }}>{t('studentMyRate')}</p>
          <div className="relative" style={{ width: 160, height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270} data={radialData} barSize={14}>
                <RadialBar background dataKey="value" max={100} cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.7rem' }}>{rate}%</span>
              <span className="text-[11px] text-gray-400">rate</span>
            </div>
          </div>
          <div className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] ${rate >= 80 ? 'bg-green-50 text-green-700' : rate >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`} style={{ fontWeight: 600 }}>
            {rate >= 80 ? <><TrendingUp className="w-3.5 h-3.5" /> {t('studentPassed')}</> : <><XCircle className="w-3.5 h-3.5" /> {t('studentAttention')}</>}
          </div>
          {rate >= 90 && (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-[12px]" style={{ fontWeight: 600 }}>
              <Award className="w-3.5 h-3.5" /> {t('studentOutstanding')}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-[14px] text-gray-700 mb-4" style={{ fontWeight: 600 }}>{t('studentMonthlyTrend')}</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyStats} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[70, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="rate" fill="#6366f1" radius={[6, 6, 0, 0]} name="%" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent attendance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('studentRecentHistory')}</h3>
          <Link to="/student/history" className="text-[13px] text-purple-600 hover:underline" style={{ fontWeight: 500 }}>{t('studentViewAll')}</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {attendanceHistory.slice(0, 5).map((a, i) => {
            const s = statusConfig[a.status];
            const SIcon = s.icon;
            return (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.status === 'present' ? 'bg-green-50' : a.status === 'late' ? 'bg-amber-50' : 'bg-red-50'}`}>
                  <SIcon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-800 truncate" style={{ fontWeight: 500 }}>{a.subject}</p>
                  <p className="text-[12px] text-gray-400">{a.date} · {a.method}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[12px] ${s.color}`} style={{ fontWeight: 600 }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <p className="text-[12px] text-gray-400 mt-1">{a.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/student/history" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-purple-200 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <CalendarDays className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontWeight: 600 }}>{t('studentFullHistory')}</p>
            <p className="text-[13px] text-gray-400">{attendanceHistory.length} {t('studentSessions')}</p>
          </div>
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
            <Camera className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-gray-900" style={{ fontWeight: 600 }}>{t('studentRegisterFace')}</p>
            <p className="text-[13px] text-gray-400">{t('studentRegisterFaceDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}