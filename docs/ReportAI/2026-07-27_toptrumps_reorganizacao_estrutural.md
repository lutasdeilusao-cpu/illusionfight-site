# Reorganização estrutural TopTrumps

Data: 2026-07-27

## Checkpoint

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
stash@{0}: On main: checkpoint-pre-mapeamento-toptrumps-images-2026-07-27
stash@{1}: On main: checkpoint-pre-mapeamento-toptrumps-2026-07-27
HEAD: 375d748d988b59992aec6855d45b51773079cd1c
```

## Resultado

- Os 33 arquivos da matriz aprovada foram movimentados com `git mv`.
- O diretório versionado `v2/` foi eliminado.
- `hooks/useTopTrumpsDeck.js` da antiga raiz foi renomeado para `hooks/deckPersistence.js`.
- O hook React que estava em `v2/hooks/useTopTrumpsDeck.js` agora é o único `hooks/useTopTrumpsDeck.js`.
- CSS de tela foi colocado junto de seu componente.
- `styles/tokens.css` permaneceu centralizado por ser compartilhado.
- Nenhuma lógica de `TopTrumpsLobby.jsx` ou `TopTrumpsMP.jsx` foi alterada.
- `GameHUD` e `SoundToggle` foram apenas movidos e continuam órfãos.

## Árvore final completa

```text
src/pages/games/TopTrumps/components/BurstParticles/BurstParticles.css
src/pages/games/TopTrumps/components/BurstParticles/BurstParticles.jsx
src/pages/games/TopTrumps/components/CardViewerModal/CardViewerModal.css
src/pages/games/TopTrumps/components/CardViewerModal/CardViewerModal.jsx
src/pages/games/TopTrumps/components/CurtainReveal/CurtainReveal.css
src/pages/games/TopTrumps/components/CurtainReveal/CurtainReveal.jsx
src/pages/games/TopTrumps/components/DeckBuilder/DeckBuilder.css
src/pages/games/TopTrumps/components/DeckBuilder/DeckBuilder.jsx
src/pages/games/TopTrumps/components/DeckStartModal/DeckStartModal.css
src/pages/games/TopTrumps/components/DeckStartModal/DeckStartModal.jsx
src/pages/games/TopTrumps/components/FireParticles/FireParticles.css
src/pages/games/TopTrumps/components/FireParticles/FireParticles.jsx
src/pages/games/TopTrumps/components/GameHUD/GameHUD.css
src/pages/games/TopTrumps/components/GameHUD/GameHUD.jsx
src/pages/games/TopTrumps/components/GameOverScreen/GameOverScreen.jsx
src/pages/games/TopTrumps/components/GameScreen/GameScreen.css
src/pages/games/TopTrumps/components/GameScreen/GameScreen.jsx
src/pages/games/TopTrumps/components/MenuScreen/MenuScreen.css
src/pages/games/TopTrumps/components/MenuScreen/MenuScreen.jsx
src/pages/games/TopTrumps/components/ResultScreen/ResultScreen.css
src/pages/games/TopTrumps/components/ResultScreen/ResultScreen.jsx
src/pages/games/TopTrumps/components/RewardScreen/RewardScreen.css
src/pages/games/TopTrumps/components/RewardScreen/RewardScreen.jsx
src/pages/games/TopTrumps/components/SoundToggle/SoundToggle.css
src/pages/games/TopTrumps/components/SoundToggle/SoundToggle.jsx
src/pages/games/TopTrumps/hooks/deckPersistence.js
src/pages/games/TopTrumps/hooks/useGameEffects.js
src/pages/games/TopTrumps/hooks/useTopTrumpsDeck.js
src/pages/games/TopTrumps/hooks/useTopTrumpsRewards.js
src/pages/games/TopTrumps/hooks/useTopTrumpsSP.js
src/pages/games/TopTrumps/styles/tokens.css
src/pages/games/TopTrumps/TopTrumpsLobby.css
src/pages/games/TopTrumps/TopTrumpsLobby.jsx
src/pages/games/TopTrumps/TopTrumpsMP.css
src/pages/games/TopTrumps/TopTrumpsMP.jsx
src/pages/games/TopTrumps/TopTrumpsRewardTest.jsx
src/pages/games/TopTrumps/TopTrumpsSP.jsx
src/pages/games/TopTrumps/utils/attrNomeKey.js
```

Total final: 38 arquivos. Não existe arquivo sob `TopTrumps/v2/`.

## Auditoria das 49 diretivas

O diff contém 48 diretivas de uma linha alteradas e uma diretiva multilinha em
`useTopTrumpsRewards.js`, totalizando as 49 previstas.

| Grupo | Quantidade | Correções confirmadas |
|---|---:|---|
| `src/App.jsx` | 2 | Entradas SP e RewardTest sem `v2/`; símbolos renomeados |
| `TopTrumpsRewardTest.jsx` | 5 | Language, deck, utilitário, SFX e imagens |
| `TopTrumpsSP.jsx` | 11 | Contextos, hooks externos, deck, Jokempo, utilitário e imagens |
| `CardViewerModal.jsx` | 3 | Language, SFX e imagens após novo nível de pasta |
| `DeckBuilder.jsx` | 5 | Language, SFX, `deckPersistence`, card e imagens |
| `DeckStartModal.jsx` | 4 | Language, SFX, `deckPersistence` e imagens |
| `GameOverScreen.jsx` | 1 | `BackToGamesBtn` |
| `GameScreen.jsx/.css` | 3 | CSS local, `TopTrumpsCard` e tokens |
| `MenuScreen.jsx/.css` | 6 | CSS local, botão externo, três componentes irmãos e tokens |
| `ResultScreen.jsx/.css` | 3 | CSS local, `TopTrumpsCard` e tokens |
| `RewardScreen.jsx` | 1 | `TopTrumpsCard` |
| Hooks SP | 3 | SFX, leaderboard e import multilinha de rewards |
| `PerfilColecao.jsx` | 2 | `DeckBuilder/DeckBuilder` e `CardViewerModal/CardViewerModal` |
| **Total** | **49** | **Auditadas** |

Imports locais cujo texto continuou válido após mover origem e destino juntos
(`./BurstParticles.css`, imports entre partículas e outros CSS co-localizados)
também foram conferidos.

## Buscas de resíduos

### `/v2/`

```text
src/App.jsx:101:
  <Route path="/games/toptrumps/v2/reward-test" ... />
```

Esse único resultado é uma URL pública preservada, não caminho de arquivo/import.
Não existe import contendo `TopTrumps/v2`.

### Símbolos antigos

```text
> rg "TopTrumpsSP_v2" src
[sem saída]
```

O grep combinado proposto também encontra:

```text
src/pages/games/TopTrumps/TopTrumpsSP.jsx:10:
import { useTopTrumpsDeck } from './hooks/useTopTrumpsDeck'
```

Esse resultado é correto e obrigatório: é o hook React oficial. O arquivo de
persistência que causava a colisão passou a `deckPersistence.js`; nenhuma referência
antiga dele permanece.

## Contratos externos — busca complementar

Arquivos encontrados e conferidos manualmente:

```text
src/App.jsx
  32: import TopTrumpsSP from './pages/games/TopTrumps/TopTrumpsSP'
  33: import TopTrumpsRewardTest from './pages/games/TopTrumps/TopTrumpsRewardTest'
  34: import TopTrumpsLobby from './pages/games/TopTrumps/TopTrumpsLobby'
  35: import TopTrumpsMP from './pages/games/TopTrumps/TopTrumpsMP'

src/pages/platform/Perfil/abas/PerfilColecao.jsx
  5: import DeckBuilder from '../../../games/TopTrumps/components/DeckBuilder/DeckBuilder'
  6: import CardViewerModal from '../../../games/TopTrumps/components/CardViewerModal/CardViewerModal'
```

Não foi encontrado segundo consumidor oculto.

## Build

```text
vite v8.0.16 building client environment for production...
transforming... ✓ 1360 modules transformed.
rendering chunks...
computing gzip size...
✓ built in 2.54s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo).
```

O build terminou com código 0. Sourcemaps permaneceram ativos. Os avisos existentes
são os mesmos de chunk acima de 500 kB e imports simultaneamente estáticos/dinâmicos
dos JSONs TopTrumps; não houve erro de resolução de módulo.

## Chromium headless

Ambiente: `http://127.0.0.1:5174`, viewport 430 × 932.

| Superfície | Resultado |
|---|---|
| `/games/toptrumps` | Menu, escolha de deck aleatório, Jokenpô, gameplay, 5 resultados de rodada e relatório final visíveis |
| Recompensa | Rota dedicada carregada; carta selecionável e botão confirmar habilitado |
| `/games/toptrumps/lobby` | Lobby carregado e controles iniciais visíveis |
| `/games/toptrumps/multiplayer` | Rota carregada e estado “CARREGANDO PARTIDA...” visível |
| `/perfil?aba=colecao` | Redirecionou para `/login`, comportamento esperado sem sessão |
| Console | Zero `console.error` |
| Runtime | Zero `pageerror` |

Limitação explícita: o Chromium isolado não possuía uma sessão Supabase. Portanto,
não foi possível abrir DeckBuilder e CardViewerModal **a partir da aba autenticada**
do Perfil. Os dois imports de `PerfilColecao` foram, contudo, resolvidos pelo build
de produção e o redirecionamento de autenticação foi validado. Não foi criada uma
sessão falsa nem alterado o gate para mascarar essa limitação.

## Versões e documentação

| Item | Antes | Depois |
|---|---:|---:|
| `SITE_VERSION` | 10.192.35 | **10.192.36** |
| `TS_VERSION` | 5.44.12 | **5.44.13** |
| `SITE_MAP.md` | Estrutura resumida antiga | Estrutura pós-v1 consolidada |

## Pendência deliberada

`components/GameHUD/` e `components/SoundToggle/` continuam sem consumidor. Eles
foram movidos para a convenção nova, sem reconexão, remoção ou alteração funcional.
A decisão fica para uma tarefa futura.
