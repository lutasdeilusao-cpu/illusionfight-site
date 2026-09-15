/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.162' // fix: LDI Gangues - retrato quebrado (rede ruim) mostrava quadrado vazio em vez de cair na letra/emoji de sempre + dialogo do Nego Veio podia aparecer empilhado com o poster de fundar gangue numa conexao lenta. Mesclado com: overlay de debug (?debugmapa=1) mostrando colisores/portas/POIs por cima do mapa da Pista, pra calibrar contra a ilustracao de fundo. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.7.0' // fix (Isaias, 4 prints tirados num evento com wifi ruim — Expo Center Norte, Samsung A57): (1) retrato do "Pingo" no card de derrotado veio como quadrado em branco em vez de cair na letra de sempre — causa: todo `{retrato ? <img src={retrato}/> : <fallback>}` no jogo decidia UMA VEZ se tinha retrato (o dado existia), e nunca revisitava isso quando a imagem existia nos dados mas falhava ao BAIXAR (conexão ruim) — sem handler de erro, sobrava o buraco do <img> quebrado. Fix: novo componente `GanguesRetratoImg` (cai pro fallback também on `onError`) + equivalente local (useState próprio) nos ~15 lugares com wrapper de classe dupla que o componente genérico não cobria (GanguesCombatOverlays/KoAvatar, GanguesVictoryReport/ReportMemberRow, GanguesCenaEncontros/TretaVS, GangDialog, GanguesCreate, GanguesLobby x2, GanguesCombatRoster, GanguesCombatLogList x2, GanguesCenaAtores/GangMarker+PinoAlvo, GanguesPapo, GanguesClube, GanguesTerritorio/ConfrontoAvatar, GanguesAlbum/AlbumPortrait, GanguesFichaCard) — grep final confirma zero `<img>` de retrato sem `onError` sobrando no módulo. (2) diálogo do Nego Véio aparecendo empilhado junto do pôster "FUNDA A TUA GANGUE" — causa: `GanguesNaming.jsx` sempre montava o pôster no DOM, só contava com o CSS (position:fixed + z-index) do `GangDialog` por cima pra tampar visualmente; numa conexão lenta o CSS pode chegar depois do primeiro paint do React, e os dois ficam visíveis/clicáveis ao mesmo tempo — bug estrutural, não só de rede. Fix: pôster agora só existe no DOM quando `!intro` (dialogo já fechou), sem depender de CSS pra se esconder. Confirmado por leitura de código que NÃO existe um segundo diálogo do Nego Véio duplicado em nenhum outro ponto do fluxo de fundação (só há esse um `GangDialog` em `GanguesNaming`, guardado por `!store.gangName` em `GanguesLobby`) — o que o Isaias viu era essa MESMA instância empilhada com o pôster, não uma repetição. Verificado: build limpo; fix do diálogo é lógica pura (reproduzível sem rede ruim, confirmado ao vivo via Playwright: poster ausente do DOM durante o diálogo, presente logo após fechar), fix dos retratos é sobre reagir a falha de rede real — sem forma prática de simular "download falhou" num teste automatizado agora, documentado aqui em vez de fingir print. Mesclado por cima de 3.6.0 (overlay de debug `?debugmapa=1` pra calibrar colisores/portas/POIs da Pista contra a ilustração de fundo — trabalho de outra sessão, ver commit próprio pra detalhes).
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
