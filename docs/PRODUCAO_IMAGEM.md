# PRODUÇÃO DE IMAGEM — guia do agente

Formato: regras curtas, imperativas. Ler a seção GERAL + a seção do produto antes de gerar qualquer imagem.
Guias longos por produto (detalhe, não repetir aqui): `docs/WEBSHARD/WEBSHARD_GUIA_DE_PRODUCAO.md`, `docs/WEBSHARD/HDC_GUIA_DE_PRODUCAO.md`, `../WEBSHARD/MAR DE CINZAS/MDC_GUIA_DE_PRODUCAO.md`, `../WEBSHARD/MUNDO DAS SOMBRAS/MDS_PLANEJAMENTO.md`.
Repositório é público: aqui só NOME de chave, nunca valor. Chaves em `SiteLDI/.env.local`, lidas por `LAB-NVIDIA/chaves.py` (`chaves.k('NOME')`).

---

## 0. FERRAMENTAS (qual usar)

| Uso | Ferramenta | Notas |
|---|---|---|
| Arte de qualidade (WEB SHARD, fichas, retratos, mapas) | **Codex** `codex exec --skip-git-repo-check -m gpt-5.6-terra --sandbox workspace-write -c model_reasoning_effort="low" -i <ref>... -` (prompt via stdin) | Melhor qualidade e acerta mais (Isaias: "muito superior ao Gemini"). Erro quase sempre = prompt. ~2 min/imagem (~6 min com pausa de fila). Tamanhos: 1024×1024, 1536×1024, 1024×1536. Faz fundo transparente. `-m` sempre na chamada (o config padrão aponta modelo recusado). |
| Arte rápida / cartoon / tradução de página / quadros do Lendas | **Nano Banana 2** `gemini-3.1-flash-image`, chave `GEMINI_API_KEY_PANORAMA` (única com cota de imagem) | `imageConfig.imageSize "2K"` + `aspectRatio`. Bom em texto de balão. Erra anatomia (braço extra) e continuidade de lugar. |
| Texto braçal (nomes, descrições, transcrição, rascunho de tradução) | NVIDIA `moonshotai/kimi-k3` → Gemini `gemini-3-flash-preview` (3 contas `_LDI/_GAMEDEV/_EMAIL2`) → DeepSeek `deepseek-v4-pro`/`deepseek-flash` (pago, `max_tokens` alto) | Sempre rascunho: o agente revisa gíria, palavrão, quem fala. |
| NÃO usar | FLUX/Kontext NVIDIA, Pollinations | Só exemplo / filtro barra briga. |

**Cota do Codex (plano Plus):** janela de 24 h. Ao estourar, o log traz `usage_limit_reached` com `resets_in_seconds`. Rodar fila em rodadas agendadas (tarefa do Windows), que param na cota e continuam de onde pararam.

---

## 1. GERAL — regras que valem pra tudo

### Referências
- Todas as fichas e cenários moram em `BRANDS/Lutas de Ilusão/Personagens/`, um arquivo de cada: pasta por personagem com as fichas oficiais na raiz (`Kim/KimExpressionSheet.png`), `Inimigos/<Nome>/`, `Secundarios/`, `Trio/`, `Cenarios/`, `Objetos/`, `Estilo/`. Ficha nova vai direto pra pasta do dono, com nome descritivo; nunca deixar ficha só dentro da pasta de produção de um capítulo. Estrutura completa no `docs/WEBSHARD/WEBSHARD_GUIA_DE_PRODUCAO.md` §13.1.
- Anexar sempre com `-i` (Codex) ou inline (Gemini) e citar **pelo nome do arquivo** no texto. Nunca "imagem 1", nunca link (o modelo finge que abriu).
- Ficha manda na APARÊNCIA; mandar ignorar pose, fundo e texto da ficha. Máx. ~5 refs por imagem.
- Ficha nasce antes da página. Estado duradouro (ferimento, idade, forma) = ficha própria. Lado de marca/ferida escrito como "lado ESQUERDO DELE".

### Continuidade
- Cena com lugar fixo → **ficha de continuidade** (planta de cima + vista da porta, posição de cada coisa) + regra escrita da geografia em TODO prompt daquele lugar.
- Grupos recorrentes (sombras, crianças, bando) → ficha "todos lado a lado" pra manter quem é quem.
- **Evitar plano aberto**: só mostrar o lugar inteiro quando o painel pede plano geral (e aí com a ficha de continuidade). No resto, a câmera fica na emoção/ação, fundo em fragmentos → menos chance de erro.
- Fragmento NÃO pode fechar o espaço: nunca enquadrar uma cama/pessoa entre 2–3 paredes ou canto de teto se o lugar é grande (vira "quarto de uma cama só"). Dizer que o lugar continua e some no escuro.
- Passar a **página/quadro anterior** como referência ("continue dele: mesmos rostos, roupa, luz; não copie quadros nem texto").
- 2ª arte de uma mesma cena: usar o 1º quadro da cena como ref. Bug real (Lendas): 26 artes "b" saíram com LOCATION de outra cena; checar `LOCATION` de cada prompt contra o texto da cena.

### Anatomia / erros recorrentes
- Gemini cria 3º braço / braço saindo do cotovelo, sobretudo em gesto com mão. Prompt: "EXACTLY two arms… one elbow and one hand each… no extra arms, no floating hands; keep arms simple and fully visible". Preferir pose simples.
- Gerar **3 variantes em paralelo** do quadro difícil e escolher olhando o **recorte ampliado** (miniatura esconde braço extra).
- Estampa de folha tropical pode virar folha de maconha → "PALM and BANANA leaves only".
- Nunca pessoa real, banda real, marca real, logo de IA real. Paródia com nome inventado (ex.: grupo de pagode "Só Pra Atrapalhar").
- Ninguém olha pro leitor (regra suprema nos WEB SHARDs e no Lendas).

### Texto na imagem
- Lista fechada: "Write ONLY the texts listed, each exactly once… No other text." Palavra de ênfase: "EMPHASIS on X" (nunca asterisco).
- Acentos explícitos no prompt (Á É Ê Í Ó Ú Ã Õ Ç). Nunca hifenizar.

### Fundo transparente no Gemini
- O Gemini não devolve alpha (sai JPEG; "transparent background" vira xadrez pintado). Para PNG com alpha 0 de verdade: gerar em fundo BRANCO liso, pedir a mesma imagem trocando só o fundo por PRETO liso, e calcular alpha = 1 − (branco − preto). Pedir "pure solid flat white/black, no checkerboard". Usado nos sprites de veículo do Gangues (`assets/veiculos/`).

### Várias saídas numa chamada (economia de cota)
- **Página dupla**: 1 imagem 1536×1024 com 2 páginas consecutivas lado a lado (calha preta fina), "LEFT HALF = página N / RIGHT HALF = N+1", recortar ao meio → 2 páginas 768×1024. Metade das chamadas e continuidade melhor (nascem juntas). Testado no MDS cap.1 p.22–23: excelente.
- Webtoon Canvas aceita 800 px de largura por pedaço → 768 de largura é aceitável.
- Mesma ideia pra fichas (2 por imagem), retratos (grade), blocos de mapa.

### Fila
- Formato de prompt: linha 1 `OUT: <arquivo>`, linha 2 `REFS: <arquivos>`, resto = prompt.
- Fila numerada na ordem de dependência; só roda um prompt quando todas as REFS existem; pula o que já existe; refazer = apagar o arquivo e rodar de novo.
- Prefixo de economia no Codex: "ECONOMY MODE: do not inspect files or run commands… Generate ONCE… Reply only: ok."
- **Páginas narrativas:** uma imagem por vez + pausa de 5 min em vez de rajada. **Fichas e materiais de referência:** sem intervalo obrigatório entre gerações; seguir direto para o próximo material (esclarecimento de Isaías, 19/10/2026). Trava (lock) contra rodada dupla em filas automáticas. Log em arquivo.
- **Nunca deixar serviço órfão rodando**: ao trocar de fila, parar a anterior (processo + tarefa agendada + cron da sessão). Conferir com lista de processos e `schtasks /query`.

### Revisão e entrega
- Revisar SEMPRE antes de publicar: montagem lado a lado (folha de contato) pra visão geral + recorte ampliado onde tem mão/rosto/texto.
- Isaias revisa pelo celular: mandar a imagem (SendUserFile) ou a folha de contato.
- Descartada não se apaga: `_descartadas/` ou sufixo `_descartada`.
- Publicar = WebP no tamanho final, entrada no JSON do catálogo, versão + build + deploy + conferir no ar.

---

## 2. WEB SHARD (comum)
- **Direção LDI de Isaias, 23/10/2026:** ação/emoção em primeiro plano; pouco background, preferência por plano americano, médio, close e detalhe, evitando corpo inteiro. Ângulo cinematográfico é posição real da lente, não só inclinar a borda. Cotidiano/humor = comic expressivo; ação/emoção séria = mudança drástica para semirrealista quase realista. Não trocar identidade/roupa/ferida ao mudar o acabamento.
- **Arena LDI:** usar `Personagens/Cenarios/ArenaLDI_Arquibancada.png` e `ArenaLDI.png` da mesma pasta. Combate enquadrado contra CHÃO e PAREDE, sem plateia no mesmo quadro e sem diminuir a amplitude do lugar. Plateia só em estilhaços sobrepostos de reação ou panorâmica EXCLUSIVA dela, sem a ação na área de luta.
- **Sala/SBI LDI:** sala e posições fixas em `Personagens/Cenarios/EliteSchool_SalaDoTrio.png` + `EliteSchool_SalaDoTrio_VistaDeCima.png`, sempre juntas; óculos escolares de RA em `Personagens/Objetos/Oculos_SalaDeAula.png`; visor/luvas de simulação em `Personagens/Objetos/SBISheet.png`. Não confundir os aparelhos nem inventar outra planta para acomodar o trio.
- **Ficha de ambiente recorrente:** planta baixa completa à ESQUERDA; à DIREITA dois painéis empilhados, com dois ângulos do MESMO ambiente. Sem personagens. Posições idênticas na planta e nas duas vistas. Reutilizar referências oficiais suficientes; criar o que falta para continuidade.
- Página 960×1637 (≈1:1,705), safe area 100 px lados / 80 px topo-base. Ficha 2048×1152, sem texto: personagem principal com três colunas de corpo inteiro (frente, costas, perfil) e expressões na quarta coluna ou numa faixa inferior; genéricos recorrentes juntos numa folha coletiva, com identidades distintas reutilizáveis (Isaías, 19/10/2026). Página dupla do Codex: 768×1024 cada.
- Máx. 2 painéis grandes + estilhaços, cortes diagonais 8–15°, 4 painéis nunca. Pouco texto, letra grande.
- Página de AÇÃO (briga, perseguição, tiro, batida) = 2 painéis em diagonal + 2 a 4 estilhaços que quebram o movimento em tempos (preparo, impacto, reação, destroço), com linha de velocidade. Painel único só pra pausa dramática (splash de chegada, gancho). Isaias, 20/10/2026: "cena de ação deveria ter muito estilhaço e muito painel aproveitando pra mostrar movimento".
- Objeto que já sumiu da história (ex.: o bolo comido no Diabo Vermelho) não entra como referência: a ficha dele faz o modelo desenhar o objeto de volta.
- **Estilhaços SOBREPOSTOS** (direção de Isaias, 23/10/2026): sobreposição é a relação espacial com os painéis, não uma hierarquia de importância. Podem concentrar a ação, o impacto, a emoção ou a informação decisiva e ter o maior destaque da página. Podem ocupar o centro e cruzar emendas. Escrever formato, posição, conteúdo e ordem de leitura; não restringir a cantos ou a detalhes menores. Continuam fragmentos sobrepostos, não faixas extras de uma grade. Se a página saiu só com painéis, corrigir a descrição da sobreposição.
- **Correção de página pronta** (Isaias aponta o erro):
  - Página feita no Codex se corrige no Codex. Nunca editar com o Gemini: ele muda o traço, perde nitidez e "apaga" fundo com borrão.
  - Mudou a composição (tirar gente, cenário, armário; trocar pose) → refazer a página INTEIRA: achar o prompt dela (`prompts_pag*/NNN_pagina.txt`), reescrever a descrição do painel e os textos, gerar de novo com as mesmas fichas + página anterior. Tirar da lista de refs a ficha que puxa o que tem que sumir (ex.: ficha do corredor puxa armário).
  - Só texto (balão ou caixa de narração) → também no Codex: passar a própria página com `-i` e pedir pra mudar só aquele texto. Nunca desenhar letra à mão (PIL): a fonte não bate com a do Codex.
  - Codex sem cota → não trocar de ferramenta: anotar em `PENDENTES_CODEX.md` na pasta do título e rodar quando a cota voltar.
  - Antes de começar, dizer ao Isaias qual ferramenta vai usar.
- Publicação: `public/webtoon/<pasta>/<idioma>/NN.webp`; catálogo `src/data/*-episodios.json` + `webshard-titulos.json` + `src/lib/webshard/catalogo.js`. Versões do mesmo capítulo: `versoes` (`<pasta>/<versao>/pt`).
- Tradução: Nano Banana 2 primeiro (`LAB-NVIDIA/traduz_gemini.py <cap> <EN|ES> <prompts> NN…`, mesmo tamanho do PT), Codex reserva. Adaptar gíria antes; DIX nunca se traduz; ES neutro latino (tuteo). Detalhe e glossário no guia WEB SHARD §10/§17/§26.

## 3. MUNDO DAS SOMBRAS (MDS) — estilo ARKHAM CODEX
- Pasta: `WEBSHARD/MUNDO DAS SOMBRAS/`. Estilo oficial (decisão do Isaias): **Arkham Codex** = estilo da arte de Batman: Arkham City, feito no Codex, sem nada da marca.
- Scripts: `scripts/v2.py` monta a fila do Codex `prompts/v2/` (cada ficha vai logo antes do 1º capítulo que a usa: `3N_00_*`, depois as páginas do capítulo N); `scripts/fila_v2.py` roda (tarefa `MDS_Fila_v2`; recorta página dupla `NN_MM.png`). `scripts/v2_gemini.py montar | rodar [caps]` = mesma coisa no Gemini, uma página por imagem, 2 páginas a cada 3 min. Saídas: `sheets_codex_arkham/`, `sheets_v2/`, `capas_v2/`, `wsNN/arkham_v2/` (Codex), `wsNN/arkham_gemini_v2/` (Gemini). `scripts/publicar_v2.py` sobe as duas versões como "pré-final".
- **Ordem de produção (economia de Codex):** roteiro → Gemini gera o capítulo → Isaias revisa → só então o Codex gera (a fila do Codex só faz página de capítulo com o arquivo `aprovado/wsNN`; ficha ela faz sempre). Erro achado no Gemini custa centavos; no Codex, cota.
- **O roteiro (`wsNN/roteiro.json`, formato em `scripts/FORMATO_ROTEIRO.md`) é escrito pelo agente principal**, nunca pelos modelos de fora: eles ignoram as regras de composição (ex.: 1 painel em toda página, vista de cima). Modelo de fora só revisa continuidade, e o agente confere. Cap. 1 escrito à mão em `scripts/roteiro_ws01.py`.
- Fichas Arkham = redesenho das fichas aprovadas (ref = ficha antiga, "keep EXACTLY its design"). Se a ficha antiga tem erro (ex.: beliche), o prompt da nova diz "ignore isso mesmo que a referência mostre".
- Continuidade do orfanato: `sheets_v2/MDS_Dormitorio_Planta` (só camas simples de um andar, **nenhum beliche**; corredor do meio sempre vazio; cama do Minus = 5ª da fileira ESQUERDA, cobertor AZUL-MARINHO `#1F3A6E`, as outras cinza; rachadura no teto acima dela; Carlos na cama simples ao lado, Marina e Sofia em frente; cadeira da Helena na porta, janelas só na parede direita). À noite o Minus fica coberto até o queixo. As 4 fichas do quarto (dia, noite, massacre, amanhecer) seguem a planta.
- **Linguagem WEB SHARD no MDS:**
  - **Painéis:** no máximo 2 grandes por página (o normal); 1 só nas páginas importantes. Nunca mais.
  - **Estilhaço = caco de vidro quebrado** (triangular, borda rachada, brilho de vidro, 15–25% da largura) por cima do painel grande, com UM detalhe: olho, expressão, mão, a marca, objeto. Detalhe e expressão vão em estilhaço, nunca em painel grande. No prompt, estilhaço diz "edge: jagged cracked GLASS" — se aparecer como painel/faixa diagonal, o prompt está errado.
  - **Divisão entre painéis = FUMAÇA** na cor de quem controla a cena (Minus azul `#2E8BFF`, Falha/Nefeli prata `#C9D1DE`, Luna rosa `#E85D9A`, terceira pessoa branco `#E8ECEF`). Escrever "SMOKE, NEVER NEON".
  - **Narração sem caixa:** o texto flutua numa nuvem de fumaça da cor do narrador, num canto escuro da cena (nunca sobre rosto ou ação).
  - **Fala:** balão sempre BRANCO; letra e contorno grosso na cor fixa do personagem (tabela `VOZ` em `montar_prompts.py`: cada um tem a sua, nunca dois iguais). Uma fonte só no quadrinho inteiro.
  - **Câmera:** foco na ação e no rosto, como webtoon. Nada de vista panorâmica, plano geral ou vista de cima do lugar (se a ação é uma chama no quarto, mostra a chama, não o quarto). Nunca corpo inteiro: o mais aberto é plano americano. Ângulos de cinema (contra-plongée, plongée, holandês, sobre o ombro, câmera no chão, close em profundidade, ponto de vista). No máximo 2 personagens em foco por painel.
  - Toda ação diz QUAL cama/lugar ("a cama do Minus, 5ª da fileira esquerda"), nunca "a cama" ou "no centro".
- Abertura do cap.1: "EXISTEM MUITAS COISAS NO MUNDO TE OBSERVANDO." / "MAS ALGUMAS COISAS OLHAM DE VOLTA." Narração da Falha sempre em 1ª pessoa ("ele me viu"), nunca "aquilo" falando de si mesma.
- Paletas: memória dourada / real azul-frio / Shadow World orgânico.

## 4. MAR DE CINZAS (MDC)
- Codex. Semi-realista pintado, paleta fria; âncoras `KeyArtCapitulo1.png`, `Cena01.png`, `ElizabethColor.png`. Moldura de éter (cor = quem controla a cena). Fonte serifada condensada; sem onomatopeia. Regra anti-confusão escrita no prompt (vestido branco = Elizabeth; dragonas = Scarn). Codex bateu limite após ~40 imagens seguidas.

## 5. HERÓIS DA CIDADE (HDC)
- Nano Banana 2 via `LAB-NVIDIA/hdc.py gerar(prompt, refs, out, (960,1637), '9:16')`; episódio = `hdc_epNN.py` (dicionário `PAG`, refs por chave em `R`), correção = `hdc_epNN_fix*.py`. Saída `WEBSHARD/HEROIS DA CIDADE/MAIN/NN/`, publicar em `public/webtoon/herois-da-cidade/NN/pt/` + `src/data/herois-episodios.json`.
- Cartoon anos 90, traço grosso, cor chapada, fundo bege. Uma piada por episódio, falas secas. Ordem: cold open (2 legendas + imagem) → divulgação → história → divulgação → créditos.
- Mega Bandido em 1 página só (roubando algo pequeno). Fechar todo prompt com "No other text. No Mega Bandido." (ou "This is the ONLY page with Mega Bandido").
- Cores de balão: Playboy `#D62828`, Metal `#5B2A86`, Volver-Rindo `#E07B00`, figurantes cinza.
- Identidades civis: Lester (Mega Playboy), Nerdo (Mega Genius), Cabelo (Mega Metal). Cena com gesto de mão = risco de braço extra (cap.5 p.8 precisou de 5 tentativas).

## 6. LENDAS DO LDI (graphic novel do jogo)
- Nano Banana 2. Bíblia `LAB-NVIDIA/lendas_estilo.txt` entra na frente de todo prompt. Protagonista sem rosto (moletom cinza), ninguém olha pra câmera, sem texto, 1 ilustração full-bleed 4:5 (768 px webp em `src/pages/games/LDI/arte/<cena>-<n>[b].webp`).
- `planeja_lendas.py` → `gera_lendas.py <lote.json>` → `revisa_lendas.py` (QA Gemini: texto, vários quadros, olhar pra câmera, rosto) → `refaz_lendas.py`. Lugar errado: `lendas/conserta_lugares.py` (lugar pelo TEXTO da cena + ref do quadro principal).
- Folhas do elenco em `LAB-NVIDIA/lendas/folhas/` (Kaeda: óculos escuros SEMPRE na cabeça). Lugares fixos: esconderijo da Kaeda, cubo de segurança alugado, Praça Morta, mercado de baixo, arena principal, quarto 3×3 (mundo real).
- Arena de luta 3D: `src/pages/games/LDI/batalha/arenaLDI.js` (código, a partir de `Personagens/Cenarios/ArenaLDI.png`).

## 7. LDI GANGUES
- Mapas pixel art: NUNCA pedir o bloco inteiro (inventa prédio). Fluxo `JOGOS/GANGUES_MAPA/`: guia do dado → chão sem prédios → cada telhado sozinho → montar no retângulo exato → `comp.py` pra achar prédio inventado. Colisão mora no dado.
- Retratos de inimigo: cabeça 256×256 pixel art, `assets/enemies/<slug>/neutro.png` + mapa `ENEMY_ID_SLUG` em `data/ganguesEnemyPortraits.js`. Grade no Codex: `WEBSHARD/MUNDO DAS SOMBRAS/scripts/gangues_grades.py` põe na fila do Codex (`prompts/v2/5_NN_gangues.txt`, depois do MDS) grades 6×4 (24 cabeças, 1536×1024, transparente, estilo de `gangues_grades/estilo_retratos.png`), chefões na 1ª; `fila_v2.py` recorta cada célula em `assets/enemies/<id>/neutro.png` (o jogo acha o retrato pela pasta do id quando não há slug). 365 cabeças = 16 grades. Revisar a 1ª grade antes de publicar.
- Animação (sprite sheet de batalha): só os 7 chefões e os 30 personagens jogáveis — a definir depois; o resto é só cabeça.
- Texto de inimigo: `LAB-NVIDIA/gangues_inimigos.py plano|gerar|gravar` (DeepSeek+Gemini, lotes de 12, exemplos do catálogo + lista de nomes proibidos). Lotes em paralelo REPETEM nomes → rodar `gangues_renomeia.py` depois.
- Sprite: animação vai no momento de destaque (dado dramático), nunca no log. Poses giram sozinhas (frente/perfil/costas, 2–3 s).

## 8. LUTAS DE ILUSÃO (WEB SHARD principal)
- **REGRA MAIS CRÍTICA: o sistema de produção de páginas** está em `docs/WEBSHARD/WEBSHARD_GUIA_DE_PRODUCAO.md` §0 (roteiro por página no formato fixo, só informação útil do que a câmera vê, ler imaginando a saída, trava de fichas, lotes de 5 revisados com o autor, numeração só com números). Modelo pronto: `WEBSHARD/LUTAS DE ILUSAO/MAIN/08/PRODUCAO_lote*.md` + `PRODUCAO_07_09/cap08_amostra.py`.
- Produzido fora do agente (Isaias). Agente só traduz páginas (seção 2) e publica.
- **Última página da história = página de GANCHO com GLITCH (regra).** Todo capítulo fecha a história com ela, antes das páginas fixas de divulgação e créditos. Modelo: `MAIN/02/PT/63.png`, `MAIN/03/PT/62.png`, `MAIN/06/PT/57.png` — anexar duas delas de referência de estilo. Elementos: a página inteira "travando" (faixas horizontais deslocadas, aberração cromática vermelho/ciano, linhas de scan, pixels quebrados); plaquinha vermelha "⚠ ERRO" + chiado "ZZZZT" no topo; a pergunta-gancho GRANDE embaixo, com a palavra-chave colorida; "FIM DO CAPÍTULO N" pequeno no canto inferior direito. Nunca o selo grande "FIM DO WEB SHARD".
- **Glitch no meio do capítulo (virada de cena).** Modelo: `MAIN/02/PT/35.png` ("A Medusa acordou"). Página inteira com chiado de VHS e aberração cromática; pergunta curta em cima ("QUEM É ESSA MULHER?"), frase de impacto grande embaixo na cor do personagem, e a linha pequena "VISITE O PORTAL PARA VER O QUE ACONTECE AGORA." Usar quando o capítulo corta pra um personagem ou acontecimento que muda a história.
- **Kim nunca sorri nem ri.** É sempre mal-humorado; surpresa ou impressão, quando houver, é contida e sem sorriso. Escrever isso no prompt de toda página em que ele aparece.
- **Rosto sempre pela ficha de expressões.** Toda página com protagonista anexa a ficha de rosto dele (ou a prancha corpo + expressões) e o prompt manda copiar o rosto; sem isso sai rosto genérico de anime.
- **Sem vista panorâmica em cena de conversa.** Sala de aula e corredor: planos fechados nos personagens que falam. Na sala A-304, Kim, Jack e Nina sentam lado a lado na primeira fileira.
- **Machucado não tem continuidade.** Marca de briga some na cena seguinte; não carregar corte ou cicatriz pelo capítulo.
- **Roupa não muda dentro da mesma cena.** Troca só entre cenas (ex.: briga de roupa casual → escola de uniforme). Continuidade de figurino e de objeto (óculos de RA na aula, tênis jogado na briga) vale de uma página pra outra.

## 9. WEB SHARD "CÂMERA NA MÃO" (found footage em VHS)
> **Especial Halloween (direção atual de Isaías, 19/10/2026):** prevalece `WEBSHARD/Especiais/HALLOWEEN_ROTEIRO_OFICIAL.md`. São quatro fontes: C inteiramente preto e branco, sem áudio, balão `NO SOUND` para cada pessoa visivelmente falando; A colorida analógica/VHS FORTEMENTE envelhecida em toda imagem, com data/hora própria e bateria fixadas em 19:57/100%, 23:43/75%, 02:17/50%; D colorida Full HD limpa; S subjetiva sem HUD. Não aplicar VHS, bateria, data ou ano inventados a todas as fontes. Divisões diagonais podem variar de direção, com borda muito fina, sem faixa de chiado. Normalmente dois painéis, máximo três só para ação rápida; estilhaços editoriais podem usar outro ângulo do acontecimento. Referências reais sempre anexadas e identificadas por nome de arquivo. As regras antigas abaixo não substituem essas exceções. O lote de 51 páginas usa `scripts/halloween_producao.py`, sem publicar arte automaticamente.
Linguagem própria pra especial em que a história é o que uma filmadora gravou. O roteiro diz qual página é fita e qual não é.

**Quadro**
- Todo painel é um quadro da fita, visto **pela lente** de quem filma. A câmera está na mão: horizonte um pouco torto, enquadramento imperfeito, às vezes uma ponta de dedo ou da alça na borda.
- Efeito VHS em todo painel: chiado, linhas de tracking, cor sangrando nas bordas, grão, luz estourada, foco "procurando". O traço continua o do estilo da obra; o VHS vai por cima, sem virar foto.
- **Visor (overlay) sempre igual:** "● REC" em cima à esquerda, data e hora embaixo à direita, bateria em cima à direita e contador da fita. É letra de visor de filmadora: branca, pixelada, com sombra. O texto do visor entra na lista de TEXTS do prompt, exatamente como deve sair (ex.: `"● REC"`, `"31 OUT 1998 23:14"`, `"BAT 60%"`). Se não estiver na lista, o modelo inventa número.
- O que muda no visor é continuidade: o roteiro diz a hora e a bateria de cada página. Conferir na revisão como se confere um rosto.

**Composição WEB SHARD adaptada**
- Até 2 painéis grandes por página, 1 nas páginas importantes.
- **Divisão entre painéis:** faixa de chiado de VHS na cor de quem domina a cena, no lugar da fumaça.
- **Estilhaço:** quadro solto da fita (frame congelado com borda de chiado) ou, quando a lente já rachou, caco do vidro da lente com a imagem dentro. Sempre um detalhe só.
- Quem filma **quase nunca aparece**: só no reflexo (espelho, poça, vidro) ou quando alguém toma a câmera.

**Olhar**
- A regra "ninguém olha pro leitor" muda aqui: a orientação atual de Isaías proíbe olhar para o leitor ou diretamente para a lente, inclusive falando com quem filma. Indicar uma pessoa ou ação fora do eixo como alvo dos olhos.
- Não existe exceção para vilão, vlog ou POV subjetivo. O alvo do olhar precisa estar declarado em todo prompt.

**Câmera caída / sem dono**
- Morte e susto com a câmera caída: lente no chão, quadro de lado (90°), parte do quadro tampada por objeto. O que importa acontece **no fundo ou fora do quadro**, e a onomatopeia carrega o som.
- Prompt: "the camcorder has fallen on the floor and keeps recording sideways; the frame is rotated 90 degrees; the action happens in the background, partly out of frame".

**Violência e palavras no prompt**
- Nunca escrever "sangue/blood". Dentro de simulação: "glowing blue liquid". No mundo real: "red liquid".
- Mostrar a consequência, nunca o ferimento: som, sombra, objeto caído, corpo parado errado.

**Páginas fora da fita** (ex.: alguém assistindo a fita depois): sem visor de REC, imagem limpa, a TV de tubo mostrando a fita. Marcar isso no roteiro da página.

**Bloco pronto pro prompt**
"FOUND FOOTAGE PAGE: every panel is a frame of an old VHS camcorder tape filmed handheld by NINA (she is behind the camera, never visible except in reflections). VHS look: scan lines, tracking noise, color bleed at the edges, grain, blown highlights, imperfect handheld framing. Camcorder viewfinder overlay on every panel, written exactly as listed in TEXTS. Panels are separated by a band of VHS static in [cor]. Shards are [frozen frames with static borders | cracked fragments of the camera lens]."


**Halloween — atualização de continuidade e balões (19/10/2026):** tudo digital e o relógio do ambiente resetam; o mundo volta às 20:00 em cada loop. Só a analógica mantém a fita, seu relógio e bateria consumida. Ninguém tem lembrança consciente anterior; só Nina sente pressentimentos. Em PLAY, D de Fred mostra os quatro assistindo: FHD limpo fora do ocular, VHS forte no vídeo reproduzido. Balões sempre brancos, texto E borda na cor de quem fala. Voz do operador nasce da borda inferior central do POV. Plano fechado: `WEBSHARD/Especiais/HALLOWEEN_CONTINUIDADE.json`. Pasta atual de Presos: `ESPECIAIS/presos/WEBSHARD/PT/loop1/`.
