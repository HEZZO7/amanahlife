import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Trash2, Clock } from 'lucide-react';
import { formatHijriDate, getIslamicEventsForDate, getSunnahFastsForDate } from '@/lib/hijriUtils';
import IslamicEventPill from './IslamicEventPill';
import SunnahDot from './SunnahDot';

const PRIORITY_COLOR = { high: '#C0392B', medium: '#B89A5E', low: '#8A9B97' };

export default function PlannerDay({ date, tasks, events, onReload }) {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(t => t.due_date === dateStr);
  const dayEvents = events.filter(e => e.start_datetime?.startsWith(dateStr));

  const showHijri = settings?.show_hijri_calendar !== false;
  const showIslamicEvents = settings?.show_islamic_events !== false;

  const islamicEvents = showIslamicEvents ? getIslamicEventsForDate(date, language) : [];
  const sunnahFasts = showIslamicEvents ? getSunnahFastsForDate(date, language) : [];

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await base44.entities.Task.update(task.id, { status: newStatus });
    onReload();
  };

  const handleDelete = async (id) => {
    await base44.entities.Task.delete(id);
    onReload();
  };

  return (
    <div className="space-y-4">
      {/* Hijri date */}
      {showHijri && (
        <p className="text-xs" style={{ color: '#6B7280' }}>
          {formatHijriDate(date, language)}
        </p>
      )}

      {/* Islamic events */}
      {islamicEvents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {islamicEvents.map((ev, i) => <IslamicEventPill key={i} event={ev} />)}
        </div>
      )}

      {/* Sunnah suggestions */}
      {sunnahFasts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sunnahFasts.map((s, i) => <SunnahDot key={i} suggestion={s} />)}
        </div>
      )}

      {/* Events */}
      {dayEvents.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'الأحداث' : 'Events'}
          </p>
          <div className="space-y-2">
            {dayEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                <div className="w-1 h-10 rounded-full" style={{ background: 'var(--mizan-gold)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{ev.title}</p>
                  {ev.start_datetime && (
                    <p className="text-xs flex items-center gap-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                      <Clock className="w-3 h-3" />
                      {format(new Date(ev.start_datetime), 'HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'المهام' : 'Tasks'} {dayTasks.length > 0 && `(${dayTasks.filter(t => t.status === 'completed').length}/${dayTasks.length})`}
        </p>
        {dayTasks.length === 0 && !dayEvents.length && islamicEvents.length === 0 && sunnahFasts.length === 0 && (
          <div className="py-12 text-center rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <p style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'لا توجد مهام لهذا اليوم' : 'No tasks for this day'}</p>
          </div>
        )}
        {dayTasks.length > 0 && (
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
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--mizan-text)' }}>{task.title}</p>
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
        )}
      </div>
    </div>
  );
}