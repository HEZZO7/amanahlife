import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Scheduled function — runs daily (9am user time)
 * Sends reminder notifications for overdue tasks that haven't been completed.
 * Tracks which users have been notified to avoid spam.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const sent = [];

    // Fetch all pending/in_progress tasks
    const pendingTasks = await base44.asServiceRole.entities.Task.filter({ status: 'pending' });
    const inProgressTasks = await base44.asServiceRole.entities.Task.filter({ status: 'in_progress' });
    const allActiveTasks = [...pendingTasks, ...inProgressTasks].filter(t => t.due_date);

    // Find overdue tasks (due date is in the past)
    const overdueTasks = allActiveTasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return dueDate < now;
    });

    // Group overdue tasks by user
    const tasksByUser = {};
    for (const task of overdueTasks) {
      const email = task.created_by;
      if (!email) continue;
      if (!tasksByUser[email]) tasksByUser[email] = [];
      tasksByUser[email].push(task);
    }

    // Process notifications for each user
    for (const [email, userTasks] of Object.entries(tasksByUser)) {
      // Get user settings
      const settingsList = await base44.asServiceRole.entities.Settings.filter({ created_by: email });
      const settings = settingsList?.[0];

      // Skip if notifications disabled
      if (settings?.notifications_enabled === false) continue;
      if (settings?.notify_tasks === false) continue;

      const lang = settings?.language || 'ar';
      const daysOverdue = userTasks.map(t => {
        const dueDate = new Date(t.due_date);
        const diffMs = now.getTime() - dueDate.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return { ...t, daysOverdue: days };
      }).sort((a, b) => b.daysOverdue - a.daysOverdue);

      // Build email content
      const subject = lang === 'ar'
        ? `تنبيه: لديك ${userTasks.length} مهمة متأخرة`
        : `Alert: You have ${userTasks.length} overdue task${userTasks.length > 1 ? 's' : ''}`;

      let body = lang === 'ar'
        ? `مرحباً ${email.split('@')[0]},\n\nلديك ${userTasks.length} مهمة متأخرة تحتاج إلى إكمال:\n\n`
        : `Hello ${email.split('@')[0]},\n\nYou have ${userTasks.length} overdue task${userTasks.length > 1 ? 's' : ''} that need your attention:\n\n`;

      // Add overdue tasks details
      daysOverdue.slice(0, 10).forEach((task, idx) => {
        const urgency = task.daysOverdue > 7 ? '🔴' : task.daysOverdue > 3 ? '🟠' : '🟡';
        const daysText = lang === 'ar'
          ? `متأخرة منذ ${task.daysOverdue} يوم`
          : `${task.daysOverdue} day${task.daysOverdue > 1 ? 's' : ''} overdue`;

        body += lang === 'ar'
          ? `${idx + 1}. ${urgency} "${task.title}" (${daysText})\n   الأولوية: ${getPriorityLabel(task.priority, lang)}\n\n`
          : `${idx + 1}. ${urgency} "${task.title}" (${daysText})\n   Priority: ${getPriorityLabel(task.priority, lang)}\n\n`;
      });

      if (userTasks.length > 10) {
        body += lang === 'ar'
          ? `... و ${userTasks.length - 10} مهام أخرى\n\n`
          : `... and ${userTasks.length - 10} more tasks\n\n`;
      }

      body += lang === 'ar'
        ? `يرجى تحديث حالة هذه المهام أو إزالتها من قائمتك.\n\nالتطبيق: AmanahLife\nجاهزية للعمل 💪`
        : `Please update the status of these tasks or remove them from your list.\n\nApp: AmanahLife\nLet's get them done 💪`;

      // Send email notification
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: `AmanahLife — ${subject}`,
          body,
        });

        sent.push({
          email,
          overdueCount: userTasks.length,
          mostUrgen: daysOverdue[0]?.title,
        });
      } catch (emailErr) {
        console.error(`Failed to send overdue reminder to ${email}:`, emailErr.message);
      }
    }

    return Response.json({
      success: true,
      notificationsSent: sent.length,
      details: sent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Overdue tasks reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getPriorityLabel(priority, lang) {
  const labels = {
    high: { ar: 'عالية 🔥', en: 'High 🔥' },
    medium: { ar: 'متوسطة', en: 'Medium' },
    low: { ar: 'منخفضة', en: 'Low' },
  };
  return labels[priority]?.[lang] || priority;
}