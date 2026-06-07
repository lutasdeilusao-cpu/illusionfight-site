/**
 * CARD POOL — Sistema de Sorteio de Cartas
 *
 * Pool fixo de 10 cartas liberáveis por jogador.
 * Cartas 11-20 do roster são exclusivas de tier ELITE/PRIMORDIAL.
 *
 * Regras:
 * - Carta 1: sempre KARUAK (sorteio entre os 6 KARUAKs do pool)
 * - Carta 2: sempre MORAKI ou TIVARA (sorteio entre todos os do pool dessas classes)
 * - Andares 1-8: 1 carta nova por andar, sorteio do pool restante
 * - Nunca repete carta já obtida
 * - A ordem de chegada é aleatória por conta
 */

import { ROSTER } from './roster'

/**
 * Retorna os personagens que estão no pool das 10 cartas
 */
export function getPool() {
  return ROSTER.filter(r => r.noPool === true)
}

/**
 * Verifica se um personagem está no pool
 */
export function estaNoPool(rosterId) {
  return getPool().some(r => r.id === rosterId)
}

/**
 * Sorteia carta inicial 1 — sempre KARUAK
 * @param {number[]} cartasJaObtidas - array de ids já obtidos
 * @returns {object|null} personagem sorteado
 */
export function sortearCartaInicial1(cartasJaObtidas = []) {
  const pool = getPool()
  const karauks = pool.filter(r =>
    r.classe === 'karuak' && !cartasJaObtidas.includes(r.id)
  )
  if (karauks.length === 0) return null
  return karauks[Math.floor(Math.random() * karauks.length)]
}

/**
 * Sorteia carta inicial 2 — sempre MORAKI ou TIVARA
 * @param {number[]} cartasJaObtidas
 * @returns {object|null} personagem sorteado
 */
export function sortearCartaInicial2(cartasJaObtidas = []) {
  const pool = getPool()
  const disponiveis = pool.filter(r =>
    (r.classe === 'moraki' || r.classe === 'tivara') &&
    !cartasJaObtidas.includes(r.id)
  )
  if (disponiveis.length === 0) return null
  return disponiveis[Math.floor(Math.random() * disponiveis.length)]
}

/**
 * Sorteia próxima carta do pool — qualquer papel, sem repetir
 * @param {number[]} cartasJaObtidas
 * @returns {object|null} personagem sorteado ou null se pool completo
 */
export function sortearProximaCarta(cartasJaObtidas = []) {
  const pool = getPool()
  const restantes = pool.filter(r => !cartasJaObtidas.includes(r.id))
  if (restantes.length === 0) return null
  return restantes[Math.floor(Math.random() * restantes.length)]
}

/**
 * Verifica se o jogador já completou o pool de 10 cartas
 * @param {number[]} cartasJaObtidas
 * @returns {boolean}
 */
export function poolCompleto(cartasJaObtidas = []) {
  return cartasJaObtidas.length >= 10
}

/**
 * Retorna a quantidade de cartas restantes no pool
 */
export function cartasRestantes(cartasJaObtidas = []) {
  return 10 - cartasJaObtidas.length
}

/**
 * Retorna os dados do personagem por id do roster
 */
export function getCartaInfo(rosterId) {
  return ROSTER.find(r => r.id === rosterId) || null
}

/**
 * Retorna a lista de personagens KARUAK disponíveis no pool
 */
export function getKarauksDisponiveis(cartasJaObtidas = []) {
  return getPool().filter(r => r.classe === 'karuak' && !cartasJaObtidas.includes(r.id))
}

/**
 * Retorna a lista de personagens MORAKI ou TIVARA disponíveis no pool
 */
export function getMorakiOuTivaraDisponiveis(cartasJaObtidas = []) {
  return getPool().filter(r =>
    (r.classe === 'moraki' || r.classe === 'tivara') &&
    !cartasJaObtidas.includes(r.id)
  )
}
