import { base44 } from '@/api/base44Client';

/**
 * Returns progress details for a single goal including its milestones.
 */
export async function getProgress(goal_id) {
  const [goal, milestones] = await Promise.all([
    base44.entities.Goal.filter({ id: goal_id }),
    base44.entities.Milestone.filter({ goal_id }),
  ]);

  const g = goal[0] || null;
  if (!g) return null;

  const total = milestones.length;
  const completed = milestones.filter(m => m.is_completed).length;
  const milestonePercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Use stored progress field, or derive from milestones
  const progress = total > 0 ? milestonePercent : (g.progress || 0);

  return {
    ...g,
    milestones,
    milestoneTotal: total,
    milestoneCompleted: completed,
    progress,
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

  const byCategory = {};
  goals.forEach(g => {
    if (!byCategory[g.category]) byCategory[g.category] = { total: 0, active: 0, completed: 0 };
    byCategory[g.category].total++;
    if (g.status === 'active') byCategory[g.category].active++;
    if (g.status === 'completed') byCategory[g.category].completed++;
  });

  const avgProgress = active.length > 0
    ? Math.round(active.reduce((s, g) => s + (g.progress || 0), 0) / active.length)
    : 0;

  return {
    total: goals.length,
    activeCount: active.length,
    completedCount: completed.length,
    pausedCount: paused.length,
    avgProgress,
    byCategory,
    goals,
    activeGoals: active,
    completedGoals: completed,
  };
}