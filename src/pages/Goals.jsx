import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { getUserSummary } from '@/lib/goalsService';
import { base44 } from '@/api/base44Client';
import { Plus, Target, CheckCircle2, Pause, ChevronRight, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GoalCard from '@/components/goals/GoalCard';
import GoalDetail from '@/components/goals/GoalDetail';
import GoalsProgressChart from '@/components/goals/GoalsProgressChart';
import GoalMilestones from '@/components/goals/GoalMilestones';

export default function Goals() {
  const { t } = useI18n();
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('personal');

  const CATEGORIES = ['personal', 'financial', 'spiritual', 'family', 'health'];

  const load = () => {
    setLoading(true);
    Promise.all([
      getUserSummary(),
      base44.entities.Task.list('-created_date', 200),
    ])
      .then(([s, t]) => { setSummary(s); setTasks(t); })
      .catch(err => console.error('Goals load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAddGoal = async () => {
    if (!newTitle.trim()) return;
    await base44.entities.Goal.create({ title: newTitle, category: newCategory, status: 'active', progress: 0 });
    setNewTitle(''); setShowAdd(false);
    load();
  };

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-10 w-40" />
      {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
    </div>
  );

  const goals = (summary?.goals || []).filter(g => filter === 'all' || g.status === filter);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {selectedGoal ? (
        <GoalDetail goalId={selectedGoal} onBack={() => { setSelectedGoal(null); load(); }} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>{t('nav.goals')}</h1>
            <Button size="sm" className="h-9 rounded-lg gap-1.5 text-white" style={{ background: 'var(--mizan-emerald)' }} onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" />{t('common.add')}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: t('goals.active'), value: summary?.active || 0, icon: Target, color: 'var(--mizan-emerald)' },
              { label: t('goals.completed'), value: summary?.completed || 0, icon: CheckCircle2, color: 'var(--mizan-green)' },
              { label: t('goals.paused'), value: summary?.paused || 0, icon: Pause, color: 'var(--mizan-gold)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-4 rounded-xl text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
                <p className="text-xl font-bold" style={{ color: 'var(--mizan-text)' }}>{value}</p>
                <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Progress Chart */}
          {(summary?.goals || []).length > 0 && <GoalsProgressChart goals={summary.goals} tasks={tasks} />}

          {/* Filter */}
          <div className="flex gap-2 mb-5">
            {['active', 'completed', 'paused', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{ background: filter === f ? 'var(--mizan-emerald)' : 'var(--mizan-surface)', color: filter === f ? 'white' : 'var(--mizan-text-secondary)', border: `1px solid ${filter === f ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}>
                {t(`goals.${f}`)}
              </button>
            ))}
          </div>

          {/* Add Goal Inline */}
          {showAdd && (
            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-emerald)' }}>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t('onboarding.goalPlaceholder')} className="mb-3 h-10 rounded-lg" style={{ background: 'var(--mizan-elevated)', borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }} autoFocus onKeyDown={e => e.key === 'Enter' && handleAddGoal()} />
              <div className="flex flex-wrap gap-2 mb-3">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setNewCategory(c)} className="px-3 py-1 rounded-full text-xs capitalize transition-all" style={{ background: newCategory === c ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)', color: newCategory === c ? 'white' : 'var(--mizan-text-secondary)', border: `1px solid ${newCategory === c ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}` }}>{t(`goal.${c}`)}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-9 text-white rounded-lg" style={{ background: 'var(--mizan-emerald)' }} onClick={handleAddGoal}>{t('settings.save')}</Button>
                <Button size="sm" variant="ghost" className="h-9" onClick={() => setShowAdd(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="text-center py-16 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 opacity-40">
                <polygon points="32,4 60,48 4,48" fill="none" stroke="var(--mizan-emerald)" strokeWidth="1.5"/>
                <polygon points="32,14 50,44 14,44" fill="none" stroke="var(--mizan-gold)" strokeWidth="1" opacity="0.5"/>
                <line x1="32" y1="20" x2="32" y2="36" stroke="var(--mizan-emerald)" strokeWidth="1.5"/>
                <circle cx="32" cy="40" r="1.5" fill="var(--mizan-emerald)"/>
              </svg>
              <p className="text-base font-semibold mb-1" style={{ color: 'var(--mizan-text)' }}>{t('goals.empty')}</p>
              <p className="text-sm mb-5" style={{ color: 'var(--mizan-text-secondary)' }}>
                {t('goals.emptyHint')}
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--mizan-emerald)' }}
              >
                + {t('common.add')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoal(goal.id)} onRefresh={load} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}