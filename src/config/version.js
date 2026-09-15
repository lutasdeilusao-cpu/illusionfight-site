/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.159' // feat: LDI Gangues - a Pista ganhou uma ilustracao de fundo de verdade (top-down, pixel art), substituindo o desenho 100% CSS de rua/predio/obstaculo. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.4.0' // feat: ilustração de fundo de verdade na cena da Pista (pedido do Isaias: gerou "PistaMapa.png" — 724×2172, pixel art top-down — a partir de um prompt que eu escrevi com as medidas reais do mundo, e pediu pra virar o mapa jogável DE VERDADE, não só referência). Antes disso a rua inteira (prédio/obstáculo/cenário/fiação) era desenhada em CSS puro (`CenaCenario.jsx`) a partir de `mundo.js`. Mudança: (1) `mundo.js` — `MUNDO_PISTA` passa a usar o tamanho NATIVO da imagem (724×2172, era 760×2840 — a imagem é proporcionalmente mais curta) em vez de esticar a arte pra caber no mundo antigo; `QUARTEIROES_PISTA` (colisão) redesenhado do zero em ~16 retângulos aproximando onde a ilustração REALMENTE tem prédio de cada lado (a rua da imagem serpenteia diferente da antiga); `PREDIOS_PISTA` cai de ~30 prédios decorativos pra só 7 hitboxes invisíveis de porta (birosca/oficina/loja/túnel×2/galpão/birosca_2 — a fachada agora é a imagem, só a porta de interior continua precisando de posição); `OBSTACULOS_PISTA`/`CENARIO_PISTA`/`FIACAO_PISTA` viram listas vazias (a imagem já desenha entulho/árvore/fiação — desenhar nos dois ao mesmo tempo duplicava e destoava). (2) `posicoes.js` — os 17 POIs remapeados do zero: alguns têm um cenário único reconhecível na ilustração e foram plantados ali (oficina no barracão de ferramentas+carro, ferro/achado no ferro-velho com portão de grade, birosca nas mesas de bar, informante no orelhão da praça, loja na lojinha pós-muro, os 2 bondes de tocaia perto do sofá/carro branco pós-muro); os que não têm prop único (as tretas de rua beco/beco_2/beco_3/sinaleiro/rasteira_velha/rinha, descanso) ficaram em trechos de rua genérica, preservando lado e proximidade relativa ao muro. (3) `CenaCenario.jsx` — quando `cena.fundoImagem` existe, renderiza só a `<img>` de fundo (novo `.gang-cena-fundo`) e para de desenhar prédio/cenário/obstáculo/fiação em CSS (colisão continua lendo os dados normalmente, é 100% independente do visual). Sem `.gang-world-gate` animado aqui — a ilustração já mostra o muro fixo; abrir o portão só libera a colisão silenciosamente (efeito visual de "muro caiu" fica pra um retoque de arte futuro). (4) `ganguesCenaMotor.js`/`GanguesCena.jsx` — as 2 faixas hardcoded do muro/túnel (eram y1330-1350 e alvos do radar em coordenadas antigas) atualizadas pra bater com a posição do muro/túnel na nova imagem (~y900-940). Asset: `assets/cenas/pista/mapa-exterior.webp` (comprimido de PNG pra WebP, qualidade 82, ~460KB — formato melhor pra arte pintada do que o PNG paletizado usado nos retratos pequenos). Testado com Playwright ao vivo (fundou gangue, recrutou, entrou na Pista, andou toda a subida com as setas até encostar no muro): fundo renderiza certinho, câmera acompanha o mundo novo, colisão do muro bloqueia exatamente onde devia, pino "Cria do Sinal" cai bem na praça com a foto certa, zero erro de console. Os outros 6 territórios (trilha antiga) e os interiores (birosca/oficina/loja/túnel/galpão) não foram tocados.
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
