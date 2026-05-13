import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

const EXPENSE_CATS = ['food', 'transport', 'housing', 'health', 'education', 'clothing', 'entertainment', 'utilities', 'charity', 'other'];
const INCOME_CATS = ['salary', 'freelance', 'investment', 'rental', 'gift', 'other'];

function AddTxForm({ onSave, onCancel }) {
  const { language } = useI18n();
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), is_halal_verified: true });
  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const handleSave = async () => {
    if (!form.amount || !form.category) return;
    await base44.entities.Transaction.create({ ...form, amount: parseFloat(form.amount) });
    onSave();
  };

  return (
    <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'إضافة معاملة' : 'Add Transaction'}
        </span>
        <button onClick={onCancel}><X className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex gap-2 col-span-2">
          {['income', 'expense'].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: form.type === t ? 'var(--mizan-emerald)' : 'var(--mizan-border)', color: form.type === t ? 'white' : 'var(--mizan-text-secondary)' }}>
              {t === 'income' ? (language === 'ar' ? 'دخل' : 'Income') : (language === 'ar' ? 'مصروف' : 'Expense')}
            </button>
          ))}
        </div>
        <Input type="number" placeholder={language === 'ar' ? 'المبلغ' : 'Amount'} value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          className="h-10 rounded-lg" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
        <Input type="date" value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className="h-10 rounded-lg" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
        <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
          <SelectTrigger className="h-10 rounded-lg col-span-2" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
            <SelectValue placeholder={language === 'ar' ? 'الفئة' : 'Category'} />
          </SelectTrigger>
          <SelectContent>{cats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder={language === 'ar' ? 'وصف (اختياري)' : 'Description (optional)'} value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="h-10 rounded-lg col-span-2" style={{ background: 'var(--mizan-bg)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
      </div>
      <Button onClick={handleSave} className="mt-4 h-10 rounded-lg text-white w-full" style={{ background: 'var(--mizan-emerald)' }}>
        {language === 'ar' ? 'حفظ' : 'Save'}
      </Button>
    </div>
  );
}

export default function FinanceTransactions({ data, onReload }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const sym = settings?.currency_symbol || 'ر.س';

  const txns = data?.recentTransactions || [];
  const filtered = filter === 'all' ? txns : txns.filter(tx => tx.type === filter);

  const handleDelete = async (id) => {
    await base44.entities.Transaction.delete(id);
    onReload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          {['all', 'income', 'expense'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ background: filter === f ? 'var(--mizan-emerald)' : 'transparent', color: filter === f ? 'white' : 'var(--mizan-text-secondary)' }}>
              {f === 'all' ? (language === 'ar' ? 'الكل' : 'All') : f === 'income' ? (language === 'ar' ? 'دخل' : 'Income') : (language === 'ar' ? 'مصروف' : 'Expense')}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="h-9 rounded-lg text-white gap-1.5" style={{ background: 'var(--mizan-emerald)' }}>
          <Plus className="w-3.5 h-3.5" />
          {language === 'ar' ? 'إضافة' : 'Add'}
        </Button>
      </div>

      {showAdd && <AddTxForm onSave={() => { setShowAdd(false); onReload(); }} onCancel={() => setShowAdd(false)} />}

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)' }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'لا توجد معاملات' : 'No transactions'}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--mizan-border)' }}>
            {filtered.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--mizan-surface)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: tx.type === 'income' ? 'rgba(26,122,92,0.1)' : 'rgba(192,57,43,0.1)' }}>
                  {tx.type === 'income'
                    ? <TrendingUp className="w-4 h-4" style={{ color: 'var(--mizan-green)' }} />
                    : <TrendingDown className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--mizan-text)' }}>{tx.description || tx.category}</p>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{tx.category} · {tx.date}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: tx.type === 'income' ? 'var(--mizan-green)' : 'var(--mizan-red)' }}>
                  {tx.type === 'income' ? '+' : '-'}{sym} {Number(tx.amount).toLocaleString()}
                </span>
                <button onClick={() => handleDelete(tx.id)} className="ms-1">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.5 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}