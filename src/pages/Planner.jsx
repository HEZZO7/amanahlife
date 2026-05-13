import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PlannerDay from '@/components/planner/PlannerDay';
import PlannerWeek from '@/components/planner/PlannerWeek';
import PlannerAgenda from '@/components/planner/PlannerAgenda';
import AddTaskModal from '@/components/planner/AddTaskModal';
import { Plus, CalendarDays, List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';

const VIEWS = [
  { key: 'day', enLabel: 'Day', arLabel: 'يوم', icon: CalendarDays },
  { key: 'week', enLabel: 'Week', arLabel: 'أسبوع', icon: LayoutGrid },
  { key: 'agenda', enLabel: 'Agenda', arLabel: 'جدول', icon: List },
];

export default function Planner() {
  const { t, language } = useI18n();
  const [view, setView] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 6 }));
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    const [allTasks, allEvents] = await Promise.all([
      base44.entities.Task.list('-due_date', 200),
      base44.entities.Event.list('-start_datetime', 100),
    ]);
    setTasks(allTasks);
    setEvents(allEvents);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const navigateDay = (dir) => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() + dir); return n; });
  const navigateWeek = (dir) => setWeekStart(d => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1));

  const headerLabel = view === 'day'
    ? format(selectedDate, 'EEEE, MMMM d')
    : view === 'week'
    ? `${format(weekStart, 'MMM d')} – ${format(endOfWeek(weekStart, { weekStartsOn: 6 }), 'MMM d, yyyy')}`
    : (language === 'ar' ? 'الجدول' : 'Agenda');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('nav.planner')}
        </h1>
        <Button onClick={() => setShowAdd(true)} size="sm" className="h-9 rounded-lg text-white gap-1.5" style={{ background: 'var(--mizan-emerald)' }}>
          <Plus className="w-3.5 h-3.5" />
          {language === 'ar' ? 'إضافة' : 'Add Task'}
        </Button>
      </div>

      {/* View switcher + nav */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          {VIEWS.map(({ key, enLabel, arLabel, icon: Icon }) => (
            <button key={key} onClick={() => setView(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: view === key ? 'var(--mizan-emerald)' : 'transparent', color: view === key ? 'white' : 'var(--mizan-text-secondary)' }}>
              <Icon className="w-3.5 h-3.5" />
              {language === 'ar' ? arLabel : enLabel}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => view === 'week' ? navigateWeek(-1) : navigateDay(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{headerLabel}</span>
          <button onClick={() => view === 'week' ? navigateWeek(1) : navigateDay(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          {view === 'day' && <PlannerDay date={selectedDate} tasks={tasks} events={events} onReload={load} />}
          {view === 'week' && <PlannerWeek weekStart={weekStart} tasks={tasks} events={events} onSelectDay={d => { setSelectedDate(d); setView('day'); }} />}
          {view === 'agenda' && <PlannerAgenda tasks={tasks} events={events} onReload={load} />}
        </>
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} defaultDate={format(selectedDate, 'yyyy-MM-dd')} />}
    </div>
  );
}