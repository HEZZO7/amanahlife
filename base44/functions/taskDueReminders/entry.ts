import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scheduled function — runs every hour.
 * Sends email reminders for tasks due within 1 hour or 1 day,
 * based on each user's notification settings.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const sent = [];

    // Fetch all pending/in_progress tasks with a due date
    const tasks = await base44.asServiceRole.entities.Task.filter({ status: 'pending' });
    const inProgressTasks = await base44.asServiceRole.entities.Task.filter({ status: 'in_progress' });
    const allTasks = [...tasks, ...inProgressTasks].filter(t => t.due_date);

    // Group tasks by owner (created_by)
    const tasksByUser = {};
    for (const task of allTasks) {
      const email = task.created_by;
      if (!email) continue;
      if (!tasksByUser[email]) tasksByUser[email] = [];
      tasksByUser[email].push(task);
    }

    for (const [email, userTasks] of Object.entries(tasksByUser)) {
      // Get user settings
      const settingsList = await base44.asServiceRole.entities.Settings.filter({ created_by: email });
      const settings = settingsList?.[0];

      // Skip if notifications disabled or task reminders disabled
      if (settings?.notifications_enabled === false) continue;
      if (settings?.notify_tasks === false) continue;
      if (settings?.task_due_reminder_enabled === false) continue;

      const timing = settings?.task_due_reminder_timing || '1day';
      const lang = settings?.language || 'ar';

      for (const task of userTasks) {
        // Build due datetime (combine due_date + due_time if available)
        const dueDateStr = task.due_date;
        const dueTimeStr = task.due_time || '23:59';
        const dueDateTime = new Date(`${dueDateStr}T${dueTimeStr}:00`);

        const diffMs = dueDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        let shouldSend = false;

        if (timing === '1hour' && diffHours >= 0 && diffHours <= 1) {
          shouldSend = true;
        } else if (timing === '1day' && diffHours >= 23 && diffHours <= 25) {
          shouldSend = true;
        }

        if (!shouldSend) continue;

        const timingLabel = timing === '1hour'
          ? (lang === 'ar' ? 'خلال ساعة' : 'in 1 hour')
          : (lang === 'ar' ? 'خلال يوم' : 'tomorrow');

        const subject = lang === 'ar'
          ? `تذكير: مهمة "${task.title}" مستحقة ${timingLabel}`
          : `Reminder: Task "${task.title}" due ${timingLabel}`;

        const body = lang === 'ar'
          ? `مرحباً،\n\nتذكير بأن مهمتك "${task.title}" مستحقة في ${dueDateStr} ${task.due_time ? `الساعة ${task.due_time}` : ''}.\n\nاستمر في العطاء 💪`
          : `Hello,\n\nThis is a reminder that your task "${task.title}" is due on ${dueDateStr}${task.due_time ? ` at ${task.due_time}` : ''}.\n\nKeep it up 💪`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: `AmanahLife — ${subject}`,
          body,
        });

        sent.push({ email, task: task.title, timing });
      }
    }

    return Response.json({ sent: sent.length, details: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});