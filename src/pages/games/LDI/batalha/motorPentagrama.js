// Motor da batalha do pentagrama. Sem React: só regras, pra testar sozinho e
// pra qualquer jogo consumir.
//
// O corpo é um pentagrama: 5 pontos grandes (cabeça, mãos, pés), 4 pequenos
// (cotovelos e joelhos, entre a mão/pé e o centro) e o centro, que abre de vez
// em quando pra esquiva.
//
// Combo = de 1 a 4 pontos ligados com o dedo. Cotovelo só logo depois da mão do
// mesmo lado; joelho só logo depois do pé do mesmo lado. Ponto não repete.
//
// Troca (uma batida): os dois lutadores soltam um combo ao mesmo tempo. Posição
// por posição, golpe do mesmo membro contra golpe do mesmo membro = bloqueio;
// o resto entra. A energia da troca é dividida pelos golpes do combo: um golpe
// sozinho sai com tudo, três golpes saem fracos. Bloquear e esquivar rendem
// energia pra próxima troca.

export const PONTOS = {
  cab: { membro: 'cab', grande: true, x: 150, y: 30, mult: 1.25 },
  maoD: { membro: 'bracoD', grande: true, x: 266, y: 114, mult: 1 },
  maoE: { membro: 'bracoE', grande: true, x: 34, y: 114, mult: 1 },
  peD: { membro: 'pernaD', grande: true, x: 222, y: 252, mult: 1.1 },
  peE: { membro: 'pernaE', grande: true, x: 78, y: 252, mult: 1.1 },
  cotD: { membro: 'bracoD', grande: false, x: 208, y: 132, mult: 1.3, depoisDe: 'maoD' },
  cotE: { membro: 'bracoE', grande: false, x: 92, y: 132, mult: 1.3, depoisDe: 'maoE' },
  joeD: { membro: 'pernaD', grande: false, x: 186, y: 201, mult: 1.4, depoisDe: 'peD' },
  joeE: { membro: 'pernaE', grande: false, x: 114, y: 201, mult: 1.4, depoisDe: 'peE' },
}
export const CENTRO = { x: 150, y: 150 }
export const MAX_GOLPES = 4
export const ENERGIA_BASE = 10
export const ENERGIA_MAX = 16
export const BONUS_BLOQUEIO = 1
export const BONUS_ESQUIVA = 3
export const BONUS_BLOQUEIO_DURO = 2 // bloquear soco/chute com cotovelo/joelho devolve um pouco

// Dá pra ligar esse ponto no fim do combo?
export function podeLigar(combo, ponto) {
  const p = PONTOS[ponto]
  if (!p || combo.includes(ponto) || combo.length >= MAX_GOLPES) return false
  if (p.depoisDe) return combo[combo.length - 1] === p.depoisDe
  return true
}

export function comboValido(combo) {
  return combo.length > 0 && combo.every((p, i) => podeLigar(combo.slice(0, i), p))
}

// Dano de cada golpe do combo com a energia da troca.
export function danoDoGolpe(combo, ponto, energia, forca = {}) {
  const base = energia / combo.length
  return Math.max(1, Math.round(base * PONTOS[ponto].mult * (forca[PONTOS[ponto].membro] ?? 1)))
}

// Resolve uma troca. lado = { combo, esquivou, energia, forca }.
// Devolve o dano que cada um levou, a energia da próxima troca e o passo a
// passo (pra tela mostrar e pro log).
export function resolverTroca(jog, ini) {
  const passos = []
  const r = { danoJog: 0, danoIni: 0, bonusJog: 0, bonusIni: 0, passos }
  if (jog.esquivou || ini.esquivou) {
    if (jog.esquivou) { r.bonusJog += BONUS_ESQUIVA; passos.push({ tipo: 'esquiva', quem: 'jog' }) }
    if (ini.esquivou) { r.bonusIni += BONUS_ESQUIVA; passos.push({ tipo: 'esquiva', quem: 'ini' }) }
    // Quem esquivou não ataca; o golpe do outro passa no vazio.
    if (jog.esquivou && ini.esquivou) return fechar(r, jog, ini)
    const atacante = jog.esquivou ? ini : jog
    for (const p of atacante.combo) passos.push({ tipo: 'vazio', quem: jog.esquivou ? 'ini' : 'jog', ponto: p })
    return fechar(r, jog, ini)
  }
  const n = Math.max(jog.combo.length, ini.combo.length)
  for (let i = 0; i < n; i++) {
    const pj = jog.combo[i], pi = ini.combo[i]
    if (pj && pi && PONTOS[pj].membro === PONTOS[pi].membro) {
      const duroJog = !PONTOS[pj].grande && PONTOS[pi].grande
      const duroIni = !PONTOS[pi].grande && PONTOS[pj].grande
      r.bonusJog += BONUS_BLOQUEIO
      r.bonusIni += BONUS_BLOQUEIO
      if (duroJog) r.danoIni += BONUS_BLOQUEIO_DURO
      if (duroIni) r.danoJog += BONUS_BLOQUEIO_DURO
      passos.push({ tipo: 'bloqueio', i, pontoJog: pj, pontoIni: pi, duro: duroJog ? 'jog' : duroIni ? 'ini' : null })
      continue
    }
    if (pj) {
      const d = danoDoGolpe(jog.combo, pj, jog.energia, jog.forca)
      r.danoIni += d
      passos.push({ tipo: 'acerto', i, quem: 'jog', ponto: pj, dano: d })
    }
    if (pi) {
      const d = danoDoGolpe(ini.combo, pi, ini.energia, ini.forca)
      r.danoJog += d
      passos.push({ tipo: 'acerto', i, quem: 'ini', ponto: pi, dano: d })
    }
  }
  return fechar(r, jog, ini)
}

function fechar(r, jog, ini) {
  r.energiaJog = Math.min(ENERGIA_MAX, ENERGIA_BASE + r.bonusJog)
  r.energiaIni = Math.min(ENERGIA_MAX, ENERGIA_BASE + r.bonusIni)
  return r
}

// O inimigo escolhe o combo pela ficha dele: uma lista de combos com peso.
export function escolherCombo(ficha, rnd = Math.random) {
  const total = ficha.combos.reduce((s, c) => s + c.peso, 0)
  let x = rnd() * total
  for (const c of ficha.combos) { x -= c.peso; if (x <= 0) return c.combo }
  return ficha.combos[0].combo
}

// Fichas de treino.
export const FICHAS = {
  saco: {
    id: 'saco', vida: 60, esquiva: 0,
    combos: [
      { combo: ['maoD'], peso: 4 },
      { combo: ['maoE', 'maoD'], peso: 3 },
      { combo: ['peD'], peso: 2 },
    ],
  },
  stormbyte: {
    id: 'stormbyte', vida: 70, esquiva: 0.12,
    combos: [
      { combo: ['maoE', 'maoD'], peso: 3 },
      { combo: ['maoD', 'cotD'], peso: 2 },
      { combo: ['peE', 'joeE'], peso: 2 },
      { combo: ['maoE', 'maoD', 'peD'], peso: 2 },
      { combo: ['cab'], peso: 1 },
      { combo: ['peD'], peso: 1 },
    ],
  },
}
