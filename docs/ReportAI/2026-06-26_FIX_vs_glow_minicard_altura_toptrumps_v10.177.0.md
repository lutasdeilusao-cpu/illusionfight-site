# Report — Top Trumps SP: VS Glow Intensidade + Mini Card Altura

**Versão SITE:** 10.176.0 → **10.177.0**
**Versão TS:** 5.34.0 → **5.35.0**
**Data:** 2026-06-26

---

## O que foi feito

### 1. VS Heartbeat Glow — mais intenso

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css:2443-2463`

| Propriedade | Antes | Depois |
|---|---|---|
| `width/height` | 60px | **70px** |
| `background` radial-gradient | 0% opacidade 0.25 → 50% opacidade 0.08 | **0% opacidade 0.55 → 50% opacidade 0.15** |
| `filter` | *(ausente)* | **blur(2px)** |
| `::after inset` | -8px | **-10px** |
| `::after border` | 1.5px solid rgba(..., 0.3) | **2px solid rgba(..., 0.65)** |
| `::after box-shadow` | *(ausente)* | **3 camadas: 12px/0.5, 24px/0.3, inset 12px/0.15** |

### 2. Mini Card — altura para preencher até o botão Give Up

**Arquivo:** `src/pages/games/TopTrumps/TopTrumps.css:2372-2380`

| Propriedade | Antes | Depois |
|---|---|---|
| `.tt-card--mini-wrapper height` | 240px | **238px** |

**Cálculo:** card real 720px × scale(0.33) ≈ 238px. Total vertical: 8+40+510+56+20+238+50+8 = **930px** ≤ 932px (iPhone 14 Pro Max). Zero scroll vertical.

---

## Checklist

| Etapa | Status |
|---|---|
| Etapa 1 — Prova de leitura (AGENTS.md + CSS + JSX) | ✅ |
| Etapa 2 — VS glow CSS (60px→70px, opacidade 0.55, blur, box-shadow) | ✅ |
| Etapa 3 — Mini card height (240px→238px) | ✅ |
| Etapa 4 — Verificação altura ≤ 932px (930px calculado) | ✅ |
| Etapa 5 — Teste lógico (espaço disponível = 240, card visual = 238, logo height:238) | ✅ |
| Etapa 6 — Bump version + build + commit + push + deploy | ✅ |
| Etapa 7 — Report escrito | ✅ |

---

## Tabela de Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/pages/games/TopTrumps/TopTrumps.css` | VS glow intensidade + mini card height 238px | — |
| `src/config/version.js` | TS_VERSION bump | 5.34.0 → **5.35.0** |
| `src/config/version.js` | SITE_VERSION bump | 10.176.0 → **10.177.0** |
| `SITE_MAP.md` | Versões atualizadas | ✅ |
| **Commit** | `4aec6beb` — `fix: VS glow intensidade + mini card altura 238px TopTrumps + v10.177.0` | ✅ |
| **Push** | `main → origin/main` | ✅ |
| **Deploy** | gh-pages Published | ✅ |
