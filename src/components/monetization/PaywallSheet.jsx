import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Check, Zap, Users, BarChart3, Download, Star, Shield, Crown } from 'lucide-react';

const FEATURES_PREMIUM = [
  { icon: BarChart3, en: 'Full Analytics & Life Reviews', ar: 'تحليلات كاملة ومراجعات الحياة' },
  { icon: Download,  en: 'Export to PDF & Excel',        ar: 'تصدير إلى PDF و Excel' },
  { icon: Star,      en: 'AI Insights & Daily Tips',     ar: 'رؤى الذكاء الاصطناعي' },
  { icon: Zap,       en: 'Budget & Advanced Reminders',  ar: 'الميزانية والتذكيرات المتقدمة' },
  { icon: Shield,    en: 'Unlimited Goals & Tasks',      ar: 'أهداف ومهام غير محدودة' },
];

const FEATURES_FAMILY = [
  ...FEATURES_PREMIUM,
  { icon: Users,  en: 'Family Sharing (up to 6)',   ar: 'مشاركة عائلية (حتى 6 أشخاص)' },
  { icon: Crown,  en: 'Amana Vault (Secure Docs)',   ar: 'أمانة فالت – تخزين المستندات' },
];

const PLANS = [
  {
    key: 'premium',
    nameEn: 'Balanced Life',
    nameAr: 'الحياة المتوازنة',
    monthly: { price: '$6.99', label_en: '/month', label_ar: '/شهر' },
    yearly:  { price: '$69.99', label_en: '/year', label_ar: '/سنة', save_en: 'Save 17%', save_ar: 'وفّر 17%' },
    color: 'var(--mizan-emerald)',
    features: FEATURES_PREMIUM,
  },
  {
    key: 'family',
    nameEn: 'Family Amanah',
    nameAr: 'أمانة العائلة',
    monthly: { price: '$13.99', label_en: '/month', label_ar: '/شهر' },
    yearly:  { price: '$139.99', label_en: '/year', label_ar: '/سنة', save_en: 'Save 17%', save_ar: 'وفّر 17%' },
    color: 'var(--mizan-gold)',
    badge: { en: 'Best Value', ar: 'الأفضل' },
    features: FEATURES_FAMILY,
  },
];

export default function PaywallSheet({ onClose }) {
  const { language } = useI18n();
  const { reloadSettings } = useUserSettings();
  const isAr = language === 'ar';
  const [selected, setSelected] = useState('premium');
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plan = PLANS.find(p => p.key === selected);

  const handleUpgrade = async () => {
    // Block inside iframe (preview)
    if (window.self !== window.top) {
      alert(isAr
        ? 'الدفع يعمل فقط من التطبيق المنشور، وليس من وضع المعاينة.'
        : 'Checkout only works from the published app, not the preview.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('stripeCheckout', {
        plan: selected,
        billing,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || 'Something went wrong');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const currentPricing = billing === 'yearly' ? plan.yearly : plan.monthly;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bottom-sheet-overlay"
      style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bottom-sheet-content"
        style={{ 
          background: 'var(--mizan-elevated)', 
          border: '1px solid var(--mizan-border)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}>

        {/* Header */}
        <div className="relative p-6 text-center"
          style={{ background: `linear-gradient(135deg, ${plan.color}cc, ${plan.color}88)` }}>
          <button onClick={onClose} className="absolute top-4 end-4">
            <X className="w-5 h-5 text-white/70" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isAr ? 'ترقية حسابك' : 'Upgrade Your Account'}
          </h2>
          <p className="text-sm text-white/80">
            {isAr ? 'افتح الإمكانيات الكاملة لميزان' : 'Unlock the full potential of Mizan'}
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-1 p-1 rounded-xl"
            style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: billing === b ? 'var(--mizan-emerald)' : 'transparent',
                  color: billing === b ? 'white' : 'var(--mizan-text-secondary)',
                }}>
                {b === 'monthly' ? (isAr ? 'شهري' : 'Monthly') : (isAr ? 'سنوي' : 'Yearly')}
                {b === 'yearly' && (
                  <span className="ms-1.5 text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: billing === 'yearly' ? 'rgba(255,255,255,0.25)' : 'var(--mizan-emerald)22', color: billing === 'yearly' ? 'white' : 'var(--mizan-emerald)' }}>
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map(({ key, nameEn, nameAr, monthly, yearly, color, badge }) => {
              const pricing = billing === 'yearly' ? yearly : monthly;
              return (
                <button key={key} onClick={() => setSelected(key)}
                  className="relative p-3.5 rounded-xl text-center transition-all"
                  style={{
                    border: `2px solid ${selected === key ? color : 'var(--mizan-border)'}`,
                    background: selected === key ? `${color}14` : 'var(--mizan-surface)',
                  }}>
                  {badge && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full text-white font-medium whitespace-nowrap"
                      style={{ background: color }}>
                      {isAr ? badge.ar : badge.en}
                    </span>
                  )}
                  <p className="text-sm font-bold mt-1" style={{ color }}>{isAr ? nameAr : nameEn}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--mizan-text)' }}>{pricing.price}</p>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {isAr ? pricing.label_ar : pricing.label_en}
                  </p>
                  {billing === 'yearly' && pricing.save_en && (
                    <p className="text-xs font-semibold mt-0.5" style={{ color }}>
                      {isAr ? pricing.save_ar : pricing.save_en}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Features list */}
          <div className="space-y-2 py-1">
            {plan.features.map(({ icon: Icon, en, ar }) => (
              <div key={en} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: plan.color + '22' }}>
                  <Check className="w-3 h-3" style={{ color: plan.color }} />
                </div>
                <span className="text-sm" style={{ color: 'var(--mizan-text)' }}>{isAr ? ar : en}</span>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: 'var(--mizan-red)' }}>{error}</p>
          )}

          <Button onClick={handleUpgrade} disabled={loading}
            className="w-full h-11 text-white font-semibold rounded-xl text-base"
            style={{ background: plan.color }}>
            {loading ? (isAr ? 'جارٍ التحويل...' : 'Redirecting...') : (isAr ? 'اشترك الآن' : 'Subscribe Now')}
          </Button>

          <p className="text-center text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isAr ? 'إلغاء في أي وقت • دفع آمن عبر Stripe' : 'Cancel anytime • Secure payment via Stripe'}
          </p>
        </div>
      </div>
    </div>
  );
}