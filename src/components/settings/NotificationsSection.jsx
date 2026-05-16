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

const toggleRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: '16px',
  padding: '12px 0',
};

const switchWrapStyle = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
};

export default function NotificationsSection() {
  const { t } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)', marginBottom: '8px' }}>
        {t('settings.notifications')}
      </h2>

      <div style={toggleRowStyle}>
        <span style={{ flexGrow: 1, minWidth: 0, fontSize: '15px', fontWeight: '600', color: 'var(--mizan-text)' }}>
          {t('settings.notifyAll')}
        </span>
        <div style={switchWrapStyle}>
          <Switch
            checked={settings?.notifications_enabled ?? true}
            onCheckedChange={(val) => updateSettings({ notifications_enabled: val })}
          />
        </div>
      </div>

      {(settings?.notifications_enabled !== false) && (
        <>
          {NOTIFY_KEYS.map(({ key, label }) => (
            <div key={key} style={toggleRowStyle}>
              <span style={{ flexGrow: 1, minWidth: 0, fontSize: '15px', fontWeight: '500', color: 'var(--mizan-text-secondary)' }}>
                {t(label)}
              </span>
              <div style={switchWrapStyle}>
                <Switch
                  checked={settings?.[key] ?? true}
                  onCheckedChange={(val) => updateSettings({ [key]: val })}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}