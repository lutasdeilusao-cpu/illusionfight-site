# Report — Top Trumps SP: Card Scaling + Compact Layout

## Version Bump
| Constante | Antes | Depois |
|---|---|---|
| `TS_VERSION` | 5.31.0 | → **5.32.0** |
| `SITE_VERSION` | 10.169.0 | → **10.170.0** |

## What Changed

### `src/pages/games/TopTrumps/TopTrumps.css`
- **Safe margins**: `.tt-game-container` padding `0 0.75rem 0.5rem` → `0.4rem 0.75rem 0.2rem` (top safe area)
- **Compact header**: padding `0.4rem 0` → `0.25rem 0`
- **Opponent card scaled 2×**: `.tt-card--mini` scale `0.30` → **`0.60`**
- **Opponent wrapper**: margin-top removed, padding-bottom reduced
- **Opponent label**: font-size `0.6rem` → `0.5rem`, margin-bottom `0`
- **Player card**: `align-items: flex-start` → `center` (centralizado)
- **Player card scale overrides**: added 3 media query overrides to TopTrumpsCard responsive scales:
  - `<460px`: `0.54` → **`0.68`** (+26%)
  - `461–768px`: `0.62` → **`0.78`** (+26%)
  - `769–1200px`: `0.75` → **`0.88`** (+17%)
- **VS section**: padding `0`, glow hidden, font-size `2rem` → **`1.4rem`**
- **Footer**: padding condensed

### `src/config/version.js`
- `SITE_VERSION`: `10.169.0` → **`10.170.0`**
- `TS_VERSION`: `5.31.0` → **`5.32.0`**

### `SITE_MAP.md`
- **Rotas version table**: `TS_VERSION` and `SITE_VERSION` entries updated

## Layout Changes (visual summary)
```
┌────────────────────────┐
│   HEADER (compact)     │
├────────────────────────┤
│                        │
│   PLAYER CARD (+26%)   │
│   (scaled bigger,      │
│    centered)           │
│                        │
├────────────────────────┤
│   VS (compact)         │
├────────────────────────┤
│ Opponent label (small) │
│ OPPONENT CARD (2×)     │
│ scale: 0.30 → 0.60     │
├────────────────────────┤
│   FOOTER (compact)     │
└────────────────────────┘
```

## Commit
```
8166b38e — feat: player card +26%, opponent card 2x, compact layout, safe margins + v10.170.0
```

## Deploy
✅ **Published** — `gh-pages` branch updated successfully.
