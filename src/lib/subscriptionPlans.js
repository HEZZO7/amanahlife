// Subscription Plans Configuration with Multi-Currency Support

export const COUNTRIES_AND_CURRENCIES = {
  SA: { name: 'السعودية', nameEn: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س', code: 'SAR' },
  AE: { name: 'الإمارات', nameEn: 'UAE', currency: 'AED', symbol: 'د.إ', code: 'AED' },
  EG: { name: 'مصر', nameEn: 'Egypt', currency: 'EGP', symbol: 'ج.م', code: 'EGP' },
  KW: { name: 'الكويت', nameEn: 'Kuwait', currency: 'KWD', symbol: 'د.ك', code: 'KWD' },
  QA: { name: 'قطر', nameEn: 'Qatar', currency: 'QAR', symbol: 'ر.ق', code: 'QAR' },
  BH: { name: 'البحرين', nameEn: 'Bahrain', currency: 'BHD', symbol: 'د.ب', code: 'BHD' },
  OM: { name: 'عمان', nameEn: 'Oman', currency: 'OMR', symbol: 'ر.ع.', code: 'OMR' },
  JO: { name: 'الأردن', nameEn: 'Jordan', currency: 'JOD', symbol: 'د.ا', code: 'JOD' },
  LB: { name: 'لبنان', nameEn: 'Lebanon', currency: 'LBP', symbol: 'ل.ل', code: 'LBP' },
  PS: { name: 'فلسطين', nameEn: 'Palestine', currency: 'USD', symbol: '$', code: 'USD' },
  US: { name: 'الولايات المتحدة', nameEn: 'USA', currency: 'USD', symbol: '$', code: 'USD' },
  GB: { name: 'المملكة المتحدة', nameEn: 'UK', currency: 'GBP', symbol: '£', code: 'GBP' },
  DE: { name: 'ألمانيا', nameEn: 'Germany', currency: 'EUR', symbol: '€', code: 'EUR' },
  FR: { name: 'فرنسا', nameEn: 'France', currency: 'EUR', symbol: '€', code: 'EUR' },
  CA: { name: 'كندا', nameEn: 'Canada', currency: 'CAD', symbol: 'C$', code: 'CAD' },
  AU: { name: 'أستراليا', nameEn: 'Australia', currency: 'AUD', symbol: 'A$', code: 'AUD' },
};

// Pricing for each country/currency
export const SUBSCRIPTION_PLANS_PRICING = {
  SAR: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 24.99, yearlyPrice: 249.99 },
    family: { monthlyPrice: 49.99, yearlyPrice: 499.99 },
  },
  AED: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 91.65, yearlyPrice: 916.50 },
    family: { monthlyPrice: 183.30, yearlyPrice: 1833 },
  },
  EGP: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 760, yearlyPrice: 7600 },
    family: { monthlyPrice: 1520, yearlyPrice: 15200 },
  },
  KWD: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 7.58, yearlyPrice: 75.8 },
    family: { monthlyPrice: 15.16, yearlyPrice: 151.6 },
  },
  QAR: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 91, yearlyPrice: 910 },
    family: { monthlyPrice: 182, yearlyPrice: 1820 },
  },
  BHD: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 9.40, yearlyPrice: 94 },
    family: { monthlyPrice: 18.80, yearlyPrice: 188 },
  },
  OMR: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 9.60, yearlyPrice: 96 },
    family: { monthlyPrice: 19.20, yearlyPrice: 192 },
  },
  JOD: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 17.70, yearlyPrice: 177 },
    family: { monthlyPrice: 35.40, yearlyPrice: 354 },
  },
  LBP: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 37400, yearlyPrice: 374000 },
    family: { monthlyPrice: 74800, yearlyPrice: 748000 },
  },
  USD: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 6.99, yearlyPrice: 69.99 },
    family: { monthlyPrice: 13.99, yearlyPrice: 139.99 },
  },
  GBP: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 5.49, yearlyPrice: 54.99 },
    family: { monthlyPrice: 10.99, yearlyPrice: 109.99 },
  },
  EUR: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 6.49, yearlyPrice: 64.99 },
    family: { monthlyPrice: 12.99, yearlyPrice: 129.99 },
  },
  CAD: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 9.99, yearlyPrice: 99.99 },
    family: { monthlyPrice: 19.99, yearlyPrice: 199.99 },
  },
  AUD: {
    free: { monthlyPrice: 0, yearlyPrice: 0 },
    premium: { monthlyPrice: 10.99, yearlyPrice: 109.99 },
    family: { monthlyPrice: 21.99, yearlyPrice: 219.99 },
  },
};

// Subscription Plans Details
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    nameAr: 'شريك الحياة',
    nameEn: 'Life Companion',
    descriptionAr: 'الخطة الأساسية المثالية للأفراد في بداية رحلتهم',
    descriptionEn: 'The basic plan perfect for individuals starting their journey',
    features: {
      taskManagement: true,
      goalTracking: true,
      prayerTracker: true,
      basicReminders: true,
      zakatCalculator: true,
      basicWellness: true,
      learningLog: true,
      advancedReminders: false,
      budgetTracker: false,
      aiInsights: false,
      lifeReviews: false,
      familySharing: false,
      sharedBudget: false,
      amanaVault: false,
    },
  },
  premium: {
    id: 'premium',
    nameAr: 'حياة متوازنة',
    nameEn: 'Balanced Life',
    descriptionAr: 'خطة متميزة للأفراد الطموحين الذين يسعون لتوازن أعمق',
    descriptionEn: 'Premium plan for ambitious individuals seeking deeper balance',
    features: {
      taskManagement: true,
      goalTracking: true,
      prayerTracker: true,
      basicReminders: true,
      zakatCalculator: true,
      basicWellness: true,
      learningLog: true,
      advancedReminders: true,
      budgetTracker: true,
      aiInsights: true,
      lifeReviews: true,
      familySharing: false,
      sharedBudget: false,
      amanaVault: false,
    },
  },
  family: {
    id: 'family',
    nameAr: 'أمانة العائلة',
    nameEn: 'Family Amanah',
    descriptionAr: 'خطة شاملة للعائلات التي تسعى للتعاون والتوازن',
    descriptionEn: 'Comprehensive plan for families seeking cooperation and balance',
    features: {
      taskManagement: true,
      goalTracking: true,
      prayerTracker: true,
      basicReminders: true,
      zakatCalculator: true,
      basicWellness: true,
      learningLog: true,
      advancedReminders: true,
      budgetTracker: true,
      aiInsights: true,
      lifeReviews: true,
      familySharing: true,
      sharedBudget: true,
      amanaVault: true,
    },
  },
};

export const FEATURE_DESCRIPTIONS = {
  taskManagement: { ar: 'إدارة المهام الأساسية', en: 'Basic Task Management' },
  goalTracking: { ar: 'تتبع الأهداف', en: 'Goal Tracking' },
  prayerTracker: { ar: 'متتبع الصلاة اليومي', en: 'Daily Prayer Tracker' },
  basicReminders: { ar: 'تذكيرات مهام أساسية', en: 'Basic Task Reminders' },
  zakatCalculator: { ar: 'حاسبة الزكاة', en: 'Zakat Calculator' },
  basicWellness: { ar: 'تتبع الرفاهية الأساسي', en: 'Basic Wellness Tracking' },
  learningLog: { ar: 'سجل التعلم الأساسي', en: 'Basic Learning Log' },
  advancedReminders: { ar: 'تذكيرات متقدمة (قبل ساعة أو يوم)', en: 'Advanced Reminders (1hr or 1day)' },
  budgetTracker: { ar: 'إدارة الميزانية الشخصية', en: 'Personal Budget Tracking' },
  aiInsights: { ar: 'رؤى الذكاء الاصطناعي', en: 'AI Insights & Recommendations' },
  lifeReviews: { ar: 'تقارير شهرية وسنوية', en: 'Monthly & Annual Life Reviews' },
  familySharing: { ar: 'مشاركة عائلية', en: 'Family Sharing' },
  sharedBudget: { ar: 'الميزانية العائلية المشتركة', en: 'Shared Family Budget' },
  amanaVault: { ar: 'أمانة فالت - تخزين آمن للمستندات', en: 'Amana Vault - Secure Document Storage' },
};

export const getCountryByCode = (code) => COUNTRIES_AND_CURRENCIES[code];
export const getPlan = (planId) => SUBSCRIPTION_PLANS[planId];
export const getPricing = (currency) => SUBSCRIPTION_PLANS_PRICING[currency];