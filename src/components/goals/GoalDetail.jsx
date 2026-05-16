import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { getProgress } from '@/lib/goalsService';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoalTimeline from '@/components/goals/GoalTimeline';

export default function GoalDetail({ goalId, onBack }) {
  const { t, language } = useI18n();
  const lang = language || 'ar';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [addingMs, setAddingMs] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'timeline'

  const [linkedTasks, setLinkedTasks] = useState([]);

  const load = async () => {
    const [d, tasks] = await Promise.all([
      getProgress(goalId),
      base44.entities.Task.filter({ goal_id: goalId }, '-created_date', 50),
    ]);
    setData(d);
    setLinkedTasks(tasks || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [goalId]);

  // Compute progress from milestones + linked tasks combined
  const computedProgress = (milestones, tasks) => {
    const allItems = [...(milestones || []), ...(tasks || [])];
    if (allItems.length === 0) return null;
    const completed = allItems.filter(i => i.is_completed === true || i.status === 'completed').length;
    return Math.round((completed / allItems.length) * 100);
  };

  const handleToggleMilestone = async (ms) => {
    await base44.entities.Milestone.update(ms.id, {
      is_completed: !ms.is_completed,
      completed_at: !ms.is_completed ? new Date().toISOString() : null,
    });
    const [d, tasks] = await Promise.all([
      getProgress(goalId),
      base44.entities.Task.filter({ goal_id: goalId }, '-created_date', 50),
    ]);
    const autoProgress = computedProgress(d.milestones, tasks);
    if (autoProgress !== null) {
      await base44.entities.Goal.update(goalId, { progress: autoProgress });
      d.progress = autoProgress;
    }
    setData(d);
    setLinkedTasks(tasks || []);
  };

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await base44.entities.Task.update(task.id, { status: newStatus });
    // The automation will handle progress sync, but we also update locally
    const [d, tasks] = await Promise.all([
      getProgress(goalId),
      base44.entities.Task.filter({ goal_id: goalId }, '-created_date', 50),
    ]);
    const autoProgress = computedProgress(d.milestones, tasks);
    if (autoProgress !== null) d.progress = autoProgress;
    setData(d);
    setLinkedTasks(tasks || []);
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.trim()) return;
    await base44.entities.Milestone.create({
      goal_id: goalId,
      title: newMilestone,
      due_date: newDueDate || undefined,
    });
    setNewMilestone('');
    setNewDueDate('');
    setAddingMs(false);
    const [d, tasks] = await Promise.all([
      getProgress(goalId),
      base44.entities.Task.filter({ goal_id: goalId }, '-created_date', 50),
    ]);
    const autoProgress = computedProgress(d.milestones, tasks);
    if (autoProgress !== null) {
      await base44.entities.Goal.update(goalId, { progress: autoProgress });
      d.progress = autoProgress;
    }
    setData(d);
    setLinkedTasks(tasks || []);
  };

  const handleDeleteMilestone = async (id) => {
    await base44.entities.Milestone.delete(id);
    const [d, tasks] = await Promise.all([
      getProgress(goalId),
      base44.entities.Task.filter({ goal_id: goalId }, '-created_date', 50),
    ]);
    const autoProgress = computedProgress(d.milestones, tasks);
    if (autoProgress !== null) {
      await base44.entities.Goal.update(goalId, { progress: autoProgress });
      d.progress = autoProgress;
    }
    setData(d);
    setLinkedTasks(tasks || []);
  };

  if (loading) return <div className="py-12 text-center" style={{ color: 'var(--mizan-text-secondary)' }}>...</div>;
  if (!data) return null;

  const goal = data;
  const milestones = data.milestones || [];
  const progress = goal.progress || 0;
  const allItems = [...milestones, ...linkedTasks];
  const completedCount = allItems.filter(i => i.is_completed === true || i.status === 'completed').length;

  const CAT_COLORS = { personal: '#0B5B50', financial: '#B89A5E', spiritual: '#12897A', family: '#0B5B50', health: '#27AE60' };
  const color = CAT_COLORS[goal.category] || 'var(--mizan-emerald)';

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-5 text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" />
        {t('onboarding.back')}
      </button>

      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--mizan-text)' }}>{goal.title}</h2>
      <span className="text-xs capitalize px-2 py-1 rounded-full" style={{ background: color + '22', color }}>{t(`goal.${goal.category}`)}</span>

      {/* Progress Card */}
      <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{t('goals.progress')}</span>
          <span className="text-lg font-bold" style={{ color }}>{Math.round(progress)}%</span>
        </div>
        {/* Progress bar */}
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--mizan-border)' }}>
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%`, background: color }}
          />
        </div>
        {allItems.length > 0 && (
          <p className="text-xs mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {completedCount}/{allItems.length} {lang === 'ar' ? 'بند مكتمل' : 'items completed'}
            <span className="mx-1 opacity-50">·</span>
            {lang === 'ar' ? 'يُحسب تلقائياً من المراحل والمهام' : 'Auto-calculated from milestones & tasks'}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mt-5 p-1 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        {['tasks', 'timeline'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: activeTab === tab ? color : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--mizan-text-secondary)',
            }}
          >
            {tab === 'tasks'
              ? (lang === 'ar' ? 'المهام الفرعية' : 'Sub-tasks')
              : (lang === 'ar' ? 'الجدول الزمني' : 'Timeline')}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
              {t('goals.milestones')}
            </h3>
            <Button
              size="sm" variant="ghost" className="h-8 gap-1 text-xs"
              style={{ color: 'var(--mizan-emerald)' }}
              onClick={() => setAddingMs(true)}
            >
              <Plus className="w-3.5 h-3.5" />{t('common.add')}
            </Button>
          </div>

          {addingMs && (
            <div className="p-3 rounded-xl mb-3 space-y-2" style={{ background: 'var(--mizan-surface)', border: `1px solid ${color}44` }}>
              <Input
                value={newMilestone}
                onChange={e => setNewMilestone(e.target.value)}
                placeholder={t('goals.milestonePlaceholder')}
                className="h-9 text-sm rounded-lg"
                style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
              />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }} />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  className="flex-1 h-9 text-sm rounded-lg px-3 outline-none"
                  style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', color: 'var(--mizan-text)' }}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-9 text-white rounded-lg" style={{ background: color }} onClick={handleAddMilestone}>{t('settings.save')}</Button>
                <Button size="sm" variant="ghost" className="h-9" onClick={() => { setAddingMs(false); setNewMilestone(''); setNewDueDate(''); }}>{t('common.cancel')}</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {milestones.map(ms => (
              <div key={ms.id} className="flex items-center gap-3 p-3 rounded-lg group" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                <button onClick={() => handleToggleMilestone(ms)}>
                  {ms.is_completed
                    ? <CheckCircle2 className="w-5 h-5" style={{ color }} />
                    : <Circle className="w-5 h-5" style={{ color: 'var(--mizan-border)' }} />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm block" style={{ color: 'var(--mizan-text)', textDecoration: ms.is_completed ? 'line-through' : 'none', opacity: ms.is_completed ? 0.6 : 1 }}>
                    {ms.title}
                  </span>
                  {ms.due_date && (
                    <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>📅 {ms.due_date}</span>
                  )}
                </div>
                <button onClick={() => handleDeleteMilestone(ms.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
                </button>
              </div>
            ))}

            {/* Linked Tasks */}
            {linkedTasks.length > 0 && (
              <>
                {(milestones.length > 0) && (
                  <p className="text-xs font-semibold pt-2 pb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {lang === 'ar' ? '📌 المهام المرتبطة' : '📌 Linked Tasks'}
                  </p>
                )}
                {linkedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                    <button onClick={() => handleToggleTask(task)}>
                      {task.status === 'completed'
                        ? <CheckCircle2 className="w-5 h-5" style={{ color }} />
                        : <Circle className="w-5 h-5" style={{ color: 'var(--mizan-border)' }} />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm block" style={{ color: 'var(--mizan-text)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.6 : 1 }}>
                        {task.title}
                      </span>
                      {task.due_date && (
                        <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>📅 {task.due_date}</span>
                      )}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}>
                      {lang === 'ar' ? 'مهمة' : 'task'}
                    </span>
                  </div>
                ))}
              </>
            )}

            {milestones.length === 0 && linkedTasks.length === 0 && !addingMs && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--mizan-text-secondary)' }}>{t('goals.noMilestones')}</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        milestones.length === 0
          ? <p className="text-sm text-center py-8" style={{ color: 'var(--mizan-text-secondary)' }}>
              {lang === 'ar' ? 'لا توجد مهام بعد' : 'No tasks yet'}
            </p>
          : <GoalTimeline milestones={milestones} />
      )}

      {/* Notes */}
      {goal.notes && (
        <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm" style={{ color: 'var(--mizan-text)' }}>{goal.notes}</p>
        </div>
      )}
    </div>
  );
}