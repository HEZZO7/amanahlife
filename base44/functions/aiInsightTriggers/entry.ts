import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * AI Insight Triggers — scheduled daily + on-demand.
 * Generates AIInsight records for 8 trigger types.
 * Called by: (a) scheduled automation daily, (b) on first login of day via frontend.
 */
Deno.serve(async (req) => {
  try {
    // Parse body first before SDK consumes the request
    const body = await req.json().catch(() => ({}));

    const base44 = createClientFromRequest(req);

    // Auth: allow both scheduled (service role) and user-initiated calls
    let userEmail = null;
    let userName = null;
    try {
      const user = await base44.auth.me();
      userEmail = user?.email;
      userName = user?.full_name || 'there';
    } catch {
      // Called from scheduler without user context — skip user-specific triggers
    }

    const today = new Date().toISOString().slice(0, 10);
    const insights = [];

    // Helper: create insight record
    const addInsight = (type, content_en, content_ar) => {
      insights.push({ type, content_en, content_ar, is_dismissed: false });
    };

    // --- TRIGGER 1: Budget hits 85% ---
    const currentMonth = today.slice(0, 7);
    const [allTx, budgets] = await Promise.all([
      base44.asServiceRole.entities.Transaction.list('-date', 500),
      base44.asServiceRole.entities.Budget.filter({ month: currentMonth }),
    ]);
    const monthTx = allTx.filter(t => t.date?.startsWith(currentMonth));

    for (const budget of budgets) {
      const spent = monthTx
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((s, t) => s + (t.amount || 0), 0);
      const pct = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;
      if (pct >= 85 && pct < 100) {
        addInsight(
          'financial',
          `You've used ${Math.round(pct)}% of your ${budget.category} budget this month. Consider slowing down spending in this category.`,
          `لقد استخدمت ${Math.round(pct)}% من ميزانية ${budget.category} هذا الشهر. فكّر في تقليل الإنفاق في هذا الفئة.`
        );
      }
    }

    // --- TRIGGER 2: Goal stalled 7+ days ---
    const goals = await base44.asServiceRole.entities.Goal.filter({ status: 'active' });
    for (const goal of goals) {
      const updatedAt = new Date(goal.updated_date || goal.created_date);
      const daysSince = Math.floor((Date.now() - updatedAt.getTime()) / 86400000);
      if (daysSince >= 7) {
        addInsight(
          'suggestion',
          `Your goal "${goal.title}" hasn't had any progress in ${daysSince} days. Even a small step forward today counts.`,
          `هدفك "${goal.title}" لم يشهد أي تقدم منذ ${daysSince} أيام. حتى خطوة صغيرة إلى الأمام اليوم تُحدث فرقاً.`
        );
        break; // max 1 stalled goal insight per run
      }
    }

    // --- TRIGGER 3: Prayer streak broken ---
    const [todayPrayer, yesterdayPrayer] = await Promise.all([
      base44.asServiceRole.entities.PrayerLog.filter({ date: today }),
      base44.asServiceRole.entities.PrayerLog.filter({ date: new Date(Date.now() - 86400000).toISOString().slice(0, 10) }),
    ]);
    const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const todayPrayed = todayPrayer[0] && PRAYERS.some(p => todayPrayer[0][p]);
    const yesterdayPrayed = yesterdayPrayer[0] && PRAYERS.some(p => yesterdayPrayer[0][p]);
    if (yesterdayPrayed && !todayPrayed) {
      addInsight(
        'spiritual',
        'Your prayer streak was broken today. It\'s never too late — start again with Asr or Maghrib. The Prophet ﷺ said: "The most beloved deeds to Allah are the most regular."',
        'انقطع تسلسل صلاتك اليوم. لا بأس — ابدأ من جديد بصلاة العصر أو المغرب. قال النبي ﷺ: "أحب الأعمال إلى الله أدومها وإن قلّ."'
      );
    }

    // --- TRIGGER 4: Wellness score below 35 for 2 consecutive days ---
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const dayBefore = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    const [wYest, wDay2] = await Promise.all([
      base44.asServiceRole.entities.WellnessLog.filter({ date: yesterday }),
      base44.asServiceRole.entities.WellnessLog.filter({ date: dayBefore }),
    ]);
    const moodMap = { very_low: 0, low: 0.25, neutral: 0.5, good: 0.75, excellent: 1 };
    const calcWellness = (log) => {
      if (!log) return null;
      const mood = Math.round((moodMap[log.mood] || 0) * 40);
      const sleep = Math.min(30, Math.round(((log.sleep_hours || 0) / 8) * 30));
      const hydration = Math.min(15, Math.round(((log.hydration_level || 0) / 10) * 15));
      const stress = Math.min(15, Math.round(((10 - (log.stress_level || 5)) / 10) * 15));
      return mood + sleep + hydration + stress;
    };
    const score1 = calcWellness(wYest[0]);
    const score2 = calcWellness(wDay2[0]);
    if (score1 !== null && score2 !== null && score1 < 35 && score2 < 35) {
      addInsight(
        'suggestion',
        'Your wellness has been low for 2 days in a row. Try a 10-minute walk, drink a full glass of water, and make time for a short du\'a. Small acts restore balance.',
        'صحتك وعافيتك منخفضتان منذ يومين متتاليين. جرّب المشي عشر دقائق، اشرب كوباً كاملاً من الماء، وخصص وقتاً لدعاء قصير. الأعمال الصغيرة تعيد التوازن.'
      );
    }

    // --- TRIGGER 5: Monday weekly summary ---
    const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon
    if (dayOfWeek === 1) {
      const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      addInsight(
        'weekly',
        `Week starting update: ${monthTx.length} transactions this month (income ${income.toLocaleString()}, expenses ${expenses.toLocaleString()}). You have ${goals.length} active goals. Start this week with intention!`,
        `ملخص بداية الأسبوع: ${monthTx.length} معاملة هذا الشهر (دخل ${income.toLocaleString()}، نفقات ${expenses.toLocaleString()}). لديك ${goals.length} هدف نشط. ابدأ هذا الأسبوع بنية واضحة!`
      );
    }

    // --- TRIGGER 6: First login of day (daily greeting) ---
    // Only add if no "daily" insight exists for today
    const existingDaily = await base44.asServiceRole.entities.AIInsight.filter({ type: 'daily' });
    const hasToday = existingDaily.some(i => i.created_date?.startsWith(today));
    if (!hasToday) {
      const hour = new Date().getHours();
      const greetEn = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const greetAr = hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور';
      addInsight(
        'daily',
        `${greetEn}${userName ? `, ${userName}` : ''}! Today is a new opportunity. Review your tasks, check your goals, and start with Bismillah.`,
        `${greetAr}${userName ? `، ${userName}` : ''}! اليوم فرصة جديدة. راجع مهامك، تحقق من أهدافك، وابدأ بسم الله.`
      );
    }

    // --- TRIGGER 7: Ramadan daily reflection ---
    const [settings] = await base44.asServiceRole.entities.Settings.list();
    if (settings?.ramadan_mode_active) {
      const ramadanLog = await base44.asServiceRole.entities.RamadanLog.filter({ date: today });
      const log = ramadanLog[0];
      if (!log) {
        addInsight(
          'spiritual',
          "Don't forget to log your Ramadan day! Record your fasting, Suhoor, Iftar, and Qur'an pages to track your spiritual journey this blessed month.",
          "لا تنسَ تسجيل يومك في رمضان! سجّل صيامك، وسحورك، وإفطارك، وصفحات القرآن لتتبع رحلتك الروحية في هذا الشهر المبارك."
        );
      } else if (log.quran_pages > 0) {
        addInsight(
          'spiritual',
          `MashaAllah! You've read ${log.quran_pages} Qur'an pages today. Keep going — consistency is the key to completing the Qur'an this Ramadan.`,
          `ما شاء الله! قرأت ${log.quran_pages} صفحة من القرآن اليوم. واصل — الاستمرارية مفتاح إتمام القرآن في هذا الرمضان.`
        );
      }
    }

    // --- TRIGGER 8: Goal completed celebration ---
    // body is already parsed at the top of the function
    if (body?.goal_completed) {
      addInsight(
        'suggestion',
        `Congratulations! You completed your goal: "${body.goal_completed}". This is a real achievement — celebrate it and set your next goal with the same determination.`,
        `تهانينا! لقد أكملت هدفك: "${body.goal_completed}". هذا إنجاز حقيقي — احتفل به وضع هدفك التالي بنفس العزيمة.`
      );
    }

    // Save all insights to DB
    let saved = 0;
    for (const insight of insights) {
      await base44.asServiceRole.entities.AIInsight.create(insight);
      saved++;
    }

    return Response.json({ generated: saved, types: insights.map(i => i.type) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});