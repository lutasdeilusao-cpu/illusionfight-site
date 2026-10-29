# PRODUÇÃO DE IMAGEM — guia do agente

**Quadrinho (qualquer WEB SHARD, MDS, MDC, HDC, especial): ler primeiro `docs/WEBSHARD/REGRAS_CRITICAS.md`.** Ele é a base de toda produção de página e vence qualquer guia quando há conflito.

Este arquivo cobre as ferramentas, as regras que valem pra qualquer imagem (também jogo e arte avulsa) e um resumo de cada produto com o caminho do guia dele.

O repositório é público: aqui só vai NOME de chave, nunca valor. As chaves ficam em `SiteLDI/.env.local` e são lidas por `LAB-NVIDIA/chaves.py` (`chaves.k('NOME')`).

---

## 0. Ferramentas

| Uso | Ferramenta | Notas |
|---|---|---|
| Arte de qualidade (páginas, fichas, retratos, mapas) | **Codex**: `codex exec --skip-git-repo-check -m gpt-5.6-terra --sandbox workspace-write -c model_reasoning_effort="low" -i <ref>... -` (prompt via stdin) | Melhor qualidade. Erro quase sempre vem do prompt. Uns 2 min por imagem. Tamanhos: 1024×1024, 1536×1024 e 1024×1536 (não gera 2048×1152). Faz fundo transparente. `-m` sempre na chamada (o config padrão aponta modelo recusado). |
| Storyboard, cartoon, tradução de página, quadros do Lendas, edição pontual de ficha | **Nano Banana 2** (`gemini-3.1-flash-image`), chave `GEMINI_API_KEY_PANORAMA` (a única com cota de imagem) | `imageConfig.imageSize "2K"` + `aspectRatio`. Bom em texto de balão. Erra anatomia (braço extra) e continuidade de lugar. |
| Texto braçal (transcrição, descrição, rascunho de tradução) | NVIDIA `moonshotai/kimi-k3` → Gemini `gemini-3-flash-preview` (contas `_LDI`, `_GAMEDEV`, `_EMAIL2`) → DeepSeek `deepseek-flash` (pago, `max_tokens` alto) | Sempre rascunho: o agente revisa gíria, palavrão e quem fala. |
| NÃO usar | FLUX/Kontext da NVIDIA, Pollinations | Só servem pra exemplo, e o filtro barra briga. |

**Cota do Codex:** janela de 24 h, umas 40 a 50 imagens. Quando estoura, o log traz `usage_limit_reached` com `resets_in_seconds`, contado da hora da falha. A fila para na cota e continua de onde parou.

**Codex não abre caminho com acento.** Copiar as referências pra `C:\webshard_refs` antes de anexar. Antes de culpar o prompt, provar que o anexo abriu.

---

## 1. Regras gerais (qualquer imagem)

### Referências
- Fichas e cenários moram em `BRANDS/Lutas de Ilusão/Personagens/`, um arquivo de cada:
  - uma pasta por personagem, com as fichas oficiais na raiz (`Kim/KimExpressionSheet.png`);
  - `Inimigos/<Nome>/`, `Secundarios/`, `Trio/`, `Cenarios/`, `Objetos/`, `Estilo/`, `Capas_Contos/`;
  - `_A_IDENTIFICAR/`: arte sem dono confirmado, que não se usa até o Isaias dizer quem é.
- Ficha nova vai direto pra pasta do dono, com nome descritivo (`<Nome><Roupa>Sheet.png`, `<Lugar>_<Parte>.png`). Nunca deixar ficha só na pasta de produção de um capítulo.
- Anexar com `-i` (Codex) ou inline (Gemini) e citar **pelo nome do arquivo** no texto. Nunca "imagem 1" e nunca link.

### Formatos de ficha
- **Personagem principal ou transformação:** frente, costas e perfil de corpo inteiro, mais 3 expressões do mesmo rosto (4ª coluna ou faixa de baixo). A transformação fixa o novo estado em todas as vistas.
- **Figurantes e grupos recorrentes:** vários na mesma folha, lado a lado, com identidades distintas e reutilizáveis.
- **Ambiente recorrente:** planta de cima do lugar inteiro à esquerda e, à direita, duas vistas empilhadas do MESMO lugar, nos ângulos que as páginas usam. Sem personagens e sem texto. Planta e vistas concordam.
- **Objeto:** quadro quadrado, vistas do objeto, sem cenário.
- Tamanho: no Codex, 1536×1024 (horizontal) ou 1024×1024 (objeto). Estado duradouro (ferimento, idade, forma) ganha ficha própria. O lado de marca ou ferida se escreve "lado ESQUERDO DELE".

### Continuidade de lugar
- Lugar fixo: ficha de ambiente mais a regra escrita da geografia em TODO prompt daquele lugar.
- O fragmento de fundo NÃO pode fechar o espaço. Uma cama entre 2 ou 3 paredes vira "quarto de uma cama só"; dizer que o lugar continua e some no escuro.
- Cena que continua: passar a página ou quadro anterior como referência ("mesmos rostos, roupa e luz; não copie quadros nem texto").
- 2ª arte da mesma cena: usar o 1º quadro como referência e conferir o lugar de cada prompt contra o texto da cena. No Lendas, 26 artes saíram com o lugar de outra cena.

### Anatomia e conteúdo
- O Gemini cria 3º braço, sobretudo em gesto com mão. Prompt: "EXACTLY two arms… one elbow and one hand each… no extra arms, no floating hands". Preferir pose simples.
- Quadro difícil: gerar 3 variantes em paralelo e escolher olhando o **recorte ampliado**, porque a miniatura esconde braço extra.
- Estampa de folha tropical pode virar maconha → "PALM and BANANA leaves only".
- Nunca pessoa real, banda real, marca real ou logo de IA real. Paródia com nome inventado.
- Violência: nunca escrever "sangue/blood". Mostrar a consequência (som, sombra, objeto caído), nunca o ferimento. Dano humano em vinho-escuro, seco.

### Texto na imagem
- Lista fechada: "Write ONLY the texts listed, each exactly once… No other text."
- Acentos explícitos no prompt (Á É Ê Í Ó Ú Ã Õ Ç). Nunca hifenizar.
- Ênfase escrita em palavras ("a palavra X bem maior"), nunca com asterisco nem colchete.
- Letra se corrige no gerador, nunca desenhada à mão em PIL: a fonte não bate.

### Fundo transparente no Gemini
- O Gemini não devolve alpha: "transparent background" vira xadrez pintado.
- Pra ter PNG com alpha de verdade:
  1. gerar em fundo BRANCO liso;
  2. pedir a mesma imagem trocando só o fundo por PRETO liso;
  3. calcular alpha = 1 − (branco − preto).
- Pedir "pure solid flat white/black, no checkerboard".

### Várias saídas numa chamada (economia de cota)
- **Página dupla:** 1 imagem 1536×1024 com 2 páginas lado a lado (calha preta fina), recortada ao meio em 2 páginas de 768×1024. É metade das chamadas, e a continuidade sai melhor. O Webtoon Canvas aceita 800 px de largura.
- A mesma ideia vale pra fichas (2 por imagem), retratos (grade) e blocos de mapa.

### Fila
- Formato do prompt:
  - linha 1: `OUT: <arquivo>`;
  - linha 2: `REFS: <arquivos>`;
  - o resto é o prompt.
- A fila roda na ordem de dependência e só roda um prompt quando todas as REFS existem. Ela pula o que já existe, tem trava contra rodada dupla e grava log em arquivo.
- Prefixo de economia no Codex: "ECONOMY MODE: do not inspect files or run commands… Generate ONCE… Reply only: ok."
- **Páginas narrativas:** uma por vez, **um pedido a cada 2 minutos**, contado do início de um pedido ao próximo. **Fichas e referências:** em sequência, sem intervalo.
- **Nunca deixar serviço órfão:** ao trocar de fila, parar a anterior (processo, tarefa agendada e cron da sessão). Conferir com a lista de processos e `schtasks /query`.

### Revisão e entrega
- Revisar SEMPRE antes de publicar:
  - a folha de contato, pra visão geral;
  - o recorte ampliado onde tem mão, rosto ou texto.
- O Isaias revisa pelo celular: mandar a imagem (SendUserFile) ou a folha de contato.
- O que foi descartado não se apaga: vai pra `_descartadas/`.
- Publicar = WebP no tamanho final, entrada no catálogo, versão, build e deploy, e conferir no ar.

---

## 2. Produtos

### WEB SHARD — Lutas de Ilusão (linha principal e contos)
- Guia: `docs/WEBSHARD/WEBSHARD_GUIA_DE_PRODUCAO.md`. Ele vale também como guia de formato de todo WEB SHARD: página, safe area, cores, letreiro, publicação e tradução.
- Fluxo:
  1. roteiro por página;
  2. plano de câmera;
  3. `montar.py`;
  4. storyboard no Gemini;
  5. revisão do Isaias;
  6. Codex em lote de 5.
- Modelo pronto: `WEBSHARD/LUTAS DE ILUSAO/CONTOS/06-inocentes/PRODUCAO/` (`roteiros/`, `prompts_paginas/`, `ferramentas/`).

### Mundo das Sombras (MDS) — estilo Arkham Codex
- Guia único: `docs/WEBSHARD/MDS_GUIA_DE_PRODUCAO.md`.
- Fluxo: roteiro à mão em `scripts/roteiro_wsNN.py` → `v3.py montar` → storyboard no Gemini → revisão do Isaias → Codex (`v3.py codex` + `fila_v2.py`), trocando página por página.

### Mar de Cinzas (MDC)
- Feito no Codex. Semirrealista pintado, paleta fria. Âncoras: `KeyArtCapitulo1.png`, `Cena01.png`, `ElizabethColor.png`.
- A moldura é de éter, na cor de quem controla a cena. Fonte serifada condensada, sem onomatopeia.
- Regra anti-confusão escrita no prompt: vestido branco = Elizabeth; dragonas = Scarn.
- Guia: `../WEBSHARD/MAR DE CINZAS/MDC_GUIA_DE_PRODUCAO.md`.

### Heróis da Cidade (HDC)
- Guia: `docs/WEBSHARD/HDC_GUIA_DE_PRODUCAO.md`.
- Feito no Nano Banana 2, via `LAB-NVIDIA/hdc.py gerar(prompt, refs, out, (960,1637), '9:16')`.
- O episódio é `hdc_epNN.py` (dicionário `PAG`, refs por chave em `R`); a correção é `hdc_epNN_fix*.py`.
- Saída em `WEBSHARD/HEROIS DA CIDADE/MAIN/NN/`. Publicar em `public/webtoon/herois-da-cidade/NN/pt/` + `src/data/herois-episodios.json`.

### WEB SHARD "câmera na mão" (found footage em VHS)
- Linguagem pra especial em que a história é o que uma filmadora gravou. O roteiro diz qual página é fita e qual não é.
- **Especial de Halloween:** prevalece `docs/WEBSHARD/Especiais/HALLOWEEN_ROTEIRO_OFICIAL.md` (quatro fontes A/C/D/S, cada uma com o seu visual). A continuidade fica em `HALLOWEEN_CONTINUIDADE.json`.
- **Quadro:**
  - Todo painel é um quadro da fita, com a câmera na mão: horizonte um pouco torto e enquadramento imperfeito.
  - VHS por cima do traço da obra: chiado, tracking, cor sangrando, grão.
  - **Visor sempre igual:** "● REC", data e hora, bateria e contador. Ele entra na lista de textos exatamente como deve sair. Hora e bateria são continuidade, conferida por página.
- **Composição:**
  - Até 2 painéis grandes.
  - A divisão é uma faixa de chiado na cor de quem domina a cena.
  - O estilhaço é um frame congelado com borda de chiado, ou um caco da lente rachada.
- **Quem filma quase nunca aparece:** só em reflexo ou quando alguém toma a câmera.
- **Olhar:** ninguém olha pra lente, nem falando com quem filma. O alvo do olhar fica fora do eixo, declarado em todo prompt.
- **Câmera caída:** lente no chão, quadro girado 90°, e a ação acontece no fundo ou fora do quadro, com a onomatopeia carregando o som.
- **Página fora da fita** (alguém assistindo depois): imagem limpa, sem visor, a TV de tubo mostrando a fita.

---

## 3. Outros usos (não são quadrinho)

### Lendas do LDI (graphic novel do jogo)
- **Ferramenta e estilo:**
  - Nano Banana 2, com a bíblia `LAB-NVIDIA/lendas_estilo.txt` na frente de todo prompt.
  - Protagonista sem rosto (moletom cinza), ninguém olha pra câmera e sem texto.
  - 1 ilustração 4:5 por quadro (768 px, webp, em `src/pages/games/LDI/arte/<cena>-<n>[b].webp`).
- **Fluxo:**
  1. `planeja_lendas.py`;
  2. `gera_lendas.py <lote.json>`;
  3. `revisa_lendas.py`;
  4. `refaz_lendas.py`.
  
  Lugar errado se corrige com `lendas/conserta_lugares.py`.
- **Elenco:** as folhas ficam em `LAB-NVIDIA/lendas/folhas/`. A Kaeda está sempre com os óculos escuros na cabeça.
- **Arena 3D:** `src/pages/games/LDI/batalha/arenaLDI.js`.

### LDI Gangues
- **Mapas em pixel art:** NUNCA pedir o bloco inteiro, porque o modelo inventa prédio. Fluxo em `JOGOS/GANGUES_MAPA/`:
  1. guia gerado do dado;
  2. chão sem prédios;
  3. cada telhado sozinho;
  4. montar cada telhado no retângulo exato.
  
  A colisão mora no dado.
- **Retratos de inimigo:**
  - Cabeça de 256×256, em `assets/enemies/<slug ou id>/neutro.png`.
  - As grades 6×4 vão pra fila do Codex por `WEBSHARD/MUNDO DAS SOMBRAS/scripts/gangues_grades.py`, e o `fila_v2.py` recorta cada célula.
  - Revisar a 1ª grade antes de publicar.
- **Texto de inimigo:** `LAB-NVIDIA/gangues_inimigos.py plano|gerar|gravar`. Lotes em paralelo repetem nomes, então rodar `gangues_renomeia.py` depois.
- **Sprite:** a animação vai no momento de destaque (dado dramático). As poses giram sozinhas.
