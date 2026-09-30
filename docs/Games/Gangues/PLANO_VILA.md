# PLANO — Território 4: A Vila (cena navegável, vertical)

> **Status: IMPLEMENTADO na v3.84.0 (30/09/2026)** — ver GDD §4 Território 4 pro
> que entrou e o que ficou pra depois (corre do respeito, pilha, chefe falso).
> Decisões do topo aprovadas pelo Isaias com a recomendação: vertical, as 3
> mecânicas, ponte pela Dona Lurdes, orçamento 148, drop 141, AP ×1,5.
>
> Proposta original: Fonte da lore: GDD §4
> (Território 4), §6 (facções 108/109), catálogos 1110–1112 / 1210–1212 /
> 1310–1312 / 1407–1408 / 1457–1458, chefe 1503, timeline "Ano 6 — A Vila
> resiste", §9.4/§9.7 (itens e escada de nível).

## ⚠️ Decisões a confirmar (Isaias)

1. **Vertical:** térreo/pátio do conjunto = cena de rua (hub); os 10 andares =
   interiores empilhados, ligados por escada (cada "bloco" de andares é um
   interior com 1 cômodo por andar). Ferrugem no 10º andar/cobertura.
2. **Três mecânicas novas, genéricas** (viram campo de cena, igual `trem`/`respeito`):
   (a) **escada sem luz** — `apagao` por cômodo; (b) **elevador quebrado** —
   atalho com chance de travar e cair em emboscada; (c) **portaria / Barra de
   Alerta** — ser visto deixa os andares de cima mais fortes.
3. **Ponte:** a Vila só abre depois do informante da Baixada (`precisaInformante`),
   e o **"corre do respeito"** pendente da Baixada vira a missão-ponte.
4. **Ladder 47→59 fixo**, Ferrugem no teto (59); nenhum corpo acima dele.
5. **Orçamento do chefe** muda de `345` (valor antigo, fora de escala) pra **148**.
6. **Drop do chefe:** o GDD lista o *Taco da Ferrugem* como id **137**, mas o
   catálogo atual usa 138–140 pra outros chefes e 137 está livre/indefinido —
   proponho **141** (épico) pra seguir a sequência 138→139→140. Confirmar id.
7. **Aposta:** nada novo — aposta só na birosca/Clube, regra atual.
8. **Grind:** AP da Vila ×1,5 (igual Feira) ou ×1? (§5)

---

## 0. Resumo

- **30 eventos** (a Baixada tem ~18): 1 missão-ponte, 12 obrigatórios de subida
  (andares 1–9), 2 generais, o chefe na cobertura, 1 elevador, e ~13 opcionais
  no térreo e nos andares.
- **Tema:** *resistência militarizada, controle vertical*. O Bonde dos Prédio
  (108) segura o térreo e a escada como quartel; Os Andar de Cima (109) se acham
  a aristocracia e moram da cobertura pra baixo. A Vila é a guerra mais dura da
  década (Ano 6) — o jogo tem que **cansar**: "a exaustão é a arma dele antes
  da porrada" (fala do GDD sobre o Ferrugem).
- **O "muro" da Vila é a escada:** o térreo é livre; subir é o jogo. Cada bloco
  de andares só destranca batendo quem segura o patamar.
- **Nível:** 47 no 1º andar, sobe ~1 por evento até **Ferrugem 59** (em pontos
  de ficha, igual Baixada 34–46). Escolta: Bloco Inteiro (1457) e Chave Mestra
  Maior (1458), **44–45** cada.
- **Time de 4 fichas** (vaga nova ao vencer o Fura-Bucho) — Multidão vira
  padrão nos corredores.
- **Alan:** não aparece. Se citado (ex. fala de morador velho), sempre no
  futuro — "um dia vai ter um que sobe esses dez andar sem cansar".

---

## 1. O que a Vila herda e o que muda

| Sistema | Na Baixada | Na Vila |
|---|---|---|
| Travessia bloqueada | trem (`cena.trem`) | **escada por blocos** (`portao` por andar) + elevador |
| Barra no HUD | Respeito (enche batendo) | **Alerta** (enche quando te veem — ruim) |
| Escuro | — | escada sem luz (`apagao` por interior) |
| Chefe escondido | velho + café (`someQuando`) | Ferrugem na cobertura, só com os 9 andares |
| Pino que foge | folgado (`fuga`) | **o Portaria (1110)** corre pra cima avisando o bonde (`fuga`) — 3 aparições |
| Falas sorteadas | velho | **Vizinho Barulhento** (1112) no pátio, papo repetível |
| Rinha | Rinha do Trilho | **Rinha da Laje do Térreo** (`rinhaInfinita`) |
| Loja | Depósito do Seu Nono (raro 301–318) | **Brechó da Síndica** (pesado 401–418) |
| Ferreiro | — (Baixada não tem) | **Oficina do Zelador** `tetoAprim: 6` |
| Agiota | Resto de Faca (500) | **Aluguel Vencido (1408)** — empréstimo **800** |
| Descanso | 2 biroscas | **Birosca do Térreo** + **Apartamento da Dona Neide (5º andar)** |
| Clube | rondas 36/70/110 | rondas **49/96/150** |

---

## 2. Mapa e fluxo

### 2.1 Térreo (cena de rua, `data/cenas/vila/mundo.js`)

Reaproveitar o esqueleto da Baixada (760 × 2840, sem muro, sem trem). O conjunto
são **3 prédios** (Bloco A, B, C) no topo do mapa; o pátio com as lojas embaixo.

```
 y 200  ┌─── Bloco A ───┐ ┌─── Bloco B ───┐ ┌─ Bloco C ─┐
        │ portaria A    │ │ (lacrado)     │ │ elevador  │
 y 700  └──────┬────────┘ └───────────────┘ └────┬──────┘
               │ escada A (entrada dos andares)  │ elevador (atalho)
 y 900  pátio de cima: Rinha da Laje · Oficina do Zelador
 y1400  quadra: Vizinho Barulhento · varal · Brechó da Síndica
 y2000  Birosca do Térreo (descanso + Aluguel Vencido)
 y2400  guarita do conjunto (portaria da rua)
 y2700  ← spawn (portão do conjunto)
```

Posições propostas (mundo, `posicoes.js`; conferir com BFS de alcance antes de subir):

| POI | x | y |
|---|---|---|
| spawn | 380 | 2720 |
| `guarita` | 380 | 2440 |
| `portaria_fuga_1` | 600 | 2200 |
| `vizinho` | 150 | 1450 |
| `varal_patio` | 600 | 1420 |
| `rinha_laje` | 620 | 930 |
| `escada_a` (porta do interior) | 190 | 720 |
| `elevador` (porta do interior) | 600 | 720 |
| `cadeado` (portão do bloco A) | 190 | 800 |

Birosca, brechó, oficina: interiores com `porta: { predio }` (sem entrada em `pos`).

### 2.2 Os andares (interiores, `interiores.js`)

Cada andar = 1 cômodo `sala()` estreito e comprido (corredor, **w 300 × h 640**),
escada embaixo (entrada) e em cima (saída pro próximo). Três interiores:

| Interior | Andares | Escuro? | Quem manda |
|---|---|---|---|
| `bloco_baixo` | 1–3 | sim (escada sem luz) | Bonde dos Prédio |
| `bloco_meio` | 4–6 | 4 e 6 escuros; 5 iluminado (Dona Neide) | Bonde + Trinco |
| `bloco_alto` | 7–9 | não (os de cima pagam a luz) | Os Andar de Cima |
| `cobertura` | 10 | não | Ferrugem |

**Encaixe no motor:** o motor já troca `local` entre cômodos de um interior e
tem portas por cômodo. A escada = porta no topo do cômodo N que leva pro cômodo
N+1 (**campo novo `saidaCima: { comodo, trava }`**, simétrico à `saida` de baixo).
A `trava` é o id do POI que precisa estar resolvido pra passar — mesmo formato de
`portao.precisa`, só que por cômodo. Nada de mundo novo nem motor de "andar".

---

## 3. Os eventos

Pontos = ficha por corpo. Nível real = pontos − 6. "rev" = revezamento (2º
corpo 2–3 abaixo).

### 3.0 Missão-ponte (na Baixada) — o "corre do respeito"

| id | Onde | Tipo | O que é |
|---|---|---|---|
| `corre_respeito` (Baixada) | Pensão do Trilho | corre | O Fura-Bucho (depois de batido) manda levar "o recado" pro portão da Vila. Stealth 6×6 com 3 vigias, sem cronômetro. Recompensa: rep 5 + grava `__flags.vila` (é o informante) |
| `informante_vila` (Baixada) | Birosca da Dona Lurdes | papo repetível | Lurdes conta da Vila (boatos) — só aparece depois do chefe da Baixada. É o `precisaInformante` alternativo se o corre falhar 3× (fail-open, ninguém trava) |

### 3.1 Térreo — obrigatórios (3)

| # | id | Tipo | Pontos | Detalhe | Revela |
|---|---|---|---|---|---|
| 1 | `guarita` | treta | **47** · rev, dupla 20% | Portaria (1110) + Cadeado. 1ª luta, porta de entrada | `portaria_fuga_1`, `vizinho` |
| 2 | `portaria_fuga_1` | treta `fuga` | **48** · rev, dupla 30% | O Portaria corre pro Bloco A gritando no rádio. **+1 Alerta se você perder ou fugir** | `cadeado` |
| 3 | `cadeado` | treta | **49** · fixo | Cadeado (1310), "toma conta do térreo". Abre a escada A | `escada_a`, `elevador` |

### 3.2 A subida — obrigatórios (9 andares, `saidaCima.trava`)

| Andar | id | Tipo | Pontos | Inimigos (pool) | Escuro |
|---|---|---|---|---|---|
| 1 | `andar_1` | treta | **50** · rev 30% | Escada Cega 1111, Vizinho 1112 | sim |
| 2 | `andar_2` | treta | **51** · rev 35% | Escada Cega 1111, Varal 1210 | sim |
| 3 | `trinco` | treta | **52** · fixo | **Trinco (1311)** — "comanda um andar inteiro" | sim |
| 4 | `andar_4` | treta `fuga` | **53** · rev 40% | Portaria (2ª aparição) + Elevador 1312 | sim |
| 5 | `dona_neide` | papo | — | Descanso + a chave do elevador (item 18) — andar "neutro" | não |
| 5 | `condominio` | treta | **54** · rev 40% | Condomínio 1211 + Zelador 1212 (infiltrado) | não |
| 6 | `andar_6` | treta `fuga` | **55** · rev 45% | Portaria (3ª e última) — batido, o Alerta **zera** | sim |
| 7 | `bloco_inteiro` | treta | **56** · fixo | **General Bloco Inteiro (1457)**, sozinho. `equipPrimeiraVez` peça 405 | não |
| 8 | `goteira` | treta | **57** · rev 50% | Goteira 1407 + Aluguel Vencido 1408 ("Os Andar de Cima") | não |
| 9 | `chave_mestra` | treta | **58** · fixo | **General Chave Mestra Maior (1458)**. `equipPrimeiraVez` peça 412 | não |
| 10 | **Ferrugem** | chefe | **59** + 2 × ~44 | cobertura | não |

`portao.precisa` = `guarita, portaria_fuga_1, cadeado, andar_1, andar_2, trinco,
andar_4, condominio, andar_6, bloco_inteiro, goteira, chave_mestra`.

### 3.3 Opcionais (13)

| id | Tipo | Onde | Nível/Recompensa | Repetível |
|---|---|---|---|---|
| `vizinho` | papo `falasSorteadas` | pátio | boatos do conjunto | sim |
| `varal_patio` | achado | pátio | 80 grana + item 34 | não |
| `rinha_laje` | treta `rinhaInfinita`, `semGrana`, `nivelDaTropa` | pátio | farm | sim |
| `birosca_vila` | descanso `custoGrana: 30` | térreo | cura | sim |
| `aluguel_vencido` | agiota `emprestimo: 800`, `retratoEnemyId: 1408` | birosca | caderneta global | sim |
| `brecho` | loja | térreo | 401–418 + consumíveis (§6) | sim |
| `oficina_zelador` | ferreiro `tetoAprim: 6` | térreo | aprimoramento | sim |
| `dona_neide_descanso` | descanso `custoGrana: 30` | 5º andar | cura no meio da subida (destino do socorro de derrota nos andares 4+) | sim |
| `apto_302` | achado | andar 3 (escuro) | 1 pilha (item 17) + 60 grana | não |
| `apto_604` | achado | andar 6 | poção +20 (id novo, §6) | não |
| `apto_801` | treta opcional | andar 8 | **57** fixo, Zelador 1212 disfarçado; 150 grana | não |
| `caixa_dagua` | parada `PuzzleLabirinto` | cobertura (antes do chefe) | revela ponto fraco: Ferrugem −2 Couro (`fraquezaChefe`) | não |
| `elevador` | atalho (§4.2) | Bloco C | — | sim |

Total: 2 ponte + 3 térreo + 11 subida + chefe + 13 opcionais = **30**.

---

## 4. Mecânicas novas (genéricas)

### 4.1 Escada sem luz — `apagao` por interior

- **Dado:** hoje `cena.apagao: true` vale pra metade da cena (Feira). Novo:
  `comodo.apagao: true` em `interiores.js`. Motor: `GanguesCena.jsx` aplica
  `is-apagao` se `cena.apagao && ladoApagado` **ou** `comodoAtual.apagao`.
- **Regra:** raio de visão **90px** (Feira usa o círculo padrão; aqui menor).
  Pinos só aparecem dentro do raio. Encontro aleatório `apagao` (já existe)
  roda nos andares escuros com pool `[1111, 1112, 1210]`, teto do território.
- **Pilha (item 17, material):** usar 1 fora de luta = raio 180px até sair do
  andar. Vendida no brechó por 25. Opcional — dá pra subir no escuro.
- **Religa:** vencer o Ferrugem acende a escada inteira (`apagao` ignorado
  com `bossAberto`), igual a Feira.

### 4.2 Elevador quebrado — `cena.elevador`

```js
elevador: {
  paradas: [1, 5, 9],          // andares onde abre
  precisaItem: 18,             // chave do elevador (Dona Neide, 5º)
  chanceTravar: 0.35,          // por viagem
  emboscada: { pool: [1312, 1211, 1212], corpos: [2, 3], pontos: 'andarDestino' },
}
```

- Antes da chave: só leva do térreo ao **1º andar** (tutorial, não pula nada).
- Com a chave: térreo ↔ 5 ↔ 9, **só pra andares já liberados** (não pula
  `saidaCima.trava` — é atalho de volta/farm, não de progresso). Resolve o
  "subir 10 andar toda vez" depois de uma derrota.
- **Travar (35%):** a cabine para, tela escurece, luta contra 2–3 corpos do
  pool com pontos = ficha do evento obrigatório daquele andar (limitado pelo
  teto do território). Vence → chega no destino. Perde → socorro de derrota
  normal (Dona Neide ou birosca, `destinoSocorroDerrota`).
- **Dado genérico:** qualquer bairro futuro com atalho arriscado usa o mesmo
  campo (o Morro tem "escadaria que muda de forma").
- **Hook novo:** `hooks/useGanguesElevador.js` (espelho de `useGanguesTrem.js`).

### 4.3 Portaria avisa o bonde — Barra de Alerta (`cena.alerta`)

```js
alerta: {
  max: 3,
  sobeEm: ['derrota', 'fuga', 'visto'],   // eventos que somam +1
  bonusPorPonto: 1,                       // +1 ponto de ficha por corpo, por nível de alerta
  zeraCom: 'andar_6',                     // bater a última aparição do Portaria zera
  pois: ['portaria_fuga_1', 'andar_4', 'andar_6'],
}
```

- **Sobe +1:** perder uma luta na Vila; fugir de uma luta (se houver fuga);
  ser pego no corre/stealth da ponte; o elevador travar.
- **Efeito:** cada ponto de Alerta soma **+1 ponto de ficha** em todo corpo
  gerado **acima do andar atual**, até **+3**. **Nunca passa do teto** (Ferrugem
  59, `revezamentoNoTerritorio` já corta) — no andar 9 (58) o +3 vira +1.
- **Desce:** vencer cada aparição do Portaria (`fuga`) tira 1; vencer `andar_6`
  zera e trava a barra em 0 (o rádio do Portaria quebra).
- **HUD:** `GanguesBaixadaHud.jsx` generalizado pra `GanguesBarraHud` (lê
  `cena.respeito` ou `cena.alerta`); cor `--if-danger` no alerta.
- **Persistência:** `storyProgress.__alerta.vila` (no save, nunca localStorage).

---

## 5. Nível, chefe e grind

```
Baixada: 34 · 36 · 38 · 41(G) · 43(G) · 34(folgado) · FURA-BUCHO 46
Vila:    47 · 48 · 49 · 50 · 51 · 52(Trinco) · 53 · 54 · 55 · 56(G) · 57 · 58(G) · FERRUGEM 59
```

- **Chefe:** `GANGUES_CHEFE_BUDGET.vila = 148` (hoje 345, fora de escala),
  `GANGUES_CHEFE_LIDER_FRAC.vila = 0.40`, `GANGUES_CHEFE_CORPOS.vila = 3` →
  Ferrugem **59** + Bloco Inteiro e Chave Mestra Maior ~**44–45** (a escolta
  vem mais fraca que no andar dele — "cansaram de subir contigo").
- **Sem `vila` na frac hoje ele cai no padrão 0,60** → 345×0,6 = 207, o
  teto do território estouraria. Corrigir junto.
- `chefe.nivelRec = 59`, `recompensa: { rep: 10, equipPrimeiraVez: 141 }`,
  badge do `gangues-enemies.json` = 59.
- **Fraqueza:** `fraquezaChefe` = −2 Couro com `caixa_dagua` feito.
- **Grana (GDD §9.7):** 30 por inimigo, chefe mínimo 1.200, Clube 650 (já em
  `clubePremioDe`).
- **Grind:** Fura-Bucho ≈ nível 40 → Ferrugem ≈ 53: ~13 níveis. Com 4 fichas,
  recomendo **AP ×1,5** na Vila (mesma linha da Feira).

---

## 6. Birosca, loja, ferreiro, Rinha, Clube

- **Birosca do Térreo:** descanso 30 / 90 (revive = ×3). Mora nela o
  **Aluguel Vencido (1408)** — agiota, caderneta global, empréstimo **800**
  (dívida 8.000). Socorro de derrota = regra atual (`socorroDerrota`, sem teto).
- **Dona Neide (5º):** 2º descanso, mesmo preço; destino do socorro pra quem
  cair do 4º pra cima (o `destinoSocorroDerrota` já escolhe o mais perto — só
  precisa considerar o interior como "lado" certo).
- **Brechó da Síndica (loja):** equipamento **pesado 401–418** + poção de Osso
  +20 (**id 41**, 80) + pilha (17, 25) + consumíveis 1, 2, 10. Nada da Baixada.
- **Oficina do Zelador (ferreiro):** `tetoAprim: 6` (Pista +1, Feira +4).
- **Rinha da Laje:** `rinhaInfinita`, `semGrana`, `nivelDaTropa`, pool
  `[1110, 1112, 1210, 1310]`, teto 59. Sem aposta (aposta só na birosca/Clube).
- **Clube da Luta:** `GANGUES_CLUBE_RONDAS.vila = { 1: {qtd 1, budget 49}, 2:
  {qtd 2, budget 96}, 3: {qtd 3, budget 150} }` (em `clube/ganguesClubeRegras.js`).
  Ronda 3: 3 × ~50, abaixo do Ferrugem. Prêmio 650.

### 6.1 Itens novos

**Equipamento pesado 401–418** (conjunto por loja = GDD §9.7, linha Vila; custo
≈ 1,4× do raro equivalente, conferir com `precoReferencia` antes de gravar):

| id | caminho | slot | bônus | custo |
|---|---|---|---|---|
| 401 | atacante | arma | A [3,5] | 460 |
| 402 | atacante | cabeca | pv 3 | 105 |
| 403 | atacante | corpo | pv 6, D [0,2] | 230 |
| 404 | atacante | bracos | H [1,3] | 335 |
| 405 | atacante | pes | A [0,2] | 250 (drop do Bloco Inteiro) |
| 406 | atacante | amuleto | pm 3 | 65 |
| 407 | defensor | arma | D [2,4], A 1 | 330 |
| 408 | defensor | cabeca | D [0,2] | 125 |
| 409 | defensor | corpo | pv 12 | 335 |
| 410 | defensor | bracos | D [0,2] | 125 |
| 411 | defensor | pes | pv 6 | 170 |
| 412 | defensor | amuleto | pm 3, pv 3 | 170 (drop da Chave Mestra) |
| 413 | mistico | arma | PM [3,5] | 440 |
| 414 | mistico | cabeca | pm 4, A 1 | 200 |
| 415 | mistico | corpo | pm 6, pv 3, D 1 | 330 |
| 416 | mistico | bracos | H 1, pv 3 | 190 |
| 417 | mistico | pes | pm 4 | 125 |
| 418 | mistico | amuleto | PM 1, pm 2 | 290 |

Regras: Paredão nunca > +1 Porrada (407 ok); nível mínimo pela raridade
`pesado` (`nivelMinEquip` precisa conhecer a raridade nova → ~**nível 42**).
Nomes (slugs sugeridos): chave de cano, capacete de obra pintado, colete do
bonde, cotoveleira de borracha, bota de trabalho, molho de chaves, porta de
aço, balde de concreto… — nome no i18n, id numérico.

**Consumíveis/materiais:** 17 `pilha_lanterna` (material, 25), 18
`chave_elevador` (material, 0, quest), 41 `pocao_osso_20` (80). Conferir se
17/18/41 estão livres no `ganguesItens.js` antes (17–19 parecem livres).

**Drop do chefe:** 141 `taco_da_ferrugem` (épico, livre, arma, A [3,6], D [1,4],
nível mín. 57) — ver decisão 6.

---

## 7. Textos (i18n PT/EN/ES — todos obrigatórios nos 3)

Área `games` (`i18n/games/<lang>.json`), prefixo `games.gangues.cena.vila.*`:

- `chegada[]`, `checklist_dica`, `checklist_passagem`, `hint_pilha`, `hint_elevador`
- POIs: `guarita`, `portaria_fuga_1`, `cadeado`, `andar_1`, `andar_2`, `trinco`,
  `andar_4`, `dona_neide`, `condominio`, `andar_6`, `bloco_inteiro`, `goteira`,
  `chave_mestra`, `vizinho.falas[]` (≥6), `varal_patio`, `rinha_laje`,
  `birosca_vila`, `aluguel_vencido`, `brecho`, `oficina_zelador`,
  `dona_neide_descanso`, `apto_302`, `apto_604`, `apto_801`, `caixa_dagua`,
  `elevador.{titulo,subir,travou,chegou}`
- `int.{birosca,brecho,oficina,bloco_baixo,bloco_meio,bloco_alto,cobertura}`,
  `andar_n` ("{n}º andar")
- `alerta.{titulo,sobe,zera,max}`
- Chefe: fala oficial do GDD — PT *"Subiu os dez andar só pra apanhar no
  último? Respeito a disposição. Não muda merda nenhuma."*; EN/ES com
  **adaptação livre** (gíria, nunca literal; ES neutro).
- Baixada: `games.gangues.cena.baixada.corre_respeito`, `informante_vila`
- Itens: `games.gangues.equip.itens.401`…`418`, `141`; `itens.17`, `18`, `41`
- Conferir nomes EN/ES em `story.bosses`/`enemy_names` antes de escrever
  (Ferrugem, Portaria, Escada Cega etc. — não inventar tradução nova).

---

## 8. Checklist de implementação

**F0 — aprovações:** decisões do topo; >2 arquivos novos (regra anti-over-engineering).

**F1 — a cena (só dado)**
1. `data/cenas/vila/{index,mundo,pois,interiores,posicoes,pools}.js` (6 novos,
   espelho da Baixada).
2. Registrar `CENA_VILA` em `CENAS_POR_ID` (`cenaHelpers.js`).
3. `ganguesChefes.js`: budget vila 148, frac 0.40, corpos 3.
4. `ganguesTerritorios.js`: `precisaInformante: true` na Vila (comentário da ponte).
5. `clube/ganguesClubeRegras.js`: rondas da Vila.
6. `ganguesVictoryResolver.js`: `GANGUES_RECOMPENSA_TERRITORIO.vila` (30/1.200).
7. `gangues-enemies.json`: badge Ferrugem 59.
8. Baixada: POIs `corre_respeito` + `informante_vila` em `cenas/baixada/pois.js`
   (+ interiores/posições).

**F2 — motor genérico**
9. `saidaCima` + `trava` por cômodo (`ganguesCenaMotor.js` / `montarAmbiente`).
10. `comodo.apagao` + raio configurável (`GanguesCena.jsx` + CSS `is-apagao`).
11. `hooks/useGanguesElevador.js` + tela curta da cabine.
12. `cena.alerta`: slice de story (`__alerta`), bônus em `revezamentoNoTerritorio`
    (sempre antes do corte de teto), HUD generalizado.
13. `destinoSocorroDerrota`: interior de andar escolhe Dona Neide pros andares ≥4.

**F3 — itens:** 401–418, 141, 17/18/41 em `ganguesEquip.js`/`ganguesItens.js`;
raridade `pesado` em `nivelMinEquip`, `aprimTeto`, cor de raridade.
`ganguesEquip.js` está perto de 500 linhas → **propor extrair** o catálogo por
território antes de somar 19 peças.

**F4 — textos ×3** + script de chaves (toda `games.gangues.*` literal existe nos 3).

**F5 — verificação:** BFS de alcance (térreo e cada andar), nenhum pino em
colisor; Playwright: subir 1→10, elevador travando (forçar `chanceTravar: 1`),
alerta subindo/zerando, derrota no 7º acorda na Dona Neide; `npm run build`.

---

## 9. Riscos

- **Subida repetitiva:** 9 corredores iguais cansam o jogador errado. Mitigar
  com cenário distinto por bloco (baixo: pichação/escuro; meio: varal, vasos;
  alto: piso limpo, porta blindada) e o elevador como atalho de volta.
- **Alerta + teto:** o bônus tem que passar pelo corte do teto, senão o andar 9
  com alerta 3 viraria 61 > Ferrugem (quebra a regra do chefão).
- **Derrota no 9º:** voltar do térreo seria punitivo demais — por isso a Dona
  Neide no 5º e o elevador com chave.
- **Orçamento antigo (345)** vivo em `ganguesChefes.js` + frac padrão 0,60:
  se a cena subir sem o ajuste, qualquer escala com teto quebra.
- **Tamanho de arquivo:** `ganguesEquip.js`, `GanguesCena.jsx` e o motor podem
  passar de 500 linhas — avaliar extração antes.
- **Arte faltando:** retratos 1110–1112, 1210–1212, 1310–1312, 1407, 1408,
  1457, 1458, **1503**, NPCs Dona Neide, Síndica, Zelador da oficina. Emprestar
  retrato de ficha parecida até ter arte.

## 10. Fica pra depois

- **Chefe falso** (GDD §9.x: "você derruba o cara achando que zerou → aparece o
  chefe real") — encaixa aqui (Bloco Inteiro como falso Ferrugem), mas dobra o
  escopo; deixar pra v2 da Vila.
- Bloco B lacrado (dungeon extra / Torre por andar do grind L50→99).
- Consumíveis de fuga/isca (Apito 7, Trocado 9) — elevador ajudaria, mas
  precisa mecânica de fuga no combate.
- Morador neutro que pede favor por andar (sistema de favores da Regina).
