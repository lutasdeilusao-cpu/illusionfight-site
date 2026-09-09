/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-09
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.15'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.74.12' // FÔLEGO removido (barra da cena, avisos, ajustarFolego/restaurarFolego). O que cura agora e so o PV/PM das fichas: o Descanso da birosca (descansarTropa) restaura todo mundo pro maximo, so cobra se tiver ferido, e mostra +PV/+PM por personagem. HUD da cena respeita env(safe-area-inset-top) (nao sumia mais atras do notch). // Colecao aberta de dentro da cena: o "<- Voltar" agora devolve o jogador pro TERRITORIO na posicao salva (antes chutava sempre pro lobby). GanguesRoute guarda a fase anterior (faseAntesAlbum) e passa `voltar` pro GanguesAlbum. // Colecao: as abas de cargo (Vigia/Vapor/Gerente/Cobrador/General/Chefes) estavam quase invisiveis (fundo transparente, borda apagada) — o jogador achava que o catalogo so tinha 21 vigias. Agora tem fundo+borda visivel e quebram em linha (flex-wrap) pras 6 aparecerem de uma vez. Removido o eyebrow "IF // MARÉLIA". // Ganchos de trash talk (v3 tô caindo / v4 derrota do chefe) + encontro ALEATORIO de rua na cena (gerarBandoEvento: bando ~1.1x a ficha, teto por bairro pista=14 pra L8+ bater numa boa; EventoVS modal; recompensa grana+rep). sinal->aperta agora mostra fala pre-treta. // Reescrita da comunicacao da Pista com giria pesada / cara de faccao (naming, abertura, chegada, todos os POIs, tunel, galpao, Carvao, feedback de gameplay) nos 3 idiomas. + Trash talk variado: .fala de POI de treta pode ser array; TretaVS sorteia uma linha por encontro (escolherFala em GanguesCena) — nao repete sempre a mesma. 2.74.7: 1102 Dedo-Duro -> Zoio. // Inimigo 1102 renomeado: "Dedo-Duro" (X9 — pedido do Isaias: cagueta morre, nao anda de vigia) -> "Zoio" (o olho da esquina). Lore do album e notes ajustados nos 3 idiomas + gangues-enemies.json. // Revezamento tambem nas primeiras tretas de rua: beco, rinha e as brigas-punicao (apertar o pivete do sinal, falhar a gazua) trocaram o enemy fixo/sorteio dos 11 moldes por revezamento do pool fraco [Farejador/Dedo-Duro/Pingo/Ratazana/Chinelada] — quase sempre 1 sozinho. Antes a aperta/falha davam SEMPRE Ratazana. viraTreta.revezamento agora e suportado. 2.74.5: revezamento no tunel. Depois de fechar todos os ponto, abre a boca de um tunel ("Barraco do beco") que fura por baixo do muro — mini-dungeon de 3 comodos com vigias (tunel_m1/m2/m3) e um achado, saindo no "Barraco do outro lado" ja do outro lado. O muro fisico so abre depois de bater o chefao (prog.boss). Verificado com Playwright.
export const TAMA_VERSION      = '3.4.1' // Tamagoshi LDI — preserva oferta inicial ao voltar do gacha pago
export const DUELO_VERSION     = '2.8.1'  // Duelo LDI — TrapActivator: CSS extraído de inline para arquivo próprio
export const MINIGAMES_VERSION = '4.3.4'  // Glitch: safe-area lateral no grid-wrap
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
