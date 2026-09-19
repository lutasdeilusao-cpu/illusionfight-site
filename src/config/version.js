/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.217' // feat: LDI Gangues - "recompensa por risco": cada inimigo agora rende AP relativo à distância entre a ficha dele e a ficha do personagem mais forte da gangue - farmar muito mais fraco rende cada vez menos, encarar mais forte dobra/triplica o AP. Tutorial novo explicando a regra. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.36.0' // feat (Isaias, 19/09/2026): "nesse jogo nao tem porque subir, subir nao da mais experiencia do que ficar embaixo em frente a cara fraco... temos que avisar isso no tutorial tambem". Pedido: recompensa de AP passa a depender da distancia entre a ficha do inimigo e a ficha do personagem MAIS FORTE da gangue - "voce tem uma ficha de 10 pontos e vai lutar contra o cara de 7, em vez de 10 vai receber 9, e assim vai decaindo... ate um limiar minimo de 1 ponto por personagem da gangue". Correcao dele na sequencia: "e gradual, e perder 1 ponto se tiver 2 personagens, perde 2 pontos por diferenca de nivel" - o desconto (e o piso) e POR PERSONAGEM do time, nao um flat pro bolo inteiro. E o oposto: "quem se desafia contra um grupo mais forte, 1 a 2 niveis acima ou mais, ganha o dobro de experiencia, e se for mais de 5 niveis acima, ganha o triplo". Implementado em engine/ganguesVictoryResolver.js (nova funcao apPorInimigo, calcularApTotal recalculado por INIMIGO em vez de flat ×enemyCount) + useGanguesVictoryResolution.js (calcula pontosMaisForte do match.playerTeam e os atributos de cada inimigo do report.combatants). Regra: inimigo ate 2 pontos abaixo do mais forte = ficha cheia (10 AP); cada ponto extra abaixo desconta 1 AP POR PERSONAGEM do time, piso = tamanho do time; 1-5 pontos acima = dobro; mais de 5 acima = triplo. Tutorial novo (GangTip, tutorial_id "ap_risco") explicando a regra, aparece na 2a vitoria real em diante (depois do tutorial de XP ja existente, nunca os dois juntos). Testado: mais forte=10/inimigo=7/time=1 -> 9 AP; mesmo caso time=2 -> 8 AP (perde 2, bate com a correcao dele); +1 a +5 acima = dobro; +6 acima = triplo; fluxo completo ao vivo (Playwright) confirmando XP subindo de verdade com bonus de triplo AP contra inimigo bem mais forte.

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
