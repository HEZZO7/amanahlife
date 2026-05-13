import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Returns a spiritual score (0-100) for a given date.
 * Score is based on: prayers (60pts max) + quran (20pts) + charity (20pts)
 */
export async function getDailyScore(date) {
  const dateStr = date || format(new Date(), 'yyyy-MM-dd');

  const [prayerLogs, ramadanLogs, charityLogs] = await Promise.all([
    base44.entities.PrayerLog.filter({ date: dateStr }),
    base44.entities.RamadanLog.filter({ date: dateStr }),
    base44.entities.CharityLog.filter({ date: dateStr }),
  ]);

  const prayer = prayerLogs[0] || null;
  const ramadan = ramadanLogs[0] || null;

  const prayerCount = prayer ? PRAYERS.filter(p => prayer[p]).length : 0;
  const prayerScore = Math.round((prayerCount / 5) * 60);

  // Quran pages: 5+ pages = full 20 pts, scaled below
  const quranPages = ramadan?.quran_pages || 0;
  const quranScore = Math.min(20, Math.round((quranPages / 5) * 20));

  // Charity: any charity on that day = 20 pts
  const charityScore = charityLogs.length > 0 ? 20 : 0;

  const totalScore = prayerScore + quranScore + charityScore;

  return {
    date: dateStr,
    score: totalScore,
    prayerCount,
    prayerScore,
    quranPages,
    quranScore,
    hasCharity: charityLogs.length > 0,
    charityScore,
    prayerLog: prayer,
    ramadanLog: ramadan,
  };
}

/**
 * Returns prayer streak (consecutive days with at least 1 prayer logged).
 * Also returns a 30-day history for the heatmap.
 */
export async function getStreak() {
  const logs = await base44.entities.PrayerLog.list('-date', 90);

  const logMap = {};
  logs.forEach(l => { logMap[l.date] = l; });

  // Calculate current streak
  let streak = 0;
  let d = new Date();
  while (true) {
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logMap[dateStr];
    const prayed = log && PRAYERS.some(p => log[p]);
    if (prayed) {
      streak++;
      d = subDays(d, 1);
    } else {
      break;
    }
  }

  // 30-day history for heatmap
  const history = [];
  for (let i = 29; i >= 0; i--) {
    const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const log = logMap[dateStr];
    const count = log ? PRAYERS.filter(p => log[p]).length : 0;
    history.push({ date: dateStr, count, log });
  }

  return { streak, history, logMap };
}