import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle2, AlertCircle, RefreshCcw, CreditCard, XCircle, Loader2, ExternalLink } from 'lucide-react';
import PaywallSheet from '@/components/monetization/PaywallSheet';

const TIER_META = {
  free:    { colorBg: 'var(--mizan-surface)',   colorText: 'var(--mizan-text)',           colorBorder: 'var(--mizan-border)' },
  premium: { colorBg: 'var(--mizan-emerald)',   colorText: 'white',                       colorBorder: 'var(--mizan-emerald)' },
  family:  { colorBg: 'var(--mizan-gold)',      colorText: 'white',                       colorBorder: 'var(--mizan-gold)' },
};

export default function SubscriptionSection() {
  const { t, language } = useI18n();
  const isAr = language === 'ar';
  const { settings, reloadSettings } = useUserSettings();
  const tier = settings?.subscription_tier || 'free';
  const [subscription, setSubscription] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [portalError, setPortalError] = useState('');

  useEffect(() => {
    // Check URL for success/cancelled
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccessMsg(isAr ? '🎉 تم تفعيل اشتراكك بنجاح!' : '🎉 Subscription activated successfully!');
      // Reload settings after payment
      setTimeout(() => reloadSettings?.(), 2000);
    }
  }, []);

  useEffect(() => {
    const loadSub = async () => {
      setLoading(true);
      try {
        const user = await base44.auth.me();
        const subs = await base44.entities.Subscription.filter({ user_email: user.email });
        if (subs.length > 0) setSubscription(subs[0]);
      } catch (e) { /* silent */ }
      setLoading(false);
    };
    loadSub();
  }, []);

  const openPortal = async () => {
    if (window !== window.top) {
      alert(isAr ? 'يرجى فتح التطبيق من المتصفح مباشرةً لإدارة اشتراكك.' : 'Please open the app directly in your browser to manage your subscription.');
      return;
    }
    setPortalLoading(true);
    setPortalError('');
    try {
      const res = await base44.functions.invoke('stripePortal', {
        return_url: `${window.location.origin}/settings?tab=subscription`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        setPortalError(res.data?.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch (e) {
      setPortalError(isAr ? 'تعذّر فتح بوابة الدفع' : 'Could not open billing portal');
    }
    setPortalLoading(false);
  };

  const tierLabel = {
    free:    isAr ? 'رفيق الحياة (مجاني)' : 'Life Companion (Free)',
    premium: isAr ? 'الحياة المتوازنة' : 'Balanced Life',
    family:  isAr ? 'أمانة العائلة' : 'Family Amanah',
  }[tier];

  const meta = TIER_META[tier];

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
    <div className="space-y-5">
      <h2 className="text-lg font-semibold mizan-section-header" style={{ color: 'var(--mizan-text)' }}>
        {t('settings.subscription')}
      </h2>

      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: 'var(--mizan-emerald)18', border: '1px solid var(--mizan-emerald)44' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-emerald)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--mizan-emerald)' }}>{successMsg}</p>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" style={{ color: tier === 'free' ? 'var(--mizan-text-secondary)' : meta.colorBg }} />
            <span className="text-sm font-medium" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isAr ? 'الباقة الحالية' : 'Current Plan'}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: meta.colorBg, color: meta.colorText, border: `1px solid ${meta.colorBorder}` }}>
            {tierLabel}
          </span>
        </div>

        {!loading && subscription && tier !== 'free' && (
          <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: 'var(--mizan-border)' }}>
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

      {/* CTA */}
      {tier === 'free' ? (
        <Button onClick={() => setShowPaywall(true)}
          className="w-full h-11 text-white font-semibold rounded-xl"
          style={{ background: 'var(--mizan-emerald)' }}>
          <Crown className="w-4 h-4 me-2" />
          {isAr ? 'ترقية إلى مميز' : 'Upgrade to Premium'}
        </Button>
      ) : (
        <div className="space-y-2">
          {/* Change Plan */}
          <Button variant="outline" onClick={() => setShowPaywall(true)}
            className="w-full h-10 rounded-xl text-sm"
            style={{ borderColor: 'var(--mizan-border)', color: 'var(--mizan-text-secondary)' }}>
            <RefreshCcw className="w-3.5 h-3.5 me-2" />
            {isAr ? 'تغيير الباقة' : 'Change Plan'}
          </Button>

          {/* Manage via Stripe Portal */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isAr ? 'إدارة الاشتراك عبر بوابة الدفع الآمنة' : 'Manage via Secure Billing Portal'}
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={openPortal} disabled={portalLoading}
                className="w-full h-10 rounded-xl text-sm justify-start gap-2"
                style={{ borderColor: 'var(--mizan-border)', color: 'var(--mizan-text)' }}>
                {portalLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <CreditCard className="w-3.5 h-3.5" style={{ color: 'var(--mizan-emerald)' }} />}
                {isAr ? 'تحديث بيانات الدفع' : 'Update Payment Method'}
                <ExternalLink className="w-3 h-3 ms-auto opacity-40" />
              </Button>
              <Button variant="outline" onClick={openPortal} disabled={portalLoading}
                className="w-full h-10 rounded-xl text-sm justify-start gap-2"
                style={{ borderColor: 'var(--mizan-red)44', color: 'var(--mizan-red)' }}>
                {portalLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <XCircle className="w-3.5 h-3.5" />}
                {isAr ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                <ExternalLink className="w-3 h-3 ms-auto opacity-40" />
              </Button>
            </div>
            {portalError && (
              <p className="text-xs" style={{ color: 'var(--mizan-red)' }}>{portalError}</p>
            )}
            <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)', opacity: 0.6 }}>
              {isAr
                ? 'ستُعاد إلى هذه الصفحة بعد إتمام العملية'
                : 'You will be returned here after completing the action'}
            </p>
          </div>
        </div>
      )}

      {showPaywall && <PaywallSheet onClose={() => setShowPaywall(false)} />}
    </div>
  );
}