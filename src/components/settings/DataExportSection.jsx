import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Download, FileText, Table, BookOpen, Target, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportFinancePDF, exportTransactionsCSV, exportRamadanPDF, exportGoalsPDF, exportAllDataCSV } from '@/lib/exportService';

const EXPORTS = [
  { key: 'finance_pdf', en: 'Financial Summary (PDF)', ar: 'ملخص مالي (PDF)', icon: FileText },
  { key: 'transactions_csv', en: 'Transactions (Excel/CSV)', ar: 'المعاملات (Excel)', icon: Table },
  { key: 'ramadan_pdf', en: 'Ramadan Report (PDF)', ar: 'تقرير رمضان (PDF)', icon: BookOpen },
  { key: 'goals_pdf', en: 'Goals Report (PDF)', ar: 'تقرير الأهداف (PDF)', icon: Target },
  { key: 'all_csv', en: 'All My Data (Excel/CSV)', ar: 'جميع بياناتي (Excel)', icon: Database },
];

export default function DataExportSection() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const [loading, setLoading] = useState(null);
  const currSymbol = settings?.currency_symbol || 'ر.س';

  const handleExport = async (key) => {
    setLoading(key);
    try {
      if (key === 'finance_pdf') {
        const { getSnapshot } = await import('@/lib/financeService');
        const snapshot = await getSnapshot();
        exportFinancePDF(snapshot, currSymbol);
      } else if (key === 'transactions_csv') {
        const transactions = await base44.entities.Transaction.list('-date', 1000);
        exportTransactionsCSV(transactions, currSymbol);
      } else if (key === 'ramadan_pdf') {
        const logs = await base44.entities.RamadanLog.list('-date', 31);
        exportRamadanPDF(logs);
      } else if (key === 'goals_pdf') {
        const goals = await base44.entities.Goal.list('-created_date', 200);
        exportGoalsPDF(goals);
      } else if (key === 'all_csv') {
        const [transactions, goals, wellness] = await Promise.all([
          base44.entities.Transaction.list('-date', 1000),
          base44.entities.Goal.list('-created_date', 200),
          base44.entities.WellnessLog.list('-date', 365),
        ]);
        exportAllDataCSV({ transactions, goals, wellness });
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)' }}>
      <div className="px-5 py-4 border-b" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)' }}>
        <h3 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'تصدير البيانات' : 'Data Export'}
        </h3>
      </div>
      <div className="divide-y" style={{ divideColor: 'var(--mizan-border)' }}>
        {EXPORTS.map(({ key, en, ar, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between px-5 py-3.5" style={{ background: 'var(--mizan-elevated)' }}>
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
              <span className="text-sm" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? ar : en}</span>
            </div>
            <Button onClick={() => handleExport(key)} disabled={loading === key} size="sm" variant="outline"
              className="h-8 gap-1.5 text-xs rounded-lg"
              style={{ borderColor: 'var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}>
              <Download className="w-3.5 h-3.5" />
              {loading === key ? '...' : (language === 'ar' ? 'تصدير' : 'Export')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}