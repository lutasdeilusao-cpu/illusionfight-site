# AUDITORIA DE CONTEÚDO PREMIUM
*Data: 2026-06-01*

## RESUMO
- Total de itens catalogados: 26
- Itens com acesso correto em trial: 0 (nenhum item checa TRIAL_ACTIVE)
- Itens bloqueados mesmo em trial (BUG): 13 capítulos + 8 glossário + 1 seção Xakaxi = 22
- Itens sem label PREMIUM visível (BUG): 0 (todos com label têm badge)

## CATÁLOGO COMPLETO

### LIVRO
| Capítulo | publicado | premium | Label visível? | Liberado em trial? | Status |
|---|---|---|---|---|---|
| Cap 01 | true | false | N/A | N/A | ✅ OK |
| Cap 02 | true | false | N/A | N/A | ✅ OK |
| Cap 03 | true | false | N/A | N/A | ✅ OK |
| Cap 04–16 | false | true | "EM BREVE" | ❌ | ❌ BUG — sem TRIAL_ACTIVE |

### WEBTOON
| Episódio | publicado | premium | Label visível? | Liberado em trial? | Status |
|---|---|---|---|---|---|
| Ep 00 | true | false | N/A | N/A | ✅ OK |

### MUNDO — GLOSSÁRIO
| Termo | premium | Label visível? | Liberado em trial? | Status |
|---|---|---|---|---|
| SDA | true | ✅ Badge PREMIUM | ❌ (sempre opacity 0.6) | ❌ BUG |
| SDD | true | ✅ Badge PREMIUM | ❌ | ❌ BUG |
| SAL | true | ✅ Badge PREMIUM | ❌ | ❌ BUG |
| STE | true | ✅ Badge PREMIUM | ❌ | ❌ BUG |
| SDP | true | ✅ Badge PREMIUM | ❌ | ❌ BUG |
| SVN | true | ✅ Badge PREMIUM | ❌ | ❌ BUG |
| Xakaxium | true | ✅ Badge PREMIUM | ❌ | ❌ BUG |
| Grande Purificação | true | ✅ Badge PREMIUM | ❌ | ❌ BUG |

### MUNDO — XAKAXI
| Seção | premium | Label visível? | Liberado em trial? | Status |
|---|---|---|---|---|
| Conteúdo extra (Ritual, fichas, sagas) | true | ✅ Tag PREMIUM | ❌ | ❌ BUG |

### PERSONAGENS
| Personagem | premium | Liberado em trial? | Status |
|---|---|---|---|
| Kim | false | N/A | ✅ OK |
| Jack | false | N/A | ✅ OK |
| Nina | false | N/A | ✅ OK |
| Demais | false | N/A | ✅ OK |

## BUGS ENCONTRADOS

### BUG 1 — LivroCapitulo não respeita TRIAL_ACTIVE
- Arquivo: `src/pages/LivroCapitulo.jsx` linha 43
- Condição atual: `if (!chapter || !chapter.publicado)`
- Correção: `if (!chapter || (!chapter.publicado && !TRIAL_ACTIVE))`
- Efeito: trial libera todos os capítulos

### BUG 2 — BookChaptersRow não respeita TRIAL_ACTIVE
- Arquivo: `src/components/BookChaptersRow.jsx` linha 15
- Condição atual: `.filter(ch => ch.publicado)`
- Correção: `.filter(ch => ch.publicado || TRIAL_ACTIVE)`
- Efeito: trial mostra todos os capítulos

### BUG 3 — Glossário premium sempre com opacity reduzida
- Arquivo: `src/pages/Mundo.jsx` linha 152
- Condição atual: `mundo-glossario-card--premium` aplica opacity: 0.6 sempre
- Correção: alterar para `opacity: 0.6` apenas quando `!TRIAL_ACTIVE`

### BUG 4 — Seção Xakaxi extra sempre bloqueada
- Arquivo: `src/pages/Mundo.jsx` linha 140
- A seção `mundo-premium-badge` aparece sempre com texto descritivo + badge PREMIUM
- Correção: quando `TRIAL_ACTIVE=true`, o conteúdo extra deve aparecer sem restrição (texto já é descritivo, mas badge sinaliza que é premium)

## PRÓXIMAS CORREÇÕES
As correções serão aplicadas nos arquivos afetados nesta task.
