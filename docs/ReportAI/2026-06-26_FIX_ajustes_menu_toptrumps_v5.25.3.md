# FIX: Ajustes visuais menu Top Trumps SP

**Data:** 2026-06-26
**Versão:** TS 5.25.2 → 5.25.3 | SITE 10.163.8 → 10.163.9

---

## ETAPA 1 — Prova de leitura

### `tt-page--menu|tt-menu|Back to Games|...` em TopTrumps.jsx
```
577: <section className="tt-page tt-page--menu"><div className="tt-menu-bg" /><div className="tt-menu-layout">
582: <div className="tt-menu-cards"><div className="tt-card-stack">
584: <div className="tt-card-sample tt-card-sample--3"><div className="tt-card-sample-pattern" /><div className="tt-card-sample-logo">LDI</div></div>
586: <div className="tt-menu-content">
587: <div className="tt-title-group"><h1 className="tt-title-main">{t('games.toptrumps.menu_titulo')}</h1><span className="tt-title-sub">{t('games.toptrumps.menu_subtitulo')}</span></div>
608: <div className="tt-modo-card" onClick={() => { ... }}>
609: <h3 className="tt-modo-titulo">{t('games.toptrumps.menu_single_player')}</h3>
613: <h3 className="tt-modo-titulo">{t('games.toptrumps.menu_multiplayer')}</h3>
669: <BackToGamesBtn onClick={...} label={t('games.toptrumps.menu_voltar_games')} />
```

### `tt-page--menu|tt-menu|text-align|justify-content|align-items` em TopTrumps.css
```
33: justify-content: center;  (tt-page--menu)
47: align-items: center;      (tt-menu-layout)
57: justify-content: center;  (tt-menu-cards)
58: align-items: center;      (tt-menu-cards)
130: .tt-menu-content {        (max-width: 420px — SEM flex/align)
236: .tt-modo-card {            (SEM text-align/flex)
```

---

## ETAPA 2 — Correções aplicadas

### 2.1 Título: "TOP TRUMPS" → "LDI TOP TRUMPS"

**ANTES (pt.json:1493, en.json:1466, es.json:1466):**
```json
"menu_titulo": "TOP TRUMPS"
```
**DEPOIS:**
```json
"menu_titulo": "LDI TOP TRUMPS"
```

### 2.2 Botões SP/MP — centralizar texto

**ANTES (TopTrumps.css:236-243):**
```css
.tt-modo-card {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  position: relative;
}
```
**DEPOIS:**
```css
.tt-modo-card {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
```

### 2.3 BackToGamesBtn — centralizar

**ANTES (TopTrumps.css:130-132):**
```css
.tt-menu-content {
  max-width: 420px;
}
```
**DEPOIS:**
```css
.tt-menu-content {
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

---

## ETAPA 3 — Teste lógico

| Item | Status |
|------|--------|
| Título "LDI TOP TRUMPS" centralizado (via `.tt-menu-content align-items:center`) | ✅ |
| Texto dentro dos botões SP/MP centralizado (via `.tt-modo-card text-align/flex`) | ✅ |
| Botão "Back to Games" centralizado (via `.tt-menu-content align-items:center`) | ✅ |

---

## Build output

```
npm run build
vite v8.0.16 building for production...
✓ 1245 modules transformed.
dist/index.html                    4.98 kB │ gzip: 1.84 kB
dist/assets/index-BGbGLmFO.css    560.28 kB │ gzip: 91.02 kB
dist/assets/index-DqUXx4vc.js     2,746.90 kB │ gzip: 814.62 kB
✓ built in 1.84s
[prerender] 26 rotas pré-renderizadas
```

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | TS_VERSION bump | 5.25.2 → **5.25.3** |
| `src/config/version.js` | SITE_VERSION bump | 10.163.8 → **10.163.9** |
| `SITE_MAP.md` | Versão atualizada | ✅ |

## Commit

```
b9030b9c — fix: ajustes visuais menu Top Trumps SP + v10.163.9
```

## Deploy

Status: ✅ Published
