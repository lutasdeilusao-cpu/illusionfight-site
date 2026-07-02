import { useReducer, useEffect, useCallback } from 'react'
import { buildAttrCards, EFFECT_CARDS, EQUIP_CARDS } from '../data/cards'
import { TERRAIN_CARDS } from '../data/terrain'

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════

const AI_IDX = 1
const HAND_LIMIT = 5
const FIELD_SIZE = 6
const CARDS_PER_TURN = 2

// ═══════════════════════════════════════════
//  PURE HELPERS (exportados para teste)
// ═══════════════════════════════════════════

export function roll20() { return Math.floor(Math.random() * 20) + 1 }

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function calcAtkPower(selection) {
  return selection.reduce((acc, s) => {
    if (s.role === 'atk' && s.card.bonus) return acc + s.card.bonus
    return acc
  }, 0)
}

export function calcDefPower(defSel, atkSel) {
  let total = 0
  defSel.forEach(d => {
    if (d.role !== 'def') return
    const attr = d.card.attr
    const matches = atkSel.some(a => {
      if (attr === 'protecao'   && a.card.attr === 'precisao')  return true
      if (attr === 'camuflagem' && a.card.attr === 'visao')     return true
      return false
    })
    if (matches) total += d.card.bonus || 0
  })
  return total
}

export function getTerrainMods(terrain, terrain_mods, terrain_contra_sol, playerIdx) {
  const mods = { precisao: 0, visao: 0, protecao: 0, camuflagem: 0, anula_visao: false, anula_protecao: false }
  if (!terrain || !terrain_mods) return mods
  const tm = terrain_mods

  if (tm.precisao)   mods.precisao   += tm.precisao
  if (tm.visao)      mods.visao      += tm.visao
  if (tm.protecao)   mods.protecao   += tm.protecao
  if (tm.camuflagem) mods.camuflagem += tm.camuflagem
  if (tm.anula_visao)    mods.anula_visao    = true
  if (tm.anula_protecao) mods.anula_protecao = true

  if (tm.contra_sol !== undefined) {
    const unfavoured = terrain_contra_sol
    if (playerIdx === unfavoured) {
      mods.visao      -= 1
      mods.camuflagem -= 1
    } else {
      mods.visao      += 1
      mods.camuflagem += 1
    }
  }

  return mods
}

export function calcAtkWithTerrain(atkSel, attackerIdx, terrain, terrain_mods, terrain_contra_sol) {
  const mods = getTerrainMods(terrain, terrain_mods, terrain_contra_sol, attackerIdx)
  let precisaoCards = 0, visaoCards = 0

  atkSel.forEach(s => {
    if (s.role !== 'atk') return
    if (s.card.attr === 'precisao') precisaoCards += s.card.bonus || 0
    if (s.card.attr === 'visao')    visaoCards    += s.card.bonus || 0
  })

  const finalPrecisao = precisaoCards + mods.precisao
  const finalVisao    = mods.anula_visao ? 0 : (visaoCards + mods.visao)
  const total = finalPrecisao + finalVisao

  return { total, finalPrecisao, finalVisao, precisaoCards, visaoCards, mods }
}

export function calcDefWithTerrain(defSel, atkSel, defenderIdx, terrain, terrain_mods, terrain_contra_sol) {
  const mods = getTerrainMods(terrain, terrain_mods, terrain_contra_sol, defenderIdx)
  let protecaoCards = 0, camuflageCards = 0

  const hasPrecisao = atkSel.some(s => s.card && s.card.attr === 'precisao')
  const hasVisao    = atkSel.some(s => s.card && s.card.attr === 'visao')

  defSel.forEach(s => {
    if (s.role !== 'def') return
    if (s.card.attr === 'protecao'   && hasPrecisao) protecaoCards  += s.card.bonus || 0
    if (s.card.attr === 'camuflagem' && hasVisao)    camuflageCards += s.card.bonus || 0
  })

  const finalProtecao   = mods.anula_protecao ? 0 : (protecaoCards  + (hasPrecisao ? mods.protecao   : 0))
  const finalCamuflagem = camuflageCards + (hasVisao ? mods.camuflagem : 0)
  const total = finalProtecao + finalCamuflagem

  return { total, finalProtecao, finalCamuflagem, protecaoCards, camuflageCards, mods }
}

export function terrainInfoLine(terrain, terrain_mods, terrain_contra_sol, playerIdx) {
  if (!terrain) return ''
  const mods = getTerrainMods(terrain, terrain_mods, terrain_contra_sol, playerIdx)
  const parts = []
  if (mods.precisao)    parts.push(`Precisão ${mods.precisao > 0 ? '+' : ''}${mods.precisao}`)
  if (mods.visao)       parts.push(`Visão ${mods.visao > 0 ? '+' : ''}${mods.visao}`)
  if (mods.protecao)    parts.push(`Proteção ${mods.protecao > 0 ? '+' : ''}${mods.protecao}`)
  if (mods.camuflagem)  parts.push(`Camuflagem ${mods.camuflagem > 0 ? '+' : ''}${mods.camuflagem}`)
  if (mods.anula_visao)    parts.push('Scan anulado')
  if (mods.anula_protecao) parts.push('Blindagem anulada')
  if (parts.length === 0) return ''
  return `${terrain.icon} ${terrain.name}: ${parts.join(', ')}`
}

export function isAITurn(mode, currentPlayer) {
  return (mode === 'solo-easy' || mode === 'solo-medium') && currentPlayer === AI_IDX
}

// ═══════════════════════════════════════════
//  INITIAL STATE
// ═══════════════════════════════════════════

function freshPlayer() {
  return { hand: [], field: Array(FIELD_SIZE).fill(null), perigo: 0, disabledSlots: {} }
}

function buildDeck() {
  return shuffle([...buildAttrCards(), ...EFFECT_CARDS, ...EQUIP_CARDS])
}

function buildTerrainDeck() {
  return shuffle([...TERRAIN_CARDS])
}

function dealCardTo(state, p) {
  if (state.deck.length === 0) {
    state.deck = shuffle([...state.cemetery])
    state.cemetery = []
  }
  if (state.deck.length === 0) return
  state.players[p].hand.push(state.deck.pop())
}

function initDeal(state) {
  for (let p = 0; p < 2; p++) {
    for (let i = 0; i < 5; i++) dealCardTo(state, p)
  }
}

function freshGame(mode) {
  const state = {
    mode,
    deck: buildDeck(),
    terrainDeck: buildTerrainDeck(),
    terrainDeckIdx: 0,
    cemetery: [],
    round: 1,
    currentPlayer: 0,
    drawnThisTurn: false,
    cardsPlayedThisTurn: 0,
    shotFiredThisTurn: false,
    terrain: null,
    terrain_mods: {},
    terrain_rounds_left: 0,
    terrain_contra_sol: -1,
    players: [freshPlayer(), freshPlayer()],
    shotContext: null,
    gameOver: false,
    winner: null,
    log: [],
  }

  const r0 = roll20(), r1 = roll20()
  state.currentPlayer = r0 >= r1 ? 0 : 1
  initDeal(state)
  return state
}

// ═══════════════════════════════════════════
//  PURE TERRAIN EFFECT APPLICATOR
// ═══════════════════════════════════════════

function applyTerrainEffect(terrainCard) {
  const result = terrainCard.effect()
  return {
    terrain: terrainCard,
    terrain_rounds_left: 3,
    terrain_mods: result.terrain_mods || {},
    terrain_contra_sol: result.terrain_contra_sol !== undefined ? result.terrain_contra_sol : -1,
  }
}

// ═══════════════════════════════════════════
//  PURE TURN / TERRAIN ADVANCE
// ═══════════════════════════════════════════

function advanceTurnState(state) {
  const next = 1 - state.currentPlayer
  let s = { ...state, currentPlayer: next, drawnThisTurn: false, cardsPlayedThisTurn: 0, shotFiredThisTurn: false }

  if (next === 0) {
    s = { ...s, round: s.round + 1 }

    if (s.round > 3) {
      const rate = s.terrain_mods?.perigo_rate || 1
      s.players = s.players.map(plr => ({ ...plr, perigo: Math.max(0, plr.perigo + rate) }))
    }

    if (s.round >= 3) {
      if (s.terrain) {
        s = { ...s, terrain_rounds_left: s.terrain_rounds_left - 1 }
        if (s.terrain_rounds_left <= 0) {
          s = { ...s, terrain: null, terrain_mods: {}, terrain_contra_sol: -1 }
          const nextCard = drawNextTerrainCard(s)
          s = { ...s, ...nextCard }
        }
      } else {
        const nextCard = drawNextTerrainCard(s)
        s = { ...s, ...nextCard }
      }
    }
  }

  return s
}

function drawNextTerrainCard(state) {
  let deck = [...state.terrainDeck]
  let idx = state.terrainDeckIdx
  if (idx >= deck.length) {
    deck = shuffle([...TERRAIN_CARDS])
    idx = 0
  }
  const card = deck[idx]
  return { terrainDeck: deck, terrainDeckIdx: idx + 1, ...applyTerrainEffect(card) }
}

// ═══════════════════════════════════════════
//  PURE SHOT RESOLUTION
// ═══════════════════════════════════════════

function resolveShotState(state, defSel) {
  const p = state.shotContext.attacker
  const opp = 1 - p
  const atkSel = state.shotContext.atkSelection || []

  const defenderField = state.players[opp].field
  const alvoFalsoSlot = defenderField.findIndex(c => c && c.id && c.id.startsWith('alvo_falso'))
  const hasAlvoFalso = alvoFalsoSlot !== -1

  const atkResult = calcAtkWithTerrain(atkSel, p, state.terrain, state.terrain_mods, state.terrain_contra_sol)
  const defResult = calcDefWithTerrain(defSel, atkSel, opp, state.terrain, state.terrain_mods, state.terrain_contra_sol)

  const atk = atkResult.total
  const def = defResult.total
  const net = atk - def
  const perigoDefender = state.players[opp].perigo
  const target = Math.max(net, 0) + perigoDefender
  const rolled = roll20()
  const hit = rolled !== 20 && rolled <= target

  const perigoSpike = state.shotContext?._secondShot ? 4 : 8
  let terrainExtra = state.terrain_mods?.perigo_after_shot || 0

  let newPlayers = state.players.map(plr => ({ ...plr, hand: [...plr.hand], field: [...plr.field] }))
  newPlayers[p] = { ...newPlayers[p], perigo: Math.max(0, newPlayers[p].perigo + perigoSpike) }
  if (terrainExtra !== 0) {
    newPlayers[p].perigo = Math.max(0, newPlayers[p].perigo + terrainExtra)
  }

  const allSel = [...atkSel, ...defSel]
  let cemetery = [...state.cemetery]
  allSel.forEach(s => {
    const owner = s.role === 'atk' || (s.role === 'efx' && s.card.trigger === 'on_own_miss') ? p : opp
    newPlayers[owner].field[s.slotIdx] = null
    cemetery.push(s.card)
  })

  let gameOver = false
  let winner = null
  let savedByAlvo = false

  if (hit) {
    if (hasAlvoFalso) {
      newPlayers[opp].field[alvoFalsoSlot] = null
      cemetery.push(defenderField[alvoFalsoSlot])
      savedByAlvo = true
    } else {
      gameOver = true
      winner = p
    }
  }

  const missReaction = !hit && !state.shotContext?._wasSecondShot

  return {
    ...state,
    players: newPlayers,
    cemetery,
    shotFiredThisTurn: true,
    gameOver,
    winner,
    _shotResult: { lethal: hit && !hasAlvoFalso, savedByAlvo, rolled, atk, def, perigoDefender, target, attacker: p, missReaction },
  }
}

// ═══════════════════════════════════════════
//  PURE AI FUNCTIONS
// ═══════════════════════════════════════════

function aiEasyTurn(baseState) {
  let s = { ...baseState, players: baseState.players.map(plr => ({ ...plr, hand: [...plr.hand], field: [...plr.field] })) }

  s.drawnThisTurn = true
  dealCardTo(s, AI_IDX)

  let placed = 0
  while (placed < 2 && s.players[AI_IDX].hand.length > 0) {
    const emptySlot = s.players[AI_IDX].field.findIndex((slot, i) => !slot && !(s.players[AI_IDX].disabledSlots[i] > s.round))
    if (emptySlot === -1) break
    const randIdx = Math.floor(Math.random() * s.players[AI_IDX].hand.length)
    s.players[AI_IDX].field[emptySlot] = s.players[AI_IDX].hand.splice(randIdx, 1)[0]
    placed++
  }

  if (s.players[AI_IDX].cardsPlayedThisTurn !== undefined) {
    s.cardsPlayedThisTurn = (s.cardsPlayedThisTurn || 0) + placed
  }

  const equipSlot = s.players[AI_IDX].field.findIndex(c => c && c.type === 'eqp')
  if (equipSlot !== -1 && Math.random() < 0.5) {
    const card = s.players[AI_IDX].field[equipSlot]
    const opp = 1 - AI_IDX
    if (card.id.startsWith('sabotagem')) {
      const oppSlot = s.players[opp].field.findIndex(Boolean)
      if (oppSlot !== -1) {
        s.cemetery = [...s.cemetery, s.players[opp].field[oppSlot], card]
        s.players[opp].field[oppSlot] = null
        s.players[AI_IDX].field[equipSlot] = null
      }
    } else if (card.id.startsWith('informante')) {
      if (s.players[AI_IDX].hand.length < HAND_LIMIT) {
        const oppSlot = s.players[opp].field.findIndex(Boolean)
        if (oppSlot !== -1) {
          s.players[AI_IDX].hand.push(s.players[opp].field[oppSlot])
          s.players[opp].field[oppSlot] = null
          s.cemetery = [...s.cemetery, card]
          s.players[AI_IDX].field[equipSlot] = null
        }
      }
    } else if (card.id.startsWith('emboscada')) {
      s.players[opp].perigo += 3
      s.players[AI_IDX].perigo   += 1
      s.cemetery = [...s.cemetery, card]
      s.players[AI_IDX].field[equipSlot] = null
    } else if (card.id.startsWith('campo_minado')) {
      const oppEmpty = s.players[opp].field.findIndex((sl, idx) => !sl && !(s.players[opp].disabledSlots[idx] > s.round))
      if (oppEmpty !== -1) {
        s.players[opp].disabledSlots = { ...s.players[opp].disabledSlots, [oppEmpty]: s.round + 5 }
        s.cemetery = [...s.cemetery, card]
        s.players[AI_IDX].field[equipSlot] = null
      }
    } else if (card.id.startsWith('intel')) {
      s.cemetery = [...s.cemetery, card]
      s.players[AI_IDX].field[equipSlot] = null
    }
  }

  const hasAtk = s.players[AI_IDX].field.some(c => c && c.kind === 'atk')
  if (hasAtk && s.round >= 4 && !s.shotFiredThisTurn) {
    const atkSel = []
    s.players[AI_IDX].field.forEach((c, i) => {
      if (c && c.kind === 'atk') atkSel.push({ key: `atk_${i}`, card: c, slotIdx: i, role: 'atk' })
    })
    s.shotContext = { attacker: AI_IDX, atkSelection: atkSel, atkPower: calcAtkPower(atkSel) }
    return s
  }

  return advanceTurnState(s)
}

function aiMediumTurn(baseState) {
  let s = { ...baseState, players: baseState.players.map(plr => ({ ...plr, hand: [...plr.hand], field: [...plr.field] })) }

  s.drawnThisTurn = true
  dealCardTo(s, AI_IDX)

  while (s.players[AI_IDX].hand.length < 5 && s.players[AI_IDX].perigo < 6) {
    s.players[AI_IDX].perigo += 1
    dealCardTo(s, AI_IDX)
  }

  const handSorted = s.players[AI_IDX].hand.map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const scoreA = (a.c.kind === 'atk' ? 10 : a.c.kind === 'def' ? 5 : 3) + (a.c.bonus || 0)
      const scoreB = (b.c.kind === 'atk' ? 10 : b.c.kind === 'def' ? 5 : 3) + (b.c.bonus || 0)
      return scoreB - scoreA
    })

  let placed = 0
  for (const { c } of handSorted) {
    if (placed >= 2) break
    const emptySlot = s.players[AI_IDX].field.findIndex((sl, idx) => !sl && !(s.players[AI_IDX].disabledSlots[idx] > s.round))
    if (emptySlot === -1) break
    const currentIdx = s.players[AI_IDX].hand.findIndex(h => h === c)
    if (currentIdx === -1) continue
    s.players[AI_IDX].field[emptySlot] = s.players[AI_IDX].hand.splice(currentIdx, 1)[0]
    placed++
  }

  const opp = s.players[0]
  const equipSlot = s.players[AI_IDX].field.findIndex(c => c && c.type === 'eqp')
  if (equipSlot !== -1) {
    const eq = s.players[AI_IDX].field[equipSlot]
    const shouldUse = eq.id.startsWith('emboscada') ? opp.perigo < 5
      : eq.id.startsWith('sabotagem') ? opp.field.filter(Boolean).length >= 3
      : eq.id.startsWith('informante') ? opp.field.filter(Boolean).length >= 2
      : eq.id.startsWith('intel') ? opp.hand.length >= 2
      : eq.id.startsWith('campo_minado') ? s.round <= 5
      : false
    if (shouldUse) {
      const card = eq
      if (card.id.startsWith('sabotagem')) {
        const oppSlot = s.players[opp].field.findIndex(Boolean)
        if (oppSlot !== -1) {
          s.cemetery = [...s.cemetery, s.players[opp].field[oppSlot], card]
          s.players[opp].field[oppSlot] = null
          s.players[AI_IDX].field[equipSlot] = null
        }
      } else if (card.id.startsWith('informante')) {
        if (s.players[AI_IDX].hand.length < HAND_LIMIT) {
          const oppSlot = s.players[opp].field.findIndex(Boolean)
          if (oppSlot !== -1) {
            s.players[AI_IDX].hand.push(s.players[opp].field[oppSlot])
            s.players[opp].field[oppSlot] = null
            s.cemetery = [...s.cemetery, card]
            s.players[AI_IDX].field[equipSlot] = null
          }
        }
      } else if (card.id.startsWith('emboscada')) {
        s.players[opp].perigo += 3
        s.players[AI_IDX].perigo   += 1
        s.cemetery = [...s.cemetery, card]
        s.players[AI_IDX].field[equipSlot] = null
      } else if (card.id.startsWith('campo_minado')) {
        const oppEmpty = s.players[opp].field.findIndex((sl, idx) => !sl && !(s.players[opp].disabledSlots[idx] > s.round))
        if (oppEmpty !== -1) {
          s.players[opp].disabledSlots = { ...s.players[opp].disabledSlots, [oppEmpty]: s.round + 5 }
          s.cemetery = [...s.cemetery, card]
          s.players[AI_IDX].field[equipSlot] = null
        }
      } else if (card.id.startsWith('intel')) {
        s.cemetery = [...s.cemetery, card]
        s.players[AI_IDX].field[equipSlot] = null
      }
    }
  }

  if (s.round >= 4 && !s.shotFiredThisTurn) {
    const atkCards = s.players[AI_IDX].field.filter(c => c && c.kind === 'atk')
    const totalAtk = atkCards.reduce((sum, c) => sum + (c.bonus || 0), 0)
    const estimatedDef = 2
    const target = Math.max(totalAtk - estimatedDef, 0) + opp.perigo
    const successChance = Math.min(target, 19) / 20
    if ((successChance >= 0.35 || s.players[AI_IDX].perigo >= 10) && atkCards.length > 0) {
      const atkSel = []
      s.players[AI_IDX].field.forEach((c, i) => {
        if (c && c.kind === 'atk') atkSel.push({ key: `atk_${i}`, card: c, slotIdx: i, role: 'atk' })
      })
      s.shotContext = { attacker: AI_IDX, atkSelection: atkSel, atkPower: calcAtkPower(atkSel) }
      return s
    }
  }

  return advanceTurnState(s)
}

function aiChooseDefensePure(atkSel, state) {
  const pl = state.players[AI_IDX]

  if (state.mode === 'solo-easy') {
    const defCards = []
    pl.field.forEach((c, i) => {
      if (c && c.kind === 'def' && Math.random() > 0.4) {
        defCards.push({ key: `def_${i}`, card: c, slotIdx: i, role: 'def' })
      }
    })
    return defCards
  }

  const defCards = []
  const hasPrecisao = atkSel.some(s => s.card.attr === 'precisao')
  const hasVisao    = atkSel.some(s => s.card.attr === 'visao')

  pl.field.forEach((c, i) => {
    if (!c || c.kind !== 'def') return
    if (c.attr === 'protecao'   && hasPrecisao) defCards.push({ key: `def_${i}`, card: c, slotIdx: i, role: 'def' })
    if (c.attr === 'camuflagem' && hasVisao)    defCards.push({ key: `def_${i}`, card: c, slotIdx: i, role: 'def' })
  })

  pl.field.forEach((c, i) => {
    if (c && c.kind === 'efx' && c.trigger === 'on_hit_defend') {
      defCards.push({ key: `efx_${i}`, card: c, slotIdx: i, role: 'efx' })
    }
  })

  return defCards
}

function aiReactionPure(state) {
  if (state.mode === 'solo-easy') return null
  const pl = state.players[AI_IDX]
  const reactionCard = pl.field.map((c, i) => ({ c, i }))
    .find(({ c }) => c && c.type === 'efx' && c.trigger === 'on_own_miss')
  if (!reactionCard) return null
  const oppPerigo = state.players[1 - AI_IDX].perigo
  return oppPerigo >= 5 ? reactionCard : null
}

// ═══════════════════════════════════════════
//  REDUCER
// ═══════════════════════════════════════════

export const ACTION_TYPES = {
  INIT_GAME: 'INIT_GAME',
  DRAW_CARD: 'DRAW_CARD',
  PLAY_TO_FIELD: 'PLAY_TO_FIELD',
  ACTIVATE_EQUIP: 'ACTIVATE_EQUIP',
  ADVANCE_TURN: 'ADVANCE_TURN',
  CONFIRM_SHOT: 'CONFIRM_SHOT',
  RESOLVE_SHOT: 'RESOLVE_SHOT',
  ACTIVATE_REACTION: 'ACTIVATE_REACTION',
  AI_TURN: 'AI_TURN',
  AI_DEFENSE: 'AI_DEFENSE',
  RESET: 'RESET',
}

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.INIT_GAME:
      return freshGame(action.mode)

    case ACTION_TYPES.DRAW_CARD: {
      const p = action.playerIdx
      if (state.currentPlayer !== p) return state
      const pl = state.players[p]
      if (pl.hand.length >= HAND_LIMIT) return state

      const isFree = !state.drawnThisTurn
      const perigoCost = isFree ? 0 : 1

      const newPlayers = state.players.map((plr, i) => {
        if (i !== p) return plr
        return { ...plr, perigo: isFree ? plr.perigo : plr.perigo + perigoCost, hand: [...plr.hand] }
      })

      const s = { ...state, players: newPlayers, drawnThisTurn: true }
      dealCardTo(s, p)
      return s
    }

    case ACTION_TYPES.PLAY_TO_FIELD: {
      const p = action.playerIdx
      const handIdx = action.handIdx
      if (state.currentPlayer !== p) return state
      if (state.cardsPlayedThisTurn >= CARDS_PER_TURN) return state

      const pl = state.players[p]
      const card = pl.hand[handIdx]
      if (!card) return state

      const emptySlot = pl.field.findIndex((s, i) => !s && !(pl.disabledSlots[i] > state.round))
      if (emptySlot === -1) return state

      const newPlayers = state.players.map((plr, i) => {
        if (i !== p) return plr
        const newHand = [...plr.hand]
        newHand.splice(handIdx, 1)
        const newField = [...plr.field]
        newField[emptySlot] = card
        return { ...plr, hand: newHand, field: newField }
      })

      return { ...state, players: newPlayers, cardsPlayedThisTurn: state.cardsPlayedThisTurn + 1 }
    }

    case ACTION_TYPES.ACTIVATE_EQUIP: {
      const p = action.playerIdx
      const slotIdx = action.slotIdx
      if (state.currentPlayer !== p) return state
      const card = state.players[p].field[slotIdx]
      if (!card || card.type !== 'eqp') return state
      const opp = 1 - p

      let s = { ...state, players: state.players.map(plr => ({ ...plr, hand: [...plr.hand], field: [...plr.field] })) }
      s.cemetery = [...s.cemetery]

      if (card.id.startsWith('sabotagem')) {
        const oppSlot = s.players[opp].field.findIndex(Boolean)
        if (oppSlot === -1) return state
        const destroyed = s.players[opp].field[oppSlot]
        s.players[opp].field[oppSlot] = null
        s.cemetery.push(destroyed, card)
        s.players[p].field[slotIdx] = null
      } else if (card.id.startsWith('informante')) {
        if (s.players[p].hand.length >= HAND_LIMIT) return state
        const oppSlot = s.players[opp].field.findIndex(Boolean)
        if (oppSlot === -1) return state
        const stolen = s.players[opp].field[oppSlot]
        s.players[opp].field[oppSlot] = null
        s.players[p].hand.push(stolen)
        s.players[p].field[slotIdx] = null
        s.cemetery.push(card)
      } else if (card.id.startsWith('emboscada')) {
        s.players[opp].perigo += 3
        s.players[p].perigo   += 1
        s.players[p].field[slotIdx] = null
        s.cemetery.push(card)
      } else if (card.id.startsWith('campo_minado')) {
        const oppEmpty = s.players[opp].field.findIndex((sl, idx) => !sl && !(s.players[opp].disabledSlots[idx] > s.round))
        if (oppEmpty === -1) return state
        s.players[opp].disabledSlots = { ...s.players[opp].disabledSlots, [oppEmpty]: s.round + 5 }
        s.players[p].field[slotIdx] = null
        s.cemetery.push(card)
      } else if (card.id.startsWith('intel')) {
        s.players[p].field[slotIdx] = null
        s.cemetery.push(card)
        s._intelResult = [...s.players[opp].hand].sort(() => Math.random() - 0.5).slice(0, 2)
      }

      return s
    }

    case ACTION_TYPES.ADVANCE_TURN:
      return advanceTurnState(state)

    case ACTION_TYPES.CONFIRM_SHOT:
      return { ...state, shotContext: { attacker: action.playerIdx, atkSelection: action.selection, atkPower: calcAtkPower(action.selection) } }

    case ACTION_TYPES.RESOLVE_SHOT:
      return resolveShotState(state, action.defSel || [])

    case ACTION_TYPES.ACTIVATE_REACTION: {
      const { playerIdx, card, slotIdx } = action
      const newPlayers = state.players.map((plr, i) => {
        if (i !== playerIdx) return plr
        const newField = [...plr.field]
        newField[slotIdx] = null
        return { ...plr, field: newField }
      })
      return { ...state, players: newPlayers, cemetery: [...state.cemetery, card], _reactionActivated: card }
    }

    case ACTION_TYPES.AI_TURN: {
      if (action.mode === 'solo-easy') return aiEasyTurn(state)
      return aiMediumTurn(state)
    }

    case ACTION_TYPES.AI_DEFENSE: {
      const defSel = aiChooseDefensePure(action.atkSel, state)
      return resolveShotState(state, defSel)
    }

    case ACTION_TYPES.RESET:
      return freshGame(state.mode)

    default:
      return state
  }
}

// ═══════════════════════════════════════════
//  HOOK
// ═══════════════════════════════════════════

export function useKernelPanicEngine() {
  const [state, dispatch] = useReducer(reducer, null, () => freshGame('local'))

  useEffect(() => {
    if (isAITurn(state.mode, state.currentPlayer) && !state.gameOver) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTION_TYPES.AI_TURN, mode: state.mode })
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [state.currentPlayer, state.round, state.mode, state.gameOver])

  const initGame = useCallback((mode) => { dispatch({ type: ACTION_TYPES.INIT_GAME, mode }) }, [])
  const drawCard = useCallback((playerIdx) => { dispatch({ type: ACTION_TYPES.DRAW_CARD, playerIdx }) }, [])
  const playToField = useCallback((playerIdx, handIdx) => { dispatch({ type: ACTION_TYPES.PLAY_TO_FIELD, playerIdx, handIdx }) }, [])
  const activateEquip = useCallback((playerIdx, slotIdx) => { dispatch({ type: ACTION_TYPES.ACTIVATE_EQUIP, playerIdx, slotIdx }) }, [])
  const advanceTurn = useCallback(() => { dispatch({ type: ACTION_TYPES.ADVANCE_TURN }) }, [])
  const confirmShot = useCallback((playerIdx, selection) => { dispatch({ type: ACTION_TYPES.CONFIRM_SHOT, playerIdx, selection }) }, [])
  const resolveShot = useCallback((defSel) => { dispatch({ type: ACTION_TYPES.RESOLVE_SHOT, defSel }) }, [])
  const activateReaction = useCallback((playerIdx, card, slotIdx) => { dispatch({ type: ACTION_TYPES.ACTIVATE_REACTION, playerIdx, card, slotIdx }) }, [])
  const reset = useCallback(() => { dispatch({ type: ACTION_TYPES.RESET }) }, [])

  return {
    state,
    actions: { initGame, drawCard, playToField, activateEquip, advanceTurn, confirmShot, resolveShot, activateReaction, reset },
  }
}

// Re-export pure functions for testing
export { aiEasyTurn, aiMediumTurn, aiChooseDefensePure as aiChooseDefense, aiReactionPure as aiReaction }
