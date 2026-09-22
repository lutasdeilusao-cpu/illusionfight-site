/**
 * VERSIONS — Arquivo Único de Versionamento
 *
 * Todas as versões do site centralizadas aqui.
 * workflow: 1. alterar versão neste arquivo  2. atualizar SITE_MAP.md  3. build, commit, push, deploy
 *
 * Última atualização: 2026-09-10
 */

 // ── Site ──────────────────────────────────────────
export const SITE_VERSION = '10.280.238' // feat: LDI Gangues - pino dedicado do agiota (Marimbondo), separado da birosca (ver GANGUES_VERSION).

// ── Games ─────────────────────────────────────────
export const PP_VERSION        = '2.3.1'  // Pesadelo Particular — fix: guest i18n keys movidas para o namespace pp em pt/en/es.json
export const LDI_VERSION       = '2.0.1'  // Lendas do LDI — guest aviso melhorado no lobby (título, texto explicativo, link cadastro)
export const JACK_VERSION      = '5.3.2'  // Jack Dream Beer — correção de encoding em comentário
export const GANGUES_VERSION   = '3.51.0' // feat (Isaias, 21/09/2026: "vamos criar um pin dedicado ao agiota, escolhe uma imagem, coloca ele no cantinho, parado, com uma tag nele, agiota. Ele só fala que dá 100. Antes de emprestar ele lança um contrato e a pessoa aceita ou não. Lá embaixo, letra miúda, escrito que deve 1000. Depois que pegou o empréstimo, fala bem clara na tela: você me deve agora"): pino NOVO e personagem NOVO (Marimbondo/Hornet/Avispón - retrato emprestado do catálogo de inimigo "Fiado Vencido"/1206, mesmo truque do balconista do Balcão do Aperto), separado do Nato da birosca. Confirmado com o Isaias via pergunta direta: TODO o sistema de agiotagem (empréstimo, cura fiada/escada, socorro no teto, pagar, Clube da Luta) migrou pro agiota - a birosca (POI `descanso`, GanguesDescanso.jsx) voltou a ser SÓ cura (descansar/reviver caído), sem nenhuma menção a dívida. Fluxo do empréstimo redesenhado (a novidade central): 1) fala inicial só menciona os 100; 2) botão "Quero o empréstimo" abre uma tela de CONTRATO nova (não emprestava mais direto no clique) com o texto do acordo + letra miúda (`.gds-letra-miuda`, CSS novo) mostrando a dívida exata; 3) só "Aceito" chama `pedirEmprestimoNato()` de verdade - a tela de resultado ("agora você me deve") já vem pronta do `<GanguesAgiotagem>` (o componente reutilizável criado na versão anterior, agora com seu 2º consumidor de verdade). Novo componente `GanguesAgiota.jsx` (screen do POI, replica a estrutura do GanguesDescanso mas só com agiotagem+Clube, sem descansar) + POI novo `agiota` (tipo próprio, pois.js/posicoes.js - fica no cantinho da entrada, perto do spawn, `ehPersonagem` exclui `tipo==='agiota'` pra ficar parado igual a loja) + tag "AGIOTA" nova em ICONE/LABEL_TIPO (GanguesCenaAtores.jsx) + i18n `cena.tipo.agiota` nos 3 idiomas. Todo texto de agiotagem/Clube da Luta que citava "o Nato" (fiado_devendo, clube_oferta_*, aviso_rep_clube, aviso_divida_chefe, nato_socorro_*, emprestimo_*) trocado pra "Marimbondo"/"Hornet"/"Avispón" nos 3 idiomas - os identificadores internos (pedirEmprestimoNato, GANGUES_EMPRESTIMO_NATO_*) ficaram com o nome antigo de propósito (não compensa o risco de renomear tudo que já referencia, só o texto visível ao jogador precisa bater). Tutorial da birosca (`descanso_tutorial.fiado`) removido/migrado pra um tutorial novo do agiota (`agiota_tutorial.emprestimo`, GanguesDescansoTutorial.jsx). Testado ao vivo via Playwright, ponta a ponta, contra o jogo real (recrutou elenco, teleportou o player pra dentro da zona do agiota via `cenaProgresso.pista.posicao`, sem harness): botão de interação mostrou "AGIOTA" ao aproximar, fala inicial só menciona 100, tela de contrato mostrou a letra miúda com a dívida exata (1000), aceitar creditou +100 de grana e mostrou a fala clara "agora tu me deve 1000", reabriu com dívida ativa e confirmou "Pedir mais fiado" dobrando pra 2000, forçou o teto (8000) e confirmou o botão virar "Pedir socorro ao Marimbondo". Confirmado também, isolado num harness da birosca sozinha, que ela NÃO mostra mais nenhum botão/menção de dívida mesmo com a dívida do agiota ativa (5000). a agiotagem que já existe só que hoje só serve pra ganhar cura. Você vai poder pegar um empréstimo com o Nato, até 100, só que paga 10 vezes mais, fica devendo 1000. Só pode pegar uma vez enquanto não pagar. A partir daí você pode se endividar pelo dobro pra ganhar uma cura - 1000 vira 2000, dobra de novo pra 4000, até 10.000. Chegou nos 10.000, na hora que vier pedir grana o Nato não vai nem cobrar, ele te remenda mas já te joga pro Clube da Luta. Antes de enfrentar o Carvão você tem que pagar sua dívida, não importa o tamanho - o melhor esquema pra pagar é o Clube da Luta. Cria um componente reutilizável desacoplado desse sistema"): REDESENHO COMPLETO da agiotagem do Nato, substituindo de vez o fiado antigo (5×/10× por contagem de "fiados", "nome sujo" depois de 2 - conceito de `fiados` removido inteiramente de `__birosca`). Nova escada guiada só pela própria dívida: `pedirEmprestimoNato()` (só com divida=0, dá 100 de grana na mão e já endivida em ×10 pra 1000) → `fiarDescanso()` (agora sem parâmetro, DOBRA a dívida atual em vez de multiplicador fixo, só com divida>0 e antes do teto) → acima de 8000 (dobro passaria de 10.000), `agiotagemInfo().noTeto` fica true e a UI oferece "pedir socorro" em vez de mais fiado - aceitar cura de graça (sem custo extra) e joga DIRETO pro Clube da Luta sem a tela normal de aceitar/recusar (`iniciarClube(custoBase, gratis=true)` em GanguesCena.jsx, pula o gate de reputação e NÃO soma o 15× de entrada normal). Gate novo em `iniciarTreta` (GanguesCena.jsx): com `divida>0`, encarar o chefe (Carvão) é bloqueado em qualquer território, com aviso apontando pro Nato/Clube da Luta - resto da Pista (farm, pós-muro) continua livre, só o chefe trava. "Componente reutilizável desacoplado" pedido explicitamente: `GanguesAgiotagem.jsx` (novo, components/cena/) concentra as 3 telas de resultado (contrato do empréstimo, contrato da cura fiada, socorro forçado) e não depende de nada específico do Nato/Pista - recebe retrato/nome/custoBase/onClube por prop e usa render-prop (`children({ agio, pedirEmprestimo, pedirCuraFiada, pedirSocorro })`) pra quem usa (hoje só GanguesDescanso.jsx) montar os PRÓPRIOS botões junto com os que não são de agiotagem (descansar, pagar, clube) num único diálogo; a REGRA em si (quanto empresta, quanto dobra, o teto) mora inteiramente no store (`agiotagemInfo`/`pedirEmprestimoNato`/`fiarDescanso`, `ganguesBiroscaSlice.js`), 100% NPC-agnóstica, reutilizável por qualquer território futuro sem duplicar nada. Testado ao vivo via Playwright: (1) no store direto, com personagens reais hidratados - escada completa 1000→2000→4000→8000, bloqueio de 2º empréstimo (`ja_deve`), bloqueio no teto (`teto`), pagamento parcial; (2) na UI de verdade, montando GanguesDescanso isolado num harness com providers reais (Auth/Language/TutorialProgress) - clicou "Pegar empréstimo" (grana +100, contrato mostrado), reabriu (remonta como GanguesCena faz de verdade) e viu a caderneta em 1000, machucou a tropa e clicou "Pedir mais fiado" (dívida foi pra 2000, com a animação de descanso), forçou a dívida pro teto (8000) e confirmou o botão virar "Pedir socorro ao Nato", clicou e confirmou `onClube(custoBase, true)` disparado corretamente. Zero erros de console em todo o teste.

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
