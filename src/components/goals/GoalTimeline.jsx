import React from 'react';
import { useI18n } from '@/lib/i18n';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export default function GoalTimeline({ milestones }) {
  const { language } = useI18n();
  const lang = language || 'ar';

  if (!milestones || milestones.length === 0) return null;

  // Sort by due_date (nulls last), then by creation order
  const sorted = [...milestones].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const getDateStatus = (due_date, is_completed) => {
    if (is_completed) return 'done';
    if (!due_date) return 'none';
    if (isToday(new Date(due_date))) return 'today';
    if (isPast(new Date(due_date))) return 'overdue';
    return 'future';
  };

  const statusStyle = {
    done:    { dot: 'var(--mizan-emerald)', line: 'var(--mizan-emerald)' },
    today:   { dot: 'var(--mizan-gold)',    line: 'var(--mizan-border)' },
    overdue: { dot: 'var(--mizan-red)',     line: 'var(--mizan-border)' },
    future:  { dot: 'var(--mizan-border)',  line: 'var(--mizan-border)' },
    none:    { dot: 'var(--mizan-border)',  line: 'var(--mizan-border)' },
  };

  const formatDate = (d) => {
    try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d; }
  };

  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold mizan-section-header mb-4" style={{ color: 'var(--mizan-text)' }}>
        {lang === 'ar' ? 'الجدول الزمني' : 'Timeline'}
      </h3>
      <div className="relative">
        {sorted.map((ms, i) => {
          const status = getDateStatus(ms.due_date, ms.is_completed);
          const styles = statusStyle[status];
          const isLast = i === sorted.length - 1;

          return (
            <div key={ms.id} className="flex gap-3 relative">
              {/* Vertical line */}
              {!isLast && (
                <div className="absolute left-[10px] top-7 bottom-0 w-0.5" style={{ background: styles.line, opacity: 0.4 }} />
              )}

              {/* Dot */}
              <div className="flex-shrink-0 mt-1 z-10">
                {ms.is_completed
                  ? <CheckCircle2 className="w-5 h-5" style={{ color: styles.dot }} />
                  : status === 'today'
                  ? <Clock className="w-5 h-5" style={{ color: styles.dot }} />
                  : <Circle className="w-5 h-5" style={{ color: styles.dot }} />
                }
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="text-sm font-medium leading-5"
                    style={{
                      color: 'var(--mizan-text)',
                      textDecoration: ms.is_completed ? 'line-through' : 'none',
                      opacity: ms.is_completed ? 0.55 : 1,
                    }}
                  >
                    {ms.title}
                  </span>
                  {ms.due_date && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{
                        background: status === 'overdue' ? 'var(--mizan-red)18' :
                                    status === 'today'   ? '#B89A5E18' :
                                    status === 'done'    ? 'var(--mizan-emerald)18' :
                                    'var(--mizan-border)',
                        color: status === 'overdue' ? 'var(--mizan-red)' :
                               status === 'today'   ? 'var(--mizan-gold)' :
                               status === 'done'    ? 'var(--mizan-emerald)' :
                               'var(--mizan-text-secondary)',
                      }}
                    >
                      {status === 'overdue' && (lang === 'ar' ? '⚠ متأخرة · ' : '⚠ Late · ')}
                      {status === 'today' && (lang === 'ar' ? '⏰ اليوم · ' : '⏰ Today · ')}
                      {formatDate(ms.due_date)}
                    </span>
                  )}
                </div>
                {ms.is_completed && ms.completed_at && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {lang === 'ar' ? 'أُنجز في' : 'Done'} {formatDate(ms.completed_at)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}