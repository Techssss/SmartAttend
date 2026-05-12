import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Card, SummaryCard } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { FileSpreadsheet, FileText, Filter, Users, UserCheck, Clock, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { percent } from '../data/attendance';
import { listCourseAttendance, listCourses, type Course, type CourseAttendanceSession } from '../services/smartAttendApi';

interface ReportRow {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  email: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  time: string;
  status: 'present' | 'late' | 'absent' | 'rejected';
  method: string | null;
}

export function Reports() {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceByCourse, setAttendanceByCourse] = useState<Record<string, CourseAttendanceSession[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const classIdParam = searchParams.get('classId') || 'all';
  const [classFilter, setClassFilter] = useState(classIdParam);
  const { token, user } = useAuth();

  useEffect(() => {
    setClassFilter(classIdParam);
  }, [classIdParam]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token || user?.role !== 'teacher') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const nextCourses = await listCourses(token);
        const entries = await Promise.all(
          nextCourses.map(async (course) => [course.id, await listCourseAttendance(token, course.id).catch(() => [])] as const),
        );
        if (!cancelled) {
          setCourses(nextCourses);
          setAttendanceByCourse(Object.fromEntries(entries));
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được báo cáo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  const rows = useMemo<ReportRow[]>(() => {
    return courses.flatMap((course) =>
      (attendanceByCourse[course.id] ?? []).flatMap((session) =>
        session.records.map((record) => ({
          id: `${session.sessionId}-${record.studentId}`,
          date: session.sessionDate,
          studentId: record.studentId,
          studentName: record.studentName,
          email: record.email,
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          time: record.scanTime ? new Date(record.scanTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--',
          status: record.attendanceStatus,
          method: record.method,
        })),
      ),
    );
  }, [attendanceByCourse, courses]);

  const filtered = rows.filter((record) =>
    (classFilter === 'all' || record.courseId === classFilter) &&
    record.date >= dateFrom &&
    record.date <= dateTo
  );
  const present = filtered.filter((record) => record.status === 'present').length;
  const late = filtered.filter((record) => record.status === 'late').length;
  const absent = filtered.filter((record) => record.status === 'absent').length;
  const presentRate = percent(present + late, filtered.length, 1);

  if (user?.role !== 'teacher') {
    return (
      <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">
        Reports API hiện tại dành cho giáo viên. Admin reporting sẽ cần endpoint tổng hợp riêng.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard label="Tổng records" value={loading ? '...' : filtered.length} icon={<Users className="w-5 h-5" />} color="blue" />
        <SummaryCard label="Có mặt" value={present} change={`${presentRate}%`} icon={<UserCheck className="w-5 h-5" />} color="green" />
        <SummaryCard label="Muộn" value={late} icon={<Clock className="w-5 h-5" />} color="amber" />
        <SummaryCard label="Vắng computed" value={absent} icon={<UserX className="w-5 h-5" />} color="red" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-[13px]">{error}</div>}

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div>
            <label className="block text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Từ ngày</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <div>
            <label className="block text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Đến ngày</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <div>
            <label className="block text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Khóa học</label>
            <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20">
              <option value="all">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>
          <button className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] hover:bg-navy-light transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}>
            <Filter className="w-4 h-4" /> Áp dụng
          </button>
          <div className="sm:ml-auto flex gap-2">
            <button className="px-3 py-2 border border-border rounded-lg text-[13px] hover:bg-muted transition-colors flex items-center gap-2 text-foreground" style={{ fontWeight: 500 }}>
              <FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel
            </button>
            <button className="px-3 py-2 border border-border rounded-lg text-[13px] hover:bg-muted transition-colors flex items-center gap-2 text-foreground" style={{ fontWeight: 500 }}>
              <FileText className="w-4 h-4 text-red-500" /> PDF
            </button>
          </div>
        </div>
      </Card>

      <Card title="Hồ sơ điểm danh" action={<span className="text-[12px] text-muted-foreground">{filtered.length} records</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                {['Ngày', 'Học sinh', 'Email', 'Khóa học', 'Giờ vào', 'Method', 'Trạng thái'].map((h) => (
                  <th key={h} className="pb-3 pr-4" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-2.5 pr-4 text-muted-foreground">{record.date}</td>
                  <td className="py-2.5 pr-4" style={{ fontWeight: 500 }}>{record.studentName}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{record.email}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{record.courseCode} - {record.courseName}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{record.time}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{record.method || '--'}</td>
                  <td className="py-2.5"><StatusBadge status={record.status} /></td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">Chưa có attendance record nào từ backend.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
