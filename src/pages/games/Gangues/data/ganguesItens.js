/* ══════════════════════════════════════════════════════════════
   Catálogo de CONSUMÍVEL (poções, por enquanto).

   ⚠️ ID É NÚMERO, NUNCA NOME (mesma regra do equipamento e dos 30
   personagens). `slug` é só leitura humana. O nome que aparece na tela
   mora no i18n (`games.gangues.itens.<id>` nos 3 idiomas) — renomear é só
   no JSON de idioma, sem tocar em código.

   Faixa de id: consumível é 1–99, equipamento (data/ganguesEquip.js) é
   101+ — faixas separadas de propósito (os dois alimentam o mesmo
   `poi.itens` da loja).

   `tipo` decide o efeito em combate (ver handleUsarItem em
   GanguesCombat.jsx). Loja e combate leem a lista inteira dinamicamente.
   ══════════════════════════════════════════════════════════════ */
const i18nNome = id => `games.gangues.itens.${id}`

const CATALOGO = [
  { id: 1, slug: 'pocao_hp', custo: 14, tipo: 'cura_pv', valor: 5, icone: '🩹' },
  { id: 2, slug: 'pocao_mp', custo: 14, tipo: 'cura_pm', valor: 5, icone: '💧' },
  // `material` = item de quest/crafting, sem efeito em combate (a bolinha de
  // ação filtra por tipo — ver itensDisponiveis em GanguesCombat.jsx). A Sucata
  // cai no ferro-velho (POI `ferro` + `achado` da Pista) e o Seu Nando troca
  // por uma peça (POI `oficina`).
  { id: 13, slug: 'sucata', custo: 0, tipo: 'material', valor: 0, icone: '🔩' },
]

export const GANGUES_ITENS = Object.fromEntries(CATALOGO.map(item => [item.id, { ...item, nome: i18nNome(item.id) }]))
export const GANGUES_ITENS_LISTA = Object.values(GANGUES_ITENS)

export function getGanguesItem(itemId) {
  const key = Number(itemId)
  if (!Number.isFinite(key)) return null
  return GANGUES_ITENS[key] || null
}
