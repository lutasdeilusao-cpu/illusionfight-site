# INV — Diagnóstico Completo: PPT Traduções não aparecem

**Data:** 2026-06-26
**Arquivos analisados:**
- `src/pages/games/TopTrumps/TopTrumps.jsx`
- `src/i18n/pt.json`, `src/i18n/en.json`, `src/i18n/es.json`
- `src/i18n/locales.js`
- `src/context/LanguageProvider.jsx`

---

## Perguntas do Relatório

### 1. O JSX dos botões PPT está chamando `t('games.toptrumps.ppt_rock')` ou string literal?

Está chamando `t()` com template string:

```
TopTrumps.jsx:796-799:
  {['rock', 'paper', 'scissors'].map(id => (
    <span className="tt-ppt-label">{t(`games.toptrumps.ppt_${id}`)}</span>
  ))}
```

Path usado: **`games.toptrumps.ppt_${id}`** (resolvendo para `games.toptrumps.ppt_rock`, etc.)

### 2. As chaves `ppt_rock`, `ppt_paper`, `ppt_scissors` existem no path correto `games.toptrumps.*` nos três locales?

**NÃO.** Elas existem APENAS em `games.mp.ppt_*`, NUNCA em `games.toptrumps.*`.

| Arquivo | Path onde existe | Path que o JSX usa |
|---|---|---|
| pt.json:1643 | `games.mp.ppt_rock` | `games.toptrumps.ppt_rock` ❌ |
| pt.json:1644 | `games.mp.ppt_paper` | `games.toptrumps.ppt_paper` ❌ |
| pt.json:1645 | `games.mp.ppt_scissors` | `games.toptrumps.ppt_scissors` ❌ |
| en.json:1616 | `games.mp.ppt_rock` | `games.toptrumps.ppt_rock` ❌ |
| en.json:1617 | `games.mp.ppt_paper` | `games.toptrumps.ppt_paper` ❌ |
| en.json:1618 | `games.mp.ppt_scissors` | `games.toptrumps.ppt_scissors` ❌ |
| es.json:1616 | `games.mp.ppt_rock` | `games.toptrumps.ppt_rock` ❌ |
| es.json:1617 | `games.mp.ppt_paper` | `games.toptrumps.ppt_paper` ❌ |
| es.json:1618 | `games.mp.ppt_scissors` | `games.toptrumps.ppt_scissors` ❌ |

### 3. Existe duplicata do namespace `toptrumps` no JSON que pode causar conflito?

**Não há duplicata do `toptrumps` em si.** O namespace `games.toptrumps` aparece uma única vez em cada JSON:

- pt.json:1405 — `"toptrumps": { ... }` (fecha em 1596)
- en.json:1378 — `"toptrumps": { ... }` (fecha em 1569)
- es.json:1378 — `"toptrumps": { ... }` (fecha em 1569)

O que existe é um SEGUNDO bloco `games.mp` (NÃO aninhado dentro de `toptrumps`):

- pt.json:1637 — `"mp": { ... }` (diretamente em `games.*`, linha 1610)
- en.json:1610 — `"mp": { ... }`
- es.json:1610 — `"mp": { ... }`

**Este `games.mp` contém as chaves `ppt_rock/paper/scissors` que o JSX procura em `games.toptrumps`.**

### 4. Causa Raiz

**Path errado no JSX + chaves no namespace errado.**

Existem **dois locais** com chaves PPT no JSON:

#### (A) `games.toptrumps.mp` — PPT do multiplayer Top Trumps (pt.json:1461-1492)
```
"mp": {
  "ppt_titulo": "PEDRA · PAPEL · TESOURA",
  "ppt_subtitulo": "Quem vencer começa escolhendo o atributo",
  "ppt_aguardando": "Aguardando oponente...",
  "ppt_voce": "VOCÊ",
  "ppt_venceu": "VOCÊ VENCEU O SORTEIO!",
  "ppt_perdeu": "OPONENTE VENCEU O SORTEIO!",
  "ppt_empate": "EMPATE! DE NOVO!",
}
```
- **Faltam:** `ppt_rock`, `ppt_paper`, `ppt_scissors`, `ppt_ia`, `ppt_voce_vence`, `ppt_ia_vence`

#### (B) `games.mp` — Namespace MULTIPLAYER GERAL (pt.json:1637-1671)
```
"mp": {
  "ppt_titulo": "Pedra, Papel, Tesoura",
  "ppt_subtitulo": "O vencedor começa!",
  "ppt_rock": "Pedra",
  "ppt_paper": "Papel",
  "ppt_scissors": "Tesoura",
  "ppt_voce": "Você",
  "ppt_ia": "IA",
  "ppt_voce_vence": "Você venceu!",
  "ppt_ia_vence": "IA venceu!",
  "ppt_empate": "Empate!",
}
```

#### Mapeamento JSX → JSON (TODOS os paths estão errados)

| JSX line | Path usado | Local real da chave | Encontra? |
|---|---|---|---|
| 787 | `games.toptrumps.ppt_titulo` | `games.toptrumps.mp.ppt_titulo` | ❌ |
| 788 | `games.toptrumps.ppt_subtitulo` | `games.toptrumps.mp.ppt_subtitulo` | ❌ |
| 798 | `games.toptrumps.ppt_${id}` | `games.mp.ppt_${id}` | ❌ |
| 802 | `games.toptrumps.ppt_aguardando` | `games.toptrumps.mp.ppt_aguardando` | ❌ |
| 811 | `games.toptrumps.ppt_voce` | `games.toptrumps.mp.ppt_voce` | ❌ |
| 817 | `games.toptrumps.ppt_ia` | `games.mp.ppt_ia` | ❌ |
| 837 | `games.toptrumps.ppt_voce` | `games.toptrumps.mp.ppt_voce` | ❌ |
| 840 | `games.toptrumps.ppt_ia` | `games.mp.ppt_ia` | ❌ |
| 846 | `games.toptrumps.ppt_voce_vence` | `games.mp.ppt_voce_vence` | ❌ |
| 848 | `games.toptrumps.ppt_ia_vence` | `games.mp.ppt_ia_vence` | ❌ |
| 849 | `games.toptrumps.ppt_empate` | `games.toptrumps.mp.ppt_empate` / `games.mp.ppt_empate` | ❌ |

**NENHUMA** das chaves PPT usadas no JSX encontra o path correto porque todas usam `games.toptrumps.ppt_*` mas as chaves estão em `games.toptrumps.mp.ppt_*` ou `games.mp.ppt_*`.

#### Comportamento do `t()` quando a chave não existe

`LanguageProvider.jsx:23`:
```js
if (result == null) result = path
```

O `t()` retorna o PRÓPRIO PATH como fallback. Portanto, o usuário vê literalmente:

- `"games.toptrumps.ppt_titulo"` no título
- `"games.toptrumps.ppt_rock"` no botão Pedra
- `"games.toptrumps.ppt_aguardando"` no texto de aguardando
- etc.

**Emoji funciona** porque `emojiMap` é definido inline no JSX:
```js
const emojiMap = { rock: '\u270A', paper: '\u270B', scissors: '\u270C\uFE0F' }
```

---

## Correção necessária

Duas alternativas:

### Alternativa A (recomendada — manter PPT em `games.toptrumps`):
1. Adicionar `ppt_rock`, `ppt_paper`, `ppt_scissors`, `ppt_ia`, `ppt_voce_vence`, `ppt_ia_vence` a `games.toptrumps.mp` nos 3 JSONs
2. Mudar JSX paths de `games.toptrumps.ppt_*` para `games.toptrumps.mp.ppt_*`

### Alternativa B (mínima — só consertar botões):  
1. Adicionar `ppt_rock/paper/scissors` diretamente em `games.toptrumps` (não `mp`) nos 3 JSONs
2. Path `games.toptrumps.ppt_${id}` passaria a funcionar para os botões

**Ambas precisam de bump de versão (TS_VERSION minor + SITE_VERSION patch).**

---

## Evidências brutas

```
# JSX — todas as chamadas ppt_
src\pages\games\TopTrumps\TopTrumps.jsx:787:  {t('games.toptrumps.ppt_titulo')}
src\pages\games\TopTrumps\TopTrumps.jsx:788:  {t('games.toptrumps.ppt_subtitulo')}
src\pages\games\TopTrumps\TopTrumps.jsx:798:  {t(`games.toptrumps.ppt_${id}`)}
src\pages\games\TopTrumps\TopTrumps.jsx:802:  {t('games.toptrumps.ppt_aguardando')}
src\pages\games\TopTrumps\TopTrumps.jsx:811:  {t('games.toptrumps.ppt_voce')}
src\pages\games\TopTrumps\TopTrumps.jsx:817:  {t('games.toptrumps.ppt_ia')}
src\pages\games\TopTrumps\TopTrumps.jsx:837:  {t('games.toptrumps.ppt_voce')}
src\pages\games\TopTrumps\TopTrumps.jsx:840:  {t('games.toptrumps.ppt_ia')}
src\pages\games\TopTrumps\TopTrumps.jsx:846:  {t('games.toptrumps.ppt_voce_vence')}
src\pages\games\TopTrumps\TopTrumps.jsx:848:  {t('games.toptrumps.ppt_ia_vence')}
src\pages\games\TopTrumps\TopTrumps.jsx:849:  {t('games.toptrumps.ppt_empate')}

# pt.json — chaves em games.toptrumps.mp (linhas 1470-1476)
1470: "ppt_titulo": "PEDRA · PAPEL · TESOURA",
1471: "ppt_subtitulo": "Quem vencer começa escolhendo o atributo",
1472: "ppt_aguardando": "Aguardando oponente...",
1473: "ppt_voce": "VOCÊ",
1474: "ppt_venceu": "VOCÊ VENCEU O SORTEIO!",
1475: "ppt_perdeu": "OPONENTE VENCEU O SORTEIO!",
1476: "ppt_empate": "EMPATE! DE NOVO!",

# pt.json — chaves em games.toptrumps (diretas, linhas 1580-1582)
1580: "ppt_pedra": "Pedra",
1581: "ppt_papel": "Papel",
1582: "ppt_tesoura": "Tesoura",

# pt.json — chaves em games.mp (NÃO em games.toptrumps, linhas 1640-1650)
1640: "ppt_titulo": "Pedra, Papel, Tesoura",
1641: "ppt_subtitulo": "O vencedor começa!",
1642: "ppt_aguardando": "Aguardando oponente...",
1643: "ppt_rock": "Pedra",
1644: "ppt_paper": "Papel",
1645: "ppt_scissors": "Tesoura",
1646: "ppt_voce": "Você",
1647: "ppt_ia": "IA",
1648: "ppt_voce_vence": "Você venceu!",
1649: "ppt_ia_vence": "IA venceu!",
1650: "ppt_empate": "Empate!",
```
