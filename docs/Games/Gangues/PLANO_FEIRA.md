# PLANO — Território 2: A Feira (cena navegável)

> **Status: IMPLEMENTADO na v3.65.0 (27/09/2026)** — a regra oficial agora
> mora no GDD (§4, Território 2). Este arquivo fica como registro do plano e
> das decisões. Diferenças do que foi pro jogo em relação ao texto abaixo:
> - As 5 perguntas da §8 foram decididas como recomendado: AP ×1,5 na Feira,
>   Regina fia por favor, o Rapa leva 1 consumível, Juro Alto empresta 300.
> - O Caderneta (1305) fica **+1 de Malícia** contra devedor (em vez de a tropa
>   perder Pique) — mesmo efeito, aplicado no inimigo.
> - **Apito (7) e Trocado Marcado (9) não entraram** (precisam de mecânica
>   nova de fuga/isca no combate). Os outros consumíveis 3–12 entraram.
> - Mercearia do Aziz vende também os raros 124/128/130; o Pingente de Asa
>   (144) é prêmio da 1ª vitória sobre a Mão do Turco.
> - O bônus de caminho (stub morto no combate) foi removido na mesma leva.

> Pedido do Isaias: *"precisa ter tudo que tem na Pista, mas com um sistema de
> upgrade… tem que ser diferente, e o nível tem que subir… a Pista aumentou
> muito o número de eventos, as versões anteriores tinham poucos."*
>
> **Como li o "sistema de upgrade"** (confirmar): (1) **todo sistema da Pista
> volta na Feira numa versão melhorada** (tabela da §1), e (2) **a Feira é o
> território que apresenta o aprimoramento de equipamento** (a Serralheria —
> regra completa em `PLANO_ITENS_RANGE.md`). Se era outra coisa (ex.: upgrade
> da própria gangue/base), me corrige que eu refaço.

---

## 0. Resumo

- **37 eventos** (a Pista tem 28 contando túnel, galpão e chefe): 10 obrigatórios no
  caminho principal, 2 dungeons (a Galeria dos Gato e o Mercadão), 2 guardas
  do depósito, 16 opcionais e 6 sistemas novos que só existem a partir da Feira.
- **Tema:** aqui não tem tiro — tem **dívida** e **luz**. O Acerto de Contas
  (103) anota o nome de todo mundo na caderneta do Turco; Os Gato (104) são donos
  da energia. A Feira é **metade de dia, metade no apagão**.
- **O "muro" da Feira é o apagão:** a parte de cima da Feira está sem luz (Os
  Gato cortaram). Você chega lá pela **Galeria dos Gato** (o "túnel" da Feira) e
  anda no escuro até derrubar o Cobrador — aí a luz volta (o "muro abre").
- **Nível sobe:** a Feira começa onde a Pista termina (**26**) e sobe de 3 em 3
  até **47**; o **Cobrador fecha em 52**, com 2 generais de escolta (29 cada).
  Isso cabe **exatamente** no orçamento de chefe que já existe no código
  (`GANGUES_CHEFE_BUDGET.feira = 110`), só muda a fração do líder.
- **Time de 3:** vencer o Carvão libera a 3ª vaga — a Feira é pensada pra
  3 fichas, e com isso a Briga em Multidão (5+ combatentes) vira regra, não
  exceção.

---

## 1. Tudo que a Pista tem → a versão "upgrade" na Feira

| Sistema na Pista | Como é hoje | Na Feira (upgrade) |
|---|---|---|
| 1ª luta fácil (`sinal`, 3 pts) | pivete do farol | **A Catraca** (26 pts): Os Gato cobram pedágio na entrada. Mesma ideia — entrada suave, pra quem acabou de bater o Carvão |
| Tretas de rua de 3 em 3 (`beco`, `beco_2`, `beco_3`) | revezamento, dupla 40% | 4 tretas no eixo principal (29→35) e **com cara própria**: cada uma é de uma facção e tem um detalhe de regra (ver §3) |
| 2 generais (`sinaleiro`, `rasteira_velha`) | fixos, sempre sozinhos | **Mão do Turco** (1453) e **Caixa Forte** (1454), fixos. O Caixa Forte **dobra a grana** se você vencer — é o cofre da Feira |
| Puzzle de fechadura (`ferro`, Simon) | falhar vira treta, sem travar | **O Quadro de Luz** (`PuzzleLabirinto`, skin fios): ligar o gato. Falhar dá **choque** (−2 PV na tropa) e vira treta, sem travar |
| Fetch quest da oficina (2× sucata → Nando) | 2 peças em 2 lugares | **O Rádio do Toninho**: 3 peças (válvulas) em 3 lugares, uma delas **comprada**. O rádio consertado pega a frequência do Acerto de Contas e **revela os generais** |
| Stealth (`corre` do Nato) | grade 5×5, 2 câmeras, sem tempo | **A Muamba de Domingo**: grade 6×6, 3 "rapas", **com cronômetro**. Paga mais (40 + rep) |
| Achado (`achado`, `tunel_achado`) | loot solto | **As 3 páginas da Caderneta do Turco** (colecionável): juntar as 3 revela o ponto fraco do Cobrador (ele entra na luta com −2 de Couro) |
| Informante Duda (ponte pro chefe da Feira) | papo repetível na birosca | **O rádio pirata** (repetível): boatos da Feira + a **ponte pra Baixada** (destranca o chefe de lá, igual o Duda faz pra Feira) |
| Túnel (dungeon de 3 cômodos, 4/6/5) | por baixo do muro | **A Galeria dos Gato** (3 cômodos, 23/26/29): escura — só se enxerga em volta do jogador. A porta do meio abre com `PuzzleDecoder` (o código do gato) |
| Galpão (dungeon final, 4 cômodos) | doca, estoque, escritório, breu | **O Mercadão** (4 cômodos): doca, câmara fria, escritório do livro-caixa, cofre → Cobrador |
| Guarda-costas pós-muro (`posmuro_1/2`, 23/26) | gate do galpão | **Os dois do depósito** (44/47), gate do Mercadão. O 2º exige **Rep 60** |
| Loja da Pista (pós-muro) | 14 itens, comuns e incomuns | **A Mercearia do Seu Aziz** (lado apagado): catálogo da Feira (incomuns + os primeiros raros à venda) |
| Lojinha do Zé (poção ×2 de preço) | só poção | **O Camelô**: vende os **consumíveis novos** (Pinga, Vela Benta, Water, Farinha — já desenhados no GDD §9.3, nunca implementados). Tem **pechincha** |
| Descanso do Nato (10 / 30) | cura por grana | **Pensão da Dona Regina** (15 / 45) — e **fiado em troca de favor**: sem grana, ela cura e você fica devendo um favor (ver §4.2) |
| Agiota Marimbondo (100 → 1.000) | escada de dívida | **Juro Alto** (1404, do Acerto de Contas): mesma caderneta **global**, degrau maior — empréstimo de **300** (dívida 3.000). Só aparece se você **não** deve nada ao Marimbondo |
| Rinha (farm, `baseMaisForte`) | nível do seu mais forte | **A Rinha de Apostas**: mesmo farm, mas você **aposta** 0/50/100/200 antes; vence = recebe o dobro |
| Clube da Luta (3 rondas) | 7 / 15 / 26 pts | O mesmo Clube, com **rondas no degrau da Feira** (26 / 50 / 80) — o Clube já é global, só o orçamento acompanha o território onde você está |
| Encontro aleatório (4 tipos) | moto, polícia, bonde, cobrador | Os 4 continuam + **2 da Feira**: **o Rapa** (fiscal da prefeitura — se ganhar de você, leva 1 consumível) e **o Apagão** (só no lado escuro: Os Gato te cercam no breu) |
| Sem game over | acorda na birosca | Igual — o destino é a Pensão da Regina (ou a do lado apagado), já pelo `destinoSocorroDerrota` genérico |
| Oficina do Nando (forja 1 peça) | fetch quest | **A Serralheria do Bigode** — **onde o aprimoramento de equipamento nasce** (range, ver `PLANO_ITENS_RANGE.md`). O Nando da Pista faz só o +1; a Serralheria vai até +4 |

---

## 2. Mapa — duas metades

A Pista é comprida na vertical (spawn embaixo, muro no meio, galpão em cima).
A Feira **repete a estrutura** pra aproveitar todo o motor (`montarAmbiente`,
colisão, portas, `pos_portao`, perseguidor, farol, minimapa) sem mudança:

```
 ┌──────────── LADO APAGADO (pos_portao) ────────────┐
 │  Mercadão (dungeon final) ◄─ depósito 1/2          │
 │  Mercearia do Aziz · Serralheria · Pensão 2        │
 │  Rinha de Apostas                                  │
 │             ▲ saída da Galeria                     │
 ├──── fiação caída / barricada de banca (o "muro") ──┤
 │             ▼ entrada da Galeria dos Gato          │
 │  Banca do Turco · Oficina de Rádio · Quadro de Luz │
 │  Beco dos Gato · Balança · Camelô                  │
 │  Pensão da Dona Regina · Juro Alto                 │
 │  corredor de bancas (a feira de domingo)           │
 │  A Catraca (entrada)            ← spawn            │
 └────────────────────────────────────────────────────┘
```

- **O "muro" é uma barricada de bancas + fiação caída** (mesma faixa de colisão
  do muro da Pista, reaproveita `hitsSolid`). Abre de vez quando o Cobrador cai.
- **Lado apagado:** novo efeito visual `is-apagao` na cena — vinheta escura
  forte, só um círculo de luz em volta do jogador e dos pinos já revelados.
  Reusa a camada `.gang-cena-vignette` que já existe; é CSS, sem motor novo.
- Identidade visual: lonas coloridas, caixotes, gambiarras de fio, varal de
  luz. Cor do território `#7ee787` (já definida).

---

## 3. Os 37 eventos

Pontos = ficha do inimigo (A+H+D+PV+PM). "rev" = revezamento (quase sempre 1
corpo, às vezes dupla; o 2º corpo sai 2–3 abaixo). Nível real = pontos − 6
(`nivelRealDePontos`).

### 3.1 Caminho principal — obrigatórios pro portão (10)

| # | id | Tipo | Pontos | O que é | Revela |
|---|---|---|---|---|---|
| 1 | `catraca` | treta | **26** · rev, dupla 15% | Os Gato cobram pedágio de quem entra. 1ª luta suave de propósito | `banca_turco`, `camelo` |
| 2 | `banca_turco` | papo | — | O Turco anota teu nome. **Se você deve ao agiota, ele já sabe** (fala diferente e o Acerto de Contas passa a te seguir — §4.1) | `cobranca`, `pensao` |
| 3 | `cobranca` | treta | **29** · rev, dupla 40% | Unha de Fome (1304) cobra a "taxa de chegada" | `quadro_luz` |
| 4 | `quadro_luz` | parada | falha: **29** | `PuzzleLabirinto` (fios). Falha = choque (−2 PV em todos) + treta sem travar. Dá **Fio de Cobre** (item novo 14) | `beco_gato`, `radio` |
| 5 | `beco_gato` | treta | **32** · rev, dupla 40% | Choque (1204) e Luz de Gato (1106) defendem o gato | `balanca` |
| 6 | `radio` | papo | — | Toninho conserta o rádio se você trouxer 3 válvulas (item novo 15). **Fetch quest**: válvula 1 = recompensa da `balanca`; 2 = achado da Galeria; 3 = **comprada** no Camelô | `mao_turco` (quando consertado) |
| 7 | `balanca` | treta | **35** · rev, dupla 40% | Pesagem (1306) na balança de ferro. Dá a válvula 1 | — |
| 8 | `caderneta_viva` | treta | **35** · sozinho | Caderneta (1305): **se você deve**, a luta começa com a tropa −1 de Pique ("ele lembra de cada centavo") | — |
| 9 | `mao_turco` | treta | **38** · fixo | General 1453 — sempre sozinho | `caixa_forte` |
| 10 | `caixa_forte` | treta | **41** · fixo | General 1454 — sempre sozinho. **Vencer dobra a grana da luta** | — |

Portão (`portao.precisa`) = os 10 acima → destranca a entrada da **Galeria**.

### 3.2 A Galeria dos Gato — dungeon 1 (3 cômodos, passagem)

| id | Pontos | Detalhe |
|---|---|---|
| `galeria_m1` | 23 · rev, dupla 25% | escuro — visão curta |
| `galeria_porta` | parada | `PuzzleDecoder` (o código do gato) trava a passagem do meio |
| `galeria_m2` | 26 · rev, dupla 45% + `galeria_achado` (válvula 2) | |
| `galeria_m3` | 29 · rev, dupla 30% | sai no lado apagado |

(Igual o túnel da Pista, a dungeon de passagem fica **abaixo** da rua — é
caminho, não teste.)

### 3.3 Lado apagado — gate do Mercadão (2)

| id | Pontos | Detalhe |
|---|---|---|
| `deposito_1` | **44** · rev, dupla 50% | Juro Alto (1404) e capangas guardam o depósito |
| `deposito_2` | **47** · rev, dupla 60%, **Rep 60** | Marreta (1403). Dá o Chip da Muralha (21) |

### 3.4 O Mercadão — dungeon final (4 cômodos)

| Cômodo | Evento | Pontos |
|---|---|---|
| doca | `mercadao_m1` — bando 3–5 corpos | 8/corpo + 40% do time |
| câmara fria | `mercadao_m2` — bando fixo | 40 dividido em 3–5 |
| escritório | `livro_caixa` (papo) — o livro-caixa do Turco: mostra quanto a Feira inteira deve | — |
| cofre | **O Cobrador** (chefe) | **52** + 2 escoltas de **29** |

### 3.5 Opcionais (14)

| id | Tipo | Onde | O que é |
|---|---|---|---|
| `camelo` | loja | rua | consumíveis novos + válvula 3 à venda. **Pechincha**: `PuzzleAnagrama` 1×/visita → −30% |
| `pensao` | descanso | rua | Dona Regina (15 / 45) + fiado por favor (§4.2) |
| `favor_marmita` | corre | rua | favor da Regina 1: levar marmita sem o Rapa ver (stealth fácil) |
| `favor_devedor` | papo | rua | favor 2: convencer o Boleto Vencido (1105) a pagar a Regina — escolhas; errar vira treta |
| `favor_cobrador` | treta | rua | favor 3: dar um pau em quem roubou a banca dela (rev, no nível do seu mais forte) |
| `juro_alto` | agiota | rua | agiota da Feira, degrau maior (§4.3) |
| `muamba` | corre | rua | a Muamba de Domingo (stealth 6×6, 3 rapas, cronômetro) — 40 grana + 3 rep |
| `pagina_1/2/3` | achado ×3 | 1 em cada metade + 1 na Galeria | páginas da Caderneta do Turco (§4.4) |
| `radio_pirata` | papo repetível | oficina de rádio | boatos + ponte pra Baixada (depois do rádio consertado) |
| `rinha_apostas` | treta repetível | lado apagado | farm com aposta (§4.5) |
| `mercearia` | loja | lado apagado | loja principal da Feira |
| `serralheria` | aprimoramento | lado apagado | onde o equipamento é aprimorado (`PLANO_ITENS_RANGE.md`) |
| `pensao_2` | descanso | lado apagado | a Regina tem uma filha do outro lado |
| `mercadao_achado` | achado | Mercadão | grana + Sucata |

**Total:** 10 obrigatórios + 5 na Galeria (3 tretas, a porta, o achado) + 2 do
depósito + 4 no Mercadão + 16 opcionais (as páginas contam 3) = **37 eventos**,
fora o encontro aleatório.

---

## 4. Sistemas novos (o "upgrade")

### 4.1 Dívida reativa — a Feira sabe que você deve
Na Pista a dívida é silenciosa. **Na Feira ela tem consequência**, sem mudar a
regra do Isaias de que **só o Clube quita de verdade**:
- Com `divida > 0`, a fala do Turco muda e o **Cobrador do Acerto de Contas**
  vira um 5º tipo de perseguidor, que aparece **só pra quem deve**.
- Ele **não abate dívida nenhuma** (continua só Clube/pagar em grana): se ele
  ganhar, leva **10% da grana na mão**; se você ganhar, grana normal.
- A Caderneta (1305) luta mais forte contra devedor (§3.1, #8).

### 4.2 Dona Regina — fiado por favor (o que o GDD sempre disse que ela era)
- Descanso normal: **15** (só quem está de pé) / **45** (revive geral).
- **Sem grana:** ela cura igual e você fica com **1 favor devendo** (sem
  grana, sem juro). Enquanto houver favor em aberto ela **não fia de novo** —
  aí só o agiota.
- Pagar o favor = fazer um dos 3 eventos de favor (§3.5). Cada favor feito
  também rende rep.
- O **socorro da derrota** (sem game over) continua cobrando em grana/dívida,
  nunca em favor — a regra que acabou de entrar não muda.

### 4.3 Juro Alto — o degrau de cima da agiotagem
- Mesma caderneta **global** (`storyProgress.__birosca`), sem sistema paralelo.
- Só oferece empréstimo se `divida = 0`: **300** na mão, dívida **3.000**
  (mesmo ×10 do Marimbondo). Cura fiada dobra, igual. Teto 10.000 continua.
- É uma linha nova de constante (`GANGUES_EMPRESTIMO_FEIRA_VALOR = 300`),
  lida pelo mesmo `agiotagemInfo`.

### 4.4 A Caderneta do Turco — colecionável com efeito
- 3 páginas (`pagina_1/2/3`). Com as 3, o `livro_caixa` do Mercadão revela o
  ponto fraco: o **Cobrador entra na luta com −2 de Couro**.
- Opcional: dá pra bater o chefe sem. É o "grinda ou explora" da Feira.

### 4.5 A Rinha de Apostas
- Mesmo farm da `rinha` da Pista (`baseMaisForte`), com uma tela antes:
  aposta **0 / 50 / 100 / 200**. Venceu → recebe **2×** a aposta + grana
  normal. Perdeu → perde a aposta (e o socorro da derrota cobra normal).
- É o sumidouro de grana que a economia precisa quando a Serralheria abrir.

### 4.6 O Apagão (lado de cima)
- Visual: escuro com círculo de luz no jogador (CSS).
- Encontro aleatório **Apagão** só roda aqui: Os Gato cercam no breu (3–4
  corpos, pool 1104/1106/1204, ~90% do seu mais forte).
- Vencer o Cobrador religa a luz: o lado de cima fica normal pra sempre.

---

## 5. Nível, chefe e o tamanho do grind

**Ladder (pontos por corpo):**

```
Pista:  3 · 8 · 11 · 14 · 17(G) · 20(G) · 23 · 26 · CARVÃO 30
Feira: 26 · 29 · 32 · 35 · 35 · 38(G) · 41(G) · 44 · 47 · COBRADOR 52
```

- **O Cobrador:** `GANGUES_CHEFE_BUDGET.feira = 110` (**já existe**) com
  **3 corpos** e a fração do líder em **0,47** (nova linha
  `GANGUES_CHEFE_LIDER_FRAC_POR_TERRITORIO.feira`) → Cobrador **52** + Mão do
  Turco e Caixa Forte de escolta com **29** cada. Nível real ≈ **46**.
  `chefe.nivelRec = 52`, badge "· NÍVEL" no `gangues-enemies.json` também.
- **A ponte com o Duda continua:** o chefe da Feira só abre depois de falar
  com o Duda na Pista (`precisaInformante`, já existe).

**⚠️ Conta do grind — decidir antes de implementar:** o custo de nível é
`5 × (nível + 1)` AP. Da Pista (Carvão ≈ nível 24) até o Cobrador (≈ 46) são
**~3.900 AP por personagem**, contra ~1.500 da Pista inteira — **~2,6× mais
grind**, agora dividido por 3 fichas. Com lutas no nível (≈ 7 AP por ficha)
dá centenas de lutas; lutando acima (triplo/quádruplo) cai pra ~200. Três
caminhos:

1. **Aceitar** — é a Feira, é pra ralar (e as apostas/Caixa Forte dão grana).
2. **AP da Feira ×1,5** (constante por território, 1 linha no
   `calcularApTotal`).
3. **Passo 2 em vez de 3 na Feira** (Cobrador ≈ 42) — mais eventos, degraus
   menores.

Minha recomendação: **(2)** — mantém a regra "de 3 em 3" que você fixou pra
Pista e a Feira não vira 3× mais lenta.

**Grana da Feira:** hoje (v3.63.1) é 10 garantido + 5 por inimigo a mais, em
qualquer lugar — o Isaias acabou de cortar porque a Pista dava grana demais.
Os preços da Feira (e o aprimoramento) sobem, então proponho **15 garantido +5
por inimigo a mais na Feira** (`GANGUES_GRANA_POR_INIMIGO` virando tabela por
território; o `+5` por extra fica igual) e o mínimo do chefe de 500 → **800**.
Recalibrar depois do playtest da Pista com o corte novo. Detalhe de preço em `PLANO_ITENS_RANGE.md` §5.

---

## 6. Como implementar (fases)

Tudo reaproveita o motor da Pista — a cena é **dado**, igual a Pista.

| Fase | O que | Arquivos |
|---|---|---|
| **F1 — a cena** | mapa, POIs, interiores, posições, pools, registro em `CENAS_POR_ID`, ladder, chefe, textos ×3 idiomas | `data/cenas/feira/{index,mundo,pois,interiores,posicoes,pools}.js` (6 arquivos novos, espelhando `pista/` — **precisa da sua aprovação**, regra de >2 arquivos) + `cenaHelpers.js` + i18n ×3 |
| **F2 — sistemas novos** | apagão (CSS), dívida reativa (tipo de perseguidor condicional), Regina/favor, Juro Alto, caderneta, rinha de apostas, Rapa | `ganguesEncontroAleatorio.js`, `ganguesBiroscaSlice.js`, `GanguesDescanso.jsx`, `GanguesCena.jsx`/CSS, 1 componente de aposta |
| **F3 — itens** | consumíveis 3–12, equipamentos 121–131, Serralheria + range | ver `PLANO_ITENS_RANGE.md` |
| **F4 — balanço** | AP/grana por território, playtest com 3 fichas | constantes |

**Arte que falta** (hoje não existe retrato): Unha de Fome (1304), Caderneta
(1305), Pesagem (1306), Marreta (1403), Juro Alto (1404), Mão do Turco (1453),
Caixa Forte (1454), **O Cobrador (1501)**, e os NPCs novos **Dona Regina**,
**Toninho do Rádio**, **Seu Aziz**, **o Bigode da Serralheria**. Até ter arte,
dá pra emprestar retrato de ficha parecida (mesmo truque do Zé/Marimbondo).

**Materiais novos:** Fio de Cobre (14) e Válvula (15), faixa de consumível
`material`, igual a Sucata (13).

---

## 7. Perguntas pra você decidir

1. **"Sistema de upgrade"** — é a leitura da §1 (tudo da Pista, melhorado +
   aprimoramento na Serralheria)? Ou era outra coisa?
2. **Grind:** aceitar, AP ×1,5 ou passo 2? (§5)
3. **Dona Regina fiando por favor** — ok ela ser uma 2ª porta de cura sem
   grana, ou isso afrouxa demais a pressão da dívida?
4. **Rapa leva consumível** quando ganha — punição boa ou chata demais?
5. **Juro Alto** (empréstimo de 300) — quer esse degrau maior ou mantém só o
   Marimbondo?
