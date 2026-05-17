import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';

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
      padding: '12px 0',
      borderBottom: '1px solid var(--mizan-border)',
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
        color: bold ? 'var(--mizan-text)' : 'var(--mizan-text-secondary)',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function NotificationsSection() {
  const { t, language } = useI18n();
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

      {/* Task Due Reminder Section */}
      {settings?.notifications_enabled !== false && settings?.notify_tasks !== false && (
        <div className="mt-3 rounded-xl p-4" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
              {t('settings.taskDueReminder')}
            </span>
          </div>
          <ToggleRow
            label={t('settings.taskDueReminderDesc')}
            checked={settings?.task_due_reminder_enabled ?? true}
            onCheckedChange={(val) => updateSettings({ task_due_reminder_enabled: val })}
          />
          {settings?.task_due_reminder_enabled !== false && (
            <div style={{ paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                {t('settings.taskReminderTiming')}
              </span>
              <div className="flex gap-2">
                {[
                  { value: '1hour', label: t('settings.reminder1hour') },
                  { value: '1day', label: t('settings.reminder1day') },
                ].map(option => {
                  const isSelected = (settings?.task_due_reminder_timing || '1day') === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => updateSettings({ task_due_reminder_timing: option.value })}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: isSelected ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
                        color: isSelected ? 'white' : 'var(--mizan-text-secondary)',
                        border: `1px solid ${isSelected ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}