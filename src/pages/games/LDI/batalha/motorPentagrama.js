// Motor da batalha do pentagrama. Sem React: só regras, pra testar sozinho e
// pra qualquer jogo consumir.
//
// ATAQUE E DEFESA — é porrada, não turno: quem está atacando bate, quem está
// defendendo espelha pra bloquear (`resolverAtaque`). Bloqueou QUALQUER golpe:
// o ritmo do atacante quebra ali (o resto do combo não sai) e quem bloqueou
// entra no contra-ataque. Esquiva e poder na defesa também viram, e atacante
// que fica parado (sem golpe) perde o tempo e a vez. Sem bloqueio, o atacante
// segue batendo e o outro segue apanhando.
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
// CARGA — tocar de novo no último ponto do combo (ele pisca): cada
// TOQUES_POR_CARGA toques sobem um nível (até 2). Carga I: até 2 golpes,
// energia ×1,5. Carga II: 1 golpe, ×2,2. A carga soma na gravidade.
//
// BLOQUEIO — o defensor espelha: mesmo membro na mesma posição do combo do
// atacante. Bloqueio sempre custa um pouco de sangue (raspão: 25% do golpe, no
// mínimo 1); cotovelo/joelho bloqueando mão/pé devolve 2 no atacante; quem
// bloqueia ganha energia pro ataque que vem. Só a esquiva sai limpa.
//
// GRAVIDADE — mão e pé 1; cabeça, cotovelo e joelho 2 (+carga). Levar
// gravidade 3 ou mais sem bloquear numa batida = TONTO: na próxima, 1 golpe só
// e sem carga.
//
// ENERGIA — 10 por batida (teto 16), dividida pelos golpes do combo.
//
// NO TEMPO — o jogo é tocar no beat. `noTempo[i]` diz se o golpe i saiu no
// tempo (até JANELA_TEMPO de um tempo do compasso). No tempo, bate
// MULT_NO_TEMPO mais forte. FORA do tempo é erro: no ataque, o golpe não entra,
// o combo quebra ali e a abertura é do outro (a vez vira); na defesa, o
// bloqueio fora do tempo não conta. Sem `noTempo` (o inimigo), vale tudo.
//
// REPETIÇÃO — atacar com o MESMO combo pela 3ª vez seguida: o inimigo já leu,
// bloqueia certinho, o combo quebra no 1º golpe e a vez vira (`combo lido`).
//
// ESQUIVA — o centro abre raramente, por um instante, e é um ponto do traço:
// passar o dedo por ele aberto, defendendo, esquiva o ataque inteiro e vira a
// vez.
//
// PODER — a bolinha em cima da cabeça (ORBE) enche a barra de poder a cada
// toque e enquanto o dedo segura; bloquear e apanhar também enchem. Barra
// cheia: aparece na hora uma sequência de pontos; desenhou ela exata, sai o
// poder (Gelo Negro: dano alto, sem bloqueio, congela — tonto na próxima). Na
// defesa, o poder quebra o ataque dele e vira a vez. A barra zera.

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
export const BONUS_ESQUIVA = 2
export const DANO_BLOQUEIO_DURO = 2
export const LIMITE_TONTO = 3
export const RASPAO = 0.25
export const MULT_NO_TEMPO = 1.25
export const JANELA_TEMPO = 0.18 // fração de um tempo (1/4 da batida) pra cada lado
export const REPETICOES_LIDAS = 3
export const ORBE = { x: 150, y: -20 }
export const PODER_MAX = 100
export const PODER_POR_SEGUNDO = 26
export const PODER_POR_TOQUE = 5
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

// Uma batida de ataque/defesa. atacante = { combo, carga, energia, forca },
// defensor = { combo (o espelho que ele desenhou; pode ter o centro = esquiva),
// energia, poder? }. Devolve o dano no defensor (e o reflexo do bloqueio duro
// no atacante), se a vez vira e o passo a passo.
export function resolverAtaque(atacanteEntrada, defensorEntrada) {
  const atk = { ...atacanteEntrada, combo: golpesDe(atacanteEntrada.combo) }
  const def = { ...defensorEntrada, esquivou: defensorEntrada.combo.includes(ESQUIVA), combo: golpesDe(defensorEntrada.combo) }
  const r = { danoDef: 0, danoAtk: 0, bonusDef: 0, gravLevada: 0, passos: [], vira: false, poderGanhoDef: 0 }
  const poder = PODERES[def.poder]
  if (poder) {
    r.danoAtk = poder.dano
    r.passos.push({ tipo: 'poder', quem: 'def', poder: poder.id, dano: poder.dano })
    atk.combo.forEach((p, i) => r.passos.push({ tipo: 'congelado', i, quem: 'atk', ponto: p }))
    r.vira = true; r.atkTonto = poder.congela
    return r
  }
  const poderAtk = PODERES[atk.poder]
  if (poderAtk) {
    r.danoDef = poderAtk.dano
    r.passos.push({ tipo: 'poder', quem: 'atk', poder: poderAtk.id, dano: poderAtk.dano })
    r.defTonto = poderAtk.congela
    return r
  }
  // Atacante parado (não desenhou golpe nenhum): perdeu o tempo, a vez vira.
  if (!atk.combo.length) {
    r.passos.push({ tipo: 'parado', quem: 'atk' })
    r.vira = true
    return r
  }
  if (def.esquivou) {
    r.bonusDef += BONUS_ESQUIVA
    r.passos.push({ tipo: 'esquiva', quem: 'def' })
    atk.combo.forEach((p, i) => r.passos.push({ tipo: 'vazio', i, quem: 'atk', ponto: p }))
    r.vira = true
    return r
  }
  for (let i = 0; i < atk.combo.length; i++) {
    const pa = atk.combo[i]
    const pd = def.combo[i]
    if (atk.noTempo && atk.noTempo[i] === false) {
      r.passos.push({ tipo: 'fora', i, quem: 'atk', ponto: pa })
      atk.combo.slice(i + 1).forEach((p, k) => r.passos.push({ tipo: 'cortado', i: i + 1 + k, quem: 'atk', ponto: p }))
      r.vira = true
      break
    }
    const bloqueioValeu = !def.noTempo || def.noTempo[i] !== false
    if (pd && bloqueioValeu && PONTOS[pd].membro === PONTOS[pa].membro) {
      const raspao = Math.max(1, Math.round(danoDoGolpe(atk, pa) * RASPAO))
      const duro = !PONTOS[pd].grande && PONTOS[pa].grande
      r.danoDef += raspao
      if (duro) r.danoAtk += DANO_BLOQUEIO_DURO
      r.bonusDef += BONUS_BLOQUEIO
      r.poderGanhoDef += PODER_BLOQUEIO
      r.vira = true
      r.passos.push({ tipo: 'bloqueio', i, ponto: pa, defesa: pd, raspao, duro })
      // Bloqueou: o ritmo do atacante quebra ali — o resto do combo não sai.
      atk.combo.slice(i + 1).forEach((p, k) => r.passos.push({ tipo: 'cortado', i: i + 1 + k, quem: 'atk', ponto: p }))
      break
    }
    const d = Math.round(danoDoGolpe(atk, pa) * (atk.noTempo?.[i] ? MULT_NO_TEMPO : 1))
    r.danoDef += d
    r.gravLevada += gravidade(pa, atk.carga)
    r.poderGanhoDef += PODER_APANHOU
    r.passos.push({ tipo: 'acerto', i, quem: 'atk', ponto: pa, dano: d, noTempo: Boolean(atk.noTempo?.[i]) })
  }
  r.defTonto = r.gravLevada >= LIMITE_TONTO
  return r
}

// O jogador repetiu o mesmo combo REPETICOES_LIDAS vezes seguidas?
export const comboLido = (historico, combo) => {
  const g = golpesDe(combo).join()
  return g !== '' && historico.length >= REPETICOES_LIDAS - 1 && historico.slice(-(REPETICOES_LIDAS - 1)).every(h => h.join() === g)
}

// O inimigo defendendo: tenta adivinhar membro a membro o combo do jogador.
// `leitura` = chance de acertar cada membro (sobe se o jogador repete o combo).
export function escolherDefesa(ficha, comboJogador, { ultimoDoJogador = [] } = {}, rnd = Math.random) {
  const golpes = golpesDe(comboJogador)
  const repetiu = golpes.length && golpes.join() === ultimoDoJogador.join()
  const leitura = Math.min(0.9, (ficha.leitura || 0.2) + (repetiu ? 0.4 : 0))
  if (rnd() < (ficha.esquiva || 0)) return [ESQUIVA]
  const porMembro = { cab: ['cab'], bracoD: ['maoD', 'cotD'], bracoE: ['maoE', 'cotE'], pernaD: ['peD', 'joeD'], pernaE: ['peE', 'joeE'] }
  const membros = Object.keys(porMembro)
  return golpes.map(p => {
    const m = rnd() < leitura ? PONTOS[p].membro : membros[Math.floor(rnd() * membros.length)]
    return porMembro[m][0]
  })
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
    id: 'saco', vida: 60, esquiva: 0, espelho: 0, leitura: 0.15,
    combos: [
      { combo: ['maoE', 'maoD'], peso: 4 },
      { combo: ['maoD', 'maoE', 'peD'], peso: 3 },
      { combo: ['peD', 'joeD'], peso: 2 },
      { combo: ['maoD', 'cotD', 'maoE'], peso: 2 },
      { combo: ['maoE', 'maoD', 'peE', 'peD'], peso: 1 },
    ],
  },
  stormbyte: {
    id: 'stormbyte', vida: 70, esquiva: 0.08, espelho: 0.35, leitura: 0.35,
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
