import { useLanguage } from '../context/LanguageContext';

export function StatusBadge({ status }: { status: 'present' | 'late' | 'absent' | 'registered' | 'pending' | 'success' | 'failed' }) {
  const { t } = useLanguage();

  const styles: Record<string, string> = {
    present: 'bg-green-50 text-green-700 border-green-200',
    late: 'bg-amber-50 text-amber-700 border-amber-200',
    absent: 'bg-red-50 text-red-700 border-red-200',
    registered: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };

  const labelMap: Record<string, string> = {
    present: t('statusPresent'),
    late: t('statusLate'),
    absent: t('statusAbsent'),
    registered: t('statusRegistered'),
    pending: t('statusPending'),
    success: t('statusSuccess'),
    failed: t('statusFailed'),
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] border ${styles[status]}`} style={{ fontWeight: 500 }}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        ['present', 'registered', 'success'].includes(status) ? 'bg-green-500' :
        ['late', 'pending'].includes(status) ? 'bg-amber-500' : 'bg-red-500'
      }`} />
      {labelMap[status] || status}
    </span>
  );
}
