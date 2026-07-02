# FIX — Pop-up de conquista ignora cooldown + reset zera fila de notificações

**Data:** 2026-07-02
**Versão:** 10.183.28 → **10.183.29**
**Commit:** `ce5d5173`
**Deploy:** ✅ Published

---

## 1. Mudanças implementadas

### Opção A — Achievement bypassa cooldown

`src/lib/notificationManager.js:53`
```
ANTES:   pull() {
DEPOIS:  pull(bypassCooldown = false) {
```

`src/lib/notificationManager.js:60`
```
ANTES:     if (now - lastTime >= COOLDOWN_MS) {
DEPOIS:    if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
```

`src/lib/notificationManager.js:93-106` — novo método `findAndPull(type, bypassCooldown)`:
- Busca o primeiro item de um tipo específico na fila (`queue.findIndex`)
- Remove splice e retorna com bypass opcional de cooldown
- Permite que achievement seja encontrado mesmo atrás de outros itens na fila

`src/components/UnifiedNotification/UnifiedNotification.jsx:44-45`
```
ANTES:   const item = notificationManager.pull()
DEPOIS:  const item = notificationManager.findAndPull('achievement', true) || notificationManager.pull()
```

**Efeito:** Quando `tryPull()` executa, primeiro tenta encontrar um achievement em qualquer posição da fila com bypass de cooldown. Se não achar, faz pull FIFO normal (respeitando cooldown para ldi_tip, nina_music).

### Opção B — Reset zera fila de notificações

`src/pages/platform/Perfil/abas/PerfilConquistas.jsx:7`
```
ANTES:   (sem import)
DEPOIS:  import { notificationManager } from '../../../../lib/notificationManager'
```

`src/pages/platform/Perfil/abas/PerfilConquistas.jsx:30`
```
ANTES:   (nada)
DEPOIS:  notificationManager.clear()
```

**Efeito:** handleReset() chama `clear()` após deletar achievements do banco, zerando a fila (queue + lastTime) no localStorage.

---

## 2. Teste lógico

| Fluxo | Resultado |
|---|---|
| Notif não-achievement bloqueia cooldown, achievement no meio da fila | ✅ `findAndPull('achievement', true)` encontra e extrai |
| Reset admin limpa fila + cooldown | ✅ `notificationManager.clear()` zera queue + lastTime |
| Dedup de tipo consecutivo continua | ✅ Inalterado no `push()` linha 33 |

---

## 3. Teste Playwright de escopo

**Arquivo:** `e2e/scope_popup_cooldown.spec.js`

**Cenário:**
1. Login admin
2. Simula cooldown ativo (lastTime = agora) + ldi_tip na frente da fila
3. Reseta achievements via REST API
4. Navega para `/livro/capitulo-01`
5. Aguarda `.achievement-overlay` aparecer

**Output:**
```
[TEST] Pop-up visível em 2062ms
[TEST] Fila após pop-up: [{"type":"ldi_tip","data":{"mensagem":"teste cooldown"},...}]
[TEST] localStorage final: {"queue":"[{\"type\":\"ldi_tip\",...}]","lastTime":"1782964109213"}
[TEST] ✅ Fluxo completo: pop-up ignorou cooldown e apareceu em 2062ms
```

**Evidências:**
- `.achievement-overlay` visível em ~2s (inclui page load + React + desbloquear + push + findAndPull + render)
- `ldi_tip` permaneceu na fila após o pop-up (cooldown respeitado para não-achievement)
- `lastTime` timestampeado (pull registrou o horário)
- Zero erros de console

---

## 4. Build

`npm run build` — OK, 1292 modules transformed, 26 rotas pré-renderizadas.

---

## 5. Deploy

`git push` → `main -> main`  
`npm run deploy` → `Published`

---

## 6. Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/lib/notificationManager.js` | `pull(bypassCooldown)` + novo `findAndPull(type, bypassCooldown)` |
| `src/components/UnifiedNotification/UnifiedNotification.jsx` | `findAndPull('achievement', true) \|\| pull()` |
| `src/pages/platform/Perfil/abas/PerfilConquistas.jsx` | Import + `notificationManager.clear()` |
| `src/config/version.js` | SITE_VERSION 10.183.28 → **10.183.29** |
| `SITE_MAP.md` | Versão atualizada |
| `e2e/scope_popup_cooldown.spec.js` | Teste de escopo (novo) |
