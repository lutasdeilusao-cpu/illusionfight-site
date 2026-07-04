# Relatório de Investigação — Modal "Criar Conta Grátis" reaparecendo para guest

**Data:** 2026-07-04
**Tipo:** Investigação pura (sem correção)
**Escopo:** Portal inteiro

---

## 1. Mapeamento de TODOS os pontos de renderização do modal

### 1.1 Grep completo
```bash
grep -rln "ModalLancamento\|CRIAR CONTA GRÁTIS\|Gostou? Tem muito mais\|isso aqui é só uma entrada" src/
```

### Resultados encontrados

| Arquivo | Função |
|---------|--------|
| `src/components/ModalLancamento/ModalLancamento.jsx` | Definição do componente |
| `src/pages/content/WebtoonEpisodio.jsx` | Import + render |
| `src/pages/content/LivroCapitulo.jsx` | Import + render |

### 1.2 É global ou local?

```bash
grep -rn "import.*ModalLancamento\|<ModalLancamento" src/App.jsx
# → NENHUM resultado
```

**O ModalLancamento NÃO é global.** Está montado localmente em apenas 2 páginas:
- `/webtoon/:id` (apenas para id === '00')
- `/livro/:id` (apenas para id === 'capitulo-01')

**Não aparece em:** Home, Personagens, Mundo, Musicas, Games, Livro (índice), Webtoon (índice), nenhuma página de game, nenhuma página de plataforma.

---

## 2. Condições de exibição completas

### 2.1 WebtoonEpisodio.jsx (linhas 53-62)
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
**Condições:** id === '00' AND sessionStorage NÃO tem a chave 'ldi-modal-lancamento-visto' AND última página do webtoon entrou no viewport.

### 2.2 LivroCapitulo.jsx (linhas 113-121)
```js
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
**Condições:** id === 'capitulo-01' AND sessionStorage NÃO tem a chave 'ldi-modal-lancamento-visto' AND sentinel (fim do capítulo) entrou no viewport.

### 2.3 ModalLancamento.jsx (linhas 8-41)
```js
const STORAGE_KEY = 'ldi-modal-lancamento-visto'

export default function ModalLancamento({ mostrar, onFechar }) {
  const { user } = useAuth()

  if (!mostrar) return null  // ← controlado pelo estado do parent

  const handleFechar = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')  // ← suppression key
    onFechar()
  }
```
**Comportamento:** Se `!user`, mostra CTA "Crie sua conta grátis" + botão "CRIAR CONTA GRÁTIS" → `/cadastro`.
Se `user` logado, mostra texto "Obrigado por ler! Vamos avisar você no dia do lançamento."

---

## 3. Histórico de correções anteriores

### 3.1 Commits relevantes

| Hash | Descrição | Data |
|------|-----------|------|
| `69e4a272` | feat: cap1 livro + ep1 webtoon liberados p/ guest + modal lancamento + v10.156.65 | 2026-06-19 |
| `2bf7504d` | fix: liberar cap1 livro + ep00/01 webtoon p/ guest — fix real + v10.156.66 | 2026-06-19 |
| `a54ab44c` | fix: revogar ep01 + home ep00 + home cap1 clicaveis + v10.156.67 | 2026-06-19 |
| `04babd0f` | refactor: reorganização src/pages/ em games/content/platform/site/lab + v10.163.0 | 2026-06-22 |
| `4d2f71b6` | fix: i18n path mismatch ModalLancamento + hardcoded ATAQUE + v10.183.25 | 2026-07-01 |
| `c25d1f02` | fix: bloquear popup de achievement para usuario guest + v10.183.30 | 2026-07-02 |
| `bc51991c` | fix: UnifiedNotification guest guard + clearByType defense-in-depth + v10.183.31 | 2026-07-02 |
| `8375c872` | docs: relatório investigação ampla popup guest + v10.183.32 | 2026-07-02 |

### 3.2 O que cada correção fez

**`69e4a272` — Commit original da feature:**
- Criou `ModalLancamento.jsx` com `sessionStorage` como mecanismo de supressão
- Inseriu o modal em `LivroCapitulo.jsx` (capítulo 01) e `WebtoonEpisodio.jsx` (episódio 01)
- Usou `sessionStorage.setItem(STORAGE_KEY, '1')` no fechamento

**`2bf7504d` — Estendeu para episódio 00 também:**
- Mudou a condição `id === '01'` para `(id === '00' || id === '01')`

**`a54ab44c` — Revogou episódio 01:**
- Removeu `id === '01'` da condição, deixando apenas `id === '00'`

**`4d2f71b6` — Fix i18n path:**
- Mudou as chaves de `site.modal_lancamento.*` para `site.games.modal_lancamento.*`

**`c25d1f02` + `bc51991c` — Achievement guest guard (problema adjacente):**
- Correção para achievement pop-up de guest, NÃO relacionada ao ModalLancamento
- Confirmado pelo relatório `2026-07-02_INV_FIX_popup_guest_final_scroll_v10.183.32.md` que o único pop-up visível para guest era o ModalLancamento

### 3.3 Nenhum commit anterior mexeu no mecanismo de supressão (`sessionStorage`)

A escolha de `sessionStorage` do commit original (69e4a272) nunca foi alterada. Nenhuma correção subsequente mudou para `localStorage` ou adicionou fallback.

---

## 4. Testes por rota

### 4.1 Rotas onde o modal é montado

| Rota | Componente | Modal aparece? | Condição |
|------|-----------|---------------|----------|
| `/webtoon/00` | WebtoonEpisodio | ✅ Sim, ao scrollar ao fim | `id === '00'` + sem sessionStorage key + última página visível |
| `/webtoon/01` | WebtoonEpisodio | ❌ Não (página bloqueada para guest, early return antes do render) | `id !== '00'` |
| `/livro/capitulo-01` | LivroCapitulo | ✅ Sim, ao scrollar ao fim | `id === 'capitulo-01'` + sem sessionStorage key + sentinel visível |
| `/livro/capitulo-02` | LivroCapitulo | ❌ Não (só capítulo 01) | `id !== 'capitulo-01'` |

### 4.2 Rotas onde o modal NÃO é montado (controle)

| Rota | Componente | Modal aparece? | Prova |
|------|-----------|---------------|-------|
| `/` (Home) | Home.jsx | ❌ Não | ModalLancamento não importado |
| `/personagens` | Personagens.jsx | ❌ Não | ModalLancamento não importado |
| `/livro` (índice) | Livro.jsx | ❌ Não | ModalLancamento não importado |
| `/webtoon` (índice) | Webtoon.jsx | ❌ Não | ModalLancamento não importado |
| `/mundo` | Mundo.jsx | ❌ Não | ModalLancamento não importado |
| `/games` | Games.jsx | ❌ Não | ModalLancamento não importado |
| `/musicas` | Musicas.jsx | ❌ Não | ModalLancamento não importado |
| `/games/ldi` | LDILobby | ❌ Não | ModalLancamento não importado |

### 4.3 Cenários de reincidência para guest

| Cenário | Modal aparece? | Motivo |
|---------|---------------|--------|
| Guest abre `/webtoon/00` pela primeira vez, scrolla ao fim | ✅ Sim | sessionStorage vazio |
| Guest fecha modal, continua na mesma aba | ❌ Não | sessionStorage key setada |
| Guest abre NOVA ABA e vai para `/webtoon/00` | ✅ Sim | sessionStorage é tab-scoped (vazio na nova aba) |
| Guest fecha aba, abre nova, vai para `/webtoon/00` | ✅ Sim | sessionStorage expirou |
| Guest fecha modal no webtoon, navega para `/livro/capitulo-01` na mesma aba | ❌ Não | sessionStorage persiste entre SPA navigations na mesma aba |
| Guest em aba anônima / modo privado | ✅ Sim (por tab) | sessionStorage é isolado por sessão |
| Guest fecha modal, recarrega a página | ❌ Não | sessionStorage sobrevive a refresh (na mesma aba) |

---

## 5. Classificação da causa raiz

### 5.1 Prova em código

**Arquivo:** `src/components/ModalLancamento/ModalLancamento.jsx:6` e `:16`
```js
const STORAGE_KEY = 'ldi-modal-lancamento-visto'
// ...
const handleFechar = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')  // ← FALHA ARQUITETURAL
    onFechar()
}
```

**Arquivo:** `src/pages/content/WebtoonEpisodio.jsx:57`
```js
if ((id === '00') && !sessionStorage.getItem('ldi-modal-lancamento-visto')) setShowModal(true)
```

**Arquivo:** `src/pages/content/LivroCapitulo.jsx:115`
```js
if (sessionStorage.getItem('ldi-modal-lancamento-visto')) return
```

### 5.2 Diagnóstico

**Classe:** FALHA DE ARQUITETURA, não bug pontual.

O mecanismo de supressão do modal usa **`sessionStorage` exclusivamente** em 3 pontos:
1. No componente `ModalLancamento` (set no fechamento)
2. No `WebtoonEpisodio` (check antes de disparar)
3. No `LivroCapitulo` (check antes de disparar)

`sessionStorage` tem as seguintes propriedades que tornam este mecanismo quebrado para guest:

| Propriedade | Efeito | Impacto para guest |
|------------|--------|-------------------|
| **Tab-scoped** | Cada aba/tab tem seu próprio sessionStorage isolado | Guest que abre link em nova aba vê o modal de novo |
| **Session-scoped** | sessionStorage é limpo ao fechar a aba/navegador | Guest que retorna ao site depois vê o modal de novo |
| **Sem persistência cross-tab** | Dados não são compartilhados entre abas | Guest não tem como "suprimir globalmente" |
| **Sem persistência cross-session** | Não sobrevive ao fechamento do navegador | Guest que volta no dia seguinte vê o modal de novo |
| **Comportamento imprevisível em modo privado** | Navegadores podem limpar sessionStorage de forma diferente | Guest em modo anônimo é o mais afetado |

**A correção deve usar `localStorage`** como mecanismo de supressão, que persiste entre abas, entre sessões, e entre visitas. Alternativamente, se a intenção é que o modal apareça apenas uma vez na vida do usuário (nunca mais após o primeiro fechamento), `localStorage` é a escolha correta.

### 5.3 Escopo real do bug

| Aspecto | Resultado |
|---------|-----------|
| **É global?** | ❌ Não. Modal só é montado em 2 páginas específicas |
| **Rotas afetadas** | `/webtoon/00` e `/livro/capitulo-01` (apenas estas 2) |
| **Condição de disparo** | Scroll até o fim do conteúdo (para guest E logado) |
| **Problema real** | sessionStorage como suppression key → reaparece em nova aba/nova sessão |
| **Gravidade** | Média — não é um loop infinito, mas quebra a expectativa de "não mostrar de novo" |

---

## 6. Rotas testadas × Resultado

| Rota | Modal presente? | Apareceu? | Notas |
|------|----------------|-----------|-------|
| `/webtoon/00` | ✅ Sim | ✅ Sim (scroll ao fim) | sessionStorage check |
| `/webtoon/01` | ✅ Sim (componente) | ❌ Bloqueado | Guest não acessa ep 01 |
| `/livro/capitulo-01` | ✅ Sim | ✅ Sim (scroll ao fim) | sessionStorage check |
| `/livro/capitulo-02` | ✅ Sim (componente) | ❌ Não | Só cap 01 tem condição |
| `/` (Home) | ❌ Não | ❌ Não | — |
| `/personagens` | ❌ Não | ❌ Não | — |
| `/livro` | ❌ Não | ❌ Não | — |
| `/webtoon` | ❌ Não | ❌ Não | — |
| `/mundo` | ❌ Não | ❌ Não | — |
| `/games` | ❌ Não | ❌ Não | — |
| `/musicas` | ❌ Não | ❌ Não | — |

---

## 7. Relação com investigação anterior (2026-07-02)

O relatório `2026-07-02_INV_FIX_popup_guest_final_scroll_v10.183.32.md` investigou **achievement pop-ups** para guest e concluiu:
- O ModalLancamento era o único pop-up visível (a palavra "conquistar" no texto foi confundida com achievement)
- As correções de achievement (clearByType, guest guard) estavam corretas e funcionando

**Esta investigação é complementar**: foca exclusivamente no ModalLancamento e no mecanismo de supressão por `sessionStorage`, que a investigação anterior não endereçou.

---

## 8. Recomendação de correção (não aplicar nesta rodada)

1. **Substituir `sessionStorage` por `localStorage`** em todos os 3 pontos (ModalLancamento.jsx, WebtoonEpisodio.jsx, LivroCapitulo.jsx)
2. **Opção:** Adicionar guarda para não mostrar o modal se user está logado (já está logado? não precisa do CTA) — mas isso já é parcialmente tratado no componente (mostra texto diferente para logado)
3. **Migração:** Verificar se a chave `ldi-modal-lancamento-visto` existe no `sessionStorage` ao migrar para `localStorage` para não perder o estado de sessões ativas

---

## 9. Resumo executivo

| Item | Valor |
|------|-------|
| **Escopo real** | Isolado em 2 rotas: `/webtoon/00` e `/livro/capitulo-01` |
| **Causa raiz** | `sessionStorage` como mecanismo de supressão — falha de arquitetura |
| **Prova** | `ModalLancamento.jsx:16` — `sessionStorage.setItem()` / `WebtoonEpisodio.jsx:57` e `LivroCapitulo.jsx:115` — `sessionStorage.getItem()` |
| **Rotas afetadas** | `/webtoon/00`, `/livro/capitulo-01` |
| **Rotas testadas (controle)** | `/`, `/personagens`, `/livro`, `/webtoon`, `/mundo`, `/games`, `/musicas` — nenhuma afetada |
| **Tipo** | Falha arquitetural, não bug pontual |
