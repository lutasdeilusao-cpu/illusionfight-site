/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.96' // Hero da Home reconstruido do zero (pedido do Isaias: "fizemos isso no comeco do projeto, o projeto mudou muito, nunca mais tocamos, ele nao ta funcionando bem"). Trocadas as 5 artes por banners novos verticais (ja pensados pro portal mobile-only). Achados na auditoria: (1) HeroSlideshow.css tinha uma secao "desktop" inteira que NUNCA rodava - sempre sobrescrita por um bloco "mobile" sem media query nenhuma por baixo, sempre ativo - codigo morto que so confundia; (2) Home.css tinha um SEGUNDO conjunto de regras pra .hero-slideshow (min-height:92svh + padding fixo) brigando com o CSS do proprio componente - juntos empurravam todo o texto (tag/titulo/subtitulo/botoes) pra FORA da imagem, flutuando acima dela; (3) titulo usava clamp de "headline dramatica" (2.5rem+) só que os 5 titulos sao frase inteira ("Comecei isso com 17 anos. Levei 23 pra realizar.") - overflow-wrap:break-word quebrava a palavra AO MEIO ("EXPANDID" + "O" em linhas separadas) sempre que a frase era longa, era o "texto estourando" reportado. Reescrito do zero: palco com aspect-ratio REAL de cada imagem (a arte aparece inteira, sem cortar ninguem - nao usa mais 100vh+object-fit:cover mascarando corte errado), CSS unificado numa fonte so (Home.css so mantem o que nao e do hero), titulo tratado como frase (menor, so quebra em espaco). Setas de navegacao removidas (mortas ha muito tempo - display:none incondicional, mobile-only nunca teve mouse). Adicionada a logo completa por idioma (logo-completa-pt/en/es) no topo do hero - so a marca curta aparecia no navbar/rodape ate agora. Validado em 320/375/430px nos 5 slides via Playwright, zero erro de console.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.75.31' // farol de PV virou 2 estagios de verdade (pedido do Isaias: "quando cair 50% ja tem que comecar um efeito leve, um warning, ai 25% ja um efeito mais pesado e vermelho mostrando que ja ta perto de morrer"). Antes a regua era so 20%/10% (quase imperceptivel). Agora, em TODO lugar que mostra PV: <=50% = aviso leve (ambar), <=25% = efeito pesado vermelho - roster de combate (GanguesCombatRoster.jsx), ficha modal (GanguesFichaCard.jsx) e a vinheta de tela inteira (GanguesCombat.jsx, adicionada na versao anterior) agora tem as DUAS etapas: vinheta ambar suave em <=50%, vinheta vermelha forte em <=25% (a mais grave manda).
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
