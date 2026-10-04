// Motor da batalha do pentagrama. Sem React: só regras, pra testar sozinho e
// pra qualquer jogo consumir.
//
// O corpo é um pentagrama: 5 pontos grandes (cabeça, mãos, pés), 4 pequenos
// (cotovelos e joelhos, entre a mão/pé e o centro) e o centro, que abre de vez
// em quando pra esquiva.
//
// COMBO — de 1 a 4 pontos ligados com o dedo, sem repetir. Ponto grande liga
// com qualquer um. Ponto pequeno (cotovelo/joelho) só entra logo depois do
// ponto grande do mesmo lado (mão→cotovelo, pé→joelho) ou de outro ponto
// pequeno, porque o corpo já tá "dentro" (pé→joelho→cotovelo vale).
//
// CARGA — depois de soltar o traço, o último ponto pisca: cada TOQUES_POR_CARGA
// toques nele sobem um nível (até 2).
// Carga I: no máximo 2 golpes, energia ×1,5. Carga II: 1 golpe só, energia
// ×2,2. Carga soma na gravidade. Mas golpe carregado abre a guarda: se o
// inimigo bloquear um golpe seu ou esquivar, o dano que você leva na troca
// sobe 50%.
//
// GRAVIDADE — cada golpe pesa: mão e pé 1; cabeça, cotovelo e joelho 2.
//   • Mesma posição, mesmo membro = BLOQUEIO: quem bloqueia ganha +2 de
//     energia na próxima troca, quem foi bloqueado perde 1. Bloquear mão/pé
//     com cotovelo/joelho devolve 2 de dano. Bloqueio sempre custa um pouco de
//     sangue (raspão: 25% do golpe, no mínimo 1) — só a esquiva sai limpa.
//   • Mesma posição, membros diferentes: o golpe mais grave INTERROMPE o mais
//     leve (o leve não entra). Mesma gravidade: os dois entram.
//   • Levou golpes sem bloquear somando gravidade 3 ou mais numa troca =
//     TONTO: na próxima troca só dá 1 golpe e sem carga.
//
// ENERGIA — 10 por troca (teto 16), dividida pelos golpes do combo.
//
// PODER — a bolinha entre as pernas (ORBE) carrega a barra de poder enquanto
// o dedo segura nela; segurar é abrir mão de atacar. Bloquear e apanhar também
// enchem um pouco. Barra cheia: a cada batida o jogo manda uma sequência de
// pontos; desenhou exatamente ela, sai o poder (Gelo Negro: dano alto, sem
// bloqueio, cancela o combo dele e o congela — tonto na próxima). A barra zera.
//
// ESQUIVA — o centro abre raramente, por um instante. Ele é um ponto do traço:
// passar o dedo por ele aberto liga 'centro' no combo (não gasta vaga de
// golpe; depois dele dá pra ir pra qualquer ponto, até cotovelo/joelho). Com a
// esquiva ligada, todos os golpes do inimigo passam no vazio e TODOS os seus
// entram, sem bloqueio e sem interrupção (você já não tá onde ele mirou),
// como golpe limpo (×1,3). Só esquivar, sem golpe no traço: ninguém leva dano.
// +2 de energia.

export const PONTOS = {
  cab: { membro: 'cab', grande: true, x: 150, y: 30, mult: 1.25, grav: 2 },
  maoD: { membro: 'bracoD', grande: true, x: 266, y: 114, mult: 1, grav: 1 },
  maoE: { membro: 'bracoE', grande: true, x: 34, y: 114, mult: 1, grav: 1 },
  peD: { membro: 'pernaD', grande: true, x: 222, y: 252, mult: 1.1, grav: 1 },
  peE: { membro: 'pernaE', grande: true, x: 78, y: 252, mult: 1.1, grav: 1 },
  cotD: { membro: 'bracoD', grande: false, x: 208, y: 132, mult: 1.3, grav: 2, base: 'maoD' },
  cotE: { membro: 'bracoE', grande: false, x: 92, y: 132, mult: 1.3, grav: 2, base: 'maoE' },
  joeD: { membro: 'pernaD', grande: false, x: 186, y: 201, mult: 1.4, grav: 2, base: 'peD' },
  joeE: { membro: 'pernaE', grande: false, x: 114, y: 201, mult: 1.4, grav: 2, base: 'peE' },
}
export const CENTRO = { x: 150, y: 150 }
export const MAX_POR_CARGA = [4, 2, 1]
export const TOQUES_POR_CARGA = 3
export const MULT_CARGA = [1, 1.5, 2.2]
export const ENERGIA_BASE = 10
export const ENERGIA_MAX = 16
export const ENERGIA_MIN = 6
export const BONUS_BLOQUEIO = 2
export const PERDA_BLOQUEADO = 1
export const BONUS_ESQUIVA = 2
export const DANO_BLOQUEIO_DURO = 2
export const GUARDA_ABERTA = 1.5
export const LIMITE_TONTO = 3
export const MULT_GOLPE_LIMPO = 1.3
export const RASPAO = 0.25
export const ORBE = { x: 150, y: 290 }
export const PODER_MAX = 100
export const PODER_POR_SEGUNDO = 26
export const PODER_BLOQUEIO = 8
export const PODER_APANHOU = 4
export const PODERES = {
  geloNegro: { id: 'geloNegro', dano: 24, golpes: 4, congela: true },
}

export const maxGolpes = (carga = 0, tonto = false) => (tonto ? 1 : MAX_POR_CARGA[carga])
export const ESQUIVA = 'centro'
export const golpesDe = combo => combo.filter(p => p !== ESQUIVA)

// Dá pra ligar esse ponto no fim do traço? (`traco` pode ter o centro no meio)
export function podeLigar(traco, ponto, max = 4, centroAberto = false) {
  if (traco.includes(ponto)) return false
  if (ponto === ESQUIVA) return centroAberto
  const p = PONTOS[ponto]
  if (!p || golpesDe(traco).length >= max) return false
  if (p.grande) return true
  const ultimo = traco[traco.length - 1]
  if (!ultimo) return false
  return ultimo === ESQUIVA || ultimo === p.base || !PONTOS[ultimo].grande
}

export function comboValido(traco, max = 4) {
  return golpesDe(traco).length > 0 && golpesDe(traco).length <= max && traco.every((p, i) => podeLigar(traco.slice(0, i), p, max, true))
}

export const gravidade = (ponto, carga = 0) => PONTOS[ponto].grav + carga

export function danoDoGolpe(lado, ponto) {
  const base = (lado.energia * MULT_CARGA[lado.carga || 0]) / lado.combo.length
  return Math.max(1, Math.round(base * PONTOS[ponto].mult * (lado.forca?.[PONTOS[ponto].membro] ?? 1)))
}

// Resolve uma troca. lado = { combo, carga, esquivou, energia, forca }.
// Devolve o dano de cada lado, a energia e a tontura da próxima troca e o
// passo a passo (pra tela e pro log).
// Distância de um ponto até o segmento a→b.
function distSegmento(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}
// O trecho a→b passa limpo, sem raspar em outro ponto? (senão o dedo liga o
// ponto do meio sem querer)
function trechoLimpo(a, b) {
  return Object.keys(PONTOS).every(id => id === a || id === b || distSegmento(PONTOS[id], PONTOS[a], PONTOS[b]) > 24)
}

// A sequência que o poder pede nesta batida: um traço válido sorteado, só com
// trechos que o dedão consegue fazer sem raspar em outro ponto.
export function sequenciaDoPoder(poder, rnd = Math.random) {
  for (let tentativa = 0; tentativa < 80; tentativa++) {
    const seq = []
    while (seq.length < poder.golpes) {
      const opcoes = Object.keys(PONTOS).filter(p => podeLigar(seq, p) && (!seq.length || trechoLimpo(seq[seq.length - 1], p)))
      if (!opcoes.length) break
      seq.push(opcoes[Math.floor(rnd() * opcoes.length)])
    }
    if (seq.length === poder.golpes) return seq
  }
  return ['maoD', 'cotD', 'joeD', 'cotE']
}

export const acertouSequencia = (traco, seq) => {
  const g = golpesDe(traco)
  return g.length === seq.length && g.every((p, i) => p === seq[i])
}

export function resolverTroca(jogEntrada, iniEntrada) {
  // O traço pode trazer o centro: vira `esquivou` e sai da lista de golpes.
  const norm = l => ({ ...l, esquivou: Boolean(l.esquivou || l.combo.includes(ESQUIVA)), combo: golpesDe(l.combo) })
  const jog = norm(jogEntrada), ini = norm(iniEntrada)
  const L = { jog, ini }
  // Poder: sai antes de tudo, sem bloqueio, e cancela o combo do outro.
  for (const q of ['jog', 'ini']) {
    const poder = PODERES[L[q].poder]
    if (!poder) continue
    const o = q === 'jog' ? 'ini' : 'jog'
    const r = { dano: { jog: 0, ini: 0 }, passos: [{ tipo: 'poder', quem: q, poder: poder.id, dano: poder.dano }] }
    r.dano[o] = poder.dano
    L[o].combo.forEach((p, i) => r.passos.push({ tipo: 'congelado', i, quem: o, ponto: p }))
    return {
      ...r, danoJog: r.dano.jog, danoIni: r.dano.ini, aberto: { jog: false, ini: false },
      energiaJog: ENERGIA_BASE, energiaIni: ENERGIA_BASE,
      tontoJog: poder.congela && o === 'jog', tontoIni: poder.congela && o === 'ini', poderUsado: q,
      poderGanho: { jog: 0, ini: 0 },
    }
  }
  const r = { dano: { jog: 0, ini: 0 }, bonus: { jog: 0, ini: 0 }, gravLevada: { jog: 0, ini: 0 }, aberto: { jog: false, ini: false }, passos: [] }
  const outro = q => (q === 'jog' ? 'ini' : 'jog')
  const acerta = (q, i, p) => {
    const d = Math.round(danoDoGolpe(L[q], p) * (L[q].esquivou ? MULT_GOLPE_LIMPO : 1))
    r.dano[outro(q)] += d
    r.gravLevada[outro(q)] += gravidade(p, L[q].carga)
    r.passos.push({ tipo: 'acerto', i, quem: q, ponto: p, dano: d, limpo: L[q].esquivou })
  }

  if (jog.esquivou || ini.esquivou) {
    if (jog.esquivou && ini.esquivou) {
      r.passos.push({ tipo: 'esquiva', quem: 'jog' }, { tipo: 'esquiva', quem: 'ini' })
    } else {
      const q = jog.esquivou ? 'jog' : 'ini'
      r.bonus[q] += BONUS_ESQUIVA
      r.passos.push({ tipo: 'esquiva', quem: q })
      L[outro(q)].combo.forEach((p, i) => r.passos.push({ tipo: 'vazio', i, quem: outro(q), ponto: p }))
      if (L[outro(q)].carga) r.aberto[outro(q)] = true
      L[q].combo.forEach((p, i) => acerta(q, i, p))
    }
  } else {
    const n = Math.max(jog.combo.length, ini.combo.length)
    for (let i = 0; i < n; i++) {
      const pj = jog.combo[i], pi = ini.combo[i]
      if (pj && pi && PONTOS[pj].membro === PONTOS[pi].membro) {
        const duroJog = !PONTOS[pj].grande && PONTOS[pi].grande
        const duroIni = !PONTOS[pi].grande && PONTOS[pj].grande
        r.bonus.jog += BONUS_BLOQUEIO - PERDA_BLOQUEADO
        r.bonus.ini += BONUS_BLOQUEIO - PERDA_BLOQUEADO
        if (jog.carga) r.aberto.jog = true
        if (ini.carga) r.aberto.ini = true
        if (duroJog) r.dano.ini += DANO_BLOQUEIO_DURO
        if (duroIni) r.dano.jog += DANO_BLOQUEIO_DURO
        // Raspão: os dois bloquearam o golpe um do outro, cada um leva um pouco.
        const raspaoJog = Math.max(1, Math.round(danoDoGolpe(ini, pi) * RASPAO))
        const raspaoIni = Math.max(1, Math.round(danoDoGolpe(jog, pj) * RASPAO))
        r.dano.jog += raspaoJog
        r.dano.ini += raspaoIni
        r.passos.push({ tipo: 'bloqueio', i, pontoJog: pj, pontoIni: pi, duro: duroJog ? 'jog' : duroIni ? 'ini' : null, raspaoJog, raspaoIni })
        continue
      }
      if (pj && pi) {
        const gj = gravidade(pj, jog.carga), gi = gravidade(pi, ini.carga)
        if (gj !== gi) {
          const forte = gj > gi ? 'jog' : 'ini'
          const fraco = outro(forte)
          r.passos.push({ tipo: 'interrompe', i, quem: forte, ponto: forte === 'jog' ? pj : pi, pontoFraco: fraco === 'jog' ? pj : pi })
          acerta(forte, i, forte === 'jog' ? pj : pi)
          continue
        }
      }
      if (pj) acerta('jog', i, pj)
      if (pi) acerta('ini', i, pi)
    }
  }

  for (const q of ['jog', 'ini']) if (r.aberto[q]) r.dano[q] = Math.round(r.dano[q] * GUARDA_ABERTA)
  r.danoJog = r.dano.jog
  r.danoIni = r.dano.ini
  r.energiaJog = Math.max(ENERGIA_MIN, Math.min(ENERGIA_MAX, ENERGIA_BASE + r.bonus.jog))
  r.energiaIni = Math.max(ENERGIA_MIN, Math.min(ENERGIA_MAX, ENERGIA_BASE + r.bonus.ini))
  // Poder ganho: bloqueio e golpe levado enchem um pouco a barra.
  r.poderGanho = { jog: 0, ini: 0 }
  for (const p of r.passos) {
    if (p.tipo === 'bloqueio') { r.poderGanho.jog += PODER_BLOQUEIO; r.poderGanho.ini += PODER_BLOQUEIO }
    if (p.tipo === 'acerto') r.poderGanho[outro(p.quem)] += PODER_APANHOU
  }
  r.tontoJog = r.gravLevada.jog >= LIMITE_TONTO
  r.tontoIni = r.gravLevada.ini >= LIMITE_TONTO
  return r
}

// O inimigo escolhe o combo pela ficha: combos com peso, e às vezes repete o
// SEU último combo (quem repete o mesmo combo apanha bloqueado). Tonto, só o
// primeiro golpe.
export function escolherCombo(ficha, { ultimoDoJogador = [], tonto = false } = {}, rnd = Math.random) {
  let combo
  if (ultimoDoJogador.length && rnd() < (ficha.espelho || 0)) combo = ultimoDoJogador
  else {
    const total = ficha.combos.reduce((s, c) => s + c.peso, 0)
    let x = rnd() * total
    combo = ficha.combos.find(c => (x -= c.peso) <= 0)?.combo || ficha.combos[0].combo
  }
  return tonto ? combo.slice(0, 1) : combo
}

// Fichas de treino.
export const FICHAS = {
  saco: {
    id: 'saco', vida: 60, esquiva: 0, espelho: 0,
    combos: [
      { combo: ['maoE', 'maoD'], peso: 4 },
      { combo: ['maoD', 'maoE', 'peD'], peso: 3 },
      { combo: ['peD', 'joeD'], peso: 2 },
      { combo: ['maoD', 'cotD', 'maoE'], peso: 2 },
      { combo: ['maoE', 'maoD', 'peE', 'peD'], peso: 1 },
    ],
  },
  stormbyte: {
    id: 'stormbyte', vida: 70, esquiva: 0.08, espelho: 0.35,
    combos: [
      { combo: ['maoE', 'maoD', 'cotD'], peso: 3 },
      { combo: ['maoD', 'cotD', 'joeD', 'cotE'], peso: 2 },
      { combo: ['peE', 'joeE', 'cotE'], peso: 3 },
      { combo: ['maoE', 'cotE', 'maoD', 'peD'], peso: 2 },
      { combo: ['cab', 'maoD'], peso: 1 },
      { combo: ['peD', 'joeD', 'maoE'], peso: 2 },
    ],
  },
}
