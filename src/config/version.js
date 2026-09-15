/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.158' // feat: LDI Gangues - ladder de nivel fixo da Pista corrigida pra progressao de 3 em 3 sem excecao (1a luta=3, depois 8/11/14/17/20/23/26, Carvao=30) + mecanica de dupla agora e assimetrica (1o corpo cheio, 2o corpo 2-3 pontos abaixo). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.3.0' // feat (Isaias, correção direta e explícita depois de conferir a leva anterior — "para de inventar e segue o que eu tô mandando, é de 3 em 3"): 2 mudanças. (1) Ladder da Pista virou "1ª luta (sinal) é MUITO fácil de propósito, ficha 3 fixa — a partir da 2ª luta sobe de 3 em 3 sem exceção, cada inimigo novo obriga a ralar uns 3 níveis pro próximo": sinal=3, ferro(falha)=8, beco=8, beco_2=11, beco_3=14, Sinaleiro Chefe=17, Rasteira Velha=20, posmuro_1=23, posmuro_2=26, Carvão=30 (quebra o padrão de propósito — "pra ser difícil, pra ser ralado"), rinha realinhada com `sinal` (3, já que é farm disponível desde o início, antes até do ferro-velho abrir). `GANGUES_CHEFE_BUDGET.pista` 33→50 (corpos=2/liderFrac=0.6 → Carvão 30 + escolta 20); badge "· NÍVEL" do Carvão em `gangues-enemies.json` 20→30. (2) Mecânica de dupla mudou de verdade (não só número): Isaias corrigiu que "não é os dois saírem iguais — um tem a ficha OFICIAL daquele poi, o outro fica 2-3 níveis abaixo" — `gerarBandoRevezamento` trocou o desconto uniforme ×0.75 nos dois corpos por uma dedução assimétrica (`GANGUES_DUPLA_DEDUCAO_MIN/MAX` = 2-3), só a partir do 2º corpo. Verificado com a função real rodada 2000× fora do navegador antes de aplicar: 1º corpo sempre no valor cheio, 2º sempre 2-3 abaixo, nunca mais "os dois amaciados igual".
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
