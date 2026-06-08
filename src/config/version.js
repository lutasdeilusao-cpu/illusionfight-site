/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-06-08
 */

// ── Site ──────────────────────────────────────────
export const SITE_VERSION = '9.6'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '1.7.0'  // Pesadelo Particular
export const LDI_VERSION       = '1.0.61' // Lendas do LDI
export const JACK_VERSION      = '5.1.4'  // Jack Dream Beer
export const ARENA_VERSION     = '1.7.3'  // LDI Arena Mode
export const TAMA_VERSION      = '1.11.0' // Tamagoshi LDI
export const DUELO_VERSION     = '1.2.9'  // Duelo LDI
export const MINIGAMES_VERSION = '1.3.0'  // MiniGames
export const TS_VERSION        = '5.3.0'  // Top Trumps Single Player
export const TM_VERSION        = '5.3.0'  // Top Trumps Multiplayer
export const TATICS_VERSION    = '7.0.0'  // Arena LDI Tatics

// ── Logs (executam na inicialização do site) ──────
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
console.log(`[PP] versão carregada: ${PP_VERSION}`)
console.log(`[LDI] versão carregada: ${LDI_VERSION}`)
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)
console.log(`[TATICS] versão carregada: ${TATICS_VERSION}`)
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)
console.log(`[DUELO] versão carregada: ${DUELO_VERSION}`)
console.log(`[MINIGAMES] versão carregada: ${MINIGAMES_VERSION}`)
console.log(`[TS] versão carregada: ${TS_VERSION}`)
console.log(`[TM] versão carregada: ${TM_VERSION}`)