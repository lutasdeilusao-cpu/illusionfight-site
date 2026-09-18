/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.187' // fix: LDI Gangues - merge de 2 sessoes concorrentes no corpo inteiro do recrutamento: apresentacao automatica (frente/lado/costas a cada 2.5s) + toque no personagem volta a abrir a ficha (ciclo por botao pequeno dedicado, nao mais a imagem inteira) + parede oficial nao infla mais em desktop. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.23.0' // fix: merge de 2 sessoes concorrentes que mexeram no mesmo corpo-inteiro-do-recrutamento ao mesmo tempo. Sessao A (v3.22.0, ja publicada): trocou o ciclo de pose por toque por apresentacao AUTOMATICA (frente->lado->costas a cada 2.5s, `setInterval` em GanguesRetratoCorpo.jsx, pedido do Isaias porque o toque nao era descoberto) e corrigiu as poses `costas`/`lado` estourando pra fora da caixa de 342px (a `<img>` continuava com `max-height:100%` sem altura definida - mesma familia de bug do fix anterior, so que no filho, nao no container; fix: `position:absolute; left:50%; bottom:0; transform:translateX(-50%)` na propria imagem). Sessao B (esta, local): corrigiu, SEM SABER da sessao A ainda, que a v3.21.0 fazia a IMAGEM INTEIRA ser o botao de ciclo - no card do carrossel isso roubava o toque que sempre abriu a ficha, travando a selecao/montagem da gangue (Isaias reportou com print do menu oficial travado) - e que `.gang-brickwall-bg`/`.gang-saves` (parede oficial) inflava e cortava em qualquer desktop sem emulador (`background-attachment:fixed`+`cover` calcula contra o viewport, nao contra a coluna de 480px; trocado pra `scroll`, 4a armadilha do mobile-only documentada na Biblia/AGENTS.md). Merge: GanguesRetratoCorpo.jsx fica com o `setInterval` automatico da sessao A POR CIMA da estrutura da sessao B (`<div>` visual + botao pequeno dedicado `.gang-corpo-cycle` no canto, em vez de a imagem inteira ser `<button>`) - o auto-ciclo roda igual, o toque manual continua so no botaozinho (nao mais na imagem toda), e o card volta a abrir a ficha em qualquer lugar fora do botao. Ordem de poses (frente/lado/costas) e fix de crop da sessao A preservados como estavam. Testado ao vivo apos o merge: auto-ciclo troca sozinho, toque no botaozinho cicla sem abrir ficha, toque na imagem/card abre a ficha, selecao+confirmacao de recrutamento OK, parede correta em 1280x900 e 390x844 - zero erro de console.

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
