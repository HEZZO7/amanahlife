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

function ToggleRow({ label, checked, onCheckedChange, bold }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      alignItems: 'center',
      width: '100%',
      direction: 'ltr',
      padding: '10px 0',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center' }}>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      <span style={{
        justifySelf: 'end',
        textAlign: 'right',
        width: '100%',
        fontSize: '15px',
        fontWeight: bold ? '600' : '500',
        color: bold ? 'var(--mizan-text, #111827)' : 'var(--mizan-text-secondary, #6b7280)',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function NotificationsSection() {
  const { t } = useI18n();
  const { settings, updateSettings } = useUserSettings();

  return (
    <div style={{ width: '100%' }}>
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)', marginBottom: '8px' }}>
        {t('settings.notifications')}
      </h2>

      <ToggleRow
        label={t('settings.notifyAll')}
        checked={settings?.notifications_enabled ?? true}
        onCheckedChange={(val) => updateSettings({ notifications_enabled: val })}
        bold
      />

      {(settings?.notifications_enabled !== false) && NOTIFY_KEYS.map(({ key, label }) => (
        <ToggleRow
          key={key}
          label={t(label)}
          checked={settings?.[key] ?? true}
          onCheckedChange={(val) => updateSettings({ [key]: val })}
        />
      ))}
    </div>
  );
}