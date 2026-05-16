import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays, parseISO, addDays, subDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Moon, Sun, BookOpen, Heart, Calendar, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import RamadanDailySchedule from '@/components/ramadan/RamadanDailySchedule';
import RamadanCalendarView from '@/components/ramadan/RamadanCalendarView';
import QuranTracker from '@/components/ramadan/QuranTracker';
import ZakatFitrInfo from '@/components/ramadan/ZakatFitrInfo';

// Dynamically compute the next Ramadan date — always in the future
function getNextRamadan() {
  // Ramadan 2026 starts approximately March 1, 2026
  let candidate = new Date('2026-03-01');
  const now = new Date();
  // If the candidate is in the past, keep adding one Hijri year (~354 days)
  while (candidate <= now) {
    candidate = new Date(candidate.getTime() + 354 * 24 * 60 * 60 * 1000);
  }
  return candidate;
}
const NEXT_RAMADAN = getNextRamadan();
const RAMADAN_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

function GeometricIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 opacity-60">
      <path d="M40 4L72 22V58L40 76L8 58V22L40 4Z" stroke="var(--mizan-emerald)" strokeWidth="1.5" fill="none" />
      <path d="M40 16L60 27V49L40 60L20 49V27L40 16Z" stroke="var(--mizan-gold)" strokeWidth="1" fill="none" opacity="0.7" />
      <circle cx="40" cy="40" r="5" fill="var(--mizan-emerald)" opacity="0.5" />
    </svg>
  );
}

export default function Ramadan() {
  const { t, language } = useI18n();
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = format(new Date(), 'yyyy-MM-dd');
  const daysUntil = differenceInDays(NEXT_RAMADAN, new Date());
  const isRamadan = daysUntil <= 0 && daysUntil > -30;

  const load = () => {
    setLoading(true);
    base44.entities.RamadanLog.list('-date', 30)
      .then(data => {
        setLogs(data);
        const td = data.find(l => l.date === today);
        setTodayLog(td || null);
      })
      .catch(err => console.error('Ramadan load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleField = async (field) => {
    setSaving(true);
    const newVal = !(todayLog?.[field]);
    if (todayLog?.id) {
      const updated = await base44.entities.RamadanLog.update(todayLog.id, { [field]: newVal });
      setTodayLog(updated);
    } else {
      const created = await base44.entities.RamadanLog.create({ date: today, [field]: newVal });
      setTodayLog(created);
    }
    setSaving(false);
    load();
  };

  const updatePages = async (pages) => {
    setSaving(true);
    if (todayLog?.id) {
      await base44.entities.RamadanLog.update(todayLog.id, { quran_pages: pages });
    } else {
      await base44.entities.RamadanLog.create({ date: today, quran_pages: pages });
    }
    setSaving(false);
    load();
  };

  const generateInsight = async () => {
    setLoadingInsight(true);
    const completedDays = logs.filter(l => l.fasting_completed).length;
    const prompt = language === 'ar'
      ? `أنا أصوم رمضان، أكملت ${completedDays} يوماً من أصل ${logs.length}. قدم لي نصيحة دينية مشجعة قصيرة لا تتجاوز جملتين.`
      : `I am fasting Ramadan. I have completed ${completedDays} out of ${logs.length} days logged. Give me a short encouraging Islamic reminder in 2 sentences max.`;
    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    setAiInsight(res);
    setLoadingInsight(false);
  };

  const fastingGrid = RAMADAN_DAYS.map(day => {
    const log = logs.find(l => {
      const d = parseISO(l.date);
      return d.getDate() === day;
    });
    return { day, completed: log?.fasting_completed || false, has_log: !!log };
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('nav.ramadan')}
        </h1>
        <Moon className="w-6 h-6" style={{ color: 'var(--mizan-emerald)' }} />
      </div>

      {/* Countdown or Active Banner */}
      {!isRamadan ? (
        <div className="rounded-2xl p-6 mb-6 text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <GeometricIllustration />
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--mizan-emerald)' }}>{daysUntil}</p>
          <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'يوماً حتى رمضان' : 'days until Ramadan'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
            {NEXT_RAMADAN.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>
          <Moon className="w-5 h-5" />
          <span className="font-semibold text-sm">{language === 'ar' ? 'رمضان مبارك — تتبع يومك الآن' : 'Ramadan Mubarak — Log your day now'}</span>
        </div>
      )}

      {loading ? (
       <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
       <div className="space-y-5">
         {/* Quran Tracker */}
         <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
           <div className="flex items-center gap-2 mb-4">
             <BookOpen className="w-5 h-5" style={{ color: 'var(--mizan-emerald)' }} />
             <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
               {language === 'ar' ? 'تتبع القرآن' : 'Quran Tracker'}
             </h2>
           </div>
           <QuranTracker />
         </div>

         {/* Weekly Calendar View */}
         <RamadanCalendarView />

         {/* Daily Schedule */}
         <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
               {language === 'ar' ? 'جدول اليوم الزمني' : 'Daily Schedule'}
             </h2>
             <div className="flex items-center gap-1">
               <button
                 onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                 className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                 style={{ background: 'var(--mizan-border)' }}
               >
                 {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
               </button>
               <button
                 onClick={() => setSelectedDate(new Date())}
                 className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                 style={{
                   background: format(selectedDate, 'yyyy-MM-dd') === today ? 'var(--mizan-emerald)' : 'transparent',
                   color: format(selectedDate, 'yyyy-MM-dd') === today ? 'white' : 'var(--mizan-text-secondary)'
                 }}
               >
                 {language === 'ar' ? 'اليوم' : 'Today'}
               </button>
               <button
                 onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                 className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                 style={{ background: 'var(--mizan-border)' }}
               >
                 {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
               </button>
             </div>
           </div>
           <RamadanDailySchedule date={selectedDate} />
         </div>
       </div>
      )}

      {loading ? null : (
       <div className="space-y-5">
          {/* Today's Log Card */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <h2 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'سجل اليوم' : "Today's Log"}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { field: 'fasting_completed', en: 'Fasting', ar: 'الصيام', icon: Sun },
                { field: 'suhoor_logged', en: 'Suhoor', ar: 'السحور', icon: Moon },
                { field: 'iftar_logged', en: 'Iftar', ar: 'الإفطار', icon: Heart },
              ].map(({ field, en, ar, icon: Icon }) => {
                const active = todayLog?.[field];
                return (
                  <button key={field} onClick={() => toggleField(field)} disabled={saving}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ background: active ? 'var(--mizan-emerald)' : 'var(--mizan-elevated)', border: `1px solid ${active ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`, color: active ? 'white' : 'var(--mizan-text)' }}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{language === 'ar' ? ar : en}</span>
                  </button>
                );
              })}
              {/* Quran pages */}
              <div className="p-3 rounded-xl" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'صفحات القرآن' : "Qur'an pages"}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => updatePages(Math.max(0, (todayLog?.quran_pages || 0) - 1))} className="w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center" style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>−</button>
                  <span className="text-lg font-bold flex-1 text-center" style={{ color: 'var(--mizan-emerald)' }}>{todayLog?.quran_pages || 0}</span>
                  <button onClick={() => updatePages((todayLog?.quran_pages || 0) + 1)} className="w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>+</button>
                </div>
              </div>
            </div>
          </div>

          {/* 30-day Fasting Grid */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <h2 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'شبكة الصيام ٣٠ يوم' : '30-Day Fasting Grid'}
            </h2>
            <div className="grid grid-cols-10 gap-1.5">
              {fastingGrid.map(({ day, completed, has_log }) => (
                <div key={day} title={`Day ${day}`}
                  className="aspect-square rounded-md flex items-center justify-center text-xs font-medium"
                  style={{
                    background: completed ? 'var(--mizan-emerald)' : has_log ? 'var(--mizan-red)' : 'var(--mizan-border)',
                    color: (completed || has_log) ? 'white' : 'var(--mizan-text-secondary)',
                  }}>
                  {day}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3">
              {[['var(--mizan-emerald)', language === 'ar' ? 'مكتمل' : 'Completed'], ['var(--mizan-red)', language === 'ar' ? 'فائت' : 'Missed'], ['var(--mizan-border)', language === 'ar' ? 'لم يُسجل' : 'Not logged']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zakat al-Fitr Info */}
          <ZakatFitrInfo />

          {/* Eid Budget Card */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <h2 className="text-sm font-semibold mb-3 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'تخطيط العيد' : 'Eid Planning'}
            </h2>
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'خطط لميزانية العيد من قسم المالية — أضف فئة "العيد".' : 'Plan your Eid budget in Finance — add an "Eid" category.'}
            </p>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 p-3 rounded-lg text-center" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'أيام مكتملة' : 'Days Fasted'}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>{logs.filter(l => l.fasting_completed).length}/30</p>
              </div>
              <div className="flex-1 p-3 rounded-lg text-center" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'صفحات القرآن' : "Qur'an Pages"}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--mizan-gold)' }}>{logs.reduce((s, l) => s + (l.quran_pages || 0), 0)}</p>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
                {language === 'ar' ? 'رؤية يومية' : 'Daily Insight'}
              </h2>
              <Button size="sm" onClick={generateInsight} disabled={loadingInsight}
                className="h-8 px-3 text-xs rounded-lg text-white" style={{ background: 'var(--mizan-emerald)' }}>
                <Sparkles className="w-3.5 h-3.5" />
                {loadingInsight ? '...' : (language === 'ar' ? 'توليد' : 'Generate')}
              </Button>
            </div>
            {aiInsight ? (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--mizan-text)' }}>{aiInsight}</p>
            ) : (
              <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
                {language === 'ar' ? 'انقر على "توليد" للحصول على نصيحة مشجعة.' : 'Click Generate for an encouraging reminder.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}