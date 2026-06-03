import { create } from 'zustand'
import { calcFA, calcFD, calcDamage, calcInitiative } from '../engine/combat'

export const useCombatStore = create((set, get) => ({
  active: false,
  enemy: null,
  playerMode: 'fists',
  turn: 1,
  log: [],
  playerStatuses: [],
  enemyStatuses: [],
  powersUsed: 0,

  startCombat: (enemy, sheet) => {
    if (!sheet) return
    const playerInit = calcInitiative(sheet)
    const enemyInit = calcInitiative({ attributes: enemy.stats })
    const firstTurn = playerInit >= enemyInit ? 'player' : 'enemy'

    set({
      active: true,
      enemy: { ...enemy, pv_current: enemy.pv_max },
      playerMode: 'fists',
      turn: 1,
      log: [{
        type: 'initiative',
        text: `🎲 Iniciativa — Jogador: ${playerInit} | ${enemy.name}: ${enemyInit}`,
        detail: `${firstTurn === 'player' ? 'Você' : enemy.name} age primeiro`,
      }],
      playerStatuses: [],
      enemyStatuses: [],
      powersUsed: 0,
    })
  },

  selectMode: (mode) => set({ playerMode: mode }),

  executeAttack: (sheet) => {
    const state = get()
    if (!sheet || !state.enemy) return null

    const weaponBonus = state.enemy.weapon_damage || 0
    const fa = calcFA(state.playerMode, sheet, weaponBonus)
    const fd = calcFD({ attributes: state.enemy.stats }, true)
    const damage = calcDamage(fa.value, fd.value)

    const enemyPv = Math.max(0, (state.enemy.pv_current ?? state.enemy.pv_max) - damage)

    const logEntry = {
      type: 'attack',
      turn: state.turn,
      mode: state.playerMode,
      fa: fa.value,
      fd: fd.value,
      damage,
      faBreakdown: fa.breakdown,
      fdBreakdown: fd.breakdown,
      text: `Seu ataque (${fa.breakdown}) vs FD ${fd.value} (${fd.breakdown}) = ${damage} de dano`,
    }

    const updatedEnemy = { ...state.enemy, pv_current: enemyPv }
    const defeated = enemyPv <= 0

    set({ enemy: updatedEnemy, log: [...state.log, logEntry], turn: state.turn + 1 })

    return { damage, defeated, fa, fd }
  },

  executeEnemyAttack: (sheet) => {
    const state = get()
    if (!sheet || !state.enemy) return null

    const mode = state.enemy.preferred_mode || 'fists'
    const weaponBonus = state.enemy.weapon_damage || 0
    const fa = calcFA(mode, { attributes: state.enemy.stats }, weaponBonus)
    const fd = calcFD(sheet, true)
    const damage = calcDamage(fa.value, fd.value)

    const logEntry = {
      type: 'enemy_attack',
      turn: state.turn,
      mode,
      fa: fa.value,
      fd: fd.value,
      damage,
      faBreakdown: fa.breakdown,
      fdBreakdown: fd.breakdown,
      text: `${state.enemy.name} ataca (${fa.breakdown}) vs sua FD ${fd.value} (${fd.breakdown}) = ${damage} de dano`,
    }

    set(state => ({ log: [...state.log, logEntry], turn: state.turn + 1 }))

    return { damage, defeated: false, fa, fd }
  },

  endCombat: (result) => {
    const entry = {
      type: 'end',
      text: result === 'victory' ? '⚔️ VITÓRIA!' : result === 'flee' ? '🏃 Fuga' : '💀 Derrota',
    }
    set(state => ({ active: false, log: [...state.log, entry] }))
    return result
  },

  resetCombat: () => {
    set({
      active: false,
      enemy: null,
      playerMode: 'fists',
      turn: 0,
      log: [],
      playerStatuses: [],
      enemyStatuses: [],
      powersUsed: 0,
    })
  },
}))
