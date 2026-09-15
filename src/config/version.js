/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.166' // fix: LDI Gangues - overlay de debug do mapa da Pista mostrava so quarteiroes + TODOS os predios (inclusive os sem colisao de verdade) - agora desenha literalmente o array de colisao real (collidersDaCena), separando o que colide agora do que so existe no dado mas nao trava o jogador. Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.9.2' // fix (Isaias, na sequência, ainda mais direto: "eu não espero mesmo que você tenha certeza que você tá exibindo todos os colisores, não só os que você selecionou, eu quero todos"): com razão — auditei `DebugColisores` contra a função de colisão REAL (`collidersDaCena`, ganguesCenaMotor.js) e achei duas divergências de verdade. (1) o overlay desenhava `cena.predios` inteiro como se TODOS colidissem — mas `collidersDaCena` só considera sólido o prédio com `solo:true` E (sem `pos_portao` OU já com `bossAberto`); um prédio sem `solo` (ex: `loja`/`pm1`/`galpao` da Pista, que não tem fachada própria, só porta) nunca colide, e um com `pos_portao` só passa a colidir depois que o chefe cai — mostrar os 7 igual, sem distinguir, seria mentir sobre quais travam de verdade AGORA. (2) faltava por completo qualquer colisor vindo de `obstaculos.solido` (via `obstRect`) — vazio pra Pista hoje (a ilustração de fundo já desenha entulho, não duplica em CSS), mas se outro território reativar isso, a versão antiga do overlay nunca ia mostrar. Fix: extraída `predioEhSolido(pr, bossAberto)` de dentro do `.filter` de `collidersDaCena` pra função nomeada e exportada — `DebugColisores` agora desenha literalmente `collidersDaCena(cena, bossAberto)` (vermelho, rotulado `#0`..`#N`, É o array real usado por `hitsSolid`/`stepPlayer`) e, separado, os prédios que existem no dado mas NÃO colidem agora (ciano tracejado mais apagado, só referência — pra não confundir com colisor de verdade). Contagem pra Pista fresca (bossAberto=false): 16 quarteirões + 3 prédios sólidos (`c1`/`of`/`tunel_ent`) = 19 colisores reais + 4 prédios sem colisão (`tunel_sai`/`loja`/`pm1`/`galpao`) = os 7 prédios do dado inteiro contabilizados, nenhum sobrando. **Autocrítica**: na 1ª tentativa de separar "sólido" de "não sólido" escrevi a condição invertida (`pos_portao && bossAberto` em vez de `pos_portao && !bossAberto`) — isso fazia o `tunel_sai` sumir do overlay INTEIRO (nem colisor real, nem "sem colisão"), o exato tipo de bug que o Isaias tinha acabado de pedir pra eu garantir que não existisse. Pego antes de reportar como pronto só porque testei a contagem TOTAL (7 prédios = solid + não-solid) em vez de confiar visualmente; corrigido extraindo a condição pra função compartilhada com `collidersDaCena` (não uma reimplementação paralela) — impossível divergir de novo sem os dois lugares mudarem juntos. Verificado ao vivo: 19 colisores reais + 4 prédios de referência, soma batendo com os 23 elementos esperados (16+3+4), zero erro de console. (linha abaixo) resolveu a persistência do `?debugmapa=1` achando que a fricção era "esquecer de digitar de novo" — errado. O problema real, que só ficou óbvio com esse print/mensagem: de onde o Isaias joga no celular NÃO TEM barra de endereço acessível pra editar a URL — a query string nunca foi uma forma de ligar isso NA PRÁTICA, com ou sem persistência. Fix de verdade: botão 🧱 de verdade no HUD da cena (`GanguesCena.jsx`, só aparece em cena com `fundoImagem`, hoje só a Pista), ligando/desligando o overlay com toque direto — `alternarDebugMapa()` (nova função exportada de `CenaCenario.jsx`) grava/apaga o mesmo `localStorage['ldi-gangues-debugmapa']` de antes. A query string continua funcionando por baixo (útil pra mim automatizar com Playwright), mas deixou de ser o único jeito. Verificado ao vivo: 1º toque liga (16 quarteirões + 7 prédios aparecem, botão acende), 2º toque desliga, localStorage acompanha os dois. (1) o overlay de debug em si já funcionava desde a v3.9.0 (confirmado com Playwright: 16 quarteirões/vermelho + 7 prédios/ciano + 18 zonas/verde + 18 POIs/amarelo renderizando certinho) — o problema NA ÉPOCA parecia ser persistência. Fix anterior: `isDebugMapaAtivo()` (CenaCenario.jsx) grava/lê `localStorage['ldi-gangues-debugmapa']` — `?debugmapa=1` liga e persiste, `?debugmapa=0` desliga, sem parâmetro nenhum lê o que já tava salvo (esse mecanismo de leitura continua existindo, só ganhou uma segunda forma de escrever nele: o botão). (2) fundo da Pista (`mapa-exterior.webp`, 470KB) cortado em 2 arquivos exatamente na faixa do muro (y920 — mesma faixa y900-940 que já bloqueia colisão em `hitsSolid`): `mapa-exterior-baixo.webp` (spawn até o muro, ~265KB) e `mapa-exterior-cima.webp` (só depois do muro/túnel, ~198KB) — soma menor que o arquivo único de antes. Tela de loading bloqueante (`mapaPronto`/GanguesCena.jsx, com teto de 4s de segurança) garante que a metade de baixo já existe no navegador antes de liberar a entrada na cena — sem isso o jogador podia entrar antes da imagem terminar de baixar numa conexão ruim. A metade de cima só é MONTADA no DOM (`precisaFundoCima`, calculado como `player.y <= 1430` — mesmo limiar que já acende o aviso de muro trancado — OU muro/túnel já destrancado) quando o jogador se aproxima de verdade: tentei primeiro `loading="lazy"` nativo no `<img>`, mas o elemento mora dentro de `.gang-cena-world` (que "rola" a câmera via `transform:translate3d`, não scroll real) e não dava pra confiar que todo navegador calcula a distância-até-o-viewport considerando esse transform — o controle explícito por prop, confirmado por log de rede real (Playwright), é mais confiável. **Bug sério achado e corrigido no processo**: `avisoNivelOff` (`useState`, antes perto do fim do componente) já vivia DEPOIS de 2 `return` condicionais existentes (`!cena`, `local && !amb`) — violação latente das Rules of Hooks que nunca disparava na prática porque esses 2 casos são raros. A nova tela de loading virou um 3º `return` condicional bem mais comum (dispara em TODA entrada na Pista enquanto a imagem carrega), e passou a violar a regra de verdade a cada entrada — React acusava "Rendered more hooks than during the previous render" e a tela crashava pra preto assim que a imagem terminava de carregar. Pego ANTES de subir pra produção só porque o teste ao vivo (Playwright, com a imagem de baixo atrasada artificialmente) cobriu o ciclo completo "loading aparece → some"; corrigido movendo o hook pra cima de qualquer `return`, junto dos outros. Lição: um `return` condicional novo em qualquer componente grande precisa ser checado contra TODO hook que vem depois dele no arquivo, não só os hooks que o cercam de perto.
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
