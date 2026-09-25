/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.289.1' // fix(historias): estante do hub separada por universo (LDI: linha principal + coleção dos Contos; Mundo das Sombras e Mar de Cinzas em seções próprias com card largo), filtro de peso só em /historias/contos, sem eyebrow IF // HISTÓRIAS

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.2' // fix: aba "stories" do rodape mostrava a chave crua pp.menu.pistas_label (nao existia) -> aponta pra pp.dossier.pistas_label; PuzzleWrapper mostrava pp.puzzle.nenhum/instrucao (nao existiam) -> pp.local.puzzle_nenhum/instrucao; confirm() de deletar save mostrava pp.menu.deletar_slot cru -> chave criada nos 3 idiomas.
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.56.0' // fix (Isaias, 22/09/2026, print marcando o lugar certo: "coloca a lojinha do Seu Zé bem aí onde eu marquei... ali no meio dessa rua, porque aonde ele tá tá trabalhando muito"): `loja_pocoes` (Lojinha do Zé) mudou de posição de novo — a 1ª correção (colar na quina do prédio, perto da porta da birosca) resolveu o "no meio da construção" mas criou congestionamento no ponto de entrada (porta + loja empilhados). Movida pro trecho aberto da rua entre os dois quarteirões (y2492-2622, sem prédio nenhum ali), posição (600,2560) — zona de interação centrada no próprio ícone (mesmo critério de informante/rinha, sem parede pra encostar). Testado ao vivo via Playwright: pino aparece isolado no meio do trecho vazio da rua (confirmado com screenshot), botão COMPRAR ativa normalmente.

export const TAMA_VERSION      = '3.4.1' // Tamagoshi LDI — preserva oferta inicial ao voltar do gacha pago
export const DUELO_VERSION     = '2.8.1'  // Duelo LDI — TrapActivator: CSS extraído de inline para arquivo próprio
export const MINIGAMES_VERSION = '4.3.6'  // PuzzleStealthGrid: d-pad na tela sempre (mobile tambem) + grade nao vaza mais do viewport
export const TS_VERSION        = '6.0.3'  // Top Trumps SP - fix: cartas cortadas em telas baixas (escala por JS) + audio iOS Chrome + player da Nina toca em mobile
export const TM_VERSION        = '6.0.2'  // Top Trumps MP - alinhado com SP 6.0.2 (GameOverScreen compartilhado)
export const TATICS_VERSION    = '7.5.1' // fix: PreBatalha.jsx chamava t('tatics.*') (namespace legado, sem essas chaves) em vez de t('games.tatics.*') — tela pre-batalha inteira mostrava chave crua. SimulacaoAuto.jsx usava 11 chaves games.tatics.sim_* que nunca existiram — criadas nos 3 idiomas.
export const SRGRM_VERSION = '3.5.0' // SRGRM 3v3 — extração fiel do original rpg_3v3-3-4-1.html, 129 funções preservadas
export const ARENATESTBED_VERSION = '6.22.2' // fix: 4 chaves prototype.arena_testbed.* (ia_personalidade_label, ordering_title/subtitle/confirm) nunca existiam — modal de empate de agilidade e o seletor de personalidade da IA mostravam chave crua. Criadas nos 3 idiomas.
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
