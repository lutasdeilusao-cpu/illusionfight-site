/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.180' // revert: LDI Gangues - regressao pedida pelo Isaias da ilustracao de fundo da Pista (e do teste de colisor por imagem em cima dela), volta pro mapa 100% CSS de antes - ele vai refazer a arte por outra ferramenta e reimplementar depois. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.18.0' // revert (Isaias: "a gente implementou uma versão nova do mapa... quero reverter para a versão antiga do mapa porque eu vou melhorar ele pelo L7/outra ferramenta e depois eu vou implementar ele... faz uma regressão pra mim do mapa, de todo o mapa"): regressão cirúrgica da ilustração de fundo da Pista (introduzida em `6efe13913`, "ilustração de fundo de verdade na cena da Pista") de volta pro mapa 100% CSS de antes (quarteirões/prédios/asfalto/muro desenhados em CSS puro, não mais uma imagem única). Revertidos pro estado imediatamente anterior à ilustração (commit `4580ed349`): `mundo.js` (mundo 760×2840 de novo, `QUARTEIROES_PISTA`/`PREDIOS_PISTA` com campos visuais completos — cor/andares/toldo/etc —, `OBSTACULOS_PISTA`/`CENARIO_PISTA`/`FIACAO_PISTA` de volta com conteúdo, sem `FUNDO_PISTA`), `posicoes.js` (POIs nas coordenadas antigas), `CenaCenario.jsx` (volta a desenhar tudo em CSS, sem o branch de imagem nem o overlay de debug — removido junto, já que só existia pra calibrar a arte que está sendo descartada), `ganguesCenaMotor.js` (faixa do muro de volta pra y1330-1350, sem `predioEhSolido`/`MURO_GATE_Y1/Y2` — extrações que só existiam pro overlay removido), `GanguesCena.css` (sem `.gang-cena-fundo`/tela de loading/CSS do overlay de debug/faixa do muro). Também apagados os 2 assets `mapa-exterior-baixo.webp`/`mapa-exterior-cima.webp` (sem consumidor depois da regressão). **Cuidado tomado**: 2 desses arquivos (`pista/index.js`, `GanguesCena.jsx`) tinham commits DEPOIS da ilustração com fixes NÃO relacionados ao mapa (`4d1ef84ed`, carta de preview da treta) — reaplicados manualmente por cima do revert em vez de perdidos: `chefe.nivelRec` continua 30 (não voltou pro 15 antigo) e `TretaVS` continua recebendo `territorioId={terr.id}`. **Conflito com trabalho concorrente**: entre o início e o fim desta regressão, outra sessão publicou em `main` o commit `266281547` ("teste de colisão por imagem na Pista", `colisor-mask.png` + `ganguesColisorImagem.js`) calibrado pixel-a-pixel pra bater com a ilustração — perguntado o Isaias diretamente (ele confirmou: reverter junto), esse teste foi removido junto nesta versão por depender de paredes que só existiam na ilustração; o resto do trabalho concorrente nesse período (máquina de animação de combate oficial v3.16.0/3.16.1/3.17.0 — Trinca+Muro, ataque normal e dano) é 100% independente do mapa e foi preservado intocado via merge de `origin/main`. Verificado ao vivo com Playwright (antes do merge com o trabalho concorrente): `.gang-cena-fundo` (imagem) = 0, `.gang-quarteirao`/`.gang-predio`/`.gang-road`/`.gang-world-gate` (CSS antigo) todos de volta renderizando, botão 🧱 de colisores sumiu, zero erro de console.

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
