import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Bell, Clock, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function PrayerReminderSettings() {
  const { t, language } = useI18n();
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSilentHours, setShowSilentHours] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user.settings) {
          setSettings(user.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleToggle = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ settings: updated });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTimeChange = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ settings: updated });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMinutesChange = async (value) => {
    const updated = { ...settings, prayer_reminder_minutes_before: parseInt(value) };
    setSettings(updated);
    
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ settings: updated });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  if (!settings) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 p-4 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
      {/* Enable Prayer Reminders */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'تنبيهات الصلاة' : 'Prayer Reminders'}
            </p>
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
              {language === 'ar' ? 'احصل على تذكيرات قبل دخول وقت الصلاة' : 'Get reminded before prayer time'}
            </p>
          </div>
        </div>
        <Switch
          checked={settings.prayer_reminder_enabled !== false}
          onCheckedChange={(value) => handleToggle('prayer_reminder_enabled', value)}
          disabled={isSaving}
        />
      </div>

      {/* Reminder Time Before Prayer */}
      {settings.prayer_reminder_enabled !== false && (
        <div className="pl-7 space-y-4 border-l-2" style={{ borderColor: 'var(--mizan-border)' }}>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>
              {language === 'ar' ? 'عدد الدقائق قبل الصلاة' : 'Minutes before prayer'}
            </label>
            <div className="flex items-center gap-2 mt-2">
              <select
                value={settings.prayer_reminder_minutes_before || 15}
                onChange={(e) => handleMinutesChange(e.target.value)}
                disabled={isSaving}
                className="flex-1 h-9 px-3 rounded-lg border text-sm"
                style={{ 
                  borderColor: 'var(--mizan-border)', 
                  background: 'var(--mizan-elevated)',
                  color: 'var(--mizan-text)'
                }}
              >
                <option value="5">5 {language === 'ar' ? 'دقائق' : 'minutes'}</option>
                <option value="10">10 {language === 'ar' ? 'دقائق' : 'minutes'}</option>
                <option value="15">15 {language === 'ar' ? 'دقائق' : 'minutes'}</option>
                <option value="30">30 {language === 'ar' ? 'دقيقة' : 'minutes'}</option>
              </select>
              <Clock className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
            </div>
          </div>

          {/* Silent Hours Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4" style={{ color: 'var(--mizan-gold)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--mizan-text)' }}>
                  {language === 'ar' ? 'ساعات الصمت' : 'Silent Hours'}
                </p>
                <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                  {language === 'ar' ? 'عدم إرسال التنبيهات في أوقات معينة' : 'No reminders during these times'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.prayer_silent_enabled !== false}
              onCheckedChange={(value) => handleToggle('prayer_silent_enabled', value)}
              disabled={isSaving}
            />
          </div>

          {/* Silent Hours Configuration */}
          {settings.prayer_silent_enabled !== false && (
            <div className="space-y-3 p-3 rounded-lg" style={{ background: 'var(--mizan-bg)', border: '1px solid var(--mizan-border)' }}>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>
                  {language === 'ar' ? 'من' : 'From'}
                </label>
                <input
                  type="time"
                  value={settings.prayer_silent_start_time || '22:00'}
                  onChange={(e) => handleTimeChange('prayer_silent_start_time', e.target.value)}
                  disabled={isSaving}
                  className="w-full h-8 px-2 rounded text-sm mt-1"
                  style={{ 
                    borderColor: 'var(--mizan-border)', 
                    background: 'var(--mizan-elevated)',
                    color: 'var(--mizan-text)',
                    border: '1px solid var(--mizan-border)'
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium" style={{ color: 'var(--mizan-text)' }}>
                  {language === 'ar' ? 'إلى' : 'To'}
                </label>
                <input
                  type="time"
                  value={settings.prayer_silent_end_time || '06:00'}
                  onChange={(e) => handleTimeChange('prayer_silent_end_time', e.target.value)}
                  disabled={isSaving}
                  className="w-full h-8 px-2 rounded text-sm mt-1"
                  style={{ 
                    borderColor: 'var(--mizan-border)', 
                    background: 'var(--mizan-elevated)',
                    color: 'var(--mizan-text)',
                    border: '1px solid var(--mizan-border)'
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                {language === 'ar' 
                  ? `لن تتلقى التنبيهات من ${settings.prayer_silent_start_time || '22:00'} إلى ${settings.prayer_silent_end_time || '06:00'}`
                  : `No reminders from ${settings.prayer_silent_start_time || '22:00'} to ${settings.prayer_silent_end_time || '06:00'}`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* General Prayer Notifications Toggle */}
      <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--mizan-border)' }}>
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          <p className="font-medium" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'إشعارات الصلاة العامة' : 'General Prayer Notifications'}
          </p>
        </div>
        <Switch
          checked={settings.notify_prayer !== false}
          onCheckedChange={(value) => handleToggle('notify_prayer', value)}
          disabled={isSaving}
        />
      </div>
    </div>
  );
}