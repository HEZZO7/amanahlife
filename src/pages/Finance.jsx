import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { getSnapshot } from '@/lib/financeService';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import FinanceOverview from '@/components/finance/FinanceOverview';
import TransactionsList from '@/components/finance/TransactionsList';
import BudgetTracker from '@/components/finance/BudgetTracker';
import AddTransactionModal from '@/components/finance/AddTransactionModal';
import ZakatCalculator from '@/components/finance/ZakatCalculator';
import BudgetAlertsBanner from '@/components/finance/BudgetAlertsBanner';

const TABS = ['overview', 'transactions', 'budget', 'zakat'];

export default function Finance() {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const [tab, setTab] = useState('overview');
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(null); // 'income' | 'expense'
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

  const load = async () => {
    setLoading(true);
    getSnapshot(month)
      .then(s => { console.log('Finance snapshot:', s); setSnapshot(s); })
      .catch(err => console.error('Finance load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [month]);

  const currSymbol = settings?.currency_symbol || 'ر.س';

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('nav.finance')}
        </h1>
        <div className="flex gap-2">
          <Button
            size="sm" className="h-9 rounded-lg gap-1.5 text-white text-xs"
            style={{ background: 'var(--mizan-emerald)' }}
            onClick={() => setShowAdd('income')}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {t('finance.income')}
          </Button>
          <Button
            size="sm" variant="outline" className="h-9 rounded-lg gap-1.5 text-xs"
            style={{ borderColor: 'var(--mizan-red)', color: 'var(--mizan-red)' }}
            onClick={() => setShowAdd('expense')}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            {t('finance.expense')}
          </Button>
        </div>
      </div>

      {/* Summary Row */}
      {!loading && snapshot && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t('finance.income'), value: snapshot.totalIncome ?? snapshot.income, color: 'var(--mizan-green)', icon: TrendingUp },
            { label: t('finance.expenses'), value: snapshot.totalExpenses ?? snapshot.expenses, color: 'var(--mizan-red)', icon: TrendingDown },
            { label: t('finance.net'), value: snapshot.netBalance, color: 'var(--mizan-gold)', icon: Minus },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="p-4 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
              <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
              <p className="text-lg font-bold" style={{ color }}>
                {value >= 0 ? '' : '-'}{currSymbol} {Math.abs(value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Budget Alerts Banner */}
      {!loading && snapshot?.budgetStatus?.length > 0 && (
        <BudgetAlertsBanner budgetStatus={snapshot.budgetStatus} />
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab_key => (
          <button
            key={tab_key}
            onClick={() => setTab(tab_key)}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{
              background: tab === tab_key ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
              color: tab === tab_key ? 'white' : 'var(--mizan-text-secondary)',
              border: `1.5px solid ${tab === tab_key ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
            }}
          >
            {t(`finance.tab.${tab_key}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <>
          {tab === 'overview' && <FinanceOverview snapshot={snapshot} currSymbol={currSymbol} />}
          {tab === 'transactions' && <TransactionsList snapshot={snapshot} onRefresh={load} month={month} />}
          {tab === 'budget' && <BudgetTracker snapshot={snapshot} month={month} onRefresh={load} />}
          {tab === 'zakat' && <ZakatCalculator />}
        </>
      )}

      {showAdd && (
        <AddTransactionModal
          type={showAdd}
          onClose={() => setShowAdd(null)}
          onSaved={() => { setShowAdd(null); load(); }}
        />
      )}
    </div>
  );
}