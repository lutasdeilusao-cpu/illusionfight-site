# PROPOSTA — Jack Dream Detective (Standalone)

*Extração do sistema de investigação de Jack Dream Beer como jogo independente em `/extras`*

**Versão proposta:** 1.0.0  
**Console:** `[JACK-DET] versão carregada: 1.0.0`  
**Rota:** `/extras/jack-detective`  
**Regra absoluta:** Nenhum arquivo em `src/pages/JackCandy/` é modificado.

---

## 1. VISÃO GERAL

O que foi feito com Arena (extrair combate do LDI) agora se aplica ao sistema de casos do Jack. O jogo original Jack Dream Beer é um idle noir que contém 3 sistemas distintos:

| Sistema | No Jack original | Extraído como |
|---|---|---|
| Dungeon automática + recursos | JackCandy core | — (continua no Jack) |
| Investigação + casos | Jack screens 6-10 | **Jack Dream Detective** |
| Puzzles reutilizáveis | usados nos 2 acima | Componentes compartilhados |

A extração isola o loop de detetive: selecionar caso → investigar locais → resolver puzzles → coletar pistas → acusar → confronto final. Sem cervejas, sem dungeons idle, sem NPCs da vila, sem save slots.

---

## 2. ARQUITETURA DA EXTRAÇÃO

### 2.1 O que é COPIADO (read-only do Jack)

| Origem | Destino | Nota |
|---|---|---|
| `src/pages/JackCandy/data/casos.js` | `src/pages/JackDetective/data/casos.js` | Copiado. Expandido com +2 casos novos. |
| `src/pages/JackCandy/data/pistas.js` | `src/pages/JackDetective/data/pistas.js` | Copiado. Expandido com pistas dos novos casos. |
| `src/pages/JackCandy/components/IntroNoir.jsx` | `src/pages/JackDetective/components/IntroNoir.jsx` | Copiado. CSS migrado para JackDetective.css. |
| `src/pages/JackCandy/components/DialogoCaso.jsx` | `src/pages/JackDetective/components/DialogoCaso.jsx` | Copiado. CSS migrado. |
| `src/pages/JackCandy/components/PistaCard.jsx` | `src/pages/JackDetective/components/PistaCard.jsx` | Copiado. CSS migrado. |
| `src/pages/JackCandy/components/DicaToast.jsx` | `src/pages/JackDetective/components/DicaToast.jsx` | Copiado. Adaptado para dicas de detetive. |
| Puzzles: `src/components/Puzzles/` | Referenciados diretamente (já são shared) | Nenhuma cópia necessária. |

### 2.2 O que é REESCRITO (nova implementação)

| Arquivo | Baseado em | Mudanças |
|---|---|---|
| `store/useDetectiveStore.js` | `useJackStore.js` (partes de caso) | Só estado de investigação. Sem idle, cervejas, dungeons. Adiciona: score por caso, ranking, tempo. |
| `CasoSelect.jsx` | Jack `CasoSelect.jsx` | Cards redesenhados, tier de dificuldade, preview do caso |
| `CasoAbertura.jsx` | Jack `CasoAbertura.jsx` | Mantém IntroNoir + DialogoCaso |
| `Investigacao.jsx` | Jack `Investigacao.jsx` | Puzzles sem dungeon gate. Sem custo de arrombar em cervejas — usa sistema de "tentativas" (3 por caso). |
| `Dossier.jsx` | Jack `Dossier.jsx` | UI redesenhada, sem debug buttons. Score visível. |
| `Interrogatorio.jsx` | Jack `Interrogatorio.jsx` | Generalizado para qualquer confronto final, não só Kim. |
| `DetectiveContainer.jsx` | NOVO | Roteador de fases (igual ArenaRoute). Log de versão. |
| `VictoryScreen.jsx` | NOVO | Tela de conclusão do caso com score, estrelas, tempo. |
| `JackDetective.css` | Recortado de `JackCandy.css` | Só classes noir usadas: `.jdc-dossier`, `.jdc-pista-card`, `.jdc-investigacao`, `.jdc-interrogatorio`, `.jdc-caso-dialogo`, typing, etc. |

### 2.3 O que é NOVO (expansões)

| Funcionalidade | Descrição |
|---|---|
| **Score por caso** | Estrelas (1-3) baseadas em: acusações erradas, tempo, pistas coletadas |
| **6 casos** | 4 originais + 2 novos escritos para o standalone |
| **Tiers de dificuldade** | Casos têm tier (1-3). Tier 1: 3 pistas. Tier 2: 4-5 pistas. Tier 3: 6+ pistas. |
| **Sistema de tentativas** | 3 tentativas por puzzle. Sem custo em recursos. Se zerar, puzzle é pulado com penalidade de score. |
| **Perfil do detetive** | Nome, avatar (placeholder), total de casos resolvidos, score acumulado |
| **Ranking** | Top 10 detetives por score (Supabase `detective_scores`) |
| **Trilha sonora ambiente** | Áudio de chuva e jazz noir (placeholder, YouTube embed) |
| **Notebook visual** | Dossier redesenhado como caderno de detetive: páginas viradas, anotações manuscritas |

---

## 3. FLUXO DO JOGO

```
/extras/jack-detective
  │
  ├─ CasoSelect (grid de 6 casos, tiers, bloqueio progressivo)
  │    │
  │    └─ CasoAbertura (IntroNoir + DialogoCaso)
  │         │
  │         └─ Dossier (painel: suspeitos, pistas, locais, botão ACUSAR)
  │              │
  │              ├─ Investigacao (puzzle → coleta pista → volta ao dossier)
  │              │
  │              └─ Acusar (selecionar suspeito → DialogoCaso resolução)
  │                   │
  │                   ├─ Culpado → VictoryScreen (score, estrelas)
  │                   └─ Inocente → penalidade, volta ao dossier
```

---

## 4. ARQUIVOS — LISTA COMPLETA

### A criar

```
src/pages/JackDetective/
├── DetectiveContainer.jsx          # Roteador de fases (lobby / caso_select / caso_abertura / dossier / investigacao / interrogatorio / victory)
├── CasoSelect.jsx                  # Grid de 6 casos com tiers e progressão
├── CasoAbertura.jsx                # IntroNoir + DialogoCaso de abertura
├── Investigacao.jsx                # Puzzle gate + coleta de pista
├── Dossier.jsx                     # Painel de investigação: suspeitos, pistas, locais, acusar
├── Interrogatorio.jsx             # Confronto final dialogado
├── VictoryScreen.jsx              # Score, estrelas, resumo do caso
├── JackDetective.css              # Paleta noir, classes de dossier/investigação/interrogatorio
├── store/
│   └── useDetectiveStore.js       # Estado: casoAtivo, pistas, suspeitos, score, tier
├── data/
│   ├── casos.js                    # 6 casos (4 originais + 2 novos)
│   └── pistas.js                   # Pistas expandidas
└── components/
    ├── IntroNoir.jsx               # Animação noir (copiada do Jack)
    ├── DialogoCaso.jsx             # Typewriter multi-personagem (copiado)
    ├── PistaCard.jsx               # Card de pista (copiado)
    └── DicaToast.jsx               # Dicas contextuais (adaptado)
```

### A modificar

| Arquivo | Mudança |
|---|---|
| `src/App.jsx` | Adicionar `<Route path="/extras/jack-detective" element={<LoginGate feature="o Jack Dream Detective"><DetectiveContainer /></LoginGate>} />` e `import DetectiveContainer` |
| `src/pages/Extras.jsx` | Adicionar card "Jack Dream Detective" com ícone 🕵️, cor `#00FF88`, rota `/extras/jack-detective` |
| `SITE_MAP.md` | Adicionar seção Jack Dream Detective v1.0.0, rota na tabela |

---

## 5. DIFERENÇAS CRÍTICAS vs O JACK ORIGINAL

| Aspecto | Jack Dream Beer (original) | Jack Dream Detective (standalone) |
|---|---|---|
| **Recursos** | Cervejas, notas, fragmentos | Nenhum. Score apenas. |
| **Dungeon** | Gate de dungeon nos locais | Removido. Só puzzles. |
| **NPCs** | 10 NPCs com lojas, missões | Apenas nos diálogos (Nina, Kim, Pajé) |
| **Save** | 3 slots, auto-save, Supabase | 1 perfil de detetive, Supabase `detective_profiles` |
| **Progressão** | Flags, cidades, níveis | Casos desbloqueiam sequencialmente (tier 1 → 2 → 3) |
| **Fail state** | HP/Moral, morte | Tentativas por puzzle. Sem morte. |
| **Confronto** | Dungeon boss ou interrogatório | Sempre diálogo (DialogoCaso). Sem combate. |
| **UI** | StatusBar, recursos, dia/noite | Apenas header do caso + score. Mais limpo. |
| **Puzzles** | 5 tipos, custo arrombar em 🍺 | 5 tipos. 3 tentativas. Penalidade de score ao pular. |

---

## 6. PALETA E VISUAL

Mantém a paleta noir do Jack, com ajustes para o standalone:

| Elemento | Cor | Uso |
|---|---|---|
| Fundo | `#000` | Tela cheia |
| Texto | `#C8C8C8` | Corpo |
| Jack (protagonista) | `#00FF88` | Diálogos do detetive |
| Destaque | `#F5A623` | Títulos, bordas ativas, pistas |
| Perigo | `#8B0000` | Acusação errada, score baixo |
| Concluído | `#22C55E` | Caso resolvido, local visitado |
| Secundário | `#555`, `#666`, `#888` | Textos auxiliares |

**Scanlines:** Sim, em toda a tela (diferente da Arena, que removeu). Aqui o efeito noir é essencial.

---

## 7. EXPANSÕES FUTURAS (v1.1+)

| Funcionalidade | Descrição |
|---|---|
| **Editor de casos** | Interface para criar casos customizados (JSON exportável) |
| **Multiplayer cooperativo** | 2 detetives investigando o mesmo caso via Supabase Realtime |
| **Galeria de vilões** | Coleção de suspeitos capturados com arte e backstory |
| **DLC de casos** | Novos casos como "expansões de história" |
| **Voice acting** | Narração em áudio para diálogos principais |
| **Mobile gestures** | Swipe entre locais, pinch no dossier |

---

## 8. DEPLOY — SEQUÊNCIA

1. Criar `src/pages/JackDetective/` com todos os arquivos acima
2. Copiar dados (`casos.js`, `pistas.js`) do Jack original
3. Escrever `useDetectiveStore.js` (Zustand, só estado de investigação)
4. Escrever `DetectiveContainer.jsx` (roteador de fases)
5. Escrever as 6 screens (CasoSelect, CasoAbertura, Investigacao, Dossier, Interrogatorio, VictoryScreen)
6. Copiar e adaptar componentes (IntroNoir, DialogoCaso, PistaCard, DicaToast)
7. Extrair CSS relevante para `JackDetective.css`
8. Adicionar 2 novos casos em `casos.js`
9. Adicionar rota em `App.jsx`
10. Adicionar card em `Extras.jsx`
11. Bump `JACK_DET_VERSION = '1.0.0'`
12. `npm run build`
13. `git add -A && git commit -m "feat: Jack Dream Detective v1.0.0"`
14. `git push && npm run deploy`

---

## 9. MÉTRICAS DE SUCESSO

- [ ] 6 casos jogáveis (4 originais + 2 novos)
- [ ] Sistema de score com estrelas (1-3 por caso)
- [ ] Puzzles integrados sem dependência de dungeon
- [ ] Zero dependências do JackCandy (sem importar store, screens, ou dados do Jack original)
- [ ] Console: `[JACK-DET] versão carregada: 1.0.0`
- [ ] Build limpo, deploy publicado
- [ ] Nenhum arquivo em `src/pages/JackCandy/` modificado
