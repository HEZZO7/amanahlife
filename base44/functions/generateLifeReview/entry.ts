import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { period, type } = await req.json();
    if (!period || !type) return Response.json({ error: 'period and type required' }, { status: 400 });

    const settings = await base44.entities.Settings.list().then(r => r[0] || {});
    const lang = settings.language || 'ar';
    const currency = settings.currency_symbol || 'ر.س';

    // --- Determine date range ---
    let startDate, endDate, monthsToFetch;
    if (type === 'monthly') {
      startDate = `${period}-01`;
      const d = new Date(`${period}-01`);
      d.setMonth(d.getMonth() + 1);
      d.setDate(0);
      endDate = d.toISOString().split('T')[0];
      monthsToFetch = [period];
    } else {
      // annual
      startDate = `${period}-01-01`;
      endDate = `${period}-12-31`;
      monthsToFetch = Array.from({ length: 12 }, (_, i) => `${period}-${String(i + 1).padStart(2, '0')}`);
    }

    // --- Fetch all data in parallel ---
    const [
      allTransactions,
      prayerLogs,
      ramadanLogs,
      charityLogs,
      goals,
      wellnessLogs,
      budgets,
      allTasks,
    ] = await Promise.all([
      base44.entities.Transaction.list('-date', 1000),
      base44.entities.PrayerLog.list('-date', 400),
      base44.entities.RamadanLog.list('-date', 400),
      base44.entities.CharityLog.list('-date', 200),
      base44.entities.Goal.list('-created_date', 200),
      base44.entities.WellnessLog.list('-date', 400),
      base44.entities.Budget.list('-created_date', 100),
      base44.entities.Task.list('-updated_date', 500),
    ]);

    // --- SPIRITUAL SCORE ---
    const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const periodPrayerLogs = prayerLogs.filter(l => l.date >= startDate && l.date <= endDate);
    const totalPrayerSlots = periodPrayerLogs.length * 5;
    const completedPrayers = periodPrayerLogs.reduce((s, l) => s + PRAYERS.filter(p => l[p]).length, 0);
    const prayerPct = totalPrayerSlots > 0 ? Math.round((completedPrayers / totalPrayerSlots) * 100) : 0;

    const periodRamadanLogs = ramadanLogs.filter(l => l.date >= startDate && l.date <= endDate);
    const totalQuranPages = periodRamadanLogs.reduce((s, l) => s + (l.quran_pages || 0), 0);

    const periodCharityLogs = charityLogs.filter(l => l.date >= startDate && l.date <= endDate);
    const totalCharity = periodCharityLogs.reduce((s, l) => s + (l.amount || 0), 0);

    // Max streak in period
    let maxStreak = 0, curStreak = 0;
    const prayerDateSet = new Set(periodPrayerLogs.filter(l => PRAYERS.some(p => l[p])).map(l => l.date));
    const sortedDates = [...prayerDateSet].sort();
    let prevDate = null;
    for (const d of sortedDates) {
      if (prevDate) {
        const diff = (new Date(d) - new Date(prevDate)) / 86400000;
        curStreak = diff === 1 ? curStreak + 1 : 1;
      } else { curStreak = 1; }
      if (curStreak > maxStreak) maxStreak = curStreak;
      prevDate = d;
    }

    const spiritualScore = Math.round(prayerPct * 0.6 + Math.min(totalQuranPages / (type === 'monthly' ? 30 : 365), 1) * 20 + Math.min(totalCharity / 100, 1) * 20);

    const spiritualData = { prayerPct, totalQuranPages, totalCharity, maxStreak, daysLogged: periodPrayerLogs.length };

    // --- FINANCIAL GRADE ---
    const periodTx = allTransactions.filter(tx => tx.date >= startDate && tx.date <= endDate);
    const totalIncome = periodTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const totalExpenses = periodTx.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const catMap = {};
    periodTx.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + (t.amount || 0);
    });
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Budget adherence
    const periodBudgets = budgets.filter(b => monthsToFetch.includes(b.month));
    let budgetAdherence = 100;
    if (periodBudgets.length > 0) {
      const overBudget = periodBudgets.filter(b => (catMap[b.category] || 0) > b.limit_amount).length;
      budgetAdherence = Math.round(((periodBudgets.length - overBudget) / periodBudgets.length) * 100);
    }

    const gradeScore = savingsRate >= 20 ? 'A' : savingsRate >= 10 ? 'B' : savingsRate >= 0 ? 'C' : 'D';
    const financialData = { totalIncome, totalExpenses, netBalance, savingsRate, topCategory, budgetAdherence, grade: gradeScore };

    // --- COMPLETED TASKS SUMMARY ---
    // Filter tasks completed within the period (use updated_date as proxy, or due_date)
    const completedTasks = allTasks.filter(t => {
      if (t.status !== 'completed') return false;
      const taskDate = t.due_date || (t.updated_date ? t.updated_date.split('T')[0] : null);
      return taskDate && taskDate >= startDate && taskDate <= endDate;
    });
    const completedTaskTitles = completedTasks.slice(0, 10).map(t => t.title);
    const tasksSummary = {
      completedCount: completedTasks.length,
      titles: completedTaskTitles,
      highPriorityCompleted: completedTasks.filter(t => t.priority === 'high').length,
    };

    // --- GOALS SUMMARY ---
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const stalledGoals = activeGoals.filter(g => (g.progress || 0) < 10);
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((s, g) => s + (g.progress || 0), 0) / activeGoals.length)
      : 0;
    const topGoal = completedGoals[0] || activeGoals.sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
    const goalsSummary = {
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      stalledCount: stalledGoals.length,
      avgProgress,
      topGoalTitle: topGoal?.title || null,
    };

    // --- WELLNESS SUMMARY ---
    const periodWellness = wellnessLogs.filter(l => l.date >= startDate && l.date <= endDate);
    const moodMap = { very_low: 1, low: 2, neutral: 3, good: 4, excellent: 5 };
    const avgMood = periodWellness.length > 0
      ? (periodWellness.reduce((s, l) => s + (moodMap[l.mood] || 3), 0) / periodWellness.length).toFixed(1)
      : null;
    const avgSleep = periodWellness.length > 0
      ? (periodWellness.reduce((s, l) => s + (l.sleep_hours || 0), 0) / periodWellness.length).toFixed(1)
      : null;
    const avgStress = periodWellness.length > 0
      ? (periodWellness.reduce((s, l) => s + (l.stress_level || 5), 0) / periodWellness.length).toFixed(1)
      : null;
    const wellnessSummary = { avgMood, avgSleep, avgStress, logsCount: periodWellness.length };

    // --- AI NARRATIVE ---
    const contextPrompt = `
You are AmanahLife — a compassionate Islamic life companion AI.
Generate a structured life review for this user.

Period: ${period} (${type})
Language: ${lang}

DATA:
- Prayer completion: ${prayerPct}% | Quran pages: ${totalQuranPages} | Charity: ${currency}${totalCharity.toFixed(0)} | Max prayer streak: ${maxStreak} days
- Financial grade: ${gradeScore} | Savings rate: ${savingsRate.toFixed(1)}% | Net balance: ${currency}${netBalance.toFixed(0)} | Top spending: ${topCategory} | Budget adherence: ${budgetAdherence}%
- Goals: ${activeGoals.length} active, ${completedGoals.length} completed, ${stalledGoals.length} stalled, avg progress ${avgProgress}%
- Tasks completed this period: ${completedTasks.length} tasks${completedTaskTitles.length > 0 ? ` including: ${completedTaskTitles.slice(0, 5).join(', ')}` : ''}
- Wellness: mood avg ${avgMood}/5 | sleep avg ${avgSleep}h | stress avg ${avgStress}/10
${type === 'annual' ? `- Top achievement: ${topGoal?.title || 'N/A'}` : ''}

Respond with a JSON object (no markdown):
{
  "ai_narrative_ar": "paragraph in Arabic, warm, Islamic framing, max 80 words, referencing real numbers",
  "ai_narrative_en": "same paragraph in English, max 80 words",
  "focus_recommendation_ar": "ONE specific actionable recommendation for next period in Arabic, max 20 words",
  "focus_recommendation_en": "same recommendation in English, max 20 words"
  ${type === 'annual' ? ', "word_of_year": "single Arabic word capturing the year (e.g. صبر or نماء)", "top_achievement": "highlight the top achievement in a single sentence"' : ''}
}
`.trim();

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: contextPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          ai_narrative_ar: { type: 'string' },
          ai_narrative_en: { type: 'string' },
          focus_recommendation_ar: { type: 'string' },
          focus_recommendation_en: { type: 'string' },
          word_of_year: { type: 'string' },
          top_achievement: { type: 'string' },
        },
        required: ['ai_narrative_ar', 'ai_narrative_en', 'focus_recommendation_ar', 'focus_recommendation_en'],
      },
    });

    // --- Check if review already exists for this period ---
    const existing = await base44.entities.LifeReview.filter({ period, type });

    const reviewData = {
      type,
      period,
      spiritual_score: spiritualScore,
      financial_grade: gradeScore,
      goals_summary: goalsSummary,
      wellness_summary: wellnessSummary,
      ai_narrative_ar: aiResponse.ai_narrative_ar || '',
      ai_narrative_en: aiResponse.ai_narrative_en || '',
      focus_recommendation_ar: aiResponse.focus_recommendation_ar || '',
      focus_recommendation_en: aiResponse.focus_recommendation_en || '',
      word_of_year: aiResponse.word_of_year || null,
      top_achievement: aiResponse.top_achievement || null,
      raw_data: { spiritual: spiritualData, financial: financialData, goals: goalsSummary, wellness: wellnessSummary, tasks: tasksSummary },
    };

    let review;
    if (existing.length > 0) {
      review = await base44.entities.LifeReview.update(existing[0].id, reviewData);
    } else {
      review = await base44.entities.LifeReview.create(reviewData);
    }

    // --- Send completion notification if enabled ---
    const notifyOnComplete = settings?.review_notify_on_complete !== false;
    if (notifyOnComplete && user?.email) {
      const periodLabel = type === 'monthly' ? period : `${period} (Annual)`;
      const subject = lang === 'ar'
        ? `✅ تقريرك لـ ${periodLabel} جاهز!`
        : `✅ Your ${periodLabel} review is ready!`;
      const body = lang === 'ar'
        ? `السلام عليكم،\n\nتقريرك الذكي لـ ${periodLabel} جاهز الآن. افتح التطبيق لمطالعة تحليلك الشامل وتوصيات الفترة القادمة.\n\nبارك الله فيك.`
        : `Hello,\n\nYour AmanahLife review for ${periodLabel} is ready. Open the app to read your full analysis and recommendations.\n\nMay Allah bless you.`;
      await base44.asServiceRole.integrations.Core.SendEmail({ to: user.email, subject, body }).catch(() => {});
    }

    return Response.json({ review });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});