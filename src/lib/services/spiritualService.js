import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Returns the spiritual score for a given date (YYYY-MM-DD).
 * Score: prayers completed out of 5 → percentage.
 */
export async function getDailyScore(date) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  const logs = await base44.entities.PrayerLog.filter({ date: targetDate });
  const log = logs[0] || null;

  const prayersCompleted = log ? PRAYERS.filter(p => log[p]).length : 0;
  const score = (prayersCompleted / 5) * 100;

  return {
    date: targetDate,
    log,
    prayersCompleted,
    score,
    prayers: PRAYERS.map(p => ({ name: p, completed: log ? !!log[p] : false })),
  };
}

/**
 * Returns current prayer streak (consecutive days with all 5 prayers).
 * Looks back up to 60 days.
 */
export async function getStreak() {
  const logs = await base44.entities.PrayerLog.list('-date', 60);
  const logMap = {};
  logs.forEach(l => { logMap[l.date] = l; });

  let streak = 0;
  let date = new Date();

  for (let i = 0; i < 60; i++) {
    const dateStr = format(subDays(date, i), 'yyyy-MM-dd');
    const log = logMap[dateStr];
    const count = log ? PRAYERS.filter(p => log[p]).length : 0;
    if (count === 5) {
      streak++;
    } else {
      break;
    }
  }

  // Weekly prayer rate (last 7 days)
  let weeklyCompleted = 0;
  for (let i = 0; i < 7; i++) {
    const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const log = logMap[dateStr];
    if (log) weeklyCompleted += PRAYERS.filter(p => log[p]).length;
  }
  const weeklyRate = (weeklyCompleted / 35) * 100;

  return { streak, weeklyRate, logs };
}