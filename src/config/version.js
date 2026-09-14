/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.132' // fix+feat: LDI Gangues - dialogo confinado a coluna mobile-only (position:fixed sem left/right:var(--app-gutter) esticava full-bleed em tela larga) + tela de batizar a gangue reconstruida de verdade (a 1a tentativa so trocou o fundo, deixou o painel antigo intocado - rejeitada). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.81.0' // fix+feat: dois pedidos do Isaias na mesma leva. (1) FIX: .gang-dlg-overlay (dialogo grande) usava position:fixed;inset:0, que gruda nas bordas do VIEWPORT FISICO, nao da coluna de 480px - a armadilha 'mobile only' documentada em AGENTS.md/index.css. Reportado com print de DevTools em 825px (a parede de tijolo/dialogo esticava ate a borda da janela); corrigido com left/right:var(--app-gutter), o mesmo bloco que todo overlay fixed do site usa - boundingBox confirmado em 480px centralizado via Playwright. Nao mexi nos ~15 outros overlays fixed pre-existentes do jogo com o mesmo padrao potencialmente problematico (fora de escopo deste bug). (2) FEAT: GanguesNaming.jsx (tela de batizar a gangue) RECONSTRUIDA de verdade - a 1a tentativa (2.80.0) so tinha trocado o fundo da pagina pra parede de tijolo e deixado o PAINEL inteiro intocado (caixinha de texto 'LDI GANGUES' em vez da logo oficial, moldura ambar generica, botao padrao do resto do jogo) - rejeitada com razao ('reaproveitando tudo de antes'). GanguesNaming.css novo: cartaz rasgado colado na parede (clip-path irregular + fita nos cantos), logo oficial (PNG por idioma, mesmo asset de GanguesSaveSelect) substituindo a caixinha de texto, titulo em Permanent Marker, e o CTA 'Fundar a Gangue' no mesmo desenho spray-paint (halo de neblina de tinta) de GanguesSaveSelect - nada reaproveitado do painel antigo. Bloco morto antigo (.gang-naming-poster/__stamp) removido de GanguesModesRedesign.css. Verificado ao vivo via Playwright: cartaz completo renderizando com a logo oficial, fita, titulo em pichacao e CTA spray, zero erro de console.
export const TAMA_VERSION      = '3.4.1' // Tamagoshi LDI — preserva oferta inicial ao voltar do gacha pago
export const DUELO_VERSION     = '2.8.1'  // Duelo LDI — TrapActivator: CSS extraído de inline para arquivo próprio
export const MINIGAMES_VERSION = '4.3.6'  // PuzzleStealthGrid: d-pad na tela sempre (mobile tambem) + grade nao vaza mais do viewport
export const TS_VERSION        = '6.0.3'  // Top Trumps SP - fix: cartas cortadas em telas baixas (escala por JS) + audio iOS Chrome + player da Nina toca em mobile
export const TM_VERSION        = '6.0.2'  // Top Trumps MP - alinhado com SP 6.0.2 (GameOverScreen compartilhado)
export const TATICS_VERSION    = '7.5.0'  // Arena LDI Tatics — fix: centralização padX hexgrid (gridSpan em vez de gridW)
export const SRGRM_VERSION = '3.5.0' // SRGRM 3v3 — extração fiel do original rpg_3v3-3-4-1.html, 129 funções preservadas
export const ARENATESTBED_VERSION = '6.22.1' // correção de encoding em comentário e chevrons
export const KP_VERSION = '1.4.2' // Kernel Panic — header CSS limitado ao próprio jogo
export const SLIDING_VERSION   = '1.4.4'  // fix: grid quadrado (--sr-side = Math.min(w,h)) em vez de flex esticado
export const CODIGO_VERSION    = '1.3.3'  // merge wrapper+puzzle em 1 arquivo + fix commit
export const MAZE_VERSION      = '1.1.4'  // fix: getUnvisitedNeighbors usava mazeRef.current antes de ser atribuído
export const GLITCH_VERSION    = '1.1.7'  // DIAG: console.log handleClick + endGame para depurar vitoria
export const BULLETHELL_VERSION = '1.1.3' // fix: null ref em startGame (countdown sem canvas)
export const STABILIZER_VERSION = '1.1.2' // merge wrapper+puzzle em 1 arquivo + fix commit

// ── Logs (executam na inicialização do site) ──────
console.log(`[SITE] versão carregada: ${SITE_VERSION}`)
console.log(`[PP] versão carregada: ${PP_VERSION}`)
console.log(`[LDI] versão carregada: ${LDI_VERSION}`)
console.log(`[JACK] versão carregada: ${JACK_VERSION}`)
console.log(`[GANGUES] versão carregada: ${GANGUES_VERSION}`)
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
