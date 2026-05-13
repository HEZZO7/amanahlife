import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Target, Wallet, Heart, CheckSquare, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('dashboard.greeting.morning');
  if (h < 17) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
}

function GeometricIllustration() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-5 opacity-60">
      {/* Outer hexagon */}
      <path d="M60 8L108 34V86L60 112L12 86V34L60 8Z" stroke="var(--mizan-emerald)" strokeWidth="1.5" fill="none" />
      {/* Middle hexagon */}
      <path d="M60 24L92 42V78L60 96L28 78V42L60 24Z" stroke="var(--mizan-emerald)" strokeWidth="1" fill="none" opacity="0.6" />
      {/* Inner hexagon */}
      <path d="M60 40L76 50V70L60 80L44 70V50L60 40Z" stroke="var(--mizan-gold)" strokeWidth="1.5" fill="none" opacity="0.8" />
      {/* Center dot */}
      <circle cx="60" cy="60" r="4" fill="var(--mizan-emerald)" opacity="0.8" />
      {/* Star points */}
      <line x1="60" y1="8" x2="60" y2="24" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="108" y1="34" x2="92" y2="42" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="108" y1="86" x2="92" y2="78" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="60" y1="112" x2="60" y2="96" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="86" x2="28" y2="78" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
      <line x1="12" y1="34" x2="28" y2="42" stroke="var(--mizan-emerald)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export default function Dashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [prayerLog, setPrayerLog] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    Promise.all([
      base44.auth.me(),
      base44.entities.PrayerLog.filter({ date: today }),
      base44.entities.Task.filter({ due_date: today }),
      base44.entities.Transaction.list('-date', 50),
      base44.entities.Goal.filter({ status: 'active' }),
    ]).then(([u, prayers, todayTasks, txns, activeGoals]) => {
      setUser(u);
      setPrayerLog(prayers[0] || null);
      setTasks(todayTasks);
      setTransactions(txns);
      setGoals(activeGoals);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  // Compute stats
  const prayerCount = prayerLog
    ? ['fajr','dhuhr','asr','maghrib','isha'].filter(p => prayerLog[p]).length
    : 0;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const income = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + (tx.amount || 0), 0);
  const expenses = transactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + (tx.amount || 0), 0);
  const netBalance = income - expenses;

  const activeGoalsCount = goals.length;

  const greeting = getGreeting(t);
  const displayName = user?.full_name || '';

  // Current date string
  const dateStr = format(new Date(), 'EEEE, MMMM d');

  const STATS = [
    {
      icon: Heart,
      label: t('dashboard.prayersToday'),
      value: `${prayerCount}/5`,
      sub: null,
    },
    {
      icon: CheckSquare,
      label: t('dashboard.todayTasks'),
      value: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : '0',
      sub: null,
    },
    {
      icon: Wallet,
      label: t('dashboard.netBalance'),
      value: netBalance === 0 ? '—' : `${netBalance > 0 ? '+' : ''}${netBalance.toLocaleString()}`,
      gold: true,
    },
    {
      icon: Target,
      label: t('dashboard.activeGoals'),
      value: activeGoalsCount > 0 ? `${activeGoalsCount}` : '0',
      sub: null,
    },
  ];

  const isEmpty = prayerCount === 0 && totalTasks === 0 && netBalance === 0 && activeGoalsCount === 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>
          {greeting}{displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {dateStr}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ icon: Icon, label, value, gold }, i) => (
          <div
            key={i}
            className="p-5 rounded-xl"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
            </div>
            <span
              className="text-2xl font-bold"
              style={{ color: gold ? 'var(--mizan-gold)' : 'var(--mizan-text)' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div
          className="text-center py-14 rounded-xl"
          style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
        >
          <GeometricIllustration />
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--mizan-text)' }}>
            {t('dashboard.noData')}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--mizan-text-secondary)' }}>
            {t('dashboard.noDataSub')}
          </p>
          <Link to="/planner">
            <Button
              className="h-10 px-6 rounded-lg text-white gap-2"
              style={{ background: 'var(--mizan-emerald)' }}
            >
              <Plus className="w-4 h-4" />
              {t('dashboard.addTask')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}