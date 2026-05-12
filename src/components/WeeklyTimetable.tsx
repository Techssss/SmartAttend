import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TimetableCourse } from '../services/smartAttendApi';

const days = [
  { label: 'HAI', dbDay: 1 },
  { label: 'BA', dbDay: 2 },
  { label: 'TƯ', dbDay: 3 },
  { label: 'NĂM', dbDay: 4 },
  { label: 'SÁU', dbDay: 5 },
  { label: 'BẢY', dbDay: 6 },
  { label: 'CN', dbDay: 7 },
];

const periods = [
  { label: 'TIẾT 1', start: '07:00', end: '07:50' },
  { label: 'TIẾT 2', start: '07:50', end: '08:40' },
  { label: 'TIẾT 3', start: '08:50', end: '09:40' },
  { label: 'TIẾT 4', start: '09:40', end: '10:30' },
  { label: 'TIẾT 5', start: '10:40', end: '11:30' },
  { label: 'TIẾT 6', start: '13:00', end: '13:50' },
  { label: 'TIẾT 7', start: '13:50', end: '14:40' },
  { label: 'TIẾT 8', start: '14:50', end: '15:40' },
  { label: 'TIẾT 9', start: '15:40', end: '16:30' },
  { label: 'TIẾT 10', start: '16:40', end: '17:30' },
];

const colors = [
  'bg-slate-700',
  'bg-emerald-800',
  'bg-lime-900',
  'bg-rose-900',
  'bg-indigo-800',
  'bg-teal-800',
  'bg-amber-800',
  'bg-violet-800',
];

interface WeeklyTimetableProps {
  courses: TimetableCourse[];
  loading?: boolean;
  title?: string;
  emptyMessage?: string;
}

export function WeeklyTimetable({
  courses,
  loading = false,
  title = 'Thời khóa biểu theo tuần',
  emptyMessage = 'Tuần này chưa có buổi học nào trong thời hạn lớp.',
}: WeeklyTimetableProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = addDays(weekStart, 6);

  const range = useMemo(() => getCourseRange(courses), [courses]);
  const entries = useMemo(() => buildEntries(courses, weekStart), [courses, weekStart]);
  const todayKey = toDateKey(new Date());

  const canGoPrev = range ? addDays(weekStart, -7) <= range.maxEnd && addDays(weekStart, -1) >= range.minStart : true;
  const canGoNext = range ? addDays(weekStart, 7) <= range.maxEnd && addDays(weekStart, 13) >= range.minStart : true;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{title}</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            aria-label="Tuần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="h-9 px-3 rounded-lg border border-gray-200 text-[12px] text-gray-700 hover:bg-gray-50"
          >
            Tuần này
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            aria-label="Tuần sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '64px repeat(7, minmax(120px, 1fr))' }}>
            <div className="bg-gray-50" />
            {days.map((day, index) => {
              const date = addDays(weekStart, index);
              const isToday = toDateKey(date) === todayKey;
              return (
                <div key={day.dbDay} className={`py-3 text-center border-l border-gray-200 ${isToday ? 'bg-lime-50' : 'bg-gray-50'}`}>
                  <p className="text-[12px] text-slate-500" style={{ fontWeight: 800 }}>{day.label}</p>
                  <p className="text-[13px] text-slate-500" style={{ fontWeight: 700 }}>{formatDate(date)}</p>
                </div>
              );
            })}
          </div>

          <div className="grid relative" style={{ gridTemplateColumns: '64px repeat(7, minmax(120px, 1fr))' }}>
            <div className="grid" style={{ gridTemplateRows: `repeat(${periods.length}, 48px)` }}>
              {periods.map((period) => (
                <div key={period.label} className="border-b border-gray-200 bg-gray-50 flex items-center justify-center px-2 text-center">
                  <span className="text-[12px] text-slate-500" style={{ fontWeight: 800 }}>{period.label}</span>
                </div>
              ))}
            </div>

            {days.map((day, index) => {
              const date = addDays(weekStart, index);
              const isToday = toDateKey(date) === todayKey;
              return (
                <div
                  key={day.dbDay}
                  className={`relative border-l border-gray-200 ${isToday ? 'bg-lime-50/60' : 'bg-white'}`}
                  style={{ display: 'grid', gridTemplateRows: `repeat(${periods.length}, 48px)` }}
                >
                  {periods.map((period) => (
                    <div key={period.label} className="border-b border-gray-200" />
                  ))}
                  {entries
                    .filter((entry) => entry.dayIndex === index)
                    .map((entry) => (
                      <div
                        key={`${entry.course.courseId}-${entry.schedule.scheduleId}-${entry.dayIndex}`}
                        className={`absolute left-0.5 right-0.5 rounded-sm ${entry.color} text-white shadow-md px-3 py-2 flex flex-col items-center justify-center text-center`}
                        style={{
                          top: `${entry.startRow * 48}px`,
                          height: `${Math.max(entry.rowSpan * 48, 44)}px`,
                        }}
                        title={`${entry.course.courseName} (${entry.schedule.startTime}-${entry.schedule.endTime})`}
                      >
                        <p className="text-[14px] leading-tight" style={{ fontWeight: 800 }}>{entry.course.courseName}</p>
                        <p className="text-[12px] mt-1 opacity-90" style={{ fontWeight: 700 }}>{entry.schedule.room || entry.course.room || 'Chưa có phòng'}</p>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!loading && !entries.length && (
        <div className="px-6 py-5 text-[13px] text-gray-400 border-t border-gray-100">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

function buildEntries(courses: TimetableCourse[], weekStart: Date) {
  return courses.flatMap((course, courseIndex) => {
    const startDate = parseDate(course.startDate);
    const endDate = parseDate(course.endDate);
    return course.schedules.flatMap((schedule) => {
      const dayIndex = schedule.dayOfWeek - 1;
      const occurrenceDate = addDays(weekStart, dayIndex);
      if (occurrenceDate < startDate || occurrenceDate > endDate) return [];

      const startRow = findStartPeriod(schedule.startTime);
      const endRow = findEndPeriod(schedule.endTime);
      return [{
        course,
        schedule,
        dayIndex,
        startRow,
        rowSpan: Math.max(endRow - startRow, 1),
        color: colors[courseIndex % colors.length],
      }];
    });
  });
}

function getCourseRange(courses: TimetableCourse[]) {
  if (!courses.length) return null;
  const starts = courses.map((course) => parseDate(course.startDate).getTime());
  const ends = courses.map((course) => parseDate(course.endDate).getTime());
  return {
    minStart: new Date(Math.min(...starts)),
    maxEnd: new Date(Math.max(...ends)),
  };
}

function findStartPeriod(time: string) {
  const value = toMinutes(time);
  const index = periods.findIndex((period) => value < toMinutes(period.end));
  return index === -1 ? periods.length - 1 : Math.max(index, 0);
}

function findEndPeriod(time: string) {
  const value = toMinutes(time);
  const index = periods.findIndex((period) => value <= toMinutes(period.end));
  return index === -1 ? periods.length : Math.min(index + 1, periods.length);
}

function toMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  return next;
}

function addDays(date: Date, daysToAdd: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + daysToAdd);
  return next;
}

function parseDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
