/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.128' // feat: LDI Gangues - "Suas Gangues" ganha textura de tijolo de verdade, sequência reordenada (parede monta primeiro, DEPOIS a logo cai e estilhaça os tijolos) e tipografia de pichação (Permanent Marker) na tagline e no CTA, depois de uma 3ª rejeição do redesign anterior. Ver GANGUES_VERSION pro detalhe.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.78.0' // fix: "Suas Gangues" - 4a iteracao da entrada de impacto, depois de uma 3a rejeicao. A 3a iteracao (2.77.0) foi considerada ainda insuficiente pelo Isaias: "a parte de tras nao parece tijolos" (o gradiente de grade lia como grade, nao como fiada de tijolo) e "os tijolos cairam muito pouco" - e ele pediu uma ORDEM diferente de sequencia: os tijolos caem e MONTAM a parede primeiro, so DEPOIS a logo cai de cima e ESTILHACA a parede (pedacos voando pra todo lado), e so entao assenta na posicao final. Tambem pediu fonte de pichacao/arte de rua pro texto e um CTA desenhado do zero no mesmo estilo. Mudancas: (1) textura de tijolo trocada pelo recipe classico de 4 gradientes diagonais cruzados por tijolo (le como fiada de verdade, fiadas alternadas) em vez da grade de linhas repetidas; (2) sequencia reordenada e retimada (IMPACT_MS=950ms): ~14 tijolos caem espalhados em posicoes/pousos variados (nth-child, --pouso por peca) e desaparecem depois de assentar (antes ficavam como blocos lisos destoando da textura fina de baixo, corrigido no mesmo commit) ANTES da logo, que ja nasce visivel caindo de cima e acelera ate bater na posicao final; no instante do impacto (950ms), 8 estilhacos de tijolo voam radialmente pra fora a partir do centro (translate/rotate por --dx/--dy/--rot via nth-child) junto com o flash/tremor/som (que passaram a disparar em 950ms, nao mais em t=0); (3) fonte Permanent Marker (Google Fonts, adicionada ao link ja existente em index.html) na tagline e no texto do estado vazio; (4) CTA fundar gangue redesenhado do zero como spray-paint: halo de neblina de tinta atras do texto em Permanent Marker com glow, sem reaproveitar o chanfro tecnico do resto do site - mantem so a varredura de luz no toque por baixo do estilo novo. Verificado ao vivo via Playwright (harness temporario, revertido antes do commit): sequencia capturada frame a frame, zero erro de console.
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
