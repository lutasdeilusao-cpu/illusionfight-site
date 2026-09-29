/* ══════════════════════════════════════════════════════════════
   APOSTAS (29/09/2026, pedido do Isaias) — a fonte de grana do farm, fora
   da porrada. Três jeitos:
   1. DESAFIO DE MÃO: aposta, joga um puzzle sorteado, paga pela dificuldade.
   2. RINHA DE APOSTA: duas fichas NPC brigam sozinhas (motor da Multidão),
      o jogador aposta num lado; a cotação sai da chance real, com margem
      da casa.
   3. APOSTA EM VOCÊ: antes de uma treta, aposta em si; paga pelo risco
      (mesma régua de risco do AP, ganguesVictoryResolver.js).
   O teto de aposta sobe com a reputação, pra não virar máquina infinita
   logo no começo. Lógica pura — as telas só chamam estas funções.
   ══════════════════════════════════════════════════════════════ */
import { iniciarBrigaMultidaoDeCombatentes, avancarRodadaMultidao } from '../engine/ganguesBrigaMultidao.js'
import { prepare } from '../hooks/useGanguesTurnMachine.js'
import { escalarInimigo } from './ganguesEncontros.js'

export const APOSTA_VALORES = [10, 25, 50, 100, 200]

/** Maior aposta liberada pela reputação da gangue. */
export function tetoAposta(rep = 0) {
  if (rep < 10) return 25
  if (rep < 25) return 50
  if (rep < 50) return 100
  return 200
}

export const apostasPossiveis = (rep, grana) => APOSTA_VALORES.filter(v => v <= tetoAposta(rep) && v <= grana)

// ── 1. Desafio de mão ──
// Puzzles da lib compartilhada (src/components/Puzzles) — todos com o mesmo
// contrato onSolve/onFail + config.difficulty. O Sliding fica de fora (tem
// estilo inline de outro jogo).
export const DESAFIO_PUZZLES = ['simon', 'decoder', 'forca', 'anagrama', 'labirinto', 'stealth']
export const DESAFIO_DIFICULDADES = [
  { id: 'easy', mult: 1.5 },
  { id: 'medium', mult: 2 },
  { id: 'hard', mult: 3 },
]
export const sortearPuzzle = (rand = Math.random) => DESAFIO_PUZZLES[Math.floor(rand() * DESAFIO_PUZZLES.length)]
export const premio = (valor, mult) => Math.round(valor * mult)

// ── 2. Rinha de aposta (NPC x NPC) ──
export const RINHA_MARGEM_CASA = 0.1
const SIMULACOES_COTACAO = 150

// Dois lutadores montados como combatentes do motor. O lado B entra como
// 'player' só pro motor da Multidão ter dois lados — nenhum dos dois é do jogador.
function montarLutadores(a, b) {
  const ca = prepare(a, 'enemy', 0)
  const cb = { ...prepare(b, 'enemy', 1), side: 'player', key: `player-0-${b.id}` }
  return [cb, ca]
}

/** Roda UMA briga completa. Devolve { vencedor: 'a'|'b', eventos }. */
export function rodarBrigaNpc(a, b) {
  let estado = iniciarBrigaMultidaoDeCombatentes(montarLutadores(a, b), 1)
  const eventos = []
  let guarda = 0
  while (!estado.terminado && guarda++ < 60) {
    estado = { ...estado, ...avancarRodadaMultidao(estado) }
    eventos.push(...estado.eventosRodada)
  }
  return { vencedor: estado.outcome === 'defeat' ? 'a' : 'b', eventos, combatants: estado.combatants }
}

/** Sorteia a dupla da rinha (moldes do pool, escalados perto um do outro)
 *  e calcula as cotações simulando a briga várias vezes. */
export function montarRinhaApostas({ pool, enemiesData, pontosBase, rand = Math.random }) {
  // Sorteia o id ANTES de procurar (sortear dentro do find tirava um número
  // novo a cada ficha comparada e às vezes não achava nenhuma).
  const molde = () => { const id = pool[Math.floor(rand() * pool.length)]; return enemiesData.find(e => e.id === id) }
  // Mesma ficha pros dois (a diferença é só o molde) — briga parelha, cotação
  // que dá vontade de apostar no azarão.
  const pts = Math.max(3, Math.round(pontosBase * (0.9 + rand() * 0.2)))
  const pontos = () => pts
  // `molde` = id do catálogo (nome e retrato); `id` próprio pra os dois
  // nunca colidirem, mesmo sorteando o mesmo molde.
  const ma = molde(), mb = molde()
  const a = { ...escalarInimigo(ma, pontos()), id: 'rinha-a', molde: ma.id }
  const b = { ...escalarInimigo(mb, pontos()), id: 'rinha-b', molde: mb.id }
  let vitoriasA = 0
  for (let i = 0; i < SIMULACOES_COTACAO; i++) if (rodarBrigaNpc(a, b).vencedor === 'a') vitoriasA++
  // Cotação pela chance REAL (margem da casa nos dois lados): nunca dá lucro
  // esperado apostando, nem no favorito disparado.
  const pa = Math.min(0.98, Math.max(0.02, vitoriasA / SIMULACOES_COTACAO))
  const cot = p => Math.max(1.02, Math.floor(((1 - RINHA_MARGEM_CASA) / p) * 100) / 100)
  return { a, b, cotacaoA: cot(pa), cotacaoB: cot(1 - pa) }
}

// ── 3. Aposta em você ──
const pontosFicha = attrs => ['A', 'H', 'D', 'PV', 'PM'].reduce((s, k) => s + (Number(attrs?.[k]) || 0), 0)

/** Multiplicador da aposta em si, pela ficha do inimigo contra o seu mais
 *  forte: mais de 5 acima ×3 · 1–5 acima ×2 · até 2 abaixo ×1,5 · mais
 *  fraco que isso ×1,1 (farmar fraco com aposta quase não rende). */
export function multApostaEmVoce(pontosInimigo, roster = []) {
  const maisForte = Math.max(1, ...roster.map(m => pontosFicha(m.attributes)))
  const dif = (Number(pontosInimigo) || 0) - maisForte
  if (dif > 5) return 3
  if (dif >= 1) return 2
  if (dif >= -2) return 1.5
  return 1.1
}
