# Heróis da Cidade — guia de produção

Heróis da Cidade (HDC) é a tirinha de comédia do universo Illusion Fight. Ela usa o formato WEB SHARD (página vertical para o celular), mas tem regras próprias de tom, desenho e piada. Para o que for igual ao LDI (entrega, pastas, publicação), vale o `WEBSHARD_GUIA_DE_PRODUCAO.md`.

Autor: Isaias Leal. Origem: uma campanha de RPG de comédia, criada para relaxar entre campanhas pesadas. Os jogadores criaram os heróis: Rafael (Mega Playboy), Dedé (Mega Genius), Arthur (Mega Metal).

## 1. A regra de ouro da piada

**Os heróis se levam muito a sério. O mundo em volta não liga.**

O herói nunca sabe que está numa comédia. Ele fala como se estivesse num filme épico, e o mundo responde como uma fila de banco: entediado, prático, sem se impressionar. A graça está no contraste, nunca numa frase que tenta ser engraçada.

- **Uma piada por episódio, não uma por balão.** O episódio inteiro prepara a piada. As páginas do meio só precisam ser verdadeiras e um pouco absurdas.
- **Ninguém explica a piada.** Se o personagem diz "que ironia!", a piada morreu.
- **Fala curta e seca.** Se dá para cortar uma palavra, corta.
- **A página parada.** Antes do golpe final, uma página quase ou totalmente sem texto: o herói em silêncio, o mundo olhando. No WEB SHARD, a rolagem faz o papel da pausa do stand-up.
- **O golpe final é um detalhe**, não um grito. Exemplo: "O DE SEMPRE." revela que o Mega Metal vai à roda de samba toda semana.

Teste antes de gerar: lendo só os balões, alguém sente que o roteiro está "tentando fazer rir"? Se sim, corta.

## 2. Tamanho do episódio

- **De 6 a 8 páginas de história**, além das páginas fixas (aviso, divulgação, divulgação, créditos). Total típico: 10 a 12 páginas.
- Se a piada aguenta 4 páginas, não estica para 8.
- Ordem fixa: Aviso → Divulgação → história → Divulgação → Créditos.

## 3. Menos informação por página

- **1 painel grande + no máximo 2 recortes pequenos.** Nunca uma grade cheia.
- **No máximo 2 balões por página**, salvo diálogo de ida e volta (3, no limite).
- **Pelo menos uma página sem texto** por episódio (a página parada).
- O leitor tem que entender a página inteira em 2 segundos de rolagem.

## 4. Desenho

- **Estilo:** Cartoon Network anos 90 (Johnny Bravo, A Vaca e o Frango, Eu Sou o Máximo). Traço preto grosso, cores chapadas, sombra mínima, proporções exageradas, cenário simples.
- **Nunca:** realista, mangá, 3D, sombrio, neon (neon é do LDI).
- **Página:** 960 × 1637 px, fundo bege-claro liso fora dos painéis.
- **Painéis:** sempre inclinados na diagonal (8–12°), com bordas finas, pretas, tortinhas, desenhadas à mão. Nenhuma borda reta.
- **Ângulo:** cada painel declara o seu ângulo, e nenhum ângulo se repete no episódio. Variar escala: plano geral com o personagem pequeno, close extremo.
- Recortes nunca cobrem rosto nem balão.

## 5. Balões

- Fundo branco puro. Contorno e texto na cor de quem fala.
- Fonte comic bold, CAIXA ALTA, grande. A piada está na fala: legibilidade é prioridade.
- **Fala:** oval, cauda reta. **Pensamento:** nuvem, cauda de bolinhas. **Grito:** bordas pontiagudas.
- **Ênfase:** uma palavra por balão, bem maior.
- **Narração:** caixa amarela com contorno e texto pretos.

| Personagem | Cor do balão |
|---|---|
| Mega Playboy / Lester | vermelho `#D62828` |
| Mega Metal / Cabelo | roxo `#5B2A86` |
| Mega Genius / Nerdo | verde (definir o tom; no episódio antigo saiu verde) |
| Mega Bandido | cinza-chumbo `#4A4A4A` |
| Figurantes (ex.: tiozinho do bar) | marrom `#8B5A2B` |

## 6. Personagens

Fichas em `WEBSHARD/HeroisDaCidade/Personagens/`. A ficha sempre manda na aparência; a pose da ficha é ignorada.

| Herói | Identidade secreta | O segredo que é a piada |
|---|---|---|
| **Mega Playboy** (`MegaPlayboySheet.png`) | **Lester** (`LesterSheet.png`) | Se diz milionário. É pobre, muito pobre. |
| **Mega Genius** (`MegaGeniusSheet.png`) | **Nerdo** (`NerdoSheet.png`) | É um gênio, mas não pensa sozinho: pergunta tudo ao Chat PTG. |
| **Mega Metal** (`MegaMetalSheet.png`) | **Cabelo** (`CabeloPagodeiroSheet.png`) | Metaleiro de cara fechada. Ama pagode e samba e morre de vergonha. O cavanhaque é o "uniforme": sem ele, ninguém o reconhece. |

- **Mega Bandido** (`MegaBandidoSheet.png`): o maior ladrão do universo, nunca é pego. Aparece em **todas** as páginas, pequeno, num canto, roubando alguma coisa. Ninguém percebe. Ele é o easter egg, nunca a piada principal.
- **O Golpista** (`OGolpistaSheet.png`): vilão de terno, máscara e maleta de dinheiro. Aplica golpes de "promoção".
- **Chat PTG:** a IA do mundo do HDC. Nunca usar o nome ou o logo de uma IA real.

## 7. Produção com IA

1. **Roteiro primeiro.** Tabela com página, cena e texto exato. O Isaias aprova o texto antes de gerar.
2. **Gerar com o Nano Banana 2** (`gemini-3.1-flash-image`, chave `GEMINI_API_KEY_PANORAMA`): o estilo cartoon sai bem nele. Script: `LAB-NVIDIA/hdc.py` (função `gerar`); exemplo de episódio inteiro em `LAB-NVIDIA/hdc_ep01.py`.
3. **Referências por nome de arquivo**, nunca pela ordem: as fichas dos personagens da página + uma página aprovada como `ESTILO_PAGINA.png`. Máximo de 5 imagens.
4. **Conferir cada página:** texto exato, letras legíveis, personagem igual à ficha, nada inventado (balão, palavra, onomatopeia), Mega Bandido presente.
5. **Página errada não se apaga:** vai para `HeroisDaCidade/_descartadas/`.

Prompt de personagem novo (ficha): 2048 × 1152 px, 4 vistas (frente, 3/4, perfil direito, costas), corpo inteiro, fundo neutro, sem texto. Para variar uma ficha existente: "mesmo personagem de `X.png`, com UMA única diferença".

## 8. Páginas fixas

- **Aviso:** "TOME MUITO CUIDADO! ISTO AQUI É MUITO ENGRAÇADO, VOCÊ PODE PASSAR MAL. POR FAVOR, LEIA COM MODERAÇÃO." O Mega Bandido rouba o "O" de "AVISO".
- **Divulgação:** "HERÓIS DA CIDADE — TRÊS IDIOTAS. UMA CIDADE. MUITA CONFUSÃO.", ILLUSIONFIGHT.COM em destaque, placa "LUTAS DE ILUSÃO", 6 cards do portal. O Mega Bandido rouba o controle do card GAMES. O HDC sempre chama para o LDI, que é o foco do projeto.
- **Créditos:** palco de fim de show. "CRÉDITOS POR ISAIAS LEAL", "HISTÓRIA, DIREÇÃO E DESIGN: ISAIAS LEAL", "ARTE GERADA COM AJUDA DE IA". O Mega Bandido foge com o troféu.

## 9. Episódios

| Nº | Título | Herói | A piada |
|---|---|---|---|
| 01 | O Pagode Proibido | Mega Metal | O metaleiro épico do topo do prédio vira o Cabelo pagodeiro na roda de samba, e a cidade nem percebe que o herói sumiu. |

Os dois episódios antigos (o Mega Playboy no ônibus e o Mega Genius com o Chat PTG) estão em `HeroisDaCidade/_descartadas/` e podem ser refeitos neste formato.
