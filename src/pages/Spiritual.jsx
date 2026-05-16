import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { getDailyScore, getStreak } from '@/lib/spiritualService.js';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SpiritualPrayerTracker from '@/components/spiritual/SpiritualPrayerTracker';
import SpiritualStreak from '@/components/spiritual/SpiritualStreak';
import SpiritualCharity from '@/components/spiritual/SpiritualCharity';
import TimesQibla from '@/components/spiritual/TimesQibla';
import PrayerReminderSettings from '@/components/spiritual/PrayerReminderSettings';
import DhikrCounter from '@/components/spiritual/DhikrCounter';
import AdhkarReader from '@/components/spiritual/AdhkarReader';

const TABS = [
  { key: 'prayer', en: 'Prayer', ar: 'الصلاة' },
  { key: 'adhkar', en: 'Adhkar', ar: 'الأذكار' },
  { key: 'quran', en: "Qur'an & Dhikr", ar: 'القرآن والذكر' },
  { key: 'charity', en: 'Charity', ar: 'الصدقة' },
  { key: 'times', en: 'Times & Qibla', ar: 'الأوقات والقبلة' },
  { key: 'reminders', en: 'Reminders', ar: 'التنبيهات' },
];

export default function Spiritual() {
  const { t, language } = useI18n();
  const [tab, setTab] = useState('prayer');
  const [score, setScore] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const load = () => {
    setLoading(true);
    Promise.all([getDailyScore(today), getStreak()])
      .then(([s, str]) => { setScore(s); setStreakData(str); })
      .catch(err => console.error('Spiritual load error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {t('nav.spiritual')}
        </h1>
        {score && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? 'اليوم' : 'Today'}</span>
            <span className="text-sm font-bold" style={{ color: 'var(--mizan-emerald)' }}>{score.score}/100</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(({ key, en, ar }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{
              background: tab === key ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
              color: tab === key ? 'white' : 'var(--mizan-text-secondary)',
              border: `1.5px solid ${tab === key ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
            }}
          >
            {language === 'ar' ? ar : en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : (
        <>
           {tab === 'prayer' && <SpiritualPrayerTracker score={score} streakData={streakData} onReload={load} />}
           {tab === 'adhkar' && <AdhkarReader language={language} />}
           {tab === 'quran' && <SpiritualQuranTab score={score} onReload={load} />}
           {tab === 'charity' && <SpiritualCharity onReload={load} />}
           {tab === 'times' && <TimesQibla language={language} />}
           {tab === 'reminders' && <PrayerReminderSettings />}
         </>
        )}
    </div>
  );
}

function SpiritualQuranTab({ score, onReload }) {
  const { language } = useI18n();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [pages, setPages] = useState(score?.quranPages || 0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const existing = await base44.entities.RamadanLog.filter({ date: today });
    if (existing.length > 0) {
      await base44.entities.RamadanLog.update(existing[0].id, { quran_pages: pages });
    } else {
      await base44.entities.RamadanLog.create({ date: today, quran_pages: pages });
    }
    setSaving(false);
    onReload();
  };

  return (
    <div className="space-y-6">
      {/* Mushaf Al-Madinah Link */}
      <a
        href="https://quran.com/ar"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl p-4 transition-opacity hover:opacity-80"
        style={{ background: 'linear-gradient(135deg, var(--mizan-emerald) 0%, #12897A 100%)', textDecoration: 'none' }}
      >
        <span className="text-2xl">📖</span>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">
            {language === 'ar' ? 'مصحف المدينة النبوية' : 'Mushaf Al-Madinah'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {language === 'ar' ? 'اضغط للقراءة عبر Quran.com' : 'Tap to read via Quran.com'}
          </p>
        </div>
        <svg className="w-5 h-5 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'صفحات القرآن اليوم' : "Today's Qur'an Pages"}
        </h3>
        <div className="flex items-center gap-4">
          <button onClick={() => setPages(p => Math.max(0, p - 1))} className="w-10 h-10 rounded-full text-lg font-bold" style={{ background: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>−</button>
          <span className="text-4xl font-bold flex-1 text-center" style={{ color: 'var(--mizan-emerald)' }}>{pages}</span>
          <button onClick={() => setPages(p => p + 1)} className="w-10 h-10 rounded-full text-lg font-bold" style={{ background: 'var(--mizan-emerald)', color: 'white' }}>+</button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'صفحة' : 'pages'}
        </p>
        <Button onClick={handleSave} disabled={saving} className="w-full mt-4 h-10 rounded-xl text-white" style={{ background: 'var(--mizan-emerald)' }}>
          {language === 'ar' ? 'حفظ' : 'Save'}
        </Button>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'نقاط القرآن اليوم' : "Today's Qur'an Score"}
        </p>
        <p className="text-2xl font-bold" style={{ color: 'var(--mizan-gold)' }}>{score?.quranScore || 0}/20</p>
      </div>

      {/* Dhikr Counter */}
      <div>
        <h3 className="text-sm font-semibold mb-3 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'عداد الأذكار' : 'Dhikr Counter'}
        </h3>
        <DhikrCounter language={language} />
      </div>
    </div>
  );
}