# A PISTA — Toda a comunicação com o jogador (Território 1)

> **Estado: ATUAL.** Regenerado da build viva — GANGUES 2.74.8 / SITE 10.280.11.
> Reflete o texto com gíria pesada / cara de facção já publicado nos 3 JSONs.
>
> **Pra que serve.** Levantamento completo de tudo que é dito ao jogador na
> Pista, do momento em que ele funda a gangue até dominar o bairro — em ordem
> de fluxo, com a chave i18n exata e PT/EN/ES lado a lado.
>
> **Como usar.** O Isaias reescreve o texto direto aqui e devolve; o agente
> aplica nos três arquivos (`src/i18n/gangues-{pt,en,es}.json`) usando a coluna
> **Chave** como endereço. EN/ES são adaptação livre (não tradução literal) —
> mantêm o sentido, adaptam a gíria ao registro de cada língua.
>
> **Trash talk de combate:** onde a `.fala` é um **array**, o `TretaVS` sorteia
> uma linha por encontro (`escolherFala()` em `GanguesCena.jsx`) — não repete
> sempre a mesma. Isso cobre v1 (abertura) e v2 (revanche). As falas v3
> (perdendo, no meio do combate) e v4 (derrota do chefe) ainda **não** têm
> fiação — precisam da tela de combate. Ver §10.
>
> **Fonte:** `src/pages/games/Gangues/data/cenas/pista.js` +
> `src/i18n/gangues-{pt,en,es}.json`. Lore em `LDI_GANGUES_GDD.md`.

Legenda: 🇧🇷 PT (texto de trabalho) · 🇬🇧 EN · 🇪🇸 ES.
`[0] [1] …` = linhas de um balão em sequência (todas mostradas).
`{0} {1} …` = variações de um array de trash talk (uma sorteada por vez).

---

## Índice

0. [Antes da Pista](#0-antes-da-pista)
1. [Chegada na Pista](#1-chegada-na-pista)
2. [Os POIs, em ordem de fluxo](#2-os-pois-em-ordem-de-fluxo)
3. [O muro e o túnel secreto](#3-o-muro-e-o-túnel-secreto)
4. [O galpão do Carvão](#4-o-galpão-do-carvão)
5. [O Carvão — o chefe](#5-o-carvão--o-chefe)
6. [Feedback de gameplay](#6-feedback-de-gameplay)
7. [Depois de tomar a Pista](#7-depois-de-tomar-a-pista)
8. [Rótulos, cenário e menores](#8-rótulos-cenário-e-menores)
9. [Ganchos pra frente](#9-ganchos-pra-frente)
10. [Trash talk — o que existe e o que falta](#10-trash-talk--o-que-existe-e-o-que-falta)

---

## 0. Antes da Pista

### 0.1 Fundar a gangue — abertura

**Chave:** `games.gangues.naming.abertura` · **Onde:** tela de criação do nome, balão do guia.

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Então cê tá pensando em montar uma gangue, é? Achando que dá conta das grande de Marélia?<br>`[1]` Toma cuidado com o que cê deseja, cria. Lá em cima tem gente que já comeu bandeira inteira no café da manhã. O Retalho já juntou seis bairro numa mão só — e cê tá aqui, do nada, achando que vai ser diferente.<br>`[2]` Mas beleza. Só passa não sem nome. Nome de rua vira lenda ou vira piada — e é ele que vão cuspir na tua cara quando cê tiver na Laje, de frente pro foda de verdade. Escolhe direito. |
| 🇬🇧 | `[0]` So you're thinking about starting a gang, huh? Think you can hang with Marélia's heavy hitters?<br>`[1]` Careful what you wish for, kid. Up there are people who've swallowed whole flags for breakfast. The Patchwork once held six blocks in one hand — and you're here, out of nowhere, thinking it'll go different for you.<br>`[2]` Fine. Just don't go nameless. A street name becomes a legend or a joke — and it's the one they'll spit back in your face when you're on the Rooftop, face to face with the real deal. Choose wisely. |
| 🇪🇸 | `[0]` ¿Así que pensás armar una ganga? ¿Creés que podés con las grandes de Marélia?<br>`[1]` Cuidado con lo que pedís, pibe. Allá arriba hay gente que ya se desayunó bandera entera. El Retazo llegó a juntar seis barrios en una sola mano — y vos acá, de la nada, pensando que con vos va a ser distinto.<br>`[2]` Igual, dale. Pero no vayas sin nombre. Nombre de calle se vuelve leyenda o se vuelve chiste — y es lo que te van a escupir en la cara cuando estés en la Azotea, cara a cara con el peso pesado de verdad. Elegí bien. |

**Menores da mesma tela:**

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `naming.titulo` | FUNDA A TUA GANGUE | FOUND YOUR GANG | FUNDA TU GANGA |
| `naming.sub` | Os cria importam, mas é o nome da gangue que ecoa na quebrada inteira — é ele que os inimigo vão cuspir quando cair de boca no chão, é ele que vai dominar Marélia ou vai virar piada de esquina. | The crew matters, but it's the gang's name that echoes across the whole block — the one enemies spit out when they hit the dirt, the one that takes Marélia or turns into a corner joke. | Los pibes importan, pero es el nombre de la ganga el que resuena en todo el barrio — el que los enemigos escupen cuando caen de boca al piso, el que va a dominar Marélia o va a ser chiste de esquina. |
| `naming.poster_pitch` | Toda rua conhece um nome. Escolhe o que Marélia inteira vai aprender a respeitar — ou a temer. | Every street knows a name. Choose the one all of Marélia learns to respect — or to fear. | Cada calle conoce un nombre. Elegí el que Marélia entera va a aprender a respetar — o a temer. |
| `naming.preview` | “A {nome} tá subindo o morro. Reza pra não cruzar o caminho dela.” | "{nome} is coming up the hill. Pray you don't cross its path." | «{nome} está subiendo el cerro. Rezá para no cruzarte en su camino.» |
| `naming.preview_vazio` | O nome que vai fazer Marélia inteira travar quando ouvir de longe. | The name that makes all of Marélia freeze when they hear it coming. | El nombre que hace que Marélia entera se frene cuando lo escucha de lejos. |
| `naming.label` | Nome da gangue | Gang name | Nombre de la ganga |
| `naming.placeholder` | Ex: Bonde do Fim de Linha | e.g. End of the Line Crew | Ej: La Banda del Fin de Línea |
| `naming.fundar` | FUNDAR A GANGUE | FOUND THE GANG | FUNDAR LA GANGA |
| `naming.exemplos` | Ideias: | Ideas: | Ideas: |

Sugestões de nome (`naming.sugestao_*`): 🇧🇷 Bonde do Fim de Linha · A Firma · Trilha de Cima · Sindicato do Beco · Quebrada Nova.

### 0.2 A explicação do Véio (abertura da história)

**Chave:** `games.gangues.story.abertura` · **Onde:** entrada do Modo História, antes do mapa.

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Senta aí, cria, que eu vou te dar o real.<br>`[1]` Marélia não tem dono, nunca teve. É facção em cada beco, cada uma se achando o auê do pedaço só porque manda numa rua de nada.<br>`[2]` Cê quer subir na vida? Começa aqui embaixo, na Pista — no chão, com os moleque. Toma os ponto dos peixe pequeno, cresce, e depois encara o foda de verdade da região: o dono da bandeira, aquele que ninguém passa por cima.<br>`[3]` Domina um bairro, o de cima libera. Assim vai — bairro por bairro, sangue por sangue, até a Laje.<br>`[4]` Lá em cima tem um tal que ninguém sabe o nome de batismo. Só chamam de O Retalho. Já costurou seis bairro numa bandeira só — coisa que ninguém, NINGUÉM chegou perto de fazer.<br>`[5]` Cê vai ter que passar por ele. Não é sobre querer, é sobre aguentar. Boa sorte, cria — vai precisar de mais que sorte. |
| 🇬🇧 | `[0]` Sit down, kid, let me give you the real deal.<br>`[1]` Marélia never had an owner. A crew in every alley, each one thinking they run the world 'cause they run one street.<br>`[2]` Want to rise? Start down here, on the ground, with the kids. Take the small fish's spots, grow, then face the region's real heavy — the flag holder, the one nobody walks over.<br>`[3]` Take a block, the next opens up. Block by block, blood by blood, up to the Rooftop.<br>`[4]` Up there's a guy nobody knows the real name of. They just call him the Patchwork. Stitched six blocks under one flag — something NOBODY else ever got close to.<br>`[5]` You'll have to go through him. It's not about wanting it, it's about surviving it. Good luck, kid — you'll need more than luck. |
| 🇪🇸 | `[0]` Sentate, pibe, que te tiro la posta.<br>`[1]` Marélia nunca tuvo dueño. Una banda en cada callejón, cada una creyéndose la más pesada solo porque manda en una calle de nada.<br>`[2]` ¿Querés subir? Empezá acá abajo, en el piso, con los pibes. Tomá los puntos de los peces chicos, crecé, y después encará al duro de verdad de la zona — el de la bandera, el que nadie pisa.<br>`[3]` Dominás un barrio, se abre el siguiente. Así, barrio por barrio, sangre por sangre, hasta la Azotea.<br>`[4]` Arriba hay uno del que nadie sabe el nombre real. Le dicen El Retazo. Cosió seis barrios bajo una sola bandera — algo que NADIE más se acercó a hacer.<br>`[5]` Vas a tener que pasar por él. No es sobre querer, es sobre aguantar. Suerte, pibe — vas a necesitar más que eso. |

### 0.3 Rótulos do balão de diálogo

**Chave:** `games.gangues.dialogo.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `dialogo.voz` | Voz da quebrada | A voice from the block | Voz del barrio |
| `dialogo.veio_nome` | Nego Véio | Old Nego | Nego Viejo |
| `dialogo.veio_sub` | o coroa da esquina, dono da birosca | the corner elder, owner of the bar | el veterano de la esquina, dueño del bar |
| `dialogo.pular` | avança logo | get on with it | avanzá ya |
| `dialogo.proximo` | segue | keep going | seguí |
| `dialogo.fechar` | entendido, patrão | got it, boss | entendido, patrón |
| `dialogo.comecar` | partiu | let's roll | arrancamos |

---

## 1. Chegada na Pista

### 1.1 Fala de chegada (Nego Véio)

**Chave:** `games.gangues.cena.pista.chegada`

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Essa aqui é a Pista, cria. O asfalto lá embaixo — a raiz de tudo.<br>`[1]` Todo mundo que é alguém hoje começou raspando o chão aqui. O Retalho começou. O Alan, noutro canto, também começou do zero igual cê. Agora é a tua vez de provar que não é só mais um.<br>`[2]` Toma os ponto da molecada, faz teu nome correr boca a boca. Quando a Pista inteira souber que cê existe, o Carvão desce do breu pra te encarar de frente — e aí sim cê descobre se tem estofo.<br>`[3]` Bora. Toca em tudo que tiver acendendo. |
| 🇬🇧 | `[0]` This is the Pista, kid. The asphalt down below — the root of it all.<br>`[1]` Everybody worth something today crawled on this ground first. The Patchwork started here. Alan, elsewhere, started from zero just like you. Now it's your turn to prove you're not just another face.<br>`[2]` Take the kids' spots, get your name running mouth to mouth. When the whole Pista knows you exist, Coal comes down out of the dark to face you — and that's when you find out if you've got what it takes.<br>`[3]` Move. Touch whatever's lighting up. |
| 🇪🇸 | `[0]` Esta es la Pista, pibe. El asfalto de abajo — la raíz de todo.<br>`[1]` Todo el que hoy es alguien empezó rasguñando este piso. El Retazo empezó acá. Alan, en otro lado, también arrancó de cero como vos. Ahora te toca demostrar que no sos uno más.<br>`[2]` Tomá los puntos de la pibada, hacé correr tu nombre boca a boca. Cuando toda la Pista sepa que existís, Carbón baja de la oscuridad a encararte de frente — ahí vas a saber si tenés madera.<br>`[3]` Dale. Tocá todo lo que se prenda. |

### 1.2 Descrição do território (card do mapa)

**Chave:** `games.gangues.story.territorios.pista`

| | nome | desc |
|---|---|---|
| 🇧🇷 | A Pista | O asfalto lá embaixo, cru. Cria correndo atrás de corrente, vendendo bala, virando os olho pra tudo. A Rato de Pista sem sonho grande, o Bonde do Sinal fazendo dinheiro com informação. Ninguém de peso ainda — mas todo dono de bandeira já pisou aqui primeiro. O Retalho pisou. O Alan pisou, noutro canto. Agora é tua vez. |
| 🇬🇧 | The Track | The raw asphalt down below. Kids chasing chains, selling gum, eyes everywhere. Rato de Pista with no big dreams, Bonde do Sinal cashing in on information. Nobody heavy yet — but every flag holder walked here first. The Patchwork did. Alan did, elsewhere. Now it's your turn. |
| 🇪🇸 | La Pista | El asfalto crudo de abajo. Pibes corriendo atrás de cadenas, vendiendo chicle, con el ojo en todo. La Rato de Pista sin sueños grandes, el Bonde do Sinal haciendo plata con información. Nadie de peso todavía — pero todo dueño de bandera pisó acá primero. El Retazo pisó. Alan pisó, en otro rincón. Ahora es tu turno. |

### 1.3 Dicas (hints)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.hint_andar` | Usa o analógico e desce pra rua. | Use the stick and head down to the street. | Usá el joystick y bajá a la calle. |
| `cena.hint_interagir` | Chegou num ponto quente — aperta INTERAGIR. | You hit a hot spot — press INTERACT. | Llegaste a un punto caliente — apretá INTERACTUAR. |
| `cena.hint_sucata` | 🔩 Leva os dois pedaço de sucata pro Nando, na oficina. Ele te retorna. | 🔩 Take both scrap pieces to Nando at the workshop. He'll sort you out. | 🔩 Llevá los dos pedazos de chatarra a Nando, en el taller. Él te devuelve el favor. |

---

## 2. Os POIs, em ordem de fluxo

> Ordem canônica: **sinal → ferro-velho (+ fundo) → oficina → beco → birosca → corre → beco_2 → beco_3 → Sinaleiro Chefe → Rasteira Velha → [muro/túnel] → galpão → Carvão**.
> Opcionais: rinha (farm), descanso, Duda.

### 2.1 A boca do sinal — `papo`

**Chaves:** `games.gangues.cena.pista.sinal.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A boca do sinal | The stoplight corner | La esquina del semáforo |
| `.sub` | cria vendendo bala, de olho vivo em tudo | kid selling candy, sharp eyes on everything | pibe vendiendo caramelos, ojo vivo en todo |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Ô, cê é da gangue nova? Desceu na Pista sozinho, sem tropa atrás. Ou cê é corajoso, ou é burro — vou saber já já.<br>`[1]` Aqui a gente não vende só bala não, mano. A gente vende o que vê desse sinal. E a gente vê TUDO que rola nessa quebrada. Quer saber de um bagulho? Troca uma ideia — ou troca uma grana. |
| 🇬🇧 | `[0]` Hey, you with the new gang? Came down to the Pista alone, no crew behind you. Either you're brave or you're stupid — I'll know real soon.<br>`[1]` We don't just sell candy here, man. We sell what we see from this light. And we see EVERYTHING that moves on this block. Want to know something? Trade a word — or trade some cash. |
| 🇪🇸 | `[0]` Ey, ¿sos de la banda nueva? Bajaste a la Pista solo, sin tropa atrás. O sos valiente, o sos boludo — ya lo voy a saber.<br>`[1]` Acá no vendemos solo caramelos, loco. Vendemos lo que vemos desde este semáforo. Y vemos TODO lo que se mueve en el barrio. ¿Querés saber algo? Cambiá una idea — o cambiá plata. |

**Escolhas:**

| Escolha · Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `compra` · label (−4💵) | Compra a bala e escuta o que ele viu | Buy the candy and hear what he saw | Comprá el caramelo y escuchá lo que vio |
| `compra` · resultado | Ele fecha a mão no trocado sem nem contar. "O ferro-velho ali na frente, memo. Cadeado veio, moleza pra abrir. Lá dentro tem sucata que vale rocha — e o que o dono deixou antes de sumir da Pista de vez." | He closes his fist on the change without even counting it. "The junkyard right up ahead. Old padlock, easy to crack. Inside there's scrap worth real money — and whatever the owner left before he vanished off the Pista for good." | Cierra la mano sobre las monedas sin ni contarlas. "El depósito de chatarra ahí adelante, ese. Candado viejo, fácil de abrir. Adentro hay chatarra que vale plata de verdad — y lo que el dueño dejó antes de desaparecer de la Pista para siempre." |
| `aperta` · label (−1 Nome, vira treta) | Aperta o pivete pra falar sem custar nada | Lean on the kid so he talks for free | Apretá al pibe para que hable sin cobrar |
| `ignora` · label | Ignora e segue subindo | Ignore him and keep climbing | Ignoralo y seguí subiendo |
| `ignora` · resultado | Cê passa reto, sem nem trocar olhar. O moleque cospe no chão e grava tua cara na memória — informação também é moeda, e agora ele te deve uma. Mais na frente dá pra ver um ferro-velho. | You walk past without even a glance. The kid spits and burns your face into memory — information's a currency too, and now he owes you one. There's a junkyard up ahead. | Pasás de largo sin ni cruzarle la mirada. El pibe escupe y se graba tu cara en la memoria — la información también es moneda, y ahora te debe una. Más adelante se ve un depósito de chatarra. |

### 2.2 O ferro-velho — `parada` (puzzle "gazua"/Simon)

**Chaves:** `games.gangues.cena.pista.ferro.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O ferro-velho | The junkyard | El depósito de chatarra |
| `.sub` | portão trancado, segredo guardado | locked gate, a secret kept inside | portón trancado, un secreto guardado |
| `.intro` | O portão é só corrente com cadeado de segredo — nada que uma mão treinada não resolva. A tropa presta atenção nos pino girando uma vez, depois é decorar a sequência e repetir sem tremer. Erra a mão, o vigia acorda e a brincadeira vira treta na hora. | The gate's just a chain with a combination lock — nothing a trained hand can't handle. The crew watches the pins turn once, then it's memorize the sequence and repeat it without a shake. Slip a hand and the guard wakes up and the game turns into a fight on the spot. | El portón es solo cadena con candado de combinación — nada que una mano entrenada no resuelva. La tropa mira los pines girar una vez, después es memorizar la secuencia y repetirla sin temblar. Si te tiembla la mano, el sereno se despierta y el jueguito se vuelve pelea al toque. |

> Falhar o puzzle → vira treta (revezamento fraco). Feedback em §6.

### 2.3 O fundo do ferro-velho — `achado`

**Chaves:** `games.gangues.cena.pista.achado.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O fundo do ferro-velho | The back of the junkyard | El fondo del depósito de chatarra |
| `.sub` | o que o dono deixou pra trás | what the owner left behind | lo que el dueño dejó atrás |
| `.linha` | Atrás de uma pilha de sucata, um caixote esquecido: uns trocado e ferro que ainda presta. Ninguém vai sentir falta — o dono já era, sumiu da Pista faz tempo e ninguém pergunta o porquê. | Behind a pile of scrap, a forgotten crate: some change and iron that still works. Nobody will miss it — the owner's long gone, vanished off the Pista, and nobody asks why. | Detrás de una pila de chatarra, un cajón olvidado: unas monedas y fierro que todavía sirve. Nadie lo va a extrañar — el dueño ya fue, desapareció de la Pista hace rato y nadie pregunta por qué. |

### 2.4 A oficina do Nando — `papo`

**Chaves:** `games.gangues.cena.pista.oficina.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A oficina do Nando | Nando's workshop | El taller de Nando |
| `.sub` | o Seu Nando conserta o que a rua quebra | Mr. Nando fixes what the street breaks | Don Nando arregla lo que la calle rompe |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Ó a gangue novinha já batendo ponto. Vô te falar uma coisa, cria: pra encarar o Carvão precisa de ferro na mão, não só peito.<br>`[1]` Me traz dois pedaço de sucata daquele ferro-velho — um cê tira abrindo o cadeado, o outro tá escondido no fundo. Traz que eu forjo uma peça na hora pra tua tropa.<br>`[2]` E de brinde eu solto onde o Carvão se enfia quando some no breu. Isso vale mais que qualquer arma, cria. Fechamos? |
| 🇬🇧 | `[0]` Look at the fresh little gang already working the spots. Let me tell you something, kid: to face Coal you need iron in your hand, not just chest.<br>`[1]` Bring me two pieces of scrap from that junkyard — one you pull cracking the lock, the other's hidden in the back. Bring them and I'll forge you a piece on the spot for your crew.<br>`[2]` And as a bonus I'll drop where Coal hides when he vanishes into the dark. That's worth more than any weapon, kid. We got a deal? |
| 🇪🇸 | `[0]` Mirá la banda nuevita ya laburando los puntos. Te digo una cosa, pibe: para encarar a Carbón necesitás fierro en la mano, no solo pecho.<br>`[1]` Traeme dos pedazos de chatarra de ese depósito — uno lo sacás abriendo el candado, el otro está escondido en el fondo. Traélos y te forjo una pieza al toque para tu tropa.<br>`[2]` Y de yapa te suelto dónde se esconde Carbón cuando desaparece en la oscuridad. Eso vale más que cualquier arma, pibe. ¿Cerramos? |

**Escolha `forjar`:**

| Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| label | Entrega a sucata e pega a peça | Hand over the scrap and take the piece | Entregá la chatarra y llevate la pieza |
| resultado | O Nando martela um tempo, sopra a fumaça e te passa uma soqueira de lata ainda quente. "O Carvão para no fundão do beco da Rasteira, atrás do muro. Some no escuro, mas sempre pro mesmo canto — malandro repete padrão. Agora sobe e vai atrás." | Nando hammers a while, blows off the smoke and passes you a still-warm tin knuckle. "Coal parks deep in Rasteira's alley, behind the wall. Vanishes in the dark, but always to the same corner — a crook always repeats a pattern. Now go up and get him." | Nando martilla un rato, sopla el humo y te pasa un puño de lata todavía caliente. "Carbón para en el fondo del callejón de la Rasteira, atrás del muro. Desaparece en la oscuridad, pero siempre al mismo rincón — el chorro siempre repite un patrón. Ahora subí y andá a buscarlo." |

### 2.5 O beco da Rasteira — `treta` (1ª luta de verdade · trash talk em array)

**Chaves:** `games.gangues.cena.pista.beco.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O beco da Rasteira | Rasteira's alley | El callejón de la Rasteira |
| `.sub` | ponto da Rato de Pista | a Rato de Pista spot | punto de la Rato de Pista |

**`.fala`** (array — uma sorteada por encontro):

| | Variação |
|---|---|
| 🇧🇷 `{0}` | Esse beco é da Rato de Pista, parça. A gente não quer subir, não quer teu bairro, não quer ser dono de nada — só não quer ser pisado. E gangue novinha que desce achando que é dona da rua... essa aqui é pisada, sem choro. |
| 🇧🇷 `{1}` | Ó quem chegou. Bando novinho achando que Pista é playground. |
| 🇧🇷 `{2}` | De novo essa cara aqui? Vai que dessa vez cê aprende. |
| 🇬🇧 `{0}` | This alley's Rato de Pista, pal. We don't want to climb, don't want your turf, don't want to own anything — we just don't want to get stepped on. And a fresh gang coming down here thinking it owns the street... this one gets stepped on, no tears. |
| 🇬🇧 `{1}` | Well, look who's here. Fresh little crew thinking the Pista's a playground. |
| 🇬🇧 `{2}` | This face again? Maybe this time you learn. |
| 🇪🇸 `{0}` | Este callejón es de la Rato de Pista, socio. No queremos subir, no queremos tu barrio, no queremos ser dueños de nada — solo no queremos que nos pisen. Y a la banda nuevita que baja acá creyéndose dueña de la calle... a esa la pisan, sin llorar. |
| 🇪🇸 `{1}` | Mirá quién llegó. Bandita nueva creyendo que la Pista es un playground. |
| 🇪🇸 `{2}` | ¿Otra vez esta cara? A ver si esta vez aprendés. |

### 2.6 A birosca do Seu Nato — `papo` (hub)

**Chaves:** `games.gangues.cena.pista.birosca.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A birosca do Seu Nato | Old Nato's bar | El bar de Don Nato |
| `.sub` | o coroa da esquina — o único adulto de confiança da Pista | the corner elder — the only grown-up on the Pista you can trust | el veterano de la esquina — el único adulto de la Pista en quien confiar |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Senta, cria. Toma um mate. Cê tá subindo rápido demais pra alguém que ninguém aqui conhece de nome.<br>`[1]` Eu sei onde o Carvão se enfia quando some no breu. Te falo, sem enrolação. Mas antes cê me faz um corre — leva um pacote pro outro lado sem o giro do facho da viatura pegar teu rastro.<br>`[2]` Resolve isso e a Pista passa a te respeitar, não só te temer. E a birosca fica de porta aberta pra tua tropa descansar sempre que precisar. |
| 🇬🇧 | `[0]` Sit, kid. Have some mate. You're climbing way too fast for someone nobody around here knows by name.<br>`[1]` I know where Coal hides when he vanishes into the dark. I'll tell you, no runaround. But first do me a run — take a package across without the patrol car's beam catching your trail.<br>`[2]` Handle that and the Pista starts to respect you, not just fear you. And the bar keeps its door open for your crew to rest whenever it needs to. |
| 🇪🇸 | `[0]` Sentate, pibe. Tomá un mate. Estás subiendo demasiado rápido para alguien que nadie por acá conoce de nombre.<br>`[1]` Sé dónde se mete Carbón cuando desaparece en la oscuridad. Te digo, sin vueltas. Pero antes hacéme un mandado — llevá un paquete al otro lado sin que el giro del haz del patrullero te agarre el rastro.<br>`[2]` Resolvé eso y la Pista pasa a respetarte, no solo a temerte. Y el bar queda con la puerta abierta para que tu tropa descanse cuando lo necesite. |

**Escolhas:**

| Escolha · Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `aceita_corre` · label | Aceita o corre do Nato | Take Nato's run | Aceptá el mandado de Nato |
| `aceita_corre` · resultado | "Fechado, cria. O pacote tá atrás do balcão. E de bônus: o outro ponto da Rasteira é subindo ali à direita." | "Done, kid. Package is behind the counter. And a bonus: Rasteira's other spot is right up to the right." | "Cerrado, pibe. El paquete está atrás del mostrador. Y de yapa: el otro punto de la Rasteira es subiendo ahí a la derecha." |
| `so_papo` · label | Só quer a informação | Just want the information | Solo querés la información |
| `so_papo` · resultado | "Teimoso, hein. Então vai no osso mesmo: o outro ponto da Rasteira é ali em cima. Fecha os dois e o Carvão aparece sozinho, atrás de saber quem é cê." | "Stubborn, huh. Then straight to the bone: Rasteira's other spot is up there. Lock both down and Coal shows up on his own, wanting to know who you are." | "Terco, ¿eh? Entonces al hueso mismo: el otro punto de la Rasteira está allá arriba. Cerrá los dos y Carbón aparece solo, atrás de saber quién sos." |

### 2.7 O corre do Nato — `corre`

**Chaves:** `games.gangues.cena.pista.corre.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O corre do Nato | Nato's run | El mandado de Nato |
| `.sub` | leva o pacote sem a viatura ver | carry the package without the patrol car seeing | llevá el paquete sin que el patrullero vea |
| `.intro` | Atravessa a quadra com o pacote sem entrar no facho da viatura — um giro errado e é treta certa com farda. A tropa se espalha e cobre teu movimento. É o preço da informação do Nato, e também o preço da paz aqui na Pista. | Cross the block with the package without stepping into the patrol car's beam — one wrong turn and it's a sure fight with a badge. The crew spreads out and covers your move. It's the price of Nato's information, and also the price of peace here on the Pista. | Cruzá la cuadra con el paquete sin entrar en el haz del patrullero — un giro mal hecho y es pelea segura con la yuta. La tropa se abre y te cubre el movimiento. Es el precio de la información de Nato, y también el precio de la paz acá en la Pista. |

### 2.8 O outro ponto da Rasteira — `treta` (beco_2)

**Chaves:** `games.gangues.cena.pista.beco_2.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O outro ponto da Rasteira | Rasteira's other spot | El otro punto de la Rasteira |
| `.fala` | Cê de novo? Bateu o beco lá embaixo e já achou que a Pista inteira ia se ajoelhar pra gangue novinha. Aqui muda de dono toda semana, mano — mas não pra quem chega achando que é dono de esquina no primeiro dia. | You again? Took the alley down there and already figured the whole Pista would kneel for the fresh gang. Changes hands every week here, man — but not for whoever shows up thinking they own a corner on day one. | ¿Vos de nuevo? Tomaste el callejón de abajo y ya pensaste que toda la Pista se iba a arrodillar para la banda nuevita. Acá cambia de dueño todas las semanas, loco — pero no para el que llega creyéndose dueño de una esquina el primer día. |

### 2.9 O terceiro ponto — `treta` (beco_3)

**Chaves:** `games.gangues.cena.pista.beco_3.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O terceiro ponto | The third spot | El tercer punto |
| `.sub` | mais um pedaço da Rato de Pista | another piece of Rato de Pista | otro pedazo de la Rato de Pista |
| `.fala` | Vocês não cansa, hein? A Pista tem ponto igual buraco de bala — sempre tem mais um escondido em algum canto. Esse aqui é meu. Vem provar que merece, ou volta de onde veio. | You people don't quit, huh? The Pista's got spots like bullet holes — there's always one more hidden in some corner. This one's mine. Come prove you're worth it, or go back where you came from. | No aflojan, ¿eh? La Pista tiene puntos como agujeros de bala — siempre hay uno más escondido en algún rincón. Este es mío. Vení a demostrar que valés, o volvé de donde viniste. |

### 2.10 O Sinaleiro Chefe — `treta` (1º General · trash talk em array)

**Chaves:** `games.gangues.cena.pista.sinaleiro.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O Sinaleiro Chefe | The Head Signalman | El Jefe de Señales |
| `.sub` | se ele apita, o bairro inteiro corre | if he whistles, the whole block runs | si él silba, corre todo el barrio |

**`.fala`** (array):

| | Variação |
|---|---|
| 🇧🇷 `{0}` | Eu comando os olho da Pista inteira, cria. Cada vigia, cada sinal, cada pivete no farol responde é pro meu apito. Cê passou por todos eles sem ninguém apitar — mas por mim cê não passa não. Comigo é diferente. |
| 🇧🇷 `{1}` | Eu apito, o bairro inteiro corre pra ajudar. Cê apita pra quem? |
| 🇧🇷 `{2}` | Achou que ia ser fácil na segunda vez? Errado, cria. |
| 🇬🇧 `{0}` | I run the eyes of the whole Pista, kid. Every lookout, every signal, every runner at the light answers to my whistle. You got past all of them without anyone whistling — but you don't get past me. With me it's different. |
| 🇬🇧 `{1}` | I whistle, the whole block runs to help. Who do you whistle to? |
| 🇬🇧 `{2}` | Thought it'd be easy the second time? Wrong, kid. |
| 🇪🇸 `{0}` | Yo manejo los ojos de toda la Pista, pibe. Cada vigía, cada señal, cada pibe en el semáforo responde a mi silbato. Pasaste a todos ellos sin que nadie silbe — pero a mí no me pasás. Conmigo es distinto. |
| 🇪🇸 `{1}` | Yo silbo y todo el barrio corre a ayudar. ¿Vos a quién silbás? |
| 🇪🇸 `{2}` | ¿Pensaste que iba a ser fácil la segunda vez? Mal, pibe. |

### 2.11 A Rasteira Velha — `treta` (2º General · trash talk em array)

**Chaves:** `games.gangues.cena.pista.rasteira_velha.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A Rasteira Velha | Old Rasteira | La Rasteira Vieja |
| `.sub` | a dona do beco em pessoa | the alley's owner in person | la dueña del callejón en persona |

**`.fala`** (array):

| | Variação |
|---|---|
| 🇧🇷 `{0}` | Cê bateu os moleque e já foi achando que a Pista era sua? Eu treinei cada um desses pivete com minhas próprias mão. Encara eu primeiro — aí sim o Carvão desce pra te ver de perto. |
| 🇧🇷 `{1}` | Treinei cada um desses moleque com essas mão. Vem ver o que sobrou pra ensinar pra cê. |
| 🇧🇷 `{2}` | Voltou? Bom. Assim eu ensino de novo, com mais gosto. |
| 🇬🇧 `{0}` | You beat the kids and already figured the Pista was yours? I trained every one of these punks with my own hands. Face me first — then Coal comes down to see you up close. |
| 🇬🇧 `{1}` | Trained every one of these kids with these hands. Come see what's left to teach you. |
| 🇬🇧 `{2}` | Back? Good. Now I get to teach it again, with more feeling. |
| 🇪🇸 `{0}` | ¿Le pegaste a los pibes y ya pensaste que la Pista era tuya? Entrené a cada uno de estos pibes con mis propias manos. Encarame a mí primero — ahí sí baja Carbón a verte de cerca. |
| 🇪🇸 `{1}` | Entrené a cada uno de estos pibes con estas manos. Vení a ver lo que sobró para enseñarte. |
| 🇪🇸 `{2}` | ¿Volviste? Bueno. Así te enseño de nuevo, con más ganas. |

### 2.12 A rinha do beco — `treta` (farm, opcional)

**Chaves:** `games.gangues.cena.pista.rinha.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | A rinha do beco | The back-alley pit | La riña del callejón |
| `.sub` | aposta clandestina | clandestine betting | apuesta clandestina |
| `.fala` | Roda de aposta no fundo do beco, cria. Quem entra, ou apanha ou embolsa. Sempre tem um doido querendo testar a mão contra a gangue novinha da vez — bora, encara quantas vez aguentar de pé. | Betting ring at the back of the alley, kid. You step in, you eat it or you cash out. There's always some nutcase wanting to test their hand against the fresh gang — come on, take it as many times as you can stay standing. | Rueda de apuestas en el fondo del callejón, pibe. El que entra, come piña o cobra. Siempre hay algún loco que quiere probar la mano contra la banda nuevita de turno — dale, encará las veces que aguantes de pie. |

### 2.13 Descanso na birosca — `descanso` (opcional, dentro da birosca)

**Chaves:** `games.gangues.cena.pista.descanso.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Descanso na birosca | Rest at the bar | Descanso en el bar |
| `.sub` | mate, pão e sossego | mate, bread and quiet | mate, pan y tranquilidad |
| `.intro` | Um tempo sentado, longe do sol quente da rua, na birosca do Nato. Custa uns trocado, mas a tropa volta inteira pro corre — sem fôlego não tem treta que se vença. | Some time sitting, out of the hot street sun, in Nato's bar. Costs a little change, but the crew comes back whole — no wind, no fight gets won. | Un rato sentado, lejos del sol caliente de la calle, en el bar de Nato. Cuesta unas monedas, pero la tropa vuelve entera — sin aliento no hay pelea que se gane. |

### 2.14 Duda, o Orelha — `papo` (informante, opcional)

**Chaves:** `games.gangues.cena.pista.informante.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Duda, o Orelha | Duda, the Ear | Duda, la Oreja |
| `.sub` | sabe tudo que rola em Marélia antes de virar boato | knows everything that moves in Marélia before it's a rumor | sabe todo lo que pasa en Marélia antes de ser rumor |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Ô, voltou pra Pista? É isso que essa quebrada é: tudo que rola em Marélia passa por aqui antes de virar boato de esquina. E eu escuto TUDO, cria.<br>`[1]` Tem um bagulho rolando lá na Feira que aquele povo não te fala de graça não. O Cobrador tá na surdina, esperando o momento certo pra aparecer. |
| 🇬🇧 | `[0]` Hey, back on the Pista? That's what this block is: everything that happens in Marélia passes through here before it's even corner gossip. And I hear ALL of it, kid.<br>`[1]` There's something going on over at the Feira the folks there won't tell you for free. The Collector's lying low, waiting for the right moment to show. |
| 🇪🇸 | `[0]` Ey, ¿volviste a la Pista? Eso es este barrio: todo lo que pasa en Marélia pasa por acá antes de ser chusmerío de esquina. Y yo escucho TODO, pibe.<br>`[1]` Hay algo rondando allá en la Feria que esa gente no te cuenta gratis. El Cobrador está en la sombra, esperando el momento justo para aparecer. |

**Escolha `perguntar`:**

| Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| label | Pergunta sobre a Feira | Ask about the Feira | Preguntá sobre la Feria |
| resultado | "O Cobrador só sai da toca quando souber que os batedor dele já apanharam. Vai lá na Feira, resolve os ponto — depois volta aqui se precisar de mais fita." | "The Collector only comes out of hiding once he knows his enforcers already took a beating. Go to the Feira, handle the spots — then come back if you need more intel." | "El Cobrador solo sale de la cueva cuando sabe que sus matones ya comieron piña. Andá a la Feria, resolvé los puntos — después volvé si necesitás más data." |

---

## 3. O muro e o túnel secreto

### 3.1 Mensagens do muro / gate

| Chave | Onde | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `cena.boss_trancado` | trava no muro, antes de fechar os pontos | Fecha os ponto antes de subir o nível, cria. | Lock the spots down before you level up, kid. | Cerrá los puntos antes de subir de nivel, pibe. |
| `cena.muro_tunel` | trava no muro, com os pontos já fechados | O muro não abre assim, na moral. Acha a brecha por baixo. | The wall's not opening, straight up. Find the gap under it. | El muro no se abre así nomás. Encontrá la brecha por debajo. |

### 3.2 Nomes dos prédios do túnel e do interior

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.pista.predio.tunel_ent` | Barraco do fundo do beco | Shack at the end of the alley | Casilla del fondo del callejón |
| `cena.pista.predio.tunel_sai` | Barraco do outro lado do muro | Shack on the other side of the wall | Casilla del otro lado del muro |
| `cena.pista.int.tunel` | A brecha por baixo do muro | The gap under the wall | La brecha por debajo del muro |

### 3.3 Os vigias do túnel — `treta` (trash talk em array; `{1}` e `{2}` são compartilhados entre m1/m2/m3)

**Chaves:** `games.gangues.cena.pista.tunel.m1 / m2 / m3` (`.nome` / `.fala`)

| # | nome (PT / EN / ES) |
|---|---|
| m1 | Vigia da boca / Mouth lookout / Vigía de la boca |
| m2 | Farejador do túnel / Tunnel tracker / Rastreador del túnel |
| m3 | Vigia da saída / Exit lookout / Vigía de la salida |

**`.fala` `{0}`** (própria de cada vigia):

| # | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| m1 | Ninguém desce nesse buraco sem passar por cima de mim primeiro, cria. Volta pro teu lado enquanto é tempo. | Nobody goes down this hole without going through me first, kid. Back to your side while you still can. | Nadie baja a este pozo sin pasar por encima de mí primero, pibe. Volvé a tu lado mientras estás a tiempo. |
| m2 | Cê acha mesmo que é o primeiro a tentar furar por baixo? Os que tentaram antes ainda tão aqui, no escuro, sem sair. | You really think you're the first to try digging under? The ones who tried before are still down here in the dark, no way out. | ¿En serio te creés el primero en intentar cavar por debajo? Los que intentaron antes siguen acá, en la oscuridad, sin salir. |
| m3 | Chegou do outro lado, foi? Só passando por cima de mim, cria. E eu não sou de cair fácil não. | Made it to the other side, huh? Only over me, kid. And I don't go down easy. | ¿Llegaste al otro lado, eh? Solo pasando por encima de mí, pibe. Y no soy de caer fácil. |

**`.fala` `{1}` e `{2}`** (iguais nos 3 vigias):

| | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `{1}` | Esse buraco é meu, cria. Ninguém passa de graça. | This hole's mine, kid. Nobody passes for free. | Este pozo es mío, pibe. Nadie pasa gratis. |
| `{2}` | Ainda tentando essa brecha? Cê é teimoso mesmo. | Still trying this gap? You really are stubborn. | ¿Todavía intentando esta brecha? Sos terco de verdad. |

### 3.4 Achado do túnel

**Chaves:** `games.gangues.cena.pista.tunel.achado.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Buraco na parede do túnel | Hole in the tunnel wall | Agujero en la pared del túnel |
| `.sub` | o que alguém escondeu aqui | what someone stashed here | lo que alguien escondió acá |
| `.linha` | Enfiado numa fresta da parede de terra, meio escondido: um bagulho que ainda serve pra tropa. | Jammed into a crack in the dirt wall, half hidden: something that still works for the crew. | Metido en una grieta de la pared de tierra, medio escondido: algo que todavía sirve para la tropa. |

---

## 4. O galpão do Carvão

> Mini-dungeon de 4 cômodos: **doca → estoque → escritório → o breu**.
> `cena.pista.int.galpao`: 🇧🇷 Galpão do Carvão · 🇬🇧 Coal's Warehouse · 🇪🇸 Galpón de Carbón.

### 4.1 Cômodo 1 (doca) — Vapor de tocaia · `treta` (array)

**Chaves:** `games.gangues.cena.pista.galpao.m1.*` · nome: 🇧🇷 Vapor de tocaia · 🇬🇧 Vapor on lookout · 🇪🇸 Vapor de guardia

| | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `{0}` | Ó os pivete da gangue nova querendo entrar no galpão assim, no talento. Aqui não entra playboy achando que é dono, cria. Aqui é osso. | Look at the fresh gang's kids trying to walk into the warehouse like it's nothing. No playboys who think they own the place in here, kid. This is the real thing. | Mirá los pibes de la banda nuevita queriendo entrar al galpón así, de una. Acá no entra ningún playboy creyéndose dueño, pibe. Acá es hueso. |
| `{1}` | Playboy não entra aqui não, cria. Aqui é osso puro. | No playboys in here, kid. This is bone. | Playboy no entra acá, pibe. Acá es hueso puro. |

### 4.2 Cômodo 2 (estoque) — Cão Louco · `treta` (array) + achado

**Chaves:** `games.gangues.cena.pista.galpao.m2.*` e `.achado.*` · nome: 🇧🇷 Cão Louco · 🇬🇧 Mad Dog · 🇪🇸 Perro Loco

| | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `m2 {0}` | Passou da doca? Sorte tua que eu tava de sono leve. Agora acorda, porque a briga já começou. | Past the dock? Lucky I was sleeping light. Wake up now, 'cause the fight already started. | ¿Pasaste la dársena? Suerte que estaba con el sueño liviano. Despertate ahora, porque la pelea ya arrancó. |
| `m2 {1}` | Cochilei um pouquinho e olha o que sobrou pra apanhar. | Dozed off a second and look what's left to beat on. | Me dormí un segundo y mirá lo que quedó para pegarle. |
| `m2 {2}` | Dessa vez eu tava esperando, viu. Vem. | This time I was waiting, see. Come on. | Esta vez te estaba esperando, ¿ves? Vení. |
| `achado.nome` | Prateleira do estoque | Stockroom shelf | Estante del depósito |
| `achado.sub` | o que o movimento guarda | what the operation keeps | lo que guarda el movimiento |
| `achado.linha` | Fundo da prateleira, embaixo de uns pano velho: um bagulho que serve. Ninguém vai notar que sumiu. | Back of the shelf, under some old rags: something useful. Nobody's going to notice it's gone. | Al fondo del estante, bajo unos trapos viejos: algo que sirve. Nadie va a notar que faltó. |

### 4.3 Cômodo 3 (escritório) — O contador do movimento · `papo`

**Chaves:** `games.gangues.cena.pista.galpao.contador.*`

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | O contador do movimento | The operation's bookkeeper | El contador del movimiento |
| `.sub` | anota tudo, apanha por qualquer um | keeps every tally, takes a beating for anyone | anota todo, cobra por cualquiera |

**`.fala`:**

| | Texto |
|---|---|
| 🇧🇷 | `[0]` Não bate, não, cria! Eu só faço a conta, juro por Deus! Eu falo, eu falo tudo…<br>`[1]` O Carvão fica no breu, lá no fundão de tudo. Ele só desce quando o galpão inteiro já sabe que cê chegou. E adivinha — já sabe. |
| 🇬🇧 | `[0]` Don't hit me, kid! I just do the math, I swear to God! I'll talk, I'll talk, all of it...<br>`[1]` Coal stays in the dark, way in the back of it all. He only comes down once the whole warehouse knows you're here. And guess what — it knows. |
| 🇪🇸 | `[0]` ¡No me pegues, pibe! ¡Yo solo hago la cuenta, te lo juro por Dios! Hablo, hablo, todo...<br>`[1]` Carbón está en la oscuridad, bien al fondo de todo. Solo baja cuando todo el galpón sabe que llegaste. Y adiviná — ya sabe. |

**Escolhas:**

| Escolha · Campo | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `escuta` · label | Escuta o que ele tem pra falar | Hear him out | Escuchá lo que tiene para decir |
| `escuta` · resultado | "O quadro ali atrás é o horário do movimento, memo. O Carvão cruza o último cômodo toda madrugada, sempre no mesmo horário. Boa sorte, cria — vai precisar." | "That board back there is the operation schedule, for real. Coal crosses the last room every dawn, same time always. Good luck, kid — you'll need it." | "Ese cuadro de atrás es el horario del movimiento, posta. Carbón cruza el último cuarto cada madrugada, siempre a la misma hora. Suerte, pibe — la vas a necesitar." |
| `aperta` · label (−rep, vira treta) | Aperta o coitado (−rep) | Rough the poor guy up (−rep) | Apretá al pobre tipo (−rep) |

### 4.4 Cômodo 4 (o breu)

Sem texto próprio. Ao chegar perto do Carvão, abre o confronto de chefe (§5).

---

## 5. O Carvão — o chefe

**Chaves:** `games.gangues.story.bosses.fumaca.*` · **Tela:** TretaVS

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `.nome` | Carvão | Coal | Carbón |
| `.fala` | Cê é ligeiro, cria? Eu sou fumaça. Pisca o olho e eu já sumi — e cê apanha no escuro sem nem ver de onde veio o golpe. | You quick, kid? I'm smoke. Blink and I'm already gone — and you eat it in the dark without even seeing where the hit came from. | ¿Sos rápido, pibe? Yo soy humo. Parpadeás y ya desaparecí — y te comés los golpes a oscuras sin ni ver de dónde vino. |
| `story.boss_tag` | O foda da região | The region's heavy | El duro de la zona |

---

## 6. Feedback de gameplay

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.treta_sim` | Partiu porrada | Let's scrap | A los golpes |
| `cena.treta_nao` | Agora não, sussa | Not now, chill | Ahora no, tranqui |
| `cena.parada_tentar` | Encarar | Take it on | Encarar |
| `cena.parada_pular` | Deixa quieto | Leave it alone | Dejalo quieto |
| `cena.parada_ok` | Deu bom. A rua abriu pra tropa. | Nice. The street opened up for the crew. | Salió bueno. La calle se abrió para la tropa. |
| `cena.parada_falha` | Deu ruim — e acordou o pessoal. Treta na certa. | That went bad — and it woke folks up. Fight's coming. | Se pudrió — y despertó a la gente. Pelea segura. |
| `cena.parada_falha_leve` | Não colou dessa vez. Fica pra próxima, cria. | Didn't stick this time. Next time, kid. | No pegó esta vez. Para la próxima, pibe. |
| `cena.corre_ok` | Corre feito, sem stress. O Nato paga o combinado, ponto final. | Run done, no drama. Nato pays what was agreed, end of story. | Mandado hecho, sin drama. Nato paga lo acordado, punto. |
| `cena.corre_falha` | A viatura te flagrou. Larga o pacote e vaza, agora! | The patrol car clocked you. Drop the package and bounce, now! | El patrullero te agarró. ¡Soltá el paquete y rajá, ya! |
| `cena.descanso_curar` | Descansar (−{grana}) | Rest (−{grana}) | Descansar (−{grana}) |
| `cena.descanso_curou` | A tropa respirou fundo. +{n} de fôlego de volta. | The crew caught its breath. +{n} wind back. | La tropa respiró hondo. +{n} de aliento de vuelta. |
| `cena.descanso_cheio` | A tropa já tá no talo, não precisa não. | The crew's already maxed, no need. | La tropa ya está a full, no hace falta. |
| `cena.descanso_sem_grana` | Grana curta pro descanso, cria. | Cash is short for a rest, kid. | La plata está corta para el descanso, pibe. |
| `cena.folego_baixo` | A tropa tá zerada. Passa na birosca antes de arriscar outra treta. | The crew's running on empty. Hit the bar before you risk another fight. | La tropa está en cero. Pasá por el bar antes de arriesgar otra pelea. |
| `cena.recompensa` (toast) | Rendeu | Came out with | Rindió |
| `cena.itens.sucata` | Sucata (item) | Scrap (item) | Chatarra (ítem) |
| `vitoria` | FOI NÓS | THAT'S US | FUIMOS NOSOTROS |
| `derrota` | DEU RUIM | TOUGH BREAK | SE PUDRIÓ |
| `derrota_sub` | Quem cai e levanta é quem manda de verdade depois. | The ones who fall and get back up are the ones who run it later. | El que cae y se levanta es el que manda de verdad después. |
| `report.mission_complete` | RELATÓRIO // OPERAÇÃO CONCLUÍDA | REPORT // OPERATION COMPLETE | INFORME // OPERACIÓN COMPLETADA |
| `report.mission_failed` | RELATÓRIO // OPERAÇÃO FRACASSADA | REPORT // OPERATION FAILED | INFORME // OPERACIÓN FALLIDA |
| `report.victory_message` | Sua gangue controlou o combate. Analise cada decisão abaixo. | Your gang controlled the fight. Analyze every decision below. | Tu pandilla controló el combate. Analiza cada decisión abajo. |
| `report.defeat_message` | A gangue caiu, mas o registro mostra onde a luta foi perdida. | The gang fell, but the record shows where the fight was lost. | La pandilla cayó, pero el registro muestra dónde se perdió la lucha. |

---

## 7. Depois de tomar a Pista

| Chave | Onde | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|---|
| `cena.bairro_tomado` | selo no cabeçalho da cena | Bairro na mão | Block's ours | Barrio en la mano |
| `story.dominado` | selo no card do mapa | Bairro na mão | Block's ours | Barrio en la mano |
| `story.continuar_territorio` | botão pós-vitória | Segue no bairro | Stay on the block | Seguir en el barrio |

### 7.1 A loja da Pista (abre pelo túnel / depois do chefe)

**Nomes:** `predio.lojapista` 🇧🇷 Loja da Pista / 🇬🇧 Pista Shop / 🇪🇸 Tienda de la Pista · `int.loja` 🇧🇷 Mercearia da Cida / 🇬🇧 Cida's Corner Store / 🇪🇸 Almacén de Cida · `cena.pista.loja.nome` = "Loja da Pista".

**UI da loja** (`games.gangues.loja.*`):

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `loja.titulo` | Loja | Shop | Tienda |
| `loja.sub` | Compra com a grana da gangue — dá pra usar em qualquer luta. | Buy with the gang's cash — usable in any fight. | Compra con la plata de la banda — se puede usar en cualquier pelea. |
| `loja.comprar` | Comprar | Buy | Comprar |
| `loja.sem_grana` | Grana insuficiente | Not enough cash | Plata insuficiente |
| `loja.no_inventario` | Você tem: {n} | You have: {n} | Tienes: {n} |
| `loja.compra_feita` | Comprado! | Bought! | ¡Comprado! |

---

## 8. Rótulos, cenário e menores

### 8.1 Verbos de ação (botão contextual)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.acao.entrar` | ENTRA | GO IN | ENTRÁ |
| `cena.acao.sair` | VAZA | BOUNCE | RAJÁ |
| `cena.acao.voltar` | VOLTAR | BACK | VOLVER |
| `cena.acao.avancar` | AVANÇAR | PUSH IN | AVANZAR |
| `cena.acao.subir` | SUBIR | GO UP | SUBIR |
| `cena.acao.desafiar` | ENCARA | STEP UP | ENCARÁ |
| `cena.acao.trancado` | FECHADO | SHUT | CERRADO |
| `cena.comodo` | CÔMODO {n}/{de} | ROOM {n}/{de} | CUARTO {n}/{de} |
| `cena.nivel` | NÍVEL {n} | LEVEL {n} | NIVEL {n} |

### 8.2 Tipos de pino (rótulo do POI)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.tipo.treta` | Treta | Scrap | Pelea |
| `cena.tipo.parada` | Corre difícil | Tricky run | Mandado jodido |
| `cena.tipo.papo` | Resenha | Word | Resenha |
| `cena.tipo.corre` | Corre | Run | Mandado |
| `cena.tipo.achado` | Achado | Find | Hallazgo |
| `cena.tipo.descanso` | Birosca | Bar | Bar |
| `cena.tipo.loja` | Loja | Shop | Tienda |

### 8.3 HUD / recursos

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.grana` | Grana | Cash | Plata |
| `cena.rep` | Nome | Name | Nombre |
| `cena.folego` | Fôlego da tropa | Crew's wind | Aliento de la tropa |
| `cena.opcional` | de boa | optional | opcional |
| `cena.fechar` | Fechar | Close | Cerrar |

### 8.4 Cenário / prédios (nomes no mapa)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `cena.pista.grafite` | A RUA / LEMBRA | THE STREET / REMEMBERS | LA CALLE / RECUERDA |
| `cena.pista.predio.bar` | Bar do Zé | Zé's Bar | Bar de Zé |
| `cena.pista.predio.banca` | Banca fechada | Shut-down stand | Puesto cerrado |
| `cena.pista.predio.mercado` | Mercadinho da Cida | Cida's Corner Store | Almacén de Cida |
| `cena.pista.predio.fliperama` | Fliperama do Kiko | Kiko's Arcade | Fliper de Kiko |
| `cena.pista.predio.oficina` | Oficina do Nando | Nando's Workshop | Taller de Nando |
| `cena.pista.int.birosca` | Birosca do Seu Nato | Nato's Bar | Bar de Don Nato |

### 8.5 Facção / gangue da Pista (rótulos)

| Chave | 🇧🇷 | 🇬🇧 | 🇪🇸 |
|---|---|---|---|
| `story.gangues.rato_pista` | Rato de Pista | Track Rats | Ratas de Pista |
| `story.gangues.bonde_sinal` | Bonde do Sinal | Red-Light Crew | La Banda del Semáforo |
| `story.dificuldades.rato` | Rato de rua | Street rat | Rata de calle |
| `story.falas.ponto` | {territorio}. Esse ponto é da {gangue}, parça. A {suaGangue} não passa daqui de graça. | {territorio}. This spot belongs to {gangue}, pal. {suaGangue} doesn't walk through here for free. | {territorio}. Ese punto es de {gangue}, parce. {suaGangue} no pasa de aquí gratis. |

---

## 9. Ganchos pra frente

| Chave | 🇧🇷 | Quando |
|---|---|---|
| `story.precisa_informante` | 🔍 Antes de encarar o foda da Feira, volta na Pista e troca uma ideia com o Duda. Ele sabe umas fita que valem ouro. | ao tentar o chefe da Feira sem ter falado com o Duda |
| `story.final.*` | "A SUBIDA ACABA AQUI" / "MARÉLIA NÃO SE COSTURA" / 3 parágrafos | só na Laje, mas fecha o arco que a Pista abre |

EN: "🔍 Before you face the Feira's heavy, go back to the Pista and have a word with Duda. He knows things worth gold."
ES: "🔍 Antes de encarar al duro de la Feria, volvé a la Pista y cruzá una idea con Duda. Sabe unas cosas que valen oro."

---

## 10. Trash talk — o que existe e o que falta

**Já implementado (v1 + v2):** `cena.pista.<poi>.fala` de treta pode ser um
**array**; `escolherFala()` em `GanguesCena.jsx` sorteia uma linha por encontro
e passa pro `TretaVS`. POIs com array hoje:

| POI | nº de variações |
|---|---|
| `beco` (Ratazana/Rato de Pista) | 3 |
| `sinaleiro` (1º General) | 3 |
| `rasteira_velha` (2º General) | 3 |
| `tunel.m1` / `m2` / `m3` | 3 cada (`{0}` própria, `{1}`/`{2}` compartilhadas) |
| `galpao.m1` (Vapor) | 2 |
| `galpao.m2` (Cão Louco) | 3 |

Pra adicionar variação num POI de treta: troque `"fala": "..."` por
`"fala": ["...", "...", "..."]` nos 3 idiomas. Sem mudança de código.

**Ainda NÃO implementado:**

- **v3 — falas de "perdendo"** (o inimigo com PV baixo, no meio do combate).
  Ex.: Ratazana "Peraí... isso não tava no combinado!"; Cão Louco "Para! Isso
  não é luta limpa!". Precisa de gancho na tela de combate (`GanguesCombat` /
  `useGanguesTurnMachine`), lendo o PV do inimigo.
- **v4 — fala de derrota do Carvão** (linha de fechamento quando o chefe cai).
  Ex.: "Tá certo, cria. Essa é sua. Mas Marélia não se costura fácil não —
  sobe e vê com teus próprio olho." Precisa de gancho na `GanguesVictory` /
  transição pós-chefe.
- **sinal → aperta**: a briga vem de um `viraTreta` (não passa pelo `TretaVS`),
  então não mostra fala pré-combate. Se quiser uma linha aqui, precisa de
  wiring próprio no fluxo do `GanguesPapo`.

---

## Fora de escopo (não reescrever aqui)

- **Tutoriais de sistema** (`games.gangues.tutorial_attrs`, `games.gangues.combate`) — mecânica de combate/ficha.
- **Rótulos genéricos de combate** (`ATACAR`, `PV`, `PM`, log de batalha) — `games.gangues.report.*`.
- **Álbum de Marélia** (`games.gangues.enemy_album.*`) — lore dos inimigos; GDD §5.
