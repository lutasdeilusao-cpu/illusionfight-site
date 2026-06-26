# DIAGNÓSTICO — Regressão pós-reorganização de pastas

**Data:** 2026-06-25
**Versão atual:** 10.163.0
**Commit:** 04babd0f

## ETAPA 1 — Build atual

**Resultado:** ✅ Build passou limpo
- 1243 módulos transformados
- 0 erros de import não resolvido
- 0 erros de encoding no bundle
- 1.88s de build
- 26 rotas pré-renderizadas

**Warnings (pré-existentes, não causados pela reorganização):**
- [INEFFECTIVE_DYNAMIC_IMPORT] supertrunfo-pt/en/es.json (3x) — já existia antes
- (!) Some chunks are larger than 500 kB — já existia antes

## ETAPA 2 — Imports quebrados

**App.jsx:** 42 imports → todos apontam para paths NOVOS corretos
  - ./pages/site/Home ✅
  - ./pages/content/Musicas ✅
  - ./pages/games/LDI/Lobby ✅
  - ... etc

**StoryProgress.jsx:** 1 import → '../pages/games/Games' ✅

**Nenhum import antigo** (from.*pages/ sem category) encontrado em nenhum arquivo src/.

**Imports de dados/i18n:**
- locales.js → ./pt.json, ./en.json, ./es.json (mesmo diretório) ✅
- LanguageProvider.jsx → ../i18n/locales ✅
- data/ JSONs → resolved via ../../data/ a partir dos novos paths ✅

## ETAPA 3 — Arquivos críticos

- Games.jsx → games/Games.jsx ✅
- Home.jsx → site/Home.jsx ✅
- Perfil.jsx → platform/Perfil/Perfil.jsx ✅
- 181 arquivos .jsx em pages/ ✅
- Todos os 10 arquivos i18n existem ✅
- Todos os 22 arquivos data/ existem ✅

## ETAPA 4 — LanguageContext

**locales.js (linhas 1-8):** imports relativos para ./pt.json, ./en.json, ./es.json
  → NÃO afetados pela reorganização (mesmo diretório)

**LanguageProvider.jsx (linha 3):** import { locales } from '../i18n/locales'
  → Caminho relativo preservado, NÃO afetado

## ETAPA 5 — Bundle

- "toptrumps" e "Top Trumps" presentes no bundle JS ✅
- Conteúdo completo do pt.json inline no bundle ✅
- charset UTF-8 definido no HTML ✅
- 28 páginas HTML pré-renderizadas ✅

## CONCLUSÃO

**❌ NENHUMA REGRESSÃO ENCONTRADA**

A reorganização de src/pages/ foi executada corretamente:
1. git mv preservou histórico de todos os 352 arquivos
2. Imports em App.jsx e StoryProgress.jsx foram atualizados
3. Imports internos nos arquivos movidos foram corrigidos (+1 nível ../)
4. Build compila sem erros
5. E2E (28/28) passa
6. i18n e data/ não foram afetados

A encoding issue nos caracteres acentuados do HTML (ic��ǜo) é PRÉ-EXISTENTE e está no template HTML/index.html, não na reorganização.
