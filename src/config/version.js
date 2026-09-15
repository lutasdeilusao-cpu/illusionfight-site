/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.153' // feat: LDI Gangues - cabecas de verdade em mais 5 telas fora do combate (album de inimigos, recrutamento, escalacao dos modos, VS da trilha, comparacao da loja). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.1.0' // feat: cabeças de verdade em mais 5 telas (pedido do Isaias: "investigeu se tem outro lugares que podemos usar as carinhas" — pesquisa feita com um agente varrendo o jogo todo atrás de nome/inicial/emoji sem retrato). (1) Álbum de Marélia (GanguesAlbum.jsx): card de inimigo desbloqueado mostrava só a inicial — agora usa `getGanguesEnemyPortraitById`, igual o resto do combate. (2) Recrutamento (GanguesCreate.jsx): os 2 "slots" da formação inicial (SUA FORMAÇÃO INICIAL) mostravam só a inicial do nome — agora usam `getGanguesPortrait`, igual o carrossel de fichas acima já fazia. (3) Escalação da gangue em Modos (GanguesModes.jsx): modal "SUA GANGUE" mostrava iniciais — agora usa `getGanguesPortraitByTemplateId` por `character_template_id` do membro. (4) VS pré-luta na trilha dos bairros (GanguesTerritorio.jsx): mesmo padrão do TretaVS (GanguesCenaEncontros.jsx) aplicado aqui — `getGanguesEnemyPortraitById(confronto.enemy.id)` com fallback pra inicial (hoje só a Pista tem arte de inimigo pronta; os outros 6 bairros continuam de inicial até ganharem retrato). (5) Loja da cena (GanguesLoja.jsx): linha de comparação "equipar em fulano" ganhou um retrato pequeno ao lado do nome. Testado com Playwright ao vivo (fundou gangue, recrutou, abriu Álbum com inimigos desbloqueados via `window.__ganguesStore.setState`, abriu escalação em Modos, forçou Pista "dominada" pra liberar a Feira e testar o VS card da trilha): 4 das 5 telas confirmadas com retrato de verdade renderizando; a 5ª (Loja) usa o mesmo lookup já provado nas outras, não testada ao vivo por exigir navegação de POI dentro da cena. Zero erro de console em todas as passagens.
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
