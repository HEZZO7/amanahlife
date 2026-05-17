import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useUserSettings } from '@/lib/UserSettingsContext';
import { useTheme } from '@/lib/ThemeContext';

export default function SubscriptionPlansSection() {
  const { language } = useI18n();
  const isArabic = language === 'ar';
  const { settings, updateSettings } = useUserSettings();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  // Theme-aware color helpers
  const cardBg = isDark ? '#111827' : '#ffffff';
  const cardBgSelected = isDark ? '#064e3b' : '#f0fdf9';
  const cardHeaderBg = isDark ? '#1f2937' : '#f3f4f6';
  const cardHeaderBgSelected = isDark ? '#047857' : '#d1fae5';
  const cardHeaderColor = isDark ? '#ffffff' : '#111827';
  const cardBorder = isDark ? '#1f2937' : '#e5e7eb';
  const cardBorderSelected = '#2dd4bf';
  const featureDivider = isDark ? '#1f2937' : '#f3f4f6';
  const featureTextIncluded = isDark ? '#f3f4f6' : '#111827';
  const featureTextExcluded = isDark ? '#6b7280' : '#9ca3af';
  const priceColor = isDark ? '#ffffff' : '#111827';
  const priceColorSelected = '#0d9488';
  const subTextColor = isDark ? '#9ca3af' : '#6b7280';
  const toggleBg = isDark ? '#0F4438' : '#f3f4f6';
  const toggleActiveBg = '#2dd4bf';
  const toggleActiveColor = '#064e3b';
  const toggleInactiveColor = isDark ? '#a7f3d0' : '#374151';
  const infoBannerBg = isDark ? '#0F4438' : '#f0fdf9';
  const infoBannerColor = isDark ? '#d1fae5' : '#065f46';

  const handleSelectPlan = async (planId) => {
    if (planId === settings?.subscription_tier) return;
    setLoading(true);
    try {
      await updateSettings({ subscription_tier: planId });
    } catch (error) {
      console.error('Error updating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = settings?.subscription_tier || 'free';

  const premiumMonthly = 24.99;
  const premiumYearly = premiumMonthly * 12 * 0.8; // 20% discount
  const familyMonthly = 49.99;
  const familyYearly = familyMonthly * 12 * 0.8; // 20% discount

  const getPremiumPrice = () => billingPeriod === 'monthly' ? premiumMonthly : (premiumYearly / 12).toFixed(2);
  const getFamilyPrice = () => billingPeriod === 'monthly' ? familyMonthly : (familyYearly / 12).toFixed(2);
  const getPremiumYearlyTotal = () => premiumYearly.toFixed(2);
  const getFamilyYearlyTotal = () => familyYearly.toFixed(2);

  return (
    <div style={{ padding: '20px 0', backgroundColor: 'transparent', width: '100%', direction: isArabic ? 'rtl' : 'ltr' }}>
      {/* Billing Period Toggle */}
      <div style={{ maxWidth: '480px', margin: '0 auto', marginBottom: '24px', display: 'flex', gap: '8px', backgroundColor: toggleBg, padding: '8px', borderRadius: '12px', border: '1px solid rgba(45, 212, 191, 0.15)' }}>
        <button
          onClick={() => setBillingPeriod('monthly')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: billingPeriod === 'monthly' ? toggleActiveBg : 'transparent',
            color: billingPeriod === 'monthly' ? toggleActiveColor : toggleInactiveColor,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isArabic ? 'شهري' : 'Monthly'}
        </button>
        <button
          onClick={() => setBillingPeriod('yearly')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: billingPeriod === 'yearly' ? toggleActiveBg : 'transparent',
            color: billingPeriod === 'yearly' ? toggleActiveColor : toggleInactiveColor,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
          {isArabic ? 'سنوي' : 'Yearly'}
          {billingPeriod === 'yearly' && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: isArabic ? 'auto' : '8px',
              left: isArabic ? '8px' : 'auto',
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: '700'
            }}>
              {isArabic ? '-20%' : 'Save 20%'}
            </span>
          )}
        </button>
      </div>

      {/* Plan Cards Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '480px', margin: '0 auto' }}>
        
        {/* CARD 1: LIFE COMPANION */}
        {(() => {
          const isSelected = currentPlan === 'free';
          return (
        <div onClick={() => handleSelectPlan('free')} style={{
          backgroundColor: isSelected ? cardBgSelected : cardBg,
          borderRadius: '16px',
          border: isSelected ? `2.5px solid ${cardBorderSelected}` : `1px solid ${cardBorder}`,
          overflow: 'hidden',
          transition: 'all 0.25s ease-in-out',
          cursor: 'pointer',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isSelected ? '0 10px 25px -5px rgba(45, 212, 191, 0.2)' : 'none'
        }}>
          <div style={{ backgroundColor: isSelected ? cardHeaderBgSelected : cardHeaderBg, padding: '24px 16px', textAlign: 'center', color: cardHeaderColor, borderBottom: isSelected ? `2px solid ${cardBorderSelected}` : `1px solid ${cardBorder}`, transition: 'all 0.25s' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>{isArabic ? 'رفيق الحياة' : 'Life Companion'}</h3>
            <p style={{ fontSize: '13px', opacity: 0.75, marginTop: '8px', marginBottom: 0 }}>{isArabic ? 'الخطة الأساسية المثالية للأفراد في بداية رحلتهم' : 'The basic plan perfect for individuals starting their journey'}</p>
          </div>
          <div style={{ padding: '24px 16px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '24px', color: isSelected ? priceColorSelected : priceColor, transition: 'color 0.25s' }}>
              {isArabic ? 'مجاني' : 'Free'}
            </div>
            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { ar: 'إدارة المهام الأساسية', en: 'Basic Task Management', inc: true },
                { ar: 'تتبع الأهداف', en: 'Goal Tracking', inc: true },
                { ar: 'متابع الصلوات اليومية', en: 'Daily Prayer Tracker', inc: true },
                { ar: 'تذكيرات المهام الأساسية', en: 'Basic Task Reminders', inc: true },
                { ar: 'حاسبة الزكاة', en: 'Zakat Calculator', inc: true },
                { ar: 'التتبع الصحي الأساسي', en: 'Basic Wellness Tracking', inc: true },
                { ar: 'سجل التعلم الأساسي', en: 'Basic Learning Log', inc: true },
                { ar: 'تذكيرات متقدمة (قبل ساعة أو يوم)', en: 'Advanced Reminders (1hr or 1day)', inc: false },
                { ar: 'تتبع الميزانية الشخصية', en: 'Personal Budget Tracking', inc: false },
                { ar: 'رؤى وتوصيات الذكاء الاصطناعي', en: 'AI Insights & Recommendations', inc: false },
                { ar: 'مراجعات الحياة الشهرية والسنوية', en: 'Monthly & Annual Life Reviews', inc: false },
                { ar: 'المشاركة العائلية', en: 'Family Sharing', inc: false },
                { ar: 'الميزانية العائلية المشتركة', en: 'Shared Family Budget', inc: false },
                { ar: 'خزنة أمانة - حفظ المستندات الآمن', en: 'Amana Vault - Secure Document Storage', inc: false }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${featureDivider}`, direction: isArabic ? 'rtl' : 'ltr' }}>
                  <span style={{ color: f.inc ? '#10b981' : '#9ca3af', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {f.inc ? '✓' : '✕'}
                  </span>
                  <span style={{ fontSize: '14px', color: f.inc ? featureTextIncluded : featureTextExcluded, fontWeight: f.inc ? '500' : '400', textAlign: isArabic ? 'right' : 'left', flexGrow: 1 }}>
                    {isArabic ? f.ar : f.en}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => handleSelectPlan('free')} disabled={currentPlan === 'free' || loading} style={{ width: '100%', marginTop: '24px', padding: '14px', backgroundColor: currentPlan === 'free' ? (isDark ? '#374151' : '#e5e7eb') : '#064e3b', color: currentPlan === 'free' ? (isDark ? '#9ca3af' : '#374151') : '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', opacity: currentPlan === 'free' ? 0.6 : 1 }}>
              {isArabic ? (currentPlan === 'free' ? 'الخطة الحالية' : 'اختر الخطة') : (currentPlan === 'free' ? 'Current Plan' : 'Select Plan')}
            </button>
          </div>
        </div>
          );
        })()}

        {/* CARD 2: BALANCED LIFE */}
        {(() => {
          const isSelected = currentPlan === 'premium';
          return (
        <div onClick={() => handleSelectPlan('premium')} style={{
          backgroundColor: isSelected ? cardBgSelected : cardBg,
          borderRadius: '16px',
          border: isSelected ? `2.5px solid ${cardBorderSelected}` : `1px solid ${cardBorder}`,
          overflow: 'hidden',
          transition: 'all 0.25s ease-in-out',
          cursor: 'pointer',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isSelected ? '0 10px 25px -5px rgba(45, 212, 191, 0.2)' : 'none'
        }}>
          <div style={{ backgroundColor: isSelected ? cardHeaderBgSelected : cardHeaderBg, padding: '24px 16px', textAlign: 'center', color: cardHeaderColor, borderBottom: isSelected ? `2px solid ${cardBorderSelected}` : `1px solid ${cardBorder}`, transition: 'all 0.25s' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>{isArabic ? 'الحياة المتوازنة' : 'Balanced Life'}</h3>
            <p style={{ fontSize: '13px', opacity: 0.75, marginTop: '8px', marginBottom: 0 }}>{isArabic ? 'خطة متميزة للأفراد الطموحين الذين يسعون لتوازن أعمق' : 'Premium plan for ambitious individuals seeking deeper balance'}</p>
          </div>
          <div style={{ padding: '24px 16px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '24px', color: isSelected ? priceColorSelected : priceColor, transition: 'color 0.25s' }}>
              {getPremiumPrice()} {isArabic ? 'ر.س' : 'SAR'}{billingPeriod === 'yearly' && <span style={{ fontSize: '14px', fontWeight: '400', color: subTextColor }}> / {isArabic ? 'شهر' : 'month'}</span>}
              {billingPeriod === 'monthly' && <span style={{ fontSize: '14px', fontWeight: '400', color: subTextColor }}> / {isArabic ? 'شهر' : 'month'}</span>}
            </div>
            {billingPeriod === 'yearly' && (
              <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                {isArabic ? `إجمالي السنة: ${getPremiumYearlyTotal()} ر.س` : `Total per year: ${getPremiumYearlyTotal()} SAR`}
              </div>
            )}
            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { ar: 'إدارة المهام الأساسية', en: 'Basic Task Management', inc: true },
                { ar: 'تتبع الأهداف', en: 'Goal Tracking', inc: true },
                { ar: 'متابع الصلوات اليومية', en: 'Daily Prayer Tracker', inc: true },
                { ar: 'تذكيرات المهام الأساسية', en: 'Basic Task Reminders', inc: true },
                { ar: 'حاسبة الزكاة', en: 'Zakat Calculator', inc: true },
                { ar: 'التتبع الصحي الأساسي', en: 'Basic Wellness Tracking', inc: true },
                { ar: 'سجل التعلم الأساسي', en: 'Basic Learning Log', inc: true },
                { ar: 'تذكيرات متقدمة (قبل ساعة أو يوم)', en: 'Advanced Reminders (1hr or 1day)', inc: true },
                { ar: 'تتبع الميزانية الشخصية', en: 'Personal Budget Tracking', inc: true },
                { ar: 'رؤى وتوصيات الذكاء الاصطناعي', en: 'AI Insights & Recommendations', inc: true },
                { ar: 'مراجعات الحياة الشهرية والسنوية', en: 'Monthly & Annual Life Reviews', inc: true },
                { ar: 'المشاركة العائلية', en: 'Family Sharing', inc: false },
                { ar: 'الميزانية العائلية المشتركة', en: 'Shared Family Budget', inc: false },
                { ar: 'خزنة أمانة - حفظ المستندات الآمن', en: 'Amana Vault - Secure Document Storage', inc: false }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${featureDivider}`, direction: isArabic ? 'rtl' : 'ltr' }}>
                  <span style={{ color: f.inc ? '#10b981' : '#9ca3af', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {f.inc ? '✓' : '✕'}
                  </span>
                  <span style={{ fontSize: '14px', color: f.inc ? featureTextIncluded : featureTextExcluded, fontWeight: f.inc ? '500' : '400', textAlign: isArabic ? 'right' : 'left', flexGrow: 1 }}>
                    {isArabic ? f.ar : f.en}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => handleSelectPlan('premium')} disabled={currentPlan === 'premium' || loading} style={{ width: '100%', marginTop: '24px', padding: '14px', backgroundColor: currentPlan === 'premium' ? (isDark ? '#374151' : '#e5e7eb') : '#064e3b', color: currentPlan === 'premium' ? (isDark ? '#9ca3af' : '#374151') : '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', opacity: currentPlan === 'premium' ? 0.6 : 1 }}>
              {isArabic ? (currentPlan === 'premium' ? 'الخطة الحالية' : 'اختر الخطة') : (currentPlan === 'premium' ? 'Current Plan' : 'Select Plan')}
            </button>
          </div>
        </div>
          );
        })()}

        {/* CARD 3: FAMILY AMANAH */}
        {(() => {
          const isSelected = currentPlan === 'family';
          return (
        <div onClick={() => handleSelectPlan('family')} style={{
          backgroundColor: isSelected ? cardBgSelected : cardBg,
          borderRadius: '16px',
          border: isSelected ? `2.5px solid ${cardBorderSelected}` : `1px solid ${cardBorder}`,
          overflow: 'hidden',
          transition: 'all 0.25s ease-in-out',
          cursor: 'pointer',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isSelected ? '0 10px 25px -5px rgba(45, 212, 191, 0.2)' : 'none'
        }}>
          <div style={{ backgroundColor: isSelected ? cardHeaderBgSelected : cardHeaderBg, padding: '24px 16px', textAlign: 'center', color: cardHeaderColor, borderBottom: isSelected ? `2px solid ${cardBorderSelected}` : `1px solid ${cardBorder}`, transition: 'all 0.25s' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>{isArabic ? 'أمانة العائلة' : 'Family Amanah'}</h3>
            <p style={{ fontSize: '13px', opacity: 0.75, marginTop: '8px', marginBottom: 0 }}>{isArabic ? 'خطة شاملة للعائلات التي تسعى للتعاون والتوازن' : 'Comprehensive plan for families seeking cooperation and balance'}</p>
          </div>
          <div style={{ padding: '24px 16px' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '24px', color: isSelected ? priceColorSelected : priceColor }}>
              {getFamilyPrice()} {isArabic ? 'ر.س' : 'SAR'}{billingPeriod === 'yearly' && <span style={{ fontSize: '14px', fontWeight: '400', color: subTextColor }}> / {isArabic ? 'شهر' : 'month'}</span>}
              {billingPeriod === 'monthly' && <span style={{ fontSize: '14px', fontWeight: '400', color: subTextColor }}> / {isArabic ? 'شهر' : 'month'}</span>}
            </div>
            {billingPeriod === 'yearly' && (
              <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                {isArabic ? `إجمالي السنة: ${getFamilyYearlyTotal()} ر.س` : `Total per year: ${getFamilyYearlyTotal()} SAR`}
              </div>
            )}
            {/* Feature List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { ar: 'إدارة المهام الأساسية', en: 'Basic Task Management', inc: true },
                { ar: 'تتبع الأهداف', en: 'Goal Tracking', inc: true },
                { ar: 'متابع الصلوات اليومية', en: 'Daily Prayer Tracker', inc: true },
                { ar: 'تذكيرات المهام الأساسية', en: 'Basic Task Reminders', inc: true },
                { ar: 'حاسبة الزكاة', en: 'Zakat Calculator', inc: true },
                { ar: 'التتبع الصحي الأساسي', en: 'Basic Wellness Tracking', inc: true },
                { ar: 'سجل التعلم الأساسي', en: 'Basic Learning Log', inc: true },
                { ar: 'تذكيرات متقدمة (قبل ساعة أو يوم)', en: 'Advanced Reminders (1hr or 1day)', inc: true },
                { ar: 'تتبع الميزانية الشخصية', en: 'Personal Budget Tracking', inc: true },
                { ar: 'رؤى وتوصيات الذكاء الاصطناعي', en: 'AI Insights & Recommendations', inc: true },
                { ar: 'مراجعات الحياة الشهرية والسنوية', en: 'Monthly & Annual Life Reviews', inc: true },
                { ar: 'المشاركة العائلية', en: 'Family Sharing', inc: true },
                { ar: 'الميزانية العائلية المشتركة', en: 'Shared Family Budget', inc: true },
                { ar: 'خزنة أمانة - حفظ المستندات الآمن', en: 'Amana Vault - Secure Document Storage', inc: true }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${featureDivider}`, direction: isArabic ? 'rtl' : 'ltr' }}>
                  <span style={{ color: f.inc ? '#10b981' : '#9ca3af', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {f.inc ? '✓' : '✕'}
                  </span>
                  <span style={{ fontSize: '14px', color: f.inc ? featureTextIncluded : featureTextExcluded, fontWeight: f.inc ? '500' : '400', textAlign: isArabic ? 'right' : 'left', flexGrow: 1 }}>
                    {isArabic ? f.ar : f.en}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => handleSelectPlan('family')} disabled={currentPlan === 'family' || loading} style={{ width: '100%', marginTop: '24px', padding: '14px', backgroundColor: currentPlan === 'family' ? (isDark ? '#374151' : '#e5e7eb') : '#064e3b', color: currentPlan === 'family' ? (isDark ? '#9ca3af' : '#374151') : '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', opacity: currentPlan === 'family' ? 0.6 : 1 }}>
              {isArabic ? (currentPlan === 'family' ? 'الخطة الحالية' : 'اختر الخطة') : (currentPlan === 'family' ? 'Current Plan' : 'Select Plan')}
            </button>
          </div>
        </div>
          );
        })()}

      </div>

      {/* Info Banner */}
      <div style={{
        marginTop: '24px',
        maxWidth: '480px',
        margin: '24px auto 0',
        backgroundColor: infoBannerBg,
        borderRadius: '12px',
        padding: '16px',
        color: infoBannerColor,
        fontSize: '13px',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        {isArabic 
          ? 'يمكنك تغيير خطتك أو بلدك في أي وقت. سيتم تحديث الأسعار والعملة تلقائيًا.' 
          : 'You can change your plan or country anytime. Prices and currency will update automatically.'}
      </div>
    </div>
  );
}