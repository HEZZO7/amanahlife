import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { AlertTriangle, X, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Shows warning banners for budget categories that exceeded 80% or 100% of their limit.
 * Pass `budgetStatus` from the finance snapshot.
 */
export default function BudgetAlertsBanner({ budgetStatus = [], onDismiss }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const currSymbol = settings?.currency_symbol || 'ر.س';
  const isRTL = language === 'ar';

  const alerts = budgetStatus
    .filter(b => b.percent >= 80)
    .sort((a, b) => b.percent - a.percent);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((b, i) => {
        const isOver = b.percent >= 100;
        const remaining = Math.max(0, b.limit - b.spent);
        return (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{
              background: isOver ? '#C0392B12' : '#B89A5E12',
              border: `1px solid ${isOver ? '#C0392B44' : '#B89A5E44'}`,
            }}
          >
            <AlertTriangle
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: isOver ? 'var(--mizan-red)' : 'var(--mizan-gold)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: isOver ? 'var(--mizan-red)' : 'var(--mizan-gold)' }}>
                {isOver
                  ? (isRTL ? `تجاوزت ميزانية "${b.category}"!` : `Budget exceeded: "${b.category}"!`)
                  : (isRTL ? `اقتربت من حد ميزانية "${b.category}"` : `Approaching limit: "${b.category}"`)}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isOver
                  ? (isRTL
                      ? `صرفت ${currSymbol} ${b.spent.toLocaleString()} من أصل ${currSymbol} ${b.limit.toLocaleString()} (${b.percent}%)`
                      : `Spent ${currSymbol} ${b.spent.toLocaleString()} of ${currSymbol} ${b.limit.toLocaleString()} (${b.percent}%)`)
                  : (isRTL
                      ? `تبقى ${currSymbol} ${remaining.toLocaleString()} فقط — وصلت إلى ${b.percent}% من الحد`
                      : `Only ${currSymbol} ${remaining.toLocaleString()} left — reached ${b.percent}% of limit`)}
              </p>
            </div>
            <Link
              to="/finance"
              className="text-xs flex-shrink-0 font-medium px-2 py-1 rounded-lg"
              style={{
                background: isOver ? '#C0392B22' : '#B89A5E22',
                color: isOver ? 'var(--mizan-red)' : 'var(--mizan-gold)',
              }}
            >
              {isRTL ? 'الميزانية' : 'Budget'}
            </Link>
          </div>
        );
      })}
    </div>
  );
}