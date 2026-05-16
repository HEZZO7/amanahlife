import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { formatHijriDate } from '@/lib/hijriUtils';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';

const PRIORITY_COLOR = { high: '#C0392B', medium: '#B89A5E', low: '#8A9B97' };

function groupByDate(tasks) {
  const map = {};
  tasks.forEach(t => {
    if (!t.due_date) return;
    if (!map[t.due_date]) map[t.due_date] = [];
    map[t.due_date].push(t);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

function dayLabel(dateStr, language) {
  const d = new Date(dateStr);
  if (isToday(d)) return language === 'ar' ? 'اليوم' : 'Today';
  if (isTomorrow(d)) return language === 'ar' ? 'غداً' : 'Tomorrow';
  return format(d, 'EEEE, MMMM d');
}

export default function PlannerAgenda({ tasks, events, onReload }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const showHijri = settings?.show_hijri_calendar !== false;
  const pending = tasks.filter(t => t.status !== 'completed');
  const groups = groupByDate(pending);

  const handleToggle = async (task) => {
    await base44.entities.Task.update(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
    onReload();
  };

  const handleDelete = async (id) => {
    await base44.entities.Task.delete(id);
    onReload();
  };

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center" style={{ color: 'var(--mizan-text-secondary)' }}>
        {language === 'ar' ? 'لا توجد مهام قادمة' : 'No upcoming tasks'}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(([dateStr, dayTasks]) => {
        const overdue = isPast(new Date(dateStr)) && !isToday(new Date(dateStr));
        return (
          <div key={dateStr}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: overdue ? 'var(--mizan-red)' : 'var(--mizan-emerald)' }}>
                {dayLabel(dateStr, language)}
              </span>
              {showHijri && (
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  {formatHijriDate(new Date(dateStr), language)}
                </span>
              )}
              {overdue && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(192,57,43,0.1)', color: 'var(--mizan-red)' }}>
                {language === 'ar' ? 'متأخر' : 'Overdue'}
              </span>}
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)' }}>
              <div className="divide-y" style={{ borderColor: 'var(--mizan-border)' }}>
                {dayTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--mizan-surface)' }}>
                    <button onClick={() => handleToggle(task)}>
                      {task.status === 'completed'
                        ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--mizan-emerald)' }} />
                        : <Circle className="w-5 h-5" style={{ color: 'var(--mizan-border)' }} />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{task.title}</p>
                      {task.due_time && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--mizan-text-secondary)' }}><Clock className="w-3 h-3" />{task.due_time}</p>}
                    </div>
                    <div className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLOR[task.priority] || '#8A9B97' }} />
                    <button onClick={() => handleDelete(task.id)}>
                      <Trash2 className="w-3.5 h-3.5 opacity-40" style={{ color: 'var(--mizan-text-secondary)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}