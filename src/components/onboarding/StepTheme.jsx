import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';

export default function StepTheme({ selectedTheme, onSelect, onFinish, onBack }) {
  const { t } = useI18n();
  const { setTheme } = useTheme();

  const handleSelect = (theme) => {
    onSelect(theme);
    setTheme(theme);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6"
    >
      <h1 className="text-2xl font-bold mb-10 text-center" style={{ color: 'var(--mizan-text)' }}>
        {t('onboarding.themeTitle')}
      </h1>

      <div className="grid grid-cols-2 gap-5 w-full max-w-md">
        {/* Light Theme Card */}
        <button
          onClick={() => handleSelect('light')}
          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${selectedTheme === 'light' ? 'border-[var(--mizan-emerald)]' : 'border-transparent'}`}
        >
          <div className="p-4" style={{ background: '#F8F6F1' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5" style={{ color: '#0B5B50' }} />
              <span className="font-semibold text-sm" style={{ color: '#1A2E2A' }}>
                {t('onboarding.lightTheme')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded-full w-3/4" style={{ background: '#E6E2D9' }} />
              <div className="h-3 rounded-full w-1/2" style={{ background: '#E6E2D9' }} />
              <div className="h-8 rounded-lg mt-3" style={{ background: '#FAF8F4' }} />
              <div className="h-8 rounded-lg" style={{ background: '#FAF8F4' }} />
            </div>
          </div>
        </button>

        {/* Dark Theme Card */}
        <button
          onClick={() => handleSelect('dark')}
          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${selectedTheme === 'dark' ? 'border-[var(--mizan-emerald)]' : 'border-transparent'}`}
        >
          <div className="p-4" style={{ background: '#071412' }}>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5" style={{ color: '#12897A' }} />
              <span className="font-semibold text-sm" style={{ color: '#F5F1E8' }}>
                {t('onboarding.darkTheme')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-3 rounded-full w-3/4" style={{ background: '#16302B' }} />
              <div className="h-3 rounded-full w-1/2" style={{ background: '#16302B' }} />
              <div className="h-8 rounded-lg mt-3" style={{ background: '#0B1816' }} />
              <div className="h-8 rounded-lg" style={{ background: '#0B1816' }} />
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3 mt-10 w-full max-w-sm">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          {t('onboarding.back')}
        </Button>
        <Button
          onClick={onFinish}
          disabled={!selectedTheme}
          className="flex-1 h-12 rounded-xl text-white"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {t('onboarding.finish')}
        </Button>
      </div>
    </motion.div>
  );
}