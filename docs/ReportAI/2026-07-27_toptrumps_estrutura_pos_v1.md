# Investigação estrutural — TopTrumps pós-v1

Data: 2026-07-27  
Escopo: diagnóstico e proposta; nenhum arquivo de jogo foi movido, renomeado ou apagado.

## Passo 0 — resíduo documental

O `SITE_MAP.md` ainda listava `TopTrumps.jsx` e `TopTrumps.css`. As duas linhas foram removidas em commit isolado:

```text
0e08f1b9 docs: remover residuo TopTrumps v1 do SITE_MAP + v10.192.34
```

Prova posterior:

```text
> rg -n "TopTrumps\.jsx|TopTrumps\.css" SITE_MAP.md
[sem saída]
```

O commit foi enviado para `main`, o build passou e o deploy foi publicado.

## Passo 1 — checkpoint da investigação

RAW:

```text
> git status
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean

> git stash list
stash@{0}: On main: checkpoint-pre-mapeamento-toptrumps-images-2026-07-27
stash@{1}: On main: checkpoint-pre-mapeamento-toptrumps-2026-07-27
```

Conclusão: a investigação começou com árvore limpa e os dois checkpoints anteriores intactos.

## Passo 2 — inventário bruto

### Árvore completa

RAW de `find src/pages/games/TopTrumps -type f | sort`:

```text
src/pages/games/TopTrumps/components/CardViewerModal.css
src/pages/games/TopTrumps/components/CardViewerModal.jsx
src/pages/games/TopTrumps/components/DeckBuilder.css
src/pages/games/TopTrumps/components/DeckBuilder.jsx
src/pages/games/TopTrumps/components/DeckStartModal.css
src/pages/games/TopTrumps/components/DeckStartModal.jsx
src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js
src/pages/games/TopTrumps/TopTrumpsLobby.css
src/pages/games/TopTrumps/TopTrumpsLobby.jsx
src/pages/games/TopTrumps/TopTrumpsMP.css
src/pages/games/TopTrumps/TopTrumpsMP.jsx
src/pages/games/TopTrumps/utils/attrNomeKey.js
src/pages/games/TopTrumps/v2/components/BurstParticles/BurstParticles.css
src/pages/games/TopTrumps/v2/components/BurstParticles/BurstParticles.jsx
src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.css
src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.jsx
src/pages/games/TopTrumps/v2/components/FireParticles/FireParticles.css
src/pages/games/TopTrumps/v2/components/FireParticles/FireParticles.jsx
src/pages/games/TopTrumps/v2/components/GameHUD/GameHUD.css
src/pages/games/TopTrumps/v2/components/GameHUD/GameHUD.jsx
src/pages/games/TopTrumps/v2/components/GameOverScreen/GameOverScreen.jsx
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx
src/pages/games/TopTrumps/v2/components/RewardScreen/RewardScreen.css
src/pages/games/TopTrumps/v2/components/RewardScreen/RewardScreen.jsx
src/pages/games/TopTrumps/v2/components/SoundToggle/SoundToggle.css
src/pages/games/TopTrumps/v2/components/SoundToggle/SoundToggle.jsx
src/pages/games/TopTrumps/v2/hooks/useGameEffects.js
src/pages/games/TopTrumps/v2/hooks/useTopTrumpsDeck.js
src/pages/games/TopTrumps/v2/hooks/useTopTrumpsRewards.js
src/pages/games/TopTrumps/v2/hooks/useTopTrumpsSP.js
src/pages/games/TopTrumps/v2/styles/GameScreen.css
src/pages/games/TopTrumps/v2/styles/MenuScreen.css
src/pages/games/TopTrumps/v2/styles/ResultScreen.css
src/pages/games/TopTrumps/v2/styles/tokens.css
src/pages/games/TopTrumps/v2/TopTrumpsSP_v2.jsx
src/pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest.jsx
```

Total: 38 arquivos.

### Linhas de cada `.jsx`/`.js`

RAW de `wc -l`:

```text
   169 src/pages/games/TopTrumps/components/CardViewerModal.jsx
   326 src/pages/games/TopTrumps/components/DeckBuilder.jsx
   126 src/pages/games/TopTrumps/components/DeckStartModal.jsx
    97 src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js
   358 src/pages/games/TopTrumps/TopTrumpsLobby.jsx
   958 src/pages/games/TopTrumps/TopTrumpsMP.jsx
    12 src/pages/games/TopTrumps/utils/attrNomeKey.js
     7 src/pages/games/TopTrumps/v2/components/BurstParticles/BurstParticles.jsx
    13 src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.jsx
    11 src/pages/games/TopTrumps/v2/components/FireParticles/FireParticles.jsx
    14 src/pages/games/TopTrumps/v2/components/GameHUD/GameHUD.jsx
    72 src/pages/games/TopTrumps/v2/components/GameOverScreen/GameOverScreen.jsx
   116 src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx
   148 src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx
    96 src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx
    43 src/pages/games/TopTrumps/v2/components/RewardScreen/RewardScreen.jsx
     9 src/pages/games/TopTrumps/v2/components/SoundToggle/SoundToggle.jsx
    75 src/pages/games/TopTrumps/v2/hooks/useGameEffects.js
    48 src/pages/games/TopTrumps/v2/hooks/useTopTrumpsDeck.js
    70 src/pages/games/TopTrumps/v2/hooks/useTopTrumpsRewards.js
   227 src/pages/games/TopTrumps/v2/hooks/useTopTrumpsSP.js
    52 src/pages/games/TopTrumps/v2/TopTrumpsSP_v2.jsx
    45 src/pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest.jsx
  3092 total
```

## Passo 3 — mapa de imports reais

Linhas sem saída significam que o arquivo não possui `import`.

```text
### components/CardViewerModal.jsx
1:import { useEffect, useCallback } from 'react'
2:import { motion, AnimatePresence } from 'framer-motion'
3:import { useLanguage } from '../../../../context/LanguageContext'
4:import { sfx } from '../../../../lib/sfx'
5:import { getTopTrumpsCardImage as bgCarta } from '../../../../lib/topTrumpsCardImages'
6:import './CardViewerModal.css'

### components/DeckBuilder.jsx
1:import { useState, useEffect } from 'react'
2:import { motion, AnimatePresence } from 'framer-motion'
3:import { useLanguage } from '../../../../context/LanguageContext'
4:import { sfx } from '../../../../lib/sfx'
5:import { salvarDeckTipo, salvarNomeDeck, carregarDeckTipo, carregarNomeDeck } from '../hooks/useTopTrumpsDeck'
6:import TopTrumpsCard from '../../../../components/TopTrumpsCard/TopTrumpsCard'
7:import { getTopTrumpsCardImage as bgCarta } from '../../../../lib/topTrumpsCardImages'
8:import './DeckBuilder.css'

### components/DeckStartModal.jsx
1:import { useState, useEffect } from 'react'
2:import { motion, AnimatePresence } from 'framer-motion'
3:import { useLanguage } from '../../../../context/LanguageContext'
4:import { sfx } from '../../../../lib/sfx'
5:import { listarDecksCompletos } from '../hooks/useTopTrumpsDeck'
6:import { getTopTrumpsCardImage as bgCarta } from '../../../../lib/topTrumpsCardImages'
7:import './DeckStartModal.css'

### hooks/useTopTrumpsDeck.js
1:import { supabase } from '../../../../lib/supabase'

### TopTrumpsLobby.jsx
1:import { useState, useEffect, useRef, useCallback } from 'react'
2:import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
3:import { useAuth } from '../../../context/AuthContext'
4:import { useReader } from '../../../context/ReaderContext'
5:import { useLanguage } from '../../../context/LanguageContext'
6:import { criarSala, entrarSalaPorCodigo, entrarFilaPublica, verificarLimiteDiario, incrementarPartidaDiaria, definirAposta, confirmarAposta, subscribeToSala } from '../../../hooks/useTopTrumpsMP'
7:import { usePresence } from '../../../hooks/usePresence'
8:import { carregarDeck as carregarDeckDB } from '../../../hooks/useLeaderboardDB'
9:import { getDeck } from '../../../lib/getDeck'
10:import deck from '../../../data/supertrunfo-pt.json'
11:import './TopTrumpsLobby.css'

### TopTrumpsMP.jsx
1:import { useState, useEffect, useRef } from 'react'
2:import { useSearchParams, useNavigate, Link } from 'react-router-dom'
3:import { useAuth } from '../../../context/AuthContext'
4:import { useLanguage } from '../../../context/LanguageContext'
5:import { getDeck } from '../../../lib/getDeck'
6:import { useAchievements } from '../../../context/AchievementsContext'
7:import { useReader } from '../../../context/ReaderContext'
8:import { supabase } from '../../../lib/supabase'
9:import { subscribeToSala, subscribeToMovimentos, registrarMovimento, atualizarSala, encerrarSala, incrementarPartidaDiaria, atualizarMPStats, escolherPPT, finalizarPPT } from '../../../hooks/useTopTrumpsMP'
10:import BackToGamesBtn from '../../../components/BackToGamesBtn/BackToGamesBtn'
11:import { sfx } from '../../../lib/sfx'
12:import './TopTrumpsMP.css'
34:import { TM_VERSION } from '../../../config/version'

### utils/attrNomeKey.js
[sem imports]

### v2/components/BurstParticles/BurstParticles.jsx
1:import './BurstParticles.css'

### v2/components/CurtainReveal/CurtainReveal.jsx
1:import './CurtainReveal.css'

### v2/components/FireParticles/FireParticles.jsx
1:import './FireParticles.css'

### v2/components/GameHUD/GameHUD.jsx
1:import './GameHUD.css'

### v2/components/GameOverScreen/GameOverScreen.jsx
1:import { Link } from 'react-router-dom'
2:import BackToGamesBtn from '../../../../../../components/BackToGamesBtn/BackToGamesBtn'

### v2/components/GameScreen/GameScreen.jsx
1:import { useState } from 'react'
2:import '../../styles/GameScreen.css'
3:import TopTrumpsCard from '../../../../../../components/TopTrumpsCard/TopTrumpsCard'
4:import FireParticles from '../FireParticles/FireParticles'
5:import CurtainReveal from '../CurtainReveal/CurtainReveal'

### v2/components/MenuScreen/MenuScreen.jsx
1:import { useState } from 'react'
2:import { Link } from 'react-router-dom'
3:import '../../styles/MenuScreen.css'
4:import BackToGamesBtn from '../../../../../../components/BackToGamesBtn/BackToGamesBtn'
5:import CardViewerModal from '../../../components/CardViewerModal'
6:import DeckBuilder from '../../../components/DeckBuilder'
7:import DeckStartModal from '../../../components/DeckStartModal'

### v2/components/ResultScreen/ResultScreen.jsx
1:import '../../styles/ResultScreen.css'
2:import TopTrumpsCard from '../../../../../../components/TopTrumpsCard/TopTrumpsCard'
3:import FireParticles from '../FireParticles/FireParticles'
4:import BurstParticles from '../BurstParticles/BurstParticles'

### v2/components/RewardScreen/RewardScreen.jsx
1:import TopTrumpsCard from '../../../../../../components/TopTrumpsCard/TopTrumpsCard'
2:import './RewardScreen.css'

### v2/components/SoundToggle/SoundToggle.jsx
1:import './SoundToggle.css'

### v2/hooks/useGameEffects.js
1:import { useState, useEffect, useRef, useCallback } from 'react'
2:import { sfx } from '../../../../../lib/sfx'

### v2/hooks/useTopTrumpsDeck.js
1:import { useState, useEffect } from 'react'
2:import { carregarDeck as carregarDeckDB, substituirDeck, salvarCartasDeck } from '../../../../../hooks/useLeaderboardDB'

### v2/hooks/useTopTrumpsRewards.js
1:import { useState, useEffect } from 'react'
2:import {
3-6: carregarTentativas, consumirTentativa, salvarCartasDeck, marcarCartaGanha,
     verificarCartaGanhaHoje, registrarPartida
     } from '../../../../../hooks/useLeaderboardDB'

### v2/hooks/useTopTrumpsSP.js
1:import { useState, useEffect, useCallback } from 'react'

### v2/TopTrumpsSP_v2.jsx
1:import { useEffect, useRef } from 'react'
2:import { useAuth } from '../../../../context/AuthContext'
3:import { useLanguage } from '../../../../context/LanguageContext'
4:import { useAchievements } from '../../../../context/AchievementsContext'
5:import { useEventos } from '../../../../context/EventosContext'
6:import { useReader } from '../../../../context/ReaderContext'
7:import { usePresence } from '../../../../hooks/usePresence'
8:import { getDeck } from '../../../../lib/getDeck'
9:import { registrarPartida, registrarPontuacaoRanking } from '../../../../hooks/useLeaderboardDB'
10:import { useTopTrumpsDeck } from './hooks/useTopTrumpsDeck'
11:import { useTopTrumpsRewards } from './hooks/useTopTrumpsRewards'
12:import { useTopTrumpsSP } from './hooks/useTopTrumpsSP'
13:import { useGameEffects } from './hooks/useGameEffects'
14:import MenuScreen from './components/MenuScreen/MenuScreen'
15:import GameScreen from './components/GameScreen/GameScreen'
16:import ResultScreen from './components/ResultScreen/ResultScreen'
17:import RewardScreen from './components/RewardScreen/RewardScreen'
18:import GameOverScreen from './components/GameOverScreen/GameOverScreen'
19:import Jokempo from '../../../../components/Jokempo/Jokempo'
20:import { attrNomeKey } from '../utils/attrNomeKey'
21:import { getTopTrumpsCardImage as cardImage } from '../../../../lib/topTrumpsCardImages'

### v2/TopTrumpsSP_v2_RewardTest.jsx
1:import { useState } from 'react'
2:import { useLanguage } from '../../../../context/LanguageContext'
3:import { getDeck } from '../../../../lib/getDeck'
4:import { attrNomeKey } from '../utils/attrNomeKey'
5:import RewardScreen from './components/RewardScreen/RewardScreen'
6:import { sfx } from '../../../../lib/sfx'
7:import { getTopTrumpsCardImage as cardImage } from '../../../../lib/topTrumpsCardImages'
```

### Grafo resumido de execução

```text
App.jsx
├── TopTrumpsSP_v2
│   ├── hooks: useTopTrumpsDeck, useTopTrumpsRewards, useTopTrumpsSP, useGameEffects
│   ├── MenuScreen
│   │   ├── CardViewerModal
│   │   ├── DeckBuilder ── raiz/hooks/useTopTrumpsDeck (persistência)
│   │   └── DeckStartModal ── raiz/hooks/useTopTrumpsDeck (persistência)
│   ├── GameScreen
│   │   ├── FireParticles
│   │   └── CurtainReveal
│   ├── ResultScreen
│   │   ├── FireParticles
│   │   └── BurstParticles
│   ├── RewardScreen
│   └── GameOverScreen
├── TopTrumpsSP_v2_RewardTest ── RewardScreen
├── TopTrumpsLobby
└── TopTrumpsMP

PerfilColecao
├── DeckBuilder
└── CardViewerModal
```

`GameHUD` e `SoundToggle` não aparecem como dependência de nenhum outro arquivo. Eles importam apenas o próprio CSS.

## Passo 4 — inconsistências estruturais, com prova

### 4.1 Três padrões de componente coexistem

**Padrão A — componentes soltos na raiz de `components/`:**

```text
components/CardViewerModal.jsx
components/DeckBuilder.jsx
components/DeckStartModal.jsx
```

Todos têm CSS irmão com o mesmo nome.

**Padrão B — pasta por componente em `v2/components/`:**

```text
v2/components/BurstParticles/BurstParticles.jsx
v2/components/CurtainReveal/CurtainReveal.jsx
v2/components/FireParticles/FireParticles.jsx
v2/components/GameHUD/GameHUD.jsx
v2/components/GameOverScreen/GameOverScreen.jsx
v2/components/GameScreen/GameScreen.jsx
v2/components/MenuScreen/MenuScreen.jsx
v2/components/ResultScreen/ResultScreen.jsx
v2/components/RewardScreen/RewardScreen.jsx
v2/components/SoundToggle/SoundToggle.jsx
```

**Padrão C — telas/entradas soltas diretamente em `TopTrumps/` ou `v2/`:**

```text
TopTrumpsLobby.jsx
TopTrumpsMP.jsx
v2/TopTrumpsSP_v2.jsx
v2/TopTrumpsSP_v2_RewardTest.jsx
```

Conclusão factual: há três convenções simultâneas. Dentro de `v2/components`, porém, `Nome/Nome.jsx` é aplicado a todos os 10 componentes; portanto, ali é uma convenção consistente, não um acidente isolado de cópia.

### 4.2 `hooks/` duplicado e colisão semântica

```text
hooks/useTopTrumpsDeck.js
v2/hooks/useGameEffects.js
v2/hooks/useTopTrumpsDeck.js
v2/hooks/useTopTrumpsRewards.js
v2/hooks/useTopTrumpsSP.js
```

Os dois `useTopTrumpsDeck.js` não são duplicatas funcionais:

- `hooks/useTopTrumpsDeck.js` exporta operações de persistência/configuração de decks e é consumido por `DeckBuilder.jsx:5` e `DeckStartModal.jsx:5`.
- `v2/hooks/useTopTrumpsDeck.js` é um React hook do fluxo single-player e é consumido por `TopTrumpsSP_v2.jsx:10`.

A inconsistência é de nome e localização: o arquivo da raiz se chama `use...`, mas não é um React hook; a coexistência gera dois caminhos diferentes com o mesmo basename.

### 4.3 CSS centralizado versus CSS junto do componente

Prova:

```text
CSS de componente junto do JSX: 6
  BurstParticles.css
  CurtainReveal.css
  FireParticles.css
  GameHUD.css
  RewardScreen.css
  SoundToggle.css

CSS de componente centralizado em v2/styles/: 3
  GameScreen.css
  MenuScreen.css
  ResultScreen.css

Folha compartilhada de tokens: 1
  tokens.css
```

Entre folhas de componente da v2, co-localização predomina por 6 a 3. Fora de `v2`, os três componentes compartilhados e as duas telas multiplayer também mantêm CSS junto do JSX. A convenção dominante no conjunto TopTrumps é, portanto, CSS ao lado do componente.

Imports de tokens:

```text
v2/styles/GameScreen.css:1:@import './tokens.css';
v2/styles/MenuScreen.css:1:@import './tokens.css';
v2/styles/ResultScreen.css:1:@import './tokens.css';
v2/components/BurstParticles/BurstParticles.css:1:@import '../../styles/tokens.css';
v2/components/CurtainReveal/CurtainReveal.css:1:@import '../../styles/tokens.css';
v2/components/FireParticles/FireParticles.css:1:@import '../../styles/tokens.css';
v2/components/RewardScreen/RewardScreen.css:1:@import '../../styles/tokens.css';
```

`GameHUD.css` e `SoundToggle.css` não importam `tokens.css`.

### 4.4 Diretórios vazios residuais

Além dos diretórios com arquivos, existem fisicamente:

```text
src/pages/games/TopTrumps/components/GameHUD/
src/pages/games/TopTrumps/components/SoundToggle/
```

Eles estão vazios e, por isso, não aparecem no `find ... -type f`. Os componentes reais de mesmo nome estão em `v2/components/`. Diretórios vazios não são rastreados pelo Git; nenhum arquivo deve ser removido por esta investigação.

### 4.5 Componentes presentes, porém sem consumidor

Prova de busca:

```text
v2/components/GameHUD/GameHUD.jsx:1:import './GameHUD.css'
v2/components/GameHUD/GameHUD.jsx:3:export default function GameHUD(...)
v2/components/SoundToggle/SoundToggle.jsx:1:import './SoundToggle.css'
v2/components/SoundToggle/SoundToggle.jsx:3:export default function SoundToggle(...)
```

Não existe outra ocorrência/import desses nomes na árvore TopTrumps. `GameHUD` e `SoundToggle` são estruturalmente órfãos no estado atual. A proposta abaixo apenas os reloca; eventual exclusão exige decisão separada.

### 4.6 Arquivos grandes já existentes

```text
TopTrumpsMP.jsx       958 linhas
TopTrumpsLobby.jsx    358 linhas
DeckBuilder.jsx       326 linhas
```

Os três ultrapassam 300 linhas. A reorganização de paths não deve adicionar lógica a eles. Extração funcional seria outro escopo e precisa de aprovação separada.

## Passo 5 — acoplamento com o resto do repositório

RAW do comando literal solicitado:

```text
src/App.jsx:32:import TopTrumpsSP_v2 from './pages/games/TopTrumps/v2/TopTrumpsSP_v2'
src/App.jsx:33:import TopTrumpsSP_v2_RewardTest from './pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest'
src/App.jsx:34:import TopTrumpsLobby from './pages/games/TopTrumps/TopTrumpsLobby'
src/App.jsx:35:import TopTrumpsMP from './pages/games/TopTrumps/TopTrumpsMP'
```

Busca complementar necessária: imports relativos feitos a partir de outra subárvore não contêm a string `pages/games/TopTrumps` e escapam do grep literal. Ela encontrou mais dois contratos externos:

```text
src/pages/platform/Perfil/abas/PerfilColecao.jsx:5:
  import DeckBuilder from '../../../games/TopTrumps/components/DeckBuilder'
src/pages/platform/Perfil/abas/PerfilColecao.jsx:6:
  import CardViewerModal from '../../../games/TopTrumps/components/CardViewerModal'
```

Assim, o contrato externo real tem seis imports:

| Consumidor | Linha | Alvo |
|---|---:|---|
| `src/App.jsx` | 32 | `v2/TopTrumpsSP_v2` |
| `src/App.jsx` | 33 | `v2/TopTrumpsSP_v2_RewardTest` |
| `src/App.jsx` | 34 | `TopTrumpsLobby` |
| `src/App.jsx` | 35 | `TopTrumpsMP` |
| `src/pages/platform/Perfil/abas/PerfilColecao.jsx` | 5 | `components/DeckBuilder` |
| `src/pages/platform/Perfil/abas/PerfilColecao.jsx` | 6 | `components/CardViewerModal` |

As rotas registradas permanecem:

```text
App.jsx:101 /games/toptrumps/v2/reward-test
App.jsx:102 /games/toptrumps/v2
App.jsx:103 /games/toptrumps
App.jsx:104 /games/toptrumps/lobby
App.jsx:105 /games/toptrumps/multiplayer
```

## Passo 6 — proposta de reorganização (não executada)

### Convenções escolhidas

1. Remover o nível `v2/`, pois ele já não distingue versões existentes.
2. Manter entradas de rota diretamente em `TopTrumps/`.
3. Usar uma pasta por componente: `components/Nome/Nome.jsx`.
4. Colocar todo CSS de componente ao lado do JSX.
5. Manter somente `styles/tokens.css` centralizado, pois é uma folha compartilhada, não CSS de um componente.
6. Renomear o utilitário de persistência da raiz para `deckPersistence.js`, deixando `useTopTrumpsDeck.js` exclusivamente para o React hook.
7. Não apagar `GameHUD` nem `SoundToggle` nesta reorganização; apenas registrar que estão órfãos.

### Árvore proposta

```text
TopTrumps/
├── TopTrumpsSP.jsx
├── TopTrumpsRewardTest.jsx
├── TopTrumpsLobby.jsx
├── TopTrumpsLobby.css
├── TopTrumpsMP.jsx
├── TopTrumpsMP.css
├── components/
│   ├── BurstParticles/BurstParticles.jsx + .css
│   ├── CardViewerModal/CardViewerModal.jsx + .css
│   ├── CurtainReveal/CurtainReveal.jsx + .css
│   ├── DeckBuilder/DeckBuilder.jsx + .css
│   ├── DeckStartModal/DeckStartModal.jsx + .css
│   ├── FireParticles/FireParticles.jsx + .css
│   ├── GameHUD/GameHUD.jsx + .css
│   ├── GameOverScreen/GameOverScreen.jsx
│   ├── GameScreen/GameScreen.jsx + .css
│   ├── MenuScreen/MenuScreen.jsx + .css
│   ├── ResultScreen/ResultScreen.jsx + .css
│   ├── RewardScreen/RewardScreen.jsx + .css
│   └── SoundToggle/SoundToggle.jsx + .css
├── hooks/
│   ├── deckPersistence.js
│   ├── useGameEffects.js
│   ├── useTopTrumpsDeck.js
│   ├── useTopTrumpsRewards.js
│   └── useTopTrumpsSP.js
├── styles/
│   └── tokens.css
└── utils/
    └── attrNomeKey.js
```

### Matriz completa de movimentação e consumidores/imports a ajustar

`—` significa que o arquivo não tem consumidor direto conhecido ou que só o próprio caminho interno muda.

| Caminho atual | Caminho proposto | Imports a ajustar |
|---|---|---|
| `v2/TopTrumpsSP_v2.jsx` | `TopTrumpsSP.jsx` | `App.jsx:32`; internos do próprio arquivo `:2-9,19-21` |
| `v2/TopTrumpsSP_v2_RewardTest.jsx` | `TopTrumpsRewardTest.jsx` | `App.jsx:33`; internos do próprio arquivo `:2-4,6-7` |
| `v2/components/BurstParticles/BurstParticles.jsx` | `components/BurstParticles/BurstParticles.jsx` | `ResultScreen.jsx:4` |
| `v2/components/BurstParticles/BurstParticles.css` | `components/BurstParticles/BurstParticles.css` | import local do JSX `:1` continua textual e funcional |
| `v2/components/CurtainReveal/CurtainReveal.jsx` | `components/CurtainReveal/CurtainReveal.jsx` | `GameScreen.jsx:5` |
| `v2/components/CurtainReveal/CurtainReveal.css` | `components/CurtainReveal/CurtainReveal.css` | import local do JSX `:1` continua textual e funcional |
| `v2/components/FireParticles/FireParticles.jsx` | `components/FireParticles/FireParticles.jsx` | `GameScreen.jsx:4`; `ResultScreen.jsx:3` |
| `v2/components/FireParticles/FireParticles.css` | `components/FireParticles/FireParticles.css` | import local do JSX `:1` continua textual e funcional |
| `v2/components/GameHUD/GameHUD.jsx` | `components/GameHUD/GameHUD.jsx` | nenhum consumidor; import local `:1` continua funcional |
| `v2/components/GameHUD/GameHUD.css` | `components/GameHUD/GameHUD.css` | `GameHUD.jsx:1` continua textual e funcional |
| `v2/components/GameOverScreen/GameOverScreen.jsx` | `components/GameOverScreen/GameOverScreen.jsx` | `TopTrumpsSP_v2.jsx:18`; import interno `:2` |
| `v2/components/GameScreen/GameScreen.jsx` | `components/GameScreen/GameScreen.jsx` | `TopTrumpsSP_v2.jsx:15`; internos `:2-3` |
| `v2/styles/GameScreen.css` | `components/GameScreen/GameScreen.css` | `GameScreen.jsx:2`; `@import` do próprio CSS `:1` |
| `v2/components/MenuScreen/MenuScreen.jsx` | `components/MenuScreen/MenuScreen.jsx` | `TopTrumpsSP_v2.jsx:14`; internos `:3-7` |
| `v2/styles/MenuScreen.css` | `components/MenuScreen/MenuScreen.css` | `MenuScreen.jsx:3`; `@import` do próprio CSS `:1` |
| `v2/components/ResultScreen/ResultScreen.jsx` | `components/ResultScreen/ResultScreen.jsx` | `TopTrumpsSP_v2.jsx:16`; internos `:1-2` |
| `v2/styles/ResultScreen.css` | `components/ResultScreen/ResultScreen.css` | `ResultScreen.jsx:1`; `@import` do próprio CSS `:1` |
| `v2/components/RewardScreen/RewardScreen.jsx` | `components/RewardScreen/RewardScreen.jsx` | `TopTrumpsSP_v2.jsx:17`; `TopTrumpsSP_v2_RewardTest.jsx:5`; interno `:1` |
| `v2/components/RewardScreen/RewardScreen.css` | `components/RewardScreen/RewardScreen.css` | import local do JSX `:2` continua textual e funcional |
| `v2/components/SoundToggle/SoundToggle.jsx` | `components/SoundToggle/SoundToggle.jsx` | nenhum consumidor; import local `:1` continua funcional |
| `v2/components/SoundToggle/SoundToggle.css` | `components/SoundToggle/SoundToggle.css` | `SoundToggle.jsx:1` continua textual e funcional |
| `v2/hooks/useGameEffects.js` | `hooks/useGameEffects.js` | `TopTrumpsSP_v2.jsx:13`; import interno `:2` |
| `v2/hooks/useTopTrumpsDeck.js` | `hooks/useTopTrumpsDeck.js` | `TopTrumpsSP_v2.jsx:10`; import interno `:2` |
| `v2/hooks/useTopTrumpsRewards.js` | `hooks/useTopTrumpsRewards.js` | `TopTrumpsSP_v2.jsx:11`; import interno multilinha `:2-6` |
| `v2/hooks/useTopTrumpsSP.js` | `hooks/useTopTrumpsSP.js` | `TopTrumpsSP_v2.jsx:12`; sem import relativo interno |
| `v2/styles/tokens.css` | `styles/tokens.css` | `GameScreen.css:1`; `MenuScreen.css:1`; `ResultScreen.css:1`; demais quatro referências permanecem relativas após mover árvore |
| `components/CardViewerModal.jsx` | `components/CardViewerModal/CardViewerModal.jsx` | `MenuScreen.jsx:5`; `PerfilColecao.jsx:6`; internos `:3-5` |
| `components/CardViewerModal.css` | `components/CardViewerModal/CardViewerModal.css` | import local do JSX `:6` continua textual e funcional |
| `components/DeckBuilder.jsx` | `components/DeckBuilder/DeckBuilder.jsx` | `MenuScreen.jsx:6`; `PerfilColecao.jsx:5`; internos `:3-7` |
| `components/DeckBuilder.css` | `components/DeckBuilder/DeckBuilder.css` | import local do JSX `:8` continua textual e funcional |
| `components/DeckStartModal.jsx` | `components/DeckStartModal/DeckStartModal.jsx` | `MenuScreen.jsx:7`; internos `:3-6` |
| `components/DeckStartModal.css` | `components/DeckStartModal/DeckStartModal.css` | import local do JSX `:7` continua textual e funcional |
| `hooks/useTopTrumpsDeck.js` | `hooks/deckPersistence.js` | `DeckBuilder.jsx:5`; `DeckStartModal.jsx:5`; import interno `:1` não muda por rename |

Arquivos que ficariam no mesmo lugar:

```text
TopTrumpsLobby.jsx
TopTrumpsLobby.css
TopTrumpsMP.jsx
TopTrumpsMP.css
utils/attrNomeKey.js
```

### Import paths propostos nos contratos externos

```text
src/App.jsx:32
  ./pages/games/TopTrumps/v2/TopTrumpsSP_v2
  → ./pages/games/TopTrumps/TopTrumpsSP

src/App.jsx:33
  ./pages/games/TopTrumps/v2/TopTrumpsSP_v2_RewardTest
  → ./pages/games/TopTrumps/TopTrumpsRewardTest

src/pages/platform/Perfil/abas/PerfilColecao.jsx:5
  ../../../games/TopTrumps/components/DeckBuilder
  → ../../../games/TopTrumps/components/DeckBuilder/DeckBuilder

src/pages/platform/Perfil/abas/PerfilColecao.jsx:6
  ../../../games/TopTrumps/components/CardViewerModal
  → ../../../games/TopTrumps/components/CardViewerModal/CardViewerModal
```

Os imports de `TopTrumpsLobby` e `TopTrumpsMP` em `App.jsx:34-35` não mudariam.

## Estimativa de risco

| Métrica | Estimativa |
|---|---:|
| Arquivos existentes no escopo | 38 |
| Arquivos movidos/renomeados | 33 |
| Arquivos mantidos no caminho atual | 5 |
| Arquivos de código/CSS com texto de import a alterar | 18 |
| Diretivas de import/`@import` a corrigir | 49 |
| Contratos externos a corrigir | 4 |
| Rotas cujo path público muda | 0 |
| Componentes órfãos preservados | 2 |

Risco global: **médio**. A mudança é mecânica, mas larga: afeta 33 caminhos e 49 diretivas. Os maiores riscos são:

1. errar profundidade de imports externos após retirar `v2/`;
2. quebrar os dois imports de `PerfilColecao`, invisíveis ao grep literal inicial;
3. deixar um `@import` de `tokens.css` apontando para a profundidade antiga;
4. confundir os dois arquivos hoje chamados `useTopTrumpsDeck.js`;
5. deixar Vite resolver implicitamente um arquivo solto que passará a viver dentro de pasta.

Validação recomendada para a tarefa futura, após aprovação: movimentação em um único commit coerente, busca por `/v2/` e pelos paths antigos, `npm run build`, testes das cinco rotas TopTrumps e abertura da aba de coleção do perfil.

## Veredito

É estruturalmente viável remover o nesting `v2/` sem alterar URLs públicas ou comportamento, desde que os 49 imports sejam tratados como uma matriz fechada. A estrutura mais coerente com o padrão já predominante é pasta por componente, CSS co-localizado e apenas `tokens.css` centralizado. Nenhuma reorganização foi executada nesta rodada.
