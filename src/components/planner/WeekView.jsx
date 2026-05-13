import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function WeekView({ tasks, events, onRefresh }) {
  const { t } = useI18n();
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = addDays(startOfWeek(new Date(), { weekStartsOn: 6 }), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleToggle = async (task) => {
    await base44.entities.Task.update(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
    onRefresh();
  };

  return (
    <div>
      {/* Week Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--mizan-text-secondary)' }}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 rounded-lg hover:opacity-70" style={{ color: 'var(--mizan-text-secondary)' }}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.due_date === dateStr);
          const today = isToday(day);
          return (
            <div key={dateStr} className="text-center">
              <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{format(day, 'EEE')}</p>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-medium`} style={{ background: today ? 'var(--mizan-emerald)' : 'transparent', color: today ? 'white' : 'var(--mizan-text)' }}>
                {format(day, 'd')}
              </div>
              {dayTasks.length > 0 && <div className="w-1.5 h-1.5 rounded-full mx-auto" style={{ background: 'var(--mizan-emerald)' }} />}
            </div>
          );
        })}
      </div>

      {/* Task list for week */}
      <div className="space-y-3 mt-4">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter(t => t.due_date === dateStr);
          if (dayTasks.length === 0) return null;
          return (
            <div key={dateStr}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: isToday(day) ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }}>
                {format(day, 'EEEE, MMM d')}
              </p>
              <div className="space-y-1.5">
                {dayTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <button onClick={() => handleToggle(task)}>
                      {task.status === 'completed' ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} /> : <Circle className="w-4 h-4" style={{ color: 'var(--mizan-border)' }} />}
                    </button>
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--mizan-text)', opacity: task.status === 'completed' ? 0.5 : 1, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}