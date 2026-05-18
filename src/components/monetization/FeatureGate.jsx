import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaywallSheet from './PaywallSheet';

/**
 * Wraps any content with a paywall gate.
 * If `allowed` is false, shows a locked state instead of children.
 * 
 * Props:
 *   allowed: boolean
 *   feature: 'analytics' | 'family' | 'vault' | 'reviews'  (for label)
 *   fullPage: if true, renders as a full page overlay instead of inline
 */
const FEATURE_LABELS = {
  analytics: { ar: 'التحليلات المتقدمة', en: 'Advanced Analytics', tier_ar: 'مميز', tier_en: 'Premium' },
  family:    { ar: 'أدوات العائلة',       en: 'Family Tools',      tier_ar: 'عائلي', tier_en: 'Family' },
  vault:     { ar: 'أمانة فالت',          en: 'Amana Vault',       tier_ar: 'مميز',  tier_en: 'Premium' },
  reviews:   { ar: 'مراجعات الحياة',      en: 'Life Reviews',      tier_ar: 'مميز',  tier_en: 'Premium' },
};

export default function FeatureGate({ allowed, feature = 'analytics', fullPage = false, children }) {
  const { language } = useI18n();
  const isAr = language === 'ar';
  const [showPaywall, setShowPaywall] = useState(false);

  if (allowed) return <>{children}</>;

  const meta = FEATURE_LABELS[feature] || FEATURE_LABELS.analytics;

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--mizan-emerald)18', border: '1px solid var(--mizan-emerald)44' }}>
          <Lock className="w-8 h-8" style={{ color: 'var(--mizan-emerald)' }} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-semibold"
          style={{ background: 'var(--mizan-gold)18', color: 'var(--mizan-gold)', border: '1px solid var(--mizan-gold)44' }}>
          <Crown className="w-3.5 h-3.5" />
          {isAr ? meta.tier_ar : meta.tier_en}
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--mizan-text)' }}>
          {isAr ? meta.ar : meta.en}
        </h3>
        <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--mizan-text-secondary)' }}>
          {isAr
            ? `هذه الميزة متاحة فقط في باقة ${meta.tier_ar}. قم بالترقية للوصول إليها.`
            : `This feature is available in the ${meta.tier_en} plan. Upgrade to unlock it.`}
        </p>
        <Button onClick={() => setShowPaywall(true)}
          className="h-11 px-8 text-white font-semibold rounded-xl"
          style={{ background: 'var(--mizan-emerald)' }}>
          <Crown className="w-4 h-4 me-2" />
          {isAr ? 'ترقية الآن' : 'Upgrade Now'}
        </Button>
        {showPaywall && <PaywallSheet onClose={() => setShowPaywall(false)} />}
      </div>
    );
  }


  // Inline locked state
  return (
    <div className="relative rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--mizan-border)' }}>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--mizan-surface)ee', backdropFilter: 'blur(4px)' }}>
        <Lock className="w-6 h-6" style={{ color: 'var(--mizan-emerald)' }} />
        <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
          {isAr ? meta.ar : meta.en}
        </p>
        <Button size="sm" onClick={() => setShowPaywall(true)}
          className="h-8 px-4 text-white rounded-lg text-xs"
          style={{ background: 'var(--mizan-emerald)' }}>
          {isAr ? 'ترقية للوصول' : 'Upgrade to Unlock'}
        </Button>
      </div>
      <div className="opacity-20 pointer-events-none p-4 h-32" />
      {showPaywall && <PaywallSheet onClose={() => setShowPaywall(false)} />}
    </div>
  );
}