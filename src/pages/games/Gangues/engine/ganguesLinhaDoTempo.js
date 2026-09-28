/* ══════════════════════════════════════════════════════════════
   LINHA DO TEMPO do combate — o "Pique" (26/09/2026).

   Substitui a ordem de iniciativa fixa (Malícia + d3, sorteada uma vez).
   Inspiração: Medabots (GBA) e o ATB do Chrono Trigger — cada lutador sai
   da largada e corre até o centro; chegou, age; depois volta pra largada.
   A velocidade de verdade aparece: quem tem muito mais Pique age mais vezes.

   Regras (fechadas com o Isaias):
   - Cada combatente tem uma barra de 0 a TL_LIMIAR que enche com a
     velocidade = Pique + base da luta. Chegou em TL_LIMIAR, é a vez dele.
   - A base da luta = TL_BASE_FRAC (10%) × a ficha MÉDIA (A+H+D+PV+PM) de todos os
     combatentes. Ela resolve quem tem pouco Pique e mantém o efeito estável
     do nível 1 ao 99. Calibrado por simulação (26/09/2026): com 35% o Pique
     valia quase nada (dano é subtração, 1 de Porrada/Couro pesa muito); com
     10%, trocar Osso/Malandragem por Pique fica parelho.
   - TETO: ninguém anda mais que TL_TETO × o mais lento vivo. "Um cara muito
     rápido consegue fazer três ataques" — isso aparece quando a ficha tá
     muito desequilibrada (nível 99 voltando pra Pista, que tem valor
     absoluto de inimigo), não numa luta parelha.
   - Agir custa TL_CUSTO_ACAO. Talento custa TL_CUSTO_TALENTO (o "preparo":
     golpe pesado demora mais pra voltar, como no Medabots).
   - Uma RODADA fecha quando todo mundo vivo agiu pelo menos 1 vez (é o que
     `actedThisRound` e os talentos de "alvo que ainda não agiu" usam).
   Lógica pura, sem React — useGanguesTurnMachine.js e ganguesBrigaMultidao.js
   usam as MESMAS funções, pra os dois motores nunca divergirem.
   ══════════════════════════════════════════════════════════════ */

import { multVelocidadeStatus, tickStatusAoAgir } from './ganguesStatus.js'

export const TL_LIMIAR = 100
export const TL_CUSTO_ACAO = 100
export const TL_CUSTO_TALENTO = 125
export const TL_TETO = 3
export const TL_BASE_FRAC = 0.1

const ATRIBUTOS = ['A', 'H', 'D', 'PV', 'PM']
export function pontosDaFicha(c) {
  return ATRIBUTOS.reduce((s, k) => s + (Number(c?.attributes?.[k]) || 0), 0)
}

/** Base de velocidade da luta (fixa do começo ao fim da luta). */
export function baseDaLuta(combatants) {
  if (!combatants?.length) return 5
  const media = combatants.reduce((s, c) => s + pontosDaFicha(c), 0) / combatants.length
  return Math.max(2, Math.round(TL_BASE_FRAC * media))
}

/** Velocidade de cada combatente VIVO, já com o teto de 3× o mais lento vivo. */
export function velocidades(combatants, base) {
  const vivos = combatants.filter(c => c.pv > 0)
  // Lerdo (status) corta a velocidade pela metade.
  const bruta = new Map(vivos.map(c => [c.key, ((Number(c.attributes?.H) || 0) + base) * multVelocidadeStatus(c.statuses)]))
  const lenta = Math.min(...bruta.values())
  const out = new Map()
  for (const [k, v] of bruta) out.set(k, Math.min(v, lenta * TL_TETO))
  return out
}

/** Estado inicial: todo mundo na largada, com um empurrãozinho aleatório
 *  pequeno só pra desempatar quem tem a mesma velocidade. */
export function iniciarLinhaDoTempo(combatants, rand = Math.random) {
  const base = baseDaLuta(combatants)
  const barras = {}
  for (const c of combatants) barras[c.key] = rand() * 6
  return { base, barras }
}

/** Avança o tempo até alguém vivo chegar no limiar. Devolve quem age e as
 *  barras já avançadas (nada é consumido aqui — isso é `consumirVez`). */
export function proximaVez(combatants, tempo) {
  const vel = velocidades(combatants, tempo.base)
  if (!vel.size) return { key: null, tempo }
  let dt = Infinity
  for (const [k, v] of vel) dt = Math.min(dt, Math.max(0, (TL_LIMIAR - (tempo.barras[k] || 0)) / v))
  const barras = { ...tempo.barras }
  for (const [k, v] of vel) barras[k] = (barras[k] || 0) + v * dt
  let escolhido = null
  for (const [k, v] of vel) {
    if (barras[k] < TL_LIMIAR - 1e-6) continue
    if (!escolhido || barras[k] > barras[escolhido] + 1e-6 || (Math.abs(barras[k] - barras[escolhido]) <= 1e-6 && v > vel.get(escolhido))) escolhido = k
  }
  return { key: escolhido, tempo: { ...tempo, barras } }
}

/** Quem agiu volta pra largada (desconta o custo da ação). */
export function consumirVez(tempo, key, usouTalento = false) {
  return { ...tempo, barras: { ...tempo.barras, [key]: (tempo.barras[key] || 0) - (usouTalento ? TL_CUSTO_TALENTO : TL_CUSTO_ACAO) } }
}

/** Marca quem agiu e, se TODO vivo já agiu, fecha a rodada (reseta as marcas). */
export function marcarAgiu(combatants, key) {
  // Quem agiu paga os status (sangramento) e eles perdem uma vez.
  const marcados = combatants.map(c => (c.key === key ? { ...tickStatusAoAgir(c).combatant, actedThisRound: true } : c))
  const vivos = marcados.filter(c => c.pv > 0)
  const fechou = vivos.length > 0 && vivos.every(c => c.actedThisRound)
  return { combatants: fechou ? marcados.map(c => ({ ...c, actedThisRound: false })) : marcados, fechouRodada: fechou }
}

/** Ordem de velocidade pra exibir (log/relatório): do mais rápido pro mais lento. */
export function ordemDeVelocidade(combatants, tempo) {
  const vel = velocidades(combatants, tempo.base)
  return combatants
    .map(c => ({ key: c.key, side: c.side, ability: Number(c.attributes?.H) || 0, base: tempo.base, total: Math.round(vel.get(c.key) || 0) }))
    .sort((a, b) => b.total - a.total)
}

/** Progresso visual (0 a 1) de cada combatente até o centro da pista. */
export function progressoNaPista(tempo) {
  const out = {}
  for (const [k, g] of Object.entries(tempo.barras)) out[k] = Math.max(0, Math.min(1, g / TL_LIMIAR))
  return out
}
