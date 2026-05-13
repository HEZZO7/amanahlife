import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { toast } from 'sonner';

export default function AppearanceSection() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const { updateSettings } = useUserSettings();

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
    </div>
  );
}