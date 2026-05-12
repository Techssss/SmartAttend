import { useEffect, useMemo, useState } from 'react';
import { Camera, Users, CheckCircle2, TrendingUp, Play, BookOpen, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StatusBadge } from '../components/StatusBadge';
import { getInitials, percent } from '../data/attendance';
import { listCourseAttendance, listCourses, type Course, type CourseAttendanceSession } from '../services/smartAttendApi';

interface CourseSummary {
  course: Course;
  sessions: CourseAttendanceSession[];
}

function countRecords(summaries: CourseSummary[]) {
  return summaries.reduce(
    (totals, summary) => {
      for (const session of summary.sessions) {
        for (const record of session.records) {
          totals.students += 1;
          if (record.attendanceStatus === 'present') totals.present += 1;
          if (record.attendanceStatus === 'late') totals.late += 1;
          if (record.attendanceStatus === 'absent') totals.absent += 1;
        }
      }
      return totals;
    },
    { students: 0, present: 0, late: 0, absent: 0 },
  );
}

export function TeacherDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) return;
      try {
        setLoading(true);
        const courses = await listCourses(token);
        const nextSummaries = await Promise.all(
          courses.map(async (course) => ({
            course,
            sessions: await listCourseAttendance(token, course.id).catch(() => []),
          })),
        );
        if (!cancelled) {
          setSummaries(nextSummaries);
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const courses = summaries.map((summary) => summary.course);
  const totals = useMemo(() => countRecords(summaries), [summaries]);
  const overallRate = percent(totals.present + totals.late, totals.students);
  const recentLogs = summaries
    .flatMap((summary) =>
      summary.sessions.flatMap((session) =>
        session.records
          .filter((record) => record.scanTime)
          .map((record) => ({ ...record, session, course: summary.course })),
      ),
    )
    .sort((a, b) => String(b.scanTime).localeCompare(String(a.scanTime)))
    .slice(0, 5);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1f5e 0%, #2d3a99 60%, #4f46e5 100%)' }}>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-[14px] mb-1">{t('teacherHello')}</p>
            <h2 className="text-white mb-2" style={{ fontWeight: 700, fontSize: '1.4rem' }}>{user?.name || t('teacherRole')}</h2>
            <p className="text-white/60 text-[13px]">{user?.department || t('teacherDept')} - {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          <Link to={`/teacher/attendance?classId=${encodeURIComponent(courses[0]?.id ?? '')}`}
            className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 rounded-xl text-[14px] hover:bg-indigo-50 transition-all shadow-md"
            style={{ fontWeight: 700 }}>
            <Play className="w-4 h-4" /> {t('teacherStartBtn')}
          </Link>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-[13px]">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('teacherClassesCount'), val: loading ? '...' : courses.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: t('teacherTotalStudents'), val: loading ? '...' : totals.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('teacherPresent'), val: loading ? '...' : totals.present, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: t('teacherAvgRate'), val: loading ? '...' : `${overallRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
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
            {!loading && !summaries.length && <p className="text-[13px] text-gray-500 p-4">Chưa có khóa học nào trong database.</p>}
            {summaries.map(({ course, sessions }) => {
              const activeSession = sessions.find((session) => session.status === 'open');
              const latestSession = sessions[0];
              const records = latestSession?.records ?? [];
              const present = records.filter((record) => ['present', 'late'].includes(record.attendanceStatus)).length;
              const rate = percent(present, records.length);
              return (
                <div key={course.id} className="border border-gray-100 rounded-2xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded" style={{ fontWeight: 600 }}>{course.code}</span>
                        <StatusBadge status={course.status} />
                      </div>
                      <p className="text-gray-900 text-[14px]" style={{ fontWeight: 600 }}>{course.name}</p>
                      <p className="text-[12px] text-gray-400">{course.room || 'Chưa có phòng'} - {sessions.length} phiên điểm danh</p>
                    </div>
                    <Link to={`/teacher/attendance?classId=${encodeURIComponent(course.id)}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[12px] hover:bg-indigo-700 transition-all"
                      style={{ fontWeight: 600 }}>
                      <Camera className="w-3.5 h-3.5" /> {activeSession ? 'Mở phiên' : t('teacherTakeAttendance')}
                    </Link>
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="text-gray-500">Tỉ lệ phiên gần nhất</span>
                      <span className="text-gray-900" style={{ fontWeight: 600 }}>{rate}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: `${rate}%` }} />
                    </div>
                    <div className="flex gap-4 mt-1.5 text-[11px]">
                      <span className="text-green-600">{present} đã điểm danh</span>
                      <span className="text-red-500">{Math.max(records.length - present, 0)} vắng</span>
                      <span className="ml-auto text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" /> {records.length} enrollment</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t('teacherTodayAlerts')}</h3>
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
            <p className="text-[12px] text-blue-700" style={{ fontWeight: 500 }}>Dashboard đang dùng dữ liệu thật từ Supabase. Alert/FaceID sẽ làm ở phase sau.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('teacherRecentLogs')}</h3>
          <span className="text-[12px] text-gray-400">{recentLogs.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                {[t('dashStudent'), t('dashId'), t('dashClass'), t('dashEntryTime'), t('dashStatus')].map((h) => (
                  <th key={h} className="px-5 py-3" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={`${log.session.sessionId}-${log.studentId}`} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 text-[11px]" style={{ fontWeight: 700 }}>
                        {getInitials(log.studentName)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{log.studentName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400">{log.studentId}</td>
                  <td className="px-5 py-3 text-gray-400">{log.course.code}</td>
                  <td className="px-5 py-3 text-gray-600">{log.scanTime ? new Date(log.scanTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                  <td className="px-5 py-3"><StatusBadge status={log.attendanceStatus} /></td>
                </tr>
              ))}
              {!loading && !recentLogs.length && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">Chưa có record điểm danh nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
