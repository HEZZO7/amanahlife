import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { format, subDays, subMonths, startOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Lock, BarChart3, TrendingUp, Target, Heart, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import PaywallSheet from '@/components/monetization/PaywallSheet';
import FeatureGate from '@/components/monetization/FeatureGate';
import MonthlyReport from '@/components/analytics/MonthlyReport';
import { useSubscription } from '@/hooks/useSubscription';

const COLORS = ['#0B5B50','#B89A5E','#12897A','#C0392B','#27AE60','#8A9B97'];

function BlurOverlay({ onUpgrade, language }) {
  return (
    <div className="absolute inset-0 z-10 rounded-xl flex flex-col items-center justify-center"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.35)' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--mizan-emerald)' }}>
        <Lock className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-semibold text-white mb-1">{language === 'ar' ? 'ميزة مميزة' : 'Premium Feature'}</p>
      <p className="text-xs text-white opacity-70 mb-4 text-center px-6">{language === 'ar' ? 'ترقّ للوصول إلى التحليلات الكاملة' : 'Upgrade to unlock full analytics'}</p>
      <Button onClick={onUpgrade} size="sm" className="h-8 px-4 text-white rounded-lg" style={{ background: 'var(--mizan-gold)' }}>
        {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
      </Button>
    </div>
  );
}

function ChartCard({ title, children, isPremium, onUpgrade, language }) {
  return (
    <div className="relative rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      <h3 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>{title}</h3>
      {isPremium ? (
        <div className="relative">
          <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>{children}</div>
          <BlurOverlay onUpgrade={onUpgrade} language={language} />
        </div>
      ) : children}
    </div>
  );
}

export default function Analytics() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const { isPremium } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [showPaywall, setShowPaywall] = useState(!isPremium);
  const currSymbol = settings?.currency_symbol || 'ر.س';

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.Transaction.list('-date', 500),
      base44.entities.PrayerLog.list('-date', 30),
      base44.entities.Goal.list('-created_date', 50),
      base44.entities.WellnessLog.list('-date', 30),
      base44.entities.Task.list('-created_date', 200),
    ])
      .then(([transactions, prayers, goals, wellness, tasks]) => {
        // Finance trend — last 6 months
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = subMonths(new Date(), 5 - i);
          const key = format(d, 'yyyy-MM');
          const monthTx = transactions.filter(t => t.date?.startsWith(key));
          return {
            month: format(d, 'MMM'),
            income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
            expenses: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
          };
        });

        // Prayer consistency
        const prayerData = Array.from({ length: 7 }, (_, i) => {
          const d = subDays(new Date(), 6 - i);
          const dateStr = format(d, 'yyyy-MM-dd');
          const log = prayers.find(p => p.date === dateStr);
          const completed = log ? ['fajr','dhuhr','asr','maghrib','isha'].filter(pr => log[pr]).length : 0;
          return { day: format(d, 'EEE'), prayers: completed };
        });

        // Goals by category
        const catMap = {};
        goals.forEach(g => { catMap[g.category] = (catMap[g.category] || 0) + 1; });
        const goalsByCategory = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        // Wellness trend
        const wellnessData = Array.from({ length: 7 }, (_, i) => {
          const d = subDays(new Date(), 6 - i);
          const dateStr = format(d, 'yyyy-MM-dd');
          const log = wellness.find(w => w.date === dateStr);
          const MOOD_SCORE = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };
          return { day: format(d, 'EEE'), score: log ? MOOD_SCORE[log.mood] : null };
        });

        // Task completion
        const taskData = [
          { name: language === 'ar' ? 'مكتملة' : 'Completed', value: tasks.filter(t => t.status === 'completed').length },
          { name: language === 'ar' ? 'معلقة' : 'Pending', value: tasks.filter(t => t.status === 'pending').length },
          { name: language === 'ar' ? 'جارية' : 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
        ];

        setData({ months, prayerData, goalsByCategory, wellnessData, taskData });
      })
      .catch(err => console.error('Analytics load:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // If not premium and paywall was dismissed, show FeatureGate full-page lock
  if (!isPremium && !showPaywall) {
    return (
      <>
        <FeatureGate allowed={false} feature="analytics" fullPage />
        <PaywallSheet onClose={() => setShowPaywall(false)} />
      </>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'التحليلات' : 'Analytics'}
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      ) : (
       <div className="space-y-5">

         {/* Monthly Report */}
         <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
           <h2 className="text-sm font-semibold mb-4 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
             {language === 'ar' ? 'التقرير الشهري' : 'Monthly Report'}
           </h2>
           <MonthlyReport />
         </div>

         {/* 1. Finance Trend */}
          <ChartCard title={language === 'ar' ? 'الاتجاه المالي (٦ أشهر)' : 'Finance Trend (6 Months)'} isPremium={false} language={language}>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.months || []}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--mizan-text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => `${currSymbol} ${v.toLocaleString()}`} contentStyle={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="income" fill="var(--mizan-emerald)" radius={[4,4,0,0]} name={language === 'ar' ? 'دخل' : 'Income'} />
                  <Bar dataKey="expenses" fill="var(--mizan-red)" radius={[4,4,0,0]} name={language === 'ar' ? 'مصروف' : 'Expenses'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 2. Prayer Consistency */}
          <ChartCard title={language === 'ar' ? 'انتظام الصلاة' : 'Prayer Consistency'} isPremium={false} language={language}>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.prayerData || []}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--mizan-text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} hide />
                  <Tooltip contentStyle={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="prayers" stroke="var(--mizan-emerald)" strokeWidth={2.5} dot={{ fill: 'var(--mizan-emerald)', r: 4 }} name={language === 'ar' ? 'صلوات' : 'Prayers'} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 3. Goals by Category */}
          <ChartCard title={language === 'ar' ? 'الأهداف حسب الفئة' : 'Goals by Category'} isPremium={false} language={language}>
            <div style={{ height: 160 }} className="flex items-center">
              <ResponsiveContainer width="40%" height="100%">
                <PieChart>
                  <Pie data={data.goalsByCategory || []} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                    {(data.goalsByCategory || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {(data.goalsByCategory || []).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs capitalize" style={{ color: 'var(--mizan-text-secondary)' }}>{item.name}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* 4. Wellness Trend */}
          <ChartCard title={language === 'ar' ? 'اتجاه العافية' : 'Wellness Trend'} isPremium={false} language={language}>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.wellnessData || []}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--mizan-text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} hide />
                  <Tooltip contentStyle={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)', borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="score" stroke="var(--mizan-gold)" strokeWidth={2.5} dot={{ fill: 'var(--mizan-gold)', r: 4 }} name={language === 'ar' ? 'مزاج' : 'Mood'} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 5. Task Completion Pie */}
          <ChartCard title={language === 'ar' ? 'إتمام المهام' : 'Task Completion'} isPremium={false} language={language}>
            <div style={{ height: 160 }} className="flex items-center">
              <ResponsiveContainer width="40%" height="100%">
                <PieChart>
                  <Pie data={data.taskData || []} cx="50%" cy="50%" outerRadius={60} dataKey="value">
                    {(data.taskData || []).map((_, i) => <Cell key={i} fill={['var(--mizan-emerald)','var(--mizan-gold)','var(--mizan-text-secondary)'][i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {(data.taskData || []).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: ['var(--mizan-emerald)','var(--mizan-gold)','var(--mizan-text-secondary)'][i] }} />
                      <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{item.name}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

        </div>
      )}

    </div>
  );
}