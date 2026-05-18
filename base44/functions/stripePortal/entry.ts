import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const return_url = body.return_url ||
      `${req.headers.get('origin') || 'https://amanahlife.base44.app'}/settings?tab=subscription`;

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return Response.json({ error: 'No Stripe customer found for this user.' }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url,
    });

    console.log(`Portal session created for ${user.email}: ${session.id}`);
    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});