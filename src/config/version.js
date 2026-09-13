/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.120' // feat+fix: LDI Gangues - pedido do Isaias (13/09/2026). (1) SOFTLOCK REAL corrigido: falhar a gazua do ferro-velho (POI "ferro", Pista) travava aquele ponto pra sempre sem dar a sucata (item 13) - como a Oficina do Nando exige 2x sucata pra abrir o portão e a OUTRA fonte (achado) não falha nunca, quem falhava a gazua uma vez ficava PRESO pra sempre em 1x sucata, sem conseguir terminar a Pista. Corrigido: falhar a gazua agora só revela o mapa (igual sempre) mas não marca o ponto como resolvido - dá pra voltar e tentar de novo até acertar de verdade. (2) Renomeados 4 termos do sistema de personagem pra gíria de rua/crime, tema gangue (pedido do Isaias, com base no banco de gíria já curado na GDD §13): Habilidade->Malícia, Ataque->Veneno, Defesa->Couro, Poderes->Talento(s). Aplicado em todo texto vivo (ficha, tutorial de combate, descrições de poder, bônus de caminho) nos 3 idiomas, com adaptação livre por idioma (não tradução literal) - en: Skill->Slick, Attack->Venom, Defense->Hide, Powers->Talents; es: Habilidad->Malicia, Ataque->Veneno (já igual), Defensa->Cuero, Poderes->Talentos. Atributos mortos (F/R/PdF, de um sistema abandonado) não foram tocados.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.75.44' // feat+fix: (1) softlock real corrigido - falhar a gazua do ferro-velho não trava mais o ponto pra sempre sem a sucata (Oficina exige 2x, só sobrava 1x possível); agora dá pra voltar e tentar de novo até acertar. (2) 4 termos renomeados pra gíria de rua nos 3 idiomas: Habilidade/Skill/Habilidad -> Malícia/Slick/Malicia, Ataque/Attack -> Veneno/Venom (es já era Veneno), Defesa/Defense/Defensa -> Couro/Hide/Cuero, Poderes/Powers -> Talento(s)/Talent(s). Aplicado em attr_labels, skill_desc, combat_tutorial, bonus_ataque/defesa e todo texto de UI que citava esses termos.
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
