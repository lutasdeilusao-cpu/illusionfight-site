/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-06-05
 */

// ── Site ──────────────────────────────────────────
export const SITE_VERSION = '1.59'

// ── Games ─────────────────────────────────────────
export const PP_VERSION     = '1.5.22'   // Pesadelo Particular
export const LDI_VERSION    = '1.0.61'   // Lendas do LDI
export const JACK_VERSION   = '5.1.1'    // Jack Dream Beer
export const ARENA_VERSION  = '1.7.3'    // LDI Arena Mode
export const TAMA_VERSION   = '1.4.1'    // Tamagoshi LDI
export const DUELO_VERSION  = '1.2.8'    // Duelo LDI
export const MINIGAMES_VERSION = '1.1.8' // MiniGames
export const MP_VERSION     = '1.0.9'    // Top Trumps Multiplayer
export const LDI_DIAG_VERSION = '1.0.4'  // LDI Diagnóstico
export const TATICA_VERSION  = '2.0.0'   // Arena LDI Tático

// ── Logs (executam na inicialização do site) ──────
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
console.log(`[PP] versão carregada: ${PP_VERSION}`)
console.log(`[LDI] versão carregada: ${LDI_VERSION}`)
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)
console.log(`[TÁTICA] versão carregada: ${TATICA_VERSION}`)
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)
console.log(`[DUELO] versão carregada: ${DUELO_VERSION}`)
console.log(`[MINIGAMES] versão carregada: ${MINIGAMES_VERSION}`)
console.log(`[MP] versão carregada: ${MP_VERSION}`)
