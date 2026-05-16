import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const translations = {
  // App
  "app.name": { en: "AmanahLife", ar: "أمانة لايف" },
  "app.tagline": { en: "Your intelligent life companion", ar: "رفيقك الذكي في الحياة" },

  // Onboarding
  "onboarding.welcome": { en: "Welcome to AmanahLife", ar: "مرحباً بك في أمانة لايف" },
  "onboarding.chooseLanguage": { en: "Choose your language", ar: "اختر لغتك" },
  "onboarding.english": { en: "English", ar: "English" },
  "onboarding.arabic": { en: "عربي", ar: "عربي" },
  "onboarding.continue": { en: "Continue", ar: "متابعة" },
  "onboarding.skip": { en: "Skip", ar: "تخطي" },
  "onboarding.back": { en: "Back", ar: "رجوع" },
  "onboarding.finish": { en: "Get Started", ar: "ابدأ الآن" },
  "onboarding.nameTitle": { en: "What should we call you?", ar: "كيف نناديك؟" },
  "onboarding.namePlaceholder": { en: "Your name", ar: "اسمك" },
  "onboarding.modeTitle": { en: "How will you use AmanahLife?", ar: "كيف ستستخدم أمانة لايف؟" },
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
  "nav.ai": { en: "AI", ar: "الذكاء" },
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
  "settings.taskDueReminder": { en: "Task Due Reminders", ar: "تنبيهات استحقاق المهام" },
  "settings.taskDueReminderDesc": { en: "Get notified before a task is due", ar: "استلم تنبيهاً قبل موعد استحقاق المهمة" },
  "settings.taskReminderTiming": { en: "Remind me", ar: "ذكّرني" },
  "settings.reminder1hour": { en: "1 hour before", ar: "قبل ساعة واحدة" },
  "settings.reminder1day": { en: "1 day before", ar: "قبل يوم واحد" },
  "settings.reminder3days": { en: "3 days before", ar: "قبل 3 أيام" },
  "planner.reminderSent": { en: "Reminder sent", ar: "تم إرسال التذكير" },
  "planner.upcomingDeadline": { en: "Upcoming deadline", ar: "موعد نهائي قريب" },
  "settings.subscription": { en: "Subscription", ar: "الاشتراك" },
  "settings.currentPlan": { en: "Current Plan", ar: "الخطة الحالية" },
  "settings.free": { en: "Free", ar: "مجاني" },
  "settings.premium": { en: "Premium", ar: "مميز" },
  "settings.familyPlan": { en: "Family", ar: "عائلي" },
  "settings.upgrade": { en: "Upgrade", ar: "ترقية" },
  "settings.dataExport": { en: "Data Export", ar: "تصدير البيانات" },
  "settings.exportFinance": { en: "Financial Summary PDF", ar: "ملخص مالي (PDF)" },
  "settings.exportTransactions": { en: "Transactions Excel", ar: "المعاملات (Excel)" },
  "settings.exportRamadan": { en: "Ramadan Report PDF", ar: "تقرير رمضان (PDF)" },
  "settings.exportAll": { en: "All My Data Excel", ar: "جميع بياناتي (Excel)" },
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
  "dashboard.noDataSub": { en: "Add your first task to get started", ar: "أضف مهمتك الأولى للبدء" },
  "dashboard.addTask": { en: "Add Task", ar: "إضافة مهمة" },
  "dashboard.prayersToday": { en: "Prayers Today", ar: "صلوات اليوم" },
  "dashboard.todayTasks": { en: "Today's Tasks", ar: "مهام اليوم" },
  "dashboard.netBalance": { en: "Net Balance", ar: "الرصيد الصافي" },
  "dashboard.activeGoals": { en: "Active Goals", ar: "الأهداف النشطة" },

  // Common
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.error": { en: "Something went wrong", ar: "حدث خطأ ما" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.edit": { en: "Edit", ar: "تعديل" },
  "common.add": { en: "Add", ar: "إضافة" },
  "common.viewAll": { en: "View All", ar: "عرض الكل" },

  // Dashboard extras
  "dashboard.aiInsights": { en: "AI Insights", ar: "رؤى الذكاء الاصطناعي" },
  "goals.avgProgress": { en: "avg", ar: "متوسط" },

  // Finance
  "finance.tab.overview": { en: "Overview", ar: "نظرة عامة" },
  "finance.tab.transactions": { en: "Transactions", ar: "المعاملات" },
  "finance.tab.budget": { en: "Budget", ar: "الميزانية" },
  "finance.tab.zakat": { en: "Zakat", ar: "الزكاة" },
  "finance.tab.scanner": { en: "Halal Scanner", ar: "ماسح الحلال" },
  "finance.income": { en: "Income", ar: "الدخل" },
  "finance.expense": { en: "Expense", ar: "مصروف" },
  "finance.expenses": { en: "Expenses", ar: "المصروفات" },
  "finance.net": { en: "Net", ar: "الصافي" },
  "finance.savingsRate": { en: "Savings Rate", ar: "معدل الادخار" },
  "finance.spendingByCategory": { en: "Spending by Category", ar: "الإنفاق حسب الفئة" },
  "finance.noData": { en: "No transactions yet", ar: "لا توجد معاملات بعد" },
  "finance.noTransactions": { en: "No transactions found", ar: "لا توجد معاملات" },
  "finance.noBudgets": { en: "No budgets set", ar: "لم يتم تحديد ميزانيات" },
  "finance.addBudget": { en: "Add Budget", ar: "إضافة ميزانية" },
  "finance.addIncome": { en: "Add Income", ar: "إضافة دخل" },
  "finance.addExpense": { en: "Add Expense", ar: "إضافة مصروف" },
  "finance.amount": { en: "Amount", ar: "المبلغ" },
  "finance.category": { en: "Category", ar: "الفئة" },
  "finance.description": { en: "Description", ar: "الوصف" },
  "finance.date": { en: "Date", ar: "التاريخ" },
  "finance.limit": { en: "Limit", ar: "الحد" },
  "finance.used": { en: "used", ar: "مستخدم" },
  "finance.all": { en: "All", ar: "الكل" },

  // Goals
  "goals.active": { en: "Active", ar: "نشط" },
  "goals.completed": { en: "Completed", ar: "مكتمل" },
  "goals.paused": { en: "Paused", ar: "متوقف" },
  "goals.all": { en: "All", ar: "الكل" },
  "goals.empty": { en: "No goals found", ar: "لا توجد أهداف" },
  "goals.emptyHint": { en: "Set your first goal and start tracking your progress", ar: "حدد هدفك الأول وابدأ في تتبع تقدمك" },
  "goals.progress": { en: "Progress", ar: "التقدم" },
  "goals.milestones": { en: "Milestones", ar: "المعالم" },
  "goals.noMilestones": { en: "No milestones yet", ar: "لا توجد معالم بعد" },
  "goals.milestonePlaceholder": { en: "Milestone title...", ar: "عنوان المعلم..." },

  // Planner
  "planner.list": { en: "List", ar: "قائمة" },
  "planner.week": { en: "Week", ar: "أسبوع" },
  "planner.calendar": { en: "Calendar", ar: "تقويم" },
  "planner.addTask": { en: "Add Task", ar: "إضافة مهمة" },
  "planner.taskTitle": { en: "Task title", ar: "عنوان المهمة" },
  "planner.priority": { en: "Priority", ar: "الأولوية" },
  "planner.time": { en: "Time", ar: "الوقت" },
  "planner.noTasks": { en: "No tasks", ar: "لا توجد مهام" },
  "planner.noDate": { en: "No Due Date", ar: "بدون تاريخ" },
  "planner.today": { en: "Today", ar: "اليوم" },
  "planner.tomorrow": { en: "Tomorrow", ar: "غداً" },
  "planner.pending": { en: "Pending", ar: "معلق" },

  // Ramadan
  "ramadan.countdown": { en: "Days until Ramadan", ar: "أيام حتى رمضان" },
  "ramadan.todayLog": { en: "Today's Log", ar: "سجل اليوم" },
  "ramadan.fastingGrid": { en: "30-Day Fasting Grid", ar: "شبكة الصيام ٣٠ يوم" },
  "ramadan.eidPlanning": { en: "Eid Planning", ar: "تخطيط العيد" },
  "ramadan.insight": { en: "Daily Insight", ar: "رؤية يومية" },

  // Family
  "family.members": { en: "Members", ar: "الأعضاء" },
  "family.sharedTasks": { en: "Shared Tasks", ar: "المهام المشتركة" },
  "family.goals": { en: "Family Goals", ar: "الأهداف العائلية" },
  "family.calendar": { en: "Family Calendar", ar: "التقويم العائلي" },

  // Learning
  "learning.addCourse": { en: "Add Course", ar: "إضافة دورة" },
  "learning.progress": { en: "Progress", ar: "التقدم" },
  "learning.milestones": { en: "Milestones", ar: "المعالم" },
  "learning.completed": { en: "Completed", ar: "مكتملة" },
  "learning.active": { en: "In Progress", ar: "جارية" },

  // Work
  "work.projects": { en: "Projects", ar: "المشاريع" },
  "work.invoices": { en: "Invoices", ar: "الفواتير" },
  "work.summary": { en: "Summary", ar: "الملخص" },

  // Wellness
  "wellness.mood": { en: "Mood", ar: "الحالة المزاجية" },
  "wellness.sleep": { en: "Sleep", ar: "النوم" },
  "wellness.hydration": { en: "Hydration", ar: "الترطيب" },
  "wellness.stress": { en: "Stress", ar: "التوتر" },
  "wellness.log": { en: "Log Today", ar: "سجل اليوم" },
  "wellness.weeklyMood": { en: "Weekly Mood", ar: "المزاج الأسبوعي" },
  "wellness.reminders": { en: "Daily Reminders", ar: "التذكيرات اليومية" },
  "wellness.hydration": { en: "Stay Hydrated", ar: "ابقَ رطباً" },
  "wellness.activity": { en: "Get Moving", ar: "تحرك قليلاً" },
  "wellness.sleepTip": { en: "Sleep Well", ar: "نم بشكل جيد" },

  // Analytics
  "analytics.premium": { en: "Premium Feature", ar: "ميزة مميزة" },
  "analytics.upgrade": { en: "Upgrade to Unlock", ar: "ترقية للوصول" },
  "analytics.finance": { en: "Finance Trend", ar: "الاتجاه المالي" },
  "analytics.mood": { en: "Mood Trend", ar: "اتجاه المزاج" },
  "analytics.prayers": { en: "Prayer Completion", ar: "الصلوات" },
  "nav.achievements": { en: "Achievements", ar: "الإنجازات" },
  "nav.archive": { en: "Archive", ar: "الأرشيف" },

  // Spiritual
  "spiritual.dailyScore": { en: "Today's Prayers", ar: "صلوات اليوم" },
  "spiritual.streak": { en: "Day Streak", ar: "أيام متتالية" },
  "spiritual.todayPrayers": { en: "Prayer Tracker", ar: "متتبع الصلاة" },
  "spiritual.weeklyOverview": { en: "Weekly Overview", ar: "نظرة أسبوعية" },
  "spiritual.charity": { en: "Charity Log", ar: "سجل الصدقات" },
  "spiritual.noCharity": { en: "No charity logged yet", ar: "لم يتم تسجيل صدقات بعد" },
  "spiritual.fajr": { en: "Fajr", ar: "الفجر" },
  "spiritual.dhuhr": { en: "Dhuhr", ar: "الظهر" },
  "spiritual.asr": { en: "Asr", ar: "العصر" },
  "spiritual.maghrib": { en: "Maghrib", ar: "المغرب" },
  "spiritual.isha": { en: "Isha", ar: "العشاء" },

  // Zakat Calculator
  "zakat.calculator": { en: "Zakat Calculator", ar: "حاسبة الزكاة" },
  "zakat.assets": { en: "Assets", ar: "الأصول" },
  "zakat.liabilities": { en: "Liabilities & Debts", ar: "الخصوم والالتزامات" },
  "zakat.totalAssets": { en: "Total Assets", ar: "إجمالي الأصول" },
  "zakat.netAssets": { en: "Net Assets", ar: "صافي الأصول" },
  "zakat.zakatDue": { en: "Zakat Due", ar: "الزكاة المستحقة" },
  "zakat.saveCalculation": { en: "Save Calculation", ar: "حفظ الحساب" },
  "zakat.history": { en: "Zakat History", ar: "سجل الزكاة" },
  "zakat.noRecords": { en: "No records yet", ar: "لا توجد سجلات بعد" },
  "zakat.paid": { en: "Paid", ar: "مدفوعة" },
  "zakat.markPaid": { en: "Mark Paid", ar: "تم الدفع" },
  "zakat.nisab": { en: "You are obligated to pay Zakat", ar: "تجب عليك الزكاة" },
  "zakat.belowNisab": { en: "Below the Nisab threshold", ar: "لم تصل إلى حد النصاب بعد" },
  "zakat.percentage": { en: "(2.5% of net assets)", ar: "(2.5% من صافي الأصول)" },
  "zakat.cash": { en: "Cash", ar: "النقد" },
  "zakat.gold": { en: "Gold", ar: "الذهب" },
  "zakat.silver": { en: "Silver", ar: "الفضة" },
  "zakat.stocks": { en: "Stocks", ar: "الأسهم" },
  "zakat.property": { en: "Property", ar: "العقارات" },
  "zakat.other": { en: "Other", ar: "أخرى" },

  // Goals - Milestones
  "goals.milestone": { en: "Milestone", ar: "مرحلة" },
  "goals.addMilestone": { en: "Add Milestone", ar: "إضافة مرحلة" },

  // Family - Shared Budget
  "family.budget": { en: "Budget", ar: "الميزانية" },
  "family.sharedBudget": { en: "Shared Budget", ar: "الميزانية المشتركة" },
  "family.addBudget": { en: "Add Budget", ar: "إضافة ميزانية" },
  "family.budgetCategory": { en: "Category (e.g., Food)", ar: "الفئة (مثال: الغذاء)" },
  "family.budgetAmount": { en: "Amount", ar: "المبلغ" },
  "family.budgetDescription": { en: "Description (optional)", ar: "وصف (اختياري)" },
  "family.totalBudget": { en: "Budget", ar: "الميزانية" },
  "family.totalSpent": { en: "Spent", ar: "المصروف" },
  "family.remaining": { en: "Remaining", ar: "المتبقي" },
  "family.noBudgets": { en: "No budgets yet", ar: "لا توجد ميزانيات" },

  // Subscription
  "settings.subscription.plans": { en: "Subscription Plans", ar: "خطط الاشتراك" },
  "settings.subscription.choose_plan": { en: "Choose the plan that best suits your needs", ar: "اختر الخطة التي تناسب احتياجاتك" },
  "settings.subscription.current_currency": { en: "Current Currency", ar: "العملة الحالية" },
  "settings.subscription.monthly": { en: "Monthly", ar: "شهري" },
  "settings.subscription.yearly": { en: "Yearly", ar: "سنوي" },
  "settings.subscription.per_month": { en: "per month", ar: "لكل شهر" },
  "settings.subscription.per_year": { en: "per year", ar: "لكل سنة" },
  "settings.subscription.free": { en: "Free", ar: "مجاني" },
  "settings.subscription.current_plan": { en: "Current Plan", ar: "الخطة الحالية" },
  "settings.subscription.select_plan": { en: "Select Plan", ar: "اختر الخطة" },
  "settings.regional.country": { en: "Country", ar: "البلد" },

  // Subscription Plans - Arabic Full Names & Descriptions
  "subscription.lifeCo.name": { en: "Life Companion", ar: "رفيق الحياة" },
  "subscription.lifeCo.desc": { en: "The basic plan perfect for individuals starting their journey", ar: "الباقة الأساسية والمثالية للأفراد الذين يبدأون رحلتهم" },
  "subscription.balanced.name": { en: "Balanced Life", ar: "الحياة المتوازنة" },
  "subscription.balanced.desc": { en: "Premium plan for ambitious individuals seeking deeper balance", ar: "باقة مميزة للطموحين الذين يسعون لتعميق التوازن" },
  "subscription.family.name": { en: "Family Amanah", ar: "أمانة العائلة" },
  "subscription.family.desc": { en: "Comprehensive plan for families seeking cooperation and balance", ar: "باقة شاملة للعائلات الراغبة بالتعاون والتوازن" },

  // Features Arabic
  "feature.taskMgmt": { en: "Basic Task Management", ar: "إدارة المهام الأساسية" },
  "feature.goals": { en: "Goal Tracking", ar: "تتبع الأهداف" },
  "feature.prayer": { en: "Daily Prayer Tracker", ar: "متتبع الصلاة اليومي" },
  "feature.basicReminders": { en: "Basic Task Reminders", ar: "تذكيرات مهام أساسية" },
  "feature.zakat": { en: "Zakat Calculator", ar: "حاسبة الزكاة" },
  "feature.wellness": { en: "Basic Wellness Tracking", ar: "تتبع الرفاهية الأساسي" },
  "feature.learning": { en: "Basic Learning Log", ar: "سجل التعلم الأساسي" },
  "feature.advReminders": { en: "Advanced Reminders (1hr or 1day)", ar: "تذكيرات متقدمة (قبل ساعة أو يوم)" },
  "feature.budget": { en: "Personal Budget Tracking", ar: "إدارة الميزانية الشخصية" },
  "feature.ai": { en: "AI Insights & Recommendations", ar: "رؤى الذكاء الاصطناعي والتوصيات" },
  "feature.reviews": { en: "Monthly & Annual Life Reviews", ar: "تقارير الحياة الشهرية والسنوية" },
  "feature.family": { en: "Family Sharing", ar: "مشاركة عائلية" },
  "feature.sharedBudget": { en: "Shared Family Budget", ar: "الميزانية العائلية المشتركة" },
  "feature.vault": { en: "Amana Vault - Secure Document Storage", ar: "أمانة فالت - تخزين آمن للمستندات" },
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