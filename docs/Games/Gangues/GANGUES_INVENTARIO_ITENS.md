# LDI Gangues — Inventário, Itens, Economia + rosters atuais

> **Estado atual, escrito em 2026-09-08.** Consolida tudo que já existe do
> sistema de inventário / itens / equipamento / loja / economia, mais a lista
> completa dos 30 lutadores recrutáveis e dos 36 inimigos com seus atributos.
>
> Lore (quem é quem, história de Marelia) está em `GANGUES_LORE.md`. Progressão /
> skill tree está em `GANGUES_PROGRESSAO_RASCUNHO.md`. Regras gerais de combate
> em `GANGUES_DESIGN.md`. Este doc é **o que a gangue carrega e o que enfrenta**.

---

## 1. Economia — as duas moedas

Só existem no **modo história** (não no modo batalha avulso). Estado no
`store/useGanguesStore.js`, persistido na tabela `gangues_story_progress` (uma
linha por save).

| Moeda | Campo | Ganha em | Gasta em |
|---|---|---|---|
| **Grana** 💵 | `store.grana` | corre, achado, treta, chefe | loja (itens/equip), descanso na birosca |
| **Nome / Rep** | `store.rep` | vitória, escolha ousada em papo | destrancar POI / conversa, alimenta o % de domínio e o texto do final |

- Ações do store: `ganharGrana(n)`, `ganharRep(n)`, `gastarGrana(n)` (retorna
  `false` se não tem grana suficiente — quem chama não aplica o efeito).
- Recompensa por POI vem de `poi.recompensa: { grana, rep, xp, item }` nos dados
  da cena (`data/cenas/pista.js`). Ex.: chefe da Pista dá `{ grana: 20, rep: 5 }`.
- Descanso na birosca: `custoGrana: 10`, cura `40` de fôlego (Pista).

---

## 2. O inventário é da GANGUE, não do personagem

Comprado com a grana de todos, usado por todos. Dois inventários separados:

### 2.1 Consumível — `store.inventario`
Formato `{ [itemId]: quantidade }`. IDs **numéricos**, faixa **1–99**.

- `comprarItem(itemId, custo)` — cobra a grana, só adiciona se o pagamento passar.
- `usarItem(itemId)` — consome 1 unidade; retorna `false` se não tinha nenhuma.

### 2.2 Equipamento — `store.equipamentos`
Lista de **instâncias**: `{ uid, itemId, cards: [...] }`. IDs numéricos, faixa
**101+**. Cada instância tem `uid` próprio e sockets de carta vazios na criação.

- `comprarEquip(itemId, custo)` → cria a instância (sockets vazios), devolve o `uid`.
- `comprarEEquipar(itemId, custo, memberId)` → compra + equipa numa ação só (é o
  fluxo da loja: decidir comprar já é decidir equipar).
- `equiparItem(memberId, uid)` → tira a instância do inventário da gangue e põe em
  `sheet.attributes.equipment[slot]` do personagem. Se o slot já tinha peça, a
  antiga **volta pro inventário da gangue** (com as cartas que tiver).
- `desequiparItem(memberId, slot)` → devolve a peça (com cartas) ao inventário.

> Uma peça equipada **sai** de `store.equipamentos` e vive dentro da ficha do
> personagem. Ao desequipar, volta pra `store.equipamentos`.

### 2.3 Bolsa da Gangue (UI, i18n `bag`)
- **Itens de combate** — "Aparecem no botão 🎒 durante a luta."
- **Equipamento guardado** — "Equipa pelo 👤 → ficha do personagem."
- Vazio: "A bolsa tá vazia. Compra alguma coisa na loja."

Persistência: `inventario` e `equipamentos` entram no `_persistStory()` (debounce
800ms) junto de `gangName`, `storyProgress`, `cenaProgresso`, `grana`, `rep`,
`campaignClears`, `eventCharacterIds`. Guest / quem não abriu save não salva nada.

---

## 3. Catálogo de consumíveis (`data/ganguesItens.js`)

ID numérico. `slug` é só leitura humana. Nome exibido em
`games.gangues.itens.<id>`. `tipo` decide o efeito de combate
(`handleUsarItem` em `GanguesCombat.jsx`).

| id | slug | Nome (pt) | tipo | valor | custo | ícone |
|---|---|---|---|---|---|---|
| 1 | `pocao_hp` | Poção de HP | `cura_pv` | +5 PV | 5 💵 | 🩹 |
| 2 | `pocao_mp` | Poção de MP | `cura_pm` | +5 PM | 5 💵 | 💧 |

> Só isso existe hoje. A faixa 3–99 está livre pra novos consumíveis (buff
> temporário, item de fuga, etc.) — a loja e o combate leem a lista inteira
> dinamicamente, é só adicionar no `CATALOGO`.

### Uso em combate
- Usar item **consome o turno do ator**, igual um ataque (`machine.useItemAction`).
- Sem rolar dado, sem escolher alvo inimigo — aplica a cura na hora no próprio ator.
- A bolinha de ação (🎒, i18n `orb.item`) só mostra item com `quantidade > 0`.

---

## 4. Catálogo de equipamento (`data/ganguesEquip.js`)

### 4.1 Slots — 6 por personagem
Ordem na UI (bonecão de cima pra baixo, arma por último):

| slot | ícone | foco |
|---|---|---|
| `cabeca` 🪖 | — | D |
| `corpo` 🦺 | — | **a escolha PV vs PM** (sem R) |
| `bracos` 🧤 | — | D / A |
| `pes` 🥾 | — | H |
| `amuleto` 📿 | — | misto leve |
| `arma` 🥊 | — | A |

### 4.2 Regras de bônus
- Bônus = atributo plano (**A / H / D**) **ou** recurso plano (**pv / pm** —
  somado em cima do PV/PM máximo, **não passa por R**).
- **Não existe bônus de R em equipamento** — mexia em PV e PM ao mesmo tempo,
  ficou forte demais.
- Slot `corpo` é onde se decide tanker (PV) vs místico/mago (PM).
- `getGanguesEquipBonuses`, `getGanguesAttributesWithEquip`,
  `applyGanguesEquipResources` somam tudo; a loja usa
  `previewGanguesAttributesWithEquip` pra mostrar como a ficha ficaria.

### 4.3 Cartas / sockets (`cardSlots`, 0–2, estilo Ragnarok)
- Cada peça tem 0, 1 ou 2 slots de carta. Teto 2.
- **As cartas em si ainda não existem** — vêm com o "sistema de drop" (não
  implementado). UI mostra quadradinhos vazios / "Slot de carta — em breve".
- **Regra de remoção (decisão do Isaias):** tirar uma carta encaixada
  **DESTRÓI a carta**. Desequipar o item inteiro **não** destrói nada.

### 4.4 Raridades
`comum` · `incomum` · `raro` · `epico` (épico ainda sem item no catálogo).

### 4.5 Os 20 itens

| id | Nome (pt) | slot | raridade | bônus | cartas | custo loja |
|---|---|---|---|---|---|---|
| 101 | Soqueira de Lata | arma | comum | +1 A | 0 | 16 💵 |
| 102 | Faca Serrilhada | arma | incomum | +2 A | 1 | — |
| 103 | Cano de Ferro | arma | raro | +2 A, +1 H | 2 | — |
| 104 | Gorro de Moletom | cabeça | comum | +1 D | 0 | 12 💵 |
| 105 | Capacete de Obra | cabeça | incomum | +2 D | 1 | — |
| 106 | Coroa de Lata | cabeça | raro | +1 A, +1 D | 2 | — |
| 107 | Colete Reforçado | corpo | comum | +6 PV | 0 | 20 💵 |
| 108 | Colete Leve | corpo | comum | +6 PM | 0 | 20 💵 |
| 109 | Colete de Placa | corpo | incomum | +12 PV | 1 | — |
| 110 | Manto com Capuz | corpo | incomum | +12 PM | 1 | — |
| 111 | Armadura de Rua | corpo | raro | +18 PV | 2 | — |
| 112 | Luva de Couro | braços | comum | +1 D | 0 | 12 💵 |
| 113 | Manopla de Porca | braços | incomum | +2 A | 1 | — |
| 114 | Braçadeira de Cravo | braços | raro | +1 A, +1 D | 2 | — |
| 115 | Tênis Furado | pés | comum | +1 H | 0 | 12 💵 |
| 116 | Coturno | pés | incomum | +1 H, +1 D | 1 | — |
| 117 | Bota com Biqueira | pés | raro | +2 H | 2 | — |
| 118 | Corrente de Lata | amuleto | comum | +1 H | 1 | 16 💵 |
| 119 | Dente de Ouro | amuleto | incomum | +1 A | 1 | — |
| 120 | Medalha de Santa | amuleto | raro | +1 D, +1 H | 2 | — |

> Itens sem custo na tabela **não são vendidos hoje** — entram por drop (a
> implementar) ou por lojas de outras regiões.

---

## 5. A Loja (`components/cena/GanguesLoja.jsx`)

- POI de tipo `loja`. O catálogo é do próprio POI: `poi.itens` é uma lista de IDs
  numéricos que **mistura consumível e equipamento** (o resolvedor separa por
  faixa de id).
- **Cada região tem sua própria loja com seu próprio catálogo.** Hoje só a Pista
  tem (`data/cenas/pista.js`).
- **Loja da Pista** (`GANGUES_LOJA_EQUIP_BASICO` + poções):
  `1, 2, 104, 107, 108, 112, 115, 118, 101` →
  Poção HP, Poção MP, Gorro de Moletom, Colete Reforçado, Colete Leve, Luva de
  Couro, Tênis Furado, Corrente de Lata, Soqueira de Lata.
  - No `corpo` são **dois** itens (o par PV/PM).
  - Nota de código: hoje a loja da Pista está `visivel: true` desde o começo
    (teste). Plano final: só abrir depois do portão do chefe, no lugar da "Loja
    abandonada" decorativa perto do boss.
- Fluxo: tocar no item → folha de detalhe com o bônus e a **comparação por
  personagem** (como a ficha de cada membro fica se equipar). Comprar equipamento
  já equipa no personagem escolhido; "Só comprar (guardar)" põe no inventário da
  gangue. Consumível só compra.
- i18n `loja`: "Compra com a grana da gangue — dá pra usar em qualquer luta."

---

## 6. Painel de Equipamento (`components/GanguesEquipPanel.jsx`)

- Acessado pela ficha do personagem (👤). Mostra os 6 slots do bonecão.
- Tocar num slot abre o picker: a peça equipada (com botão "Tirar") + as peças
  do inventário da gangue que servem naquele slot.
- i18n `equip`: "Cada peça tem espaço pra carta — as cartas vêm com o sistema de
  drop." / "Nada no bolso da gangue pra esse espaço."

---

## 7. O que ainda não existe (pontos em aberto)

- **Sistema de drop** — cartas, itens raros/épicos caindo de treta/chefe. Todo o
  `cardSlots` e a raridade `epico` já estão preparados, mas nada dropa hoje.
- **Cartas** — o conteúdo encaixável nos sockets. Só os slots existem.
- **Lojas das outras 6 regiões** — cada uma teria catálogo próprio.
- **Consumíveis além das 2 poções** — faixa 3–99 livre.
- **Venda / desmanche** — não dá pra transformar item de volta em grana.
- **Equipamento no modo batalha avulso** — hoje o inventário só existe no modo
  história.

---

## 8. Roster completo — os 30 lutadores recrutáveis

Catálogo `ldi_gangues_30_personagens_v1.json` (via `data/ganguesCharacters.js`).
Stats **de nível 1** (crescem automático por nível até o 10). Liberação: `w1` =
5 iniciais · `w2` = durante a 1ª campanha · `w3` = 2º clear · `w4` = só evento.
Lore e títulos de nível 10 em `GANGUES_LORE.md` §8.

| id | Nome | Caminho | Subcaminho | A/H/R/D (nv1) | PV/PM | Libera |
|---|---|---|---|---|---|---|
| 1 | Trinca | Atacante | Bruto | 2/0/2/1 | 6/6 | w1 |
| 2 | Marreta | Atacante | Bruto | 3/0/1/1 | 3/3 | w2 |
| 3 | Fenda | Atacante | Duelista | 2/2/1/0 | 3/3 | w1 |
| 4 | Navalha | Atacante | Duelista | 1/3/1/0 | 3/3 | w2 |
| 5 | Touro | Atacante | Fúria | 2/0/3/0 | 9/9 | w3 |
| 6 | Sangue | Atacante | Fúria | 3/1/1/0 | 3/3 | w3 |
| 7 | Mira | Atacante | Especialista | 2/2/1/0 | 3/3 | w4 |
| 8 | Ponto | Atacante | Especialista | 1/3/1/0 | 3/3 | w4 |
| 9 | Cicatriz | Atacante | Vingador | 1/0/3/1 | 9/9 | w4 |
| 10 | Troco | Atacante | Vingador | 1/1/2/1 | 6/6 | w4 |
| 11 | Muro | Defensor | Muralha | 0/0/2/3 | 8/4 | w1 |
| 12 | Concreto | Defensor | Muralha | 0/0/3/2 | 12/6 | w3 |
| 13 | Guarda | Defensor | Guardião | 0/1/2/2 | 8/4 | w2 |
| 14 | Ombro | Defensor | Guardião | 1/0/2/2 | 8/4 | w3 |
| 15 | Boca | Defensor | Provocador | 0/2/1/2 | 4/2 | w3 |
| 16 | Isca | Defensor | Provocador | 1/2/1/1 | 4/2 | w3 |
| 17 | Catraca | Defensor | Reativo | 1/1/1/2 | 4/2 | w1 |
| 18 | Rebote | Defensor | Reativo | 1/2/1/1 | 4/2 | w4 |
| 19 | Ferro | Defensor | Resiliente | 0/0/4/1 | 16/8 | w4 |
| 20 | Osso | Defensor | Resiliente | 1/0/3/1 | 12/6 | w4 |
| 21 | Brasa | Místico | Ígneo | 2/1/1/1 | 2/4 | w2 |
| 22 | Cinza | Místico | Ígneo | 1/1/2/1 | 4/8 | w3 |
| 23 | Maré | Místico | Aquático | 1/1/2/1 | 4/8 | w2 |
| 24 | Chuva | Místico | Aquático | 1/2/1/1 | 2/4 | w4 |
| 25 | Raiz | Místico | Terreno | 0/1/2/2 | 4/8 | w3 |
| 26 | Racha | Místico | Terreno | 1/1/2/1 | 4/8 | w3 |
| 27 | Faísca | Místico | Tempestade | 1/3/1/0 | 2/4 | w1 |
| 28 | Trovão | Místico | Tempestade | 2/2/1/0 | 2/4 | w3 |
| 29 | Névoa | Místico | Ilusório | 0/3/1/1 | 2/4 | w4 |
| 30 | Espelho | Místico | Ilusório | 1/2/1/1 | 2/4 | w4 |

Técnicas iniciais por caminho: Atacante **Golpe Forçado** (2 PM, +1 FA) ·
Defensor **Guarda** (2 PM, +1 FD no próximo golpe recebido) · Místico **Ruptura**
(2 PM, −1 FD do alvo no ataque atual).

---

## 9. Roster completo — os 36 inimigos (`data/gangues-enemies.json`)

Stats fixos (o inimigo comum é escalado na hora contra o time do jogador — ver
`gerarBandoInimigo`; o chefe e sua equipe são fixos). Lore de cada um em
`GANGUES_LORE.md` §6–7. `mode`: fists→atacante, armed→defensor, power→místico.

### Campanha — modo história (tier 0, ordem de subida)

| id | Nome | A/H/R/D | PV/PM | Arma | Elem. | Modo | Região / papel |
|---|---|---|---|---|---|---|---|
| `moleque_a` | Ratazana | 1/0/2/1 | 6/6 | facão | — | fists | Pista · ponto |
| `moleque_b` | Cão Louco | 2/1/3/1 | 9/9 | corrente | — | fists | Pista · ponto |
| `moleque_c` | Brasa | 1/1/2/2 | 8/4 | estilingue | — | armed | Pista · ponto |
| `fumaca` | **Carvão** | 3/1/4/1 | 12/12 | facão | — | fists | **Chefe da Pista** |
| `turco_batedor` | Unha de Fome | 2/1/3/1 | 9/9 | porrete | — | fists | Feira · cobrador de rua |
| `turco_capanga` | Marreta | 2/2/3/1 | 12/6 | porrete | — | armed | Feira · braço de confiança |
| `gato_eletrico` | Choque | 2/3/4/1 | 12/12 | faca | — | fists | Feira · luz de gato |
| `turco` | **O Cobrador** | 3/2/4/2 | 16/8 | porrete | — | armed | **Chefe da Feira** |
| `sombra_rubra` | Sangria | 3/1/4/2 | 12/12 | faca | — | fists | Baixada · caco do Sombra |
| `sombra_fria` | Gelo | 2/2/4/3 | 16/8 | faca | — | armed | Baixada · caco do Sombra |
| `os_restos` | Sobra | 3/2/5/1 | 15/15 | corrente | — | fists | Baixada · caco do Sombra |
| `espeto` | **Fura-Bucho** | 4/2/5/2 | 20/10 | espeto | — | armed | **Chefe da Baixada** |
| `bonde_predio_1` | Cadeado | 2/1/4/3 | 16/8 | chave de cano | — | armed | Vila · térreo |
| `bonde_predio_2` | Trinco | 3/2/6/3 | 18/18 | chave de cano | — | fists | Vila · um andar |
| `andar_de_cima` | Goteira | 2/2/5/3 | 20/10 | taco | — | armed | Vila · andares de cima |
| `sala` | **Ferrugem** | 3/2/5/4 | 20/10 | taco | — | armed | **Chefe da Vila** (último andar) |
| `frente_escada_1` | Cupim | 3/3/6/2 | 18/18 | faca | — | fists | Morro · vigia da escada |
| `frente_escada_2` | Cascalho | 4/3/7/3 | 21/21 | faca | — | fists | Morro · capitão |
| `fogueteiro` | Pavio Curto | 5/2/11/3 | 22/44 | rojão | fogo | power | Morro · fogueteiro |
| `zefa` | **A Fera** | 4/3/12/4 | 24/48 | vara | — | power | **Chefe do Morro** |
| `os_cinco_1` | Verme | 4/3/5/2 | 20/10 | porrete | — | armed | Alto do Morro · Os Cinco |
| `os_cinco_2` | Presa | 5/3/8/3 | 24/24 | porrete | — | fists | Alto do Morro · braço-direito |
| `a_roda` | Engrenagem | 5/3/7/4 | 28/14 | corrente | — | armed | Alto do Morro · A Roda |
| `doutor` | **O Contador** | 5/4/15/5 | 30/60 | bengala | — | power | **Chefe do Alto do Morro** |
| `bonde_costura_1` | Fiapo | 4/4/8/3 | 24/24 | facão | — | fists | Laje · 1ª linha |
| `bonde_costura_2` | Agulha | 5/4/9/4 | 27/27 | facão | — | fists | Laje · 2ª linha |
| `bonde_costura_3` | Tesoura | 6/4/8/4 | 32/16 | facão | — | armed | Laje · general |
| `costura` | **O Retalho** | 6/5/17/5 | 34/68 | facão | — | power | **CHEFE FINAL** (Laje) |

### Ranking clandestino — modo batalha (ordem de desbloqueio)

| id | Nome | A/H/R/D | PV/PM | Arma | Elem. | Modo | Tier |
|---|---|---|---|---|---|---|---|
| `treinamento` | Saco de Pancada | 1/0/2/0 | 6/6 | punhos | — | fists | 1 |
| `kaeda` | Corte Fundo | 3/3/4/2 | 16/8 | katana | fogo | armed | 1 |
| `thunderbolt` | Curto-Circuito | 4/4/10/2 | 20/40 | bastão | ar | power | 2 |
| `stormbyte` | Traça | 3/5/13/3 | 26/52 | lâmina-corrente | trevas | power | 2 |
| `viran` | Cascudo | 5/5/10/5 | 30/30 | mãos | terra | fists | 3 |
| `campeao` | Quebra-Queixo | 6/5/12/4 | 36/36 | punhos | neutro | fists | 3 |
| `kronos` | O Coveiro | 7/7/25/6 | 50/100 | — | trevas | power | 4 |
| `primordial_jack` | Breu | 8/6/30/5 | 60/120 | bengala | fogo | power | 4 |

Cada inimigo carrega um `trash_talk` completo (7 categorias) em português no
próprio JSON — hoje é o único fallback (a chave i18n `trash_talk_npc.<id>` não
bate com nenhum id real).

---

## 10. Índice de fontes

| Assunto | Arquivo |
|---|---|
| Consumíveis | `src/pages/games/Gangues/data/ganguesItens.js` |
| Equipamento (slots, itens, bônus, cartas) | `src/pages/games/Gangues/data/ganguesEquip.js` |
| Loja (UI + fluxo comprar/equipar) | `src/pages/games/Gangues/components/cena/GanguesLoja.jsx` |
| Painel de equipamento na ficha | `src/pages/games/Gangues/components/GanguesEquipPanel.jsx` |
| Inventário + ações (grana, comprar, equipar) | `src/pages/games/Gangues/store/useGanguesStore.js` |
| Uso de item em combate | `src/pages/games/Gangues/GanguesCombat.jsx` (`handleUsarItem`) |
| Catálogo da loja da Pista | `src/pages/games/Gangues/data/cenas/pista.js` |
| 30 lutadores | `ldi_gangues_30_personagens_v1.json` |
| 36 inimigos | `src/pages/games/Gangues/data/gangues-enemies.json` |
| Textos (itens/equip/loja/bag) | `src/i18n/gangues-{pt,en,es}.json` → `games.gangues.{itens,equip,loja,bag,orb}` |
