import { base44 } from '@/api/base44Client';

/**
 * Returns progress details for a single goal.
 */
export async function getProgress(goalId) {
  const [goal, milestones] = await Promise.all([
    base44.entities.Goal.filter({ id: goalId }).then(r => r[0]),
    base44.entities.Milestone.filter({ goal_id: goalId }),
  ]);

  if (!goal) return null;

  const total = milestones.length;
  const completed = milestones.filter(m => m.is_completed).length;
  const milestoneProgress = total > 0 ? (completed / total) * 100 : goal.progress || 0;

  return {
    goal,
    milestones,
    milestoneProgress,
    completedMilestones: completed,
    totalMilestones: total,
  };
}

/**
 * Returns a summary of all goals for the current user.
 */
export async function getUserSummary() {
  const goals = await base44.entities.Goal.list('-created_date', 100);

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');
  const paused = goals.filter(g => g.status === 'paused');

  const avgProgress = active.length > 0
    ? active.reduce((s, g) => s + (g.progress || 0), 0) / active.length
    : 0;

  const byCategory = {};
  goals.forEach(g => {
    byCategory[g.category] = (byCategory[g.category] || 0) + 1;
  });

  return {
    total: goals.length,
    active: active.length,
    completed: completed.length,
    paused: paused.length,
    avgProgress,
    byCategory,
    goals,
    activeGoals: active,
  };
}