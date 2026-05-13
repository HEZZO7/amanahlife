import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { Switch } from '@/components/ui/switch';

const NOTIFY_KEYS = [
  { key: 'notify_tasks', label: 'settings.notifyTasks' },
  { key: 'notify_finance', label: 'settings.notifyFinance' },
  { key: 'notify_prayer', label: 'settings.notifyPrayer' },
  { key: 'notify_goals', label: 'settings.notifyGoals' },
  { key: 'notify_wellness', label: 'settings.notifyWellness' },
  { key: 'notify_ai', label: 'settings.notifyAI' },
];

export default function NotificationsSection() {
  const { t } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.notifications')}
      </h2>

      <div className="flex items-center justify-between py-1">
        <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {t('settings.notifyAll')}
        </span>
        <Switch
          checked={settings?.notifications_enabled ?? true}
          onCheckedChange={(val) => updateSettings({ notifications_enabled: val })}
        />
      </div>

      {(settings?.notifications_enabled !== false) && (
        <div className="space-y-3 pt-1">
          {NOTIFY_KEYS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
                {t(label)}
              </span>
              <Switch
                checked={settings?.[key] ?? true}
                onCheckedChange={(val) => updateSettings({ [key]: val })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}