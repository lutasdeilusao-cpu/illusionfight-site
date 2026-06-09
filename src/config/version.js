/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-06-09
 */

// ── Site ──────────────────────────────────────────
export const SITE_VERSION = '9.72'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.1.0'  // Pesadelo Particular (+ i18n keys: selecione_slot, slot_label, slot_vazio)
export const LDI_VERSION       = '1.2.0'  // Lendas do LDI (BackToGamesBtn reposicionado no lobby)
export const JACK_VERSION      = '5.2.0'  // Jack Dream Beer (BackToGamesBtn unificado)
export const ARENA_VERSION     = '1.8.0'  // LDI Arena Mode (BackToGamesBtn unificado)
export const TAMA_VERSION      = '1.25.0' // Tamagoshi LDI (BackToGamesBtn dentro do fluxo tama-content)
export const DUELO_VERSION     = '1.5.0'  // Duelo LDI (tag EM BREVE + bloqueio admin)
export const MINIGAMES_VERSION = '1.7.0'  // MiniGames (SFX completo todos os minigames + simon says tonal)
export const TS_VERSION        = '5.8.0'  // Top Trumps Single Player
export const TM_VERSION        = '5.6.0'  // Top Trumps Multiplayer
export const TATICS_VERSION    = '7.3.0'  // Arena LDI Tatics (tag EM BREVE + bloqueio admin)

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