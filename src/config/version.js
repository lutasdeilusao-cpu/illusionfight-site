/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.139' // feat: LDI Gangues - a ficha de personagem (GanguesFichaCard, reusada no recrutamento/lobby/combate/progressao) redesenhada por completo, saindo do chanfro cyan tecnico pro corte irregular + parede-de-tijolo + Permanent Marker no nome/tecnica. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.87.0' // feat: ficha de personagem (GanguesFichaCard) redesenhada por completo (pedido do Isaias com print da ficha do Trinca ainda no chanfro cyan tecnico: "fichas precisam ser refeitas aqui no lobby e no jogo tambem"). O CONTEUDO da ficha (hero, atributos, PV/PM/XP, tecnica, botao selecionar, painel de bio) fica todo em GanguesFichaCard.jsx com as mesmas classes gang-sheet-modal__*/gang-ficha-bio* em GanguesLobby.css — como e um componente unico reusado em 4 lugares (recrutamento, popup de combate, ficha da Pista, tela de progressao), redesenhar so ali cascateou pra todo mundo de graca. Corte de canto vira o mesmo poligono irregular do fighter-card, fundo passa de painel cyan chapado pra gradiente marrom-tijolo escuro, nome e tecnica em Permanent Marker (atributos/PV/PM/XP continuam em mono — dado tecnico, nao "voz"), botao "MARCAR PARA A GANGUE" vira CTA spray-paint (halo via ::before, mesmo padrao dos outros botoes de acao). Bordas por caminho (defensor=cyan/mistico=violeta) trocaram de border-color solida pra glow (box-shadow), mantendo a identificacao de cor sem voltar pro visual tecnico. As MOLDURAS que ficam por fora do conteudo tambem foram retintadas onde ainda usavam cyan/teal: `.gang-ficha-modal-card` (popup do combate, GanguesCombatRedesign.css + fallback em Gangues.css) — resto do HUD de combate (roster, barras) fica de fora, e escopo maior (redesign do combate inteiro), nao pedido agora. Testado com Playwright no fluxo real (recrutamento): ficha do Trinca e o painel de biografia renderizando com a identidade nova, zero erro de console.
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
