import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, AlertTriangle } from 'lucide-react';

const CATS = ['food', 'transport', 'housing', 'health', 'education', 'clothing', 'entertainment', 'utilities', 'charity', 'other'];

export default function FinanceBudget({ data, month, onReload }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const sym = settings?.currency_symbol || 'ر.س';
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: '', limit_amount: '' });

  const budgetStatus = data?.budgetStatus || [];

  const handleAdd = async () => {
    if (!form.category || !form.limit_amount) return;
    await base44.entities.Budget.create({ month, category: form.category, limit_amount: parseFloat(form.limit_amount) });
    setForm({ category: '', limit_amount: '' });
    setShowAdd(false);
    onReload();
  };

  const handleDelete = async (id) => {
    await base44.entities.Budget.delete(id);
    onReload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAdd(true)} className="h-9 rounded-lg text-white gap-1.5" style={{ background: 'var(--mizan-emerald)' }}>
          <Plus className="w-3.5 h-3.5" />
          {language === 'ar' ? 'إضافة ميزانية' : 'Add Budget'}
        </Button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? 'فئة جديدة' : 'New Budget'}</span>
            <button onClick={() => setShowAdd(false)}><X className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger className="h-10 rounded-lg" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
                <SelectValue placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
              </SelectTrigger>
              <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" placeholder={language === 'ar' ? 'الحد الأقصى' : 'Limit'} value={form.limit_amount}
              onChange={e => setForm(f => ({ ...f, limit_amount: e.target.value }))}
              className="h-10 rounded-lg" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
          </div>
          <Button onClick={handleAdd} className="mt-3 h-9 w-full rounded-lg text-white" style={{ background: 'var(--mizan-emerald)' }}>
            {language === 'ar' ? 'حفظ' : 'Save'}
          </Button>
        </div>
      )}

      {budgetStatus.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'لا توجد ميزانيات. أضف ميزانية لمتابعة إنفاقك.' : 'No budgets yet. Add one to track your spending.'}
        </div>
      ) : (
        <div className="space-y-3">
          {budgetStatus.map((b, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: `1px solid ${b.over ? 'var(--mizan-red)' : 'var(--mizan-border)'}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {b.over && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--mizan-red)' }} />}
                  <span className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{b.category}</span>
                </div>
                <span className="text-xs" style={{ color: b.over ? 'var(--mizan-red)' : 'var(--mizan-text-secondary)' }}>
                  {sym} {Number(b.spent).toLocaleString()} / {sym} {Number(b.limit).toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--mizan-border)' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(100, b.percent)}%`, background: b.over ? 'var(--mizan-red)' : b.percent > 80 ? 'var(--mizan-gold)' : 'var(--mizan-emerald)' }} />
              </div>
              <p className="text-[11px] mt-1 text-right" style={{ color: b.over ? 'var(--mizan-red)' : 'var(--mizan-text-secondary)' }}>{b.percent}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}