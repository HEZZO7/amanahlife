import React from 'react';
import { useI18n } from '@/lib/i18n';

export default function SpiritualStreak({ streakData }) {
  const { language } = useI18n();
  const { streak, history } = streakData;

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'التسلسل' : 'Prayer Streak'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🔥</span>
          <span className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>{streak}</span>
          <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'يوم' : 'days'}</span>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {history.slice(-30).map(({ date, count }) => (
          <div
            key={date}
            title={`${date}: ${count}/5`}
            className="aspect-square rounded-sm"
            style={{
              background: count === 0 ? 'var(--mizan-border)'
                : count <= 2 ? 'rgba(11,91,80,0.3)'
                : count <= 4 ? 'rgba(11,91,80,0.6)'
                : 'var(--mizan-emerald)',
            }}
          />
        ))}
      </div>
      <p className="text-[10px] mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
        {language === 'ar' ? 'آخر ٣٠ يوماً' : 'Last 30 days'}
      </p>
    </div>
  );
}