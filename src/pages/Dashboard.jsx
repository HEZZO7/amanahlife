import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { build as buildDashboard } from '@/lib/dashboardService';
import { Target, Wallet, Heart, CheckSquare, Plus, TrendingUp, TrendingDown, Sparkles, X, ThumbsUp, ThumbsDown, BookOpen, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { DashboardCustomizer, DEFAULT_WIDGETS } from '@/components/dashboard/DashboardCustomizer';
import WeeklyTaskCalendar from '@/components/dashboard/WeeklyTaskCalendar';
import BudgetAlertsBanner from '@/components/finance/BudgetAlertsBanner';

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('dashboard.greeting.morning');
  if (h < 17) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
}

function GeometricIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-5 opacity-60">
      <path d="M60 8L108 34V86L60 112L12 86V34L60 8Z" stroke="var(--mizan-emerald)" strokeWidth="1.5" fill="none" />
      <path d="M60 24L92 42V78L60 96L28 78V42L60 24Z" stroke="var(--mizan-emerald)" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M60 40L76 50V70L60 80L44 70V50L60 40Z" stroke="var(--mizan-gold)" strokeWidth="1.5" fill="none" opacity="0.8" />
      <circle cx="60" cy="60" r="4" fill="var(--mizan-emerald)" opacity="0.8" />
      <line x1="60" y1="8" x2="60" y2="24" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="108" y1="34" x2="92" y2="42" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="108" y1="86" x2="92" y2="78" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="60" y1="112" x2="60" y2="96" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="86" x2="28" y2="78" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="34" x2="28" y2="42" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function AIInsightCard({ insight, onDismiss, onFeedback }) {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const lang = settings?.language || 'ar';
  const content = lang === 'ar' ? insight.content_ar : insight.content_en;
  const typeColors = { daily: '#0B5B50', weekly: '#0B5B50', warning: '#C0392B', suggestion: '#B89A5E', spiritual: '#0B5B50', financial: '#B89A5E' };

  return (
    <div className="p-4 rounded-xl relative" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
      <div className="flex items-start gap-3">
        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: typeColors[insight.type] || 'var(--mizan-emerald)' }} />
        <p className="text-sm flex-1" style={{ color: 'var(--mizan-text)' }}>{content}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => onFeedback(insight.id, true)} className="p-1 rounded hover:opacity-70">
            <ThumbsUp className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
          <button onClick={() => onFeedback(insight.id, false)} className="p-1 rounded hover:opacity-70">
            <ThumbsDown className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
          <button onClick={() => onDismiss(insight.id)} className="p-1 rounded hover:opacity-70">
            <X className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PrayerDots({ prayers }) {
  return (
    <div className="flex gap-1 mt-2">
      {prayers.map(p => (
        <div key={p.name} className="w-2 h-2 rounded-full" style={{ background: p.completed ? 'var(--mizan-emerald)' : 'var(--mizan-border)' }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [widgets, setWidgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dashboard_widgets')) || DEFAULT_WIDGETS; }
    catch { return DEFAULT_WIDGETS; }
  });

  const saveWidgets = (w) => { setWidgets(w); localStorage.setItem('dashboard_widgets', JSON.stringify(w)); };
  const show = (key) => widgets.includes(key);

  useEffect(() => {
    const triggerKey = `ai_insights_triggered_${format(new Date(), 'yyyy-MM-dd')}`;
    Promise.all([base44.auth.me(), buildDashboard(), base44.entities.Task.list('-due_date', 300)])
      .then(([u, d, tasks]) => {
        setUser(u);
        setData(d);
        setAllTasks(tasks.filter(t => !t.is_archived));
        setInsights(d.aiInsights || []);
        setLoading(false);
        // Trigger daily insight generation on first load of the day
        if (!sessionStorage.getItem(triggerKey)) {
          sessionStorage.setItem(triggerKey, '1');
          base44.functions.invoke('aiInsightTriggers', {}).catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDismiss = async (id) => {
    await base44.entities.AIInsight.update(id, { is_dismissed: true });
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const handleFeedback = async (id, helpful) => {
    await base44.entities.AIInsight.update(id, { is_helpful: helpful });
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const prayerCount = data?.spiritual?.prayersCompleted || 0;
  const prayers = data?.spiritual?.prayers || [];
  const completedTasks = data?.tasks?.completed || 0;
  const totalTasks = data?.tasks?.total || 0;
  const netBalance = data?.finance?.netBalance || 0;
  const activeGoals = data?.goals?.active || 0;
  const currSymbol = settings?.currency_symbol || 'ر.س';

  const greeting = getGreeting(t);
  const displayName = user?.full_name || '';
  const dateStr = format(new Date(), 'EEEE, MMMM d');

  const isEmpty = prayerCount === 0 && totalTasks === 0 && netBalance === 0 && activeGoals === 0;

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>
            {greeting}{displayName ? `, ${displayName}` : ''}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/search')}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
          >
            <Search className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
          </button>
          <DashboardCustomizer widgets={widgets} onChange={saveWidgets} />
        </div>
      </div>

      {/* Stats Grid */}
      {show('prayers') || show('tasks') || show('finance') || show('goals') ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Prayers */}
        {show('prayers') && (
        <div className="p-5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>{t('dashboard.prayersToday')}</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>{prayerCount}/5</span>
          <PrayerDots prayers={prayers} />
        </div>
        )}

        {/* Tasks */}
        {show('tasks') && (
        <div className="p-5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>{t('dashboard.todayTasks')}</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>
            {totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '0'}
          </span>
          {totalTasks > 0 && (
            <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--mizan-border)' }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(completedTasks / totalTasks) * 100}%`, background: 'var(--mizan-emerald)' }} />
            </div>
          )}
        </div>
        )}

        {/* Net Balance */}
        {show('finance') && (
        <div className="p-5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>{t('dashboard.netBalance')}</span>
          </div>
          <div className="flex items-center gap-1">
            {netBalance > 0 ? <TrendingUp className="w-4 h-4" style={{ color: 'var(--mizan-green)' }} /> : netBalance < 0 ? <TrendingDown className="w-4 h-4" style={{ color: 'var(--mizan-red)' }} /> : null}
            <span className="text-2xl font-bold" style={{ color: 'var(--mizan-gold)' }}>
              {netBalance === 0 ? '—' : `${netBalance > 0 ? '+' : ''}${Math.abs(netBalance).toLocaleString()}`}
            </span>
          </div>
          <span className="text-xs mt-1 block" style={{ color: 'var(--mizan-text-secondary)' }}>{currSymbol}</span>
        </div>
        )}

        {/* Active Goals */}
        {show('goals') && (
        <div className="p-5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>{t('dashboard.activeGoals')}</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>{activeGoals}</span>
          {data?.goals?.avgProgress > 0 && (
            <span className="text-xs mt-1 block" style={{ color: 'var(--mizan-text-secondary)' }}>
              {Math.round(data.goals.avgProgress)}% {t('goals.avgProgress')}
            </span>
          )}
        </div>
        )}
      </div>
      ) : null}

      {/* Budget Alerts */}
      {show('finance') && data?.finance?.budgetStatus?.some(b => b.percent >= 80) && (
        <BudgetAlertsBanner budgetStatus={data.finance.budgetStatus} />
      )}

      {/* AI Insights */}
      {show('insights') && insights.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
            {t('dashboard.aiInsights')}
          </h2>
          {insights.map(i => (
            <AIInsightCard key={i.id} insight={i} onDismiss={handleDismiss} onFeedback={handleFeedback} />
          ))}
        </div>
      )}

      {/* Weekly Task Calendar */}
      {show('todayTasks') && (
        <WeeklyTaskCalendar tasks={allTasks} />
      )}

      {/* Life Review CTA */}
      {show('lifeReview') && ['premium', 'family'].includes(settings?.subscription_tier) && (
        <div className="mb-6">
          <Link to="/reviews">
            <div className="p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, var(--mizan-emerald) 0%, #0E7A6C 100%)', border: '1px solid var(--mizan-emerald)' }}>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  {settings?.language === 'ar' ? 'مراجعة الحياة الشهرية' : 'Monthly Life Review'}
                </p>
                <p className="text-xs text-white/70">
                  {settings?.language === 'ar' ? 'تقرير ذكي لأداء الشهر الماضي' : 'AI-powered report of last month'}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-14 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <GeometricIllustration />
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--mizan-text)' }}>{t('dashboard.noData')}</p>
          <p className="text-sm mb-6" style={{ color: 'var(--mizan-text-secondary)' }}>{t('dashboard.noDataSub')}</p>
          <Link to="/planner">
            <Button className="h-10 px-6 rounded-lg text-white gap-2" style={{ background: 'var(--mizan-emerald)' }}>
              <Plus className="w-4 h-4" />
              {t('dashboard.addTask')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}