import { Users, UserCheck, Clock, UserX, AlertTriangle, Camera, Shield } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

function StatCard({ label, value, icon, color }: {
  label: string; value: string; icon: React.ReactNode; color: string;
}) {
  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-100' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl border ${c.border} shadow-sm p-5`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.icon}`}>{icon}</div>
      </div>
      <p className="text-gray-900 mb-0.5" style={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1 }}>{value}</p>
      <p className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>{label}</p>
    </div>
  );
}

export function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label={t('dashTotalStudents')} value="0" icon={<Users className="w-5 h-5" />} color="blue" />
        <StatCard label={t('dashPresentToday')} value="0" icon={<UserCheck className="w-5 h-5" />} color="green" />
        <StatCard label={t('dashLate')} value="0" icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard label={t('dashAbsent')} value="0" icon={<UserX className="w-5 h-5" />} color="red" />
      </div>

      <div className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2440 0%, #1e3a5f 60%, #1e40af 100%)' }}>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/60 text-[13px] mb-1" style={{ fontWeight: 500 }}>{t('dashRateToday')}</p>
            <p className="text-white" style={{ fontWeight: 800, fontSize: '3rem', lineHeight: 1.1 }}>0%</p>
            <p className="text-white/60 text-[13px] mt-2">Admin aggregation endpoint chưa có. Dashboard sẽ hiển thị dữ liệu thật khi có API tổng hợp.</p>
          </div>
          <Link to="/admin/attendance"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[14px] text-white transition-all backdrop-blur-sm"
            style={{ fontWeight: 600 }}>
            <Camera className="w-4 h-4" /> {t('dashCheckInNow')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-gray-600" />
            <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{t('dashSecurityAlerts')}</h3>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-[13px]">Chưa có backend cho security alerts. Sẽ nối với FaceID/audit_logs ở phase sau.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-gray-900 mb-3" style={{ fontWeight: 700 }}>{t('dashRecentLogs')}</h3>
          <p className="text-[13px] text-gray-500">Admin report tổng hợp chưa có endpoint riêng. Teacher report đã lấy dữ liệu thật trong trang Reports.</p>
        </div>
      </div>
    </div>
  );
}
