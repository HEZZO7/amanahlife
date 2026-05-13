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

const TABS = [
  { key: 'prayer', en: 'Prayer', ar: 'الصلاة' },
  { key: 'quran', en: "Qur'an & Dhikr", ar: 'القرآن والذكر' },
  { key: 'charity', en: 'Charity', ar: 'الصدقة' },
];

export default function Spiritual() {
  const { t, language } = useI18n();
  const [tab, setTab] = useState('prayer');
  const [score, setScore] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const load = async () => {
    setLoading(true);
    const [s, str] = await Promise.all([getDailyScore(today), getStreak()]);
    setScore(s);
    setStreakData(str);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        {TABS.map(({ key, en, ar }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
            style={{ background: tab === key ? 'var(--mizan-emerald)' : 'transparent', color: tab === key ? 'white' : 'var(--mizan-text-secondary)' }}>
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
          {tab === 'quran' && <SpiritualQuranTab score={score} onReload={load} />}
          {tab === 'charity' && <SpiritualCharity onReload={load} />}
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
    <div className="space-y-4">
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
    </div>
  );
}