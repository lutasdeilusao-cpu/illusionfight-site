# INV — Buracos no grid durante movimento/projétil da IA

> **Data:** 2026-06-23
> **Versão:** SITE 10.160.13 → **10.160.14** / ARENATESTBED 6.9.10 → **6.9.11**
> **Tipo:** Investigação pura (sem correção de código)
> **Autor:** AI Agent (opencode)

---

## 1. Output bruto dos 5 greps

### Grep 1 — Como drawCombatBoard desenha os hexágonos base do grid

```
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:5:    damageFlash, projectilePos, projectilePath,
caminhoEscolhido, destinoEscolhido,
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:6:    tileImg, sz,
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:9:    hexCenter, drawHex,
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:15:  const projPathSet = new Set(projectilePath.map(c =>
`${c.row}_${c.col}`))
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:71:      if (!obs && !itensChaoAtual[key] && tileImg) {
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:82:        ctx.drawImage(tileImg, center.x - sz, center.y - sz, sz * 2, sz * 2)
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:84:          ctx.fillStyle = fill
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:97:        ctx.strokeStyle = stroke
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:102:        drawHex(ctx, center, sz, fill, stroke, lw, shadow)
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:218:      if (projPathSet.has(key) && projectilePos?.row !== row && projectilePos?.col !== col) {
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:219:        drawHex(ctx, center, sz, fill, 'rgba(255,200,0,0.3)', 2)
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:222:      if (projectilePos && projectilePos.row === row && projectilePos.col === col) {
```

### Grep 2 — Como o loop de canvas funciona

```javascript
export default function useCanvasLoop({ draw, calcVersion, onFrame }) {
  const rafRef = useRef(null)
  useEffect(() => {
    function loop() {
      if (onFrame) onFrame()
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw, calcVersion])
}
```

### Grep 3 — Como characters são passados para drawCombatBoard

```
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:3:    characters, obstaculos, itensChaoAtual, cols, rows,
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:24:      const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:252:      const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
```

### Grep 4 — Como syncCharacters funciona no engine

```
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:82:  function syncCharacters(updater) {
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:562:            charsRef.current = charsRef.current.map(c => c.id === iaChar.id ? { ...c, posicao: { row: steps[stepIdx].row, col: steps[stepIdx].col } } : c)
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:686:      syncCharacters, getCharacters, setAnimTimer, clearAnimTimers, addLog, turnVersion,
```

### Grep 5 — Como trail e movimento da IA interagem com canvas

```
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:27:  onTrail, onClearTrail, onClearHighlight, onBannerIA, onAnimating, onProjetilPos, onProjetilPath,
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:95:  function setAnimTimer(fn, delay) {
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:276:    function avancarPasso() {
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:285:      if (onTrail) onTrail({ row: passo.row, col: passo.col })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:556:          function avancarPassoIA() {
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:562:            charsRef.current = charsRef.current.map(c => c.id === iaChar.id ? { ...c, posicao: { row: steps[stepIdx].row, col: steps[stepIdx].col } } : c)
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:564:            if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col })
src\pages\Prototype\ArenaTestbed\engine\useCombatEngine.js:565:            stepIdx++; setAnimTimer(avancarPassoIA, 150)
```

---

## 2. Respostas Q1–Q5

### Q1 — O `clearRect` é chamado a cada frame antes de redesenhar o grid inteiro?

**Sim.** `Phase6CombatV2.jsx:228`:
```javascript
ctx.clearRect(0, 0, canvas.width, canvas.height)
```

Chamado toda vez que `draw()` executa (a cada frame do RAF loop). O grid é integralmente redesenhado após o clear. Sem persistência de frame anterior.

**Prova visual:**
- `drawCombatBoard.js:19-20` — loop `for row / for col` varre TODAS as células, sem filtro ou early return.
- `drawCombatBoard.js:26` — `let fill = '#3d2208'` é o fallback default. Toda célula recebe um fill.

**Conclusão:** Clear correct. Todo frame → clear completo → redesenho completo. Nenhum frame anterior persiste.

---

### Q2 — Durante `avancarPassoIA`, os `characters` refletem a posição ATUAL a cada passo?

**Há um lag de 1 frame.**

`useCombatEngine.js:562-563`:
```javascript
charsRef.current = charsRef.current.map(c => c.id === iaChar.id ? { ...c, posicao: { row: steps[stepIdx].row, col: steps[stepIdx].col } } : c)
setCharacters(charsRef.current)
```

- `charsRef.current` é atualizado **sincronamente**.
- `setCharacters(charsRef.current)` agenda um re-render React (assíncrono).
- `draw` (useCallback em `Phase6CombatV2.jsx:219`) captura `characters` do **estado React**, não da ref.
- O RAF loop (`useCanvasLoop.js:6-14`) reinicia quando `draw` muda. Entre o cancelamento do RAF antigo e o novo RAF, há ~1 frame onde o `draw` antigo (com `characters` stale) executa.

**Evidência:** `draw` deps em `Phase6CombatV2.jsx:238` incluem `characters`.

**Impacto:** O personagem aparece na posição VELHA por 1 frame extra. A célula NOVA mostra apenas o tile (sem personagem) por 1 frame. Visualmente, isso NÃO é um "vazio" — a célula nova tem tile normal, só não tem o boneco até o próximo frame.

---

### Q3 — O `syncCharacters` é síncrono ou assíncrono em relação ao loop de canvas?

`syncCharacters` (`useCombatEngine.js:82-86`) é **síncrono**:
```javascript
function syncCharacters(updater) {
  const next = typeof updater === 'function' ? updater(charsRef.current) : updater
  charsRef.current = next
  setCharacters(next)
}
```

Atualiza `charsRef.current` e chama `setCharacters` no mesmo tick. Mas `setCharacters` é uma atualização de estado React — o re-render acontece no próximo ciclo de renderização, não imediatamente.

O RAF loop (useCanvasLoop.js) opera no **próximo** `requestAnimationFrame`. Entre o `setCharacters` e o próximo RAF, a posição do personagem no estado React está desatualizada.

**Conclusão:** syncCharacters é síncrono na REF, mas o `draw` lê do estado React que está 1 render atrás. Não há condição de corrida — é um delay determinístico de 1 frame.

---

### Q4 — Os "buracos" são hexágonos que ficam pretos/vazios ou desaparecem completamente?

**São células que mostram o BACKGROUND escuro do container.** O canvas tem `clearRect` que define pixels como transparentes (rgba(0,0,0,0)). O CSS de `.atb-canvas-wrap` (`atb-canvas.css:10-15`) tem:
```css
background: radial-gradient(...), linear-gradient(135deg, #2a1500 0%, #1e1000 30%, ...)
```

Se uma célula não é desenhada ou tem seu fill/stroke removido, o fundo escuro do container aparece através do canvas transparente — criando um "buraco escuro."

**Conclusão:** O buraco é a ausência de desenho na célula, não uma cor errada. O tile ou fill da célula não está sendo aplicado em alguns frames.

---

### Q5 — O `tileImg` está sendo aplicado corretamente a cada frame?

**Sim, com uma exceção: o overlay do caminho do projétil sobrescreve o tile.**

`drawCombatBoard.js:71`:
```javascript
if (!obs && !itensChaoAtual[key] && tileImg) {
```

O tile é desenhado via `clip + drawImage` (linhas 72-82). `tileImg` é `tileImgRef.current` (`Phase6CombatV2.jsx:234`), uma ref que nunca é null após o carregamento. O `draw` depende de `tileLoaded` (`Phase6CombatV2.jsx:238`), garantindo que o draw só use o tile após o carregamento.

**Problema identificado — overlay do projétil:**

`drawCombatBoard.js:218-219`:
```javascript
if (projPathSet.has(key) && projectilePos?.row !== row && projectilePos?.col !== col) {
  drawHex(ctx, center, sz, fill, 'rgba(255,200,0,0.3)', 2)
}
```

Para células no caminho do projétil (onde o projétil NÃO está no momento), `drawHex` é chamado com `fill` (o fill da célula, ex: `#3d2208`). `drawHex` (`useHexCanvas.js:14-35`) executa:
```javascript
ctx.fillStyle = fill
ctx.fill()
```

Como `fill` para células normais do grid é `#3d2208` (OPACO), o `drawHex` pinta um hexágono sólido marrom POR CIMA do tile texture. O tile (drawImage com textura) é completamente coberto pelo fill opaco.

**Isso transforma células texturizadas em hexágonos sólidos escuros.** Em um fundo escuro (`#2a1500` a `#1a0e00`), esses hexágonos sólidos podem se confundir com o fundo, criando a impressão de "buracos."

---

## 3. Hipótese final

### Hipótese principal: overlay do projétil cobre o tile com fill opaco

**Arquivo:** `drawCombatBoard.js:218-219`
**Mecanismo:** `drawHex(ctx, center, sz, fill, 'rgba(255,200,0,0.3)', 2)` desenha um hexágono sólido com `fill` (ex: `#3d2208`) sobre o tile texture, escondendo a textura.

**Evidência:**
- `drawHex` em `useHexCanvas.js:14-35`: `ctx.fillStyle = fill; ctx.fill()` — pinta opaco.
- `drawCombatBoard.js:71-87`: tile é desenhado com `drawImage` + clip.
- O overlay em 218-219 é chamado APÓS o tile ser desenhado (linhas 71-103).
- Nenhum `save/restore` ou `clip` isola o overlay — ele desenha livremente sobre o tile.
- Células normais sem tile usam `drawHex` diretamente (linha 102) — fill opaco é o comportamento esperado.
- Células COM tile sofrem overlay desnecessário.

**Células no caminho do projétil que NÃO são o ponto atual do projétil:**
1. Tile texture desenhado (linha 82) ✅
2. Fill overlay (linha 84, só se fill !== '#3d2208') — normalmente não
3. Stroke (linhas 96-99) ✅
4. **drawHex com fill opaco (linha 219) — cobre o tile** ❌

**Quando o projétil passa:**
- Antes: célula tem tile texturizado normal
- Durante (projetil no caminho): overlay `drawHex` cobre tile com `#3d2208` sólido → célula escura sólida
- Depois (projetil saiu do path): projPathSet não contém mais a célula → overlay some → tile reappears

### Hipótese secundária: lag de 1 frame no movimento da IA

**Arquivo:** `Phase6CombatV2.jsx:219-238` (draw useCallback), `useCanvasLoop.js:6-14` (RAF loop)
**Mecanismo:** `characters` (React state) atrasado 1 frame em relação a `charsRef.current`.

Durante o movimento da IA, `setCharacters` + `onTrail` são chamados no mesmo tick (linhas 563-564). O `trailRef` é atualizado via ref (síncrono), mas `characters` no estado React leva 1 frame para chegar ao `draw`. O trail aparece na nova posição antes do personagem — criando uma percepção visual de "gap" entre o personagem e o trail.

Isso não causa literalmente células vazias, mas pode parecer "buracos" na sequência visual do movimento.

### Hipótese terciária: gap de highlights entre movimento e ação

**Arquivo:** `useCombatEngine.js:559-560, 585-586`

Entre o fim do movimento (clear attack cells) e início da ação (set range cells), há 300ms sem highlights. Nenhuma célula tem overlay colorido. Se o usuário espera ver highlights contínuos, a ausência de 300ms pode parecer "buracos" na grade destacada.

---

## 4. Arquivos envolvidos

| Arquivo | Papel |
|---|---|
| `drawCombatBoard.js:218-219` | **Causa provável** — overlay `drawHex` com fill opaco cobre tile texture |
| `useHexCanvas.js:14-35` | `drawHex` — fill opaco sem considerar tile |
| `EffectRenderer.js:24-65` | `ProjetilEffect` — gerencia projectilePath/Pos |
| `Phase6CombatV2.jsx:219-238` | `draw` useCallback — passa `characters` do estado React |
| `useCanvasLoop.js:6-14` | RAF loop — restart causa 1 frame gap |
| `useCombatEngine.js:562-564` | `avancarPassoIA` — `setCharacters` + `onTrail` no mesmo tick |
| `atb-canvas.css:10-15` | Background escuro do container — o que aparece nos "buracos" |

---

## 5. Próximo passo sugerido

Corrigir `drawCombatBoard.js:219` — usar fill `'transparent'` no overlay do projétil quando o tile estiver presente, preservando a textura:

```
drawHex(ctx, center, sz, 'transparent', 'rgba(255,200,0,0.3)', 2)
```

Isso mantém o stroke amarelo do projétil sem esconder o tile texture.

---

## 6. Relatório de versão

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | 10.160.13 → **10.160.14** |
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.9.10 → **6.9.11** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| `docs/ReportAI/2026-06-23_INV_BURACOS-GRID-MOVIMENTO-IA_v6.9.11.md` | Relatório de investigação | ✅ |
