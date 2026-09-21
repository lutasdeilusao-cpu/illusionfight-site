/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.235' // feat: nova pagina /web-shard (SEO) explicando o termo proprio "WEB SHARD" - pedido do Isaias, 21/09/2026: "a gente vai continuar usando webtoon no portal porque chama atencao, mas aqui dentro eu quero que esteja escrito nosso novo termo... um botaozinho que a pessoa clica e acessa uma pagina com a explicacao". /webtoon (rota, nav, SEO) continua intocado; so ganhou um link de descoberta pro termo novo.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.48.0' // feat (Isaias, 21/09/2026: "vamos por ali no descanso da birosca mesmo, no meio, uma carinha de alguem entre as carinhas que a gente tem, pra ser uma loja muito simples, so vende pocao de HP e MP, pelo dobro do preco da loja de cima, na cara de pau, porque agora que o jogo deu uma balanceada legal, pra voce enfrentar no risco e ganhar mais experiencia voce tem que ir municiado de item"): nova loja "Balcão do Aperto" (id `loja_pocoes`, pois.js) - so os itens 1/2 (pocao HP/MP), no MESMO lugar em que a `birosca` (POI removido) ficava (posicoes.js, dado morto reaproveitado em vez de duplicado). Cara emprestada do catalogo de INIMIGO ("balconista", id 1205 - ja tem arte e o nome literalmente combina com "atende balcao") via novo campo `poi.retratoEnemyId`, sem NENHUMA implicacao de combate - so a imagem. Novo `poi.precoMultiplicador` em GanguesLoja.jsx aplica o markup só na hora de montar a vitrine desta loja especifica, sem duplicar preco no catalogo global (data/ganguesItens.js continua a unica fonte de verdade do preco base). BUG achado no proprio processo de testar: a nova cara fazia esse pino ser tratado como "personagem que anda" (ehPersonagem/GanguesCenaAtores.jsx so checava retrato+chefe, nao tipo) - corrigido excluindo `tipo==='loja'` dessa checagem (fica parado, vendedor de banca fixa, igual a loja principal). Testado ao vivo: pino aparece com retrato de verdade (nao icone generico) e sem andadinha; componente GanguesLoja montado com o POI real confirma os 2 itens a 28 (o dobro do preco base de 14). vai ser uma cabecinha amarela que aparece de vez em quando no mapa... você entra numa luta, quando você volta ela tá por perto... anda igual os outros, só que se você colide com ela entra automaticamente numa luta, sem escolha... toda vez que você luta ela muda de posição e fica mais perto, nunca em cima de você... o jogador decide continuar fugindo ou encarar... só pode aparecer depois que passa o muro, mantém essa regra"): "o bicho" substitui por completo o antigo encontro aleatório de rua (sorteio cego por tick de movimento, sem pino nenhum no mapa, com uma tela de "sim/não" - useGanguesCenaEventoAleatorio.js/EventoVS/gerarBandoEvento, todos removidos). Novo fluxo: 1ª aparição continua sendo uma emboscada de verdade sem pino visível (mesmo roll baixinho por tick, só que agora só roda UMA vez por conta) - depois disso ele fica sempre visível em algum lugar da cena (`cenaProgresso.bicho`, ganguesCenaProgressoSlice.js), patrulhando que nem qualquer outro personagem (reaproveita is-patrulha/andadinha e a colisão visual real já construídas nesta sessão). Colidir de verdade dispara `iniciarBicho()` direto (sem a tela de escolha normal de treta - GanguesCena.jsx), e cada luta resolvida (vitória OU derrota, confirmado com o Isaias) reposiciona ele mais perto via `posicaoBicho`/`proximaDistanciaBicho` (engine/ganguesCenaMotor.js - distância cai 55px por luta, piso de 90px, nunca em cima do jogador). Ficha reaproveita o pool pós-muro (`bichoPool`, PISTA_POOL_GALPAO) escalado pelo mais forte da gangue - confirmado com o Isaias que NÃO fica mais forte com a proximidade. "Amarelo" sai de graça do farol universal (`opcional:true`). Regra do muro mantida como gate (`baseFeita`), como ele pediu. BUG REAL achado no processo: `portao.precisa` (index.js) ainda exigia o POI `birosca` removido hoje mais cedo (merge com o Descanso) - o muro nunca mais abriria pra ninguém; corrigido, junto com uma referência morta ao mesmo POI dentro do interior da birosca (interiores.js). Testado ao vivo via Playwright, ponta a ponta: pino aparece com farol amarelo/retrato/andadinha, colisão real dispara combate de verdade (status "fighting", sem nenhum modal de escolha), e o reposicionamento depois da luta confirmado tanto na vitória quanto na derrota (distância 200→145, nova posição calculada perto de onde o jogador estava).

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
