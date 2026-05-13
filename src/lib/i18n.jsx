import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const translations = {
  // App
  "app.name": { en: "Mizan", ar: "ميزان" },
  "app.tagline": { en: "Your intelligent life companion", ar: "رفيقك الذكي في الحياة" },

  // Onboarding
  "onboarding.welcome": { en: "Welcome to Mizan", ar: "مرحباً بك في ميزان" },
  "onboarding.chooseLanguage": { en: "Choose your language", ar: "اختر لغتك" },
  "onboarding.english": { en: "English", ar: "English" },
  "onboarding.arabic": { en: "عربي", ar: "عربي" },
  "onboarding.continue": { en: "Continue", ar: "متابعة" },
  "onboarding.skip": { en: "Skip", ar: "تخطي" },
  "onboarding.back": { en: "Back", ar: "رجوع" },
  "onboarding.finish": { en: "Get Started", ar: "ابدأ الآن" },
  "onboarding.nameTitle": { en: "What should we call you?", ar: "كيف نناديك؟" },
  "onboarding.namePlaceholder": { en: "Your name", ar: "اسمك" },
  "onboarding.modeTitle": { en: "How will you use Mizan?", ar: "كيف ستستخدم ميزان؟" },
  "onboarding.individual": { en: "Individual", ar: "فردي" },
  "onboarding.family": { en: "Family", ar: "عائلي" },
  "onboarding.familyName": { en: "Family name", ar: "اسم العائلة" },
  "onboarding.inviteEmail": { en: "Invite by email (optional)", ar: "دعوة بالبريد الإلكتروني (اختياري)" },
  "onboarding.goalTitle": { en: "Set your first goal", ar: "حدد هدفك الأول" },
  "onboarding.goalPlaceholder": { en: "What do you want to achieve?", ar: "ماذا تريد أن تحقق؟" },
  "onboarding.themeTitle": { en: "Choose your look", ar: "اختر مظهرك" },
  "onboarding.lightTheme": { en: "Light", ar: "فاتح" },
  "onboarding.darkTheme": { en: "Dark", ar: "داكن" },

  // Goal categories
  "goal.personal": { en: "Personal", ar: "شخصي" },
  "goal.financial": { en: "Financial", ar: "مالي" },
  "goal.spiritual": { en: "Spiritual", ar: "روحاني" },
  "goal.family": { en: "Family", ar: "عائلي" },
  "goal.health": { en: "Health", ar: "صحي" },

  // Navigation
  "nav.dashboard": { en: "Dashboard", ar: "الرئيسية" },
  "nav.finance": { en: "Finance", ar: "المالية" },
  "nav.goals": { en: "Goals", ar: "الأهداف" },
  "nav.planner": { en: "Planner", ar: "المخطط" },
  "nav.spiritual": { en: "Spiritual", ar: "الروحانيات" },
  "nav.ramadan": { en: "Ramadan", ar: "رمضان" },
  "nav.family": { en: "Family", ar: "العائلة" },
  "nav.learning": { en: "Learning", ar: "التعلم" },
  "nav.work": { en: "Work", ar: "العمل" },
  "nav.wellness": { en: "Wellness", ar: "الصحة" },
  "nav.analytics": { en: "Analytics", ar: "التحليلات" },
  "nav.settings": { en: "Settings", ar: "الإعدادات" },
  "nav.more": { en: "More", ar: "المزيد" },

  // Settings
  "settings.title": { en: "Settings", ar: "الإعدادات" },
  "settings.profile": { en: "Profile", ar: "الملف الشخصي" },
  "settings.fullName": { en: "Full Name", ar: "الاسم الكامل" },
  "settings.email": { en: "Email", ar: "البريد الإلكتروني" },
  "settings.phone": { en: "Phone", ar: "الهاتف" },
  "settings.save": { en: "Save", ar: "حفظ" },
  "settings.appearance": { en: "Appearance", ar: "المظهر" },
  "settings.language": { en: "Language", ar: "اللغة" },
  "settings.theme": { en: "Theme", ar: "السمة" },
  "settings.light": { en: "Light", ar: "فاتح" },
  "settings.dark": { en: "Dark", ar: "داكن" },
  "settings.regional": { en: "Regional", ar: "إقليمي" },
  "settings.currency": { en: "Currency", ar: "العملة" },
  "settings.easternNumerals": { en: "Eastern Arabic Numerals", ar: "الأرقام العربية الشرقية" },
  "settings.ramadanMode": { en: "Ramadan Mode", ar: "وضع رمضان" },
  "settings.notifications": { en: "Notifications", ar: "الإشعارات" },
  "settings.notifyAll": { en: "Enable Notifications", ar: "تفعيل الإشعارات" },
  "settings.notifyTasks": { en: "Tasks", ar: "المهام" },
  "settings.notifyFinance": { en: "Finance", ar: "المالية" },
  "settings.notifyPrayer": { en: "Prayer", ar: "الصلاة" },
  "settings.notifyGoals": { en: "Goals", ar: "الأهداف" },
  "settings.notifyWellness": { en: "Wellness", ar: "الصحة" },
  "settings.notifyAI": { en: "AI Insights", ar: "رؤى الذكاء الاصطناعي" },
  "settings.subscription": { en: "Subscription", ar: "الاشتراك" },
  "settings.currentPlan": { en: "Current Plan", ar: "الخطة الحالية" },
  "settings.free": { en: "Free", ar: "مجاني" },
  "settings.premium": { en: "Premium", ar: "مميز" },
  "settings.familyPlan": { en: "Family", ar: "عائلي" },
  "settings.upgrade": { en: "Upgrade", ar: "ترقية" },
  "settings.dataExport": { en: "Data Export", ar: "تصدير البيانات" },
  "settings.exportFinance": { en: "Financial Summary PDF", ar: "ملخص مالي PDF" },
  "settings.exportTransactions": { en: "Transactions Excel", ar: "المعاملات Excel" },
  "settings.exportRamadan": { en: "Ramadan Report PDF", ar: "تقرير رمضان PDF" },
  "settings.exportAll": { en: "All My Data Excel", ar: "جميع بياناتي Excel" },
  "settings.account": { en: "Account", ar: "الحساب" },
  "settings.signOut": { en: "Sign Out", ar: "تسجيل الخروج" },
  "settings.deleteAccount": { en: "Delete Account", ar: "حذف الحساب" },
  "settings.deleteConfirm": { en: "Type DELETE to confirm", ar: "اكتب DELETE للتأكيد" },
  "settings.saved": { en: "Settings saved", ar: "تم حفظ الإعدادات" },

  // Dashboard
  "dashboard.greeting.morning": { en: "Good morning", ar: "صباح الخير" },
  "dashboard.greeting.afternoon": { en: "Good afternoon", ar: "مساء الخير" },
  "dashboard.greeting.evening": { en: "Good evening", ar: "مساء الخير" },
  "dashboard.noData": { en: "Start building your life balance", ar: "ابدأ ببناء توازن حياتك" },

  // Common
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.error": { en: "Something went wrong", ar: "حدث خطأ ما" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.edit": { en: "Edit", ar: "تعديل" },
  "common.add": { en: "Add", ar: "إضافة" },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    const root = document.documentElement;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    root.lang = language;
  }, [language]);

  const t = useCallback((key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  }, [language]);

  const isRTL = language === 'ar';

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}