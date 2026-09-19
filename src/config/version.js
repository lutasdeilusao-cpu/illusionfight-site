/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.213' // fix CRÍTICO: LDI Gangues - exploit real achado pelo Isaias: apertar Voltar reentrava na tela de vitória e reaplicava XP/AP/grana/item de novo, dava pra upar de graça só clicando voltar. Fases transitórias (combate/vitória) não entram mais na pilha do Voltar + trava redundante contra reaplicar a mesma recompensa 2x. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.34.0' // fix CRITICO (Isaias, 19/09/2026, achado logo depois do fix do Voltar/mapa v3.33.1): "2 coisas estranhas aconteceram, eu apertei voltar no mapa da pista e o Trinca do nada passou de nivel e voltou pra essa pagina [vitoria]... e ta me dando experiencia de novo, e e por isso que eu to conseguindo passar de nivel so apertando voltar, que erro drastico, tem que ser consertado agora". Causa raiz: a pilha de historico do Voltar (historicoRef, GanguesRoute.jsx) empilhava QUALQUER mudanca de fase sem distinguir - incluindo 'combat'/'victory'/'story-combat', que sao fases DE UMA VEZ SO com efeito colateral (useGanguesVictoryResolution aplica XP/AP/grana/item ao montar, guardado so por um useRef que reseta numa REMONTAGEM). Bastava a pilha, em algum momento, desempilhar de volta pra 'victory' (o que qualquer Voltar de qualquer tela alcancavel depois de uma vitoria podia fazer) que a tela de resultado remontava do zero e reaplicava a recompensa inteira de novo - um exploit real de duplicacao de XP so clicando Voltar repetidas vezes. Fix em 2 camadas: 1) GanguesRoute.jsx - 'combat'/'victory'/'story-combat' NUNCA entram na pilha do historico (GANGUES_FASES_TRANSITORIAS) - elas ja tem saida propria, nao sao "tela pra voltar" de verdade. 2) useGanguesVictoryResolution.js - trava REDUNDANTE: o proprio battleReport fica marcado `__resolvido` no STORE (sobrevive a remontagem, ao contrario do useRef local) - mesmo que outro bug de navegacao reabra a fase 'victory' no futuro, a recompensa nunca aplica 2x pro mesmo relatorio. Testado ao vivo via Playwright: XP foi de 0->5 na 1a aplicacao (nivel subiu de verdade) e ficou travado em 5 mesmo simulando 2 remontagens seguidas da tela de vitoria (o cenario exato do exploit).

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
