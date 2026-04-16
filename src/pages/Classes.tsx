import { useState } from 'react';
import { Card } from '../components/Card';
import { Users, Clock, Camera, ChevronRight, Search } from 'lucide-react';

const classesData = [
  { id: 'CS-301', name: 'Khoa học Máy tính 301', instructor: 'TS. Nguyễn Minh Tuấn', students: 35, present: 30, late: 3, absent: 2, schedule: 'T2, T4 08:00–09:30', room: 'Phòng 201' },
  { id: 'ENG-201', name: 'Văn học Anh 201', instructor: 'GS. Trần Thị Mai', students: 28, present: 25, late: 1, absent: 2, schedule: 'T3, T5 10:00–11:30', room: 'Phòng 305' },
  { id: 'BUS-101', name: 'Quản trị Kinh doanh 101', instructor: 'TS. Lê Văn Phúc', students: 42, present: 38, late: 2, absent: 2, schedule: 'T2, T4 14:00–15:30', room: 'Hội trường A' },
  { id: 'MATH-202', name: 'Toán học Nâng cao 202', instructor: 'TS. Phạm Thị Hương', students: 30, present: 26, late: 2, absent: 2, schedule: 'T3, T5 08:00–09:30', room: 'Phòng 102' },
  { id: 'PHY-301', name: 'Thực hành Vật lý 301', instructor: 'TS. Vũ Quang Khải', students: 24, present: 22, late: 1, absent: 1, schedule: 'T4, T6 13:00–15:00', room: 'Phòng Lab B' },
  { id: 'ART-101', name: 'Nhập môn Mỹ thuật 101', instructor: 'ThS. Hoàng Thị Lan', students: 20, present: 18, late: 0, absent: 2, schedule: 'T6 10:00–12:00', room: 'Xưởng 1' },
];

export function Classes() {
  const [search, setSearch] = useState('');
  const filtered = classesData.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm lớp học..."
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <button className="px-4 py-2 bg-navy text-white rounded-lg text-[13px] hover:bg-navy-light transition-colors" style={{ fontWeight: 500 }}>
          + Thêm lớp học
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(cls => {
          const rate = Math.round((cls.present / cls.students) * 100);
          return (
            <div key={cls.id} className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[11px] text-navy bg-blue-50 px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>{cls.id}</span>
                    <h3 className="text-[15px] text-foreground mt-1.5" style={{ fontWeight: 600 }}>{cls.name}</h3>
                    <p className="text-[12px] text-muted-foreground">{cls.instructor}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>

                <div className="flex items-center gap-4 text-[12px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {cls.students}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {cls.schedule}</span>
                </div>

                {/* Attendance bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-muted-foreground">Điểm danh hôm nay</span>
                    <span className="text-foreground" style={{ fontWeight: 600 }}>{rate}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="bg-green-500 h-full" style={{ width: `${(cls.present / cls.students) * 100}%` }} />
                    <div className="bg-amber-400 h-full" style={{ width: `${(cls.late / cls.students) * 100}%` }} />
                    <div className="bg-red-400 h-full" style={{ width: `${(cls.absent / cls.students) * 100}%` }} />
                  </div>
                  <div className="flex gap-4 mt-1.5 text-[11px]">
                    <span className="text-green-600">{cls.present} Có mặt</span>
                    <span className="text-amber-600">{cls.late} Muộn</span>
                    <span className="text-red-600">{cls.absent} Vắng</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-border px-5 py-3 flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">{cls.room}</span>
                <button className="flex items-center gap-1.5 text-[12px] text-navy hover:text-navy-light transition-colors" style={{ fontWeight: 500 }}>
                  <Camera className="w-3.5 h-3.5" /> Điểm danh
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}