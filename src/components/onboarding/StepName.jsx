import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';

export default function StepName({ value, onChange, onNext, onBack }) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-6"
    >
      <h1 className="text-2xl font-bold mb-10 text-center" style={{ color: 'var(--mizan-text)' }}>
        {t('onboarding.nameTitle')}
      </h1>

      <div className="w-full max-w-sm">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('onboarding.namePlaceholder')}
          className="text-lg text-center h-14 rounded-xl border-2 focus:border-[var(--mizan-emerald)]"
          style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text)' }}
          autoFocus
        />
      </div>

      <div className="flex gap-3 mt-10 w-full max-w-sm">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl"
        >
          {t('onboarding.back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!value.trim()}
          className="flex-1 h-12 rounded-xl text-white"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {t('onboarding.continue')}
        </Button>
      </div>
    </motion.div>
  );
}