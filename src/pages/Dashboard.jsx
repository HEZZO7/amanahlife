import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { build as buildDashboard } from '@/lib/dashboardService';
import { Target, Wallet, Heart, CheckSquare, Plus, TrendingUp, TrendingDown, Sparkles, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useUserSettings } from '@/lib/UserSettingsContext';

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
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    Promise.all([base44.auth.me(), buildDashboard()])
      .then(([u, d]) => {
        setUser(u);
        setData(d);
        setInsights(d.aiInsights || []);
        setLoading(false);
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>
          {greeting}{displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>{dateStr}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Prayers */}
        <div className="p-5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>{t('dashboard.prayersToday')}</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>{prayerCount}/5</span>
          <PrayerDots prayers={prayers} />
        </div>

        {/* Tasks */}
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

        {/* Net Balance */}
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

        {/* Active Goals */}
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
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text-secondary)' }}>
            {t('dashboard.aiInsights')}
          </h2>
          {insights.map(i => (
            <AIInsightCard key={i.id} insight={i} onDismiss={handleDismiss} onFeedback={handleFeedback} />
          ))}
        </div>
      )}

      {/* Today's Tasks Preview */}
      {data?.tasks?.today?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold mizan-section-header" style={{ color: 'var(--mizan-text-secondary)' }}>
              {t('dashboard.todayTasks')}
            </h2>
            <Link to="/planner" className="text-xs" style={{ color: 'var(--mizan-emerald)' }}>{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-2">
            {data.tasks.today.slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0`} style={{ borderColor: task.status === 'completed' ? 'var(--mizan-emerald)' : 'var(--mizan-border)', background: task.status === 'completed' ? 'var(--mizan-emerald)' : 'transparent' }} />
                <span className="text-sm flex-1" style={{ color: 'var(--mizan-text)', textDecoration: task.status === 'completed' ? 'line-through' : 'none', opacity: task.status === 'completed' ? 0.5 : 1 }}>{task.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: task.priority === 'high' ? '#C0392B22' : task.priority === 'medium' ? '#B89A5E22' : 'var(--mizan-border)', color: task.priority === 'high' ? 'var(--mizan-red)' : task.priority === 'medium' ? 'var(--mizan-gold)' : 'var(--mizan-text-secondary)' }}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
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