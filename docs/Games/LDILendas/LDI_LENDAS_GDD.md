# LENDAS DO LDI — GDD (Game Design Document)

> **Base única do jogo "Lendas do LDI"** (rota `/games/ldi`, código em
> `src/pages/games/LDI/`, versão em `LDI_VERSION` de `src/config/version.js`).
> Descreve o jogo como ele é hoje e, na §10, a direção aprovada. O que ainda
> não existe no código aparece marcado como **planejado**.
> Histórico de mudanças não entra aqui — mora no `git log`.

---

## 1. O que é

Livro-jogo de texto, single-player, numa coluna de celular. O jogador entra no
LDI com um SBI de terceira mão, cai por um erro do sistema e atravessa a
**Temporada 1 — Descobrimento** lendo cenas e escolhendo o que fazer.

- **Sem ficha e sem dado.** Não existe atributo, ponto, nível de personagem,
  vantagem nem poder. O que muda o jogo é a **Veia** que o jogador escolhe e o
  quanto ela engrossa (§3).
- **Lutas narradas.** Por enquanto toda luta é uma cena de texto (§5). A luta
  jogável é a batalha rítmica, **planejada** (§10).
- **Rejogável.** Cada Veia vê a mesma cena de outro jeito, destrava escolhas
  próprias e (**planejado**) leva a um final próprio.
- **Duração:** 63 cenas em 4 atos, ~8.500 palavras em português.
- **Acesso:** gratuito; o progresso só fica salvo com conta (§8).

---

## 2. Telas e rotas

| Rota | Tela | Arquivo |
|---|---|---|
| `/games/ldi` | Lobby: nova jornada (só pede o nome), jornadas salvas da conta (continuar, apagar), as 5 Veias, aviso pra quem não tem conta | `Lobby.jsx` |
| `/games/ldi/game` | A história: barra de cima (sair · ato · Veia), cena, escolhas, diário, minijogo por cima e tela de fim | `Game.jsx` |

---

## 3. As Veias

**Veia** (a sua linha de conhecimento). Na cena **A Encruzilhada** (logo depois
da queda, Ato I) cinco luzes acendem e o jogador segue uma. A escolha é uma
decisão grande (confirmação em tela cheia) e vale até o fim da jornada.

| id | Nome | Área | O que a pessoa enxerga |
|---|---|---|---|
| 1 | Fio Solto | Código | a costura do MDI: tranca, senha, terminal |
| 2 | Lona | Arena | a luta pelo corpo: ritmo, peso, o golpe antes do golpe |
| 3 | Faro | Investigação | o detalhe que ninguém viu, o horário que não bate |
| 4 | Caô | Crime e lábia | quem deve, quem vende, o que cada um quer |
| 5 | Estática | Sintonia | o chiado por trás do sistema: ecos, vozes antigas |

O código só usa o id (`data/veias.js`: id, slug, cor, ícone). Nome, área e
descrição moram em `games.ldi.veias.<id>`.

### 3.1 Níveis

| Nível | Nome | (explicação) | Onde sobe hoje |
|---|---|---|---|
| I | Cru | acabou de chegar | ao escolher a Veia |
| II | Rodado | já levou umas | Dia 2 (cena 1.4) |
| III | Afiado | sabe o que faz | Dia 3 (cena 1.5) |
| IV | Cascudo | a rua te respeita | início do Ato III (3.1) |
| V | Lenda | contam história de você | 72 Horas (4.1) |

A cena sobe o nível com `ganha: { nivel }` ao ser aberta; a tela anuncia
("A sua Veia engrossou"). **Planejado:** subir o nível pelo que o jogador faz
dentro da própria Veia, e não por marco fixo da história.

### 3.2 Como a Veia muda o jogo

- **Escolha trancada:** `requer: { veia, nivel }` (ou só `nivel`, qualquer
  Veia). Aparece trancada com o motivo ("Requer Faro III (Afiado)"), pra mostrar
  que outro caminho abriria aquela porta.
- **Texto da cena:** linha que começa com `{veia:N}` só aparece pra quem segue
  a Veia N. As cenas importantes têm uma linha por Veia.

---

## 4. Motor da história

`engine/historia.js` (sem React e sem Supabase) carrega as cenas, avalia as
escolhas, aplica a escolha no save e sobe o nível. `store/useLendasStore.js`
guarda o estado e salva.

**Cena:** `{ id, title, text[], choices[], capitulo?, destaque?, luta?, ganha? }`
— o ato sai do número do id (`3.2_dia8` → Ato III). `capitulo` abre o cartão de
capítulo na primeira vez; `luta` troca o cabeçalho pela faixa "LUTA · nome".

**Escolha:** `{ id, label, next_scene, requer?, veia?, decisao?, flags_required?,
flags_set?, isPuzzle?, puzzleType?, puzzleDiff?, next_falha? }`

- `flags_required` não cumprido = a escolha nem aparece (é evento da história,
  não caminho).
- `decisao` = confirmação em tela cheia antes de valer.
- `next_scene: "fim:vitoria" | "fim:derrota" | "fim:fork"` encerra a jornada.
- Escolha de uma opção só não vai pro diário.

### 4.1 Como o texto é escrito (a voz)

A narração segue o jeito de contar dos contos do site (`src/data/historias/contos/`):

- **Um narrador com dono**, em segunda pessoa, que conta a lenda *do jogador*
  pra ele, comenta e avisa ("Guarda esse nome. Ele volta."; "Vou te contar uma
  coisa que eu aprendi tarde").
- **Parágrafo curto**, frase seca, linha sozinha pra dar soco ("Nada.", "O beco
  fica quieto."). `---` separa dois momentos da cena.
- **Regra de rua virando frase** ("Dó estraga", "Quem toma conta é quem mais
  conhece o buraco da cerca").
- **Luta com física**: peso, quadril, giro, tempo. Nunca "você ataca".
- **Humor no meio da dor**, gíria de Marelia e palavrão sem pudor.
- **Mundo real do LDI**: MDR/MDI, SBI (Immersor, óculos, luva), NeoGuide, SDR
  (rank de 1 milhão pra baixo), PowWow, DIX, Yohualticit, Marelia.

Marcação no texto (`components/Narrativa.jsx`):

| Marcação | Vira |
|---|---|
| texto corrido | narração |
| `[NOME] "fala"` | fala com o nome de quem fala |
| `[SISTEMA] "mensagem"` | linha de terminal do LDI |
| `---` | respiro entre momentos |
| `*trecho*` | pensamento (itálico na cor da Veia) |
| `{nome}` | o nome do jogador |
| `{veia:N} linha` | só pra quem segue a Veia N |

O texto aparece um bloco de cada vez; tocar mostra tudo. As escolhas só
aparecem depois do texto inteiro.

---

## 5. A Temporada 1

Personagens: NeoGuide · Kaeda (a guia, da Organização) · StormByte_91 ·
GhostPulse · IronVeil · Sombra Digital · NULL_ENTITY / o Engenheiro de
Integridade (o vilão) · e, no fim, a sombra de Kronos.

- **Ato I — Chegada (1.1–1.5a):** o quarto de três por três em Marelia, o SBI de
  terceira mão, a NeoGuide, a queda, **A Encruzilhada** (as Veias), a praça
  morta e três dias até o primeiro ranked kill.
- **Ato II — O Contato (2.1–2.fim):** Kaeda, o que é um Eco, o abrigo, a
  Organização. Recusar leva ao fim "fora" (`fim:fork`).
- **Ato III — A Coleta (dias 8–12):** cada luta é cobertura pra puxar arquivo;
  o usuário 47, o vigia que é o ladrão, a captura da assinatura.
- **Ato IV — 72 Horas:** quatro saídas — pela porta da frente (Lona IV), na
  cara do mundo (precisa da prova financeira), o café com o Engenheiro (precisa
  do cargo e do relato da praça) ou entrar sem plano (só sobrevive quem tem a
  Veia em V).

**Lutas narradas:** StormByte_91 (beco e revanche), a lutadora sem nome,
GhostPulse (ranked kill e coleta), IronVeil, Sombra Digital, NULL_ENTITY (dois
jeitos). Cada luta tem uma linha por Veia.

**Finais:** vitória (`4.2_vitoria` / `4.2_vitoria_desperado`), derrota
(`4.2_derrota`) e fora (`2.4fim`). A tela de fim mostra a Veia, o nível e
quantas decisões o jogador tomou.

---

## 6. Diário

Botão da Veia na barra de cima. Mostra a Veia e a trilha de níveis I–V, as
pistas dos minijogos e cada escolha feita, separada por ato.

---

## 7. Minijogos

Três momentos do Ato III abrem um minijogo por cima da cena
(`components/PuzzleRouter.jsx`, CSS em `components/puzzles.css`). Resolver
grava uma pista no diário; desistir ou falhar segue pelo `next_falha` (ou pelo
caminho normal).

| Cena | `puzzleType` | Minijogo |
|---|---|---|
| 3.2_dia8 | `terminal` | Peças deslizantes |
| 3.3_dia9 | `decoder` | Decodificador |
| 3.4_puzzle | `stealth` | Rota entre câmeras |

Simon Says (`simon`) e Corte de Cabos (`wire`) existem e nenhuma cena usa.

---

## 8. Salvamento

Tabela `lendas_saves` (migration `050_lendas_saves.sql`): uma linha por
jornada — `nome`, `veia` (1–5), `nivel` (0–5), `cena`, `ato`, `flags`,
`pistas`, `diario`, `status` (`ativo`, `vitoria`, `derrota`, `fork`). Só o dono
lê e escreve (RLS). Salva a cada escolha, em fila (o primeiro insert devolve o
id antes do próximo virar update). Sem conta, a jornada vive só na memória.

---

## 9. Idiomas

O **texto da história só existe em português** (`data/scenes/pt/`). Inglês e
espanhol entram depois que o texto for aprovado; até lá o motor usa o pt pra
qualquer idioma (`IDIOMAS_PRONTOS` em `engine/historia.js`). Os arquivos em
`data/scenes/en|es/` são da versão antiga e serão refeitos a partir do pt.

A interface (`games.ldi.*`) está nos três idiomas, com o vocabulário adaptado:
Veia/Vein/Vena; Fio Solto/Loose Wire/Cable Suelto; Lona/Canvas/Lona;
Faro/Nose/Olfato; Caô/Hustle/Labia; Estática/Static/Estática;
Cru/Raw/Crudo … Lenda/Legend/Leyenda.

**Pendências conhecidas:** os cinco minijogos ainda têm textos fixos em
português dentro dos componentes.

---

## 10. Direção aprovada (**planejado**)

1. **Ato I reescrito em volta das Veias:** trecho linear até a Encruzilhada e,
   depois dela, cenas próprias de cada Veia, com os níveis I–III aprendidos
   dentro da própria linha (do básico ao avançado). Níveis IV–V nos Atos 2–4.
2. **Um final por Veia.**
3. **Batalha rítmica no dedo** no lugar das lutas narradas: notas acendem no
   tempo, cada nota é golpe ou defesa (jab, direto, gancho, uppercut, bloqueio,
   esquiva; chutes de Muay Thai). A Veia modifica a batalha (a definir: ex.
   Lona aguenta mais erro, Fio Solto vê a próxima nota antes, Estática ouve o
   ritmo escondido). Contraste é o ponto: a história é calma, a luta acelera.
4. **Inglês e espanhol** do texto aprovado.

---

## 11. Arquivos

```
src/pages/games/LDI/
├── Lobby.jsx · Game.jsx · Lendas.css
├── components/
│   ├── Narrativa.jsx           # as vozes do texto e a revelação
│   ├── Escolhas.jsx            # cartões e a confirmação de decisão
│   ├── Diario.jsx
│   ├── PuzzleRouter.jsx · puzzles.css · Puzzle*.jsx (5 minijogos)
├── data/
│   ├── veias.js
│   └── scenes/<idioma>/act1–4.json
├── engine/historia.js          # cenas, escolhas, níveis
└── store/useLendasStore.js     # estado + save em lendas_saves
```
