import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';

/**
 * Returns a wellness score (0-100) for a given date.
 * Score: mood (40pts) + sleep (30pts) + hydration (15pts) + stress inverse (15pts)
 */
export async function getDailyScore(date) {
  const dateStr = date || format(new Date(), 'yyyy-MM-dd');
  const logs = await base44.entities.WellnessLog.filter({ date: dateStr });
  const log = logs[0] || null;

  if (!log) return { date: dateStr, score: 0, log: null };

  const moodMap = { very_low: 0, low: 0.25, neutral: 0.5, good: 0.75, excellent: 1 };
  const moodScore = Math.round((moodMap[log.mood] || 0) * 40);

  // Sleep: 8h = full 30pts, scaled
  const sleepScore = Math.min(30, Math.round(((log.sleep_hours || 0) / 8) * 30));

  // Hydration: 0-10 scale → 0-15pts
  const hydrationScore = Math.min(15, Math.round(((log.hydration_level || 0) / 10) * 15));

  // Stress: 0-10 scale, LOWER is better → inverse
  const stressScore = Math.min(15, Math.round(((10 - (log.stress_level || 5)) / 10) * 15));

  const totalScore = moodScore + sleepScore + hydrationScore + stressScore;

  return {
    date: dateStr,
    score: totalScore,
    moodScore,
    sleepScore,
    hydrationScore,
    stressScore,
    log,
  };
}

/**
 * Returns 14-day wellness trend.
 */
export async function getTrend() {
  const logs = await base44.entities.WellnessLog.list('-date', 30);
  const logMap = {};
  logs.forEach(l => { logMap[l.date] = l; });

  const trend = [];
  for (let i = 13; i >= 0; i--) {
    const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const log = logMap[dateStr];
    const moodMap = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };
    trend.push({
      date: dateStr,
      label: format(subDays(new Date(), i), 'EEE'),
      mood: log ? (moodMap[log.mood] || 0) : null,
      sleep: log?.sleep_hours || null,
      hydration: log?.hydration_level || null,
    });
  }

  return { trend, logs };
}