/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.206' // fix: LDI Gangues - bando de multidão garantida (ex. galpão do Carvão) dava ficha CHEIA pra todos os corpos, virava impossível em grupo; agora só o líder leva a ficha cheia, o resto vem um degrau abaixo. + regra da frustração: 2 derrotas seguidas na história suaviza a próxima luta (1 inimigo, metade da ficha). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.30.1' // fix (Isaias, 19/09/2026, seguindo direto do v3.30.0 - "garantido que ate os personagens em multidao vao respeitar essas regras de ficha? [...] se voce meter seis personagens de ficha de 14 pontos contra dois personagens nao vai ninguem conseguir passar [...] regra da frustracao: se deu uma batalha muito dificil, a gente tem que fazer uma batalha mais facil na proxima vez pra evitar problema de frustracao de muita derrota seguida"): 1) BUG achado - gerarBandoRevezamento com `multidaoGarantida` (qtdMin/qtdMax, ex. galpao do Carvao) dava a ficha CHEIA (budgetPorCorpo sem deducao nenhuma) pra TODOS os corpos do bando - um grupo de 5 contra um personagem nivel 14 virava 5 fichas de 14, impossivel de vencer. Corrigido: so o 1o corpo (lider) leva a ficha cheia, o resto vem um degrau abaixo (GANGUES_MULTIDAO_DEGRAU_ABAIXO=3, mesmo passo da ladder de territorio) - "nivel 14 -> escolta de 11", exatamente como ele descreveu. 2) NOVO: "regra da frustracao" (GANGUES_FRUSTRACAO_LIMIAR=2 em data/ganguesDificuldade.js) - derrotas SEGUIDAS na historia (storyProgress.__derrotasSeguidas, zera em qualquer vitoria) a partir do limiar suavizam a PROXIMA treta comum com a mesma tecnica da 1a luta (suavizarPrimeiraLuta: um inimigo so, metade da ficha - nao "ficha cheia mais fraca", confirmado por ele). Contagem feita no unico lugar onde toda luta da historia termina (useGanguesBattleOutcome.js -> finish()). Testado ao vivo via Playwright: bando de 5 contra ficha 14 saiu [14,11,11,11,11]; sequencia derrota-derrota-vitoria mostrou a 3a luta caindo pela metade e a 4a (pos-vitoria) voltando ao normal.

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
