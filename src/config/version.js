/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.129' // fix: LDI Gangues - Suas Gangues, ajustes finos pos-aprovacao (mais tijolo caindo + animacao mais longa + som de cada batida + buraco quebrado em vez de bolha preta) e fix real: save fantasma sem nome nunca mais aparece na lista nem soma na vaga do plano. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.79.0' // fix: Suas Gangues - ajustes finos pedidos pelo Isaias apos aprovar a 4a iteracao ("parabens, ta muito melhor"): (1) mais tijolo caindo (14->18 pecas) e sequencia mais longa (IMPACT_MS 950->1400ms, retimado em JSX e CSS juntos); (2) cadencia de som real a cada leva de tijolo pousando (TIJOLO_KNOCK_MS, public/sounds/gangues-saves-tijolo.mp3, baixado via curl de banco de efeitos - pitch/volume levemente variados por batida pra nao soar repetitivo); (3) o buraco do estado vazio, que ele apontou como "fundo preto que nao tem nada a ver", trocou o border-radius organico liso por um clip-path irregular (aro de tijolo estilhacado atras via ::before) - le como parede quebrada de verdade. FIX REAL achado no mesmo pedido: clicar 'fundar nova gangue' criava a linha no Supabase ANTES do jogador nomear - se ele saisse/recarregasse no meio da tela de nome, a linha ficava permanente como uma 'Gangue Sem Nome' fantasma, ocupando vaga sem nunca ter sido fundada de verdade ("nao e pra aparecer uma gangue sem nome enquanto ele nao fundou oficialmente"). Corrigido em GanguesSaveSelect.jsx sem mexer no schema/store: savesNomeados = saves.filter(gang_name) e usado pra tudo que o jogador ve (lista, limite de vagas); criar() agora procura um save sem gang_name ja existente e reaproveita ele (selecionarSave) em vez de chamar criarNovoSave de novo - autocura sozinho, sem acumular fantasma a cada tentativa abandonada. Verificado ao vivo via Playwright (harness temporario, revertido antes do commit): fantasma injetado fica invisivel na lista e no card, clicar fundar reaproveita o id do fantasma (_saveId bateu), zero erro novo de insercao no clique.
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
