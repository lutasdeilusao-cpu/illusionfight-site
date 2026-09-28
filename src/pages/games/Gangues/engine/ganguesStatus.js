/* ══════════════════════════════════════════════════════════════
   STATUS de combate (28/09/2026, pedido do Isaias).

   Só o MANDINGUEIRO causa status (talento com `status` no efeito, ver
   ganguesSpecialEffects.js) — Porradeiro e Paredão nunca. Vale pros dois
   lados: inimigo mandingueiro de status (ganguesPersonas.js) e o jogador.

   Cada status dura N VEZES do lutador que carrega: toda vez que ele age,
   o contador desce 1 (tickStatusAoAgir). Reaplicar renova a duração.
   Lógica pura — os dois motores (normal e Multidão) usam estas funções.
   ══════════════════════════════════════════════════════════════ */

export const GANGUES_STATUS = {
  lerdo: { icone: '🐢', duracao: 2 },     // Pique pela metade na linha do tempo
  sangrando: { icone: '🩸', duracao: 3 }, // perde 1 de Osso a cada vez que age (não mata)
  fraco: { icone: '🥀', duracao: 2 },     // −2 de Porrada
  rachado: { icone: '💢', duracao: 2 },   // −2 de Couro
}

export const GANGUES_STATUS_IDS = Object.keys(GANGUES_STATUS)

const tem = (statuses, id) => (statuses || []).some(s => s.id === id)

/** Aplica (ou renova) um status. Devolve a lista nova. */
export function aplicarStatus(statuses = [], id, turnos) {
  if (!GANGUES_STATUS[id]) return statuses
  const duracao = Math.max(1, Number(turnos) || GANGUES_STATUS[id].duracao)
  return [...statuses.filter(s => s.id !== id), { id, turnos: duracao }]
}

export const modAtaqueStatus = statuses => (tem(statuses, 'fraco') ? -2 : 0)
export const modDefesaStatus = statuses => (tem(statuses, 'rachado') ? -2 : 0)
export const multVelocidadeStatus = statuses => (tem(statuses, 'lerdo') ? 0.5 : 1)

/** Depois que o lutador age: sangramento cobra 1 de Osso (nunca abaixo de 1)
 *  e todo status perde uma vez. Devolve o combatente novo + o que aconteceu
 *  (pro log). */
export function tickStatusAoAgir(combatant) {
  const statuses = combatant.statuses || []
  if (!statuses.length || combatant.pv <= 0) return { combatant, sangrou: 0, expirados: [] }
  const sangrou = tem(statuses, 'sangrando') && combatant.pv > 1 ? 1 : 0
  const restantes = statuses.map(s => ({ ...s, turnos: s.turnos - 1 }))
  return {
    combatant: { ...combatant, pv: combatant.pv - sangrou, statuses: restantes.filter(s => s.turnos > 0) },
    sangrou,
    expirados: restantes.filter(s => s.turnos <= 0).map(s => s.id),
  }
}
