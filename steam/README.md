# Illusion Fight — Steam Demo

Shell Windows da demo de `Illusion Fight — Season 1`. O aplicativo abre o portal oficial online em uma WebView do sistema e identifica o runtime com parâmetros não secretos.

## Identificação

- Steam Demo App ID: `5188520`
- App principal relacionado: `1876210`
- Shell: `0.1.0`
- Executável: `IllusionFightDemo.exe`
- URL: `https://illusionfight.com/?client=steam-demo&shellVersion=0.1.0`
- Depot Windows da demo: `DEMO_DEPOT_ID` (pendente no Steamworks)

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

1. No Steamworks, crie ou identifique o depot Windows pertencente à demo `5188520`.
2. Copie os dois `.vdf.example` desta pasta removendo `.example`.
3. Substitua todas as ocorrências literais de `DEMO_DEPOT_ID` pelo Depot ID real.
4. Baixe o Steamworks SDK pelo portal Steamworks e coloque as ferramentas fora do repositório ou em `steam/steampipe/sdk/`.
5. A partir de `steam/steampipe/scripts/`, autentique com uma conta autorizada e envie:

```powershell
steamcmd +login <STEAM_USERNAME> +run_app_build_http app_build_5188520.vdf +quit
```

Nunca grave senha, Steam Guard, token ou chave neste repositório. O exemplo não ativa branch automaticamente; confira o build no Steamworks antes de vinculá-lo a uma branch.

## Configuração manual pendente no Steamworks

- Informar o Depot ID Windows real nos VDFs.
- Sincronizar o depot Windows com o App ID da demo `5188520`.
- Definir a Launch Option para `IllusionFightDemo.exe` no sistema operacional Windows.
- Publicar/ativar o build na branch desejada somente depois do teste pelo cliente Steam.
- Finalizar store checklist, packages/licenças e visibilidade da demo.

Compras externas e checkout Stripe são desativados no runtime `steam-demo`; o portal web normal preserva o comportamento existente. Os parâmetros do runtime servem para apresentação e compatibilidade, nunca como controle de segurança do servidor.
