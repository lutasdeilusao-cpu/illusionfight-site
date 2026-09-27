# PLANO — Range de equipamento, aprimoramento e preços

> **Status (27/09/2026): APROVADO e IMPLEMENTADO na v3.64.0**, com as
> respostas padrão das perguntas da §8 (Pique rola 1× por luta · PV/PM fixos ·
> aprimoramento sem risco · vantagem nos níveis ímpares · preços novos).
> **Entrou:** faixas + preços (§1, §4.1), dado da arma/armadura no combate e
> Pique sorteado na pista (§1), aprimoramento com a bancada do Nando até +1
> (§3), Sucata caindo em 20% das vitórias de rua (§3), acessório de Pique 140
> na loja da Pista (§4.2), catálogo 121–131 e 141–144 (dados, sem fonte ainda),
> Facão do Carvão 139 (§4.4) e as fontes da §6 que cabem na Pista (103, 110,
> 117, 119). **Fica pra Feira:** a Serralheria (+4), as lojas/prêmios que
> vendem 121–131/141–144 e os raros 106/111/114/120, os consumíveis 3–12 (§5 —
> precisam de efeitos novos de combate e do Camelô), a grana por território e
> os épicos 132–138 (junto com cada chefe). A documentação oficial agora é o
> GDD §9.4–9.6; o texto abaixo é o estudo original.
>
> Escrito em
> 27/09/2026 sobre o código de GANGUES 3.63.0 (`data/ganguesEquip.js`,
> `data/ganguesItens.js`, `engine/ganguesCombatResolver.js`,
> `engine/ganguesLinhaDoTempo.js`). Números de combate saíram de simulação
> (distribuição exata do dado + 40.000 duelos), não de chute.
>
> Pedido do Isaias: *"uma arma dá de 1 a 3 pontos de ataque, 1 a 3 de defesa,
> 1 a 3 de pique… pode ser 1 a 2, 2 a 4, 3 a 7, conforme forem ficando mais
> caros… rebalanceamento de preços… e pensar em como não ficar só aleatório:
> com dois aprimoramentos, se ela dá de 1 a 3, dá sempre 2 a 3."*

---

## 0. Resumo

1. **Todo bônus de Porrada, Couro e Pique vira uma faixa** (ex.: Faca
   Serrilhada: Porrada **1–3**). Osso e Malandragem (PV/PM máximos) continuam
   **fixos** — vida máxima mudando a cada luta não é "arma imprevisível", é só
   confuso.
2. **A faixa nasce centrada no valor de hoje** (a Faca é +2 hoje → 1–3, média 2).
   Resultado da simulação: **o jogo não desbalanceia** — num duelo espelhado,
   +2 fixo vence **50,3%** contra 1–3. Só aumenta a emoção de cada golpe.
3. **Aprimoramento** (+1 a +4) é o investimento que tira a sorte da jogada,
   exatamente no exemplo do Isaias: **+2 transforma 1–3 em 2–3**, **+4 deixa a
   arma sempre no máximo (3)**. Na simulação, a mesma faca +2 vence **62%** e
   +4 vence **73%** contra ela sem aprimorar.
4. **Pique ganha acessórios de verdade** (5 peças novas), com faixa pequena de
   propósito — 1 ponto de Pique pesa muito na linha do tempo.
5. **Preço vira fórmula** (média do bônus × peso do atributo × raridade). Corrige
   distorções de hoje (ex.: +2 de Porrada custa 58 na faca e 48 na manopla).
6. **Achado desta análise:** os 8 equipamentos **raros não têm fonte nenhuma**
   no jogo hoje. O plano dá fonte pra cada um (§6).

---

## 1. Como fica cada tipo de bônus

| Atributo | Quando o dado da peça rola | Por quê |
|---|---|---|
| **Porrada (A)** | **a cada golpe** | "você nunca sabe exatamente quanto tira com aquela arma" |
| **Couro (D)** | **a cada defesa** | espelho da arma: a armadura às vezes segura tudo, às vezes não |
| **Pique (H)** | **uma vez, no começo da luta** | o Pique decide a velocidade na linha do tempo; rolar a cada tique deixaria a pista tremendo sem ninguém entender. "Hoje o tênis tá ligeiro" — aparece na largada |
| Osso/Malandragem (PV/PM) | não rola — fixo | vida máxima tem que ser previsível |

- **Cada peça rola o próprio dado.** Soqueira (0–2) + Manopla (1–3) = dois
  dados somados. A ficha mostra a faixa total (ex.: Porrada **+1 a +5**).
- **Onde o jogador vê:** no dado dramático aparece um 2º dadinho da arma
  ("🔪 +3"); o card do item mostra **Porrada 1–3**; o Pique sorteado aparece na
  largada da pista.
- **Previsões** (loja, aviso de nível recomendado, ficha) usam a **média** —
  nunca o máximo, pra não prometer mais do que a arma entrega.

---

## 2. O que a simulação mostrou

Atacante Porrada 6 contra defensor Couro 5 (ficha de meio de Pista), dado d3
com crítico +2 (o motor real):

| Arma | Dano médio | Desvio | Golpe zerado | Dano máx. |
|---|---|---|---|---|
| sem arma | 1,78 | 1,75 | 33% | 5 |
| **hoje:** +2 fixo | 3,67 | 1,89 | 0% | 7 |
| **range 1–3** | 3,67 | 2,05 | 4% | 8 |
| 1–3 **+1** (vantagem) | 4,11 | 2,01 | 1% | 8 |
| 1–3 **+2** (vira 2–3) | 4,17 | 1,95 | 0% | 8 |
| 1–3 **+3** (2–3 com vantagem) | 4,42 | 1,93 | 0% | 8 |
| 1–3 **+4** (sempre 3) | 4,67 | 1,89 | 0% | 8 |

- **Mesma média, mais emoção:** a faixa 1–3 dá exatamente o dano médio do +2
  fixo, com golpe máximo maior (8) e a chance rara de zerar (4%).
- **Duelos espelhados (PV 15):** +2 fixo × 1–3 = **50,3%** (empate técnico);
  1–3 **+2** × 1–3 = **62,2%**; 1–3 **+4** × 1–3 = **72,7%**. O aprimoramento
  pesa, sem virar "ganha sempre".
- **Armadura em faixa** quase não muda a conta contra uma arma em faixa (dano
  1,85 → 1,91): a defesa em faixa é sabor, não quebra.

---

## 3. Aprimoramento — tirar a sorte da arma

**Regra (uma só pra todas as peças):**
- Cada nível ímpar (+1, +3…) dá **vantagem**: rola o dado da peça **duas vezes
  e fica com o maior** (sobe a média sem mexer em mínimo/máximo).
- Cada nível par (+2, +4…) **sobe o mínimo em 1** (a vantagem daquele degrau
  some — o novo mínimo já faz o papel dela).
- **Teto = quando mínimo encosta no máximo**: aí a peça sempre dá o máximo e
  não aprimora mais. Pra ir além, só peça melhor. Faixa de 2 pontos (1–3, 0–2)
  → teto +4; faixa 2–5 → +6; faixa 3–7 → +8.

```
Faca Serrilhada, Porrada 1–3
  +0  1–3              média 2,00
  +1  1–3 ▲ vantagem   média 2,44
  +2  2–3              média 2,50   ← o exemplo do Isaias
  +3  2–3 ▲ vantagem   média 2,75
  +4  3 (fixo)         média 3,00   ← teto
```

- **Peça com 2 atributos** (ex.: Coturno, Pique e Couro): aprimora só o
  **atributo principal** (o 1º da peça). Simples de ler na tela.
- **Onde aprimora:** o **Seu Nando** (oficina da Pista) faz até **+1** depois
  da quest da sucata; a **Serralheria do Bigode** (Feira, lado apagado) faz até
  **+4**. Cada território novo pode subir o teto do ferreiro (+6 na Baixada…),
  junto com as peças de faixa mais larga — o aprimoramento acompanha o jogo.
- **Custo** (grana + Sucata, item 13 — que hoje só serve pra uma quest):

  | Nível | Grana | Sucata |
  |---|---|---|
  | +1 | 25% do preço da peça | 1 |
  | +2 | 50% | 2 |
  | +3 | 75% | 3 |
  | +4 | 100% | 4 |

  Faca Serrilhada (60): +4 inteiro custa **150 de grana e 10 sucatas** —
  2,5× o preço da peça. Aprimorar uma incomum até o talo sai **mais caro que
  comprar a raro**, mas entrega mais (média 3,0 contra 2,0 da raro sem
  aprimorar) — é escolha, não obviedade.
- **Sem quebra** (recomendado): falhar aprimoramento e perder a peça, estilo
  Ragnarok, é frustrante demais no celular. Se quiser risco, a versão leve é
  "+3 e +4 têm 25% de não pegar: perde a sucata, a grana volta".
- **A Sucata vira recurso de verdade:** passa a cair em ~20% das vitórias de
  rua, no achado do Mercadão, e o Camelô da Feira vende a 10.
- O nível de aprimoramento é **da peça**, não do personagem: mora na instância
  (`store.equipamentos[].aprim`, que já tem `uid`) e vai junto se trocar de dono.

---

## 4. Catálogo proposto

**Fórmula de preço:** `preço = arredonda5( Σ média_do_bônus × peso × raridade )`

| Peso por ponto de média | | Fator de raridade | |
|---|---|---|---|
| Porrada (A) | 28 | comum | 1,0 |
| Couro (D) | 22 | incomum | 1,1 |
| **Pique (H)** | **30** | raro | 1,3 |
| Osso (PV) / Malandragem (PM) | 6 | épico | 1,6 |

O Pique subiu de 22 (o que custava hoje) pra **30** porque desde o sistema do
Pique ele é velocidade na linha do tempo — virou o atributo mais forte por
ponto. Os pesos de Porrada/Couro/PV batem com os preços de hoje, então quase
nada fica mais caro sem motivo.

### 4.1 Os 20 que já existem (101–120)

| id | Nome | slot | rar. | hoje | **proposta** | preço hoje → **novo** |
|---|---|---|---|---|---|---|
| 101 | Soqueira de Lata | arma | C | +1 A | **A 0–2** | 28 → **28** |
| 102 | Faca Serrilhada | arma | I | +2 A | **A 1–3** | 58 → **60** |
| 103 | Cano de Ferro | arma | R | +2 A +1 H | **A 1–3, H 0–2** | — → **110** |
| 104 | Gorro de Moletom | cabeça | C | +1 D | **D 0–2** | 22 → **22** |
| 105 | Capacete de Obra | cabeça | I | +2 D | **D 1–3** | 44 → **50** |
| 106 | Coroa de Lata | cabeça | R | +1 A +1 D | **A 0–2, D 0–2** | — → **65** |
| 107 | Colete Reforçado | corpo | C | +6 PV | +6 PV (fixo) | 36 → **36** |
| 108 | Colete Leve | corpo | C | +6 PM | +6 PM (fixo) | 36 → **36** |
| 109 | Colete de Placa | corpo | I | +12 PV | +12 PV | 80 → **80** |
| 110 | Manto com Capuz | corpo | I | +12 PM | +12 PM | — → **80** |
| 111 | Armadura de Rua | corpo | R | +18 PV | +18 PV | — → **140** |
| 112 | Luva de Couro | braços | C | +1 D | **D 0–2** | 22 → **22** |
| 113 | Manopla de Porca | braços | I | +2 A | **A 1–3** | 48 → **60** |
| 114 | Braçadeira de Cravo | braços | R | +1 A +1 D | **A 0–2, D 0–2** | — → **65** |
| 115 | Tênis Furado | pés | C | +1 H | **H 0–2** | 22 → **30** |
| 116 | Coturno | pés | I | +1 H +1 D | **H 0–2, D 0–2** | 44 → **55** |
| 117 | Bota com Biqueira | pés | R | +2 H | **H 1–3** | — → **80** |
| 118 | Corrente de Lata | amuleto | C | +1 H | **H 0–2** | 28 → **30** |
| 119 | Dente de Ouro | amuleto | I | +1 A | **A 1–2** | — → **45** |
| 120 | Medalha de Santa | amuleto | R | +1 D +1 H | **D 0–2, H 0–2** | — → **70** |

Toda faixa tem **a mesma média do valor de hoje** (exceto o Dente de Ouro, que
era um incomum mais fraco que o comum do lado e sobe pra 1–2). Ou seja: trocar
fixo por faixa **não mexe no balanço** que já foi calibrado na Pista.

### 4.2 Pique — acessórios novos (140–144)

| id | Nome | slot | rar. | bônus | preço | onde |
|---|---|---|---|---|---|---|
| 140 | Chinelo de Dedo | pés | C | **H 0–2** | 30 | loja da Pista |
| 141 | Relógio Parado | amuleto | C | **H 1–2** | 45 | Camelô da Feira |
| 142 | Tênis de Corrida | pés | I | **H 1–3** | 65 | Mercearia da Feira |
| 143 | Fita do Bonfim | amuleto | I | **H 1–3** | 65 | Mercearia da Feira |
| 144 | Pingente de Asa | amuleto | R | **H 2–4** | 115 | Rinha de Apostas (prêmio) |

**Por que a faixa de Pique é pequena:** a velocidade é `Pique + base`, e a
base é só 10% da ficha média da luta (na Pista, 2–3). Então **+2 de Pique já
deixa um personagem ~40% mais rápido** (5 → 7). Um acessório de Pique 3–7
quebraria a linha do tempo — mesmo com o teto de 3× do mais lento.

### 4.3 Os planejados da Feira (121–131), já em faixa

Aqui entra o "2 a 4, 3 a 7 conforme fica mais caro":

| id | Nome | slot | rar. | bônus | preço |
|---|---|---|---|---|---|
| 121 | Boné Vira-Lata | cabeça | C | H 0–2 | 30 |
| 122 | Balaclava de Pano | cabeça | I | D 1–3, H 0–1 | 65 |
| 123 | Jaqueta de Bonde | corpo | C | +8 PV | 50 |
| 124 | Manto de Sintonia | corpo | R | +18 PM | 140 |
| 125 | Manopla de Prego | braços | I | **A 2–4** | 90 |
| 126 | Chinelo Reforçado | pés | C | H 0–2, D 0–1 | 40 |
| 127 | Corrente de Ouro Falso | amuleto | I | A 1–3 | 60 |
| 128 | Terço de Vó | amuleto | R | D 1–3, H 0–2 | 95 |
| 129 | Facão de Cabo Fita | arma | I | **A 2–4** | 90 |
| 130 | Espeto de Grade | arma | R | **A 2–5**, D 0–2 | 155 |
| 131 | Bastão de Sinaleiro | arma | I | A 1–3, H 0–2 | 95 |

### 4.4 Épicos de chefe (132–139), em faixa larga

Nunca à venda (drop de chefe). Faixa larga = mais degraus de aprimoramento.

| id | Nome | bônus proposto | chefe |
|---|---|---|---|
| 139 | Facão do Carvão | **A 2–5**, D 0–2 | Carvão (Pista) — **dá pra ligar já**, o chefe existe |
| 138 | Porrete do Cobrador | **A 3–7**, H 1–3, D 0–2 | Cobrador (Feira) |
| 136 | Espeto do Fura-Bucho | A 3–7, H 2–4 | Baixada |
| 137 | Taco da Ferrugem | A 2–6, D 3–5 | Vila |
| 134 | Vara da Fera | A 3–7, H 1–3 + cura 5 PV ao derrubar | Morro |
| 135 | Bengala do Contador | A 2–5, D 2–5 | Alto do Morro |
| 132 | Facão do Retalho | A 4–9, D 2–5 | Retalho (Laje) |
| 133 | Coroa da Laje | D 3–6, H 2–4 | Retalho (Laje) |

---

## 5. Consumíveis — preço por ponto de efeito

Hoje a poção cura 5 por 14 (2,8 por ponto). Os consumíveis planejados no GDD
(3–12) estavam baratos demais perto dela (a Farinha curava 7 por 9). Proposta,
já no preço da Feira (o Camelô vende):

| id | Nome | efeito | GDD | **proposta** |
|---|---|---|---|---|
| 3 | Cigarro de Palha | +3 PM, −1 Couro 1 turno | 3 | **7** |
| 4 | Water Energético | +8 PM | 8 | **22** |
| 5 | Faixa de Pano | +3 PV | drop | drop |
| 6 | Pinga | +2 Porrada por 2 turnos, −1 Couro | 6 | **18** |
| 7 | Apito | fugir sem penalidade | 5 | **15** |
| 8 | Bombinha de Fumaça | −1 Pique em todos os inimigos, 1 rodada | 10 | **25** (Pique ficou forte) |
| 9 | Trocado Marcado | tira 1 inimigo de 1 rodada | 6 | **15** |
| 10 | Farinha de Guaraná | +7 PV | 9 | **20** |
| 11 | Vela Benta | +2 Couro por 2 turnos | 7 | **18** |
| 12 | Sacola de Bala | +2 PV | 2 | **6** |

**Grana entrando** (pra fechar a conta): desde a v3.63.1 é **10 garantido +5
por inimigo a mais** (2 inimigos = 15), em todo lugar. Proposta: o garantido
vira **tabela por território** — Pista 10, **Feira 15** (+5 por extra nos
dois) — e o mínimo do chefe da Feira 800. Um kit incomum completo pra 3 fichas
na Feira sai ~1.200 de grana: ~60 lutas de 2 inimigos (20 cada), antes do
aprimoramento. Esses preços foram pensados antes do corte de grana — revisar
junto com o playtest do corte. A Rinha de Apostas e o
Caixa Forte (dobra a grana) são as torneiras extras; o aprimoramento é o ralo.

---

## 6. Achado: os raros não têm fonte

Hoje 103, 106, 110, 111, 114, 117, 119 e 120 existem no catálogo mas **nada
dá eles**: não estão em loja, nenhum POI entrega, não há drop. Proposta de
fonte, sem sistema novo (reusa `recompensa.item`/`daEquip` e `poi.itens`):

| Peça | Fonte proposta |
|---|---|
| 119 Dente de Ouro, 110 Manto com Capuz | loja da Pista (pós-muro) |
| 117 Bota com Biqueira | recompensa do `corre` do Nato (1ª vez) |
| 103 Cano de Ferro | recompensa do `posmuro_2` (no lugar do chip, que já sai por Rep) |
| 106 Coroa de Lata, 114 Braçadeira | Mercearia da Feira |
| 111 Armadura de Rua, 120 Medalha | Caixa Forte (1ª vitória) e achado do Mercadão |

---

## 7. Como implementar

| Parte | Mudança | Onde |
|---|---|---|
| Dados | `bonus: { A: [1, 3] }` (lista = faixa; número = fixo, retrocompatível) | `data/ganguesEquip.js` |
| Média | `getGanguesEquipBonuses` devolve a **média** pra loja/ficha/aviso | `data/ganguesEquip.js` |
| Combate | na preparação do combatente, guardar a faixa de cada peça em vez de somar fixo; Porrada rola no `resolveGanguesAction` (novo `rolls.arma`), Couro rola na defesa (`rolls.armadura`), Pique rola 1× no `prepare` | `useGanguesTurnMachine.js`, `ganguesCombatResolver.js`, `ganguesBrigaMultidao.js` (usa o mesmo resolver) |
| Tela | 2º dadinho no dado dramático, faixa no card do item, Pique sorteado na largada | `DramaticDice.jsx`, `GanguesLoja.jsx`, `GanguesPistaTempo.jsx` |
| Aprimoramento | campo `aprim` na instância (`normalizeGanguesEquipment` põe 0 em save antigo), tela do ferreiro | `ganguesEquip.js`, store de equipamento, POI novo tipo `ferreiro` |
| Save | nada quebra: o save guarda `itemId`, a faixa vem do catálogo; `aprim` ausente = 0 | — |

**Inimigos continuam como estão** (ficha fixa, sem faixa). O campo
`weapon_damage` que existe no `gangues-enemies.json` **não é lido em lugar
nenhum** hoje; se um dia quiser arma com faixa pro inimigo também, é ele.

---

## 8. Perguntas pra você decidir

1. **Pique rolando 1× por luta** (e não a cada golpe) — ok?
2. **Osso/Malandragem ficam fixos** — ok, ou quer faixa na vida também?
3. **Aprimoramento com quebra/risco** ou sem risco nenhum?
4. **Vantagem nos níveis ímpares** (rola 2, fica com o maior) — gostou, ou
   prefere que todo nível suba o mínimo direto (aí 1–3 fica: +1 → 2–3, +2 → 3)?
5. **Preços novos**: a manopla e o capacete sobem pra ficar no mesmo preço das
   peças de mesma força — ok mexer no preço de coisa que o jogador já conhece?
