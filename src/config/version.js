/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.138' // feat: LDI Gangues - cabecas oficiais dos NPCs/inimigos da Pista importadas pro projeto (Nego Veio atualizado, Duda o Orelha, Cria do Sinal, Ratazana, Brasa, Chinelada, Cao Louco, Riscado, Bala Solta, Troco Certo, Sinaleiro Chefe, Rasteira Velha, Carvao) + parede de tijolo oficial (arte real) no lugar da receita 100% CSS. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.86.0' // feat: cabecas oficiais (pedido do Isaias, 14/09/2026 - pasta "NPCS" com a arte de todo o elenco de NPC/inimigo da Pista + a parede oficial). (1) Cabecas: copiadas/redimensionadas (256x256, paleta otimizada) pra src/pages/games/Gangues/assets/{npcs,enemies}/<slug>/neutro.png. NPCs de papo (getGanguesNpcPortrait, ja existia so pro Nego Velo): Nego Velo atualizado com a arte nova (estilo consistente com o resto do elenco) + Duda o Orelha novo. Inimigos de combate (arquivo novo ganguesEnemyPortraits.js, mesmo padrao de pasta-por-entidade + import.meta.glob dos outros dois catalogos, mapeando id numerico -> slug): Ratazana, Brasa, Chinelada, Cao Louco, Riscado, Bala Solta, Troco Certo, Sinaleiro Chefe, Rasteira Velha e Carvao — usado em TretaVS (GanguesCenaEncontros.jsx), que antes so mostrava a inicial do nome como selo. "Cria do Sinal" (arte de um pivete do Bonde do Sinal) identificado como o rosto do POI `sinal` (1o ponto da Pista, ainda sem NPC nomeado no GDD) via novo campo `npcSlug` nos POIs de papo (pois.js: sinal/birosca/informante) + GanguesPapo.jsx passou a mostrar a foto quando existe. Faltam ainda os 3 vigias nativos da Pista sem arte (Farejador/Zoio/Pingo, faixa 1101-1103) e os "moldes" emprestados de outros bairros usados no pool aleatorio da Pista (Extensao, Boleto Vencido, Luz de Gato etc.) - avisado ao Isaias. (2) Parede oficial: `.gang-brickwall-bg` (Gangues.css) e o `.gang-saves` duplicado (GanguesSaveSelect.css) trocaram a receita 100% CSS (gradientes cruzados simulando tijolo) pela arte de verdade (JPG com o graffiti dos 30 nomes do elenco, redimensionada pra 720px de largura) — aplica em GanguesCreate/GanguesNaming/GanguesLobby(onboarding)/GanguesSaveSelect/GangDialog, todas ja usavam a classe/copia compartilhada. Adicionado um veu escuro (2a camada de gradient) por cima da arte + reforco de text-shadow no cabecalho do recrutamento — o graffiti tem cor/texto fortes demais pra UI ficar legivel sem isso (pego no proprio teste visual antes do deploy). Testado com Playwright pelo fluxo real do jogo (fundar gangue -> recrutar -> Pista -> andar ate o pino -> interagir): retrato do Duda o Orelha renderizando certinho no papo, zero erro de console em todas as telas.
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
