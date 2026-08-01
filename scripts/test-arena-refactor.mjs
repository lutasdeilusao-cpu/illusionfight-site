import assert from 'node:assert/strict'
import {
  buildArenaModifiers,
  chooseArenaEnemyAction,
  resolveArenaAction,
  resolveArenaInitiative,
  resolveArenaRoundClose,
} from '../src/pages/games/Arena/engine/arenaCombatResolver.js'

const base = (overrides = {}) => ({
  attributes: { F: 3, H: 3, R: 3, A: 2, PdF: 3 },
  combat_style: 'brutamontes', technique_ids: [], weakness_id: null,
  elemental: 'neutro', statuses: [], loadout_version: 1,
  ...overrides,
})

const hit = (attacker, defender, action, attackerExtra = []) => resolveArenaAction({
  attacker, defender, action, rolls: { fa: 4, fd: 2 },
  activeModifiers: {
    attacker: [...buildArenaModifiers(attacker), ...attackerExtra],
    defender: buildArenaModifiers(defender),
  },
})

function log(name, data) {
  console.log(`✅ ${name} | ${JSON.stringify(data)}`)
}

function fullCombat(style, mode) {
  let player = base({ combat_style: style, attributes: { F: 5, H: 5, R: 3, A: 3, PdF: 5 } })
  let enemy = base({ combat_style: 'brutamontes', attributes: { F: 1, H: 1, R: 2, A: 1, PdF: 1 } })
  let playerPv = 15
  let enemyPv = 12
  const turns = []
  for (let round = 1; round <= 10 && playerPv > 0 && enemyPv > 0; round++) {
    const p = resolveArenaAction({ attacker: player, defender: enemy, action: { type: 'attack', mode }, rolls: { fa: 5, fd: 1 } })
    enemyPv = Math.max(0, enemyPv - p.damage)
    turns.push(`R${round} P FA${p.fa}/FD${p.fd}/D${p.damage}/EPV${enemyPv}`)
    if (enemyPv <= 0) break
    const e = resolveArenaAction({ attacker: enemy, defender: player, action: { type: 'attack', mode: 'fists' }, rolls: { fa: 2, fd: 4 } })
    playerPv = Math.max(0, playerPv - e.damage)
    turns.push(`R${round} E FA${e.fa}/FD${e.fd}/D${e.damage}/PPV${playerPv}`)
  }
  assert.equal(enemyPv, 0)
  log(`combate completo ${style}`, { winner: 'player', playerPv, enemyPv, turns })
}

fullCombat('brutamontes', 'fists')
fullCombat('duelista', 'armed')
fullCombat('canalizador', 'power')

// Técnicas
{
  const player = base({ technique_ids: ['bloqueio'] })
  const prepared = hit(player, base(), { type: 'technique', techniqueId: 'bloqueio' })
  const defender = { ...player, statuses: prepared.attackerStatuses }
  const incoming = hit(base({ attributes: { F: 5, H: 5, A: 0, R: 1, PdF: 0 } }), defender, { type: 'attack', mode: 'fists' })
  assert(incoming.effects.includes('bloqueio_reduce')); assert(incoming.damage >= 0)
  log('técnica bloqueio', { beforeReduction: incoming.fa - incoming.fd, damage: incoming.damage, effects: incoming.effects })
}
{
  const normal = hit(base(), base(), { type: 'attack', mode: 'fists' })
  const dodge = hit(base(), base({ technique_ids: ['esquiva'] }), { type: 'attack', mode: 'fists' })
  assert.equal(dodge.fd, normal.fd + 2)
  log('técnica esquiva', { normalFD: normal.fd, dodgeFD: dodge.fd, damage: dodge.damage })
}
{
  const fury = hit(base({ technique_ids: ['furia'] }), base(), { type: 'technique', techniqueId: 'furia', mode: 'fists' })
  assert(fury.effects.includes('furia')); assert.equal(fury.pmCost, 2)
  log('técnica fúria', { fa: fury.fa, damage: fury.damage, pmCost: fury.pmCost })
}
{
  const regen = resolveArenaRoundClose({ combatant: base({ technique_ids: ['regeneracao'] }), pv: 8, pvMax: 15 })
  assert.equal(regen.heal, 1); assert.equal(regen.pv, 9)
  log('técnica regeneração', regen)
}
{
  const player = base({ technique_ids: ['mira_letal'] })
  const aimed = hit(player, base(), { type: 'technique', techniqueId: 'mira_letal' })
  const aimedHit = hit({ ...player, statuses: aimed.attackerStatuses }, base(), { type: 'attack', mode: 'fists' })
  assert(aimedHit.effects.includes('mira_letal_hit'))
  log('técnica mira letal', { statuses: aimed.attackerStatuses, fa: aimedHit.fa, damage: aimedHit.damage })
}
{
  const counter = hit(base(), base({ technique_ids: ['contra_ataque'] }), { type: 'attack', mode: 'fists' })
  assert.equal(counter.counterDamage, counter.damage > 0 ? 1 : 0)
  log('técnica contra-ataque', { received: counter.damage, counterDamage: counter.counterDamage })
}

// Fraquezas
{
  const normal = resolveArenaInitiative({ combatant: base(), roll: 4, modifiers: buildArenaModifiers(base()) })
  const slow = resolveArenaInitiative({ combatant: base({ weakness_id: 'lento' }), roll: 4, modifiers: buildArenaModifiers(base({ weakness_id: 'lento' })) })
  assert.equal(slow.value, normal.value - 2)
  log('fraqueza lento', { normal: normal.value, slow: slow.value })
}
{
  const normal = hit(base(), base(), { type: 'attack', mode: 'fists' })
  const frail = hit(base({ weakness_id: 'franzino' }), base(), { type: 'attack', mode: 'fists' })
  assert.equal(frail.fa, normal.fa - 1)
  log('fraqueza franzino', { normalFA: normal.fa, frailFA: frail.fa })
}
{
  const thirsty = hit(base({ weakness_id: 'sedento' }), base(), { type: 'attack', mode: 'power', powerCost: 1 })
  assert.equal(thirsty.pmCost, 2)
  log('fraqueza sedento', { baseCost: 1, finalCost: thirsty.pmCost })
}
{
  const normal = hit(base({ elemental: 'fogo' }), base(), { type: 'attack', mode: 'power' })
  const sensitive = hit(base({ elemental: 'fogo' }), base({ weakness_id: 'sensivel' }), { type: 'attack', mode: 'power' })
  assert.equal(sensitive.damage, normal.damage + 2)
  log('fraqueza sensível', { normalDamage: normal.damage, sensitiveDamage: sensitive.damage })
}

// IA real
{
  const bot = chooseArenaEnemyAction({ id: 'treinamento', preferred_mode: 'fists' }, {})
  assert.equal(bot.aiModifier, 'ai:training_soft')
  log('IA Bot de Treinamento', bot)
}
{
  const kaeda = chooseArenaEnemyAction({ id: 'kaeda', preferred_mode: 'armed' }, { lastAttackHit: true })
  assert.equal(kaeda.aiModifier, 'ai:kaeda_momentum')
  log('IA Kaeda após acerto', kaeda)
}
{
  const charge = chooseArenaEnemyAction({ id: 'thunderbolt', preferred_mode: 'power' }, { charged: false })
  const discharge = chooseArenaEnemyAction({ id: 'thunderbolt', preferred_mode: 'power' }, { charged: true })
  assert.equal(charge.type, 'charge'); assert.equal(discharge.type, 'attack')
  log('IA Thunderbolt carga/descarga', { charge, discharge })
}

console.log('ARENA_FUNCTIONAL_TESTS_OK')
