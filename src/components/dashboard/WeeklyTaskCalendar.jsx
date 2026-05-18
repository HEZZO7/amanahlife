import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const DAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const DAYS_EN = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const PRIORITY_STYLE = {
  high:   { bg: '#C0392B18', border: '#C0392B55', dot: '#C0392B', text: '#C0392B' },
  medium: { bg: '#B89A5E18', border: '#B89A5E55', dot: '#B89A5E', text: '#B89A5E' },
  low:    { bg: 'var(--mizan-elevated)', border: 'var(--mizan-border)', dot: '#8A9B97', text: '#8A9B97' },
};

export default function WeeklyTaskCalendar({ tasks }) {
  const { t, language } = useI18n();
  const isAr = language === 'ar';

  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 6 }), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [selectedDay, setSelectedDay] = useState(new Date());

  const tasksByDay = (day) =>
    tasks.filter(t => t.due_date && t.due_date === format(day, 'yyyy-MM-dd') && !t.is_archived);

  const selectedTasks = tasksByDay(selectedDay).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return (p[a.priority] || 1) - (p[b.priority] || 1);
  });

  const highCount = (day) => tasksByDay(day).filter(t => t.priority === 'high').length;

  return (
    <div className="rounded-xl mb-6 overflow-hidden" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--mizan-border)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
          <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
            {format(weekStart, 'MMM d')} – {format(days[6], 'MMM d')}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}
          >
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {isAr ? 'مهام الأسبوع' : 'Weekly Tasks'}
        </span>
        <Link to="/planner" className="text-xs" style={{ color: 'var(--mizan-emerald)' }}>
          {isAr ? 'المخطط' : 'Planner'}
        </Link>
      </div>

      {/* Days strip */}
      <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--mizan-border)' }}>
        {days.map((day, i) => {
          const dayTasks = tasksByDay(day);
          const urgent = highCount(day);
          const isSelected = isSameDay(day, selectedDay);
          const today = isToday(day);
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(day)}
              className="flex flex-col items-center py-2 px-1 transition-all relative"
              style={{
                background: isSelected ? 'var(--mizan-emerald)' : today ? 'var(--mizan-emerald)10' : 'transparent',
                borderRight: i < 6 ? '1px solid var(--mizan-border)' : 'none',
              }}
            >
              <span className="text-[10px] font-medium mb-1" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--mizan-text-secondary)' }}>
                {isAr ? DAYS_AR[i] : DAYS_EN[i]}
              </span>
              <span className="text-sm font-bold" style={{ color: isSelected ? 'white' : today ? 'var(--mizan-emerald)' : 'var(--mizan-text)' }}>
                {format(day, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <div className="mt-1 flex items-center gap-0.5">
                  {urgent > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'white' : '#C0392B' }} />
                  )}
                  {dayTasks.length - urgent > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--mizan-emerald)' }} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tasks for selected day */}
      <div className="p-3 space-y-2 min-h-[80px]">
        {selectedTasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isAr ? 'لا توجد مهام لهذا اليوم' : 'No tasks for this day'}
            </p>
          </div>
        ) : (
          selectedTasks.slice(0, 5).map(task => {
            const style = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.low;
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: isDone ? 'var(--mizan-elevated)' : style.bg,
                  border: `1px solid ${isDone ? 'var(--mizan-border)' : style.border}`,
                  opacity: isDone ? 0.6 : 1,
                }}
              >
                {isDone
                  ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--mizan-emerald)' }} />
                  : task.priority === 'high'
                    ? <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: style.text }} />
                    : <Circle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: style.dot }} />
                }
                <span className={`flex-1 text-xs font-medium truncate ${isDone ? 'line-through' : ''}`} style={{ color: 'var(--mizan-text)' }}>
                  {task.title}
                </span>
                {task.priority === 'high' && !isDone && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                    {isAr ? 'عاجل' : 'High'}
                  </span>
                )}
              </div>
            );
          })
        )}
        {selectedTasks.length > 5 && (
          <Link to="/planner" className="block text-center text-xs py-1" style={{ color: 'var(--mizan-emerald)' }}>
            +{selectedTasks.length - 5} {isAr ? 'مهام أخرى' : 'more'}
          </Link>
        )}
      </div>
    </div>
  );
}