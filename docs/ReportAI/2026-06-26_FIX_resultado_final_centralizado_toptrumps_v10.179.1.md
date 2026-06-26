# Report — Top Trumps SP: Tela Resultado Final Centralizada + Botão Som

**Versão SITE:** 10.179.0 → **10.179.1**
**Versão TS:** 5.37.0 → **5.37.1**
**Data:** 2026-06-26

---

## Correções

### 1. Centralização vertical — `.tt-page` (L543)

**ANTES (L536-546):**
```css
.tt-page {
  height: 100dvh;
  padding: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: transparent;
  overflow: hidden;
}
```

**DEPOIS (L536-547):**
```css
.tt-page {
  height: 100dvh;
  padding: 0;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent;
  overflow: hidden;
}
```

**Análise de impacto por fase:**
| Fase | Efeito |
|---|---|
| Menu (`.tt-page--menu` já tem `justify-content:center`) | Sem mudança ✅ |
| PPT (`.tt-ppt-container` único flex child) | Centrado verticalmente ✅ |
| Jogando (`.tt-game-container` com `height:100dvh`) | Sem mudança ✅ |
| Resultado rodada (`.tt-result-container` com `height:100dvh`) | Sem mudança ✅ |
| Recompensa (`.tt-recompensa` único flex child) | Centrado verticalmente ✅ |
| **Fim jogo** (`.tt-relatorio` único flex child) | **Centrado verticalmente — FIX** ✅ |

### 2. Botão som não sobrepõe título — `.tt-relatorio` (L1252)

**ANTES (L1247-1250):**
```css
.tt-relatorio {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}
```

**DEPOIS (L1248-1253):**
```css
.tt-relatorio {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding-top: 3.5rem;
}
```

### Bundle confirmado
```
.tt-page{...;justify-content:center;...}
.tt-relatorio{...;padding-top:3.5rem}
```

---

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `TS_VERSION` | 5.37.0 | **5.37.1** |
| `SITE_VERSION` | 10.179.0 | **10.179.1** |

## Deploy

| Etapa | Hash/Status |
|---|---|
| **Commit** | `0179ac0e` |
| **Push** | ✅ |
| **Deploy** | Published ✅ |
