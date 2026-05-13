import React from 'react';
import { useI18n } from '@/lib/i18n';

const PRAYERS = [
  { key: 'fajr', ar: 'الفجر', en: 'Fajr' },
  { key: 'dhuhr', ar: 'الظهر', en: 'Dhuhr' },
  { key: 'asr', ar: 'العصر', en: 'Asr' },
  { key: 'maghrib', ar: 'المغرب', en: 'Maghrib' },
  { key: 'isha', ar: 'العشاء', en: 'Isha' },
];

export default function DashboardPrayerStrip({ prayerLog, streak }) {
  const { language } = useI18n();

  return (
    <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'صلوات اليوم' : "Today's Prayers"}
        </span>
        {streak > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
            🔥 {streak} {language === 'ar' ? 'يوم' : 'day streak'}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {PRAYERS.map(({ key, ar, en }) => {
          const done = prayerLog?.[key] || false;
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
                  color: done ? 'white' : 'var(--mizan-text-secondary)',
                }}
              >
                {done ? '✓' : (language === 'ar' ? ar[0] : en[0])}
              </div>
              <span className="text-[10px]" style={{ color: 'var(--mizan-text-secondary)' }}>
                {language === 'ar' ? ar : en}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}