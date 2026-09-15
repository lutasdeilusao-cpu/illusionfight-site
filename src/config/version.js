/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.142' // fix: LDI Gangues - 2 pontos que o redesign anterior deixou pela metade, reportados pelo Isaias com print ("nao fez redesign de nada, so colocou o background por tras"). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.90.0' // fix: 2 pontos que o redesign anterior (v2.89.0) deixou pela metade, reportados pelo Isaias com print ("você não fez redesign de nada, só colocou o background por trás"). (1) "ESCOLHER MODO DE JOGO" no Lobby: a 1ª tentativa era só um halo translucido (::before com radial-gradient) direto sobre a parede oficial — sem nenhuma chapa solida por baixo, o halo sumia contra a arte cheia de cor forte e o botao ficava parecendo texto flutuando. Trocado por uma chapa marrom-tijolo real (mesmo gradiente do fighter-card/ficha) com o halo só como acento por cima, igual todo outro CTA do jogo já tem. (2) Os cards de modo (GanguesModes.jsx: MODO HISTORIA/BATALHA/MULTIPLAYER) nunca ganharam o corte irregular novo — o clip-path de canto unico (chanfro tecnico) vinha do arquivo base GanguesModes.css e nunca foi sobrescrito no arquivo de redesign, entao a FORMA continuava identica a de antes por baixo do fundo recolorido. Pior ainda: os 2 cards bloqueados (Batalha/Multiplayer) tinham filter:grayscale(.6) que apagava toda a cor da identidade nova, fazendo eles renderizarem visualmente iguais ao painel tecnico cyan/violeta de antes — só o card desbloqueado (Historia) escapava disso. Corrigido: clip-path irregular (--corte) redeclarado no arquivo de redesign pra vencer a cascata, e grayscale trocado por opacidade simples (a cor da identidade nova sobrevive, só fica mais apagada — não regride pro visual antigo). Testado com Playwright: os 3 cards de modo com o corte novo e a cor por trás visivel mesmo bloqueados, botao "ESCOLHER MODO DE JOGO" com chapa solida visivel de verdade, zero erro de console.
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
