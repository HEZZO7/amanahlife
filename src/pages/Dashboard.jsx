import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Target, Wallet, Heart, Activity, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('dashboard.greeting.morning');
  if (h < 17) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
}

export default function Dashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const greeting = getGreeting(t);
  const displayName = user?.full_name || '';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--mizan-text)' }}>
          {greeting}{displayName ? `, ${displayName}` : ''}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('app.tagline')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Wallet, label: t('nav.finance'), value: '--' },
          { icon: Target, label: t('nav.goals'), value: '--' },
          { icon: Heart, label: t('nav.spiritual'), value: '--' },
          { icon: Activity, label: t('nav.wellness'), value: '--' },
        ].map(({ icon: Icon, label, value }, i) => (
          <div
            key={i}
            className="p-5 rounded-xl"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>{label}</span>
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--mizan-text)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Empty State */}
      <div
        className="text-center py-16 rounded-xl"
        style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--mizan-emerald)', opacity: 0.1 }}
        >
          <CalendarDays className="w-8 h-8" style={{ color: 'var(--mizan-emerald)' }} />
        </div>
        <p className="text-base font-medium" style={{ color: 'var(--mizan-text)' }}>
          {t('dashboard.noData')}
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('app.tagline')}
        </p>
      </div>
    </div>
  );
}