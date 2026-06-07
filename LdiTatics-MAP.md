TASK: Marélia — Geografia + Interiores
Arquivo: C:\Users\isaia\Downloads\BRANDS\Lutas de Ilusão\SiteLDI\sandbox\game.html

REGRA PRINCIPAL
Esse arquivo já tem uma engine completa funcionando. Não toca em nada dela.
O que já existe e não pode ser alterado:

Movimento célula por célula estilo Pokémon (WASD + setas)
Câmera com lerp suave seguindo o player
Sistema de colisão (colliders[] + collides())
Minimapa (#minimap + #mm-player)
Zone HUD (#zone-hud + getZone() + array ZONES)
HUD de localização (#hud)
Interface Game Boy (moldura, analógico, botões A e B)
gameLoop() com requestAnimationFrame
Funções utilitárias: rect(), building(), window_(), road(), sidewalk(), tree(), debris(), addZoneLabel()

Você vai usar exatamente essas funções para desenhar. Nenhuma nova biblioteca, nenhum canvas, nenhum sprite, nenhum tilemap.

O QUE FAZER
PASSO 1 — Substituir o conteúdo do mapa externo
Apagar apenas o bloco que desenha o mapa atual (os rect(), building(), road() etc que geram o visual) e redesenhar com a geografia canônica de Marélia usando as mesmas funções.
Os 8 locais que precisam existir no mapa, cada um com um building() e uma entrada no array ZONES:
PRÉDIO DA YOHUALTICIT  → telhado #8b1a1a  (maior edifício, posição central/norte)
MERCADINHO DO SEU JÃO  → telhado #c47820  (barracas, estilo mercado)
RECOVERY CENTER        → telhado #2a6040
BAR DO ZÉ              → telhado #6b3a50
TRAINING CENTER        → telhado #2a4060  (zone-label: "SÓ ASSINANTES")
FASHION CENTER         → telhado #804060
SAVE CENTER            → telhado #505a50
CASA DO PERSONAGEM     → telhado #6b4a20
Conectar com road() e sidewalk(). Espalhar tree() e debris() para dar vida. O array ZONES detecta quando o player está na porta de cada local — isso já funciona, só precisa ter as zonas certas.

PASSO 2 — NPC Detetive
Um rect vermelho #cc3333 de 10×14px em algum ponto central da praça. Uma addZoneLabel com "DETETIVE" acima dele. Uma entrada no array ZONES com área ~50×50px ao redor dele com name: 'FALE COM O DETETIVE'.
jsconst detX = 780, detY = 600;
rect(detX, detY, 10, 14, '#cc3333', 20);
addZoneLabel(detX - 10, detY - 16, 'DETETIVE');
// no array ZONES:
{ x: detX - 20, y: detY - 20, w: 50, h: 50, name: 'FALE COM O DETETIVE' }

PASSO 3 — Sistema de interiores
Criar um segundo div de mundo para os interiores, irmão do #world existente:
html<div id="world-interior" style="display:none;position:absolute;will-change:transform"></div>
Criar variável de estado e funções de troca:
jslet currentMap = 'exterior';

const INTERIOR_NAMES = {
  yohualticit: 'PRÉDIO YOHUALTICIT',
  jao:         'MERCADINHO DO SEU JÃO',
  recovery:    'RECOVERY CENTER',
  bar:         'BAR DO ZÉ',
  training:    'TRAINING CENTER',
  fashion:     'FASHION CENTER',
  save:        'SAVE CENTER',
  casa:        'CASA',
};

const interiorSpawns = {
  yohualticit: { x: 200, y: 450 },
  jao:         { x: 150, y: 200 },
  recovery:    { x: 150, y: 200 },
  bar:         { x: 150, y: 200 },
  training:    { x: 150, y: 200 },
  fashion:     { x: 150, y: 200 },
  save:        { x: 150, y: 200 },
  casa:        { x: 150, y: 200 },
};

// mapa de qual zone-name abre qual interior
const ZONE_TO_MAP = {
  'PRÉDIO DA YOHUALTICIT': 'yohualticit',
  'MERCADINHO DO SEU JÃO': 'jao',
  'RECOVERY CENTER':       'recovery',
  'BAR DO ZÉ':             'bar',
  'TRAINING CENTER':       'training',
  'FASHION CENTER':        'fashion',
  'SAVE CENTER':           'save',
  'CASA DO PERSONAGEM':    'casa',
};

function enterMap(mapId) {
  currentMap = mapId;
  document.getElementById('world').style.display = 'none';
  const wi = document.getElementById('world-interior');
  wi.innerHTML = '';
  wi.style.display = 'block';
  buildInterior(mapId, wi);
  const spawn = interiorSpawns[mapId];
  px = spawn.x; py = spawn.y;
  camX = 0; camY = 0;
  document.getElementById('hud').textContent = INTERIOR_NAMES[mapId];
}

function exitMap() {
  currentMap = 'exterior';
  document.getElementById('world-interior').style.display = 'none';
  document.getElementById('world').style.display = 'block';
  // posicionar player na porta do edifício que saiu — ajustar por local
  px = 800; py = 800;
  document.getElementById('hud').textContent = 'MARELIA';
}
No listener de tecla, adicionar entrada pelo botão A (KeyA ou Enter):
jswrap.addEventListener('keydown', e => {
  keys[e.key] = true;
  // entrar em edifício
  if (e.key === 'a' || e.key === 'A' || e.key === 'Enter') {
    if (currentMap === 'exterior') {
      const zone = getZone(px, py);
      const mapId = ZONE_TO_MAP[zone];
      if (mapId) enterMap(mapId);
    } else {
      // verificar saída dentro do interior
      if (getInteriorZone(px, py) === 'SAIDA') exitMap();
    }
  }
  e.preventDefault();
});

PASSO 4 — Função buildInterior(mapId, container)
Recria as funções rect(), building() etc mas escrevendo no container passado em vez do world global. Ou adapta as funções para aceitar um container opcional.
Cada interior é 800×800. Desenhar com os mesmos rect() coloridos. Não precisa ser elaborado — só o suficiente para navegar e sentir o espaço.
PRÉDIO YOHUALTICIT:

Hall de entrada
20 portas numeradas (ANDAR 01 a ANDAR 20) em duas colunas
Porta "CARDS ZONE" separada
Porta "SAÍDA" no sul

TODOS OS OUTROS:

Ambiente simples com balcão, mesas ou estações conforme o tipo
Porta "SAÍDA" no sul com zona { name: 'SAIDA' } na frente dela

Para detectar zona dentro do interior, criar getInteriorZone() separado — mesmo padrão do getZone() mas com array próprio que é populado pelo buildInterior().

RESUMO EM UMA LINHA
Pega o game.html, lê tudo, não muda a engine, substitui só o desenho do mapa externo com os 8 locais de Marélia + detetive, e adiciona o sistema de interiores com troca de mapa ao pressionar A na porta.

GDD — DIGITAL CARDS LDI (DC-LDI)
Game Design Document v0.1 — 06/06/2026

1. VISÃO GERAL
Nome: Digital Cards LDI
Gênero: RPG de exploração + batalha por turnos + card collecting
Plataforma: Web (mobile-first, vertical), integrado ao portal illusionfight.com
Público: jogadores do portal LDI, fãs do universo, assinantes
Objetivo central: O jogador recebe suas primeiras cartas, explora a cidade de Marélia, descobre uma conspiração por trás do sistema de cartas digitais da Yohualticit, e sobe os 20 andares do centro de batalha enquanto coleta pistas e personagens.

2. FLUXO DE ONBOARDING
Tela de boas-vindas (narração da IA-GUIDE da Yohualticit)
  ↓
"Você foi selecionado para o sistema Beta de Digital Cards do LDI.
Seja bem-vindo a Lutas de Ilusão."
  ↓
Jogador recebe 2 Digital Cards (personagens nível 1)
  ↓
Tutorial mínimo de movimentação na cidade
  ↓
Cidade de Marélia desbloqueada
A narração da IA-Guide é entregue em typewriter, no estilo já usado nos outros jogos do portal. Tom frio, institucional, levemente perturbador — ela representa a Yohualticit.

3. ESTRUTURA DE CÂMERA E INTERFACE
Viewport: mobile-first, vertical. A cidade é exibida em câmera top-down estilo tile 7 (sprite-based), câmera "falsa" que já existe no sandbox.
Moldura Game Boy:

A tela do jogo fica dentro de uma moldura estilizada de Game Boy
Abaixo da tela: D-pad analógico + botões A e B
Botão A: interagir / confirmar
Botão B: cancelar / voltar
Visual retrô intencional — reforça a estética de "jogo dentro de um jogo"

Orientação: sempre vertical. Sem modo landscape.

4. GEOGRAFIA DE MARÉLIA
Mapa fechado, pequeno, desenhado para ser navegável com poucos tiles novos. Cada local é um ponto de interação.
LocalFunçãoAcessoPrédio da YohualticitBattle Zone (20 andares) + Cards ZoneFreeMercadinho do Seu JãoLoja — itens e equipamentosFreeRecovery CenterRecupera HP das cartas (custa moedas do portal)FreeBar do ZéFliperama — minigamesFreeTraining CenterTreinamento automático de cartasSó assinantesFashion CenterCustomizações estéticas do personagemFree / PremiumSave CenterSalva o progresso manualFreeCasa do PersonagemHub pessoal — ver pistas coletadas, cartas, históricoFree
O Detetive aparece em pontos variáveis da cidade conforme o progresso do jogador (ver seção 9).

5. SISTEMA DE CARTAS (DIGITAL CARDS)
5.1 Distribuição
OrigemQuantidadeComo obterInício (onboarding)2Automático ao criar contaBattle Zone (progressão)8Desbloqueadas ao atingir andares específicosEventos6Distribuição em eventos do portalExclusivas assinante4Só para planos Elite ou PrimordialTotal20—
5.2 Níveis

Cada carta vai do Level 1 ao Level 99
Carta nova recebida = sempre começa no Level 1, independente de quando foi obtida
Isso garante longevidade: ganhar uma carta no andar 15 não significa poder usá-la no andar 15 imediatamente

5.3 Composição de time

Mínimo: 2 cartas para entrar em qualquer batalha
Máximo: 3 cartas por batalha
Com mais cartas no deck, o jogador escolhe quais 2 ou 3 levar


6. BATTLE ZONE — PRÉDIO DA YOHUALTICIT
6.1 Estrutura dos andares
20 andares, divididos em blocos de 5:
BlocoAndaresLevel alvo das cartas11–51–10 (estimado)26–10—311–15—416–20—
Regra de progressão: para subir de bloco, o jogador precisa ter no mínimo 2 cartas no level máximo daquele bloco.
6.2 Sistema de batalha
Motor: o sistema isométrico já existente no LDI Tatics (v5.3.8), reaproveitado.

Grid isométrico Canvas 2D
Combate por turnos
Juice visual já implementado (screen shake, flash, dano popup)
3v3 adaptado para o contexto de cartas

6.3 Cards Zone
Galeria dentro do prédio onde o jogador pode visualizar todas as 20 cartas do jogo — incluindo as que ainda não possui. Funciona como Pokédex: mostra o que existe, cria desejo de coletar.

7. TRAINING CENTER (SÓ ASSINANTES)

Jogador seleciona quais cartas colocar para treinar
Batalhas acontecem automaticamente, sem interação
XP ganho no automático: 10% do XP do modo manual
Jogador pode deixar o site aberto rodando em segundo plano
Se ambas as cartas em treino zerarem HP → modo automático para → obrigatório ir ao Recovery Center antes de retomar
Reaproveitamento do sistema de simulação automática já construído no Tatics


8. RECOVERY CENTER

Restaura HP das cartas após batalhas (automáticas ou manuais)
Custo: moedas do portal (DIX ou equivalente definido para este jogo)
Obrigatório antes de continuar qualquer modo de batalha com cartas no 0 de HP


9. O DETETIVE — SISTEMA DE PISTAS
9.1 Mecânica

Um NPC com roupa de detetive aparece em pontos diferentes da cidade conforme o andar atingido na Battle Zone
A cada vez que o jogador ultrapassa um bloco de andares, o Detetive tem uma nova conversa disponível
Ele entrega um documento/pista da história real por trás do DC-LDI

9.2 Quest dinâmica
O Detetive não entrega a pista de graça. Fluxo:
Detetive fala → dá uma missão no portal
  ↓
Sistema verifica o que o jogador ainda NÃO fez no portal (via sistema de ativo)
  ↓
Quest gerada dinamicamente (jogar um jogo, ler um capítulo, fazer algo no portal)
  ↓
Jogador cumpre a quest fora do DC-LDI
  ↓
Ao voltar, conversa com o Detetive → recebe o pedaço de pista
9.3 Caderno de pistas (Casa do Personagem)

Estilo Resident Evil 2: documentos com fragmentos de informação
20 pistas no total = história completa revelada
Jogador monta o quebra-cabeça narrativo conforme progride
A história: o que realmente é o sistema de Digital Cards da Yohualticit, e por que o jogador foi "selecionado"

9.4 Gancho narrativo
O Detetive eventualmente diz: "Você acha que isso aqui é só um joguinho de cartas digitais? Isso é muito mais que isso." — este é o ponto de virada que prende o jogador na narrativa de longo prazo.

10. SISTEMA DE DIÁLOGO E NARRATIVA
Reaproveitamento direto dos sistemas já existentes no portal:

Typewriter com prefixos de personagem (padrão LDI Lendas)
SceneView para cenas de apresentação
Conversas com NPCs seguem o padrão já usado no Jack Dream Beer e Lendas do LDI
Detetive tem prefixo próprio (cor e fonte a definir, sugestão: serif âmbar — contrasta com o teal institucional da Yohualticit)


11. ECONOMIA DO JOGO
MoedaUsoFonteDIX (moeda do portal)Recovery Center, Fashion Center, itens no Seu JãoAtividades no portalXP de cartaUpar level das cartasBatalhas manuais (100%) ou Training automático (10%)
Mantendo a economia integrada ao portal — sem sistema monetário paralelo.

12. PROGRESSÃO COMPLETA DO JOGADOR
Cria conta → recebe 2 cartas (L1)
  ↓
Explora Marélia, entende os locais
  ↓
Entra na Battle Zone, sobe andares
  ↓
A cada bloco: carta nova desbloqueada + pista do Detetive disponível
  ↓
Usa Training Center (assinante) para upar cartas em paralelo
  ↓
20 andares completos + 8 cartas da progressão coletadas
  ↓
Participa de eventos (6 cartas) e/ou assina (4 cartas exclusivas)
  ↓
Deck completo de 20 cartas
  ↓
20 pistas coletadas → história completa revelada

13. ROTAS E INTEGRAÇÃO NO PORTAL
Rota sugeridaComponenteObservação/games/digitalcardsDCRouteHub principal — cidade de Marélia/games/digitalcards/battleDCBattleReusa engine do Tatics/games/digitalcards/trainingDCTrainingSimulação automática, só assinante/games/digitalcards/cardsDCCardsCards Zone — galeria completa
Console: [DC] versão carregada: 1.0.0

14. REAPROVEITAMENTO DE SISTEMAS EXISTENTES
Sistema existenteOnde reusa no DC-LDIEngine isométrica (Tatics v5.3.8)Battle ZoneSimulação automática (Tatics)Training CenterTypewriter + prefixos (LDI Lendas)Diálogos, narraçãoSceneView (LDI Lendas)Cenas de apresentaçãoCaderno de pistas (LDI Lendas)Casa do PersonagemSistema de ativo do portalQuests dinâmicas do DetetiveDIX economy (Tamagoshi)Recovery Center, lojaLoginGateConteúdo de assinanteResultCardPós-batalha

15. O QUE AINDA PRECISA SER DEFINIDO

Nomes e designs dos 20 personagens/cartas (já fechados segundo o handoff — só precisam ser importados)
Quais andares específicos desbloqueiam quais cartas
Conteúdo das 20 pistas (história interna do DC-LDI)
Quests do Detetive — banco inicial de missões
Stats e atributos das cartas (compatibilidade com engine do Tatics)
Fashion Center — o que é customizável e a que custo
Minigames do Bar do Zé — reaproveitamento do MiniGames existente ou novos