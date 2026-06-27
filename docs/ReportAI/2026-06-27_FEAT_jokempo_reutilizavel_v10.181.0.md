# FEAT — Componente Jokempo Reutilizável — v10.181.0

> Criação do componente `<Jokempo>` em `src/components/Jokempo/` e migração de Top Trumps + ArenaTestbed.

---

## 1. Arquivos criados

| Arquivo | Descrição |
|---|---|
| `src/components/Jokempo/Jokempo.jsx` | Componente React reutilizável (101 linhas) |
| `src/components/Jokempo/Jokempo.css` | Estilos do componente (142 linhas) |

## 2. Componente `<Jokempo>` — API

```jsx
<Jokempo
  player1Name="Jogador"          // Nome do jogador 1
  player2Name="IA"               // Nome do jogador 2
  animated={true}                 // true = JO/KEN/PÔ animação, false = resultado direto
  onResult={(winnerName) => ...}  // Callback com nome do vencedor (null = empate)
  i18nLabels={{                   // Todas as labels customizáveis
    title, subtitle, rock, paper, scissors,
    you, opponent, win, lose, draw
  }}
/>
```

- Emojis via Unicode escapes (`\u270A`, `\u270B`, `\u270C\uFE0F`) — imune a corrupção de encoding
- Botões com `touch-action: manipulation` — compatível com mobile
- Animação JO/KEN/PÔ com cycling de emojis a 400ms por passo
- Timer limpo no unmount (cleanup do interval)

## 3. Migrações

### Top Trumps (`TopTrumps.jsx`)

| Antes | Depois |
|---|---|
| 7 state vars + 2 funções + 85 linhas JSX inline | `<Jokempo animated={true}>` com `resolverPPT` callback |
| `import { ... }` + estado PPT | `import Jokempo from '../../../components/Jokempo/Jokempo'` |
| Handle via `handlePptEscolha` + `determinarVencedorPPT` | Handle via `onResult → resolverPPT` |

**Linhas alteradas:**
- Import adicionado na linha 17
- State vars removidos (linhas 161-168)
- Reset PPT removido de `iniciarJogoComCartas` (linhas 256-263)
- Funções `determinarVencedorPPT`, `delay`, `handlePptEscolha` substituídas por `resolverPPT` (linhas 268-333)
- JSX da fase PPT substituído (linhas 768-850)

### ArenaTestbed (`Phase6CombatV2.jsx`)

| Antes | Depois |
|---|---|
| `import JokenpoModal` + `<JokenpoModal>` | `import Jokempo` + `<Jokempo animated={false}>` |
| `JokenpoModal.jsx` + `JokenpoModal.css` | **Deletados** |

**Linhas alteradas:**
- Import substituído na linha 10
- Instanciação substituída nas linhas 523-528
- CSS overlay adicionado em `Phase6CombatV2.css`
- Overlay `.arena-jkp-overlay` com `position: fixed`, `z-index: 500`, `backdrop-filter: blur(4px)`

### Arquivos deletados
- `src/pages/lab/Prototype/ArenaTestbed/components/modals/JokenpoModal.jsx`
- `src/pages/lab/Prototype/ArenaTestbed/components/modals/JokenpoModal.css`

## 4. Verificações

- `grep JokenpoModal` em todo `src/` → **vazio** ✅
- `Test-Path JokenpoModal.jsx` → **False** ✅
- `Test-Path JokenpoModal.css` → **False** ✅
- Build passou sem erros ✅
- Apenas arquivos esperados no `git diff` ✅

## 5. Versões

| Constante | Antes | Depois |
|---|---|---|
| `SITE_VERSION` | 10.180.4 | **10.181.0** |
| `TS_VERSION` | 5.39.4 | **5.40.0** |
| `ARENATESTBED_VERSION` | 6.21.4 | **6.22.0** |

## 6. Commit & Deploy

- **Commit:** `0e6bd988` — `feat: componente Jokempo reutilizavel — migrar TopTrumps + ArenaTestbed + v10.181.0`
- **Deploy:** Published ✅
