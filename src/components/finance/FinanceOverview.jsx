import React from 'react';
import { useI18n } from '@/lib/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#0B5B50','#B89A5E','#12897A','#C0392B','#27AE60','#8A9B97','#16302B','#F5F1E8'];

export default function FinanceOverview({ snapshot, currSymbol }) {
  const { t } = useI18n();

  if (!snapshot) return null;

  const categories = snapshot.byCategory || snapshot.categoryBreakdown || [];
  const pieData = categories.slice(0, 8).map(c => ({ name: c.category, value: c.amount }));

  return (
    <div className="space-y-6">
      {/* Savings Rate */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{t('finance.savingsRate')}</span>
          <span className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {snapshot.savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'var(--mizan-border)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(snapshot.savingsRate, 100)}%`, background: 'var(--mizan-emerald)' }} />
        </div>
      </div>

      {/* Spending by Category */}
      {pieData.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {t('finance.spendingByCategory')}
          </h3>
          <div className="flex items-center gap-4">
            <div style={{ width: 120, height: 120, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${currSymbol} ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categories.slice(0, 6).map((c, i) => (
                <div key={c.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs capitalize" style={{ color: 'var(--mizan-text-secondary)' }}>{c.category}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>
                    {currSymbol} {c.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {pieData.length === 0 && (
        <div className="text-center py-12 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.noData')}</p>
        </div>
      )}
    </div>
  );
}