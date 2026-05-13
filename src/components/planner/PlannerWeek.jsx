import React from 'react';
import { useI18n } from '@/lib/i18n';
import { format, eachDayOfInterval, endOfWeek, isSameDay, isToday } from 'date-fns';

export default function PlannerWeek({ weekStart, tasks, events, onSelectDay }) {
  const { language } = useI18n();
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 6 }) });

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.due_date === dateStr);
        const dayEvents = events.filter(e => e.start_datetime?.startsWith(dateStr));
        const total = dayTasks.length + dayEvents.length;
        const completed = dayTasks.filter(t => t.status === 'completed').length;
        const today = isToday(day);

        return (
          <button
            key={dateStr}
            onClick={() => onSelectDay(day)}
            className="rounded-xl p-2 text-center transition-all hover:opacity-90 min-h-[100px] flex flex-col items-center"
            style={{ background: today ? 'var(--mizan-emerald)' : 'var(--mizan-surface)', border: `1px solid ${today ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}
          >
            <span className="text-[10px] font-medium mb-1" style={{ color: today ? 'rgba(255,255,255,0.7)' : 'var(--mizan-text-secondary)' }}>
              {format(day, 'EEE')}
            </span>
            <span className="text-lg font-bold" style={{ color: today ? 'white' : 'var(--mizan-text)' }}>
              {format(day, 'd')}
            </span>
            {total > 0 && (
              <div className="mt-2 space-y-1 w-full">
                {dayTasks.slice(0, 2).map(t => (
                  <div key={t.id} className="text-[9px] truncate px-1 py-0.5 rounded" style={{ background: today ? 'rgba(255,255,255,0.2)' : 'var(--mizan-border)', color: today ? 'white' : 'var(--mizan-text-secondary)' }}>
                    {t.title}
                  </div>
                ))}
                {total > 2 && (
                  <span className="text-[9px]" style={{ color: today ? 'rgba(255,255,255,0.7)' : 'var(--mizan-text-secondary)' }}>
                    +{total - 2}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}