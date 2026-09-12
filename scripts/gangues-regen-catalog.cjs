// Regenera levels[] dos 30 personagens do catálogo (ldi_gangues_30_personagens_v1.json)
// respeitando de verdade o custo escalonado por atributo (custoAtributoGangues,
// em src/pages/games/Gangues/data/ganguesCharacters.js) — o gerador anterior
// (commit 84094fe5c, jan/2027) só aplicava +1 no growth_order por nível, flat,
// sem nenhum gate de custo (bug reportado pelo Isaias em 2026-09-12: os
// personagens dele tinham atributo alto rápido demais, sem gap nenhum).
//
// Regra (real, não mais só descrita no meta.notes do catálogo):
// - cada nível banca +1 XP (igual sempre foi, 1 XP = 1 nível).
// - o XP bancado (não gasto) se ACUMULA entre níveis.
// - a cada nível, enquanto o banco >= custoAtributoGangues(valor atual do
//   próximo atributo na fila do growth_order), gasta, sobe +1 esse atributo,
//   avança a fila (growth_order cicla infinitamente pros níveis 11-99).
// - 'R' no growth_order (resíduo do atributo único de antes de PV/PM
//   separarem) mapeia alternando PV/PM (começa por PV) — preserva a
//   proporção original pretendida.
// - eventos de PODER (unlock_special/special_rank/base_technique/max_rank)
//   são 100% preservados como estavam no catálogo — são amarrados à
//   identidade do personagem, não ao sistema de custo. Um nível pode ficar
//   só com evento de poder e nenhum de atributo — isso é o "vácuo"
//   deliberado que o Isaias pediu (level up sem ganho de atributo, até
//   acumular banco suficiente pro próximo ponto).
//
// Rodar de novo (novo personagem, rebalance de custoAtributoGangues, etc):
//   node scripts/gangues-regen-catalog.cjs
// Reescreve o catálogo inteiro (30 personagens × 99 níveis) IN-PLACE —
// commitar como um passo isolado e revisar o diff antes de subir junto com
// outra mudança.
const fs = require('fs')
const path = require('path')

const CATALOG_PATH = path.join(__dirname, '..', 'src', 'pages', 'games', 'Gangues', 'data', 'ldi_gangues_30_personagens_v1.json')

// Duplicado de propósito (mesma lógica de custoAtributoGangues em
// ganguesCharacters.js) — script roda fora do bundle Vite/ESM, sem import
// direto do módulo da aplicação. Se mudar a curva lá, espelhar aqui.
function custoAtributoGangues(valorAtual = 0) {
  const v = Math.max(0, Number(valorAtual) || 0)
  if (v <= 4) return 1
  if (v <= 7) return 2
  if (v <= 14) return 3
  if (v <= 19) return 5
  return 8 + 3 * Math.floor((v - 20) / 5)
}

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
  let bank = 0
  let ptr = 0
  const newLevels = [{
    level: 1,
    xp_total_required: 0,
    stats: { ...stats },
    resources: computeResources(ch.combat_path, stats),
    events: [...nonAttrEvents(ch.levels[0])],
  }]

  for (let level = 2; level <= LEVEL_CAP; level++) {
    bank += 1
    const attrEvents = []
    // Pode gastar mais de uma vez no mesmo nível se o banco acumulado (de
    // níveis anteriores em vácuo) alcançar o custo de mais de um ponto
    // seguido — deliberado, não um bug: o jogador "estourou" o banco depois
    // de vários níveis sem ganho.
    while (bank >= custoAtributoGangues(stats[queue[ptr % queue.length]] || 0)) {
      const attr = queue[ptr % queue.length]
      bank -= custoAtributoGangues(stats[attr] || 0)
      stats[attr] = (stats[attr] || 0) + 1
      attrEvents.push({ type: 'attribute', attribute: attr, delta: 1 })
      ptr += 1
    }
    const original = ch.levels.find(l => l.level === level)
    const powerEvents = original ? nonAttrEvents(original) : []
    newLevels.push({
      level,
      xp_total_required: level - 1,
      stats: { ...stats },
      resources: computeResources(ch.combat_path, stats),
      events: [...attrEvents, ...powerEvents],
    })
  }
  return { ...ch, growth_order: queue, levels: newLevels }
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'))
catalog.characters = catalog.characters.map(regenerateCharacter)
fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n')
console.log(`OK — ${catalog.characters.length} personagens regenerados (${LEVEL_CAP} níveis cada) em ${CATALOG_PATH}`)
