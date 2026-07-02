# Relatório — Kernel Games: Pasta Categoria + Card Grid + Modo Imersivo

**Data:** 2026-07-02
**Versão site:** 10.183.37 → **10.183.38**
**Versão KP:** 1.2.0 → **1.3.0**
**Commit:** `0e7ac603`
**Deploy:** ✅ Published

---

## O que foi feito

### ETAPA 2 — Movimentação de pasta
- Criada `src/pages/games/KernelGames/`
- Movido `KernelPanic/` (completo: components/, hooks/, data/, i18n/, KernelPanic.jsx, KernelPanic.css) para `src/pages/games/KernelGames/KernelPanic/`

### Imports corrigidos

| Arquivo | ANTES | DEPOIS |
|---|---|---|
| `KernelGames/KernelPanic/hooks/useKpI18n.js:2` | `from '../../../../context/LanguageContext'` | `from '../../../../../context/LanguageContext'` |
| `Games.jsx:43` | `import('./KernelPanic/KernelPanic')` | `import('./KernelGames/KernelPanic/KernelPanic')` |
| `App.jsx` | (não existia) | `import KernelPanic from './pages/games/KernelGames/KernelPanic/KernelPanic'` |

### ETAPA 3 — Renomeação + Card Grid

| Chave i18n | Antes | Depois |
|---|---|---|
| `toggle_kernel` (PT/EN/ES) | "Kernel Panic" | "Kernel Games" |
| `nomes.kernel_panic` (PT/EN/ES) | (não existia) | "Kernel Panic" |
| `taglines.kernel_panic` (PT/EN/ES) | (não existia) | "Protocolo de Eliminação" / "Elimination Protocol" / "Protocolo de Eliminación" |

Em `Games.jsx`:
- `KERNEL_JOGOS` array criado (preparado para futuros cards)
- Toggle Kernel agora renderiza grade de cards (mesmo padrão LDI) em vez do jogo inline
- `kernelpanic` removido de `FICHA_GAMES`
- `KernelPanicComp` lazy import removido

### ETAPA 4 — Modo Imersivo

`KernelPanic.jsx:24-25`:
```jsx
const { setReaderMode } = useReader()
useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])
```

Rota `/games/kernel-panic` adicionada em `App.jsx:116`

---

## Arquivos movidos (28)

```
src/pages/games/KernelPanic/ → src/pages/games/KernelGames/KernelPanic/
├── KernelPanic.jsx          (98% — +readerMode)
├── KernelPanic.css          (100%)
├── components/
│   ├── KPAIWaitOverlay.jsx
│   ├── KPDefenseModal.jsx
│   ├── KPFieldSlot.jsx
│   ├── KPHandCard.jsx
│   ├── KPHandoffScreen.jsx
│   ├── KPInfoBar.jsx
│   ├── KPInspectModal.jsx
│   ├── KPIntelModal.jsx
│   ├── KPMenu.jsx
│   ├── KPMessagePopup.jsx
│   ├── KPPerigoMeter.jsx
│   ├── KPPlayerPanel.jsx
│   ├── KPReactionPopup.jsx
│   ├── KPResultOverlay.jsx
│   ├── KPShotModal.jsx
│   ├── KPTerrainBar.jsx
│   └── KPVictoryScreen.jsx
├── hooks/
│   ├── useAITurnPresenter.js
│   ├── useKernelPanicEngine.js
│   └── useKpI18n.js         (94% — +1 ../ no import)
├── data/
│   ├── cards.js
│   └── terrain.js
└── i18n/
    ├── en.json
    ├── es.json
    └── pt.json
```

---

## Teste lógico

| Fluxo | Status |
|---|---|
| Build intermediário pós-movimentação | ✅ |
| Build final pós todas as mudanças | ✅ |
| /games → aba "Kernel Games" | Aguarda teste manual |
| Grade de cards visível | Aguarda teste manual |
| Clicar card → /games/kernel-panic | Aguarda teste manual |
| Modo imersivo (sem header/nav) | Aguarda teste manual |
| Sair → layout normal restaurado | Aguarda teste manual |
| Aba LDI Games intacta | ✅ (código não alterado) |
| Nenhum import quebrado | ✅ (build passou) |

---

## O que testar manualmente

1. `/games` → aba "Kernel Games" aparece
2. Clicar aba → grade com card "Kernel Panic" estilizado (roxo neon)
3. Clicar card → navega para `/games/kernel-panic`
4. Jogo abre sem Navbar, TrialBanner, Footer visíveis
5. Sair do jogo (via menu) → site normal restaurado
