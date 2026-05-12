import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, CheckCircle2, XCircle, Clock, UserPlus } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../data/attendance';
import { listCourseInvitations, listCourses, type Course, type CourseInvitation } from '../services/smartAttendApi';

interface StudentInviteRow extends CourseInvitation {
  course?: Course;
}

export function Students() {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<StudentInviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token || user?.role !== 'teacher') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const courses = await listCourses(token);
        const invitationGroups = await Promise.all(
          courses.map(async (course) => {
            const invitations = await listCourseInvitations(token, course.id);
            return invitations.map((invitation) => ({ ...invitation, course }));
          }),
        );
        if (!cancelled) {
          setRows(invitationGroups.flat());
          setError('');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được danh sách học sinh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return rows.filter((row) =>
      row.invitedEmail.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query) ||
      row.course?.code.toLowerCase().includes(query) ||
      row.course?.name.toLowerCase().includes(query)
    );
  }, [rows, search]);

  const accepted = rows.filter((row) => row.status === 'accepted').length;
  const pending = rows.filter((row) => row.status === 'pending').length;
  const declined = rows.filter((row) => row.status === 'declined').length;

  if (user?.role !== 'teacher') {
    return (
      <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">
        Màn hình học sinh hiện đang lấy từ invitation/enrollment workflow của giáo viên.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div><p className="text-[12px] text-muted-foreground">Đã accept</p><p className="text-[22px] font-bold">{accepted}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <div><p className="text-[12px] text-muted-foreground">Đang chờ</p><p className="text-[22px] font-bold">{pending}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <div><p className="text-[12px] text-muted-foreground">Từ chối</p><p className="text-[22px] font-bold">{declined}</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm email học sinh..." className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
        </div>
        <div className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-[13px] flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Mời học sinh trong màn hình khóa học/API
        </div>
      </div>

      {loading && <div className="bg-white border border-border rounded-xl p-6 text-[13px] text-muted-foreground">Đang tải invitation từ backend...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-[13px]">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                {['Học sinh', 'Khóa học', 'Email', 'Trạng thái', 'Thời gian mời'].map((h) => (
                  <th key={h} className="pb-3 pr-4 last:pr-0" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-[11px] text-navy" style={{ fontWeight: 600 }}>
                        {getInitials(row.invitedEmail)}
                      </div>
                      <div>
                        <p className="text-foreground" style={{ fontWeight: 500 }}>{row.invitedStudentId || 'Chưa có account/link ID'}</p>
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Invitation</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.course?.code ?? row.courseId} - {row.course?.name ?? ''}</td>
                  <td className="py-3 pr-4 text-muted-foreground"><span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {row.invitedEmail}</span></td>
                  <td className="py-3 pr-4"><StatusBadge status={row.status} /></td>
                  <td className="py-3 pr-4 text-muted-foreground">{new Date(row.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Chưa có invitation nào trong database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
