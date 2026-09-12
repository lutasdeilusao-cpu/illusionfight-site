// Regenera levels[] dos 30 personagens do catálogo (ldi_gangues_30_personagens_v1.json)
// com o sistema de crescimento FLAT: todo nível dá exatamente +1 ponto de
// atributo, seguindo o `growth_order` autorado de cada personagem (fiel à
// identidade do caminho — um Bruto sobe A, um Muralha sobe D/PV, etc), sem
// nenhum gate de custo por XP.
//
// Histórico (pra não repetir o erro): em set/2026 existiu uma versão com
// "custo escalonado por atributo" (cada ponto ficava mais caro em XP quanto
// mais alto o atributo já estava) — o Isaias pediu isso originalmente achando
// que resolveria personagens subindo atributo rápido demais, inspirado no
// sistema de pontos do 3D&T. Na prática, jogando de verdade, ficou muito
// ruim: vários níveis seguidos sem NENHUM ganho de atributo (ex.: Trinca
// NV96-99 zerado), sensação de progressão travada. O Isaias reverteu por
// completo o pedido — "isso aqui é estilo Ragnarok, todo nível tem que subir
// atributo, como era antes" — e pediu pra apagar o sistema de custo inteiro,
// sem deixar código morto. Este script (e o catálogo que ele gera) é o
// resultado desse revert. Não reintroduzir custo escalonado sem pedido
// explícito e testado de verdade em jogo antes de virar padrão.
//
// Regra (real, a única que existe):
// - cada nível dá exatamente +1 ponto de atributo, sempre, seguindo a fila
//   do growth_order daquele personagem (fila cicla infinitamente pros
//   níveis além do tamanho dela).
// - 'R' no growth_order (resíduo do atributo único de antes de PV/PM
//   separarem) mapeia alternando PV/PM (começa por PV) — preserva a
//   proporção original pretendida.
// - eventos de PODER (unlock_special/special_rank/base_technique/max_rank)
//   são 100% preservados como estavam no catálogo — amarrados à identidade
//   do personagem, independentes do atributo.
//
// Rodar de novo (novo personagem, ajuste de growth_order, etc):
//   node scripts/gangues-regen-catalog.cjs
// Reescreve o catálogo inteiro (30 personagens × 99 níveis) IN-PLACE —
// commitar como um passo isolado e revisar o diff antes de subir junto com
// outra mudança.
const fs = require('fs')
const path = require('path')

const CATALOG_PATH = path.join(__dirname, '..', 'src', 'pages', 'games', 'Gangues', 'data', 'ldi_gangues_30_personagens_v1.json')

const RES_RATE = { atacante: { pv: 3, pm: 3 }, defensor: { pv: 4, pm: 2 }, mistico: { pv: 2, pm: 4 } }
const LEVEL_CAP = 99

function mapGrowthOrder(growthOrder) {
  let toggle = 'PV'
  return growthOrder.map(a => {
    if (a !== 'R') return a
    const chosen = toggle
    toggle = toggle === 'PV' ? 'PM' : 'PV'
    return chosen
  })
}

function nonAttrEvents(lvl) {
  const evs = lvl.events || lvl.ev || []
  return evs.filter(e => e.type !== 'attribute')
}

function computeResources(combatPath, stats) {
  const r = RES_RATE[combatPath] || { pv: 0, pm: 0 }
  return { pv_max: (stats.PV || 0) * r.pv, pm_max: (stats.PM || 0) * r.pm }
}

function regenerateCharacter(ch) {
  const queue = mapGrowthOrder(ch.growth_order)
  const stats = { ...ch.levels[0].stats }
  const newLevels = [{
    level: 1,
    xp_total_required: 0,
    stats: { ...stats },
    resources: computeResources(ch.combat_path, stats),
    events: [...nonAttrEvents(ch.levels[0])],
  }]

  for (let level = 2; level <= LEVEL_CAP; level++) {
    const attr = queue[(level - 2) % queue.length]
    stats[attr] = (stats[attr] || 0) + 1
    const original = ch.levels.find(l => l.level === level)
    const powerEvents = original ? nonAttrEvents(original) : []
    newLevels.push({
      level,
      xp_total_required: level - 1,
      stats: { ...stats },
      resources: computeResources(ch.combat_path, stats),
      events: [{ type: 'attribute', attribute: attr, delta: 1 }, ...powerEvents],
    })
  }
  return { ...ch, growth_order: queue, levels: newLevels }
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'))
catalog.characters = catalog.characters.map(regenerateCharacter)
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n')
console.log(`OK — ${catalog.characters.length} personagens regenerados (${LEVEL_CAP} níveis cada, +1 atributo flat por nível) em ${CATALOG_PATH}`)
