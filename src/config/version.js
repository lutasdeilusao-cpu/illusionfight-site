/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.176' // feat: LDI Gangues - teste de colisao por imagem na Pista (mascara pixel a pixel recortada pelo Isaias no Photoshop), valendo por enquanto so no trecho ja recortado; o resto do mapa continua nos retangulos de sempre. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.15.0' // feat (Isaias, 16/09/2026 — "eu nem sei se isso é possível mas eu fiz de qualquer maneira"): recortou à mão no Photoshop um "molde" da Pista apagando (deixando branco puro) tudo que devia ser caminho andável, mantendo o resto (prédio/obstáculo) como estava — a ideia: usar essa imagem como colisor de verdade em vez de acertar retângulo por retângulo. Implementado como TESTE: `mapa-exterior-colisor.png` (fonte, não commitada — 3,3MB, só usada pra gerar o asset final) processada em `colisor-mask.png` (preto&branco puro, 4,3KB, fechamento morfológico 7×7 pra tirar pontinho preto isolado dentro da área branca — a 1ª tentativa usou o filtro errado, abertura, que só limpa ruído branco). Novo `engine/ganguesColisorImagem.js`: carrega a máscara num canvas invisível uma vez e expõe `solidoEm(x,y)` lendo os pixels reais (soma um raio ~16px ao redor do ponto, igual o raio do jogador). `hitsSolid`/`stepPlayer` (`ganguesCenaMotor.js`) ganharam um 4º parâmetro opcional `colisorImagem` — só consultado quando `y >= colisorImagemY1` (970, onde a máscara do Isaias começa de verdade); acima disso nada muda, `QUARTEIROES_PISTA` continua sozinho. Overlay de debug (🧱) ganhou a máscara desenhada por cima (`mix-blend-mode:multiply`) + uma linha marcando o limiar. Testado ao vivo com Playwright: confirmado pixel a pixel que a máscara bate com a arte (parede real detectada numa quina que o script de teste — andando só reto — não conseguia contornar, nada a ver com bug); movimento fluido da entrada até y~1410 confirmado. Escopo: só cobre da entrada até um pouco depois do muro (o que o Isaias já recortou) — resto do mapa seguindo 100% nos retângulos de sempre, sem regressão nenhuma. Trilha anterior (3.14.0): adicionou um 3º som no soco do Trinca — "não é pra tirar os outros, apenas copia e adiciona esse tocando junto desde o começo, é o Trinca falando Ahh". `gangues-trinca-ahh.mp3` (arquivo do próprio Isaias, grito de 2s, normalizado via ffmpeg) tocando por cima da corrente desde o quadro 1, mais comprido que a animação inteira (1,28s), deixado terminar naturalmente; trocado depois pra uma versão com os silêncios cortados (arquivo mais curto, mesmo nome). Ajuste de escopo no mesmo pedido: a versão de teste tinha 3 disparos (corrente → porrada → corrente de novo); o Isaias pediu pra tirar o 3º ("os 2 primeiros já estão bons") e adiantar o gatilho da porrada mais 1 quadro em cima do ajuste anterior — total 2 quadros (160ms) de antecipação.
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
