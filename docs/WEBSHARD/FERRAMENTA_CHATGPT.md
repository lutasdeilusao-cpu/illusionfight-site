# Gerar pelo site do ChatGPT (Chrome conectado)

Serve para teste e poucas páginas; lote continua no Codex. Automatizar o site pode violar os termos de uso da OpenAI.

1. Abrir um Chrome comum com perfil próprio: `chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\webshard_refs\chatgpt_bot\perfil_cdp --force-dark-mode --enable-features=WebContentsForceDark https://chatgpt.com/images`.
2. O login é manual, nessa janela. Chrome aberto pelo Playwright é recusado pelo Google.
3. Conectar com `chromium.connectOverCDP('http://127.0.0.1:9222')`. Script pronto: `C:\webshard_refs\chatgpt_bot\gera.cjs`.
4. Anexar as fichas com `setInputFiles` no `input[type=file][accept="image/*"]` que não é o de câmera. Os rótulos mudam com o idioma da conta.
5. Esperar sumirem as barras de envio, clicar no campo editável, usar `keyboard.insertText` com o prompt e clicar em Enviar.
6. A imagem pronta tem `alt` com "gerada" e `src` em `blob:`. Salvar por `fetch` dentro da página, nunca por requisição externa.

Refs ficam em `C:\webshard_refs`, sem acento no caminho. O navegador integrado do VS Code pela extensão não sobe arquivo e trava nessa página.

**Lote pelo ChatGPT: todo job passa por `prepara_lote.py <de> <até>`** (pasta `PRODUCAO/ferramentas` do conto). Ele monta um anexo único com uma página aprovada + `Baloes_LetreiroOficial.png`, soma as fichas de quem aparece (pessoas antes do cenário, até 8 anexos no navegador; o Codex continua com 5) e fixa fonte e cores no fim de todo prompt. Fonte descrita só em palavras sai diferente no ChatGPT e a cor varia. Revisar a primeira página do lote antes de deixar correr.

