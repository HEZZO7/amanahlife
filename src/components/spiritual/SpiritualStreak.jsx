import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Flame, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function SpiritualStreak({ streakData }) {
  const { t } = useI18n();
  if (!streakData) return null;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const log = streakData.logs?.find(l => l.date === date);
    const count = log ? PRAYERS.filter(p => log[p]).length : 0;
    return { date, count, label: format(subDays(new Date(), 6 - i), 'EEE') };
  });

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('spiritual.weeklyOverview')}
        </h3>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--mizan-text)' }}>
            {streakData.weeklyRate?.toFixed(0)}%
          </span>
        </div>
      </div>

      <div className="flex gap-1 items-end justify-between">
        {last7.map(({ date, count, label }) => (
          <div key={date} className="flex flex-col items-center gap-1 flex-1">
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="w-full h-2 rounded-sm" style={{ width: 20, background: i < count ? 'var(--mizan-emerald)' : 'var(--mizan-border)' }} />
              ))}
            </div>
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}