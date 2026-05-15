import { base44 } from '@/api/base44Client';
import { getSnapshot } from './financeService';
import { getUserSummary } from './goalsService';
import { getDailyScore as getSpiritualScore, getStreak } from './spiritualService';
import { getDailyScore as getWellnessScore } from './wellnessService';
import { format } from 'date-fns';

/**
 * Builds a rich context string about the current user to inject before every AI chat message.
 */
export async function buildContext() {
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
    settings,
  ] = await Promise.all([
    base44.auth.me(),
    getSnapshot(currentMonth).catch(() => null),
    getUserSummary().catch(() => null),
    getSpiritualScore(today).catch(() => null),
    getStreak().catch(() => null),
    getWellnessScore(today).catch(() => null),
    base44.entities.Task.filter({ due_date: today }).catch(() => []),
    base44.entities.Settings.list().catch(() => []),
  ]);

  const s = settings?.[0] || {};
  const currency = s.currency_symbol || 'SAR';
  const lang = s.language || 'en';

  const completedTasks = todayTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = todayTasks.filter(t => t.status !== 'completed').length;

  const ctx = `
You are the AmanahLife AI Assistant — a compassionate, knowledgeable life companion integrating Islamic values with modern productivity.
You have access to the user's current life data. Use it to give personalized, actionable advice.
Always respond in ${lang === 'ar' ? 'Arabic' : 'English'}.
Be warm, encouraging, and concise.

=== USER PROFILE ===
Name: ${user?.full_name || 'User'}
Date: ${today}
Currency: ${currency}

=== TODAY'S TASKS ===
Total today: ${todayTasks.length} | Completed: ${completedTasks} | Pending: ${pendingTasks}

=== SPIRITUAL ===
Prayer score today: ${spiritualScore?.score ?? 'N/A'}/100
Prayers completed: ${spiritualScore?.prayerCount ?? 0}/5
Qur'an pages today: ${spiritualScore?.quranPages ?? 0}
Prayer streak: ${spiritualStreak?.streak ?? 0} days

=== FINANCE (${currentMonth}) ===
Income: ${currency} ${financeSnapshot?.totalIncome?.toLocaleString() ?? 0}
Expenses: ${currency} ${financeSnapshot?.totalExpenses?.toLocaleString() ?? 0}
Net Balance: ${currency} ${financeSnapshot?.netBalance?.toLocaleString() ?? 0}
Savings Rate: ${financeSnapshot?.savingsRate?.toFixed(1) ?? 0}%

=== GOALS ===
Active: ${goalsSummary?.activeCount ?? 0} | Completed: ${goalsSummary?.completedCount ?? 0}
Average Progress: ${goalsSummary?.avgProgress ?? 0}%

=== WELLNESS ===
Wellness score today: ${wellnessScore?.score ?? 'Not logged'}/100
Mood: ${wellnessScore?.log?.mood ?? 'Not logged'}
Sleep: ${wellnessScore?.log?.sleep_hours ?? 'N/A'} hours

Respond only to what the user asks. Use the context above only when it adds value to your answer.
`.trim();

  return ctx;
}