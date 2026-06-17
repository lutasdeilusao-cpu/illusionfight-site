/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-06-16
 */

// ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.131.0'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.1'  // Jack Dream Beer — guest aviso visual fix (centralizado, card, botão)
export const ARENA_VERSION     = '1.31.0'  // LDI Arena Testbed: fixes linha de visão PDF, morte/partida, ataque pós-movimento, flag AGI
export const TAMA_VERSION      = '2.5.1' // Tamagoshi LDI — guest aviso no termo (título, texto explicativo, link cadastro)
export const DUELO_VERSION     = '2.8.0'  // Duelo LDI (tagline i18n pt/en/es: "Já pensou em jogar Yu-Gi-Oh...?")
export const MINIGAMES_VERSION = '2.0.0'  // MiniGames (i18n completo: todos os puzzles traduzidos pt/en/es)
export const TS_VERSION        = '5.22.3'  // Top Trumps SP: multiplayer travado para guest (modal de login)
export const TM_VERSION        = '5.11.0'  // Top Trumps Multiplayer: cron job limpar-salas-fantasma reduzido de 5min para 24h (3h da manhã)
export const TATICS_VERSION    = '7.4.0'  // Arena LDI Tatics (tagline i18n pt/en/es: "Já pensou em jogar Pokémon...?")
export const MORTO_VERSION = '1.0.0' // Morto em Jaime — 3v3 RPG engine (teste bege)
export const ARENATESTBED_VERSION = '1.5.0' // Arena Testbed — canvas tamanho do grid, centralização via CSS

// ── Logs (executam na inicialização do site) ──────
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
console.log(`[PP] versão carregada: ${PP_VERSION}`)
console.log(`[LDI] versão carregada: ${LDI_VERSION}`)
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)
console.log(`[TATICS] versão carregada: ${TATICS_VERSION}`)
console.log(`[MORTO] versão carregada: ${MORTO_VERSION}`)
console.log(`[ARENATESTBED] versão carregada: ${ARENATESTBED_VERSION}`)
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)
console.log(`[DUELO] versão carregada: ${DUELO_VERSION}`)
console.log(`[MINIGAMES] versão carregada: ${MINIGAMES_VERSION}`)
console.log(`[TS] versão carregada: ${TS_VERSION}`)
console.log(`[TM] versão carregada: ${TM_VERSION}`)