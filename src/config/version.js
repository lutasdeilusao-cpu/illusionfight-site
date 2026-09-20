/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.224' // feat: LDI Gangues - mapa da Pista menos estatico (retratos ciclados nas tretas de pool, sem quadradinho de trigger separado) + merge do pino "birosca do Nato" com o Descanso. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.42.0' // feat (Isaias, 20/09/2026, com prints do mapa: "todos os personagens aqui durante a pista deveriam tar usando carinhas... nenhum tem as carinhas... deveriam ter animacoes... tira esse quadradinho, usa a colisao do proprio personagem" + "ta repetindo a cara do nego velho duas vezes, a missao dele pode aparecer no descanso, ai o pino fica verde... e o corre do nato vira um botao dentro do descanso"): 3 mudancas no mapa navegavel da Pista. (1) Tretas de pool aleatorio (beco/beco_2/beco_3/rinha/tunel*/galpao_m1/posmuro_1 - as que sorteiam o inimigo, ver revezamento em pois.js) agora mostram um retrato de VERDADE em vez do icone generico (✊) - cicla entre 2+ moldes do proprio pool a cada 2.6s (useCicloPool, GanguesCenaAtores.jsx), o que de quebra ja e a "animacaozinha" pedida (respeita prefers-reduced-motion). (2) EntryZone (o quadradinho tracejado que acendia do lado do pino quando perto) removido - agora e o proprio pino que pulsa mais forte (classe is-perto, farmDe/PinoAlvo). (3) POI `birosca` (papo a parte, mesma cara do Nego Velho do Descanso, so revelava beco_2/corre) removido - beco revela beco_2 direto, e a oferta do corre do Nato virou uma tela dentro do PROPRIO modal de Descanso (ofertaFlagId em pois.js, GanguesDescanso.jsx), com o pino de Descanso ficando verde (farolDe/ofertaPendente, ganguesCenaMotor.js) enquanto a oferta nao for decidida. Testado ao vivo (Playwright): mapa real sem quadradinhos + retrato ciclando na rinha; harness isolado forcando "beco vencido" - tela do Nato aparece, aceitar revela `corre` de verdade e volta pro descanso normal.

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
