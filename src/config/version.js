/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.169' // fix: LDI Gangues - o teste de sprite animado do Trinca estava no lugar errado (log de combate, que rola e passa despercebido) - movido pra tela cheia do dado dramatico, o momento de destaque de verdade do combate. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.11.0' // fix (Isaias, direto, depois de jogar a v3.10.0: "puta que pariu, você colocou animação ali no momento que ninguém vai ver nada... tem que estar em destaque na hora que tá sendo dado o dado... o dado pequenininho lá em cima, mas ainda vai ter o dado, os textos e tudo mais, no meio vai fazer essa animação, pra ficar em destaque"): a v3.10.0 (teste do soco animado do Trinca) botou o sprite no LOG de combate — uma lista que rola e onde o card some rápido entre outras mensagens; ele reportou "não apareceu nada" porque via de fato passar despercebido, não porque tivesse quebrado. Lugar certo: `DramaticDice.jsx`, a tela cheia que já pausa o combate e mostra o dado "rolando" — o momento de destaque de verdade, que TODO ataque (normal ou com poder) já passa por. Reestruturado: `GanguesCombatOverlays.jsx` agora passa `attackerTemplateId` pro `DramaticDice` (resolvido de `machine.combatants`, não do log — fonte diferente da tentativa anterior); `ehSocoTrinca = attackerTemplateId === 1 && !powerName` (mesma regra de antes: só o Trinca, só ataque normal). Quando true: o dado encolhe e sobe (`.dramatic-dice-container--compacto`, ~40% do tamanho normal) e o soco vira o centro visual da tela, entre o dado (agora pequeno, no topo) e o texto final que já existia embaixo (crítico/etc) — exatamente a ordem pedida. Removida a versão anterior (log): `TrincaSocoSprite`/import/CSS tirados de `GanguesCombatLogList.jsx`/`Gangues.css`, e o campo `actorTemplateId` do log (`ganguesCombatPresentation.js`) também, já que não tinha mais nenhum consumidor — sem deixar código morto de uma tentativa descartada. Verificado ao vivo com Playwright: `getComputedStyle`/prop confirmando `ehSocoTrinca:true` só no ataque certo, e 3 capturas de tela reais mostrando exatamente o layout pedido — dado pequeno "1"/"3" no topo, "Trinca ATACA [alvo]" acima dele, o soco grande (170px em mobile) girando no meio, "Girando... Girando..." embaixo.
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
