import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, isToday
} from 'date-fns';
import { formatHijriDate, getIslamicEventsForDate } from '@/lib/hijriUtils';

const PRIORITY_COLOR = { high: '#C0392B', medium: '#B89A5E', low: '#27AE60' };

export default function PlannerMonth({ month, tasks, events, onSelectDay }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const showHijri = settings?.show_hijri_calendar !== false;
  const showIslamicEvents = settings?.show_islamic_events !== false;

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 6 }); // Sat
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 6 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const DAY_NAMES_AR = ['سبت', 'أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع'];
  const DAY_NAMES_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayNames = language === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;

  const getTasksForDay = (day) => {
    const ds = format(day, 'yyyy-MM-dd');
    return tasks.filter(t => t.due_date === ds);
  };

  const getEventsForDay = (day) => {
    const ds = format(day, 'yyyy-MM-dd');
    return events.filter(e => e.start_datetime?.startsWith(ds));
  };

  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)', background: 'var(--mizan-surface)' }}>
      {/* Day headers */}
      <div className="grid grid-cols-7">
        {dayNames.map((d, i) => (
          <div key={i} className="py-2 text-center text-xs font-semibold" style={{ color: 'var(--mizan-text-secondary)', borderBottom: '1px solid var(--mizan-border)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayTasks = getTasksForDay(day);
          const dayEvents = getEventsForDay(day);
          const islamicEvents = showIslamicEvents ? getIslamicEventsForDate(day, language) : [];
          const isCurrentMonth = isSameMonth(day, month);
          const isCurrentDay = isToday(day);
          const completedTasks = dayTasks.filter(t => t.status === 'completed').length;
          const pendingTasks = dayTasks.filter(t => t.status !== 'completed');
          const hijri = showHijri ? formatHijriDate(day, language) : null;
          const hijriDay = hijri ? hijri.split(' ')[0] : null;

          return (
            <div
              key={idx}
              onClick={() => onSelectDay(day)}
              className="relative cursor-pointer transition-all group"
              style={{
                minHeight: '88px',
                borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--mizan-border)' : 'none',
                borderBottom: idx < days.length - 7 ? '1px solid var(--mizan-border)' : 'none',
                background: isCurrentDay
                  ? 'rgba(11,91,80,0.07)'
                  : !isCurrentMonth
                  ? 'rgba(0,0,0,0.02)'
                  : 'transparent',
              }}
            >
              <div className="p-1.5">
                {/* Date number */}
                <div className="flex items-start justify-between mb-1">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: isCurrentDay ? 'var(--mizan-emerald)' : 'transparent',
                      color: isCurrentDay ? 'white' : isCurrentMonth ? 'var(--mizan-text)' : 'var(--mizan-text-secondary)',
                      opacity: isCurrentMonth ? 1 : 0.4,
                    }}
                  >
                    {format(day, 'd')}
                  </span>
                  {hijriDay && isCurrentMonth && (
                    <span className="text-[9px] leading-tight" style={{ color: 'var(--mizan-gold)', opacity: 0.8 }}>
                      {hijriDay}
                    </span>
                  )}
                </div>

                {/* Islamic event dot */}
                {islamicEvents.length > 0 && isCurrentMonth && (
                  <div className="flex gap-0.5 mb-1 flex-wrap">
                    {islamicEvents.slice(0, 2).map((ev, i) => (
                      <span key={i} className="text-[9px] leading-tight truncate max-w-full px-1 rounded" style={{ background: 'rgba(184,154,94,0.15)', color: 'var(--mizan-gold)' }}>
                        {ev.length > 8 ? ev.slice(0, 7) + '…' : ev}
                      </span>
                    ))}
                  </div>
                )}

                {/* Events */}
                {dayEvents.slice(0, 1).map(ev => (
                  <div key={ev.id} className="text-[10px] leading-tight truncate rounded px-1 mb-0.5" style={{ background: 'rgba(184,154,94,0.2)', color: 'var(--mizan-gold)' }}>
                    {ev.title}
                  </div>
                ))}

                {/* Tasks pills */}
                {pendingTasks.slice(0, 2).map(task => (
                  <div key={task.id} className="text-[10px] leading-tight truncate rounded px-1 mb-0.5 flex items-center gap-0.5" style={{ background: `${PRIORITY_COLOR[task.priority]}18`, color: PRIORITY_COLOR[task.priority] }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLOR[task.priority] }} />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}

                {/* Overflow indicator */}
                {(dayTasks.length + dayEvents.length > 3) && isCurrentMonth && (
                  <div className="text-[9px] font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
                    +{dayTasks.length + dayEvents.length - 3} {language === 'ar' ? 'أكثر' : 'more'}
                  </div>
                )}

                {/* Completion bar */}
                {dayTasks.length > 0 && isCurrentMonth && (
                  <div className="mt-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--mizan-border)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(completedTasks / dayTasks.length) * 100}%`,
                        background: completedTasks === dayTasks.length ? 'var(--mizan-emerald)' : 'var(--mizan-gold)',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2.5 flex-wrap" style={{ borderTop: '1px solid var(--mizan-border)' }}>
        {[
          { color: PRIORITY_COLOR.high, label: language === 'ar' ? 'عالية' : 'High' },
          { color: PRIORITY_COLOR.medium, label: language === 'ar' ? 'متوسطة' : 'Medium' },
          { color: PRIORITY_COLOR.low, label: language === 'ar' ? 'منخفضة' : 'Low' },
          { color: 'var(--mizan-gold)', label: language === 'ar' ? 'حدث' : 'Event' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[10px]" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ms-auto">
          <span className="text-[10px]" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الشريط = نسبة الإنجاز' : 'Bar = completion %'}
          </span>
        </div>
      </div>
    </div>
  );
}