import React, { useState, useEffect } from 'react';
import { MORNING_ADHKAR, EVENING_ADHKAR } from '@/lib/adhkarData';
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Sun, Moon, BookOpen } from 'lucide-react';

export default function AdhkarReader({ language }) {
  const isAr = language === 'ar';
  const [type, setType] = useState('morning'); // 'morning' | 'evening'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [counts, setCounts] = useState({});

  const list = type === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;
  const item = list[currentIdx];
  const countKey = `${type}_${item.id}`;
  const currentCount = counts[countKey] || 0;
  const done = currentCount >= item.repeat;
  const progress = Math.min((currentCount / item.repeat) * 100, 100);
  const totalDone = list.filter(d => (counts[`${type}_${d.id}`] || 0) >= d.repeat).length;

  // Load counts from localStorage (offline)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`adhkar_counts_${today}`);
    if (saved) setCounts(JSON.parse(saved));
  }, []);

  const saveCounts = (newCounts) => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`adhkar_counts_${today}`, JSON.stringify(newCounts));
    setCounts(newCounts);
  };

  const handleTap = () => {
    if (done) {
      // Move to next automatically
      if (currentIdx < list.length - 1) setCurrentIdx(i => i + 1);
      return;
    }
    const newCount = currentCount + 1;
    const newCounts = { ...counts, [countKey]: newCount };
    saveCounts(newCounts);
    // Auto-advance after completing
    if (newCount >= item.repeat && currentIdx < list.length - 1) {
      setTimeout(() => setCurrentIdx(i => i + 1), 600);
    }
  };

  const handleReset = () => {
    const newCounts = { ...counts, [countKey]: 0 };
    saveCounts(newCounts);
  };

  const handleResetAll = () => {
    const newCounts = { ...counts };
    list.forEach(d => { delete newCounts[`${type}_${d.id}`]; });
    saveCounts(newCounts);
    setCurrentIdx(0);
  };

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <button
          onClick={() => { setType('morning'); setCurrentIdx(0); }}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: type === 'morning' ? 'var(--mizan-gold)' : 'transparent',
            color: type === 'morning' ? 'white' : 'var(--mizan-text-secondary)',
          }}
        >
          <Sun className="w-4 h-4" />
          {isAr ? 'أذكار الصباح' : 'Morning Adhkar'}
        </button>
        <button
          onClick={() => { setType('evening'); setCurrentIdx(0); }}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: type === 'evening' ? 'var(--mizan-emerald)' : 'transparent',
            color: type === 'evening' ? 'white' : 'var(--mizan-text-secondary)',
          }}
        >
          <Moon className="w-4 h-4" />
          {isAr ? 'أذكار المساء' : 'Evening Adhkar'}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl p-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isAr ? `${totalDone} من ${list.length} مكتمل` : `${totalDone} of ${list.length} done`}
          </span>
          <button onClick={handleResetAll} className="flex items-center gap-1 text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            <RotateCcw className="w-3 h-3" />
            {isAr ? 'إعادة الكل' : 'Reset All'}
          </button>
        </div>
        <div className="w-full h-2 rounded-full" style={{ background: 'var(--mizan-border)' }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(totalDone / list.length) * 100}%`,
              background: type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)',
            }}
          />
        </div>
        {/* Dots */}
        <div className="flex flex-wrap gap-1 mt-2">
          {list.map((d, i) => {
            const isDone = (counts[`${type}_${d.id}`] || 0) >= d.repeat;
            return (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className="w-5 h-5 rounded-full transition-all text-xs flex items-center justify-center"
                style={{
                  background: currentIdx === i
                    ? (type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)')
                    : isDone ? 'rgba(46,170,150,0.2)' : 'var(--mizan-border)',
                  border: currentIdx === i ? '2px solid white' : 'none',
                  color: isDone ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)',
                }}
              >
                {isDone ? '✓' : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dhikr Card */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'var(--mizan-surface)',
          border: `2px solid ${done ? (type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)') : 'var(--mizan-border)'}`,
        }}
      >
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: type === 'morning' ? 'rgba(184,154,94,0.15)' : 'rgba(46,170,150,0.15)', color: type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)' }}>
            {isAr ? item.title_ar : item.title_en}
          </span>
          <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {currentIdx + 1}/{list.length}
          </span>
        </div>

        {/* Arabic Text */}
        <p
          className="text-xl leading-loose mb-3 text-right"
          dir="rtl"
          style={{
            fontFamily: 'var(--font-arabic)',
            color: 'var(--mizan-text)',
            lineHeight: '2.2',
            fontSize: '1.2rem',
          }}
        >
          {item.arabic}
        </p>

        {/* Source */}
        <p className="text-xs mb-4 text-right" dir="rtl" style={{ color: 'var(--mizan-text-secondary)' }}>
          📖 {isAr ? item.source_ar : item.source_en}
        </p>

        {/* Count indicator */}
        {item.repeat > 1 && (
          <div className="flex items-center justify-center gap-3 mb-4">
            {Array.from({ length: item.repeat }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: i < currentCount
                    ? (type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)')
                    : 'var(--mizan-border)',
                  color: i < currentCount ? 'white' : 'var(--mizan-text-secondary)',
                  transform: i === currentCount - 1 ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {i < currentCount ? '✓' : i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Tap Button */}
        <button
          onClick={handleTap}
          className="w-full py-4 rounded-2xl text-white text-base font-bold transition-all active:scale-95 shadow-lg"
          style={{
            background: done
              ? (type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)')
              : (type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)'),
            opacity: done ? 0.85 : 1,
            boxShadow: `0 4px 20px ${type === 'morning' ? 'rgba(184,154,94,0.3)' : 'rgba(11,91,80,0.3)'}`,
          }}
        >
          {done
            ? (isAr ? '✓ تم — التالي ←' : '✓ Done — Next →')
            : (isAr ? `اضغط للذكر — ${currentCount}/${item.repeat}` : `Tap to Count — ${currentCount}/${item.repeat}`)}
        </button>

        {/* Reset current */}
        <button
          onClick={handleReset}
          className="mt-2 flex items-center gap-1.5 mx-auto text-xs"
          style={{ color: 'var(--mizan-text-secondary)' }}
        >
          <RotateCcw className="w-3 h-3" />
          {isAr ? 'إعادة هذا الذكر' : 'Reset this dhikr'}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
        >
          <ChevronRight className="w-4 h-4" />
          {isAr ? 'السابق' : 'Previous'}
        </button>
        <button
          onClick={() => setCurrentIdx(i => Math.min(list.length - 1, i + 1))}
          disabled={currentIdx === list.length - 1}
          className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-30"
          style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
        >
          {isAr ? 'التالي' : 'Next'}
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Completion Banner */}
      {totalDone === list.length && (
        <div className="rounded-2xl p-4 text-center" style={{ background: type === 'morning' ? 'rgba(184,154,94,0.15)' : 'rgba(46,170,150,0.15)', border: `1px solid ${type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)'}` }}>
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold" style={{ color: type === 'morning' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)' }}>
            {isAr
              ? (type === 'morning' ? 'أحسنت! اكتملت أذكار الصباح' : 'أحسنت! اكتملت أذكار المساء')
              : (type === 'morning' ? 'Morning Adhkar Complete!' : 'Evening Adhkar Complete!')}
          </p>
        </div>
      )}

      {/* Offline note */}
      <p className="text-xs text-center" style={{ color: 'var(--mizan-text-secondary)' }}>
        📴 {isAr ? 'يعمل بدون إنترنت — يتم حفظ التقدم تلقائيًا' : 'Works offline — progress saved automatically'}
      </p>
    </div>
  );
}