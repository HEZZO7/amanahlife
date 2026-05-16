import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scheduled function — runs every hour.
 * Sends smart reminders for tasks due soon based on user settings.
 * Supports multiple reminder timings: 3 days, 1 day, 1 hour before due date.
 * Prevents duplicate reminders by logging each sent notification.
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

        let reminderType = null;

        // Check for 3-day reminder (72 hours window)
        if (timing === '1day' && diffHours >= 71 && diffHours <= 73) {
          reminderType = '3days';
        }
        // Check for 1-day reminder (24-hour window)
        else if (diffHours >= 23 && diffHours <= 25) {
          reminderType = '1day';
        }
        // Check for 1-hour reminder (1-hour window)
        else if (timing === '1hour' && diffHours >= 0 && diffHours <= 1) {
          reminderType = '1hour';
        }

        if (!reminderType) continue;

        // Check if reminder already sent (avoid duplicates)
        const existingLogs = await base44.asServiceRole.entities.ReminderLog.filter({
          task_id: task.id,
          reminder_type: reminderType,
          created_by: email,
        });

        if (existingLogs.length > 0) {
          // Reminder already sent, skip
          continue;
        }

        // Get label for timing
        const timingLabels = {
          '3days': lang === 'ar' ? 'خلال 3 أيام' : 'in 3 days',
          '1day': lang === 'ar' ? 'غداً' : 'tomorrow',
          '1hour': lang === 'ar' ? 'خلال ساعة' : 'in 1 hour',
        };

        const subject = lang === 'ar'
          ? `تذكير: مهمة "${task.title}" مستحقة ${timingLabels[reminderType]}`
          : `Reminder: Task "${task.title}" due ${timingLabels[reminderType]}`;

        const body = lang === 'ar'
          ? `مرحباً ${email},\n\nتذكير بأن مهمتك "${task.title}" مستحقة في ${dueDateStr} ${task.due_time ? `الساعة ${task.due_time}` : 'نهاية اليوم'}.\n\n${task.description ? `الوصف: ${task.description}\n\n` : ''}انقر هنا للمتابعة مباشرة.\n\nاستمر في العطاء 💪`
          : `Hello ${email},\n\nThis is a reminder that your task "${task.title}" is due on ${dueDateStr}${task.due_time ? ` at ${task.due_time}` : ' by end of day'}.\n\n${task.description ? `Description: ${task.description}\n\n` : ''}Click to continue.\n\nKeep it up 💪`;

        // Send email notification
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `AmanahLife — ${subject}`,
            body,
          });
        } catch (emailErr) {
          console.error(`Failed to send email to ${email}:`, emailErr.message);
        }

        // Log the sent reminder to prevent duplicates
        try {
          await base44.asServiceRole.entities.ReminderLog.create({
            task_id: task.id,
            reminder_type: reminderType,
            sent_at: now.toISOString(),
            user_email: email,
            task_title: task.title,
            task_due_date: dueDateStr,
          });
        } catch (logErr) {
          console.error(`Failed to log reminder for task ${task.id}:`, logErr.message);
        }

        sent.push({ email, taskId: task.id, task: task.title, timing: reminderType });
      }
    }

    return Response.json({
      success: true,
      sent: sent.length,
      details: sent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Task reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});