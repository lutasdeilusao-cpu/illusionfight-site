/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.299.1' // docs(gangues): progressão das lojas por território no GDD

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.2' // fix: aba "stories" do rodape mostrava a chave crua pp.menu.pistas_label (nao existia) -> aponta pra pp.dossier.pistas_label; PuzzleWrapper mostrava pp.puzzle.nenhum/instrucao (nao existiam) -> pp.local.puzzle_nenhum/instrucao; confirm() de deletar save mostrava pp.menu.deletar_slot cru -> chave criada nos 3 idiomas.
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.67.0' // apostas: Banca do Tio Dado na birosca (desafio de mão com puzzles ×1,5/×2/×3, rinha de aposta NPC x NPC com cotação por simulação e 10% da casa, aposta em você na carta da treta), teto de aposta pela Rep, loja da Pista só com comum (incomum guardado pra Feira), preços comum ×2 / incomum ×2,5 / poção 20, grana do Carvão 250 — antes: 9 status estilo Pokémon com nome de gíria e explicação (Moscando, Sangrando, Braço Mole, Guarda Aberta, Apagado, Batizado, Grogue, Travado, Queimado — ids numéricos), perder a vez, bater no parceiro, acordar ao apanhar, itens 35–39 + Xarope da Vó, status distribuídos pelos talentos dos Mandingueiros, limpeza de código morto — antes: catálogo de equipamento refeito por caminho (38 peças: Porradeiro, Paredão, Mandingueiro e livre; só o caminho certo equipa; Malandragem nas peças do Mandingueiro; calibrado por simulação: comum ≈ 2–3 níveis, incomum ≈ 4–5), catálogo 101–120 removido dos saves, teto de nível da Pista 25 — antes: personas da IA inimiga (brigão, covarde, caçador, protetor, doido, mandingueiro de ataque/cura/status — bando de 3+ sempre com 1 mandingueiro), inimigos com talentos e passivas, status (lerdo, sangrando, fraco, rachado — só o mandingueiro causa, persiste entre lutas), talentos de cura do Aquático, itens de curar status (30–34), descanso completo de 50, destaque grande de passiva e status — antes: teto de nível por área (Pista = 30, nível do Carvão; AP não acumula no teto e a vitória avisa), rinha só dá XP (sem grana), Clube da Luta paga 200 em toda vitória completa — antes: fix: PV/PM gravado durante a luta (sair, fugir ou recarregar a aba não devolve mais a vida) — antes: encontro da polícia pisca a tela vermelho/azul (sirene) enquanto a viatura persegue; pino e zona do ferro-velho juntos na rua acima do prédio (pino no centro) — antes: fix: zona do ferro-velho e do corre caíam dentro do prédio (inalcançáveis, travava a história) — movidas pra calçada + marca de chão mostra onde interagir quando o pino mora no prédio; pista com raias em par (aliado x inimigo, só as necessárias, até 6); barra do automático desceu pra cima do roster inimigo — antes: pista com 1 raia por lutador (até 4, depois dividem), largada animada mais lenta, sai o quadro 'Ordem da pista' do log — antes: sistema do Pique: H vira Pique (só velocidade, linha do tempo estilo Medabots com pista visual, teto 3x, talento custa 125), PM vira Malandragem (+metade no talento), caminhos Porradeiro/Paredão/Mandingueiro, 30 fichas e 102 inimigos rebalanceados, velocidade 1x/2x/3x no automático — antes: revisão: sobras do bicho removidas (passosRef, import de pool e de gate sem uso, comentário) — feat(cena): encontro aleatório refeito do zero (sai o bicho) — 5min e depois a cada 15min de jogo, aviso do Nego Véio, perseguidor com pathfinding mais rápido que o jogador, pausa em luta/interior/menu, onomatopeia ao alcançar; 4 tipos (moto, polícia, bonde rival, cobrador da Banca), sempre ≥2 inimigos

export const TAMA_VERSION      = '3.4.1' // Tamagoshi LDI — preserva oferta inicial ao voltar do gacha pago
export const DUELO_VERSION     = '2.8.1'  // Duelo LDI — TrapActivator: CSS extraído de inline para arquivo próprio
export const MINIGAMES_VERSION = '4.3.6'  // PuzzleStealthGrid: d-pad na tela sempre (mobile tambem) + grade nao vaza mais do viewport
export const TS_VERSION        = '6.0.3'  // Top Trumps SP - fix: cartas cortadas em telas baixas (escala por JS) + audio iOS Chrome + player da Nina toca em mobile
export const TM_VERSION        = '6.0.2'  // Top Trumps MP - alinhado com SP 6.0.2 (GameOverScreen compartilhado)
export const TATICS_VERSION    = '7.5.1' // fix: PreBatalha.jsx chamava t('tatics.*') (namespace legado, sem essas chaves) em vez de t('games.tatics.*') — tela pre-batalha inteira mostrava chave crua. SimulacaoAuto.jsx usava 11 chaves games.tatics.sim_* que nunca existiram — criadas nos 3 idiomas.
export const SRGRM_VERSION = '3.5.0' // SRGRM 3v3 — extração fiel do original rpg_3v3-3-4-1.html, 129 funções preservadas
export const ARENATESTBED_VERSION = '6.22.2' // fix: 4 chaves prototype.arena_testbed.* (ia_personalidade_label, ordering_title/subtitle/confirm) nunca existiam — modal de empate de agilidade e o seletor de personalidade da IA mostravam chave crua. Criadas nos 3 idiomas.
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
