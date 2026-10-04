/* Efeitos de carta dentro do golpe (resolveGanguesAction).
   Os efeitos fixos (atributo, Osso, energia) já entraram no `prepare`; aqui
   ficam os que dependem de chance ou do resultado do golpe. Cada combatente
   leva a lista em `cartaEfeitos` (data/ganguesCartas.js#efeitosDasCartas). */
import { getGanguesSpecialEffect } from './ganguesSpecialEffects.js'

const doTipo = (lista, tipo) => (lista || []).filter(e => e.tipo === tipo)

/** Talento solto pela carta num ataque normal (de graça), ou null. */
export function sortearAutoTalento(attacker, temTalentoAtivo, rnd = Math.random) {
  if (temTalentoAtivo) return null
  for (const e of doTipo(attacker.cartaEfeitos, 'autoTalento')) {
    if (rnd() < e.chance) return { id: e.talento, kind: 'active', level: e.nivel, effect: { ...getGanguesSpecialEffect(e.talento), cost: null }, daCarta: true }
  }
  return null
}

/** Status que a carta põe ao bater (se o talento não pôs nenhum). */
export function sortearStatusAoBater(attacker, rnd = Math.random) {
  for (const e of doTipo(attacker.cartaEfeitos, 'statusAoBater')) {
    if (rnd() < e.chance) return { id: e.status, turnos: null }
  }
  return null
}

/** O defensor é imune a esse status? */
export const imuneAoStatus = (defender, statusId) => doTipo(defender.cartaEfeitos, 'imune').some(e => e.status === statusId)

/** Ajusta o dano pelo lado de quem apanha: bloqueio e redução. */
export function defesaDasCartas(defender, damage, rnd = Math.random) {
  if (damage <= 0) return { damage, bloqueio: false }
  if (doTipo(defender.cartaEfeitos, 'bloqueio').some(e => rnd() < e.chance)) return { damage: 0, bloqueio: true }
  const reducao = doTipo(defender.cartaEfeitos, 'reduzDano').reduce((s, e) => s + e.v, 0)
  return { damage: Math.max(0, damage - reducao), bloqueio: false }
}

/** Osso que o atacante recupera pelas cartas depois do golpe. */
export function curaDasCartas(attacker, defender, damage, rnd = Math.random) {
  if (damage <= 0) return 0
  let cura = 0
  for (const e of doTipo(attacker.cartaEfeitos, 'curaAoBater')) if (rnd() < e.chance) cura += e.v
  if ((defender.pv || 0) > 0 && damage >= defender.pv) for (const e of doTipo(attacker.cartaEfeitos, 'curaAoDerrubar')) cura += e.v
  return cura
}

/** +% de grana na vitória somando as cartas do time. */
export const bonusGranaDasCartas = combatentes => (combatentes || []).reduce((s, c) => s + doTipo(c.cartaEfeitos, 'grana').reduce((x, e) => x + e.pct, 0), 0)
