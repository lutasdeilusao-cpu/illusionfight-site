# FIX: PowerChoiceModal — opcoes mal formatadas + ataque comum ausente

**Data:** 2026-06-23
**Versão corrigida:** v6.6.1

---

## Problema

`escolherTipoAtaque` (useCombatEngine.js:337) passava raw power objects como `opcoes` do modal. PowerChoiceModal espera objetos com `{ rotulo, poderId, custoMP, disponivel }` — os raw powers têm `id`, `chaveI18n`, `custoMP` mas não têm `rotulo`, `poderId`, ou `disponivel`. Além disso, não havia opção "ataque comum".

**Sintomas:**
- Botões do modal renderizavam sem texto (`op.rotulo` = undefined)
- Botões apareciam desabilitados (`!op.disponivel` = `!undefined` = `true`)
- Nenhuma opção "ataque comum" disponível
- Modal sem botão fechar → jogador preso

## Solução

`t()` não está disponível no engine (useCombatEngine.js não importa `useLanguage`), então a transformação das `opcoes` foi feita em **Phase6CombatV2.jsx:344-352**, onde `t()` está disponível.

### ANTES (Phase6CombatV2.jsx:344)
```jsx
opcoes={powerChoiceModal.opcoes}
```

### DEPOIS (Phase6CombatV2.jsx:344-352)
```jsx
opcoes={[
  { rotulo: t('prototype.arena_testbed.pcm_comum'), poderId: null, custoMP: 0, disponivel: true },
  ...(powerChoiceModal.opcoes || []).map(p => ({
    rotulo: `${t('prototype.arena_testbed.' + p.chaveI18n)} (-${p.custoMP} MP)`,
    poderId: p.id,
    custoMP: p.custoMP,
    disponivel: true,
  })),
]}
```

## Teste lógico (3 cenários)

| Cenário | Fluxo | Resultado |
|---|---|---|
| 1. SEM poderes → Atacar | `poderesDisponiveis.length === 0` → sem modal | ✅ Não afetado |
| 2. COM poder → "Ataque Comum" | modal → opção `poderId: null` → `powerAttackMode: false` | ✅ |
| 3. COM poder → escolhe poder | modal → opção `poderId: p.id` → `powerAttackMode: true` | ✅ |

## Versões

| Constante | Antes | Depois |
|---|---|---|
| `ARENATESTBED_VERSION` | 6.6.0 | **6.6.1** |
| `SITE_VERSION` | 10.159.7 | **10.159.8** |
| `SITE_MAP.md` | ✅ | ✅ |

## Chave i18n

`prototype.arena_testbed.pcm_comum` já existia em PT/EN/ES. Não foi necessário criar.

## Build

`npm run build` → ✅ sucesso

## Commit

`e0bcda3d` — `fix: PowerChoiceModal opcoes formatadas + ataque comum + v6.6.1`

## Deploy

`npm run deploy` → ✅ **Published**
