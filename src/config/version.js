/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.192' // fix: LDI Gangues - ataqueNormal/dano de Fenda/Catraca/Faisca com grade de quadros errada nos dados (rows/frameH nao batiam com a folha real) cortava e sobrepunha arte entre quadros. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.27.0' // fix (Isaias jogou e mandou print de novo: pernas/saia flutuando acima do corpo, "vc ta certo pare tudo" depois de eu provar com grade sobreposta na folha crua): causa raiz de verdade das animacoes de Fenda/Catraca/Faisca cortadas - a 1a leva de arte (v3.24.0) so preenchia 4 colunas x 3 linhas (12 poses) numa folha 724x544, mas os dados diziam rows:4/frames:16 ou 8 (copiado do Trinca/Muro sem checar se a arte nova respeitava a mesma grade) - com rows:4 o recorte de cada celula parava antes do fim da pose e a sobra aparecia inteira, sobreposta, na celula de baixo. Confirmado extraindo a folha crua com sharp (grade sobreposta 4x4 em vermelho cortando toda pose no meio da perna) e tambem no PNG de origem antes do resize - mesma grade 4x3 la, nao era bug de export. Isaias redesenhou os 6 arquivos (ataqueNormal+dano x Fenda/Catraca/Faisca) pra grade real 4x4/16 igual Trinca/Muro; assets reprocessados dos PNGs novos (RECRUTAVEIS/<Nome>/<Nome>SocoNormal.png e DanoNormal.png, resize 724x544) e `ganguesCombatAnimations.js` corrigido pra rows:4/frames:16/frameH:136 com os indices de golpe (flash de impacto) reais de cada folha nova. Confirmado ao vivo, dentro do jogo real (Playwright + `window.__ganguesDebugFight`, novo gancho de debug DEV-only que monta uma luta real via store sem precisar navegar a cena), os 16 quadros de cada um dos 3 personagens em velocidade normal (80ms/quadro) - contact sheet de cada ataque, zero corte/sobreposicao. Trilha anterior (3.26.0, revertida): tentativa de fix limitando pra 8 quadros - nao resolvia a causa raiz, so escondia parte do problema.

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
