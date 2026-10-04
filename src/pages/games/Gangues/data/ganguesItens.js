import { ST, ST_TODOS } from '../engine/ganguesStatus.js'
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
   GanguesCombat.jsx). Loja e combate leem a lista inteira dinamicamente:
   • cura_pv / cura_pm — `valor` de PV/PM num aliado (+ `status` opcional).
   • buff — `status` (lista) num aliado: efeito temporário.
   • debuff_inimigos — `status` (lista) em TODOS os inimigos vivos.
   • material — item de quest/aprimoramento, sem efeito em combate.
   • poder_unico — chip de poder emprestado por 1 golpe.
   STATUS (27/09/2026, consumíveis da Feira): { attr: 'A'|'D'|'H', valor, acoes }
   — soma `valor` no atributo e dura `acoes` AÇÕES de quem carrega (cada ação
   dele gasta 1). Aplicado em combatente.statuses; o resolver soma A/D e a
   linha do tempo soma H (ver ganguesCombatResolver.js / ganguesLinhaDoTempo.js).
   Preço dos consumíveis da Feira ≈ 2,8 de grana por ponto de efeito (a
   mesma régua da poção: 5 PV por 14) — PLANO_ITENS_RANGE.md §5.
   ══════════════════════════════════════════════════════════════ */
const i18nNome = id => `games.gangues.itens.${id}`

const CATALOGO = [
  { id: 1, slug: 'pocao_hp', custo: 20, tipo: 'cura_pv', valor: 5, icone: '🩹' },
  { id: 2, slug: 'pocao_mp', custo: 20, tipo: 'cura_pm', valor: 5, icone: '💧' },
  // ── Consumíveis da Feira (vendidos no Camelô) ──
  { id: 3, slug: 'cigarro_palha', custo: 7, tipo: 'cura_pm', valor: 3, status: [{ attr: 'D', valor: -1, acoes: 1 }], icone: '🚬' },
  { id: 4, slug: 'water_energetico', custo: 22, tipo: 'cura_pm', valor: 8, icone: '🥤' },
  // Faixa de Pano: só drop (achados), não vende.
  { id: 5, slug: 'faixa_pano', custo: 0, tipo: 'cura_pv', valor: 3, icone: '🧻' },
  { id: 6, slug: 'pinga', custo: 18, tipo: 'buff', status: [{ attr: 'A', valor: 2, acoes: 2 }, { attr: 'D', valor: -1, acoes: 2 }], icone: '🍾' },
  { id: 8, slug: 'bombinha_fumaca', custo: 25, tipo: 'debuff_inimigos', status: [{ attr: 'H', valor: -1, acoes: 1 }], icone: '💨' },
  { id: 10, slug: 'farinha_guarana', custo: 20, tipo: 'cura_pv', valor: 7, icone: '🥣' },
  { id: 11, slug: 'vela_benta', custo: 18, tipo: 'buff', status: [{ attr: 'D', valor: 2, acoes: 2 }], icone: '🕯️' },
  { id: 12, slug: 'sacola_bala', custo: 6, tipo: 'cura_pv', valor: 2, icone: '🍬' },
  // `material` = item de quest/crafting, sem efeito em combate (a bolinha de
  // ação filtra por tipo — ver itensDisponiveis em GanguesCombat.jsx). A Sucata
  // cai no ferro-velho (POI `ferro` + `achado` da Pista), em ~20% das vitórias
  // de rua e o Camelô da Feira vende — é o material do aprimoramento.
  { id: 13, slug: 'sucata', custo: 10, venda: 1, tipo: 'material', valor: 0, icone: '🔩' },
  // Fetch quest do rádio do Toninho (Feira): 1 fio de cobre (do Quadro de
  // Luz) + 3 válvulas (a balança, a muamba e uma comprada no Camelô).
  { id: 14, slug: 'fio_cobre', custo: 0, tipo: 'material', valor: 0, icone: '🔌' },
  { id: 15, slug: 'valvula', custo: 20, tipo: 'material', valor: 0, icone: '💡' },
  // O café da Dona Cida (Baixada) — acorda o velho da entrada. Não vende.
  { id: 16, slug: 'cafe_do_veio', custo: 0, tipo: 'material', valor: 0, icone: '☕' },
  // A chave do elevador (Vila) — a Dona Neide entrega no 5º andar. Não vende.
  { id: 18, slug: 'chave_elevador', custo: 0, tipo: 'material', valor: 0, icone: '🔑' },
  // `poder_unico` = chip de poder emprestado: usar em combate concede, por 1
  // golpe, um poder de nível baixo que o personagem talvez nem tenha
  // treinado (ver forcedSpecial em ganguesSpecialEffects.js). custo: 0 =
  // não vendável, só ganho como recompensa dos conteúdos gateados por
  // reputação (evento de rua / galpão do Carvão-Cão Louco / Clube da Luta).
  { id: 20, slug: 'chip_do_bruto', custo: 0, tipo: 'poder_unico', poderId: 'soco_de_ferro', poderNivel: 2, icone: '👊' },
  { id: 21, slug: 'chip_da_muralha', custo: 0, tipo: 'poder_unico', poderId: 'postura_defensiva', poderNivel: 2, icone: '🛡️' },
  { id: 22, slug: 'chip_igneo', custo: 0, tipo: 'poder_unico', poderId: 'bola_de_fogo', poderNivel: 2, icone: '🔥' },
  // Curam STATUS (ganguesStatus.js) — status só sai com item ou no descanso
  // completo (Isaias, 28/09/2026). `status: ST_TODOS` limpa qualquer um.
  { id: 30, slug: 'gelo_no_tornozelo', custo: 12, tipo: 'cura_status', status: ST.MOSCANDO, icone: '🧊' },
  { id: 31, slug: 'atadura', custo: 12, tipo: 'cura_status', status: ST.SANGRANDO, icone: '🩹' },
  { id: 32, slug: 'cafe_forte', custo: 12, tipo: 'cura_status', status: ST.BRACO_MOLE, icone: '☕' },
  { id: 33, slug: 'pomada_arnica', custo: 12, tipo: 'cura_status', status: ST.GUARDA_ABERTA, icone: '🧴' },
  { id: 34, slug: 'xarope_da_vo', custo: 30, tipo: 'cura_status', status: ST_TODOS, icone: '🍶' },
  { id: 35, slug: 'balde_agua_fria', custo: 12, tipo: 'cura_status', status: ST.APAGADO, icone: '🪣' },
  { id: 36, slug: 'leite_quente', custo: 12, tipo: 'cura_status', status: ST.BATIZADO, icone: '🥛' },
  { id: 37, slug: 'agua_com_acucar', custo: 12, tipo: 'cura_status', status: ST.GROGUE, icone: '🥤' },
  { id: 38, slug: 'emplastro', custo: 12, tipo: 'cura_status', status: ST.TRAVADO, icone: '🩼' },
  { id: 39, slug: 'babosa', custo: 12, tipo: 'cura_status', status: ST.QUEIMADO, icone: '🌿' },
  // Poção de Osso (Vila, Brechó da Síndica): +20 PV — a régua da poção (~2,8 por ponto) com desconto de volume.
  { id: 41, slug: 'pocao_osso_20', custo: 80, tipo: 'cura_pv', valor: 20, icone: '🦴' },
]

export const GANGUES_ITENS = Object.fromEntries(CATALOGO.map(item => [item.id, { ...item, nome: i18nNome(item.id) }]))
export const GANGUES_ITENS_LISTA = Object.values(GANGUES_ITENS)

export function getGanguesItem(itemId) {
  const key = Number(itemId)
  if (!Number.isFinite(key)) return null
  return GANGUES_ITENS[key] || null
}

// Venda na loja: 25% do preço base, mínimo 1. `venda` no item fixa o valor
// (a sucata vale 1). Sem preço (item de missão) ou chip de poder = não vende.
export const GANGUES_VENDA_FRAC = 0.25
export function precoVendaItem(item) {
  if (!item || item.tipo === 'poder_unico') return 0
  if (Number.isFinite(item.venda)) return item.venda
  if (!(item.custo > 0)) return 0
  return Math.max(1, Math.floor(item.custo * GANGUES_VENDA_FRAC))
}

/** Tipos que dá pra usar no meio da luta (a bolinha de ação lista esses). */
export const GANGUES_TIPOS_USO_COMBATE = new Set(['cura_pv', 'cura_pm', 'cura_status', 'buff', 'debuff_inimigos', 'poder_unico'])

/** "+3 PM · −1 Couro (1 ação)" — o que o consumível faz, nos 3 idiomas. */
export function textoEfeitoItem(t, item) {
  if (!item) return ''
  const partes = []
  if (item.tipo === 'cura_pv') partes.push(`+${item.valor} PV`)
  if (item.tipo === 'cura_pm') partes.push(`+${item.valor} PM`)
  // cura_status guarda o id do status (número) ou uma lista de ids — não os
  // efeitos { attr, valor, acoes } dos outros tipos. Antes o loop iterava o
  // número e derrubava a loja inteira ("number 1 is not iterable").
  if (item.tipo === 'cura_status') {
    const ids = [].concat(item.status ?? []).filter(id => typeof id === 'number')
    const nomes = ids.includes(0) ? t('games.gangues.itens_efeito.todos_status') : ids.map(id => t(`games.gangues.status.${id}.nome`)).join(', ')
    if (nomes) partes.push(t('games.gangues.itens_efeito.cura', { s: nomes }))
  }
  for (const st of Array.isArray(item.status) ? item.status.filter(x => x && typeof x === 'object') : []) {
    const sinal = st.valor > 0 ? '+' : '−'
    const quem = item.tipo === 'debuff_inimigos' ? `${t('games.gangues.itens_efeito.inimigos')}: ` : ''
    partes.push(`${quem}${sinal}${Math.abs(st.valor)} ${t(`games.gangues.attr_labels.${st.attr}`)} (${t('games.gangues.itens_efeito.acoes', { n: st.acoes })})`)
  }
  if (item.tipo === 'material') partes.push(t('games.gangues.itens_efeito.material'))
  if (item.tipo === 'poder_unico') partes.push(t('games.gangues.itens_efeito.poder'))
  return partes.join(' · ')
}
