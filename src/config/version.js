/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.177' // feat: LDI Gangues - maquina de animacao de combate oficial (Trinca + Muro). Ver GANGUES_VERSION.

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.16.0' // feat (Isaias, 16/09/2026 — "a partir de agora a gente vai implementar uma máquina de animação porque todos os personagens vão ter animações"): generaliza o protótipo hardcoded do soco do Trinca (era `GANGUES_TRINCA_SPRITE_TESTE_ID` fixo em DramaticDice.jsx) numa máquina de animação de combate oficial e reaproveitável, escopo: os 30 personagens recrutáveis (inimigos não entram, exceto os 7 chefes — tratados à parte no futuro), começando por ataque normal (poder e defesa ficam com formato pronto no dado, sem UI ainda). Novo registro `data/ganguesCombatAnimations.js`: mapeia `character_template_id` -> folha (`assets/personagens/<slug>/ataque-normal.webp`, resolvida por `import.meta.glob`, mesma convenção de ganguesPortraits.js) + grade/timing + sons (`golpes[]` com quadro de impacto 1-indexado + arquivo próprio, `voz`/`ambiente` opcionais desde o quadro 1); cache de áudio/imagem em nível de MÓDULO com `precarregarAnimacaoCombate` chamado 1x no início de cada luta (GanguesCombat.jsx, novo useEffect) pra cada personagem do time do jogador — pedido explícito "durante a batalha já deixa carregada... não precisa ficar baixando toda hora". Novo componente genérico `components/GanguesCombatSpriteAnim.jsx`: toca a folha (linhas×colunas, quadro avançado por `setInterval`, não CSS @keyframes — não escala pra 30 personagens escrever um bloco de keyframes à mão por um). `DramaticDice.jsx` trocou toda a lógica hardcoded do Trinca por esse sistema genérico (duração da tela travada em `anim.frames * anim.frameMs`, sons disparados via `tocarSomCombate`). 2º personagem: Muro (`character_template_id` 11) — folha própria (`MuroSocoNormal.png` processada, 16 quadros/4×4, lossless WebP) com 2 socos/impactos (quadro 6 e quadro 12), cada um com som PRÓPRIO (Mixkit, licença comercial) — não reaproveita os sons do Trinca. Correção de arquitetura no mesmo pedido (achado pelo Isaias vendo o VS Code: "isso ai não deveria ta dentro do jogo... tudo relacionado ao jogo deve ficar dentro da pasta do jogo"): TODO áudio de Gangues (novo e pré-existente — inclusive `saves-impact.mp3`/`saves-tijolo.mp3` de uma sessão anterior) migrado de `public/sounds/` para `src/pages/games/Gangues/assets/sons/`, resolvido por `import.meta.glob` igual as folhas de sprite — nada de asset de jogo em `public/` (só o `intro.mp3` da vinheta de abertura do site inteiro, que é genuinamente global, permanece lá). Trilha anterior (3.15.0): teste de colisão por imagem (máscara pixel a pixel) na Pista — ver histórico anterior deste arquivo no git.
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
