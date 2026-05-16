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

  // حساب عدد المهام حسب الأولوية
  const getTasksByDate = (dateStr) => {
    return tasks.filter(t => t.due_date === dateStr);
  };

  const getTaskPriorityStats = (dateStr) => {
    const dayTasks = getTasksByDate(dateStr);
    return {
      high: dayTasks.filter(t => t.priority === 'high').length,
      medium: dayTasks.filter(t => t.priority === 'medium').length,
      low: dayTasks.filter(t => t.priority === 'low').length,
      total: dayTasks.length,
    };
  };

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
          const stats = getTaskPriorityStats(dateStr);
          const hasEvents = events.some(e => e.start_datetime?.startsWith(dateStr));
          const selected = dateStr === selectedDate;
          const today = isToday(day);
          const islamicEvents = showIslamicEvents && inMonth ? getIslamicEventsForDate(day, language) : [];
          const sunnahFasts = showIslamicEvents && inMonth ? getSunnahFastsForDate(day, language) : [];
          const hDay = inMonth ? gregorianToHijri(day).day : null;

          return (
            <button key={i} onClick={() => onDateChange(dateStr)}
              className="relative flex flex-col items-center py-2 rounded-lg transition-all group"
              style={{ background: selected ? 'var(--mizan-emerald)' : today ? 'var(--mizan-border)' : 'transparent', opacity: inMonth ? 1 : 0.3 }}>
              
              {/* Main Date */}
              <span className="text-sm font-medium" style={{ color: selected ? 'white' : 'var(--mizan-text)' }}>
                {format(day, 'd')}
              </span>
              
              {/* Hijri Date */}
              {showHijri && inMonth && hDay && (
                <span className="text-[8px] leading-none" style={{ color: selected ? 'rgba(255,255,255,0.65)' : '#6B7280' }}>
                  {hDay}
                </span>
              )}

              {/* Task Count Badge */}
              {stats.total > 0 && (
                <div className="mt-1 mb-1 px-1.5 py-0.5 rounded text-xs font-bold" style={{
                  background: stats.high > 0 ? 'var(--mizan-red)' : stats.medium > 0 ? 'var(--mizan-gold)' : 'var(--mizan-emerald)',
                  color: 'white'
                }}>
                  {stats.total}
                </div>
              )}
              
              {/* Indicators */}
              <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                {stats.high > 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-red)' }} title="High priority" />}
                {stats.medium > 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-gold)' }} title="Medium priority" />}
                {stats.low > 0 && <div className="w-1.5 h-1.5 rounded-full" style={{ background: selected ? 'white' : '#27AE60' }} title="Low priority" />}
                {hasEvents && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-emerald)' }} />}
                {islamicEvents.length > 0 && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : 'var(--mizan-gold)', border: selected ? 'none' : '1px solid var(--mizan-gold)' }} />}
                {sunnahFasts.length > 0 && <div className="w-1 h-1 rounded-full" style={{ background: selected ? 'white' : '#7C9A7E' }} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Tasks */}
      {selectedDate && (
        <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="mb-4 mizan-section-header pl-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
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
              {selectedDayTasks.map(task => {
                const priorityColor = task.priority === 'high' ? 'var(--mizan-red)' : task.priority === 'medium' ? 'var(--mizan-gold)' : '#27AE60';
                return (
                  <div key={task.id} className="p-3 rounded-lg flex items-start gap-3" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: priorityColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{task.title}</p>
                      {task.due_time && (
                        <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>🕐 {task.due_time}</p>
                      )}
                      {task.description && (
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--mizan-text-secondary)' }}>{task.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{
                      background: task.status === 'completed' ? 'var(--mizan-emerald)20' : task.status === 'in_progress' ? 'var(--mizan-gold)20' : 'var(--mizan-border)',
                      color: task.status === 'completed' ? 'var(--mizan-emerald)' : task.status === 'in_progress' ? 'var(--mizan-gold)' : 'var(--mizan-text-secondary)'
                    }}>
                      {language === 'ar' 
                        ? (task.status === 'completed' ? 'مكتمل' : task.status === 'in_progress' ? 'جاري' : 'قادم')
                        : (task.status === 'completed' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'Pending')
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}