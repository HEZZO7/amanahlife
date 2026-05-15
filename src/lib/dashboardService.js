import { base44 } from '@/api/base44Client';
import { getSnapshot } from './financeService';
import { getUserSummary } from './goalsService';
import { getDailyScore as getSpiritualScore, getStreak } from './spiritualService';
import { getDailyScore as getWellnessScore } from './wellnessService';
import { format } from 'date-fns';

/**
 * Builds the complete dashboard data for the current user.
 * Runs all 6 service functions in parallel.
 */
export async function build() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const [
    user,
    financeSnapshot,
    goalsSummary,
    spiritualScore,
    spiritualStreak,
    wellnessScore,
    todayTasks,
    todayPrayers,
    recentInsights,
  ] = await Promise.all([
    base44.auth.me(),
    getSnapshot(currentMonth),
    getUserSummary(),
    getSpiritualScore(today),
    getStreak(),
    getWellnessScore(today),
    base44.entities.Task.filter({ due_date: today }),
    base44.entities.PrayerLog.filter({ date: today }),
    base44.entities.AIInsight.filter({ is_dismissed: false }),
  ]);

  const completedTasks = todayTasks.filter(t => t.status === 'completed').length;

  // Overall life score (0–100): composite of spiritual, wellness, finance, goals
  const financeScore = Math.min(100, financeSnapshot.netBalance > 0 ? 70 + Math.min(30, Math.round(financeSnapshot.netBalance / 1000)) : Math.max(0, 50 + Math.round(financeSnapshot.netBalance / 500)));
  const goalsScore = goalsSummary.avgProgress || 0;
  const lifeScore = Math.round(
    (spiritualScore.score * 0.3) +
    (wellnessScore.score * 0.25) +
    (financeScore * 0.25) +
    (goalsScore * 0.2)
  );

  return {
    user,
    today,
    lifeScore,
    finance: financeSnapshot,
    goals: goalsSummary,
    spiritual: {
      ...spiritualScore,
      streak: spiritualStreak.streak,
      history: spiritualStreak.history,
    },
    wellness: wellnessScore,
    tasks: {
      today: todayTasks,
      completed: completedTasks,
      total: todayTasks.length,
    },
    aiInsights: recentInsights.slice(0, 3),
  };
}