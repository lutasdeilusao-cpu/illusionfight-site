# LDI Gangues — Bíblia de Mundo (lore, história e personagens)

> **Documento consolidado, escrito em 2026-09-08.** Junta TUDO que já existe de
> ficção espalhado pelo projeto: o mapa de Marelia, as 7 regiões, as gangues
> donas de cada bairro, os 30 chefes/inimigos da campanha, os 8 nomes do ranking
> clandestino, os 30 lutadores recrutáveis, os NPCs e o texto de abertura/final.
>
> **Não inventa nada.** Cada bloco aponta a fonte no código/dados. É a base pra
> construir o arquipélago e a enciclopédia de inimigos por cima do que já tem.
>
> Regras de mecânica (atributos, dados, skill tree, progressão) **não entram
> aqui** — ficam em `GANGUES_DESIGN.md`, `GANGUES_HEADSUP.md` e
> `GANGUES_PROGRESSAO_RASCUNHO.md`. Este doc é só o mundo.

---

## 1. O tempo e o lugar

**Marelia** (grafia do jogo, sem acento; o Isaias às vezes dita "Marélia" na
linha principal do livro — ver `crime-organizado-marelia.md` na memória). Cidade
sem dono. Gangue em cada esquina, cada uma achando que manda no mundo porque
manda numa rua.

O LDI Gangues se passa **antes do Alan** — antes de existir um "Rei de Marelia".
É a época em que um cara chamado **Damião, o Retalho** (`costura` nos dados)
quase juntou a cidade inteira numa bandeira só: segurou seis bairros e a Laje.
Não durou. Marelia rachou de novo.

O jogador monta a própria gangue lá embaixo, na Pista, e sobe bairro por bairro
até a Laje, onde enfrenta o Retalho. Vence — e descobre o que ele já sabia:
**essa cidade não se segura na mão de ninguém.** Anos depois, só o Alan
conseguiria. Mas isso é outra história (a do conto "Alan, o Campeão",
contos-index id `02`).

**Ligação com o cânone LDI:** a Marelia do jogo é a mesma do conto "Alan, o
Campeão" e da linha principal do Livro 1. O crime organizado (a Banca, o Morro,
a Baixada, a hierarquia bucha→Campeão, o Sombra) foi criado nesse conto — ver
`docs/LDI/IDEIAS_CONTOS_LEGENDS.md` e a memória `crime-organizado-marelia.md`. O
jogo é o retrato de uma geração anterior à do Alan/Kim/Jack.

- Fontes: `src/pages/games/Gangues/data/ganguesTerritorios.js` (cabeçalho),
  `src/i18n/gangues-pt.json` → `games.gangues.story`.

### Texto de abertura (voz da quebrada, `story.abertura`)

> "Senta aí que eu te explico como funciona.
> Marelia não tem dono. Tem gangue em cada beco, cada uma achando que manda no
> mundo porque manda numa rua.
> Cê quer subir? Começa na Pista, lá embaixo. Toma os ponto das gangue pequena,
> depois encara o foda da região — o dono da boca, o cara da bandeira.
> Toma o bairro, o de cima abre. Bairro por bairro até a Laje.
> Lá em cima tem um cara que ninguém sabe o nome de verdade. Só chamam ele de O
> Retalho. Ele já juntou seis bairro numa bandeira só. Ninguém nunca chegou mais
> perto de ser dono de Marelia.
> Cê vai ter que passar por ele. Boa sorte, cria — cê vai precisar."

### Título / subtítulo da campanha (`story.titulo` / `story.sub`)

- **MARELIA SEM DONO**
- "Antes do Alan, ninguém segurava Marelia. Era gangue em cada esquina, cada uma
  dona do próprio quarteirão. Um cara — o Retalho — quase juntou tudo. Quase.
  Agora é a tua vez de tentar."

### Texto de final (`story.final`)

- Code: **A SUBIDA ACABA AQUI**
- Título: **MARELIA NÃO SE COSTURA**
- "A {gangue} derrubou o Retalho na Laje. Marelia inteira viu.
  E aí você entendeu o que ele já sabia. Em duas semana o mapa tava rachado de
  novo — bairro puxando pra um lado, boca puxando pra outro. Ninguém segura essa
  cidade. Nem ele segurou. Nem você.
  Anos depois um garoto de cabelo esquisito ia conseguir o que vocês dois não
  conseguiram. O nome dele era Alan. Mas isso é outra história — e cê tá nela,
  lá no comecinho."

---

## 2. A sua gangue

- **O nome é escolhido pelo jogador** e é o que reverbera: os inimigos cospem o
  nome da gangue, não o dos lutadores. "É esse nome que o Retalho vai cuspir
  quando cê chegar na Laje." (`games.gangues.naming`)
- Sugestões que o jogo oferece: *Bonde do Fim de Linha*, *A Firma*, *Trilha de
  Cima*, *Sindicato do Beco*, *Quebrada Nova*.
- A gangue começa com 2 lutadores e cresce até 5 (6 slots de escalação no modo
  história).
- Duas moedas de mundo: **Grana** (de corre, achado, briga — gasta em descanso e
  vantagem pontual) e **Nome / Rep** (a fama da gangue — destranca conversa com
  NPC, alimenta o % de domínio de Marelia e o texto do final).

---

## 3. O mapa de Marelia — as 7 regiões

Mapa político em SVG (`GanguesStoryMap.jsx`), regiões encaixadas de verdade. Cada
uma abre quando a anterior é dominada. O HUD mostra **% de Marelia dominada**.

As 7 "temperaturas" de disputa (`GANGUES_DIFICULDADES`, sem "fácil/difícil"):
`rato → muvuca → correria → disputa → guerra → sangue → coroa`.

| # | Região | Temp. | Cor | Descrição (`story.territorios`) |
|---|---|---|---|---|
| 1 | **A Pista** | Rato de rua | `#3ddc97` verde | O asfalto lá embaixo. Cria que corre no farol, arranca corrente, vende bala. Ninguém importante — mas todo mundo começa aqui. O Alan também começou. |
| 2 | **A Feira** | Muvuca | `#7ee787` | O comércio, os camelô, a luz de gato. Aqui não tem tiro — tem dívida. O Cobrador anota tudo, e o Cobrador cobra tudo. |
| 3 | **A Baixada** | Correria | `#18dafb` azul | Do outro lado da linha do trem. A facção do Sombra rachou em três quando ele morreu. Sangria, Gelo e a Sobra se mordem antes de morder você. |
| 4 | **A Vila** | Disputa | `#ffae32` âmbar | O conjunto, os prédio de dez andar, a escada sem luz. O bonde controla de baixo pra cima. Pra chegar no dono, sobe tudo apanhando. |
| 5 | **O Morro** | Guerra | `#ff8f3c` | A favela de encosta, a escadaria de cimento que muda de forma a cada laje nova. As boca, os fogueteiro. Quem sobe o Morro não desce igual. |
| 6 | **O Alto do Morro** | No sangue | `#ff6b6b` vermelho | Atrás da porta de aço. Os Cinco quase viraram cúpula — juntaram meio Morro numa mão só antes do Retalho chegar e antes de você. |
| 7 | **A Laje** | A Coroa | `#a855f7` roxo | O topo. De um lado, Marelia inteira olhando. Do outro, o Retalho — o único que já segurou seis bairro de uma vez. É aqui que se descobre se dá pra segurar sete. |

**Pontes entre regiões:** a Feira só libera o chefe depois de o jogador voltar
na Pista e falar com o informante (**Duda, o Orelha**). É a primeira vez que o
jogo obriga a voltar num bairro dominado pra avançar num novo.

- Fontes: `data/ganguesTerritorios.js`, `story.territorios`, `story.dificuldades`.

---

## 4. As gangues donas dos bairros

Nomes em `story.gangues`. Cada bairro tem 1 gangue dominante (com o "foda da
região" no topo) e às vezes gangues menores nos pontos.

| Região | Gangue(s) | Observação de lore |
|---|---|---|
| Pista | **Rato de Pista** (a "Rasteira" no texto da cena), **Bonde do Sinal** | Molecada do asfalto. O beco é da Rasteira; ninguém passa de graça. |
| Feira | **Acerto de Contas** (a cobrança do Cobrador), **Os Gato** | "Os Gato" fazem ligação clandestina de energia (luz de gato) pros barraco. |
| Baixada | **Sombra Rubra**, **Sombra Fria**, **Os Restos** | Os três cacos da antiga facção do Sombra, que rachou quando ele caiu no valão. Se mordem entre si. |
| Vila | **Bonde dos Prédio**, **Os Andar de Cima** | O bonde controla o prédio andar por andar, de baixo pra cima. |
| Morro | **Frente da Escada**, **Os Fogueteiro** | Quem vigia a escadaria de cimento e solta rojão de aviso. |
| Alto do Morro | **Os Cinco**, **A Roda** | Os Cinco quase fecharam uma cúpula; A Roda luta em formação, protegendo o centro. |
| Laje | **O bonde do Retalho** | O único bonde que já segurou seis bairros de uma vez. |

---

## 5. Os chefes da campanha (o "foda da região")

Fichas reais de combate em `data/gangues-enemies.json`; nome/fala de confronto em
`story.bosses`. Ordem = subida da campanha.

### 1. Carvão — "Fumaça" (`fumaca`) · chefe da Pista
Facão. "Cê é ligeiro? Eu sou fumaça, cria. Pisca que eu sumo — e cê apanha no
escuro." Some no meio da rua e bate no escuro. Só desce pra encarar quando a
Pista inteira já conhece o nome da sua gangue.

### 2. O Cobrador (`turco`) · chefe da Feira
Porrete. Anota tudo, cobra tudo — bate no braço antes de bater na cara. "Marelia
inteira me deve. Agora a {suaGangue} também. E aqui quem não paga em dinheiro
paga no osso." Braços dele: **Unha de Fome** (cobrador de rua) e **Marreta**
(braço de confiança).

### 3. Fura-Bucho (`espeto`) · chefe da Baixada
Espeto — não solta de jeito nenhum. "A Baixada é minha desde que o Sombra caiu
no valão. Cê tomou meus ponto? Beleza. Vem tomar o resto." Assumiu a Baixada
inteira quando o Sombra morreu.

### 4. Ferrugem (`sala`) · chefe da Vila
Taco. Mora no último dos dez andares — quem sobe já chega cansado. "Subiu os dez
andar só pra apanhar no último? Respeito a disposição. Não muda merda nenhuma."

### 5. A Fera (`zefa`) · chefe do Morro
Vara. "Criou metade da criançada da região" — sabe exatamente onde bater pra
doer sem machucar de verdade. "Eu criei metade da criançada que a {suaGangue}
bateu pra chegar aqui. Senta aí. O teu castigo vai demorar." (A única chefe
tratada como figura materna da quebrada.)

### 6. O Contador (`doutor`) · chefe do Alto do Morro
Bengala. Não briga por raiva — briga porque a conta fecha assim. Tem o Alto
inteiro devendo favor. "Cê tem dois lutador. Eu tenho o Alto do Morro inteiro
devendo favor. Faz a conta e vai embora."

### 7. O Retalho — Damião (`costura`) · CHEFE FINAL, na Laje
Facão. O único que já segurou seis bairros de uma vez. "Marelia inteira já foi
minha uma vez. Seis bairro na mão, a Laje no pé. Só que essa porra não costura —
nem eu segurei. Sobe aqui que eu te mostro na marra." Generais dele: **Fiapo**,
**Agulha** e **Tesoura** (as três linhas do bonde).

- Fonte: `story.bosses`, `data/ganguesEncontros.js` (`GANGUES_CHEFE_EQUIPE`).

---

## 6. Enciclopédia de inimigos — a campanha (modo história)

36 fichas em `data/gangues-enemies.json`. Nomes "puxados do esgoto" (rua/crime,
sem nome próprio solto, sem a palavra "moleque") desde a v2.33/2.34. Cada uma tem
`notes` com a função na quebrada e um `trash_talk` completo por categoria
(`attack_miss`, `attack_hit`, `take_damage`, `take_critical`, `player_near_death`,
`enemy_near_death`, `defeat`).

### A Pista — a Rasteira / Bonde do Sinal
| id | Nome | Arma | Lore (`notes`) |
|---|---|---|---|
| `moleque_a` | **Ratazana** | facão | Molecada de ponto. A primeira treta de verdade do jogo. |
| `moleque_b` | **Cão Louco** | corrente | Um degrau acima; agressivo. |
| `moleque_c` | **Brasa** | estilingue | Andava atrás do Carvão copiando tudo — o apelido colou e não sai. |
| `fumaca` | **Carvão** | facão | Chefe da Pista (ver §5). |

### A Feira — Acerto de Contas / Os Gato
| id | Nome | Arma | Lore |
|---|---|---|---|
| `turco_batedor` | **Unha de Fome** | porrete | Cobrador de rua do Cobrador — bate na porta antes de o chefe cobrar de verdade. |
| `turco_capanga` | **Marreta** | porrete | Braço de confiança — cobra dívida grande, não perde tempo com conversa. |
| `gato_eletrico` | **Choque** | faca | Faz ligação clandestina de energia pros barraco; rápido, ataca e some no meio das banca. |
| `turco` | **O Cobrador** | porrete | Chefe da Feira (ver §5). |

### A Baixada — os cacos da facção do Sombra
| id | Nome | Arma | Lore |
|---|---|---|---|
| `sombra_rubra` | **Sangria** | faca | O pedaço mais bravo dos três. |
| `sombra_fria` | **Gelo** | faca | O pedaço mais calculado — não se apressa, não erra. |
| `os_restos` | **Sobra** | corrente | O mais desesperado, o que não tem mais nada a perder. |
| `espeto` | **Fura-Bucho** | espeto | Chefe da Baixada (ver §5). |

### A Vila — Bonde dos Prédio / Os Andar de Cima
| id | Nome | Arma | Lore |
|---|---|---|---|
| `bonde_predio_1` | **Cadeado** | chave de cano | Toma conta do térreo — não deixa ninguém subir sem raspar. |
| `bonde_predio_2` | **Trinco** | chave de cano | Comanda um andar inteiro; sobe rápido, bate mais rápido. |
| `andar_de_cima` | **Goteira** | taco | Mora nos andares de cima, olha o bonde de cima pra baixo (literal e figurado). |
| `sala` | **Ferrugem** | taco | Chefe da Vila (ver §5). |

### O Morro — Frente da Escada / Os Fogueteiro
| id | Nome | Arma | Lore |
|---|---|---|---|
| `frente_escada_1` | **Cupim** | faca | Fica na frente da escadaria avisando quem sobe — e brigando com quem não devia. |
| `frente_escada_2` | **Cascalho** | faca | "Capitão" da frente de escada; subiu rápido porque bate mais forte que todo mundo. |
| `fogueteiro` | **Pavio Curto** | rojão (fogo) | Solta rojão de aviso quando um estranho sobe — e não se importa de soltar um em cima de você. |
| `zefa` | **A Fera** | vara | Chefe do Morro (ver §5). |

### O Alto do Morro — Os Cinco / A Roda
| id | Nome | Arma | Lore |
|---|---|---|---|
| `os_cinco_1` | **Verme** | porrete | Um dos cinco que quase viraram cúpula — disciplinado, perigoso em grupo. |
| `os_cinco_2` | **Presa** | porrete | O braço-direito da cúpula quase formada — o mais forte dos cinco. |
| `a_roda` | **Engrenagem** | corrente | Luta em formação, sempre protegendo o centro, girando que nem engrenagem. |
| `doutor` | **O Contador** | bengala | Chefe do Alto (ver §5). |

### A Laje — o bonde do Retalho
| id | Nome | Arma | Lore |
|---|---|---|---|
| `bonde_costura_1` | **Fiapo** | facão | Primeira linha do bonde que segura seis bairro pro Retalho — treinado pra cansar quem sobe. |
| `bonde_costura_2` | **Agulha** | facão | Segunda linha; o Retalho confia nele com metade da Laje. |
| `bonde_costura_3` | **Tesoura** | facão | General — comanda a Laje inteira em nome do Retalho. O último degrau antes do topo. |
| `costura` | **O Retalho** | facão | Chefe final (ver §5). |

---

## 7. Enciclopédia de inimigos — o ranking clandestino (fora da história)

Fichas de tier alto em `gangues-enemies.json`, na ordem de desbloqueio do modo
avulso (do mais fraco ao mais forte). São "nomes que já correram vários bairros
de Marelia". **6 destes foram reflavorizados** na v2.33/2.34 pra cortar os
cruzamentos diretos com o cânone da linha principal (Torre Kronos, Dojô de
Karnazar, Kim, Jack) — hoje a referência é só um eco.

| id | Nome | Lore (`notes`) | Eco de cânone |
|---|---|---|---|
| `treinamento` | **Saco de Pancada** | Bonequinho de pano que apanha pra quem tá começando na gangue treinar. Quase não revida. | — |
| `kaeda` | **Corte Fundo** | Lutadora veterana de Marelia. Agressiva com a katana. (elemental: fogo) | ex-"Kaeda" |
| `thunderbolt` | **Curto-Circuito** | Enrola um fio elétrico no bastão antes de entrar na roda — ninguém sabe se é truque ou dom. Nome que já correu vários bairros. (elemental: ar) | — |
| `stormbyte` | **Traça** | Clona cartão, invade câmera, some antes da polícia chegar — trabalha pra quem paga mais. Nenhuma gangue confia nele, todas precisam dele. (elemental: trevas) | — |
| `viran` | **Cascudo** | Treinou metade dos capoeiristas de rua de Marelia num terreiro sem placa. Defesa impenetrável. (elemental: terra) | ex-Dojô de Karnazar |
| `campeao` | **Quebra-Queixo** | Ninguém no rachão clandestino de Marelia nunca o colocou no chão. Defende o título há anos, na porrada. | ecoa "o Campeão" (Alan) |
| `kronos` | **O Coveiro** | Ninguém sabe o nome dele nem viu o rosto — só sabe que manda em toda Marelia de dentro das sombras. Poder incomensurável. (elemental: trevas) | ex-Kronos / Torre Kronos |
| `primordial_jack` | **Breu** | Luta com chama negra nos punhos, ninguém sabe explicar como. O nome no topo de todo ranking clandestino de Marelia. (elemental: fogo) | ex-"primordial Jack" (black flame) |

- As falas do Coveiro e do Breu ainda carregam a persona antiga (tempo/sombra;
  "black flame. lembra desse nome"; "eu sou O REI DESSA RUA") — matéria-prima se
  quiser reconstruir esses dois como bosses de arquipélago.

---

## 8. Os 30 lutadores recrutáveis

Catálogo em `ldi_gangues_30_personagens_v1.json` (via `data/ganguesCharacters.js`).
São os personagens que o jogador recruta pra própria gangue. Nome curto de rua +
"title" de evolução máxima (nível 10) + identidade de combate. Liberação por
conclusão de campanha: 5 iniciais → 15 no 1º clear → 20 no 2º clear → +10 só de
evento.

### Caminho Atacante (⚔️)
| id | Nome | Subcaminho | Papel | Título nv.10 |
|---|---|---|---|---|
| 1 | **Trinca** | Bruto | Dano pesado e resistência | O Quebra-Linha |
| 2 | **Marreta** | Bruto | Dano extremo, pouca defesa | Demolidor |
| 3 | **Fenda** | Duelista | Precisão e velocidade | Primeiro Corte |
| 4 | **Navalha** | Duelista | Velocidade extrema | Sem Aviso |
| 5 | **Touro** | Fúria | Cresce sob pressão | Último de Pé |
| 6 | **Sangue** | Fúria | Glass cannon, explosão de dano | Tudo ou Nada |
| 7 | **Mira** | Especialista | Quebra de defesa | Cirúrgica |
| 8 | **Ponto** | Especialista | Controle técnico | Ponto Cego |
| 9 | **Cicatriz** | Vingador | Absorção e retaliação | Dívida Antiga |
| 10 | **Troco** | Vingador | Contra-ataque equilibrado | Cobrança |

### Caminho Defensor (🛡️)
| id | Nome | Subcaminho | Papel | Título nv.10 |
|---|---|---|---|---|
| 11 | **Muro** | Muralha | Defesa absoluta | Fortaleza |
| 12 | **Concreto** | Muralha | PV e sustentação | Bloco Vivo |
| 13 | **Guarda** | Guardião | Proteção de aliados | Linha de Frente |
| 14 | **Ombro** | Guardião | Interceptação e presença | Ninguém Passa |
| 15 | **Boca** | Provocador | Controle de alvo | Olha Pra Mim |
| 16 | **Isca** | Provocador | Desvio e provocação | Alvo Perfeito |
| 17 | **Catraca** | Reativo | Defesa que devolve pressão | Bateu, Voltou |
| 18 | **Rebote** | Reativo | Reação rápida | Volta em Dobro |
| 19 | **Ferro** | Resiliente | PV extremo | Não Cai |
| 20 | **Osso** | Resiliente | Resistência equilibrada | Ainda de Pé |

### Caminho Místico (✨)
| id | Nome | Subcaminho | Papel | Título nv.10 |
|---|---|---|---|---|
| 21 | **Brasa** | Ígneo | Dano mágico direto | Incêndio |
| 22 | **Cinza** | Ígneo | Pressão prolongada | Depois do Fogo |
| 23 | **Maré** | Aquático | Sustentação e controle | Maré Cheia |
| 24 | **Chuva** | Aquático | Velocidade e fluxo | Temporal |
| 25 | **Raiz** | Terreno | Controle defensivo | Chão Fechado |
| 26 | **Racha** | Terreno | Quebra de linha | Falha Sísmica |
| 27 | **Faísca** | Tempestade | Velocidade mágica | Antes do Trovão |
| 28 | **Trovão** | Tempestade | Dano mágico explosivo | Queda do Céu |
| 29 | **Névoa** | Ilusório | Controle e evasão | Sem Rosto |
| 30 | **Espelho** | Ilusório | Resposta e manipulação | Duas Verdades |

> Nota: **Marreta** e **Brasa** são nomes que também aparecem no roster de
> inimigos (`turco_capanga`, `moleque_c`) — colisão de apelidos de rua, não a
> mesma pessoa.

---

## 9. NPCs (não-combatentes)

Da cena navegável da Pista (`data/cenas/pista.js` + `cena.pista` no i18n):

- **Nego Véio / Seu Nato** — o coroa da esquina, dono da birosca. "Senta aí.
  Toma um mate. Cê tá subindo rápido demais pra quem ninguém conhece." Dá um
  corre (levar um pacote sem a viatura ver) e conta onde o Carvão se enfia.
  Depois disso a birosca fica aberta pra gangue descansar. (`dialogo.veio_nome` =
  "Nego Véio"; na cena aparece como "Seu Nato" — mesmo personagem, o coroa da
  esquina.)
- **Duda, o Orelha** — "sabe tudo que rola em Marelia". O informante que
  destranca o chefe da Feira: "aqui é onde tudo que rola em Marelia passa antes
  de virar boato". Fica na Pista mesmo depois dela virar bairro dominado.
- **A cria do sinal** — moleque vendendo bala no farol. "Eu vejo tudo desse
  farol. Quer saber de alguma coisa, é só trocar uma ideia — ou um trocado."
  Vende informação sobre o ferro-velho. Pode ser apertado (vira treta fácil, −rep).

Da cena, POIs com sabor de mundo (não personagens, mas lugares):
**a boca do sinal**, **o ferro-velho** (portão no cadeado), **o beco da
Rasteira**, **a rinha do beco**, **a birosca do Seu Nato**, **o corre do Nato**,
**a loja da Pista**.

---

## 10. NeoGuide (a guia)

Mascote oficial do universo LDI (aparece em outros jogos do site), cor de
identidade `#00B4D8`. No Gangues faz o onboarding e os tutoriais guiados. Não é
personagem de Marelia — é a voz meta/tutorial. Assets:
`assets/neoguide-frontal.png`, `assets/neoguide-perfil.png`.

---

## 11. Conteúdo de lore ainda não usado (matéria-prima)

- **`npc_names` no i18n** — 8 personas escritas pra inimigos que nunca foram
  criados, cada uma amarrada a uma facção do cânone LDI maior:
  `npc_arrogante_marelia` (Garoto de Marelia), `npc_frio_azuma` (Visitante de
  Azuma), `npc_caotico_sdr` (Jogador Caótico do SDR), `npc_veterano_ranqueado`
  (Veterano do Ranking), `npc_provocador_bravara` (Provocador de Bravara),
  `npc_mistico_xakaxi` (Descendente Xakaxi), `npc_hacker_sdr` (Hacker do SDR),
  `npc_nordico_karnazar` (Lutador de Karnazar). O `GANGUES_DESIGN.md` registra
  que existia até um `trash_talk_npc` com falas de personalidade pra esses ids —
  hoje não está mais no `gangues-pt.json` (só sobraram os nomes). São ganchos
  para inimigos de outros arquipélagos / eventos, ligando Marelia ao resto do
  mundo LDI (Azuma, Karnazar, Bravara, SDR, Xakaxi).
- **O Sombra** — chefe da Baixada, morto antes do jogo começar (caiu no valão).
  Nunca aparece em ficha; só existe pela sombra que deixou (as três facções
  rachadas). No conto "Alan, o Campeão" é o Alan quem o mata, aos 11 anos.
- **A "cúpula" / alto escalão de Marelia** — citada ("Os Cinco quase viraram
  cúpula"), nunca mostrada. No cânone do conto, são 4-5 pessoas que a rua nunca
  vê. Espaço aberto pra um chefe pós-Retalho.
- **O Alan** — nomeado 3x no texto do jogo (abertura da Pista, descrição da
  Pista, final) mas nunca jogável nem enfrentável. É o futuro que o jogo aponta.

---

## 12. Índice de fontes no repositório

| Assunto | Arquivo |
|---|---|
| Mapa, regiões, gangues, chefes, portões | `src/pages/games/Gangues/data/ganguesTerritorios.js` |
| Geração de bando + equipe fixa dos chefes | `src/pages/games/Gangues/data/ganguesEncontros.js` |
| Fichas dos 36 inimigos + trash talk | `src/pages/games/Gangues/data/gangues-enemies.json` |
| Cena navegável da Pista (POIs, NPCs, diálogos) | `src/pages/games/Gangues/data/cenas/pista.js` |
| 30 lutadores recrutáveis | `ldi_gangues_30_personagens_v1.json` + `src/pages/games/Gangues/data/ganguesCharacters.js` |
| Todo o texto de história (abertura, bosses, territórios, final) | `src/i18n/gangues-{pt,en,es}.json` → `games.gangues.story` / `.cena` / `.dialogo` / `.naming` |
| Plano da cena navegável | `docs/Games/Gangues/GANGUES_MODO_HISTORIA_ENCONTROS.md` |
| Crime organizado de Marelia (cânone do livro) | `docs/LDI/IDEIAS_CONTOS_LEGENDS.md` + memória `crime-organizado-marelia.md` |
| Mecânica (fora deste doc) | `src/pages/games/Gangues/GANGUES_DESIGN.md`, `docs/Games/Gangues/GANGUES_HEADSUP.md`, `docs/Games/Gangues/GANGUES_PROGRESSAO_RASCUNHO.md` |
