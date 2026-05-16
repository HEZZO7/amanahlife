import React from 'react';
import { useI18n } from '@/lib/i18n';
import ProfileSection from '@/components/settings/ProfileSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import RegionalSection from '@/components/settings/RegionalSection';
import NotificationsSection from '@/components/settings/NotificationsSection';
import SubscriptionPlansSection from '@/components/settings/SubscriptionPlansSection';
import DataExportSection from '@/components/settings/DataExportSection';
import AccountSection from '@/components/settings/AccountSection';
import ReviewScheduleSection from '@/components/settings/ReviewScheduleSection';

export default function Settings() {
  const { t } = useI18n();

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      <h1 className="text-2xl font-bold mb-8 mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.title')}
      </h1>

      <div className="space-y-8">
        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <ProfileSection />
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <AppearanceSection />
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <RegionalSection />
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <NotificationsSection />
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <SubscriptionPlansSection />
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <ReviewScheduleSection />
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <DataExportSection />
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <AccountSection />
        </div>
      </div>
    </div>
  );
}