# Investigação profunda — TopTrumps v1 legacy, v2, órfãos e histórico

Data: 2026-07-27

HEAD inicial: `d8b61b43037c47d4098d15397d29ad4a1dc2e651`

Escopo: diagnóstico puro. Nenhum arquivo do jogo foi corrigido, removido, movido, renomeado ou reconectado.

## Conclusão executiva

1. Os diretórios `TopTrumps/components/GameHUD/` e `TopTrumps/components/SoundToggle/` existem fisicamente, mas estão vazios e não são rastreados pelo Git. Não são componentes paralelos da raiz.
2. `GameHUD` e `SoundToggle` foram criados e efetivamente renderizados no commit `1601d725`, mas foram removidos do fluxo apenas 2 minutos e 44 segundos depois por `3ec1aa07`, quando o placeholder da fase visual foi substituído pelo núcleo do jogo. Nunca voltaram a ser conectados.
3. O HUD não desapareceu: foi duplicado inline em `v2/components/GameScreen/GameScreen.jsx:26-33` e `ResultScreen.jsx:28-34`.
4. O som continua sendo disparado automaticamente por `v2/hooks/useGameEffects.js:46-60`, mas o controle de ligar/desligar não está exposto. `somAtivo` e `toggleSom`, linhas 12 e 21-24, são retornados na linha 74 e não consumidos por nenhum componente ativo.
5. Os CSS marcados como órfãos não são “código visual sem usuário”: seus seletores são usados pelos JSX v2. Porém, os arquivos não são importados no estado atual. A v2 recebe os estilos equivalentes acidentalmente de `TopTrumps.css`, importado pela v1/legacy, cujo módulo é carregado estaticamente por `App.jsx`.
6. `GameScreen.css`, `MenuScreen.css` e `ResultScreen.css` foram criados em `4bc6fefa`, inicialmente sem imports. Eles foram ligados aos componentes em `86f3d28b`, após a consolidação da v2 na raiz, e voltaram a ficar desconectados no revert `82521f5e`.
7. Os CSS de partículas foram criados em `1601d725`, também sem imports diretos. Foram conectados explicitamente em `86f3d28b` e desconectados pelo revert `82521f5e`.
8. A arquitetura atual da v2 depende do monólito CSS da v1. Se a rota legacy e seu import estático forem removidos sem reconectar os CSS modulares, a v2 perde grande parte da apresentação visual.

## Passo 0 — Checkpoint RAW

Comandos:

```bash
git status
git stash list
git rev-parse HEAD
```

Output:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
stash@{0}: On main: checkpoint-pre-mapeamento-toptrumps-images-2026-07-27
stash@{1}: On main: checkpoint-pre-mapeamento-toptrumps-2026-07-27
d8b61b43037c47d4098d15397d29ad4a1dc2e651
```

Confirmação: árvore limpa e ambos os stashes anteriores intactos.

## Passo 1 — Existência física dos diretórios suspeitos

Comandos:

```bash
ls -la src/pages/games/TopTrumps/components/
find src/pages/games/TopTrumps/components -type f
```

Output RAW:

```text
total 68
drwxr-xr-x 1 isaia 197609     0 jun 29 19:15 .
drwxr-xr-x 1 isaia 197609     0 jun 29 19:15 ..
-rw-r--r-- 1 isaia 197609  4265 jun 25 23:40 CardViewerModal.css
-rw-r--r-- 1 isaia 197609  8256 jul 18 18:03 CardViewerModal.jsx
-rw-r--r-- 1 isaia 197609  8442 jun 25 23:40 DeckBuilder.css
-rw-r--r-- 1 isaia 197609 15812 jul 18 18:03 DeckBuilder.jsx
-rw-r--r-- 1 isaia 197609  2844 jun 25 23:40 DeckStartModal.css
-rw-r--r-- 1 isaia 197609  6644 jul 18 18:03 DeckStartModal.jsx
drwxr-xr-x 1 isaia 197609     0 jun 29 13:10 GameHUD
drwxr-xr-x 1 isaia 197609     0 jun 29 13:10 SoundToggle
src/pages/games/TopTrumps/components/CardViewerModal.css
src/pages/games/TopTrumps/components/CardViewerModal.jsx
src/pages/games/TopTrumps/components/DeckBuilder.css
src/pages/games/TopTrumps/components/DeckBuilder.jsx
src/pages/games/TopTrumps/components/DeckStartModal.css
src/pages/games/TopTrumps/components/DeckStartModal.jsx
```

Os dois diretórios existem, mas o `find` prova que estão vazios.

## Passo 2 — Histórico RAW de cada arquivo suspeito

> A especificação chama o conjunto de “8 arquivos”, mas enumera 10 caminhos. Os 10 foram investigados.

### `v2/components/GameHUD/GameHUD.jsx`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

### `v2/components/SoundToggle/SoundToggle.jsx`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

### `v2/components/GameHUD/GameHUD.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

### `v2/components/SoundToggle/SoundToggle.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

### `v2/components/BurstParticles/BurstParticles.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
86f3d28b Top Trumps CSS monolith refactoring: TopTrumps.css (2552 lines) replaced by per-component CSS imports + shared.css + GameScreen.css + v10.183.20
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

### `v2/components/CurtainReveal/CurtainReveal.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
86f3d28b Top Trumps CSS monolith refactoring: TopTrumps.css (2552 lines) replaced by per-component CSS imports + shared.css + GameScreen.css + v10.183.20
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

### `v2/components/FireParticles/FireParticles.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
86f3d28b Top Trumps CSS monolith refactoring: TopTrumps.css (2552 lines) replaced by per-component CSS imports + shared.css + GameScreen.css + v10.183.20
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

### `v2/styles/GameScreen.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
cdec7431 fix: confirm modal CSS completo + reward test + playwright 4/4 pass
4bc6fefa feat(toptrumps-v2): CSS modularizado + swap de rota [v10.183.0]
```

### `v2/styles/MenuScreen.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
86f3d28b Top Trumps CSS monolith refactoring: TopTrumps.css (2552 lines) replaced by per-component CSS imports + shared.css + GameScreen.css + v10.183.20
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
4bc6fefa feat(toptrumps-v2): CSS modularizado + swap de rota [v10.183.0]
```

### `v2/styles/ResultScreen.css`

```text
82521f5e fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
c2392d5f refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]
b89bee8a fix(toptrumps-v2): safe area + reward test route [v10.183.3]
4bc6fefa feat(toptrumps-v2): CSS modularizado + swap de rota [v10.183.0]
```

### Autoria e datas dos commits relevantes

```text
1601d7257897f8b7f6b5ab1446ccac67637ab92c
Isaias Leal <Ipms@panoramaid.com.br>
2026-06-27T19:03:50-03:00
feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]

4bc6fefaed7440e3e7fe62f1ea2d28281dc89955
Isaias Leal <Ipms@panoramaid.com.br>
2026-06-27T19:22:52-03:00
feat(toptrumps-v2): CSS modularizado + swap de rota [v10.183.0]

b89bee8afeef2ab4db87d609cedf88492567ee54
Isaias Leal <Ipms@panoramaid.com.br>
2026-06-27T20:21:17-03:00
fix(toptrumps-v2): safe area + reward test route [v10.183.3]

cdec7431e9776b284df4020d5737d6f305692fc8
Isaias Leal <Ipms@panoramaid.com.br>
2026-06-27T20:30:54-03:00
fix: confirm modal CSS completo + reward test + playwright 4/4 pass

86f3d28b3241cd80e8cdb39fcbc8c0bcf2a78844
Isaias Leal <Ipms@panoramaid.com.br>
2026-06-29T13:12:03-03:00
Top Trumps CSS monolith refactoring: TopTrumps.css (2552 lines) replaced by per-component CSS imports + shared.css + GameScreen.css + v10.183.20

c2392d5fecbe0d6d45e1200d28bba5959967ed8c
Isaias Leal <Ipms@panoramaid.com.br>
2026-06-27T23:33:39-03:00
refactor(toptrumps): remover v1 + consolidar v2 como unica versao [v5.45.0]

82521f5e6144c617fbb087c59eea079e89a41fa6
Isaias Leal <Ipms@panoramaid.com.br>
2026-06-29T19:18:01-03:00
fix(toptrumps): revert to 655604fd state (v1 + v2 restored) + v5.44.7
```

### Prova do momento exato em que HUD e toggle foram desligados

`git log -S"import GameHUD"` e `git log -S"import SoundToggle"`:

```text
3ec1aa07 feat(toptrumps-v2): useTopTrumpsSP nucleo de jogo [v10.182.2]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
3ec1aa07 feat(toptrumps-v2): useTopTrumpsSP nucleo de jogo [v10.182.2]
1601d725 feat(toptrumps-v2): useGameEffects + componentes visuais [v10.182.1]
```

Trecho do diff de `3ec1aa07`, em 2026-06-27 19:06:34 -03:00:

```diff
-import FireParticles from './components/FireParticles/FireParticles'
-import SoundToggle from './components/SoundToggle/SoundToggle'
-import GameHUD from './components/GameHUD/GameHUD'
...
-  const { somAtivo, toggleSom } = useGameEffects({ fase: 'menu', confirmandoAtributo: null })
...
-      <FireParticles />
-      <SoundToggle ativo={somAtivo} onToggle={toggleSom} labelAtivo={'\uD83D\uDD0A'} labelInativo={'\uD83D\uDD07'} />
-      <GameHUD rodada={1} totalTurnos={5} placarJogador={0} placarIA={0} labelVoce="VOC\u00CA" labelIA="IA" />
+  const effects = useGameEffects({ fase: 'menu', confirmandoAtributo: null })
+  const game = useTopTrumpsSP({ ... })
```

Isso comprova que `GameHUD` e `SoundToggle` foram usados no primeiro placeholder visual, mas desconectados ao entrar o núcleo real do jogo. Não foi o revert de 29/06 que os desligou; já estavam desligados desde `3ec1aa07`.

## Passo 3 — HUD e som usados pela v2 atual

Comandos:

```bash
grep -n "HUD\|Sound\|som\|audio" src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx
grep -rn "HUD\|SoundToggle" src/pages/games/TopTrumps/v2/TopTrumpsSP_v2.jsx
```

Output RAW dos dois comandos: vazio; ambos terminaram com status `1`.

```text
```

### HUD equivalente atual

`v2/components/GameScreen/GameScreen.jsx:26-33`:

```text
26:          <div className="tt-game-header">
27:            <div className="tt-game-round">{tt('hud_rodada', { n: rodada, total: totalTurnos })}</div>
28:            <div className="tt-game-score">
29:              <span className="tt-score-you">{tt('voce')} {placar.jogador}</span>
30:              <span className="tt-score-sep">:</span>
31:              <span className="tt-score-ai">{tt('ia')} {placar.ia}</span>
32:            </div>
33:          </div>
```

`v2/components/ResultScreen/ResultScreen.jsx:28-34`:

```text
28:          <div className="tt-game-header">
29:            <div className="tt-game-round">{tt('hud_rodada', { n: rodada, total: totalTurnos })}</div>
30:            <div className="tt-game-score">
31:              <span className="tt-score-you">{placar?.jogador}</span>
32:              <span className="tt-score-sep">:</span>
33:              <span className="tt-score-ai">{placar?.ia}</span>
34:            </div>
```

### Som equivalente atual

`v2/hooks/useGameEffects.js:11-24`:

```text
11:export function useGameEffects({ fase, confirmandoAtributo }) {
12:  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
13:  const [particulas, setParticulas] = useState([])
14:  const [cortinaAtiva, setCortinaAtiva] = useState(false)
15:  const [onomaTexto, setOnomaTexto] = useState('KABOOM!')
16:  const faseRef = useRef(fase)
17:  const confirmRef = useRef(confirmandoAtributo)
18:  faseRef.current = fase
19:  confirmRef.current = confirmandoAtributo
20:
21:  function toggleSom() {
22:    const novo = sfx.toggle()
23:    setSomAtivo(novo)
24:  }
```

`v2/hooks/useGameEffects.js:46-74`:

```text
46:  const iniciarEfeitosRevelacao = useCallback((resultado, callbacks) => {
47:    sfx.cardFlip()
48:    setTimeout(() => {
49:      sortearOnomatopeia()
50:      sfx.vs()
51:      sfx.startHeartbeatLoop()
52:      setCortinaAtiva(true)
53:    }, 600)
54:    setTimeout(() => {
55:      sfx.stopHeartbeatLoop()
56:      setCortinaAtiva(false)
57:      if (resultado === 'ganhou') sfx.win()
58:      else if (resultado === 'perdeu') sfx.lose()
59:      else sfx.draw()
60:      gerarParticulas(resultado)
61:      callbacks?.onReveal?.()
62:    }, 1800)
63:  }, [])
64:
65:  useEffect(() => {
66:    if (faseRef.current === 'jogando' && !confirmRef.current) {
67:      sfx.startHeartbeatLoop()
68:    } else {
69:      sfx.stopHeartbeatLoop()
70:    }
71:    return () => sfx.stopHeartbeatLoop()
72:  }, [])
73:
74:  return { somAtivo, toggleSom, particulas, cortinaAtiva, onomaTexto, iniciarEfeitosRevelacao }
```

`TopTrumpsSP_v2.jsx:72-80` usa `effects.iniciarEfeitosRevelacao`, `cortinaAtiva`, `onomaTexto` e `particulas`, mas não usa `somAtivo` nem `toggleSom`. Logo, há áudio automático, mas não equivalente funcional visível para o botão de som.

## Passo 4 — Comparação estrutural v1 vs v2

### v1 RAW

```text
1:import { useState, useEffect, useRef } from 'react'
52:function bgCarta(carta) {
58:function attrNomeKey(id) {
71:function embaralhar(arr) { return [...arr].sort(() => Math.random() - 0.5) }
72:function avatarCor(id) {
77:function keyPorUser(user, suffix) {
82:export default function TopTrumps() {
97:  useEffect(() => { desbloquearRef.current = desbloquear }, [desbloquear])
100:  useEffect(() => {
105:  const [fase, setFase] = useState('menu')
106:  const [deckJogador, setDeckJogador] = useState([])
107:  const [deckIA, setDeckIA] = useState([])
108:  const [cartaJogador, setCartaJogador] = useState(null)
109:  const [cartaIA, setCartaIA] = useState(null)
110:  const [atributoEscolhido, setAtributoEscolhido] = useState(null)
111:  const [resultado, setResultado] = useState(null)
112:  const [placar, setPlacar] = useState({ jogador: 0, ia: 0 })
113:  const [rodada, setRodada] = useState(1)
114:  const [totalTurnos, setTotalTurnos] = useState(null)
115:  const [deckUsuario, setDeckUsuario] = useState([])
116:  const [recompensaOpcoes, setRecompensaOpcoes] = useState([])
117:  const [jaGanhouHoje, setJaGanhouHoje] = useState(false)
118:  const [tentativasMax, setTentativasMax] = useState(3)
119:  const [tentativasRestantes, setTentativasRestantes] = useState(3)
120:  const [cartaRecompensaSelecionada, setCartaRecompensaSelecionada] = useState(null)
121:  const [menuStep, setMenuStep] = useState(null)
122:  const [girando, setGirando] = useState(false)
123:  const [particulas, setParticulas] = useState([])
124:  const [historicoRodadas, setHistoricoRodadas] = useState([])
125:  const [showDesistirModal, setShowDesistirModal] = useState(false)
126:  const [modalMultiplayerLocked, setModalMultiplayerLocked] = useState(false)
127:  const [swipeRevealed, setSwipeRevealed] = useState(false)
130:  const [viewerIdx, setViewerIdx] = useState(null)
131:  const [showDeckBuilder, setShowDeckBuilder] = useState(false)
132:  const [showDeckStart, setShowDeckStart] = useState(false)
135:  const [templateIdxJogador, setTemplateIdxJogador] = useState(0)
136:  const [templateIdxIA, setTemplateIdxIA] = useState(0)
138:  function sortearTemplates() {
153:  const [onomaTexto, setOnomaTexto] = useState('KABOOM!')
155:  function sortearOnomatopeia() {
161:  const [confirmandoAtributo, setConfirmandoAtributo] = useState(null)
162:  const [cartaSumindo, setCartaSumindo] = useState(false)
163:  const [cortinaAtiva, setCortinaAtiva] = useState(false)
164:  const [revelandoResultado, setRevelandoResultado] = useState(false)
167:  const [vezAtual, setVezAtual] = useState('jogador')
168:  const [iaEscolhendo, setIaEscolhendo] = useState(false)
171:  const [somAtivo, setSomAtivo] = useState(sfx.enabled)
172:  function toggleSom() {
176:  useEffect(() => {
186:  useEffect(() => {
```

### v2 RAW

```text
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
21:import cardFallback from '../../../../assets/images/cards/characters/card-fallback.png'
22:import img01 from '../../../../assets/images/cards/characters/card-01.png'
23:import img02 from '../../../../assets/images/cards/characters/card-02.png'
24:import img03 from '../../../../assets/images/cards/characters/card-03.png'
25:import img04 from '../../../../assets/images/cards/characters/card-04.png'
26:import img05 from '../../../../assets/images/cards/characters/card-05.png'
27:import img06 from '../../../../assets/images/cards/characters/card-06.png'
28:import img07 from '../../../../assets/images/cards/characters/card-07.png'
29:import img08 from '../../../../assets/images/cards/characters/card-08.png'
30:import img09 from '../../../../assets/images/cards/characters/card-09.png'
31:import img10 from '../../../../assets/images/cards/characters/card-10.png'
32:import img11 from '../../../../assets/images/cards/characters/card-11.png'
33:import img12 from '../../../../assets/images/cards/characters/card-12.png'
34:import img13 from '../../../../assets/images/cards/characters/card-13.png'
35:import img14 from '../../../../assets/images/cards/characters/card-14.png'
36:import img15 from '../../../../assets/images/cards/characters/card-15.png'
37:import img16 from '../../../../assets/images/cards/characters/card-16.png'
38:import img17 from '../../../../assets/images/cards/characters/card-17.png'
39:import img18 from '../../../../assets/images/cards/characters/card-18.png'
40:import img21 from '../../../../assets/images/cards/characters/card-21.png'
41:import img23 from '../../../../assets/images/cards/characters/card-23.png'
51:function cardImage(carta) {
55:export default function TopTrumpsSP_v2() {
66:  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])
```

Mapa estrutural:

| Responsabilidade v1 monolítica | Equivalente v2 |
|---|---|
| Máquina de jogo, cartas, rodada, placar, IA | `hooks/useTopTrumpsSP.js` |
| Deck do usuário | `hooks/useTopTrumpsDeck.js` |
| Tentativas e recompensa | `hooks/useTopTrumpsRewards.js` |
| Som, partículas, cortina | `hooks/useGameEffects.js` |
| Menu e modais | `components/MenuScreen/MenuScreen.jsx` + componentes compartilhados da raiz |
| Gameplay e HUD | `components/GameScreen/GameScreen.jsx`, HUD inline |
| Resultado | `components/ResultScreen/ResultScreen.jsx` |
| Recompensa | `components/RewardScreen/RewardScreen.jsx` |
| Fim de jogo | `components/GameOverScreen/GameOverScreen.jsx` |
| Toggle de som | Sem consumidor visual atual; `SoundToggle.jsx` órfão |
| CSS | Na prática ainda fornecido pelo monólito v1 `TopTrumps.css` |

## Passo 5 — Classes dos CSS e referências JSX

### `GameHUD.css`

Classes RAW:

```text
.tt-game-header
.tt-game-round
.tt-game-score
.tt-score-ai
.tt-score-sep
.tt-score-you
```

Referências RAW:

```text
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:26:          <div className="tt-game-header">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:28:          <div className="tt-game-header">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:27:            <div className="tt-game-round">{tt('hud_rodada', { n: rodada, total: totalTurnos })}</div>
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:29:            <div className="tt-game-round">{tt('hud_rodada', { n: rodada, total: totalTurnos })}</div>
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:28:            <div className="tt-game-score">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:30:            <div className="tt-game-score">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:29:              <span className="tt-score-you">{tt('voce')} {placar.jogador}</span>
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:30:              <span className="tt-score-sep">:</span>
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:31:              <span className="tt-score-ai">{tt('ia')} {placar.ia}</span>
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:31:              <span className="tt-score-you">{placar?.jogador}</span>
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:32:              <span className="tt-score-sep">:</span>
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:33:              <span className="tt-score-ai">{placar?.ia}</span>
```

Todas também aparecem em `GameHUD.jsx`, mas esse componente não é importado.

### `SoundToggle.css`

Classes RAW:

```text
.tt-sound-toggle
```

Referência RAW:

```text
src/pages/games/TopTrumps/v2/components/SoundToggle/SoundToggle.jsx:3:    <button className="tt-sound-toggle" onClick={onToggle} title={ativo ? labelAtivo : labelInativo}>
```

Nenhum JSX ativo usa a classe.

### `BurstParticles.css`

Classes RAW:

```text
.tt-particula
.tt-particula--empate
.tt-particula--ganhou
.tt-particula--perdeu
.tt-particula--va
.tt-particula--vb
.tt-particula--vc
.tt-particula--vd
.tt-particula--ve
.tt-particula--vf
```

Referências RAW:

```text
src/pages/games/TopTrumps/v2/components/BurstParticles/BurstParticles.jsx:3:    <div key={p.id} className={`tt-particula tt-particula--${p.tipo} tt-particula--v${p.variante}`} />
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:25:          <div key={p.id} className={`tt-particula tt-particula--${p.tipo} tt-particula--v${p.variante}`} />
```

As classes variantes são construídas dinamicamente.

### `CurtainReveal.css`

Classes RAW:

```text
.tt-curtain-inner
.tt-curtain-onomatopeia
.tt-curtain-overlay
.tt-onoma-texto
```

Referências RAW:

```text
src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.jsx:4:    <div className="tt-curtain-overlay">
src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.jsx:5:      <div className="tt-curtain-inner" />
src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.jsx:6:      <div className="tt-curtain-onomatopeia">
src/pages/games/TopTrumps/v2/components/CurtainReveal/CurtainReveal.jsx:7:        <span className="tt-onoma-texto">{texto}</span>
```

`CurtainReveal.jsx` é ativo via `GameScreen.jsx`.

### `FireParticles.css`

Classes RAW:

```text
.tt-fire-particle
.tt-fire-particles
```

Referências RAW:

```text
src/pages/games/TopTrumps/v2/components/FireParticles/FireParticles.jsx:3:    <div className="tt-fire-particles">
src/pages/games/TopTrumps/v2/components/FireParticles/FireParticles.jsx:5:        <div key={i} className="tt-fire-particle" />
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:18:      <div className="tt-fire-particles">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:20:          <div key={i} className="tt-fire-particle" />
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:19:      <div className="tt-fire-particles">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:21:          <div key={i} className="tt-fire-particle" />
```

### `styles/GameScreen.css`

Classes RAW:

```text
.tt-btn-desistir
.tt-card--mini
.tt-card--mini-wrapper
.tt-card-template
.tt-card-wrapper
.tt-confirm-attr-nome
.tt-confirm-bar
.tt-confirm-bar-fill
.tt-confirm-btn
.tt-confirm-btn--cancel
.tt-confirm-btn--ok
.tt-confirm-buttons
.tt-confirm-label
.tt-confirm-modal
.tt-confirm-overlay
.tt-confirm-pct
.tt-confirm-value-box
.tt-confirm-value-label
.tt-confirm-value-max
.tt-confirm-value-num
.tt-confirm-values
.tt-desistir-modal
.tt-desistir-overlay
.tt-fade-in
.tt-game-container
.tt-game-footer
.tt-game-header
.tt-game-round
.tt-game-score
.tt-opponent-mini-wrapper
.tt-page
.tt-player-card-wrapper
.tt-score-ai
.tt-score-sep
.tt-score-you
.tt-vs-heartbeat
```

Todos os seletores específicos de gameplay são referenciados em `GameScreen.jsx`; `.tt-fade-in` também aparece no menu. Exemplos RAW:

```text
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:24:      <section className="tt-page">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:25:        <div className="tt-game-container">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:34:          <div className="tt-player-card-wrapper">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:46:          <div className="tt-vs-heartbeat">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:50:          <div className="tt-opponent-mini-wrapper">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:54:            <div className="tt-card--mini-wrapper">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:58:          <div className="tt-game-footer">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:59:            <button className="tt-btn-desistir" onClick={() => setShowDesistirModal(true)}>
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:71:            <div className="tt-confirm-overlay">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:72:              <div className="tt-confirm-modal">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:85:                <div className="tt-confirm-bar">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:89:                <div className="tt-confirm-buttons">
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:101:          <div className="tt-desistir-overlay" onClick={() => setShowDesistirModal(false)}>
src/pages/games/TopTrumps/v2/components/GameScreen/GameScreen.jsx:102:            <div className="tt-desistir-modal" onClick={e => e.stopPropagation()}>
```

### `styles/MenuScreen.css`

Classes RAW:

```text
.tt-btn-deck-builder
.tt-btn-jogar
.tt-card-sample
.tt-card-sample--1
.tt-card-sample--2
.tt-card-sample--3
.tt-card-stack
.tt-colecao
.tt-colecao-bar
.tt-colecao-bar-fill
.tt-colecao-label
.tt-config
.tt-config-tentativas
.tt-config-turno-btn
.tt-config-turno-btn--ativo
.tt-config-turnos
.tt-guest-aviso-previo
.tt-ja-ganhou-hoje
.tt-link-album
.tt-locked-modal
.tt-locked-overlay
.tt-menu-bg
.tt-menu-cards
.tt-menu-content
.tt-menu-layout
.tt-modo-card
.tt-modos
.tt-page--menu
.tt-tentativa-dot
.tt-tentativa-dot--gasta
.tt-title-desc
.tt-title-group
.tt-title-main
```

Todos são referenciados em `MenuScreen.jsx`, exceto variações descendentes não capturadas como seletores-base. Exemplos RAW:

```text
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:22:    <section className="tt-page tt-page--menu"><div className="tt-menu-bg" /><div className="tt-menu-layout">
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:23:      <div className="tt-menu-cards"><div className="tt-card-stack">
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:28:        <div className="tt-title-group"><h1 className="tt-title-main">{tt('menu_titulo')}</h1></div>
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:29:        <p className="tt-title-desc">{tt('menu_desc')}</p>
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:31:          <div className="tt-colecao">
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:44:            <div className="tt-modos">
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:62:            <div className="tt-config tt-fade-in">
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:67:                    className={`tt-config-turno-btn${totalTurnos === n ? ' tt-config-turno-btn--ativo' : ''}`}
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:85:                    {Array.from({length: tentativasMax}).map((_, i) => (<span key={i} className={`tt-tentativa-dot${i < (tentativasMax - tentativasRestantes) ? ' tt-tentativa-dot--gasta' : ''}`} />))}
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:94:                  <button className="tt-btn-deck-builder" onClick={() => setShowDeckBuilder(true)}>
src/pages/games/TopTrumps/v2/components/MenuScreen/MenuScreen.jsx:134:        <div className="tt-locked-overlay" onClick={() => setModalMultiplayerLocked(false)}>
```

### `styles/ResultScreen.css`

Classes RAW:

```text
.tt-btn-next-round
.tt-cards-swipe-container
.tt-cards-swipe-track
.tt-cards-swipe-track--revealed
.tt-card-template
.tt-card-wrapper
.tt-result-attr-comparison
.tt-result-attr-name
.tt-result-badge
.tt-result-container
.tt-result-draw
.tt-result-lose
.tt-result-values
.tt-result-win
.tt-swipe-btn
.tt-swipe-btn--left
.tt-swipe-btn--right
.tt-swipe-card-slot
.tt-swipe-label
```

Referências RAW:

```text
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:27:        <div className="tt-result-container">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:36:          <div className={`tt-result-badge ${
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:37:            resultado === 'ganhou' ? 'tt-result-win' :
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:38:            resultado === 'perdeu' ? 'tt-result-lose' : 'tt-result-draw'
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:44:            <div className="tt-result-attr-comparison">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:45:              <div className="tt-result-attr-name">{tt(attr.nomeKey)}</div>
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:46:              <div className="tt-result-values">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:53:          <div className="tt-cards-swipe-container">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:54:            <div className={`tt-cards-swipe-track${swipeRevealed ? ' tt-cards-swipe-track--revealed' : ''}`}>
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:55:              <div className="tt-swipe-card-slot">
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:56:                <span className="tt-swipe-label">{tt('sua_carta')}</span>
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:81:              className={`tt-swipe-btn${swipeRevealed ? ' tt-swipe-btn--left' : ' tt-swipe-btn--right'}`}
src/pages/games/TopTrumps/v2/components/ResultScreen/ResultScreen.jsx:88:          <button className="tt-btn-next-round" onClick={onProximaRodada}>
```

### Por que a v2 tem estilo mesmo sem importar esses arquivos?

Cada seletor extraído dos oito CSS foi procurado em `TopTrumps.css`. Todos foram encontrados. Exemplos:

```text
TopTrumps.css:2:.tt-sound-toggle {
TopTrumps.css:32:.tt-page--menu {
TopTrumps.css:569:.tt-fire-particles {
TopTrumps.css:577:.tt-fire-particle {
TopTrumps.css:1219:.tt-particula {
TopTrumps.css:1490:.tt-confirm-overlay {
TopTrumps.css:1634:.tt-curtain-overlay {
TopTrumps.css:1893:.tt-desistir-overlay {
TopTrumps.css:2336:.tt-game-container {
TopTrumps.css:2355:.tt-game-header {
TopTrumps.css:2477:.tt-result-badge {
TopTrumps.css:2494:.tt-cards-swipe-container {
```

`App.jsx` importa estaticamente tanto `TopTrumps.jsx` quanto `TopTrumpsSP_v2.jsx`. Como `TopTrumps.jsx` importa `./TopTrumps.css`, o CSS monolítico entra no bundle global e estiliza também a rota v2. É uma dependência implícita entre versões.

## Passo 6 — Relatório final

| Arquivo órfão | Data/commit de criação | Foi usado alguma vez? | Equivalente funcional hoje | Hipótese baseada em prova |
|---|---|---|---|---|
| `GameHUD/GameHUD.jsx` | 2026-06-27 19:03, `1601d725` | Sim, em `1601d725`; desconectado por `3ec1aa07` às 19:06 | HUD inline em `GameScreen.jsx:26-33` e `ResultScreen.jsx:28-34` | Protótipo transitório substituído por markup inline durante a implementação do núcleo |
| `SoundToggle/SoundToggle.jsx` | 2026-06-27 19:03, `1601d725` | Sim, em `1601d725`; desconectado por `3ec1aa07` | Não há botão equivalente; apenas lógica não consumida em `useGameEffects.js:12,21-24,74` | Feature visual abandonada acidentalmente durante troca do placeholder pelo jogo real |
| `GameHUD/GameHUD.css` | 2026-06-27 19:03, `1601d725` | Indiretamente: classes usadas hoje; arquivo nunca importado diretamente nos snapshots encontrados | Mesmas regras em `TopTrumps.css:2355-2366` | Cópia modular sem conexão; v2 depende do monólito legacy |
| `SoundToggle/SoundToggle.css` | 2026-06-27 19:03, `1601d725` | Componente foi usado em `1601d725`; CSS não tinha import direto | Mesmas regras em `TopTrumps.css:2-28`, mas nenhum botão ativo | Resíduo de feature visível removida em `3ec1aa07` |
| `BurstParticles/BurstParticles.css` | 2026-06-27 19:03, `1601d725` | Sim, importado explicitamente em `86f3d28b`; desconectado por `82521f5e` | Regras em `TopTrumps.css:1219-1237`; JSX em `ResultScreen.jsx:24-26` | CSS modular válido retransformado em duplicata pelo revert |
| `CurtainReveal/CurtainReveal.css` | 2026-06-27 19:03, `1601d725` | Sim, importado explicitamente em `86f3d28b`; desconectado por `82521f5e` | Regras em `TopTrumps.css:1634-1700`; JSX em `CurtainReveal.jsx:4-7` | CSS modular válido retransformado em duplicata pelo revert |
| `FireParticles/FireParticles.css` | 2026-06-27 19:03, `1601d725` | Sim, importado explicitamente em `86f3d28b`; desconectado por `82521f5e` | Regras em `TopTrumps.css:569-610`; JSX inline em `GameScreen.jsx:19-22` e `ResultScreen.jsx:18-21` | CSS modular válido retransformado em duplicata pelo revert |
| `styles/GameScreen.css` | 2026-06-27 19:22, `4bc6fefa` | Não no commit de criação; importado em `86f3d28b`; desconectado por `82521f5e` | Regras espalhadas em `TopTrumps.css`, sobretudo `2336-2476` e modais `1490-1625`/`1893-1972` | Migração CSS chegou a funcionar e foi revertida junto com uma restauração ampla |
| `styles/MenuScreen.css` | 2026-06-27 19:22, `4bc6fefa` | Não no commit de criação; importado em `86f3d28b`; desconectado por `82521f5e` | Regras em `TopTrumps.css:32-525` e complementos posteriores | Migração CSS chegou a funcionar e foi revertida |
| `styles/ResultScreen.css` | 2026-06-27 19:22, `4bc6fefa` | Não no commit de criação; importado em `86f3d28b`; desconectado por `82521f5e` | Regras em `TopTrumps.css:2477-2551` | Migração CSS chegou a funcionar e foi revertida |

## Diagnóstico, sem decisão de limpeza

Há três categorias diferentes, que não devem ser tratadas como um único lote:

1. **Componentes realmente desconectados:** `GameHUD.jsx` e `SoundToggle.jsx`.
2. **CSS modular desconectado, mas com seletores usados:** os oito CSS investigados.
3. **Dependência arquitetural oculta:** a v2 funciona visualmente porque o CSS da v1 entra globalmente no bundle.

O caso mais provável de regressão funcional é `SoundToggle`: a lógica existe, o componente existe, o histórico prova que esteve conectado e não há equivalente visível atual. Para o HUD, existe equivalente inline comprovado. Para os CSS, o conteúdo não está morto semanticamente; os arquivos são duplicatas desconectadas de regras ainda necessárias e atualmente fornecidas pelo monólito legacy.

Nenhuma recomendação de apagar ou reconectar foi executada nesta investigação.
