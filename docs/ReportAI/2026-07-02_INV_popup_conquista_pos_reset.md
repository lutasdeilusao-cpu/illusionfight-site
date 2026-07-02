# INVESTIGAÇÃO — Pop-up de conquista não aparece após reset

**Data:** 2026-07-02
**Versão investigada:** 10.183.28
**Tipo:** Investigação (sem correção)
**Autor:** opencode agent

---

## 1. SINTOMA

Após resetar conquistas (admin) e refazer a ação que desbloqueia uma conquista, o pop-up de "conquista desbloqueada" não aparece, embora a conquista seja marcada como desbloqueada no banco e na UI da aba Conquistas.

## 2. HIPÓTESE INICIAL

"Sistema de fila de notificações está engolindo ou atrasando a exibição do pop-up"

## 3. MAPEAMENTO DO SISTEMA DE FILA

### 3.1 Arquivos envolvidos

| Arquivo | Função |
|---|---|
| `src/lib/notificationManager.js` | Fila centralizada com localStorage + cooldown de 15 min |
| `src/components/UnifiedNotification/UnifiedNotification.jsx` | Consome a fila e renderiza o pop-up |
| `src/context/AchievementsContext.jsx` | `desbloquear()` → chama `notificationManager.push()` |
| `src/store/notificationStore.js` | Zustand store **deprecated**, redireciona para notificationManager |
| `src/App.jsx:134` | `<UnifiedNotification />` montado no root |

### 3.2 Fluxo completo (linhas de código)

#### `AchievementsContext.jsx:44-65` — desbloquear()
```
44  const desbloquear = useCallback(async (achievementId) => {
45    console.log('desbloquear:', achievementId, 'user:', user?.id ?? 'NULO')
47    if (!user) return
48    if (desbloqueados.includes(achievementId)) return      ← early return se já tem
49    const achievement = todosAchievements.find(a => a.id === achievementId)
50    if (!achievement) return
51    const { error } = await supabase.from('user_achievements').insert({...})
52    if (error) {
53      if (error.code === '23505') {                       ← fix v10.183.28
54        setDesbloqueados(prev => ...)
55        return                                            ← early return SEM push!
56      }
57      console.error('ERRO AO SALVAR ACHIEVEMENT:', error)
58      return                                              ← early return SEM push!
59    }
60    setDesbloqueados(...)
61    notificationManager.push('achievement', {             ← ÚNICO lugar que push é chamado
62      nome, descricao, icone
63    })
```

#### `notificationManager.js:30-44` — push()
```
30  push(type, data) {
31    const queue = this._getQueue()
33    if (queue.length > 0 && queue[queue.length - 1].type === type) return  ← dedup
36    queue.push({ type, data, id, createdAt })
42    this._saveQueue(queue)
43    this._notifyListeners()
44  }
```

#### `notificationManager.js:52-67` — pull()
```
52  pull() {
53    const queue = this._getQueue()
54    if (queue.length === 0) return null
56    const item = queue[0]
57    const lastTime = this._getLastTime()
58    const now = Date.now()
59    if (now - lastTime >= COOLDOWN_MS) {      ← COOLDOWN_MS = 15 min
60      queue.shift()
61      this._saveQueue(queue)
62      this._setLastTime(now)
63      return item
64    }
66    return null                               ← cooldown ativo → item fila na fila!
67  }
```

#### `UnifiedNotification.jsx:25-51` — tryPull()
```
25  const tryPull = useCallback(() => {
26    if (current) return                       ← já tem pop-up sendo exibido
29    const ninaPending = window.__ninaPendingNotification
30    if (ninaPending && ninaPending.mensagem) { ← Nina tem prioridade máxima
39      window.__ninaPendingNotification = null
40      return
41    }
44    const item = notificationManager.pull()
45    if (item) {
46      setCurrent(item)                        ← renderiza o pop-up
```

#### `UnifiedNotification.jsx:54-62` — efeito de inicialização
```
54  useEffect(() => {
55    tryPull()                                  ← tenta na montagem
56    checkIntervalRef.current = setInterval(tryPull, 15000)  ← polling 15s
57    const unsub = notificationManager.subscribe(tryPull)    ← subscribe na fila
```

## 4. EVIDÊNCIAS COLETADAS

### 4.1 Teste com Playwright (login + reset API + navegação)

Comando: `npx playwright test e2e/investigate_popup.spec.js`

**Resultado:**
```
=== RESET API === userId: b78375b3... status: 204 body:
=== LOCALSTORAGE FINAL === {"queue":"[]","lastTime":"1782962884021"}
[TEST] t=1000ms overlay count=1 visible=true
[TEST] t=2000ms overlay count=1 visible=true
[TEST] t=3000ms overlay count=1 visible=true
[TEST] t=4000ms overlay count=1 visible=true
[TEST] t=5000ms overlay count=1 visible=true
```

### 4.2 Análise dos logs

**Cenário SEM reset (achievement já existia):**
```
desbloquear: leitor_marelia user: NULO       ← 2x (StrictMode, sem user)
desbloquear: leitor_marelia user: b78375b3    ← 1x, mas retorna em linha 48
```
→ `push` nunca chamado. Queue=null. Pop-up não aparece.

**Cenário COM reset + v10.183.28:**
```
desbloquear: leitor_marelia user: b78375b3    ← 1x
(INSERT sucesso, push chamado, pull consumiu, setCurrent chamado)
```
→ Pop-up visível por 6s (auto-close). Queue=[]. lastTime timestampeado.

### 4.3 Evidência de que push/pull funciona

- `queue: []` (array vazio, não null) = push foi chamado e pull removeu o item
- `lastTime: "1782962884021"` = pull retornou o item com sucesso

## 5. DIAGNÓSTICO

### O pop-up de conquista passa pelo sistema de fila?

**SIM.** O fluxo é:
```
desbloquear()
  → notificationManager.push('achievement', data)
    → _saveQueue(localStorage)
    → _notifyListeners()
      → UnifiedNotification.tryPull()
        → notificationManager.pull()
          → shift() + _setLastTime() + return item
        → setCurrent(item) → renderiza .achievement-overlay
```

### Causa raiz do pop-up não aparecer (já corrigida em v10.183.28):

**23505 era a causa real.** O cenário era:

1. Admin clica "Resetar Conquistas"
2. Migration 023 NÃO estava aplicada → `DELETE` bloqueado por RLS → `.select()` retorna vazio
3. Código do `handleReset` detecta RLS bloqueando e **não limpa o estado local**
4. Usuário navega para capítulo → `desbloquear('leitor_marelia')`
5. `desbloqueados.includes(...)` → false (reset falhou mas refresh recarregou do DB → ainda tem os IDs)
6. Wait — na verdade, se o `.select()` retorna vazio, o código mostra erro e para. O `refresh()` não é chamado.
7. Se de alguma forma o código prossegue, o `INSERT` em `desbloquear` falha com `23505` (já existe no DB)
8. `if (error)` → `console.error` + `return` → `notificationManager.push` **nunca executado**

Com o fix v10.183.28:
- `23505` é tratado como sucesso → `push` é chamado → pop-up aparece

### Problema secundário — cooldown de 15 min:

A função `pull()` do `notificationManager` tem um cooldown de 15 minutos (`COOLDOWN_MS = 15 * 60 * 1000`). Se o usuário viu qualquer notificação (incluindo outra conquista) nos últimos 15 minutos, `pull()` retorna `null` e o item permanece na fila. O pop-up só aparece após o cooldown expirar.

### Dead code — `toastPendente`:

`AchievementsContext.jsx:14` declara `toastPendente` e `fecharToast`, mas:
- `toastPendente` **nunca é setado** no `desbloquear`
- `fecharToast` só existe no context value, nunca é chamado por ninguém
- O pop-up real é gerenciado pelo `UnifiedNotification` via `notificationManager`

## 6. PROPOSTA DE CORREÇÃO

Três mudanças independentes, qualquer uma resolve o problema do usuário (validar preferência):

### Opção A — Achievement bypassa cooldown (mínimo impacto)

Em `notificationManager.js`, modificar `pull()` para aceitar um parâmetro de prioridade:

```js
pull(bypassCooldown = false) {
  ...
  if (bypassCooldown || now - lastTime >= COOLDOWN_MS) {
    queue.shift()
    ...
  }
}
```

Em `UnifiedNotification.jsx`, chamar `pull(true)` para achievements.

### Opção B — Resetar cooldown junto com as conquistas

Em `PerfilConquistas.jsx:handleReset`, adicionar:
```js
import { notificationManager } from '../../lib/notificationManager'
notificationManager.clear()
```

Isso zera a fila e o cooldown, garantindo que o próximo push seja exibido imediatamente.

### Opção C — Remover sistema de fila para achievements

Em `AchievementsContext.jsx:desbloquear`, pular o `notificationManager` e definir `toastPendente` diretamente (reativando o fluxo antigo), ou chamar uma função específica que exibe o pop-up sem passar pela fila.

**Recomendação:** Opção A + B combinadas. A menor mudança de comportamento e a mais alinhada com o requisito de produto ("pop-up de conquista é prioritário").

---

## 7. ARQUIVOS TOCADOS (investigação apenas, sem edição)

| Arquivo | Relevância |
|---|---|
| `src/context/AchievementsContext.jsx` | Fluxo desbloquear → push |
| `src/lib/notificationManager.js` | Fila + cooldown |
| `src/components/UnifiedNotification/UnifiedNotification.jsx` | Consumo da fila + render |
| `src/components/AchievementToast/AchievementToast.jsx` | **Dead code** — não montado em lugar nenhum |
| `src/store/notificationStore.js` | **Deprecated** — redireciona para notificationManager |
| `e2e/investigate_popup.spec.js` | Teste de investigação (Playwright) |
