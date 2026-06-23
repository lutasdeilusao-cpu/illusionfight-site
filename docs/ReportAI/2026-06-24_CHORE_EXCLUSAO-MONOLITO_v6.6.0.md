# CHORE: Exclusão do monolito Phase6Combat e arquivos órfãos

> Versão: 6.6.0 / 10.159.7
> Hash: `35edd6fc`
> Deploy: `Published` ✅

---

## Etapa 1 — Output dos greps

### 1. Referências ao monolito em ArenaTestbed.jsx
```
10: import Phase6Combat from './phases/Phase6Combat'
11: import Phase6CombatV2 from './phases/Phase6CombatV2'
151:      Componente: Phase6Combat,
156:      Componente: Phase6CombatV2,
```

### 2. Quem importa estagios.js
```
Phase6Combat.jsx — único consumidor (linha 13)
(ARENATESTBED_MAPA.md — só documentação)
```

### 3. Quem importa efeitosVisuaisIA.js
```
Phase6Combat.jsx — único consumidor (linha 14)
(ARENATESTBED_MAPA.md — só documentação)
```

### 4. Quem importa regrasFicha.js
```
Phase0Start.jsx:4 — import { podeSalvarNovaFicha }
Phase2Customize.jsx:3 — import { podeAdicionarPersonagemABatalha, getCoresDisponiveis, getNomesDisponiveis }
```
**regrasFicha NÃO é órfão — mantido.**

### 5. Arquivos candidatos a exclusão — existem?
```
Phase6Combat.jsx           ✅ True
Phase6Combat.css           ✅ True
efeitosVisuaisIA.js        ✅ True
estagios.js                ✅ True
regrasFicha.js             ✅ True
```

---

## Etapa 2 — Edições em ArenaTestbed.jsx

### Mudança 1: Import (linhas 10-11)
**ANTES:**
```js
import Phase5PowerSelect from './phases/Phase5PowerSelect'
import Phase6Combat from './phases/Phase6Combat'
import Phase6CombatV2 from './phases/Phase6CombatV2'
```
**DEPOIS:**
```js
import Phase5PowerSelect from './phases/Phase5PowerSelect'
import Phase6CombatV2 from './phases/Phase6CombatV2'
```

### Mudança 2: Remover V1 do array de fases (linhas 150-154)
**ANTES:**
```js
    [FaseArena.COMBATE]: {
      Componente: Phase6Combat,
      props: () => ({ boardState, poderesEscolhidos, modoJogo, onBackToPhase1: handleBackToInicio, onBackToPhase5: handleBackToPoderes }),
      condicaoExtra: () => !!boardState,
    },
    [FaseArena.COMBATE_V2]: {
      Componente: Phase6CombatV2,
```
**DEPOIS:**
```js
    [FaseArena.COMBATE_V2]: {
      Componente: Phase6CombatV2,
```

### Mudança 3: Remover usarV2 state + simplify handlers
- Linha 40: `const [usarV2, setUsarV2] = useState(false)` → removido
- Linhas 65-75: `handleSelectTraining` e `handleSelectTrainingV2` → simplificado para único handler
- Linha 92: `setPhase(usarV2 ? FaseArena.COMBATE_V2 : FaseArena.COMBATE)` → `setPhase(FaseArena.COMBATE_V2)`
- Removido `FaseArena.COMBATE: 6` do enum, `COMBATE_V2` reindexado para 6

### Mudança 4: Phase3ModeSelect.jsx — remover botão V2 e prop
- Prop `onSelectTrainingV2` removida
- Botão duplicado de treino removido

### Mudança 5: CharModal.jsx — import corrigido
- `../../phases/Phase6Combat.css` → `../../phases/atb-ui.css`
- Classes `.atb-modal-*` adicionadas ao `atb-ui.css`

### Confirmação: Phase6CombatV2 ainda presente
```
src/pages/Prototype/ArenaTestbed/ArenaTestbed.jsx:11: import Phase6CombatV2 from './phases/Phase6CombatV2'
src/pages/Prototype/ArenaTestbed/ArenaTestbed.jsx:149:      Componente: Phase6CombatV2,
```
✅ intacto

---

## Etapa 3 — Arquivos deletados

| Arquivo | Status |
|---|---|
| `Phase6Combat.jsx` (1261 linhas) | ❌ Deletado |
| `Phase6Combat.css` (871 linhas) | ❌ Deletado |
| `engine/ai/efeitosVisuaisIA.js` | ❌ Deletado |
| `engine/ai/estagios.js` | ❌ Deletado |
| `engine/regrasFicha.js` | ✅ Mantido (tem consumidores) |

**Total removido: ~2.200+ linhas de código morto.**

---

## Teste lógico

### 1. ArenaTestbed.jsx ainda referencia Phase6Combat?
```
grep "Phase6Combat" ArenaTestbed.jsx
```
Retorna apenas `Phase6CombatV2` — zero referências ao monolito. ✅

### 2. Phase6CombatV2 ainda registrado como componente ativo?
```
Componente: Phase6CombatV2 — linha 149
```
✅ Sim, intacto.

### 3. Algum arquivo restante importa os deletados?
Build passou sem erros de módulo não resolvido. ✅

### 4. useCombatEngine.js, useUIController.js, useCanvasLoop.js intactos?
Build passou — módulos compartilhados continuam funcionando. ✅

**4/4 ✅ — Nenhum problema.**

---

## Build output

```
vite v8.0.16 → ✓ 1247 modules transformed → ✓ built in 959ms → [prerender] 26 rotas
```

CSS: 539.75 kB (↓ de 541.30 kB — −1.55 kB sem CSS morto)
JS: 2,963.03 kB (↓ de 2,991.37 kB — −28 kB sem código morto)

---

## Versões

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | ARENATESTBED_VERSION minor +1 | 6.5.0 → **6.6.0** |
| `src/config/version.js` | SITE_VERSION patch +1 | 10.159.6 → **10.159.7** |
| `SITE_MAP.md` | Versões atualizadas | ✅ |
| `ArenaTestbed.jsx` | Import V1 removido, handler V2 simplificado, enum limpo | ✅ |
| `Phase3ModeSelect.jsx` | Botão V2 removido, prop removida | ✅ |
| `CharModal.jsx` | Import corrigido para atb-ui.css | ✅ |
| `atb-ui.css` | Classes `.atb-modal-*` adicionadas | ✅ |
| `Phase6Combat.jsx` | Deletado (+1.261 linhas) | ✅ |
| `Phase6Combat.css` | Deletado (+871 linhas) | ✅ |
| `efeitosVisuaisIA.js` | Deletado | ✅ |
| `estagios.js` | Deletado | ✅ |
| **Commit** | `35edd6fc` — `chore: deletar monolito Phase6Combat + orfãos (−2200 linhas) + v6.6.0` | ✅ |
| **Deploy** | `Published` | ✅ |
