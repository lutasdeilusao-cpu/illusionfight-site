/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-07-02
 */

// ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.191.0'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.1'  // Jack Dream Beer — guest aviso visual fix (centralizado, card, botão)
export const ARENA_VERSION     = '1.31.1'  // ArenaVictory: CSS extraído de inline style para classes
export const TAMA_VERSION      = '3.3.3' // Tamagoshi LDI — fix: RestaurarSaude check inventário só na entrada (useState init)
export const DUELO_VERSION     = '2.8.1'  // Duelo LDI — TrapActivator: CSS extraído de inline para arquivo próprio
export const MINIGAMES_VERSION = '4.2.0'  // +4 jogos Rafael (Maze, Glitch, BulletHell, Stabilizer) + integração catálogo
export const TS_VERSION        = '5.44.7'  // Top Trumps — revertido ao estado de 655604fd (v1 + v2 restaurados)
export const TM_VERSION        = '5.12.0'  // Top Trumps MP: JSON v2 migration — id numérico em vez de slug
export const TATICS_VERSION    = '7.5.0'  // Arena LDI Tatics — fix: centralização padX hexgrid (gridSpan em vez de gridW)
export const SRGRM_VERSION = '3.5.0' // SRGRM 3v3 — extração fiel do original rpg_3v3-3-4-1.html, 129 funções preservadas
export const ARENATESTBED_VERSION = '6.22.0' // Jokempo reutilizável: migrado do JokenpoModal
export const KP_VERSION = '1.4.0' // Manual do operador + botão Voltar + ?aba=kernel na URL
export const SLIDING_VERSION   = '1.3.0'  // PuzzleSlidingRafael — CSS: portrait container, padding mínimo, tile sizing corrigido
export const CODIGO_VERSION    = '1.3.0'  // PuzzleCodigoPerdido — CSS: portrait container, padding mínimo, keyboard sem max-width
export const MAZE_VERSION      = '1.0.0'  // PuzzleMazeRafael — MG-02 Labirinto (Canvas DFS maze)
export const GLITCH_VERSION    = '1.0.0'  // PuzzleGlitchRafael — MG-04 Encontre o Glitch (DOM grid)
export const BULLETHELL_VERSION = '1.0.0' // PuzzleBulletHellRafael — MG-05 Bullet Hell (Canvas shmup)
export const STABILIZER_VERSION = '1.0.0' // PuzzleStabilizerRafael — MG-06 Estabilizador (DOM bar)

// ── Logs (executam na inicialização do site) ──────
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
console.log(`[PP] versão carregada: ${PP_VERSION}`)
console.log(`[LDI] versão carregada: ${LDI_VERSION}`)
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)
console.log(`[ARENA] versão carregada: ${ARENA_VERSION}`)
console.log(`[TATICS] versão carregada: ${TATICS_VERSION}`)
console.log(`[SRGRM] versão carregada: ${SRGRM_VERSION}`)
console.log(`[ARENATESTBED] versão carregada: ${ARENATESTBED_VERSION}`)
console.log(`[KP] versão carregada: ${KP_VERSION}`)
console.log(`[TAMA] versão carregada: ${TAMA_VERSION}`)
console.log(`[DUELO] versão carregada: ${DUELO_VERSION}`)
console.log(`[MINIGAMES] versão carregada: ${MINIGAMES_VERSION}`)
console.log(`[SLIDING] versão carregada: ${SLIDING_VERSION}`)
console.log(`[CODIGO] versão carregada: ${CODIGO_VERSION}`)
console.log(`[MAZE] versão carregada: ${MAZE_VERSION}`)
console.log(`[GLITCH] versão carregada: ${GLITCH_VERSION}`)
console.log(`[BULLETHELL] versão carregada: ${BULLETHELL_VERSION}`)
console.log(`[STABILIZER] versão carregada: ${STABILIZER_VERSION}`)
console.log(`[TS] versão carregada: ${TS_VERSION}`)
console.log(`[TM] versão carregada: ${TM_VERSION}`)