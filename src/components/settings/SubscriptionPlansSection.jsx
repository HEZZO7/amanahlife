import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PLANS_PRICING,
  COUNTRIES_AND_CURRENCIES,
  FEATURE_DESCRIPTIONS,
} from '@/lib/subscriptionPlans';

export default function SubscriptionPlansSection() {
  const { t, isRtl } = useI18n();
  const { settings, updateSettings } = useUserSettings();
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [country, setCountry] = useState(settings?.country || 'SA');
  const [loading, setLoading] = useState(false);

  const countryData = COUNTRIES_AND_CURRENCIES[country];
  const pricing = SUBSCRIPTION_PLANS_PRICING[countryData?.code];
  const currentPlan = settings?.subscription_tier || 'free';

  const handleCountryChange = async (newCountry) => {
    setLoading(true);
    try {
      const newCountryData = COUNTRIES_AND_CURRENCIES[newCountry];
      await updateSettings({
        country: newCountry,
        currency: newCountryData.code,
        currency_symbol: newCountryData.symbol,
      });
      setCountry(newCountry);
    } catch (error) {
      console.error('Error updating country:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    if (planId === currentPlan) return;
    setLoading(true);
    try {
      await updateSettings({ subscription_tier: planId });
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const plans = ['free', 'premium', 'family'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--mizan-text)' }}>
          {t('settings.subscription.plans')}
        </h3>
        <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.subscription.choose_plan')}
        </p>
      </div>

      {/* Country & Currency Selector */}
      <div className="rounded-lg p-4" style={{ background: 'var(--mizan-elevated)', border: '1px solid var(--mizan-border)' }}>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--mizan-text)' }}>
          {t('settings.regional.country')}
          <span style={{ color: 'var(--mizan-text-secondary)', fontSize: '0.875rem' }}>
            {isRtl ? ' (يؤثر على السعر والعملة)' : ' (Affects price and currency)'}
          </span>
        </label>
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          disabled={loading}
          className="w-full p-2 rounded-md text-sm"
          style={{
            background: 'var(--mizan-bg)',
            color: 'var(--mizan-text)',
            border: '1px solid var(--mizan-border)',
          }}
        >
          {Object.entries(COUNTRIES_AND_CURRENCIES).map(([code, data]) => (
            <option key={code} value={code}>
              {isRtl ? data.name : data.nameEn} ({data.symbol})
            </option>
          ))}
        </select>
        <p className="text-xs mt-2" style={{ color: 'var(--mizan-text-secondary)' }}>
          {t('settings.subscription.current_currency')}: {countryData?.currency} ({countryData?.symbol})
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex gap-2 p-2 rounded-lg" style={{ background: 'var(--mizan-bg)', border: '1px solid var(--mizan-border)' }}>
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            billingPeriod === 'monthly'
              ? 'text-white'
              : ''
          }`}
          style={{
            background: billingPeriod === 'monthly' ? 'var(--mizan-emerald)' : 'transparent',
            color: billingPeriod === 'monthly' ? 'white' : 'var(--mizan-text)',
          }}
        >
          {isRtl ? 'شهري' : t('settings.subscription.monthly')}
        </button>
        <button
          onClick={() => setBillingPeriod('yearly')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            billingPeriod === 'yearly'
              ? 'text-white'
              : ''
          }`}
          style={{
            background: billingPeriod === 'yearly' ? 'var(--mizan-emerald)' : 'transparent',
            color: billingPeriod === 'yearly' ? 'white' : 'var(--mizan-text)',
          }}
        >
          {isRtl ? 'سنوي' : t('settings.subscription.yearly')} {billingPeriod === 'yearly' && <span className="text-xs">{isRtl ? '(توفير شهرين)' : '(Save 2 months)'}</span>}
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((planId) => {
          const plan = SUBSCRIPTION_PLANS[planId];
          const planPricing = billingPeriod === 'monthly' 
            ? pricing[planId].monthlyPrice 
            : pricing[planId].yearlyPrice;
          const isCurrentPlan = currentPlan === planId;

          return (
            <div
              key={planId}
              className="rounded-xl overflow-hidden transition-all border-2"
              style={{
                background: 'var(--mizan-surface)',
                borderColor: isCurrentPlan ? 'var(--mizan-emerald)' : 'var(--mizan-border)',
                boxShadow: isCurrentPlan ? '0 0 20px rgba(11, 91, 80, 0.2)' : 'none',
              }}
            >
              {/* Plan Header */}
              <div
                className="p-4 text-center text-white"
                style={{ background: isCurrentPlan ? 'var(--mizan-emerald)' : 'var(--mizan-emerald-light)' }}
              >
                <h4 className="text-lg font-bold">
                  {planId === 'free' && (isRtl ? 'رفيق الحياة' : 'Life Companion')}
                  {planId === 'premium' && (isRtl ? 'الحياة المتوازنة' : 'Balanced Life')}
                  {planId === 'family' && (isRtl ? 'أمانة العائلة' : 'Family Amanah')}
                </h4>
                <p className="text-xs mt-1 opacity-90">
                  {planId === 'free' && (isRtl ? 'الباقة الأساسية والمثالية للأفراد الذين يبدأون رحلتهم' : 'The basic plan perfect for individuals starting their journey')}
                  {planId === 'premium' && (isRtl ? 'باقة مميزة للطموحين الذين يسعون لتعميق التوازن' : 'Premium plan for ambitious individuals seeking deeper balance')}
                  {planId === 'family' && (isRtl ? 'باقة شاملة للعائلات الراغبة بالتعاون والتوازن' : 'Comprehensive plan for families seeking cooperation and balance')}
                </p>
              </div>

              {/* Plan Content */}
              <div className="p-4 space-y-4">
                {/* Price */}
                <div className="text-center border-b pb-4" style={{ borderColor: 'var(--mizan-border)' }}>
                  {planPricing === 0 ? (
                    <p className="text-2xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>
                      {t('settings.subscription.free')}
                    </p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold" style={{ color: 'var(--mizan-emerald)' }}>
                        {countryData?.symbol}{planPricing.toFixed(2)}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--mizan-text-secondary)' }}>
                        {billingPeriod === 'monthly' ? (isRtl ? 'لكل شهر' : 'per month') : (isRtl ? 'لكل سنة' : 'per year')}
                      </p>
                    </>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  {Object.entries(plan.features).map(([featureKey, hasFeature]) => (
                    <div key={featureKey} className="flex items-start gap-2">
                      {hasFeature ? (
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--mizan-green)' }} />
                      ) : (
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }} />
                      )}
                      <span
                        className="text-sm"
                        style={{
                          color: hasFeature ? 'var(--mizan-text)' : 'var(--mizan-text-secondary)',
                          textAlign: isRtl ? 'right' : 'left',
                        }}
                      >
                        {isRtl
                          ? FEATURE_DESCRIPTIONS[featureKey].ar
                          : FEATURE_DESCRIPTIONS[featureKey].en}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectPlan(planId)}
                  disabled={isCurrentPlan || loading}
                  className="w-full mt-4 text-white font-semibold"
                  style={{
                    background: isCurrentPlan ? 'var(--mizan-text-secondary)' : 'var(--mizan-emerald)',
                    opacity: isCurrentPlan ? 0.6 : 1,
                  }}
                >
                  {isCurrentPlan
                    ? (isRtl ? 'الخطة الحالية' : 'Current Plan')
                    : (isRtl ? 'اختر الخطة' : 'Select Plan')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Note */}
       <div
         className="p-4 rounded-lg text-sm text-center"
         style={{
           background: 'var(--mizan-emerald)',
           color: 'white',
         }}
       >
         💡 {isRtl
           ? 'يمكنك تغيير الباقة أو البلد في أي وقت. سيتم تحديث الأسعار والعملة تلقائيًا.'
           : 'You can change your plan or country anytime. Prices and currency will update automatically.'}
       </div>
    </div>
  );
}