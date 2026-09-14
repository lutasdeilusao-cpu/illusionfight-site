/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.135' // fix: LDI Gangues - borda azul feia sobrando por tras do cartaz de onboarding do Lobby + botao de SAIR sem nenhum destaque nas 3 telas novas (uma delas, a de batizar a gangue, nem tinha botao nenhum). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.83.0' // fix: 2 problemas na leva de telas novas (SaveSelect/Naming/Lobby onboarding), reportados pelo Isaias com print. (1) borda azul feia contornando o retangulo por tras do cartaz recortado do onboarding do Lobby - causa: .gang-onboarding-panel generico em Gangues.css (usado por outro empty-state do jogo) ainda tinha border/background/box-shadow ciano de fundo, nunca zerados quando o painel ganhou o cartaz proprio; corrigido com border:none;background:none;box-shadow:none escopado em .gang-lobby .gang-onboarding-panel. (2) botao de sair sem destaque nenhum nas 3 telas ('os usuarios sao complicados, tem que ser maior, tem que mostrar que existe uma saida') - .gang-lobby-quit (compartilhado, usado por Lobby/Territorio) redesenhado maior (largura cheia, min-height 44px, seta '<-'), cor de alerta (vermelho, tom ja usado em botoes de excluir do jogo) em vez do cinza apagado de antes; GanguesSaveSelect.jsx trocou a setinha 34x34 no canto por esse mesmo botao grande no fim da tela (mesmo padrao das outras 2); GanguesNaming.jsx (a fundacao da gangue) GANHOU um botao de sair que simplesmente NAO EXISTIA antes (prop onSair nova, passada por GanguesLobby.jsx). Bug pego durante o proprio teste (nao reportado pelo Isaias ainda): as 3 telas usam a classe compartilhada .gang-lobby-quit (definida em GanguesStory.css), mas so GanguesTerritorio.jsx importava esse arquivo - GanguesSaveSelect/GanguesNaming/GanguesLobby dependiam disso estar carregado incidentalmente por OUTRO componente no mesmo bundle; corrigido com import explicito de GanguesStory.css nos 3 arquivos, tornando a dependencia real em vez de acidental (achado testando GanguesSaveSelect isolado - o botao aparecia so 30x18px, sem nenhum estilo novo). Verificado com Playwright em todas as 3 telas antes do deploy: SAIR grande/vermelho/consistente, zero borda azul, zero erro de console.
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
