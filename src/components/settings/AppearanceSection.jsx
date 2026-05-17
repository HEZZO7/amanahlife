import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

function ToggleRow({ label, checked, onCheckedChange, isRTL }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isRTL ? 'row' : 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '12px 0',
      borderBottom: '1px solid var(--mizan-border)',
      gap: '12px',
    }}>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <span style={{
        flex: 1,
        fontSize: '15px',
        fontWeight: '500',
        color: 'var(--mizan-text)',
        textAlign: isRTL ? 'right' : 'left',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function AppearanceSection() {
  const { t, language, setLanguage, isRTL } = useI18n();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useUserSettings();

  const handleLangChange = async (lang) => {
    setLanguage(lang);
    await updateSettings({ language: lang });
    toast.success(t('settings.saved'));
  };

  const handleThemeChange = async (th) => {
    setTheme(th);
    await updateSettings({ theme: th });
    toast.success(t('settings.saved'));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.appearance')}
      </h2>

      {/* Language */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.language')}
        </p>
        <div className="flex gap-2">
          {['en', 'ar'].map(lang => (
            <button
              key={lang}
              onClick={() => handleLangChange(lang)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${lang === 'ar' ? 'font-arabic' : 'font-inter'}`}
              style={{
                background: language === lang ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
                color: language === lang ? 'white' : 'var(--mizan-text-secondary)',
                border: `1px solid ${language === lang ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
              }}
            >
              {lang === 'en' ? 'EN' : 'عربي'}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.theme')}
        </p>
        <div className="flex gap-2">
          {['light', 'dark'].map(th => (
            <button
              key={th}
              onClick={() => handleThemeChange(th)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: theme === th ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
                color: theme === th ? 'white' : 'var(--mizan-text-secondary)',
                border: `1px solid ${theme === th ? 'var(--mizan-emerald)' : 'var(--mizan-border)'}`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: th === 'light' ? '#F8F6F1' : '#071412', border: '1px solid var(--mizan-border)' }}
              />
              {t(`settings.${th}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Islamic Calendar Toggles */}
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' ? 'التقويم الإسلامي' : 'Islamic Calendar'}
        </p>
        <ToggleRow
          label={language === 'ar' ? 'عرض التاريخ الهجري' : 'Show Hijri Calendar'}
          checked={settings?.show_hijri_calendar !== false}
          onCheckedChange={val => updateSettings({ show_hijri_calendar: val })}
          isRTL={isRTL}
        />
        <ToggleRow
          label={language === 'ar' ? 'عرض المناسبات الإسلامية' : 'Show Islamic Events'}
          checked={settings?.show_islamic_events !== false}
          onCheckedChange={val => updateSettings({ show_islamic_events: val })}
          isRTL={isRTL}
        />
      </div>
    </div>
  );
}