# PRODUÇÃO DE IMAGEM — guia do agente

Formato: regras curtas, imperativas. Ler a seção GERAL + a seção do produto antes de gerar qualquer imagem.
Guias longos por produto (detalhe, não repetir aqui): `docs/WEBSHARD/WEBSHARD_GUIA_DE_PRODUCAO.md`, `docs/WEBSHARD/HDC_GUIA_DE_PRODUCAO.md`, `../MAR DE CINZAS/WEBSHARD/MDC_GUIA_DE_PRODUCAO.md`, `../MUNDO DAS SOMBRAS/WEBSHARD/MDS_PLANEJAMENTO.md`.
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

### Várias saídas numa chamada (economia de cota)
- **Página dupla**: 1 imagem 1536×1024 com 2 páginas consecutivas lado a lado (calha preta fina), "LEFT HALF = página N / RIGHT HALF = N+1", recortar ao meio → 2 páginas 768×1024. Metade das chamadas e continuidade melhor (nascem juntas). Testado no MDS cap.1 p.22–23: excelente.
- Webtoon Canvas aceita 800 px de largura por pedaço → 768 de largura é aceitável.
- Mesma ideia pra fichas (2 por imagem), retratos (grade), blocos de mapa.

### Fila
- Formato de prompt: linha 1 `OUT: <arquivo>`, linha 2 `REFS: <arquivos>`, resto = prompt.
- Fila numerada na ordem de dependência; só roda um prompt quando todas as REFS existem; pula o que já existe; refazer = apagar o arquivo e rodar de novo.
- Prefixo de economia no Codex: "ECONOMY MODE: do not inspect files or run commands… Generate ONCE… Reply only: ok."
- Uma imagem por vez + pausa (5 min) em vez de rajada. Trava (lock) contra rodada dupla. Log em arquivo.
- **Nunca deixar serviço órfão rodando**: ao trocar de fila, parar a anterior (processo + tarefa agendada + cron da sessão). Conferir com lista de processos e `schtasks /query`.

### Revisão e entrega
- Revisar SEMPRE antes de publicar: montagem lado a lado (folha de contato) pra visão geral + recorte ampliado onde tem mão/rosto/texto.
- Isaias revisa pelo celular: mandar a imagem (SendUserFile) ou a folha de contato.
- Descartada não se apaga: `_descartadas/` ou sufixo `_descartada`.
- Publicar = WebP no tamanho final, entrada no JSON do catálogo, versão + build + deploy + conferir no ar.

---

## 2. WEB SHARD (comum)
- Página 960×1637 (≈1:1,705), safe area 100 px lados / 80 px topo-base. Ficha 2048×1152 (4 vistas, sem texto). Página dupla do Codex: 768×1024 cada.
- Máx. 2 painéis grandes + estilhaços, cortes diagonais 8–15°, 4 painéis nunca. Pouco texto, letra grande.
- Publicação: `public/webtoon/<pasta>/<idioma>/NN.webp`; catálogo `src/data/*-episodios.json` + `webshard-titulos.json` + `src/lib/webshard/catalogo.js`. Versões do mesmo capítulo: `versoes` (`<pasta>/<versao>/pt`).
- Tradução: Nano Banana 2 primeiro (`LAB-NVIDIA/traduz_gemini.py <cap> <EN|ES> <prompts> NN…`, mesmo tamanho do PT), Codex reserva. Adaptar gíria antes; DIX nunca se traduz; ES neutro latino (tuteo). Detalhe e glossário no guia WEB SHARD §10/§17/§26.

## 3. MUNDO DAS SOMBRAS (MDS) — estilo ARKHAM CODEX
- Pasta: `MUNDO DAS SOMBRAS/WEBSHARD/`. Estilo oficial (decisão do Isaias): **Arkham Codex** = estilo da arte de Batman: Arkham City, feito no Codex, sem nada da marca.
- Scripts: `scripts/v2.py` monta a fila `prompts/v2/` (0 fichas Arkham · 1 continuidade · 2 capa/miniaturas · 3 cap.1 · 4 cap.2); `scripts/fila_v2.py [pausa]` roda (tarefa `MDS_Fila_v2`, a cada 4 h; recorta página dupla `NN_MM.png`). Saídas: `sheets_codex_arkham/`, `sheets_v2/`, `capas_v2/`, `wsNN/arkham_v2/`.
- Fichas Arkham = redesenho das fichas aprovadas (ref = ficha antiga, "keep EXACTLY its design").
- Continuidade do orfanato: `sheets_v2/MDS_Dormitorio_Planta` (cama do Minus = 5ª da fileira ESQUERDA, cobertor AZUL-ESCURO, rachadura no teto acima, beliche do Carlos ao lado, Marina e Sofia em frente, cadeira da Helena na porta), `MDS_Dormitorio_Sombras`, `MDS_Dormitorio_Criancas`. Planta só entra em página com plano geral/vista de cima; nas outras: regra FECHADO + DEPTH.
- Abertura do cap.1: "EXISTEM MUITAS COISAS NO MUNDO TE OBSERVANDO." / "MAS ALGUMAS COISAS OLHAM DE VOLTA."
- Paletas: memória dourada / real azul-frio / Shadow World orgânico. Moldura na cor do narrador (Minus azul `#2E8BFF`, Falha/Nefeli prata `#C9D1DE`, Luna rosa `#E85D9A`).

## 4. MAR DE CINZAS (MDC)
- Codex. Semi-realista pintado, paleta fria; âncoras `KeyArtCapitulo1.png`, `Cena01.png`, `ElizabethColor.png`. Moldura de éter (cor = quem controla a cena). Fonte serifada condensada; sem onomatopeia. Regra anti-confusão escrita no prompt (vestido branco = Elizabeth; dragonas = Scarn). Codex bateu limite após ~40 imagens seguidas.

## 5. HERÓIS DA CIDADE (HDC)
- Nano Banana 2 via `LAB-NVIDIA/hdc.py gerar(prompt, refs, out, (960,1637), '9:16')`; episódio = `hdc_epNN.py` (dicionário `PAG`, refs por chave em `R`), correção = `hdc_epNN_fix*.py`. Saída `WEBSHARD/HeroisDaCidade/WEBSHARD/NN/`, publicar em `public/webtoon/herois-da-cidade/NN/pt/` + `src/data/herois-episodios.json`.
- Cartoon anos 90, traço grosso, cor chapada, fundo bege. Uma piada por episódio, falas secas. Ordem: cold open (2 legendas + imagem) → divulgação → história → divulgação → créditos.
- Mega Bandido em 1 página só (roubando algo pequeno). Fechar todo prompt com "No other text. No Mega Bandido." (ou "This is the ONLY page with Mega Bandido").
- Cores de balão: Playboy `#D62828`, Metal `#5B2A86`, Volver-Rindo `#E07B00`, figurantes cinza.
- Identidades civis: Lester (Mega Playboy), Nerdo (Mega Genius), Cabelo (Mega Metal). Cena com gesto de mão = risco de braço extra (cap.5 p.8 precisou de 5 tentativas).

## 6. LENDAS DO LDI (graphic novel do jogo)
- Nano Banana 2. Bíblia `LAB-NVIDIA/lendas_estilo.txt` entra na frente de todo prompt. Protagonista sem rosto (moletom cinza), ninguém olha pra câmera, sem texto, 1 ilustração full-bleed 4:5 (768 px webp em `src/pages/games/LDI/arte/<cena>-<n>[b].webp`).
- `planeja_lendas.py` → `gera_lendas.py <lote.json>` → `revisa_lendas.py` (QA Gemini: texto, vários quadros, olhar pra câmera, rosto) → `refaz_lendas.py`. Lugar errado: `lendas/conserta_lugares.py` (lugar pelo TEXTO da cena + ref do quadro principal).
- Folhas do elenco em `LAB-NVIDIA/lendas/folhas/` (Kaeda: óculos escuros SEMPRE na cabeça). Lugares fixos: esconderijo da Kaeda, cubo de segurança alugado, Praça Morta, mercado de baixo, arena principal, quarto 3×3 (mundo real).
- Arena de luta 3D: `src/pages/games/LDI/batalha/arenaLDI.js` (código, a partir de `Personagens/WEBTOON/ArenaLDI.png`).

## 7. LDI GANGUES
- Mapas pixel art: NUNCA pedir o bloco inteiro (inventa prédio). Fluxo `GANGUES_MAPA/`: guia do dado → chão sem prédios → cada telhado sozinho → montar no retângulo exato → `comp.py` pra achar prédio inventado. Colisão mora no dado.
- Retratos de inimigo: cabeça 256×256 pixel art, `assets/enemies/<slug>/neutro.png` + mapa `ENEMY_ID_SLUG` em `data/ganguesEnemyPortraits.js`. Plano: Codex em **grade 6×4 (24 cabeças) numa imagem 1536×1024**, fundo transparente, recortar → 288 inimigos novos = ~12 imagens. Testar 1 grade antes do lote.
- Texto de inimigo: `LAB-NVIDIA/gangues_inimigos.py plano|gerar|gravar` (DeepSeek+Gemini, lotes de 12, exemplos do catálogo + lista de nomes proibidos). Lotes em paralelo REPETEM nomes → rodar `gangues_renomeia.py` depois.
- Sprite: animação vai no momento de destaque (dado dramático), nunca no log. Poses giram sozinhas (frente/perfil/costas, 2–3 s).

## 8. LUTAS DE ILUSÃO (WEB SHARD principal)
- Produzido fora do agente (Isaias). Agente só traduz páginas (seção 2) e publica.
