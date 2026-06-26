# FIX: Restaurar metadados completos Top Trumps JSON v2.1

## Data: 2026-06-25

### O que foi feito
- Restaurados campos `nome`, `descricao`, `frase_iconica`, `elemental` nas 30 cartas dos 3 JSONs (PT/EN/ES)
- Versão dos JSONs: 2.0 → 2.1
- Valores numéricos de atributos mantidos idênticos entre locales
- Apenas nome/descricao/frase_iconica/atributos_explicacao variam por locale

### Verificação pós-escrita
```
--- PT ---
Total: 30 cartas
Todos os campos obrigatorios presentes: True
Nenhuma carta com atributos zerados

--- EN ---
Total: 30 cartas
Todos os campos obrigatorios presentes: True
Nenhuma carta com atributos zerados

--- ES ---
Total: 30 cartas
Todos os campos obrigatorios presentes: True
Nenhuma carta com atributos zerados
```

### Versões
| Arquivo | Constante | Antes | Depois |
|---------|-----------|-------|--------|
| `src/config/version.js` | TS_VERSION | 5.23.0 | **5.24.0** |
| `src/config/version.js` | SITE_VERSION | 10.162.44 | **10.162.45** |
| `src/data/supertrunfo-pt.json` | meta.versao | 2.0 | **2.1** |
| `src/data/supertrunfo-en.json` | meta.versao | 2.0 | **2.1** |
| `src/data/supertrunfo-es.json` | meta.versao | 2.0 | **2.1** |
| `SITE_MAP.md` | TS_VERSION row | 5.23.0 | **5.24.0** |
| `SITE_MAP.md` | SITE_VERSION row | 10.162.44 | **10.162.45** |
| `SITE_MAP.md` | /games/toptrumps row | v5.23.0 | **v5.24.0** |

### Commit
```
c110c1c3 - fix: restaurar metadados cartas Top Trumps JSON v2.1 + v10.162.45
```

### Deploy
- `npm run build` ✅ (0 errors, only pre-existing warnings)
- `npm run deploy` ✅ **Published**
