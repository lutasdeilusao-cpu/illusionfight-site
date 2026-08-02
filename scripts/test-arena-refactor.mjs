import assert from 'node:assert/strict'
import {
  buildArenaModifiers,
  chooseArenaEnemyAction,
  resolveArenaAction,
  resolveArenaInitiative,
} from '../src/pages/games/Arena/engine/arenaCombatResolver.js'
import {
  ARENA_PATHS,
  ARENA_PATH_PRESETS,
  getArenaResources,
  normalizeArenaLoadout,
} from '../src/pages/games/Arena/data/arenaLoadout.js'

function log(name, data) {
  console.log(`✅ ${name} | ${JSON.stringify(data)}`)
}

assert.deepEqual(getArenaResources('atacante', 3), { pvMax: 9, pmMax: 9, pvPerR: 3, pmPerR: 3 })
assert.deepEqual(getArenaResources('defensor', 3), { pvMax: 12, pmMax: 6, pvPerR: 4, pmPerR: 2 })
assert.deepEqual(getArenaResources('mistico', 3), { pvMax: 6, pmMax: 12, pvPerR: 2, pmPerR: 4 })
log('Resistência por caminho com R 3', {
  atacante: getArenaResources('atacante', 3),
  defensor: getArenaResources('defensor', 3),
  mistico: getArenaResources('mistico', 3),
})

for (const path of ARENA_PATHS) {
  const attributes = ARENA_PATH_PRESETS[path]
  assert.deepEqual(Object.keys(attributes), ['A', 'H', 'R', 'D'])
  assert.equal(Object.values(attributes).reduce((sum, value) => sum + value, 0), 5)
  assert.equal('F' in attributes, false)
  assert.equal('PdF' in attributes, false)
  assert.deepEqual(normalizeArenaLoadout({ combat_path: path }).attributes, attributes)
  log(`caminho ${path}`, attributes)
}

const attacker = {
  attributes: { A: 3, H: 1, R: 1, D: 0 },
  combat_path: 'atacante', elemental: 'neutro', statuses: [],
}
const defender = {
  attributes: { A: 1, H: 0, R: 2, D: 2 },
  combat_path: 'defensor', elemental: 'neutro', statuses: [],
}

const resolveMode = mode => resolveArenaAction({
  attacker,
  defender,
  action: { type: 'attack', mode },
  rolls: { fa: 4, fd: 2 },
  activeModifiers: {
    attacker: buildArenaModifiers(attacker),
    defender: buildArenaModifiers(defender),
  },
})

const simple = resolveMode('simple')
const ranged = resolveMode('ranged')
const mystical = resolveMode('mystical')
assert.equal(simple.fa, 8) // A 3 + H 1 + dado 4
assert.equal(simple.fd, 4) // D 2 + H 0 + dado 2
assert.equal(simple.damage, 4)
assert.equal(ranged.damage, simple.damage)
assert.equal(mystical.damage, simple.damage)
log('A é ataque e D é defesa, sem diferença de alcance', { fa: simple.fa, fd: simple.fd, damage: simple.damage })

const initiative = resolveArenaInitiative({ combatant: attacker, roll: 5, modifiers: buildArenaModifiers(attacker) })
assert.equal(initiative.value, 6)
log('H é habilidade e iniciativa', initiative)

const bot = chooseArenaEnemyAction({ id: 'treinamento', preferred_mode: 'fists' }, {})
const kaeda = chooseArenaEnemyAction({ id: 'kaeda', preferred_mode: 'armed' }, { lastAttackHit: true })
const thunderCharge = chooseArenaEnemyAction({ id: 'thunderbolt', preferred_mode: 'power' }, { charged: false })
const thunderDischarge = chooseArenaEnemyAction({ id: 'thunderbolt', preferred_mode: 'power' }, { charged: true })
assert.equal(bot.aiModifier, 'ai:training_soft')
assert.equal(kaeda.aiModifier, 'ai:kaeda_momentum')
assert.equal(thunderCharge.type, 'charge')
assert.equal(thunderDischarge.type, 'attack')
log('IA preservada', { bot, kaeda, thunderCharge, thunderDischarge })

console.log('ARENA_PATH_MODEL_TESTS_OK')
