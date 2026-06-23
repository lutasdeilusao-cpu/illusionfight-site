# FIX: Favicon-ldi.png instalado

> Versão: 10.159.1
> Hash: `70807ccd`
> Deploy: `Published` ✅

---

## Etapa 1 — Prova de leitura (outputs brutos)

### find: favicon files (antes)
```
C:\...\dist\favicon.svg
C:\...\node_modules\... (gh-pages cache)
C:\...\node_modules\@supabase\phoenix\priv\static\favicon.ico
C:\...\public\favicon.svg
C:\...\favicon_512.png
```

### ls -la public/ (antes)
```
assets, fonts, games, leaderboard, livro, loja, mundo, musicas, personagens, quiz, webtoon,
404.html, CNAME, favicon.svg, og-image.jpg, sitemap.xml, sw.js, _redirects
```

### grep "favicon" index.html (antes)
```
index.html:36:    <!-- Favicon -->
index.html:37:    <link rel="icon" type="image/png" href="/favicon-ldi.png" />
index.html:38:    <link rel="apple-touch-icon" href="/favicon-ldi.png" />
```

---

## Etapa 2 — Mover favicon_512.png → public/favicon-ldi.png

Comando executado:
```powershell
Copy-Item -LiteralPath "favicon_512.png" -Destination "public\favicon-ldi.png"
Remove-Item -LiteralPath "favicon_512.png"
Remove-Item -LiteralPath "public\favicon.svg" -Force
```

### find confirmação (depois)
```
C:\...\public\favicon-ldi.png
```
Único favicon source no projeto (fora de node_modules/ e dist/).

---

## Etapa 3 — Confirmar index.html

Já estava correto da task anterior:
```html
<link rel="icon" type="image/png" href="/favicon-ldi.png" />
<link rel="apple-touch-icon" href="/favicon-ldi.png" />
```

---

## Teste lógico

### Fluxo 1 — public/favicon-ldi.png existe e é o único favicon source
`public/favicon-ldi.png` existe. Nenhum outro `favicon*` fora de node_modules/dist. ✅

### Fluxo 2 — index.html aponta para /favicon-ldi.png
`<link rel="icon" type="image/png" href="/favicon-ldi.png" />` ✅

### Fluxo 3 — Nenhum favicon_512.png ou favicon.svg solto fora de public/
`favicon_512.png` removido da raiz. `public/favicon.svg` removido. ✅

---

## Build output

```
vite v8.0.16 building client environment for production...
✓ 1247 modules transformed.
✓ built in 948ms
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

dist/favicon-ldi.png presente. dist/favicon.svg ausente (correto).

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION patch +1 | 10.159.0 → **10.159.1** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| `public/favicon-ldi.png` | Criado (a partir de favicon_512.png) | ✅ |
| `public/favicon.svg` | Removido | ✅ |
| `favicon_512.png` (raiz) | Removido | ✅ |
| **Commit** | `70807ccd` — `fix: favicon-ldi.png instalado v10.159.1` | ✅ |
| **Deploy** | `Published` | ✅ |

---

## Teste manual pendente

- [ ] Abrir `https://illusionfight.com` no browser e verificar se o favicon (logo LDI) aparece na aba
- [ ] Hard refresh (Ctrl+F5) para limpar cache do favicon antigo
