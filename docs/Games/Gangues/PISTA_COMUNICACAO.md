# A PISTA — Toda a comunicação com o jogador (Território 1)

> **Pra que serve este documento.** Um levantamento COMPLETO de tudo que é dito
> ao jogador na Pista — do momento em que ele funda a gangue até dominar o
> bairro. Toda fala de NPC, todo texto de história, toda mensagem de gameplay,
> em ordem de fluxo.
>
> **Como usar.** O Isaias reescreve os textos aqui (mais gíria, mais cara de
> jogo de rua) direto neste .md e devolve. O agente então aplica as mudanças
> nos **três idiomas** (`src/i18n/gangues-pt.json`, `-en.json`, `-es.json`),
> usando a coluna **Chave** como endereço exato. EN e ES são traduções fiéis
> do PT reescrito — mantêm o sentido, adaptam a gíria pro registro de cada
> língua.
>
> **Fonte:** `src/pages/games/Gangues/data/cenas/pista.js` +
> `src/i18n/gangues-{pt,en,es}.json`. Lore em `LDI_GANGUES_GDD.md`.
> Estado: GANGUES_VERSION 2.74.6.

---

## Índice

0. [Antes da Pista — fundar a gangue e a explicação do Véio](#0-antes-da-pista)
1. [Chegada na Pista](#1-chegada-na-pista)
2. [Os pontos de interesse (POIs), em ordem de fluxo](#2-os-pois-em-ordem-de-fluxo)
3. [O muro e o túnel secreto](#3-o-muro-e-o-túnel-secreto)
4. [O galpão do Carvão (mini-dungeon)](#4-o-galpão-do-carvão)
5. [O Carvão — o chefe](#5-o-carvão--o-chefe)
6. [Feedback de gameplay (treta, parada, corre, descanso, combate)](#6-feedback-de-gameplay)
7. [Depois de tomar a Pista](#7-depois-de-tomar-a-pista)
8. [Rótulos, cenário e menores](#8-rótulos-cenário-e-menores)
9. [Ganchos pra frente (disparam na Pista, pagam depois)](#9-ganchos-pra-frente)

Legenda: 🇧🇷 PT (texto de trabalho) · 🇬🇧 EN · 🇪🇸 ES.
`[0] [1] …` = linhas de um balão de diálogo em sequência.

---

## 0. Antes da Pista

### 0.1 Fundar a gangue — abertura

**Chave:** `games.gangues.naming.abertura` · **Onde:** tela de criação do nome da gangue, balão do guia.

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Antes de tudo: tua gangue precisa de nome.<br>`[1]` Os lutador vêm e vão. O nome da gangue é o que fica — é ele que corre a boca do morro, é ele que vira lenda ou vira piada.<br>`[2]` Escolhe bem. É esse nome que o Retalho vai cuspir quando cê chegar na Laje. |
| 🇬🇧 | `[0]` First thing: your gang needs a name.<br>`[1]` Fighters come and go. The gang's name is what stays — it runs the mouth of the hill, it turns into a legend or into a joke.<br>`[2]` Choose well. This is the name the Patchwork spits when you reach the Rooftop. |
| 🇪🇸 | `[0]` Antes que nada: tu ganga necesita un nombre.<br>`[1]` Los luchadores van y vienen. El nombre de la ganga es lo que queda — corre la boca del cerro, se vuelve leyenda o se vuelve chiste.<br>`[2]` Elige bien. Es el nombre que el Retazo va a escupir cuando llegues a la Azotea. |

**Chaves menores da mesma tela:** `naming.titulo` "FUNDE A SUA GANGUE" · `naming.sub` "Os personagens importam. Mas é o nome da gangue que reverbera — é ele que os inimigos vão cuspir, é ele que vai dominar Marélia." · `naming.poster_pitch` "Toda rua conhece um nome. Escolha o que Marélia vai aprender a respeitar." · `naming.label` "Nome da gangue" · `naming.placeholder` "Ex: Bonde do Fim de Linha" · `naming.preview` "“A {nome} tá subindo o morro.”" · `naming.preview_vazio` "O nome que Marélia inteira vai aprender a temer." · `naming.fundar` "FUNDAR A GANGUE" · `naming.exemplos` "Ideias:" · sugestões: `sugestao_bonde` "Bonde do Fim de Linha", `sugestao_firma` "A Firma", `sugestao_trilha` "Trilha de Cima", `sugestao_sindicato` "Sindicato do Beco", `sugestao_quebrada` "Quebrada Nova".

### 0.2 A explicação do Véio (abertura da história)

**Chave:** `games.gangues.story.abertura` · **Onde:** entrada do Modo História, antes do mapa de Marélia.

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Senta aí que eu te explico como funciona.<br>`[1]` Marélia não tem dono. Tem gangue em cada beco, cada uma achando que manda no mundo porque manda numa rua.<br>`[2]` Cê quer subir? Começa na Pista, lá embaixo. Toma os ponto das gangue pequena, depois encara o foda da região — o dono da boca, o cara da bandeira.<br>`[3]` Toma o bairro, o de cima abre. Bairro por bairro até a Laje.<br>`[4]` Lá em cima tem um cara que ninguém sabe o nome de verdade. Só chamam ele de O Retalho. Ele já juntou seis bairro numa bandeira só. Ninguém nunca chegou mais perto de ser dono de Marélia.<br>`[5]` Cê vai ter que passar por ele. Boa sorte, cria — cê vai precisar. |
| 🇬🇧 | `[0]` Sit down, I'll tell you how this works.<br>`[1]` Marélia has no king. A gang in every alley, each one thinking it rules the world 'cause it rules one street.<br>`[2]` Want to rise? Start on the Track, down below. Take the small gangs' spots, then face the region's heavy — the one holding the flag.<br>`[3]` Take the block, the next one opens. Block by block up to the Rooftop.<br>`[4]` Up top there's someone nobody knows the real name of. They just call him the Patchwork. He once pulled six blocks under one flag. Nobody ever came closer to owning Marélia.<br>`[5]` You'll have to go through him. Good luck, kid — you'll need it. |
| 🇪🇸 | `[0]` Siéntate que te explico cómo funciona.<br>`[1]` Marélia no tiene dueño. Una ganga en cada callejón, cada una creyendo que manda en el mundo porque manda en una calle.<br>`[2]` ¿Quieres subir? Empieza en la Pista, abajo. Toma los puntos de las gangas chicas, después encara al duro de la zona — el de la bandera.<br>`[3]` Tomas el barrio, se abre el de arriba. Barrio por barrio hasta la Azotea.<br>`[4]` Arriba hay un tipo del que nadie sabe el nombre de verdad. Solo le dicen El Retazo. Juntó seis barrios bajo una bandera. Nadie llegó más cerca de ser dueño de Marélia.<br>`[5]` Vas a tener que pasar por él. Suerte, pibe — la vas a necesitar. |

**Contexto do mapa (mesma leva):** `story.titulo` "MARÉLIA SEM DONO" · `story.sub` "Antes do Alan, ninguém segurava Marélia. Era gangue em cada esquina, cada uma dona do próprio quarteirão. Um cara — o Retalho — quase juntou tudo. Quase. Agora é a tua vez de tentar." · `modes.intro` "Sua gangue nasceu. Agora é hora de tomar as ruas, território por território." · `modes.comecar_historia` "COMEÇAR A HISTÓRIA" · `story.entrar_territorio` "Entrar no território" · `story.boss_tag` "O foda da região".

### 0.3 Rótulos do balão de diálogo (o "chrome" de toda fala)

**Chave:** `games.gangues.dialogo.*` · **Onde:** todo GangDialog do jogo.

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `dialogo.voz` | Voz da quebrada | A voice from the block | Voz del barrio |
| `dialogo.veio_nome` | Nego Véio | Old Nego | Nego Viejo |
| `dialogo.veio_sub` | o coroa da esquina, dono da birosca | the corner elder, owner of the bar | el veterano de la esquina, dueño del bar |
| `dialogo.pular` | pular | skip | saltar |
| `dialogo.proximo` | continuar | go on | seguir |
| `dialogo.fechar` | entendi | got it | entendido |
| `dialogo.comecar` | bora | let's go | vamos |

---

## 1. Chegada na Pista

### 1.1 Fala de chegada (Nego Véio)

**Chave:** `games.gangues.cena.pista.chegada` · **Falante:** `dialogo.veio_nome` / `veio_sub` · **Onde:** GangDialog ao entrar na cena.

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Isso aqui é a Pista, cria. O asfalto lá embaixo — o começo de tudo.<br>`[1]` Aqui todo mundo começou. O Retalho começou. O Alan, noutro canto, também. Agora é a tua vez.<br>`[2]` Toma os ponto da molecada, faz teu nome na rua. Quando a Pista inteira souber teu nome, o Carvão desce do breu pra te encarar.<br>`[3]` Anda. Toca no que acender. |
| 🇬🇧 | `[0]` This is the Pista, kid. The asphalt down below — where everything starts.<br>`[1]` Everyone started here. The Patchwork started here. Alan, in another corner, too. Now it's your turn.<br>`[2]` Take the kids' spots, make your name on the street. When the whole Pista knows your name, Coal comes down out of the dark to face you.<br>`[3]` Move. Tap whatever lights up. |
| 🇪🇸 | `[0]` Esto es la Pista, pibe. El asfalto de abajo — donde empieza todo.<br>`[1]` Acá todos empezaron. El Retazo empezó acá. Alan, en otro rincón, también. Ahora te toca a vos.<br>`[2]` Tomá los puntos de la pibada, hacé tu nombre en la calle. Cuando toda la Pista sepa tu nombre, Carbón baja de la oscuridad a encararte.<br>`[3]` Andá. Tocá lo que se prenda. |

### 1.2 Descrição do território (card do mapa)

**Chave:** `games.gangues.story.territorios.pista` (`.nome` / `.desc`) · **Onde:** painel "Território selecionado" no mapa de Marélia.

| | nome | desc |
|---|---|---|
| 🇧🇷 | A Pista | O asfalto lá embaixo. Cria que corre no farol, arranca corrente, vende bala. A Rato de Pista sem ambição, o Bonde do Sinal vendendo o que vê. Ninguém importante — mas todo mundo começou aqui. O Retalho. O Alan, noutro canto. E agora você. |
| 🇬🇧 | The Track | The asphalt down below. Kids darting the light, snatching chains, selling gum. Rato de Pista with no ambition, Bonde do Sinal selling what it sees. Nobody important — but everyone started here. The Patchwork. Alan, in another corner. And now you. |
| 🇪🇸 | La Pista | El asfalto de abajo. Pibes que corren en el semáforo, arrancan cadenas, venden chicle. La Rato de Pista sin ambición, el Bonde do Sinal vendiendo lo que ve. Nadie importante — pero todos empezaron aquí. El Retazo. Alan, en otro rincón. Y ahora vos. |

### 1.3 Dicas (hints) que aparecem na cena

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.hint_andar` | Use o analógico pra andar pela quebrada. | Use the stick to walk the block. | Usá el joystick para caminar el barrio. |
| `cena.hint_interagir` | Chegou num ponto — aperte INTERAGIR. | You reached a spot — press INTERACT. | Llegaste a un punto — apretá INTERACTUAR. |
| `cena.hint_sucata` | 🔩 Leva os dois pedaço de sucata pro Nando na oficina. | 🔩 Take both scrap pieces to Nando at the workshop. | 🔩 Llevá los dos pedazos de chatarra a Nando en el taller. |

---

## 2. Os POIs, em ordem de fluxo

> Ordem canônica: **sinal → ferro-velho (+ fundo) → oficina → beco → birosca → corre → beco_2 → beco_3 → Sinaleiro Chefe → Rasteira Velha → [muro/túnel] → galpão → Carvão**.
> Opcionais soltos: rinha (farm), descanso, Duda (informante).

### 2.1 A boca do sinal — `papo` (visível desde o início)

**Chaves:** `games.gangues.cena.pista.sinal.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A boca do sinal | The stoplight corner | La esquina del semáforo |
| `.sub` | cria vendendo bala, olhando tudo | kid selling candy, watching everything | pibe vendiendo caramelos, mirando todo |

**`.fala`** (balão):

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Cê é da gangue nova? Desceu na Pista sem ninguém atrás. Corajoso ou burro — ainda vou saber.<br>`[1]` Aqui a gente não vende só bala. Vende o que a gente vê desse farol. E a gente vê tudo. Quer saber de alguma coisa? Troca uma ideia — ou um trocado. |
| 🇬🇧 | `[0]` You with the new gang? Came down to the Pista with nobody behind you. Brave or dumb — I'll find out.<br>`[1]` We don't just sell candy here. We sell what we see from this light. And we see everything. Want to know something? Trade a word — or some change. |
| 🇪🇸 | `[0]` ¿Sos de la banda nueva? Bajaste a la Pista sin nadie atrás. Valiente o boludo — ya voy a saber.<br>`[1]` Acá no vendemos solo caramelos. Vendemos lo que vemos desde este semáforo. Y vemos todo. ¿Querés saber algo? Cambiá una idea — o unas monedas. |

**Escolhas do papo** (`.escolhas.<id>.label` e `.resultado`):

| Escolha | Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `compra` (−4 💵) | label | Compra a bala e escuta o que ele viu | Buy the candy and hear what he saw | Comprá el caramelo y escuchá lo que vio |
| `compra` | resultado | Ele embolsa o trocado. "O ferro-velho ali na frente. O portão é só cadeado velho. Dentro tem sucata que vale grana — e o que o dono trancou antes de sumir da Pista." | He pockets the change. "The junkyard up ahead. Gate's just an old padlock. Inside there's scrap worth money — and whatever the owner locked away before he vanished off the Pista." | Se guarda las monedas. "El depósito de chatarra ahí adelante. El portón es solo un candado viejo. Adentro hay chatarra que vale plata — y lo que el dueño guardó bajo llave antes de desaparecer de la Pista." |
| `aperta` (−1 Nome, vira treta) | label | Aperta a cria pra ele falar de graça | Lean on the kid to make him talk for free | Apretá al pibe para que hable gratis |
| `ignora` | label | Ignora e segue subindo | Ignore him and keep climbing | Ignoralo y seguí subiendo |
| `ignora` | resultado | Cê passa reto. A cria cospe no chão e anota teu rosto. Logo adiante dá pra ver um ferro-velho. | You walk past. The kid spits and memorizes your face. There's a junkyard just ahead. | Pasás de largo. El pibe escupe y se guarda tu cara. Se ve un depósito de chatarra más adelante. |

> `aperta` não tem `.resultado`: cai direto na 1ª briga do jogo (revezamento fraco).

### 2.2 O ferro-velho — `parada` (puzzle "gazua"/Simon)

**Chaves:** `games.gangues.cena.pista.ferro.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O ferro-velho | The junkyard | El depósito de chatarra |
| `.sub` | portão no cadeado, segredo dentro | gate on a padlock, a secret inside | portón con candado, un secreto adentro |
| `.intro` | O portão é só corrente e um cadeado de segredo. A gangue observa os pinos girarem uma vez — depois é decorar a sequência e repetir sem errar. Erra, o vigia acorda. | The gate's just a chain and a combination lock. The gang watches the pins turn once — then it's memorize the sequence and repeat it without a slip. Miss it and the guard wakes up. | El portón es solo cadena y un candado de combinación. La banda mira los pines girar una vez — después es memorizar la secuencia y repetirla sin fallar. Si fallás, el sereno se despierta. |

> **Falhar o puzzle** → vira treta (revezamento fraco). Feedback em §6 (`cena.parada_falha`).

### 2.3 O fundo do ferro-velho — `achado` (2º pedaço de sucata)

**Chaves:** `games.gangues.cena.pista.achado.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O fundo do ferro-velho | The back of the junkyard | El fondo del depósito de chatarra |
| `.sub` | o que o dono deixou pra trás | what the owner left behind | lo que el dueño dejó atrás |
| `.linha` | Atrás de uma pilha de sucata: um caixote com uns trocado e ferro que ainda serve. Ninguém vai sentir falta — o dono sumiu da Pista faz tempo. | Behind a pile of scrap: a crate with some change and iron that still works. Nobody will miss it — the owner vanished off the Pista a long time ago. | Detrás de una pila de chatarra: un cajón con unas monedas y fierro que todavía sirve. Nadie lo va a extrañar — el dueño desapareció de la Pista hace rato. |

### 2.4 A oficina do Nando — `papo` (fetch quest da sucata)

**Chaves:** `games.gangues.cena.pista.oficina.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A oficina do Nando | Nando's workshop | El taller de Nando |
| `.sub` | o Seu Nando conserta o que a rua quebra | Mr. Nando fixes what the street breaks | Don Nando arregla lo que la calle rompe |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Ó a gangue nova batendo ponto. Vô te falar: pra encarar o Carvão precisa de ferro na mão, não só de coragem.<br>`[1]` Me traz dois pedaço de sucata daquele ferro-velho ali — um cê pega abrindo o cadeado, o outro tá no fundo. Traz que eu forjo uma peça pra vocês.<br>`[2]` E de brinde eu te conto onde o Carvão se enfia quando some no breu. Fechou? |
| 🇬🇧 | `[0]` Look at the new gang working the spots. Let me tell you: to face Coal you need iron in your hand, not just guts.<br>`[1]` Bring me two pieces of scrap from that junkyard — one you get cracking the lock, the other's in the back. Bring them and I'll forge you a piece.<br>`[2]` And as a bonus I'll tell you where Coal hides when he vanishes into the dark. Deal? |
| 🇪🇸 | `[0]` Mirá la pandilla nueva laburando los puntos. Te digo una cosa: para encarar a Carbón necesitás fierro en la mano, no solo huevos.<br>`[1]` Traeme dos pedazos de chatarra de ese depósito — uno lo sacás abriendo el candado, el otro está en el fondo. Traélos y te forjo una pieza.<br>`[2]` Y de yapa te digo dónde se esconde Carbón cuando desaparece en la oscuridad. ¿Trato? |

**Escolha `forjar`:**

| Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| label | Entrega a sucata e pega a peça | Hand over the scrap and take the piece | Entregá la chatarra y llevate la pieza |
| resultado | O Nando martela um tempo e te passa uma soqueira de lata ainda quente. "O Carvão fica no fundão do beco da Rasteira, atrás do muro. Some no escuro, mas some sempre pro mesmo canto. Agora vai." | Nando hammers for a while and passes you a still-warm tin knuckle. "Coal stays deep in Rasteira's alley, behind the wall. Vanishes in the dark, but always to the same corner. Now go." | Nando martilla un rato y te pasa un puño de lata todavía caliente. "Carbón para en el fondo del callejón de la Rasteira, atrás del muro. Desaparece en la oscuridad, pero siempre al mismo rincón. Ahora andá." |

### 2.5 O beco da Rasteira — `treta` (1ª luta de verdade)

**Chaves:** `games.gangues.cena.pista.beco.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O beco da Rasteira | Rasteira's alley | El callejón de la Rasteira |
| `.sub` | ponto da Rato de Pista | a Rato de Pista spot | punto de la Rato de Pista |
| `.fala` | Esse beco é da Rato de Pista, parça. A gente não quer subir, não quer teu bairro — só não quer ser pisado. E gangue nova que desce aqui é pisada. | This alley belongs to Rato de Pista, pal. We don't want to climb, don't want your turf — we just don't want to get stepped on. And a new gang coming down here gets stepped on. | Este callejón es de la Rato de Pista, socio. No queremos subir, no queremos tu barrio — solo no queremos que nos pisen. Y a la banda nueva que baja acá la pisan. |

### 2.6 A birosca do Seu Nato — `papo` (hub, obrigatório)

**Chaves:** `games.gangues.cena.pista.birosca.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A birosca do Seu Nato | Old Nato's bar | El bar de Don Nato |
| `.sub` | o coroa da esquina — o único adulto de confiança da Pista | the corner elder — the only grown-up on the Pista you can trust | el veterano de la esquina — el único adulto de la Pista en quien confiar |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Senta aí. Toma um mate. Cê tá subindo rápido demais pra quem ninguém conhece.<br>`[1]` Eu sei onde o Carvão se enfia quando some no breu. Te falo. Mas antes me faz um corre — leva um pacote pro outro lado sem a viatura pegar no facho.<br>`[2]` Faz isso e a Pista te respeita. E a birosca fica aberta pra vocês descansarem. |
| 🇬🇧 | `[0]` Sit down. Have some mate. You're climbing way too fast for someone nobody knows.<br>`[1]` I know where Coal hides when he vanishes into the dark. I'll tell you. But first do me a run — take a package across without the patrol car's beam catching you.<br>`[2]` Do that and the Pista respects you. And the bar stays open for your crew to rest. |
| 🇪🇸 | `[0]` Sentate. Tomá un mate. Estás subiendo demasiado rápido para alguien que nadie conoce.<br>`[1]` Sé dónde se mete Carbón cuando desaparece en la oscuridad. Te digo. Pero antes hacéme un mandado — llevá un paquete al otro lado sin que el haz del patrullero te agarre.<br>`[2]` Hacé eso y la Pista te respeta. Y el bar queda abierto para que tu banda descanse. |

**Escolhas:**

| Escolha | Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `aceita_corre` | label | Aceita o corre do Nato | Take Nato's run | Aceptá el mandado de Nato |
| `aceita_corre` | resultado | "Fechou. O pacote tá atrás do balcão. E o outro ponto da Rasteira é subindo à direita." | "Deal. The package is behind the counter. And Rasteira's other spot is up to the right." | "Cerrado. El paquete está atrás del mostrador. Y el otro punto de la Rasteira es subiendo a la derecha." |
| `so_papo` | label | Só quer a informação | Just want the information | Solo querés la información |
| `so_papo` | resultado | "Teimoso. Então vai no osso: o outro ponto da Rasteira é ali em cima. Bate os dois e o Carvão aparece." | "Stubborn. Then straight up: Rasteira's other spot is up there. Take both and Coal shows up." | "Terco. Entonces al hueso: el otro punto de la Rasteira está allá arriba. Tomá los dos y aparece Carbón." |

### 2.7 O corre do Nato — `corre` (stealth opcional)

**Chaves:** `games.gangues.cena.pista.corre.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O corre do Nato | Nato's run | El mandado de Nato |
| `.sub` | leva o pacote sem a viatura ver | carry the package without the patrol car seeing | llevá el paquete sin que el patrullero vea |
| `.intro` | Atravessa a quadra com o pacote sem entrar no facho da viatura. A gangue se espalha e cobre teu movimento. É o preço da informação do Nato — e da paz na Pista. | Cross the block with the package without stepping into the patrol car's beam. The gang spreads out and covers your move. It's the price of Nato's information — and of peace on the Pista. | Cruzá la cuadra con el paquete sin entrar en el haz del patrullero. La banda se abre y te cubre. Es el precio de la información de Nato — y de la paz en la Pista. |

### 2.8 O outro ponto da Rasteira — `treta` (beco_2)

**Chaves:** `games.gangues.cena.pista.beco_2.*` (só `nome` + `fala`, sem `sub`)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O outro ponto da Rasteira | Rasteira's other spot | El otro punto de la Rasteira |
| `.fala` | Cê de novo? Bateu o beco lá embaixo e achou que a Pista ia abrir pra vocês. A Rato de Pista muda de dono toda semana — mas não pra gangue nova. | You again? Took the alley down there and figured the Pista would open up for you. Rato de Pista changes hands every week — but not for a new gang. | ¿Vos de nuevo? Tomaste el callejón de abajo y pensaste que la Pista se iba a abrir para vos. La Rato de Pista cambia de dueño todas las semanas — pero no para una banda nueva. |

### 2.9 O terceiro ponto — `treta` (beco_3)

**Chaves:** `games.gangues.cena.pista.beco_3.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O terceiro ponto | The third spot | El tercer punto |
| `.sub` | mais um pedaço da Rato de Pista | another piece of Rato de Pista | otro pedazo de la Rato de Pista |
| `.fala` | Vocês não cansam, né? A Pista tem ponto que nem buraco de bala — sempre tem mais um. Esse aqui é meu. Vem provar que merece. | You people don't quit, huh? The Pista's got spots like bullet holes — there's always one more. This one's mine. Come prove you're worth it. | No aflojan, ¿eh? La Pista tiene puntos como agujeros de bala — siempre hay uno más. Este es mío. Vení a demostrar que valés. |

### 2.10 O Sinaleiro Chefe — `treta` (1º General da Pista)

**Chaves:** `games.gangues.cena.pista.sinaleiro.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O Sinaleiro Chefe | The Head Signalman | El Jefe de Señales |
| `.sub` | se ele apita, o bairro inteiro corre | if he whistles, the whole block runs | si él silba, corre todo el barrio |
| `.fala` | Eu comando os olho da Pista, cria. Cada vigia, cada farol, cada pivete no sinal responde pro meu apito. Cê passou por todos eles — mas não passa por mim. | I run the eyes of the Pista, kid. Every lookout, every light, every runner at the signal answers my whistle. You got past all of them — you don't get past me. | Yo manejo los ojos de la Pista, pibe. Cada campana, cada semáforo, cada pibe en la señal responde a mi silbato. Pasaste a todos ellos — a mí no me pasás. |

### 2.11 A Rasteira Velha — `treta` (2º General, "abre" o Carvão)

**Chaves:** `games.gangues.cena.pista.rasteira_velha.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A Rasteira Velha | Old Rasteira | La Rasteira Vieja |
| `.sub` | a dona do beco em pessoa | the alley's owner in person | la dueña del callejón en persona |
| `.fala` | Cê bateu os moleque e achou que a Pista era tua? A Rasteira Velha treinou cada um desses pivete. Bate em mim primeiro — aí sim o Carvão desce. | You beat the kids and figured the Pista was yours? Old Rasteira trained every one of these punks. Beat me first — then Coal comes down. | ¿Le pegaste a los pibes y pensaste que la Pista era tuya? La Rasteira Vieja entrenó a cada uno de estos pibes. Pegame a mí primero — ahí sí baja Carbón. |

### 2.12 A rinha do beco — `treta` (farm, opcional, visível desde o início)

**Chaves:** `games.gangues.cena.pista.rinha.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A rinha do beco | The back-alley pit | La riña del callejón |
| `.sub` | aposta clandestina | clandestine betting | apuesta clandestina |
| `.fala` | Roda de aposta no fundo do beco. Quem entra, apanha ou embolsa. Sempre tem um querendo testar a mão contra a gangue nova — bora, quantas vezes cê aguentar. | Betting ring at the back of the alley. You step in, you eat it or you cash out. There's always someone wanting to test their hand against the new gang — come on, as many times as you can take. | Rueda de apuestas en el fondo del callejón. El que entra, come piña o cobra. Siempre hay alguno que quiere probar la mano contra la banda nueva — dale, las veces que aguantes. |

### 2.13 Descanso na birosca — `descanso` (opcional, dentro da birosca)

**Chaves:** `games.gangues.cena.pista.descanso.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Descanso na birosca | Rest at the bar | Descanso en el bar |
| `.sub` | mate, pão e sossego | mate, bread and quiet | mate, pan y tranquilidad |
| `.intro` | Um tempo sentado, longe da rua, na birosca do Nato. Custa uns trocado, mas a gangue volta inteira pro corre. | Some time sitting, off the street, in Nato's bar. Costs a little change, but the gang comes back whole. | Un rato sentado, lejos de la calle, en el bar de Nato. Cuesta unas monedas, pero la banda vuelve entera. |

### 2.14 Duda, o Orelha — `papo` (informante, opcional; gancho pra Feira)

**Chaves:** `games.gangues.cena.pista.informante.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Duda, o Orelha | Duda, the Ear | Duda, la Oreja |
| `.sub` | sabe tudo que rola em Marélia antes de virar boato | knows everything that moves in Marélia before it's a rumor | sabe todo lo que pasa en Marélia antes de ser rumor |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Ô, voltou na Pista? A Pista é isso: tudo que rola em Marélia passa aqui antes de virar boato. E eu escuto tudo.<br>`[1]` Tem um bagulho na Feira que o pessoal de lá não te conta de graça. O Cobrador tá na tocaia. |
| 🇬🇧 | `[0]` Back on the Pista, huh? That's what the Pista is: everything that happens in Marélia passes through here before it's even a rumor. And I hear all of it.<br>`[1]` There's something at the Feira the people over there won't tell you for free. The Collector's laying low. |
| 🇪🇸 | `[0]` ¿Volviste a la Pista? Eso es la Pista: todo lo que pasa en Marélia pasa por acá antes de ser rumor. Y yo escucho todo.<br>`[1]` Hay algo en la Feria que la gente de allá no te cuenta gratis. El Cobrador está agazapado. |

**Escolha `perguntar`:**

| Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| label | Pergunta sobre a Feira | Ask about the Feira | Preguntá sobre la Feria |
| resultado | "O Cobrador só sai da toca se souber que já bateram nos batedor dele. Vai na Feira, resolve os ponto — depois volta aqui se precisar de mais." | "The Collector only comes out of hiding once he knows his enforcers already took a beating. Go to the Feira, settle the spots — then come back if you need more." | "El Cobrador solo sale del escondite si sabe que ya le dieron una paliza a sus matones. Andá a la Feria, resolvé los puntos — después volvé si necesitás más." |

---

## 3. O muro e o túnel secreto

> O muro no fim da rua **nunca abre por fora**. Fechados todos os pontos
> obrigatórios, destranca a **boca do túnel**; você fura por baixo, encara uns
> vigias e emerge do outro lado. O muro físico só abre depois de bater o Carvão.

### 3.1 Mensagens do muro / gate

| Chave | Onde | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `cena.boss_trancado` | trava no muro, antes de fechar os pontos | Fecha os ponto antes de subir | Lock the spots down before going up | Cerrá los puntos antes de subir |
| `cena.muro_tunel` | trava no muro, com os pontos já fechados | O muro não abre. Acha a passagem por baixo. | The wall won't open. Find the way under it. | El muro no se abre. Encontrá el paso por debajo. |

### 3.2 Nomes dos prédios do túnel e do interior

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.pista.predio.tunel_ent` | Barraco do beco | Alley shack | Casilla del callejón |
| `cena.pista.predio.tunel_sai` | Barraco do outro lado | Shack on the other side | Casilla del otro lado |
| `cena.pista.int.tunel` | A passagem por baixo do muro | The way under the wall | El paso por debajo del muro |

### 3.3 Os vigias do túnel — `treta` (revezamento fraco)

**Chaves:** `games.gangues.cena.pista.tunel.m1 / m2 / m3` (`.nome` / `.fala`)

| # | Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| m1 | nome | Vigia da boca | Mouth lookout | Vigía de la boca |
| m1 | fala | Ó, ninguém entra nesse buraco sem passar por mim. Volta pro teu lado, cria. | Nobody goes down this hole without going through me. Back to your side, kid. | Nadie baja a este pozo sin pasar por mí. Volvé a tu lado, pibe. |
| m2 | nome | Farejador do túnel | Tunnel tracker | Rastreador del túnel |
| m2 | fala | Cê acha que é o primeiro a tentar furar por baixo? Os que tentaram tão aí no escuro até hoje. | Think you're the first to try digging under? The ones who tried are still down here in the dark. | ¿Te creés el primero en intentar cavar por debajo? Los que intentaron siguen acá en la oscuridad. |
| m3 | nome | Vigia da saída | Exit lookout | Vigía de la salida |
| m3 | fala | Chegou do outro lado? Só passando por cima de mim. E eu não caio fácil. | Made it to the other side? Only over me. And I don't go down easy. | ¿Llegaste al otro lado? Solo pasando por encima de mí. Y no caigo fácil. |

### 3.4 Achado do túnel

**Chaves:** `games.gangues.cena.pista.tunel.achado.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Buraco na parede do túnel | Hole in the tunnel wall | Agujero en la pared del túnel |
| `.sub` | o que alguém escondeu aqui | what someone stashed here | lo que alguien escondió acá |
| `.linha` | Enfiado numa fresta da parede de terra: um bagulho que serve. | Jammed into a crack in the dirt wall: something useful. | Metido en una grieta de la pared de tierra: algo que sirve. |

---

## 4. O galpão do Carvão

> Mini-dungeon de 4 cômodos: **doca → estoque → escritório → o breu**.
> Nome do interior (`cena.pista.int.galpao`): 🇧🇷 Galpão do Carvão · 🇬🇧 Coal's Warehouse · 🇪🇸 Galpón de Carbón.

### 4.1 Cômodo 1 (doca) — Vapor de tocaia · `treta`

**Chaves:** `games.gangues.cena.pista.galpao.m1.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Vapor de tocaia | Vapor on lookout | Vapor de guardia |
| `.fala` | Ó os pivete da gangue nova querendo entrar no galpão. Aqui não entra playboy, cria. | Look at the new gang's kids trying to get in the warehouse. No playboys in here. | Mirá los pibes de la banda nueva queriendo entrar al galpón. Acá no entra ningún playboy. |

### 4.2 Cômodo 2 (estoque) — Cão Louco · `treta` + achado

**Chaves:** `games.gangues.cena.pista.galpao.m2.*` e `.achado.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `m2.nome` | Cão Louco | Mad Dog | Perro Loco |
| `m2.fala` | Passou da doca? Sorte sua que eu tava cochilando. Agora acorda pra briga. | Past the dock? Lucky I was dozing. Now wake up for the fight. | ¿Pasaste la dársena? Suerte que estaba dormitando. Ahora despertate para la pelea. |
| `achado.nome` | Prateleira do estoque | Stockroom shelf | Estante del depósito |
| `achado.sub` | o que o movimento guarda | what the operation keeps | lo que guarda el movimiento |
| `achado.linha` | No fundo da prateleira, embaixo de uns pano: um bagulho que serve. | Back of the shelf, under some rags: something useful. | Al fondo del estante, bajo unos trapos: algo que sirve. |

### 4.3 Cômodo 3 (escritório) — O contador do movimento · `papo`

**Chaves:** `games.gangues.cena.pista.galpao.contador.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O contador do movimento | The operation's bookkeeper | El contador del movimiento |
| `.sub` | anota tudo, apanha por qualquer um | keeps every tally, takes a beating for anyone | anota todo, cobra por cualquiera |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Não me bate, não! Eu só faço a conta! Eu falo, eu falo…<br>`[1]` O Carvão fica no breu, lá no fundão. Ele só desce quando o galpão inteiro já sabe que cê chegou. Agora cê chegou. |
| 🇬🇧 | `[0]` Don't hit me! I just do the math! I'll talk, I'll talk...<br>`[1]` Coal stays in the dark, way in the back. He only comes down once the whole warehouse knows you're here. Now they know. |
| 🇪🇸 | `[0]` ¡No me pegues! ¡Yo solo hago la cuenta! Hablo, hablo...<br>`[1]` Carbón está en la oscuridad, bien al fondo. Solo baja cuando todo el galpón sabe que llegaste. Ahora saben. |

**Escolhas:**

| Escolha | Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `escuta` | label | Escuta o que ele tem pra falar | Hear him out | Escuchá lo que tiene para decir |
| `escuta` | resultado | "O quadro ali atrás é o horário do movimento. O Carvão passa no último cômodo toda madrugada. Boa sorte, cria." | "That board back there is the operation schedule. Coal crosses the last room every dawn. Good luck, kid." | "Ese cuadro de atrás es el horario del movimiento. Carbón cruza el último cuarto cada madrugada. Suerte, pibe." |
| `aperta` (−rep, vira treta) | label | Aperta o coitado (−rep) | Rough the poor guy up (−rep) | Apretá al pobre tipo (−rep) |

### 4.4 Cômodo 4 (o breu) — o Carvão está parado no escuro → `DESAFIAR`

Sem texto próprio de cômodo. Ao chegar perto do Carvão, abre o confronto de chefe (§5).

---

## 5. O Carvão — o chefe

**Chaves:** `games.gangues.story.bosses.fumaca.*` (o combate real usa esta ficha) e `games.gangues.cena.pista.boss` (o pino na cena aponta pra cá).

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Carvão | Coal | Carbón |
| `.fala` | Cê é ligeiro? Eu sou fumaça, cria. Pisca que eu sumo — e cê apanha no escuro. | You quick? I'm smoke, kid. Blink and I'm gone — and you eat it in the dark. | ¿Eres rápido? Yo soy humo, pibe. Parpadeas y desaparezco — y te comes los golpes a oscuras. |

**Tela de confronto (TretaVS):** `story.boss_tag` 🇧🇷 "O foda da região" / 🇬🇧 "The region's heavy" / 🇪🇸 "El duro de la zona" · botões `cena.treta_sim` / `cena.treta_nao` (§6.1).

---

## 6. Feedback de gameplay

### 6.1 Confirmar / recusar uma treta

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.treta_sim` | Brigar | Fight | Pelear |
| `cena.treta_nao` | Agora não | Not now | Ahora no |

### 6.2 Parada (puzzle)

| Chave | Quando | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `cena.parada_tentar` | botão de encarar o puzzle | Encarar | Take it on | Encarar |
| `cena.parada_pular` | botão de deixar pra lá | Deixa pra lá | Leave it | Dejalo |
| `cena.parada_ok` | acertou | Deu certo. A rua abriu. | Worked. The street opened up. | Salió bien. La calle se abrió. |
| `cena.parada_falha` | errou (vira treta) | Foi mal — e agora acordou treta. | Botched it — and now there's a fight. | Se pudrió — y ahora hay pelea. |
| `cena.parada_falha_leve` | errou (sem treta) | Não rolou. Fica pra próxima. | Didn't work. Next time. | No salió. Para la próxima. |

### 6.3 Corre (stealth)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.corre_ok` | Corre feito. O Nato paga o combinado. | Run done. Nato pays what he owes. | Mandado hecho. Nato paga lo acordado. |
| `cena.corre_falha` | A viatura te viu. Larga o pacote e corre. | The patrol car saw you. Drop the package and run. | El patrullero te vio. Soltá el paquete y corré. |

### 6.4 Descanso na birosca

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.descanso_curar` | Descansar (−{grana}) | Rest (−{grana}) | Descansar (−{grana}) |
| `cena.descanso_curou` | A gangue respirou. +{n} de fôlego. | The gang caught its breath. +{n} wind. | La banda respiró. +{n} de aliento. |
| `cena.descanso_cheio` | A gangue já tá inteira. | The gang's already at full. | La banda ya está entera. |
| `cena.descanso_sem_grana` | Sem grana pro descanso. | Not enough cash for a rest. | No hay plata para el descanso. |

### 6.5 Fôlego baixo

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.folego_baixo` | A gangue tá acabada. Passa na birosca antes de brigar de novo. | The gang's spent. Hit the bar before fighting again. | La banda está reventada. Pasá por el bar antes de pelear de nuevo. |

### 6.6 Resultado de combate (tela de relatório)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `vitoria` | VITÓRIA | VICTORY | VICTORIA |
| `derrota` | DERROTA | DEFEAT | DERROTA |
| `derrota_sub` | A derrota só fortalece quem luta. | *(ver en.json)* | *(ver es.json)* |
| `report.mission_complete` | RELATÓRIO // OPERAÇÃO CONCLUÍDA | REPORT // OPERATION COMPLETE | INFORME // OPERACIÓN COMPLETADA |
| `report.mission_failed` | RELATÓRIO // OPERAÇÃO FRACASSADA | REPORT // OPERATION FAILED | INFORME // OPERACIÓN FALLIDA |
| `report.victory_message` | Sua gangue controlou o combate. Analise cada decisão abaixo. | Your gang controlled the fight. Analyze every decision below. | Tu pandilla controló el combate. Analiza cada decisión abajo. |
| `report.defeat_message` | A gangue caiu, mas o registro mostra onde a luta foi perdida. | The gang fell, but the record shows where the fight was lost. | La pandilla cayó, pero el registro muestra dónde se perdió la lucha. |

### 6.7 Recompensa (toast)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.recompensa` | Levou | You got | Te llevaste |
| `cena.itens.sucata` | Sucata (item) | Scrap (item) | Chatarra (ítem) |

---

## 7. Depois de tomar a Pista

| Chave | Onde | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `cena.bairro_tomado` | selo no cabeçalho da cena | Bairro tomado | Block taken | Barrio tomado |
| `story.dominado` | selo no card do mapa | Bairro tomado | Block taken | Barrio tomado |
| `story.continuar_territorio` | botão pós-vitória | Continuar no bairro | Stay on the block | Seguir en el barrio |

### 7.1 A loja da Pista (abre com o muro/depois do chefe)

**Nomes:** `cena.pista.predio.lojapista` 🇧🇷 "Loja da Pista" / 🇬🇧 "Pista Shop" / 🇪🇸 "Tienda de la Pista" · `cena.pista.int.loja` 🇧🇷 "Mercearia da Cida" / 🇬🇧 "Cida's Corner Store" / 🇪🇸 "Almacén de Cida" · `cena.pista.loja.nome` "Loja da Pista".

**UI da loja** (`games.gangues.loja.*`): `titulo` "Loja" · `sub` "Compra com a grana da gangue — dá pra usar em qualquer luta." · `comprar` "Comprar" · `sem_grana` "Grana insuficiente" · `no_inventario` "Você tem: {n}" · `compra_feita` "Comprado!" · `custo` "{n} 💵".

---

## 8. Rótulos, cenário e menores

### 8.1 Verbos de ação (botão contextual)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.acao.entrar` | ENTRAR | ENTER | ENTRAR |
| `cena.acao.sair` | SAIR | EXIT | SALIR |
| `cena.acao.voltar` | VOLTAR | BACK | VOLVER |
| `cena.acao.avancar` | AVANÇAR | GO IN | AVANZAR |
| `cena.acao.subir` | SUBIR | GO UP | SUBIR |
| `cena.acao.desafiar` | DESAFIAR | CHALLENGE | DESAFIAR |
| `cena.acao.trancado` | TRANCADO | LOCKED | TRABADO |
| `cena.comodo` | CÔMODO {n}/{de} | ROOM {n}/{de} | CUARTO {n}/{de} |
| `cena.nivel` | NÍVEL {n} | LEVEL {n} | NIVEL {n} |

### 8.2 Tipos de pino (legenda / rótulo do POI)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.tipo.treta` | Treta | Fight | Pelea |
| `cena.tipo.parada` | Parada | Job | Laburo |
| `cena.tipo.papo` | Papo | Talk | Charla |
| `cena.tipo.corre` | Corre | Run | Mandado |
| `cena.tipo.achado` | Achado | Find | Hallazgo |
| `cena.tipo.descanso` | Birosca | Bar | Bar |
| `cena.tipo.loja` | Loja | Shop | Tienda |

### 8.3 HUD / recursos

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.grana` | Grana | Cash | Plata |
| `cena.rep` | Nome | Name | Nombre |
| `cena.folego` | Fôlego da gangue | Gang's wind | Aliento de la banda |
| `cena.opcional` | de boa | optional | opcional |
| `cena.fechar` | Fechar | Close | Cerrar |

### 8.4 Cenário / prédios (nomes que aparecem no mapa)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.pista.grafite` | A RUA / LEMBRA | THE STREET / REMEMBERS | LA CALLE / RECUERDA |
| `cena.pista.predio.bar` | Bar do Zé | Zé's Bar | Bar de Zé |
| `cena.pista.predio.banca` | Banca fechada | Shut-down stand | Puesto cerrado |
| `cena.pista.predio.mercado` | Mercadinho da Cida | Cida's Corner Store | Almacén de Cida |
| `cena.pista.predio.fliperama` | Fliperama do Kiko | Kiko's Arcade | Fliper de Kiko |
| `cena.pista.predio.oficina` | Oficina do Nando | Nando's Workshop | Taller de Nando |
| `cena.pista.int.birosca` | Birosca do Seu Nato | Nato's Bar | Bar de Don Nato |
| `cena.pista.int.oficina` | Oficina do Nando | Nando's Workshop | Taller de Nando |

### 8.5 Facção / gangue da Pista (rótulos)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `story.gangues.rato_pista` | Rato de Pista | Track Rats | Rato de Pista |
| `story.gangues.bonde_sinal` | Bonde do Sinal | Red-Light Crew | Bonde do Sinal |
| `story.dificuldades.rato` | Rato de rua | Street rat | Rata de calle |
| `story.falas.ponto` | {territorio}. Esse ponto é da {gangue}, parça. A {suaGangue} não passa daqui de graça. | {territorio}. This spot belongs to {gangue}, pal. {suaGangue} doesn't walk through here for free. | {territorio}. Ese punto es de {gangue}, parce. {suaGangue} no pasa de aquí gratis. |

---

## 9. Ganchos pra frente

Textos que **disparam na Pista** mas pagam/aparecem depois — reescrever junto pra manter a voz:

| Chave | 🇧🇷 | Quando |
|---|---|---|
| `story.precisa_informante` | 🔍 Antes de encarar o chefe, volte na Pista e converse com o informante. | ao tentar o chefe da Feira sem ter falado com o Duda |
| `story.final.*` | "A SUBIDA ACABA AQUI" / "MARÉLIA NÃO SE COSTURA" / 3 parágrafos | só na Laje, mas fecha o arco que a Pista abre (o Retalho, o Alan) |

---

## Fora de escopo (não reescrever aqui)

- **Tutoriais de sistema** (`games.gangues.tutorial_attrs`, `games.gangues.combate`, etc.) — explicam a mecânica de combate/ficha, não a história da Pista.
- **Rótulos genéricos de combate** (`ATACAR`, `PV`, `PM`, ordem de iniciativa, log de batalha) — `games.gangues.report.*` e afins.
- **Álbum de Marélia** (`games.gangues.enemy_album.*`) — linhas de lore dos inimigos; catálogo próprio, tem seção no GDD §5.
