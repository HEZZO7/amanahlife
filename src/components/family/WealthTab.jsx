import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function WealthTab({ familyId, members, userMap }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [wealths, setWealths] = useState({});
  const [mahrs, setMahrs] = useState([]);
  const [wasiyyah, setWasiyyah] = useState('');
  const [showMahrForm, setShowMahrForm] = useState(false);
  const [mahrForm, setMahrForm] = useState({ amount: '', currency: settings?.currency || 'SAR', is_paid: false, notes: '' });
  const [savingWealths, setSavingWealths] = useState({});
  const currSymbol = settings?.currency_symbol || 'ر.س';

  const load = async () => {
    setLoading(true);
    try {
      const [txns, mhr, savedWealths] = await Promise.all([
        base44.entities.Transaction.list('-date', 500),
        base44.entities.MahrRecord.filter({ family_id: familyId }),
        base44.entities.FamilyWealth.filter({ family_id: familyId }),
      ]);
      setTransactions(txns);
      setMahrs(mhr);
      const wealthMap = {};
      savedWealths.forEach(w => { wealthMap[w.member_id] = w; });
      setWealths(wealthMap);
    } catch (e) {
      console.error('Wealth load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [familyId]);

  // Calculate family financials
  const thisMonth = format(new Date(), 'yyyy-MM');
  const monthTransactions = transactions.filter(t => t.date?.startsWith(thisMonth));
  const combinedIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const combinedExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const savingsRate = combinedIncome > 0 ? Math.round(((combinedIncome - combinedExpenses) / combinedIncome) * 100) : 0;

  // Calculate family net worth
  let familyAssets = 0;
  let familyLiabilities = 0;
  members.forEach(m => {
    const w = wealths[m.user_id];
    if (w) {
      familyAssets += (w.cash_savings || 0) + (w.property_value || 0) + (w.investments || 0) + (w.other_assets || 0);
      familyLiabilities += w.liabilities || 0;
    }
  });
  const familyNetWorth = familyAssets - familyLiabilities;

  const saveMahrRecord = async () => {
    if (!mahrForm.amount) return;
    await base44.entities.MahrRecord.create({ ...mahrForm, family_id: familyId, amount: parseFloat(mahrForm.amount) });
    setMahrForm({ amount: '', currency: settings?.currency || 'SAR', is_paid: false, notes: '' });
    setShowMahrForm(false);
    load();
  };

  const deleteMahrRecord = async (id) => {
    await base44.entities.MahrRecord.delete(id);
    load();
  };

  const updateWealth = async (memberId, field, value) => {
    setSavingWealths(s => ({ ...s, [memberId]: true }));
    const existing = wealths[memberId];
    if (existing) {
      await base44.entities.FamilyWealth.update(existing.id, { [field]: parseFloat(value) || 0 });
    } else {
      await base44.entities.FamilyWealth.create({ family_id: familyId, member_id: memberId, [field]: parseFloat(value) || 0 });
    }
    setSavingWealths(s => ({ ...s, [memberId]: false }));
    load();
  };

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      {/* Financial Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Combined Income */}
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الدخل المجمع' : 'Combined Income'}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {currSymbol} {combinedIncome.toLocaleString()}
          </p>
        </div>

        {/* Shared Expenses */}
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'النفقات المشتركة' : 'Shared Expenses'}
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--mizan-red)' }}>
            {currSymbol} {combinedExpenses.toLocaleString()}
          </p>
        </div>

        {/* Savings Rate */}
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'معدل الادخار' : 'Savings Rate'}
          </p>
          <div className="flex justify-center mb-1">
            <svg className="w-12 h-12" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="none" stroke="var(--mizan-border)" strokeWidth="3" />
              <circle
                cx="30" cy="30" r="25" fill="none" stroke="var(--mizan-emerald)" strokeWidth="3"
                strokeDasharray={`${(savingsRate / 100) * 2 * Math.PI * 25} ${2 * Math.PI * 25}`}
                strokeLinecap="round" transform="rotate(-90 30 30)"
              />
              <text x="30" y="35" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--mizan-emerald)">
                {savingsRate}%
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Family Net Worth Section */}
      <div className="rounded-xl p-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'صافي الثروة العائلية' : 'Family Net Worth'}
        </h3>

        <div className="space-y-4 mb-6">
          {members.map(m => {
            const w = wealths[m.user_id] || {};
            const assets = (w.cash_savings || 0) + (w.property_value || 0) + (w.investments || 0) + (w.other_assets || 0);
            const netWorth = assets - (w.liabilities || 0);
            const isSaving = savingWealths[m.user_id];

            return (
              <div key={m.user_id} className="p-4 rounded-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {userMap[m.user_id] || 'Member'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <WealthInput label={language === 'ar' ? 'النقد والمدخرات' : 'Cash & Savings'} value={w.cash_savings || ''} 
                    onChange={v => updateWealth(m.user_id, 'cash_savings', v)} disabled={isSaving} />
                  <WealthInput label={language === 'ar' ? 'قيمة الممتلكات' : 'Property Value'} value={w.property_value || ''} 
                    onChange={v => updateWealth(m.user_id, 'property_value', v)} disabled={isSaving} />
                  <WealthInput label={language === 'ar' ? 'الاستثمارات' : 'Investments'} value={w.investments || ''} 
                    onChange={v => updateWealth(m.user_id, 'investments', v)} disabled={isSaving} />
                  <WealthInput label={language === 'ar' ? 'أصول أخرى' : 'Other Assets'} value={w.other_assets || ''} 
                    onChange={v => updateWealth(m.user_id, 'other_assets', v)} disabled={isSaving} />
                </div>

                <WealthInput label={language === 'ar' ? 'الالتزامات' : 'Liabilities'} value={w.liabilities || ''} 
                  onChange={v => updateWealth(m.user_id, 'liabilities', v)} disabled={isSaving} fullWidth />

                <div className="mt-3 p-2 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {language === 'ar' ? 'صافي الثروة' : 'Net Worth'}
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--mizan-gold)' }}>
                    {currSymbol} {netWorth.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Family Net Worth */}
        <div className="p-4 rounded-lg" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
          <p className="text-xs font-semibold mb-1 opacity-90">
            {language === 'ar' ? 'إجمالي صافي الثروة العائلية' : 'Total Family Net Worth'}
          </p>
          <p className="text-2xl font-bold">
            {currSymbol} {familyNetWorth.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Mahr Tracker */}
      <div className="rounded-xl p-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'المهر' : 'Mahr'}
          </h3>
          <Button size="sm" onClick={() => setShowMahrForm(!showMahrForm)} className="h-8 px-2 text-xs text-white" style={{ background: 'var(--mizan-emerald)' }}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        {showMahrForm && (
          <div className="space-y-3 mb-4 p-3 rounded-lg" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
            <input type="number" placeholder={language === 'ar' ? 'المبلغ' : 'Amount'} 
              value={mahrForm.amount} onChange={e => setMahrForm({...mahrForm, amount: e.target.value})} 
              className="w-full p-2 rounded-lg text-sm" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
            <textarea placeholder={language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'} 
              value={mahrForm.notes} onChange={e => setMahrForm({...mahrForm, notes: e.target.value})} 
              className="w-full p-2 rounded-lg text-sm h-20 resize-none" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="paid" checked={mahrForm.is_paid} onChange={e => setMahrForm({...mahrForm, is_paid: e.target.checked})} />
              <label htmlFor="paid" className="text-xs" style={{ color: 'var(--mizan-text)' }}>
                {language === 'ar' ? 'تم الدفع' : 'Paid'}
              </label>
            </div>
            <Button onClick={saveMahrRecord} className="w-full h-9 text-white rounded-lg text-sm" style={{ background: 'var(--mizan-emerald)' }}>
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        )}

        {mahrs.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'لا توجد سجلات مهر' : 'No mahr records yet'}
          </p>
        ) : (
          mahrs.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg mb-2" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
                  {m.currency} {m.amount.toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: m.is_paid ? 'var(--mizan-green)' : 'var(--mizan-text-secondary)' }}>
                  {m.is_paid ? (language === 'ar' ? '✓ مدفوع' : '✓ Paid') : (language === 'ar' ? '⧗ قيد الانتظار' : '⧗ Pending')}
                </p>
                {m.notes && <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>{m.notes}</p>}
              </div>
              <button onClick={() => deleteMahrRecord(m.id)} className="p-1">
                <Trash2 className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Wasiyyah Notes */}
      <div className="rounded-xl p-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'ملاحظات الوصية' : 'Wasiyyah Notes'}
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'ملاحظات استشارية فقط - ليس وثيقة قانونية' : 'Advisory notes only — not a legal document'}
        </p>
        <textarea value={wasiyyah} onChange={e => setWasiyyah(e.target.value)} 
          placeholder={language === 'ar' ? 'سجل نياتك وملاحظاتك المهمة...' : 'Record your intentions and important notes...'} 
          className="w-full h-32 p-3 rounded-lg resize-none text-sm" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
      </div>
    </div>
  );
}

function WealthInput({ label, value, onChange, disabled, fullWidth }) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className="w-full p-2 rounded-lg text-sm" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
    </div>
  );
}