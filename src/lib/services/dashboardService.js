import { format } from 'date-fns';
import { getSnapshot } from './financeService';
import { getUserSummary } from './goalsService';
import { getDailyScore as getSpiritualScore, getStreak } from './spiritualService';
import { getDailyScore as getWellnessScore } from './wellnessService';
import { base44 } from '@/api/base44Client';

/**
 * Builds the complete dashboard payload by running all services in parallel.
 */
export async function buildDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const month = format(new Date(), 'yyyy-MM');

  const [finance, goals, spiritual, spiritualStreak, wellness, tasks, aiInsights] = await Promise.all([
    getSnapshot(month),
    getUserSummary(),
    getSpiritualScore(today),
    getStreak(),
    getWellnessScore(today),
    base44.entities.Task.filter({ due_date: today }),
    base44.entities.AIInsight.filter({ is_dismissed: false }),
  ]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return {
    today,
    finance,
    goals,
    spiritual,
    spiritualStreak,
    wellness,
    tasks: {
      today: tasks,
      completed: completedTasks,
      total: tasks.length,
    },
    aiInsights: aiInsights.slice(0, 3),
  };
}