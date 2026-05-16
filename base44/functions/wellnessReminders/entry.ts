import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REMINDER_MESSAGES = {
  hydration: {
    ar: 'اشرب الماء! ترطيب الجسم أساسي لصحتك 💧',
    en: 'Time for water! Hydration is essential for your health 💧',
  },
  activity: {
    ar: 'قم بنشاط بدني! حتى 10 دقائق تحسن صحتك 🏃',
    en: 'Time to move! Even 10 mins of activity boosts your health 🏃',
  },
  sleep: {
    ar: 'هل حصلت على 7-8 ساعات نوم؟ النوم مهم! 😴',
    en: 'Getting 7-8 hours of sleep? Sleep matters! 😴',
  },
  stress: {
    ar: 'خذ نفساً عميقاً وتأمل! الاسترخاء يحسن صحتك 🧘',
    en: 'Take a deep breath! Relaxation improves your wellbeing 🧘',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hour = new Date().getHours();
    const today = new Date().toISOString().split('T')[0];

    // Determine which reminders to send based on time of day
    const remindersToSend = [];

    // Morning: hydration + activity (6am-12pm)
    if (hour >= 6 && hour < 12) {
      remindersToSend.push('hydration', 'activity');
    }
    // Afternoon: hydration + stress relief (12pm-6pm)
    else if (hour >= 12 && hour < 18) {
      remindersToSend.push('hydration', 'stress');
    }
    // Evening: activity check (6pm-10pm)
    else if (hour >= 18 && hour < 22) {
      remindersToSend.push('activity');
    }
    // Night: sleep prep (10pm-6am)
    else if (hour >= 20 || hour < 6) {
      remindersToSend.push('sleep');
    }

    // Get today's wellness log to provide personalized reminders
    const todayLogs = await base44.entities.WellnessLog.filter(
      { date: today },
      '-created_date',
      1
    );

    const todayLog = todayLogs[0];

    // Create insights based on today's data
    const insights = [];

    if (todayLog) {
      // Check hydration level
      if (todayLog.hydration_level < 6) {
        insights.push({
          type: 'hydration',
          message: REMINDER_MESSAGES.hydration,
          priority: 'high',
        });
      }

      // Check stress level
      if (todayLog.stress_level >= 7) {
        insights.push({
          type: 'stress',
          message: REMINDER_MESSAGES.stress,
          priority: 'high',
        });
      }

      // Check sleep
      if (todayLog.sleep_hours < 7) {
        insights.push({
          type: 'sleep',
          message: REMINDER_MESSAGES.sleep,
          priority: 'high',
        });
      }
    }

    // Create or update AI insights for this reminder session
    for (const reminderType of remindersToSend) {
      const insight = {
        type: 'suggestion',
        content_ar: REMINDER_MESSAGES[reminderType].ar,
        content_en: REMINDER_MESSAGES[reminderType].en,
        context_snapshot: {
          reminderType,
          hour,
          hasLogToday: !!todayLog,
          timestamp: new Date().toISOString(),
        },
      };

      try {
        await base44.entities.AIInsight.create(insight);
      } catch (err) {
        console.log(`Could not create insight for ${reminderType}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      remindersCreated: remindersToSend.length,
      insightsCreated: insights.length,
      message: 'Wellness reminders delivered',
    });
  } catch (error) {
    console.error('Wellness reminders error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});