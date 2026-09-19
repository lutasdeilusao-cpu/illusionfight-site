/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.214' // fix: LDI Gangues - card de "encarar a treta?" não mostra mais os stats crus (A/H/D/PV/PM) nem a etiqueta "· NÍVEL N" enganosa (N eram os pontos da ficha, não o nível real - Isaias confirmou com a matemática: 8 pontos é nível ~3 de verdade, não 8). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.34.1' // fix (Isaias, 19/09/2026, print do card "O beco da Rasteira · NÍVEL 8"): "primeiro que eu nao deveria nem mostrar esses numeros, isso ai pode ser retirado - segundo, vamos ver se essa ficha bate com nivel 8: se voce comeca com 5 pontos e sobe 1 por nivel, nivel 8 tem que ter 12 pontos... essa ficha tem 8 pontos, isso aqui e nivel 3, nao 8 - esta muito desnivelado, muito errado, tem que cobrar o nivel nivelado com que ele e". Conferido com o catalogo real (30 personagens): nivel 1 = 6-8 pontos (varia por personagem), nivel 8 = 13-15 pontos - a ladder de encontros (pontosFixo) usa o numero de pontos DIRETO como se fosse o "nivel" (ex. `beco` nivelRec:8 da uma ficha de exatamente 8 pontos, que corresponde a um nivel real de ~2-3) - confirmado, o Isaias tinha razao, o rotulo nao bate com a forca real do inimigo. Fix imediato (TretaVS, GanguesCenaEncontros.jsx): removida a linha de stats crus (A/H/D/PV/PM) e a etiqueta "· NIVEL N" do card de confronto - ele so mostrava o total de pontos como se fosse nivel, informacao que nao deveria aparecer pro jogador mesmo (e que dava pra conferir o descompasso). CSS morto removido (.gang-cena-vs-stats) + chave i18n orfa removida (games.gangues.cena.nivel, pt/en/es). O aviso "tropa abaixo do recomendado" (poi.nivelRec vs nivel real da tropa) continua ativo por enquanto - usa o MESMO nivelRec desalinhado e precisa da mesma calibracao, sinalizado pro Isaias decidir se quer recalibrar a ladder inteira (tarefa maior, mexe em pois.js/interiores.js/ganguesTerritorios.js, precisa de playtest novo) ou so ajustar a exibicao.

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
