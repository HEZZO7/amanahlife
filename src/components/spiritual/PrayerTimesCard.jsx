import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';

const PRAYERS = [
  { key: 'fajr', enName: 'Fajr', arName: 'الفجر' },
  { key: 'sunrise', enName: 'Sunrise', arName: 'الشروق' },
  { key: 'dhuhr', enName: 'Dhuhr', arName: 'الظهر' },
  { key: 'asr', enName: 'Asr', arName: 'العصر' },
  { key: 'maghrib', enName: 'Maghrib', arName: 'المغرب' },
  { key: 'isha', enName: 'Isha', arName: 'العشاء' },
];

export default function PrayerTimesCard({ prayerTimes, language }) {
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // حساب الصلاة التالية والعد التنازلي
  useEffect(() => {
    const calculateNextPrayer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      let next = null;
      let minDiff = Infinity;

      PRAYERS.forEach(({ key }) => {
        const timeStr = prayerTimes[key];
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;
        const diff = prayerMinutes - currentTime;

        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          next = key;
        }
      });

      // إذا لم نجد صلاة اليوم، الفجر غدا هو التالي
      if (!next) {
        next = 'fajr';
        minDiff = (24 * 60) - currentTime + (parseInt(prayerTimes.fajr.split(':')[0]) * 60 + parseInt(prayerTimes.fajr.split(':')[1]));
      }

      setNextPrayer(next);

      // تنسيق العد التنازلي
      const hours = Math.floor(minDiff / 60);
      const mins = minDiff % 60;
      setCountdown(`${hours}h ${mins}m`);
    };

    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 60000); // تحديث كل دقيقة
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'أوقات الصلاة' : 'Prayer Times'}
        </h3>
        {nextPrayer && countdown && (
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'التالية' : 'Next'}
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--mizan-emerald)' }}>
              {countdown}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PRAYERS.map(({ key, enName, arName }) => {
          const isNext = nextPrayer === key;
          return (
            <div
              key={key}
              className="rounded-lg p-3 transition-all"
              style={{
                background: isNext ? 'var(--mizan-emerald)15' : 'var(--mizan-elevated)',
                border: `1px solid ${isNext ? 'var(--mizan-emerald)40' : 'var(--mizan-border)'}`,
              }}
            >
              <p
                className="text-xs font-medium mb-1"
                style={{ color: isNext ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }}
              >
                {language === 'ar' ? arName : enName}
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: isNext ? 'var(--mizan-emerald)' : 'var(--mizan-text)' }}
              >
                {prayerTimes[key]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}