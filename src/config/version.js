/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.191' // feat: SEO Tier 0 - <html lang> sincroniza com o locale, H1 faltante em Historias, meta tags do Webtoon (estavam hardcoded em ingles p/ todo idioma) + hreflang invalido (mesma URL) removido de Webtoon/Games, paragrafo real (crawlable) adicionado em Webtoon/Games, copy EN reescrita p/ refletir termos da campanha paga (manga/manhwa/webtoon, free online games/RPG, dark fantasy fiction). Proposta maior (URL por idioma + hreflang de verdade) documentada em docs/ReportAI, nao implementada ainda - decisao do Isaias.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.26.0' // fix (Isaias jogou e mandou print: "as animacoes estao todas cortadas, vc fez merda, teste elas antes de me dizer que estao prontas... quero ver prints prova"): ataqueNormal de Fenda/Catraca/Faisca (v3.24.0) cortava cabeca/corpo nos quadros 9-16 - investigado renderizando os 16 quadros de cada folha com a MESMA formula CSS do GanguesCombatSpriteAnim.jsx numa pagina isolada, screenshot de cada quadro: Trinca (controle, mesmo pipeline) sem nenhum corte nos 16; os 3 novos ataqueNormal com a arte dos quadros 9-16 desenhada fora da celula (cabeca da Catraca fica no quadro de cima, corpo do Faisca sai quase todo) - confirmado que e a arte de origem (<Nome>SocoNormal.png), nao o pipeline. Os `dano` das 3 vieram limpos nos 16 quadros, verificados do mesmo jeito. Fix: `frames: 16` -> `frames: 8` nos 3 ataqueNormal quebrados (dano continua 16) - toca so os quadros 1-8, todos conferidos limpos, golpe de cada um dentro dessa faixa (6/7/7). Nao confirmado dentro do DramaticDice.jsx numa luta real (tentei simular arrasto de analogico na cena navegavel da Pista via Playwright, personagem travou contra obstaculo antes de alcancar o inimigo - sem sucesso confiavel em automacao); zero mudanca nos componentes de render, a formula testada isolada e a mesma que eles usam ao vivo. Trilha anterior (3.25.0): "sobra espaco la em cima, o que tira totalmente a necessidade desse scroll, a ficha deve caber na tela e basta utilizar o espaco melhor"): hero de corpo inteiro (`.gang-sheet-modal__corpo-wrap`/`-img`) reduzido de 300/320px pra 230/250px e stats/PV-PM/tecnica/botao com padding/gap mais justos - o conteudo da ficha (com a arte de corpo, §15.1 do GDD) passava do `max-height` do card e forcava scroll interno mesmo sem nada de exotico na ficha. `.gang-sheet-modal` trocou `align-items: end` por `center` - a folga que sobra agora se divide em cima E embaixo, em vez de empilhar tudo no topo. Verificado ao vivo com Playwright no viewport exato do print (393x852): `scrollHeight === clientHeight` (zero scroll necessario), gap simetrico (75px em cima, 75px embaixo). Trilha anterior (3.24.0): animacao de combate (ataqueNormal+dano) pra Fenda/Catraca/Faisca, completando os 5 personagens iniciais, + som de impacto por genero (soco-leve/dano-leve novos pras mulheres, sons do Trinca/Muro reaproveitados pro Faisca).

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
