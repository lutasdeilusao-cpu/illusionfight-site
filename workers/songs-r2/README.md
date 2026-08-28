# songs-r2 Worker

Serve os MP3 do bucket R2 `songsillusionfight` (prefixo `Songs/`) para o player da Nina no site.

URL: `https://fancy-recipe-c0b4.lutasdeilusao.workers.dev/`

## Setup no dashboard (uma vez)

1. **Workers & Pages → `fancy-recipe-c0b4` → Settings → Bindings → Add → R2 bucket**
   - Variable name: `BUCKET`
   - R2 bucket: `songsillusionfight`
2. **Edit code** → colar o conteúdo de `worker.js` → **Deploy**

## Teste

- `GET https://fancy-recipe-c0b4.lutasdeilusao.workers.dev/` → JSON com a lista de faixas
- `GET https://fancy-recipe-c0b4.lutasdeilusao.workers.dev/Nuvens.mp3` → toca o arquivo

## Deploy via CLI (alternativa)

```
cd workers/songs-r2
npx wrangler deploy
```
