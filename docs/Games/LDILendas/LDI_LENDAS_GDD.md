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

- **Sem ficha, sem dado e sem nível.** Não existe atributo, ponto, nível,
  vantagem nem poder. O que muda o jogo é a **Veia** que o jogador escolhe e as
  **habilidades** que ele aprende dentro dela (§3).
- **Lutas narradas.** Por enquanto toda luta é uma cena de texto (§5). A luta
  jogável é a batalha rítmica, **planejada** (§10).
- **Rejogável.** Cada Veia vê a mesma cena de outro jeito, destrava escolhas
  próprias e (**planejado**) leva a um final próprio.
- **Duração:** 66 cenas em 4 atos, ~8.500 palavras em português.
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

### 3.1 Habilidades

Cada Veia tem 3 habilidades, do básico ao avançado (`data/habilidades.js`, id =
veia × 10 + ordem; nome, o que faz e onde se aprende em
`games.ldi.habilidades.<id>`). **Cada jogador só aprende as da própria Veia** —
a porta de outra Veia fica trancada pra sempre naquela jornada, e é isso que
faz rejogar mostrar coisa nova.

| Veia | Básica | Média | Avançada |
|---|---|---|---|
| Fio Solto | 11 Ver a Costura | 12 Puxar o Fio | 13 Andar Sem Rastro |
| Lona | 21 Contar o Ritmo | 22 Cair Certo | 23 Ler o Golpe |
| Faro | 31 Reparar | 32 Ler Log | 33 Seguir o Dinheiro |
| Caô | 41 Ouvir a Praça | 42 Molhar a Mão | 43 Ler a Mentira |
| Estática | 51 Ouvir o Chiado | 52 Sintonizar | 53 Falar com o Eco |

**Onde se aprende:** a básica vem com a Veia (a primeira cena depois da
Encruzilhada). A média no **Treino** do Dia 2 (`1.4t`) e a avançada com **Quem
Ensina**, no Dia 3 (`1.5t`). Quem passou reto pode buscar as duas no **Treino no
Abrigo** da Kaeda (`3.treino`), que fica no Dia 10, do lado das portas que
pedem habilidade: tranca, vai treinar e volta. A escolha de treino some quando
o jogador já aprendeu o que ela ensina (`someQuandoSabe`). A tela anuncia cada
habilidade nova ("Você aprendeu").

### 3.2 Como a Veia muda o jogo

- **Porta trancada:** `requer: { hab: id }` (lista = qualquer uma serve).
  Aparece trancada com o nome da habilidade e, embaixo, onde se aprende — ou
  "Só quem segue <Veia> sabe isso", quando é de outra Veia.
- **Texto da cena:** linha com `{veia:N}` só pra quem segue a Veia N; linha com
  `{hab:ID}` só pra quem já sabe aquela habilidade.
- **Batalha (planejado):** a batalha rítmica vai depender da mão do jogador, não
  de número. A Veia e as habilidades podem dar poderes nela — a definir.

---

## 4. Motor da história

`engine/historia.js` (sem React e sem Supabase) carrega as cenas, avalia as
escolhas, aplica a escolha no save e ensina habilidades. `store/useLendasStore.js`
guarda o estado e salva.

**Cena:** `{ id, title, text[], choices[], capitulo?, destaque?, luta?, ensina? }` —
`ensina` é uma lista de ids: o jogador aprende a primeira da sua Veia que ainda
não sabe (uma por visita).
— o ato sai do número do id (`3.2_dia8` → Ato III). `capitulo` abre o cartão de
capítulo na primeira vez; `luta` troca o cabeçalho pela faixa "LUTA · nome".

**Escolha:** `{ id, label, next_scene, requer?: { hab }, veia?, someQuandoSabe?, decisao?,
flags_required?, flags_set?, isPuzzle?, puzzleType?, puzzleDiff?, next_falha? }`

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
| `{hab:ID} linha` | só pra quem já sabe a habilidade ID |
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
- **Ato IV — 72 Horas:** quatro saídas — pela porta da frente (Ler o Golpe), na
  cara do mundo (precisa da prova financeira), o café com o Engenheiro (precisa
  do cargo e do relato da praça) ou entrar sem plano (só sobrevive quem tem a
  habilidade avançada da própria Veia).

**Lutas narradas:** StormByte_91 (beco e revanche), a lutadora sem nome,
GhostPulse (ranked kill e coleta), IronVeil, Sombra Digital, NULL_ENTITY (dois
jeitos). Cada luta tem uma linha por Veia.

**Finais:** vitória (`4.2_vitoria` / `4.2_vitoria_desperado`), derrota
(`4.2_derrota`) e fora (`2.4fim`). A tela de fim mostra a Veia, quantas
habilidades o jogador aprendeu e quantas decisões tomou.

---

## 6. Diário

Botão da Veia na barra de cima (mostra Veia e `n/3` habilidades). O diário
mostra as 3 habilidades da Veia (as que faltam aparecem como `???`), as pistas
dos minijogos e cada escolha feita, separada por ato.

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

Tabela `lendas_saves` (migrations `050_lendas_saves.sql` e `051_lendas_habilidades.sql`): uma linha por
jornada — `nome`, `veia` (1–5), `habilidades` (lista de ids), `cena`, `ato`, `flags`,
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
Faro/Nose/Olfato; Caô/Hustle/Labia; Estática/Static/Estática. As 15
habilidades também têm nome adaptado em cada idioma.

**Pendências conhecidas:** os cinco minijogos ainda têm textos fixos em
português dentro dos componentes.

---

## 10. Direção aprovada (**planejado**)

1. **Ato I reescrito em volta das Veias:** trecho linear até a Encruzilhada e,
   depois dela, cenas próprias de cada Veia, com as habilidades aprendidas em
   lugares e jeitos diferentes por Veia. Habilidades novas nos Atos 2–4.
2. **Um final por Veia.**
3. **Batalha do pentagrama** no lugar das lutas narradas — ver §11.
4. **Inglês e espanhol** do texto aprovado.

---

## 11. Batalha do pentagrama (protótipo)

Laboratório em `/games/ldi/pentagrama` (só admin; no `npm run dev` abre pra
qualquer um). Motor sem tela em `batalha/motorPentagrama.js`, pra o Lendas (e
qualquer jogo) consumir depois.

- **O corpo é o tabuleiro:** pentagrama com 5 pontos grandes (cabeça, mão D/E,
  pé D/E), 4 pequenos (cotovelos e joelhos, entre a mão/pé e o centro) e o
  centro.
- **Combo = linha desenhada com o dedo**, de 1 a 4 pontos, sem repetir.
  Cotovelo só logo depois da mão do mesmo lado; joelho só logo depois do pé.
- **Batidas:** a luta anda em batidas (lento 3,4 s · normal 2,6 s · rápido
  1,9 s). O combo do inimigo acende ponto a ponto em vermelho na primeira
  metade da batida; o jogador desenha o dele até a barra amarela acabar.
- **Bloqueio por espelho:** posição por posição, golpe do mesmo membro contra
  golpe do mesmo membro = bloqueio. O resto entra, dos dois lados. O membro já
  diz o que é o golpe (soco, cotovelada, chute, joelhada, cabeçada).
- **Energia:** 10 por troca, dividida pelos golpes do combo (um golpe sozinho
  sai com tudo). Cotovelo ×1,3, joelho ×1,4, cabeçada ×1,25, chute ×1,1.
  Bloquear rende +1 de energia na próxima troca, esquivar +3 (teto 16).
  Bloquear soco/chute com cotovelo/joelho devolve 2 de dano.
- **Esquiva:** o centro abre (verde) em parte das batidas; tocar nele esquiva a
  troca inteira, e quem esquiva não ataca.
- **Ficha do inimigo:** lista de combos com peso e chance de esquiva
  (`FICHAS`: Saco de Pancada, StormByte_91). A ficha do jogador ainda não existe.
- **Tela:** barras de sangue no topo, estilo jogo de luta (a do inimigo
  espelhada, rastro vermelho atrás do dano), tabuleiro no meio, o passo a passo
  da troca embaixo.

**Planejado:**
- **Visão em primeira pessoa**, estilo boxe antigo que só mostra as luvas, com
  o inimigo de frente (alternativa: lado a lado).
- **Barra de poder:** enche com a luta e solta um golpe especial que quebra o
  combo do inimigo; os poderes chegam aos poucos com a Veia e as habilidades.
- **Combos liberados aos poucos:** o personagem começa ligando só pontos
  básicos e vai destravando ligações (cotovelo, joelho, cabeça, combos longos).
- **Membro machucado** (golpe demais no mesmo membro enfraquece ele por um
  tempo) e a ficha de movimentos do jogador contra a do inimigo.

## 12. Arquivos

```
src/pages/games/LDI/
├── Lobby.jsx · Game.jsx · Lendas.css
├── components/
│   ├── Narrativa.jsx           # as vozes do texto e a revelação
│   ├── Escolhas.jsx            # cartões e a confirmação de decisão
│   ├── Diario.jsx
│   ├── PuzzleRouter.jsx · puzzles.css · Puzzle*.jsx (5 minijogos)
├── data/
│   ├── veias.js · habilidades.js
│   └── scenes/<idioma>/act1–4.json
├── batalha/                    # motorPentagrama.js · Pentagrama.jsx · BatalhaLab.jsx · Batalha.css
├── engine/historia.js          # cenas, escolhas, habilidades
└── store/useLendasStore.js     # estado + save em lendas_saves
```
