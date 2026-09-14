/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.130' // feat: LDI Gangues - dialogo padrao reconstruido (cabeca grande animada + balao de fala) e parede de tijolo oficial (com rachaduras) na tela de nome da gangue e no dialogo. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.80.0' // feat: GangDialog (o dialogo de rua, usado toda vez que um NPC fala com o jogador) reconstruido do zero - vira a 'comunicacao padrao do LDI Gangues' (pedido do Isaias, 14/09/2026, ao ver o retrato do Nego Veio pela primeira vez de verdade). Layout antigo (barra fixa no rodape, retrato pequeno de 46px ao lado do nome, herdado do sistema NeoGuide de outro jogo) trocado por: cabeca grande (132px) com animacao de idle permanente (balanco + 'respiracao', keyframe gang-dlg-idle) que ganha um pulso mais rapido enquanto o texto esta sendo digitado (gang-dlg-talk, simula fala sem precisar de frames de expressao novos) + balao de fala de verdade saindo da cabeca (cauda apontando pra cima, tecnica classica de 2 triangulos) - tudo sobre a parede de tijolo oficial do jogo. Reaproveitavel: o retrato so precisa de 'retrato' (URL) e o layout se adapta sozinho ao fallback (inicial do nome) pra NPCs sem arte ainda. GanguesNaming.jsx (a tela de batizar a gangue) tambem ganhou a parede de tijolo como fundo, substituindo o gradiente diagonal generico de antes - mesma classe compartilhada .gang-brickwall-bg (Gangues.css). A parede em si ganhou rachaduras + cantos lascados (pedido do Isaias: 'colocar uns trincados, uns tijolos quebrados') nos 3 lugares que a usam (GanguesSaveSelect ja em producao, GanguesNaming, GangDialog) - receita espelhada nos 3 arquivos de CSS (sem mixin/CSS-in-JS no projeto). CSS morto do antigo sistema NeoGuide (.neoguide-overlay/.neoguide-box/.neoguide-portrait-frame etc, so usado por este componente) removido por completo. Verificado ao vivo via Playwright: dialogo do Nego Veio (fundacao da gangue) renderizando cabeca animada + balao com cauda sobre a parede rachada, zero erro de console.
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
