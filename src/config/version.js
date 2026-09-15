/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.163' // fix: LDI Gangues - botao de sair do lobby cortando abaixo da dobra em telas comuns (card do elenco herdava o tamanho grande do recrutamento). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.8.0' // fix (Isaias, "botão sair tá cortando no lobby das gangues... diminuindo tudo"): o card do elenco no lobby (`.gang-fighter-card`, `GanguesLobby.jsx`/`RosterCarousel`) reaproveitava as MESMAS dimensões grandes do card de recrutamento (350px de altura, stage de 390px) — decisão antiga de propósito, pra não ficar "torto" comparado ao recrutamento (ver comentário no CSS). Medido ao vivo com Playwright antes de mexer: numa tela comum de 640-844px de altura, o botão de sair (`.gang-lobby-quit`) ficava ~85 a ~280px ABAIXO da dobra — sempre exigia scroll pra aparecer, e não tinha nenhum indício visual de que a tela rolava. Fix: card do elenco encolhido ~30% só no lobby (`.gang-roster-carousel .gang-fighter-card` e toda a cadeia de filhos — portrait, fonte do nome/atributos, badges de líder/equipe, setas ‹/›), escopado por prefixo de classe pra NÃO afetar o card do recrutamento (`GanguesCreate.jsx`, que compartilha o mesmo `GanguesLobby.css` mas continua do tamanho grande de sempre — ali é escolha feita 1x, faz sentido ser grande). Mais alguns cortes pequenos de margem (hero, botões de ação, contador de time) somando ~40px. Verificado ao vivo via Playwright em 3 tamanhos de tela (390×844, 412×915, 360×640): o botão de sair passou a caber sem scroll nos dois primeiros (o mais próximo do Samsung A57 do Isaias); no menor (360×640, tela de celular antigo/pequeno, mais estreito que o normal hoje em dia) ainda sobra um resto pequeno de scroll (~130px, contra ~280px antes), aceitável — não dava pra zerar de vez sem descaracterizar o card. Confirmado por captura de tela que o recrutamento (`GanguesCreate`) manteve o card exatamente do tamanho original (242×350) depois da mudança.
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
