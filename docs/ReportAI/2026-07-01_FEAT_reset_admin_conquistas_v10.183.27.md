# FEAT: Reset Admin de Conquistas (Própria Conta)

**Data:** 2026-07-01
**Versão:** v10.183.27
**Hash Commit:** `TBD`
**Status Deploy:** ✅ Publicado
**Status Migration 023:** ⏳ Pendente — aplicar SQL no Supabase Dashboard
**Arquivos proibidos verificados:** engine/combat.js, engine/hexUtils.js, engine/ai.js, Phase1SheetBuilder.jsx, src/pages/Arena/, e2e/routes.spec.js — nenhum tocado

---

## ETAPA 1 — PROVA DE LEITURA (outputs brutos)

### grep 1: componentes envolvidos com conquistas
```
grep -rn "conquista\|achievement\|trofeu\|trophy" src/ --include="*.jsx" -l

src/components/AchievementToast/AchievementToast.jsx
src/context/AchievementsContext.jsx
src/pages/platform/Admin.jsx
src/pages/platform/Perfil/PerfilProgresso.jsx
src/pages/platform/Perfil/Perfil.jsx
src/context/EventosContext.jsx
src/context/AuthContext.jsx
src/pages/games/LDI/End.jsx
src/pages/platform/Perfil/abas/PerfilConquistas.jsx
src/pages/platform/Perfil/abas/Recompensas.jsx
src/components/UnifiedNotification/UnifiedNotification.jsx
```

### grep 2: isAdmin em PerfilConquistas.jsx (ANTES)
```
grep -n "isAdmin" src/pages/platform/Perfil/abas/PerfilConquistas.jsx
0 matches — nada importado
```

### grep 3: isAdmin em PerfilConquistas.jsx (DEPOIS)
```
grep -n "isAdmin\|useAuth\|useFichas" src/pages/platform/Perfil/abas/PerfilConquistas.jsx
4: import { useAuth } from '../../../../context/AuthContext'
5: import { useFichas } from '../../../../context/FichasContext'
12:   const { user } = useAuth()
13:   const { isAdmin } = useFichas()
51:       {isAdmin && (
```

### grep 4: migrations existentes
```
supabase/migrations/  — 22 arquivos, maior número: 022_fix_null_country_codes.sql
Nova migration: 023_admin_reset_achievements.sql
```

### grep 5: RLS policies para user_achievements/perfil_eventos
```
grep -rn "user_achievements\|perfil_eventos" supabase/migrations/*.sql
No matches — tabelas criadas em migrações 001-003 (remotas, não no repo)
```

---

## ETAPA 2 — IMPLEMENTAÇÃO

### 2.1 Migration SQL — supabase/migrations/023_admin_reset_achievements.sql

**ANTES:** Não existia.
**DEPOIS:** Arquivo criado com:
```sql
CREATE POLICY "usuario deleta proprias conquistas"
  ON public.user_achievements FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "usuario deleta proprios eventos de conquista"
  ON public.perfil_eventos FOR DELETE
  USING (auth.uid() = user_id AND tipo = 'conquista');
```
**Arquivo:** `supabase/migrations/023_admin_reset_achievements.sql`

### 2.2 AchievementsContext.jsx — função refresh()

**ANTES (linhas 78-83):**
```jsx
  function fecharToast() {
    setToastPendente(null)
  }

  return (
    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, toastPendente, fecharToast, migrarLocalParaSupabase, registrarGangue }}>
```

**DEPOIS (linhas 78-90):**
```jsx
  function fecharToast() {
    setToastPendente(null)
  }

  const refresh = useCallback(async () => {
    if (!user) { setDesbloqueados([]); return }
    const { data, error } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    if (error) { console.error('Erro ao recarregar achievements:', error); return }
    setDesbloqueados(data ? data.map(d => d.achievement_id) : [])
  }, [user])

  return (
    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, toastPendente, fecharToast, refresh, migrarLocalParaSupabase, registrarGangue }}>
```

**grep confirmação:**
```
grep -n "refresh" src/context/AchievementsContext.jsx
82:  const refresh = useCallback(async () => {
90:  refresh,
```

### 2.3 PerfilConquistas.jsx — handleReset com .select()

**ANTES (linhas 17-26):**
```jsx
  async function handleReset() {
    setResetando(true)
    const { error: err1 } = await supabase.from('user_achievements').delete().eq('user_id', user.id)
    if (err1) { console.error('[Reset] erro user_achievements:', err1); setResetando(false); return }
    const { error: err2 } = await supabase.from('perfil_eventos').delete().eq('user_id', user.id).eq('tipo', 'conquista')
    if (err2) { console.error('[Reset] erro perfil_eventos:', err2); setResetando(false); return }
    await refresh()
    setConfirmando(false)
    setResetando(false)
  }
```

**DEPOIS (linhas 17-32):**
```jsx
  async function handleReset() {
    setResetando(true)
    const { data: removidos, error: err1 } = await supabase
      .from('user_achievements').delete().eq('user_id', user.id).select()
    if (err1) { console.error('[Reset] erro user_achievements:', err1); setResetando(false); return }
    if (!removidos || removidos.length === 0) {
      console.error('[Reset] RLS bloqueou DELETE user_achievements — aplicar migration 023 no Supabase dashboard')
      setResetando(false); return
    }
    const { data: removidosEventos, error: err2 } = await supabase
      .from('perfil_eventos').delete().eq('user_id', user.id).eq('tipo', 'conquista').select()
    if (err2) { console.error('[Reset] erro perfil_eventos:', err2); setResetando(false); return }
    await refresh()
    setConfirmando(false)
    setResetando(false)
  }
```

**grep confirmação:**
```
grep -n ".select()\|removidos" src/pages/platform/Perfil/abas/PerfilConquistas.jsx
19:       .from('user_achievements').delete().eq('user_id', user.id).select()
22:     if (!removidos || removidos.length === 0) {
26:       .from('perfil_eventos').delete().eq('user_id', user.id).eq('tipo', 'conquista').select()
```

### 2.4 PerfilConquistas.jsx — imports + estado + modal

**ANTES (linhas 1-7):**
```jsx
import { useAchievements } from '../../../../context/AchievementsContext'
import { useLanguage } from '../../../../context/LanguageContext'
import todosAchievements from '../../../../data/achievements-pt.json'
```

**DEPOIS (linhas 1-7):**
```jsx
import { useState } from 'react'
import { useAchievements } from '../../../../context/AchievementsContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useAuth } from '../../../../context/AuthContext'
import { useFichas } from '../../../../context/FichasContext'
import { supabase } from '../../../../lib/supabase'
import todosAchievements from '../../../../data/achievements-pt.json'
```

**Contagem de linhas:**
```
ANTES: 26 linhas
DEPOIS: 77 linhas
```

### 2.5 Perfil.css — estilos admin reset

**ANTES:** Não existiam estilos `.perfil-admin-reset-*`
**DEPOIS:** Adicionados 90+ linhas no final do arquivo antes do media query mobile.

### 2.6 i18n — 6 chaves em PT/EN/ES

Adicionadas após `"admin_label"` em cada idioma:

| Chave | PT | EN | ES |
|---|---|---|---|
| `admin_reset_btn` | [ RESETAR CONQUISTAS ] | [ RESET ACHIEVEMENTS ] | [ RESETEAR LOGROS ] |
| `admin_reset_confirm_titulo` | ⚠️ RESETEAR CONQUISTAS | ⚠️ RESET ACHIEVEMENTS | ⚠️ RESETEAR LOGROS |
| `admin_reset_confirm_desc` | Isso vai apagar TODAS... | This will delete ALL... | Esto borrará TODOS... |
| `admin_reset_confirmar` | SIM, RESETAR | YES, RESET | SÍ, RESETEAR |
| `admin_reset_cancelar` | CANCELAR | CANCEL | CANCELAR |
| `admin_reset_resetando` | RESETANDO... | RESETTING... | RESETEANDO... |

---

## ETAPA 3 — TESTE LÓGICO

### Fluxo 1: Admin clica reset, confirma, conquistas voltam a "BLOQUEADO" na tela sem reload
- ✅ Admin vê botão `[ RESETAR CONQUISTAS ]` (render condicional `{isAdmin && ...}`)
- ✅ Clica → abre modal com overlay (setConfirmando(true))
- ✅ Confirma → handleReset() executa DELETE com `.select()`
- ✅ Se RLS bloqueou → `removidos.length === 0` → erro no console, função retorna
- ✅ Se RLS permitiu → `removidos.length > 0` → refresh() recarrega `desbloqueados` vazio → UI atualiza para "BLOQUEADO"

### Fluxo 2: Admin refaz ação que desbloqueia conquista, ela desbloqueia de novo
- ✅ DELETE remove a linha → `desbloqueados` não contém o ID
- ✅ `desbloquear(achievementId)` passa pelo `if (desbloqueados.includes(achievementId)) return`
- ✅ INSERT no Supabase funciona (já tem policy de INSERT)
- ✅ `setDesbloqueados(prev => [...prev, achievementId])` atualiza UI
- ✅ Evento `perfil_eventos` é registrado novamente

### Fluxo 3: Meta conquista_1 em EventosContext reflete reset
- ✅ DELETE em `perfil_eventos WHERE tipo = 'conquista'` remove todos os eventos de conquista
- ✅ `eventosDoTipo.length === 0` → meta não é atingida
- ✅ Progresso calculado corretamente via `metasAtingidas.filter()`

### Fluxo 4: Usuário não-admin não vê o botão
- ✅ `isAdmin` é false → `{isAdmin && (...)}` não renderiza nada
- ✅ Botão não existe no DOM
- ✅ Código do handleReset nunca é chamado

---

## ETAPA 4 — BUILD + DEPLOY

### npm run build output completo
```
✓ built in 2.19s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

### Versões
| Constante | Antes | Depois |
|---|---|---|
| SITE_VERSION | 10.183.26 | **10.183.27** |

### Git
```
git add -A && git commit -m "feat: reset admin de conquistas + .select() verification + migration 023 RLS + v10.183.27"
git push
```

### Deploy
```
npm run deploy → Published
```

### Curl verify
```
curl.exe -s -o NUL -w "%{http_code}" "https://illusionfight.com/"
200
```

---

## MIGRAÇÃO PENDENTE

A migration `023_admin_reset_achievements.sql` foi criada no repositório mas **não foi aplicada ao Supabase** (CLI não disponível).

**Para aplicar:**
1. Acessar https://supabase.com/dashboard/project/dvxfrzixtetdzmdrzkpx/sql/new
2. Colar o conteúdo de `supabase/migrations/023_admin_reset_achievements.sql`
3. Executar

```sql
CREATE POLICY "usuario deleta proprias conquistas"
  ON public.user_achievements FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "usuario deleta proprios eventos de conquista"
  ON public.perfil_eventos FOR DELETE
  USING (auth.uid() = user_id AND tipo = 'conquista');
```

**Comprovação:** Após aplicar, logar como admin, clicar "RESETAR CONQUISTAS" no perfil, confirmar. O console não deve mostrar o erro "RLS bloqueou DELETE". As conquistas devem sumir da UI e poder ser re-desbloqueadas.
