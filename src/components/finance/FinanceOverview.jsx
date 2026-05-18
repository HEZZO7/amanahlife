import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';

const COLORS = [
  '#2EAA96', '#D4A853', '#C0392B', '#27AE60',
  '#5FB3A8', '#E8C97A', '#134E42', '#9DCFC9',
];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, currSymbol }) => {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0].payload;
  return (
    <div className="px-3 py-2 rounded-lg shadow-lg text-xs"
      style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}>
      <p className="font-semibold mb-0.5">{name}</p>
      <p>{currSymbol} {value.toLocaleString()}</p>
      <p style={{ color: 'var(--mizan-text-secondary)' }}>{(percent * 100).toFixed(1)}%</p>
    </div>
  );
};

export default function FinanceOverview({ snapshot, currSymbol }) {
  const { t, language } = useI18n();
  const isRTL = language === 'ar';
  const [activeIndex, setActiveIndex] = useState(null);

  if (!snapshot) return (
    <div className="text-center py-14 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <p className="text-sm mb-1 font-medium" style={{ color: 'var(--mizan-text)' }}>
        {isRTL ? 'أضف معاملتك الأولى لرؤية الملخص' : 'Add your first transaction to see your overview'}
      </p>
      <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
        {isRTL ? 'تتبع الدخل والمصاريف لفتح التحليلات' : 'Track income and expenses to unlock insights'}
      </p>
    </div>
  );

  const categories = snapshot.byCategory || snapshot.categoryBreakdown || [];
  const totalExpenses = categories.reduce((s, c) => s + c.amount, 0);
  const pieData = categories.slice(0, 8).map(c => ({
    name: c.category,
    value: c.amount,
    percent: totalExpenses > 0 ? c.amount / totalExpenses : 0,
  }));

  return (
    <div className="space-y-5">
      {/* Savings Rate */}
      <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{t('finance.savingsRate')}</span>
          <span className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {(snapshot.savingsRate || 0).toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'var(--mizan-border)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(snapshot.savingsRate || 0, 100)}%`, background: 'var(--mizan-emerald)' }} />
        </div>
      </div>

      {/* Spending by Category — Pie Chart */}
      {pieData.length > 0 ? (
        <div className="p-5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <h3 className="text-sm font-semibold mb-5 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {isRTL ? 'توزيع المصاريف حسب التصنيف' : 'Spending by Category'}
          </h3>

          {/* Chart */}
          <div className="flex flex-col items-center mb-5">
            <div style={{ width: '100%', height: 220, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    dataKey="value"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        opacity={activeIndex === null || activeIndex === i ? 1 : 0.5}
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currSymbol={currSymbol} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {activeIndex !== null ? (
                  <>
                    <p className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {pieData[activeIndex]?.name}
                    </p>
                    <p className="text-base font-bold" style={{ color: COLORS[activeIndex % COLORS.length] }}>
                      {(pieData[activeIndex]?.percent * 100).toFixed(0)}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {isRTL ? 'الإجمالي' : 'Total'}
                    </p>
                    <p className="text-sm font-bold" style={{ color: 'var(--mizan-text)' }}>
                      {currSymbol} {totalExpenses.toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Legend grid */}
          <div className="grid grid-cols-2 gap-2">
            {pieData.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all"
                style={{
                  background: activeIndex === i ? `${COLORS[i % COLORS.length]}18` : 'var(--mizan-bg)',
                  border: `1px solid ${activeIndex === i ? COLORS[i % COLORS.length] + '55' : 'var(--mizan-border)'}`,
                  opacity: activeIndex === null || activeIndex === i ? 1 : 0.55,
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--mizan-text)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {currSymbol} {c.value.toLocaleString()} · {(c.percent * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-2xl mb-2">📊</p>
          <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>{t('finance.noData')}</p>
        </div>
      )}
    </div>
  );
}