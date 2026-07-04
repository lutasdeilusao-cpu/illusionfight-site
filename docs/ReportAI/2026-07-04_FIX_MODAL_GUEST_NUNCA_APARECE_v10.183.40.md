# Relatório de Correção — Modal "Criar Conta Grátis" nunca aparece para guest

**Data:** 2026-07-04
**Versão:** v10.183.40
**Status:** CORRIGIDO / PENDENTE TESTE MANUAL

---

## Problema

O modal "Criar Conta Grátis" (ModalLancamento) reaparecia para usuários guest ao abrir nova aba, nova sessão, ou modo anônimo, pois o mecanismo de supressão usava `sessionStorage` (tab-scoped, session-scoped). Relatório de investigação completo em `docs/ReportAI/2026-07-04_INV_MODAL_GUEST_ESCOPO_COMPLETO.md`.

## Mudanças

### Regra final
**Se `!user` (via `useAuth()`), o ModalLancamento nunca é exibido, em nenhuma rota, em nenhuma circunstância — não importa scroll, storage, ou sessão.**

### Arquivos editados

#### 1. `src/components/ModalLancamento/ModalLancamento.jsx`

**ANTES (linhas 1-17):**
```js
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import './ModalLancamento.css'

const STORAGE_KEY = 'ldi-modal-lancamento-visto'

export default function ModalLancamento({ mostrar, onFechar }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!mostrar) return null

  const handleFechar = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    onFechar()
  }
```

**DEPOIS (linhas 1-14):**
```js
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import './ModalLancamento.css'

export default function ModalLancamento({ mostrar, onFechar }) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Guest nunca vê este modal
  if (!user || !mostrar) return null

  const handleFechar = () => {
    onFechar()
  }
```

**O que mudou:**
- Removeu `STORAGE_KEY` constant
- Adicionou `!user` no guarda de retorno: `if (!user || !mostrar) return null`
- Removeu `sessionStorage.setItem(STORAGE_KEY, '1')` do `handleFechar`

#### 2. `src/pages/content/WebtoonEpisodio.jsx`

**ANTES (linhas 52-62):**
```js
  useEffect(() => {
    if (!ultimaPaginaRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (id === '00') desbloquearRef.current('episodio_zero')
        if ((id === '00') && !sessionStorage.getItem('ldi-modal-lancamento-visto')) setShowModal(true)
      }
    }, { threshold: 0.1 })
    observer.observe(ultimaPaginaRef.current)
    return () => observer.disconnect()
  }, [id])
```

**DEPOIS (linhas 52-62):**
```js
  useEffect(() => {
    if (!user) return
    if (!ultimaPaginaRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (id === '00') desbloquearRef.current('episodio_zero')
        if (id === '00') setShowModal(true)
      }
    }, { threshold: 0.1 })
    observer.observe(ultimaPaginaRef.current)
    return () => observer.disconnect()
  }, [id, user])
```

**O que mudou:**
- Adicionou `if (!user) return` como primeira linha do useEffect
- Removeu `sessionStorage.getItem('ldi-modal-lancamento-visto')` do condition
- Adicionou `user` nas dependências do useEffect

#### 3. `src/pages/content/LivroCapitulo.jsx`

**ANTES (linhas 112-121):**
```js
  // Sentinel: dispara modal ao final do capítulo 1
  useEffect(() => {
    if (id !== 'capitulo-01' || !sentinelRef.current) return
    if (sessionStorage.getItem('ldi-modal-lancamento-visto')) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShowModal(true)
    }, { threshold: 0.1 })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [id, md])
```

**DEPOIS (linhas 112-121):**
```js
  // Sentinel: dispara modal ao final do capítulo 1 (só para logado)
  useEffect(() => {
    if (!user) return
    if (id !== 'capitulo-01' || !sentinelRef.current) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShowModal(true)
    }, { threshold: 0.1 })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [id, md, user])
```

**O que mudou:**
- Adicionou `if (!user) return` como primeira linha do useEffect
- Removeu `sessionStorage.getItem('ldi-modal-lancamento-visto')` check
- Adicionou `user` nas dependências do useEffect

### 4. `src/config/version.js`

```
SITE_VERSION: 10.183.39 → 10.183.40
```

### 5. `SITE_MAP.md`

Tabela de versões atualizada com nova versão e descrição.

---

## Grep de confirmação pós-edição

```bash
grep -rn "ldi-modal-lancamento-visto\|sessionStorage.*lancamento" src/
```

**Resultado: NENHUMA ocorrência encontrada.** Zero referências a `ldi-modal-lancamento-visto` ou `sessionStorage.*lancamento` em todo o código-fonte.

---

## Teste lógico

| # | Fluxo | Resultado |
|---|-------|-----------|
| 1 | Guest entra em `/webtoon/00` sem scrollar nada | ✅ Modal não aparece (guarda `!user` antes do observer) |
| 2 | Guest scrolla até o fim de `/webtoon/00` | ✅ Modal não aparece (guarda `!user` no observer) |
| 3 | Guest entra em `/livro/capitulo-01` sem scrollar nada | ✅ Modal não aparece (guarda `!user` antes do observer) |
| 4 | Guest scrolla até o fim de `/livro/capitulo-01` | ✅ Modal não aparece (guarda `!user` no observer) |
| 5 | Guest em nova aba / aba anônima / nova sessão, qualquer rota | ✅ Modal nunca aparece (guarda `!user` no ModalLancamento e nos observers) |
| 6 | Usuário logado chega ao fim do conteúdo em ambas as rotas | ⚠️ Comportamento preservado — modal aparece ao scrollar, mas sem sessionStorage para suprimir (PENDENTE DE DECISÃO DO ISAIAS) |

---

## Pendência de decisão do Isaias

**Para usuário logado:** o modal ainda aparece ao scrollar até o fim do conteúdo (comportamento preservado), mas o mecanismo de supressão por `sessionStorage` foi removido conforme instrução. Isso significa que usuários logados verão o modal toda vez que scrollarem ao fim do conteúdo na mesma sessão.

**Decisão pendente:**
- Manter assim (modal aparece toda vez para logado)?
- Reintroduzir supressão com `localStorage` para logado?
- Outra regra?

---

## Build

`npm run build` — ✅ Sucesso (1321 módulos transformados, 26 rotas pré-renderizadas).

---

## Versões

| Constante | Antes | Depois |
|-----------|-------|--------|
| SITE_VERSION | 10.183.39 | → **10.183.40** |

## Commit

Hash: (a ser preenchido após execução)

## Deploy

Status: (a ser preenchido após execução)

---

## Teste manual (a ser feito pelo Isaias)

1. Acesse `https://illusionfight.com/webtoon/00/` em aba anônima, sem criar conta, sem scrollar nada → confirme que o modal NÃO aparece.
2. Role até o fim da página → confirme que o modal continua sem aparecer.
3. Repita em `https://illusionfight.com/livro/capitulo-01/`.
4. Faça login e repita ambos os testes → confirme que o comportamento para usuário logado está preservado (modal aparece ao scrollar ao fim).
