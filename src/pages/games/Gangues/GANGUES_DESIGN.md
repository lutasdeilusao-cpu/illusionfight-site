# LDI GANGUES — Estado atual do jogo

> Snapshot de referência para continuar a evolução do jogo. Não é histórico de mudanças —
> reflete como o jogo funciona agora. `GANGUES_VERSION` atual: **1.10.1** (`src/config/version.js`).
> Rota: `/games/ldi-gangues` (a antiga `/games/ldi-arena` redireciona pra cá).

## 1. Visão geral

LDI Gangues é um RPG de combate por turnos, 2D, tema "gangues de rua". O jogador monta uma
gangue de personagens próprios (fichas), escolhe um caminho de combate pra cada um, distribui
pontos de atributo, e enfrenta gangues inimigas em batalhas por turno com dados.

Fluxo de telas (controlado por `GanguesRoute.jsx`, estado local `fase`):

```
lobby → create (path → attributes) → combat → victory (relatório) → volta pro lobby
```

- **Lobby** (`GanguesLobby.jsx`): onboarding dos 2 primeiros personagens, seleção de gangue,
  escolha de oponente.
- **Create** (`GanguesCreate.jsx`): 2 passos — escolher caminho, depois distribuir 5 pontos.
- **Combat** (`GanguesCombat.jsx`): tela de batalha (chat + seleção de atacante/alvo).
- **Victory** (`GanguesVictory.jsx`): relatório completo pós-batalha (não é só pra vitória,
  atende os dois desfechos — o nome ficou assim por herança do código antigo).

## 2. Criação de personagem

Cada ficha (`sheet`) tem: nome, `combat_path`, `attributes: {A, H, R, D}`, `xp_total`,
`enemies_unlocked`. Regras (`data/ganguesLoadout.js`):

- **5 pontos** pra distribuir (`GANGUES_CREATION_POINTS`), máximo **5 por atributo**
  (`GANGUES_ATTRIBUTE_MAX`).
- É obrigatório gastar os 5 pontos e ter **pelo menos 1 em Resistência** (`GanguesCreate.save()`),
  senão a ficha nasceria com 0 PV.
- O caminho **não** distribui pontos automaticamente — o jogador aloca tudo manualmente.
- Atributos e o que fazem:
  - **A — Ataque**: força dos ataques físicos, soma direto no cálculo de dano.
  - **H — Habilidade**: iniciativa (turno) e metade dela (`floor(H/2)`) vira bônus de ataque.
  - **R — Resistência**: define PV e PM máximos (ver taxas por caminho abaixo).
  - **D — Defesa**: reduz o dano recebido.
- **Recursos por caminho** (`GANGUES_RESOURCE_RATES`, PV/PM = R × taxa):
  | Caminho | PV por R | PM por R |
  |---|---|---|
  | Atacante | 3 | 3 |
  | Defensor | 4 | 2 |
  | Místico | 2 | 4 |

Os 2 primeiros personagens da gangue são obrigados a ter **caminhos diferentes**
(`blockedPaths` em `GanguesRoute.jsx`, calculado a partir dos já criados/roster).

## 3. Bônus de caminho (ativos em todo ataque/defesa)

Definidos em `engine/ganguesCombatResolver.js`:

- **Atacante**: **+1 no ataque**, por sorte (~50%, moeda). Mostrado no log como ativado ou não.
- **Defensor**: **+1 na defesa**, por sorte (~50%), mesma lógica do lado defensivo.
- **Místico**: **+1 no ataque garantido** sempre que ataca (todo ataque dele é "mágico" nesse
  sistema — não existe escolha física/mágica separada). Na defesa, só ganha **+1 garantido**
  quando quem ataca também é místico (mágica vs. mágica); contra ataque físico não recebe nada.

Isso vale igual pra IA e pra fichas do jogador — mesma função resolve os dois lados.

## 4. Sistema de combate

### Dados e dano (`engine/ganguesCombatResolver.js`)
- Ataque e defesa rolam **d3** cada um (1 a 3) — não é mais d6. Antes só o ataque rolava dado;
  agora os dois lados rolam, o que deixou o combate menos dependente de sorte bruta.
- **Crítico**: tirar o valor máximo do d3 (3) no ataque soma **+2** na rolagem (um 3 crítico
  vale 5 no cálculo de FA). Só o ataque critica, a defesa não.
- Fórmula:
  ```
  FA = Ataque + floor(Habilidade/2) + (rolagem d3 [+2 se crítico]) + bônus de caminho (ataque)
  FD = Defesa + rolagem d3 + bônus de caminho (defesa)
  DANO = max(1, FA − FD)   // dano mínimo garantido de 1, nunca anula o golpe totalmente
  ```

### Turnos e iniciativa (`hooks/useGanguesTurnMachine.js`)
- Iniciativa por personagem: `Habilidade + d3`, maior age primeiro (empate resolvido por
  Habilidade, depois aleatório). A ordem é sorteada **uma vez** no início da partida e depois
  seguida em loop (pulando quem já morreu), avançando de rodada quando volta ao topo da lista.
- O jogador **escolhe o alvo** de cada ataque (não escolhe mais o atacante — quem age é sempre
  quem a iniciativa determinou naquele turno; isso é diferente do sistema de "fase do time"
  que existiu brevemente durante o desenvolvimento e foi substituído por este modelo de
  iniciativa individual).
- **IA inimiga**: ataca ~2.2s após o turno dela começar (`enemyDelay`). Escolha de alvo
  (`pickEnemyTarget`): se só há 1 alvo vivo, ataca ele; se há mais de um, **evita repetir o
  último alvo** quando possível — 55% de chance foca em quem tem menos PV entre os outros
  vivos, 45% escolhe aleatoriamente entre os outros vivos. Isso faz a IA revezar ataques em
  vez de martelar sempre o mesmo personagem.
- Dano mínimo de 1 por golpe evita combates arrastados; o objetivo de design é fechar uma
  batalha em ~4–8 rodadas.

### Identidade visual por caminho (tela de combate)
Cada card de personagem no combate mostra cor de borda + ícone + label do caminho:
- **Atacante**: vermelho, ⚔️
- **Defensor**: azul, 🛡️
- **Místico**: roxo, ✨

(CSS em `Gangues.css`, classes `.gang-path--atacante/--defensor/--mistico`.)

## 5. Tamanho da gangue (progressão)

- Começa fixo em **2** membros (`GANGUES_INITIAL_PARTY_SIZE`).
- Destrava mais vagas conforme XP total somado do roster (`getGanguesPartySizeLimit`,
  `GANGUES_PARTY_SIZE_THRESHOLDS`):
  | Tamanho | XP acumulado no roster |
  |---|---|
  | 2 | 0 |
  | 3 | 50 |
  | 4 | 150 |
  | 5 (teto) | 300 |
- A gangue inimiga é montada com o **mesmo tamanho** da gangue do jogador, sorteada do pool de
  inimigos desbloqueados (repete o mesmo inimigo se só houver 1 desbloqueado).
- Limite de **fichas no roster** (independente do tamanho de gangue em batalha) é por tier de
  assinatura: `free: 3, elite: 5, primordial: 7` (`GANGUES_ROSTER_LIMITS`).

## 6. Inimigos e progressão de desbloqueio

`data/gangues-enemies.json`, ordem de desbloqueio (`ENEMY_ORDER` em `useGanguesStore.js`,
avança ao vencer o inimigo atual):

| Ordem | id | Nome | A/H/R/D | PV | PM | Modo |
|---|---|---|---|---|---|---|
| 1 | treinamento | Bot de Treinamento | 1/0/2/0 | 6 | 6 | fists → atacante |
| 2 | kaeda | Kaeda | 3/3/3/2 | 15 | 10 | armed → defensor |
| 3 | thunderbolt | Thunderbolt | 4/4/3/2 | 20 | 15 | power → místico |
| 4 | stormbyte | StormByte_91 | 3/5/4/3 | 25 | 20 | power → místico |
| 5 | viran | Mestre Viran | 5/5/5/5 | 30 | 25 | fists → atacante |
| 6 | campeao | O Campeão | 6/5/6/4 | 35 | 20 | fists → atacante |
| 7 | kronos | Kronos | 7/7/8/6 | 50 | 40 | power → místico |
| 8 | primordial_jack | Jack Primordial | 8/6/10/5 | 60 | 50 | power → místico |

`preferred_mode` do inimigo mapeia pra `combat_path`: `fists→atacante`, `armed→defensor`,
`power→mistico` (`prepare()` em `useGanguesTurnMachine.js`).

Cada inimigo carrega `trash_talk` com falas por categoria (`attack_miss`, `attack_hit`,
`take_damage`, `take_critical`, `player_near_death`, `enemy_near_death`, `defeat`) — hoje só em
português, é o fallback usado quando a chave i18n `trash_talk_npc.<id>` não existe (ela não
existe pra nenhum inimigo atual — foi escrita pra NPCs de outra leva de conteúdo, ver seção 10).

## 7. Progressão pós-criação (AP, XP e especializações)

Sistema separado da criação inicial (seção 2) — evolui a ficha **depois** que ela já existe,
com XP ganho em batalha. Regras e funções em `data/ganguesLoadout.js`, estado em
`sheet.attributes.progression` (também salvo dentro de `attributes` no Supabase, não é coluna
própria). Painel visual em `GanguesLobby.jsx` (seção `.gang-progression` do CSS), mostrado pro
`party[0]` (primeiro personagem da gangue ativa) sempre que o roster já tem 2+ fichas.

- **AP → XP**: toda batalha concede AP ao primeiro personagem da gangue ativa —
  **10 AP** na vitória, **1 AP** na derrota (`GanguesVictory.jsx`). A cada **10 AP**
  (`GANGUES_AP_PER_XP`), vira **1 XP disponível** pra gastar (`addGanguesAp`). O resto fica
  guardado como AP parcial (mostrado como barrinha `AP: n/10`).
- **Atributos avançados**: dá pra continuar subindo A/H/R/D **além** do que foi gasto na
  criação, mas só a partir do valor **5** pra cima — custos crescentes por XP
  (`GANGUES_ATTRIBUTE_XP_COSTS`): 5→6 custa 3, 6→7 custa 5, 7→8 custa 7, 8→9 custa 9, 9→10
  custa 12. Como a criação limita a 5 pontos totais entre 4 atributos e exige R≥1, hoje **não
  dá pra chegar a um atributo em 5 só na criação** — esse caminho de evolução só destrava se
  o jogador puser tudo num atributo só nas fichas que já existem via outro meio, ou é um ponto
  a revisar (ver seção 13).
- **Especializações do Atacante**: só existe pro caminho **atacante** por enquanto
  (`GANGUES_ATTACKER_SPECIALS`) — 5 habilidades: Soco de Ferro, Investida, Marreta e Fim de
  Linha (ativas), Peso Bruto (passiva). Cada uma tem **3 níveis**, custando XP crescente por
  nível (`GANGUES_SPECIAL_COSTS`: nível 0→1 custa 1, 1→2 custa 2, 2→3 custa 3). Só dá pra
  **equipar 2 especializações por vez** (`selected_specials`, máximo 2) — subir de nível não
  exige estar equipada, mas só faz efeito em combate se estiver. **Nenhuma dessas
  especializações tem efeito em batalha ainda** — o sistema de pontos/equipar está pronto, mas
  `ganguesCombatResolver.js` não lê `selected_specials` em lugar nenhum (ver seção 13).
- Defensor e Místico não têm árvore de especialização própria ainda — só atributos avançados.

## 9. Chat de batalha e trash talk

Tela de combate renderiza um log estilo chat (bolhas), com:
- Card de ataque por golpe: FA, FD, dado de ataque/defesa, bônus de caminho (ativado ou não),
  crítico (se houver), dano final, onomatopeia aleatória (POW!/WHAM!/CRACK!/SLASH!/BOOM!/THWACK!).
- Trash talk automático do lado que foi atingido ou atacou, puxado do inimigo envolvido
  (~60% de chance por evento).
- Jogador pode mandar trash talk próprio a qualquer momento na fase dele (3 frases sorteadas
  de `games.gangues.trash_talk_player`, refeitas a cada rodada).

## 10. NeoGuide — diálogo e tutoriais guiados

NeoGuide é a mascote/guia oficial do universo LDI (já existia em outros jogos do site,
cor de identidade `#00B4D8`). Dois assets: `assets/neoguide-frontal.png` (corpo, cortado pra
mostrar da cintura pra cima no diálogo) e `assets/neoguide-perfil.png` (perfil, usado nas dicas
laterais — espelhado via CSS conforme o lado pra sempre olhar em direção ao texto).

- **`components/NeoGuideDialog.jsx`**: diálogo full-screen vertical (retrato + caixa de texto
  com efeito de máquina de escrever), usado como intro ao entrar pela primeira vez no lobby
  (`localStorage: ldi-gangues-neoguide-seen`).
- **`components/NeoGuideTip.jsx`**: dica lateral compacta (retrato de perfil + balão), usada
  em tutoriais guiados que destacam um elemento da tela com glow pulsante enquanto ela explica:
  - Tutorial de **caminhos** (`ldi-gangues-tutorial-paths-seen`), na tela de escolha de caminho.
  - Tutorial de **atributos** (`ldi-gangues-tutorial-attrs-seen`), na tela de distribuição de
    pontos.
- Ambos os tutoriais e a intro só aparecem uma vez (flags em `localStorage`), com botão de
  pular sempre disponível. Pra testar de novo:
  ```js
  Object.keys(localStorage).filter(k => k.startsWith('ldi-gangues')).forEach(k => localStorage.removeItem(k))
  ```

## 11. i18n

Todo o texto do jogo vive em `games.gangues.*`, mas **não** está mais dentro de
`src/i18n/{pt,en,es}.json` (o "geral" do site) — foi extraído pra arquivos dedicados
`src/i18n/gangues-{pt,en,es}.json` e é **carregado sob demanda**: o hook
`hooks/useGanguesI18n.js` faz um `import()` dinâmico do arquivo do idioma atual quando
`GanguesRoute` monta, e registra os dados no `LanguageProvider` via `registerLocaleData()`
(mecanismo novo, adicionado só pra isso). O Vite gera um chunk JS separado por idioma — só
baixa quem entra no jogo, não pesa no bundle geral do site.

Ponto de atenção: `games.gangues.trash_talk_npc` tem falas de personalidade escritas pra NPCs
com ids tipo `npc_arrogante_marelia`, `npc_nordico_karnazar` — nomes que batem com facções do
lore do site (Marelia, Karnazar, etc.) mas **não existe nenhum inimigo atual com esses ids**
(`data/gangues-enemies.json` usa `treinamento`, `kaeda`, etc.). Essa chave nunca é encontrada em
tempo de execução — hoje é conteúdo morto/adiantado, não uma ficha real. Fica registrado aqui
pra não confundir quem for mexer depois: ou usa esse conteúdo pra inimigos futuros, ou remove.

## 12. Persistência

- Usuário logado: ficha salva em Supabase, tabela `character_sheets` (`saveToCloud`/`loadSheets`
  em `store/useGanguesStore.js`). Tem fallback de compatibilidade pra schema antigo
  (`combat_style` em vez de `combat_path`) até a migration 025 rodar em produção.
- Guest (sem conta): ficha fica só em memória (`addLocalSheet`), banner avisa que não salva.
- Progresso de "gangue" (`activeParty`, tamanho liberado) depende do XP salvo nas fichas —
  se joga sem conta, some ao recarregar a página.

## 13. Estrutura de arquivos

```
src/pages/games/Gangues/
├── GanguesRoute.jsx          # shell, troca de fase, carrega i18n dedicado
├── GanguesLobby.jsx          # onboarding, seleção de gangue e oponente
├── GanguesCreate.jsx         # criação: caminho → atributos (+ tutoriais NeoGuide)
├── GanguesCombat.jsx         # tela de batalha (chat, roster, ataque)
├── GanguesVictory.jsx        # relatório pós-batalha (vitória e derrota)
├── Gangues.css               # todo o CSS do módulo
├── assets/                   # neoguide-frontal.png, neoguide-perfil.png
├── components/
│   ├── DramaticDice.jsx/css  # dado cinematográfico (genérico, sides configurável)
│   ├── NeoGuideDialog.jsx    # diálogo full-screen (intro)
│   └── NeoGuideTip.jsx       # dica lateral (tutoriais guiados)
├── data/
│   ├── ganguesLoadout.js     # regras de pontos/atributos/recursos/tamanho de gangue
│   └── gangues-enemies.json  # roster de inimigos
├── engine/
│   └── ganguesCombatResolver.js  # dado, crítico, bônus de caminho, dano
├── hooks/
│   ├── useGanguesTurnMachine.js  # turno, iniciativa, IA
│   └── useGanguesI18n.js         # carrega tradução dedicada sob demanda
└── store/
    └── useGanguesStore.js    # zustand: ficha, roster, partida, Supabase
```

## 14. Pontos em aberto / ideias pra continuar

- `trash_talk_npc` no i18n tem conteúdo de facções (Marelia, Karnazar, Azuma, Bravara, SDR,
  Xakaxi) que não corresponde a nenhum inimigo do roster atual — dá pra criar novos inimigos
  usando essas personalidades já escritas, ou aposentar o conteúdo.
- Trash talk dos inimigos (`enemy.trash_talk` no JSON) só existe em português — se for
  traduzir, teria que criar uma versão localizada por idioma (hoje o fallback de
  `trash_talk_npc` que resolveria isso não bate com os ids reais, ver seção 9).
- Identidade visual por caminho hoje só está na tela de combate — poderia estender pros cards
  de personagem no lobby e na criação, pra ficar consistente em toda a jornada.
- Sem sistema de habilidades/poderes especiais além do bônus passivo do caminho — é só ataque
  básico. Se quiser variedade tática, dá pra pensar em golpes especiais que gastam PM.
- Multiplayer real (PvP) não existe — todo combate é contra IA.
