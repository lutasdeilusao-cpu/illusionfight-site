/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.168' // feat: LDI Gangues - teste unico de sprite animado (8 quadros, arte gerada externamente) tocando quando o Trinca da um ataque normal em combate - so pro Trinca, so ataque normal, pra validar a ideia antes de virar oficial pra mais personagens. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.10.0' // feat (Isaias: gerou uma folha de sprite do Trinca socando num gerador externo — "toda vez que o Trinca der um ataque normal esses sprites rolam... o dado agora fica menor e lá em cima e ele no centro dando esse golpe... só um teste, se funcionar a gente faz oficial depois"): teste único, hardcoded pro Trinca (catálogo id 1), só em ataque NORMAL (`!activeSpecialId` — se ele já tiver poder ativo comprado/selecionado, cai no avatar de sempre). Novo campo `actorTemplateId` no log de combate (`ganguesCombatPresentation.js`, transformarEvento) — antes o log só guardava nome/retrato do atacante, sem o id numérico do catálogo pra decidir "é o Trinca?". `TrincaSocoSprite` (`GanguesCombatLogList.jsx`) substitui o avatar circular pequeno (28px) por um quadro maior (72px) animado, com o dano flutuando pequeno em cima em vez de só no corpo do card. A folha (4 colunas × 2 linhas, 8 quadros) usa 8 posições de `background-position` explícitas por keyframe (não um `steps()` genérico, que só varre 1 eixo — numa grade 2D cada keyframe define seu próprio `animation-timing-function: steps(1)` pra saltar discreto entre quadros, sem deslizar). Convertido de PNG (1,4MB) pra WebP (369KB, qualidade 90) antes de subir — mesma transparência, sem perda visível a esse tamanho de exibição. **Bug achado e corrigido ao vivo com Playwright**: a 1ª versão não tinha `animation-fill-mode: forwards` — ao terminar, o navegador voltava o `background-position` pro valor "base" (quadro de guarda, não o quadro do soco) em vez de segurar o último quadro da animação; corrigido antes de reportar como pronto. Verificado via `getComputedStyle` em pleno combate real (não só visual): o quadro avança exatamente nas posições calculadas (`33.333% 0%`, depois `100% 100%`...) e agora fica parado no quadro final depois do fix. Não consegui um print limpo do quadro final isolado — a treta de teste ("A boca do sinal", nível 3) é fácil demais e o card do soco decisivo quase sempre coincide com a tela de "NOCAUTEADO" cobrindo o log por cima; confirmado via `getComputedStyle` que a animação em si roda e termina certo, mesmo sem o print visual perfeito. Se aprovado pelo Isaias, generalizar pra mais personagens é decisão futura — não construído antecipadamente aqui.
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
