# SBI — Simulador de Batalhas de Ilusão

O SBI é o aparelho que dá acesso ao LDI. O jogador põe o aparelho, a consciência entra no MDI (Mundo de Ilusões) e o corpo de verdade fica parado no MDR (Mundo de Realidade). A dor sentida lá dentro é real.

## Peças

| Peça | O que faz | Onde aparece |
|---|---|---|
| **Luva tecnológica** | Luva de meio dedo, "inteligente". Lê o movimento da mão e liga armas e poderes. É quente ao toque e encaixa com cliques. | Glossário, Mundo, livro cap. 03, Lendas |
| **Óculos** | Óculos escuros de imersão visual e sensorial. Encaixam no rosto como se fossem parte do corpo. | Glossário, Mundo, livro cap. 03, Lendas |
| **Immersor** | Unidade de corpo inteiro que liga o sistema nervoso ao mundo virtual. A pessoa deita nele. | Glossário, Mundo, `LDI_mechanics.md`, Lendas |

No livro, o Kim põe só **a luva e depois os óculos** (cap. 03: "Kim colocou a luva. Depois os óculos."). O Immersor nunca aparece no livro; só aparece no glossário e no jogo Lendas.

## Como funciona

- **Ativação:** uma corrente elétrica percorre o corpo. O aparelho faz conexões neurais com o cérebro, "como filamentos invisíveis".
- **NeoGuide:** uma IA de voz feminina fala dentro da cabeça, calibra os sentidos e, na primeira vez, cria o avatar (nome, idade, origem). O avatar copia a aparência real do jogador.
- **Entrada:** escuridão (suspensão neural), queda livre pelo céu do MDI e pouso na arena.
- **Dor real:** fratura, queimadura e corte são sentidos com intensidade total. O jogo não filtra a dor.
- **Recuperação:** depois de dano pesado, até 96 horas de recuperação (o Kim precisou de 4 dias após a primeira luta).
- **Saída:** a NeoGuide avisa que a partida acabou e que dá pra tirar o SBI em segurança.
- **Câmeras:** o SBI transmite a luta. Espectadores assistem pelo próprio SBI (a Nina viu a luta do Kim assim) ou pela PowWow.

## Mundo e mercado

- **Quem fabrica:** a Yohualticit ("Yohu"), em 2022. A mesma tecnologia é usada em educação, medicina e pesquisa, o que fez da Yohu a empresa bravariana mais poderosa do mundo.
- **Venda:** no primeiro ano, o LDI vendeu mais que qualquer console da história.
- **Edição limitada:** custa de 60 mil a 70 mil unidades de dinheiro e pode ser personalizada de graça nas lojas da CLI (Corporação Lutas de Ilusão): nome, iluminação e cores.
- **No enredo:** o Ryan dá um SBI de edição limitada pro Kim depois de ver um vídeo dele. Antes disso, o Kim usa o SBI emprestado do Jack.
- **Jogo Lendas:** o SBI do jogador é usado, comprado no feirão do centro. O Immersor range, o óculos tem um risco e um dedo da luva responde atrasado.

## Inconsistências encontradas

1. **Quiz (`src/data/quiz-pt.json`), pergunta 43:** a resposta certa é **"Capacete e gauntlet"**, e "Luva e óculos" aparece como alternativa errada. Contradiz o livro e o glossário. A pergunta 2 também fala em "capacete" ("Sem o capacete, você nem entra na arena").
2. **Livro cap. 06:** "com o SBI ainda **na cabeça**" (Kim) e "o SBI ainda **no rosto**" (Freddy). Bate com os óculos, mas "na cabeça" sugere capacete.
3. **Immersor:** está no glossário, na página Mundo e no Lendas, mas o livro não cita. No livro o Kim se conecta de pé, ali no anexo, sem deitar em nada.

Se o canon for **capacete + luva** (como no teu pedido), precisa corrigir:
- glossário (`docs/LDI/Conhecimento_Otimizado/09_glossary.md`) e `LDI_mechanics.md`;
- página Mundo (`src/data/mundo-{pt,en,es}.json`, item SBI);
- livro cap. 03 ("colocou a luva. Depois os óculos.") nos 3 idiomas;
- jogo Lendas (`src/pages/games/LDI/data/scenes/pt/act1.json` e `act4.json`, o Immersor e o "óculos com risco").

Se o canon for **luva + óculos (+ Immersor)**, corrigir só o quiz (perguntas 2 e 43, nos 3 idiomas).

Os capacetes que aparecem no livro (Thunderbolt, Freddy) são **armadura do avatar dentro do jogo**, não o aparelho.
