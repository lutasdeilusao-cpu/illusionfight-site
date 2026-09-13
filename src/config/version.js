/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.109' // fix: 2 bugs na navegacao de interiores da cena LDI Gangues (birosca/oficina/loja/tunel/galpao) - (1) a porta de saida tinha um vao tao estreito na parede (gap de ~70px, PLAYER_RADIUS=18) que so 2 colunas exatas da grade de movimento (TILE=20) deixavam passar sem trombar - agora todas as 7 portas/saidas afetadas tem vao de 160px (~7 colunas). (2) ao trocar interior<->rua, o marcador do jogador (GangMarker, motion.div com animate={{left,top}}) animava a transicao inteira entre 2 espacos de coordenada incompativeis (mundo pequeno do comodo vs WORLD gigante da rua), um glitch visual de "cair num lugar vazio" antes de assentar - motion.div ganhou initial={false} (nao bastava so trocar a key: Framer Motion ainda montava com um valor medido do DOM em vez de saltar direto pro alvo).

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.75.38' // fix: navegacao de interiores travava numa porta de pixel exato + glitch de teleporte ao sair. Isaias reportou: preso tentando sair da Birosca do Seu Nato, so passa numa posicao certinha, e ao sair e "lancado num lugar vazio" antes de assentar. Causa 1: vao da porta nas paredes (interiores.js) media so ~70px - com PLAYER_RADIUS=18 e grade TILE=20, sobravam so 2 colunas validas pra atravessar sem colidir. Alargado pra 160px (~7 colunas) nas 7 portas/saidas afetadas (birosca, birosca_2, oficina, loja, tunel x2, galpao). Causa 2: GangMarker (motion.div, animate={{left,top}}) animava a posicao INTEIRA entre o espaco de coordenada pequeno do comodo e o WORLD gigante da rua ao trocar `local` - key={local?...} sozinho nao bastou (Framer Motion ainda montava a partir de um valor medido do DOM), resolvido com initial={false} no motion.div (GanguesCenaAtores.jsx). Verificado via Playwright (rAF polling do estilo left/top): marcador agora salta direto pro alvo em 1 frame, sem interpolar entre os 2 espacos.
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
