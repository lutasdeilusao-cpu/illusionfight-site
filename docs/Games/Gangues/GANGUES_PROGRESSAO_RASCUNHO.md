# LDI Gangues — Novo Sistema de Progressão e Especializações

> Rascunho de sistema, pra correção pontual depois. Cobre a estrutura geral de XP/AP e os
> 5 subcaminhos completos do **Atacante**. Defensor e Místico ficam pro próximo round.
>
> **Status de implementação (2026-08-18, atualizado no mesmo dia)**: o catálogo dos 5
> subcaminhos do Atacante (ids, nomes, active/passive) foi implementado em
> `data/ganguesSpecials.js`, com nomes traduzidos em `src/i18n/gangues-{pt,en,es}.json`. Na
> sequência, os **valores numéricos dos 25 poderes do Atacante foram implementados e ligados ao
> combate** em `engine/ganguesSpecialEffects.js` (v1.14.0) — com simplificações pontuais pra
> caber no modelo atual de 1 ação por turno sem fila de status/duração: efeitos com duração
> (Marca, Fratura de Ilusão, Ponto de Pressão) viraram bônus imediato de dano; efeitos que
> mexiam na ordem de turno (Investida furar a fila, Fôlego Final dar ação extra) perderam essa
> parte, mantendo só o bônus numérico. Os valores usados (custo de PM/PV, bônus por nível) estão
> documentados nos comentários de `ganguesSpecialEffects.js`, próximos ao que está descrito
> abaixo. **Defensor e Místico continuam sem design próprio** (usam um template genérico) — este
> documento segue sendo a referência de design pra quando alguém escrever a versão deles.

---

## 1. Moeda de progressão

- **AP (Pontos de Ação)**: acumula jogando, igual XP de jogo tradicional.
- A cada **10 AP** → ganha **1 XP** (Ponto de Experiência), que é a moeda gasta de fato.
- XP é gasto livremente, ponto a ponto, em 3 destinos possíveis:
  1. Subir atributo (A/H/R/D)
  2. Liberar um especial novo do caminho escolhido
  3. Upar um especial já liberado (nível 1→2→3)

## 2. Ficha base e atributos

- **Criação**: 5 pontos pra distribuir entre A/H/R/D, máximo 5 por atributo (regra atual,
  não muda).
- **Do 6º ponto em diante**, cada atributo sobe via XP, ficando cada vez mais caro:

| De → Para | Custo XP |
|---|---|
| 5 → 6 | 3 |
| 6 → 7 | 5 |
| 7 → 8 | 7 |
| 8 → 9 | 9 |
| 9 → 10 ("Gigante") | 12 |

- **Nível 10 = "Gigante"**: só flavor/lore (poder equivalente ao soco de um gigante, referência
  Dragon Ball Z) — sem efeito mecânico extra. Pode virar selo visual na ficha (nome do atributo
  destacado/dourado) e entrar em trash talk/flavor text.
- Escala deliberadamente ineficiente: 36 XP pra levar 1 atributo de 5 a 10, contra 30 XP pra
  levar TODOS os 5 especiais de um caminho ao nível máximo. Atributo puro nunca deve competir
  com poder — mesma filosofia econômica do 3D&T original.

## 3. Especiais de caminho

- Cada caminho tem **5 especiais**, cada um com **3 níveis**.
- **Liberação é escolha livre do jogador** — não tem ordem fixa, ele vê os 5 disponíveis e
  escolhe qual quer primeiro.
- Custo de XP por especial:

| Ação | Custo XP |
|---|---|
| Liberar (nível 1) | 1 |
| Nível 1 → 2 | 2 |
| Nível 2 → 3 | 3 |

- Total pra 1 especial no nível máximo: **6 XP**. Todos os 5 no máximo: **30 XP**.
- **Só 2 especiais vão pra batalha por vez**, escolhidos antes de entrar em combate — mesmo
  com os 5 liberados e upados, o jogador sempre monta um loadout de 2. Isso incentiva ter
  várias fichas do mesmo caminho pra testar combinações diferentes.
- Cada caminho mantém proporção aproximada de **4 especiais ativos (custam PM, ação escolhida
  no turno) + 1 passivo** (sempre ligado, sem custo de PM direto — pode ter regra própria de
  sustentação, como desgaste natural).

---

## 4. Atacante — os 5 subcaminhos

Cada subcaminho puxa uma lógica de atributo/mecânica diferente, sem overlap entre eles:

| Subcaminho | Foco mecânico |
|---|---|
| Bruto | Ataque puro, PM vira dano bruto |
| Duelista | Ignora Defesa alheia, precisão |
| Fúria | Resistência invertida (PV baixo = mais forte) |
| Especialista | Habilidade, efeito residual/debuff |
| Vingador | Defesa própria, resposta ao dano recebido |

---

### 4.1 Bruto — força bruta, PM em dano

**1. Soco de Ferro** (ativo)
Converte PM investido em dano fixo somado direto ao FA — sem depender de dado, sem crítico,
matemática pura.
- Nv1: custo base, bônus fixo de dano X.
- Nv2: mesma faixa de PM, conversão melhora (mais dano pelo mesmo custo).
- Nv3: se o dano sozinho for suficiente pra derrubar o alvo, sobra uma fração como dano
  residual no golpe seguinte (efeito pontual, não é debuff duradouro).

**2. Investida** (ativo)
Fura a ordem de iniciativa, agindo antes da fila normal.
- Nv1: ataca fora de ordem, sem bônus extra.
- Nv2: se o alvo ainda não agiu na rodada, ganha bônus de dano por pegá-lo de surpresa.
- Nv3: o bônus de surpresa aumenta e o custo de PM cai um pouco.

**3. Peso Bruto** (passivo)
Enquanto o PM atual estiver **acima de 50% do máximo**, todo ataque **normal** (não-especial)
ganha bônus fixo de dano. A cada **2 ataques normais dados** nesse estado, consome **1 PM**
automaticamente (desgaste físico de sustentar o estado). Se o PM cair a 50% ou menos, o
passivo desliga e só reativa quando o PM voltar a subir acima da marca (poção/recuperação).
- Nv1: bônus base de dano.
- Nv2: bônus de dano maior, mesmo limiar de 50%.
- Nv3: desgaste passa a consumir 1 PM a cada 3 ataques em vez de 2 (mais sustentável).

**4. Marreta** (ativo)
Abre uma janela de **2 ataques consecutivos**: em cada um, se a rolagem do dado de ataque
sair 1 ou 2, vira 3 automaticamente (sem contar como crítico); se sair 3 organicamente, crítico
normal acontece e a carga da janela não é "desperdiçada" à toa — ela só se encerra ao completar
os 2 ataques, dando ou não a garantia. Opcionalmente, pagando PM extra por cima do custo base,
soma um bônus fixo adicional no FA daquele ataque específico — empilha com garantia ou crítico.
- Nv1: janela de 2 ataques, turbo custa X PM extra por +2 FA.
- Nv2: janela sobe pra 3 ataques.
- Nv3: turbo fica mais barato (menos PM por +2 FA).

**5. Fim de Linha** (ativo, ultimate)
O maior dano fixo do caminho, num golpe só. Depois dele, o Bruto sofre uma penalidade
temporária de Ataque no turno seguinte (exaustão).
- Nv1: dano alto, penalidade padrão no turno seguinte.
- Nv2: dano ainda maior, penalidade um pouco menor.
- Nv3: se usado logo após Marreta ou com Peso Bruto ativo, o dano escala mais (interação com
  os outros especiais do caminho), mas a penalidade de exaustão também cresce proporcionalmente.

---

### 4.2 Duelista — precisão cirúrgica

**1. Golpe Certeiro** (ativo)
Ignora uma fração da Defesa **base** do alvo naquele ataque (diferente da Marreta do Bruto,
que ignora a rolagem de dado, não a Defesa base).
- Nv1: ignora uma fração pequena da Defesa base.
- Nv2: fração ignorada aumenta.
- Nv3: custo de PM cai, mantendo a mesma fração ignorada do Nv2.

**2. Fluidez** (ativo)
Ataque duplo: dois golpes no mesmo turno, cada um com FA reduzido individualmente (mais
chances de acertar, menos dano por golpe).
- Nv1: dois golpes fracos.
- Nv2: redução de FA por golpe fica menor (cada golpe bate mais forte que no Nv1).
- Nv3: se ambos os golpes acertarem, o segundo ganha um pequeno bônus extra de dano.

**3. Leitura de Combate** (passivo)
Sempre ignora uma fração pequena e fixa da Defesa base do alvo, em **todo** ataque normal,
sem precisar ativar nada — é a marca registrada do caminho.
- Nv1: fração mínima, sempre ativa.
- Nv2: fração aumenta um pouco.
- Nv3: fração aumenta mais, chegando ao teto do passivo.

**4. Marca** (ativo)
Marca o alvo por N turnos; o próximo ataque contra esse alvo (do próprio Duelista) ignora
Defesa extra, empilhando com Golpe Certeiro se usado em conjunto.
- Nv1: marca dura 1 turno, bônus pequeno.
- Nv2: marca dura 2 turnos.
- Nv3: bônus de dano contra alvo marcado aumenta.

**5. Execução** (ativo, ultimate)
Contra alvo com PV abaixo de um limiar, o ataque ignora a Defesa base quase por completo e
ganha bônus de dano de finalização.
- Nv1: limiar de PV baixo, ignora boa parte da Defesa.
- Nv2: limiar de ativação sobe (fica utilizável em mais situações).
- Nv3: ignora Defesa quase inteira contra alvo dentro do limiar.

---

### 4.3 Fúria — quanto mais dói, mais forte fica

**1. Sangue Fervente** (passivo)
Bônus de dano cresce automaticamente conforme o PV do próprio Fúria cai — sem ativar nada,
é a identidade central do caminho.
- Nv1: escala moderada com PV perdido.
- Nv2: escala mais acentuada.
- Nv3: escala máxima, efeito perceptível já com PV pela metade.

**2. Grito de Guerra** (ativo)
Sacrifica uma fatia do próprio PV imediatamente em troca de bônus de dano garantido no
próximo ataque.
- Nv1: troca pequena de PV por bônus moderado.
- Nv2: mesma troca de PV, bônus maior.
- Nv3: troca de PV cai um pouco, bônus se mantém.

**3. Fôlego Final** (ativo, condicional)
Só pode ser usado com PV abaixo de um limiar. Concede uma ação/ataque extra imediato.
- Nv1: limiar baixo de ativação (precisa estar bem machucado).
- Nv2: limiar sobe, fica utilizável mais cedo na luta.
- Nv3: custo de PM cai.

**4. Ignorar a Dor** (ativo)
Por N turnos, reduz o dano recebido, mas potencializa ainda mais o bônus de Sangue Fervente
enquanto durar.
- Nv1: redução pequena de dano recebido, 1 turno.
- Nv2: dura 2 turnos.
- Nv3: redução de dano recebido aumenta.

**5. Última Investida** (ativo, ultimate)
Dano proporcional à soma de todo PV perdido pelo Fúria na batalha até aquele ponto — quanto
mais sofreu, mais forte esse golpe fica.
- Nv1: proporção base de conversão PV-perdido → dano.
- Nv2: proporção melhora.
- Nv3: proporção máxima, é o maior número possível no caminho Fúria.

---

### 4.4 Especialista — técnica, não força

**1. Precisão Absoluta** (passivo)
O ataque dele **não sofre** a redução padrão de `floor(Habilidade/2)` — usa a Habilidade
inteira no cálculo de FA. Em compensação, o valor de Ataque dele conta menos no FA total
(ele não é feito pra bater forte, é feito pra nunca errar o ponto certo).
- Nv1: usa Habilidade cheia, penalidade de Ataque padrão.
- Nv2: penalidade de Ataque suavizada.
- Nv3: pequeno bônus adicional vindo da Habilidade, por cima da conversão cheia.

**2. Ponto de Pressão** (ativo)
Golpe que aplica dano residual: o alvo perde PV adicional ao longo de N turnos seguintes
(efeito com nome próprio do lore, não "veneno" — dor que ecoa).
- Nv1: dano residual pequeno, 2 turnos.
- Nv2: dura 3 turnos.
- Nv3: dano residual por turno aumenta.

**3. Fratura de Ilusão** (ativo)
Reduz temporariamente a Habilidade do alvo (atordoamento — ele perde posição na ordem de
iniciativa nos turnos seguintes).
- Nv1: redução pequena, 1 turno.
- Nv2: dura 2 turnos.
- Nv3: redução maior.

**4. Foco Cirúrgico** (ativo)
Converte parte da Habilidade do Especialista em bônus direto de FA, só naquele ataque.
- Nv1: conversão pequena.
- Nv2: conversão melhora.
- Nv3: custo de PM cai, mesma conversão do Nv2.

**5. Colapso Mental** (ativo, ultimate)
Dano aumentado se o alvo já estiver sob efeito de Ponto de Pressão ou Fratura de Ilusão —
combina/potencializa os efeitos que o próprio Especialista aplicou antes.
- Nv1: bônus de dano se 1 efeito estiver ativo no alvo.
- Nv2: bônus maior se os 2 efeitos estiverem ativos ao mesmo tempo.
- Nv3: bônus máximo, e reforça a duração dos efeitos já ativos no alvo.

---

### 4.5 Vingador — aguenta o troco, devolve em dobro

**1. Casca Dura** (passivo)
Bônus fixo somado na Defesa própria, sempre ativo, sem custo de PM — identidade central do
caminho.
- Nv1: bônus pequeno de Defesa.
- Nv2: bônus aumenta.
- Nv3: bônus máximo.

**2. Absorver Impacto** (ativo)
Ativa um estado que acumula "carga" toda vez que ele apanha, durando N turnos ou até ser
descarregado.
- Nv1: carga pequena por golpe recebido, dura 2 turnos.
- Nv2: dura 3 turnos.
- Nv3: carga acumulada por golpe recebido aumenta.

**3. Contragolpe** (ativo)
Gasta a carga acumulada de Absorver Impacto pra somar um bônus de dano num ataque.
- Nv1: conversão de carga em dano, taxa base.
- Nv2: taxa de conversão melhora.
- Nv3: pode gastar parcialmente a carga (não precisa zerar tudo de uma vez).

**4. Postura Firme** (ativo)
Por 1 turno, reduz o dano recebido e dobra a carga ganha por golpe recebido nesse mesmo turno.
- Nv1: redução de dano pequena, carga dobrada.
- Nv2: redução de dano maior.
- Nv3: dura 2 turnos em vez de 1.

**5. Retribuição Final** (ativo, ultimate)
Soma todo o dano recebido pelo Vingador na batalha inteira e devolve numa única cajadada.
- Nv1: proporção base de conversão dano-recebido → dano-devolvido.
- Nv2: proporção melhora.
- Nv3: proporção máxima, maior número possível do caminho.

---

## 5. Pontos em aberto (pra próxima rodada)

- Valores numéricos exatos (PM de custo, % de bônus, quantidade fixa de dano) ainda não
  definidos — ficaram como "base/melhora/máximo" propositalmente, pra calibrar depois de ver
  o jogo rodando.
- Defensor e Místico ainda não desenhados nesse nível de detalhe.
- Falta decidir se upar atributo e upar especial competem 1:1 pela mesma "panela" de XP sem
  nenhuma restrição adicional, ou se algum marco da ficha bloqueia um dos dois temporariamente.
- Interações entre especiais de caminhos diferentes (ex: efeito de Especialista + dano de
  Bruto no mesmo alvo) não foram pensadas — hoje cada caminho foi desenhado isoladamente.
- Ordem de liberação dos especiais é livre — vale revisar se algum dos 5 (principalmente o
  ultimate, nível 5 de cada lista) deveria ter um pré-requisito mínimo antes de poder ser
  escolhido primeiro.
