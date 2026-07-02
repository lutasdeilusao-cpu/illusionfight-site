// ═══════════════════════════════════════════
//  PARIDADE EXATA — Kernel Panic Engine
//  5 cenários com valores numéricos comparados
// ═══════════════════════════════════════════

function calcAtkPower(s) {
  return s.reduce((a, c) => c.role === 'atk' && c.card.bonus ? a + c.card.bonus : a, 0)
}

function calcDefPower(d, a) {
  let t = 0
  d.forEach(x => {
    if (x.role !== 'def') return
    const attr = x.card.attr
    if ((attr === 'protecao' && a.some(y => y.card.attr === 'precisao')) ||
        (attr === 'camuflagem' && a.some(y => y.card.attr === 'visao'))) t += x.card.bonus || 0
  })
  return t
}

function getTerrainMods(terrain, tm, tcs, pl) {
  const m = { precisao:0, visao:0, protecao:0, camuflagem:0, anula_visao:false, anula_protecao:false }
  if (!terrain || !tm) return m
  if (tm.precisao)   m.precisao   += tm.precisao
  if (tm.visao)      m.visao      += tm.visao
  if (tm.protecao)   m.protecao   += tm.protecao
  if (tm.camuflagem) m.camuflagem += tm.camuflagem
  if (tm.anula_visao)    m.anula_visao    = true
  if (tm.anula_protecao) m.anula_protecao = true
  if (tm.contra_sol !== undefined) {
    if (pl === tcs) { m.visao--; m.camuflagem-- }
    else            { m.visao++; m.camuflagem++ }
  }
  return m
}

function calcAtkWithTerrain(s, ai, t, tm, tcs) {
  const m = getTerrainMods(t, tm, tcs, ai)
  let pc = 0, vc = 0
  s.forEach(x => {
    if (x.role !== 'atk') return
    if (x.card.attr === 'precisao') pc += x.card.bonus || 0
    if (x.card.attr === 'visao')    vc += x.card.bonus || 0
  })
  const fp = pc + m.precisao
  const fv = m.anula_visao ? 0 : vc + m.visao
  return { total: fp + fv, fp, fv, pc, vc, mods: m }
}

function calcDefWithTerrain(d, a, di, t, tm, tcs) {
  const m = getTerrainMods(t, tm, tcs, di)
  let protecao = 0, camu = 0
  const hp = a.some(x => x.card.attr === 'precisao')
  const hv = a.some(x => x.card.attr === 'visao')
  d.forEach(x => {
    if (x.role !== 'def') return
    if (x.card.attr === 'protecao' && hp) protecao += x.card.bonus || 0
    if (x.card.attr === 'camuflagem' && hv) camu += x.card.bonus || 0
  })
  const fp = m.anula_protecao ? 0 : protecao + (hp ? m.protecao : 0)
  const fc = camu + (hv ? m.camuflagem : 0)
  return { total: fp + fc, fp, fc, protecao, camu, mods: m }
}

function cardAtk(a, b, id) { return { id: id||`${a}_${b}_0`, type:'attr', kind:'atk', attr:a, bonus:b, name:`${a}+${b}` } }
function cardDef(a, b, id) { return { id: id||`${a}_${b}_0`, type:'attr', kind:'def', attr:a, bonus:b, name:`${a}+${b}` } }

let p = 0, f = 0

function test(name, fn) {
  try { fn(); p++; console.log(`  ✅ ${name}`) }
  catch(e) { f++; console.log(`  ❌ ${name}: ${e.message}`) }
}

function eq(got, want, label) {
  if (got !== want) throw new Error(`${label}: esperado ${want}, obtido ${got}`)
}

// ═══════════════════════════════════════════
//  CENÁRIO 1 — precisao+2 → protecao+1
//  Original (kernel-panic.html L1891, L1844):
//    calcAtkPower → 2
//    calcDefPower → protecao match precisao → 1
//    net = 2 - 1 = 1
// ═══════════════════════════════════════════

console.log('\n── CENÁRIO 1: precisao+2 vs protecao+1 (matching) ──')
{
  const a = [{ key:'a0', card:cardAtk('precisao',2), slotIdx:0, role:'atk' }]
  const d = [{ key:'d0', card:cardDef('protecao',1), slotIdx:0, role:'def' }]
  const ap = calcAtkPower(a)
  const dp = calcDefPower(d, a)
  const ar = calcAtkWithTerrain(a, 0, null, null, -1)
  const dr = calcDefWithTerrain(d, a, 1, null, null, -1)
  console.log(`  calcAtkPower:       ${ap} (esperado 2)`)
  console.log(`  calcDefPower:       ${dp} (esperado 1)`)
  console.log(`  calcAtkWithTerrain: ${ar.total} (esperado 2)`)
  console.log(`  calcDefWithTerrain: ${dr.total} (esperado 1)`)
  console.log(`  net (atk - def):    ${ar.total - dr.total} (esperado 1)`)

  test('calcAtkPower', () => eq(ap, 2, 'atkPower'))
  test('calcDefPower (match protecao↔precisao)', () => eq(dp, 1, 'defPower'))
  test('calcAtkWithTerrain total', () => eq(ar.total, 2, 'atkTotal'))
  test('calcDefWithTerrain total', () => eq(dr.total, 1, 'defTotal'))
  test('net', () => eq(ar.total - dr.total, 1, 'net'))
}

// ═══════════════════════════════════════════
//  CENÁRIO 2 — visao+2 vs protecao+1 (sem match)
//  Original: protecao só match precisao.
//  calcDefPower → 0 (protecao ignorada contra visao)
//  net = 2 - 0 = 2
// ═══════════════════════════════════════════

console.log('\n── CENÁRIO 2: visao+2 vs protecao+1 (SEM matching) ──')
{
  const a = [{ key:'a0', card:cardAtk('visao',2), slotIdx:0, role:'atk' }]
  const d = [{ key:'d0', card:cardDef('protecao',1), slotIdx:0, role:'def' }]
  const dp = calcDefPower(d, a)
  const dr = calcDefWithTerrain(d, a, 1, null, null, -1)
  console.log(`  calcDefPower:       ${dp} (esperado 0 — sem match)`)
  console.log(`  calcDefWithTerrain: ${dr.total} (esperado 0)`)

  test('defPower sem match = 0', () => eq(dp, 0, 'defPower'))
  test('defWithTerrain sem match = 0', () => eq(dr.total, 0, 'defTotal'))
}

// ═══════════════════════════════════════════
//  CENÁRIO 3 — precisao+2 com Luz Neon (precisao-3, visao+3)
//  Original (L2620, L2640):
//    finalPrecisao = 2 + (-3) = -1
//    finalVisao    = 0 + 3 = 3
//    total         = -1 + 3 = 2
//    def: protecao+1, hasPrecisao=true, mods.protecao=0 → 1
// ═══════════════════════════════════════════

console.log('\n── CENÁRIO 3: precisao+2 com Luz Neon (precisao-3, visao+3) ──')
{
  const tm = { precisao: -3, visao: 3 }
  const a = [{ key:'a0', card:cardAtk('precisao',2), slotIdx:0, role:'atk' }]
  const d = [{ key:'d0', card:cardDef('protecao',1), slotIdx:0, role:'def' }]
  const ar = calcAtkWithTerrain(a, 0, { id:'t_sol' }, tm, -1)
  const dr = calcDefWithTerrain(d, a, 1, { id:'t_sol' }, tm, -1)
  console.log(`  finalPrecisao: ${ar.fp} (esperado -1)`)
  console.log(`  finalVisao:    ${ar.fv} (esperado 3)`)
  console.log(`  atkTotal:      ${ar.total} (esperado 2)`)
  console.log(`  defTotal:      ${dr.total} (esperado 1)`)

  test('finalPrecisao = -1', () => eq(ar.fp, -1, 'finalPrecisao'))
  test('finalVisao = 3', () => eq(ar.fv, 3, 'finalVisao'))
  test('atkTotal = 2', () => eq(ar.total, 2, 'atkTotal'))
  test('defTotal = 1', () => eq(dr.total, 1, 'defTotal'))
}

// ═══════════════════════════════════════════
//  CENÁRIO 4 — anula_visao + camuflagem
//  Original (L2620): anula_visao=true → finalVisao=0
//  Original (L2640): hasVisao depende só de attr='visao' na atkSel,
//    NÃO depende de mods → camuflagem ainda funciona.
// ═══════════════════════════════════════════

console.log('\n── CENÁRIO 4: anula_visao (Blackout) + camuflagem ──')
{
  const tm = { anula_visao: true }
  const a = [
    { key:'a0', card:cardAtk('visao',2,'visao_2_0'), slotIdx:0, role:'atk' },
    { key:'a1', card:cardAtk('visao',3,'visao_3_0'), slotIdx:1, role:'atk' },
  ]
  const d = [{ key:'d0', card:cardDef('camuflagem',2), slotIdx:0, role:'def' }]
  const ar = calcAtkWithTerrain(a, 0, { id:'t_chuvaforte' }, tm, -1)
  const dr = calcDefWithTerrain(d, a, 1, { id:'t_chuvaforte' }, tm, -1)
  console.log(`  finalVisao:    ${ar.fv} (esperado 0 — anulado)`)
  console.log(`  atkTotal:      ${ar.total} (esperado 0 — só visao)`)
  console.log(`  defTotal:      ${dr.total} (esperado 2 — camuflagem ainda funciona, hasVisao=true)`)

  test('finalVisao = 0 (anulado)', () => eq(ar.fv, 0, 'finalVisao'))
  test('atkTotal = 0', () => eq(ar.total, 0, 'atkTotal'))
  test('def camuflagem = 2 (hasVisao independe de mods)', () => eq(dr.total, 2, 'defTotal'))
}

// ═══════════════════════════════════════════
//  CENÁRIO 5 — anula_protecao (Sobrecarga)
//  Original (L2640): anula_protecao=true → finalProtecao=0
//  camuflagem sem match (hasVisao=false) → 0
// ═══════════════════════════════════════════

console.log('\n── CENÁRIO 5: anula_protecao (Sobrecarga) ──')
{
  const tm = { anula_protecao: true }
  const a = [{ key:'a0', card:cardAtk('precisao',2), slotIdx:0, role:'atk' }]
  const d = [
    { key:'d0', card:cardDef('protecao',3), slotIdx:0, role:'def' },
    { key:'d1', card:cardDef('camuflagem',1), slotIdx:1, role:'def' },
  ]
  const ar = calcAtkWithTerrain(a, 0, { id:'t_calor' }, tm, -1)
  const dr = calcDefWithTerrain(d, a, 1, { id:'t_calor' }, tm, -1)
  console.log(`  finalProtecao: ${dr.fp} (esperado 0 — anulado)`)
  console.log(`  finalCamufla:  ${dr.fc} (esperado 0 — sem match hasVisao=false)`)
  console.log(`  atkTotal:      ${ar.total} (esperado 2)`)
  console.log(`  defTotal:      ${dr.total} (esperado 0)`)

  test('finalProtecao = 0 (anulado)', () => eq(dr.fp, 0, 'finalProtecao'))
  test('finalCamuflagem = 0 (sem match visao)', () => eq(dr.fc, 0, 'finalCamuflagem'))
  test('atkTotal = 2', () => eq(ar.total, 2, 'atkTotal'))
  test('defTotal = 0', () => eq(dr.total, 0, 'defTotal'))
}

// ═══════════════════════════════════════════
//  RESUMO
// ═══════════════════════════════════════════

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`  PARIDADE: ${p}/${p+f} cenários`)
console.log(`  ✅ ${p}  ❌ ${f}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
process.exit(f > 0 ? 1 : 0)
