import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Circle } from 'lucide-react';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_TIMES = { fajr: '05:00', dhuhr: '12:30', asr: '15:45', maghrib: '18:30', isha: '20:00' };

export default function PrayerTracker({ dailyData, today, onRefresh }) {
  const { t } = useI18n();
  const [saving, setSaving] = useState(null);

  const togglePrayer = async (prayer) => {
    setSaving(prayer);
    const log = dailyData?.log;
    const newVal = !(log?.[prayer] || false);

    if (log?.id) {
      await base44.entities.PrayerLog.update(log.id, { [prayer]: newVal });
    } else {
      const data = { date: today };
      PRAYERS.forEach(p => { data[p] = false; });
      data[prayer] = newVal;
      await base44.entities.PrayerLog.create(data);
    }
    setSaving(null);
    onRefresh();
  };

  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('spiritual.todayPrayers')}
      </h3>
      <div className="space-y-3">
        {PRAYERS.map(prayer => {
          const done = dailyData?.log?.[prayer] || false;
          const isSaving = saving === prayer;
          return (
            <button
              key={prayer}
              onClick={() => togglePrayer(prayer)}
              disabled={isSaving}
              className="w-full flex items-center gap-4 p-3 rounded-xl transition-all hover:opacity-90"
              style={{ background: done ? 'var(--mizan-emerald)1A' : 'var(--mizan-elevated)', border: `1px solid ${done ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ background: done ? 'var(--mizan-emerald)' : 'var(--mizan-border)' }}>
                {PRAYER_TIMES[prayer]}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold capitalize" style={{ color: 'var(--mizan-text)' }}>{t(`spiritual.${prayer}`)}</p>
              </div>
              {isSaving ? (
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--mizan-border)', borderTopColor: 'var(--mizan-emerald)' }} />
              ) : done ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--mizan-emerald)' }} />
              ) : (
                <Circle className="w-5 h-5" style={{ color: 'var(--mizan-border)' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}