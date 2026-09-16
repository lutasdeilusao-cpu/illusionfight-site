/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.173' // feat: LDI Gangues - soco animado do Trinca dobrou de 8 para 16 quadros (folha nova sem fundo), 80ms/quadro (1.28s), e o dado dramatico agora espera de verdade o fim da animacao antes de fechar. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.12.0' // feat (Isaias trocou a folha de sprite do teste do soco do Trinca por uma nova, 8→16 quadros, grade 4×2→4×4, fundo removido/transparente — "adapta aí, era 8 frames agora temos 16"): `assets/personagens/trinca/soco-sprite.webp` regenerado (fonte 1448×1086 com altura ímpar, preenchida com 2px transparentes pra fechar em múltiplo de 4 antes de reduzir pela metade — 724×544, quadro 181×136 — e exportado em WebP SEM PERDA depois que os últimos quadros mostraram artefato visível em qualidade 90). `DramaticDice.css`: `background-size` 400%×200%→400%×400%, os 8 keyframes viraram 16 (passo de 12.5%→6.25%), e a caixa do soco deixou de ser quadrada (210×210) — o quadro novo é 4:3, não 3:2 como o antigo, e a caixa quadrada esmagava o personagem (achado pelo Isaias: "a imagem mudou de tamanho, esmagou do nada"); virou 280×210 (desktop) / 227×170 (mobile), no aspecto real do quadro. Duração: pedido inicial 100ms/quadro (1,6s), jogado e achado "meio lento", ajustado pra 80ms/quadro (1,28s). Também corrigido (pedido à parte, "o dado deve esperar o fim da animação"): o delay antes de `onComplete` na fase `reveal` de `DramaticDice.jsx` agora garante matematicamente que a tela nunca fecha antes do soco (1,28s desde o mount) terminar — antes disso funcionava só por coincidência de tempo (a rolagem+revelação já era mais longa que o soco), sem nenhuma garantia real contra ajustes futuros de qualquer um dos dois lados. Verificado com Playwright numa rota de teste isolada montando `DramaticDice` direto (combate real tinha luta terminando rápido demais pra pegar o turno do Trinca de forma confiável): `getComputedStyle` confirmou o quadro final (`background-position: 100% 100%`) alcançado ~1,2s após o mount, tempo total até `onComplete` de ~4s (folgado acima do 1,28s), zero erro de console, screenshots confirmando proporção correta sem esmagamento. Rota de teste e import revertidos do `App.jsx` antes do commit.
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
