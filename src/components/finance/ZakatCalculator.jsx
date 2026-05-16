import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format, parseISO } from 'date-fns';
import { Calculator, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ZAKAT_RATE = 0.025; // 2.5%

export default function ZakatCalculator() {
  const { t, language } = useI18n();
  const { settings } = useUserSettings();
  const [assets, setAssets] = useState({
    cash: 0,
    gold: 0,
    silver: 0,
    stocks: 0,
    property: 0,
    other: 0,
  });
  const [liabilities, setLiabilities] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const currSymbol = settings?.currency_symbol || 'ر.س';

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ZakatRecord.list('-calculation_date', 10);
      setRecords(data);
    } catch (err) {
      console.error('Load zakat records:', err);
    }
    setLoading(false);
  };

  const updateAsset = (key, value) => {
    setAssets(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
  const netAssets = totalAssets - liabilities;
  const zakatDue = netAssets > 0 ? netAssets * ZAKAT_RATE : 0;
  const nisabThreshold = 85 * 85; // تقريبي بالريال السعودي
  const isNisabMet = netAssets >= nisabThreshold;

  const handleSave = async () => {
    if (netAssets <= 0) {
      alert(language === 'ar' ? 'الأصول يجب أن تكون أكبر من الخصوم' : 'Assets must exceed liabilities');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.ZakatRecord.create({
        total_assets: totalAssets,
        liabilities,
        zakat_due: zakatDue,
        calculation_date: format(new Date(), 'yyyy-MM-dd'),
        paid_status: false,
      });
      setAssets({ cash: 0, gold: 0, silver: 0, stocks: 0, property: 0, other: 0 });
      setLiabilities(0);
      loadRecords();
    } catch (err) {
      console.error('Save zakat record:', err);
    }
    setSaving(false);
  };

  const markAsPaid = async (recordId) => {
    try {
      await base44.entities.ZakatRecord.update(recordId, {
        paid_status: true,
        paid_date: format(new Date(), 'yyyy-MM-dd'),
      });
      loadRecords();
    } catch (err) {
      console.error('Update zakat record:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Main Calculator */}
      <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h3 className="text-sm font-semibold mb-4 mizan-section-header flex items-center gap-2" style={{ color: 'var(--mizan-text)' }}>
          <Calculator className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          {language === 'ar' ? 'حساب الزكاة' : 'Zakat Calculator'}
        </h3>

        {/* Assets Section */}
        <div className="mb-5">
          <p className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الأصول' : 'Assets'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'cash', ar: 'النقد', en: 'Cash' },
              { key: 'gold', ar: 'الذهب', en: 'Gold' },
              { key: 'silver', ar: 'الفضة', en: 'Silver' },
              { key: 'stocks', ar: 'الأسهم', en: 'Stocks' },
              { key: 'property', ar: 'العقارات', en: 'Property' },
              { key: 'other', ar: 'أخرى', en: 'Other' },
            ].map(({ key, ar, en }) => (
              <div key={key}>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {language === 'ar' ? ar : en}
                </label>
                <input
                  type="number"
                  value={assets[key]}
                  onChange={e => updateAsset(key, e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities */}
        <div className="mb-5">
          <label className="text-xs font-semibold mb-1.5 block uppercase" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الخصوم والالتزامات' : 'Liabilities & Debts'}
          </label>
          <input
            type="number"
            value={liabilities}
            onChange={e => setLiabilities(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
          />
        </div>

        {/* Nisab Alert */}
        {netAssets > 0 && (
          <div className="flex items-start gap-3 mb-5 p-3 rounded-lg" style={{ background: isNisabMet ? 'var(--mizan-emerald)15' : '#ef444415', border: `1px solid ${isNisabMet ? 'var(--mizan-emerald)' : '#ef4444'}40` }}>
            {isNisabMet ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-emerald)' }} />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
            )}
            <div className="text-xs" style={{ color: isNisabMet ? 'var(--mizan-emerald)' : '#ef4444' }}>
              {isNisabMet
                ? (language === 'ar' ? 'تجب عليك الزكاة' : 'You are obligated to pay Zakat')
                : (language === 'ar' ? 'لم تصل إلى حد النصاب بعد' : 'Below the Nisab threshold')}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'إجمالي الأصول' : 'Total Assets'}
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>
              {currSymbol} {totalAssets.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'صافي الأصول' : 'Net Assets'}
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--mizan-gold)' }}>
              {currSymbol} {netAssets.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Zakat Due */}
        <div className="p-4 rounded-lg mb-5" style={{ background: 'var(--mizan-emerald)15', border: '1px solid var(--mizan-emerald)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الزكاة المستحقة' : 'Zakat Due'}
          </p>
          <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {currSymbol} {zakatDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? '(2.5% من صافي الأصول)' : '(2.5% of net assets)'}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || netAssets <= 0}
          className="w-full h-10 text-white rounded-lg font-medium"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {saving ? '...' : (language === 'ar' ? 'حفظ الحساب' : 'Save Calculation')}
        </Button>
      </div>

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm font-medium mb-3"
          style={{ color: 'var(--mizan-emerald)' }}
        >
          {language === 'ar' ? 'سجل الزكاة (' : 'Zakat History ('}{records.length}{')'}
        </button>

        {showHistory && (
          <div className="space-y-2">
            {records.length === 0 ? (
              <p className="text-xs p-4 text-center rounded-lg" style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text-secondary)' }}>
                {language === 'ar' ? 'لا توجد سجلات بعد' : 'No records yet'}
              </p>
            ) : (
              records.map(record => (
                <div key={record.id} className="p-3 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>
                        {format(parseISO(record.calculation_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                        {currSymbol} {record.zakat_due.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {record.paid_status ? (
                      <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--mizan-emerald)' }}>
                        {language === 'ar' ? 'مدفوعة' : 'Paid'}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsPaid(record.id)}
                        className="h-7 text-xs"
                      >
                        {language === 'ar' ? 'تم الدفع' : 'Mark Paid'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}