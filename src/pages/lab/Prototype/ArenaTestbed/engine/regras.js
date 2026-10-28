/**
 * Regras do golpe — LDI Arena.
 * Única fonte de verdade do combate: jogador e IA passam por aqui.
 * Puro (sem React, sem animação): recebe quem bate, quem apanha e os poderes
 * escolhidos e devolve tudo já rolado — acerto, dano, contra-ataque e ataque extra.
 */

import { resolverAtaque, resolverContraAtaque, calcularFD, getChanceAcerto, rolarD6 } from './combat'
import { executarMecanica } from './mecanicasPoder'
import { getPoderesPorId } from '../data/poderes'

/** Poderes do personagem com aquele gatilho que ele consegue pagar agora. */
export function poderesDisponiveis(char, gatilho, poderesIds) {
  return getPoderesPorId(poderesIds || char.poderesEscolhidos || [])
    .filter(p => p.gatilho === gatilho && char.mp >= p.custoMP)
}

/** O poder mais forte que ele consegue pagar (ataque mede FA, defesa mede FD). */
export function melhorPoder(char, gatilho, poderesIds) {
  const campo = gatilho === 'ataque' ? 'fa' : 'fd'
  return poderesDisponiveis(char, gatilho, poderesIds)
    .reduce((best, p) => (!best || (p.valorComparativo?.[campo] ?? 0) > (best.valorComparativo?.[campo] ?? 0) ? p : best), null)
}

function resolverExtra(atacante, alvo, faBase) {
  const fa = Math.round((faBase / 2) * 10) / 10
  const d6Def = rolarD6()
  const criticoDef = d6Def === 6
  const fd = calcularFD(alvo, criticoDef, d6Def)
  const logs = [
    `⚡ ATAQUE EXTRA! FA = ${fa}`,
    `🎲 ${alvo.nome} FD extra: ARM=${alvo.arm} AGI=${alvo.agi} d6=${d6Def}${criticoDef ? ' [CRÍTICO DEFENSIVO]' : ''} → FD=${fd}`,
  ]
  const dano = criticoDef ? 0 : Math.max(1, Math.round(fa - fd))
  logs.push(criticoDef ? `🛡️ ${alvo.nome} defendeu criticamente o ataque extra!` : `💥 Dano extra: ${dano}`)
  return { dano, criticoDef, logs }
}

/**
 * Resolve um golpe inteiro.
 * @param {object} atacante
 * @param {object} alvo
 * @param {{ distancia: number, poderAtaque?: object|null, poderDefesa?: object|null }} opcoes
 * @returns {{
 *   acertou: boolean, chance: number,
 *   custoAtaque: number, custoDefesa: number, reducao: number,
 *   golpe: object|null, dano: number,
 *   contra: { dano: number, logs: string[] }|null,
 *   extra: { dano: number, criticoDef: boolean, logs: string[] }|null,
 *   logs: string[] }}
 */
export function resolverGolpe(atacante, alvo, { distancia = 1, poderAtaque = null, poderDefesa = null } = {}) {
  const logs = []
  const custoAtaque = poderAtaque && atacante.mp >= poderAtaque.custoMP ? poderAtaque.custoMP : 0
  const custoDefesa = poderDefesa && alvo.mp >= poderDefesa.custoMP ? poderDefesa.custoMP : 0
  const reducao = custoDefesa ? (poderDefesa.valorComparativo?.fd ?? 0) : 0

  const atacanteFinal = custoAtaque
    ? executarMecanica(poderAtaque.mecanicaId, poderAtaque.params, { atacante })
    : atacante
  if (custoAtaque) logs.push(`⚡ ${atacante.nome} usa ${poderAtaque.chaveI18n} (-${custoAtaque} MP)`)
  if (custoDefesa) logs.push(`🛡️ ${alvo.nome} usa ${poderDefesa.chaveI18n} (-${custoDefesa} MP, -${reducao} de dano)`)

  const chance = getChanceAcerto(atacante.dex, alvo.agi)
  const acertou = Math.random() <= chance
  if (!acertou) {
    logs.push(`❌ ${atacante.nome} errou ${alvo.nome}! (chance: ${Math.round(chance * 100)}%)`)
    return { acertou, chance, custoAtaque, custoDefesa, reducao, golpe: null, dano: 0, contra: null, extra: null, logs }
  }

  const golpe = resolverAtaque(atacanteFinal, alvo, Math.ceil(distancia))
  logs.push(...golpe.logs)
  const dano = golpe.criticoDefensivo ? 0 : Math.max(1, golpe.dano - reducao)
  if (reducao && !golpe.criticoDefensivo) logs.push(`Defesa reduz ${reducao}: dano final ${dano}`)

  const contra = golpe.criticoDefensivo ? resolverContraAtaque(alvo, atacante, golpe.fa / 2) : null
  const extra = golpe.ataqueExtra ? resolverExtra(atacante, alvo, golpe.fa) : null

  return { acertou, chance, custoAtaque, custoDefesa, reducao, golpe, dano, contra, extra, logs }
}
