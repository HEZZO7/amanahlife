import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ tasks, events, selectedDate, onDateChange }) {
  const { t } = useI18n();
  const [monthDate, setMonthDate] = useState(new Date());

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
        <button onClick={prevMonth} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--mizan-text-secondary)' }}><ChevronLeft className="w-5 h-5" /></button>
        <span className="text-base font-semibold" style={{ color: 'var(--mizan-text)' }}>{format(monthDate, 'MMMM yyyy')}</span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--mizan-text-secondary)' }}><ChevronRight className="w-5 h-5" /></button>
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

          return (
            <button key={i} onClick={() => onDateChange(dateStr)} className="relative flex flex-col items-center py-2 rounded-lg transition-all" style={{ background: selected ? 'var(--mizan-emerald)' : today ? 'var(--mizan-border)' : 'transparent', opacity: inMonth ? 1 : 0.3 }}>
              <span className="text-sm font-medium" style={{ color: selected ? 'white' : 'var(--mizan-text)' }}>{format(day, 'd')}</span>
              <div className="flex gap-0.5 mt-0.5">
                {hasTasks && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-emerald)' }} />}
                {hasEvents && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-gold)' }} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Tasks */}
      {selectedDate && (
        <div>
          <p className="text-sm font-semibold mb-3 mizan-section-header" style={{ color: 'var(--mizan-text-secondary)' }}>
            {format(parseISO(selectedDate), 'EEEE, MMMM d')}
          </p>
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