import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatHijriDate, gregorianToHijri, getIslamicEventsForDate, getSunnahFastsForDate } from '@/lib/hijriUtils';

export default function CalendarView({ tasks, events, selectedDate, onDateChange }) {
  const { t, language } = useI18n();
  const { settings } = useUserSettings();
  const [monthDate, setMonthDate] = useState(new Date());

  const showHijri = settings?.show_hijri_calendar !== false;
  const showIslamicEvents = settings?.show_islamic_events !== false;

  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 6 });

  const weeks = [];
  let current = calStart;
  while (current <= monthEnd || weeks.length < 6) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
    if (weeks.length >= 6) break;
  }

  const prevMonth = () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1));

  const selectedDayTasks = tasks.filter(t => t.due_date === selectedDate);

  return (
    <div className="space-y-5">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--mizan-text-secondary)' }}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="text-base font-semibold" style={{ color: 'var(--mizan-text)' }}>{format(monthDate, 'MMMM yyyy')}</span>
          {showHijri && (
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{formatHijriDate(monthDate, language)}</p>
          )}
        </div>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--mizan-text-secondary)' }}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Sat','Sun','Mon','Tue','Wed','Thu','Fri'].map(d => (
          <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--mizan-text-secondary)' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const inMonth = isSameMonth(day, monthDate);
          const hasTasks = tasks.some(t => t.due_date === dateStr);
          const hasEvents = events.some(e => e.start_datetime?.startsWith(dateStr));
          const selected = dateStr === selectedDate;
          const today = isToday(day);
          const islamicEvents = showIslamicEvents && inMonth ? getIslamicEventsForDate(day, language) : [];
          const sunnahFasts = showIslamicEvents && inMonth ? getSunnahFastsForDate(day, language) : [];
          const hDay = inMonth ? gregorianToHijri(day).day : null;

          return (
            <button key={i} onClick={() => onDateChange(dateStr)}
              className="relative flex flex-col items-center py-1.5 rounded-lg transition-all"
              style={{ background: selected ? 'var(--mizan-emerald)' : today ? 'var(--mizan-border)' : 'transparent', opacity: inMonth ? 1 : 0.3 }}>
              <span className="text-sm font-medium" style={{ color: selected ? 'white' : 'var(--mizan-text)' }}>
                {format(day, 'd')}
              </span>
              {showHijri && inMonth && hDay && (
                <span className="text-[8px] leading-none" style={{ color: selected ? 'rgba(255,255,255,0.65)' : '#6B7280' }}>
                  {hDay}
                </span>
              )}
              <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                {hasTasks && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-emerald)' }} />}
                {hasEvents && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-gold)' }} />}
                {islamicEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-gold)', border: selected ? 'none' : '1px solid var(--mizan-gold)' }} />}
                {sunnahFasts.length > 0 && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : '#7C9A7E' }} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Tasks */}
      {selectedDate && (
        <div>
          <div className="mb-3 mizan-section-header pl-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text-secondary)' }}>
              {format(parseISO(selectedDate), 'EEEE, MMMM d')}
            </p>
            {showHijri && (
              <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                {formatHijriDate(parseISO(selectedDate), language)}
              </p>
            )}
          </div>
          {selectedDayTasks.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--mizan-text-secondary)' }}>{t('planner.noTasks')}</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTasks.map(task => (
                <div key={task.id} className="p-3 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{task.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}