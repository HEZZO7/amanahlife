import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { RotateCcw } from 'lucide-react';

const DHIKR_PRESETS = [
  { ar: 'سبحان الله', en: 'Subhan Allah', target: 33 },
  { ar: 'الحمد لله', en: 'Alhamdulillah', target: 33 },
  { ar: 'الله أكبر', en: 'Allahu Akbar', target: 34 },
  { ar: 'لا إله إلا الله', en: 'La ilaha illallah', target: 100 },
  { ar: 'أستغفر الله', en: 'Astaghfirullah', target: 100 },
];

export default function DhikrCounter({ language }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [counts, setCounts] = useState({});
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    const logs = await base44.entities.RamadanLog.filter({ date: today });
    if (logs.length > 0 && logs[0].dhikr_counts) {
      setCounts(logs[0].dhikr_counts);
    }
  };

  const current = DHIKR_PRESETS[selectedIdx];
  const count = counts[selectedIdx] || 0;
  const progress = Math.min((count / current.target) * 100, 100);
  const completed = count >= current.target;

  const handleTap = async () => {
    const newCount = count + 1;
    const newCounts = { ...counts, [selectedIdx]: newCount };
    setCounts(newCounts);

    const logs = await base44.entities.RamadanLog.filter({ date: today });
    if (logs.length > 0) {
      await base44.entities.RamadanLog.update(logs[0].id, { dhikr_counts: newCounts });
    } else {
      await base44.entities.RamadanLog.create({ date: today, dhikr_counts: newCounts });
    }
  };

  const handleReset = async () => {
    const newCounts = { ...counts, [selectedIdx]: 0 };
    setCounts(newCounts);
    const logs = await base44.entities.RamadanLog.filter({ date: today });
    if (logs.length > 0) {
      await base44.entities.RamadanLog.update(logs[0].id, { dhikr_counts: newCounts });
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'اختر الذكر' : 'Select Dhikr'}
        </p>
        <div className="flex flex-wrap gap-2">
          {DHIKR_PRESETS.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedIdx === i ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)',
                color: selectedIdx === i ? 'white' : 'var(--mizan-text)',
                border: `1px solid ${selectedIdx === i ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
              }}
            >
              {language === 'ar' ? d.ar : d.en}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: 'var(--mizan-surface)', border: `2px solid ${completed ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}
      >
        <p className="text-lg font-bold mb-1" style={{ color: 'var(--mizan-emerald)' }}>
          {language === 'ar' ? current.ar : current.en}
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? `الهدف: ${current.target}` : `Target: ${current.target}`}
        </p>

        {/* Progress Ring */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="60" fill="none" stroke="var(--mizan-border)" strokeWidth="8" />
              <circle
                cx="70" cy="70" r="60" fill="none"
                stroke={completed ? 'var(--mizan-gold)' : 'var(--mizan-emerald)'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress / 100)}`}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px', transition: 'stroke-dashoffset 0.3s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold" style={{ color: completed ? 'var(--mizan-gold)' : 'var(--mizan-text)' }}>{count}</span>
              {completed && <span className="text-lg">✓</span>}
            </div>
          </div>
        </div>

        {/* Tap Button */}
        <button
          onClick={handleTap}
          className="w-full py-5 rounded-2xl text-white text-xl font-bold transition-all active:scale-95 shadow-lg"
          style={{
            background: completed ? 'var(--mizan-gold)' : 'var(--mizan-emerald)',
            boxShadow: `0 4px 20px ${completed ? 'rgba(184,154,94,0.4)' : 'rgba(11,91,80,0.3)'}`,
          }}
        >
          {completed
            ? (language === 'ar' ? '🎉 اكتمل' : '🎉 Complete!')
            : (language === 'ar' ? 'اضغط للذكر' : 'Tap to Count')}
        </button>

        <button
          onClick={handleReset}
          className="mt-3 flex items-center gap-1.5 mx-auto text-xs transition-opacity"
          style={{ color: 'var(--mizan-text-secondary)' }}
        >
          <RotateCcw className="w-3 h-3" />
          {language === 'ar' ? 'إعادة ضبط' : 'Reset'}
        </button>
      </div>

      {/* Daily Summary */}
      <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'ملخص اليوم' : "Today's Summary"}
        </p>
        <div className="space-y-2">
          {DHIKR_PRESETS.map((d, i) => {
            const c = counts[i] || 0;
            const done = c >= d.target;
            return (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: done ? 'var(--mizan-emerald)' : 'var(--mizan-text)' }}>
                  {done ? '✓ ' : ''}{language === 'ar' ? d.ar : d.en}
                </span>
                <span className="text-xs font-medium" style={{ color: done ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }}>
                  {c}/{d.target}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}