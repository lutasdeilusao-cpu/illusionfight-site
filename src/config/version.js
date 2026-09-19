/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.215' // fix: LDI Gangues - o aviso "recomendado: tropa no nível X" antes da treta comparava pontos da ficha (não nível de verdade) contra o nível real da tropa, sempre alarmista demais. Convertido pra nível real equivalente antes de comparar/exibir. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.34.2' // fix (Isaias, 19/09/2026, mesmo card de novo, com raiva - "de novo essa porra, a ficha dele tem 2+2+4=8 pontos, isso e nivel 3, como ele ta me cobrando nivel 8? revisa isso direito"): o aviso "⚠ Recomendado: tropa no nivel X" (que eu tinha deixado de fora do fix anterior, v3.34.1) usava o MESMO `poi.nivelRec` desalinhado - comparava pontos de ficha direto contra o nivel REAL da tropa (nivelTropa, calculado via XP de verdade), sempre soando mais alarmista do que deveria. Fix: nova funcao nivelRealDePontos (data/ganguesDificuldade.js) converte pontos de ficha pro nivel real equivalente ANTES de comparar/exibir, usando a curva real do catalogo (nivel 1 nasce com ~7 pontos em media, +1 ponto por nivel dai pra frente - GANGUES_PONTOS_NIVEL_1=7). NAO mexe no orcamento de combate (pontosFixo/budgetPorCorpo continuam os mesmos, a luta em si nao muda nada) - so a traducao pontos->nivel na tela do aviso fica honesta. Testado: "beco" (8 pontos) agora avisa nivel real ~2 (antes dizia 8); Carvao, chefe final da Pista (30 pontos) agora ~24; posmuro_2 (26 pontos) ~20 - a progressao relativa da ladder continua igual, só a escala de exibicao foi corrigida.

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
