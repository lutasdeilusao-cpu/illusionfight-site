// ═══════════════════════════════════════════
//  KERNEL PANIC — Teste de Paridade (Node)
//  5 cenários fixos de ataque+defesa
//  Compara output das funções puras contra
//  cálculo manual original
// ═══════════════════════════════════════════

// ── Helpers ────────────────────────────────

function calcAtkPower(selection) {
  return selection.reduce((acc, s) => {
    if (s.role === 'atk' && s.card.bonus) return acc + s.card.bonus
    return acc
  }, 0)
}

function calcDefPower(defSel, atkSel) {
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

function getTerrainMods(terrain, terrain_mods, terrain_contra_sol, playerIdx) {
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

function calcAtkWithTerrain(atkSel, attackerIdx, terrain, terrain_mods, terrain_contra_sol) {
  const mods = getTerrainMods(terrain, terrain_mods, terrain_contra_sol, attackerIdx)
  let precisaoCards = 0, visaoCards = 0
  atkSel.forEach(s => {
    if (s.role !== 'atk') return
    if (s.card.attr === 'precisao') precisaoCards += s.card.bonus || 0
    if (s.card.attr === 'visao')    visaoCards    += s.card.bonus || 0
  })
  const finalPrecisao = precisaoCards + mods.precisao
  const finalVisao    = mods.anula_visao ? 0 : (visaoCards + mods.visao)
  return { total: finalPrecisao + finalVisao, finalPrecisao, finalVisao, precisaoCards, visaoCards, mods }
}

function calcDefWithTerrain(defSel, atkSel, defenderIdx, terrain, terrain_mods, terrain_contra_sol) {
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
  return { total: finalProtecao + finalCamuflagem, finalProtecao, finalCamuflagem, protecaoCards, camuflageCards, mods }
}

function roll20() { return 0 } // mocked for deterministic test

// ── Cenários ───────────────────────────────

let passou = 0
let falhou = 0

function testar(nome, fn) {
  try {
    fn()
    passou++
    console.log(`  ✅ ${nome}`)
  } catch (e) {
    falhou++
    console.log(`  ❌ ${nome}: ${e.message}`)
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed')
}

// ── Card Factories (mesma estrutura da engine) ──

function cardAtk(attr, bonus, id) {
  const kind = 'atk'
  return { id: id || `${attr}_${bonus}_0`, type: 'attr', kind, attr, name: `${attr} +${bonus}`, bonus, label: attr === 'precisao' ? 'Mira Ocular' : 'Scan', desc: '' }
}

function cardDef(attr, bonus, id) {
  const kind = 'def'
  return { id: id || `${attr}_${bonus}_0`, type: 'attr', kind, attr, name: `${attr} +${bonus}`, bonus, label: attr === 'protecao' ? 'Blindagem' : 'Sinal Fantasma', desc: '' }
}

// ═══════════════════════════════════════════
//  CENÁRIO 1 — Ataque básico com matching
//  Atk: precisao+2, Def: protecao+1
//  atkPower = 2, defPower = 1 (protecao match precisao)
//  net = 1, target = 1, rolled 0 (mocked) => hit!
// ═══════════════════════════════════════════
testar('C1: Ataque básico precisao→protecao', () => {
  const atkSel = [{ key: 'atk_0', card: cardAtk('precisao', 2), slotIdx: 0, role: 'atk' }]
  const defSel = [{ key: 'def_0', card: cardDef('protecao', 1), slotIdx: 0, role: 'def' }]

  const atkPower = calcAtkPower(atkSel)
  assert(atkPower === 2, `atkPower = ${atkPower}, esperado 2`)

  const defPower = calcDefPower(defSel, atkSel)
  assert(defPower === 1, `defPower = ${defPower}, esperado 1`)

  const atkRes = calcAtkWithTerrain(atkSel, 0, null, null, -1)
  assert(atkRes.total === 2, `atkWithTerrain.total = ${atkRes.total}, esperado 2`)

  const defRes = calcDefWithTerrain(defSel, atkSel, 1, null, null, -1)
  assert(defRes.total === 1, `defWithTerrain.total = ${defRes.total}, esperado 1`)

  const net = atkRes.total - defRes.total
  assert(net === 1, `net = ${net}, esperado 1`)
})

// ═══════════════════════════════════════════
//  CENÁRIO 2 — Ataque visao vs protecao (sem matching)
//  Atk: visao+2, Def: protecao+1
//  atkPower = 2, defPower = 0 (protecao NÃO match visao)
//  net = 2, target = 2
// ═══════════════════════════════════════════
testar('C2: visao contra protecao (sem match)', () => {
  const atkSel = [{ key: 'atk_0', card: cardAtk('visao', 2), slotIdx: 0, role: 'atk' }]
  const defSel = [{ key: 'def_0', card: cardDef('protecao', 1), slotIdx: 0, role: 'def' }]

  const defPower = calcDefPower(defSel, atkSel)
  assert(defPower === 0, `defPower = ${defPower}, esperado 0 (sem match)`)

  const defRes = calcDefWithTerrain(defSel, atkSel, 1, null, null, -1)
  assert(defRes.total === 0, `defWithTerrain.total = ${defRes.total}, esperado 0`)
})

// ═══════════════════════════════════════════
//  CENÁRIO 3 — Combate completo com terreno
//  Atk: precisao+2, Def: protecao+1
//  Terrain: Luz Neon Intensa (precisao: -3, visao: +3)
//  atkPower = 2-3 = -1 → 0 (floor at 0 na prática, mas a função retorna -1+? 
//   Wait — precisaoCards += card.bonus = 2, mods.precisao = -3 → finalPrecisao = -1
//   visaoCards = 0, mods.visao = 3 → finalVisao = 3
//   total = -1 + 3 = 2
//  defWithTerrain: hasPrecisao=true, protecaoCards=1, mods.protecao=0 → 1
//  net = 2 - 1 = 1
// ═══════════════════════════════════════════
testar('C3: Ataque com terreno Luz Neon (precisao-3, visao+3)', () => {
  const terrain_mods = { precisao: -3, visao: 3 }
  const atkSel = [{ key: 'atk_0', card: cardAtk('precisao', 2), slotIdx: 0, role: 'atk' }]
  const defSel = [{ key: 'def_0', card: cardDef('protecao', 1), slotIdx: 0, role: 'def' }]

  const atkRes = calcAtkWithTerrain(atkSel, 0, { id: 't_sol', name: 'Luz Neon' }, terrain_mods, -1)
  assert(atkRes.finalPrecisao === -1, `finalPrecisao = ${atkRes.finalPrecisao}, esperado -1`)
  assert(atkRes.finalVisao === 3, `finalVisao = ${atkRes.finalVisao}, esperado 3`)
  assert(atkRes.total === 2, `total = ${atkRes.total}, esperado 2`)

  const defRes = calcDefWithTerrain(defSel, atkSel, 1, { id: 't_sol' }, terrain_mods, -1)
  assert(defRes.total === 1, `defTotal = ${defRes.total}, esperado 1`)
})

// ═══════════════════════════════════════════
//  CENÁRIO 4 — Terreno anula_visao
//  Atk: visao+2 + visao+3
//  Terrain: Blackout de Rede (anula_visao: true)
//  finalVisao = 0 (anulado apesar dos +5 de carta)
//  atkPower total = 0 (só visao, nada de precisao)
//  Def: camuflagem+2 (match visao, mas visao foi anulada)
//   — defWithTerrain: hasVisao=true, camuflageCards=2, mods.camuflagem=0 → 2
//   wait — anula_visao só anula finalVisao. hasVisao ainda é true.
//   O matching funcional: camuflagem só se ativa com hasVisao. 
//   Mas hasVisao só verifica se algum atkSel tem attr='visao' (linha 99), não depende de mods.
//   Então camuflagem+2 ainda funciona mesmo com scan anulado!
//   Isso é o comportamento original.
// ═══════════════════════════════════════════
testar('C4: anula_visao + camuflagem', () => {
  const terrain_mods = { anula_visao: true }
  const atkSel = [
    { key: 'atk_0', card: cardAtk('visao', 2, 'visao_2_0'), slotIdx: 0, role: 'atk' },
    { key: 'atk_1', card: cardAtk('visao', 3, 'visao_3_0'), slotIdx: 1, role: 'atk' },
  ]
  const defSel = [{ key: 'def_0', card: cardDef('camuflagem', 2), slotIdx: 0, role: 'def' }]

  const atkRes = calcAtkWithTerrain(atkSel, 0, { id: 't_chuvaforte' }, terrain_mods, -1)
  assert(atkRes.finalVisao === 0, `finalVisao = ${atkRes.finalVisao}, esperado 0 (anulado)`)
  assert(atkRes.total === 0, `atkTotal = ${atkRes.total}, esperado 0 (só visao, tudo anulado)`)

  // anula_visao não afeta hasVisao (checagem pura de attr)
  // Portanto camuflagem ainda funciona
  const defRes = calcDefWithTerrain(defSel, atkSel, 1, { id: 't_chuvaforte' }, terrain_mods, -1)
  assert(defRes.total === 2, `defTotal = ${defRes.total}, esperado 2 (camuflagem não anulada)`)
})

// ═══════════════════════════════════════════
//  CENÁRIO 5 — Terreno anula_protecao
//  Atk: precisao+2, Def: protecao+3 + camuflagem+1
//  Terrain: Sobrecarga (anula_protecao: true)
//  atkPower: precisaoCards=2, mods.precisao=0 → 2
//  defWithTerrain: hasPrecisao=true, protecaoCards=3, mods.anula_protecao=true → finalProtecao=0
//   camuflageCards=0 (hasVisao=false) → finalCamuflagem=0
//  defTotal = 0 (protecao anulada, camuflagem sem match)
// ═══════════════════════════════════════════
testar('C5: anula_protecao', () => {
  const terrain_mods = { anula_protecao: true }
  const atkSel = [{ key: 'atk_0', card: cardAtk('precisao', 2), slotIdx: 0, role: 'atk' }]
  const defSel = [
    { key: 'def_0', card: cardDef('protecao', 3), slotIdx: 0, role: 'def' },
    { key: 'def_1', card: cardDef('camuflagem', 1), slotIdx: 1, role: 'def' },
  ]

  const atkRes = calcAtkWithTerrain(atkSel, 0, { id: 't_calor' }, terrain_mods, -1)
  assert(atkRes.total === 2, `atkTotal = ${atkRes.total}, esperado 2`)

  const defRes = calcDefWithTerrain(defSel, atkSel, 1, { id: 't_calor' }, terrain_mods, -1)
  assert(defRes.finalProtecao === 0, `finalProtecao = ${defRes.finalProtecao}, esperado 0 (anulado)`)
  assert(defRes.total === 0, `defTotal = ${defRes.total}, esperado 0 (tudo anulado/sem match)`)
})

// ═══════════════════════════════════════════
//  RELATÓRIO
// ═══════════════════════════════════════════

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`  PARIDADE: ${passou}/${passou + falhou} cenários`)
console.log(`  ✅ ${passou}  ❌ ${falhou}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
process.exit(falhou > 0 ? 1 : 0)
