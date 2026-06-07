import Stripe from 'https://esm.sh/stripe@14'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

const PRICE_TO_TIER = {
  [Deno.env.get('STRIPE_PRICE_ELITE')]: 'ELITE',
  [Deno.env.get('STRIPE_PRICE_PRIMORDIAL')]: 'PRIMORDIAL',
}

function getUserId(obj) {
  return obj?.metadata?.supabase_user_id || null
}

Deno.serve(async (req) => {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  const obj = event.data.object

  switch (event.type) {

    case 'checkout.session.completed': {
      const userId = getUserId(obj)
      const tier = obj.metadata?.tier
      if (userId && tier) {
        await supabase.from('profiles')
          .update({ tier, subscription_status: 'active' })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const userId = getUserId(obj)
      if (!userId) break
      const priceId = obj.items.data[0]?.price.id
      const tier = PRICE_TO_TIER[priceId] || 'RANQUEADO'
      await supabase.from('profiles').update({
        tier,
        stripe_subscription_id: obj.id,
        stripe_price_id: priceId,
        subscription_status: obj.status,
        current_period_end: new Date(obj.current_period_end * 1000).toISOString(),
      }).eq('id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const userId = getUserId(obj)
      if (!userId) break
      await supabase.from('profiles').update({
        tier: 'RANQUEADO',
        subscription_status: 'canceled',
        stripe_subscription_id: null,
        stripe_price_id: null,
        current_period_end: null,
      }).eq('id', userId)
      break
    }

    case 'invoice.payment_failed': {
      const userId = getUserId(obj)
      if (!userId) break
      await supabase.from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('id', userId)
      break
    }

    case 'invoice.payment_succeeded': {
      const userId = getUserId(obj)
      if (!userId) break
      await supabase.from('profiles').update({
        subscription_status: 'active',
        current_period_end: new Date(
          obj.lines.data[0]?.period.end * 1000
        ).toISOString(),
      }).eq('id', userId)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
