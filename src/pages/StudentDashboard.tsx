import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, Mail, XCircle, type LucideIcon } from 'lucide-react';
import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { FaceRegistrationPanel } from '../components/FaceRegistrationPanel';
import { StatusBadge } from '../components/StatusBadge';
import { StudentFaceCheckInPanel } from '../components/StudentFaceCheckInPanel';
import { WeeklyTimetable } from '../components/WeeklyTimetable';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  acceptInvitation,
  declineInvitation,
  getTimetable,
  listMyInvitations,
  type CourseInvitation,
  type TimetableCourse,
} from '../services/smartAttendApi';

export function StudentDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [timetable, setTimetable] = useState<TimetableCourse[]>([]);
  const [invitations, setInvitations] = useState<CourseInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    if (!token) return;
    try {
      setLoading(true);
      const [nextTimetable, nextInvitations] = await Promise.all([
        getTimetable(token),
        listMyInvitations(token),
      ]);
      setTimetable(nextTimetable);
      setInvitations(nextInvitations);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu học sinh.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const scheduleCount = timetable.reduce((total, course) => total + course.schedules.length, 0);
  const pendingCount = invitations.filter((invitation) => invitation.status === 'pending').length;
  const radialData = [{ name: 'Enrollment', value: timetable.length ? 100 : 0, fill: '#6366f1' }];

  const statusCards: Array<{ label: string; val: string | number; color: string; bg: string; border: string; icon: LucideIcon }> = [
    { label: 'Khóa học active', val: loading ? '...' : timetable.length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
    { label: 'Lịch học/tuần', val: loading ? '...' : scheduleCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
    { label: 'Lời mời pending', val: loading ? '...' : pendingCount, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
    { label: 'Tổng lời mời', val: loading ? '...' : invitations.length, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: CalendarDays },
  ];

  const handleAccept = async (invitationId: string) => {
    if (!token) return;
    await acceptInvitation(token, invitationId);
    await load();
  };

  const handleDecline = async (invitationId: string) => {
    if (!token) return;
    await declineInvitation(token, invitationId);
    await load();
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4c3eb3 60%, #6366f1 100%)' }}
      >
        <div className="relative">
          <p className="text-white/70 text-[14px] mb-1">{t('studentWelcomeBack')}</p>
          <h2 className="text-white mb-4" style={{ fontWeight: 700, fontSize: '1.5rem' }}>{user?.name || t('studentRole')}</h2>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <p className="text-white/60 text-[11px]" style={{ fontWeight: 500 }}>{t('studentId')}</p>
              <p className="text-white" style={{ fontWeight: 700 }}>{user?.id}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <p className="text-white/60 text-[11px]" style={{ fontWeight: 500 }}>{t('studentClass')}</p>
              <p className="text-white" style={{ fontWeight: 700 }}>{user?.class || 'Chưa cập nhật'}</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <p className="text-white/60 text-[11px]" style={{ fontWeight: 500 }}>Email</p>
              <p className="text-white" style={{ fontWeight: 700 }}>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-[13px]">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl p-5 border ${card.border} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-gray-500" style={{ fontWeight: 500 }}>{card.label}</p>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className={`${card.color} mb-1`} style={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>{card.val}</p>
            <p className="text-[12px] text-gray-400">từ Supabase</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-[14px] text-gray-700 mb-2" style={{ fontWeight: 600 }}>Trạng thái ghi danh</p>
          <div className="relative" style={{ width: 160, height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={90} endAngle={-270} data={radialData} barSize={14}>
                <RadialBar background dataKey="value" max={100} cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '1.7rem' }}>{timetable.length}</span>
              <span className="text-[11px] text-gray-400">course</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-gray-900" style={{ fontWeight: 700 }}>Lời mời khóa học</h3>
            <span className="text-[12px] text-gray-400">{invitations.length} invitations</span>
          </div>
          <div className="divide-y divide-gray-50">
            {!loading && !invitations.length && (
              <p className="px-6 py-6 text-[13px] text-gray-400">Không có lời mời pending cho email này.</p>
            )}
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple-50">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-800 truncate" style={{ fontWeight: 500 }}>{invitation.courseName || invitation.courseId}</p>
                  <p className="text-[12px] text-gray-400">{invitation.courseCode} - {invitation.teacherName || 'Teacher'}</p>
                </div>
                <StatusBadge status={invitation.status} />
                {invitation.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(invitation.id)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-[12px]">Accept</button>
                    <button onClick={() => handleDecline(invitation.id)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[12px]">Decline</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <WeeklyTimetable
        courses={timetable}
        loading={loading}
        title="Thời khóa biểu học sinh"
        emptyMessage="Tuần này chưa có lớp nào đã được ghi danh/accept invitation."
      />

      <StudentFaceCheckInPanel />

      <FaceRegistrationPanel />
    </div>
  );
}
