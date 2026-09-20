/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.228' // fix: LDI Gangues - refeita a animacao de andar dos personagens (era rotacao "bebada" de curto alcance, virou passada de verdade sem giro, ate 100px+ de distancia, com bounce de passo "tuc tuc"). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.45.0' // fix (Isaias, muito puto, 2 prints comparando a posicao ANTES/DEPOIS do personagem: "nao refaz essa porra e refaz direito, eles nao estao andando, estao tipo balancando... [print A] ate [print B] e pra ele andar tipo dali do predio ate aqui no meio da rua... muda essa animacao porque parece que ele ta bebado, faz uma animacao de caminhada, tuc tuc tuc tuc, e faz eles andar BASTANTE"): 3ª tentativa da andadinha, refeita do zero. Causa dos 2 problemas: (1) a rotacao alternada (rotate(-8deg)->8deg) girava o corpo inteiro junto com o deslocamento - "parece bebado" - removida por completo, andar nao gira mais; (2) alcance de so ±18-33px (`--gp-w`, GanguesCenaAtores.jsx) num mapa desse tamanho nem parecia deslocamento - subiu pra 60-115px (quase o triplo). Timing function trocada de ease-in-out pra steps(10) - anda em passadas discretas, nao desliza suave feito fantasma. O "tuc tuc tuc" pedido virou um elemento SEPARADO (`.gang-world-npc-passo`, span aninhado dentro do span que anda) - um bounce vertical curto e rapido, continuo, independente da direcao, porque uma unica `transform` no mesmo elemento nao acumula dois movimentos diferentes (deslocamento longo + passo rapido) ao mesmo tempo, cada efeito precisa do proprio elemento. Testado ao vivo via Playwright (nao só a olho): confirmado por getComputedStyle que a rotacao é ZERO em toda a animação (era essa a causa do "bêbado"), amplitude real chegando a ±103px (era ±18-33px), valores em passos discretos (61.8→103→61.8→41.2→0→-41.2...) confirmando o steps(), e o bounce do "tuc tuc" oscilando 0/-2/-4px de forma independente.

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
