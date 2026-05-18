import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const sig  = req.headers.get('stripe-signature');

    let event;
    if (webhookSecret) {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    const base44 = createClientFromRequest(req);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { user_email, plan, billing } = session.metadata || {};
      if (!user_email || !plan) { console.log('Missing metadata'); return Response.json({ ok: true }); }

      const renewalDate = new Date();
      if (billing === 'yearly') renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      else renewalDate.setMonth(renewalDate.getMonth() + 1);

      // Create or update subscription record
      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          tier: plan,
          billing_period: billing,
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          renewal_date: renewalDate.toISOString().split('T')[0],
          stripe_subscription_id: session.subscription,
        });
      } else {
        await base44.asServiceRole.entities.Subscription.create({
          user_email,
          tier: plan,
          billing_period: billing || 'monthly',
          status: 'active',
          currency: 'USD',
          start_date: new Date().toISOString().split('T')[0],
          renewal_date: renewalDate.toISOString().split('T')[0],
          stripe_subscription_id: session.subscription,
        });
      }

      console.log(`✅ Subscription activated for ${user_email}: ${plan}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userEmail = sub.metadata?.user_email;
      if (userEmail) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: 'expired', tier: 'free' });
        }
        console.log(`❌ Subscription cancelled for ${userEmail}`);
      }
    }

    // Update renewal_date when invoice is paid (subscription renewed)
    if (event.type === 'invoice.paid') {
      const inv = event.data.object;
      const userEmail = inv.customer_email;
      if (userEmail && inv.subscription) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
        if (existing.length > 0) {
          const sub = existing[0];
          // Calculate next renewal from period_end
          const periodEnd = inv.lines?.data?.[0]?.period?.end;
          if (periodEnd) {
            const renewalDate = new Date(periodEnd * 1000).toISOString().split('T')[0];
            await base44.asServiceRole.entities.Subscription.update(sub.id, {
              status: 'active',
              renewal_date: renewalDate,
            });
            console.log(`🔄 Renewal date updated for ${userEmail}: ${renewalDate}`);
          }
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const inv = event.data.object;
      const userEmail = inv.customer_email;
      if (userEmail) {
        const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: 'paused' });
        }
        console.log(`⚠️ Payment failed for ${userEmail}`);
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return Response.json({ error: err.message }, { status: 400 });
  }
});