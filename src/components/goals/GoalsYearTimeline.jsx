import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { CheckCircle2, Circle, Clock, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isPast, isToday, getMonth, getYear } from 'date-fns';

const CATEGORY_COLORS = {
  personal:  { bg: '#2EAA9618', dot: '#2EAA96', label: 'شخصي' },
  financial: { bg: '#D4A85318', dot: '#D4A853', label: 'مالي' },
  spiritual: { bg: '#5FB3A818', dot: '#5FB3A8', label: 'روحي' },
  family:    { bg: '#27AE6018', dot: '#27AE60', label: 'عائلي' },
  health:    { bg: '#C0392B18', dot: '#C0392B', label: 'صحي' },
};

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function GoalPill({ goal, lang }) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.personal;
  const isDone = goal.status === 'completed';
  const isPaused = goal.status === 'paused';

  return (
    <div
      className="rounded-xl border transition-all cursor-pointer"
      style={{
        background: isDone ? 'var(--mizan-emerald)12' : cat.bg,
        borderColor: isDone ? 'var(--mizan-emerald)44' : cat.dot + '44',
        opacity: isPaused ? 0.55 : 1,
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {isDone
          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-emerald)' }} />
          : isPaused
          ? <Circle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }} />
          : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: cat.dot }} />
        }

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--mizan-text)', textDecoration: isDone ? 'line-through' : 'none' }}>
            {goal.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cat.dot + '22', color: cat.dot }}>
              {lang === 'ar' ? cat.label : goal.category}
            </span>
            {goal.target_date && (
              <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isPast(new Date(goal.target_date)) && !isDone
                  ? <span style={{ color: 'var(--mizan-red)' }}>⚠ {lang === 'ar' ? 'متأخر' : 'Late'}</span>
                  : isToday(new Date(goal.target_date))
                  ? <span style={{ color: 'var(--mizan-gold)' }}>⏰ {lang === 'ar' ? 'اليوم' : 'Today'}</span>
                  : format(new Date(goal.target_date), 'dd MMM')
                }
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs font-bold" style={{ color: isDone ? 'var(--mizan-emerald)' : cat.dot }}>
            {goal.progress || 0}%
          </span>
          {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
                : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-3 h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
        <div className="h-1.5 rounded-full transition-all"
          style={{ width: `${goal.progress || 0}%`, background: isDone ? 'var(--mizan-emerald)' : cat.dot }} />
      </div>

      {/* Expanded milestones */}
      {open && goal.milestones && goal.milestones.length > 0 && (
        <div className="mx-4 mb-3 space-y-1.5 border-t pt-3" style={{ borderColor: cat.dot + '30' }}>
          {goal.milestones.slice(0, 5).map((ms, i) => (
            <div key={i} className="flex items-center gap-2">
              {ms.is_completed
                ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--mizan-emerald)' }} />
                : <Circle className="w-3.5 h-3.5" style={{ color: 'var(--mizan-border)' }} />
              }
              <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)', textDecoration: ms.is_completed ? 'line-through' : 'none' }}>
                {ms.title}
              </span>
            </div>
          ))}
          {goal.milestones.length > 5 && (
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              +{goal.milestones.length - 5} {lang === 'ar' ? 'أخرى' : 'more'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function GoalsYearTimeline({ goals }) {
  const { language } = useI18n();
  const lang = language || 'ar';
  const isRTL = lang === 'ar';
  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date());

  if (!goals || goals.length === 0) return null;

  // Group goals by their target month (or "no date")
  const grouped = {}; // key: month index 0-11 or 'none'

  for (const goal of goals) {
    if (goal.target_date) {
      const d = new Date(goal.target_date);
      if (getYear(d) === currentYear) {
        const m = getMonth(d);
        if (!grouped[m]) grouped[m] = [];
        grouped[m].push(goal);
      } else {
        // different year — put in 'other'
        if (!grouped['other']) grouped['other'] = [];
        grouped['other'].push(goal);
      }
    } else {
      if (!grouped['none']) grouped['none'] = [];
      grouped['none'].push(goal);
    }
  }

  const MONTHS = isRTL ? MONTHS_AR : MONTHS_EN;
  // Only show months that have goals OR current/future months
  const relevantMonths = Array.from({ length: 12 }, (_, i) => i)
    .filter(m => grouped[m]?.length > 0);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--mizan-border)' }}>
        <Target className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {isRTL ? `الجدول الزمني للأهداف · ${currentYear}` : `Goals Timeline · ${currentYear}`}
        </h3>
      </div>

      <div className="p-5 space-y-6">
        {/* Months with goals */}
        {relevantMonths.map(m => (
          <div key={m} className="flex gap-4">
            {/* Month label + dot */}
            <div className="flex flex-col items-center flex-shrink-0 w-14">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: m === currentMonth ? 'var(--mizan-emerald)' : 'var(--mizan-bg)',
                  color: m === currentMonth ? 'white' : 'var(--mizan-text-secondary)',
                  border: `2px solid ${m === currentMonth ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
                }}
              >
                {MONTHS[m]}
              </div>
              {/* Vertical connector */}
              {relevantMonths.indexOf(m) < relevantMonths.length - 1 && (
                <div className="flex-1 w-0.5 mt-2 min-h-4" style={{ background: 'var(--mizan-border)' }} />
              )}
            </div>

            {/* Goals in this month */}
            <div className="flex-1 space-y-2 pb-2">
              {(grouped[m] || []).map(goal => (
                <GoalPill key={goal.id} goal={goal} lang={lang} />
              ))}
            </div>
          </div>
        ))}

        {/* Goals with no date */}
        {grouped['none']?.length > 0 && (
          <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0 w-14">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--mizan-bg)', border: '2px dashed var(--mizan-border)' }}>
                <Clock className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
              </div>
            </div>
            <div className="flex-1 space-y-2 pb-2">
              <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
                {isRTL ? 'بدون تاريخ محدد' : 'No target date'}
              </p>
              {grouped['none'].map(goal => (
                <GoalPill key={goal.id} goal={goal} lang={lang} />
              ))}
            </div>
          </div>
        )}

        {/* No relevant months */}
        {relevantMonths.length === 0 && !grouped['none'] && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isRTL ? 'أضف تواريخ للأهداف لعرضها على الجدول الزمني' : 'Add target dates to your goals to see them here'}
          </p>
        )}
      </div>
    </div>
  );
}