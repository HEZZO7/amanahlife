import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { format, eachDayOfInterval, endOfWeek, isToday } from 'date-fns';
import { formatHijriDate, getIslamicEventsForDate, getSunnahFastsForDate } from '@/lib/hijriUtils';
import IslamicEventPill from './IslamicEventPill';
import SunnahDot from './SunnahDot';

export default function PlannerWeek({ weekStart, tasks, events, onSelectDay }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 6 }) });

  const showHijri = settings?.show_hijri_calendar !== false;
  const showIslamicEvents = settings?.show_islamic_events !== false;

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(t => t.due_date === dateStr);
        const dayEvents = events.filter(e => e.start_datetime?.startsWith(dateStr));
        const total = dayTasks.length + dayEvents.length;
        const today = isToday(day);
        const islamicEvents = showIslamicEvents ? getIslamicEventsForDate(day, language) : [];
        const sunnahFasts = showIslamicEvents ? getSunnahFastsForDate(day, language) : [];

        return (
          <button
            key={dateStr}
            onClick={() => onSelectDay(day)}
            className="rounded-xl p-2 text-center transition-all hover:opacity-90 min-h-[120px] flex flex-col items-center"
            style={{ background: today ? 'var(--mizan-emerald)' : 'var(--mizan-surface)', border: `1px solid ${today ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}
          >
            <span className="text-[10px] font-medium mb-0.5" style={{ color: today ? 'rgba(255,255,255,0.7)' : 'var(--mizan-text-secondary)' }}>
              {format(day, 'EEE')}
            </span>
            <span className="text-lg font-bold" style={{ color: today ? 'white' : 'var(--mizan-text)' }}>
              {format(day, 'd')}
            </span>
            {showHijri && (
              <span className="text-[8px] leading-tight mb-1" style={{ color: today ? 'rgba(255,255,255,0.55)' : '#6B7280' }}>
                {formatHijriDate(day, language).split(' ').slice(0, 2).join(' ')}
              </span>
            )}

            {/* Islamic event pills (compact) */}
            {islamicEvents.length > 0 && (
              <div className="w-full space-y-0.5 mb-0.5">
                {islamicEvents.slice(0, 1).map((ev, i) => (
                  <IslamicEventPill key={i} event={ev} compact />
                ))}
              </div>
            )}

            {/* Sunnah dots (compact) */}
            {sunnahFasts.length > 0 && (
              <div className="w-full space-y-0.5 mb-0.5">
                {sunnahFasts.slice(0, 1).map((s, i) => (
                  <SunnahDot key={i} suggestion={s} compact />
                ))}
              </div>
            )}

            {total > 0 && (
              <div className="mt-1 space-y-0.5 w-full">
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