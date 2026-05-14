import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Check, Zap, Users, BarChart3, Download, Star } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, en: 'Full Analytics & Charts', ar: 'تحليلات وإحصائيات كاملة' },
  { icon: Download, en: 'Export to PDF & Excel', ar: 'تصدير إلى PDF و Excel' },
  { icon: Star, en: 'AI Insights & Daily Tips', ar: 'رؤى الذكاء الاصطناعي' },
  { icon: Zap, en: 'Unlimited Goals & Tasks', ar: 'أهداف ومهام غير محدودة' },
  { icon: Users, en: 'Family Plan (up to 6)', ar: 'خطة عائلية (حتى 6 أشخاص)' },
];

const PLANS = [
  { key: 'premium', en: 'Premium', ar: 'مميز', price: '29', period: { en: '/month', ar: '/شهر' }, color: 'var(--mizan-emerald)' },
  { key: 'family', en: 'Family', ar: 'عائلي', price: '49', period: { en: '/month', ar: '/شهر' }, color: 'var(--mizan-gold)', badge: { en: 'Best Value', ar: 'الأفضل' } },
];

export default function PaywallSheet({ onClose }) {
  const { language } = useI18n();
  const { reloadSettings } = useUserSettings();
  const [selected, setSelected] = React.useState('premium');
  const [loading, setLoading] = React.useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    // In production this would go through Stripe. For now, update settings.
    await base44.auth.updateMe({ subscription_tier: selected });
    await reloadSettings?.();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        {/* Header */}
        <div className="relative p-6 text-center" style={{ background: 'linear-gradient(135deg, var(--mizan-emerald), var(--mizan-emerald-light))' }}>
          <button onClick={onClose} className="absolute top-4 right-4">
            <X className="w-5 h-5 text-white opacity-70" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">{language === 'ar' ? 'ترقية إلى مميز' : 'Upgrade to Premium'}</h2>
          <p className="text-sm text-white opacity-80">{language === 'ar' ? 'افتح الإمكانيات الكاملة' : 'Unlock your full potential'}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Features */}
          <div className="space-y-2">
            {FEATURES.map(({ icon: Icon, en, ar }) => (
              <div key={en} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--mizan-emerald)22' }}>
                  <Check className="w-3.5 h-3.5" style={{ color: 'var(--mizan-emerald)' }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--mizan-text)' }}>{language === 'ar' ? ar : en}</span>
              </div>
            ))}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map(({ key, en, ar, price, period, color, badge }) => (
              <button key={key} onClick={() => setSelected(key)}
                className="relative p-3 rounded-xl text-center transition-all"
                style={{ border: `2px solid ${selected === key ? color : 'var(--mizan-border)'}`, background: selected === key ? `${color}11` : 'var(--mizan-surface)' }}>
                {badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: color }}>
                    {language === 'ar' ? badge.ar : badge.en}
                  </span>
                )}
                <p className="text-sm font-bold mt-1" style={{ color }}>{language === 'ar' ? ar : en}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--mizan-text)' }}>${price}</p>
                <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{language === 'ar' ? period.ar : period.en}</p>
              </button>
            ))}
          </div>

          <Button onClick={handleUpgrade} disabled={loading} className="w-full h-11 text-white font-semibold rounded-xl" style={{ background: 'var(--mizan-emerald)' }}>
            {loading ? '...' : (language === 'ar' ? 'ابدأ الآن' : 'Get Started')}
          </Button>

          <p className="text-center text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? 'إلغاء في أي وقت' : 'Cancel anytime'}
          </p>
        </div>
      </div>
    </div>
  );
}