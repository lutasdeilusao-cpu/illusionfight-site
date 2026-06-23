# FIX — Buracos no grid durante projétil da IA

> **Data:** 2026-06-23
> **Versão:** SITE 10.160.14 → **10.160.15** / ARENATESTBED 6.9.11 → **6.9.12**
> **Tipo:** Correção

---

## 1. Output bruto do grep (Etapa 1 — prova de leitura)

```
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:39:        fill = 'rgba(255,34,68,0.08)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:42:        fill = 'rgba(255,204,0,0.05)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:45:        fill = 'rgba(255,255,255,0.06)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:50:        fill = 'rgba(255,255,255,0.12)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:51:        stroke = 'rgba(255,255,255,0.6)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:55:        fill = 'rgba(255,255,255,0.2)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:114:        const corSpokes = isPlayer ? `rgba(${r},${g},${b},0.6)` : 'rgba(255,34,68,0.6)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:165:            ctx.strokeStyle = 'rgba(255,34,68,0.6)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:219:        drawHex(ctx, center, sz, fill, 'rgba(255,200,0,0.3)', 2)
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:232:        ctx.fillStyle = 'rgba(255,200,0,0.2)'
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:242:    ctx.fillStyle = `rgba(255,255,255,${t.alpha * 0.4})`
```

---

## 2. Trecho ANTES e DEPOIS

### ANTES (linha 218-220)

```javascript
if (projPathSet.has(key) && projectilePos?.row !== row && projectilePos?.col !== col) {
  drawHex(ctx, center, sz, fill, 'rgba(255,200,0,0.3)', 2)
}
```

### DEPOIS (linha 218-220)

```javascript
if (projPathSet.has(key) && projectilePos?.row !== row && projectilePos?.col !== col) {
  drawHex(ctx, center, sz, 'transparent', 'rgba(255,200,0,0.3)', 2)
}
```

---

## 3. Grep de confirmação pós-edição

```
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:219:        drawHex(ctx, center, sz, 'transparent', 'rgba(255,200,0,0.3)', 2)
src\pages\Prototype\ArenaTestbed\engine\drawCombatBoard.js:232:        ctx.fillStyle = 'rgba(255,200,0,0.2)'
```

**`fill` substituído por `'transparent'`.** A linha 232 é o círculo do projétil (não relacionado, inalterado).

---

## 4. Teste lógico

| Etapa | O que acontece | Resultado |
|---|---|---|
| 1. Projétil percorre o caminho hex a hex | `projectilePos` avança, `projectilePath` encolhe | ✅ |
| 2. Célula no caminho (projétil NÃO está nela) | `drawHex` com fill `'transparent'` + stroke amarelo → tile texture visível por baixo | ✅ sem buraco |
| 3. Célula onde o projétil está | Círculo do projétil desenhado (linhas 222-234) | ✅ normal |
| 4. Célula atrás do projétil | Saiu do `projectilePath` → sem overlay → tile texture normal | ✅ normal |
| 5. Nenhum buraco escuro visível | Fill transparente não cobre tile | ✅ corrigido |

---

## 5. Output do build

Build completo — 1250 modules transformed, 0 erros.

---

## 6. Versões

| Constante | Antes | Depois |
|---|---|---|
| `SITE_VERSION` | 10.160.14 | **10.160.15** |
| `ARENATESTBED_VERSION` | 6.9.11 | **6.9.12** |

---

## 7. Commit e deploy

- **Commit:** `git add -A && git commit -m "fix: fill transparent no overlay projétil — preserva tile texture + v10.160.15"`
- **Push:** pushed
- **Deploy:** Published
