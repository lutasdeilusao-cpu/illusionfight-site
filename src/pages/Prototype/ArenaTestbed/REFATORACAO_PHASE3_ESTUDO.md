# Estudo Comparativo — Refatoração Phase3Combat (Rodada 1)

## 1. O que a refatoração tentou fazer

7 extrações propostas para reduzir Phase3Combat.jsx de ~1545 linhas para ~776 linhas:

| # | Extração | Tipo | Linhas extraídas |
|---|----------|------|------------------|
| 1 | `engine/drawBoard.js` | Função pura de desenho canvas | ~169 |
| 2 | `engine/turnOrder.js` | Lógica de ordenação por AGI + Jokenpo | ~109 |
| 3 | `components/OrderingModal.jsx` | Modal de reordenação de turno | ~49 |
| 4 | `components/CharInfoModal.jsx` | Modal de status do personagem | ~42 |
| 5 | `components/BattleLogDrawer.jsx` | Drawer de log de batalha | ~25 |
| 6 | `components/ActionControls.jsx` | Painel de ações + bottom nav | ~92 |
| 7 | `components/CombatHUD.jsx` | HUD de fichas dos personagens | ~35 |

## 2. Diff funcional completo — comparação pré vs pós-refatoração

### Extração 1 — drawBoard.js (função pura, sem React)

**Antes:** Função `draw()` inline no componente, acessava `canvasRef`, `sizeRef`, `padRef`, `hexCenter`, `drawHex`, `pixelToHex` via closure (tudo disponível no escopo do componente).

**Depois:** Função `drawBoard()` pura, recebe todos os parâmetros explicitamente. `doDraw` useCallback no componente principal chama `drawBoard({...})` passando todos os estados.

**Problemas encontrados:** Nenhum. A função é pura e a chamada é equivalente. A renderização do canvas depende de `doDraw` no `useCallback` com as dependências corretas, que foram mantidas.

### Extração 2 — turnOrder.js (funções puras, sem React)

**Antes:** Funções `confirmarOrdemInterna`, `iniciarProximoJokenpoCruzado`, `handleJokenpoResultCruzado`, `aplicarOrdemCruzada` + lógica de agrupamento AGI no `useEffect`. Tudo lia/escrevia em `sortedGlobalRef`, `crossTieQueueRef`, `crossTieResultsRef` — refs mutáveis no escopo do componente.

**Depois:** Funções puras recebem estado como parâmetros e retornam resultados explicitamente. O componente principal gerencia wrappers (`confirmarOrdemInternaWrapper`, `iniciarProximoJokenpoCruzadoWrapper`) que chamam as funções puras e atualizam os refs/estados.

**Problemas encontrados:** Nenhum relatado. O teste manual não chegou a testar cenário de empate de AGI (o que exigiria Jokenpo e ordenação). Há risco potencial não verificado neste caminho.

### Extração 3 — OrderingModal.jsx (JSX only)

**Antes:** JSX inline no componente principal, condicionado por `orderingPhase === 'player_internal'`. Usava `playerTeamOrder`, `setPlayerTeamOrder`, `confirmarOrdemInterna`.

**Depois:** Componente separado recebendo { playerTeamOrder, setPlayerTeamOrder, onConfirm } como props.

**Problemas encontrados:** Nenhum relatado (fluxo de ordenação AGI não foi testado).

### Extração 4 — CharInfoModal.jsx (JSX only)

**Antes:** JSX inline com `charModal &&` — exibia dados do personagem ao clicar no HUD.

**Depois:** Componente separado recebendo { char, onClose }.

**Problemas encontrados:** Nenhum. Modal de informação não afeta lógica de jogo.

### Extração 5 — BattleLogDrawer.jsx (JSX + scroll effect)

**Antes:** JSX inline com `logDrawerOpen &&` + `useEffect` para scroll automático.

**Depois:** Componente separado com `useEffect` interno, recebendo { open, battleLog, onClose }.

**Problemas encontrados:** Nenhum. Drawer de log não afeta lógica de jogo.

### Extração 6 — ActionControls.jsx ⚠️ **BUG CONFIRMADO**

**Antes:** JSX inline dentro do componente principal, condicionado por:
```jsx
{actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && (
```
Os botões chamavam funções diretamente no escopo do componente:

```jsx
onClick={() => { setActionPanel(false); iniciarMovimento() }}
```

**Depois (primeira tentativa, 38dcea03):** Componente separado com condição:
```jsx
{isPlayerTurn && subPhase === 'free' && currentChar && (  // ❌ actionPanel removido!
```
E os callbacks perdiam `setActionPanel(false)`:
```jsx
onClick={() => { onAction('move') }}  // ❌ setActionPanel(false) removido!
```

**Problema 1:** `actionPanel` nunca foi passado como prop. O painel aparecia em TODO turno do jogador, sem necessidade de clicar no token.

**Problema 2:** `onAction('move')` não chamava `setActionPanel(false)`, deixando o estado `actionPanel = true` mesmo após sair de `subPhase === 'free'`.

**"Correção" (d85d5d1c):** Adicionou `actionPanel` como prop e restaurou `setActionPanel(false)` no `onAction`. Porém, a condição no ActionControls foi alterada para:
```jsx
{actionPanel && isPlayerTurn && subPhase === 'free' && currentChar && (
```
Isso corrigiu o Bug 1 (painel não abre sozinho) mas criou o **Bug 3**: `actionPanel` agora depende do clique no token para ser `true`. Quando o ciclo de jogo (`startPlayerTurn`, `aposMovimento`, `finalizarAposAtaque`) chama `setSubPhase('free')`, o `actionPanel` permanece `false`. O painel nunca mais reaparece após o primeiro clique fora, porque nada no fluxo normal do turno seta `actionPanel = true`.

### Extração 7 — CombatHUD.jsx (JSX only)

**Antes:** JSX inline, itera `characters.filter(c => c.vivo)`, chama `setCharModal(ch)` ao clicar.

**Depois:** Componente separado recebendo { characters, currentChar, onCharClick }.

**Problemas encontrados:** Nenhum. HUD apenas exibe e delega clique para o pai.

## 3. Lista exaustiva do que quebrou

| Bug | Causa | Status |
|-----|-------|--------|
| **Bug 1:** Painel abre sozinho | `actionPanel` não passado como prop para ActionControls | ✅ Corrigido em d85d5d1c |
| **Bug 2:** Clique em célula de movimento não funciona | `setActionPanel(false)` não chamado antes de `iniciarMovimento()`, causando `actionPanel = true` residual que bloqueava cliques no canvas | ✅ Corrigido em d85d5d1c |
| **Bug 3:** Painel nunca mais aparece após correção | A correção do Bug 1 fez o painel depender exclusivamente de `actionPanel`, mas nenhum fluxo normal do jogo seta `actionPanel = true` — ele só fica true via clique no token. Após o primeiro clique no token, `actionPanel` fica true, mas ao clicar em qualquer lugar (fechando o painel), volta a false e nunca mais volta. | 🔴 **AINDA PRESENTE** |
| **Fluxo não testado:** IA executa movimentos/ataques | A IA não foi tocada na refatoração, mas depende de `sortedGlobalRef`, `orderRef`, `turnRef`, `charsRef` que são usados em `finalizarTurno` e `finalizarTurnoIA` — funções que NÃO foram extraídas. Risco baixo. | ⚠️ Não verificado |
| **Fluxo não testado:** Jokenpo de ordenação AGI | A extração de `turnOrder.js` mudou o padrão de refs mutáveis para funções puras com retorno explícito. O fluxo de Jokenpo cruzado (2+ personagens com mesma AGI, misturando jogador e IA) não foi testado. | ⚠️ Não verificado |
| **Fluxo não testado:** Animação de ataque + morte | As funções de animação (`animarAtaqueMelee`, `animarAtaqueProjetil`, `aposAnimacaoAtaque`, etc.) não foram extraídas. Mas `drawBoard()` que renderiza o canvas foi extraída — se algo mudou na forma como `projectilePos`, `damageFlash`, etc. são passados para `drawBoard`, pode haver regressão visual. | ⚠️ Não verificado |
| **Fluxo não testado:** Vitória/derrota | `verificarVitoria` e `winnerRef` não foram extraídos. Risco baixo. | ✅ Baixo |

## 4. Diagnóstico arquitetural

### Causa raiz das quebras

1. **Falsa sensação de segurança do "build passou":** `npm run build` compila TypeScript/JSX e imports. Ele NÃO detecta:
   - Props faltando entre componentes (se o tipo não é `PropTypes` ou TypeScript)
   - Condições de renderização que mudaram
   - Estado que não é mais atualizado porque um callback foi removido

2. **Perda de escopo compartilhado:** O código original tinha ~40 `useState` + refs + funções tudo no mesmo componente. Qualquer função podia ler qualquer estado. Ao extrair para componentes filhos, as props precisam ser passadas **explicitamente** — e qualquer prop esquecida muda o comportamento sem warning.

3. **Correção às cegas:** A correção do Bug 1 (adicionar `actionPanel` prop) foi feita sem entender o fluxo completo. `actionPanel` só fica `true` via clique no token — não há outro caminho. Então ao "corrigir" adicionando `actionPanel &&`, o painel só aparece quando o usuário clica no token, mas **nunca mais reaparece** após fechar porque nada no código seta `actionPanel = true` automaticamente.

### Por que ActionControls.jsx é particularmente frágil

Diferente dos outros 4 componentes extraídos (OrderingModal, CharInfoModal, BattleLogDrawer, CombatHUD), o ActionControls:
- **Lê** estado (`actionPanel`, `subPhase`, `turnoAcoes`, etc.)
- **Escreve** estado indiretamente via callbacks (precisa de `setActionPanel(false)`)
- **Tem callbacks condicionais** (ex: `onAction('move')` vs `onAction('attack')`)
- **Depende de sincronia temporal** (`setActionPanel(false)` ANTES de `iniciarMovimento()`)

Os outros 4 componentes são "burros" — só recebem dados e chamam callbacks simples (fechar modal, etc.). ActionControls é o único que orquestra ações que mudam o estado do jogo.

## 5. Regras objetivas para uma refatoração segura

1. **Nenhuma prop pode ser renomeada durante a extração** — o nome da prop no componente filho deve ser idêntico ao nome da variável no componente pai.

2. **Toda função extraída deve ser comparada linha a linha com o original** — `git diff` lado a lado entre o commit pré-refatoração e o arquivo extraído.

3. **A condição de renderização de cada componente extraído deve ser copiada exatamente**, caractere por caractere — incluindo operadores lógicos, parênteses, ordem das condições.

4. **Nenhuma extração pode ser declarada concluída sem teste manual do fluxo completo** — não basta build passar. O teste manual mínimo: iniciar partida → mover personagem → atacar → verificar dano → finalizar turno → turno da IA → jogador joga novamente → alguém vencer.

5. **Props que são callbacks com `setState` dentro devem ser explicitamente anotadas** — ex: `onAction={(type) => { setActionPanel(false); if (type === 'move') iniciarMovimento() }}`. A ordem das operações no callback deve ser idêntica à original.

6. **Todo extração de JSX que condiciona renderização em estado do pai (ex: `actionPanel`) deve receber esse estado como prop obrigatória** — usar `defaultProps` ou fallback visível para detectar falta da prop em desenvolvimento.

7. **Após cada extração individual, fazer deploy e testar manualmente o fluxo completo** — não acumular extrações.

---

*Documento criado em 2026-06-19 como parte da reversão segura (commit `revert Phase3Combat`). Nenhum código foi alterado além da reversão.*
