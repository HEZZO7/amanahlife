import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PlannerDay from '@/components/planner/PlannerDay';
import PlannerWeek from '@/components/planner/PlannerWeek';
import PlannerAgenda from '@/components/planner/PlannerAgenda';
import PlannerMonth from '@/components/planner/PlannerMonth';
import WeeklySummary from '@/components/planner/WeeklySummary';
import CompletionDashboard from '@/components/planner/CompletionDashboard';
import OverdueTasksBanner from '@/components/planner/OverdueTasksBanner';
import AddTaskModal from '@/components/planner/AddTaskModal';
import TaskFilters from '@/components/planner/TaskFilters';
import TaskTemplateModal from '@/components/planner/TaskTemplateModal';
import { Plus, CalendarDays, List, LayoutGrid, ChevronLeft, ChevronRight, SlidersHorizontal, LayoutTemplate, Calendar } from 'lucide-react';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { formatHijriDate } from '@/lib/hijriUtils';

const VIEWS = [
  { key: 'day', enLabel: 'Day', arLabel: 'يوم', icon: CalendarDays },
  { key: 'week', enLabel: 'Week', arLabel: 'أسبوع', icon: LayoutGrid },
  { key: 'month', enLabel: 'Month', arLabel: 'شهر', icon: Calendar },
  { key: 'agenda', enLabel: 'Agenda', arLabel: 'جدول', icon: List },
];

export default function Planner() {
  const { t, language } = useI18n();
  const { settings } = useUserSettings();
  const [view, setView] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 6 }));
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ priority: 'all', status: 'all', todayOnly: false });
  const [hideBanner, setHideBanner] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.Task.list('-due_date', 200),
      base44.entities.Event.list('-start_datetime', 100),
    ])
      .then(([allTasks, allEvents]) => { setTasks(allTasks); setEvents(allEvents); })
      .catch(err => console.error('Planner load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const navigateDay = (dir) => setSelectedDate(d => { const n = new Date(d); n.setDate(d.getDate() + dir); return n; });
  const navigateWeek = (dir) => setWeekStart(d => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1));
  const navigateMonth = (dir) => setSelectedDate(d => { const n = new Date(d); n.setMonth(d.getMonth() + dir); return n; });

  const applyFilters = (taskList, f, forDate) => {
    let result = [...taskList];
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (f.todayOnly) result = result.filter(t => t.due_date === todayStr);
    if (f.priority !== 'all') result = result.filter(t => t.priority === f.priority);
    if (f.status !== 'all') result = result.filter(t => t.status === f.status);
    return result;
  };

  const headerLabel = view === 'day'
    ? format(selectedDate, 'EEEE, MMMM d')
    : view === 'week'
    ? `${format(weekStart, 'MMM d')} – ${format(endOfWeek(weekStart, { weekStartsOn: 6 }), 'MMM d, yyyy')}`
    : view === 'month'
    ? format(selectedDate, language === 'ar' ? 'MMMM yyyy' : 'MMMM yyyy')
    : (language === 'ar' ? 'الجدول' : 'Agenda');

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('nav.planner')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all"
            style={{
              background: (filters.priority !== 'all' || filters.status !== 'all' || filters.todayOnly) ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
              color: (filters.priority !== 'all' || filters.status !== 'all' || filters.todayOnly) ? 'white' : 'var(--mizan-text-secondary)',
              border: '1px solid var(--mizan-border)',
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {language === 'ar' ? 'تصفية' : 'Filter'}
            {(filters.priority !== 'all' || filters.status !== 'all' || filters.todayOnly) && (
              <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: 'white', color: 'var(--mizan-emerald)' }}>
                {[filters.priority !== 'all', filters.status !== 'all', filters.todayOnly].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowTemplate(true)}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-sm font-medium transition-all"
            style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text-secondary)', border: '1px solid var(--mizan-border)' }}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            {language === 'ar' ? 'قالب' : 'Template'}
          </button>
          <Button onClick={() => setShowAdd(true)} size="sm" className="h-9 rounded-lg text-white gap-1.5" style={{ background: 'var(--mizan-emerald)' }}>
            <Plus className="w-3.5 h-3.5" />
            {language === 'ar' ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </div>

      {/* View switcher + nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '4px',
          borderRadius: '12px',
          background: 'var(--mizan-surface)',
          border: '1px solid var(--mizan-border)',
          flexShrink: 0
        }}>
          {VIEWS.map(({ key, enLabel, arLabel, icon: Icon }) => (
            <button key={key} onClick={() => setView(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s',
                background: view === key ? 'var(--mizan-emerald)' : 'transparent',
                color: view === key ? 'white' : 'var(--mizan-text-secondary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
              <Icon style={{ width: '14px', height: '14px' }} />
              {language === 'ar' ? arLabel : enLabel}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
          flex: '1 1 auto',
          minWidth: '200px'
        }}>
          <button onClick={() => view === 'week' ? navigateWeek(-1) : view === 'month' ? navigateMonth(-1) : navigateDay(-1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--mizan-surface)',
              border: '1px solid var(--mizan-border)',
              cursor: 'pointer',
              flexShrink: 0
            }}>
            <ChevronLeft style={{ width: '16px', height: '16px', color: 'var(--mizan-text-secondary)' }} />
          </button>
          <div style={{
            textAlign: 'center',
            minWidth: '150px',
            flex: '1 1 auto'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--mizan-text)',
              display: 'block',
              wordBreak: 'break-word'
            }}>{headerLabel}</span>
            {view === 'day' && settings?.show_hijri_calendar !== false && (
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: '2px 0 0 0',
                wordBreak: 'break-word'
              }}>{formatHijriDate(selectedDate, language)}</p>
            )}
          </div>
          <button onClick={() => view === 'week' ? navigateWeek(1) : view === 'month' ? navigateMonth(1) : navigateDay(1)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--mizan-surface)',
              border: '1px solid var(--mizan-border)',
              cursor: 'pointer',
              flexShrink: 0
            }}>
            <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--mizan-text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Overdue Tasks Banner */}
      {!hideBanner && <OverdueTasksBanner tasks={tasks} onDismiss={() => setHideBanner(true)} />}

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-4">
          <TaskFilters filters={filters} onChange={setFilters} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          {view === 'week' && <WeeklySummary tasks={tasks} weekStart={weekStart} />}
          {view === 'month' && <CompletionDashboard tasks={tasks} />}
          {view === 'day' && <PlannerDay date={selectedDate} tasks={applyFilters(tasks, filters, selectedDate)} events={events} onReload={load} />}
          {view === 'week' && <PlannerWeek weekStart={weekStart} tasks={applyFilters(tasks, filters)} events={events} onSelectDay={d => { setSelectedDate(d); setView('day'); }} />}
          {view === 'month' && <PlannerMonth month={selectedDate} tasks={tasks} events={events} onSelectDay={d => { setSelectedDate(d); setView('day'); }} />}
          {view === 'agenda' && <PlannerAgenda tasks={applyFilters(tasks, filters)} events={events} onReload={load} />}
        </>
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); load(); }} defaultDate={format(selectedDate, 'yyyy-MM-dd')} />}
      {showTemplate && <TaskTemplateModal onClose={() => setShowTemplate(false)} onSave={() => { setShowTemplate(false); load(); }} defaultDate={format(selectedDate, 'yyyy-MM-dd')} language={language} />}
    </div>
  );
}