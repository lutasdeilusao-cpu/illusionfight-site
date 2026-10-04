# LENDAS DO LDI — GDD (Game Design Document)

> **Base única do jogo "Lendas do LDI"** (rota `/games/ldi`, código em
> `src/pages/games/LDI/`, versão em `LDI_VERSION` de `src/config/version.js`).
> Descreve o jogo como ele é hoje e, na §12, a direção aprovada para a próxima
> versão. O que ainda não existe no código aparece marcado como **planejado**.
> Histórico de mudanças não entra aqui — mora no `git log`.

---

## 1. O que é

RPG de texto, single-player, em português, inglês e espanhol. O jogador cria
um personagem, cai dentro do LDI (o mundo virtual de luta do universo Lutas de
Ilusão) e atravessa a **Temporada 1 — Arco 1: Descobrimento** lendo cenas e
escolhendo o que fazer. Entre as cenas há lutas (hoje por ficha e dado, §6) e
três quebra-cabeças. Tudo roda numa coluna de celular, igual ao resto do
portal.

- **Ritmo:** lento, de leitura. Cada cena digita o texto (efeito de máquina de
  escrever, 30 ms por letra, dá pra pular) e depois mostra as escolhas.
- **Duração:** 58 cenas em 4 atos (pt), 5 finais possíveis.
- **Acesso:** gratuito, mas exige conta para salvar (`FichaGateRoute`
  "gratuito"); sem conta joga em memória e perde ao sair.

---

## 2. Telas e rotas

| Rota | Tela | Arquivo |
|---|---|---|
| `/games/ldi` | Lobby: lista as fichas da conta, continuar, apagar, criar (guiado ou completo); aviso pra quem não tem conta | `Lobby.jsx` |
| `/games/ldi/create` | Criação de personagem — `?mode=guided` (padrão) ou `?mode=full` | `Create.jsx` |
| `/games/ldi/game` | A história: cena, escolhas e a barra de cima (Ficha · Dia · Créditos · Pistas · Manual · PV) | `Game.jsx` + `components/SceneView.jsx` |
| `/games/ldi/combat` | Luta: escolha de poderes e o combate | `Combat.jsx` + `components/CombatView.jsx` |
| `/games/ldi/sheet` | Ficha do personagem | `Sheet.jsx` + `components/CharacterSheetView.jsx` |
| `/games/ldi/clues` | Caderno de pistas | `Clues.jsx` + `components/ClueBook.jsx` |
| `/games/ldi/puzzle` | Quebra-cabeça (`?type=&diff=&return=`) | `PuzzlePage.jsx` + `components/PuzzleRouter.jsx` |
| `/games/ldi/end` | Final: retrospecto, conquistas, decisões, estatísticas e pistas | `End.jsx` |

O **Manual** (`components/ManualDrawer.jsx`, texto em `data/manualData.js`)
abre por cima da história e da luta.

---

## 3. Personagem (ficha)

### 3.1 Atributos

Cinco atributos, de 0 a **4** (teto em toda a criação e na subida de nível):

| Código | Nome na tela | Para que serve hoje |
|---|---|---|
| F | Potência | Ataque nos modos Mãos Livres |
| H | Agilidade | Entra em todo ataque e em toda defesa; iniciativa |
| R | Resistência | PV máximo = **R × 5** (mínimo 1) |
| A | Proteção | Defesa |
| PdF | Poder Elemental | Ataque no modo Poder; PM máximo = **PdF × 4** (mínimo 2) |

R nunca fica abaixo de 1 ao terminar a criação.

### 3.2 Criação guiada (`?mode=guided`)

Quatro perguntas da NeoGuide (a assistente do LDI), cada resposta soma
atributos e marca uma flag de história. Depois, **3 pontos livres** e o nome.

| Pergunta | Respostas (efeito · flag) |
|---|---|
| 1. Estilo | F+2 H+1 · `ESTILO_VELOZ` — H+2 A+1 · `ESTILO_SIGILO` — R+2 F+1 · `ESTILO_TANQUE` |
| 2. Essência | aceita o elemento (fogo) · `ELEMENTO_ACEITO` — recusa (água) · `ELEMENTO_RECUSADO` |
| 3. Kit de combate | Katana F+1 · `ARMA_KATANA` — Lâminas Gêmeas H+1 · `ARMA_LAMINAS` — Lâmina de Corrente A+1 · `ARMA_CORRENTE` |
| 4. Propósito | F+1 H+1 · `PROPOSITO_PODER` — R+1 PdF+1 · `PROPOSITO_CONHECIMENTO` — A+1 H+1 · `PROPOSITO_CONEXAO` |

No modo guiado o elemento só pode ser **fogo ou água**.

### 3.3 Criação completa (`?mode=full`)

**10 pontos** para atributos, escolha livre de elemento (7) e arma (3), e
compra de vantagens, perícias e especialização. Desvantagens devolvem pontos.
Só termina com saldo exatamente 0.

- **Elementos:** fogo, água, terra, ar, trevas, luz, neutro.
- **Armas:** katana, lâminas gêmeas, lâmina de corrente.
- **Vantagens (8, custo 2–3):** Reflexos Rápidos, Corpo Adaptado, Sangue Frio,
  Sintonia Elemental, Mestre de Arma, Leitura de Combate, Regeneração Rápida,
  Foco Mental.
- **Desvantagens (8, devolvem 1–3):** Corpo Frágil, Medo da Arena, Impulsivo,
  Sobrecarga Sensorial, Desconfiado, Dreno Energético, Ataduras Frágeis, Marca
  Visível.
- **Perícias (8, custo 1–2):** Katana, Lâminas Gêmeas, Lâmina de Corrente,
  Esquiva Ágil, Golpe Pesado, Postura Defensiva, Ataque Preciso, Canalização.
- **Especialização (1):** Combate Total, Técnico de Arena, Sombra Digital,
  Suporte Tático, Elemental Puro.

> ⚠️ **Hoje nenhuma vantagem, desvantagem, perícia ou especialização tem efeito
> nas regras.** Elas ficam salvas na ficha e aparecem na tela, mas o combate e
> as escolhas não leem nenhuma delas (§11).

### 3.4 Progressão

- **XP:** 10 por luta vencida; quebra-cabeças dão XP próprio (§7).
- **Subida de nível:** o n-ésimo ponto de atributo custa `10 + 2·(n−1)` de XP
  acumulado (10, 12, 14…). Ao cruzar, a tela de história bloqueia num painel
  que dá **1 ponto** pra pôr num atributo (teto 4).
- **Créditos:** 50–79 por luta vencida; prêmios de quebra-cabeça; uma escolha
  da história custa 100 (§5). Existe uma conta de **despesa semanal de 410**
  com flag `SEM_CREDITOS`, mas nada no jogo avança o dia nem cobra (§11).

---

## 4. Motor da história

- **Cenas** em `data/scenes/<idioma>/act<N>.json`. Cada cena:
  `{ id, title, image?, text[], choices[], destaque? }`.
- **Escolha:** `{ id, label, next_scene, requires?, cost?, flags_required?,
  flags_set?, sheet_effect?, next_after_combat?, isPuzzle?, puzzleType?,
  puzzleDiff? }`.
  - `requires: { H: 3 }` — atributo mínimo; sem ele, a escolha aparece travada
    com o motivo.
  - `cost` — créditos; `flags_required` — só aparece liberada com as flags.
  - `flags_set` — marca flags; `sheet_effect` — soma atributos na ficha.
  - `next_scene: "combat_<inimigo>"` — abre uma luta (§6); `next_after_combat`
    diz pra onde ir depois.
  - `isPuzzle` — abre um quebra-cabeça (§7) e volta pra `next_scene`.
- **Destinos especiais:** `end_act1_vitoria`, `end_act1_derrota`, `end_fork`
  (fim antecipado), `end_act2` (vai pra 3.1), `end_act3` (vai pra 4.1).
- **Volta da luta:** se a cena de antes termina em `-luta`, volta pra `-pos`;
  senão volta pra cena de antes (ou `next_after_combat`).
- **Cena não encontrada:** cai na 1.2.
- **Flags:** 90 diferentes; 5 são exigidas por escolhas (`CONFIOU_KAEDA`,
  `RECRUTADO`, `PISTA_FINANCEIRA`, `PISTA_CARGO`, `PISTA_NPC`).
- **Escolhas com atributo mínimo:** 1.3c (H3), 1.3d (H2), 1.5a (R2), 2.1
  (H2), 3.2_dia8 (H2), 3.3_dia9 (H2), 3.4_dia10 (H3), 4.1 (F3 e H3).

---

## 5. A Temporada 1 — como a história é guiada hoje

**Arco 1: Descobrimento.** O jogador é um "Eco": pedaço reconstruído de uma
consciência que morreu e sobre a qual o LDI foi construído. Alguém dentro da
Yohualticit (a empresa do LDI) — o **Engenheiro de Integridade
(ENG_INTEGRIDADE_47)**, que opera como **NULL_ENTITY** — está manipulando lutas
e dados de jogadores. A guia é **Kaeda**, de uma Organização que investiga o
sistema.

### Ato I — Chegada (21 cenas, 1.1–1.5a)
1. **1.1–1.1d · NeoGuide:** as quatro perguntas de criação (só no modo
   guiado a resposta muda a ficha).
2. **1.2 · Desconexão:** a NeoGuide trava, o chão some, o jogador cai no LDI
   sem registro.
3. **1.3 · Primeiro Dia, Praça Central:** hub com 6 caminhos — terminal
   público, seguir um avatar (robô de rank baixo), procurar saída (H3), testar
   equipamento (H2, leva à **1ª luta: StormByte_91**), pedir ajuda (conhece
   **Kaeda**, atalho pro Ato II), observar padrões. Uma cena extra
   (1.3-mafama) dá a sensação de "já estive aqui".
4. **1.4 · Dia 2, Rotina:** caçar créditos na Arena de Treino (luta de novo
   com StormByte), investigar uma mensagem anônima (atalho pro Ato II) ou o
   mercado negro.
5. **1.5 · Dia 3, O Prazo:** o sistema exige um "Ranked Kill" em 1 dia —
   lutar com **Kaeda**, ir atrás do contato (Ato II) ou a missão oficial (R2,
   100 de créditos, **luta com GhostPulse**).

### Ato II — O Contato (10 cenas, 2.1–2.fim)
1. **2.1 · O Contato:** Kaeda explica o que é um Eco (três jeitos de reagir).
2. **2.1d–2.2 · O Abrigo e o Briefing:** a Organização existe e precisa de
   dados de batalha.
3. **Escolha central:** entrar (2.3 → 2.fim → Ato III) ou recusar (2.4fim →
   **final antecipado `end_fork`**: "SABEMOS O QUE VOCÊ É").

### Ato III — Investigação (18 cenas, dias 8–12)
1. **3.1 · Reconexão:** o SBI (o dispositivo do jogador) recebe a modificação
   da Organização.
2. **Dia 8 · Primeira Coleta:** luta com GhostPulse, investigar terminais,
   trabalho freelancer (+120 de créditos no texto), descanso.
3. **Dia 9 · Segunda Coleta:** luta com **IronVeil**, conversas na Praça,
   exame do SBI.
4. **Dia 10 · Cruzando Dados:** logs da Yohualticit; quebra-cabeça do terminal
   corporativo (sucesso e falha seguem a história).
5. **Dias 11–12 · O Padrão e O Plano:** ENG_INTEGRIDADE_47 age toda noite; o
   plano é lutar no horário dele e capturar a assinatura digital — **luta com
   Sombra Digital**.
6. **Saídas:** assinatura capturada (3.8), alerta sem captura (3.9) ou a
   armadilha de NULL_ENTITY (3.FINAL) — todas levam ao Ato IV.

### Ato IV — A Decisão Final (9 cenas)
1. **4.1 · 72 horas:** quatro rotas.
   - **Confronto direto** (F3 e H3) → **luta final com NULL_ENTITY**.
   - **Exposição pública** → vitória sem luta.
   - **Negociação** com o Engenheiro → aceitar o acordo ou expor.
   - **Confronto despreparado** → luta final sem preparo.
2. **Finais:** 4.2_vitoria, 4.2_vitoria_desperado ou 4.2_derrota (perder a
   luta final no Ato IV leva a 4.2_derrota, não a game over).

### Finais (`End.jsx`)
| Final | Como chega |
|---|---|
| Vitória (`ended_victory`) | Ato IV por exposição, acordo ou luta vencida |
| Derrota (`ended_defeat`) | Perder qualquer luta fora do Ato IV, ou a luta final |
| Fim antecipado (`ended_fork`) | Recusar a Organização no Ato II |

A tela final mostra 9 conquistas locais (Punho Puro, Diplomata, Investigador,
Guerreiro, Teimoso, Recruta, Sobrevivente, Acordo Escuro, Honrado), as decisões,
dia, pistas, XP e créditos. Concluir cada ato registra um evento do portal
(`lendas_act`); criar personagem registra `lendas_personagem`.

### Personagens da história
NeoGuide (assistente) · Kaeda (a guia, da Organização) · StormByte_91 (rival de
rank baixo) · GhostPulse · IronVeil · Sombra Digital · NULL_ENTITY /
Engenheiro de Integridade (o vilão do arco).

---

## 6. Combate atual (por ficha e d6) — **vai ser substituído (§12)**

Herdado do antigo LDI Arena. Um contra um.

1. **Escolha de poderes:** antes de cada luta, até **4 poderes** do elemento
   do personagem (6 por elemento, 42 no total, `data/powersData.js` /
   `games.ldi.powers`).
2. **Iniciativa:** H + d6 de cada lado; maior começa.
3. **Modo de ataque** (troca a qualquer turno):
   - ✊ Mãos Livres: FA = F + H + d6
   - ⚔️ Armado: FA = H + bônus de arma + d6
   - ⚡ Poder: FA = PdF + H + d6, e o poder escolhido gasta PM e soma
     **custo × 2** de dano.
4. **Defesa:** FD = A + H + d6. **Dano = FA − FD** (mínimo 0).
5. O inimigo ataca no modo preferido dele (`preferred_mode`).
6. **Fim:** PV do inimigo a 0 = vitória (XP + créditos, volta pra história);
   PV do jogador a 0 = derrota (§5); **fugir** sempre funciona e volta pra
   história sem custo.
7. **Visual:** vinheta pulsando com PV ≤ R ("quase morto"), onomatopeias,
   registro dos golpes com a conta.

**Inimigos** (`data/enemies/enemies.json`, 10): StormByte_91 (PV 10),
Kaeda (10), GhostPulse (10), IronVeil (20), Sombra Digital (10), NULL_ENTITY
forma final (15, tem fraqueza descrita), e quatro que não aparecem em nenhuma
luta (NULL_ENTITY encontro 1 e 2, Robô de Rank Baixo, StormByte_Elite).

---

## 7. Quebra-cabeças

Três momentos no Ato III abrem um quebra-cabeça (`PuzzleRouter`), com
dificuldade e prêmios (XP, créditos ou pista no caderno):

| Cena | Tipo na cena | Quebra-cabeça |
|---|---|---|
| 3.2_dia8 | `terminal` | Peças deslizantes |
| 3.3_dia9 | `decoder` | Decodificador |
| 3.4_puzzle | `stealth` | Grade de furtividade |

Também existem Simon Says e Corte de Fios, mas nenhuma cena usa.

---

## 8. Pistas

O caderno (`/games/ldi/clues`) guarda `clues_collected`. Hoje só os
quebra-cabeças acrescentam pista; as cenas de investigação marcam flags
(`PISTA_FINANCEIRA`, `PISTA_CARGO`, `PISTA_NPC`…) mas não escrevem no caderno.

---

## 9. Salvamento

Só com conta, no Supabase:

- `character_sheets` — a ficha (atributos, vantagens, desvantagens, perícias,
  especialização, arma, elemento, XP).
- `game_saves` — o progresso (ato, cena atual, dia, créditos, PV, PM, pistas,
  flags, inventário, status). O lobby carrega o save mais recente da ficha.

Salva a cada escolha, depois da luta, na subida de nível e no final.

---

## 10. Idiomas

| Idioma | Atos com texto |
|---|---|
| Português | 1, 2, 3, 4 (58 cenas) |
| Inglês | 1, 2, 3 (faltam 3.9_alerta e 3.FINAL), 4 |
| Espanhol | só o Ato 1 |

Interface em `games.ldi.*` (`src/i18n/games/<idioma>.json`).

---

## 11. Problemas conhecidos (estado de hoje)

1. **Regras sem efeito:** vantagens, desvantagens, perícias e especialização
   não fazem nada; os poderes só somam `custo × 2` de dano — os efeitos
   descritos (cura, escudo, atordoar, perder a vez…) não existem.
2. **Bônus de arma errado:** no modo Armado o jogador usa o bônus de arma **do
   inimigo**, não o da própria arma.
3. **Tempo parado:** o dia e a despesa semanal existem no código mas nada
   avança o dia; o "Dia 8…12" é só texto.
4. **Descanso e trabalho de mentira:** "PV e PM recuperados" (3.2_descanso) e
   "+120 créditos" (3.2_trabalho) são só texto, sem efeito.
5. **Funções soltas:** teste de morte, status e teste de atributo existem no
   motor e nunca são chamados.
6. **Espanhol e inglês incompletos:** espanhol para no Ato 1 (o jogo cai na
   cena 1.2 ao procurar a próxima); inglês sem duas cenas do Ato III.
7. **Textos fixos em português/inglês no código:** motivos de escolha travada,
   nomes de vantagens no `characterData.js`, conquistas e mensagens do final.
8. **Conquistas da tela final** não são salvas e várias não medem o que dizem
   ("Punho Puro", "Honrado").
9. **Inimigos e quebra-cabeças sem uso** (§6, §7).
10. **Elemento no modo guiado** só oferece fogo ou água.

---

## 12. Direção aprovada — próxima versão

### 12.1 O que não muda
O **core continua sendo o RPG de texto**: lento, de leitura e escolha, com a
história da Temporada 1 como espinha.

### 12.2 Batalha nova — habilidade no dedo (**planejado**)
A batalha por ficha e dado (§6) **sai por completo**, incluindo a dependência
da máquina de batalha herdada do LDI Arena. No lugar entra uma **batalha
dinâmica, de reflexo, que não depende de ficha**: o contraste é o ponto — a
história é calma, a luta acelera.

- **Formato base:** batalha rítmica no estilo Guitar Hero. Botões/notas acendem
  no tempo e o jogador toca no momento certo; cada nota é um golpe ou uma
  defesa.
- **Golpes de boxe:** jab, direto, gancho, uppercut, e defesas (bloqueio,
  esquiva).
- **Muay Thai:** chutes (e o que mais couber do repertório).
- **Montar a sequência:** o jogador monta algumas coisas antes ou durante a
  luta (a definir: combinação de golpes, ritmo, estratégia), "no dedo".
- **Pontos a decidir no próximo passo da GDD:** como a luta termina (barra de
  vida, pontuação, rounds), como erro/acerto viram dano, dificuldade por
  inimigo, o que (se algo) da ficha continua valendo, recompensa, falha e
  derrota, acessibilidade (tempo de reação no celular), e se os atributos e o
  sistema de vantagens/poderes saem do jogo ou ganham outro papel.

---

## 13. Arquivos

```
src/pages/games/LDI/
├── Lobby.jsx · Create.jsx · Game.jsx · Combat.jsx · Sheet.jsx · Clues.jsx · PuzzlePage.jsx · End.jsx
├── LDI.css                     # todo o visual do jogo (≈2.800 linhas)
├── components/                 # cena, escolhas, máquina de escrever, combate, ficha, pistas, manual, quebra-cabeças
├── data/
│   ├── scenes/<idioma>/act1–4.json   # a história
│   ├── enemies/enemies.json          # inimigos
│   ├── characterData.js · powersData.js · manualData.js
├── engine/                     # combat, dice, scenes, flags, character
├── hooks/useLDIStorage.js      # salvar e carregar no Supabase
└── store/useGameStore.js · useCombatStore.js
```
