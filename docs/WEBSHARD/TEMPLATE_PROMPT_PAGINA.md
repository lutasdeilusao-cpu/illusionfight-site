# Template de prompt de página do WEB SHARD

Cada bloco atende a mandamentos de [MANDAMENTOS_WEBSHARD.md](MANDAMENTOS_WEBSHARD.md), indicados por `[M#]`.

**Como usar:**
- As linhas que começam com `>>` são instrução para quem preenche. Elas saem antes de enviar, porque tudo que está escrito, a IA desenha [M17].
- O que está entre `{chaves}` é preenchido.
- O resto vai como está.

---

## O prompt

```
>> [M1] Abertura fixa. É o único número de pixels do prompt.
Criar UMA página de quadrinho vertical e alta, no tamanho 960×1637.

>> [M2] Arte até as beiras. Nunca escrever "margem", "área livre", "longe das bordas".
A pintura vai até as quatro beiras da imagem, de ponta a ponta.

PLANO DE CÂMERA
>> [M7] [M8] Escrito primeiro. Um enquadramento por painel, pelo que acontece na página.
>> Conferir com a página anterior e a seguinte: o 1º painel desta e o último da anterior são diferentes, e a direção do corte também [M6].
Corte: diagonal que {sobe/desce} da {esquerda/direita} para a {direita/esquerda}.
Painel 1: {enquadramento}.
Painel 2: {enquadramento}.
Painel 3: {enquadramento}.   >> opcional
Estilhaços: {quantos} — {funções}.

REFERÊNCIAS
>> [M24] Uma linha por anexo, numerada na ordem em que foi anexado, com a função dele (rosto, roupa, cenário, fonte, arma). Os painéis citam a ref pelo número.
Ref 1 = {arquivo.png}: {o que essa ficha governa nesta página}.
Ref 2 = {arquivo.png}: {função}.

ESTILO
{estilo da obra, igual em todas as páginas}

PERSONAGENS
>> Só quem aparece. Aparência vem da ficha.
>> [M19] Quem está de costas em TODOS os painéis: escrever só nuca, costas, roupa vista por trás. Nada de rosto, olho, boca, expressão ou detalhe da frente.
>> [M18] Tudo em positivo: "rua seca", "três patas", nunca "sem chuva".
{Nome}: {aparência curta}. {Regra fixa do personagem, ex.: boca reta.} Cor: {cor da voz e da borda dele}.

LUGAR E GEOGRAFIA
>> [M20] Geografia fixa da cena, a mesma em toda página dela.
Kim à {ESQUERDA/DIREITA} da imagem, {Nome} à {ESQUERDA/DIREITA} da imagem.
Lugar: {o lugar} da ficha {FichaDoCenario}.
>> [M20] Só essa linha: sem chão, céu, horizonte ou mureta. O cenário não volta a ser citado em painel nem estilhaço; a IA monta o fundo pelo ângulo da câmera.

COMPOSIÇÃO
>> [M3] 1 a 3 painéis. Painel único só em pausa dramática ou glitch. Ação nunca é painel único.
>> [M6] Corte diagonal, direção diferente da página anterior.
>> [M5] Borda colorida no estilo da obra (LDI = neon, MDS = fumaça). Cor = quem domina o painel.
{N} painéis separados por cortes diagonais {direção}.
Entre o painel 1 e o painel 2: {borda da obra: linha de neon, fumaça...} {cor de quem domina o painel 1}.
{Entre o painel 2 e o painel 3: {borda da obra} {cor de quem domina o painel 2}.}
A leitura desce e, na mesma altura, vai da esquerda para a direita. [M14]

PAINEL 1 — {quem domina}
>> [M7] O mesmo enquadramento do PLANO DE CÂMERA.
>> [M22] A câmera tem que fechar com a imagem: lado do ombro, quem fica na frente, para onde se olha.
>> [M9] Corpo inteiro só com ação ou presença, em diagonal ou câmera baixa/alta.
Câmera: {enquadramento}, {altura}, {lente}, {de que lado da cena}.
{Ação: quem faz o quê, em que lado da imagem.}
>> [M21] Todo olhar com lado.
{Nome} olha {alvo}, {dentro do quadro à esquerda / fora do quadro à direita da imagem}.
>> [M23] Ninguém olha para a lente. Se o texto fala "você", a pessoa olha acima e ao lado do ponto de vista.

PAINEL 2 — {quem domina}
Câmera: {enquadramento diferente do painel 1}.
{Ação e olhares, como no painel 1.}

PAINEL 3 — {quem domina}   >> opcional
Câmera: {enquadramento diferente do painel 2}.
{Ação e olhares.}

ESTILHAÇOS
>> [M4] De 1 a 5; a mesma quantidade nunca em 3 páginas seguidas.
>> Lugar = (alto/meio/baixo) + (à esquerda/no centro/à direita). Lugares diferentes entre si e diferentes dos da página anterior. Pode cair em qualquer parte da página.
>> O estilhaço mostra algo que nenhum painel mostra. O que ele acrescenta à história fica no _estilhacos.json, nunca no prompt: frase de explicação vira caixa de narração.
Estilhaços irregulares, inclinados, com sombra e contorno fino de neon, espalhados pela página, cada um no lugar indicado, deixando rostos, mãos e textos à mostra:
>> [M20] Estilhaço inteiro dentro de um painel, nunca em cima do corte. Arma: dizer a ficha onde ela está e um estado simples ("desembainhada, na mão direita, pelo cabo"), nunca peça por peça.
- Estilhaço 1, {no alto/no meio/embaixo} {à esquerda/no centro/à direita}, inteiro dentro do painel {N}, contorno {cor}: {o que mostra}. Função: {tempo/reação/causa/consequência/olhar/detalhe}.

TEXTOS
>> [M11] Fonte única da obra, pela ficha de letreiro.
>> [M12] Fundo branco; borda e letra na cor de quem fala; palavras de destaque marcadas.
>> [M13] Balão grande, legível no celular sem zoom.
>> [M14] Pergunta à esquerda, resposta à direita. Balões alternando entre painéis criam zigue-zague.
>> [M15] Quem fala pode estar fora do quadro: a cauda sai pela borda do lado dele.
>> [M16] Onomatopeia sempre que a cena tiver som.
>> [M27] Fala inteira entre aspas, exatamente como sai, com acento e pontuação. Nome incomum soletrado na 1ª vez ("DIX, D-I-X"). Página com muito texto ou letra pequena: qualidade média ou alta.
Todas as falas na fonte de {arquivo do letreiro}. Balão de fundo branco, borda e letra na cor de quem fala, tamanho grande. Somente estes textos, cada um uma vez:
- Painel {N}, {lado}, {Nome} ({cor}): "{FALA COM *DESTAQUE*}"
- Painel {N}, {lado}, {Nome} fora do quadro à {lado}, cauda pela borda {lado} ({cor}): "{FALA}"
- Painel {N}, onomatopeia {grande/pequena}, {cor}: "{SOM}"
```

---

## Prompt de correção [M25] [M26]

Uma mudança por correção. Mais de uma: corrigir uma, conferir e mandar o resultado como nova entrada para a próxima.

```
>> A página a corrigir é a Ref 1; as fichas seguem numeradas depois dela [M24].
Ref 1 = {página a corrigir}. Ref 2 = {ficha}: {função}.
Altere só isto na Ref 1: {a única mudança, em positivo}.
Fica igual: personagens, poses, câmera, luz, cores, balões e textos, {os outros painéis e estilhaços}.
```

---

## Conferência antes de enviar [M17]

Leia o prompt pronto do começo ao fim, como se fosse a IA:

- [ ] Só um número de pixels, o 960×1637 [M1]
- [ ] Nenhuma palavra de margem ou borda branca [M2]
- [ ] De 1 a 3 painéis, e ação sem painel único [M3]
- [ ] De 1 a 5 estilhaços, em lugares novos, cada um com função, sem "Conta:" [M4]
- [ ] Cor de cada borda é a de quem domina o painel [M5]
- [ ] Direção do corte diferente da página anterior [M6]
- [ ] Plano de câmera no topo, igual aos painéis, sem repetir o vizinho [M7] [M8]
- [ ] Corpo inteiro só com ação [M9]
- [ ] Poucos personagens por painel, fundo enxuto [M10]
- [ ] Fonte, balão branco, cor de quem fala e destaque [M11] [M12]
- [ ] Balões grandes [M13]
- [ ] Ordem de leitura da esquerda para a direita e descendo [M14]
- [ ] Fala de fora do quadro com cauda pela borda certa [M15]
- [ ] Onomatopeia presente, se a cena tem som [M16]
- [ ] Nenhuma negação ("sem", "não", "nunca") [M18]
- [ ] Nenhum detalhe de frente em quem está de costas [M19]
- [ ] Esquerda e direita iguais às das outras páginas da cena [M20]
- [ ] Todo olhar com lado [M21]
- [ ] Câmera fecha com a imagem [M22]
- [ ] Ninguém olhando para a lente [M23]
- [ ] Toda ref numerada com função [M24]
- [ ] Correção: "altere só" + lista do que fica, uma mudança só [M25] [M26]
- [ ] Falas entre aspas, exatas; nome incomum soletrado; qualidade média/alta se tem muito texto [M27]
