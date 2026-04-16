import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ScanFace, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';

const studentsData = [
  { id: 'STU001', name: 'Nguyễn Văn An', class: 'CS-301', email: 'an.nv@uni.edu.vn', faceStatus: 'registered' as const, role: 'Học viên' },
  { id: 'STU002', name: 'Trần Thị Bảo', class: 'CS-301', email: 'bao.tt@uni.edu.vn', faceStatus: 'registered' as const, role: 'Học viên' },
  { id: 'STU003', name: 'Lê Hoàng Cường', class: 'ENG-201', email: 'cuong.lh@uni.edu.vn', faceStatus: 'registered' as const, role: 'Học viên' },
  { id: 'STU004', name: 'Phạm Thị Dung', class: 'CS-301', email: 'dung.pt@uni.edu.vn', faceStatus: 'pending' as const, role: 'Học viên' },
  { id: 'STU005', name: 'Hoàng Minh Đức', class: 'ENG-201', email: 'duc.hm@uni.edu.vn', faceStatus: 'registered' as const, role: 'Học viên' },
  { id: 'STU006', name: 'Vũ Thị Hoa', class: 'BUS-101', email: 'hoa.vt@uni.edu.vn', faceStatus: 'registered' as const, role: 'Học viên' },
  { id: 'STU007', name: 'Đặng Quốc Khánh', class: 'MATH-202', email: 'khanh.dq@uni.edu.vn', faceStatus: 'pending' as const, role: 'Học viên' },
  { id: 'STU008', name: 'Trần Thị Ngọc', class: 'PHY-301', email: 'ngoc.tt@uni.edu.vn', faceStatus: 'registered' as const, role: 'Học viên' },
];

export function Students() {
  const [search, setSearch] = useState('');
  const filtered = studentsData.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm học viên..." className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20" />
        </div>
        <button className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] hover:bg-navy-light transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Thêm học viên
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                {['Học viên', 'Mã số', 'Lớp', 'Email', 'Trạng thái khuôn mặt', 'Thao tác'].map(h => (
                  <th key={h} className="pb-3 pr-4 last:pr-0 last:text-right" style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-[11px] text-navy" style={{ fontWeight: 600 }}>
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-foreground" style={{ fontWeight: 500 }}>{s.name}</p>
                        <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{s.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.id}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.class}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.email}</td>
                  <td className="py-3 pr-4"><StatusBadge status={s.faceStatus} /></td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Đăng ký khuôn mặt">
                        <ScanFace className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Chỉnh sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-[12px] text-muted-foreground">Hiển thị {filtered.length} trong {studentsData.length} học viên</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <button className="w-7 h-7 rounded-md bg-navy text-white text-[12px]" style={{ fontWeight: 500 }}>1</button>
            <button className="w-7 h-7 rounded-md hover:bg-muted text-muted-foreground text-[12px]">2</button>
            <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </Card>
    </div>
  );
}