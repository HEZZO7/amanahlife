import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { getProgress } from '@/lib/goalsService';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export default function GoalDetail({ goalId, onBack }) {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMs, setAddingMs] = useState(false);

  const load = async () => {
    const d = await getProgress(goalId);
    setData(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, [goalId]);

  const handleProgressChange = async (val) => {
    await base44.entities.Goal.update(goalId, { progress: val[0] });
    setData(prev => ({ ...prev, goal: { ...prev.goal, progress: val[0] } }));
  };

  const handleToggleMilestone = async (ms) => {
    await base44.entities.Milestone.update(ms.id, { is_completed: !ms.is_completed, completed_at: !ms.is_completed ? new Date().toISOString() : null });
    load();
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.trim()) return;
    await base44.entities.Milestone.create({ goal_id: goalId, title: newMilestone });
    setNewMilestone(''); setAddingMs(false);
    load();
  };

  const handleDeleteMilestone = async (id) => {
    await base44.entities.Milestone.delete(id);
    load();
  };

  if (loading) return <div className="py-12 text-center" style={{ color: 'var(--mizan-text-secondary)' }}>...</div>;
  if (!data) return null;

  const { goal, milestones, milestoneProgress } = data;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-5 text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" />
        {t('onboarding.back')}
      </button>

      <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--mizan-text)' }}>{goal.title}</h2>
      <span className="text-xs capitalize px-2 py-1 rounded-full" style={{ background: 'var(--mizan-emerald)22', color: 'var(--mizan-emerald)' }}>{t(`goal.${goal.category}`)}</span>

      {/* Progress */}
      <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>{t('goals.progress')}</span>
          <span className="text-lg font-bold" style={{ color: 'var(--mizan-emerald)' }}>{Math.round(goal.progress || 0)}%</span>
        </div>
        <Slider value={[goal.progress || 0]} onValueChange={handleProgressChange} max={100} step={1} className="my-2" />
        {milestones.length > 0 && (
          <p className="text-xs mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
            {data.completedMilestones}/{data.totalMilestones} {t('goals.milestones')}
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>{t('goals.milestones')}</h3>
          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" style={{ color: 'var(--mizan-emerald)' }} onClick={() => setAddingMs(true)}>
            <Plus className="w-3.5 h-3.5" />{t('common.add')}
          </Button>
        </div>

        {addingMs && (
          <div className="flex gap-2 mb-3">
            <Input value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder={t('goals.milestonePlaceholder')} className="h-9 text-sm rounded-lg flex-1" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} autoFocus onKeyDown={e => e.key === 'Enter' && handleAddMilestone()} />
            <Button size="sm" className="h-9 text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }} onClick={handleAddMilestone}>{t('settings.save')}</Button>
            <Button size="sm" variant="ghost" className="h-9" onClick={() => setAddingMs(false)}>{t('common.cancel')}</Button>
          </div>
        )}

        <div className="space-y-2">
          {milestones.map(ms => (
            <div key={ms.id} className="flex items-center gap-3 p-3 rounded-lg group" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <button onClick={() => handleToggleMilestone(ms)}>
                {ms.is_completed
                  ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--mizan-emerald)' }} />
                  : <Circle className="w-5 h-5" style={{ color: 'var(--mizan-border)' }} />
                }
              </button>
              <span className="text-sm flex-1" style={{ color: 'var(--mizan-text)', textDecoration: ms.is_completed ? 'line-through' : 'none', opacity: ms.is_completed ? 0.6 : 1 }}>{ms.title}</span>
              <button onClick={() => handleDeleteMilestone(ms.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
              </button>
            </div>
          ))}
          {milestones.length === 0 && !addingMs && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--mizan-text-secondary)' }}>{t('goals.noMilestones')}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {goal.notes && (
        <div className="mt-5 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm" style={{ color: 'var(--mizan-text)' }}>{goal.notes}</p>
        </div>
      )}
    </div>
  );
}