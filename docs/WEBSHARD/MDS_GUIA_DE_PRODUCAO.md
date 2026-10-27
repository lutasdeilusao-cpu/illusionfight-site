# O Mundo das Sombras — guia de produção do WEB SHARD

Guia único de produção das páginas do Mundo das Sombras (MDS). O que vale para qualquer WEB SHARD (formato, safe area, entrega, publicação) está no `WEBSHARD_GUIA_DE_PRODUCAO.md`; a história, os capítulos e o elenco estão no `MDS_PLANEJAMENTO.md` (pasta `WEBSHARD/MUNDO DAS SOMBRAS/PRODUCAO/`). Quando os dois divergem em regra de página, vale este guia.

Pasta de trabalho: `BRANDS/Lutas de Ilusão/WEBSHARD/MUNDO DAS SOMBRAS/`.

---

## 1. A regra que manda em todas

**Imagem errada é prompt errado.** O Codex desenha exatamente o que está escrito. Se a página saiu errada, a correção é no texto do prompt (ou na ficha que ele anexa), nunca "tentar de novo" o mesmo prompt.

Consequências diretas:

- **Só o que a câmera vê.** Personagem de costas: o prompt não fala de rosto, olhos, bigode ou expressão (o modelo tenta mostrar e vira a pessoa). Mão em close: não descrever a roupa do corpo que está fora do quadro.
- **Nunca escrever o que não deve aparecer.** A palavra puxa a coisa pra imagem. "Sem chuva" desenha chuva; "a pata que falta" desenha a pata. Descrever em positivo: "rua seca", "três patas: uma da frente, duas de trás".
- **Nenhum bloco genérico.** Regra de dormitório, de escudo, de pele ou de marca entra só na página em que aquilo está no quadro, em uma linha. Prompt longo com regra que não se aplica confunde o modelo.
- **A ficha também é prompt.** Ficha com erro (cachorro de quatro patas, chão molhado, marca visível) espalha o erro pelo capítulo inteiro. Conferir as fichas do capítulo antes de escrever as páginas (§6).
- **Tudo que está no prompt pode virar texto na página.** O modelo já escreveu na arte: o título e o número da página (vindos da linha de abertura), "ALL CAPS" (da instrução de letreiramento), "80px"/"100px" com setas (da margem escrita em números), "MINUS WHITE BOY" (da descrição do personagem). Por isso: nenhuma linha diz título, capítulo ou número de página; a cena (`SCENE`) é descrição em inglês, sem aspas e sem fala; margem é "margem larga dos quatro lados", nunca em pixels; e o cabeçalho das referências avisa que as descrições servem para desenhar e nunca se escrevem.
- **Palavra vaga vira o que o modelo quiser.** "Empty eyes" virou olho de cego; "paper bag with bones" virou ícone de caveira; "MINUS, 13" virou adulto nos closes; "over the still dog" virou cachorro sentado e vivo. Escrever o concreto: "olhos escuros cansados olhando pra baixo", "saco de papel aberto com ossos de carne aparecendo", "um menino de 13 anos, rosto de criança", "deitado de lado no asfalto, imóvel, olhos fechados".

---

## 2. O processo de um capítulo

1. **Roteiro à mão.** O agente principal escreve `scripts/roteiro_wsNN.py` página por página, a partir do capítulo do livro (`src/data/historias/obras/mundo-das-sombras/pt/`). Modelo de fora não escreve roteiro: ele ignora as regras de composição.
2. **Prompts.** `python scripts/v3.py montar NN` → `prompts/v3/NN/NN.txt`.
3. **Storyboard no Gemini (descartável).** `python scripts/v3.py storyboard NN` → `PRODUCAO/storyboard/wsNN/`. Sai o capítulo inteiro em uns 15–20 minutos. Ele não é a arte final: serve para enxergar o que cada prompt produz.
4. **Análise do storyboard.** Antes de chamar algo de erro, comparar com a ficha: se a página bate com a ficha aprovada (ex.: o Iluminado é uma figura humanoide de luz), não é erro, e "corrigir" quebra a continuidade com os capítulos anteriores. `python scripts/v3.py folha NN` e ler as folhas página por página. Todo erro vira correção NO PROMPT (ou na ficha), anotado. Gemini erra anatomia sozinho (braço a mais, mão estranha); erro de composição, de câmera, de quem está no quadro ou de texto é do prompt.
5. **Teste de saída.** Reler cada prompt corrigido imaginando a imagem que vai sair, painel por painel, e conferir:
   - **o painel de baixo continua o de cima** (a ação na ordem certa: o cachorro espera → o pão é rasgado → ele come; nunca a consequência antes da causa);
   - **a página continua a anterior** (quem está onde, de pé ou de joelhos, quem acompanha quem: se o cachorro corre junto, ele aparece na janela junto);
   - **ninguém de corpo inteiro** sem o painel pedir, com o enquadramento escrito em cada painel;
   - **câmera de cinema em todo painel** e diferente da do painel anterior (§3);
   - **para onde cada um olha** e **onde fica cada texto**;
   - **se alguma palavra pede algo que a câmera não vê**.
   Repetir storyboard + teste até não sobrar erro com causa no prompt. Erro que o Gemini comete sozinho (cabeça dupla, texto repetido, palavra sem sentido) não se persegue no prompt: o Codex não repete.
6. **Revisão dos prompts pelo Isaias.** Entregar `prompts/v3/NN/_TODOS_OS_PROMPTS.md` + o storyboard. O Codex não roda antes da liberação dele.
7. **Codex (arte final), só depois da liberação.** `python scripts/v3.py codex NN` põe os prompts na fila; `python scripts/fila_v2.py 300 NN` gera uma página por vez, com 5 minutos entre elas. A troca é página por página: a nova nasce ao lado (`_nova_NN.png`) e só quando ela existe a antiga daquele número vai para `MAIN/NN/_descartadas/`. Nunca tirar as antigas antes das novas chegarem.
8. **Revisão** (folha de contato + recorte ampliado de mão, rosto e texto) e publicação pelo `scripts/publicar_v2.py`.

---

## 3. Câmera

- **Cintura pra cima.** O plano normal é médio, americano, close e detalhe. Corpo inteiro só se o próprio acontecimento depender dos pés no chão (um tropeço, um salto), e mesmo aí a câmera fecha no que importa. O prompt diz o enquadramento em palavras de corpo ("da cintura pra cima", "só cabeça, pescoço e ombros enchem o painel", "da cabeça até os joelhos"); "close" sozinho o modelo abre.
- **Todo painel é cinema, nenhum é "close comum".** "Close-up of MINUS" (câmera na altura do rosto, de frente ou de lado) é câmera de novela e é proibido. Todo painel diz quatro coisas:
  - **altura da câmera**: no chão, na altura do cachorro, da cintura, do olho, do alto de um telhado;
  - **ângulo**: contra-plongée, plongée, holandês, sobre o ombro, ponto de vista de alguém, por trás de quem está de costas;
  - **lente**: grande-angular perto (distorce, dá urgência e ação) ou teleobjetiva longe (achata, espia, isola);
  - **primeiro plano**: algo desfocado entre a câmera e a ação (a orelha do cachorro, revistas penduradas, as grades do portão, o ombro de outro), que dá profundidade.
- **Dois painéis seguidos nunca repetem altura nem lente**, inclusive o último de uma página e o primeiro da seguinte.
- Na ação, a câmera se mexe com o personagem: correndo junto, girando com o movimento, borrão de movimento no fundo.
- **No máximo dois personagens em foco por painel.** Elenco grande nunca entra todo num quadro: cada um ganha o seu painel ou estilhaço.
- **Pouco fundo.** O lugar aparece em pedaços atrás da ação. Plano aberto só quando a página precisa apresentar o lugar, e aí com a ficha do lugar.
- **Ninguém olha para o leitor.** Todo painel diz para onde vão os olhos (outra pessoa, a mão, o cachorro, fora do quadro à esquerda).

---

## 4. Composição

- **No máximo 2 painéis grandes.** Uma página importante pode ter 1 painel só (no máximo 2 splashes por capítulo).
- **Divisão entre painéis = FUMAÇA**, na cor de quem conduz a cena (tabela §7). Nunca neon.
- **O corte é uma cunha e muda de lado a cada página.** A borda de baixo do painel 1 e a borda de cima do painel 2 inclinam para lados opostos: quase se tocam de um lado e abrem do outro, e a fumaça enche a abertura. Uma página abre para a direita, a seguinte para a esquerda. Corte sempre para o mesmo lado deixa a leitura parada. O `v3.py` escreve o corte e alterna o lado sozinho; o roteiro só diz a cor.
- **Estilhaço = caco de vidro quebrado** por cima dos painéis: triangular, borda rachada, brilho de vidro, de 15 a 30% da largura da página. É o recurso narrativo mais forte do MDS. Cada estilhaço tem uma função escrita no prompt:
  - **tempo**: o instante seguinte ou anterior da mesma ação (a mão que estica / a mão que alcança);
  - **reação**: o rosto de quem vê o que o painel mostra;
  - **causa e consequência**: o que provocou / o que ficou (a garra / o cachorro caído);
  - **olhar**: o que o personagem está olhando, no lugar onde ele olha;
  - **detalhe que conta**: objeto, marca, mão, olho.
- O estilhaço pode ficar no centro, cruzar a fumaça e ser o foco da página. Escrever posição (canto, por cima de qual painel, cruzando a divisão), o que tem dentro e a função. Expressão e detalhe vão em estilhaço, não em painel grande.
- Estilhaço nunca cobre o rosto principal nem um texto.

---

## 5. Texto

- **O livro não é legenda.** O texto do livro é a fonte da cena, não a lista de caixas. Uma página tem em geral de 0 a 3 textos; o que a imagem já conta sai do texto.
- **Pelo menos 3 páginas de silêncio** por capítulo.
- **Narração sem caixa:** letras brancas flutuando numa nuvem pequena de fumaça da cor do narrador, num canto escuro do painel, nunca sobre rosto ou ação.
- **Fala:** balão branco, letra e contorno grosso na cor do personagem (tabela §7). Uma fonte só no quadrinho inteiro, caixa alta, grande.
- **Tela de fumaça da Falha/Nefeli:** letras prateadas no ar, nunca balão. **Voz do Iluminado:** dourada, itálico, sem balão. **Sussurro das sombras:** vermelho-escuro irregular na borda do painel.
- Lista fechada: o prompt manda escrever só os textos listados, cada um uma vez, com acento.
- **Todo texto diz onde fica** quando a página tem mais de um painel (`panel 1`, `panel 2`, `the glass shard`, "no alto do painel"). Sem isso, o texto sai duplicado ou no painel errado.
- **Balão aponta para quem fala**, e quando dois personagens parecidos falam na mesma página, o balão diz qual ("o homem de terno", "o homem de moletom").

---

## 6. Continuidade e fichas

- Fichas em `FICHAS/sheets_codex_arkham/` (estilo Arkham Codex). Ficha refeita: a antiga vai pra `FICHAS/_descartadas/`.
- A ficha define aparência. A pose, o fundo e a luz da ficha não valem; a luz da página vem da linha `LIGHT` do prompt.
- **Conferir as fichas do capítulo antes das páginas**: contar patas, olhar mãos, ombro, clima do ambiente.
- **Anatomia fora do padrão (cachorro de três patas) o Codex não desenha**, nem com descrição em positivo nem editando: volta sempre com quatro. A ficha do Sombra foi feita editando no Gemini (que acerta a mudança pontual) e montando só as vistas certas. Ficha com algo fora do padrão: gerar, conferir contando, e se o Codex insistir, editar no Gemini.
- Máximo de 5 referências por página, e só do que está no quadro. Página anterior entra só se for a mesma cena (outra cena traz outro lugar e outra luz junto).

| Continuidade | Regra |
|---|---|
| Minus | Branco, pele clara, em todas as idades. |
| Marca do Minus | Espiritual: não aparece na pele. Só quando a página diz que ela acende: luz atravessando a camiseta no ombro esquerdo. |
| Cicatrizes do Minus (13 anos) | Linhas finas e claras nos antebraços, como pequenas espirais. |
| Sombra (cachorro) | Três patas (uma da frente, duas de trás), orelha esquerda rasgada, sem coleira. |
| Luna | Marca no ombro direito. |
| Falha / Nefeli | Só o Minus vê. Move-se de costas, sempre virada para ele. |
| Clima | Sem chuva, a não ser que o roteiro peça. O chão é seco; cada página diz sua luz. |
| Minus (13 anos) | Nos closes, sempre "menino de 13 anos, rosto de criança, pequeno e magro"; sem isso o rosto vira adulto. |
| Posição na cena | O que o personagem fazia na página anterior continua (ajoelhado no asfalto do 48 ao 55). Escrever em cada painel. |
| Iluminado | Figura humanoide de luz branca e dourada com contorno de chama, como na ficha. Não "corrigir" para outra forma. |

- **Antes de corrigir um elemento, comparar com a ficha.** Se a página bate com a ficha aprovada, não é erro, e mudar quebra a continuidade com os capítulos anteriores.

---

## 7. Cores

| Quem | Fumaça (divisão e narração) | Fala |
|---|---|---|
| Minus | azul elétrico `#2E8BFF` | azul `#1F6FD1` |
| Falha / Nefeli | prata `#C9D1DE` | (tela de fumaça) |
| Luna | rosa `#E85D9A` | rosa `#C2185B` |
| Terceira pessoa | branco `#E8ECEF` | — |
| Seu Jorge | — | verde-oliva `#5B6B2F` |
| Homens possuídos | — | cinza `#555555`, balão de contorno duplo |

Demais vozes: tabela `VOZ` de `scripts/montar_prompts.py`. Personagem novo com fala ganha cor antes da página.

| Mundo | Paleta |
|---|---|
| Memória boa | dourado quente, luz de tarde |
| Mundo real | frio, azul-acinzentado; poste amarelo à noite |
| Shadow World | sépia doentia, roxo, verde fosforescente, vermelho-carne; chão de carne |

---

## 8. Estilo

**Arkham Codex**: a arte de *Batman: Arkham City* (sem nada da marca), realismo estilizado e sujo, sombras fundas, luz de recorte forte, paleta dessaturada, acabamento pintado de quadrinho com contorno. Feito no Codex; o Gemini só faz o storyboard.

---

## 9. O prompt de uma página

Montado pelo `v3.py` a partir do roteiro. Formato:

```text
OUT: MAIN/03/PT/NN.png
REFS: <só o que aparece na página, máx. 5>
SCENE: <a batida em uma frase, em inglês, sem aspas>
REFERENCES (attached, by file name; they define appearance only; these descriptions guide the drawing and are never written on the page):
- MDS_Minus_13.png: <quem é, em uma linha, só o visível>
STYLE: <Arkham Codex>
LIGHT: <a luz desta página>
PAGE FORMAT: <página vertical, margem larga dos quatro lados> + FRAMING: <da cintura pra cima>

PANEL 1: <altura da câmera + ângulo + lente + primeiro plano: o que se vê, enquadramento do corpo, para onde olham>
DIVISION BETWEEN THE PANELS: <cunha em lados opostos, cor da fumaça; o v3.py escreve e alterna>
PANEL 2: ...
GLASS SHARD: <posição + câmera + conteúdo>

LETTERING: <lista fechada>
- <cada texto, com o tipo, a cor e o painel onde fica>
```

No roteiro (`scripts/roteiro_wsNN.py`), cada página traz: `batida`, `elenco` (quem aparece; puxa a ficha e a descrição), `lugar`, `luz`, `paineis` (1 ou 2), `divisao` (só a cor da fumaça), `estilhacos`, `textos` como `(tipo, quem, texto, onde)` e `continua=False` quando a página anterior é de outra cena.

Cada linha do roteiro passa pelo teste do §1: a câmera vê isso? Essa palavra puxa algo que não deveria aparecer?
