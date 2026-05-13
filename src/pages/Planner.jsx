import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TaskList from '@/components/planner/TaskList';
import WeekView from '@/components/planner/WeekView';
import CalendarView from '@/components/planner/CalendarView';
import AddTaskModal from '@/components/planner/AddTaskModal';

const VIEWS = ['list', 'week', 'calendar'];

export default function Planner() {
  const { t } = useI18n();
  const [view, setView] = useState('list');
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const load = async () => {
    const [allTasks, allEvents] = await Promise.all([
      base44.entities.Task.list('-due_date', 200),
      base44.entities.Event.list('-start_datetime', 100),
    ]);
    setTasks(allTasks);
    setEvents(allEvents);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>{t('nav.planner')}</h1>
        <Button size="sm" className="h-9 rounded-lg gap-1.5 text-white" style={{ background: 'var(--mizan-emerald)' }} onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />{t('common.add')}
        </Button>
      </div>

      {/* View Switcher */}
      <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ background: 'var(--mizan-surface)' }}>
        {VIEWS.map(v => (
          <button key={v} onClick={() => setView(v)} className="px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ background: view === v ? 'var(--mizan-emerald)' : 'transparent', color: view === v ? 'white' : 'var(--mizan-text-secondary)' }}>
            {t(`planner.${v}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          {view === 'list' && <TaskList tasks={tasks} selectedDate={selectedDate} onDateChange={setSelectedDate} onRefresh={load} />}
          {view === 'week' && <WeekView tasks={tasks} events={events} onRefresh={load} />}
          {view === 'calendar' && <CalendarView tasks={tasks} events={events} selectedDate={selectedDate} onDateChange={setSelectedDate} onRefresh={load} />}
        </>
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(null)} onSaved={() => { setShowAdd(false); load(); }} defaultDate={selectedDate} />}
    </div>
  );
}