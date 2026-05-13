import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionsList({ snapshot, onRefresh }) {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const currSymbol = settings?.currency_symbol || 'ر.س';
  const [filter, setFilter] = useState('all');

  const txns = snapshot?.allMonthTransactions || [];
  const filtered = filter === 'all' ? txns : txns.filter(tx => tx.type === filter);

  const handleDelete = async (id) => {
    await base44.entities.Transaction.delete(id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'income', 'expense'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === f ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
              color: filter === f ? 'white' : 'var(--mizan-text-secondary)',
              border: `1px solid ${filter === f ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
            }}
          >
            {t(`finance.${f === 'all' ? 'all' : f}`)}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--mizan-text-secondary)' }}>
          <p className="text-sm">{t('finance.noTransactions')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl group" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tx.type === 'income' ? '#27AE6022' : '#C0392B22' }}>
                {tx.type === 'income'
                  ? <TrendingUp className="w-4 h-4" style={{ color: 'var(--mizan-green)' }} />
                  : <TrendingDown className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--mizan-text)' }}>{tx.description || tx.category}</p>
                <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{tx.category} · {tx.date}</p>
              </div>
              <span className="text-sm font-semibold" style={{ color: tx.type === 'income' ? 'var(--mizan-green)' : 'var(--mizan-red)' }}>
                {tx.type === 'income' ? '+' : '-'}{currSymbol} {tx.amount?.toLocaleString()}
              </span>
              <button onClick={() => handleDelete(tx.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}