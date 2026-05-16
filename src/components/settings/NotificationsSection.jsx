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
  const { t, isRTL } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.notifications')}
      </h2>

      <div style={{ display: 'flex', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', paddingTop: '4px', paddingBottom: '4px' }}>
        <span style={{ flex: 1, minWidth: 0, color: 'var(--mizan-text)', fontSize: '14px', fontWeight: '600' }}>
          {t('settings.notifyAll')}
        </span>
        <div style={{ flexShrink: 0 }}>
          <Switch
            checked={settings?.notifications_enabled ?? true}
            onCheckedChange={(val) => updateSettings({ notifications_enabled: val })}
          />
        </div>
      </div>

      {(settings?.notifications_enabled !== false) && (
        <div className="space-y-3 pt-1">
          {NOTIFY_KEYS.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <span style={{ flex: 1, minWidth: 0, color: 'var(--mizan-text-secondary)', fontSize: '14px' }}>
                {t(label)}
              </span>
              <div style={{ flexShrink: 0 }}>
                <Switch
                  checked={settings?.[key] ?? true}
                  onCheckedChange={(val) => updateSettings({ [key]: val })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}