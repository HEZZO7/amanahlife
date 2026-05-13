import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';

const MOOD_SCORES = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };

/**
 * Returns a wellness score for a given date.
 */
export async function getDailyScore(date) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  const logs = await base44.entities.WellnessLog.filter({ date: targetDate });
  const log = logs[0] || null;

  if (!log) return { date: targetDate, log: null, score: null, components: null };

  const moodScore = MOOD_SCORES[log.mood] || 3;
  const sleepScore = log.sleep_hours ? Math.min((log.sleep_hours / 8) * 100, 100) : null;
  const hydrationScore = log.hydration_level != null ? log.hydration_level : null;
  const stressScore = log.stress_level != null ? Math.max(0, 100 - log.stress_level) : null;

  const parts = [moodScore * 20];
  if (sleepScore != null) parts.push(sleepScore);
  if (hydrationScore != null) parts.push(hydrationScore);
  if (stressScore != null) parts.push(stressScore);

  const score = parts.reduce((s, v) => s + v, 0) / parts.length;

  return {
    date: targetDate,
    log,
    score,
    components: { moodScore: moodScore * 20, sleepScore, hydrationScore, stressScore },
  };
}

/**
 * Returns last 7 days of wellness logs.
 */
export async function getWeeklySummary() {
  const logs = await base44.entities.WellnessLog.list('-date', 7);
  return logs;
}