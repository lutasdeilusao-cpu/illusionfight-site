// Retratos de NPC — mesma ideia de ganguesPortraits.js (só a CABEÇA, pixel
// art), mas pra gente de fora do elenco recrutável (o Nego Véio da birosca,
// futuros donos de loja/chefes de bairro etc.) — catálogo separado porque
// NPC não tem `character_template_id` nem entrada no catálogo de 30
// personagens, só um slug próprio usado direto pelo componente que fala
// com ele (GangDialog).
//
// Arte mora em src/pages/games/Gangues/assets/npcs/<slug>/<expressao>.png
// — mesma convenção de pasta-por-entidade, já preparado pra ganhar mais
// expressões (piscando, sorrindo...) depois sem mexer aqui. Hoje só existe
// `nego_veio/neutro.png` (pedido do Isaias, 14/09/2026: "essa cabecinha
// tem que aparecer... já deixa preparado pra receber animações").
const ARQUIVOS_NEUTRO = import.meta.glob('../assets/npcs/*/neutro.png', { eager: true, import: 'default' })

const NPC_PORTRAITS = { neutro: {} }
for (const [caminho, url] of Object.entries(ARQUIVOS_NEUTRO)) {
  const slug = caminho.match(/npcs\/([^/]+)\/neutro\.png$/)?.[1]
  if (slug) NPC_PORTRAITS.neutro[slug] = url
}

/** Retrato (cabeça) do NPC pelo slug. `expressao` default 'neutro' — é a
 *  única que existe hoje. Retorna null se não tiver arte pra esse NPC
 *  ainda — quem chama já trata isso caindo no fallback (inicial do nome). */
export function getGanguesNpcPortrait(slug, expressao = 'neutro') {
  if (!slug) return null
  return NPC_PORTRAITS[expressao]?.[slug] || null
}
