import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const EXPENSE_CATS = ['food', 'transport', 'housing', 'health', 'education', 'entertainment', 'clothing', 'utilities', 'charity', 'other'];
const INCOME_CATS = ['salary', 'freelance', 'investment', 'gift', 'other'];

export default function AddTransactionModal({ type, onClose, onSaved }) {
  const { t } = useI18n();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const handleSave = async () => {
    if (!amount || !category) return;
    setSaving(true);
    await base44.entities.Transaction.create({ type, amount: parseFloat(amount), category, description, date, is_halal_verified: true });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--mizan-text)' }}>
            {type === 'income' ? t('finance.addIncome') : t('finance.addExpense')}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: 'var(--mizan-text-secondary)' }} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.amount')}</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 h-12 text-lg font-bold rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} placeholder="0" autoFocus />
          </div>
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.category')}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {cats.map(c => (
                <button key={c} onClick={() => setCategory(c)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize" style={{ background: category === c ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)', color: category === c ? 'white' : 'var(--mizan-text-secondary)', border: `1px solid ${category === c ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.description')}</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} className="mt-1 h-10 rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
          </div>
          <div>
            <Label style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.date')}</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 h-10 rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
          </div>
        </div>
        <Button disabled={saving || !amount || !category} onClick={handleSave} className="w-full mt-5 h-12 rounded-xl text-white font-semibold" style={{ background: 'var(--mizan-emerald)' }}>
          {saving ? t('common.loading') : t('settings.save')}
        </Button>
      </div>
    </div>
  );
}