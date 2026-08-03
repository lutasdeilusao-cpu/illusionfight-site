import assert from 'node:assert/strict'
import { resolveGanguesAction, resolveGanguesInitiative } from '../src/pages/games/Gangues/engine/ganguesCombatResolver.js'
import { GANGUES_CREATION_POINTS, GANGUES_PATHS, getGanguesResources, normalizeGanguesLoadout } from '../src/pages/games/Gangues/data/ganguesLoadout.js'

const log = (name, value) => console.log(`✅ ${name} | ${JSON.stringify(value)}`)

assert.equal(GANGUES_CREATION_POINTS, 5)
for (const path of GANGUES_PATHS) {
  assert.deepEqual(normalizeGanguesLoadout({ combat_path: path }).attributes, { A: 0, H: 0, R: 0, D: 0 })
}
assert.deepEqual(normalizeGanguesLoadout({ combat_path: 'atacante', attributes: { A: 3, H: 0, R: 2, D: 0 } }).attributes, { A: 3, H: 0, R: 2, D: 0 })
log('distribuição manual preservada', { A: 3, H: 0, R: 2, D: 0 })

assert.deepEqual(getGanguesResources('atacante', 2), { pvMax: 6, pmMax: 6, pvPerR: 3, pmPerR: 3 })
assert.deepEqual(getGanguesResources('defensor', 2), { pvMax: 8, pmMax: 4, pvPerR: 4, pmPerR: 2 })
assert.deepEqual(getGanguesResources('mistico', 2), { pvMax: 4, pmMax: 8, pvPerR: 2, pmPerR: 4 })

const fast = resolveGanguesInitiative({ combatant: { attributes: { H: 4 } }, roll: 1 })
const lucky = resolveGanguesInitiative({ combatant: { attributes: { H: 1 } }, roll: 3 })
assert.deepEqual(fast, { ability: 4, die: 1, total: 5 })
assert.deepEqual(lucky, { ability: 1, die: 3, total: 4 })
log('iniciativa usa H + d3', { fast, lucky })

const attack = resolveGanguesAction({ attacker: { attributes: { A: 3, H: 2 }, statuses: [] }, defender: { attributes: { D: 2 }, statuses: [] }, action: { type: 'attack' }, rolls: { fa: 4 } })
assert.equal(attack.fa, 8)
assert.equal(attack.fd, 2)
assert.equal(attack.damage, 6)
log('ataque básico', attack)

console.log('GANGUES_COMBAT_TESTS_OK')
