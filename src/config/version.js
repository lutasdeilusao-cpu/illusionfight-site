/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.88'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.75.25' // documentacao consolidada numa unica biblia (pedido do Isaias: "o GDD tem que ser a unica biblia, tira tudo que nao esta no GDD dessas documentacoes e passa pra ele"). Os 4 .md de mecanica que viviam soltos na raiz de src/pages/games/Gangues/ (GANGUES_DESIGN.md, GANGUES_HEADSUP.md, GANGUES_PROGRESSAO_RASCUNHO.md, GANGUES_MODO_HISTORIA_ENCONTROS.md) foram fundidos no GDD oficial (docs/Games/Gangues/LDI_GANGUES_GDD.md, nova secao 17) e DELETADOS - GDD agora e a unica fonte de lore E mecanica. Dois deles (DESIGN, HEADSUP) descreviam o jogo em v1.12-v1.14 (mais de 60 versoes atras: atributos A/H/R/D genericos, 8 inimigos fixos, criacao por pontos livres, GanguesTrainingZone, mascote NeoGuide) - NADA disso existe mais, foi descartado em vez de copiado. A secao nova foi escrita reconferindo cada fato contra o codigo de hoje, nao copiada dos docs velhos: atributos reais sao A/H/D/PV/PM (Osso/Gas), formula de combate, iniciativa, 75 poderes + 6o exclusivo, AP=10/inimigo fixo, tamanho de gangue por territorio, estrutura de pastas pos-reorganizacao (screens/). ACHADO NA AUDITORIA: o bonus de caminho (Atacante +1 ataque/Defensor +1 defesa/Mistico garantido), descrito nos 3 docs antigos e ainda mostrado na UI do log de combate, esta MORTO no codigo hoje - resolveAttackerBonus/resolveDefenderBonus em ganguesCombatResolver.js ignoram os parametros e sempre retornam applied:false. Registrado no GDD sec.17.2 como bug real pendente de decisao (nao corrigido agora, so documentado - pedido era consolidar doc, nao mexer em mecanica). Atualizados os 5 comentarios de codigo que citavam os arquivos deletados (data/cenas/pista/index.js, pools.js, ganguesEncontros.js, ganguesCombatResolver.js, ganguesSpecialEffects.js) pra apontar pro GDD. Build com bundle quase identico (so comentario mudou), Playwright confirmou fluxo de criacao sem erro.
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
