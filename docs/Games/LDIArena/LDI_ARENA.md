# LDI Arena

Jogo tático por turnos em tabuleiro hexagonal. Times de até 4 combatentes (jogador × IA) se enfrentam até um lado ficar sem ninguém vivo. Hoje é um protótipo jogável de ponta a ponta no modo Treino.

Código: `src/pages/lab/Prototype/ArenaTestbed/`. Textos: `src/i18n/prototype/pt.json` (bloco `prototype.arena_testbed`, ~236 chaves). Versão: `ARENATESTBED_VERSION` em `src/config/version.js`.

Caminhos abaixo são relativos a `src/pages/lab/Prototype/ArenaTestbed/`.

---

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

O controle do turno é o módulo `engine/TurnController.js` (estado em variável de módulo, não React): ordem, quem está na vez, ações já feitas no turno, mortos (pulados ao avançar). Também tem **agendamento** (`agendarAcao`, contagem de turnos) e **restrição** (`definirRestricao`, bloqueia tipos de ação) — prontos, mas **ninguém os chama**. `TipoAcao` inclui `USAR_PODER` e `CARREGAR_PODER`, também sem uso.

## 6. O combate

Tela: `phases/Phase6CombatV2.jsx` (layout) + motor `engine/useCombatEngine.js` (toda a regra, ~845 linhas). Topo: de quem é a vez e botão ≡ do log; meio: canvas; abaixo: chips de HP/MP de cada vivo (toque abre `components/modals/CharModal.jsx` com os atributos); rodapé: botões de ação.

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
- **Ataque extra**: se AGI do atacante > 2 × AGI do defensor, golpe extra com FA/2 contra nova FD (`engine/combat.js:104-109`; aplicado em `engine/useCombatEngine.js:296-314`).
- **Chance de acerto** (`engine/combat.js:189-198`): 100% se DEX atacante > AGI defensor; senão 90% (AGI ≤2), 80%, 70%, 60%, 50%, 40%, 30% (AGI ≥8).

### Assimetrias reais entre jogador e IA

| Regra | Ataque do jogador | Ataque da IA |
|---|---|---|
| Chance de acerto (`getChanceAcerto`) | **não é rolada** — jogador sempre acerta | rolada (`engine/ai.js:48-50`, personalidades) |
| Contra-ataque no crítico defensivo | aplicado | **não aplicado** (só mostra o balão) |
| Ataque extra por AGI | aplicado | **ignorado** |
| Prompt de poder defensivo | — | jogador alvo escolhe defender com poder |
| Poder de ataque | aplicado | só aparece no log, nunca gasta MP nem soma bônus (`engine/ai/personalidades/sanguinaria.js`) |

### Poderes (`data/poderes.js`, `engine/mecanicasPoder.js`)

- 16 poderes: 3 base sem elemento (FOR+, PdF+, Defesa+) e 13 de amostra em 6 elementos (fogo, água, terra, ar, trevas, luz). Elementos são só filtro/etiqueta, sem efeito.
- Campos: `gatilho` (`ataque`/`defesa`), `tipoPersonagem` (`forca`/`pdf`/`universal`), `custoMP` (3–5), `mecanicaId`, `params`, `valorComparativo` (pra ordenar), `visualId` (sempre null), `tipoExecucao` (sempre `instantaneo`), `turnosCarregamento` (sempre 0).
- Mecânica 1 `bonusAtributo`: soma `bonus` (+2 ou +3) em FOR ou PdF só naquele ataque (`engine/mecanicasPoder.js:12-22`).
- Mecânica 2 `defesaPrompt`: sem função; o efeito está chumbado na tela.
- **Bugs de uso:** o ataque com poder usa o **primeiro** poder de ataque da lista, não o escolhido no modal (`engine/useCombatEngine.js:494-495`). A defesa com poder custa sempre 3 MP e reduz sempre 2 do dano, qualquer que seja o poder (Muralha diz FD 3, Labareda custa 5…) (`phases/Phase6CombatV2.jsx:563`, `:580`; `engine/useCombatEngine.js:743`, `:789`). O prompt só aparece se o alvo tem ≥ 3 MP.

### Efeitos de estado

Não existem. Não há veneno, atordoamento, congelamento, queimadura, buff com duração nem nada que dure além de um golpe. A infraestrutura (`definirRestricao`, `agendarAcao`) existe sem uso.

### IA (`engine/ai.js`, `engine/ai/personalidades/`)

Cada IA tem uma personalidade escolhida na ficha (`engine/ai/personalidades/index.js`). O turno da IA tem estágios com pausas encenadas (`engine/useCombatEngine.js:650-810`): pensa (1,5 s) → mostra alcance → decide movimento → anda → decide ação → ataca → encerra. A decisão é chamada duas vezes (fase "movimento" e fase "acao").

- **Sanguinária:** mira o inimigo de menor HP (no mapa todo); ataca se ele está ao alcance, senão avança pelo caminho mais curto até AGI casas.
- **Fujona:** no movimento foge **uma casa** para o vizinho mais longe dos inimigos (encurralada, avança uma casa); na ação ataca o inimigo mais fraco ao alcance.
- **Persistente:** fixa um alvo (menor HP) e só troca se outro ficar mais fraco; grava `alvoFixadoId` mutando o objeto do personagem.
- **Padrão** (`engine/ai.js`, sem personalidade): inimigo mais próximo; ataca ou anda; se nada, pega item no chão.
- Sanguinária e Persistente ignoram a fase: no estágio de movimento podem "decidir atacar" (resultado descartado), aí não andam e atacam no estágio seguinte. Nenhuma IA usa poção do inventário, poder ou obstáculo como cobertura.

### Vitória e derrota

`verificarVitoria` (`engine/useCombatEngine.js:177-192`): sem jogador vivo → IA vence; sem IA viva → jogador vence. HP 0 = morto, marcado no `TurnController` e pulado. Sem limite de turnos, sem empate, sem recompensa nem progresso.

### Apresentação

- Animações por id: movimento (padrão, teleporte, estilingue), ataque corpo a corpo (padrão, padrão+, rage dash, soco de energia), distância (tiro reto, rajada, spirit gun), defesa (golpe, bloqueio, escudo mágico) em `engine/animations/`. Partículas, "juice" (tremor, hit stop) em `engine/animations/particles.js`, `engine/animations/juice.js`. "habilidade" e "efeito" da fase de debug não têm animação ligada.
- Efeitos/anúncios: `engine/useEffectMachine.js`, `components/effects/EffectRenderer.js`, `engine/eventBus.js`, `engine/useUIController.js`, `engine/useInputLock.js`, `engine/useCanvasLoop.js`.
- Som: `engine/audioManager.js`.
- Log da batalha em gaveta, com as contas de FA/FD.

## 7. O que é placeholder, morto ou quebrado

- `archive/`: pasta vazia.
- `ARENATESTBED_MAPA.md`: desatualizado (cita `Phase6Combat.jsx`, `JokenpoModal`, `engine/ai/estagios.js`, `efeitosVisuaisIA.js`, `REFATORACAO_PHASE3_ESTUDO.md` — nenhum existe mais).
- `engine/ai/index.js`: não é importado por ninguém (`ATIVA` fixo em "sanguinaria").
- `components/effects/effectsMap.js`: não importado.
- `TurnController`: agendamento, restrição, `USAR_PODER`, `CARREGAR_PODER` sem uso.
- `casasMovimento` da ficha e a tabela por faixa de AGI: não usados no combate.
- Obstáculos 3 e 4: propriedades sem efeito.
- Modo Campanha: só o botão.
- `executarAtaque` rola um `d6Val` que nunca usa (`engine/useCombatEngine.js:504`).
- Fase ANIM_DEBUG faz parte do fluxo normal (todo jogador passa por ela) e tem texto fixo em português, fora do i18n.
- Textos fixos fora do i18n também na fase 1 ("CONSTRUÇÃO DE FICHAS", "JOGADOR", "EQUIPAMENTO", "+ NOVO COMBATENTE"…), no log de combate e nas personalidades.
- `fichaStorage.salvarFicha` faz `{ id: gerarId(), ...ficha }`: com `fichaId` nulo, o `id: null` da ficha sobrescreve o id gerado — fichas novas são salvas com id nulo e o "apagar" por id fica ambíguo.
- Ficha carregada só leva a personalização; a IA da ficha volta junto, mas não há como editar atributos de uma ficha salva.
- Fase 5 chama `useMemo` dentro de um `map` (viola as regras de hooks se o número de personagens mudar).
- `maxSz: 50000000000000000` no editor de tabuleiro (valor sem sentido).
- Rota duplicada `/games/ldi-arena` (seção 1).
- Muitos `console.log('[DEBUG] ...')` nas personalidades e no `TurnController` (diagnóstico, manter até decisão).

## 8. Documentos relacionados em `docs/`

- `docs/importantes/MANUAL_BATALHA_LDI.md` — manual de batalha "3D&T adaptado" do universo LDI, com os 7 elementais (fogo, água, terra, ar, trevas, luz… + Primordial). É a base de lore de elementos que os poderes de amostra imitam, mas o jogo não implementa nada de elemento.
- `docs/LDI/ATAQUES_E_PODERES.md` — catálogo de ataques e poderes do universo.
- `docs/Games/LDITatics/RefactoryBattleLDITatics.md`, `IasLDITatics.md`, `RELATORIO_CLASSES_COMPLETO.md` — sistema do **LDI Tactics** (outro jogo, `src/pages/games/ArenaTatics/`, estilo RO: nível 99, atributos com custo por faixa, classes). Não é o sistema da LDI Arena; serve só de referência.
- Não existe GDD da LDI Arena. As fórmulas acima citam um "GDD v0.1" (`engine/combat.js:1-4`) que não está no repositório.

## 9. Lacunas de design para a batalha final

1. **Igualdade de regras:** jogador e IA têm de passar pelo mesmo resolvedor de ataque (acerto, contra-ataque, ataque extra, poder, defesa). Hoje são dois caminhos diferentes.
2. **Poderes de verdade:** escolher o poder certo, custo e efeito vindos do dado, área, alcance próprio, carregamento (`turnosCarregamento`), cura, empurrão, mobilidade. Hoje só há "+2/+3 no ataque" e "−2 no dano".
3. **Elementos:** existem só como etiqueta. Falta decidir vantagem/fraqueza, resistência e o que o elemental muda na ficha.
4. **Efeitos de estado:** nenhum. Decidir quais, duração e como aparecem (a infraestrutura de restrição/agendamento já existe).
5. **Economia de MP:** MP = HP = RES × 10 e não regenera; só poção de +5. RES vira o atributo dominante (HP, MP e nº de poderes).
6. **Balanceamento de atributos:** DEX vale 25% fora do crítico; ARM soma inteiro na FD; dano mínimo 1 sempre. Sem curva de pontos por nível, sem progressão.
7. **Movimento:** AGI 1:1 sem teto pode cruzar o mapa; sem zona de controle, sem custo de terreno, sem ataque de oportunidade; mover e atacar em qualquer ordem.
8. **Terreno:** obstáculos destrutíveis/móveis/armadilhas desenhados mas sem regra; não há cobertura nem altura.
9. **Mapa:** é desenhado pelo jogador em cada partida. Falta mapa pronto, posições iniciais por mapa e a coerência de coordenadas (`gerarGrid` vs resto).
10. **IA:** só escolhe alvo e anda; não usa poder, poção, cobertura nem coordena o time. Fujona foge só 1 casa.
11. **Personagens:** não há elenco oficial (Kim/Jack/Nina são só nomes e cores); ficha é livre por orçamento. Decidir se a final usa personagens canônicos com kit fixo ou ficha montada.
12. **Fim de partida:** sem limite de turno, sem recompensa, sem campanha, sem salvamento na conta (só `localStorage`, contra a regra de "sem save local de jogo").
13. **Uma mão:** a seleção é por toque no canvas e painéis espalhados; conferir o mandamento de uso com o dedão (ações na metade de baixo).
14. **Fluxo:** a tela de animações de debug está no caminho do jogador e a edição de mapa vem antes dos poderes; o fluxo final precisa ser redesenhado.
