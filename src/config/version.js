/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.125' // catch-up + feat: LDI Gangues - 4 mudanças (recrutamento via ficha na cena volta pra onde o jogador estava + entra no time ativo; reputação vira gate de risco em vez de vaga de recrutamento, com item de poder-por-1-uso e recompensa a cada 50 rep; nome "LDI Gangues" traduzido em en/es; tela "Suas Gangues" redesenhada com a logo oficial por idioma). As 3 primeiras já foram construídas/testadas/deployadas nesta sessão sem passar por este bump (falha de processo corrigida agora); ver GANGUES_VERSION para o detalhe de cada uma.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.76.0' // feat: reputação vira gate de risco + recompensa a cada 50 (não mais vaga de recrutamento) + fix navegação de recrutamento pela ficha + tela "Suas Gangues" redesenhada. Detalhe: (1) fix recrutar pela ficha na Pista voltava pro lobby e obrigava reescolher modo/território, e o recruta não entrava no time ativo (cap fixo em 2, herança da dupla fundadora) - corrigido navegação (GanguesRoute.jsx lembra a fase de origem, como já fazia com o Álbum) e o cap (GANGUES_MAX_PARTY_SIZE real). (2) rep>=50 parou de liberar recrutamento (3 pontos: roster slot, personagem extra, marco antigo) - território dominado já resolve isso sozinho. (3) reputação agora trava 3 conteúdos arriscados por rep mínima (evento de rua 15/galpão do Carvão-Cão Louco 25/Clube da Luta 40, aviso na gíria do GDD; Clube nunca bloqueia quem já tá endividado) e concede automaticamente, a cada 50 de rep acumulada, um item de "poder por 1 uso" (chip do Bruto/Muralha/Ígneo, forcedSpecial em buildGanguesEffectsList) anunciado num modal bloqueante. (4) "LDI GANGUES" traduzido em en/es (LDI Gangs/LDI Pandillas) nos 3 lugares que mostravam o nome do jogo. (5) tela "Suas Gangues" (GanguesSaveSelect) redesenhada com a logo oficial (uma arte por idioma, assets/logos/) como hero e cartões no desenho de chanfro já usado em GanguesModes, em vez do card genérico antigo.
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
