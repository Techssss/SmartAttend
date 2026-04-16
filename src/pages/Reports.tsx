import { useState } from 'react';
import { Card, SummaryCard } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Download, FileSpreadsheet, FileText, Filter, Users, UserCheck, Clock, UserX } from 'lucide-react';

const reportData = [
  { date: '08/04/2026', student: 'Nguyễn Văn An', id: 'STU001', class: 'CS-301', time: '08:02', status: 'present' as const },
  { date: '08/04/2026', student: 'Trần Thị Bảo', id: 'STU002', class: 'CS-301', time: '08:15', status: 'late' as const },
  { date: '08/04/2026', student: 'Lê Hoàng Cường', id: 'STU003', class: 'ENG-201', time: '08:00', status: 'present' as const },
  { date: '08/04/2026', student: 'Phạm Thị Dung', id: 'STU004', class: 'CS-301', time: '--', status: 'absent' as const },
  { date: '07/04/2026', student: 'Hoàng Minh Đức', id: 'STU005', class: 'ENG-201', time: '08:04', status: 'present' as const },
  { date: '07/04/2026', student: 'Vũ Thị Hoa', id: 'STU006', class: 'BUS-101', time: '08:18', status: 'late' as const },
  { date: '07/04/2026', student: 'Nguyễn Văn An', id: 'STU001', class: 'CS-301', time: '07:58', status: 'present' as const },
  { date: '07/04/2026', student: 'Trần Thị Ngọc', id: 'STU008', class: 'PHY-301', time: '--', status: 'absent' as const },
];

export function Reports() {
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-08');
  const [classFilter, setClassFilter] = useState('all');

  const filtered = reportData.filter(r => classFilter === 'all' || r.class === classFilter);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard label="Tổng hồ sơ" value="856" icon={<Users className="w-5 h-5" />} color="blue" />
        <SummaryCard label="Có mặt" value="742" change="86,7%" icon={<UserCheck className="w-5 h-5" />} color="green" />
        <SummaryCard label="Muộn" value="58" icon={<Clock className="w-5 h-5" />} color="amber" />
        <SummaryCard label="Vắng mặt" value="56" icon={<UserX className="w-5 h-5" />} color="red" />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div>
            <label className="block text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Từ ngày</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <div>
            <label className="block text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Đến ngày</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
          </div>
          <div>
            <label className="block text-[12px] text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Lớp học</label>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="px-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20">
              <option value="all">Tất cả lớp</option>
              <option value="CS-301">CS-301</option>
              <option value="ENG-201">ENG-201</option>
              <option value="BUS-101">BUS-101</option>
              <option value="MATH-202">MATH-202</option>
              <option value="PHY-301">PHY-301</option>
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

      {/* Table */}
      <Card title="Hồ sơ điểm danh" action={<span className="text-[12px] text-muted-foreground">{filtered.length} hồ sơ</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                {['Ngày', 'Học viên', 'Mã số', 'Lớp', 'Giờ vào', 'Trạng thái'].map(h => (
                  <th key={h} className="pb-3 pr-4" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.date}</td>
                  <td className="py-2.5 pr-4" style={{ fontWeight: 500 }}>{r.student}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.id}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.class}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{r.time}</td>
                  <td className="py-2.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}