GDD — LDI Arena
Documento de Design de Jogo · Versão 0.1 (Protótipo)

Visão Geral

LDI Arena é um jogo tático de combate por turnos em tabuleiro hexagonal. Dois jogadores (ou jogador vs IA) controlam um ou mais personagens e disputam a eliminação do oponente ou controle do campo. O sistema prioriza decisões estratégicas por turno em detrimento de execução reflexiva.

Esta versão é um protótipo para validação das mecânicas core antes de integração ao universo LDI.

Atributos

Cada personagem possui seis atributos base.

Força (FOR)
Determina o dano de ataques corpo a corpo (Melee). O valor bruto equivale diretamente ao dano causado sem equipamentos.

Agilidade (AGI)
Controla duas coisas: ordem de ataque no turno e movimentação no tabuleiro.

Ordem de ataque: quem tiver maior Agilidade ataca primeiro. Verificado turno a turno, já que buffs e efeitos podem alterar o valor durante a batalha. Em empate, decide-se por Jokenpô; quando mais de dois personagens empatam, o resultado do primeiro Jokenpô vale para todos os turnos seguintes.

Movimentação: todo personagem começa com 1 casa de movimento. A cada 3 pontos de Agilidade, esse valor aumenta em 1.

AGI

Casas de Movimento

1–2

1

3–5

2

6–8

3

9+

4

Destreza (DEX)
Determina a chance de acerto contra a Agilidade do oponente. Se DEX for maior que a AGI do oponente, o ataque sempre acerta. Caso contrário:

AGI do Oponente

Chance de Acerto

1–2

90%

3

80%

4

70%

5

60%

6

50%

7

40%

8+

30% (piso)

Personagens com Agilidade muito alta nunca se tornam completamente inalcançáveis.

Poder de Fogo (PDF)
Determina capacidade de ataque à distância. Sem equipamentos, o ataque parte em linha reta.

A partir de 1 ponto de PDF o personagem pode atingir mais de uma célula à frente, mas a Força de Ataque é reduzida em 1 ponto em relação à Força bruta. A distribuição de dano por célula é a seguinte:

Célula

Dano Recebido

1ª

100%

2ª

75%

3ª em diante

50%

Exemplo: PDF 4 gera FA base 3, distribuída conforme tabela acima.

Resistência (RES)
Cada ponto de Resistência concede +10 HP e +10 MP. Também é o atributo utilizado para resistir a efeitos de status (envenenamento, queimadura, loucura, controle mental) e a qualquer efeito que tente mover o personagem do seu espaço no tabuleiro. Sempre que um desses efeitos ocorre, realiza-se um teste de Resistência para determinar se é aplicado ou negado.

Além disso, a Resistência determina quantos poderes o personagem pode levar para a batalha, com máximo de 4.

RES

Poderes Disponíveis

1

1

2

2

3

3

4+

4

Os poderes podem ser trocados livremente entre batalhas.

Armadura (ARM)
Determina a defesa base do personagem. Veja a seção Força de Defesa abaixo.

Cálculo de Combate

FA — Força de Ataque

Ataque Melee:

FA = FOR + (DEX × 0,25) + d6

Ataque à Distância:

FA = (PDF - 1) + (DEX × 0,25) + d6

A contribuição de DEX é fracionada: cada ponto vale 0,25, ou seja, 4 pontos de DEX equivalem a +1 na FA.

Acerto Crítico (resultado máximo no d6):
A Destreza é aplicada de forma bruta — cada ponto vale 1 em vez de 0,25.

Ataque Extra:
Se a AGI do atacante for mais que o dobro da AGI do oponente, o atacante ganha um ataque adicional com metade do valor de FA do ataque base.

FD — Força de Defesa

FD = ARM + (AGI × 0,25) + d6

Independentemente do resultado, o atacante sempre causa no mínimo 1 de dano, salvo uso de poderes, condições de ambiente ou defesa crítica.

Defesa Crítica (resultado 6 no d6 defensivo):
Anula 100% do dano. Concede direito a um contra-ataque com FA reduzida à metade. O adversário pode aplicar sua FD contra esse contra-ataque.

Tabuleiro

O tabuleiro é hexagonal. Cada célula pode conter um personagem, um obstáculo ou um item.

Tipos de Obstáculo

Tipo 1 — Parede/Rocha Alta
Bloqueio total. Nem ataques Melee nem ataques de PDF passam por ele. É obrigatório contornar.

Tipo 2 — Buraco
Ataques de PDF passam por cima. Ataques Melee não. É obrigatório contornar para engajar corpo a corpo.

Tipo 3 — Obstáculo Destrutível (ex: barril)
Possui HP de 1 a 3. Pode ser destruído por FA direta. Ataques de PDF que passam por ele antes de atingir o alvo têm o dano reduzido conforme as regras de alcance de PDF. Se o obstáculo estiver atrás do alvo, o alvo recebe dano normal e o obstáculo recebe o dano residual reduzido. Obstáculos deste tipo podem ter efeitos de área ao serem destruídos (explosão em linha reta ou em área, congelamento, etc.).

Tipo 4 — Obstáculo Móvel
Pode ou não ser destrutível, mas é possível empurrá-lo com FA. A direção do empurrão é a mesma da FA aplicada.

Itens

Poção de HP — Restaura pontos de vida. +5

Poção de MP — Restaura pontos de magia/energia. +5 

Equipamentos

Equipamento Ofensivo — Adiciona +2 à FA.

Equipamento Defensivo — Adiciona +2 à FD.

Escopo do Protótipo

Para a fase de teste, o objetivo é validar:

Se o cálculo de FA/FD gera combates com duração interessante (nem muito rápidos nem muito longos)

Se a mecânica de hexágono com obstáculos cria decisões táticas reais de posicionamento

Se a ordem de turno por AGI com Jokenpô em empate funciona na prática sem travar o fluxo

Se os obstáculos Tipo 3 e 4 adicionam profundidade ou complexidade desnecessária

O sistema de poderes fica fora do protótipo inicial — entra na segunda rodada de testes após validação do core de combate.

LDI Arena GDD v0.1 — para uso interno, sujeito a revisão após sessão de playtest.