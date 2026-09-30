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
  return obj?.metadata?.supabase_user_id
    || obj?.subscription_details?.metadata?.supabase_user_id
    || obj?.parent?.subscription_details?.metadata?.supabase_user_id
    || null
}

// Sem metadata (fatura, reembolso): acha a conta pelo customer do Stripe.
async function userDoCustomer(customer) {
  if (!customer) return null
  const { data } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customer).maybeSingle()
  return data?.id || null
}

// Histórico financeiro do painel (migration 043). Idempotente pelo id do
// evento: o Stripe reenvia webhook e não pode contar duas vezes. Falha aqui
// nunca derruba o webhook — o tier do perfil é o que importa pro usuário.
async function registrar(eventId, linha) {
  try {
    await supabase.from('painel_pagamentos').upsert({ stripe_id: eventId, ...linha }, { onConflict: 'stripe_id', ignoreDuplicates: true })
  } catch (err) {
    console.error('[painel_pagamentos]', err?.message)
  }
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
      if (obj.mode === 'payment') {
        // compra avulsa da loja: o valor entra aqui (assinatura entra pela fatura)
        await registrar(event.id, { user_id: userId, tipo: 'pagamento', origem: 'loja', valor_centavos: obj.amount_total || 0, moeda: obj.currency, descricao: obj.metadata?.produto_id || null })
      } else {
        await registrar(event.id, { user_id: userId, tipo: 'assinou', origem: 'assinatura', tier: tier || null, moeda: obj.currency })
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
      await registrar(event.id, { user_id: userId, tipo: 'cancelamento', origem: 'assinatura', tier: PRICE_TO_TIER[obj.items?.data?.[0]?.price?.id] || null })
      break
    }

    case 'invoice.payment_failed': {
      const userId = getUserId(obj) || await userDoCustomer(obj.customer)
      await registrar(event.id, { user_id: userId, tipo: 'falha', origem: 'assinatura', valor_centavos: obj.amount_due || 0, moeda: obj.currency })
      if (!userId) break
      await supabase.from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('id', userId)
      break
    }

    case 'invoice.payment_succeeded': {
      const userId = getUserId(obj) || await userDoCustomer(obj.customer)
      const precoId = obj.lines?.data?.[0]?.price?.id || obj.lines?.data?.[0]?.pricing?.price_details?.price
      if (obj.amount_paid > 0) {
        await registrar(event.id, { user_id: userId, tipo: 'pagamento', origem: 'assinatura', tier: PRICE_TO_TIER[precoId] || null, valor_centavos: obj.amount_paid, moeda: obj.currency })
      }
      if (!userId) break
      await supabase.from('profiles').update({
        subscription_status: 'active',
        current_period_end: new Date(
          obj.lines.data[0]?.period.end * 1000
        ).toISOString(),
      }).eq('id', userId)
      break
    }

    case 'charge.refunded': {
      const userId = getUserId(obj) || await userDoCustomer(obj.customer)
      await registrar(event.id, { user_id: userId, tipo: 'reembolso', valor_centavos: obj.amount_refunded || 0, moeda: obj.currency })
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
