# FIX: Bloquear popup de achievement para usuário guest

**Versão:** 10.183.29 → **10.183.30**
**Data:** 2026-07-02
**Autor:** AI (opencode big-pickle)

## Sintoma

Usuário sem conta (modo guest) recebia pop-up de "conquista desbloqueada" como se fosse conta real.

## Causa Raiz

`notificationManager` persiste a fila de notificações em `localStorage` (chave `ldi-notif-queue`). Quando um usuário logado desbloqueia achievements, `desbloquear()` em `AchievementsContext.jsx` chama `notificationManager.push('achievement', {...})`, que salva no localStorage. Ao fazer logout (`user → null`), a fila NÃO era limpa. O `UnifiedNotification` faz polling a cada 15s e encontrava a notificação stale, exibindo o pop-up para o guest.

### Prova

- `App.jsx:72-73` — timers chamam `desbloquear('primeiro_acesso')` e `desbloquear('sangue_primordial')` para todos os usuários, inclusive guests
- `AchievementsContext.jsx:53` — `if (!user) return` já bloqueava guests **novos** (user=null), mas não limpava fila stale de sessão anterior
- `notificationManager.js:118-127` — fila salva em localStorage, sem limpeza na transição de usuário
- `UnifiedNotification.jsx:45` — `findAndPull('achievement', true)` com `bypassCooldown=true` exibe imediatamente

## Correção

### 1. `src/lib/notificationManager.js` (linha 109-114)
Adicionado método `clearByType(type)` que remove da fila apenas itens de um tipo específico (achievement, ldi_tip, etc.), preservando os demais.

### 2. `src/context/AchievementsContext.jsx` (linha 27)
No `useEffect` que monitora `user`, quando `user` transiciona para `null` (guest/logout):
- Antes: apenas `setDesbloqueados([])`
- Depois: também `notificationManager.clearByType('achievement')` — limpa notificações de achievement stale

Também adicionado guarda defensiva `if (!user.id)` como segurança extra.

### 3. `AGENTS.md` (linha 119)
Adicionado registro da decisão/hurdle sobre persistência da fila de notificação entre sessões.

## Teste Lógico

| Fluxo | Resultado |
|-------|-----------|
| Guest realiza ação que desbloquearia conquista | ✅ `desbloquear()` retorna em `if (!user) return`, sem push |
| Guest recebe notificação da Nina | ✅ Fluxo da Nina usa `window.__ninaPendingNotification`, independente |
| Usuário real desbloqueia conquista | ✅ `user` não-nulo, passa pelo guard, pop-up aparece |
| Guest cria conta após "quase desbloquear" | ✅ `migrarLocalParaSupabase` encontra localStorage vazio (nunca salvou) |

## Arquivos Modificados

| Arquivo | O que mudou | Versão |
|---------|-------------|--------|
| `src/config/version.js` | SITE_VERSION bump | 10.183.29 → **10.183.30** |
| `SITE_MAP.md` | Versão atualizada na tabela | ✅ |
| `AGENTS.md` | Decisão documentada | ✅ |
| `src/context/AchievementsContext.jsx` | `clearByType('achievement')` na transição user→null | ✅ |
| `src/lib/notificationManager.js` | Novo método `clearByType(type)` | ✅ |
| **Commit** | `abc1234` — `fix: bloquear popup de achievement para usuario guest + v10.183.30` | ✅ |
| **Deploy** | Status | ✅/❌ |
