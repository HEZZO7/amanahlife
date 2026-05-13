import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BudgetTracker({ snapshot, month, onRefresh }) {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const currSymbol = settings?.currency_symbol || 'ر.س';
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const handleAdd = async () => {
    if (!newCategory.trim() || !newLimit) return;
    await base44.entities.Budget.create({ month, category: newCategory.trim(), limit_amount: parseFloat(newLimit) });
    setAdding(false); setNewCategory(''); setNewLimit('');
    onRefresh();
  };

  const budgets = snapshot?.budgetUsage || [];

  return (
    <div className="space-y-4">
      {budgets.length === 0 && !adding ? (
        <div className="text-center py-10 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.noBudgets')}</p>
          <Button size="sm" className="text-white h-9 rounded-lg gap-1.5" style={{ background: 'var(--mizan-emerald)' }} onClick={() => setAdding(true)}>
            <Plus className="w-3.5 h-3.5" />{t('finance.addBudget')}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {budgets.map((b, i) => {
              const pct = Math.min(b.percent, 100);
              const over = b.percent > 100;
              return (
                <div key={i} className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: `1px solid ${over ? 'var(--mizan-red)' : 'var(--mizan-border)'}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {over && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--mizan-red)' }} />}
                      <span className="text-sm font-medium capitalize" style={{ color: 'var(--mizan-text)' }}>{b.category}</span>
                    </div>
                    <span className="text-xs" style={{ color: over ? 'var(--mizan-red)' : 'var(--mizan-text-secondary)' }}>
                      {currSymbol} {b.spent.toLocaleString()} / {b.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--mizan-border)' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: over ? 'var(--mizan-red)' : pct > 80 ? 'var(--mizan-gold)' : 'var(--mizan-emerald)' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>{b.percent.toFixed(0)}% {t('finance.used')}</p>
                </div>
              );
            })}
          </div>
          {!adding ? (
            <Button size="sm" variant="outline" className="h-9 rounded-lg gap-1.5" style={{ borderColor: 'var(--mizan-emerald)', color: 'var(--mizan-emerald)' }} onClick={() => setAdding(true)}>
              <Plus className="w-3.5 h-3.5" />{t('finance.addBudget')}
            </Button>
          ) : (
            <div className="flex gap-2 items-center p-3 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <Input placeholder={t('finance.category')} value={newCategory} onChange={e => setNewCategory(e.target.value)} className="h-9 text-sm rounded-lg flex-1" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
              <Input placeholder={t('finance.limit')} type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} className="h-9 text-sm rounded-lg w-28" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} />
              <Button size="sm" className="h-9 text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }} onClick={handleAdd}>{t('common.add')}</Button>
              <Button size="sm" variant="ghost" className="h-9" onClick={() => setAdding(false)}>{t('common.cancel')}</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}