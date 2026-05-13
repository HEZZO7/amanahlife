import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { getDailyScore, getStreak } from '@/lib/services/spiritualService';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Flame, Heart, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import PrayerTracker from '@/components/spiritual/PrayerTracker';
import SpiritualStreak from '@/components/spiritual/SpiritualStreak';
import CharityLogSection from '@/components/spiritual/CharityLogSection';

export default function Spiritual() {
  const { t } = useI18n();
  const [dailyData, setDailyData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const load = async () => {
    const [daily, streak] = await Promise.all([getDailyScore(today), getStreak()]);
    setDailyData(daily);
    setStreakData(streak);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mizan-section-header mb-6" style={{ color: 'var(--mizan-text)' }}>
        {t('nav.spiritual')}
      </h1>

      {/* Score Card */}
      <div className="p-5 rounded-xl mb-5 flex items-center gap-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mizan-emerald)' }}>
          <Heart className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>{t('spiritual.dailyScore')}</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--mizan-text)' }}>{dailyData?.prayersCompleted || 0}/5</p>
          <div className="h-2 rounded-full mt-2" style={{ background: 'var(--mizan-border)' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${(dailyData?.score || 0)}%`, background: 'var(--mizan-emerald)' }} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            <Flame className="w-4 h-4" style={{ color: streakData?.streak > 0 ? 'var(--mizan-gold)' : 'var(--mizan-border)' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>{streakData?.streak || 0}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>{t('spiritual.streak')}</p>
        </div>
      </div>

      {/* Prayer Tracker */}
      <PrayerTracker dailyData={dailyData} today={today} onRefresh={load} />

      {/* Streak Section */}
      <div className="mt-5">
        <SpiritualStreak streakData={streakData} />
      </div>

      {/* Charity */}
      <div className="mt-5">
        <CharityLogSection />
      </div>
    </div>
  );
}