# LDI Arena

Jogo tático por turnos em tabuleiro hexagonal. Times de até 4 combatentes (jogador × IA) se enfrentam até um lado ficar sem ninguém vivo. Hoje é um protótipo jogável de ponta a ponta no modo Treino.

Código: `src/pages/lab/Prototype/ArenaTestbed/`. Textos: `src/i18n/prototype/pt.json` (bloco `prototype.arena_testbed`, ~236 chaves). Versão: `ARENATESTBED_VERSION` em `src/config/version.js`.

Este documento tem tudo o que existe sobre o jogo, num lugar só:

- **Parte 1** — o que o protótipo tem hoje e como funciona.
- **Parte 2** — o material do universo que pode virar jogo (manual de batalha, golpes dos personagens, a arena na história, o Tactics antigo e o que os outros jogos já provaram).
- **Parte 3** — propostas de que jogo construir e em que ordem.
- **Parte 4** — as decisões que fecham o rumo.

Na Parte 1, os caminhos são relativos a `src/pages/lab/Prototype/ArenaTestbed/`.

---

# Parte 1 — O que existe hoje

## 1. Como se chega no jogo

- Rota: `/games/ldi-arena`, embrulhada em `<SoAdmin>` (`src/App.jsx`). `/prototype/arenatestbed` redireciona para ela.
- Também aparece no catálogo de protótipos (`src/pages/lab/Prototype/Prototype.jsx`, id `arena-testbed`).
- Ao montar, liga `readerMode` (some navbar) e pré-carrega os sons (`ArenaTestbed.jsx:39-41`).

## 2. Fluxo de fases

O orquestrador é `ArenaTestbed.jsx`. As fases são o enum `FaseArena` (`ArenaTestbed.jsx:17-26`) e a tabela `FASES_CONFIG` (`ArenaTestbed.jsx:137-171`). No topo há um indicador de 8 passos (bolinhas numeradas, ✓ nas já feitas). O estado que passa entre fases mora no orquestrador: `characters`, `boardState`, `poderesEscolhidos`, `animacoesPorChar`, `modoJogo`, `fichaId`.

| # | Fase | Arquivo | O que o jogador vê e faz |
|---|------|---------|--------------------------|
| 0 | INICIO | `phases/Phase0Start.jsx` | "Novo jogo" ou "Carregar". Lista de fichas salvas (nomes dos personagens), carregar ou apagar (com confirmação). Aviso quando atinge o limite de 9 fichas. O botão "Carregar" grande carrega sempre a 1ª ficha. |
| 1 | FICHA | `phases/Phase1SheetBuilder.jsx` | Monta até 4 combatentes. Cada um: time (Jogador/IA), personalidade (só IA), tipo de ataque (corpo a corpo / distância), orçamento de pontos (3 a 30, de 3 em 3), distribuição nos 6 atributos, equipamento, poções HP/MP iniciais. Só avança com ≥1 jogador, ≥1 IA e todos os pontos gastos. |
| 2 | PERSONALIZACAO | `phases/Phase2Customize.jsx` | Só para os personagens do jogador (máx. 3): cor (3 fixas), ícone (círculo/quadrado/losango) e nome (Kim, Jack, Nina). Cor e nome não se repetem. Ao confirmar, a ficha é salva no `localStorage`. Carregar ficha pula direto pra cá. |
| 3 | MODO | `phases/Phase3ModeSelect.jsx` | Treino (ativo) ou Campanha (botão com selo "em breve", sem ação). |
| 4 | TABULEIRO | `phases/Phase4BoardSetup.jsx` | Editor do mapa em canvas: tamanho (até 10 colunas × 15 linhas, começa em 7×4), ferramentas Selecionar/Borracha, 4 tipos de obstáculo, poções no chão (HP/MP), posicionar personagens. Só libera "Iniciar" com jogadores na metade esquerda, IA na direita e sem sobreposição. |
| 5 | PODERES | `phases/Phase5PowerSelect.jsx` | Um card recolhível por personagem (jogador e IA). Grade de poderes filtrada pelo tipo do personagem, abas por elemento e ordenação por FA/FD/A-Z. Limite de poderes = `min(RES, 4)`. IA sem escolha recebe 1–3 poderes aleatórios (`ArenaTestbed.jsx:84-96`). |
| 6 | ANIM_DEBUG | `phases/Phase5bAnimDebug.jsx` | Tela de depuração (marcada "[DEBUG]", texto fixo em português): escolhe o id de animação de movimento, ataque corpo a corpo, ataque à distância, defesa, "habilidade" e "efeito" de cada personagem. |
| 7 | COMBATE_V2 | `phases/Phase6CombatV2.jsx` | A batalha (seção 6). No fim, tela de vitória/derrota com "jogar de novo" (volta à fase 0). |

## 3. Ficha do personagem

### Atributos (`phases/Phase1SheetBuilder.jsx:7`)

`forca` (FOR), `agi` (AGI), `dex` (DEX), `pdf` (PdF, poder de fogo), `res` (RES), `arm` (ARM). Cada ponto custa 1 do orçamento. RES mínimo 1, demais mínimo 0.

- Corpo a corpo (`melee`): PdF travado em 0.
- Distância (`distancia`): FOR travada em 0 na tela; `criarPersonagem` grava FOR = 1 (`engine/combat.js:211`).

### Valores derivados (`engine/combat.js`)

- HP = RES × 10 (`engine/combat.js:174-176`).
- MP = RES × 10 (`engine/combat.js:182-184`).
- Casas de movimento: tabela por faixa (AGI ≤2 → 1, ≤5 → 2, ≤8 → 3, senão 4) ou 1 AGI = 1 casa com `agiUmPraUm` (`engine/combat.js:162-168`). **O combate usa sempre 1:1** (`phases/Phase6CombatV2.jsx:78` passa `agiUmPraUm: true`; a IA também chama com `true`). O campo `casasMovimento` gravado na ficha usa a tabela e não é lido no combate.
- Alcance de ataque: corpo a corpo = 1 (vizinhos); distância = valor de PdF.
- Equipamento: `nenhum`, `ofensivo` (+2 FA), `defensivo` (+2 FD), `ambos`.
- Inventário: `pocaoHP`, `pocaoMP`.

### Onde mora

- Ficha em edição: estado React da fase 1. Objeto final por `criarPersonagem` (`engine/combat.js:203-230`), id `char_<timestamp>_<rand>`.
- Persistência: `data/fichaStorage.js`, `localStorage['ldi_arenatestbed_fichas']`, interface assíncrona. Uma "ficha" salva = a lista de personagens (jogador personalizado + IA).
- Regras de limite: `engine/regrasFicha.js` (9 fichas, 3 personagens do jogador, 3 cores, 3 nomes).

## 4. Tabuleiro hexagonal

- Hexágonos de topo plano, coordenada offset `{row, col}` com deslocamento por coluna ímpar; distância e linha calculadas em coordenadas cúbicas (`engine/hexUtils.js:14-71`).
- Vizinhos: `getVizinhos` (`engine/hexUtils.js:75-88`).
- `gerarGrid` (`engine/hexUtils.js:50-63`, usado por `engine/useHexCanvas.js`) desloca por **linha** ímpar, diferente do resto do arquivo, que desloca por coluna. Inconsistência a resolver antes de qualquer mapa novo.
- Desenho do combate: `engine/drawCombatBoard.js` (canvas, cores em hex literal); tamanho/clique: `engine/useHexCanvas.js`. Textura de chão: `/assets/arena/terrenos/tile_default.png`.

### Obstáculos (`phases/Phase4BoardSetup.jsx:9-14`)

| Tipo | Nome | Movimento | Corpo a corpo | Linha de visão (distância) |
|---|---|---|---|---|
| 1 | Parede 🧱 | bloqueia | bloqueia | bloqueia (`engine/hexUtils.js:145-157`) |
| 2 | Buraco 🕳️ | bloqueia | bloqueia | não bloqueia |
| 3 | Armadilha/destrutível 🪤 (HP 1–3, efeito nenhum/explosão/congelamento) | livre | livre | livre |
| 4 | Caixa 📦 (marcas "móvel"/"destrutível") | livre | livre | livre |

Os campos de HP, efeito, móvel e destrutível dos tipos 3 e 4 são gravados no mapa mas **nenhum código do combate os lê**. Na prática, tipo 3 e 4 são decoração.

### Itens no chão

Poção HP ou MP numa casa. Quem termina o movimento nela coleta (+1 no inventário) (`engine/useCombatEngine.js:416-428`).

## 5. Ordem de turno (iniciativa)

Calculada uma vez no início e vale a partida inteira (`engine/turnOrder.js`, chamada em `engine/useCombatEngine.js:571-592`).

1. Ordena vivos por AGI decrescente (`engine/turnOrder.js:16-26`).
2. Empate só entre personagens do jogador → o jogador reordena numa tela com setas ("ordering", `phases/Phase6CombatV2.jsx:481-519`).
3. Empate só entre IAs → sorteio.
4. Empate jogador × IA → **Jokenpô** (componente compartilhado `src/components/Jokempo/Jokempo`); vencedores e perdedores se intercalam no bloco (`engine/turnOrder.js:98-127`).

O controle do turno é o módulo `engine/TurnController.js` (estado em variável de módulo, não React): ordem, quem está na vez, ações já feitas no turno, mortos (pulados ao avançar).

## 6. O combate

Tela: `phases/Phase6CombatV2.jsx` (layout) + motor `engine/useCombatEngine.js` (turno, animação e aplicação; a regra do golpe mora em `engine/regras.js`). Topo: de quem é a vez e botão ≡ do log; meio: canvas; abaixo: chips de HP/MP de cada vivo (toque abre `components/modals/CharModal.jsx` com os atributos); rodapé: botões de ação.

### Turno do jogador

- Toque no próprio personagem abre o painel: **Mover**, **Atacar**, **Poção HP ×n**, **Poção MP ×n**. Há também **Finalizar turno**.
- Por turno: 1 movimento e 1 ataque, em qualquer ordem (`TurnController.podeAgir` + `turnoAcoes`). O turno só acaba quando o jogador aperta Finalizar ou usa poção.
- **Mover:** mostra casas alcançáveis por BFS até `AGI` passos, sem atravessar Parede/Buraco (`engine/hexUtils.js:216-241`); remove casas ocupadas. Escolhe o destino, vê o caminho, confirma. O caminho real é refeito com BFS que desvia de personagens (`engine/hexUtils.js:261-284`). Obs.: o alcance mostrado conta passos atravessando aliados/inimigos, mas o caminho real não atravessa — pode mostrar casa que custa mais passos que o AGI.
- **Atacar:** se tem poder de ataque com MP, abre `PowerChoiceModal` (comum ou poder). Destaca alcance e alvos inimigos; toque no alvo ataca.
- **Poção:** +5 HP ou +5 MP (até o máximo) e **encerra o turno** (`engine/useCombatEngine.js:514-530`).

### Fórmulas (`engine/combat.js`)

- **FA corpo a corpo** = FOR + DEXef + d6 (`engine/combat.js:17-18`)
- **FA distância** = (PdF − 1) + DEXef + d6 (`engine/combat.js:20-21`)
- DEXef = DEX inteira se o d6 do atacante deu 6, senão DEX × 0,25 (`engine/combat.js:14`)
- Equipamento ofensivo/ambos: FA + 2 (`engine/combat.js:25-27`)
- **FD** = ARM + AGIef + d6; AGIef = AGI inteira se o d6 do defensor deu 6, senão AGI × 0,25; defensivo/ambos: + 2 (`engine/combat.js:38-46`)
- **Dano** = arredonda(FA − FD), mínimo 1 (`engine/combat.js:88`, `:101`)
- **Redução por distância** (só ataque à distância, sobre o dano bruto): distância 2 → ×0,75; distância ≥ 3 → ×0,5 (`engine/combat.js:91-99`). Distância 1 = 100%.
- **Crítico ofensivo** (d6 = 6): só libera a DEX inteira.
- **Crítico defensivo** (d6 do defensor = 6): dano 0 e contra-ataque com FA/2 contra a FD do atacante (`engine/combat.js:75-86`, resolvido em `resolverContraAtaque`, `engine/combat.js:129-148`; dano mínimo 1, anulado se o atacante tirar 6).
- **Ataque extra**: se AGI do atacante > 2 × AGI do defensor, golpe extra com FA/2 contra nova FD (`engine/combat.js:104-109`; rolado em `engine/regras.js`).
- **Chance de acerto** (`engine/combat.js:189-198`): 100% se DEX atacante > AGI defensor; senão 90% (AGI ≤2), 80%, 70%, 60%, 50%, 40%, 30% (AGI ≥8).

### Regra única do golpe (`engine/regras.js`)

Jogador e IA passam pelo mesmo resolvedor, `resolverGolpe(atacante, alvo, { distancia, poderAtaque, poderDefesa })`. Ele é puro (sem React, sem animação) e devolve tudo já rolado: acerto, custo de MP de quem ataca e de quem defende, dano, contra-ataque e ataque extra. O motor (`engine/useCombatEngine.js`, `executarGolpe`) só paga o MP, anima e aplica; no fim, `aoTerminar` devolve o turno a quem bateu.

- **Acerto:** sempre rolado, para os dois lados (`getChanceAcerto`). Errou = balão MISS, sem dano.
- **Poder de ataque:** vale o poder escolhido. O jogador escolhe no modal; a IA escolhe pela personalidade (Sanguinária e Persistente pegam o mais forte que podem pagar, a Fujona ataca sem poder). Paga o `custoMP` do próprio poder e soma o bônus dele.
- **Poder de defesa:** vale o poder escolhido, com o custo e o valor dele (`valorComparativo.fd`, tirado do dano). O jogador escolhe no modal quando é atacado; a IA defende com o melhor poder de defesa que pode pagar.
- **Contra-ataque e ataque extra:** valem para os dois lados. Quem cai no contra-ataque também é marcado como derrotado.
- **A IA só decide:** as personalidades (`engine/ai/personalidades/`) e `engine/ai.js` devolvem só o pedido — `{ tipo: 'andar' | 'atacar' | 'finalizar', detalhes: { alvo, poderId } }` — e nunca calculam dano.
- O ataque da IA também passa pelo `TurnController` (`podeAgir`/`registrarAcao`), como o do jogador.

### Poderes (`data/poderes.js`, `engine/mecanicasPoder.js`)

- 16 poderes: 3 base sem elemento (FOR+, PdF+, Defesa+) e 13 de amostra em 6 elementos (fogo, água, terra, ar, trevas, luz). Elementos são só filtro/etiqueta, sem efeito.
- Campos: `gatilho` (`ataque`/`defesa`), `tipoPersonagem` (`forca`/`pdf`/`universal`), `custoMP` (3–5), `mecanicaId`, `params`, `valorComparativo` (pra ordenar), `visualId` (sempre null), `tipoExecucao` (sempre `instantaneo`), `turnosCarregamento` (sempre 0).
- Mecânica 1 `bonusAtributo`: soma `bonus` (+2 ou +3) em FOR ou PdF só naquele ataque (`engine/mecanicasPoder.js:12-22`).
- Mecânica 2 `defesaPrompt`: o efeito vem do `valorComparativo.fd` do poder, aplicado em `resolverGolpe`.
- O modal de defesa só aparece se o jogador alvo tem algum poder de defesa que consiga pagar.

### Efeitos de estado

Não existem. Não há veneno, atordoamento, congelamento, queimadura, buff com duração nem nada que dure além de um golpe.

### IA (`engine/ai.js`, `engine/ai/personalidades/`)

Cada IA tem uma personalidade escolhida na ficha (`engine/ai/personalidades/index.js`). O turno da IA tem estágios com pausas encenadas (`engine/useCombatEngine.js:650-810`): pensa (1,5 s) → mostra alcance → decide movimento → anda → decide ação → ataca → encerra. A decisão é chamada duas vezes (fase "movimento" e fase "acao").

- **Sanguinária:** mira o inimigo de menor HP (no mapa todo); ataca se ele está ao alcance, senão avança pelo caminho mais curto até AGI casas.
- **Fujona:** no movimento foge **uma casa** para o vizinho mais longe dos inimigos (encurralada, avança uma casa); na ação ataca o inimigo mais fraco ao alcance.
- **Persistente:** fixa um alvo (menor HP) e só troca se outro ficar mais fraco; grava `alvoFixadoId` mutando o objeto do personagem.
- **Padrão** (`engine/ai.js`, sem personalidade): inimigo mais próximo; ataca ou anda; se nada, pega item no chão.
- Sanguinária e Persistente ignoram a fase: no estágio de movimento podem "decidir atacar" (resultado descartado), aí não andam e atacam no estágio seguinte. Nenhuma IA usa poção do inventário, poder ou obstáculo como cobertura.

### Vitória e derrota

`verificarVitoria` (`engine/useCombatEngine.js:177-192`): sem jogador vivo → IA vence; sem IA viva → jogador vence. HP 0 = morto, marcado no `TurnController` e pulado. Sem limite de turnos, sem empate, sem recompensa nem progresso.

### Câmera (`engine/useCamera.js`)

O tabuleiro é desenhado a partir de dois números: onde a grade começa na tela (`padRef`) e o tamanho do hexágono (`sizeRef`). A câmera só escreve neles a cada quadro (`camera.tick`, no `onFrame` da tela de combate), então desenho, animação, balões e toque seguem a câmera sem saber dela.

- **Seguir:** por padrão a câmera fica centrada em quem está agindo, e volta a seguir a cada troca de turno.
- **Olhar em volta:** na vez do jogador, arrastar o dedo no tabuleiro move a câmera. Arrasto de menos de 8 px conta como toque (selecionar casa).
- **Zoom:** botões − e + no canto de baixo à direita, ao alcance do dedão; nunca pinça. Os níveis são: tabuleiro inteiro, legível (hexágono de 30 px) e perto (44 px).
- **Centralizar:** o botão ⌖ volta a seguir quem está agindo.
- **Abertura:** se o tabuleiro inteiro cabe legível na tela, abre mostrando tudo; senão, abre no tamanho legível seguindo quem age.
- **Limites:** a câmera não sai do tabuleiro; no eixo em que o tabuleiro cabe na tela, ele fica centralizado.
- Tabuleiro de qualquer tamanho funciona sem mudar a câmera. O editor de tabuleiro (fase 4) ainda não usa a câmera.

### Apresentação

- Animações por id: movimento (padrão, teleporte, estilingue), ataque corpo a corpo (padrão, padrão+, rage dash, soco de energia), distância (tiro reto, rajada, spirit gun), defesa (golpe, bloqueio, escudo mágico) em `engine/animations/`. Partículas, "juice" (tremor, hit stop) em `engine/animations/particles.js`, `engine/animations/juice.js`. "habilidade" e "efeito" da fase de debug não têm animação ligada.
- Efeitos/anúncios: `engine/useEffectMachine.js`, `components/effects/EffectRenderer.js`, `engine/eventBus.js`, `engine/useUIController.js`, `engine/useInputLock.js`, `engine/useCanvasLoop.js`.
- Som: `engine/audioManager.js`.
- Log da batalha em gaveta, com as contas de FA/FD.

## 7. O que é placeholder, morto ou quebrado

- `casasMovimento` da ficha e a tabela por faixa de AGI: não usados no combate.
- Obstáculos 3 e 4: propriedades sem efeito.
- Modo Campanha: só o botão.
- Fase ANIM_DEBUG faz parte do fluxo normal (todo jogador passa por ela) e tem texto fixo em português, fora do i18n.
- Textos fixos fora do i18n também na fase 1 ("CONSTRUÇÃO DE FICHAS", "JOGADOR", "EQUIPAMENTO", "+ NOVO COMBATENTE"…), no log de combate e nas personalidades.
- Ficha carregada só leva a personalização; a IA da ficha volta junto, mas não há como editar atributos de uma ficha salva.
- Muitos `console.log('[DEBUG] ...')` nas personalidades e no `TurnController` (diagnóstico, manter até decisão).

---

# Parte 2 — A base que já existe fora do código

O jogo não começa do zero. O universo já tem regra de luta, golpes de personagem e uma arena com ranking. O que está escrito abaixo é o material que pode virar jogo sem inventar canon novo.

## 8. O manual de batalha do LDI (`docs/importantes/MANUAL_BATALHA_LDI.md`)

É a regra de luta "oficial" do universo, um 3D&T adaptado. O motor atual da Arena já é parente dele (d6, FA contra FD, crítico no 6, 1 ação + 1 movimento), mas com outros atributos.

| | Manual do LDI | Motor atual da Arena |
|---|---|---|
| Atributos | 5: F (potência), H (agilidade), R (resistência), A (proteção), PdF (poder elemental) | 6: FOR, AGI, DEX, PdF, RES, ARM |
| Escala | 0 a 5 (5 = topo absoluto) | orçamento de 3 a 30 pontos |
| Vida e energia | PV = R × 5; PM = PdF × 5 | HP = RES × 10; MP = RES × 10 |
| Ataque | F + H + d6 (perto) ou PdF + H + d6 (longe) | FOR + DEX/4 + d6 |
| Defesa | A + H + d6 | ARM + AGI/4 + d6 |
| Dano | FA − FD, sem dano mínimo | FA − FD, mínimo 1 |
| Crítico | 6 no dado dobra F/PdF (ataque) ou A (defesa) | 6 libera a DEX/AGI inteira |
| Esquiva | teste de H contra H; passou, não toma dano | tabela de chance de acerto pela AGI |
| Iniciativa | H + d6, rolada uma vez | AGI, com Jokenpô no empate |
| Pontos de ficha | Novato 5, Lutador 7, Campeão 10, Lenda 12 | livre |

- **7 elementais:** Fogo (dano), Água (controle e cura), Terra (defesa e atordoar), Ar (iniciativa e mobilidade), Trevas (dreno e enfraquecer), Luz (cura, proteção e cegueira), Neutro (sem fraqueza). O 8º, Primordial, não é registrado no sistema.
- **Poderes:** 6 por elemental, de 1 a 4 PM, com efeitos de verdade — área (Terremoto), empurrar (Ciclone), puxar (Corrente), impedir aproximação (Redemoinho), ignorar proteção (Lâmina d'Água), dano dobrado (Inferno). Equipa até H + 1, no máximo 5.
- **Vantagens** com custo em PM: movimento extra, alcance, cura, teleporte, regeneração, tiro carregável (fica indefeso 1 turno e dá PdF × 2), voo, ataque em área, paralisia, reflexão e dezenas de outras.
- **Arena como vantagem:** o manual já lista tipos de arena — Digital Clássica, Ruínas, Aquática, Gravitacional, Torre Espiral, Vulcânica, Neve — e lutador especialista ganha bônus no terreno dele.
- **Estados:** Perto da Morte (PV ≤ R), Indefeso, Surpreso e teste de morte no d6.
- **Recuperação:** nada entre turnos; tudo volta ao máximo depois da batalha.
- **XP:** vitória justa 10, derrota 1; a cada 100 XP, 1 ponto de personagem.

## 9. Os golpes dos personagens (`docs/LDI/ATAQUES_E_PODERES.md`)

Cada personagem do livro já tem arma, elemental e golpe-assinatura. É um elenco pronto com kit:

| Personagem | Elemental | Arma (normal → modo Xamã) | Golpe-assinatura |
|---|---|---|---|
| Kim | Fogo (manifesta Trevas) | 2 machadinhas com fio de aço que volta à mão → machado de duas lâminas | Golpe do escorpião, bola de fogo; "correntes" e modo pantera |
| Jack | Terra | bengala "Vitória" → nunchaku de 3 partes | Vitória Finals: carrega em 3 etapas, letal, deixa uma grande abertura |
| Nina | Luz | katana "Angel" → chicote segmentado de 2 a 3 m | Angel Luminus Blade: corte em área girando; fintas de Muay Thai |
| Thunderbolt | Luz → eletricidade | bastão elétrico | raio das mãos; some em fumaça e reaparece pelas costas |
| Shuntaro | Água | ioiôs → serra-escudo arremessável | Fatal Slices: 10 ioiôs, 5 m de alcance |
| Outros citados | — | Roxy (socos-ingleses), Pajé (todos os elementais), Powa/Kronos (dreno de vida), Lenna (Vento), Osvaldo (Terra) | sem golpes descritos |

Regras do LDI que o livro já fixou e que viram regra de jogo:

- 3 modos de luta combináveis: **mãos livres** (mais barato), **arma** e **poder**.
- Arma tem modo normal e **modo Xamã**, que gasta mais energia.
- **1 elemental por avatar**, sem troca.
- Poderes de 3 durações: instantâneo, médio e longo. **Carregar deixa exposto; tomar golpe perde a carga.**
- **No máximo 4 poderes ativos.**
- Formatos de luta: 1×1, 2×1, 10×1, 2×2, vitória por tempo, resistência ou objetivo, e Battle Royale.
- Salas de treino com obstáculos, desvantagem elemental e inimigos já enfrentados.

## 10. A arena na história

- O LDI é o jogo de luta virtual de Bravara: a consciência entra no MDI pelo SBI e a dor é real. São 3 bilhões de jogadores.
- **Ranking SDR:** faixas de 1 milhão até o **Top 128**, que disputa o Torneio Mundial na ilha Davoss, de Kronos, a cada 4 anos. Quem morre perde posição.
- Sistemas do LDI que já existem na história: SDA (apostas), SDD (doações com pedido de golpe), SAL (luta privada), STE (treino pago), SDP (patrocínio), moeda **LT** (pacotes de armas, treino e itens), o narrador **NexusPhantasm** e a NeoGuide.

## 11. O LDI Tactics antigo (`src/pages/games/ArenaTatics/`, `/games/ldi-tatics`, só admin)

Um jogo tático anterior, em grade **quadrada**, no estilo Ragnarok: nível até 99, 6 atributos com custo por faixa, 6 classes com árvore de 42 nós, 20 personagens inventados (fora do elenco do livro), 12 elementais (o manual tem 7), cidade de Marélia como mapa-mundo, cartas, eventos e save no Supabase (`arena_tatica_saves`).

- **Serve de referência:** save na conta, recompensa por luta, mapa-mundo com prédios, eventos de rodada, as 16 personalidades de IA documentadas (`docs/Games/LDITatics/IasLDITatics.md`).
- **Não serve de base:** os 12 elementais, o elenco inventado, nível 99 com milhares de HP e custo por faixa de atributo — tudo isso briga com o manual e com o livro.

## 12. O que os outros jogos do portal já provaram

- **Gangues:** personagens com atributos **autorados** (o jogador não distribui ponto); **todo nível sobe +1 atributo**, sempre; poderes liberam em níveis fixos; XP por inimigo, com bônus por lutar contra quem é mais forte; proteção contra frustração (2 derrotas seguidas deixam a próxima mais fácil); territórios com teto de nível e chefe fixo; save só na conta. O custo escalonado por atributo foi tentado duas vezes e **revertido** depois de jogar: "todo nível tem que subir atributo".
- **Lendas:** prova que uma escolha de identidade (a Veia) com poucas habilidades próprias dá vontade de rejogar.
- **Regras do portal que valem pro Arena:** mobile only, uma mão (ação na metade de baixo, sem pinça), nenhum save local de jogo, ID numérico pra todo conteúdo, nome no i18n dos 3 idiomas.

## 13. O que o sistema de hoje já entrega pro jogo final

| Peça | Estado | Vale pro jogo final? |
|---|---|---|
| Tabuleiro hexagonal, caminho, linha de visão | funciona | sim, é a base |
| Câmera (seguir, olhar, zoom) | funciona | sim, pronta pra mapa grande |
| Regra única do golpe (`engine/regras.js`) | funciona | sim, é onde a regra final entra |
| Turno, iniciativa, Jokenpô | funciona | sim |
| IA com personalidade (decide, não calcula) | funciona, simples | sim, precisa crescer |
| Animações, partículas, sons, efeitos | funciona | sim |
| Poderes (16, só +2/+3) | raso | o formato do dado serve; o efeito tem de ser refeito |
| Ficha livre com 6 atributos | funciona | não, se o jogo usar o manual e o elenco |
| Editor de mapa no caminho do jogador | funciona | vira ferramenta de criar mapa, fora do fluxo do jogador |
| Save no `localStorage` | funciona | não; tem de ir pra conta |

---

# Parte 3 — Propostas

## 14. Que jogo é o LDI Arena

**Proposta:** o LDI Arena é a própria arena do livro. O jogador entra no LDI, monta seu time com os lutadores do universo e sobe o **ranking SDR** em lutas táticas no tabuleiro hexagonal, até o Top 128.

Por que esse caminho é seguro:

- Usa regra que já é canon (o manual), golpes que já são canon (os kits) e um objetivo que já é canon (o ranking). Nada precisa ser inventado de lore.
- É o único jogo do portal em que o leitor **joga com o Kim, o Jack e a Nina lutando como lutam no livro**. O Gangues é outra época e o Lendas é história.
- O ranking dá progressão natural: cada faixa do SDR é um "capítulo", com arenas e rivais próprios.

## 15. Personagens: elenco fixo com kit, não ficha livre

| Opção | Como é | Risco |
|---|---|---|
| **A. Elenco canônico com kit fixo** (recomendado) | Kim, Jack, Nina, Thunderbolt, Shuntaro, Roxy… cada um com atributos, elemental, arma e 4 poderes autorados. O jogador escolhe quem leva. | Baixo: dá pra balancear, cada personagem tem identidade, igual ao Gangues. |
| B. Avatar próprio com ficha livre | O jogador cria um lutador e distribui pontos (o sistema de hoje). | Alto: balancear ficha livre é o trabalho mais caro que existe, e o lutador não é ninguém da história. |
| C. Os dois | Elenco canônico na campanha, avatar livre num modo à parte. | Médio: dobra o trabalho; dá pra deixar pra depois. |

## 16. Regra de luta: puxar o motor para o manual

**Proposta:** trocar os 6 atributos de hoje pelos 5 do manual (F, H, R, A, PdF), com as fórmulas do manual, dentro do `engine/regras.js`.

- Tudo passa por um lugar só, então a troca não espalha pelo código.
- A esquiva do manual (H contra H) substitui a tabela de chance de acerto.
- PV = R × 5 e PM = PdF × 5 separam vida de energia (hoje RES manda nas duas coisas e vira o único atributo que importa).
- O carregamento de poder com exposição (livro) já tem campo no dado (`turnosCarregamento`); o Vitória Finals do Jack é o exemplo pronto.
- **Ajuste necessário:** "sem dano mínimo" pode travar lutas entre defensores. Proposta: manter o dano mínimo 1 de hoje, ou testar no simulador antes.

## 17. Poderes e elementos

- **7 elementais do manual**, cada um com o seu papel (Fogo dano, Água controle e cura, Terra defesa, Ar mobilidade, Trevas dreno, Luz cura e cegueira, Neutro equilíbrio).
- **Vantagem elemental simples**, uma regra só (por exemplo: elemento forte contra o alvo, +2 na FA). Nada de tabela de 12 elementos.
- **Máximo de 4 poderes ativos**, regra do livro.
- Poderes com efeito de verdade no tabuleiro: área, empurrar, puxar, cura, impedir aproximação, carregar. É aqui que o hexágono vira jogo: posição passa a importar.
- **Poucos estados**, só os que o manual já tem: Indefeso, Atordoado, Perto da Morte. Cada um com 1 a 2 turnos e ícone sobre o personagem.

## 18. Sistema de níveis

| Opção | Como é | Risco |
|---|---|---|
| **A. Como o Gangues** (recomendado) | Cada personagem tem a curva autorada; todo nível sobe +1 atributo; poderes liberam em níveis fixos. XP por luta, com bônus contra quem é mais forte. | Baixo: já foi testado em jogo de verdade pelo Isaias e aprovado. |
| B. Pontos do manual | 100 XP = 1 ponto de personagem pra gastar. | Médio: a escala 0–5 do manual sobe pouco, a progressão fica curta. |
| C. Ragnarok (Tactics antigo) | Nível 99, custo por faixa. | Alto: foi o que falhou; custo escalonado já foi revertido duas vezes. |

**Escala proposta:** nível 1 a 30 na T1, com o teto de cada faixa do ranking parecido com o teto por território do Gangues. A escala 0–5 do manual vira o "nível do lutador" na história; no jogo, os atributos podem crescer além disso, porque é progressão de jogo.

## 19. Modos de jogo

1. **Escalada do Ranking (campanha)** — o modo principal. Cada faixa do SDR é um mapa de lutas com rivais, uma arena-tema e um chefe da faixa. Recompensa: XP e LT.
2. **Sala de treino** — o modo Treino de hoje, já existe: escolher time, rival e arena. É onde o jogador testa time e poder.
3. **Torneio** — depois de terminar a campanha, chaveamento contra a IA (o Top 128).
4. **Contra outro jogador** — só depois, quando a regra estiver estável. O lobby multiplayer do portal já existe (`/games/multiplayer/lobby`).

## 20. Mapas

- **Mapas prontos**, um por tipo de arena do manual (Digital Clássica, Ruínas, Aquática, Vulcânica, Neve, Gravitacional, Torre Espiral), cada um com uma regra de terreno simples (lava fere, água lenta, gelo escorrega…).
- O editor de hoje vira **ferramenta de criar mapa** (admin), e os mapas viram dado (`data/mapas`), com posição inicial de cada time.
- Os obstáculos 3 e 4 (armadilha e caixa) ganham regra: destrutível, empurrável, explode.
- A câmera já aguenta mapa maior que a tela.

## 21. Ordem de construção segura

Do mais básico pro mais visível, cada passo jogável e testado antes do próximo:

1. **Regra do manual no `regras.js`** + um simulador de lutas (rodar milhares de lutas pra calibrar, como já foi feito com o golpe).
2. **Elenco inicial de 4** (Kim, Jack, Nina, Thunderbolt) com kit e curva de nível.
3. **Poderes de verdade**: os 4 de cada um + o efeito no tabuleiro.
4. **3 mapas prontos** e o editor fora do fluxo do jogador.
5. **Save na conta** (Supabase), XP e nível.
6. **Campanha do ranking**: 1ª faixa completa, com chefe.
7. **Fluxo final do jogador**: entrar → escolher time → mapa → luta → recompensa. Some a tela de debug, tudo traduzido, uma mão.

Com isso fechado, o jogo está pronto pra 15/03/2027 com um ciclo completo. As outras faixas do ranking, o torneio e o multiplayer entram depois, com o sistema já firme.

## 22. O que não fazer

- Não usar os 12 elementais nem o elenco inventado do Tactics antigo.
- Não usar custo escalonado de atributo.
- Não deixar a ficha livre como modo principal.
- Não gravar progresso no `localStorage`.
- Não depender de pinça ou de duas mãos.
- Não começar pelo multiplayer.

---

# Parte 4 — Decisões do Isaias

Antes de começar a construção, estas respostas fecham o rumo:

1. **O jogo é a escalada do ranking SDR** com os personagens do livro? (seção 14)
2. **Elenco canônico com kit fixo**, sem ficha livre no modo principal? (seção 15)
3. **Regra do manual** (5 atributos, PV/PM separados, esquiva por H) substitui a de hoje? E o dano mínimo 1 fica? (seção 16)
4. **Níveis como no Gangues** (todo nível +1 atributo, poderes em níveis fixos)? (seção 18)
5. **Quem entra no elenco inicial?** Proposta: Kim, Jack, Nina e Thunderbolt.
6. **Time de quantos?** O livro tem 1×1, 2×2 e mais; proposta: até 3 por lado na campanha.
7. **A morte no ranking** ("quem morre perde posição") vale no jogo, ou derrota só não sobe?
