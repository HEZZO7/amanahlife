import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet } from 'lucide-react';

export default function DataExportSection() {
  const { t } = useI18n();

  const exports = [
    { label: t('settings.exportFinance'), icon: FileText },
    { label: t('settings.exportTransactions'), icon: FileSpreadsheet },
    { label: t('settings.exportRamadan'), icon: FileText },
    { label: t('settings.exportAll'), icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.dataExport')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {exports.map(({ label, icon: Icon }, i) => (
          <Button
            key={i}
            variant="outline"
            className="h-11 rounded-lg justify-start gap-2"
            style={{ borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
          >
            <Icon className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}