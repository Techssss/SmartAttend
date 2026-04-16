import { useState } from 'react';
import { Camera, Users, CheckCircle2, TrendingUp, Play, BookOpen, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { StatusBadge } from '../components/StatusBadge';

export function TeacherDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeClassId, setActiveClassId] = useState<string | null>(null);

  const classStatusStyle = {
    active: 'bg-green-50 text-green-700 border-green-200',
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    done: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  const classStatusLabel = {
    active: t('teacherActive'),
    upcoming: t('teacherUpcoming'),
    done: t('teacherDone'),
  };

  const myClasses = [
    { id: 'CS-301', name: 'Computer Science 301', students: 35, present: 30, late: 3, absent: 2, time: '08:00 – 09:30', room: 'Room 201', status: 'active' },
    { id: 'MATH-202', name: 'Advanced Mathematics 202', students: 30, present: 26, late: 2, absent: 2, time: '10:00 – 11:30', room: 'Room 102', status: 'upcoming' },
    { id: 'ENG-201', name: 'English Literature 201', students: 28, present: 25, late: 1, absent: 2, time: '13:30 – 15:00', room: 'Room 305', status: 'done' },
  ];

  const recentLogs = [
    { name: 'Nguyễn Văn An', id: 'STU001', class: 'CS-301', time: '08:02', status: 'present' as const },
    { name: 'Trần Thị Bảo', id: 'STU002', class: 'CS-301', time: '08:15', status: 'late' as const },
    { name: 'Lê Hoàng Cường', id: 'STU003', class: 'CS-301', time: '08:00', status: 'present' as const },
    { name: 'Phạm Thị Dung', id: 'STU004', class: 'CS-301', time: '--', status: 'absent' as const },
    { name: 'Hoàng Minh Đức', id: 'STU005', class: 'CS-301', time: '08:04', status: 'present' as const },
  ];

  const totalStudents = myClasses.reduce((s, c) => s + c.students, 0);
  const totalPresent = myClasses.reduce((s, c) => s + c.present, 0);
  const overallRate = Math.round((totalPresent / totalStudents) * 100);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1f5e 0%, #2d3a99 60%, #4f46e5 100%)' }}>
        <div className="absolute right-0 top-0 w-72 h-72 opacity-10"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-[14px] mb-1">{t('teacherHello')}</p>
            <h2 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '1.4rem' }}>{user?.name || t('teacherRole')} 👋</h2>
            <p className="text-white/60 text-[13px]">{user?.department || t('teacherDept')} · Wed, 08/04/2026</p>
          </div>
          <Link to="/teacher/attendance"
            className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 rounded-xl text-[14px] hover:bg-indigo-50 transition-all shadow-md"
            style={{ fontWeight: 700 }}>
            <Play className="w-4 h-4" /> {t('teacherStartBtn')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('teacherClassesCount'), val: myClasses.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: t('teacherTotalStudents'), val: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('teacherPresent'), val: totalPresent, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: t('teacherAvgRate'), val: `${overallRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-gray-500" style={{ fontWeight: 500 }}>{s.label}</p>
              <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.7rem', lineHeight: 1 }}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('teacherTodayClasses')}</h3>
            <Link to="/teacher/classes" className="text-[13px] text-indigo-600 hover:underline" style={{ fontWeight: 500 }}>{t('teacherViewAll')}</Link>
          </div>
          <div className="p-4 space-y-3">
            {myClasses.map(cls => {
              const rate = Math.round((cls.present / cls.students) * 100);
              return (
                <div key={cls.id} className="border border-gray-100 rounded-2xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded" style={{ fontWeight: 600 }}>{cls.id}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${classStatusStyle[cls.status as keyof typeof classStatusStyle]}`} style={{ fontWeight: 500 }}>
                          {classStatusLabel[cls.status as keyof typeof classStatusLabel]}
                        </span>
                      </div>
                      <p className="text-gray-900 text-[14px]" style={{ fontWeight: 600 }}>{cls.name}</p>
                      <p className="text-[12px] text-gray-400">{cls.time} · {cls.room}</p>
                    </div>
                    <Link to="/teacher/attendance"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[12px] hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100"
                      style={{ fontWeight: 600 }}>
                      <Camera className="w-3.5 h-3.5" /> {t('teacherTakeAttendance')}
                    </Link>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="text-gray-500">{t('teacherAttendanceRate')}</span>
                      <span className="text-gray-900" style={{ fontWeight: 600 }}>{rate}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                      <div className="bg-green-500 h-full" style={{ width: `${(cls.present / cls.students) * 100}%` }} />
                      <div className="bg-amber-400 h-full" style={{ width: `${(cls.late / cls.students) * 100}%` }} />
                      <div className="bg-red-400 h-full" style={{ width: `${(cls.absent / cls.students) * 100}%` }} />
                    </div>
                    <div className="flex gap-4 mt-1.5 text-[11px]">
                      <span className="flex items-center gap-1 text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />{cls.present} {t('teacherOnTime')}</span>
                      <span className="flex items-center gap-1 text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{cls.late} {t('teacherLate')}</span>
                      <span className="flex items-center gap-1 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{cls.absent} {t('teacherAbsent')}</span>
                      <span className="ml-auto text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" /> {cls.students} {t('teacherStudents')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-900 mb-4" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('teacherWeeklyTrend')}</h3>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={[{ day: 'Mon', rate: 92 }, { day: 'Tue', rate: 88 }, { day: 'Wed', rate: 95 }, { day: 'Thu', rate: 91 }, { day: 'Fri', rate: 87 }]} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[80, 100]} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('teacherTodayAlerts')}</h3>
            <div className="space-y-2">
              {[
                { msg: t('teacherAlertAbsent'), type: 'danger' },
                { msg: t('teacherAlertLate'), type: 'warning' },
              ].map((a, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${a.type === 'danger' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${a.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                  <p className="text-[12px]" style={{ fontWeight: 500, color: a.type === 'danger' ? '#b91c1c' : '#92400e' }}>{a.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('teacherRecentLogs')} — CS-301</h3>
          <span className="text-[12px] text-gray-400">{recentLogs.length} students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                {[t('dashStudent'), t('dashId'), t('dashEntryTime'), t('dashStatus')].map(h => (
                  <th key={h} className="px-5 py-3" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 text-[11px]" style={{ fontWeight: 700 }}>
                        {log.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{log.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{log.id}</td>
                  <td className="px-5 py-3 text-gray-600">{log.time}</td>
                  <td className="px-5 py-3"><StatusBadge status={log.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}