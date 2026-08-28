# Illusion Fight — Steam Demo

Shell Windows da demo de `Illusion Fight — Season 1`. O aplicativo abre o portal oficial online em uma WebView do sistema e identifica o runtime com parâmetros não secretos.

## Identificação

- Steam Demo App ID: `5188520`
- App principal relacionado: `1876210`
- Shell: `0.1.1`
- Executável: `IllusionFightDemo.exe`
- URL: `https://illusionfight.com/?client=steam-demo&shellVersion=0.1.1`
- Depot Windows da demo: `5188521`
- A janela abre maximizada com barra de título do SO (`decorations: true`, `fullscreen: false` em `src-tauri/tauri.conf.json`) — garante que o jogador sempre tenha o X nativo pra fechar.

O shell exige internet e o Microsoft Edge WebView2 Evergreen Runtime. O instalador Tauri usa o bootstrapper padrão para obter o WebView2 quando ele estiver ausente. Não há modo offline, Steamworks SDK, updater, comandos nativos, plugins ou credenciais embutidas.

## Build local

Instale as dependências Windows do Tauri 2 (Rust/MSVC e WebView2) e execute na raiz:

```powershell
npm install
npm run desktop:dev
npm run desktop:build
```

`desktop:build` gera o executável release e o instalador NSIS sob `src-tauri/target/release/`.

## Preparar conteúdo Steam

```powershell
npm run desktop:steam
```

O comando compila sem empacotador e copia somente `IllusionFightDemo.exe` para `steam/content/`. Esse diretório e os resultados da SteamPipe não entram no Git.

## SteamPipe

Depot Windows da demo: `5188521` (já preenchido nos `.vdf.example`).

1. `npm run desktop:steam` — gera `IllusionFightDemo.exe` e copia para `steam/content/`.
2. Copie os dois `.vdf.example` desta pasta removendo `.example` (ou use as cópias já
   preparadas no ContentBuilder do SDK).
3. A partir da pasta do ContentBuilder do Steamworks SDK, autentique com uma conta
   autorizada e rode um build de teste (`"Preview" "1"` → nada é enviado):

```powershell
cd <SDK>\tools\ContentBuilder
.\builder\steamcmd.exe +login <STEAM_USERNAME> +run_app_build "<SDK>\tools\ContentBuilder\scripts\app_build_5188520.vdf" +quit
```

> **Use o caminho ABSOLUTO do `.vdf`.** O `steamcmd` resolve o argumento de
> `run_app_build` a partir da pasta do próprio `steamcmd.exe` (`builder\`), e não
> da pasta atual — por isso `.\scripts\app_build_5188520.vdf` dá
> `ERROR! App build file does not exist`. Os caminhos `BuildOutput` /
> `ContentRoot` dentro do `.vdf` continuam relativos ao próprio `.vdf`.

4. Se o preview passar, troque `"Preview" "1"` → `"Preview" "0"` no
   `app_build_5188520.vdf` e rode o mesmo comando para subir de verdade.
5. Confira o build no Steamworks (SteamPipe → Builds) antes de vinculá-lo a uma branch.

Nunca grave senha, Steam Guard, token ou chave neste repositório. O comando não ativa branch automaticamente.

## Configuração manual pendente no Steamworks

- Confirmar que o depot `5188521` está associado ao App da demo `5188520`.
- Definir a Launch Option para `IllusionFightDemo.exe` no sistema operacional Windows.
- Publicar/ativar o build na branch desejada somente depois do teste pelo cliente Steam.
- Finalizar store checklist, packages/licenças e visibilidade da demo.

Compras externas e checkout Stripe são desativados no runtime `steam-demo`; o portal web normal preserva o comportamento existente. Os parâmetros do runtime servem para apresentação e compatibilidade, nunca como controle de segurança do servidor.
