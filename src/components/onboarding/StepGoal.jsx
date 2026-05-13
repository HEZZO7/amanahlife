import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Wallet, Heart, Users, Activity } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const CATEGORIES = [
  { key: 'personal', icon: User },
  { key: 'financial', icon: Wallet },
  { key: 'spiritual', icon: Heart },
  { key: 'family', icon: Users },
  { key: 'health', icon: Activity },
];

export default function StepGoal({ goalTitle, goalCategory, onTitleChange, onCategoryChange, onNext, onSkip, onBack }) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6"
    >
      <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--mizan-text)' }}>
        {t('onboarding.goalTitle')}
      </h1>

      <div className="w-full max-w-sm space-y-6">
        <Input
          value={goalTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t('onboarding.goalPlaceholder')}
          className="text-lg h-14 rounded-xl border-2 focus:border-[var(--mizan-emerald)]"
          style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text)' }}
        />

        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${goalCategory === key ? 'text-white' : ''}`}
              style={{
                background: goalCategory === key ? 'var(--mizan-emerald)' : 'var(--mizan-surface)',
                color: goalCategory === key ? 'white' : 'var(--mizan-text-secondary)'
              }}
            >
              <Icon className="w-4 h-4" />
              {t(`goal.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-10 w-full max-w-sm">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          {t('onboarding.back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!goalTitle.trim() || !goalCategory}
          className="flex-1 h-12 rounded-xl text-white"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {t('onboarding.continue')}
        </Button>
      </div>

      <button
        onClick={onSkip}
        className="mt-4 text-sm underline"
        style={{ color: 'var(--mizan-text-secondary)' }}
      >
        {t('onboarding.skip')}
      </button>
    </motion.div>
  );
}