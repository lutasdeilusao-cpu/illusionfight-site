/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.144' // feat+fix: LDI Gangues - cabecas de verdade nos pinos da cena E no modo de batalha (roster + ficha do inimigo), nao so nos modais de papo/recrutamento; corrigido tambem um bug de arquivo (Cria do Sinal salvo na pasta errada, por isso nao aparecia em lugar nenhum). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.92.0' // feat+fix: cabeças de verdade nos PINOS da cena da Pista E no modo de batalha, não só nos modais de papo/recrutamento (pedido do Isaias, 15/09/2026: "criei todos os personagens... por que que eles não estão com cabecinha", seguido de "no modo de batalha tem que mostrar a cabecinha dos inimigos até mesmo na ficha deles"). (1) Pino de POI (PinoAlvo, GanguesCenaAtores.jsx) sempre mostrava um ícone genérico (●/✊/etc, cor do farol de status) mesmo pra NPC/inimigo com retrato já pronto — só o GangMarker (jogador) e os modais usavam a arte de verdade. Agora resolve um retrato: NPC de papo via `npcSlug` (Nego Véio, Duda o Orelha, Cria do Sinal), ou inimigo de identidade FIXA via `liderFixo`/`enemy` (Sinaleiro Chefe, Rasteira Velha, Carvão/chefe, Cão Louco do galpão) — de propósito SEM retrato quando o POI tem `revezamento` (pool aleatório: Ratazana/Chinelada etc. na rua), porque aí quem aparece na luta é sorteado e uma cabeça fixa no pino seria mentira. Visual: círculo com a foto (mesmo tratamento do GangMarker), mantendo o anel de cor do farol de status por cima. (2) Combate: GanguesCombatRoster.jsx e o popup de ficha do inimigo (GanguesCombatOverlays.jsx) tinham `retrato`/`foto` hardcoded pra `null` no lado inimigo ("os inimigos têm o próprio pool de ids, sem arte de cabeça ainda" — comentário desatualizado desde que o catálogo de inimigos ganhou arte). Trocado por `getGanguesEnemyPortraitById(member.id)` — `id` é o numérico de gangues-enemies.json, sobrevive intacto de escalarInimigo/numerarRepetidos até chegar no combatente, então roster E ficha do inimigo agora mostram a cabeça pra Ratazana/Brasa/Chinelada/Cão Louco/Riscado/Bala Solta/Troco Certo/Sinaleiro Chefe/Rasteira Velha/Carvão sempre que aparecerem numa luta. BUG achado no processo: "Cria do Sinal" tinha sido salvo em `assets/enemies/` na sessão anterior (por eu não ter certeza se era NPC ou inimigo) mas o código sempre chamou `getGanguesNpcPortrait` (pasta `assets/npcs/`) — por isso a cabeça dele nunca aparecia em lugar nenhum, nem no próprio papo. Corrigido movendo o arquivo pra pasta certa. Testado com Playwright: pino de "A boca do sinal" mostrando a cabeça do Cria do Sinal corretamente, zero erro de console; a mudança de combate (roster/ficha) segue o mesmo padrão já provado (getGanguesEnemyPortraitById) e foi conferida por leitura de código — `member.id`/`fichaAberta.id` chegam intactos até o componente — mas não consegui automatizar uma luta de ponta a ponta no Playwright pra print ao vivo (o joguinho de movimento não cooperou com o script); pedir confirmação visual real ao Isaias na próxima luta.
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
