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

## 3. Postar shorts no TikTok, no YouTube e no X

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

### X / Twitter (`x.com`, desde 06/11/2026)

Conta **@IllusionFightIF**, logada no Chrome 9222. Comando: `node posta.cjs <video> <meta> x`.

**Texto:** usa `meta.x_caption`. Se o campo não existir, usa a `tt_caption` sem o `#fyp`.

**Ordem obrigatória:** cada passo só começa depois que o anterior foi confirmado na tela.

| Passo | O que o script faz | Como confirma |
|---|---|---|
| 1 | Abre `x.com/home` (composer da timeline) | O editor `[data-testid=tweetTextarea_0]` e o `input[data-testid=fileInput]` existem. |
| 2 | Anexa o vídeo com `DOM.setFileInputFiles` | Espera o anexo mostrar **"<arquivo>.mp4: Ready"**. Antes disso aparece "Uploading (x%)" e depois "Processing". Leva uns 25s para 56 MB. |
| 3 | Escreve o texto | `element.focus()` + `Input.insertText`. O clique real **não** foca o editor do X. Depois lê o texto de volta, que precisa ser idêntico ao meta. |
| 4 | Confere de novo, logo antes de postar | Texto certo, vídeo em "Ready" e botão `tweetButtonInline` habilitado. **Nunca posta sem texto.** |
| 5 | Clica em **Post** com `element.click()` | O clique por coordenada (CDP `Input.dispatchMouseEvent`) é **ignorado** pelo X nesse botão. Espera o aviso "post enviado" ou o editor vazio sem anexo. Até a confirmação **não navega**, porque sair da página cancela o envio. |
| 6 | Acha o link | Vai ao perfil e procura o post pelo começo do texto, ignorando o fixado. Exige `<time>` **depois do clique**: as versões com e sem fala têm o mesmo texto, e sem essa trava o script pegava o post antigo. |
| 7 | Prova pública | `publish.twitter.com/oembed?url=<link>` responde 200. Só então devolve `OK <link>`. |

**Regras aprendidas na marra (06/11/2026):**
- **Nunca avance de passo sem confirmar o anterior.** Um clique em Postar com o upload em andamento não faz nada. Quem recarrega achando que postou perde o envio.
- **Um script por aba.** O `posta.cjs` cria `posta.lock` e recusa rodar se já existir outro. Nenhum script de diagnóstico que navegue a aba (ex.: `xlist.cjs`) pode rodar enquanto outro posta.
- **Parar uma tarefa no Claude Code (TaskStop) mata o shell, não o `node`.** Um `posta.cjs` órfão continuou rodando e publicou um vídeo **sem texto** quando o upload de outro teste ficou pronto. Depois de parar, confira no PowerShell: `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ? CommandLine -match 'posta'`.
- O perfil do X tem posts antigos em inglês. Os shorts vão com o texto em português do TikTok.

**Postar atrasado no X** (itens que já saíram no TikTok/YouTube): `python x_atrasados.py <id> <id> ...`. Posta um por vez, para no primeiro erro e grava `x` no `fila.json`. Usado em 06/11 para os 4 primeiros (01 e 02, com e sem fala). O vídeo e o meta ficam em `postar_x_<id>.mp4` e `meta_x_<id>.json`.

## 4. Postagem automática agendada (tipo cron)

Tudo em `C:\webshard_refs\shorts\`:

| Arquivo | Função |
|---|---|
| `fila.json` | A agenda: cada item tem data e hora, short, versão (com/sem fala), arquivo, textos (`meta`) e status por rede (`pendente` / `ok` com link / `falhou`). |
| `fila_gerar.py` | Gera a fila e os textos. Regenerar **zera os status**, então só rode pra uma fila nova. |
| `posta.cjs <video> <meta> <tiktok\|youtube\|x>` | Posta em uma rede e **confere na tela**. Só devolve `OK <link>` se a publicação foi confirmada. Espera o upload terminar e confere legenda, título, descrição e Público antes de publicar. |
| `agendador.py` | O "cron". Pega o próximo item vencido e garante o Chrome 9222 aberto (abre com o perfil logado se estiver fechado). Posta nas **três redes (TikTok, YouTube e X)**, uma de cada vez, com 4 tentativas por rede. Item antigo sem `x` na fila ganha `x: pendente` sozinho. Se falhar, **chama o Claude Code** (`claude -p`) pra diagnosticar e consertar, e mostra notificação no Windows. Faz uma postagem por execução. |
| `agendador.log` | Histórico de tudo que rodou. |

**Agendador do Windows:** tarefa `ShortsLDI_Postagem`, que roda **só nos horários: 09:00, 09:05, 09:10, 09:15 e 21:00, 21:05, 21:10, 21:15** (mudado de 12h/20h em 05/11/2026: 9h e 21h rendem mais) (pythonw, sem janela). Cada execução faz uma tentativa por rede. Se a 4ª falhar, chama o Claude.

**PC dormindo (05/11/2026):** se a tampa estiver fechada no horário, a tarefa não roda. Ela está com "Executar assim que possível após perder o horário" ligado: quando o PC acorda, posta o item que ficou para trás. Pra postar na hora, rode `python agendador.py` em `C:\webshard_refs\shorts\`.

**Aviso "Ainda estamos verificando seu conteúdo" (05/11/2026):** com o vídeo recém-subido, o YouTube abre esse aviso ao clicar em Publicar. O `posta.cjs` e o `ytdraft.cjs` agora clicam em "Publicar mesmo assim" sozinhos.

**Envio interrompido (05/11/2026):** o link `Z9wpATXYLoY` passou no oEmbed (200) mas não tinha vídeo: o upload foi cortado quando a aba saiu da página no meio do envio. Regras: **nunca navegar a aba do Studio com upload em andamento**; a prova pública do YouTube agora exige também `playabilityStatus OK` na página `watch?v=<id>`. O "Retomar o envio" recusa o arquivo ("Arquivo incorreto"), então o jeito é excluir e repostar. `ytfinish.cjs <meta>` termina um upload já aberto no diálogo, sem navegar.

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

**Calendário atual (teste A/B):** um short por dia, de 04/11 a 15/11/2026, às **09h00 e 21h00** (horário de Brasília; até 05/11 era 12h/20h), nas três redes. As versões com e sem fala revezam o horário a cada dia. A ordem é 01–04, 06, 05, 07–12 (o 05 vai depois porque revela o final do Capítulo 1). Horários escolhidos pela sobreposição dos picos do TikTok e do YouTube Shorts no Brasil (almoço 12h–14h, noite 20h–22h).

**Requisitos:** o perfil `perfil_cdp` precisa estar logado no TikTok, no YouTube e no X, e o PC ligado com o usuário logado (o Chrome precisa de tela).

**Conferir:** `agendador.log`, os status em `fila.json`, ou o painel de cada rede. Pra pausar: desative a tarefa `ShortsLDI_Postagem` no Agendador de Tarefas.
