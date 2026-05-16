import React from 'react';

const ALL_BADGES = [
  // Prayer badges
  { id: 'prayer_3', emoji: '🕌', ar: 'مواظب على الصلاة', en: 'Prayer Streak 3', descAr: '3 أيام صلاة متتالية', descEn: '3 days full prayer', check: (d) => d.streak >= 3 },
  { id: 'prayer_7', emoji: '⭐', ar: 'أسبوع الصلاة', en: 'Prayer Week', descAr: '7 أيام صلاة متتالية', descEn: '7 days full prayer', check: (d) => d.streak >= 7 },
  { id: 'prayer_30', emoji: '🌙', ar: 'شهر الصلاة', en: 'Prayer Month', descAr: '30 يومًا صلاة متتالية', descEn: '30 days full prayer', check: (d) => d.streak >= 30 },
  // Tasks badges
  { id: 'tasks_10', emoji: '✅', ar: 'منجز نشط', en: 'Active Achiever', descAr: 'أكمل 10 مهام', descEn: 'Complete 10 tasks', check: (d) => d.totalCompleted >= 10 },
  { id: 'tasks_50', emoji: '🏆', ar: 'بطل المهام', en: 'Task Champion', descAr: 'أكمل 50 مهمة', descEn: 'Complete 50 tasks', check: (d) => d.totalCompleted >= 50 },
  { id: 'tasks_100', emoji: '💎', ar: 'أسطورة الإنجاز', en: 'Achievement Legend', descAr: 'أكمل 100 مهمة', descEn: 'Complete 100 tasks', check: (d) => d.totalCompleted >= 100 },
  // Goals badges
  { id: 'goal_1', emoji: '🎯', ar: 'صاحب هدف', en: 'Goal Setter', descAr: 'حقق هدفًا واحدًا', descEn: 'Complete 1 goal', check: (d) => d.completedGoals >= 1 },
  { id: 'goal_5', emoji: '🚀', ar: 'صاحب الأهداف', en: 'Goal Achiever', descAr: 'حقق 5 أهداف', descEn: 'Complete 5 goals', check: (d) => d.completedGoals >= 5 },
  // Spiritual score badges
  { id: 'score_80', emoji: '✨', ar: 'متألق روحيًا', en: 'Spiritual Shiner', descAr: 'نقاط روحية اليوم 80+', descEn: 'Daily spiritual score 80+', check: (d) => (d.spiritualScore || 0) >= 80 },
];

function Badge({ badge, unlocked, language }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all"
      style={{
        background: unlocked ? 'var(--mizan-surface)' : 'var(--mizan-elevated)',
        border: `1px solid ${unlocked ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
        opacity: unlocked ? 1 : 0.45,
      }}
    >
      <span className="text-3xl" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>{badge.emoji}</span>
      <p className="text-xs font-semibold leading-tight" style={{ color: unlocked ? 'var(--mizan-text)' : 'var(--mizan-text-secondary)' }}>
        {language === 'ar' ? badge.ar : badge.en}
      </p>
      <p className="text-xs leading-tight" style={{ color: 'var(--mizan-text-secondary)' }}>
        {language === 'ar' ? badge.descAr : badge.descEn}
      </p>
      {unlocked && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
          {language === 'ar' ? 'محقق ✓' : 'Unlocked ✓'}
        </span>
      )}
    </div>
  );
}

export default function BadgesSection({ data, language }) {
  const unlockedCount = ALL_BADGES.filter(b => b.check(data)).length;

  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? '🏅 شاراتي' : '🏅 My Badges'}
        </h2>
        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
          {unlockedCount}/{ALL_BADGES.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-4 overflow-hidden" style={{ background: 'var(--mizan-border)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(unlockedCount / ALL_BADGES.length) * 100}%`, background: 'var(--mizan-emerald)' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ALL_BADGES.map(badge => (
          <Badge key={badge.id} badge={badge} unlocked={badge.check(data)} language={language} />
        ))}
      </div>
    </div>
  );
}