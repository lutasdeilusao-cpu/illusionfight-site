# Ferramentas de automação (Chrome conectado)

Todas usam o **mesmo Chrome com perfil próprio e porta de depuração 9222**. O login em cada site é manual, feito nessa janela. Chrome aberto pelo Playwright é recusado pelo Google.

```
chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\webshard_refs\chatgpt_bot\perfil_cdp --force-dark-mode --enable-features=WebContentsForceDark
```

Os scripts ficam em `C:\webshard_refs\...`, num caminho **sem acento**. O navegador integrado do VS Code não sobe arquivo.

---

## 1. Gerar páginas pelo site do ChatGPT

Serve para testes e poucas páginas. Lotes continuam no Codex. Automatizar o site pode violar os termos de uso da OpenAI.

1. Abrir o Chrome acima em `https://chatgpt.com/images`.
2. Conectar com `chromium.connectOverCDP('http://127.0.0.1:9222')`. Script pronto: `C:\webshard_refs\chatgpt_bot\gera.cjs`.
3. Anexar as fichas com `setInputFiles` no `input[type=file][accept="image/*"]` que não é o de câmera. Os rótulos mudam com o idioma da conta.
4. Esperar sumirem as barras de envio, clicar no campo editável, usar `keyboard.insertText` com o prompt e clicar em Enviar.
5. A imagem pronta tem `alt` com "gerada" e `src` em `blob:`. Salvar por `fetch` dentro da página, nunca por requisição externa.

**Lote pelo ChatGPT: todo job passa por `prepara_lote.py <de> <até>`** (pasta `PRODUCAO/ferramentas` do conto). Ele monta um anexo único com uma página aprovada + `Baloes_LetreiroOficial.png`, soma as fichas de quem aparece (pessoas antes do cenário, até 8 anexos no navegador; o Codex continua com 5) e fixa fonte e cores no fim de todo prompt. Fonte descrita só em palavras sai diferente no ChatGPT e a cor varia. Revisar a primeira página do lote antes de deixar correr.

---

## 2. Gerar shorts a partir do webtoon

**O guia completo (escolha do trecho, roteiro de câmera, efeitos, SFX, música e card) está em `SHORTS_GUIA_DE_PRODUCAO.md`.** Abaixo, só o resumo.

Gerador: `MARKETING\ShortVideosAI\_gerador\make_short.py` (Python + PIL + numpy + ffmpeg).

```
python make_short.py "C:/Users/isaia/Downloads/BRANDS" "<saida>.mp4"
```

- As páginas ficam em `WEBSHARD\LUTAS DE ILUSAO\MAIN\<cap>\PT\NN.png`, com 960×1637 (já em 9:16). A história começa na página 05; as páginas 01 a 04 são capa, aviso e propaganda.
- A lista `PLAN` no topo do script define, para cada página, o hold (página inteira por 1,5 a 2s) e os passos de câmera (zoom, flash, tremor e SFX).
- Formato aprovado: tira contínua estilo webtoon, página inteira primeiro, depois os zooms, e transição em rolagem para cima com motion blur vertical.
- Música: `IsaiasLealMusic\MusicasSite\Lutas de Ilusão(Opening) - Isaias Leal Music.mp3`. O pico em 3:51.80 é alinhado automaticamente com a página marcada `kraang=True`.
- SFX: `SiteLDI\.gh-pages-worktree\arena\sfx\`.
- Card final: logos oficiais (`Personagens\Logos oficiais\LogoEnglish.png` + `LogoSquareEn.png`), fonte **Rajdhani** (`Fonts\Rajdhani`, a mesma do site) e o texto "Livro • Músicas • Games — tudo 100% grátis no site".
- A saída vai para `MARKETING\ShortVideosAI`.

---

## 3. Postar shorts no TikTok e no YouTube

Scripts em `C:\webshard_refs\shorts\`, testados na postagem do short 01 em 04/11/2026. Eles usam **CDP cru** (`cdp.cjs`, WebSocket nativo do Node 22), sem Playwright.

### Preparar

1. Copiar o vídeo para `C:\webshard_refs\shorts\` com nome sem acento.
2. Criar o `meta_NN.json` com `yt_title`, `yt_desc` (com `\n`) e `tt_caption`.
3. Trocar o caminho do vídeo e o `require('./meta_NN.json')` nos scripts.
4. Confirmar que as abas do **TikTok Studio** e do **YouTube Studio** estão abertas e logadas no Chrome 9222.

### TikTok (`tiktokstudio`)

| Passo | Script | O que faz |
|---|---|---|
| 1 | `node tt.cjs` | Abre `/tiktokstudio/upload`, anexa o vídeo, fecha o aviso "Entendi" e cola a legenda. Imprime a legenda lida do DOM. |
| 2 | conferir | A legenda impressa deve ser idêntica à do `meta`. O padrão já vem com "Agora" e "Todos". |
| 3 | `node tt_click.cjs` | Confere a legenda de novo e clica em **Publicar**. |
| 4 | `node tt_confirm.cjs` | Clica em **Publicar agora** no modal "Continuar publicando?", que aparece porque a verificação de conteúdo ainda está rodando. |

Depois de publicar, o post aparece como "Conteúdo sob análise" e "Somente…" por cerca de 10 minutos e depois vira "Todos".

### YouTube (`studio.youtube.com`)

| Passo | Script | O que faz |
|---|---|---|
| 1 | `node yt1.cjs` | Abre o upload e anexa o vídeo por `DOM.setFileInputFiles`. |
| 2 | esperar | Esperar o "Envio em 100%" e a "Verificação inicial" com check. |
| 3 | `node yt2.cjs` | Preenche título e descrição e marca "Não é conteúdo para crianças". Imprime os dois campos. |
| 4 | `node yt3.cjs` | Clica em Avançar 3×, marca **Público**, confere e clica em Publicar. Imprime o link do short. |

Se o diálogo de upload fechar, o vídeo fica como **Rascunho** em Conteúdo → Shorts. Basta clicar em "Editar rascunho" e rodar `yt2` e `yt3`.

### Como os scripts funcionam

- **Conexão:** `cdp.cjs` conecta direto na aba pelo WebSocket do CDP.
- **Anexar vídeo:** `DOM.setFileInputFiles` com o caminho local, sempre com barras normais (`C:/webshard_refs/shorts/...`). O Chrome lê o arquivo direto do disco, sem limite de tamanho. Exporte sempre na qualidade máxima.
- **Legenda do TikTok:** clique real no campo, Ctrl+A e Backspace por teclas CDP, depois um único evento `paste` (`DataTransfer`) com a legenda inteira.
- **Campos do YouTube Studio:** ficam em shadow DOM. O script busca atravessando os `shadowRoot`, acha o campo pelo `aria-label` ("Adicione um título…" e "Fale sobre seu vídeo…"), dá `element.focus()` e digita. Cada quebra de linha é um `Input.dispatchKeyEvent` de Enter com `text: "\r"`.
- **Aba do YouTube sem responder:** durante o processamento do vídeo é normal. Espere alguns minutos e rode o script de novo.
- **Conferência:** antes de publicar, os scripts leem de volta do DOM a legenda, o título, a descrição e se Público está marcado. Se algo não bater, eles param.

## 4. Postagem automática agendada (tipo cron)

Tudo em `C:\webshard_refs\shorts\`:

| Arquivo | Função |
|---|---|
| `fila.json` | A agenda: cada item tem data e hora, short, versão (com/sem fala), arquivo, textos (`meta`) e status por rede (`pendente` / `ok` com link / `falhou`). |
| `fila_gerar.py` | Gera a fila e os textos. Regenerar **zera os status**, então só rode pra uma fila nova. |
| `posta.cjs <video> <meta> <tiktok\|youtube>` | Posta em uma rede e **confere na tela**. Só devolve `OK <link>` se a publicação foi confirmada. Espera o upload terminar e confere legenda, título, descrição e Público antes de publicar. |
| `agendador.py` | O "cron". Pega o próximo item vencido e garante o Chrome 9222 aberto (abre com o perfil logado se estiver fechado). Posta nas duas redes, com 3 tentativas por rede. Se falhar, **chama o Claude Code** (`claude -p`) pra diagnosticar e consertar, e mostra notificação no Windows. Faz uma postagem por execução. |
| `agendador.log` | Histórico de tudo que rodou. |

**Agendador do Windows:** tarefa `ShortsLDI_Postagem`, que roda **só nos horários: 12:00, 12:05, 12:10, 12:15 e 20:00, 20:05, 20:10, 20:15** (pythonw, sem janela). Cada execução faz uma tentativa por rede. Se a 4ª falhar, chama o Claude.

**Prova de publicação (obrigatória):** um post só vira `ok` com o **link público verificado de fora, sem login**:
- **YouTube:** `youtube.com/oembed?url=<link>` precisa responder 200. Rascunho e privado respondem 403. O link `youtube.com/shorts/<id>` aparece no diálogo **antes** de publicar, então ter o link não prova nada.
- **TikTok:** abre a página pública `tiktok.com/@illusionfightif/video/<id>` e exige `"statusCode":0` e o próprio id no JSON. O oEmbed do TikTok **não serve**, porque responde 200 até pra vídeo inexistente.
- A notificação do Windows e o `agendador.log` (linha `PUBLICO ...`) mostram os dois links públicos.
- Rascunho no YouTube se publica com `node ytdraft.cjs <id>`.

**Rascunho no YouTube (corrigido em 05/11/2026):** o diálogo de upload às vezes só **salva como rascunho** em vez de publicar.
- Se o vídeo não estiver público em cerca de 1 min, o `posta.cjs` publica **o mesmo rascunho** com o `ytdraft.cjs`.
- O `posta.cjs` imprime `YTID <id>` e o agendador guarda o id em `fila.json` (`yt_id`). Na tentativa seguinte, ele **só publica esse rascunho, nunca sobe o vídeo de novo**. Em 05/11 subir de novo criou um rascunho duplicado.
- O `cdp.cjs` aceita sozinho os diálogos do navegador, como "Sair do site?". Esse diálogo travava a aba do Studio e as tentativas seguintes saíam "sem saída".
- Nunca deixe um `node` antigo rodando na mesma aba: dois scripts brigando pela aba travam o Studio.
- `lista_yt.cjs` lista os últimos shorts do canal com a visibilidade, pra encontrar rascunhos.

**Calendário atual (teste A/B):** um short por dia, de 04/11 a 15/11/2026, às **12h00 e 20h00** (horário de Brasília). As versões com e sem fala revezam o horário a cada dia. A ordem é 01–04, 06, 05, 07–12 (o 05 vai depois porque revela o final do Capítulo 1). Horários escolhidos pela sobreposição dos picos do TikTok e do YouTube Shorts no Brasil (almoço 12h–14h, noite 20h–22h).

**Requisitos:** o perfil `perfil_cdp` precisa estar logado no TikTok e no YouTube, e o PC ligado com o usuário logado (o Chrome precisa de tela).

**Conferir:** `agendador.log`, os status em `fila.json`, ou o painel de cada rede. Pra pausar: desative a tarefa `ShortsLDI_Postagem` no Agendador de Tarefas.
