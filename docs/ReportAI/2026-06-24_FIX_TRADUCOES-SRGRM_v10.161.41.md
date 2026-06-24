# FIX: Traduções SRGRM PT+EN+ES

**Data:** 2026-06-24  
**Branch:** `main`  
**Hash:** `aa244208`  
**Versão:** SITE_VERSION `10.161.40` → **10.161.41**

---

## 1. PROVA DE LEITURA — Outputs brutos (Etapa 1)

### 1.1 — Arquivos de i18n
```
arena-trash-en.json
arena-trash-es.json
en.json
es.json
pp_en.json
pp_es.json
pp_pt.json
pt.json
```

### 1.2 — Chaves `prototype.*` existentes (grep nos 3 idiomas)
Chaves encontradas em `pt.json:2805` — bloco `"prototype"` com `title`, `login_required`, `go_login`, `restricted`, `back_home`, `back`, `select_prompt`, `morto_engine`, `arena_testbed`.

Sem chaves `prototype.srgrm.*` em nenhum idioma.

### 1.3 — Referências no Prototype.jsx
```
17: titleKey: 'prototype.srgrm.title',
18: descKey: 'prototype.srgrm.desc',
24: titleKey: 'prototype.arena_testbed.title',
25: descKey: 'prototype.arena_testbed.desc',
83: <span className="prototype-card-title">{t(proto.titleKey)}</span>
84: <span className="prototype-card-desc">{t(proto.descKey)}</span>
```

---

## 2. MUDANÇAS — ANTES e DEPOIS

### 2.1 — `src/i18n/pt.json` (linhas 2817-2820)

**ANTES:**
```json
    "morto_engine": {
      "title": "Morto Engine — GENERIC RPG SYSTEM",
      "desc": "Sistema RPG completo: criação, testes, batalha, magia, efeitos."
    },
    "arena_testbed": {
```

**DEPOIS:**
```json
    "morto_engine": {
      "title": "Morto Engine — GENERIC RPG SYSTEM",
      "desc": "Sistema RPG completo: criação, testes, batalha, magia, efeitos."
    },
    "srgrm": {
      "title": "Sistema de RPG Genérico por Rafael Morto",
      "desc": "Protótipo de sistema de combate 3v3"
    },
    "arena_testbed": {
```

### 2.2 — `src/i18n/en.json` (linhas 2791-2794)

**ANTES:**
```json
    "morto_engine": {
      "title": "Morto Engine — GENERIC RPG SYSTEM",
      "desc": "Complete RPG system: creation, tests, battle, magic, effects."
    },
    "arena_testbed": {
```

**DEPOIS:**
```json
    "morto_engine": {
      "title": "Morto Engine — GENERIC RPG SYSTEM",
      "desc": "Complete RPG system: creation, tests, battle, magic, effects."
    },
    "srgrm": {
      "title": "Generic RPG System by Rafael Morto",
      "desc": "3v3 combat system prototype"
    },
    "arena_testbed": {
```

### 2.3 — `src/i18n/es.json` (linhas 2790-2793)

**ANTES:**
```json
    "morto_engine": {
      "title": "Morto Engine — GENERIC RPG SYSTEM",
      "desc": "Sistema RPG completo: creación, pruebas, batalla, magia, efectos."
    },
    "arena_testbed": {
```

**DEPOIS:**
```json
    "morto_engine": {
      "title": "Morto Engine — GENERIC RPG SYSTEM",
      "desc": "Sistema RPG completo: creación, pruebas, batalla, magia, efectos."
    },
    "srgrm": {
      "title": "Sistema de RPG Genérico por Rafael Morto",
      "desc": "Prototipo de sistema de combate 3v3"
    },
    "arena_testbed": {
```

---

## 3. GREP DE CONFIRMAÇÃO

```
src\i18n\pt.json:2817: "srgrm": {
src\i18n\pt.json:2818: "title": "Sistema de RPG Genérico por Rafael Morto",
src\i18n\pt.json:2819: "desc": "Protótipo de sistema de combate 3v3"
src\i18n\en.json:2791: "srgrm": {
src\i18n\en.json:2792: "title": "Generic RPG System by Rafael Morto",
src\i18n\en.json:2793: "desc": "3v3 combat system prototype"
src\i18n\es.json:2790: "srgrm": {
src\i18n\es.json:2791: "title": "Sistema de RPG Genérico por Rafael Morto",
src\i18n\es.json:2792: "desc": "Prototipo de sistema de combate 3v3"
```

**9 matches** — 3 blocos `srgrm` + 3 titles + 3 descs.

---

## 4. TESTE LÓGICO

| Cenário | Resultado |
|---|---|
| **C1 — Card SRGRM em PT:** "Sistema de RPG Genérico por Rafael Morto" | **✅** |
| **C2 — Card SRGRM em EN:** "Generic RPG System by Rafael Morto" | **✅** |
| **C3 — Card SRGRM em ES:** "Sistema de RPG Genérico por Rafael Morto" | **✅** |
| **C4 — Card ArenaTestbed intacto:** Nenhuma chave modificada | **✅** |

---

## 5. BUILD

```
npm run build

vite v8.0.16 building client environment for production...
✓ 1273 modules transformed.
✓ built in 2.21s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

---

## 6. VERSÕES + HASH + DEPLOY

| Artefato | Antes | Depois |
|---|---|---|
| SITE_VERSION | 10.161.40 | → **10.161.41** |
| **Commit** | `d940c531` | → **`aa244208`** |
| **Mensagem** | — | `fix: traduções SRGRM PT+EN+ES + v10.161.41` |
| **Deploy** | — | **✅ Published via gh-pages** |
