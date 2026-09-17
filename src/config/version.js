/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.183' // feat: LDI Gangues - retratos (neutro.png) dos 7 personagens novos (Cicatriz, Marreta, Mira, Navalha, Ponto, Sangue, Troco), completando os 12 oficiais com arte. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.20.0' // feat (Isaias forneceu "Personagens/LDI GANGUES/RECRUTAVEIS", masters oficiais dos 12 personagens; "leve os personagens para exatamente onde estão os outros e implemente... copie pra pasta certa"): retrato (`neutro.png`, 256x256 PNG paletizado, fundo transparente) dos 7 personagens que ainda não tinham arte no jogo (Cicatriz, Marreta, Mira, Navalha, Ponto, Sangue, Troco), processado do master `<NOME>.png` (1254x1254 RGBA) de cada pasta com sharp (resize `fit:contain` + paleta 256 cores) pra bater exatamente com a receita dos 5 originais (mesma resolução, mesmo formato, mesma faixa de tamanho de arquivo) — sem tocar nos 5 já existentes. `ganguesPortraits.js` não mudou (o `import.meta.glob` descobre sozinho); só o comentário foi atualizado (12 de 30, não mais 5). A pasta de origem também trouxe `<Nome>Sheet.png` (turnaround corpo-inteiro, arte de referência — não é usado por nenhum sistema do jogo hoje) e, pra Trinca/Muro/Fenda, sheets de ataque/dano (`*SocoNormal.png`/`*DanoNormal.png`) — Trinca/Muro já tinham essas animações implementadas (nada mudou); a de Fenda é NOVA e não foi implementada nesta versão (calibrar frame de impacto + som pede decisão do Isaias, igual foi feito com Trinca/Muro — ver histórico de versões anteriores). `LDI_GANGUES_GDD.md` (§8, cobertura de arte) atualizado. Trilha anterior (3.19.0): renumeracao completa dos 30 ids do catalogo (`ldi_gangues_30_personagens_v1.json`) pra que os 12 personagens oficiais (os unicos com arte pronta hoje) ocupem 1-12 — 5 iniciais (1 Trinca, 2 Fenda, 3 Muro, 4 Catraca, 5 Faísca, mesma ordem relativa de antes, so a numeracao mudou) + 7 liberados 1 por territorio derrotado (6 Cicatriz, 7 Marreta, 8 Mira, 9 Navalha, 10 Ponto, 11 Sangue, 12 Troco, via `wave_2_first_clear`). Os 18 ids restantes (13-30, sem arte ainda) foram realocados mantendo unicidade: `wave_3_second_clear` (11: Touro/Concreto/Guarda/Ombro/Boca/Isca/Brasa/Cinza/Maré/Chuva/Raiz) e `event_only` (7: Rebote/Ferro/Osso/Racha/Trovão/Névoa/Espelho). Confirmado com o Isaias que nao existe save de jogador em producao ainda, entao a renumeracao foi segura sem migracao de dado. Atualizados junto: cada um dos 30 blocos de personagem (`id`/`starter_pool`/`unlock_wave`), `ganguesBiografias.js` (30 bios remapeadas pro id novo do respectivo personagem, conteudo intacto) e `ganguesCombatAnimations.js` (`TEMPLATE_SLUG`: `11: 'muro'` -> `3: 'muro'`, unico outro lugar do codigo com id hardcoded). `LDI_GANGUES_GDD.md` (tabela §7 + prosa) reescrito pra bater com os ids novos.

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
