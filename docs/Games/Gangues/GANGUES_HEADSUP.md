# LDI Gangues — Headsup (retomando do zero)

> Documento de orientação, escrito em 2026-08-18, pra você recuperar o contexto do jogo como se
> nunca tivesse visto o código. Não substitui o `GANGUES_DESIGN.md` (referência técnica completa,
> em `src/pages/games/Gangues/GANGUES_DESIGN.md`) — este aqui é o resumo pra você situar e saber
> **o que já testou vs. o que ainda não testou**, pra decidirmos o próximo passo juntos.
>
> **Atualizado 2x no mesmo dia**: (1) você apontou que o Atacante estava errado por não ter
> subcaminhos como Defensor e Místico — corrigido na v1.13.0. (2) Você pediu números padrão pra
> poder testar/balancear a skill tree, e confirmação de que a progressão vai pro Supabase — os
> 75 poderes agora têm efeito real em combate (v1.14.0) e a persistência já era via Supabase
> (não localStorage), ver seções 7 e 11.

**Versão atual:** `GANGUES_VERSION = 1.14.0` (`src/config/version.js`), site geral em `10.198.15`.
**Rota:** `/games/ldi-gangues` (a antiga `/games/ldi-arena` só redireciona pra cá).

---

## 1. O que é o jogo, em uma frase

RPG de combate por turnos 2D, tema "gangue de rua". Você cria fichas (personagens), monta uma
gangue, escolhe um caminho de combate pra cada um, distribui atributos, e batalha contra gangues
de IA em turnos com dados.

Fluxo de telas: **lobby → create (caminho → atributos) → combat → victory (relatório) → volta pro lobby.**

## 2. Criação de personagem — o que já existe

Cada ficha tem nome, `combat_path` (caminho), atributos `{A, H, R, D}`, XP total, inimigos
desbloqueados.

- Você distribui **5 pontos** entre 4 atributos, máximo 5 por atributo, e é **obrigatório** ter
  pelo menos 1 em Resistência (senão a ficha nasceria com 0 de vida).
- **A (Ataque)** soma direto no dano. **H (Habilidade)** define quem age primeiro no turno e dá
  metade dela (arredondado pra baixo) como bônus de ataque. **R (Resistência)** define vida e mana
  máximas. **D (Defesa)** reduz o dano recebido.
- PV/PM = Resistência × uma taxa que muda por caminho:

  | Caminho | PV por R | PM por R |
  |---|---|---|
  | Atacante | 3 | 3 |
  | Defensor | 4 | 2 |
  | Místico | 2 | 4 |

- Os 2 primeiros personagens da gangue são obrigados a ter caminhos diferentes entre si.

## 3. Os 3 caminhos e o bônus passivo de cada um

- **Atacante** ⚔️ (vermelho): +1 no ataque, ~50% de chance (sorte de moeda) por golpe.
- **Defensor** 🛡️ (azul): +1 na defesa, mesma lógica de ~50% de chance.
- **Místico** ✨ (roxo): +1 garantido no ataque sempre (todo ataque dele é "mágico" no sistema
  atual — não existe escolha física/mágica separada). Na defesa só ganha +1 garantido se quem tá
  atacando também for místico; contra ataque físico não ganha nada.

## 4. Combate — como funciona hoje

- Ataque e defesa rolam **d3** cada (1 a 3), não é mais d6.
- **Crítico**: tirar 3 no dado de ataque soma +2 na rolagem (vira 5 no cálculo). Só o ataque
  critica, a defesa não.
- Fórmula base: `FA = Ataque + floor(Habilidade/2) + d3[+2 se crítico] + bônus de caminho +
  bônus de especial` · `FD = Defesa efetiva + d3 + bônus de caminho + bônus de especial` ·
  `Dano = max(1, FA − FD)`, depois reduzido por escudo se o defensor tiver um ativo (ver seção 7).
- **Iniciativa**: `Habilidade + d3` por personagem, sorteada uma vez no início da partida, maior
  age primeiro, segue em loop pulando quem já morreu.
- Você **escolhe o alvo** do ataque, mas não escolhe quem age — quem age é sempre definido pela
  ordem de iniciativa.
- **IA inimiga**: ataca ~2.2s depois que o turno dela começa. Evita repetir o último alvo quando
  dá: 55% de chance mira em quem tem menos vida, 45% escolhe aleatório entre os vivos.
- Design pensado pra batalhas de ~4 a 8 rodadas.

## 5. Tamanho da gangue e inimigos

- Começa com **2** membros. Libera mais vaga por XP total acumulado no roster: 3 (50 XP), 4 (150
  XP), 5 = teto (300 XP).
- A gangue inimiga sempre tem o mesmo tamanho que a sua, sorteada dos inimigos já desbloqueados.
- Limite de fichas no roster (independente do tamanho de gangue em batalha) por tier de
  assinatura: free 3, elite 5, primordial 7.
- **8 inimigos** em ordem fixa de desbloqueio, do Bot de Treinamento (o mais fraco) até o Jack
  Primordial (o mais forte) — lista completa e status de cada um em `GANGUES_DESIGN.md`, seção 6.

## 6. Progressão pós-criação (AP → XP)

Sistema separado da criação: depois que a ficha já existe, ela evolui com XP ganho em batalha.

- Toda batalha dá AP ao primeiro personagem da gangue ativa: **10 AP na vitória, 1 AP na
  derrota**. A cada 10 AP acumulados vira **1 XP disponível** pra gastar.
- Com XP, dá pra continuar subindo atributos **além** do que foi gasto na criação (só a partir do
  valor 5 pra cima, custo crescente). *Observação do design doc*: como a criação limita a 5
  pontos totais, hoje não dá pra chegar num atributo em 5 só criando a ficha — esse caminho de
  evolução de atributo avançado só destrava por outro meio (ex.: Zona de Treinamento). É um ponto
  em aberto pra revisar.

## 7. Árvore de especializações (skill tree) — **agora tem efeito real em combate, ⚠️ com números só de partida**

- **75 poderes catalogados**, em **15 sub-caminhos** (5 por caminho, 5 poderes cada): Atacante
  escolhe entre Bruto, Duelista, Fúria, Especialista e Vingador. Defensor entre Muralha,
  Guardião, Provocador, Reativo e Resiliente. Místico entre Ígneo, Aquático, Terreno, Tempestade
  e Ilusório. Cada poder tem 3 níveis (custo XP 1→2→3), e só dá pra **equipar 2 por vez**
  (`selected_specials`).
- **O que mudou agora (v1.14.0)**: todo poder equipado com nível > 0 já faz algo mensurável em
  batalha, implementado em `engine/ganguesSpecialEffects.js`. Passivos aplicam sozinhos; pra
  ativas, apareceu uma fileira de botões (chips) acima do "ATACAR" na tela de combate — você
  escolhe qual ativa equipada usar naquele golpe (ou "ataque normal"), o botão mostra o custo em
  PM ou % de PV e fica desabilitado se não der pra pagar.
- **Atacante (25 poderes) segue o design que você escreveu**, com algumas simplificações pra
  caber no motor de turno atual (que só suporta 1 ação por turno, sem fila de status/duração):
  Marca, Fratura de Ilusão e Ponto de Pressão viraram bônus de dano imediato em vez de efeito
  com duração; Investida e Fôlego Final perderam a parte de furar a ordem de turno/ganhar ação
  extra. O efeito líquido (mais dano, ignora defesa, etc.) foi mantido — o "como" foi
  simplificado. Detalhe de cada mapeamento em
  `docs/Games/Gangues/GANGUES_PROGRESSAO_RASCUNHO.md`.
- **Defensor e Místico (50 poderes) ainda não têm design próprio** — nunca tiveram (só existiam
  nomes desde antes). Pra não ficarem inertes, usam um template genérico: passivo dá bônus fixo
  de atributo (+1/+2/+3 por nível), ativo custa PM por dano ou redução de dano fixos. Isso
  significa que hoje, mecanicamente, todos os 5 poderes de qualquer sub-caminho do Místico "fazem
  a mesma coisa" com nomes diferentes (o mesmo vale pro Defensor) — é só placeholder até
  ganharem uma passada de design como o Atacante teve.
- **Isso são números de partida, não balanceamento final.** Escolhi valores plausíveis (ex.:
  Soco de Ferro nível 1 = +3 de dano por 2 PM) sem simular partidas — é justamente o que você
  pediu pra poder jogar e sentir o que está forte/fraco demais.
- **Onde testar**: o painel de progressão (equipar/subir poder) continua no lobby e na Zona de
  Treinamento. Pra sentir o efeito em batalha, equipe uma ativa do Atacante (ex.: Soco de Ferro
  do Bruto) e entre num combate — o botão dela vai aparecer ao lado de ATACAR.

## 8. Chat de batalha e trash talk (testado)

A tela de combate mostra um log estilo chat: card por golpe (FA, FD, dados, bônus de caminho,
crítico, dano, onomatopeia tipo POW!/WHAM!), trash talk automático do inimigo (~60% de chance por
evento), e você pode mandar trash talk seu (3 frases sorteadas, renovadas a cada rodada).

## 9. NeoGuide (mascote/guia) e Zona de Treinamento

- **NeoGuide**: diálogo full-screen na primeira vez que entra no lobby, mais dicas laterais
  guiadas na escolha de caminho e na distribuição de atributos. Cada tutorial só aparece uma vez
  (flag no `localStorage`). Pra ver de novo, tem um snippet de console documentado na seção 10 do
  `GANGUES_DESIGN.md`.
- **Zona de Treinamento administrativa**: botão só visível se `FichasContext.isAdmin` confirmar
  que você é admin. Deixa escolher uma ficha e dar XP livre pra testar progressão, sem mexer em
  atributos/poderes diretamente — usa as mesmas funções oficiais que o fluxo normal do jogador
  (`upgradeGanguesAttribute`, `upgradeGanguesSpecial`), então serve como ambiente de teste real.
- **Zona de Treinamento pública**: rota `/games/ldi-gangues/treinamento`, abre direto sem login
  nem permissão — cria um personagem só em memória quando não há elenco carregado, nada é salvo
  no Supabase. Foi a mudança da v1.12.0, unificando esse fluxo de teste com a progressão normal.

## 10. Onde o texto do jogo mora (i18n)

Todo texto vive em `games.gangues.*`, mas **não** está mais junto do i18n geral do site
(`src/i18n/{pt,en,es}.json`) — foi extraído pra `src/i18n/gangues-{pt,en,es}.json`, carregado sob
demanda só quando entra no jogo (chunk JS separado por idioma).

**Conteúdo morto conhecido**: `games.gangues.trash_talk_npc` tem falas de personalidade escritas
pra NPCs com nomes de facções do lore do site (Marelia, Karnazar, etc.), mas nenhum inimigo atual
usa esses ids — é conteúdo adiantado pra inimigos futuros, nunca é lido em runtime hoje.

## 11. Persistência — confirmando o que você perguntou

**Sim, já vai pro Supabase, não pro localStorage.** Conferi o código linha a linha:

- Usuário logado: ficha inteira (incluindo `attributes.progression` — AP, XP, atributos,
  especiais equipados) salva na tabela `character_sheets`, coluna `attributes` (JSONB), via
  `store.saveToCloud()` em `store/useGanguesStore.js`.
- `applyProgression` em `GanguesLobby.jsx` (o handler chamado toda vez que você sobe atributo,
  sobe poder, equipa/desequipa especial, ou troca de subcaminho) chama `store.saveToCloud(user.id)`
  **imediatamente**, a cada ação, quando você está logado.
- Só cai pra memória (sem salvar) se você for **guest** (sem conta) — mesma regra que já valia
  pro resto da ficha, com banner avisando na tela.
- O único uso de `localStorage` em todo o módulo são as flags "já vi esse tutorial" da NeoGuide
  (seção 9) — nenhum dado de jogo (XP, atributo, poder) passa perto do localStorage.

## 12. Estrutura de arquivos (visão rápida)

```
src/pages/games/Gangues/
├── GanguesRoute.jsx           # shell, troca de fase, carrega i18n
├── GanguesLobby.jsx           # onboarding, seleção de gangue/oponente
├── GanguesCreate.jsx          # criação: caminho → atributos
├── GanguesCombat.jsx          # tela de batalha (agora com chips de especial ativo)
├── GanguesVictory.jsx         # relatório pós-batalha
├── GanguesTrainingZone.jsx    # console de progressão (admin + pública)
├── Gangues.css                # todo o CSS do módulo
├── components/                # DramaticDice, NeoGuideDialog, NeoGuideTip, GanguesProgressionPanel
├── data/                      # ganguesLoadout.js, ganguesSpecials.js, gangues-enemies.json
├── engine/
│   ├── ganguesCombatResolver.js  # dado, crítico, bônus de caminho, dano
│   └── ganguesSpecialEffects.js  # NOVO — valores e lógica dos 75 poderes
├── hooks/                     # useGanguesTurnMachine.js, useGanguesI18n.js
└── store/useGanguesStore.js   # zustand: ficha, roster, partida, Supabase
```

## 13. Histórico recente (de onde viemos)

Do mais novo pro mais antigo, só o que tocou em Gangues:

0. **v1.14.0** — skill tree ganha números padrão e efeito real em combate (os 75 poderes), UI
   pra escolher ativa em batalha.
0.5. **v1.13.0** — Atacante ganha os 5 sub-caminhos (Bruto/Duelista/Fúria/Especialista/Vingador).
1. **v1.12.0** — unifica a Zona de Treinamento pública com o fluxo normal de progressão.
2. **v1.11.4 / v1.11.3** — correções de scroll mobile no lobby e liberação do treino público.
3. **v10.198.5 a v10.198.7** — completa a progressão de Defensor e Místico, redesenha a Zona de
   Treinamento mobile-first.
4. **v10.198.4** — adiciona a Zona de Treinamento administrativa.
5. **v10.198.3** — redesenha a skill tree pra combinar com a identidade visual do jogo (cores por
   caminho), corrige XP não sincronizando com a gangue ativa após vitória.
6. **v1.10.0** — adiciona progressão do Atacante (a primeira árvore implementada).
7. Antes disso: sistema de dado d3 + crítico, identidade visual por caminho no combate, extração
   do i18n dedicado, tutoriais guiados da NeoGuide, iniciativa global e relatório de batalha —
   tudo já consolidado e estável.

## 14. Pontos em aberto (o que falta / vale revisar)

- **Balancear os números da skill tree** jogando de verdade — os valores atuais (seção 7) são só
  ponto de partida.
- **Dar design de verdade pros 50 poderes de Defensor/Místico** — hoje é um template genérico
  sem personalidade própria, diferente do Atacante.
- **Reavaliar as simplificações do Atacante** (Marca/Fratura/Ponto de Pressão sem duração,
  Investida/Fôlego Final sem furar turno) — só valem a pena reverter se um sistema de status com
  duração for construído no motor de turno, o que hoje foi evitado de propósito por risco.
- Atributos avançados (além de 5) hoje só destravam por Zona de Treinamento, não pelo fluxo normal
  de criação — vale decidir se isso é intencional ou se merece ajuste.
- `trash_talk_npc` (facções Marelia, Karnazar, etc.) é conteúdo morto — ou vira inimigos novos, ou
  é removido.
- Trash talk dos inimigos só existe em português; falta localizar se for pra valer noutros
  idiomas.
- Identidade visual por caminho (cor/ícone) só aparece na tela de combate — poderia estender pro
  lobby e criação.
- Sem PvP — todo combate é contra IA.

---

### Sugestão de próximo passo

Joga uma batalha usando uma ativa do Atacante equipada (é a árvore com design mais fiel ao que
você escreveu) e vê se os números fazem sentido na prática. Com isso calibrado, decide se vale a
pena escrever o design de verdade pra Defensor/Místico antes ou depois de ajustar os números do
Atacante.
