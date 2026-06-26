// Fisher-Yates shuffle — muta o array e retorna
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Tira a carta do topo do deck (último elemento = topo pra pop mais rápido)
export function draw(deck) {
  if (deck.length === 0) return null
  return deck.pop()
}

// Compra N cartas
export function drawMultiple(deck, n) {
  const cards = []
  for (let i = 0; i < n; i++) {
    const c = draw(deck)
    if (c) cards.push(c)
    else break
  }
  return cards
}

// Cria cópia do deck e embaralha
export function createShuffledDeck(cardsArray) {
  return shuffle([...cardsArray])
}
