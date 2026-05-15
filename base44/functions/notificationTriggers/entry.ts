import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Notification trigger handler — called by entity automations.
 * Evaluates 8 conditions and sends email alerts to the user.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    const user = await base44.asServiceRole.entities.User.filter({ email: data?.created_by || '' });
    const userEmail = user?.[0]?.email || data?.created_by;
    if (!userEmail) return Response.json({ skipped: 'no user email' });

    const notifications = [];

    // 1. Task overdue — due_date passed, status not completed
    if (event?.entity_name === 'Task' && data?.due_date) {
      const due = new Date(data.due_date);
      const now = new Date();
      now.setHours(0,0,0,0);
      if (due < now && data.status !== 'completed') {
        notifications.push({
          subject: `Overdue Task: ${data.title}`,
          body: `Your task "${data.title}" was due on ${data.due_date} and is still pending.`,
        });
      }
    }

    // 2. Goal completed
    if (event?.entity_name === 'Goal' && data?.status === 'completed' && old_data?.status !== 'completed') {
      notifications.push({
        subject: `Goal Achieved: ${data.title}`,
        body: `Congratulations! You completed your goal "${data.title}". Keep up the great work!`,
      });
    }

    // 3. Budget exceeded — checked via Transaction create
    if (event?.entity_name === 'Transaction' && event?.type === 'create' && data?.type === 'expense') {
      const month = data.date?.slice(0, 7);
      if (month) {
        const [allTx, budgets] = await Promise.all([
          base44.asServiceRole.entities.Transaction.filter({ type: 'expense' }),
          base44.asServiceRole.entities.Budget.filter({ month, category: data.category }),
        ]);
        const budget = budgets?.[0];
        if (budget) {
          const spent = allTx.filter(t => t.date?.startsWith(month) && t.category === data.category)
            .reduce((s, t) => s + t.amount, 0);
          if (spent >= budget.limit_amount) {
            notifications.push({
              subject: `Budget Exceeded: ${data.category}`,
              body: `You have exceeded your ${data.category} budget of ${budget.limit_amount}. Total spent: ${spent}.`,
            });
          }
        }
      }
    }

    // 4. Invoice overdue
    if (event?.entity_name === 'WorkInvoice' && data?.status === 'overdue') {
      notifications.push({
        subject: `Invoice Overdue: ${data.invoice_number}`,
        body: `Invoice #${data.invoice_number} for ${data.client_name} (${data.amount}) is now overdue.`,
      });
    }

    // 5. Zakat due — when a ZakatRecord is created with paid_status=false
    if (event?.entity_name === 'ZakatRecord' && event?.type === 'create' && !data?.paid_status) {
      notifications.push({
        subject: `Zakat Due: ${data.zakat_due}`,
        body: `Your Zakat calculation is complete. Amount due: ${data.zakat_due}. Please remember to pay your Zakat.`,
      });
    }

    // 6. Goal progress milestone — every 25%
    if (event?.entity_name === 'Goal' && event?.type === 'update') {
      const newProgress = data?.progress || 0;
      const oldProgress = old_data?.progress || 0;
      const milestones = [25, 50, 75];
      milestones.forEach(m => {
        if (oldProgress < m && newProgress >= m) {
          notifications.push({
            subject: `Goal Progress: ${data.title} — ${m}%`,
            body: `Great progress! Your goal "${data.title}" is now ${m}% complete.`,
          });
        }
      });
    }

    // 7. Wellness streak — 7 consecutive days logged
    if (event?.entity_name === 'WellnessLog' && event?.type === 'create') {
      const logs = await base44.asServiceRole.entities.WellnessLog.list('-date', 8);
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        if (logs.find(l => l.date === dateStr)) streak++;
        else break;
      }
      if (streak === 7) {
        notifications.push({
          subject: 'Wellness Streak: 7 Days!',
          body: 'Amazing! You have logged your wellness for 7 consecutive days. Keep it up!',
        });
      }
    }

    // 8. Low savings rate — below 10%
    if (event?.entity_name === 'Transaction' && event?.type === 'create') {
      const month = data?.date?.slice(0, 7);
      if (month) {
        const allTx = await base44.asServiceRole.entities.Transaction.filter({});
        const monthTx = allTx.filter(t => t.date?.startsWith(month));
        const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        if (income > 0 && savingsRate < 10) {
          notifications.push({
            subject: 'Low Savings Rate Alert',
            body: `Your savings rate this month is ${savingsRate.toFixed(1)}%. Consider reviewing your expenses.`,
          });
        }
      }
    }

    // Send all notifications
    for (const notif of notifications) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: userEmail,
        subject: `AmanahLife — ${notif.subject}`,
        body: notif.body,
      });
    }

    return Response.json({ sent: notifications.length, triggers: notifications.map(n => n.subject) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});