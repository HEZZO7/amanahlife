/**
 * Hijri calendar utilities — pure JS, no external library needed.
 * Uses the Umm al-Qura algorithm approximation for display purposes.
 */

// Islamic month names
const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
];

const EASTERN_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];

function toEastern(n) {
  return String(n).split('').map(c => EASTERN_DIGITS[c] || c).join('');
}

/**
 * Convert a Gregorian Date to Hijri using the standard algorithm.
 * Returns { day, month (1-12), year }
 */
export function gregorianToHijri(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Julian Day Number
  const jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4)
    + Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12)
    - Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4)
    + day - 32075;

  // Hijri conversion
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
    + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return { day: hDay, month: hMonth, year: hYear };
}

/**
 * Format a Hijri date for display.
 * @param {Date} gregorianDate
 * @param {'ar'|'en'} language
 */
export function formatHijriDate(gregorianDate, language) {
  const { day, month, year } = gregorianToHijri(gregorianDate);
  const isAr = language === 'ar';
  const monthName = isAr ? HIJRI_MONTHS_AR[month - 1] : HIJRI_MONTHS_EN[month - 1];
  if (isAr) {
    return `${toEastern(day)} ${monthName} ${toEastern(year)}`;
  }
  return `${day} ${monthName} ${year}`;
}

// ─── Islamic Events ───────────────────────────────────────────────────────────

const ISLAMIC_EVENTS_AR = [
  { month: 1,  day: 10, name: 'عاشوراء',           desc: 'يوم مبارك يُصام فيه شكراً لله على نجاة موسى عليه السلام' },
  { month: 3,  day: 12, name: 'المولد النبوي',     desc: 'ذكرى مولد النبي محمد ﷺ (للاستئناس فقط)' },
  { month: 7,  day: 27, name: 'الإسراء والمعراج',  desc: 'ذكرى رحلة الإسراء والمعراج المباركة' },
  { month: 8,  day: 15, name: 'ليلة النصف من شعبان', desc: 'ليلة فاضلة يُستحب فيها الإحياء والدعاء' },
  { month: 9,  day: 1,  name: 'بداية رمضان',       desc: 'أول أيام شهر رمضان المبارك' },
  { month: 9,  day: 21, name: 'ليالي القدر',        desc: 'ليالي القدر — الأوتار من العشر الأواخر' },
  { month: 9,  day: 23, name: 'ليلة القدر',         desc: 'من العشر الأواخر من رمضان' },
  { month: 9,  day: 25, name: 'ليلة القدر',         desc: 'من العشر الأواخر من رمضان' },
  { month: 9,  day: 27, name: 'ليلة القدر',         desc: 'أرجح ليالي القدر في العشر الأواخر' },
  { month: 9,  day: 29, name: 'ليلة القدر',         desc: 'من العشر الأواخر من رمضان' },
  { month: 12, day: 9,  name: 'يوم عرفة',          desc: 'أفضل أيام العام — يُصام تطوعاً لغير الحاج' },
  { month: 12, day: 10, name: 'عيد الأضحى',        desc: 'عيد الأضحى المبارك — أعاده الله بالخير واليُمن' },
];

const ISLAMIC_EVENTS_EN = [
  { month: 1,  day: 10, name: 'Ashura',              desc: "Blessed day — fasting is recommended in gratitude for Moses' salvation" },
  { month: 3,  day: 12, name: 'Mawlid al-Nabi',      desc: 'Birth of the Prophet Muhammad ﷺ (informational)' },
  { month: 7,  day: 27, name: "Isra' Mi'raj",         desc: 'The Night Journey and Ascension of the Prophet ﷺ' },
  { month: 8,  day: 15, name: "Laylat al-Bara'ah",    desc: 'Night of mid-Shaban — recommended for worship and supplication' },
  { month: 9,  day: 1,  name: 'Ramadan Begins',       desc: 'First day of the blessed month of Ramadan' },
  { month: 9,  day: 21, name: 'Laylat al-Qadr Window', desc: 'Last 10 odd nights of Ramadan — seek Laylat al-Qadr' },
  { month: 9,  day: 23, name: 'Laylat al-Qadr',       desc: 'Odd night in the last 10 of Ramadan' },
  { month: 9,  day: 25, name: 'Laylat al-Qadr',       desc: 'Odd night in the last 10 of Ramadan' },
  { month: 9,  day: 27, name: 'Laylat al-Qadr',       desc: 'Most likely night of Laylat al-Qadr' },
  { month: 9,  day: 29, name: 'Laylat al-Qadr',       desc: 'Odd night in the last 10 of Ramadan' },
  { month: 12, day: 9,  name: 'Day of Arafah',        desc: "Best day of the year — fasting is sunnah for non-pilgrims" },
  { month: 12, day: 10, name: 'Eid al-Adha',          desc: 'Blessed Eid al-Adha — may it bring joy and goodness' },
];

// First 9 days of Dhul Hijjah as a range (separate from the list above)
function getDhulHijjahDays(language) {
  const results = [];
  for (let d = 1; d <= 8; d++) {
    results.push({
      month: 12, day: d,
      name: language === 'ar' ? 'أيام ذو الحجة العشر' : 'Best 10 Days (Dhul Hijjah)',
      desc: language === 'ar' ? 'من أفضل أيام العام — يُستحب الإكثار من الذكر والصيام' : 'Among the best days of the year — recommended for worship and fasting'
    });
  }
  return results;
}

export function getIslamicEventsForDate(date, language) {
  const hijri = gregorianToHijri(date);
  const events = language === 'ar' ? ISLAMIC_EVENTS_AR : ISLAMIC_EVENTS_EN;
  const dhulHijjah = getDhulHijjahDays(language);
  const all = [...events, ...dhulHijjah];
  return all.filter(e => e.month === hijri.month && e.day === hijri.day);
}

// ─── Sunnah Fast Suggestions ──────────────────────────────────────────────────

/**
 * Returns sunnah fast suggestions for a given Gregorian date.
 * - Mondays & Thursdays
 * - 13th, 14th, 15th of each Hijri month (Ayyam al-Bid)
 */
export function getSunnahFastsForDate(date, language) {
  const suggestions = [];
  const dow = date.getDay(); // 0=Sun, 1=Mon, ..., 4=Thu
  const isAr = language === 'ar';

  if (dow === 1 || dow === 4) {
    suggestions.push({
      type: 'sunnah_fast',
      name: isAr ? 'صيام سنة' : 'Sunnah Fast',
      desc: isAr ? 'صيام الاثنين والخميس سنة نبوية مؤكدة' : 'Fasting Monday & Thursday is a confirmed Prophetic Sunnah'
    });
  }

  const { day: hDay } = gregorianToHijri(date);
  if (hDay === 13 || hDay === 14 || hDay === 15) {
    suggestions.push({
      type: 'ayyam_albid',
      name: isAr ? 'أيام البيض' : 'Ayyam al-Bid',
      desc: isAr ? 'الأيام البيض: ١٣، ١٤، ١٥ من كل شهر هجري — صيامها سنة' : 'The White Days: 13th, 14th, 15th of each Hijri month — fasting is sunnah'
    });
  }

  return suggestions;
}