import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled function: runs daily and sends renewal reminder emails
// to users whose subscription renews in 3 days or 1 day.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check 3-day and 1-day upcoming renewals
    const remindDays = [3, 1];
    let totalSent = 0;

    const allSubs = await base44.asServiceRole.entities.Subscription.filter({ status: 'active' });

    for (const sub of allSubs) {
      if (!sub.renewal_date || !sub.user_email) continue;

      const renewal = new Date(sub.renewal_date);
      renewal.setHours(0, 0, 0, 0);
      const diffDays = Math.round((renewal - today) / (1000 * 60 * 60 * 24));

      if (!remindDays.includes(diffDays)) continue;

      const planNames = {
        premium: { ar: 'الحياة المتوازنة', en: 'Balanced Life' },
        family:  { ar: 'أمانة العائلة',    en: 'Family Amanah' },
      };
      const planAr = planNames[sub.tier]?.ar || sub.tier;
      const planEn = planNames[sub.tier]?.en || sub.tier;

      const renewalFormatted = renewal.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
      const renewalFormattedEn = renewal.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const subject = diffDays === 1
        ? `⏰ تجديد اشتراكك في ميزان غداً | Mizan Subscription Renews Tomorrow`
        : `📅 تجديد اشتراكك في ميزان خلال ${diffDays} أيام | Mizan Renewal in ${diffDays} Days`;

      const body = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8F6F1;font-family:'IBM Plex Sans Arabic',Arial,sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E6E2D9;box-shadow:0 4px 24px rgba(11,91,80,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0B5B50,#0E7A6C);padding:32px 28px;text-align:center;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="font-size:26px;">⚖️</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">ميزان</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">تذكير بتجديد الاشتراك</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 28px 20px;direction:rtl;text-align:right;">
      <p style="color:#1A2E2A;font-size:16px;margin:0 0 16px;font-weight:600;">
        ${diffDays === 1 ? '🔔 اشتراكك يتجدد غداً!' : `📅 اشتراكك يتجدد خلال ${diffDays} أيام`}
      </p>
      <p style="color:#5C6B68;font-size:14px;line-height:1.7;margin:0 0 20px;">
        نودّ تذكيرك بأن اشتراكك في باقة <strong style="color:#0B5B50;">${planAr}</strong> سيتجدد تلقائياً بتاريخ
        <strong style="color:#0B5B50;">${renewalFormatted}</strong>.
      </p>
      <p style="color:#5C6B68;font-size:14px;line-height:1.7;margin:0 0 24px;">
        تأكد من أن بيانات الدفع الخاصة بك محدّثة لضمان استمرار خدمتك بدون انقطاع.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:24px 0;">
        <a href="https://app.mizanapp.com/settings" style="display:inline-block;background:#0B5B50;color:#fff;text-decoration:none;padding:12px 32px;border-radius:10px;font-size:15px;font-weight:600;">
          إدارة الاشتراك
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #E6E2D9;margin:20px 0;">

      <!-- English version -->
      <div style="direction:ltr;text-align:left;">
        <p style="color:#1A2E2A;font-size:15px;font-weight:600;margin:0 0 10px;">
          ${diffDays === 1 ? '🔔 Your subscription renews tomorrow!' : `📅 Your subscription renews in ${diffDays} days`}
        </p>
        <p style="color:#5C6B68;font-size:13px;line-height:1.6;margin:0 0 12px;">
          Your <strong style="color:#0B5B50;">${planEn}</strong> plan renews on
          <strong style="color:#0B5B50;">${renewalFormattedEn}</strong>.
          Please ensure your payment method is up to date.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F8F6F1;padding:16px 28px;text-align:center;">
      <p style="color:#9EAAA8;font-size:12px;margin:0;">
        يمكنك إدارة أو إلغاء اشتراكك في أي وقت من إعدادات التطبيق.<br>
        You can manage or cancel your subscription anytime from app settings.
      </p>
    </div>
  </div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: sub.user_email,
        subject,
        body,
      });

      console.log(`✅ Renewal reminder (${diffDays}d) sent to ${sub.user_email} — renews ${sub.renewal_date}`);
      totalSent++;
    }

    return Response.json({ ok: true, sent: totalSent, checked: allSubs.length });
  } catch (err) {
    console.error('subscriptionRenewalReminder error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});