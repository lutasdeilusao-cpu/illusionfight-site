# TASK — AUTENTICAÇÃO + ACHIEVEMENTS (Supabase)

**Prioridade:** Alta
**Tipo:** Feature nova — auth + gamificação
**Supabase Project URL:** `https://dvxfrzixtetdzmdrzkpx.supabase.co`
**Supabase Anon Key:** `sb_publishable_mchBnTZ8DNOJvsVdIPrgqw_DSFHXBa0`

---

## DEPENDÊNCIA A INSTALAR

```bash
npm install @supabase/supabase-js
```

---

## ARQUIVOS A CRIAR

```
src/lib/supabase.js
src/context/AuthContext.jsx
src/hooks/useAchievements.js
src/data/achievements-pt.json
src/components/AchievementToast/AchievementToast.jsx
src/components/AchievementToast/AchievementToast.css
src/pages/Perfil.jsx
src/pages/Perfil.css
src/pages/Login.jsx
src/pages/Login.css
src/pages/Cadastro.jsx
src/pages/Cadastro.css
```

## ARQUIVOS A MODIFICAR

```
src/main.jsx         — adicionar AuthProvider
src/App.jsx          — adicionar AchievementToast global + rota /perfil + /login + /cadastro
src/Navbar.jsx       — botão ENTRAR abre /login, logado mostra avatar/nome + link /perfil
```

---

## 1. SUPABASE CLIENT

`src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dvxfrzixtetdzmdrzkpx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_mchBnTZ8DNOJvsVdIPrgqw_DSFHXBa0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

---

## 2. AUTH CONTEXT

`src/context/AuthContext.jsx` — provider global de autenticação:

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) carregarPerfil(session.user.id)
      setCarregando(false)
    })

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) carregarPerfil(session.user.id)
        else setPerfil(null)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function carregarPerfil(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setPerfil(data)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{ user, perfil, carregando, logout, carregarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

Em `src/main.jsx`, adicionar `AuthProvider` dentro da cadeia de providers:
```jsx
// Ordem: ReaderProvider > HelmetProvider > BrowserRouter > AuthProvider > LanguageProvider > App
```

---

## 3. ACHIEVEMENTS DATA

`src/data/achievements-pt.json`:
```json
[
  {
    "id": "primeiro_acesso",
    "nome": "Primeiro Acesso à Arena",
    "descricao": "Você entrou. O LDI registrou sua presença.",
    "icone": "⚔",
    "secreto": false,
    "tier": 0,
    "trigger": "tempo_1min"
  },
  {
    "id": "recrutado",
    "nome": "Recrutado",
    "descricao": "Você criou sua conta. Bem-vindo ao SDR.",
    "icone": "🎖",
    "secreto": false,
    "tier": 1,
    "trigger": "cadastro"
  },
  {
    "id": "leitor_marelia",
    "nome": "Leitor de Marelia",
    "descricao": "Você leu o primeiro capítulo do livro.",
    "icone": "📖",
    "secreto": false,
    "tier": 1,
    "trigger": "livro_cap01"
  },
  {
    "id": "episodio_zero",
    "nome": "Episódio Zero",
    "descricao": "Você assistiu o prólogo do webtoon.",
    "icone": "🎬",
    "secreto": false,
    "tier": 1,
    "trigger": "webtoon_ep00_completo"
  },
  {
    "id": "conhece_a_gangue",
    "nome": "Conhece a Gangue",
    "descricao": "Você consultou os três membros da gangue no quiz.",
    "icone": "👊",
    "secreto": false,
    "tier": 1,
    "trigger": "gangue_todos"
  },
  {
    "id": "ranqueado_sdr",
    "nome": "Ranqueado no SDR",
    "descricao": "Você completou o quiz pela primeira vez.",
    "icone": "🏆",
    "secreto": false,
    "tier": 1,
    "trigger": "quiz_completo"
  },
  {
    "id": "briguento",
    "nome": "Briguento",
    "descricao": "Você acertou 8 de 10 no modo Ranqueado.",
    "icone": "💥",
    "secreto": false,
    "tier": 1,
    "trigger": "quiz_score_80"
  },
  {
    "id": "sangue_primordial",
    "nome": "???",
    "descricao": "O sistema registrou uma anomalia no seu perfil.",
    "icone": "🩸",
    "secreto": true,
    "tier": 1,
    "trigger": "tempo_10min"
  }
]
```

---

## 4. HOOK useAchievements

`src/hooks/useAchievements.js`:

```js
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import todosAchievements from '../data/achievements-pt.json'

const STORAGE_KEY = 'ldi-achievements'

export function useAchievements() {
  const { user } = useAuth()
  const [desbloqueados, setDesbloqueados] = useState([])
  const [toastPendente, setToastPendente] = useState(null)

  // Carrega achievements ao iniciar
  useEffect(() => {
    if (user) {
      carregarDoSupabase()
    } else {
      carregarDoLocal()
    }
  }, [user])

  function carregarDoLocal() {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setDesbloqueados(salvos)
  }

  async function carregarDoSupabase() {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)
    if (data) setDesbloqueados(data.map(d => d.achievement_id))
  }

  // Migra localStorage → Supabase ao fazer login
  async function migrarLocalParaSupabase(userId) {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (salvos.length === 0) return
    const inserts = salvos.map(id => ({ user_id: userId, achievement_id: id }))
    await supabase.from('user_achievements').upsert(inserts, { onConflict: 'user_id,achievement_id' })
    localStorage.removeItem(STORAGE_KEY)
  }

  const desbloquear = useCallback(async (achievementId) => {
    // Já desbloqueado — não faz nada
    if (desbloqueados.includes(achievementId)) return

    const achievement = todosAchievements.find(a => a.id === achievementId)
    if (!achievement) return

    // Salva
    if (user) {
      await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: achievementId
      })
    } else {
      const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...salvos, achievementId]))
    }

    setDesbloqueados(prev => [...prev, achievementId])
    setToastPendente(achievement)
  }, [desbloqueados, user])

  function fecharToast() {
    setToastPendente(null)
  }

  return { desbloqueados, desbloquear, toastPendente, fecharToast, migrarLocalParaSupabase }
}
```

---

## 5. ACHIEVEMENT TOAST

`src/components/AchievementToast/AchievementToast.jsx`:

Visual completamente diferente do NotificationBalloon:
- Posição: **centro da tela**, `position: fixed`, `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`
- Tem overlay escurecido atrás (`rgba(0,0,0,0.6)`) com `z-index: 1500`
- Animação de entrada: escala de 0.5 para 1 com bounce + fade in em 0.5s
- Partículas CSS: 12 elementos `<span>` com `@keyframes particle-burst` espalhando em direções aleatórias (usar `nth-child` com `rotate` e `translate` diferentes)
- Foto do Jack (`jack-balloon.png`) no topo do card, circular, 80px, com borda âmbar
- Fundo do card: `#0d0b08` com borda âmbar `2px solid #e8853a`
- Texto "ACHIEVEMENT DESBLOQUEADO" em JetBrains Mono, âmbar, tracking largo
- Nome do achievement em Rajdhani 700, branco, 1.6rem
- Descrição em IBM Plex Sans, cinza claro
- Ícone grande (3rem) centralizado acima do nome
- Botão "CONTINUAR" fecha o toast
- Auto-fecha após 5 segundos se o usuário não clicar

```jsx
// Estrutura JSX
<div className="achievement-overlay" onClick={fecharToast}>
  <div className="achievement-card" onClick={e => e.stopPropagation()}>
    <div className="achievement-particles">
      {[...Array(12)].map((_, i) => <span key={i} className={`particle p-${i}`} />)}
    </div>
    <img src={jackBalloon} className="achievement-jack" alt="Jack" />
    <div className="achievement-label">ACHIEVEMENT DESBLOQUEADO</div>
    <div className="achievement-icone">{achievement.icone}</div>
    <div className="achievement-nome">
      {achievement.secreto && !desbloqueadoAntes ? '???' : achievement.nome}
    </div>
    <div className="achievement-descricao">{achievement.descricao}</div>
    <button className="achievement-btn" onClick={fecharToast}>CONTINUAR</button>
  </div>
</div>
```

Animações CSS obrigatórias:

```css
@keyframes achievement-enter {
  0%   { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
  60%  { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes particle-burst {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: var(--tx, 60px) var(--ty, -60px) scale(0); opacity: 0; }
}

/* Cada partícula tem --tx e --ty diferentes via nth-child */
.particle { position: absolute; width: 8px; height: 8px; border-radius: 50%;
            animation: particle-burst 0.8s ease-out 0.2s both; }
.p-0  { background: #e8853a; --tx: translateX(80px);  --ty: translateY(-40px); }
.p-1  { background: #00c8a8; --tx: translateX(-80px); --ty: translateY(-40px); }
.p-2  { background: #f0ece0; --tx: translateX(0px);   --ty: translateY(-90px); }
.p-3  { background: #e8853a; --tx: translateX(60px);  --ty: translateY(60px);  }
.p-4  { background: #6B0F1A; --tx: translateX(-60px); --ty: translateY(60px);  }
.p-5  { background: #00c8a8; --tx: translateX(90px);  --ty: translateY(20px);  }
.p-6  { background: #f0ece0; --tx: translateX(-90px); --ty: translateY(20px);  }
.p-7  { background: #e8853a; --tx: translateX(50px);  --ty: translateY(-70px); }
.p-8  { background: #00c8a8; --tx: translateX(-50px); --ty: translateY(-70px); }
.p-9  { background: #f0ece0; --tx: translateX(70px);  --ty: translateY(50px);  }
.p-10 { background: #6B0F1A; --tx: translateX(-70px); --ty: translateY(50px);  }
.p-11 { background: #e8853a; --tx: translateX(0px);   --ty: translateY(90px);  }
```

Em `App.jsx`, adicionar o toast global:
```jsx
import { useAchievements } from './hooks/useAchievements'
import AchievementToast from './components/AchievementToast/AchievementToast'

// Dentro do componente App:
const { toastPendente, fecharToast, desbloqueados } = useAchievements()

// No JSX, antes do fechamento do wrapper:
{toastPendente && (
  <AchievementToast
    achievement={toastPendente}
    fecharToast={fecharToast}
  />
)}
```

**PROBLEMA ARQUITETURAL — ler antes de implementar:**
O `useAchievements` precisa ser um contexto, não apenas um hook local, para que `desbloquear()` possa ser chamado de qualquer componente (Quiz, Livro, Webtoon) e o toast apareça globalmente. Criar `AchievementsContext` seguindo o mesmo padrão do `AuthContext`:

```jsx
// src/context/AchievementsContext.jsx
export function AchievementsProvider({ children }) {
  // toda a lógica do useAchievements aqui
  return (
    <AchievementsContext.Provider value={{ desbloqueados, desbloquear, toastPendente, fecharToast }}>
      {children}
    </AchievementsContext.Provider>
  )
}
export const useAchievements = () => useContext(AchievementsContext)
```

Adicionar `AchievementsProvider` em `main.jsx` dentro do `AuthProvider`.

---

## 6. TRIGGER: 1 MINUTO NO SITE

Em `App.jsx`, `useEffect` global:
```js
useEffect(() => {
  const timer = setTimeout(() => {
    desbloquear('primeiro_acesso')
  }, 60000) // 1 minuto
  return () => clearTimeout(timer)
}, [])
```

---

## 7. TRIGGER: 10 MINUTOS (achievement secreto)

```js
useEffect(() => {
  const timer = setTimeout(() => {
    desbloquear('sangue_primordial')
  }, 600000) // 10 minutos
  return () => clearTimeout(timer)
}, [])
```

---

## 8. TRIGGER: QUIZ COMPLETO

Em `Quiz.jsx`, na função `mostrarResultado()`:
```js
desbloquear('ranqueado_sdr')
if (acertosFinais / total >= 0.8 && modo === 'ranqueado') {
  desbloquear('briguento')
}
```

---

## 9. TRIGGER: GANGUE (Kim + Jack + Nina)

Em `Quiz.jsx`, no estado da sessão adicionar:
```js
const [gangueUsados, setGangueUsados] = useState(new Set())
```

Quando usuário escolhe personagem da gangue:
```js
setGangueUsados(prev => {
  const novo = new Set(prev)
  novo.add(personagem) // 'kim', 'jack' ou 'nina'
  if (novo.size === 3) desbloquear('conhece_a_gangue')
  return novo
})
```

---

## 10. TRIGGER: LIVRO CAP 01

Em `LivroCapitulo.jsx`, quando `id === '01'` e o capítulo termina de carregar:
```js
useEffect(() => {
  if (capitulo?.id === '01') desbloquear('leitor_marelia')
}, [capitulo])
```

---

## 11. TRIGGER: WEBTOON EP 00 COMPLETO

Em `WebtoonEpisodio.jsx`, quando scroll chega na última página:
```js
// No IntersectionObserver da última imagem:
if (isLastPage && entry.isIntersecting) {
  desbloquear('episodio_zero')
}
```

---

## 12. PÁGINAS DE AUTH

### Login — `src/pages/Login.jsx`

Campos: email + senha. Link para /cadastro. Link "Esqueci a senha" (Supabase magic link).

```js
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) mostrarErro(error.message)
else navigate('/perfil')
```

Visual: mesmo padrão dark do site, max-width 400px centralizado, campos com borda âmbar no focus, botão carmesim.

### Cadastro — `src/pages/Cadastro.jsx`

Campos obrigatórios: **nome**, **email**, **telefone**, **senha**, **confirmar senha**.
Validações antes de submeter:
- Email válido (regex básico)
- Telefone: mínimo 10 dígitos numéricos
- Senha: mínimo 6 caracteres
- Confirmação de senha bate

Fluxo:
```js
// 1. Criar usuário no Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: window.location.origin }
})

// 2. Se sucesso, criar perfil
if (data.user) {
  await supabase.from('profiles').insert({
    id: data.user.id,
    nome,
    telefone
  })

  // 3. Migrar achievements do localStorage
  await migrarLocalParaSupabase(data.user.id)

  // 4. Desbloquear achievement de cadastro
  await desbloquear('recrutado')
}
```

Após cadastro: mostrar mensagem "Verifique seu email para confirmar o cadastro." — **não redirecionar automaticamente**.

### Perfil — `src/pages/Perfil.jsx`

Seções:
1. Header: nome do usuário, email, data de cadastro
2. Grid de achievements (todos os 8) — desbloqueados com cor cheia, bloqueados com opacidade 30% e ícone de cadeado. Se secreto e não desbloqueado: mostrar "???" no nome e descrição genérica "Achievement secreto"
3. Botão de logout

---

## 13. NAVBAR

Quando `user === null`: botão ENTRAR → `/login` (comportamento atual)
Quando `user !== null`:
- Substituir botão ENTRAR por avatar circular com inicial do nome + dropdown com "Meu Perfil" → `/perfil` e "Sair"
- No mobile (drawer): adicionar link "Meu Perfil" e "Sair" no lugar do ENTRAR

---

## 14. ROTAS — App.jsx

```jsx
<Route path="/login" element={<Login />} />
<Route path="/cadastro" element={<Cadastro />} />
<Route path="/perfil" element={<Perfil />} />
```

---

## 15. ATUALIZAR SITE_MAP.md → v1.6

Seção 2 (Páginas): adicionar `/login`, `/cadastro`, `/perfil`
Seção 3 (Componentes): adicionar `AchievementToast`
Seção 5 (Dados): adicionar `achievements-pt.json`
Seção 7 (Configuração): adicionar `src/lib/supabase.js` e os dois novos contexts
Seção 8 (Features implementadas): adicionar bloco "Autenticação + Achievements"
Seção 9 (Features pendentes): remover Autenticação da lista, adicionar "Achievements EN/ES", "Leaderboard de achievements", "Página de perfil com avatar customizável"

---

## CHECKLIST DE TESTES

- [ ] Ficar 1 minuto no site sem conta → toast aparece centralizado com partículas
- [ ] Toast fecha ao clicar CONTINUAR e ao clicar no overlay
- [ ] localStorage salva `primeiro_acesso` após o toast
- [ ] Cadastro com email inválido mostra erro inline
- [ ] Cadastro completo → email de confirmação chega
- [ ] Após confirmar email → login funciona
- [ ] Login → achievements do localStorage migram para Supabase
- [ ] Achievement "Recrutado" aparece após cadastro
- [ ] Página /perfil mostra achievements desbloqueados e bloqueados
- [ ] Achievement secreto aparece como "???" até desbloquear
- [ ] Navbar mostra inicial do nome quando logado
- [ ] Logout limpa sessão e volta para estado anônimo
- [ ] Completar quiz → "Ranqueado no SDR" aparece
- [ ] Score ≥ 80% no modo ranqueado → "Briguento" aparece
