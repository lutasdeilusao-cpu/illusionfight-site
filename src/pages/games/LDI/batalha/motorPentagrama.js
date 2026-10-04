// Motor da batalha do pentagrama. Sem React: só regras, pra testar sozinho e
// pra qualquer jogo consumir.
//
// ATAQUE E DEFESA — é porrada, não turno: quem está atacando bate, quem está
// defendendo escolhe até MAX_DEFESA pontos pra proteger, SEM ver o ataque
// (`resolverAtaque`). No fim da batida compara os pontos defendidos com os
// atacados, membro com membro, sem importar a ordem: golpe num membro
// defendido não entra; os outros entram. Defendeu pelo menos um, a vez vira.
// Esquiva e poder na defesa também viram, e atacante que fica parado perde o
// tempo e a vez.

// O corpo é um pentagrama: 5 pontos grandes (cabeça, mãos, pés), 4 pequenos
// (cotovelos e joelhos, entre a mão/pé e o centro) e o centro, que abre de vez
// em quando pra esquiva.
//
// COMBO — de 1 a 4 golpes, qualquer ponto em qualquer ordem (cotovelo direto,
// cotovelo e depois perna...). Só não dá pra ligar o mesmo ponto duas vezes
// SEGUIDAS — tocar de novo no último ponto é carga. Repetir mais tarde vale.
//
// CARGA — tocar de novo no último ponto do combo (ele pisca): cada
// TOQUES_POR_CARGA toques sobem um nível (até 2). Carga I: até 2 golpes,
// energia ×1,5. Carga II: 1 golpe, ×2,2. A carga soma na gravidade.
//
// BLOQUEIO — golpe num membro defendido não dá dano. Cotovelo/joelho
// defendendo mão/pé do mesmo membro devolve 2 no atacante; quem defende ganha
// energia pro ataque que vem.

// GRAVIDADE — mão e pé 1; cabeça, cotovelo e joelho 2 (+carga). Levar
// gravidade 3 ou mais sem bloquear numa batida = TONTO: na próxima, 1 golpe só
// e sem carga.
//
// VALOR DO GOLPE — cada batida tem um golpe cheio de energia × FATOR_GOLPE
// (energia 10 → 24), × a carga. Cada golpe entrega uma fração dele: no beat
// (amarelo) PCT_NO_TEMPO = 25%, fora do beat PCT_FORA = 10%. Ex.: 1 amarelo +
// 3 fora = 55% do golpe cheio; 4 amarelos = 100%. Cotovelo, joelho e cabeça
// pesam um pouco mais (o `mult` de cada ponto).

// REPETIÇÃO — atacar com o MESMO combo pela 3ª vez seguida: o inimigo já leu e
// defende exatamente aqueles membros (`comboLido`).
//
// ESQUIVA — o centro abre raramente, por um instante, e é um ponto do traço:
// tocar nele aberto, defendendo, esquiva o ataque inteiro e vira a vez.
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
  cotD: { membro: 'bracoD', grande: false, x: 208, y: 132, mult: 1.3, grav: 2 },
  cotE: { membro: 'bracoE', grande: false, x: 92, y: 132, mult: 1.3, grav: 2 },
  joeD: { membro: 'pernaD', grande: false, x: 186, y: 201, mult: 1.4, grav: 2 },
  joeE: { membro: 'pernaE', grande: false, x: 114, y: 201, mult: 1.4, grav: 2 },
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
export const FATOR_GOLPE = 2.4
export const PCT_NO_TEMPO = 0.25
export const PCT_FORA = 0.1
export const MAX_DEFESA = 2
export const JANELA_TEMPO = 0.18 // fração de um tempo (1/4 da batida) pra cada lado
export const REPETICOES_LIDAS = 3
export const ORBE = { x: 150, y: -20 }
export const PODER_MAX = 100
export const PODER_POR_SEGUNDO = 26
export const PODER_POR_TOQUE = 5
export const PODER_BLOQUEIO = 8
export const PODER_APANHOU = 4
// Poderes: dano direto, sem bloqueio, e um efeito no alvo.
//   tonto: na próxima batida, 1 golpe só.
//   paralisia: a próxima batida inteira parado (não ataca nem defende).
//   cego: 2 batidas sem ver nada — quem ataca chuta a defesa, quem defende não
//   vê o anel do beat nem quantos golpes vêm.
export const PODERES = {
  geloNegro: { id: 'geloNegro', dano: 22, golpes: 4, efeito: 'tonto' },
  choque: { id: 'choque', dano: 14, golpes: 3, efeito: 'paralisia' },
  cegueira: { id: 'cegueira', dano: 10, golpes: 5, efeito: 'cego' },
}
export const DURACAO_EFEITO = { tonto: 1, paralisia: 1, cego: 2 }

// `kit` = quantos pontos o jogador consegue ligar nessa fase da campanha.
export const maxGolpes = (carga = 0, tonto = false, kit = 4) => (tonto ? 1 : Math.min(kit, MAX_POR_CARGA[carga]))
export const ESQUIVA = 'centro'
export const golpesDe = combo => combo.filter(p => p !== ESQUIVA)

// Dá pra ligar esse ponto no fim do traço? (`traco` pode ter o centro no meio)
export function podeLigar(traco, ponto, max = 4, centroAberto = false) {
  if (ponto === ESQUIVA) return centroAberto && !traco.includes(ESQUIVA)
  if (!PONTOS[ponto] || golpesDe(traco).length >= max) return false
  return golpesDe(traco).at(-1) !== ponto
}

export function comboValido(traco, max = 4) {
  return golpesDe(traco).length > 0 && golpesDe(traco).length <= max && traco.every((p, i) => podeLigar(traco.slice(0, i), p, max, true))
}

export const gravidade = (ponto, carga = 0) => PONTOS[ponto].grav + carga

export function danoDoGolpe(lado, ponto, noTempo = true) {
  const cheio = lado.energia * FATOR_GOLPE * MULT_CARGA[lado.carga || 0]
  const pct = noTempo ? PCT_NO_TEMPO : PCT_FORA
  return Math.max(1, Math.round(cheio * pct * PONTOS[ponto].mult * (lado.forca?.[PONTOS[ponto].membro] ?? 1)))
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

// O super do inimigo: n pontos diferentes que o jogador tem que tocar todos,
// em qualquer ordem e fora do beat mesmo, pra não tomar.
export function sequenciaDoSuper(n, rnd = Math.random) {
  const ids = Object.keys(PONTOS).sort(() => rnd() - 0.5)
  return ids.slice(0, n)
}
export const defendeuSuper = (traco, seq) => seq.every(p => traco.includes(p))

export const acertouSequencia = (traco, seq) => {
  const g = golpesDe(traco)
  return g.length === seq.length && g.every((p, i) => p === seq[i])
}

// Uma batida de ataque/defesa. atacante = { combo, carga, energia, noTempo?,
// poder? }; defensor = { combo (os pontos que ele defendeu; o centro =
// esquiva), energia, poder? }. Devolve o dano no defensor (e o reflexo no
// atacante), se a vez vira e o passo a passo.
export function resolverAtaque(atacanteEntrada, defensorEntrada) {
  const atk = { ...atacanteEntrada, combo: golpesDe(atacanteEntrada.combo) }
  const def = { ...defensorEntrada, esquivou: defensorEntrada.combo.includes(ESQUIVA), combo: golpesDe(defensorEntrada.combo).filter(Boolean) }
  const r = { danoDef: 0, danoAtk: 0, bonusDef: 0, gravLevada: 0, passos: [], vira: false, poderGanhoDef: 0 }
  const poder = PODERES[def.poder]
  if (poder) {
    r.danoAtk = poder.dano
    r.passos.push({ tipo: 'poder', quem: 'def', poder: poder.id, dano: poder.dano })
    atk.combo.forEach((p, i) => r.passos.push({ tipo: 'congelado', i, quem: 'atk', ponto: p }))
    r.vira = true; r.atkEfeito = poder.efeito
    return r
  }
  const poderAtk = PODERES[atk.poder]
  if (poderAtk) {
    r.danoDef = poderAtk.dano
    r.passos.push({ tipo: 'poder', quem: 'atk', poder: poderAtk.id, dano: poderAtk.dano })
    r.defEfeito = poderAtk.efeito
    return r
  }
  // Atacante parado (não tocou golpe nenhum): perdeu o tempo, a vez vira.
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
  atk.combo.forEach((pa, i) => {
    const noTempo = !atk.noTempo || atk.noTempo[i] !== false
    const defesa = def.combo.find(pd => PONTOS[pd].membro === PONTOS[pa].membro)
    if (defesa) {
      const duro = !PONTOS[defesa].grande && PONTOS[pa].grande
      if (duro) r.danoAtk += DANO_BLOQUEIO_DURO
      r.bonusDef += BONUS_BLOQUEIO
      r.poderGanhoDef += PODER_BLOQUEIO
      r.vira = true
      r.passos.push({ tipo: 'bloqueio', i, ponto: pa, defesa, duro })
      return
    }
    const d = danoDoGolpe(atk, pa, noTempo)
    r.danoDef += d
    r.gravLevada += gravidade(pa, atk.carga)
    r.poderGanhoDef += PODER_APANHOU
    r.passos.push({ tipo: 'acerto', i, quem: 'atk', ponto: pa, dano: d, noTempo })
  })
  r.defTonto = r.gravLevada >= LIMITE_TONTO
  return r
}

// O jogador repetiu o mesmo combo REPETICOES_LIDAS vezes seguidas?
export const comboLido = (historico, combo) => {
  const g = golpesDe(combo).join()
  return g !== '' && historico.length >= REPETICOES_LIDAS - 1 && historico.slice(-(REPETICOES_LIDAS - 1)).every(h => h.join() === g)
}

// O inimigo defendendo: no começo da batida decide se defende (`defende`, a
// chance da ficha) e escolhe até `defesaMax` pontos. Com chance `leitura` ele
// aposta num membro que você usou no último ataque; senão chuta. Se você está
// repetindo o combo (já leu), ele protege exatamente os membros dele. Cego,
// chuta 1 ponto qualquer.
const PONTO_DO_MEMBRO = { cab: 'cab', bracoD: 'maoD', bracoE: 'maoE', pernaD: 'peD', pernaE: 'peE' }

export function escolherDefesaDele(ficha, { ultimoDoJogador = [], lido = false, cego = false } = {}, rnd = Math.random) {
  const membros = Object.keys(PONTO_DO_MEMBRO)
  if (cego) return [PONTO_DO_MEMBRO[membros[Math.floor(rnd() * membros.length)]]]
  if (lido) return [...new Set(ultimoDoJogador.map(p => PONTOS[p].membro))].map(m => PONTO_DO_MEMBRO[m])
  if (rnd() < (ficha.esquiva || 0)) return [ESQUIVA]
  if (rnd() >= (ficha.defende ?? 1)) return []
  const usados = [...new Set(ultimoDoJogador.map(p => PONTOS[p].membro))]
  const teto = ficha.defesaMax ?? MAX_DEFESA
  const quantos = teto > 1 && rnd() >= 0.5 ? teto : 1
  const escolhidos = new Set()
  while (escolhidos.size < quantos) {
    const m = usados.length && rnd() < (ficha.leitura || 0.2) ? usados[Math.floor(rnd() * usados.length)] : membros[Math.floor(rnd() * membros.length)]
    escolhidos.add(m)
  }
  return [...escolhidos].map(m => PONTO_DO_MEMBRO[m])
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
