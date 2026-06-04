# LDI ARENA MODE — Proposta de Extração

*Data: 2026-06-04 | Baseado no Manual de Batalha v1.0*

---

## 0. MANUAL DE REFERÊNCIA

**Arena Mode usa o Manual de Batalha completo:** `docs/importantes/MANUAL_BATALHA_LDI.md`

Este documento de proposta descreve COMO implementar. O manual define O QUE implementar:
- 30+ vantagens de batalha (vs 8 do LDI narrativo)
- 20 desvantagens (vs 8)
- 6 vantagens únicas (Sintético, Espírito, Predador, Metamorfo, Arcano, Predador Digital)
- 4 escalas de poder (Ningen ×1, Sugoi ×10, Kiodai ×100, Kami ×1000)
- 10 perícias de combate
- 42 poderes elementais em 7 elementais
- XP progressivo por faixa de atributo (10/20/30/50/100 XP)

**O LDI narrativo NÃO MUDA.** Suas regras simplificadas continuam servindo ao propósito do jogo de história.

---

## 1. OBJETIVO

Extrair o sistema de criação de ficha + combate do **Lendas do LDI** para criar um jogo standalone chamado **LDI Arena Mode** acessível em `/extras/ldi-arena`.

**O que faz:** Criar ficha → salvar na conta → lutar contra CPU → upar → repetir.

**O que NÃO tem:** História, cenas narrativas, escolhas, pistas, economia de créditos, dias/semanas, puzzles.

**Regra de ouro:** Nenhum arquivo do LDI narrativo é modificado. A arena importa o que é compartilhável e duplica o que precisa adaptar.

---

## 2. ARQUITETURA — O que compartilhar vs duplicar

### 2.1 ARQUIVOS COMPARTILHADOS (import direto, zero alterações)

| Arquivo | Motivo |
|---|---|
| `src/pages/LDI/engine/dice.js` | `rollD6()`, `testAttribute()` — puro, sem dependências |
| `src/pages/LDI/engine/combat.js` | `calcFA()`, `calcFD()`, `calcDamage()`, `deathTest()`, `calcInitiative()` — opera sobre objetos passados |
| `src/pages/LDI/engine/character.js` | `calcMaxPV()`, `calcMaxPM()`, `applyXP()`, `checkNearDeath()` — matemática pura |
| `src/pages/LDI/store/useCombatStore.js` | Loop completo de combate: `startCombat()`, `executeAttack()`, `executeEnemyAttack()`, `endCombat()` — recebe `sheet` e `enemy` como argumentos, zero conhecimento de cenas |
| `src/pages/LDI/data/enemies/enemies.json` | Dados estáticos de inimigos. Arena pode adicionar mais inimigos sem mexer no original |
| `src/pages/LDI/data/powersData.js` | 42 poderes em 7 elementais — compatível com ambos os sistemas |

### 2.2 ARQUIVOS DUPLICADOS (adaptação da lógica existente)

| Arquivo Original | Cópia Arena | O que muda |
|---|---|---|
| `useGameStore.js` | `useArenaStore.js` | Remove `defaultSave`, `setScene`, `makeChoice`, `addClue`, `setFlag`, `spendCredits`, `advanceDay`, `trackChoice`. Mantém `defaultSheet`, `updateSheet`, `gainXp`, `clearLevelUp`. Adiciona estado de partida (round, score) |
| `useLDIStorage.js` | `useArenaStorage.js` | Mantém `saveSheet`, `loadFullSheet`, `loadSheets`, `deleteSheet` (tabela `character_sheets`). Remove `saveGameSave`, `loadActiveSave` (tabela `game_saves` não usada) |
| `Create.jsx` | `ArenaCreate.jsx` | Reaproveita UI de criação de ficha (atributos, vantagens, desvantagens, perícias, arma, elemental). Remove NeoGuide. Adiciona botão "SALVAR E LUTAR" |
| `Combat.jsx` | `ArenaCombat.jsx` | Mesma UI de combate, sem WhatsApp-style log narrativo. Substitui por log mais direto. Remove pausa dramática "VEZ DO INIMIGO" |

### 2.3 ARQUIVOS NOVOS (não existem no LDI)

| Arquivo | Função |
|---|---|
| `ArenaLobby.jsx` | Hub: lista de fichas salvas, botão NOVA FICHA, seleção de inimigo, botão LUTAR |
| `ArenaVictory.jsx` | Tela de vitória: XP ganho, atributos atuais, botão CONTINUAR LUTANDO |
| `ArenaRoute.jsx` | Container com roteamento interno: lobby → create → combat → victory |

---

## 3. STORE DA ARENA (`useArenaStore.js`)

### Estado

```js
{
  // Ficha (mesmo formato do LDI)
  sheet: {
    id, sheet_name,
    attributes: { F, H, R, A, PdF },
    advantages, disadvantages, perks, specializations,
    weapon, elemental,
    xp_total, attribute_points_gained,
  },

  // Partida atual
  match: {
    enemy_id,           // qual inimigo está enfrentando
    round: 1,           // round atual (opcional, para scaling)
    pv_current: 20,     // PV no início do combate (R × 5)
    pm_current: 10,      // PM no início do combate (R × 5 no Arena, vs PdF × 4 no LDI narrativo)
    score: 0,           // placar de vitórias
    status: 'idle',     // idle | fighting | victory | defeat
  },

  // UI
  points_available: 10,
  temp_attributes: { F:0, H:0, R:0, A:0, PdF:0 },
  level_up_active: false,
  _userId: null,
}
```

### Ações

```js
{
  // Ficha
  newSheet(), updateSheet(partial), loadSheet(sheetData),
  gainXp(amount), clearLevelUp(),

  // Partida
  startMatch(enemy), endMatch(result),
  setMatchPV(pv), setMatchPM(pm),

  // Persistência
  saveToCloud(userId), loadSheetsFromCloud(userId), deleteSheet(sheetId),

  // Level Up
  incrementTempAttr(attr), decrementTempAttr(attr), confirmLevelUp(),
}
```

### O que NÃO existe no Arena Store

- `defaultSave`, `setScene`, `makeChoice`, `addClue`, `setFlag`, `hasFlag`
- `spendCredits`, `gainCredits`, `payWeeklyExpenses`, `advanceDay`, `trackChoice`
- `applySceneEffect` (mas `applySheetEffect` continua, pois é usado em level up)
- `currentScene`, `choices`, `sceneNav` (narrativa)

---

## 4. FLUXO DO JOGO

```
/extras/ldi-arena
        │
        ▼
┌──────────────────┐
│   ARENA LOBBY    │  ← Lista fichas salvas do usuário (Supabase)
│                  │
│ [NOVA FICHA]     │──→ ArenaCreate.jsx
│ [Ficha 1] [LUTAR]│──→ Selecionar inimigo → ArenaCombat.jsx
│ [Ficha 2] [LUTAR]│
│ [Ficha 3] [LUTAR]│
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  ARENA CREATE    │  ← Atributos, vantagens, desvantagens, arma, elemental
│                  │     (UI igual ao LDI, sem NeoGuide)
│ [SALVAR E LUTAR] │──→ Salva no Supabase → Lobby
└──────────────────┘
        │
        ▼
┌──────────────────┐
│ SELEÇÃO INIMIGO  │  ← Grid de inimigos com nome, rank, dificuldade, elemental
│                  │     Filtro: easy → medium → hard → very_hard
│ [Kaeda ★★☆]      │
│ [Thunderbolt ★★★]│──→ ArenaCombat.jsx
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  ARENA COMBAT    │  ← Modos: Mãos Livres / Armado / Poder
│                  │     Seleção de até 4 poderes
│ ⚔️ FA: 12        │     Dado animado + dano flutuante
│ 🛡️ FD: 8         │     Log de combate
│ ❤️ PV: 15/20     │
│ 💙 PM: 6/8       │
└──────────────────┘
        │
   ┌────┴────┐
   ▼         ▼
 VITÓRIA   DERROTA
 +10 XP    -0 XP
[LUTAR DE  [TENTAR DE
 NOVO]      NOVO]
```

---

## 5. COMPONENTES DETALHADOS

### 5.1 ArenaLobby.jsx
**Função:** Hub principal com cards de ficha.

```
┌─────────────────────────────────────────┐
│  ⚔️ LDI ARENA                          │
│  █ modo sobrevivência                  │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐    │
│  │ ⚔️ Kim       │  │ 🗡️ Jack      │    │
│  │ F:4 H:3 R:2  │  │ F:3 H:5 R:2  │    │
│  │ 🔥 Fogo      │  │ 💧 Água      │    │
│  │ LV 3 · 230XP │  │ LV 1 · 40XP  │    │
│  │ [LUTAR]      │  │ [LUTAR]      │    │
│  └──────────────┘  └──────────────┘    │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ ➕ NOVA FICHA                    │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 5.2 ArenaCreate.jsx
**Função:** Criação de ficha usando o Manual de Batalha completo.

**Diferença do LDI narrativo:** A Arena usa o sistema expandido de vantagens (30+), desvantagens (20), vantagens únicas (6) e escalas de poder. O LDI narrativo mantém seu sistema simplificado de 8 vantagens e 8 desvantagens.

Campos:
- Nome do lutador (input)
- Atributos: F, H, R, A, PdF (5 sliders/inputs com tooltips)
- Arma: dropdown (Katana, Lâminas Gêmeas, Lâmina de Corrente)
- Elemental: grid de 7 opções com ícones
- Vantagens: checkboxes com custo
- Desvantagens: checkboxes com ganho
- Perícias: checkboxes com custo
- Pontos disponíveis: contador no topo

Validação: `pontos === 0` para liberar botão SALVAR.

### 5.3 ArenaCombat.jsx
**Função:** Tela de combate (reaproveita `useCombatStore` + `CombatView.jsx`).

Diferenças do LDI narrativo:
- Não tem WhatsApp-style log (substituído por log direto)
- Não tem pausa dramática "VEZ DO INIMIGO"
- Modo Poder com seleção de até 4 poderes (igual)
- Dado animado com onomatopeias (igual)
- Barra de PV/PM (igual)
- Botão FUGIR (volta pro lobby)

### 5.4 ArenaVictory.jsx
**Função:** Resultado pós-combate.

```
┌─────────────────────────────────────────┐
│  🏆 VITÓRIA                            │
│                                         │
│  Inimigo: Kaeda derrotado              │
│  +10 XP                                │
│  Total: 230 XP / 100 XP (próximo LV)   │
│                                         │
│  ⚔️ Kim  LV 3                          │
│  F:4  H:3  R:2  A:2  PdF:3            │
│                                         │
│  [LUTAR DE NOVO]   [VOLTAR PRO LOBBY]  │
└─────────────────────────────────────────┘
```

---

## 6. INIMIGOS — Progressão

O LDI já tem 6 inimigos em `enemies.json`. A arena pode usar todos + expandir:

### Existentes (LDI)
| Inimigo | Dificuldade | Rank | Stats (F/H/R/A/PdF) |
|---|---|---|---|
| Kaeda | easy | 3214 | 3/3/3/2/2 |
| Thunderbolt | medium | 30156 | 4/4/3/2/3 |
| ... | | | |

### Sugestão de progressão
- **Tier 1 (easy):** Kaeda, lutador genérico — para fichas novas (LV 1-2)
- **Tier 2 (medium):** Thunderbolt, StormByte — para fichas estabelecidas (LV 3-5)
- **Tier 3 (hard):** Mestre Viran, Campeão — para fichas avançadas (LV 6-8)
- **Tier 4 (very_hard):** Kronos, Primordial — endgame (LV 9+)

Seleção no lobby: grid com cards de inimigo mostrando nome, rank, dificuldade (estrelas), elemental.

---

## 7. SUPABASE — Tabela `character_sheets`

A arena compartilha a tabela `character_sheets` com o LDI. Nenhuma migração necessária.

```sql
-- Schema já existente
character_sheets (
  id uuid PK,
  user_id uuid FK → auth.users,
  sheet_name text,
  attributes jsonb,        -- {"F":4,"H":3,"R":2,"A":2,"PdF":3}
  advantages jsonb[],      -- [{id:"reflexos_rapidos",...}]
  disadvantages jsonb[],   -- [{id:"corpo_fragil",...}]
  perks jsonb[],           -- [{id:"pericia_katana",...}]
  specializations jsonb[], -- [{id:"espec_combate",...}]
  weapon text,
  elemental text,
  xp_total int DEFAULT 0,
  created_at timestamptz
)
```

**Vantagem:** Fichas criadas na Arena aparecem no Lobby do LDI narrativo e vice-versa.

---

## 8. ROTEAMENTO

### App.jsx
```jsx
<Route path="/extras/ldi-arena" element={<ArenaRoute />} />
```

### ArenaRoute.jsx (roteador interno)
```jsx
const [fase, setFase] = useState('lobby')
// lobby → create → combat → victory → lobby

{fase === 'lobby'   && <ArenaLobby onNavigate={setFase} />}
{fase === 'create'  && <ArenaCreate onNavigate={setFase} />}
{fase === 'combat'  && <ArenaCombat onNavigate={setFase} />}
{fase === 'victory' && <ArenaVictory onNavigate={setFase} />}
```

Sem react-router interno. Estado local `fase` controla a navegação (mesmo padrão do Jack Dream Beer).

---

## 9. ESTILO VISUAL

Paleta própria: preto + teal `#00B4D8` + âmbar `#F5A623` + carmesim `#8B0000`.

Scanlines arcade (igual MiniGames/Extras). Título glitch "LDI ARENA".

---

## 10. ORDEM DE IMPLEMENTAÇÃO

| Etapa | O que fazer | Arquivos |
|---|---|---|
| 1 | Criar `useArenaStore.js` | Extrair de `useGameStore.js` |
| 2 | Criar `useArenaStorage.js` | Extrair de `useLDIStorage.js` |
| 3 | Criar `ArenaLobby.jsx` | Hub com cards de ficha |
| 4 | Criar `ArenaCreate.jsx` | UI de criação (importa `characterData.js`) |
| 5 | Criar `ArenaCombat.jsx` | UI de combate (importa `useCombatStore`, `combat.js`) |
| 6 | Criar `ArenaVictory.jsx` | Tela de resultado |
| 7 | Criar `ArenaRoute.jsx` | Container de navegação |
| 8 | Adicionar rota em `App.jsx` | `/extras/ldi-arena` |
| 9 | Adicionar card em `Extras.jsx` | "LDI Arena" no hub arcade |
| 10 | Adicionar ao `SITE_MAP.md` | Documentação |

---

## 11. MÉTRICAS DE SUCESSO

- [ ] Criar ficha com distribuição de pontos funcionando
- [ ] Salvar ficha no Supabase vinculada ao usuário
- [ ] Listar fichas no Lobby
- [ ] Selecionar inimigo e iniciar combate
- [ ] Combate completo: FA/FD, modos, poderes, vitória/derrota
- [ ] Ganhar XP ao vencer
- [ ] Level up: distribuir ponto de atributo
- [ ] Nenhum arquivo do LDI narrativo foi modificado
- [ ] Arena_VERSION independente no console
