/* ══════════════════════════════════════════════════════════════
   TROFÉUS — conquistas do LDI Gangues.

   ID É NÚMERO (1xx progressão · 2xx combate · 3xx drop e coleção · 4xx rua).
   Texto no i18n por TIPO (`games.gangues.trofeus.tipos.<tipo>`), com {n}/{bairro};
   cada troféu só diz o tipo e o alvo. `medir(estado)` devolve o número atual,
   comparado com `alvo`. `recompensa`: { grana, itens: { [id]: qtd } }.

   `estado` (montado por estadoDosTrofeus, igual no jogo e no perfil):
   { storyProgress, roster, grana, rep, campaignClears, inventario, equipamentos }
   Contadores que não saem do save direto moram em storyProgress.__stats.
   ══════════════════════════════════════════════════════════════ */
const TERRITORIOS = ['pista', 'feira', 'baixada', 'vila', 'morro', 'alto', 'laje']
const CARTA_BASE = 10000
const stat = chave => e => Number(e.storyProgress?.__stats?.[chave]) || 0
const nivelDe = f => Math.min(99, 1 + Math.floor(Number(f?.xp_total) || 0))
const vistos = e => (e.storyProgress?.__itens || []).map(Number)
const cartasVistas = e => new Set(vistos(e).filter(id => id >= CARTA_BASE)).size
const todasAsPecas = e => [...(e.equipamentos || []), ...(e.roster || []).flatMap(f => Object.values(f?.attributes?.equipment || {}).filter(Boolean))]
const cartasEncaixadas = e => todasAsPecas(e).flatMap(p => (p.cards || []).filter(Boolean))
const album = e => (e.storyProgress?.__album || []).map(Number)
const albumHierarquia = e => album(e).filter(id => id >= 1101 && id < 1500).length
const albumChefes = e => album(e).filter(id => id >= 1500 && id < 1700).length

const T = (id, grupo, icone, tipo, alvo, medir, recompensa, params = {}) => ({ id, grupo, icone, tipo, alvo, medir, recompensa, params: { n: alvo, ...params } })
const g = (grana, itens = {}) => ({ grana, itens })

export const GANGUES_TROFEUS = [
  // Progressão
  ...TERRITORIOS.map((terr, i) => T(101 + i, 'progressao', '🏴', 'dominar', 1, e => (e.storyProgress?.[terr]?.chefe ? 1 : 0), g(100 * (i + 1), { 2: 2 }), { bairro: i + 1 })),
  T(108, 'progressao', '👑', 'zerar', 1, e => Number(e.campaignClears) || 0, g(3000, { 20: 1, 21: 1, 22: 1 })),
  T(109, 'progressao', '👑', 'zerar_de_novo', 2, e => Number(e.campaignClears) || 0, g(5000, { 34: 3 })),
  T(110, 'progressao', '⬆️', 'nivel', 10, e => Math.max(0, ...(e.roster || []).map(nivelDe)), g(50, { 1: 2 })),
  T(111, 'progressao', '⬆️', 'nivel', 20, e => Math.max(0, ...(e.roster || []).map(nivelDe)), g(150, { 1: 3 })),
  T(112, 'progressao', '⬆️', 'nivel', 50, e => Math.max(0, ...(e.roster || []).map(nivelDe)), g(800, { 41: 2 })),
  T(113, 'progressao', '⬆️', 'nivel', 99, e => Math.max(0, ...(e.roster || []).map(nivelDe)), g(4000, { 41: 5, 22: 1 })),
  T(114, 'progressao', '🧑‍🤝‍🧑', 'elenco', 3, e => (e.roster || []).length, g(80)),
  T(115, 'progressao', '🧑‍🤝‍🧑', 'elenco', 6, e => (e.roster || []).length, g(400, { 34: 1 })),
  T(116, 'progressao', '🧑‍🤝‍🧑', 'elenco', 12, e => (e.roster || []).length, g(1500, { 41: 3 })),
  // Combate
  T(201, 'combate', '👊', 'primeira_vitoria', 1, stat('vitorias'), g(20, { 1: 1 })),
  T(202, 'combate', '👊', 'vitorias', 50, stat('vitorias'), g(200, { 1: 3, 2: 3 })),
  T(203, 'combate', '👊', 'vitorias', 500, stat('vitorias'), g(1500, { 41: 3 })),
  T(204, 'combate', '💥', 'inimigos', 100, stat('inimigos'), g(150, { 13: 5 })),
  T(205, 'combate', '💥', 'inimigos', 1000, stat('inimigos'), g(1200, { 13: 20 })),
  T(206, 'combate', '💥', 'inimigos', 10000, stat('inimigos'), g(6000, { 20: 1, 21: 1, 22: 1 })),
  T(207, 'combate', '🛡️', 'chefe_perfeito', 1, stat('chefePerfeito'), g(500, { 21: 1 })),
  T(208, 'combate', '🥊', 'clube', 1, stat('clube'), g(300, { 34: 1 })),
  T(209, 'combate', '🥊', 'clube', 10, stat('clube'), g(2000, { 22: 2 })),
  T(210, 'combate', '🔁', 'revanche', 1, stat('revanches'), g(300, { 41: 1 })),
  T(211, 'combate', '🔁', 'revanche', 25, stat('revanches'), g(2500, { 20: 1, 21: 1, 22: 1 })),
  // Drop e coleção
  T(301, 'colecao', '🎁', 'drops', 1, stat('drops'), g(20)),
  T(302, 'colecao', '🎁', 'drops', 100, stat('drops'), g(300, { 13: 10 })),
  T(303, 'colecao', '🎁', 'drops', 1000, stat('drops'), g(2500, { 41: 3 })),
  T(304, 'colecao', '🔧', 'peca_encaixe', 1, stat('pecasEncaixe'), g(100)),
  T(305, 'colecao', '🔧', 'peca_dois_encaixes', 1, stat('pecasDoisEncaixes'), g(400, { 34: 1 })),
  T(306, 'colecao', '🃏', 'primeira_carta', 1, cartasVistas, g(300, { 41: 1 })),
  T(307, 'colecao', '🃏', 'cartas', 10, cartasVistas, g(1500, { 22: 1 })),
  T(308, 'colecao', '🃏', 'cartas', 50, cartasVistas, g(6000, { 20: 1, 21: 1, 22: 1 })),
  T(309, 'colecao', '🃏', 'cartas', 103, cartasVistas, g(20000, { 20: 3, 21: 3, 22: 3 })),
  T(310, 'colecao', '📌', 'carta_encaixada', 1, e => cartasEncaixadas(e).length, g(200)),
  T(311, 'colecao', '🃏', 'carta_chefe', 1, e => vistos(e).filter(id => id >= CARTA_BASE + 1500 && id < CARTA_BASE + 1700).length, g(3000, { 22: 1 })),
  T(312, 'colecao', '📖', 'album', 25, albumHierarquia, g(200, { 2: 3 })),
  T(313, 'colecao', '📖', 'album', 92, albumHierarquia, g(3000, { 41: 3 })),
  T(314, 'colecao', '📖', 'album_chefes', 7, albumChefes, g(2000, { 34: 3 })),
  T(315, 'colecao', '🎒', 'itens', 50, e => vistos(e).filter(id => id < CARTA_BASE).length, g(400)),
  T(316, 'colecao', '🎒', 'itens', 150, e => vistos(e).filter(id => id < CARTA_BASE).length, g(3000, { 41: 3 })),
  // Rua
  T(401, 'rua', '💵', 'grana', 1000, e => Number(e.grana) || 0, g(0, { 1: 3 })),
  T(402, 'rua', '💵', 'grana', 10000, e => Number(e.grana) || 0, g(0, { 41: 3 })),
  T(403, 'rua', '⚑', 'rep', 100, e => Number(e.rep) || 0, g(300)),
  T(404, 'rua', '⚑', 'rep', 500, e => Number(e.rep) || 0, g(1500, { 22: 1 })),
  T(405, 'rua', '🔨', 'aprimorar', 1, stat('aprimoramentos'), g(50, { 13: 3 })),
  T(406, 'rua', '🔨', 'aprimorar', 20, stat('aprimoramentos'), g(600, { 13: 15 })),
  T(407, 'rua', '🏷️', 'vendas', 50, stat('vendas'), g(200)),
  T(408, 'rua', '🎲', 'banca', 10, stat('bancaVitorias'), g(300, { 34: 1 })),
]

export const GANGUES_TROFEUS_GRUPOS = ['progressao', 'combate', 'colecao', 'rua']
export const getGanguesTrofeu = id => GANGUES_TROFEUS.find(tr => tr.id === Number(id)) || null

/** Estado que os troféus medem — do store do jogo ou de uma linha do banco. */
export function estadoDosTrofeus({ storyProgress = {}, roster = [], grana = 0, rep = 0, campaignClears = 0, inventario = {}, equipamentos = [] } = {}) {
  return { storyProgress, roster, grana, rep, campaignClears, inventario, equipamentos }
}

/** [atual, alvo] do troféu (atual nunca passa do alvo). */
export function progressoDoTrofeu(trofeu, estado) {
  return [Math.min(trofeu.alvo, trofeu.medir(estado)), trofeu.alvo]
}

/** Troféus que o estado já cumpre e ainda não estão marcados. */
export function trofeusNovos(estado) {
  const ja = new Set((estado.storyProgress?.__trofeus || []).map(Number))
  return GANGUES_TROFEUS.filter(tr => !ja.has(tr.id) && tr.medir(estado) >= tr.alvo)
}

/** Nome e descrição do troféu, nos 3 idiomas. */
export function textoTrofeu(t, trofeu) {
  const params = { ...trofeu.params, bairro: trofeu.params.bairro ? t(`games.gangues.album.terr.${trofeu.params.bairro}`) : '' }
  return { nome: t(`games.gangues.trofeus.tipos.${trofeu.tipo}.nome`, params), desc: t(`games.gangues.trofeus.tipos.${trofeu.tipo}.desc`, params) }
}
