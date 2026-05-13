import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/ThemeContext';
import { useUserSettings } from '@/lib/UserSettingsContext';

import ProgressDots from '@/components/onboarding/ProgressDots';
import StepLanguage from '@/components/onboarding/StepLanguage';
import StepName from '@/components/onboarding/StepName';
import StepMode from '@/components/onboarding/StepMode';
import StepGoal from '@/components/onboarding/StepGoal';
import StepTheme from '@/components/onboarding/StepTheme';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [mode, setMode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [saving, setSaving] = useState(false);

  const { setLanguage, language } = useI18n();
  const { setTheme } = useTheme();
  const { updateSettings } = useUserSettings();
  const navigate = useNavigate();

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStep(1);
  };

  const handleFinish = async () => {
    setSaving(true);

    // Save user name
    await base44.auth.updateMe({ full_name: name });

    // Create settings
    await updateSettings({
      language,
      theme: selectedTheme,
      onboarding_completed: true,
      currency: 'SAR',
      currency_symbol: 'ر.س',
      notifications_enabled: true,
    });

    // Create family if selected
    if (mode === 'family' && familyName.trim()) {
      const user = await base44.auth.me();
      const family = await base44.entities.Family.create({
        family_name: familyName,
        owner_id: user.id,
      });
      await base44.entities.FamilyMember.create({
        family_id: family.id,
        user_id: user.id,
        role: 'admin',
      });
    }

    // Create goal if provided
    if (goalTitle.trim() && goalCategory) {
      await base44.entities.Goal.create({
        title: goalTitle,
        category: goalCategory,
        status: 'active',
        progress: 0,
      });
    }

    setSaving(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen mizan-pattern-bg" style={{ background: 'var(--mizan-bg)' }}>
      <div className="relative z-10 max-w-lg mx-auto">
        {step > 0 && <ProgressDots total={5} current={step} />}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepLanguage key="lang" onSelect={handleLanguageSelect} />
          )}
          {step === 1 && (
            <StepName
              key="name"
              value={name}
              onChange={setName}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepMode
              key="mode"
              mode={mode}
              familyName={familyName}
              inviteEmail={inviteEmail}
              onModeChange={setMode}
              onFamilyNameChange={setFamilyName}
              onInviteEmailChange={setInviteEmail}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepGoal
              key="goal"
              goalTitle={goalTitle}
              goalCategory={goalCategory}
              onTitleChange={setGoalTitle}
              onCategoryChange={setGoalCategory}
              onNext={() => setStep(4)}
              onSkip={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepTheme
              key="theme"
              selectedTheme={selectedTheme}
              onSelect={setSelectedTheme}
              onFinish={handleFinish}
              onBack={() => setStep(3)}
            />
          )}
        </AnimatePresence>
      </div>

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--mizan-border)', borderTopColor: 'var(--mizan-emerald)' }} />
        </div>
      )}
    </div>
  );
}