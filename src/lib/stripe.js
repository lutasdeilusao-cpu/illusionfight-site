import { supabase } from './supabase'

// Um único Price ID por tier. O Stripe resolve a moeda automaticamente
// com base no país do cartão do cliente (multi-currency Price).
const PRICES = {
  ELITE: import.meta.env.VITE_STRIPE_PRICE_ELITE,
  PRIMORDIAL: import.meta.env.VITE_STRIPE_PRICE_PRIMORDIAL,
}

// Exibição de preço por locale — apenas visual, não determina o Price ID
const PRICE_DISPLAY = {
  pt: { symbol: 'R$', elite: '10', primordial: '30', per: 'mês' },
  en: { symbol: '$',  elite: '5',  primordial: '15', per: 'mo'  },
  es: { symbol: '€',  elite: '5',  primordial: '15', per: 'mes' },
}

export function getPriceDisplay(locale) {
  return PRICE_DISPLAY[locale] || PRICE_DISPLAY.pt
}

export async function iniciarCheckout(tier) {
  const priceId = PRICES[tier]
  if (!priceId) throw new Error('Price ID não configurado para este tier')

  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { tier, priceId },
  })

  if (error) throw new Error(error.message)
  window.location.href = data.url
}

export async function cancelarAssinatura() {
  const { data, error } = await supabase.functions.invoke('cancel-subscription')

  if (error) throw new Error(error.message)
  return data
}
