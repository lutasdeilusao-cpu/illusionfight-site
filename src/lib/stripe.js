const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

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

export async function iniciarCheckout(tier, accessToken) {
  const priceId = PRICES[tier]
  if (!priceId) throw new Error('Price ID não configurado para este tier')

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tier, priceId }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  window.location.href = data.url
}

export async function cancelarAssinatura(accessToken) {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/cancel-subscription`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}
