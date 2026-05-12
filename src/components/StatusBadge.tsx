import { useLanguage } from '../context/LanguageContext';
import type { AttendanceStatus, FaceEnrollmentStatus } from '../data/attendance';

type BadgeStatus = AttendanceStatus | FaceEnrollmentStatus | 'success' | 'failed' | 'accepted' | 'declined' | 'cancelled' | 'expired' | 'active' | 'archived' | 'draft' | 'rejected';

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const { t } = useLanguage();

  const styles: Record<string, string> = {
    present: 'bg-green-50 text-green-700 border-green-200',
    late: 'bg-amber-50 text-amber-700 border-amber-200',
    absent: 'bg-red-50 text-red-700 border-red-200',
    registered: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    accepted: 'bg-green-50 text-green-700 border-green-200',
    declined: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
    expired: 'bg-gray-50 text-gray-600 border-gray-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    archived: 'bg-gray-50 text-gray-600 border-gray-200',
    draft: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  const labelMap: Record<string, string> = {
    present: t('statusPresent'),
    late: t('statusLate'),
    absent: t('statusAbsent'),
    registered: t('statusRegistered'),
    pending: t('statusPending'),
    success: t('statusSuccess'),
    failed: t('statusFailed'),
    accepted: 'Đã accept',
    declined: 'Đã từ chối',
    cancelled: 'Đã hủy',
    expired: 'Hết hạn',
    active: 'Active',
    archived: 'Archived',
    draft: 'Draft',
    rejected: 'Rejected',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] border ${styles[status]}`} style={{ fontWeight: 500 }}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        ['present', 'registered', 'success', 'accepted', 'active'].includes(status) ? 'bg-green-500' :
        ['late', 'pending', 'draft'].includes(status) ? 'bg-amber-500' :
        ['cancelled', 'expired', 'archived'].includes(status) ? 'bg-gray-500' : 'bg-red-500'
      }`} />
      {labelMap[status] || status}
    </span>
  );
}
