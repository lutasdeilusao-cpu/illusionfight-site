/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.174' // feat: LDI Gangues - soco animado do Trinca ganhou som (corrente -> porrada no quadro 9 -> corrente de novo) sincronizado com a rolagem do dado, que agora sempre termina exatamente no quadro 16. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.13.0' // feat (pedido do Isaias, 16/09/2026: "precisa de dois sons quando for a vez do Trinca... som da corrente... quando chegar no frame9 tem que dar um som de soco de porrada... terminou o som de porrada volta pro som de corrente e finaliza... a jogada do dado tem que finalizar no frame 16"): 2 mudanças em `DramaticDice.jsx`. (1) A rolagem do dado (`totalDuration`) deixou de ser aleatória (1,5-2s) quando é o soco do Trinca — trava em 1280ms-400ms de intro, pra a revelação do número cair exatamente quando o quadro 16 termina (o cálculo de segurança "espera o soco acabar" da leva anterior virou desnecessário e foi removido — agora é garantido por construção). (2) Som de verdade sincronizado com a animação: corrente balançando desde o quadro 1, porrada no quadro 9 (onde a folha mostra a fagulha do impacto), corrente de novo até o quadro 16 — 2 arquivos novos baixados de bancos gratuitos de uso comercial (`public/sounds/gangues-trinca-corrente.mp3`, trecho de "Metal chain" da SoundDino, royalty-free/sem atribuição; `public/sounds/gangues-trinca-soco.mp3`, "Body punch quick hit" da Mixkit, licença Mixkit — ambos normalizados e cortados via ffmpeg), pré-carregados na montagem (`Audio.load()`) e tocados via `.play()` nos gatilhos, seguindo o mesmo padrão de `GanguesSaveSelect.jsx` (áudio de arquivo de verdade, não os bips sintetizados de `sfx.js`). Ajuste fino ao vivo (Isaias, mesma sessão): achou os sons atrasados, sobretudo o da porrada — trocado `new Audio()` a cada disparo (tinha o atraso de baixar+decodificar o mp3 na hora) por 2 elementos pré-carregados na montagem, e todos os gatilhos adiantados 1 quadro inteiro (80ms) por cima disso. Verificado com Playwright (monkey-patch de `HTMLMediaElement.prototype.play` numa rota de teste isolada, já que não dá pra "ouvir" via automação): os 3 `.play()` disparam na ordem certa e no intervalo certo entre eles, zero erro de console. Rota de teste revertida antes do commit.
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
