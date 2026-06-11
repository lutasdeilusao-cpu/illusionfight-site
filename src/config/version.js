/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-06-11
 */

// ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.4.0'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.2.0'  // Pesadelo Particular (i18n completo: casos, locais, pistas, suspeitos, narrativas, inimigos pt/en/es)
export const LDI_VERSION       = '2.0.0'  // Lendas do LDI (i18n completo: scenes, manual, powers, char data, creation flow)
export const JACK_VERSION      = '5.2.0'  // Jack Dream Beer (BackToGamesBtn unificado)
export const ARENA_VERSION     = '1.20.0'  // LDI Arena: power name reveal + power SFX + TTS voice antes do DramaticDice
export const TAMA_VERSION      = '1.26.0' // Tamagoshi LDI (i18n completo: badges, passeios, loja, personalidades, saude, partida, notificacoes pt/en/es)
export const DUELO_VERSION     = '2.7.1'  // Duelo LDI (fix TELEPORT: fluxo completo de selecionar monstro → escolher destino → teleportar)
export const MINIGAMES_VERSION = '2.0.0'  // MiniGames (i18n completo: todos os puzzles traduzidos pt/en/es)
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