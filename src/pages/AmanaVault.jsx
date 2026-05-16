import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { FileText, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaywallSheet from '@/components/monetization/PaywallSheet';
import DocumentsSection from '@/components/vault/DocumentsSection';
import WasiyyahSection from '@/components/vault/WasiyyahSection';
import EmergencyInfoCard from '@/components/vault/EmergencyInfoCard';

export default function AmanaVault() {
  const { language } = useI18n();
  const { settings } = useUserSettings();
  const [showPaywall, setShowPaywall] = useState(false);
  const isPremium = settings?.subscription_tier === 'premium' || settings?.subscription_tier === 'family';

  if (!isPremium) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--mizan-gold)20' }}>
            <Lock className="w-8 h-8" style={{ color: 'var(--mizan-gold)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'خزنة الأمانة' : 'Amanah Vault'}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' 
              ? 'ميزة مميزة حصرية لحماية وتنظيم وثائقك وأوصياتك الإسلامية'
              : 'Exclusive premium feature to protect and organize your documents and Islamic will'}
          </p>
          <Button onClick={() => setShowPaywall(true)} className="h-10 px-6 text-white rounded-lg gap-2" style={{ background: 'var(--mizan-emerald)' }}>
            <Zap className="w-4 h-4" />
            {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
          </Button>
        </div>

        {showPaywall && <PaywallSheet onClose={() => setShowPaywall(false)} />}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
          {language === 'ar' ? 'خزنة الأمانة' : 'Amanah Vault'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
          {language === 'ar' 
            ? 'تنظيم آمن لوثائقك وأوصياتك الإسلامية'
            : 'Secure organization of your documents and Islamic will'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Documents Section */}
        <DocumentsSection />

        {/* Wasiyyah Section */}
        <WasiyyahSection />

        {/* Emergency Info */}
        <EmergencyInfoCard />
      </div>
    </div>
  );
}