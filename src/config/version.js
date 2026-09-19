/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.193' // fix: LDI Gangues - reprocessamento anterior (v10.280.192) forcava todo webp de Fenda/Catraca/Faisca pro mesmo tamanho fixo (724x544), mas cada folha de origem tem uma altura de canvas diferente (1100/1086/1200) - voltou a cortar pe/mostrar quadro de cima. Corrigido lendo a altura real de cada arquivo antes de gerar o webp e o frameH da config. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.27.1' // fix (Isaias abriu a folha da Catraca no Photoshop, provou grade 4x4 perfeita, e mesmo assim via pe cortado/quadro de cima no jogo - "vc ta dimensionando essa imagem errado"): eu tinha razao que a 1a leva de arte (v3.24.0) nao respeitava 4x4, mas o MEU reprocessamento (v3.27.0) tambem tinha bug - forcava `sharp(src).resize(724, 544)` FIXO pra todo mundo, ignorando que cada folha de origem tem uma altura de canvas diferente (Fenda 1448x1100, Catraca ataqueNormal 1448x1086, Catraca dano 1448x1200, Faisca 1448x1086 - Isaias reexportou cada arquivo com o proprio tamanho, nao um padrao unico). Forcar todo mundo pro mesmo 544px de saida espremia/esticava quem nao nascia nessa proporcao, voltando a cortar. Fix: gera cada `.webp` com `resize(width/2, height/2)` (metade exata da altura REAL daquele arquivo, lida do proprio arquivo) e `frameH` na config agora e por personagem/tipo (137.5 Fenda, 135.75 Catraca ataqueNormal/Faisca, 150 Catraca dano), nunca mais um numero fixo pra todos. Confirmado ao vivo dentro do jogo real (Fenda e Faisca em velocidade normal, contact sheet de 16 quadros limpo) e por extracao exata da formula do componente pro dano da Catraca (nao deu pra forcar um "dano" ao vivo na sessao de teste - as 3 venceram antes de apanhar). Trilha anterior (3.27.0): 1a correcao da grade 4x3->4x4, mas com o resize fixo que causou esse novo bug.

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
