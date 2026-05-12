import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Users, Clock, Camera, ChevronRight, Search, CalendarDays, X, UserPlus, CalendarPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WeeklyTimetable } from '../components/WeeklyTimetable';
import { createCourse, createCourseInvitation, createSchedule, listCourses, listSchedules, type Course, type CourseSchedule } from '../services/smartAttendApi';

const initialForm = {
  code: '',
  name: '',
  description: '',
  room: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  status: 'active' as Course['status'],
};

const initialScheduleForm = {
  day_of_week: 1,
  start_time: '08:00',
  end_time: '10:00',
  room: '',
};

function formatSchedule(schedules: CourseSchedule[]) {
  if (!schedules.length) return 'Chưa có lịch học';
  return schedules
    .map((schedule) => `${formatWeekday(schedule.dayOfWeek)} ${schedule.startTime.slice(0, 5)}-${schedule.endTime.slice(0, 5)}`)
    .join(', ');
}

function formatWeekday(dayOfWeek: number) {
  if (dayOfWeek === 7) return 'Chủ nhật';
  return `Thứ ${dayOfWeek + 1}`;
}

export function Classes() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedulesByCourse, setSchedulesByCourse] = useState<Record<string, CourseSchedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [invitingCourse, setInvitingCourse] = useState<Course | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSaving, setInviteSaving] = useState(false);
  const [schedulingCourse, setSchedulingCourse] = useState<Course | null>(null);
  const [scheduleForm, setScheduleForm] = useState(initialScheduleForm);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { token, user } = useAuth();
  const location = useLocation();
  const portalBase = location.pathname.startsWith('/teacher') ? '/teacher' : '/admin';

  async function loadCourses() {
    if (!token || user?.role !== 'teacher') {
      setLoading(false);
      return;
    }

    setLoading(true);
    const nextCourses = await listCourses(token);
    const scheduleEntries = await Promise.all(
      nextCourses.map(async (course) => [course.id, await listSchedules(token, course.id)] as const),
    );
    setCourses(nextCourses);
    setSchedulesByCourse(Object.fromEntries(scheduleEntries));
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await loadCourses();
        if (!cancelled) setError('');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không tải được danh sách khóa học.');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return courses.filter((course) =>
      course.name.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      course.status.toLowerCase().includes(query)
    );
  }, [courses, search]);

  const teacherTimetable = useMemo(
    () =>
      courses.map((course) => ({
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        teacherId: course.teacherId,
        room: course.room,
        startDate: course.startDate,
        endDate: course.endDate,
        schedules: (schedulesByCourse[course.id] ?? []).map((schedule) => ({
          scheduleId: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
        })),
      })),
    [courses, schedulesByCourse],
  );

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    if (form.start_date > form.end_date) {
      setError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.');
      return;
    }

    try {
      setSaving(true);
      await createCourse(token, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        room: form.room.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
      });
      setForm(initialForm);
      setShowCreate(false);
      setError('');
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được khóa học.');
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !invitingCourse) return;

    try {
      setInviteSaving(true);
      await createCourseInvitation(token, invitingCourse.id, inviteEmail.trim());
      setInviteEmail('');
      setInvitingCourse(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không mời được học sinh.');
    } finally {
      setInviteSaving(false);
    }
  };

  const handleCreateSchedule = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !schedulingCourse) return;

    if (scheduleForm.start_time >= scheduleForm.end_time) {
      setError('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
      return;
    }

    try {
      setScheduleSaving(true);
      await createSchedule(token, schedulingCourse.id, {
        day_of_week: scheduleForm.day_of_week,
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        room: scheduleForm.room.trim() || null,
      });
      const nextSchedules = await listSchedules(token, schedulingCourse.id);
      setSchedulesByCourse((current) => ({ ...current, [schedulingCourse.id]: nextSchedules }));
      setScheduleForm(initialScheduleForm);
      setSchedulingCourse(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thêm được thời khóa biểu.');
    } finally {
      setScheduleSaving(false);
    }
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">
        Màn hình này đang dùng API dành cho giáo viên. Admin dashboard sẽ cần API tổng hợp riêng ở phase sau.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm khóa học..."
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] hover:bg-navy-light transition-colors" style={{ fontWeight: 500 }}>
          + Tạo khóa học
        </button>
      </div>

      {loading && <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">Đang tải khóa học từ backend...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-[13px]">{error}</div>}

      {!loading && !filtered.length && (
        <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">
          Chưa có khóa học nào trong database.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course) => {
          const schedules = schedulesByCourse[course.id] ?? [];
          return (
            <div key={course.id} className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[11px] text-navy bg-blue-50 px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>{course.code}</span>
                    <h3 className="text-[15px] text-foreground mt-1.5" style={{ fontWeight: 600 }}>{course.name}</h3>
                    <p className="text-[12px] text-muted-foreground">{course.status}</p>
                  </div>
                  <Link to={`${portalBase}/reports?classId=${encodeURIComponent(course.id)}`} aria-label={`Mở báo cáo ${course.code}`}>
                    <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 hover:text-navy transition-colors" />
                  </Link>
                </div>

                <div className="space-y-2 text-[12px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatSchedule(schedules)}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {course.startDate} - {course.endDate}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Học sinh lấy từ enrollment khi mở phiên điểm danh</span>
                </div>
              </div>
              <div className="border-t border-border px-5 py-3 flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">{course.room || 'Chưa có phòng'}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSchedulingCourse(course);
                      setScheduleForm({
                        ...initialScheduleForm,
                        room: course.room ?? '',
                      });
                    }}
                    className="flex items-center gap-1.5 text-[12px] text-navy hover:text-navy-light transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Thêm lịch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInvitingCourse(course);
                      setInviteEmail('');
                    }}
                    className="flex items-center gap-1.5 text-[12px] text-navy hover:text-navy-light transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Mời học sinh
                  </button>
                  <Link to={`${portalBase}/attendance?classId=${encodeURIComponent(course.id)}`} className="flex items-center gap-1.5 text-[12px] text-navy hover:text-navy-light transition-colors" style={{ fontWeight: 500 }}>
                  <Camera className="w-3.5 h-3.5" /> Điểm danh
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <WeeklyTimetable
        courses={teacherTimetable}
        loading={loading}
        title="Thời khóa biểu giáo viên"
        emptyMessage="Tuần này giáo viên chưa có buổi học nào trong thời hạn lớp."
      />

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">Tạo khóa học</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">Dữ liệu sẽ được lưu trực tiếp vào Supabase.</p>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Mã khóa học</span>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg" placeholder="VD: CS301-2026" />
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Tên khóa học</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg" placeholder="VD: Công nghệ phần mềm" />
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Ngày bắt đầu</span>
                <input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg" />
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Ngày kết thúc</span>
                <input required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg" />
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Phòng học</span>
                <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg" placeholder="VD: A101" />
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Trạng thái</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Course['status'] })} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg">
                  <option value="draft">Nháp</option>
                  <option value="active">Đang hoạt động</option>
                </select>
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-[12px] text-muted-foreground">Mô tả</span>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-border rounded-lg min-h-20" placeholder="Mô tả ngắn về khóa học" />
              </label>
            </div>

            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border text-[13px] hover:bg-muted">Hủy</button>
              <button disabled={saving} type="submit" className="px-4 py-2 rounded-lg bg-navy text-white text-[13px] disabled:bg-gray-300">
                {saving ? 'Đang tạo...' : 'Tạo khóa học'}
              </button>
            </div>
          </form>
        </div>
      )}

      {invitingCourse && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleInvite} className="w-full max-w-md bg-white rounded-xl shadow-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">Mời học sinh</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">{invitingCourse.code} - {invitingCourse.name}</p>
              </div>
              <button type="button" onClick={() => setInvitingCourse(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <label className="space-y-1 block">
                <span className="text-[12px] text-muted-foreground">Email học sinh</span>
                <input
                  required
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-lg"
                  placeholder="student@smartattend.vn"
                />
              </label>
            </div>

            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button type="button" onClick={() => setInvitingCourse(null)} className="px-4 py-2 rounded-lg border border-border text-[13px] hover:bg-muted">Hủy</button>
              <button disabled={inviteSaving} type="submit" className="px-4 py-2 rounded-lg bg-navy text-white text-[13px] disabled:bg-gray-300">
                {inviteSaving ? 'Đang mời...' : 'Gửi lời mời'}
              </button>
            </div>
          </form>
        </div>
      )}

      {schedulingCourse && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSchedule} className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-border">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">Thêm thời khóa biểu</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">{schedulingCourse.code} - {schedulingCourse.name}</p>
              </div>
              <button type="button" onClick={() => setSchedulingCourse(null)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Thứ trong tuần</span>
                <select
                  value={scheduleForm.day_of_week}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, day_of_week: Number(event.target.value) })}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-lg"
                >
                  <option value={1}>Thứ 2</option>
                  <option value={2}>Thứ 3</option>
                  <option value={3}>Thứ 4</option>
                  <option value={4}>Thứ 5</option>
                  <option value={5}>Thứ 6</option>
                  <option value={6}>Thứ 7</option>
                  <option value={7}>Chủ nhật</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Phòng học</span>
                <input
                  value={scheduleForm.room}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, room: event.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-lg"
                  placeholder={schedulingCourse.room || 'VD: A101'}
                />
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Giờ bắt đầu</span>
                <input
                  required
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, start_time: event.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-lg"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[12px] text-muted-foreground">Giờ kết thúc</span>
                <input
                  required
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={(event) => setScheduleForm({ ...scheduleForm, end_time: event.target.value })}
                  className="w-full px-3 py-2 text-[13px] border border-border rounded-lg"
                />
              </label>
            </div>

            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button type="button" onClick={() => setSchedulingCourse(null)} className="px-4 py-2 rounded-lg border border-border text-[13px] hover:bg-muted">Hủy</button>
              <button disabled={scheduleSaving} type="submit" className="px-4 py-2 rounded-lg bg-navy text-white text-[13px] disabled:bg-gray-300">
                {scheduleSaving ? 'Đang lưu...' : 'Lưu lịch học'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
