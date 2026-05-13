import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from './i18n';
import { useTheme } from './ThemeContext';

const UserSettingsContext = createContext();

export function UserSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setLanguage } = useI18n();
  const { setTheme } = useTheme();

  const loadSettings = async () => {
    try {
      const list = await base44.entities.Settings.list();
      if (list.length > 0) {
        const s = list[0];
        setSettings(s);
        if (s.language) setLanguage(s.language);
        if (s.theme) setTheme(s.theme);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (data) => {
    try {
      if (settings?.id) {
        await base44.entities.Settings.update(settings.id, data);
        setSettings(prev => ({ ...prev, ...data }));
      } else {
        const created = await base44.entities.Settings.create(data);
        setSettings(created);
      }
      if (data.language) setLanguage(data.language);
      if (data.theme) setTheme(data.theme);
    } catch (e) {
      console.error('Failed to update settings', e);
    }
  };

  const onboardingCompleted = settings?.onboarding_completed === true;

  return (
    <UserSettingsContext.Provider value={{ settings, loading, updateSettings, onboardingCompleted, reloadSettings: loadSettings }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const ctx = useContext(UserSettingsContext);
  if (!ctx) throw new Error('useUserSettings must be used within UserSettingsProvider');
  return ctx;
}