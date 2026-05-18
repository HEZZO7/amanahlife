import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Price IDs mapping
const PRICE_IDS = {
  premium_monthly: 'price_1TYJU6EPHqY46aAewAs2TAzv',
  premium_yearly:  'price_1TYJU6EPHqY46aAeLFdYucIg',
  family_monthly:  'price_1TYJU6EPHqY46aAevpYzPIYN',
  family_yearly:   'price_1TYJU6EPHqY46aAe0nwgjtfi',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, billing, success_url, cancel_url } = await req.json();
    const key = `${plan}_${billing}`;
    const priceId = PRICE_IDS[key];
    if (!priceId) return Response.json({ error: 'Invalid plan' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${req.headers.get('origin') || 'https://amanahlife.base44.app'}/settings?tab=subscription&success=true`,
      cancel_url:  cancel_url  || `${req.headers.get('origin') || 'https://amanahlife.base44.app'}/settings?tab=subscription&cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan,
        billing,
      },
      subscription_data: {
        metadata: {
          user_email: user.email,
          plan,
        },
      },
    });

    console.log(`Checkout session created for ${user.email} → ${plan}/${billing}: ${session.id}`);
    return Response.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Checkout error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});