# INVESTIGAÇÃO — Arquitetura para Refatoração do Kernel Panic

> **Data:** 2026-07-02
> **Fonte analisado:** `kernel-panic.html` (2681 linhas, HTML+CSS+JS vanilla autocontido)
> **Propósito:** Mapeamento completo da lógica de jogo e proposta de decomposição em componentes React para migração ao portal LDI.
> **Status:** Investigação apenas — nenhum código de produção, nenhum bump, nenhum commit.

---

## ETAPA 1 — MAPEAMENTO COMPLETO DA LÓGICA DE JOGO

### 1.1 Lista de TODAS as funções (71 funções)

Cada função classificada em **LÓGICA PURA DE JOGO** (cálculo de dano, rolagem de d20, mods de terreno, decisão da IA, resolução de tiro/defesa, regras de vitória) versus **RENDER/DOM** (manipulação direta de elemento, innerHTML, textContent, classList).

#### LÓGICA PURA DE JOGO (37 funções)

```
Linha   Função                                          Escopo
──────  ──────────────────────────────────────────────  ─────────────────────────────
1231    initGame()                                      Inicializa estado G, deal inicial, rolagem de iniciativa
1290    shuffle(arr)                                    Fisher-Yates shuffle (helper puro)
1294    roll20()                                        Math.random()*20+1 (helper puro)
1296    dealTo(p)                                       Compra do deck, reshuffle do cemitério se vazio
1478    drawCard(p)                                     Lógica de custo de perigo (free vs +1), chama dealTo
1502    enforceHandLimit(p)                             Descarta excesso (>5) para o cemitério
1511    playToField(p, handIdx)                         Move carta da mão para campo (limite 2/turno, slot vazio)
1525    activateEquip(p, slotIdx)                       Executa 5 tipos de equipamento (sabotagem, informante, emboscada, campo_minado, intel)
1588    endTurn(p)                                      Wrapper: chama advanceTurn()
1596    advanceTurn(skipRoundInc)                        Passa turno, incrementa round, tickPerigo, tickTerrain, AI gate
1617    tickPerigo()                                    Sobe perigo por round (taxa do terreno ou 1)
1624    tickTerrain()                                   Gerencia expiração e reposição de terreno a cada 3 rounds
1639    drawTerrain()                                   Sorteia carta de terreno, aplica effect(), reseta mods
1718    calcAtkPower(selection)                         Soma bônus de atk selecionados
1730    confirmShot()                                   Finaliza seleção de ataque, monta defenseQueue
1750    processNextDefense()                            Processa fila de defesa — próximo jogador
1844    calcDefPower(defSel, atkSel)                    Total de defesa (proteção cancela precisão, camuflagem cancela scan)
1861    confirmDefense()                                Fecha defesa, resolve shot se fila vazia
1870    processNextDefenseWithAI()                      Defense queue com gate de IA (se for AI, auto-escolhe)
1891    resolveShot(defSel)                             Coração do jogo: atk - def = net + perigoDef = target, d20, auto-decoy, perigoSpike 8
1954    applyTerrainToShot(p, opp, atkSel, defSel)      Stub — terreno já aplicado em calcAtkWithTerrain/calcDefWithTerrain
2020    closeResult()                                   Fecha resultado, gatilha reação (miss) ou victory (lethal) ou advanceTurn
2084    startReactionPhase(attacker, trigger)           Inicia reação (segundo tiro / contra-ataque)
2093    processNextReactionWithAI()                     Reaction queue com gate de IA
2118    processNextReaction()                            Reaction queue humana
2176    declineReaction()                                Ignora reação
2182    activateReaction()                              Ativa reação (segundo tiro abre shot modal novamente)
2231    showOnlineMsg()                                 Dispara showMsg com texto hardcoded
2238    showHardMsg()                                   Dispara showMsg com texto hardcoded
2246    startMultiplayerLocal()                         Define G_MODE='local', initGame
2252    startSolo(difficulty)                           Define G_MODE='solo-{difficulty}', initGame
2271    confirmHandoff()                                Libera handoff, executa callback, fecha modais
2335    isAITurn()                                      Verifica G_MODE + currentPlayer === AI_IDX
2340    runAITurn()                                     Entry point da IA: delay, depois runAIEasy/Medium
2362    aiDelay(ms)                                     Promise(setTimeout) para delays de legibilidade
2365    runAIEasy()                                      IA fácil: draw 1, place 2 random, 50% equip, shoot/pass
2416    runAIMedium()                                   IA média: draw até 5 (se perigo<6), place 2 rankeados, equip inteligente, shoot se chance>35%
2509    aiExecuteShot()                                 Seleciona todos atk cards, configura shotContext, defenseQueue=[0]
2532    aiChooseDefense(atkSel)                         Easy: random def; Medium: match def ao tipo de atk
2568    aiReaction(playerIdx, trigger)                  Easy: recusa; Medium: segundo tiro se perigo opp >= 5
2591    getTerrainMods(playerIdx)                       Retorna modificadores de terreno para um jogador (inclui contra_sol)
2620    calcAtkWithTerrain(atkSel, attackerIdx)         Aplica terreno ao ataque (anula_visao, precisão+visão + mods)
2640    calcDefWithTerrain(defSel, atkSel, defenderIdx) Aplica terreno à defesa (anula_protecao, proteção+camuflagem + mods)
2661    terrainInfoLine(playerIdx)                      String formatada com modificadores ativos
```

#### RENDER/DOM (30 funções)

```
Linha   Função
──────  ──────────────────────────────
1306    addLog(msg, cls)
1318    render()                          (orquestrador: chama 4 renders)
1325    renderPerigo()                    (pip grid + texto de perigo)
1342    renderInfoBar()                   (round, turn, deck, cemetery, terrain timer)
1350    renderTerrain()                   (name, desc, icon, count)
1368    terrainContraSolNote()            (helper de string para renderTerrain)
1373    renderPlayers()                   (painel completo: field grid, hand cards, action buttons)
1468    kindLabel(c)                      (helper: tipo → string PT)
1657    openShotModal(p)                  (popula e exibe modal de ataque)
1682    makeShocardBtn(card, slot, role)  (cria botão de carta de ataque)
1699    updateShotSummary()               (atualiza sumário do modal de ataque)
1725    closeShotModal()                  (fecha modal)
1756    openDefenseModal(p)               (popula e exibe modal de defesa)
1799    makeDefCardBtn(card, slot, role)  (cria botão de carta de defesa)
1815    updateDefSummary()                (atualiza sumário do modal de defesa)
1961    showResult(lethal, rolled, ...)   (exibe overlay de resultado)
2050    showVictory(winner)               (exibe overlay de vitória/derrota)
2127    openReactionPopup(playerIdx, trig)(exibe popup de reação)
2209    showMainMenu()                    (troca visibilidade do menu)
2215    showDiffMenu()                    (troca visibilidade do submenu)
2220    showMsg(title, text, onClose)     (popup de mensagem genérica)
2263    showHandoff(playerIdx, callback)  (exibe tela de handoff)
2284    showIntelResult(playerIdx, cards) (exibe modal de inteligência)
2297    closeIntel()                      (fecha intel)
2305    inspectCard(card, slotIdx)        (exibe detalhes da carta)
2321    closeInspect()                    (fecha inspect)
2348    showAIWait(msg)                   (exibe tela de IA pensando)
2353    updateAIWait(msg)                 (atualiza texto)
2357    hideAIWait()                      (esconde tela de IA)
```

### 1.2 Estrutura completa do objeto de estado `G`

```js
G = {
  // ── Baralhos ──
  deck: [],                       // Cartas embaralhadas (ATTR_CARDS + EFFECT_CARDS + EQUIP_CARDS)
  terrainDeck: [],                // Cartas de terreno embaralhadas (TERRAIN_CARDS)
  terrainDeckIdx: 0,              // Índice atual no terrainDeck
  cemetery: [],                   // Cartas descartadas

  // ── Turno / Rodada ──
  round: 1,                       // Rodada atual (incrementa a cada 2 turnos)
  currentPlayer: 0,               // 0 = Operador 1, 1 = Operador 2
  drawnThisTurn: false,           // Jogador atual já comprou?
  cardsPlayedThisTurn: 0,         // Cartas colocadas em campo neste turno (max 2)
  shotFiredThisTurn: false,       // Já houve disparo neste turno?

  // ── Ambiente (Terrain) ──
  terrain: null,                  // Objeto da carta de terreno atual (ou null)
  terrain_mods: {},               // Modificadores ativos: { precisao, visao, protecao, camuflagem, anula_visao, anula_protecao, contra_sol, perigo_after_shot, perigo_rate }
  terrain_rounds_left: 0,         // Rounds restantes do terreno atual
  terrain_contra_sol: -1,         // Jogador desfavorecido pelo Contra-Sol (-1 = nenhum)

  // ── Jogadores ──
  players: [
    {
      hand: [],                   // Mão (max 5 cartas)
      field: Array(6).fill(null), // Campo (6 slots, cada um contém carta ou null)
      perigo: 0,                  // Medidor de Exposição (Perigo) — escala 0-20
      disabledSlots: {},          // Slots desabilitados: { slotIdx: round_expira }
    },
    { ... },                      // Jogador 2 (mesma estrutura)
  ],

  // ── Contexto de disparo ──
  shotContext: null,              // Preenchido durante ataque:
                                  //   { attacker: 0|1,
                                  //     atkSelection: [{key,card,slotIdx,role}, ...],
                                  //     atkPower: number,
                                  //     _secondShot: bool,
                                  //     _wasSecondShot: bool,
                                  //     _missReaction: bool,
                                  //     _result: {lethal, savedByAlvo, hasSegTiro, attacker} }
}
```

**Estado auxiliar (module-level):**

```js
G_MODE = 'local'                  // 'local' | 'solo-easy' | 'solo-medium'
shotSelected = []                 // Seleção temporária de ataque no modal
defSelected = []                  // Seleção temporária de defesa no modal
defenseQueue = []                 // Fila de defensores [playerIdx, ...]
defenseSelections = {}            // Mapa de seleções dos não-defensores (não usado atualmente)
reactionQueue = []                // Fila de reações [{playerIdx, trigger}, ...]
reactionSelected = null           // Reação selecionada: {card, slotIdx, playerIdx}
_handoffCallback = null           // Callback da tela de handoff
```

### 1.3 Strings hardcoded em PT — estimativa de escopo i18n

**Card definitions** (todas PT): 4 attr labels, 6 effect card names+descs, 10 equip card names+descs, 10 terrain card names+descs, 10 terrain descs = **~40 strings**

**Menu**: "Modo Solitário", "Execute um agente autônomo", "Rede Local", "Dois operadores, mesmo terminal", "Rede Global", "Em breve", "Quit", "Desconectando operador...", "Selecione o Protocolo", "Escolha com cuidado, operador", "Fácil", "Médio", "Difícil", "Agente instável. Cuidado.", "Agente adaptativo online.", "Protocolo restrito.", "Voltar" = **~17 strings**

**In-game labels**: "Perigo — Operador 1/2", "Ciclo", "Operador", "Stack", "Lixo", "Ambiente expira em", "Inicializando ambiente...", "Nenhuma condição de ambiente ativa.", "Slots (0/6)", "Buffer (0/5)", "Comprar", "Buffer cheio", "Download (grátis)", "Download (+1 Exposição)", "Executar", "Skip", "Grid do oponente", "Buffer vazio.", etc. = **~20 strings**

**Log messages** (template strings): "Iniciativa: J1/J2 rolou X, Y começa.", "Stack esgotado — cemitério embaralhado.", "Jogador X comprou carta extra", "Buffer cheio — carta descartada.", "Disparo! Atk: X - Def: Y = Z...", etc. = **~15 strings templates**

**Modal texts**: "Preparar Execução", "Selecione os módulos de ataque", "Módulos de ataque/efeito/defesa", "Nenhuma carta selecionada.", "Cancelar", "EXECUTAR", "Intrusão Detectada!", "Serviço de Inteligência", "Cartas reveladas", "Fechar", "Transfira o terminal para", "Aguarde o operador confirmar acesso", "Acesso confirmado", "Fase de Contramedida", "Selecione uma carta para ativar, ou decline.", "Ignorar", "ATIVAR", "Ataque recebido", "Nenhuma", etc. = **~25 strings**

**Result/Victory**: "EXECUÇÃO FALHA", "ACERTO LETAL", "DECOY ATIVO!", "Continuar", "Terminal Principal", 5 WIN_NARRATIVES (multi-sentence), 5 LOSS_NARRATIVES (multi-sentence), "Alvo eliminado.", "Jogador X eliminou o alvo.", "SYSTEM FAILURE" = **~18 strings**

**Modal genérico**: "Fascinante. Mas a rede global... indisponível.", "Protocolo letal detectado...", "MULTIPLAYER ONLINE", "DIFÍCIL", "Entendido" = **~5 strings**

**TOTAL ESTIMADO: ~140 strings** (~40 card data + ~100 UI/log/modal/narrative)

### 1.4 Modos de jogo — fluxo de diferenciação

| Modo | G_MODE | G.currentPlayer | IA ativa? | Fluxo |
|------|--------|----------------|-----------|-------|
| **Solo Fácil** | `solo-easy` | Humano = 0, IA = 1 | Sim (AI_IDX=1) | `initGame()` → se turno IA: `runAITurn()` → `runAIEasy()`; se turno humano: `showHandoff()` → ações humanas → `endTurn()` → `advanceTurn()` → IA. IA joga aleatório. |
| **Solo Médio** | `solo-medium` | Humano = 0, IA = 1 | Sim (AI_IDX=1) | Mesmo fluxo, mas IA usa `runAIMedium()` com scoring. |
| **Local (2 jogadores)** | `local` | Alterna 0↔1 | Não | `showHandoff(0)` → J1 joga → `endTurn(0)` → `advanceTurn()` → `showHandoff(1)` → J2 joga... |

**Diferenciação via if/else em:**
- `isAITurn()`: `solo-easy || solo-medium && currentPlayer === AI_IDX`
- `processNextDefenseWithAI()`: se AI, chama `aiChooseDefense()`; senão, `processNextDefense()` (humano)
- `processNextReactionWithAI()`: se AI, chama `aiReaction()`; senão, `processNextReaction()` (humano)
- `runAITurn()`: switch `solo-easy` → `runAIEasy()`, `solo-medium` → `runAIMedium()`
- `showVictory()`: se solo, narratives literárias; se local, "Jogador X eliminou o alvo."

### 1.5 Dependências externas

- **Google Fonts (3):** `Share Tech Mono` (monospace), `Bebas Neue` (display), `Barlow` (body) — carregadas via `@import` no CSS
- **Nenhum fetch, nenhum localStorage, nenhuma chamada de rede, nenhuma API externa**
- **Nenhuma dependência de framework** — JS vanilla puro, DOM API (`document.getElementById`, `classList`, `textContent`, `innerHTML`, `createElement`, `appendChild`)
- **CSS:** ~880 linhas de CSS vanilla inline no `<style>`, sem pré-processador
- **HTML:** Todo o markup está inline no arquivo (menus, modais, overlays, grids de campo)

---

## ETAPA 2 — PROPOSTA DE DECOMPOSIÇÃO EM COMPONENTES

### 2.1 Referência arquitetural usada

**Pesadelo Particular (PP)** foi escolhido como referência porque é o BETA mais recente, tem estrutura de diretórios completa e padrão arquitetural maduro:

```
src/pages/games/PesadeloParticular/
├── PP.jsx                      ← Entry point (componente principal)
├── PP.css                      ← CSS modular (zero inline)
├── components/                 ← Componentes reutilizáveis
├── screens/                    ← Telas completas do jogo
├── data/                       ← Dados estáticos (casos, inimigos, pistas, etc.)
└── store/                      ← Zustand store (usePPStore.js)
```

JackCandy segue o mesmo padrão. A proposta abaixo replica essa estrutura para Kernel Panic.

### 2.2 Lista de componentes React propostos

```
src/pages/games/KernelPanic/
├── KernelPanic.jsx             ← Entry point (página completa do jogo)
├── KernelPanic.css             ← CSS modular completo (extraído do <style> inline)
├── components/
│   ├── KPMenu.jsx              ← Menu principal e submenu de dificuldade
│   ├── KPTerrainBar.jsx        ← Faixa de terreno (ícone + nome + desc + timer)
│   ├── KPInfoBar.jsx           ← Barra de info (Ciclo, Operador, Stack, Lixo, Ambiente)
│   ├── KPPerigoMeter.jsx       ← Medidor de exposição (pip grid + valor numérico)
│   ├── KPPlayerPanel.jsx       ← Painel de um jogador (header + field grid + hand + actions)
│   ├── KPFieldSlot.jsx         ← Slot individual do campo (card face / card back / disabled)
│   ├── KPHandCard.jsx          ← Carta individual na mão
│   ├── KPShotModal.jsx         ← Modal de seleção de ataque
│   ├── KPDefenseModal.jsx      ← Modal de seleção de defesa
│   ├── KPReactionPopup.jsx     ← Popup de reação (segundo tiro / contra-ataque)
│   ├── KPResultOverlay.jsx     ← Overlay de resultado do disparo
│   ├── KPVictoryScreen.jsx     ← Tela de vitória/derrota
│   ├── KPMessagePopup.jsx      ← Popup de mensagem genérica
│   ├── KPHandoffScreen.jsx     ← Tela de handoff (passagem de terminal)
│   ├── KPIntelModal.jsx        ← Modal de inteligência (cartas reveladas)
│   ├── KPInspectModal.jsx      ← Inspeção detalhada de carta
│   └── KPAIWaitOverlay.jsx     ← Tela de "IA processando"
├── data/
│   ├── cards.js                ← ATTR_CARDS, EFFECT_CARDS, EQUIP_CARDS (arrays de objetos)
│   └── terrain.js              ← TERRAIN_CARDS (arrays de objetos + funções effect)
├── hooks/
│   └── useKernelPanicEngine.js ← Hook customizado com todo estado + lógica pura de jogo
├── screens/                    (opcional — se houver telas completas modais)
└── store/                      (opcional — se estado global compartilhado entre modos)
    └── useKPCache.js           ← Cache localStorage (apenas se necessário futuramente)
```

### 2.3 Onde a lógica pura mora: `useKernelPanicEngine.js`

Seguindo o padrão `useFichaGate.js` e a separação estado/ui que vemos nos jogos BETA, a lógica pura de jogo (37 funções classificadas como LÓGICA PURA) vai para um **hook customizado único**:

```
useKernelPanicEngine.js
├── Estado (useReducer ou múltiplos useState)
│   ├── G.state (mesma estrutura do G original)
│   ├── G_MODE
│   └── UI state temporário (modal aberto/fechado, seleções)
│
├── Actions / dispatches
│   ├── initGame(mode)           ← 'local' | 'solo-easy' | 'solo-medium'
│   ├── drawCard(playerIdx)
│   ├── playToField(playerIdx, handIdx)
│   ├── activateEquip(playerIdx, slotIdx)
│   ├── endTurn(playerIdx)
│   ├── confirmShot(selectedCards)
│   ├── confirmDefense(selectedCards)
│   ├── activateReaction(card, slotIdx, playerIdx)
│   ├── declineReaction()
│   └── closeResult()
│
├── AI functions (puras, chamadas via useEffect)
│   ├── runAITurn()
│   ├── runAIEasy()
│   ├── runAIMedium()
│   ├── aiExecuteShot()
│   ├── aiChooseDefense(atkSel)
│   └── aiReaction(playerIdx, trigger)
│
├── Cálculos (funções puras exportadas para testes)
│   ├── calcAtkPower(selection)
│   ├── calcDefPower(defSel, atkSel)
│   ├── calcAtkWithTerrain(atkSel, attackerIdx)
│   ├── calcDefWithTerrain(defSel, atkSel, defenderIdx)
│   ├── getTerrainMods(playerIdx)
│   ├── roll20()
│   └── shuffle(arr)
│
├── Side effects (useEffect)
│   ├── AI turn auto-play
│   └── Handoff confirm callback cleanup
│
└── Retorno para componentes
    ├── state (objeto imutável)
    ├── mode (G_MODE)
    ├── actions (funções dispatcher)
    └── computed (derived state: who is AI, is human turn, etc.)
```

**Componentes "burros":** `KPPlayerPanel`, `KPFieldSlot`, `KPHandCard`, `KPShotModal`, `KPDefenseModal`, etc. — recebem `state` + `actions` como props, renderizam baseado no estado, disparam actions em eventos de clique. Zero lógica de negócio neles.

### 2.4 Mapeamento G → state/reducer React

O objeto `G` original mapeia diretamente para um `useReducer` state:

```js
const initialState = {
  // Baralhos
  deck: [],
  terrainDeck: [],
  terrainDeckIdx: 0,
  cemetery: [],

  // Turno
  round: 1,
  currentPlayer: 0,
  drawnThisTurn: false,
  cardsPlayedThisTurn: 0,
  shotFiredThisTurn: false,

  // Terrain
  terrain: null,
  terrain_mods: {},
  terrain_rounds_left: 0,
  terrain_contra_sol: -1,

  // Players
  players: [
    { hand: [], field: [null,null,null,null,null,null], perigo: 0, disabledSlots: {} },
    { hand: [], field: [null,null,null,null,null,null], perigo: 0, disabledSlots: {} },
  ],

  // Shot context
  shotContext: null,

  // Mode
  mode: 'local',
}
```

**Estado UI temporário** (não precisa estar no reducer — pode ser `useState` local no hook):
- `shotSelected: []`
- `defSelected: []`
- `defenseQueue: []`
- `reactionQueue: []`
- `reactionSelected: null`
- `_handoffCallback: null`
- `aiWaiting: false`
- `overlayVisivel: null` (qual overlay está aberto)

**Reducers sugeridos:**
- `INIT_GAME` — carrega estado inicial completo
- `DRAW_CARD` — compra carta + gerencia custo de perigo
- `PLAY_TO_FIELD` — move mão → campo
- `ACTIVATE_EQUIP` — executa equipamento (5 sub-tipos)
- `END_TURN` — passa turno
- `ADVANCE_ROUND` — incrementa round, tick perigo/terreno
- `DRAW_TERRAIN` — sorteia novo terreno
- `CONFIRM_SHOT` — finaliza seleção de ataque
- `CONFIRM_DEFENSE` — finaliza seleção de defesa
- `RESOLVE_SHOT` — cálculo de dano, rolagem d20, resultado
- `ACTIVATE_REACTION` — ativa efeito de reação
- `SHOW_VICTORY` — estado terminal
- `RESET` — volta ao menu

### 2.5 Gate de guest/conta

Seguir o padrão existente em `Games.jsx`:

```js
import { useFichaGate } from '../../hooks/useFichaGate'
import ModalSemFichas from '../../components/ModalSemFichas/ModalSemFichas'
```

**Adicionar** `kerne-panic` (ou kp?) ao array `FICHA_GAMES` em `Games.jsx` (linha ~38):
```js
const FICHA_GAMES = ['toptrumps', 'arena', 'ldi', 'tamagoshi', 'jackcandy', 'pesadelo', 'minigames', 'tatics', 'duelo', 'kernelpanic']
```

O entry point `KernelPanic.jsx` pode usar `useAuth` diretamente se precisar bloquear acesso não-autenticado, mas o padrão do portal é o gate via Ficha já no menu Games.

### 2.6 Sistema de IA

A IA (fácil/médio) **continua como funções puras assíncronas** chamadas via `useEffect` dentro do `useKernelPanicEngine`. Não vira componente.

```js
// Dentro de useKernelPanicEngine.js
useEffect(() => {
  if (isAITurn() && state.mode !== 'local') {
    const timer = setTimeout(() => {
      if (state.mode === 'solo-easy') runAIEasy(dispatch, state);
      else runAIMedium(dispatch, state);
    }, 300);
    return () => clearTimeout(timer);
  }
}, [state.currentPlayer, state.round, state.mode]);
```

As funções `runAIEasy`, `runAIMedium`, `aiExecuteShot`, `aiChooseDefense`, `aiReaction` recebem `dispatch` e `state` como parâmetros, chamando `dispatch({ type: '...', payload: ... })` para cada ação. Permanecem testáveis isoladamente.

### 2.7 Integração com toggle Games LDI / Kernel Panic (já implementado)

O toggle já existe em `Games.jsx`:

```js
const [aba, setAba] = useState('ldi')
const ABAS = ['ldi', 'kernel']
```

Quando `aba === 'kernel'`, o componente atual renderiza a seção `.kp-secao` com placeholder vazio. A integração final substitui esse placeholder por:

```jsx
{aba === 'kernel' && <KernelPanic />}
```

O lazy load (recomendado) ficaria:

```jsx
import { lazy, Suspense } from 'react'
const KernelPanic = lazy(() => import('./KernelPanic/KernelPanic'))

// ... no JSX:
{aba === 'kernel' && (
  <Suspense fallback={<div className="kp-loading">CARREGANDO SISTEMA...</div>}>
    <KernelPanic />
  </Suspense>
)}
```

**Rota:** O jogo roda inline na página `/games` (dentro do toggle), sem rota separada. Isto elimina necessidade de `react-router` config adicional. Se no futuro quiser rota própria, seria `/games/kernelpanic`.

---

## ETAPA 3 — RISCOS E ESCOPO

### 3.1 Comportamentos que NÃO devem mudar (paridade 1:1)

| Função Crítica | O que deve ser idêntico |
|---|---|
| `resolveShot()` (L1891) | `let net = atk - def; let target = max(net, 0) + perigoDefender; rolled <= target && rolled !== 20` |
| `perigoSpike` | 8 normal, 4 para segundo tiro |
| `calcDefPower()` (L1844) | Proteção só conta se atacante usou Precisão; Camuflagem só se atacante usou Scan |
| `calcAtkWithTerrain()` (L2620) | `finalPrecisao = precisaoCards + mods.precisao; finalVisao = mods.anula_visao ? 0 : visaoCards + mods.visao; total = finalPrecisao + finalVisao` |
| `calcDefWithTerrain()` (L2640) | `finalProtecao = mods.anula_protecao ? 0 : protecaoCards + (hasPrecisao ? mods.protecao : 0); finalCamuflagem = camuflageCards + (hasVisao ? mods.camuflagem : 0)` |
| `getTerrainMods()` (L2591) | Contra-Sol: desfavorecido perde 1 visão + 1 camuflagem; favorecido ganha 1 de cada |
| `activateEquip()` (L1525) | 5 sub-tipos: sabotagem, informante, emboscada, campo_minado, intel — cada um com efeito exato |
| `dealTo()` (L1296) | Se deck vazio, reshuffle do cemitério |
| `tickPerigo()` (L1617) | `perigo_rate` do terreno ou 1; só a partir do round 4 |
| `drawTerrain()` (L1639) | Terreno dura 3 rounds; effect() é executado na compra |
| `showResult()` (L1961) | Lethal auto-avança para victory após 2.2s; miss abre reação |
| AI Easy | Draw 1, place 2 random, 50% equip, shoot/pass |
| AI Medium | Draw até 5 (perigo<6), place ranked (atk>def>efx), equip inteligente, shoot se chance>35% |

### 3.2 Maior risco de regressão

**Cálculo de defesa com matching de atributos** (`calcDefPower` L1844 + `calcDefWithTerrain` L2640):

A defesa só funciona se houver correspondência com o ataque (proteção cancela precisão, camuflagem cancela scan). Se o atacante não usou precisão, a blindagem do defensor é ignorada. Este é o ponto mais sutil e fácil de quebrar durante a migração.

**Recomendação:** Extrair `calcAtkWithTerrain` e `calcDefWithTerrain` como funções puras na primeira task e escrever um conjunto de testes de paridade com inputs conhecidos do código original.

### 3.3 i18n — primeira fase ou subsequente?

**Recomendação: Segunda fase (task subsequente).**

Motivos:
- ~140 strings para extrair, sendo ~40 delas dados de carta (nomes/descs de atributos, efeitos, equipamentos, terrenos) que precisam de revisão de tradução
- As 5 WIN_NARRATIVES e 5 LOSS_NARRATIVES são textões literários (múltiplas sentenças) que exigem tradução criativa
- O escopo de UI (log messages, modais, labels) é grande (~100 strings) e tocaria quase todo componente
- Misturar i18n com a migração de estado/lógica aumenta exponencialmente o risco de regressão

### 3.4 Sistema de conquistas — primeira fase ou pendente?

**Recomendação: Pendente (não entra nesta migração).**

Motivos:
- O jogo atual não tem sistema de conquistas
- Seria funcionalidade nova, não migração
- Conquistas no portal usam `AchievementsContext` com integração Supabase — escopo separado
- Pode ser adicionado como task futura sem quebrar a migração

### 3.5 Estimativa de tasks de implementação

**Task 1 — Engine/Hook isolado com paridade comprovada**
- Criar `src/pages/games/KernelPanic/hooks/useKernelPanicEngine.js`
- Extrair todas as 37 funções de LÓGICA PURA para o hook
- Usar `useReducer` com actions mapeadas para cada transição de estado
- Manter AI como funções assíncronas chamadas via `useEffect`
- Extrair dados de cartas para `data/cards.js` e `data/terrain.js`
- **Verificação:** Testes unitários comparando output do hook vs funções originais para 5 cenários de ataque+defesa conhecidos
- **Esforço estimado:** ~500-700 linhas de hook + ~200 linhas de dados

**Task 2 — Componentes de UI (render)**
- Criar todos os componentes listados na Etapa 2 (15-18 componentes)
- Extrair CSS inline do `<style>` para `KernelPanic.css`
- Componentes burros recebem state por props, disparam actions por callback
- Manter paridade visual pixel-perfect com o original
- **Esforço estimado:** ~800-1200 linhas de componentes + ~500-700 linhas de CSS

**Task 3 — Integração de rota + i18n**
- Conectar o toggle existente em `Games.jsx` com lazy load do `KernelPanic` no lugar do placeholder
- Extrair todas ~140 strings para i18n (PT/EN/ES)
- Adquirir/criar traduções EN e ES (especialmente as 10 narrativas)
- Adicionar `kernelpanic` ao `FICHA_GAMES` e testar gate
- Verificar versão (SITE_VERSION bump)
- **Esforço estimado:** ~300-400 linhas de i18n + ajustes de integração

**Resumo:**

| Task | Escopo | Depends on |
|------|--------|------------|
| Task 1 | Engine hook + dados | Nada |
| Task 2 | Componentes de UI | Task 1 |
| Task 3 | Rota + i18n + gate | Task 1 + Task 2 |

**Ordem sugerida:** Task 1 → Task 2 → Task 3

---

## Notas finais

- O arquivo `kernel-panic.html` é um jogo completo e funcional de 2681 linhas. A migração para React não altera a jogabilidade, apenas a forma.
- O maior desafio técnico não é o tamanho (~2700 linhas), mas a interdependência entre estado e render: no código original, `render()` é chamada após cada mutation; no React, o estado imutável + re-render automático substitui isso.
- Compatibilidade com a identidade visual "kernel panic" já está garantida pelo `kernel-panic.css` criado no toggle (grid Tron, fonte Share Tech Mono, roxo neon). O CSS inline do HTML original (~880 linhas) deve ser migrado para este arquivo existente.
- Nenhum bump de versão, nenhum commit, nenhum build — esta task é exclusivamente de investigação e arquitetura.
