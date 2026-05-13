import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { CheckCircle2, Circle, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const PRIORITY_COLORS = { high: 'var(--mizan-red)', medium: 'var(--mizan-gold)', low: 'var(--mizan-emerald)' };

function groupByDate(tasks) {
  const groups = {};
  tasks.forEach(task => {
    const d = task.due_date || 'no-date';
    if (!groups[d]) groups[d] = [];
    groups[d].push(task);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function dateLabel(dateStr, t) {
  if (dateStr === 'no-date') return t('planner.noDate');
  const d = parseISO(dateStr);
  if (isToday(d)) return t('planner.today');
  if (isTomorrow(d)) return t('planner.tomorrow');
  return format(d, 'EEEE, MMM d');
}

export default function TaskList({ tasks, onRefresh }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState('pending');
  const [collapsed, setCollapsed] = useState({});

  const filtered = filter === 'all' ? tasks : tasks.filter(t => filter === 'completed' ? t.status === 'completed' : t.status !== 'completed');
  const groups = groupByDate(filtered);

  const handleToggle = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await base44.entities.Task.update(task.id, { status: newStatus });
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.Task.delete(id);
    onRefresh();
  };

  const toggleCollapse = (date) => setCollapsed(prev => ({ ...prev, [date]: !prev[date] }));

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2">
        {['pending', 'completed', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{ background: filter === f ? 'var(--mizan-emerald)' : 'var(--mizan-surface)', color: filter === f ? 'white' : 'var(--mizan-text-secondary)', border: `1px solid ${filter === f ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}>
            {t(`planner.${f}`)}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>{t('planner.noTasks')}</p>
        </div>
      ) : (
        groups.map(([date, dateTasks]) => (
          <div key={date}>
            <button onClick={() => toggleCollapse(date)} className="flex items-center gap-2 mb-2 w-full text-left">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--mizan-text-secondary)' }}>{dateLabel(date, t)}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}>{dateTasks.length}</span>
              {collapsed[date] ? <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--mizan-text-secondary)' }} /> : <ChevronUp className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--mizan-text-secondary)' }} />}
            </button>
            {!collapsed[date] && (
              <div className="space-y-2">
                {dateTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl group" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <button onClick={() => handleToggle(task)} className="flex-shrink-0">
                      {task.status === 'completed'
                        ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--mizan-emerald)' }} />
                        : <Circle className="w-5 h-5" style={{ color: 'var(--mizan-border)' }} />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--mizan-text)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.5 : 1 }}>{task.title}</p>
                      {task.due_time && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--mizan-text-secondary)' }}><Clock className="w-3 h-3" />{task.due_time}</p>}
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[task.priority] || 'var(--mizan-border)' }} />
                    <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}