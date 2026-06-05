import { create } from 'zustand'
import { createInitialState } from '../engine/gameState'

export const DUELO_VERSION = '1.1.4'
console.log(`[DUELO] versão carregada: ${DUELO_VERSION}`)

export const useDueloStore = create((set, get) => ({
  ...createInitialState(),

  // ── Ações utilitárias ──
  setState: (partial) => set(typeof partial === 'function' ? partial : partial),

  resetGame: () => set(createInitialState()),

  // ── Draw Phase ──
  drawPhase: () => {
    const state = get()
    const player = state.currentTurn === 'PLAYER'
    const deck = player ? state.playerDeck : state.aiDeck
    const hand = player ? state.playerHand : state.aiHand
    if (deck.length === 0) {
      set({ winner: player ? 'AI' : 'PLAYER', gamePhase: 'OVER', battleLog: [...state.battleLog, player ? 'Você ficou sem cartas! Derrota.' : 'IA ficou sem cartas! Vitória!'] })
      return
    }
    const [card, ...rest] = [deck[deck.length - 1], ...deck.slice(0, -1)]
    // Na verdade, draw já é pop. Vamos refazer:
    const cardDrawn = deck[deck.length - 1]
    if (!cardDrawn) return
    const newDeck = deck.slice(0, -1)
    const newHand = [...hand, cardDrawn]
    const logMsg = player ? `Você comprou: ${cardDrawn.name}` : 'IA comprou 1 carta'
    set({
      [player ? 'playerDeck' : 'aiDeck']: newDeck,
      [player ? 'playerHand' : 'aiHand']: newHand,
      gamePhase: 'MAIN',
      hasNormalSummonedThisTurn: false,
      attackedThisTurn: [],
      battleLog: [...state.battleLog, logMsg],
    })
  },

  // ── Main Phase Actions ──
  endMainPhase: () => set({ gamePhase: 'BATTLE' }),
  endBattlePhase: () => set({ gamePhase: 'END' }),

  // ── End Phase ──
  endPhase: () => {
    const state = get()
    const nextTurn = state.currentTurn === 'PLAYER' ? 'AI' : 'PLAYER'
    const nextTurnNum = nextTurn === 'PLAYER' ? state.turnNumber + 1 : state.turnNumber
    // Limpar buffs expirados
    const newBuffs = state.tempBuffs.filter(b => b.expiresOnTurn > state.turnNumber)
    set({
      gamePhase: 'DRAW',
      currentTurn: nextTurn,
      turnNumber: nextTurnNum,
      tempBuffs: newBuffs,
      hasNormalSummonedThisTurn: false,
      attackedThisTurn: [],
    })
  },

  // ── Campo ──
  placeCardInZone: (cardId, zoneType, zoneIndex, position = 'ATK', owner = 'PLAYER') => {
    const state = get()
    const handKey = owner === 'PLAYER' ? 'playerHand' : 'aiHand'
    const zoneKey = owner === 'PLAYER'
      ? (zoneType === 'MONSTER' ? 'playerMonsterZones' : 'playerSpellZones')
      : (zoneType === 'MONSTER' ? 'aiMonsterZones' : 'aiSpellZones')
    const hand = state[handKey]
    const card = hand.find(c => c.id_num === cardId)
    if (!card) return
    const newHand = hand.filter(c => c.id_num !== cardId)
    const zones = [...state[zoneKey]]
    const placedCard = { ...card, position, placedOnTurn: state.turnNumber }
    zones[zoneIndex] = placedCard
    const logMsg = owner === 'PLAYER'
      ? `Você invocou ${card.name}${card.type === 'MONSTER' ? ` (${card.atk}/${card.def})` : ''}`
      : `IA invocou ${card.name}`
    const summonTurn = { ...state.summonTurn, [card.id_num]: state.turnNumber }
    set({
      [handKey]: newHand,
      [zoneKey]: zones,
      hasNormalSummonedThisTurn: card.type === 'MONSTER' ? true : state.hasNormalSummonedThisTurn,
      battleLog: [...state.battleLog, logMsg],
      selectedCard: null,
      awaitingTribute: false,
      tributeFor: null,
      summonTurn,
    })
  },

  // ── Ataque ──
  declareAttack: (attackerZoneIndex, targetZoneIndex) => {
    const state = get()
    const isPlayerTurn = state.currentTurn === 'PLAYER'
    const attZones = isPlayerTurn ? state.playerMonsterZones : state.aiMonsterZones
    const defZones = isPlayerTurn ? state.aiMonsterZones : state.playerMonsterZones
    const attacker = attZones[attackerZoneIndex]
    const target = defZones[targetZoneIndex]

    if (!attacker || attacker.type !== 'MONSTER' || attacker.position !== 'ATK') return
    if (state.attackedThisTurn.includes(attacker.id_num)) return
    // Summoning sickness
    if ((state.summonTurn[attacker.id_num] || 0) >= state.turnNumber) return

    const getAtk = (card) => {
      const buff = state.tempBuffs.find(b => b.cardId === card.id_num)
      return (card.atk || 0) + (buff?.atkBonus || 0)
    }

    const attAtk = getAtk(attacker)
    const defVal = target ? (target.position === 'ATK' ? target.atk : target.def) : null
    const isDirect = !target

    let log = ''
    let newAttZones = [...attZones]
    let newDefZones = [...defZones]
    let playerLP = state.playerLP
    let aiLP = state.aiLP
    let newGraveyard = [...(isPlayerTurn ? state.aiGraveyard : state.playerGraveyard)]
    let newAttGraveyard = [...(isPlayerTurn ? state.playerGraveyard : state.aiGraveyard)]

    if (isDirect) {
      const dmg = attAtk
      if (isPlayerTurn) aiLP = Math.max(0, aiLP - dmg)
      else playerLP = Math.max(0, playerLP - dmg)
      log = `${attacker.name} atacou diretamente! ${dmg} de dano.`
    } else if (target.position === 'ATK') {
      if (attAtk > target.atk) {
        newDefZones[targetZoneIndex] = null
        newGraveyard.push(target)
        const diff = attAtk - target.atk
        if (isPlayerTurn) aiLP = Math.max(0, aiLP - diff)
        else playerLP = Math.max(0, playerLP - diff)
        log = `${attacker.name} (${attAtk}) destruiu ${target.name} (${target.atk})! ${diff} de dano.`
      } else if (attAtk < target.atk) {
        newAttZones[attackerZoneIndex] = null
        newAttGraveyard.push(attacker)
        const diff = target.atk - attAtk
        if (isPlayerTurn) playerLP = Math.max(0, playerLP - diff)
        else aiLP = Math.max(0, aiLP - diff)
        log = `${attacker.name} (${attAtk}) foi destruído por ${target.name} (${target.atk})! ${diff} de dano.`
      } else {
        newAttZones[attackerZoneIndex] = null
        newDefZones[targetZoneIndex] = null
        newAttGraveyard.push(attacker)
        newGraveyard.push(target)
        log = `${attacker.name} e ${target.name} se destruíram!`
      }
    } else {
      // target in DEF position
      if (attAtk > target.def) {
        newDefZones[targetZoneIndex] = null
        newGraveyard.push(target)
        log = `${attacker.name} (${attAtk}) destruiu ${target.name} (DEF ${target.def}).`
      } else if (attAtk < target.def) {
        const diff = target.def - attAtk
        if (isPlayerTurn) playerLP = Math.max(0, playerLP - diff)
        else aiLP = Math.max(0, aiLP - diff)
        log = `${attacker.name} não superou a defesa de ${target.name}. ${diff} de dano ao dono.`
      } else {
        log = `${attacker.name} e ${target.name} empataram em ATK/DEF. Nada acontece.`
      }
    }

    const winner = aiLP <= 0 ? 'PLAYER' : playerLP <= 0 ? 'AI' : null

    set({
      [isPlayerTurn ? 'playerMonsterZones' : 'aiMonsterZones']: newAttZones,
      [isPlayerTurn ? 'aiMonsterZones' : 'playerMonsterZones']: newDefZones,
      [isPlayerTurn ? 'aiGraveyard' : 'playerGraveyard']: newGraveyard,
      [isPlayerTurn ? 'playerGraveyard' : 'aiGraveyard']: newAttGraveyard,
      playerLP,
      aiLP,
      attackedThisTurn: [...state.attackedThisTurn, attacker.id_num],
      battleLog: [...state.battleLog, log],
      gamePhase: winner ? 'OVER' : state.gamePhase,
      winner,
    })
  },

  // ── Ativar Magia/Ar madi lha ──
  activateEffect: (card, caster = 'PLAYER') => {
    const state = get()
    // Remove da mão ou zona
    let newHand = caster === 'PLAYER' ? [...state.playerHand] : [...state.aiHand]
    newHand = newHand.filter(c => c.id_num !== card.id_num)
    const graveKey = caster === 'PLAYER' ? 'playerGraveyard' : 'aiGraveyard'

    let playerLP = state.playerLP, aiLP = state.aiLP
    let log = ''
    let newBuffs = [...state.tempBuffs]

    switch (card.effect) {
      case 'HEAL':
        if (caster === 'PLAYER') playerLP += card.effectValue
        else aiLP += card.effectValue
        log = `${caster === 'PLAYER' ? 'Você' : 'IA'} usou ${card.name}. +${card.effectValue} LP.`
        break
      case 'BURN':
        if (caster === 'PLAYER') aiLP = Math.max(0, aiLP - card.effectValue)
        else playerLP = Math.max(0, playerLP - card.effectValue)
        log = `${caster === 'PLAYER' ? 'Você' : 'IA'} usou ${card.name}. ${card.effectValue} de dano!`
        break
      case 'ATK_BOOST': {
        const target = caster === 'PLAYER' ? state.playerMonsterZones : state.aiMonsterZones
        const monster = target.find(m => m)
        if (monster) {
          newBuffs.push({ cardId: monster.id_num, atkBonus: card.effectValue, expiresOnTurn: state.turnNumber + 1 })
          log = `${card.name}: ${monster.name} ganha +${card.effectValue} ATK até o fim do turno.`
        }
        break
      }
      case 'DRAW': {
        const deckKey = caster === 'PLAYER' ? 'playerDeck' : 'aiDeck'
        const deck = [...state[deckKey]]
        const drawn = []
        for (let i = 0; i < card.effectValue && deck.length > 0; i++) {
          drawn.push(deck.pop())
        }
        const hand = caster === 'PLAYER' ? [...state.playerHand, ...drawn] : [...state.aiHand, ...drawn]
        set({ [deckKey]: deck, [caster === 'PLAYER' ? 'playerHand' : 'aiHand']: hand })
        log = `${caster === 'PLAYER' ? 'Você' : 'IA'} usou ${card.name}. +${drawn.length} cartas.`
        break
      }
      case 'DESTROY_MONSTER': {
        const enemyZones = caster === 'PLAYER' ? [...state.aiMonsterZones] : [...state.playerMonsterZones]
        const targetIdx = enemyZones.findIndex(m => m)
        if (targetIdx >= 0) {
          const destroyed = enemyZones[targetIdx]
          enemyZones[targetIdx] = null
          const enemyGrave = caster === 'PLAYER' ? [...state.aiGraveyard, destroyed] : [...state.playerGraveyard, destroyed]
          const zoneKey = caster === 'PLAYER' ? 'aiMonsterZones' : 'playerMonsterZones'
          const graveKey2 = caster === 'PLAYER' ? 'aiGraveyard' : 'playerGraveyard'
          set({ [zoneKey]: enemyZones, [graveKey2]: enemyGrave })
          log = `${card.name}: ${destroyed.name} foi destruído!`
        }
        break
      }
      case 'NEGATE_ATTACK':
        log = `${card.name}: ataque negado!`
        break
      case 'DESTROY_ATTACKER': {
        const attackerZones = caster === 'PLAYER' ? [...state.aiMonsterZones] : [...state.playerMonsterZones]
        // Encontrar o atacante (último monstro que atacou)
        const attIdx = attackerZones.findIndex(m => m && m.position === 'ATK')
        if (attIdx >= 0) {
          const destroyed = attackerZones[attIdx]
          attackerZones[attIdx] = null
          const graveKey3 = caster === 'PLAYER' ? 'aiGraveyard' : 'playerGraveyard'
          set({ [caster === 'PLAYER' ? 'aiMonsterZones' : 'playerMonsterZones']: attackerZones, [graveKey3]: [...state[graveKey3], destroyed] })
          log = `${card.name}: ${destroyed.name} foi destruído ao atacar!`
        }
        break
      }
      case 'REDUCE_ATK': {
        const enemyZones = caster === 'PLAYER' ? state.aiMonsterZones : state.playerMonsterZones
        const target = enemyZones.find(m => m)
        if (target) {
          newBuffs.push({ cardId: target.id_num, atkBonus: -card.effectValue, expiresOnTurn: state.turnNumber + 1 })
          log = `${card.name}: ${target.name} perde ${card.effectValue} ATK por 1 turno.`
        }
        break
      }
      default:
        log = `${card.name} foi ativado.`
    }

    const winner = aiLP <= 0 ? 'PLAYER' : playerLP <= 0 ? 'AI' : null
    set({
      [caster === 'PLAYER' ? 'playerHand' : 'aiHand']: newHand,
      [graveKey]: [...state[graveKey], card],
      playerLP, aiLP,
      tempBuffs: newBuffs,
      battleLog: [...state.battleLog, log],
      gamePhase: winner ? 'OVER' : state.gamePhase,
      winner,
    })
  },
}))
