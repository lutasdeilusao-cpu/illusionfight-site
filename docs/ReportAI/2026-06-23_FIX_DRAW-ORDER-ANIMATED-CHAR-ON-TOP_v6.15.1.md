# FIX: Draw order — animated character always on top (2-pass draw)

**Data:** 2026-06-23
**Versão:** SITE 10.160.28 · ARENATESTBED 6.15.1
**Hash:** `3bb574ad`
**Deploy:** Published ✅

---

## 1. ETAPA 1 — Prova de leitura (grep)

```
drawCombatBoard.js:1:function drawChar(ctx, ch, x, y, scale, {
drawCombatBoard.js:104:    charScales = {}, charVisualPos = {}, charRotation = {},
drawCombatBoard.js:114:  for (let row = 0; row < rows; row++) {
drawCombatBoard.js:115:    for (let col = 0; col < cols; col++) {
drawCombatBoard.js:119:      const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
drawCombatBoard.js:200:      if (ch) {
drawCombatBoard.js:201:        const visualPos = charVisualPos[ch.id]
drawCombatBoard.js:205:            drawChar(ctx, ch, visualPos.x, visualPos.y, scale, { sz, angle, currentChar, charRotation })
drawCombatBoard.js:207:            drawChar(ctx, ch, center.x, center.y, scale, { sz, angle, currentChar, charRotation })
drawCombatBoard.js:240:  for (let row = 0; row < rows; row++) {
drawCombatBoard.js:241:    for (let col = 0; col < cols; col++) {
drawCombatBoard.js:246:      const ch = characters.find(c => c.vivo && c.posicao?.row === row && c.posicao?.col === col)
```

---

## 2. Função `drawCharacter` (linhas 1-90)

```js
function drawCharacter(ctx, ch, x, y, scale, rotation, currentChar, angle, sz) {
  const isPlayer = ch.time === 'jogador'
  const cor = ch.aparencia?.cor || (isPlayer ? '#00ff88' : '#ff2244')
  const icone = ch.aparencia?.icone
  const nomeDisplay = ch.aparencia?.nome || ch.nome || ''
  const corBg = isPlayer ? '#001a0d' : '#1a0008'
  const r = parseInt(cor.slice(1, 3), 16)
  const g = parseInt(cor.slice(3, 5), 16)
  const b = parseInt(cor.slice(5, 7), 16)
  const corSpokes = isPlayer ? `rgba(${r},${g},${b},0.6)` : 'rgba(255,34,68,0.6)'

  ctx.save()
  ctx.translate(x, y)
  if (rotation) ctx.rotate(rotation)
  ctx.scale(scale, scale)
  ctx.translate(-x, -y)

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.moveTo(sz * 0.62, 0)
    ctx.lineTo(sz * 0.72, 0)
    ctx.strokeStyle = corSpokes
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.rotate(Math.PI / 3)
  }
  ctx.restore()

  ctx.beginPath()
  ctx.arc(x, y, sz * 0.48, 0, Math.PI * 2)
  ctx.fillStyle = corBg
  ctx.fill()
  ctx.strokeStyle = cor
  ctx.lineWidth = 2
  ctx.stroke()

  if (icone) {
    ctx.save()
    ctx.translate(x, y)
    ctx.strokeStyle = cor
    ctx.lineWidth = 2
    ctx.beginPath()
    if (icone === 'circle') ctx.arc(0, 0, sz * 0.18, 0, Math.PI * 2)
    else if (icone === 'square') ctx.rect(-sz * 0.16, -sz * 0.16, sz * 0.32, sz * 0.32)
    else if (icone === 'diamond') { ctx.moveTo(0, -sz * 0.22); ctx.lineTo(sz * 0.18, 0); ctx.lineTo(0, sz * 0.22); ctx.lineTo(-sz * 0.18, 0); ctx.closePath() }
    ctx.stroke()
    ctx.restore()
  } else {
    ctx.fillStyle = cor
    ctx.font = `700 ${sz * 0.35}px Orbitron, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(nomeDisplay.charAt(0).toUpperCase(), x, y)
  }

  const isActive = ch.id === currentChar?.id
  if (isActive) {
    ctx.beginPath()
    ctx.arc(x, y, sz * 0.85, 0, Math.PI * 2)
    ctx.globalAlpha = 0.3 + 0.2 * Math.sin(Date.now() / 300)
    ctx.strokeStyle = isPlayer ? cor : '#ff2244'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const barW = sz * 0.9
  const barH = 4
  const barX = x - barW / 2
  const barY = y + sz * 0.45
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(barX, barY, barW, barH)
  const hpPct = ch.hp / ch.hpMax
  if (hpPct > 0.5) {
    ctx.fillStyle = '#00ff88'
  } else if (hpPct > 0.25) {
    ctx.fillStyle = '#ffcc00'
  } else {
    ctx.fillStyle = '#ff2244'
    ctx.shadowBlur = 6
    ctx.shadowColor = '#ff2244'
  }
  ctx.fillRect(barX, barY, barW * hpPct, barH)
  ctx.shadowBlur = 0

  ctx.restore()
}
```

Contém: spokes rotativos, círculo bg + borda, ícone ou letra, pulse ring do ativo, barra de HP.

---

## 3. ANTES e DEPOIS do bloco `if (ch)` no loop principal

### ANTES (linhas 200-210):
```js
      if (ch) {
        const visualPos = charVisualPos[ch.id]
        const scale = charScales[ch.id] ?? 1.0
        if (scale > 0.01) {
          if (visualPos) {
            drawChar(ctx, ch, visualPos.x, visualPos.y, scale, { sz, angle, currentChar, charRotation })
          } else {
            drawChar(ctx, ch, center.x, center.y, scale, { sz, angle, currentChar, charRotation })
          }
        }
      }
```

### DEPOIS (linhas 197-206):
```js
      if (ch) {
        const visualPos = charVisualPos[ch.id]
        const scale = charScales[ch.id] ?? 1.0
        if (visualPos) {
          // SKIP — drawn in pass 2 (on top of everything)
        } else if (scale > 0.01) {
          const rotation = charRotation[ch.id] ?? 0
          drawCharacter(ctx, ch, center.x, center.y, scale, rotation, currentChar, angle, sz)
        }
      }
```

---

## 4. Passe 2 (linhas 228-236)

```js
  // PASS 2 — animated characters drawn on top of everything
  for (const [charId, visualPos] of Object.entries(charVisualPos)) {
    const ch = characters.find(c => c.id === charId && c.vivo)
    if (!ch) continue
    const scale = charScales[charId] ?? 1.0
    if (scale <= 0.01) continue
    const rotation = charRotation[charId] ?? 0
    drawCharacter(ctx, ch, visualPos.x, visualPos.y, scale, rotation, currentChar, angle, sz)
  }
```

Posicionado após o grid loop fechar (linha 226), antes do trail loop (linha 238).

---

## 5. Teste lógico (4 cenários)

**Cenário 1 — Slingshot passando pelo alvo:**
- Atacante tem `charVisualPos` ativo durante o voo ✅
- Passe 1: alvo desenhado normalmente ✅
- Passe 2: atacante desenhado por cima do alvo ✅
- Atacante visível durante todo o voo, nunca some ✅

**Cenário 2 — Melee avançando até o alvo:**
- Atacante tem `charVisualPos` ativo durante avanço ✅
- Passe 2 garante que o atacante aparece por cima do alvo ✅
- Ao finalizar: `charVisualPos` limpo → volta ao passe 1 ✅

**Cenário 3 — Sem animação ativa:**
- `charVisualPos = {}` → passe 2 não itera sobre ninguém ✅
- Todos os personagens desenhados normalmente no passe 1 ✅
- Zero mudança de comportamento visual ✅

**Cenário 4 — Dois personagens animados simultaneamente:**
- Dois chars com `charVisualPos` ativo ao mesmo tempo ✅
- Ambos pulados no passe 1 ✅
- Ambos desenhados no passe 2, por cima de tudo ✅

---

## 6. Output do build

```
vite v8.0.16 building client environment for production...
✓ 1262 modules transformed.
✓ built in 1.76s
[prerender] 26 rotas pré-renderizadas com index.html estático
```

**0 erros. Apenas warnings pré-existentes (chunk size, dynamic import supertrunfo).**

---

## 7. Versões + hash + deploy

| Arquivo | O que mudou | Versão |
|---|---|---|
| `src/config/version.js` | SITE_VERSION bump | 10.160.27 → **10.160.28** |
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.15.0 → **6.15.1** |
| `SITE_MAP.md` | Versão atualizada | ✅ |
| `engine/drawCombatBoard.js` | `drawChar` → `drawCharacter`, 2-pass draw | ✅ |
| **Commit** | `3bb574ad` — `fix: draw order — animated char always on top (2-pass draw) + v6.15.1` | ✅ |
| **Deploy** | Published | ✅ |
