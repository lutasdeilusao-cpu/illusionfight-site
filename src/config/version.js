/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-06-11
 */

// ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.46.0'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.2.0'  // Pesadelo Particular (i18n completo: casos, locais, pistas, suspeitos, narrativas, inimigos pt/en/es)
export const LDI_VERSION       = '2.0.0'  // Lendas do LDI (i18n completo: scenes, manual, powers, char data, creation flow)
export const JACK_VERSION      = '5.2.0'  // Jack Dream Beer (BackToGamesBtn unificado)
export const ARENA_VERSION     = '1.25.1'  // LDI Arena: fix getState error após tela de vitória
export const TAMA_VERSION      = '2.1.0' // Tamagoshi LDI — refactor: remove hardcoded strings (use t()), move inline styles to CSS
export const DUELO_VERSION     = '2.7.1'  // Duelo LDI (fix TELEPORT: fluxo completo de selecionar monstro → escolher destino → teleportar)
export const MINIGAMES_VERSION = '2.0.0'  // MiniGames (i18n completo: todos os puzzles traduzidos pt/en/es)
export const TS_VERSION        = '5.14.0'  // Top Trumps Single Player: fix — 5 cartas únicas por jogador na partida + tentativas consomem por partida
export const TM_VERSION        = '5.8.1'  // Top Trumps Multiplayer: fix — dedup no carregamento do deck
export const TATICS_VERSION    = '7.3.0'  // Arena LDI Tatics (tag EM BREVE + bloqueio admin)
export const PROTOTYPE_VERSION = '1.0.1' // Protótipo — botão Exportar dentro do HTML, sem wrapper

// ── Logs (executam na inicialização do site) ──────
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
console.log(`[PP] versão carregada: ${PP_VERSION}`)
console.log(`[LDI] versão carregada: ${LDI_VERSION}`)
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)
console.log(`[PROTOTYPE] versão carregada: ${PROTOTYPE_VERSION}`)
console.log(`[TATICS] versão carregada: ${TATICS_VERSION}`)
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)
console.log(`[DUELO] versão carregada: ${DUELO_VERSION}`)
console.log(`[MINIGAMES] versão carregada: ${MINIGAMES_VERSION}`)
console.log(`[TS] versão carregada: ${TS_VERSION}`)
console.log(`[TM] versão carregada: ${TM_VERSION}`)