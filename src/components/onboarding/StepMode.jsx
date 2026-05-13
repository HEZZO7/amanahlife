import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Users } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function StepMode({ mode, familyName, inviteEmail, onModeChange, onFamilyNameChange, onInviteEmailChange, onNext, onBack }) {
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
        {t('onboarding.modeTitle')}
      </h1>

      <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
        <button
          onClick={() => onModeChange('individual')}
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-200 ${mode === 'individual' ? 'border-[var(--mizan-emerald)]' : 'border-transparent'}`}
          style={{ background: 'var(--mizan-surface)' }}
        >
          <User className="w-8 h-8 mb-3" style={{ color: mode === 'individual' ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }} />
          <span className="font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {t('onboarding.individual')}
          </span>
        </button>

        <button
          onClick={() => onModeChange('family')}
          className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all duration-200 ${mode === 'family' ? 'border-[var(--mizan-emerald)]' : 'border-transparent'}`}
          style={{ background: 'var(--mizan-surface)' }}
        >
          <Users className="w-8 h-8 mb-3" style={{ color: mode === 'family' ? 'var(--mizan-emerald)' : 'var(--mizan-text-secondary)' }} />
          <span className="font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {t('onboarding.family')}
          </span>
        </button>
      </div>

      {mode === 'family' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="w-full max-w-sm mt-6 space-y-3"
        >
          <Input
            value={familyName}
            onChange={(e) => onFamilyNameChange(e.target.value)}
            placeholder={t('onboarding.familyName')}
            className="h-12 rounded-xl border-2"
            style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text)' }}
          />
          <Input
            value={inviteEmail}
            onChange={(e) => onInviteEmailChange(e.target.value)}
            placeholder={t('onboarding.inviteEmail')}
            type="email"
            className="h-12 rounded-xl border-2"
            style={{ background: 'var(--mizan-surface)', color: 'var(--mizan-text)' }}
          />
        </motion.div>
      )}

      <div className="flex gap-3 mt-10 w-full max-w-sm">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl">
          {t('onboarding.back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!mode || (mode === 'family' && !familyName.trim())}
          className="flex-1 h-12 rounded-xl text-white"
          style={{ background: 'var(--mizan-emerald)' }}
        >
          {t('onboarding.continue')}
        </Button>
      </div>
    </motion.div>
  );
}