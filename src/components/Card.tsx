import { ReactNode } from 'react';

export function Card({ title, action, children, className = '' }: {
  title?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-border shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-[14px] text-foreground" style={{ fontWeight: 600 }}>{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function SummaryCard({ label, value, change, icon, color }: {
  label: string; value: string | number; change?: string; icon: ReactNode; color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] text-muted-foreground" style={{ fontWeight: 500 }}>{label}</p>
          <p className="text-[28px] text-foreground mt-1" style={{ fontWeight: 700 }}>{value}</p>
          {change && <p className="text-[12px] text-green-600 mt-1" style={{ fontWeight: 500 }}>{change}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
