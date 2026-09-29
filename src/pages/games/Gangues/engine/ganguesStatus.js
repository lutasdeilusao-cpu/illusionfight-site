/* ══════════════════════════════════════════════════════════════
   STATUS de combate (28/09/2026, pedido do Isaias — inspiração: Pokémon).

   Só o MANDINGUEIRO causa status (talento com `status` no efeito, ver
   ganguesSpecialEffects.js) — Porradeiro e Paredão nunca. Vale pros dois
   lados: inimigo mandingueiro de status (ganguesPersonas.js) e o jogador.

   Cada status dura N VEZES do lutador que carrega: toda vez que chega a vez
   dele (agindo ou perdendo a vez), o contador desce 1 (tickStatusAoAgir).
   Reaplicar renova. Nenhum dano de status mata: para em 1 de Osso.
   Status persiste entre lutas; sai com item ou no descanso completo.
   Lógica pura — os dois motores (normal e Multidão) usam estas funções.
   ══════════════════════════════════════════════════════════════ */

// ID É NÚMERO (regra do projeto): o nome na tela mora no i18n
// (`games.gangues.status.<id>`), então renomear é só mexer no JSON de idioma.
// `slug` é só leitura humana. As constantes deixam o código legível.
export const ST = { MOSCANDO: 1, SANGRANDO: 2, BRACO_MOLE: 3, GUARDA_ABERTA: 4, APAGADO: 5, BATIZADO: 6, GROGUE: 7, TRAVADO: 8, QUEIMADO: 9 }
/** Item que cura qualquer status (`status: ST_TODOS`). */
export const ST_TODOS = 0

export const GANGUES_STATUS = {
  1: { slug: 'moscando', icone: '🐢', duracao: 2 },     // Pique pela metade
  2: { slug: 'sangrando', icone: '🩸', duracao: 3 },    // −1 de Osso por vez
  3: { slug: 'braco_mole', icone: '🥀', duracao: 2 },   // −2 de Porrada
  4: { slug: 'guarda_aberta', icone: '💢', duracao: 2 }, // −2 de Couro
  5: { slug: 'apagado', icone: '💤', duracao: 3 },      // dorme: perde a vez; acorda ao apanhar
  6: { slug: 'batizado', icone: '🧪', duracao: 4 },     // −1/8 do Osso máximo por vez
  7: { slug: 'grogue', icone: '😵', duracao: 3 },       // 1 em 3: bate num aliado (ou em si)
  8: { slug: 'travado', icone: '⚡', duracao: 3 },      // Pique pela metade + 1 em 4 de perder a vez
  9: { slug: 'queimado', icone: '🔥', duracao: 3 },     // −1/16 do Osso máximo por vez e −2 de Porrada
}

// Save gravado na v3.64 (status com nome em vez de número) → número.
const LEGADO = { lerdo: 1, sangrando: 2, fraco: 3, rachado: 4, apagado: 5, envenenado: 6, tonto: 7, travado: 8, queimado: 9 }
/** Normaliza a lista de status vinda do save. */
export function normalizarStatus(lista) {
  if (!Array.isArray(lista)) return []
  return lista.filter(s => s?.id != null).map(s => ({ ...s, id: LEGADO[s.id] ?? Number(s.id) })).filter(s => GANGUES_STATUS[s.id] && s.turnos > 0)
}

const tem = (statuses, id) => (statuses || []).some(s => s.id === id)

/** Aplica (ou renova) um status. Apagado sorteia 1–3 vezes (igual o sono do
 *  Pokémon) quando o talento não fixa a duração. */
export function aplicarStatus(statuses = [], id, turnos, rand = Math.random) {
  if (!GANGUES_STATUS[id]) return statuses
  const padrao = id === ST.APAGADO ? 1 + Math.floor(rand() * 3) : GANGUES_STATUS[id].duracao
  const duracao = Math.max(1, Number(turnos) || padrao)
  return [...statuses.filter(s => s.id !== id), { id, turnos: duracao }]
}

/** Quem apanha de verdade (dano > 0) acorda. */
export const acordarAoApanhar = (statuses = [], dano = 0) => (dano > 0 ? statuses.filter(s => s.id !== ST.APAGADO) : statuses)

export const modAtaqueStatus = statuses => (tem(statuses, ST.BRACO_MOLE) ? -2 : 0) + (tem(statuses, ST.QUEIMADO) ? -2 : 0)
export const modDefesaStatus = statuses => (tem(statuses, ST.GUARDA_ABERTA) ? -2 : 0)
export const multVelocidadeStatus = statuses => (tem(statuses, ST.MOSCANDO) || tem(statuses, ST.TRAVADO) ? 0.5 : 1)

/** Chegou a vez: o status impede de agir? Devolve o motivo ('apagado' | 'travado' — chave do log) ou null. */
export function statusImpedeAcao(combatant, rand = Math.random) {
  if (tem(combatant.statuses, ST.APAGADO)) return 'apagado'
  if (tem(combatant.statuses, ST.TRAVADO) && rand() < 0.25) return 'travado'
  return null
}

/** Tonto: 1 em 3 de o golpe ir num aliado do próprio lado (ou nele mesmo,
 *  se estiver sozinho). Devolve o alvo final. */
export function alvoComTontura(ator, alvo, combatants, rand = Math.random) {
  if (!alvo || !tem(ator.statuses, ST.GROGUE) || rand() >= 1 / 3) return alvo
  const aliados = combatants.filter(c => c.side === ator.side && c.pv > 0 && c.key !== ator.key)
  return aliados.length ? aliados[Math.floor(rand() * aliados.length)] : ator
}

/** Depois da vez do lutador: dano de status (nunca abaixo de 1 de Osso) e
 *  todo status perde uma vez. */
export function tickStatusAoAgir(combatant) {
  // A lista também guarda BUFF de item ({ attr, valor, acoes } — ganguesItens.js),
  // que conta à parte (gastarAcaoStatus): aqui só mexe nos status (com `id`).
  const todos = combatant.statuses || []
  const buffs = todos.filter(s => s.id == null)
  const statuses = todos.filter(s => s.id != null)
  if (!statuses.length || combatant.pv <= 0) return { combatant, perdeu: 0, expirados: [] }
  const max = Math.max(1, combatant.pvMax || 1)
  let dano = 0
  if (tem(statuses, ST.SANGRANDO)) dano += 1
  if (tem(statuses, ST.BATIZADO)) dano += Math.max(1, Math.floor(max / 8))
  if (tem(statuses, ST.QUEIMADO)) dano += Math.max(1, Math.floor(max / 16))
  const perdeu = Math.max(0, Math.min(dano, combatant.pv - 1))
  const restantes = statuses.map(s => ({ ...s, turnos: s.turnos - 1 }))
  return {
    combatant: { ...combatant, pv: combatant.pv - perdeu, statuses: [...buffs, ...restantes.filter(s => s.turnos > 0)] },
    perdeu,
    expirados: restantes.filter(s => s.turnos <= 0).map(s => s.id),
  }
}
