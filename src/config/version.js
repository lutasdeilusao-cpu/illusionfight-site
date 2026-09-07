/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-06
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.279.7'

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '2.60.1' // fix: barrinha de XP no mini-card do combate tinha max="10" fixo - personagem nivel 2+ (custo 15/20/25 AP por XP, ganguesXpMaxForSheet) aparecia "cheia" faltando 5+ pontos. Agora usa ganguesXpMaxForSheet(member) e so aparece no lado do jogador. rework: TODO item agora e' ID NUMERICO, nunca slug (pedido do Isaias - renomear item = mexer so no i18n). Consumivel 1-99 (ganguesItens.js: pocao 1/2), equipamento 101+ (ganguesEquip.js: 101-120). Catalogo carrega `slug` so pra humano, `id` numerico, nome via i18n games.gangues.(equip.)itens.<id>. pista.js loja itens: [1,2,104,107,108,112,115,118,101]. Saves de teste com ids-string ficam inertes. Registrado em AGENTS.md (Decisoes e Hurdles). rework: equipamento nao da mais +R (Resistencia mexia em PV e PM ao mesmo tempo, forte demais - teste do Isaias). Novo tipo de bonus: pv/pm PLANO (applyGanguesEquipResources, nao passa por R). Slot corpo virou a ESCOLHA PV vs PM: colete_reforcado (+6 PV, tanker) e colete_leve (+6 PM, magro/mistico), os dois vendidos na loja da Pista. Incomum/raro: colete_placa/manto_capuz/armadura_rua. Removidos colete_couro/jaqueta_rebite/colete_balistico e o R de medalha_santa. feat: bolsa da gangue - botao 🎒 no HUD da cena (Pista) abre a BagSheet com os consumiveis (store.inventario) e o equipamento guardado (store.equipamentos). Mesma fonte que a loja abastece e que o combate ja le pra usar pocao (GanguesCombat.jsx linha ~359 mapeia store.inventario -> orb 🎒 -> store.usarItem) - integracao ja existia pro combate 1x1, so faltava a visao fora da luta. Nota: uso de item na Briga em Multidao ainda e' stub (GanguesCombat.jsx:220). feat: loja - tocar no item abre folha de detalhe (icone, o que da, atributos, slots de carta) + comparacao "como a ficha de cada personagem fica com esse equip" (delta A/H/R/D e PV/PM, aviso de troca) + comprar-e-equipar numa acao so (escolhe o personagem no detalhe; item anterior do slot volta pro inventario da gangue). Novo comprarEEquipar no store, previewGanguesAttributesWithEquip em ganguesEquip.js. fix: painel de equipamento nao aparecia na ficha rapida da cena (botao 👤 na Pista) - so tinha sido ligado na GanguesProgression (tela do lobby). Agora GanguesEquipPanel tambem entra no FichaCenaCard (GanguesCena.jsx), com scroll no modal e picker acima do modal da cena (z-index). feat: sistema de equipamento + slots de carta. Todo personagem tem 6 slots (arma/cabeca/corpo/bracos/pes/amuleto) em sheet.attributes.equipment; cada peca da bonus plano de A/H/R/D e reserva 0-2 slots de carta (estilo Ragnarok, teto 2 - cartas em si vem com o drop depois). Catalogo em data/ganguesEquip.js (18 itens, 3 por slot: comum/incomum/raro). Loja da Pista vende 1 basico de cada slot (GANGUES_LOJA_EQUIP_BASICO). Inventario de equipamento por save (store.equipamentos, migration 036 - coluna equipamentos JSONB). UI: GanguesEquipPanel dentro da GanguesProgression. Combate: prepare() soma os bonus antes de calcular PV/PM (armadura +R = mais tanky de verdade). Remover carta destroi a carta (decisao Isaias); desequipar item NAO. fix: loja movida do lobby pra dentro da cena da Pista (pedido explicito - "tem que ser no jogo, na interacao", nao uma tela do lobby). Nova GanguesLoja (components/cena/), POI tipo 'loja' em pista.js com catalogo proprio (poi.itens: ['pocao_hp','pocao_mp']) - cada regiao vai ter sua propria loja com seus proprios itens. Posicionada visivel desde o inicio (teste), perto da primeira treta - plano final e' ficar atras do portao, no mesmo lugar da "Loja abandonada" decorativa que ja existia em PLACES (GanguesCena.jsx), so trocar visivel:false + revela depois. Removida a tela/rota/botao de loja no lobby (GanguesLoja.jsx antigo, fase 'loja' em GanguesRoute.jsx, botao em GanguesLobby.jsx)
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
