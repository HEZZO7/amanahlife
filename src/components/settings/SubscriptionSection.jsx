import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { Button } from '@/components/ui/button';

export default function SubscriptionSection() {
  const { t } = useI18n();
  const { settings } = useUserSettings();
  const tier = settings?.subscription_tier || 'free';

  const tierLabel = {
    free: t('settings.free'),
    premium: t('settings.premium'),
    family: t('settings.familyPlan'),
  }[tier];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.subscription')}
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.currentPlan')}:
        </span>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: tier === 'free' ? 'var(--mizan-surface)' : 'var(--mizan-emerald)',
            color: tier === 'free' ? 'var(--mizan-text)' : 'white',
            border: `1px solid ${tier === 'free' ? 'var(--mizan-border)' : 'var(--mizan-emerald)'}`,
          }}
        >
          {tierLabel}
        </span>
      </div>
      {tier === 'free' && (
        <Button
          className="h-10 rounded-lg text-white"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {t('settings.upgrade')}
        </Button>
      )}
    </div>
  );
}