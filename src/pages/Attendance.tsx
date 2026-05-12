import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Camera, CheckCircle2, Clock, Play, Square, Users, AlertTriangle } from 'lucide-react';
import { FaceAttendanceScanner } from '../components/FaceAttendanceScanner';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  closeAttendanceSession,
  listCourses,
  listCourseAttendanceSessions,
  listSchedules,
  listSessionRecords,
  markManualAttendance,
  openAttendanceSession,
  type AttendanceRecordRow,
  type AttendanceSession,
  type Course,
  type CourseSchedule,
} from '../services/smartAttendApi';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function Attendance() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [records, setRecords] = useState<AttendanceRecordRow[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('classId') || '');
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessionDate, setSessionDate] = useState(today());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const selectedSession = sessions.find((session) => session.id === selectedSessionId);
  const openSession = sessions.find((session) => session.status === 'open');

  async function loadCourses() {
    if (!token || user?.role !== 'teacher') return;
    const nextCourses = await listCourses(token);
    setCourses(nextCourses);
    const preferred = searchParams.get('classId') || nextCourses[0]?.id || '';
    setSelectedCourseId((current) => current || preferred);
  }

  async function loadCourseData(courseId: string) {
    if (!token || !courseId) return;
    const [nextSchedules, nextSessions] = await Promise.all([
      listSchedules(token, courseId),
      listCourseAttendanceSessions(token, courseId),
    ]);
    setSchedules(nextSchedules);
    setSessions(nextSessions);
    const nextOpenSession = nextSessions.find((session) => session.status === 'open');
    const nextSessionId = nextOpenSession?.id || nextSessions[0]?.id || '';
    setSelectedSessionId(nextSessionId);
    setSelectedScheduleId(nextSchedules[0]?.id || '');
  }

  async function loadRecords(sessionId: string) {
    if (!token || !sessionId) {
      setRecords([]);
      return;
    }
    setRecords(await listSessionRecords(token, sessionId));
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        await loadCourses();
        if (!cancelled) setError('');
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được dữ liệu điểm danh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  useEffect(() => {
    if (!selectedCourseId) return;
    setSearchParams({ classId: selectedCourseId });
    loadCourseData(selectedCourseId).catch((err) => setError(err instanceof Error ? err.message : 'Không tải được phiên điểm danh.'));
  }, [selectedCourseId]);

  useEffect(() => {
    loadRecords(selectedSessionId).catch((err) => setError(err instanceof Error ? err.message : 'Không tải được record.'));
  }, [selectedSessionId]);

  const counts = useMemo(
    () => ({
      present: records.filter((record) => record.attendanceStatus === 'present').length,
      late: records.filter((record) => record.attendanceStatus === 'late').length,
      absent: records.filter((record) => record.attendanceStatus === 'absent').length,
    }),
    [records],
  );

  const handleOpenSession = async () => {
    if (!token || !selectedCourseId) return;
    try {
      setBusy(true);
      const session = await openAttendanceSession(token, {
        courseId: selectedCourseId,
        scheduleId: selectedScheduleId || null,
        sessionDate,
      });
      await loadCourseData(selectedCourseId);
      setSelectedSessionId(session.id);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không mở được phiên điểm danh.');
    } finally {
      setBusy(false);
    }
  };

  const handleCloseSession = async () => {
    if (!token || !selectedSessionId || !selectedCourseId) return;
    try {
      setBusy(true);
      await closeAttendanceSession(token, selectedSessionId);
      await loadCourseData(selectedCourseId);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đóng được phiên điểm danh.');
    } finally {
      setBusy(false);
    }
  };

  const handleManual = async (studentId: string, status: 'present' | 'late') => {
    if (!token || !selectedSessionId) return;
    try {
      setBusy(true);
      await markManualAttendance(token, selectedSessionId, studentId, status);
      await loadRecords(selectedSessionId);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không ghi được điểm danh.');
    } finally {
      setBusy(false);
    }
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">
        Attendance API hiện tại dành cho giáo viên. Admin/FaceID sẽ làm ở phase sau.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1">
            <label className="block text-[12px] text-gray-500 mb-1">Khóa học</label>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg bg-white">
              {courses.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] text-gray-500 mb-1">Ngày</label>
            <input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white" />
          </div>
          <div>
            <label className="block text-[12px] text-gray-500 mb-1">Lịch học</label>
            <select value={selectedScheduleId} onChange={(e) => setSelectedScheduleId(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white min-w-48">
              <option value="">Đột xuất</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>T{schedule.dayOfWeek} {schedule.startTime}-{schedule.endTime}</option>
              ))}
            </select>
          </div>
          <button disabled={busy || !!openSession || !selectedCourseId} onClick={handleOpenSession} className="px-4 py-2 bg-navy disabled:bg-gray-300 text-white rounded-lg text-[13px] flex items-center gap-2">
            <Play className="w-4 h-4" /> Mở phiên
          </button>
          <button disabled={busy || selectedSession?.status !== 'open'} onClick={handleCloseSession} className="px-4 py-2 bg-red-600 disabled:bg-gray-300 text-white rounded-lg text-[13px] flex items-center gap-2">
            <Square className="w-4 h-4" /> Đóng phiên
          </button>
        </div>
        {selectedCourse && <p className="text-[12px] text-gray-500">Course: {selectedCourse.code} - {selectedCourse.name} - {selectedCourse.status}</p>}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-[13px]">{error}</div>}
      {loading && <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">Đang tải dữ liệu từ backend...</div>}

      <FaceAttendanceScanner
        sessionId={selectedSession?.status === 'open' ? selectedSession.id : ''}
        disabled={selectedSession?.status !== 'open'}
        onCheckedIn={() => selectedSessionId ? loadRecords(selectedSessionId) : undefined}
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-[12px] text-gray-500">Session</p><p className="text-xl font-bold">{sessions.length}</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-[12px] text-gray-500">Present</p><p className="text-xl font-bold text-green-600">{counts.present}</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-[12px] text-gray-500">Late</p><p className="text-xl font-bold text-amber-600">{counts.late}</p></div>
        <div className="bg-white rounded-xl border border-border p-4"><p className="text-[12px] text-gray-500">Absent computed</p><p className="text-xl font-bold text-red-600">{counts.absent}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-gray-900 mb-3 font-bold">Phiên điểm danh</h3>
          <div className="space-y-2">
            {sessions.map((session) => (
              <button key={session.id} onClick={() => setSelectedSessionId(session.id)} className={`w-full text-left p-3 rounded-xl border ${selectedSessionId === session.id ? 'border-navy bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold">{session.sessionDate}</span>
                  <StatusBadge status={session.status === 'open' ? 'active' : session.status} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{session.id}</p>
              </button>
            ))}
            {!sessions.length && <p className="text-[13px] text-gray-400">Chưa có phiên điểm danh.</p>}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold">Danh sách enrollment / records</h3>
            <span className="text-[12px] text-gray-400">{records.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  {['Học sinh', 'Email', 'Trạng thái', 'Method', 'Thao tác'].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.studentId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div><p className="font-medium">{record.studentName}</p><p className="text-[11px] text-gray-400">{record.studentId}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{record.email}</td>
                    <td className="px-5 py-3"><StatusBadge status={record.attendanceStatus} /></td>
                    <td className="px-5 py-3 text-gray-500">{record.method || '--'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button disabled={busy || selectedSession?.status !== 'open'} onClick={() => handleManual(record.studentId, 'present')} className="px-2.5 py-1.5 rounded-lg bg-green-600 disabled:bg-gray-300 text-white text-[12px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Present
                        </button>
                        <button disabled={busy || selectedSession?.status !== 'open'} onClick={() => handleManual(record.studentId, 'late')} className="px-2.5 py-1.5 rounded-lg bg-amber-500 disabled:bg-gray-300 text-white text-[12px] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      {selectedSessionId ? 'Session này chưa có active enrollment nào.' : 'Chọn hoặc mở session để xem record.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedSession?.status !== 'open' && (
        <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-4 text-[13px] flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span><Camera className="inline w-4 h-4 mr-1" /> Mở một phiên điểm danh để bắt đầu quét FaceID real-time.</span>
        </div>
      )}
    </div>
  );
}
