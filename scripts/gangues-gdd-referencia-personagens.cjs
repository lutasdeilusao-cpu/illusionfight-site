// Gera a tabela de referência completa (atributo a cada 5 níveis + nível
// exato de cada poder) dos 30 personagens do catálogo, em Markdown, pra
// colar direto no GDD (docs/Games/Gangues/LDI_GANGUES_GDD.md). Pedido do
// Isaias: "adicione no GDD como fica cada personagem e cada 5 niveis os
// seus atributos até o nivel 99 e os poderes que eles vão ter e qual nivel
// vai liberar eles".
//
// Rodar de novo sempre que o catálogo for regenerado (scripts/gangues-regen-
// catalog.cjs) pra manter a tabela do GDD fiel aos dados reais — a saída
// vai pro stdout, cola manualmente na seção correspondente do GDD (não
// escreve o .md sozinho de propósito, pra não sobrescrever texto vizinho
// escrito à mão).
//   node scripts/gangues-gdd-referencia-personagens.cjs > tabela.md
const path = require('path')
const catalog = require(path.join(__dirname, '..', 'src', 'pages', 'games', 'Gangues', 'data', 'ldi_gangues_30_personagens_v1.json'))

const LEVEL_CAP = 99
const ATTR_LABEL = { A: 'A', H: 'H', D: 'D', PV: 'Osso', PM: 'Gás' }

function nonAttrEvents(lvl) {
  return (lvl.events || []).filter(e => e.type !== 'attribute')
}

function descreveEvento(ev) {
  if (ev.type === 'base_technique') return `Técnica base (${ev.id})`
  if (ev.type === 'unlock_special') return `⚡ abre **${ev.special_id}**`
  if (ev.type === 'special_rank') return `⬆ **${ev.special_id}** vira rank ${ev.rank}`
  if (ev.type === 'max_rank') return `★ ${ev.title}`
  return ev.type
}

const linhas = []
for (const ch of catalog.characters) {
  linhas.push(`### ${ch.name} — ${ch.combat_path} (${ch.special_path || '—'})`)
  linhas.push('')
  linhas.push('| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |')
  linhas.push('|---|---|---|---|---|---|---|')

  // Níveis a mostrar: 1, múltiplos de 5, e qualquer nível com evento de poder
  // que não caia num múltiplo de 5 (pra não perder o marco exato).
  const poderLevels = new Set(ch.levels.filter(l => nonAttrEvents(l).length > 0).map(l => l.level))
  const grade = new Set([1, LEVEL_CAP])
  for (let l = 5; l <= LEVEL_CAP; l += 5) grade.add(l)
  for (const l of poderLevels) grade.add(l)
  const niveis = [...grade].sort((a, b) => a - b)

  for (const n of niveis) {
    const lvl = ch.levels.find(l => l.level === n)
    if (!lvl) continue
    const eventosPoder = nonAttrEvents(lvl).map(descreveEvento).join('; ')
    linhas.push(`| ${n} | ${lvl.stats.A} | ${lvl.stats.H} | ${lvl.stats.D} | ${lvl.stats.PV} | ${lvl.stats.PM} | ${eventosPoder || '—'} |`)
  }
  linhas.push('')
}

console.log(linhas.join('\n'))
