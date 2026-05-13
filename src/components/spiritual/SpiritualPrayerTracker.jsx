import React from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import SpiritualStreak from './SpiritualStreak';

const PRAYERS = [
  { key: 'fajr', ar: 'الفجر', en: 'Fajr', time: '5:00' },
  { key: 'dhuhr', ar: 'الظهر', en: 'Dhuhr', time: '12:00' },
  { key: 'asr', ar: 'العصر', en: 'Asr', time: '15:30' },
  { key: 'maghrib', ar: 'المغرب', en: 'Maghrib', time: '18:00' },
  { key: 'isha', ar: 'العشاء', en: 'Isha', time: '20:00' },
];

export default function SpiritualPrayerTracker({ score, streakData, onReload }) {
  const { language } = useI18n();
  const today = format(new Date(), 'yyyy-MM-dd');
  const prayerLog = score?.prayerLog;

  const handleToggle = async (key) => {
    const current = prayerLog?.[key] || false;
    if (prayerLog?.id) {
      await base44.entities.PrayerLog.update(prayerLog.id, { [key]: !current });
    } else {
      await base44.entities.PrayerLog.create({ date: today, [key]: true });
    }
    onReload();
  };

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'صلوات اليوم' : "Today's Prayers"}
          </span>
          <span className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>
            {score?.prayerCount || 0}/5
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full mb-5" style={{ background: 'var(--mizan-border)' }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${((score?.prayerCount || 0) / 5) * 100}%`, background: 'var(--mizan-emerald)' }} />
        </div>

        {/* Prayer buttons */}
        <div className="grid grid-cols-5 gap-2">
          {PRAYERS.map(({ key, ar, en, time }) => {
            const done = prayerLog?.[key] || false;
            return (
              <button
                key={key}
                onClick={() => handleToggle(key)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                style={{
                  background: done ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
                  border: `2px solid ${done ? 'var(--mizan-emerald)' : 'transparent'}`,
                }}
              >
                <span className="text-lg">{done ? '✓' : '○'}</span>
                <span className="text-[11px] font-semibold" style={{ color: done ? 'white' : 'var(--mizan-text-secondary)' }}>
                  {language === 'ar' ? ar : en}
                </span>
                <span className="text-[9px]" style={{ color: done ? 'rgba(255,255,255,0.7)' : 'var(--mizan-text-secondary)' }}>{time}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      {streakData && <SpiritualStreak streakData={streakData} />}
    </div>
  );
}