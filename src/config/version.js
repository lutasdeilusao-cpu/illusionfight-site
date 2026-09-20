/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.222' // feat: LDI Gangues - redesign completo do card de Descanso na birosca (retrato do Nego Veio + cabeca de quem foi curado + animacao de "descansando" antes do resultado). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.40.0' // feat (Isaias, 20/09/2026, print do card antigo - so texto cru, sem cara nenhuma: "colocar o rosto do nego velho ali em cima... colocar a cabeca de quem ta sendo recuperado, quanto ta sendo recuperado... uma animacaozinha de descanso antes de apresentar o resultado, que a maioria dos rpgs tem"): redesign completo do encontro Descanso na birosca (components/cena/GanguesDescanso.jsx) - migrado do card cru `.gang-cena-enc--*` pro MESMO componente reutilizavel do "papo" (GanguesDialogoEncontro, retrato circular + balao + botoes) que ja existia pra outros encontros com NPC; o dono da birosca (npcSlug 'nego_veio', novo campo em pois.js) fica ancorado no topo em TODA fase do fluxo (oferta -> animando -> resultado -> contrato do fiado -> oferta do Clube da Luta), nunca remonta. Lista de recuperacao agora mostra a cabeca de cada personagem (GanguesRetratoImg + getGanguesPortraitByTemplateId, fallback letra) ao lado do nome e do PV/PM ganho, nao so texto. Nova animacao "Descansando..." (💤 + barra varrendo, 1.4s / 350ms com prefers-reduced-motion) roda so quando a tropa DE VERDADE descansa/e curada (fiar tambem, nao so descansar a vista) - pagar divida continua instantaneo, nao e "descanso". GanguesDialogoEncontro ganhou slot `children` opcional (conteudo extra entre a fala e os botoes) e uma variante `--link` de botao, pra caber o link "O Clube da Luta" sem reinventar CSS. CSS morto de `.gang-cena-enc--fiado`/`--clube`/`-descanso-lista`/`-clube-link` removido de GanguesCena.css. Testado ao vivo (Playwright + harness isolado, screenshot de cada fase: oferta, animando, resultado, oferta do Clube) - retrato do Nego Veio e as 2 cabecas dos personagens (Trinca/Muro) renderizando de verdade, nao fallback.

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
