import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Crown, CheckCircle2, AlertCircle, RefreshCcw,
  CreditCard, XCircle, Loader2, ExternalLink, Sparkles, Users
} from 'lucide-react';

const PLANS = [
  {
    id: 'premium',
    name_ar: 'الحياة المتوازنة',
    name_en: 'Balanced Life',
    desc_ar: 'للأفراد الطموحين',
    desc_en: 'For ambitious individuals',
    monthly: 24.99,
    color: 'var(--mizan-emerald)',
    icon: Sparkles,
    features_ar: ['تذكيرات متقدمة', 'تتبع الميزانية', 'رؤى الذكاء الاصطناعي', 'مراجعات الحياة الشهرية والسنوية'],
    features_en: ['Advanced reminders', 'Budget tracking', 'AI insights', 'Monthly & annual life reviews'],
  },
  {
    id: 'family',
    name_ar: 'أمانة العائلة',
    name_en: 'Family Amanah',
    desc_ar: 'للعائلات معاً',
    desc_en: 'For families together',
    monthly: 49.99,
    color: 'var(--mizan-gold)',
    icon: Users,
    features_ar: ['كل مميزات الحياة المتوازنة', 'مشاركة عائلية', 'ميزانية عائلية مشتركة', 'خزنة أمانة للمستندات'],
    features_en: ['All Balanced Life features', 'Family sharing', 'Shared family budget', 'Amana Vault document storage'],
  },
];

export default function SubscriptionSection() {
  const { t, language } = useI18n();
  const isAr = language === 'ar';
  const { settings, reloadSettings } = useUserSettings();
  const tier = settings?.subscription_tier || 'free';

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [billing, setBilling] = useState('monthly');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccessMsg(isAr ? '🎉 تم تفعيل اشتراكك بنجاح!' : '🎉 Subscription activated successfully!');
      setTimeout(() => reloadSettings?.(), 2000);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = await base44.auth.me();
        const subs = await base44.entities.Subscription.filter({ user_email: user.email });
        if (subs.length > 0) setSubscription(subs[0]);
      } catch (e) { /* silent */ }
      setLoading(false);
    };
    load();
  }, []);

  const getPrice = (plan) => {
    const monthly = plan.monthly;
    if (billing === 'yearly') return (monthly * 0.8).toFixed(2);
    return monthly.toFixed(2);
  };

  const handleCheckout = async (planId) => {
    if (window !== window.top) {
      alert(isAr ? 'يرجى فتح التطبيق من المتصفح مباشرةً لإتمام الدفع.' : 'Please open the app in your browser to complete payment.');
      return;
    }
    setCheckoutLoading(planId);
    setError('');
    try {
      const res = await base44.functions.invoke('stripeCheckout', { plan: planId, billing });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch (e) {
      setError(isAr ? 'تعذّر إنشاء جلسة الدفع' : 'Could not create checkout session');
    }
    setCheckoutLoading('');
  };

  const openPortal = async () => {
    if (window !== window.top) {
      alert(isAr ? 'يرجى فتح التطبيق من المتصفح لإدارة اشتراكك.' : 'Please open the app in your browser to manage your subscription.');
      return;
    }
    setPortalLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('stripePortal', {
        return_url: `${window.location.origin}/settings?tab=subscription`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setError(res.data?.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch (e) {
      setError(isAr ? 'تعذّر فتح بوابة الدفع' : 'Could not open billing portal');
    }
    setPortalLoading(false);
  };

  const tierLabel = {
    free:    isAr ? 'رفيق الحياة (مجاني)' : 'Life Companion (Free)',
    premium: isAr ? 'الحياة المتوازنة' : 'Balanced Life',
    family:  isAr ? 'أمانة العائلة' : 'Family Amanah',
  }[tier];

  const statusColor = {
    active:   'var(--mizan-green)',
    paused:   'var(--mizan-gold)',
    expired:  'var(--mizan-red)',
    inactive: 'var(--mizan-text-secondary)',
  }[subscription?.status] || 'var(--mizan-text-secondary)';

  const statusLabel = {
    active:   isAr ? 'نشط' : 'Active',
    paused:   isAr ? 'متوقف مؤقتاً' : 'Paused',
    expired:  isAr ? 'منتهي' : 'Expired',
    inactive: isAr ? 'غير نشط' : 'Inactive',
  }[subscription?.status] || '';

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {isAr ? 'إعدادات الاشتراك' : 'Subscription Settings'}
      </h2>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: 'var(--mizan-emerald)18', border: '1px solid var(--mizan-emerald)44' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-emerald)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--mizan-emerald)' }}>{successMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: 'var(--mizan-red)12', border: '1px solid var(--mizan-red)44' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-red)' }} />
          <p className="text-sm" style={{ color: 'var(--mizan-red)' }}>{error}</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4" style={{ color: tier === 'free' ? 'var(--mizan-text-secondary)' : 'var(--mizan-emerald)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isAr ? 'الباقة الحالية' : 'Current Plan'}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: tier === 'free' ? 'var(--mizan-border)' : tier === 'family' ? 'var(--mizan-gold)22' : 'var(--mizan-emerald)22',
              color: tier === 'free' ? 'var(--mizan-text-secondary)' : tier === 'family' ? 'var(--mizan-gold)' : 'var(--mizan-emerald)',
              border: `1px solid ${tier === 'free' ? 'var(--mizan-border)' : tier === 'family' ? 'var(--mizan-gold)55' : 'var(--mizan-emerald)55'}`,
            }}>
            {tierLabel}
          </span>
        </div>

        {!loading && subscription && tier !== 'free' && (
          <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--mizan-border)' }}>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--mizan-text-secondary)' }}>{isAr ? 'الحالة' : 'Status'}</span>
              <span className="font-semibold" style={{ color: statusColor }}>{statusLabel}</span>
            </div>
            {subscription.billing_period && (
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--mizan-text-secondary)' }}>{isAr ? 'دورة الفوترة' : 'Billing'}</span>
                <span style={{ color: 'var(--mizan-text)' }}>
                  {subscription.billing_period === 'yearly' ? (isAr ? 'سنوي' : 'Yearly') : (isAr ? 'شهري' : 'Monthly')}
                </span>
              </div>
            )}
            {subscription.renewal_date && (
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--mizan-text-secondary)' }}>{isAr ? 'تجديد في' : 'Renews on'}</span>
                <span style={{ color: 'var(--mizan-text)' }}>{subscription.renewal_date}</span>
              </div>
            )}
          </div>
        )}

        {subscription?.status === 'paused' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--mizan-gold)18', border: '1px solid var(--mizan-gold)44' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-gold)' }} />
            <p className="text-xs" style={{ color: 'var(--mizan-gold)' }}>
              {isAr ? 'فشل الدفع الأخير. يرجى تحديث بيانات البطاقة.' : 'Last payment failed. Please update your card.'}
            </p>
          </div>
        )}
      </div>

      {/* Manage Active Subscription via Portal */}
      {tier !== 'free' && (
        <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {isAr ? 'إدارة الاشتراك' : 'Manage Subscription'}
          </p>
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {isAr
              ? 'عبر بوابة الدفع الآمنة يمكنك تحديث طريقة الدفع، تغيير الباقة، أو إلغاء الاشتراك.'
              : 'Via the secure billing portal you can update your payment method, change your plan, or cancel.'}
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={openPortal} disabled={portalLoading}
              className="w-full h-10 rounded-xl text-sm justify-start gap-2"
              style={{ borderColor: 'var(--mizan-emerald)55', color: 'var(--mizan-text)' }}>
              {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" style={{ color: 'var(--mizan-emerald)' }} />}
              {isAr ? 'تحديث طريقة الدفع' : 'Update Payment Method'}
              <ExternalLink className="w-3 h-3 ms-auto opacity-40" />
            </Button>
            <Button variant="outline" onClick={openPortal} disabled={portalLoading}
              className="w-full h-10 rounded-xl text-sm justify-start gap-2"
              style={{ borderColor: 'var(--mizan-emerald)55', color: 'var(--mizan-text)' }}>
              {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" style={{ color: 'var(--mizan-emerald)' }} />}
              {isAr ? 'تغيير الباقة' : 'Change Plan'}
              <ExternalLink className="w-3 h-3 ms-auto opacity-40" />
            </Button>
            <Button variant="outline" onClick={openPortal} disabled={portalLoading}
              className="w-full h-10 rounded-xl text-sm justify-start gap-2"
              style={{ borderColor: 'var(--mizan-red)44', color: 'var(--mizan-red)' }}>
              {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              {isAr ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
              <ExternalLink className="w-3 h-3 ms-auto opacity-40" />
            </Button>
          </div>
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.6 }}>
            {isAr ? 'ستُعاد إلى هذه الصفحة بعد إتمام العملية' : 'You will be returned here after completing the action'}
          </p>
        </div>
      )}

      {/* Upgrade Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {tier === 'free' ? (isAr ? 'ترقية باقتك' : 'Upgrade Your Plan') : (isAr ? 'الباقات المتاحة' : 'Available Plans')}
          </p>
          {/* Billing Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--mizan-border)' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                style={{
                  background: billing === b ? 'var(--mizan-elevated)' : 'transparent',
                  color: billing === b ? 'var(--mizan-text)' : 'var(--mizan-text-secondary)',
                }}>
                {b === 'monthly' ? (isAr ? 'شهري' : 'Monthly') : (isAr ? 'سنوي -20%' : 'Yearly -20%')}
              </button>
            ))}
          </div>
        </div>

        {PLANS.map(plan => {
          const isCurrent = tier === plan.id;
          const Icon = plan.icon;
          return (
            <div key={plan.id} className="rounded-xl overflow-hidden"
              style={{
                border: `1.5px solid ${isCurrent ? plan.color : 'var(--mizan-border)'}`,
                background: isCurrent ? `${plan.color}08` : 'var(--mizan-surface)',
              }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--mizan-border)', background: isCurrent ? `${plan.color}12` : 'transparent' }}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color: plan.color }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--mizan-text)' }}>
                      {isAr ? plan.name_ar : plan.name_en}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                      {isAr ? plan.desc_ar : plan.desc_en}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold" style={{ color: plan.color }}>
                    {getPrice(plan)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
                    {isAr ? 'ر.س / شهر' : 'SAR / mo'}
                  </p>
                </div>
              </div>
              {/* Features */}
              <div className="px-4 py-3 space-y-1.5">
                {(isAr ? plan.features_ar : plan.features_en).map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                    <span className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <div className="px-4 pb-4">
                {isCurrent ? (
                  <div className="text-center py-2 rounded-xl text-xs font-semibold"
                    style={{ background: `${plan.color}18`, color: plan.color, border: `1px solid ${plan.color}44` }}>
                    {isAr ? '✓ باقتك الحالية' : '✓ Your Current Plan'}
                  </div>
                ) : (
                  <Button
                    className="w-full h-10 rounded-xl text-white text-sm font-semibold"
                    style={{ background: plan.color }}
                    disabled={!!checkoutLoading}
                    onClick={() => handleCheckout(plan.id)}>
                    {checkoutLoading === plan.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : (isAr ? `ترقية إلى ${plan.name_ar}` : `Upgrade to ${plan.name_en}`)}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Free Plan Note */}
        {tier !== 'free' && (
          <p className="text-xs text-center" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.7 }}>
            {isAr
              ? 'لإلغاء الاشتراك والرجوع للباقة المجانية، استخدم "إلغاء الاشتراك" أعلاه'
              : 'To cancel and return to the free plan, use "Cancel Subscription" above'}
          </p>
        )}
      </div>
    </div>
  );
}