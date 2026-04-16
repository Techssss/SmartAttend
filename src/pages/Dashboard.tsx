import { Users, UserCheck, Clock, UserX, TrendingUp, AlertTriangle, Camera, Shield, Activity } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

const trendData = [
  { day: 'T2', rate: 92 }, { day: 'T3', rate: 88 }, { day: 'T4', rate: 95 },
  { day: 'T5', rate: 91 }, { day: 'T6', rate: 87 }, { day: 'T7', rate: 93 }, { day: 'CN', rate: 96 },
];

const punctualityData = [
  { day: 'T2', onTime: 85, late: 7 }, { day: 'T3', onTime: 80, late: 8 },
  { day: 'T4', onTime: 88, late: 7 }, { day: 'T5', onTime: 82, late: 9 },
  { day: 'T6', onTime: 78, late: 9 },
];

const pieData = [
  { name: 'Có mặt', value: 83.8, color: '#22c55e' },
  { name: 'Muộn', value: 3.4, color: '#f59e0b' },
  { name: 'Vắng', value: 9.2, color: '#ef4444' },
  { name: 'Chưa xét', value: 3.6, color: '#e2e8f0' },
];

const recentLogs = [
  { id: 'STU001', name: 'Nguyễn Văn An', class: 'CS-301', time: '08:02', status: 'present' as const },
  { id: 'STU002', name: 'Trần Thị Bảo', class: 'CS-301', time: '08:15', status: 'late' as const },
  { id: 'STU003', name: 'Lê Hoàng Cường', class: 'ENG-201', time: '08:00', status: 'present' as const },
  { id: 'STU004', name: 'Phạm Thị Dung', class: 'CS-301', time: '--', status: 'absent' as const },
  { id: 'STU005', name: 'Hoàng Minh Đức', class: 'ENG-201', time: '08:04', status: 'present' as const },
  { id: 'STU006', name: 'Vũ Thị Hoa', class: 'BUS-101', time: '08:18', status: 'late' as const },
];

const alerts = [
  { msg: 'Phát hiện khuôn mặt lạ tại Camera A — Cổng chính', time: '2 phút trước', type: 'danger' },
  { msg: 'Kiểm tra sinh trắc thất bại tại Phòng 202', time: '8 phút trước', type: 'warning' },
  { msg: 'Nhiều lần thử đáng ngờ tại Tòa nhà Lab B', time: '15 phút trước', type: 'danger' },
];

function StatCard({ label, value, change, icon, color, trend }: {
  label: string; value: string; change?: string; icon: React.ReactNode; color: string; trend?: 'up' | 'down' | 'neutral';
}) {
  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-100' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl border ${c.border} shadow-sm p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.icon}`}>{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : trend === 'down' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`} style={{ fontWeight: 600 }}>
            <TrendingUp className="w-3 h-3" />{change}
          </div>
        )}
      </div>
      <p className="text-gray-900 mb-0.5" style={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>{value}</p>
      <p className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export function Dashboard() {
  const { t } = useLanguage();
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t('dashTotalStudents')} value="1.247" change="+12 tuần này" icon={<Users className="w-5 h-5" />} color="blue" trend="up" />
        <StatCard label={t('dashPresentToday')} value="1.089" change="87.3%" icon={<UserCheck className="w-5 h-5" />} color="green" trend="up" />
        <StatCard label={t('dashLate')} value="43" icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label={t('dashAbsent')} value="115" icon={<UserX className="w-5 h-5" />} color="red" />
      </div>

      {/* Attendance Rate Hero */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2440 0%, #1e3a5f 60%, #1e40af 100%)' }}>
        <div className="absolute right-0 top-0 w-96 h-96 opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translate(20%, -20%)' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-[13px] mb-1" style={{ fontWeight: 500 }}>{t('dashRateToday')}</p>
            <p className="text-white" style={{ fontWeight: 800, fontSize: '3rem', lineHeight: 1.1 }}>87.3%</p>
            <p className="text-white/60 text-[13px] mt-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400" style={{ fontWeight: 600 }}>+2.1%</span> {t('dashVsYesterday')}
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { label: t('dashOnTime'), val: '83.8%', color: 'text-green-400' },
              { label: t('dashLate'), val: '3.4%', color: 'text-amber-400' },
              { label: t('dashAbsent'), val: '9.2%', color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={s.color} style={{ fontWeight: 800, fontSize: '1.4rem' }}>{s.val}</p>
                <p className="text-[12px] text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
          <Link to="/admin/attendance"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[14px] text-white transition-all backdrop-blur-sm"
            style={{ fontWeight: 600 }}>
            <Camera className="w-4 h-4" /> {t('dashCheckInNow')}
          </Link>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('dashTrend')}</h3>
            <div className="flex items-center gap-1.5 text-[12px] text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <Activity className="w-3.5 h-3.5" />
              <span style={{ fontWeight: 600 }}>{t('dashHighPeak')}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[80, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
              <Line type="monotone" dataKey="rate" stroke="#1e3a5f" strokeWidth={2.5} dot={{ fill: '#1e3a5f', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#2d5a8e' }} name="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>{t('dashDistribution')}</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {[
              { name: t('dashOnTime'), value: 83.8, color: '#22c55e' },
              { name: t('dashLate'), value: 3.4, color: '#f59e0b' },
              { name: t('dashAbsent'), value: 9.2, color: '#ef4444' },
            ].map(d => (
              <div key={d.name} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="text-gray-900" style={{ fontWeight: 600 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700 }}>{t('dashOnTimeVsLate')}</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={punctualityData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
            <Bar dataKey="onTime" fill="#1e3a5f" radius={[4, 4, 0, 0]} name={t('dashOnTime')} />
            <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} name={t('dashLate')} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('dashSecurityAlerts')}</h3>
            </div>
            <span className="text-[12px] text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full" style={{ fontWeight: 600 }}>3 {t('dashNewAlerts')}</span>
          </div>
          <div className="p-4 space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${a.type === 'danger' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <p className="text-[13px] text-gray-800" style={{ fontWeight: 500 }}>{a.msg}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
            <Link to="/admin/alerts" className="flex items-center justify-center gap-1 py-2 text-[13px] text-blue-600 hover:underline" style={{ fontWeight: 500 }}>
              {t('dashViewAllAlerts')}
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('dashRecentLogs')}</h3>
            <Link to="/admin/reports" className="text-[13px] text-blue-600 hover:underline" style={{ fontWeight: 500 }}>{t('dashViewAll')}</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  {[t('dashStudent'), t('dashId'), t('dashClass'), t('dashEntryTime'), t('dashStatus')].map(h => (
                    <th key={h} className="px-5 py-3" style={{ fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[11px] text-blue-700" style={{ fontWeight: 700 }}>
                          {log.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{log.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{log.id}</td>
                    <td className="px-5 py-3 text-gray-500">{log.class}</td>
                    <td className="px-5 py-3 text-gray-600">{log.time}</td>
                    <td className="px-5 py-3"><StatusBadge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}