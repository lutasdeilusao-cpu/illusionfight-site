# LDI GANGUES — GDD (Game Design Document · a bíblia única)

> **Base oficial e única de tudo sobre o LDI Gangues — lore E mecânica.**
> v1 — 2026-09-08, consolidado em bíblia única em set/2026 (pedido do
> Isaias: "o GDD tem que ser a única bíblia... a documentação tem que
> estar num único lugar"). Tudo aqui é **cânone fechado**. Substitui todos
> os docs de lore E de mecânica anteriores — os 4 `.md` que viviam soltos
> em `src/pages/games/Gangues/` (`GANGUES_DESIGN.md`, `GANGUES_HEADSUP.md`,
> `GANGUES_PROGRESSAO_RASCUNHO.md`, `GANGUES_MODO_HISTORIA_ENCONTROS.md`)
> foram fundidos aqui (ver seção 17) e **removidos do repositório**.
>
> **Fonte narrativa:** o conto **"Alan, o Campeão"** (`src/data/historias/contos/02/pt/01.md`
> … `19.md`, `historias/contos.json` id `02`). O jogo é o pano de fundo histórico desse
> conto: a década final da fragmentação de Marélia, terminando pouco antes de o
> Alan reivindicar a coroa.
>
> Seções 1–14 = **o mundo** (quem manda, como o crime funciona, o que
> aconteceu antes, quem o jogador enfrenta e por quê, o que ele coleciona e
> equipa). Seções 15–17 = **mecânica** (combate, progressão, retratos,
> líder, estrutura de arquivos) — nasceram depois, quando a lore e a
> mecânica pararam de fazer sentido separadas.

Grafia oficial: **Marélia** com acento (o conto usa assim). O i18n do jogo ainda
tem "Marelia" sem acento em vários lugares — alinhar quando mexer em texto.

> **Última revisão geral: 28/09/2026 — conferido contra o código de
> GANGUES 3.78.0.** Nesta revisão saiu tudo que era histórico sem uso
> (crosswalk string→id, Ranking Clandestino, narrativa de bug já corrigido,
> atributos A/H/R/D antigos, NeoGuide) e entrou o que só existia no código:
> sistema do Pique (linha do tempo com raias), encontro aleatório com sirene,
> retratos de inimigo/NPC, ciclo automático de pose e a estrutura de `styles/`.
> O que ainda NÃO está no código aparece marcado como **planejado**.

---

## 0. Princípio de dados — faixas de ID

**Nenhuma entidade de jogo referencia nome, só ID.** O nome vive só no i18n
(`games.gangues.enemies.<id>.name`, etc.) — o motor nunca compara string.

| Faixa | Categoria |
|---|---|
| 1–99 | Territórios (7 oficiais + expansão futura) |
| 100–199 | Facções / gangues |
| 200–299 | Cargos da hierarquia (flavor text dinâmico, não stats) |
| **1101–1121** | Inimigo comum — **Vigia / Fogueteiro** (21) |
| **1201–1221** | Inimigo comum — **Vapor** (21) |
| **1301–1321** | Inimigo comum — **Gerente de Boca** (21) |
| **1401–1414** | Inimigo comum — **Cobrador** (14) |
| **1451–1464** | Inimigo comum — **General / Braço-Direito** (14) |
| 1500–1599 | Chefes de território (7 bosses) |
| 1600–1699 | Chefe final + reservado |
| 1701–1799 | Fichas do encontro aleatório (fora do Álbum) |
| 3000–3099 | NPCs não-combatentes |
| 1–99 | Itens consumíveis *(contexto separa de "território")* |
| 101–999 | Equipamento |
| 10000+ | Cartas de socket (sistema futuro) |

> **Estado real:** `data/gangues-enemies.json` tem **102 fichas** com id
> numérico — 91 da hierarquia (com bloco `album`), 7 chefes e 4 fichas do
> encontro aleatório (1701/1702/1711/1712, fora do Álbum, ver §5.6).
> `data/ganguesInimigos.js` é o módulo-catálogo.
>
> **Banco:** tabelas próprias — `gangues_saves` (a gangue/save) e
> `gangues_fichas` (os lutadores). Nunca toca em `character_sheets` (que é da
> "Lendas do LDI").
>
> **O álbum se organiza por CARGO, não por bairro:** abas Vigia → Vapor →
> Gerente → Cobrador → General → Chefes. A última aba de cada território é
> sempre o **General** — o "quase-chefe" que sinaliza que o portão vai abrir.

---

## 1. A estrutura de poder

### 1.1 A Banca — a organização-mãe

A Banca **não é uma gangue, é o sistema** — o guarda-chuva que nasceu **dentro do
sistema prisional de Marélia** há mais de vinte anos, quando facções soltas
perceberam que unidas cobravam mais caro e viviam mais. Ela não manda direto em
cada esquina: **licencia** (é uma franquia). Cada bairro tem seu **bonde**, cada
bonde responde pela própria área, paga um **"salve"** (repasse) pra cúpula, e
recebe em troca **logística** — arma, rota, proteção jurídica. Quando um bonde
discorda: pagar calado ou **rachar**.

**No conto:** é a Banca que puxa o Alan pra dentro aos ~4 anos (a "Tia" era o
RH), que o usa de **bucha de canhão**, que o abandona no reformatório aos 7, que
o recebe de volta aos 10 com o "plano de dominância", e que aos 16 manda ele
sumir quando ele vira alvo grande demais.

### 1.2 A hierarquia — de baixo pra cima (faixa 200–299)

| ID | Cargo | Função | No álbum |
|---|---|---|---|
| 201 | **Fogueteiro / Vigia** | Avisa quando estranho ou viatura sobe. Corre, raramente bate de frente | Nível 1 · faixa 1101 |
| 202 | **Vapor** | Vende na boca, cara a cara com o cliente. Dano baixo, mas em número | Nível 2 · faixa 1201 |
| 203 | **Gerente de boca** | Administra 1 ponto — estoque, turno, disciplina. Dano e defesa acima da média | Nível 3 · faixa 1301 |
| 204 | **Cobrador** | Cobra dívida, empresta com juro, "resolve" atraso. Combatente sério | Nível 4 · faixa 1401 |
| 205 | **Frente / Geral de bairro** | Dono do bairro, responde direto à cúpula | os 7 chefes (§6) |
| 206 | **Sintonia** | Conselho informal entre os Gerais — resolve fronteira sem guerra | não-jogável |
| 207 | **Cúpula** | 4–5 pessoas que a rua nunca vê | §1.4 |
| 208 | **O Dono de Marélia** | Cargo vago desde sempre — só o Retalho chegou perto. Depois dele, o Alan | — |

Entre esses cargos, o **General / Braço-Direito** (faixa 1451, Nível 5 do álbum)
é o degrau imediatamente abaixo do chefe: praticamente mini-bosses, o melhor
stats do jogo fora das lutas de território.

No conto, o Alan passa por quase todos entre os 4 e os 13 anos: bucha → olheiro →
rua com adultos → (reformatório) → executor da cúpula (mata o Sombra aos 11) →
**dono de bairro aos 13**, coordenando adultos de 30, 40 anos.

### 1.3 O Proceder — o código que segura tudo

Código não-escrito, mais forte que qualquer lei formal: quem quebra não vai
preso, **desaparece**.

1. **Ninguém rouba de morador.** Rouba de fora, de rival, nunca de quem paga
   aluguel na mesma rua que você.
2. **Dívida se paga.** Não tem prazo bom nem ruim — tem prazo vencido.
3. **Boca não se invade sem passar pela Sintonia.** Tomar ponto de outro bairro
   sem avisar é declaração de guerra.
4. **Ninguém desafia o topo de um bairro sem provar que já rachou a base dele
   por baixo.** É a lógica por trás do **portão do chefe** em cada território —
   você só encara o Geral depois de bater os pontos. Na Pista isso virou
   literal (v2.74.4): o **muro** no fim da rua nunca abre por fora; depois de
   fechar os pontos você acha a **boca de um túnel** que fura *por baixo* do
   muro — uns vigias no caminho — e emerge do outro lado. O muro físico só
   abre depois que você derruba o chefe, como atalho.
5. **Criança não é dono, mas também não é intocável.** É a brecha que o Alan
   usou a vida inteira — bucha primeiro, cria de proteção depois. Personagens
   jovens recrutados carregam essa dualidade: menos suspeita narrativa, menos R
   inicial.

### 1.4 A Cúpula (gancho pós-jogo / evento)

Quatro nomes. A rua nunca vê nenhum.

| Nome | Papel |
|---|---|
| **Dona Célia** | A mais velha. Foi ela quem formalizou o sistema de "salve" há 20 anos. Ninguém a desafia — por respeito, não por medo. |
| **O Escriturário** | Cuida da parte financeira / lavagem. Nunca segurou uma arma na vida. |
| **Bastião** | O braço militar da cúpula. Resolve o que precisa de sangue. |
| **A Voz** | Ninguém sabe o rosto, só a voz num rádio. Faz a ponte com as autoridades corruptas. |

---

## 2. As facções — quem é dono de cada pedaço (faixa 100–199)

| ID | Facção | Território | Filosofia |
|---|---|---|---|
| 101 | **Rato de Pista** | A Pista | Sem ambição de subir — só não querer ser pisado. Território mais mutável de Marélia. |
| 102 | **Bonde do Sinal** | A Pista | Molecada do farol — **informação** é a moeda, não droga. |
| 103 | **Acerto de Contas** | A Feira | Vendem **dívida** antes de vender droga. |
| 104 | **Os Gato** | A Feira | Ligação clandestina de energia — **essenciais**, por isso protegidos. |
| 105 | **Sombra Rubra** | A Baixada | O caco mais violento — se acha herdeiro legítimo. |
| 106 | **Sombra Fria** | A Baixada | O caco calculista — lucro antes de orgulho. |
| 107 | **Os Restos** | A Baixada | O caco desesperado — nada a perder. |
| 108 | **Bonde dos Prédio** | A Vila | Controle vertical, quase militar. |
| 109 | **Os Andar de Cima** | A Vila | Se acham a aristocracia da Vila. |
| 110 | **Frente da Escada** | O Morro | Guarda a única subida física. |
| 111 | **Os Fogueteiro** | O Morro | Sistema de alerta do bairro inteiro. |
| 112 | **Os Cinco** | Alto do Morro | Quase viraram cúpula paralela. |
| 113 | **A Roda** | Alto do Morro | Doutrina de formação, sem líder carismático. |
| 114 | **Bonde do Retalho** | A Laje | O único que já segurou 6 bairros de uma vez. Trata crime como logística. |

---

## 3. Linha do tempo — os 10 anos antes do Rei

Pano de fundo histórico. Roda **em paralelo** ao arco do Alan no conto (ele
subindo os próprios degraus, dos 4 aos 16, num bairro específico; os dois arcos
só se cruzam depois, quando o Alan já é o Campeão).

- **Ano 1–2 — A Rachadura.** O Sombra, dono incontestável da Baixada, morre
  (afogado no valão — causa nunca esclarecida, **e o jogo não esclarece de
  propósito**). *[No conto: foi o Alan quem o matou, aos 11, disfarçado de
  mendigo. Marélia nunca soube.]* Três tenentes — futuros **Sangria, Gelo e
  Sobra** — não concordam em herdeiro. A Baixada racha em três. Primeiro sinal
  público de que Marélia pode ser tomada em pedaços.
- **Ano 3 — O Aprendizado do Retalho.** Um cobrador sem nome de peso — **Damião**
  — vê a rachadura e tira a lição certa: **território não se segura com força, se
  segura com costura.**
- **Ano 4–5 — A Costura Começa.** Damião consolida Pista e Feira como "sócio
  maior", não dono absoluto. Ganha o apelido **Retalho**: na lenda de rua, "cose
  pedaço com pedaço" — cada bairro que entra na órbita continua parecendo
  independente por fora, mas responde por dentro.
- **Ano 6 — A Vila resiste.** O Bonde dos Prédio, militarizado, recusa a costura.
  Guerra mais dura da década. A Vila entra na órbita **ressentida, não
  convencida** — por isso dominar a Vila é o degrau onde a dificuldade sobe mais
  duro (`disputa`).
- **Ano 7 — O Morro nunca foi tomado.** **Zefa ("A Fera")** negocia como igual —
  lealdade pessoal que dinheiro não compra. O acordo nunca vira submissão
  completa. Por isso o Morro é `guerra` e não `disputa` — resistência genuína.
- **Ano 8 — Os Cinco quase viram cúpula.** No Alto do Morro, cinco figuras se
  organizam **horizontalmente**, ameaçando rivalizar a própria Banca. O Retalho
  intervém por **absorção** antes que terminem de se formar.
- **Ano 9 — A Laje.** Damião sobe pro topo. Seis bairros respondem a ele —
  ninguém nunca chegou tão perto.
- **Ano 10 — O jogo.** O jogador sobe a **mesma rota**, sem saber que repete os
  passos do Retalho. Derruba ele na Laje. Em duas semanas o mapa racha de novo:
  nem o Retalho segurou, nem a gangue do jogador segura.
- **Depois — gancho pro cânone.** Um garoto que foi **bucha desde os três anos**
  consegue o que nem o Retalho nem a gangue do jogador conseguiram: vira o
  **primeiro Rei de fato de Marélia**. O nome dele é **Alan**.

---

## 4. Os 7 territórios — com pontos de interesse (faixa 1–99)

Escala de temperatura: `rato → muvuca → correria → disputa → guerra → sangue → coroa`.
Cada território tem um **motivo histórico** pra sua dificuldade (§3). Crosswalk de
id (string atual → oficial): `pista→1, feira→2, baixada→3, vila→4, morro→5,
alto→6, laje→7`.

### Território 1 — A Pista · Rato de rua · `#3ddc97`
Facção: Rato de Pista (101) / Bonde do Sinal (102). O asfalto lá embaixo. Cria
que corre no farol, arranca corrente, vende bala. **Todo mundo começa aqui** — o
Retalho, o jogador, e (noutro bairro) o Alan.

**POIs (estado atual, v3.62.3 — `data/cenas/pista/pois.js`):**

- **Obrigatórios pro portão** (`portao.precisa`, 8): A boca do sinal (`sinal`) ·
  O ferro-velho (`ferro`, `PuzzleSimonSays`) · **A oficina do Nando**
  (`oficina` — fetch quest estilo Zelda: junta 2× sucata, uma do `ferro` e
  outra do `achado`, e o Nando forja a Soqueira de Lata, 101, grátis + conta
  onde o Carvão se esconde) · O beco da Rasteira (`beco`) · O outro ponto da
  Rasteira (`beco_2`) · O terceiro ponto (`beco_3`) · **O Sinaleiro Chefe**
  (`sinaleiro`, 1451, General) · **A Rasteira Velha** (`rasteira_velha`, 1452,
  General). Os dois generais entram no Álbum aqui, antes do chefe.
- **Ferro-velho na rua (v3.62.2–3.62.3):** o pino e a zona de interação do
  `ferro` ficam na calçada acima do prédio (pino no centro); quando um pino
  mora dentro de um prédio, uma marca de chão mostra onde interagir.
- **Opcionais do lado de cá do muro:** o fundo do ferro-velho (`achado`) · o
  corre do Nato (`corre`, stealth — o convite dele agora aparece DENTRO do
  modal de Descanso, não num pino próprio) · a rinha (`rinha`, farm) · Duda, o
  Orelha (`informante`, destrava o chefe da Feira) · Descanso na birosca
  (`descanso`) · **a Lojinha do Zé** (`loja_pocoes`, na rua) · **o agiota
  Marimbondo** (`agiota`, dentro da birosca).
- **Do lado de lá do muro** (`pos_portao`, via túnel): a loja da Pista (`loja`) ·
  o descanso do primo do Nato (`descanso_2`, dentro do barraco pm1) · os
  guarda-costas do Carvão (`posmuro_1` e `posmuro_2`, que destrancam o galpão) ·
  o galpão-dungeon com o Carvão no fim.
- **Encontro aleatório (perseguidor):** em qualquer lugar da rua — ver abaixo.

Ladder de força de cada ponto, lojas, descanso e agiota: §17.6.

**Mapa de RPG:** o exterior é favela desenhada em CSS (barraco /
laje com caixa d'água / sobrado / comércio com toldo / galpão) com rua de
periferia (buracos, entulho, fiação/gato) e praça de verdade. **Interiores
navegáveis**: encosta na porta → `ENTRAR` → fade → cômodo pequeno onde você anda
até o dono e fala (birosca do Nato, oficina do Nando, mercearia da Cida). **O
covil do Carvão é um galpão-dungeon de 4 cômodos** (doca → estoque → escritório
→ o breu): mobs da Pista trancam a passagem entre os cômodos, uma prateleira dá
achado, o contador do movimento entrega a dica, e no último cômodo o Carvão está
parado no escuro → `DESAFIAR`. Motor único (`montarAmbiente`/`ctx`) serve rua e
cômodo; comando contextual (`ENTRAR`/`SAIR`/`VOLTAR`/`AVANÇAR`/`DESAFIAR`); a
posição salva inclui o interior. É o **template dos 7 bairros**.

**Descanso, agiota e Clube da Luta:**

- **A birosca do Seu Nato (`descanso`) é só cura, sem dívida nenhuma.** Três
  opções de preço: **10** recupera só quem **não caiu** (PV > 0); **30** (3×)
  recupera **todo mundo, revivendo os caídos**; **50** (5×, só aparece com
  alguém de status) é o descanso completo: vida, caídos e **status**.
  Store: `descansarTropa(custo, incluirCaidos)` / `descansoInfo()`.
- **A agiotagem mudou de dono:** é o **agiota Marimbondo** (`agiota`), NPC
  novo, parado dentro do cômodo da birosca (retrato emprestado da ficha 1206,
  "Fiado Vencido"). Escada de dívida, sem contador de fiados:
  1. **Sem dívida:** pega um **empréstimo em dinheiro** de **100**, e já fica
     devendo **10×** (**1.000**).
  2. **Já devendo:** cada **cura fiada DOBRA** a dívida atual.
  3. **No teto (dívida × 2 passaria de 10.000):** o agiota não cobra mais —
     **remenda de graça e te joga direto no Clube da Luta** ("socorro"), sem
     tela de aceitar ou recusar.
  - A dívida é **global** (uma caderneta pra todas as biroscas de todos os
    bairros) e **silenciosa** (sem HUD). Dá pra pagar parcial ou total a
    qualquer momento (`pagarBirosca`).
  - Constantes: `GANGUES_EMPRESTIMO_NATO_VALOR/MULT/TETO` = 100 / 10 / 10.000
    (`data/ganguesLoadout.js`).
- **Gate do chefe:** com qualquer dívida em aberto, **o Carvão não aceita a
  luta** (aviso `aviso_divida_chefe`). O resto da Pista (farm, pós-muro)
  continua livre, pra não virar soft-lock. O jeito "certo" de quitar é o Clube.
- **O Clube da Luta** é um **gauntlet de 3 rondas** (`gerarBandoClube`,
  orçamento FIXO que não escala com o jogador: ronda 1 = 1 corpo com 7 pontos,
  ronda 2 = 2 corpos dividindo 15, ronda 3 = 3 casca-grossa dividindo 26; pool
  `GANGUES_CLUBE_POOL` = 1211/1212/1213/1219/1311/1312/1411/1412). O jogador
  entra **vendado** (saco na cabeça → holofote → rugido da plateia).
  - **Entrada:** soma **15× o preço do descanso** à dívida e cura a tropa.
    Quem entra **por vontade própria, sem dívida**, precisa de **Rep 40**
    (`GANGUES_REP_GATE_CLUBE`); quem já deve entra sem gate.
  - **Entre rondas** (`GanguesClubeSala`): encarar machucado, **deixar o
    agiota ajeitar** (cura tudo e **dobra a dívida**) ou **cair fora** (te
    remendam, a dívida fica).
  - **Vitória na ronda 3:** quita **toda** a dívida e paga **+200 de grana**
    (`GANGUES_CLUBE_PREMIO`), sempre. Nunca dá XP. É a fonte de grana do
    grind: a rinha dá só XP, o Clube dá só grana.
  - **Derrota:** te remendam, a dívida **não cresce mais**, fica o que
    acumulou. Nunca é game over.
- **Trava:** tropa inteira no chão (todos PV 0) não entra em luta nenhuma.
- Store: `ganguesBiroscaSlice.js` (persistido em `storyProgress.__birosca =
  { divida }`). Telas: `GanguesAgiota.jsx`, `GanguesDescanso.jsx`,
  `GanguesClube*.jsx`.

**O túnel por baixo do muro (v2.74.4):** o portão/muro no fim da rua **não abre
mais sozinho**. Fechados todos os `portao.precisa`, destranca a **boca do túnel**
(prédio `tunel_ent`, "Barraco do beco") — mini-dungeon de 3 cômodos com vigias do
Sinal (`tunel_m1/m2/m3`), passagem trancada até vencer cada um, e um achado
("Buraco na parede"). Você sai no `tunel_sai` ("Barraco do outro lado"), já do
lado de lá do muro, onde ficam a loja e o galpão. Túnel bidirecional. O muro
físico só abre com `prog.boss` (chefe derrotado), aí vira atalho.

**Encontro aleatório — o perseguidor (v3.61.0):**

- **Quando:** o 1º vem com **5 minutos de jogo** e depois **a cada 15 minutos**.
  O relógio conta só o tempo andando na RUA da cena (pausa em diálogo, luta,
  interior, mochila, ficha) e fica salvo no save (`storyProgress.__aleatorio`).
- **Como:** o **Nego Véio avisa** ("sujou o bagulho"), com 3 falas próprias de
  cada tipo. Aí o perseguidor nasce longe (16–26 passos de caminho) e **vem atrás
  do jogador pelas ruas**, com pathfinding (BFS na grade de 20px, a mesma colisão
  que trava o jogador — nunca atravessa prédio, quarteirão ou muro fechado).
- **Não dá pra fugir:** ele anda um passo a cada 90ms, contra 110ms do jogador
  (~22% mais rápido). Se o jogador entra em outra luta, num interior ou abre um
  menu, ele **congela onde está** e continua quando o jogador volta pra rua.
- **Alcançou:** uma **onomatopeia** estoura no centro do mapa (~1s) e a luta
  começa direto, sem escolha. Vitória ou derrota, ele some e o próximo fica
  agendado pra daqui a 15 minutos.
- **Sempre no mínimo 2 inimigos** (Isaias) — o encontro é isento da suavização
  de 1ª luta e da regra da frustração. Força pelo personagem mais forte da
  gangue (`baseMaisForte`).
- **Os 4 tipos** (`ALEATORIO_TIPOS` em `engine/ganguesEncontroAleatorio.js`;
  arte por enquanto = bolinha colorida, moto e viatura vêm depois):

  | Tipo | Bolinha | Quem | Onomatopeia |
  |---|---|---|---|
  | **Dois numa moto** (assalto — "todo mundo tá sujeito") | amarela | 2–3: Piloto (1701) e Garupa (1702), ~90% do mais forte | VRUUUM! |
  | **A Ronda** (polícia) | azul | 2–3: Soldado (1711) e Cabo da Ronda (1712), no nível do mais forte | PARADO! |
  | **Bonde Rival** (outro bairro vem tirar satisfação) | vermelha | 3–4 de Feira/Baixada (1204–1209), ~75% | BANG! |
  | **O Cobrador** (vem cobrar o salve da Banca) | roxa | 2: cobrador (1401–1406) + capanga, ~115% | PÁ! |

  O 1º encontro é sempre a moto e o 2º a polícia; depois sorteia entre os 4, sem
  repetir o anterior. As fichas 1701–1712 ficam fora do Álbum (não são cargo da
  hierarquia).
- **Sirene (v3.62.3):** enquanto a Ronda (polícia) persegue, a tela da cena
  pisca vermelho/azul (`GanguesCena.jsx` + `styles/cena/mundo.css`).

**Balanço:** todo bando do jogo (rua, revezamento, chefe, evento) parte de um
número de pontos FIXO autorado por quem criou o encontro (ladder ponto-a-ponto,
nunca um ratio contra o time do jogador). Pedido do Isaias: "força
numericamente, é mais fácil de balancear". A dificuldade escolhida
(fácil/médio/difícil) soma ou tira um valor fixo em cima desse número — ver
`GANGUES_DIFICULDADE_AJUSTE` em `data/ganguesDificuldade.js`, o ÚNICO lugar
que decide isso pro jogo inteiro. Curva completa em §17.6 desta bíblia.

**Encontro de revezamento ("estilo Pokémon"):** um POI `treta` com
`revezamento: { pool:[ids], budgetPorCorpo, chanceDupla }` chama
`gerarBandoRevezamento` — quase sempre 1 capanga, às vezes dupla (o 2º corpo
sai 2–3 pontos abaixo, `GANGUES_DUPLA_DEDUCAO_MIN/MAX`). Vale também dentro de
escolhas (`viraTreta.revezamento`). Pool da rua (`PISTA_POOL_RUA`):
Farejador/Zóio/Pingo/Ratazana/Chinelada (1101/1102/1103/1201/1203). Túnel:
m1 `[1101,1102,1103]` b4 · m2 `[1101,1102,1103,1201]` b6 · m3 `[1101,1102,1103]` b5.

### Território 2 — A Feira · Muvuca · `#7ee787`
Facção: Acerto de Contas (103) / Os Gato (104). O comércio, os camelô, a luz de
gato. Aqui não tem tiro — tem **dívida**. Primeiro território costurado pelo
Retalho sem sangue.

**Cena navegável desde a v3.65.0** (`data/cenas/feira/`, plano completo e
decisões em `PLANO_FEIRA.md`). Mesmo motor da Pista — o mapa é o esqueleto da
Pista **espelhado** (ruas, muro e colisões iguais, lados trocados), com bancas
de lona espalhadas. Tudo que era chumbado da Pista virou dado da cena (`ruas`,
`muro`, `postes`, `textos`, `posMuro`, `dicaQuest`, `aleatorio`,
`fraquezaChefe`), então o 3º território entra só com dado.

- **Duas metades.** Embaixo, a Feira de dia. Em cima da **barricada do
  apagão** (o "muro" daqui, y 1330–1350), a Feira **no escuro**: só um círculo
  de luz em volta do jogador (`cena.apagao`) até o Cobrador cair. Chega-se lá
  pela **Galeria dos Gato** (o "túnel": 3 cômodos escuros, a porta do meio com
  o `PuzzleDecoder` — errar vira treta com Os Gato, sem travar o ponto).
- **Caminho obrigatório (10, abre a Galeria):** A Catraca (26) → Banca do Turco
  (papo: paga 20 de taxa ou não; fala diferente pra quem deve ao agiota) → A
  cobrança (29) → Quadro de Luz (labirinto; errar dá **choque** −2 PV na tropa
  e vira treta; dá o **fio de cobre**) → Beco dos Gato (32) → Balança viciada
  (35, 1ª vitória dá uma válvula) → O Caderneta (35, fixo; **+1 Malícia contra
  quem deve**) → **Rádio do Toninho** (fetch quest: 1 fio de cobre + 3
  válvulas; conserta e revela a Mão do Turco e o rádio pirata) → **Mão do
  Turco** (38, General fixo, 1ª vitória dá o Olho Grego 236) → **Caixa
  Forte** (41, General fixo, **grana ×2**, 1ª vitória dá o Colete de Placa 221).
- **Lado apagado:** depósito 1 (44) e depósito 2 (47, **Rep 60**) guardam o
  **Mercadão** — a dungeon final é um **labirinto de barracas** (v3.66.0,
  pedido do Isaias: "um mini labirinto com as barraquinhas... umas seis ou
  sete batalhas antes do chefe"). 3 salas compridas de barracas em
  zigue-zague (`salaLabirinto` em `feira/interiores.js`: 3 fileiras por sala,
  cada uma com um vão alternando de lado), **2 brigas por sala** — a 2ª só
  aparece depois da 1ª e a passagem só abre depois da 2ª, então não dá pra
  passar reto: barraca_1 (44) → barraca_2 (bando de 3–5) → barraca_3 (46) →
  barraca_4 (47, com o estoque escondido num canto) → barraca_5 (48) →
  barraca_6 (49) → o fundo com o **Marreta** e o bando dele (7ª briga) e o
  livro-caixa → o cofre do Cobrador. **7 brigas obrigatórias dentro do
  Mercadão**, 9 contando os depósitos.
- **Chefe — O Cobrador (1501):** nível real 46 (52 pontos) + Mão do Turco e
  Caixa Forte de escolta (29 cada) — `GANGUES_CHEFE_BUDGET.feira` 110,
  `liderFracChefe` 0,47, 3 corpos. Só aceita a luta depois do **Duda** (Pista)
  — `precisaInformante`. Com as **3 páginas da caderneta** (`pagina_1/2/3`,
  uma em cada metade + uma na Galeria) ele entra com **−2 de Couro**. 1ª
  vitória: **Porrete do Cobrador (138)**.
- **Opcionais:** Camelô (loja dos consumíveis novos + válvula + sucata, com
  **pechincha**: acertou o anagrama, −30% na visita) · Muamba de Domingo
  (stealth 6×6 com cronômetro, dá válvula) · **Pensão da Dona Regina** (15 /
  45; **sem grana, ela cura fiado e a gangue fica devendo 1 favor** —
  `storyProgress.__regina`; os favores `favor_marmita`/`favor_devedor`/
  `favor_cobrador` pagam) e a pensão da filha do lado apagado · **Juro Alto**
  (agiota: empréstimo de **300**, mesma caderneta global do Marimbondo — os
  textos da agiotagem usam `{agiota}`) · **Rinha de Apostas** (aposta 0/50/100/
  200 antes da luta, volta em dobro) · Mercearia do Seu Aziz (lado apagado,
  o equipamento INCOMUM dos 3 caminhos — §9.7) · **Serralheria do Bigode** (aprimora até **+4**) · rádio
  pirata (informante da Baixada).
- **Encontro aleatório:** os 4 da Pista + **o Rapa** (laranja; se ganhar de
  você leva 1 consumível) + **o Apagão** (só no lado escuro, Os Gato no breu)
  + a **Cobrança do Turco** no lugar do Cobrador quando você deve ao agiota
  (se ganhar, leva 10% da grana na mão; nunca mexe na dívida).
- **Economia:** grana da vitória 15 + 5 por inimigo a mais (chefe mínimo
  800) e **AP ×1,5** (`GANGUES_RECOMPENSA_TERRITORIO`, `ganguesVictoryResolver.js`)
  — a Feira é o grind, o multiplicador evita que fique arrastado. O Clube da
  Luta escala com o território (rondas 26 / 50 / 80 na Feira).
- **Derrota:** sem game over, igual à Pista — acorda na pensão mais perto
  (`destinoSocorroDerrota` é genérico).
- **Arte que falta:** retratos de 1304–1306, 1403–1404, 1453–1454, **1501** e
  dos NPCs Regina, Toninho, Aziz e Bigode — até lá, cai na inicial.

### Território 3 — A Baixada · Correria · `#18dafb`
Facção: os 3 cacos do Sombra (105/106/107). Do outro lado da linha do trem. A
facção do Sombra rachou em três. **Fragmentação** — o que acontece quando um
território perde o dono.

POIs: **A linha do trem** (fronteira física e simbólica com a Pista) · **O
valão** (onde o Sombra morreu, ninguém entra à noite) · **O barraco do Sombra**
(abandonado, cada caco disputa o direito de ocupar) · **O trio de esquinas**
(cada caco domina uma, briga constante entre elas).

**A cena jogável (v3.81.0, 29/09/2026 — plano aprovado pelo Isaias).** Dado em
`data/cenas/baixada/`, esqueleto da Pista **sem muro**: o bairro inteiro é
andável desde o começo. Faixa de nível **34–46**.

- **A virada.** O "chefe" que foge o bairro inteiro é o **folgado** — se
  apresenta como Fura-Bucho, mas é o **Zé Pavão (1322)**, o inimigo mais fraco
  da Baixada (ficha 34). O dono de verdade é o **velho da entrada**: grogue,
  com cara de morador de rua, sentado no meio-fio, que a cada conversa solta
  uma filosofia com gíria (`falasSorteadas` — "o céu vermelho contra o mundo
  azul", "o cego viu o que o surdo ouviu"…). Ele é o **Fura-Bucho (1502)**.
- **Barra de Respeito.** Tudo é ganhar respeito. A cadeia do folgado
  (`folgado_1`…`folgado_5`) enche a barra: o folgado aparece com pino grande
  (`fuga`), solta a marra ("tu nem é digno de mim"), joga um capanga — Sangria
  34, Gelo 36, Sobra 38, depois os Generais Caco Maior 41 e Nome do Sombra 43 —
  e some pro outro lado da linha. Barra cheia, ele não tem mais pra onde
  correr (`folgado_final`, 34).
- **O café.** Batido, o folgado entrega: "dá um café pro véio". A **Dona Cida**
  (padaria) libera o **Café do Véio (item 16)**; entregue ao velho
  (`veio_cafe`), ele acorda e vira o chefe no mesmo lugar da entrada: Fura-Bucho
  46 + os dois Generais de escolta (orçamento 115 × 0,40). 1ª vitória: o
  **Espeto do Fura-Bucho (140, épico, nível mín. 44)**.
- **A linha do trem** corta o mapa (faixa y1296–1336): a cada ~24 s o trem
  apita (3 s) e passa (8 s), fechando a travessia. Quem estiver nos trilhos
  leva 2 de dano na tropa (nunca derruba) e é jogado pro lado mais perto
  (`hooks/useGanguesTrem.js`).
- **O resto do bairro:** Rinha do Trilho (farm infinito), Birosca da Dona
  Lurdes e Pensão do Trilho (descansos dos dois lados da linha), o agiota
  **Resto de Faca** (empréstimo de 500), o **Depósito do Seu Nono** (loja do
  RARO 301–318 dos 3 caminhos, com o Mandingueiro acima) e a caixa na beira da
  linha. O chefe só abre depois do rádio pirata da Feira (`precisaInformante`).
- **Fica pra depois:** o "corre do respeito" (missão num bairro anterior) não
  entrou nesta versão.

### Território 4 — A Vila · Disputa · `#ffae32`
Facção: Bonde dos Prédio (108) / Os Andar de Cima (109). O conjunto, os prédios
de dez andares, a escada sem luz. **Resistência militarizada** — a única região
que entrou na órbita do Retalho por guerra.

POIs: **O térreo do bloco A** (primeira linha de defesa do bonde) · **A escada
sem luz** (sobe apanhando, andar por andar) · **O elevador quebrado**
(puzzle/obstáculo, atalho arriscado) · **A cobertura** (onde Os Andar de Cima
vivem, vista de toda a Vila).

**Cena navegável (v3.84.0, 30/09/2026 — plano em `PLANO_VILA.md`, código em
`data/cenas/vila/`).** Ponte: a Dona Lurdes (birosca da Baixada, `informante_vila`)
destranca o Ferrugem. Térreo livre: guarita (47) → o Portaria foge (48) → Cadeado (49)
abre o **Bloco A**, um interior só com o hall e os 10 andares (a escada é a
`passagem` de cada cômodo, trancada até bater quem segura o andar). Ladder 50 · 51 ·
Trinco 52 · 53 · 54 · 55 · Bloco Inteiro 56 (G, drop 405) · 57 · Chave Mestra Maior
58 (G, drop 412) · **Ferrugem 59** na cobertura (+ escolta ~44/46; orçamento 148 ×
0,40, 3 corpos). Andares 1–4 e 6 no escuro até o chefe cair. **Elevador quebrado**:
sem a chave (Dona Neide, 5º andar) só vai do hall ao 1º; com ela, térreo/5º/9º — só
andar já liberado — e 35% de travar (emboscada + 1 de alerta). **Barra de Alerta**
(0–3): perder na Vila ou o elevador travar sobe; cada ponto é +1 de ficha em todo
corpo das tretas daqui (nunca passa do Ferrugem); bater o Portaria desce, a última
aparição dele (6º andar) zera e trava. Descanso 30 (Birosca do Térreo e Dona Neide —
quem cai do 5º pra cima acorda nela), agiota Aluguel Vencido (empréstimo 800), Brechó
da Síndica (pesado 401–418 + Poção de Osso 41), Oficina do Zelador (aprimora até
+6), Rinha da Laje, Clube 49/96/150. AP ×1,5. Ponto fraco: a caixa d'água da
cobertura (−2 Couro). Drop do chefe: Taco da Ferrugem (141). Ficou pra depois: o
corre do respeito (stealth da ponte), a pilha de lanterna e o chefe falso.

### Território 5 — O Morro · Guerra · `#ff8f3c`
Facção: Frente da Escada (110) / Os Fogueteiro (111), sob Zefa. A favela de
encosta, a escadaria que muda de forma a cada laje nova. **Lealdade pessoal** — a
região que nunca foi realmente dominada, só negociada.

POIs: **A escadaria de cimento** (única subida, guardada pela Frente da Escada) ·
**A boca da Zefa** (onde ela recebe quem quer negociar) · **O posto de rojão**
(sistema de alerta dos Fogueteiro) · **A creche da Zefa** (onde ela criou a
molecada, intocável até pra rivais).

**Cena navegável (v3.85.0, 30/09/2026 — código em `data/cenas/morro/`).** Mecânica
do Morro: **a escadaria negociada**. Três portões dos Fogueteiro (`cena.barreiras`)
fecham a rua de lado a lado; cada um só abre com o AVAL de um bairro já dominado,
negociado na sala dos fundos da birosca de lá: **Pista** — pedágio de 600 pro
Marimbondo; **Feira** — 3 válvulas pros rádios dos Fogueteiro (Juro Alto);
**Baixada** — 2 Poções de Osso pro remédio da creche (Dona Lurdes). Os avais só
aparecem depois do recado do Morro (sala dos fundos da birosca da Vila,
`informante_morro`, que também destranca a Zefa). Ladder: escadaria 60 → Cupim 61 →
[portão 1] → laje nova 63 → [portão 2] → posto de rojão 65 → Segunda Mãe 66 (G) →
[portão 3] → Escadaria Inteira 68 (G) → última escada 69 → a boca da Zefa: Conta do
Morro 70 → **A Fera 72** (orçamento 180 × 0,40, 3 corpos, escolta ~54). Birosca do Pé
do Morro (descanso 40, agiota Conta do Morro com empréstimo 1000 nos fundos),
Serralheria da Laje (+7), Venda do Morro (reaproveita o pesado da Vila — linha de
item própria do Morro fica pra depois), Creche da Zefa (papo + achado), Rinha da
Laje de Cima, Clube 61/120/186, AP ×1,5. Drop da Zefa: Vara da Fera (134). Ficou pra
depois: a creche como zona sem briga de verdade e a escadaria que muda de forma.

### Território 6 — Alto do Morro · No sangue · `#ff6b6b`
Facção: Os Cinco (112) / A Roda (113). Atrás da porta de aço. **A ameaça que
quase virou cúpula paralela** — o ponto mais "político" do jogo.

POIs: **A porta de aço** (única entrada, fisicamente guardada) · **O círculo da
Roda** (onde treinam a formação de combate) · **A sala dos Cinco** (quase virou
sede de cúpula paralela) · **O escritório do Contador** (improvisado, todo o Alto
deve favor a ele).

### Território 7 — A Laje · A Coroa · `#a855f7`
Facção: Bonde do Retalho (114). O topo. De um lado, Marélia inteira. Do outro, o
Retalho. **Onde a pergunta do jogo ("dá pra segurar Marélia?") é respondida com
um não.**

POIs: **A entrada costurada** (onde as três linhas do bonde do Retalho vigiam) ·
**A sala de costura** (onde Damião "organiza" os seis bairros como planilha) · **O
topo da Laje** (o confronto final, vista de Marélia inteira embaixo).

Ponte entre regiões (mantida): a Feira só libera o chefe depois de o jogador
voltar na Pista e falar com o informante **Duda, o Orelha** (3002).

---

## 5. O Álbum de Marélia — roster de inimigos

Cada inimigo derrotado pela **primeira vez** desbloqueia uma entrada. Organizado
por **cargo** (§0). **91 entradas colecionáveis** = a hierarquia da Banca inteira
(Vigia 21 + Vapor 21 + Gerente 21 + Cobrador 14 + General 14). Os 8 chefes (§6)
aparecem numa aba própria, **fora da contagem**.

Shape canônico:

```json
{
  "id": 1201,
  "cargoId": 202,
  "faccaoId": 101,
  "territorioId": 1,
  "arma": "facão",
  "elemento": null,
  "album": {
    "titulo": "Ratazana",
    "linha": "Cria de ponto — a primeira treta de verdade da Pista.",
    "desbloqueadoEm": "primeira_vitoria"
  }
}
```

Todas as 91 entradas têm ficha de combate em `data/gangues-enemies.json`.
Retrato (cabeça) existe hoje para o elenco da Pista — ver §15.

### 5.1 Nível 1 — VIGIA / FOGUETEIRO (faixa 1101–1121)

A base da hierarquia. Primeiro contato do jogador em cada bairro — avisam, correm,
raramente batem de frente.

| ID | Nome | Território | Arma | Lore |
|---|---|---|---|---|
| 1101 | Farejador | Pista | — | Não briga, corre e avisa — enfrentá-lo é perseguição antes de porrada. |
| 1102 | Zóio | Pista | faca pequena | O olho da esquina — vê tudo que sobe e desce a Pista, e comenta tudo. |
| 1103 | Pingo | Pista | estilingue | O mais rápido da Pista — foge se levar 2 golpes seguidos. |
| 1104 | Extensão | Feira | fio elétrico | Um dos Gato mais ousados, liga até poste vigiado. |
| 1105 | Boleto Vencido | Feira | garrafa quebrada | Devedor que virou capanga pra pagar a própria dívida. |
| 1106 | Luz de Gato | Feira | fiapo elétrico | Choque leve, atordoante — o alerta vivo da Feira. |
| 1107 | Maré Baixa | Baixada | corrente curta | O mais jovem dos cacos, ainda provando valor. |
| 1108 | Trilho | Baixada | barra de ferro | Ataca em cima do tempo do trem passar. |
| 1109 | Boato | Baixada | faca social | Espalha rumor sobre rival antes de brigar. |
| 1110 | Portaria | Vila | rádio-cassetete | Vigia da entrada principal, avisa o bonde inteiro. |
| 1111 | Escada Cega | Vila | lanterna-cassetete | Patrulha a escada sem luz, usa a luz como arma tática. |
| 1112 | Vizinho Barulhento | Vila | cabo de vassoura | Briga por qualquer motivo pequeno, sempre alerta. |
| 1113 | Vento do Alto | Morro | estilingue reforçado | Ataca de longe antes de você chegar perto. |
| 1114 | Fumaça de Rojão | Morro | rojão duplo | Solta dois de uma vez, imprevisível. |
| 1115 | Beco sem Saída | Morro | faca de cozinha | Conhece toda passagem escondida do Morro. |
| 1116 | Porta de Aço | Alto do Morro | barra de ferro | Guarda literal da entrada, não sai do posto. |
| 1117 | Sala Fechada | Alto do Morro | cassetete | Guarda a sala privada dos Cinco. |
| 1118 | Favor Devido | Alto do Morro | faca de contador | Deve ao Contador, luta pra pagar. |
| 1119 | Última Guarda | Laje | facão curto | Último degrau antes da sala de costura — nada passa sem ser visto. |
| 1120 | Olho da Costura | Laje | — | Vê tudo que entra e sai da Laje, reporta direto ao Retalho. |
| 1121 | Sentinela do Topo | Laje | estilingue | Avista Marélia inteira antes de qualquer ataque chegar. |

### 5.2 Nível 2 — VAPOR (faixa 1201–1221)

Vende, sustenta a boca, cara a cara com o cliente. Dano baixo, mas em número.

| ID | Nome | Território | Arma | Lore |
|---|---|---|---|---|
| 1201 | Ratazana | Pista | facão | Cria de ponto — a primeira treta de verdade da Pista. |
| 1202 | Brasa | Pista | estilingue | Copiava o Carvão até o apelido colar. |
| 1203 | Chinelada | Pista | sandália reforçada | Briga suja, ataca 2× mais rápido, dano baixo. |
| 1204 | Choque | Feira | faca | Faz ligação clandestina, some no meio das bancas. |
| 1205 | Balconista | Feira | faca de cozinha | Trabalha na banca de dia, cobra à noite. |
| 1206 | Fiado Vencido | Feira | facão curto | Cobra dívida velha que só ele lembra. |
| 1207 | Água Parada | Baixada | faca enferrujada | Devoto do Sombra morto, ainda "fala com ele". |
| 1208 | Ferro Velho | Baixada | cano | Recicla arma de sucata — dano imprevisível. |
| 1209 | Valão | Baixada | remo improvisado | Vive perto de onde o Sombra caiu, os outros o evitam. |
| 1210 | Varal | Vila | fio de roupa | Estrangula com corda de varal, arma improvisada. |
| 1211 | Condomínio | Vila | chave mestra | Acesso a todo apartamento, informação valiosa. |
| 1212 | Zelador | Vila | chave-de-fenda | Infiltrado — parece morador comum. |
| 1213 | Ladeira | Morro | facão curto | Usa a inclinação do Morro como arma. |
| 1214 | Laje Nova | Morro | pá | Construtor improvisado, usa ferramenta como arma. |
| 1215 | Criação da Zefa | Morro | punhos | Um dos moleques que ela criou, técnica emprestada. |
| 1216 | Círculo | Alto do Morro | corrente dupla | Luta sempre em par, nunca sozinho. |
| 1217 | Disciplina | Alto do Morro | vara de bambu | Pune quem sai da formação da Roda. |
| 1218 | Doutrina | Alto do Morro | bastão | Recruta e treina pros Cinco. |
| 1219 | Retalho Solto | Laje | facão pequeno | Recém-recrutado, ainda provando valor pro bonde. |
| 1220 | Ponto da Laje | Laje | faca pequena | O único ponto de venda que resta no topo — pequeno, simbólico. |
| 1221 | Fio Cortado | Laje | tesoura de tecido | Vende o que sobra da costura — retalho literal. |

### 5.3 Nível 3 — GERENTE DE BOCA (faixa 1301–1321)

Administra um ponto de verdade. Dano e defesa acima da média, disciplina própria.

| ID | Nome | Território | Arma | Lore |
|---|---|---|---|---|
| 1301 | Cão Louco | Pista | corrente | Agressivo, um degrau acima da cria de ponto. |
| 1302 | Riscado | Pista | canivete | Cicatrizes de quem já perdeu pra ele — troféus de guerra. |
| 1303 | Mão de Cola | Pista | corrente curta | Rouba o que vê, não solta o que pega. |
| 1304 | Unha de Fome | Feira | porrete | Cobrador de rua — bate antes do chefe cobrar de verdade. |
| 1305 | Caderneta | Feira | — | Sabe o que cada morador deve, usa como arma psicológica. |
| 1306 | Pesagem | Feira | balança de ferro | "Pesa" tudo — inclusive gente, literalmente. |
| 1307 | Herdeiro | Baixada | faca dupla | Afirma ser sucessor legítimo, ninguém reconhece. |
| 1308 | Sangria | Baixada | faca | O mais bravo dos três cacos do Sombra. |
| 1309 | Gelo | Baixada | faca | O caco calculista — não erra. |
| 1310 | Cadeado | Vila | chave de cano | Toma conta do térreo. |
| 1311 | Trinco | Vila | chave de cano | Comanda um andar inteiro. |
| 1312 | Elevador | Vila | cano curto | Só ataca em espaço fechado, luta suja em corredor. |
| 1313 | Cupim | Morro | faca | Vigia da escadaria com autoridade sobre a subida. |
| 1314 | Cascalho | Morro | faca | Capitão — subiu rápido, bate mais forte que todo mundo. |
| 1315 | Última Escada | Morro | bastão | Guarda a última curva antes do Alto do Morro. |
| 1316 | Verme | Alto do Morro | porrete | Um dos cinco que quase viraram cúpula. |
| 1317 | Presa | Alto do Morro | porrete | Braço-direito da cúpula quase formada. |
| 1318 | Engrenagem | Alto do Morro | corrente | Luta em formação, protege o centro. |
| 1319 | Fiapo | Laje | facão | Primeira linha do bonde do Retalho. |
| 1320 | Agulha | Laje | facão | Segunda linha, confiança de metade da Laje. |
| 1321 | Linha Reta | Laje | facão longo | General mais antigo, sem movimento desperdiçado. |

### 5.4 Nível 4 — COBRADOR (faixa 1401–1414)

Resolve dívida na marra. Já é um combatente sério, um degrau abaixo de encarar o
chefe.

| ID | Nome | Território | Arma | Lore |
|---|---|---|---|---|
| 1401 | Bala Solta | Pista | estilingue de metal | Vendedor de bala que guarda pedra no bolso. |
| 1402 | Troco Certo | Pista | porrete | Cobra até a última moeda, nunca erra a conta. |
| 1403 | Marreta | Feira | porrete | Braço de confiança, cobra dívida grande sem conversa. |
| 1404 | Juro Alto | Feira | porrete de metal | Dobra a dívida se o prazo passar. |
| 1405 | Sobra | Baixada | corrente | O mais desesperado dos cacos — nada a perder. |
| 1406 | Resto de Faca | Baixada | faca dupla | Cobra em nome dos três cacos ao mesmo tempo. |
| 1407 | Goteira | Vila | taco | Olha o bonde de cima pra baixo. |
| 1408 | Aluguel Vencido | Vila | chave de cano | Cobra o "aluguel" que o bonde impõe em cada andar. |
| 1409 | Pavio Curto | Morro | rojão (fogo) | Solta aviso, não se importa de acertar você. |
| 1410 | Conta do Morro | Morro | vara curta | Guarda as contas de quem deve favor à Zefa. |
| 1411 | Quase-Cúpula | Alto do Morro | espada curta | O mais ambicioso dos Cinco. |
| 1412 | Dívida do Alto | Alto do Morro | bengala fina | Trabalha direto pro Contador. |
| 1413 | Costura Fina | Laje | agulha longa | Poucos ataques, mas certeiros. |
| 1414 | Conta Fechada | Laje | facão | Fecha a conta de quem tenta subir sem pagar passagem. |

### 5.5 Nível 5 — GENERAL / BRAÇO-DIREITO (faixa 1451–1464)

O último degrau antes do chefe. Praticamente mini-bosses — melhor stats do jogo
fora das lutas de território. **Um por território** (a Laje tem dois).

| ID | Nome | Território | Arma | Lore |
|---|---|---|---|---|
| 1451 | Sinaleiro Chefe | Pista | apito + cassetete | Comanda todos os vigias — se ele apita, o bairro corre. |
| 1452 | Rasteira Velha | Pista | corrente | A mais antiga do Bonde do Sinal, treinou os pivete novo. |
| 1453 | Mão do Turco | Feira | porrete grande | Braço mais próximo do Cobrador, resolve o que ele não suja a mão. |
| 1454 | Caixa Forte | Feira | cassetete de ferro | Guarda o dinheiro da Feira inteira. |
| 1455 | Caco Maior | Baixada | faca ritual | O mais respeitado dos três cacos, quase reunificou a Baixada sozinho. |
| 1456 | Nome do Sombra | Baixada | faca enferrujada | Usa o nome do chefe morto como arma psicológica. |
| 1457 | Bloco Inteiro | Vila | chave-mestra grande | Comanda um prédio inteiro sozinho. |
| 1458 | Chave Mestra Maior | Vila | molho de chaves pesado | Acesso a todo apartamento — informação que vale mais que dinheiro. |
| 1459 | Segunda Mãe | Morro | vara | Cuida da criançada quando a Zefa não pode. |
| 1460 | Escadaria Inteira | Morro | bastão longo | Controla a subida sozinho, ninguém passa sem aval. |
| 1461 | Quarto Nome | Alto do Morro | porrete | Um dos Cinco mais próximos de virar cúpula de verdade. |
| 1462 | Formação Completa | Alto do Morro | corrente dupla | Comanda a Roda em batalha — a doutrina virou corpo. |
| 1463 | Tesoura | Laje | facão | General — comanda a Laje inteira em nome do Retalho. |
| 1464 | Corte Certo | Laje | facão gêmeo | Braço-direito da Tesoura, nunca erra o corte final. |

### 5.6 Fichas do encontro aleatório (1701–1712, fora do Álbum)

Não são cargo da hierarquia da Banca — existem só pro perseguidor da rua (§4).

| ID | Nome | Tipo de encontro |
|---|---|---|
| 1701 | Piloto | Dois numa moto |
| 1702 | Garupa | Dois numa moto |
| 1711 | Soldado da Ronda | A Ronda (polícia) |
| 1712 | Cabo da Ronda | A Ronda (polícia) |

`preferred_mode` → caminho: `fists` = Porradeiro, `armed` = Paredão,
`power` = Mandingueiro.

---

## 6. Dossiê dos chefes (faixa 1500–1600)

Stats = ficha base do catálogo; em luta, o chefe é escalado pro orçamento
fixo do bairro (`GANGUES_CHEFE_BUDGET`, §12) — na Pista o Carvão luta com
ficha 30.

### 1500 · Carvão — Chefe da Pista
Facção: Rato de Pista (101) · Arma: facão · Stats: Porrada 6 · Pique 1 · Couro 2 · Osso 3 · Malandragem 1 (nível de fachada 29).
Fala: *"Cê é ligeiro? Eu sou fumaça, cria. Pisca que eu sumo — e cê apanha no
escuro."* Some no meio da rua, ataca no escuro. Só desce pra encarar quando a
Pista inteira já conhece o nome da sua gangue.

### 1501 · O Cobrador — Chefe da Feira
Facção: Acerto de Contas (103) · Arma: porrete · Stats: Porrada 2 · Pique 2 · Couro 6 · Osso 4 · Malandragem 1 (nível de fachada 33).
Fala: *"Marélia inteira me deve. Agora a {suaGangue} também. Aqui quem não paga
em dinheiro, paga no osso."* Anota tudo, cobra tudo. Bate no braço antes de bater
na cara.

### 1502 · Fura-Bucho — Chefe da Baixada
Facção: os três cacos, temporariamente unidos sob ele · Arma: espeto · Stats: Porrada 2 · Pique 2 · Couro 7 · Osso 5 · Malandragem 2 (nível de fachada 46).
Fala: *"A Baixada é minha desde que o Sombra caiu no valão. Cê tomou meus ponto?
Vem tomar o resto."* Segura os três cacos numa lealdade frágil.
**Na cena jogável** ele é o velho grogue da entrada — só acorda com o café da Dona
Cida. O folgado que usa o nome dele é o Zé Pavão (1322).

### 1503 · Ferrugem — Chefe da Vila
Facção: Bonde dos Prédio (108) · Arma: taco · Stats: Porrada 2 · Pique 3 · Couro 7 · Osso 5 · Malandragem 2 (nível de fachada 59).
Fala: *"Subiu os dez andar só pra apanhar no último? Respeito a disposição. Não
muda merda nenhuma."* Mora no último dos dez andares — a exaustão é a arma dele
antes da porrada.

### 1504 · A Fera / Zefa — Chefe do Morro
Facção: Frente da Escada (110) · Arma: vara · Stats: Porrada 8 · Pique 3 · Couro 8 · Osso 7 · Malandragem 9 (nível de fachada 72).
Fala: *"Eu criei metade da criançada que a {suaGangue} bateu pra chegar aqui.
Senta aí. O teu castigo vai demorar."* Sabe exatamente onde bater pra doer sem
machucar de verdade — a única chefe tratada como figura materna da quebrada.

### 1505 · O Contador — Chefe do Alto do Morro
Facção: A Roda (113) / Os Cinco (112) · Arma: bengala · Stats: Porrada 10 · Pique 6 · Couro 9 · Osso 9 · Malandragem 10 (nível de fachada 85).
Fala: *"Cê tem dois lutador. Eu tenho o Alto do Morro inteiro devendo favor. Faz
a conta e vai embora."* Não briga por raiva, briga porque a conta fecha assim.

### 1600 · O Retalho — Damião — Chefe Final
Facção: Bonde do Retalho (114) · Arma: facão · Stats: Porrada 12 · Pique 5 · Couro 11 · Osso 10 · Malandragem 12 (nível de fachada 100).
Fala: *"Marélia inteira já foi minha uma vez. Seis bairro na mão, a Laje no pé.
Só que essa porra não costura — nem eu segurei. Sobe aqui que eu te mostro na
marra."* O único que já segurou seis bairros de uma vez. Generais: **Tesoura**
(1463), **Corte Certo** (1464), e as linhas Fiapo (1319) / Agulha (1320).

---

## 7. Os 30 lutadores recrutáveis (o elenco do jogador)

Catálogo `ldi_gangues_30_personagens_v1.json` (fonte única — esta tabela é gerada
a partir de `unlock_plan`/`id`/`combat_path`/`special_path`/`max_evolution` do
catálogo, nunca autorada à mão). Nome curto de rua + caminho + subcaminho + velocidade
(`speed_tier`, §17.1) + título de evolução máxima (nível 99, teto de personagem jogável).

**Ids 1-12 = os 12 personagens oficiais** (os únicos com arte pronta —
`RECRUTAVEIS/`: Trinca, Fenda, Muro, Catraca, Faísca, Cicatriz, Marreta, Mira,
Navalha, Ponto, Sangue, Troco), liberados durante o gameplay **principal**:
**`w1` = ids 1-5**, os 5 iniciais, disponíveis desde o começo · **`w2` = ids
6-12**, 1 por território derrotado (7 territórios ao todo — a Pista + os 6
bairros), na ordem: 6 Cicatriz, 7 Marreta, 8 Mira, 9 Navalha, 10 Ponto, 11
Sangue, 12 Troco. **Ids 13-30** (sem arte ainda) ficam fora do gameplay
principal por ora: `w3` = liberado ao zerar a campanha uma 2ª vez (New Game+),
`w4` = reservado só para evento/admin.

| id | Nome | Caminho | Subcaminho | Velocidade | Título nv.99 | Libera | Gênero |
|---|---|---|---|---|---|---|---|
| 1 | Trinca | Porradeiro | Bruto | medio | O Quebra-Linha | w1 | M |
| 2 | Fenda | Porradeiro | Duelista | rapido | Primeiro Corte | w1 | F |
| 3 | Muro | Paredão | Muralha | lento | Fortaleza | w1 | M |
| 4 | Catraca | Paredão | Reativo | medio | Bateu, Voltou | w1 |  |
| 5 | Faísca | Mandingueiro | Tempestade | rapido | Antes do Trovão | w1 | M |
| 6 | Cicatriz | Porradeiro | Vingador | lento | Dívida Antiga | w2 | M |
| 7 | Marreta | Porradeiro | Bruto | medio | Demolidor | w2 | M |
| 8 | Mira | Porradeiro | Especialista | rapido | Cirúrgica | w2 | F |
| 9 | Navalha | Porradeiro | Duelista | rapido | Sem Aviso | w2 | F |
| 10 | Ponto | Porradeiro | Especialista | rapido | Ponto Cego | w2 | F |
| 11 | Sangue | Porradeiro | Fúria | medio | Tudo ou Nada | w2 | F |
| 12 | Troco | Porradeiro | Vingador | medio | Cobrança | w2 | M |
| 13 | Touro | Porradeiro | Fúria | lento | Último de Pé | w3 |  |
| 14 | Concreto | Paredão | Muralha | lento | Bloco Vivo | w3 |  |
| 15 | Guarda | Paredão | Guardião | medio | Linha de Frente | w3 |  |
| 16 | Ombro | Paredão | Guardião | lento | Ninguém Passa | w3 |  |
| 17 | Boca | Paredão | Provocador | rapido | Olha Pra Mim | w3 |  |
| 18 | Isca | Paredão | Provocador | rapido | Alvo Perfeito | w3 |  |
| 19 | Rebote | Paredão | Reativo | rapido | Volta em Dobro | w4 |  |
| 20 | Ferro | Paredão | Resiliente | lento | Não Cai | w4 |  |
| 21 | Osso | Paredão | Resiliente | lento | Ainda de Pé | w4 |  |
| 22 | Brasa | Mandingueiro | Ígneo | medio | Incêndio | w3 |  |
| 23 | Cinza | Mandingueiro | Ígneo | medio | Depois do Fogo | w3 |  |
| 24 | Maré | Mandingueiro | Aquático | lento | Maré Cheia | w3 |  |
| 25 | Chuva | Mandingueiro | Aquático | rapido | Temporal | w3 |  |
| 26 | Raiz | Mandingueiro | Terreno | lento | Chão Fechado | w3 |  |
| 27 | Racha | Mandingueiro | Terreno | medio | Falha Sísmica | w4 |  |
| 28 | Trovão | Mandingueiro | Tempestade | medio | Queda do Céu | w4 |  |
| 29 | Névoa | Mandingueiro | Ilusório | rapido | Sem Rosto | w4 |  |
| 30 | Espelho | Mandingueiro | Ilusório | medio | Duas Verdades | w4 |  |

> Colisão de apelidos: **Marreta** (7) e **Brasa** (22) também são nomes de
> inimigo (1403, 1202) — apelidos de rua se repetem, não é a mesma pessoa.

A gangue tem **nome escolhido pelo jogador** — é o nome que os inimigos cospem e
que "o Retalho vai cuspir quando cê chegar na Laje". Sugestões do jogo: *Bonde do
Fim de Linha, A Firma, Trilha de Cima, Sindicato do Beco, Quebrada Nova*.

### 7.1 História de recrutamento (bios)

Cada um dos 30 recrutáveis tem uma bio curta (quem é / história / por que
recrutar), escrita pelo Isaias (set/2026) — mostrada no botão **HISTÓRIA**
da ficha de recrutamento (`components/GanguesFichaBio.jsx`, texto em
`data/ganguesBiografias.js`, chave = `character_template_id`, o mesmo id
da tabela acima). **PT-first**: o botão/título/fechar respeitam o idioma
do jogador (pt/en/es), mas o texto de lore em si só existe em português
por enquanto — traduzir os 30 pra en/es é trabalho futuro, não uma lacuna
de bug.

**PORRADEIROS**

1. **Trinca** — Bruto · O Quebra-Linha
   *Quem é:* Um brigador de rua que aprendeu cedo que, quando uma
   passagem fecha, alguém precisa ser o primeiro a atravessar.
   *História:* Trinca cresceu fazendo serviço pesado e carregando
   mudança, feira e sucata pela Pista. Ganhou o apelido depois de
   arrebentar uma porta para tirar três crianças de uma casa pegando
   fogo. Descobriu depois que a mesma força que salva também abre
   caminho numa briga.
   *Por que recrutar:* Trinca não recua quando a linha inimiga fecha. É
   o cara que entra primeiro para os outros conseguirem passar.

7. **Marreta** — Bruto · Demolidor
   *Quem é:* Um sujeito enorme, quieto e assustadoramente forte.
   *História:* Trabalhou anos quebrando parede, carregando concreto e
   desmontando construção clandestina. Quando o patrão desapareceu sem
   pagar uma equipe inteira, Marreta vendeu as próprias ferramentas para
   dividir o dinheiro com os outros trabalhadores. Desde então trabalha
   por conta e escolhe muito bem para quem empresta a força.
   *Por que recrutar:* Quando estratégia acaba e alguma coisa
   simplesmente precisa cair, Marreta resolve.

2. **Fenda** — Duelista · Primeiro Corte
   *Quem é:* Uma lutadora rápida, fria e extremamente econômica nos
   movimentos.
   *História:* Fenda cresceu entre pequenos golpes e apostas de luta.
   Nunca foi a mais forte, então aprendeu a observar: distância,
   respiração, perna de apoio, mão dominante. Ela não procura dez
   oportunidades numa luta. Procura uma — a primeira.
   *Por que recrutar:* Fenda reconhece uma abertura antes que o
   adversário perceba que a deixou.

9. **Navalha** — Duelista · Sem Aviso
   *Quem é:* Um lutador veloz que odeia confronto prolongado.
   *História:* Foi criado trabalhando em barbearia e fazendo entrega
   pelas ruas estreitas de Marélia. Aprendeu a desaparecer por becos
   antes que problema virasse confusão. Quando começou a lutar, levou a
   mesma filosofia: entrar, resolver e sair antes de alguém entender o
   que aconteceu.
   *Por que recrutar:* Navalha é perfeito quando a gangue precisa
   derrubar alguém rápido antes que o resto do bando consiga reagir.

13. **Touro** — Fúria · Último de Pé
   *Quem é:* Um brigador que parece ficar mais perigoso quanto mais
   machucado fica.
   *História:* Touro cresceu numa família grande em que sempre era ele
   quem ficava para resolver o problema quando os outros já tinham ido
   embora. Virou segurança de festa, carregador e cobrador informal, mas
   nunca aceitou bater em quem não podia responder.
   *Por que recrutar:* Quando uma luta vira desastre e todo mundo começa
   a cair, Touro continua de pé.

11. **Sangue** — Fúria · Tudo ou Nada
   *Quem é:* Uma lutadora que entra em cada combate como se não
   existisse amanhã.
   *História:* Sangue sobreviveu a uma emboscada que derrubou todo o
   antigo grupo dela. Desde então desenvolveu uma relação quase
   doentia com risco: quanto pior a situação, mais tranquila ela fica.
   Não procura morrer — simplesmente parou de ter medo disso.
   *Por que recrutar:* É a pessoa que você coloca numa luta que todo
   mundo já considera perdida.

8. **Mira** — Especialista · Cirúrgica
   *Quem é:* Uma combatente obsessiva por precisão.
   *História:* Mira passou anos trabalhando em barraca de tiro e jogos
   de habilidade em festas de bairro. Transformou coordenação e leitura
   corporal em método de combate. Ela estuda o adversário durante
   minutos se for preciso, esperando exatamente o movimento que quer.
   *Por que recrutar:* Mira não desperdiça ataque. Quando decide acertar
   alguma coisa, geralmente acerta o ponto que realmente importa.

10. **Ponto** — Especialista · Ponto Cego
   *Quem é:* Um lutador especializado em atacar de onde ninguém está
   olhando.
   *História:* Ponto sobreviveu como entregador, olheiro e atravessador
   entre bairros rivais. Aprendeu que ser invisível vale mais do que ser
   forte. Ele conhece o segundo exato em que uma pessoa deixa de
   prestar atenção em determinado ângulo.
   *Por que recrutar:* Ele transforma distração em arma e é excelente
   contra inimigos mais poderosos que dependem de controle do campo.

6. **Cicatriz** — Vingador · Dívida Antiga
   *Quem é:* Uma veterana que guarda nomes melhor do que guarda dinheiro.
   *História:* Cicatriz perdeu gente demais para guerras que começaram
   por decisões de homens que nunca pisaram na rua onde o sangue caiu.
   Ela não esqueceu nenhum responsável. Passou anos ficando forte o
   bastante para cobrar cada dívida pessoalmente.
   *Por que recrutar:* É paciente, experiente e impossível de intimidar
   quando acredita que existe uma conta a ser acertada.

12. **Troco** — Vingador · Cobrança
    *Quem é:* Um lutador que acredita que tudo volta.
    *História:* Troco foi pequeno estelionatário, apostador e cobrador
    até ser traído pelo próprio grupo e abandonado com uma dívida que
    não era dele. Pagou centavo por centavo. Depois começou a procurar
    quem tinha colocado seu nome naquela conta.
    *Por que recrutar:* Troco nunca esquece quem bateu primeiro — e
    costuma devolver com juros.

**PAREDÕES**

3. **Muro** — Muralha · Fortaleza
    *Quem é:* Um defensor enorme, calmo e quase impossível de deslocar.
    *História:* Muro trabalhou descarregando caminhão e fazendo
    segurança de comércio. Ficou conhecido quando segurou sozinho a
    entrada de uma viela durante uma confusão para impedir que a briga
    chegasse às casas dos moradores. Não venceu ninguém. Só não deixou
    ninguém passar.
    *Por que recrutar:* Toda gangue precisa de alguém capaz de dizer
    "daqui ninguém passa" e fazer isso ser verdade.

14. **Concreto** — Muralha · Bloco Vivo
    *Quem é:* Um veterano pesado que luta como se tivesse sido
    construído no lugar.
    *História:* Passou a juventude na construção civil clandestina que
    ergueu boa parte dos puxadinhos de Marélia. Quedas, acidentes e anos
    carregando peso transformaram seu corpo numa muralha. É lento, mas
    aprendeu a nunca gastar movimento à toa.
    *Por que recrutar:* Concreto segura posições que outros personagens
    simplesmente não conseguiriam manter.

15. **Guarda** — Guardião · Linha de Frente
    *Quem é:* Uma lutadora que naturalmente coloca os outros atrás dela.
    *História:* Guarda sempre foi a irmã mais velha, a vizinha que
    buscava criança perdida e a primeira pessoa chamada quando havia
    confusão na rua. Nunca quis mandar em ninguém. Só desenvolveu o
    hábito de ficar entre o perigo e quem não consegue se defender.
    *Por que recrutar:* Ela não protege apenas a própria vida; protege a
    formação inteira da gangue.

16. **Ombro** — Guardião · Ninguém Passa
    *Quem é:* Um defensor conhecido por entrar literalmente no caminho
    dos golpes.
    *História:* Ombro ganhou o apelido jogando bola nas quadras da
    Vila, onde ninguém conseguia tirá-lo de posição. Mais tarde começou
    a acompanhar amigos em trabalhos perigosos e percebeu que tinha
    talento para proteger gente usando o próprio corpo.
    *Por que recrutar:* Se alguém importante precisa chegar vivo ao fim
    da luta, Ombro é quem você coloca ao lado.

17. **Boca** — Provocador · Olha Pra Mim
    *Quem é:* Um provocador profissional incapaz de ficar calado.
    *História:* Boca vendia qualquer coisa que coubesse numa sacola e
    conseguia discutir com cliente, guarda, rival e comerciante no
    mesmo minuto. Descobriu nas brigas que insultar o sujeito certo no
    momento certo pode controlar uma luta inteira.
    *Por que recrutar:* Boca faz o adversário esquecer o plano e atacar
    exatamente quem ele quer.

18. **Isca** — Provocador · Alvo Perfeito
    *Quem é:* Uma lutadora especializada em parecer mais vulnerável do
    que realmente é.
    *História:* Isca cresceu sobrevivendo a golpes em que seu papel era
    atrair atenção enquanto outra pessoa fazia o trabalho. Quando
    abandonou essa vida, manteve a habilidade. Ela sabe exatamente que
    postura faz alguém pensar: "essa é a mais fácil".
    *Por que recrutar:* Inimigos atacam Isca porque acham que estão
    escolhendo o alvo certo. Normalmente descobrem tarde demais que
    foram escolhidos por ela.

4. **Catraca** — Reativo · Bateu, Voltou
    *Quem é:* Uma defensora paciente que prefere que o adversário tome a
    primeira decisão.
    *História:* Catraca passou anos lidando com gente agressiva em
    ônibus, festas e comércio. Aprendeu a nunca oferecer o primeiro
    golpe. Espera, observa e usa o movimento do próprio agressor contra
    ele.
    *Por que recrutar:* Contra inimigos impulsivos, lutar com Catraca é
    quase lutar contra si mesmo.

19. **Rebote** — Reativo · Volta em Dobro
    *Quem é:* Um especialista em transformar pressão em contra-ataque.
    *História:* Rebote começou como parceiro de treino dos lutadores
    mais fortes do bairro. Passava horas apanhando porque ninguém queria
    enfrentar os grandões. Em vez de quebrá-lo, isso ensinou todos os
    padrões de ataque que existem numa briga de rua.
    *Por que recrutar:* Quanto mais previsível e agressivo o inimigo,
    mais perigoso Rebote se torna.

20. **Ferro** — Resiliente · Não Cai
    *Quem é:* Um sobrevivente que aparentemente não sabe quando deveria
    ficar no chão.
    *História:* Ferro trabalhou desde criança em ferro-velho e oficina.
    Acidentes que teriam afastado muita gente só viraram histórias que
    ele conta rindo. Ele não é invulnerável; simplesmente desenvolveu
    uma tolerância absurda a continuar funcionando machucado.
    *Por que recrutar:* Ferro compra para a gangue aquilo que nenhuma
    loja vende: tempo.

21. **Osso** — Resiliente · Ainda de Pé
    *Quem é:* Uma lutadora magra, dura e muito mais resistente do que a
    aparência sugere.
    *História:* Osso cresceu ouvindo que era pequena demais para tudo.
    Trabalho, briga, carregar peso, sobreviver sozinha. Aprendeu a
    responder da única maneira que respeitavam em Marélia: ficando em pé
    depois que quem duvidou já tinha caído.
    *Por que recrutar:* É uma sobrevivente nata e uma das últimas
    pessoas que você verá abandonar uma luta.

**MANDINGUEIROS**

22. **Brasa** — Ígneo · Incêndio
    *Quem é:* Uma mística explosiva cujo poder começa pequeno e cresce
    rapidamente.
    *História:* Brasa descobriu a afinidade com fogo trabalhando perto
    de fogão, carvão e metal quente. Durante muito tempo escondeu
    aquilo como truque. Quando percebeu que o fenômeno respondia às
    emoções dela, começou a aprender controle antes que alguém se
    machucasse.
    *Por que recrutar:* Se tiver tempo para crescer dentro da luta,
    Brasa transforma uma faísca em problema para o campo inteiro.

23. **Cinza** — Ígneo · Depois do Fogo
    *Quem é:* Um místico que entende o fogo pelo que sobra depois dele.
    *História:* Cinza perdeu a casa num incêndio e voltou no dia
    seguinte para ajudar os vizinhos a procurar o que ainda podia ser
    salvo. Foi entre as paredes queimadas que seu poder apareceu. Ao
    contrário de Brasa, ele não é explosivo: é paciente, silencioso e
    sufocante.
    *Por que recrutar:* Cinza domina batalhas longas. Ele não precisa
    queimar tudo de uma vez; só precisa garantir que o fogo nunca
    termine completamente.

24. **Maré** — Aquático · Maré Cheia
    *Quem é:* Uma mística adaptável que raramente enfrenta força com
    força.
    *História:* Maré cresceu perto dos canais e áreas alagadas da
    Baixada. Aprendeu a respeitar água porque viu rua virar rio em
    questão de minutos. Seu estilo segue a mesma lógica: contorna,
    acumula, recua e volta maior.
    *Por que recrutar:* Maré é excelente quando o plano original falha,
    porque muda de ritmo sem perder eficiência.

25. **Chuva** — Aquático · Temporal
    *Quem é:* Um místico cujo domínio da água é muito menos delicado do
    que o nome sugere.
    *História:* Chuva passou anos escondendo suas capacidades porque
    toda manifestação forte atraía atenção demais. O controle veio
    tarde, depois de vários acidentes e uma vida inteira aprendendo a se
    conter.
    *Por que recrutar:* Quando finalmente deixa de se conter, consegue
    alterar completamente o ritmo de uma batalha.

26. **Raiz** — Terreno · Chão Fechado
    *Quem é:* Uma mística ligada ao solo, à estabilidade e ao controle
    de espaço.
    *História:* Raiz cresceu numa família que ocupou e construiu a
    mesma área por gerações. Para ela, território não é linha num mapa:
    é memória. Seu poder apareceu defendendo justamente o terreno que
    sua família chamava de casa.
    *Por que recrutar:* Raiz transforma o lugar da luta em vantagem.
    Tirar terreno dela é tão difícil quanto tirá-la dele.

27. **Racha** — Terreno · Falha Sísmica
    *Quem é:* Um místico destrutivo que encontrou no chão a melhor
    maneira de atingir quem está acima.
    *História:* Racha trabalhou abrindo vala, quebrando piso e
    consertando tubulação. Começou percebendo pequenas vibrações
    através dos pés; depois descobriu que também conseguia devolvê-las.
    *Por que recrutar:* Excelente contra grupos e defesas rígidas.
    Racha não precisa atravessar uma formação quando pode quebrar o
    chão que sustenta todo mundo.

5. **Faísca** — Tempestade · Antes do Trovão
    *Quem é:* Um jovem místico inquieto que sente eletricidade antes
    mesmo de entender de onde ela vem.
    *História:* Faísca sempre soube quando uma tempestade estava
    chegando. O cabelo arrepiava, a pele formigava e aparelhos falhavam
    perto dele. Quando a eletricidade começou a responder de volta,
    percebeu que aquilo não era coincidência.
    *Por que recrutar:* Faísca é rápido, imprevisível e possui um
    potencial que claramente ainda está longe do limite.

28. **Trovão** — Tempestade · Queda do Céu
    *Quem é:* Uma mística que representa tudo que Faísca ainda pode se
    tornar em força bruta.
    *História:* Trovão não teve a oportunidade de esconder o próprio
    dom. A primeira manifestação séria derrubou energia de uma rua
    inteira e colocou seu nome na boca de gente perigosa. Desde então
    vive mudando de lugar.
    *Por que recrutar:* Quando é necessário encerrar uma luta com
    violência e velocidade, poucos conseguem produzir o impacto de
    Trovão.

29. **Névoa** — Ilusório · Sem Rosto
    *Quem é:* Uma figura misteriosa que domina percepção, confusão e
    desaparecimento.
    *História:* Pouca gente sabe de onde Névoa veio, e as versões não
    combinam. Camelô, golpista, artista, fugitivo — cada bairro conta
    uma história. Talvez todas sejam falsas. Isso provavelmente é
    intencional.
    *Por que recrutar:* Uma gangue que todos conseguem ver é fácil de
    enfrentar. Névoa faz o inimigo duvidar até de quem está na frente
    dele.

30. **Espelho** — Ilusório · Duas Verdades
    *Quem é:* Uma mística capaz de transformar certeza em dúvida.
    *História:* Espelho passou a vida observando pessoas e copiando
    postura, voz e maneira de falar. O que começou como talento de
    imitação acabou despertando algo muito mais estranho: fazer outras
    pessoas enxergarem aquilo que esperavam enxergar.
    *Por que recrutar:* Espelho não precisa convencer o inimigo de uma
    mentira. Basta oferecer duas verdades e deixar que ele escolha a
    errada.

---

## 8. NPCs não-combatentes (faixa 3000–3099)

| id | Nome | Papel |
|---|---|---|
| 3001 | **Nego Véio / Seu Nato** | O coroa da esquina, dono da birosca (Pista). Dá um corre (levar pacote sem a viatura ver) e conta onde o Carvão se enfia. Depois disso a birosca fica aberta pra gangue descansar. |
| 3002 | **Duda, o Orelha** | "Sabe tudo que rola em Marélia." Informante que destranca o chefe da Feira. Fica na Pista mesmo depois dela virar bairro dominado. |
| 3003 | **A cria do sinal** | Moleque vendendo bala no farol (Pista). Vende informação sobre o ferro-velho; pode ser apertado (vira treta fácil, −rep). |
| 3004 | **Dona Regina** | Empresta no fiado na Feira em troca de favor. |

Sem id numérico ainda (vivem só como POI/NPC da cena da Pista):
**Seu Nando** (oficina — forja a Soqueira de Lata com 2× sucata), **o agiota
Marimbondo** (dentro da birosca; retrato emprestado da ficha 1206), **o Zé**
(Lojinha do Zé; retrato emprestado da ficha 1205) e **a Cida** (mercearia).
O **Nego Véio** também é a voz que avisa o encontro aleatório e explica os
modos trancados.

Retratos de NPC: `assets/npcs/<slug>/neutro.png` (`nego_veio`,
`duda_o_orelha`, `cria_do_sinal`), resolvidos por `data/ganguesNpcPortraits.js`
e ligados ao POI por `npcSlug`.

---

## 9. Itens — catálogo oficial

### 9.1 Economia
Duas moedas, só no modo história: **Grana** 💵 (corre, achado, treta, chefe →
gasta em loja e descanso) e **Nome / Rep** (vitória, escolha ousada → destranca
POI, alimenta o % de domínio e o texto do final). Estado em `store.grana` /
`store.rep`, persistido em `gangues_saves`.

### 9.2 Inventário — é da GANGUE, não do personagem
- **Consumível:** `store.inventario` `{ [id]: qtd }`, ids **1–99**.
- **Equipamento:** `store.equipamentos` `[{ uid, itemId, cards }]`, ids **101+**.
  Uma peça equipada sai do inventário da gangue e vive em
  `sheet.attributes.equipment[slot]`; volta ao desequipar.
- Ações: `comprarItem`, `usarItem`, `comprarEquip`, `comprarEEquipar`,
  `equiparItem`, `desequiparItem`.

### 9.3 Consumíveis (faixa 1–99)

> **Estado real (26/09/2026, `data/ganguesItens.js`):** existem no jogo os
> ids **1, 2, 13, 20, 21, 22** e os de curar status **30–39** (§17.2.2). Os ids **3 a 12** abaixo são **design
> aprovado, ainda não implementado** — não estão no catálogo nem na loja.

| id | Nome | tipo | efeito | custo | ícone |
|---|---|---|---|---|---|
| 1 | Poção de HP | `cura_pv` | +5 PV | 14 💵 (28 na Lojinha do Zé) | 🩹 |
| 2 | Poção de MP | `cura_pm` | +5 PM | 14 💵 (28 na Lojinha do Zé) | 💧 |
| 3 | Cigarro de Palha | `cura_pm` leve | +3 PM, −1 D por 1 turno | 3 💵 | 🚬 |
| 4 | Water Energético | `cura_pm` | +8 PM | 8 💵 | 🥤 |
| 5 | Faixa de Pano | `cura_pv` fraca | +3 PV — só drop | — | 🩹 |
| 6 | Pinga | `buff_ataque` | +2 A por 2 turnos, −1 D | 6 💵 | 🍾 |
| 7 | Apito | `fuga` | chance de fugir sem penalidade | 5 💵 | 📯 |
| 8 | Bombinha de Fumaça | `debuff_inimigo` | −1 H em todos por 1 turno | 10 💵 | 💨 |
| 9 | Trocado Marcado | `isca` | some com 1 inimigo por 1 turno | 6 💵 | 🪙 |
| 10 | Farinha de Guaraná | `cura_pv` + | +7 PV | 9 💵 | 🥣 |
| 11 | Vela Benta | `buff_defesa` | +2 D por 2 turnos | 7 💵 | 🕯️ |
| 12 | Sacola de Bala | `cura_pv` mini | +2 PV (flavor: o que o Kim vende) | 2 💵 | 🍬 |
| 13 | Sucata | `material` | sem efeito em combate — item de quest. Cai no ferro-velho da Pista (POI `ferro` + `achado`); o Seu Nando troca 2× por uma peça (POI `oficina`). | — | 🔩 |
| 20 | Chip do Bruto | `poder_unico` | por 1 golpe, usa o poder *Soco de Ferro* (nível 2) | não vende | 👊 |
| 21 | Chip da Muralha | `poder_unico` | por 1 golpe, usa o poder *Postura Defensiva* (nível 2) | não vende | 🛡️ |
| 22 | Chip Ígneo | `poder_unico` | por 1 golpe, usa o poder *Bola de Fogo* (nível 2) | não vende | 🔥 |

**Chips de poder (20–22):** emprestam por um golpe um poder que o personagem
talvez nem tenha treinado (`forcedSpecial` em `ganguesSpecialEffects.js`).
Nunca são vendidos. Vêm de dois lugares: **marcos de reputação** (a cada
**50 de Rep** acumulada, sem teto, a gangue ganha 1 chip, ciclando 20 → 21 →
22, com tela de recompensa — `repMarcosCruzados` em `ganguesLoadout.js`) e
**drop de conteúdo arriscado** (ex.: `posmuro_2` e `galpao_m2` dão o chip 21).

### 9.4 Equipamento — 6 espaços, por caminho (28/09/2026)

Espaços (bonecão de cima pra baixo): `cabeca` 🪖 · `corpo` 🦺 · `bracos` 🧤 ·
`pes` 🥾 · `amuleto` 📿 · `arma` 🥊. Bônus = atributo plano (**A/H/D/PM**, PM =
Malandragem) ou recurso plano (**pv/pm**, somado no máximo). Raridades hoje:
`comum` e `incomum` (sockets de carta: 0 e 1).

- **Cada peça tem dono**: `caminho` = `atacante` (Porradeiro), `defensor`
  (Paredão), `mistico` (Mandingueiro) ou `livre` (qualquer um). Só o caminho
  certo equipa (`podeEquiparGangues`); a loja mostra "Só Porradeiro" etc. e
  só oferece equipar em quem pode.
- **Orçamento calibrado por simulação** (motor real, 120 lutas por cenário,
  dupla contra o Carvão): conjunto comum completo ≈ **2–3 níveis**, incomum ≈
  **4–5 níveis**. Porrada e Couro só aparecem no incomum — +1 de Porrada num
  item comum já valia ~4 níveis (dano é subtração). O Paredão nunca passa de
  +1 de Porrada. O Mandingueiro rende mais com o mesmo orçamento
  (Malandragem = força do talento + gás).
- **O catálogo antigo (101–120) sumiu dos saves** sem reembolso (decisão do
  Isaias, beta): peça equipada ou no bolso com id que não existe mais é
  descartada ao carregar.
- A Soqueira de Lata (237, livre, +1 Porrada) é recompensa do Nando e não é
  vendida.

| id | Nome | Caminho | Espaço | Raridade | Bônus | Preço |
|---|---|---|---|---|---|---|
| 201 | Cabo de Vassoura | Porradeiro | arma | comum | +1 Pique | 35 |
| 202 | Boné Aba Reta | Porradeiro | cabeça | comum | +1 Osso | 25 |
| 203 | Regata Rasgada | Porradeiro | corpo | comum | +3 Osso | 30 |
| 204 | Faixa no Punho | Porradeiro | braços | comum | +1 Osso | 25 |
| 205 | Tênis Furado | Porradeiro | pés | comum | +1 Osso | 25 |
| 206 | Corrente de Lata | Porradeiro | amuleto | comum | +2 energia | 30 |
| 207 | Soqueira de Ferro | Porradeiro | arma | incomum | +2 Porrada | 150 |
| 208 | Bandana de Bonde | Porradeiro | cabeça | incomum | +2 Osso | 75 |
| 209 | Jaqueta de Couro | Porradeiro | corpo | incomum | +4 Osso | 95 |
| 210 | Munhequeira | Porradeiro | braços | incomum | +1 Pique | 100 |
| 211 | Coturno | Porradeiro | pés | incomum | +1 Osso | 70 |
| 212 | Dente de Ouro | Porradeiro | amuleto | incomum | +2 energia | 75 |
| 213 | Cano Curto | Paredão | arma | comum | +2 Osso | 30 |
| 214 | Gorro de Moletom | Paredão | cabeça | comum | +1 Osso | 25 |
| 215 | Colete Reforçado | Paredão | corpo | comum | +4 Osso | 35 |
| 216 | Luva de Couro | Paredão | braços | comum | +1 Osso | 25 |
| 217 | Chinelo Reforçado | Paredão | pés | comum | +2 Osso | 30 |
| 218 | Medalhinha | Paredão | amuleto | comum | +2 energia | 30 |
| 219 | Tampa de Bueiro | Paredão | arma | incomum | +1 Couro | 110 |
| 220 | Capacete de Obra | Paredão | cabeça | incomum | +1 Couro | 110 |
| 221 | Colete de Placa | Paredão | corpo | incomum | +8 Osso | 125 |
| 222 | Braçadeira de Pneu | Paredão | braços | incomum | +2 Osso | 70 |
| 223 | Bota com Biqueira | Paredão | pés | incomum | +3 Osso | 80 |
| 224 | Terço da Vó | Paredão | amuleto | incomum | +2 energia | 75 |
| 225 | Vela Preta | Mandingueiro | arma | comum | +1 Malandragem | 45 |
| 226 | Capuz Surrado | Mandingueiro | cabeça | comum | +1 energia | 25 |
| 227 | Manto de Feira | Mandingueiro | corpo | comum | +3 energia | 35 |
| 228 | Pulseira de Miçanga | Mandingueiro | braços | comum | +1 Osso | 25 |
| 229 | Sandália de Couro | Mandingueiro | pés | comum | +1 Osso | 25 |
| 230 | Guia de Contas | Mandingueiro | amuleto | comum | +2 energia | 30 |
| 231 | Cajado de Galho | Mandingueiro | arma | incomum | +1 Porrada | 110 |
| 232 | Turbante | Mandingueiro | cabeça | incomum | +1 Malandragem | 110 |
| 233 | Manto de Sintonia | Mandingueiro | corpo | incomum | +4 energia, +1 Osso | 125 |
| 234 | Anel de Coco | Mandingueiro | braços | incomum | +2 Osso | 70 |
| 235 | Chinelo Benzido | Mandingueiro | pés | incomum | +2 energia | 75 |
| 236 | Olho Grego | Mandingueiro | amuleto | incomum | +1 Malandragem | 110 |
| 237 | Soqueira de Lata | Livre | arma | comum | +1 Porrada | não vende |
| 238 | Boné Vira-Lata | Livre | cabeça | comum | +1 Osso | 20 |

**Faixa e aprimoramento (vindo da branch da Feira, 27/09/2026 — merge de 29/09).**
No merge, o catálogo por caminho (201–238) ganhou faixa em Porrada/Couro/Pique,
centrada no valor fixo de antes (+2 → 1–3), pra o aprimoramento valer; Osso,
energia e Malandragem continuam fixos. Os épicos de chefe 138 (Porrete do
Cobrador) e 139 (Facão do Carvão) ficaram como peças livres. Regra original:

**Bônus em FAIXA (v3.64.0, 27/09/2026 — plano completo em
`PLANO_ITENS_RANGE.md`, aprovado pelo Isaias).** Porrada (A), Couro (D) e Pique
(H) viraram **faixa** (`bonus: { A: [1, 3] }` em `data/ganguesEquip.js`);
Osso/Malandragem (PV/PM) continuam **fixos** (`+6 PV`).
- **Quando rola:** a Porrada da peça **a cada golpe**, o Couro **a cada defesa**
  (`rolls.arma` / `rolls.armadura` em `resolveGanguesAction`), o Pique **uma
  vez na entrada da luta** (no `prepare` — a linha do tempo lê o H já com ele).
  Cada peça rola o próprio dado e soma. A Briga em Multidão usa o mesmo
  resolver, então rola igual.
- **Na tela:** o dado dramático mostra um chip **"🔪 arma +N"** / **"🛡️ couro +N"**
  na revelação; a pista da linha do tempo mostra **"+N"** em cima de quem teve
  Pique sorteado; card de item/loja/ficha mostram a faixa (**"+1–3 Porrada"**);
  toda previsão (loja, ficha, aviso de nível) usa a **média**, nunca o máximo.
- **Toda faixa nasceu centrada no valor fixo de antes** (a Faca era +2 → 1–3):
  simulado, +2 fixo × 1–3 empata em 50,3% num duelo — o balanço da Pista não
  mudou, só a emoção de cada golpe.
- **Preço** = arredonda5(Σ média × peso × raridade) — pesos A 28 · D 22 ·
  **H 30** · PV/PM 6; raridade comum 1 · incomum 1,1 · raro 1,3 · épico 1,6. Os
  5 comuns mais baratos mantiveram o preço de antes (28/22/36).

**Aprimoramento** (+1 a +4, `aprimorarEquip` em `ganguesEquipSlice.js`):
- Mexe só no **atributo principal** da peça (o 1º com faixa). **Nível ímpar =
  vantagem** (rola 2 vezes, fica com o maior, "▲" na tela); **nível par = sobe o
  mínimo em 1**. Teto = mínimo encosta no máximo (faixa de 2 pontos → +4; 2–5 →
  +6). Faca Serrilhada: +0 1–3 · +1 1–3▲ · **+2 2–3** · +3 2–3▲ · +4 sempre 3.
  Simulado: a faca +2 vence 62% e a +4 vence 73% contra a mesma sem aprimorar.
- **Custo:** grana = 25% do preço da peça × o nível (mín. 5) + **Sucata** (item
  13) igual ao nível. Peça sem preço de loja usa o preço da fórmula.
- O nível **mora na peça** (`aprim` na instância / no slot equipado), não no
  personagem — vai junto ao trocar de dono. Save antigo sem `aprim` = +0.
- **Onde:** a **bancada do Nando** (POI `bancada_nando`, tipo `ferreiro`, dentro
  da oficina, só depois da quest da sucata) faz até **+1** (`poi.tetoAprim`). A
  **Serralheria do Bigode** (Feira, `tetoAprim: 4`) vai até +4. Tela: `GanguesFerreiro.jsx`.
- **Sucata virou recurso:** além do ferro-velho, cai em **~20% das vitórias de
  rua** na cena (não no chefe) e aparece no painel de recompensa.

**Fontes de peça fora da loja** (depois do merge, 29/09/2026): Soqueira de
Ferro (207) na 1ª vitória sobre o Cão Louco (`posmuro_2`), Bota com Biqueira
(223) no corre do Nato, Soqueira de Lata (237) na oficina do Nando; na Feira,
Colete de Placa (221) no Caixa Forte, Olho Grego (236) no Mão do Turco e Dente
de Ouro (212) no achado do Mercadão. Épicos de chefe: Facão do Carvão (139) e
Porrete do Cobrador (138).


### 9.5 Épicos — drop de chefe (faixa 132+)

Um por chefe. Sempre 2 slots de carta. **Planejado — nenhum épico existe no
código ainda** (o Carvão hoje não dropa o Facão do Carvão).

| id | Nome | slot | bônus | fonte |
|---|---|---|---|---|
| 132 | Facão do Retalho | arma | +4 A, +2 D | chefe final (1600) |
| 133 | Coroa da Laje | cabeça | +3 D, +2 H | chefe final (1600) |
| 134 | Vara da Fera | arma | +3 A, +1 H, cura 5 PV ao derrotar inimigo | chefe do Morro (1504) |
| 135 | Bengala do Contador | amuleto | +2 A, +2 D | chefe do Alto do Morro (1505) |
| 136 | Espeto do Fura-Bucho | arma | +3 A, +2 H | chefe da Baixada (1502) |
| 137 | Taco da Ferrugem | arma | +2 A, +3 D | chefe da Vila (1503) |
| 138 | Porrete do Cobrador | arma | +2 A, +2 H, +1 D | chefe da Feira (1501) |
| 139 | Facão do Carvão | arma | +3 A, +1 D | chefe da Pista (1500) |

### 9.6 Loja
POI de tipo `loja`; catálogo por região (`poi.itens`, mistura consumível e
equipamento; `poi.precoMultiplicador` opcional). Cada região ganha catálogo
próprio. Hoje a Pista tem duas:

- **Cada território vende a SUA faixa, sem repetir peça** (29/09/2026): quem
  quiser peça de um bairro anterior tem que voltar lá. Bairro só ganha loja
  quando ganhar cena (decisão do Isaias).
- **A loja da Pista** (`loja`, do lado de lá do muro, só aparece depois do
  portão): poções, remédios de status (30–39) e **só o equipamento COMUM** dos
  3 caminhos + o boné livre. O **incomum (207–212, 219–224, 231–236) fica
  guardado pra loja da Feira**, quando ela ganhar cena.
- **Preços (29/09/2026)**: comum ×2 e incomum ×2,5 do valor inicial; poção
  14 → 20. Conjunto comum completo ≈ 170 por personagem — equipar a dupla ≈
  a Pista inteira (~300 de grana) + 1 vitória no Clube.
- **A Lojinha do Zé** (`loja_pocoes`, na rua, desde o começo):
  **poções e itens de status, pelo dobro do preço** (`precoMultiplicador: 2`), "na
  cara de pau". Existe porque, com a recompensa por risco, quem quer arriscar
  luta mais forte precisa ir municiado. O dono é o Zé do Bar do Zé (retrato
  emprestado da ficha 1205).

---

### 9.7 Progressão das lojas por território (plano fechado em 29/09/2026)

Regras do Isaias: **cada território tem uma loja própria, cada uma melhor que
a anterior, e nenhuma repete peça** — quem quiser peça de um bairro anterior
volta lá. As melhores peças ficam na Laje. Bairro só ganha loja quando ganhar
cena, mas a distribuição já fica definida aqui. O teto de nível (§12) manda em
tudo: a peça de cada loja é calibrada pro teto daquele bairro, porque +1 de
Porrada vale 17% no nível 25 e só 5% no 99 (atributo principal cresce ~0,37
por nível).

**Nível mínimo da peça** (29/09/2026, `nivelMinEquip` em `ganguesEquip.js`):
sai do território que vende a raridade — comum (Pista) **5**, incomum (Feira)
**20**, raro 33, pesado 46, épico 59, grife 72, lendário 85. Épico de chefe usa
o nível da luta: Facão do Carvão 15, Porrete do Cobrador 28. Só consumível
(poção/remédio) se repete entre lojas. **Mandingueiro** tem orçamento de peça
acima dos outros caminhos (comum ≈4,7 pts contra ≈3,7–4; incomum ≈7,3 contra
≈6–7).

**Feira comprimida pra 21–33** (29/09/2026, Isaias: "46 tá muito alto, é o 2º de 7"): a escada da Feira ia de 23 a 52 (Cobrador 52); foi remapeada linear pra 21–33 — tretas 21→32, Generais 26/27/28, Cobrador **33** (orçamento 82 × fração 0.40), Clube 22/42/66. A Baixada começa em 34.

**Historinha de item** (29/09/2026): todo item tem a chave games.gangues.lore.ID (3 idiomas), mostrada no card de detalhe da loja. Item novo = historinha nova, uma ou duas frases, vocabulário da rua.

**Escada de nível (decisão: Pista entre 15 e 20, o resto redistribuído).**
~13 níveis por bairro, fechando no 99; o Retalho é o único nível 100.
Último território só no médio ou difícil (no fácil a Laje não abre —
`bloqueadoNoFacil`, já no código).

| # | Território | Teto de nível | Ficha no teto (pontos) | Raridade da loja |
|---|---|---|---|---|
| 1 | Pista | **20** | ~27 | comum |
| 2 | Feira | 33 | ~41 | incomum |
| 3 | Baixada | 46 | ~55 | raro |
| 4 | Vila | 59 | ~68 | pesado |
| 5 | Morro | 72 | ~80 | épico |
| 6 | Alto do Morro | 85 | ~93 | de grife |
| 7 | Laje | 99 (Retalho 100) | ~106 | lendário |

**Força das peças (decisão: 12%, Mandingueiro 15%).** O conjunto completo (6
peças) de cada loja vale ~12% da ficha no teto daquele bairro; o do
Mandingueiro ~15% (ele é o cara de poder). Conta em pontos: 1 de atributo =
1 ponto, 3 de Osso = 1, 3 de energia = 1. É a proporção que já foi simulada e
aprovada na Pista (comum) e na Feira (incomum).

| Território | Porradeiro (conjunto) | Paredão (conjunto) | Mandingueiro (conjunto) |
|---|---|---|---|
| Pista (3 / 4 pts) | Pique +1, Osso +6, energia +2 | Osso +10, energia +2 | Malandragem +1, energia +6, Osso +2 |
| Feira (5 / 6) | Porrada +2, Pique +1, Osso +7 | Couro +2, Osso +13 | Malandragem +2, Porrada +1, energia +6, Osso +3 |
| Baixada (7 / 8) | Porrada +3, Pique +1, Couro +1, Osso +6 | Couro +3, Porrada +1, Osso +9 | Malandragem +3, Porrada +1, Pique +1, energia +6, Osso +3 |
| Vila (8 / 10) | Porrada +4, Pique +1, Couro +1, Osso +6 | Couro +4, Porrada +1, Osso +9 | Malandragem +4, Porrada +1, Pique +1, Couro +1, energia +6, Osso +3 |
| Morro (10 / 12) | Porrada +5, Pique +2, Couro +1, Osso +6 | Couro +5, Porrada +1, Osso +12 | Malandragem +5, Porrada +2, Pique +1, Couro +1, energia +6, Osso +3 |
| Alto (11 / 14) | Porrada +6, Pique +2, Couro +1, Osso +9 | Couro +6, Porrada +1, Osso +12 | Malandragem +6, Porrada +2, Pique +1, Couro +1, energia +9, Osso +3 |
| Laje (13 / 16) | Porrada +7, Pique +2, Couro +2, Osso +9 | Couro +7, Porrada +1, Osso +15 | Malandragem +7, Porrada +3, Pique +1, Couro +1, energia +9, Osso +6 |

- Regras fixas: o **Paredão nunca passa de +1 de Porrada** em nenhuma loja;
  Porrada e Couro nunca entram em peça comum; o conjunto de cada loja é
  dividido pelos 6 espaços (arma e corpo carregam o grosso).
- Pista e Feira já existem no catálogo (ids 201–236). Baixada em diante usa
  ids **301+ (Baixada), 401+ (Vila), 501+ (Morro), 601+ (Alto), 701+ (Laje)**
  — 18 peças por loja (6 espaços × 3 caminhos) + até 2 livres. Criar no
  catálogo e calibrar por simulação quando cada bairro ganhar cena.

**O que cada loja vende (sem repetir):**

| Território | Equipamento | Poção de Osso / energia | Contra status |
|---|---|---|---|
| Pista | comum (201–206, 213–218, 225–230, 238) | +5 (20) | remédios avulsos, 1 por status (30–33, 35–39) |
| Feira | incomum (207–212, 219–224, 231–236) | +10 (35) | Xarope da Vó — cura todos (34) |
| Baixada | raro (301+) | +15 (55) | kit de rua: cura status + 10 de Osso |
| Vila | pesado (401+) | +20 (80) | — |
| Morro | épico (501+) | +30 (120) | benzedeira: cura status do time inteiro |
| Alto | de grife (601+) | +40 (170) | — |
| Laje | lendário (701+) | +50 (230) | — |

(Hoje a loja da Pista ainda vende também o Xarope da Vó — sai de lá quando a
Feira tiver loja.)

**Grana por bairro (decisão: escala).** Sem isso as peças do fim ficam
impossíveis de comprar.

| Território | Por inimigo | Chefe (mínimo) | Clube (vitória) | Conjunto por personagem (preço) |
|---|---|---|---|---|
| Pista | 10 | 250 | 200 | ~170 |
| Feira | 15 | 500 | 300 | ~520 |
| Baixada | 20 | 800 | 450 | ~900 |
| Vila | 30 | 1.200 | 650 | ~1.300 |
| Morro | 40 | 1.700 | 900 | ~1.900 |
| Alto | 55 | 2.300 | 1.200 | ~2.600 |
| Laje | 75 | 3.000 | 1.600 | ~3.500 |

Conta de referência (≈30 inimigos por bairro, uma passada): a Pista paga ~550
e equipa a dupla (~340). Daí pra frente o time cresce (+1 vaga por bairro) e
o conjunto do time todo passa a custar 1,5× a 4× a passada — o resto vem do
Clube e das apostas, de propósito. O teto de aposta da Banca também deve
subir por bairro (hoje só sobe pela Rep).

**Aplicado no código (v3.68.0):** teto de todos os bairros (`nivelTeto` em
`ganguesTerritorios.js`), nível de fachada dos chefes (Carvão 29 · Cobrador 33
· Fura-Bucho 46 · Ferrugem 59 · Zefa 72 · Contador 85 · Retalho 100), grana
por inimigo e mínimo do chefe por bairro (`ganguesVictoryResolver.js`) e
prêmio do Clube por bairro (`clubePremioDe`). **Pista no teto 20:** a ladder
da rua é em PONTOS de ficha (nível 20 ≈ 27 pontos), então a rua (até 26)
continua cabendo; o Carvão caiu de orçamento 50 pra **48** (ficha ~29 +
escolta ~19), calibrado por simulação (dupla nível 20, 80–150 lutas por
cenário): com o conjunto comum vence ~60% (Trinca+Muro 59%, Trinca+Faísca 95%,
Muro+Faísca 34%), sem item ~30%. A curva é íngreme: com 50 caía pra ~18% mesmo
equipado. Os orçamentos de chefe dos outros 6 bairros ainda são da calibragem
antiga — recalibrar pelo teto novo quando cada um ganhar cena.

## 10. Conto 02 — sinopse canônica ("Alan, o Campeão")

Fonte completa: `src/data/historias/contos/02/pt/01.md` … `19.md`. 1ª pessoa, contada
pelo Campeão. Peso pesado, canônico.

| Cap | Título | O que estabelece |
|---|---|---|
| 1 | O Rei | Alan hoje é o **Rei de Marélia** (nome que o Jack deu). A hierarquia se resolve metade no dinheiro, metade "do jeito antigo" — dois homens, um espaço vazio, o Morro em volta. Ele carrega **duas pedras no sapato**: o Kim e o Jack. Bateu neles anos a fio, nunca viu nenhum dos dois ganhar, nunca viu nenhum dos dois parar. |
| 2 | Três Anos | Aos 3, Alan vê **o pai estrangular a mãe** na cozinha. Vai embora descalço na madrugada. Primeira regra: *se você não anda, ninguém anda por você.* |
| 3 | A Bucha | O crime é a única coisa que emprega quem "não existe no papel". Aos ~4 a **Banca** o puxa (a "Tia" = RH). Vira **bucha de canhão**: pego de propósito com o produto na mão porque menor não responde. É **pago pra ser preso**. |
| 4 | O Reformatório | Aos 7, pego "pra valer". A Banca não move um dedo. 3 anos preso. Descobre — vendo o bruto **Toninho** obedecer o magrelo **Escrivão** — que *força te leva até um ponto; depois quem sobe é quem pensa.* Estuda a biblioteca inteira, se pune fisicamente a cada erro, organiza o lugar, escreve um **plano de dominância**. |
| 5 | O Alto do Morro | Sai aos 10, a **cúpula** o espera no portão. Plano: **território é costura, não parede** — toma as bordas fracas, uma por mês, sem bandeira. Acordo: "Se der certo, você não é mais bucha. Se der errado, você nunca trabalhou aqui." |
| 6 | O Mendigo | Primeiro nome da lista: **o Sombra**, chefe da Baixada — fantasma sem rotina. A rachadura dele é café. Alan, aos 11, disfarçado de mendigo manco, o mata. Troca de roupa num beco, vira playboy. **A Baixada racha em três.** Deixa de ser bucha. |
| 7 | Dono de Bairro | 3 anos de serviços. Aos **13 vira dono de bairro** — coordena adultos de 30, 40 anos. Regra do Morro: **quem manda é quem entrega.** O gerente Boiadeiro testa; Alan senta na boca dele anotando clientes até a venda parar. |
| 8 | O Indiozinho | Terça comum, Alan com 2 kg de pó na mochila. Um moleque (~6-7) derruba dois na rua dele e **planta o pé na frente dele, sem medo, e não sai.** Alan não pode deixar barato. |
| 9 | A Pantera | Primeira briga com o indiozinho. Postura que alguém ensinou; noção sem experiência. Quanto mais apanha, mais **selvagem** fica — mãos no chão, "pantera filhote". **Não cai.** Alan vai embora com pressa. |
| 10 | O Cabelinho Verde | Uma semana depois, outro moleque — negro, cabelo verde mal pintado — sobe o Morro **procurando "Alan" pelo nome**. Leva chute, ri do chão: *"vou te chamar de Campeão."* **O nome pega.** Esse fica cada vez mais **preciso** apanhando, e sabe perder: *"eu volto. E da próxima vez eu venço você."* |
| 11 | O Parque | Alan vê os dois brigando entre si num terreno baldio. Trombadinhas miram o celular quebrado deles. Os dois **trocam um olhar e viram de costas um pro outro**, cada um cobrindo uma metade. |
| 12 | De Costas | "Uma pessoa dividida em dois corpos." Limpam um grupo grande sem combinar nada; quando acaba, **voltam a brigar entre si de onde pararam**. Alan decide que **precisa** recrutar os dois. |
| 13 | Primeira Segunda-Feira | Alan propõe: **toda 1ª segunda do mês** os dois podem subir e brigar com ele, juntos. Ganham o respeito dele se puserem **um joelho dele no chão**. Jack: "a gente não quer seu respeito, só quer te vencer." Kim: "não me mete nas suas coisas." |
| 14 | A Cerimônia | ~2 anos de brigas mensais. Alan descobre que brigar com eles é *divertido* — sentimento que ele nunca tinha tido. Kim doma a pantera; Jack lê as dicas do Alan. O Morro inteiro assiste da laje. Jack sempre para primeiro; Kim **nunca** cai. |
| 15 | Marcado | Alan aos 16. Virou alvo grande demais — família do Sombra, restos da Baixada, cobradores que passou pra trás. A cúpula manda ele **sumir**. Ele reparte o bairro entre dois subcomandantes. Quer só a **última 1ª segunda** antes de ir. |
| 16 | Não Há Regras | Última briga. Alan 16, os dois 9. Troca de nomes: **Kim** cospe "Kim"; **Jack**: "meu nome não é Jack, mas esse carinha me chama de Jack". Alan pergunta a única regra da briga de rua → **"NÃO HÁ REGRAS"** (a frase que o Kim usa no cap. 3 da linha principal — **Alan é a origem dela**). Gancho no queixo do Jack = **apagado**. Kim olha pro amigo, leva joelhada no plexo. Aí **o olhar do Kim muda** — frio — e Alan sente medo. |
| 17 | A Pantera Solta | Kim vira feral **com técnica**: morde a panturrilha, rola, sobe nas costas, morde o pescoço, **arranca e mastiga um pedaço da orelha do Alan**. Alan perde força e visão, entende que vai **PERDER pela 1ª vez na vida** — e não tem certeza de que o Kim vai parar quando ele cair. |
| 18 | A Coronhada | O **braço-direito** do Alan (o subcomandante de confiança) dá uma **coronhada na cabeça do Kim**. Os joelhos do Alan tocam o chão no mesmo instante; os dois moleques apagados. **Ninguém acordado viu.** Oficialmente o Campeão nunca perdeu — mas o Alan sabe que perdeu. |
| 19 | Sob Minha Proteção | Alan deixa uma ordem em todo canto: **Kim e Jack sob proteção total do Campeão.** **8 anos** limpando confusão deles. Hoje eles têm **17** e começaram a quebrar a **segurança que a Banca aluga pra "uma turminha de elite de escola cara"** (dovetail com o Brock, linha principal cap. 3). A cúpula não gosta que o Campeão passa pano. *"Essa não é a história de como eu virei o Rei de Marélia. Essa fica pra outro dia."* |

### Personagens do conto — resumo canônico

- **Alan / O Campeão / O Rei de Marélia** — `personagens-pt.json` id `alan`. Hoje
  24 anos. Viu a mãe morrer aos 3 → bucha da Banca aos ~4 → reformatório aos 7 →
  mata o Sombra aos 11 → dono de bairro aos 13 → marcado e exilado aos 16 → volta
  e vira Rei aos 18. Rival histórico de Kim e Jack ("80% das derrotas dos dois
  têm o nome dele"; é por causa dele que os dois viraram amigos).
- **Kim** — "o indiozinho". Pele marrom, cabelo preto liso. Técnico que vira
  **feral sob dano** ("a pantera"). Nunca cai. Herdou de Alan a frase "não há
  regras".
- **Jack** — "o cabelinho verde". Negro, cabelo verde mal pintado, fanfarrão.
  Fica **mais preciso** apanhando. Aceita perder pra poder voltar. Nome real
  nunca dito. Cunhou "o Campeão".
- **O Sombra** — chefe original da Baixada, fantasma sem rotina. Morto pelo Alan
  aos 11. A Baixada racha em três (Sangria/Gelo/Sobra). **No jogo ele já morreu
  antes do Ano 1.**
- **A Banca / a cúpula** — ver §1.
- **O braço-direito do Alan** — subcomandante de confiança, deu a coronhada no
  Kim.
- **Boiadeiro** — gerente que testou o Alan aos 13. Não-jogável.

---

## 11. Contagem do álbum

| Categoria | Entradas |
|---|---|
| Vigia / Fogueteiro (1101–1121) | 21 |
| Vapor (1201–1221) | 21 |
| Gerente de Boca (1301–1321) | 21 |
| Cobrador (1401–1414) | 14 |
| General / Braço-Direito (1451–1464) | 14 |
| **Total colecionável (hierarquia da Banca)** | **91** |
| Chefes de território + chefe final (1500–1600) | 8 *(aba própria, fora da contagem)* |

Reserva: cada faixa comporta crescer até ~99 sem remapear.

---

## 12. Endgame — nível 99, a Torre e o multiplayer

- **Teto de nível: 99.** Cada um dos 30 personagens tem os **99 níveis autorados**
  no catálogo (`ldi_gangues_30_personagens_v1.json`): níveis 1–10 são os stats
  originais desenhados (balanceamento já simulado); do 11 ao 99 cada personagem
  **segue o próprio `growth_order`** — +1 atributo por nível, SEMPRE, sem
  exceção, fiel à identidade do caminho (um Bruto termina A altíssimo, um
  Muralha só D/PV, um Resiliente puro PM). Nada procedural em runtime — o
  catálogo já vem gerado (`scripts/gangues-regen-catalog.cjs`). Poderes de
  assinatura liberam **devagar** (níveis 4 / 12 / 24 / 40) e sobem de rank
  (→2 nos níveis 52–70, →3 nos 78–96). PV/PM sobem pela taxa do caminho.
  `GANGUES_LEVEL_CAP = 99`.
- **Escada de nível dos 7 chefes** (nível de fachada no catálogo): **Pista 29 ·
  Feira 33 · Baixada 46 · Vila 59 · Morro 72 · Alto 85 · Laje 100 (o Retalho)**
  (escada da §9.7).
  Os chefes usam **orçamento de pontos FIXO** (`GANGUES_CHEFE_BUDGET` em
  `data/ganguesEncontros.js`, nunca escala com o jogador):
  `{pista:48, feira:110, baixada:210, vila:345, morro:510, alto:606, laje:732}`.
  **Pista:** 2 corpos (`GANGUES_CHEFE_CORPOS.pista`), líder leva 60%
  (`GANGUES_CHEFE_LIDER_FRAC`) → **Carvão com ficha ~29 + 1 escolta com ~19**
  (orçamento 48); `chefe.nivelRec` = 20. O Carvão quebra de propósito a escada de 3 em 3 da
  rua (§17.6) — "pra ser ralado". Os outros 6 budgets são da calibragem antiga
  e serão revistos pelo teto novo (§9.7) quando cada bairro ganhar cena. AP por inimigo = **10 fixo em qualquer modo**.
  **O Retalho é o único nível 100 do jogo.**
- **Estrutura de cada chefe** (só a Pista existe hoje; o resto é **planejado**):
  | # | Bairro | Estrutura |
  |---|---|---|
  | 1–3 | Pista · Feira · Baixada | Chefe único, 1 luta. |
  | 4 | Vila | **Chefe falso.** Você derruba o cara achando que zerou → isso revela +2 eventos → aí aparece o **chefe real** (2 lutas separadas, POIs encadeados pelo grafo `revela`). |
  | 5 | Morro | **Os Três Irmãos** (trigêmeos). 3 POIs de chefe espalhados no mapa, 1 luta por irmão, caçados um de cada vez. O 3º é o casca-grossa. Budget do bairro dividido entre os 3 (o 3º leva a maior fatia). |
  | 6 | Alto | **Dupla equilibrada.** Os 2 líderes no MESMO bando, 1 luta. `gerarBandoChefe` com 2 ids-líder em vez de 1 líder + escoltas; budget dividido ~50/50 entre eles. |
  | 7 | Laje | **3 formas, 3 lutas ENCADEADAS** (sem motor novo). Vence a forma 1 → tela curta "ele levantou diferente" → forma 2 (mais forte) → forma 3 (final). Cada forma tem seu bando. Entre formas: definir se o PV/PM do jogador restaura (provável que sim, senão 3 seguidas é impossível). |
- **Modo Batalha = A Torre** (`GanguesBatalha`). Destrava ao zerar a campanha 1×.
  Luta atrás de luta, o jogador escolhe o bairro-tema e a *folga de nível*
  (folgado → brabo). Cada andar sobe a dificuldade e o AP (+100% a cada 5
  andares). É o grind de L50 → 99. Recorde de andar por bairro em
  `storyProgress.__torre`.
- **Multiplayer online libera com 3 fichas no nível 99** (
  `GANGUES_MULTIPLAYER_MIN_FICHAS = 3`, `GANGUES_MULTIPLAYER_LEVEL = 99`,
  `ganguesTemMultiplayer(roster)`). O online em si é fase futura — por ora só
  destrava o card em `GanguesModes`.
- **Cards bloqueados da tela de Modos são clicáveis:** em vez de
  "EM BREVE", tocar num modo trancado abre um diálogo em tela cheia do Nego
  Véio explicando o que falta pra liberar.
- **A Coleção** (3º botão da HUD da cena + lobby): abas Inimigos (o Álbum),
  Itens (consumível + equipamento, descoberto via `storyProgress.__itens`) e
  Cartas (placeholder — sockets, faixa 10000+).

---

## 12.1 Índice de fontes

| Assunto | Arquivo |
|---|---|
| Conto "Alan, o Campeão" (texto completo) | `src/data/historias/contos/02/pt/01.md` … `19.md` |
| Mapa, territórios, gangues, chefes, portões | `src/pages/games/Gangues/data/ganguesTerritorios.js` |
| Fichas dos inimigos + trash talk | `src/pages/games/Gangues/data/gangues-enemies.json` |
| Geração de bando + equipe fixa dos chefes | `src/pages/games/Gangues/data/ganguesEncontros.js` |
| Cena navegável da Pista (POIs, NPCs, diálogos) | `src/pages/games/Gangues/data/cenas/pista/` |
| 30 lutadores recrutáveis | `data/ldi_gangues_30_personagens_v1.json` |
| Consumíveis / equipamento | `src/pages/games/Gangues/data/ganguesItens.js`, `data/ganguesEquip.js` |
| Loja / painel de equipamento | `src/pages/games/Gangues/components/cena/GanguesLoja.jsx`, `components/GanguesEquipPanel.jsx` |
| Inventário + economia (store) | `src/pages/games/Gangues/store/useGanguesStore.js` + `store/slices/` |
| Textos de história / itens (i18n) | `src/i18n/gangues-{pt,en,es}.json` (carregado sob demanda por `hooks/useGanguesI18n.js`) → `games.gangues.*` |
| Dificuldade (±2), degrau da ladder, frustração, nível real | `src/pages/games/Gangues/data/ganguesDificuldade.js` |
| AP por risco, divisão do AP, grana da vitória | `src/pages/games/Gangues/engine/ganguesVictoryResolver.js` |
| Descanso, agiota, Clube da Luta (store) | `src/pages/games/Gangues/store/slices/ganguesBiroscaSlice.js` |
| Gates de Rep, marcos de Rep, empréstimo, multiplayer | `src/pages/games/Gangues/data/ganguesLoadout.js` |
| Motor da cena (colisão, câmera) | `src/pages/games/Gangues/engine/ganguesCenaMotor.js` |
| Encontro aleatório (tipos, relógio, pathfinding) | `engine/ganguesEncontroAleatorio.js` + `hooks/useGanguesEncontroAleatorio.js` |
| Linha do tempo (Pique) + pista visual com raias | `engine/ganguesLinhaDoTempo.js`, `components/GanguesPistaTempo.jsx` |
| CSS do jogo (índices de `@import` + paleta `--gang-*`) | `src/pages/games/Gangues/styles/` (auditado por `scripts/gangues-css-audit.cjs` no predeploy) |
| Retratos (cabeça, corpo, inimigo, NPC) | `data/ganguesPortraits.js`, `data/ganguesEnemyPortraits.js`, `data/ganguesNpcPortraits.js` |
| Status (9, ids numéricos) + itens de cura | `engine/ganguesStatus.js`, `data/ganguesItens.js` (30–39) |
| Personas da IA inimiga + talentos de inimigo | `engine/ganguesPersonas.js` |
| Dano gravado durante a luta | `hooks/useGanguesDanoAoVivo.js` |
| Apostas (Banca, rinha de aposta, aposta em você) | `data/ganguesApostas.js`, `components/cena/GanguesBanca.jsx` |
| Briga em Multidão / modo automático | `engine/ganguesBrigaMultidao.js`, `hooks/useGanguesModoMultidao.js`, `hooks/useGanguesModoAuto.js` |
| Todo texto falado na Pista (pt/en/es, em ordem de fluxo) | `docs/Games/Gangues/PISTA_COMUNICACAO.md` |
| **Mecânica** (combate, progressão, skill tree, modo história) | Seção 17 desta bíblia |

---

## 13. Vocabulário de gíria de rua (referência pra escrever texto)

Banco de palavras pra puxar quando for escrever diálogo, nome de item, rótulo
de UI ou texto de flavor — **não é lista de tarefa**, é fonte de consulta.
Curada em cima de um dicionário de gírias do crime/cadeia brasileiro (pedido
do Isaias, set/2026): a lista original tinha ~300 verbetes; ficaram de fora
de propósito os termos racistas, homofóbicos/transfóbicos e a gíria de droga
pesada (a economia de vício do jogo já é fictícia — birosca/agiotagem — não
precisa emprestar vocabulário de droga real). O que sobrou é neutro o
bastante pro tom do jogo (rua, gangue, delegacia, cadeia, dinheiro, covardia,
coragem) sem alterar a faixa etária.

Regra de uso: **adaptação livre por idioma**, nunca tradução literal — isso já
é convenção do projeto (ver Osso/Malandragem, Sobrinho, Patota, Mete o Pé). EN/ES
puxam o próprio banco de gíria de rua/crime equivalente, não uma tradução
palavra-por-palavra do português.

### Dinheiro
Grana, Bufunfa, Carvão, Bronze, Quirela, Vento, Pila, Toco *(dinheiro de
suborno)*, Pororó, Picho, Misterioso.

### Fugir / sair correndo
Mete o pé ✅ *(já em uso — `btn_fugir`)*, Dar no pé, Abrir no pé, Asas no pé,
Sebo nas canelas, Arrastar o pé, Puxar o carro, Espiantar, Desaparecer na
curva, Cair fora.

### Covardia / bravura
Amarelar *(ficar com medo)*, Bunda mole, Coió, Pedra 90 *(boa pessoa, fiel —
o oposto, um elogio)*, Durão *(briguento)*, Marrudo *(provocador)*, Cartear
marra *(mostrar valentia)*.

### Delatar / confiança
Dedo duro, Caguêta, Dar o serviço, X-9, Totó, Queixo duro *(o oposto — quem
nunca dedura)*, Truta *(malandro de confiança, parceiro)*.

### A lei / autoridade
Gambé, Tira, A Justa, Meganha, Coruja *(guarda noturno)*, Samango.

### Cadeia / apuros
Cana *(prisão)*, Gaiola, Tranca, Rodar *(ser preso)*, Puxar cana *(cumprir
pena)*, Zica *(problema, rolo — já combina com o tom do jogo)*.

### Roubar / pegar algo
Aliviar, Afanador *(ladrão)*, Garfar, Agadanhar, Rato *(ladrão, genérico)*.

### Insulto leve / trouxa
Sobrinho ✅ *(já em uso — `enemy_thinking`)*, Otário, Bobo, Anastácio, Migué,
Chupa-lelé, Coió.

### Grupo / gangue
Patota ✅ *(já em uso — `enemy_gang`)*, Turma, Curriola *(turma de
vadiagem)*, Tranqueira *(companhia ruim, sentido negativo)*.

### Elogio / respeito
Bacanaço *(rico, elegante)*, Simpatia *(gente boa)*, Transado *(coisa boa,
bonito)*, Bárbaro *(impecável)*.

### Comida
Rango, Gororoba, Xepa *(comida de baixa qualidade)*.

**Onde já foi aplicado:** `src/i18n/gangues-{pt,en,es}.json` →
`games.gangues.{vitoria, vitoria_sub, report.enemy_thinking, report.enemy_gang,
attr_labels, btn_fugir}`. Ver também a §13 (vocabulário).

## 14. Regras de texto do jogo

- Todo texto visível está em `src/i18n/gangues-{pt,en,es}.json`, nos 3
  idiomas, com adaptação livre de gíria por idioma (§13).
- Rótulo de UI neutro é de propósito (ATACAR, EQUIPAR, Comprar, Fechar);
  narração e fala usam gíria de rua de verdade.
- **Antes de apagar chave "morta" do i18n**, procure por
  `\$\{[^}]*[?|][^}]*\}` (ternário ou `||` dentro de template string, ex.:
  `` `games.gangues.progression.${equipado ? 'unequip' : 'equip'}` ``) e
  confira os dois lados manualmente — o grep simples não enxerga esses usos
  e já apagou chave viva uma vez.

## 15. Retratos e animação

### 15.0 Cabeça (pixel art)

- **Recrutáveis:** `assets/personagens/<slug>/neutro.png` (`<slug>` = campo
  `.slug` do catálogo). `data/ganguesPortraits.js` descobre por
  `import.meta.glob` — personagem novo é só criar a pasta.
  `getGanguesPortrait(slug)` / `getGanguesPortraitByTemplateId(id)`.
  Cobertura: os **12 oficiais** (ids 1–12). Os 18 restantes caem no fallback
  (inicial do nome).
- **Inimigos:** `assets/enemies/<slug>/neutro.png`, resolvidos por id numérico
  via `ENEMY_ID_SLUG` em `data/ganguesEnemyPortraits.js`. Cobertura: **todo o
  elenco de combate da Pista** (+ alguns da Feira/Baixada/Vila usados como
  molde); os outros bairros caem no fallback.
- **NPCs:** `assets/npcs/<slug>/neutro.png` (§8).
- **Onde aparece:** recrutamento, elenco do lobby, roster de combate (os dois
  lados), dado dramático, card de KO, fala final, relatório de vitória, álbum,
  diálogos, pinos e marcador da cena (a cabeça do **líder**, §16).
- **Falha de carregamento:** todo `<img>` de retrato usa
  `GanguesRetratoImg.jsx` (ou o mesmo padrão `onError` local) — se a imagem
  não baixar, cai pra inicial em vez de deixar um buraco. Quando o mesmo slot
  troca de personagem, o componente leva `key` pra não herdar o "falhou" do
  anterior.
- **Receita de import:** master 1254×1254 → sharp resize 256×256 (`contain`,
  fundo transparente) + PNG paletizado (256 cores), ~25KB. Nunca commitar a
  arte de origem grande.

### 15.1 Corpo inteiro (fundação + recrutamento)

- Só em `GanguesCreate.jsx` (fundação e recrutamento) e no modal de ficha
  aberto de lá (`GanguesFichaCard` com `corpoSlug`). O resto do jogo usa a
  cabeça.
- Arte: `assets/personagens/<slug>/corpo-<pose>.webp`, poses **frente → lado
  → costas** (`GANGUES_CORPO_POSES`). Os 12 oficiais têm as 3.
  `getGanguesCorpo(slug, pose)` / `getGanguesCorpoPoses(slug)`.
- **Troca automática a cada 2,5s** (`GanguesRetratoCorpo.jsx`); tocar avança
  na hora e reinicia a contagem. O toque faz `stopPropagation` (a imagem vive
  dentro do card que abre a ficha). Só o card atual do carrossel cicla; os
  vizinhos mostram `frente`.
- É ilustração pintada, **nunca** `image-rendering: pixelated`.
- Recorte do turnaround: cortar nos vãos transparentes reais entre as figuras
  (não em terços iguais), `.trim()`, webp q85.
- CSS: botão e `<img>` são `position: absolute` ancorados no portrait —
  `height/max-height` em `%` dentro de grid com `place-items: end` não
  resolve (row `auto`).
- Fallback: sem corpo → cabeça → inicial.

### 15.2 Animação de combate (sprite)

`data/ganguesCombatAnimations.js` (`DADOS_POR_SLUG`, `TEMPLATE_SLUG`,
`getGanguesAnimacao(id, tipo)`), tocada **dentro do `DramaticDice`** — o
momento do golpe, não o log.

- **Cobertura:** os 5 iniciais — **Trinca, Fenda, Muro, Catraca, Faísca** —
  têm `ataqueNormal` e `dano`, os dois com **16 quadros** (grade 4×4). Os
  outros 25 caem no golpe sem sprite.
- `golpes` = quadros de impacto, por personagem (não existe quadro fixo).
- **Voz** só no Trinca e no Muro (`sons.voz` é opcional). Fenda e Catraca usam
  o par de impacto `soco-leve`/`dano-leve`; Faísca reaproveita os sons do
  Trinca e do Muro. Vozes dos outros: **planejado** (ElevenLabs).
- Receita: folha 1448×1086 → estender embaixo até múltiplo de 8 → metade
  (724×544) → webp lossless. Conferir cada quadro renderizado com a fórmula
  CSS do `GanguesCombatSpriteAnim.jsx` antes de publicar — arte que sai da
  célula só aparece olhando o quadro.

## 16. Líder da gangue

Pedido do Isaias: dar personalidade real ao "quem manda" da gangue, não só
decoração. Regras de hoje:

- **O 1º personagem que o jogador marca na fundação vira líder automático.**
  Aviso explícito na tela de recrutamento inicial
  (`recruitment.aviso_lider`).
- **Guardado em `storyProgress.__lider`** (mesmo JSONB/padrão de
  `__dificuldade`/`__torre`) — **não depende da ordem do array `roster`**.
  Isso importa: o roster recarregado da nuvem vem ordenado por
  `created_at DESC` (mais novo primeiro), então "líder = roster[0]" quebraria
  silenciosamente assim que o jogador desse F5 numa conta logada. `getLiderId()`
  valida que o id salvo ainda existe no elenco (cai pro primeiro do roster
  como fallback de save antigo/sem líder definido ainda).
- **Troca livre:** estrela clicável (`☆`/`★`) no card do elenco no lobby —
  `store.definirLider(sheetId)`. Sempre tem que ter um líder (não dá pra
  "desligar", só trocar).
- **Onde aparece hoje:** a cabeça do líder (via retrato — ver seção 15) é o
  marcador de navegação flutuante na cena (`GangMarker`). Se ele ainda não
  tem retrato, cai no escudo genérico de sempre.
- **Visão futura (ainda NÃO implementada — só documentada aqui pra não
  esquecer):** (1) IA de combate — um aliado tanque, quando existir a
  mecânica de "proteger", prioriza o líder como alvo de proteção antes de
  qualquer outro; (2) desafio "líder contra líder" como modalidade de
  confronto em territórios futuros (não a Pista — pedido explícito do
  Isaias foi "pra frente", não confundir com o chefe comum de cada bairro).

---

## 17. Mecânica de combate e progressão (fonte única)

Fonte única da mecânica, conferida contra o código.

### 17.1 Ficha e atributos

- Cada personagem tem 5 atributos: **A** (Porrada), **H** (Pique),
  **D** (Couro), **PV** (Osso) e **PM** (Malandragem) (`GANGUES_ATTRS` em
  `data/ganguesCharacters.js`). Crescem por nível seguindo o `growth_order` autorado de cada um dos 30
  personagens do catálogo (não são mais alocação livre do jogador).
- **PV máx / PM máx** = atributo PV/PM × uma taxa por caminho
  (`GANGUES_RESOURCE_RATES` em `data/ganguesLoadout.js`):

  | Caminho | PV máx por ponto de PV | PM máx por ponto de PM |
  |---|---|---|
  | Porradeiro (atacante) | 3 | 3 |
  | Paredão (defensor) | 4 | 2 |
  | Mandingueiro (místico) | 3 | 4 |

- **Criação de gangue não distribui pontos livres** — o jogador escolhe 2
  dos 30 personagens pré-autorados do catálogo (`ldi_gangues_30_personagens_v1.json`),
  cada um já vem com `base_stats`/`base_resources` fixos do nível 1. Os
  outros 28 liberam por reputação/campanha/evento — ver `getGanguesAvailableCharacterIds`.
  Nome/rótulo dos atributos na tela (`attr_labels` no i18n — gíria de rua,
  renomeada em 13/09/2026, adaptação livre por idioma, nunca tradução literal):

  | Código | PT | EN | ES |
  |---|---|---|---|
  | A | **Porrada** | Wallop | Trompada |
  | H | **Pique** | Pace | Pique |
  | D | **Couro** | Hide | Cuero |
  | PV | **Osso** | Grit | Aguante |
  | PM | **Malandragem** | Street Smarts | Viveza |
  | poderes | **Talento(s)** | Talent(s) | Talento(s) |

  Só o NOME DO ATRIBUTO mudou: a ação de atacar continua "ataque" no texto, e
  os identificadores de código (`A/H/D`, `onUsarPoder`, `orb.poder`) ficaram
  como estavam.

- **Papel de cada atributo (sistema do Pique):**
  - **Porrada (A)**: ataque. **Couro (D)**: defesa. **Osso (PV)**: vida.
  - **Pique (H)**: SÓ velocidade na linha do tempo (§17.2) — saiu do ataque.
  - **Malandragem (PM)**: o pool de PM E a força dos Talentos (+metade dela
    em todo golpe de talento).
- **Caminhos renomeados pra gíria** (só o texto; ids `atacante/defensor/mistico`
  no código continuam): Atacante → **Porradeiro** (Brawler/Pegador), Defensor →
  **Paredão** (Wall/Muralla), Místico → **Mandingueiro** (Hexer/Brujo).
- **Velocidade é personalidade, não classe**: cada um dos 30 tem `speed_tier`
  (lento/médio/rápido) no catálogo. Crescimento por 20 níveis: base do caminho
  (Porradeiro A7 D5 Osso6 Mal2 · Paredão A5 D7 Osso5 Mal3 · Mandingueiro A5 D6
  Osso5 Mal4) e o Pique sai do Osso/Malandragem: lento Pique 1 (−1 Osso),
  médio Pique 2 (−2 Osso), rápido Pique 4 (−3 Osso −1 Mal). Porrada/Couro
  nunca pagam o Pique — simulação mostrou que, com dano por subtração, 1 ponto
  a menos ali pesa demais. Todo mundo tem Pique.
- **Inimigos** seguem o perfil do caminho (`preferred_mode`: fists =
  Porradeiro, armed = Paredão, power = Mandingueiro), mantendo o total de
  pontos de cada ficha; o Pique varia por personalidade (×0,6 a ×1,5).
- **Teto de nível por área** (`nivelTetoDaHistoria` em
  `ganguesTerritorios.js`, aplicado em `addGanguesAp`): o personagem só sobe
  até o teto da área atual (a 1ª cujo chefe não caiu): `nivelTeto` do
  território ou, sem ele, o nível do chefe. **Pista 20 · Feira 33 · Baixada 46
  · Vila 59 · Morro 72 · Alto 85 · Laje 99** (§9.7). No teto o AP não acumula e a tela de vitória avisa "nível máximo
  da área". Nunca baixa entre áreas; campanha zerada libera até 99.
- **Nível teto: 99** (`GANGUES_LEVEL_CAP`). Níveis 1–10 são estatísticas
  autoradas à mão; 11–99 crescem +1 ponto por nível seguindo o
  `growth_order` de cada ficha (fiel à identidade dela — um Bruto termina
  A altíssimo, um Muralha só D/PV).

### 17.2 Fórmula de combate

Tudo em `engine/ganguesCombatResolver.js`:

```
FA = Porrada + d3[+2 se crítico] + floor(Malandragem/2) só se usou TALENTO + efeitos de poder ativo
FD = Couro efetivo + d3 + efeitos de poder passivo
DANO = max(0, FA − FD)   // SEM piso de dano — defesa bem investida pode zerar o golpe
```

**Ordem de ação — linha do tempo (Pique)** (`engine/ganguesLinhaDoTempo.js`,
estilo Medabots/ATB do Chrono Trigger):
- velocidade = Pique + base; base = 10% da ficha média da luta;
- cada um enche uma barra até 100 (corre até o centro da pista na tela) e age;
- ataque normal custa 100, Talento custa 125 (o "preparo" demora mais);
- **teto: ninguém é mais que 3× o mais lento vivo**;
- rodada fecha quando todo vivo agiu ≥1 vez. Os dois motores (normal e
  Multidão) usam as mesmas funções.
- **Pista visual** (`components/GanguesPistaTempo.jsx`): raias em par — cada
  raia leva um aliado (vem da esquerda) e um inimigo (vem da direita); só
  aparecem as raias necessárias, até 6 (passou disso, dividem). Largada
  animada no início da luta. A barra do automático fica logo acima do
  roster inimigo.
- **Velocidade 1x/2x/3x**: só com o AUTOMÁTICO ligado (normal ou Multidão) —
  benefício de assinante no lançamento; no beta tudo liberado.

- **Dado d3** (1 a 3) pros dois lados, ataque e defesa. Crítico = tirar o
  valor máximo (3) no dado de ataque, soma **+2** na rolagem (vira 5 no
  cálculo de FA). Só o ataque critica.
- **Sem dano mínimo garantido** — o clamp é `Math.max(0, ...)`, não
  `Math.max(1, ...)`. Foi tirado de propósito depois de muito playtest: com
  bandos grandes, "sempre acerta pelo menos 1" deixava toda defesa
  irrelevante.
- **IA inimiga**: ataca depois de um delay fixo. Escolha de alvo evita
  repetir o último quando dá — ~55% mira em quem tem menos PV entre os
  vivos, ~45% escolhe aleatório (`pickEnemyTarget` em `useGanguesTurnMachine.js`).
- **⚠️ Bônus de caminho DESLIGADO (pendência de decisão):**
  `resolveAttackerBonus`/`resolveDefenderBonus` em `ganguesCombatResolver.js`
  sempre retornam `applied: false, amount: 0`, mas o log de combate
  (`GanguesCombatLogList.jsx`) e o relatório ainda têm o texto "bônus de
  ataque". Decidir: religar o bônus ou tirar o texto/UI.

### 17.2.1 Como o jogador age, e os modos de combate

- **A bolinha de ação** (`GanguesActionOrb`): no turno do personagem, o
  jogador escolhe **ATACAR** (ataque normal), **TALENTO** (um dos 2 poderes
  equipados, gasta PM ou PV) ou **ITEM** (consumível da gangue). A bolinha usa
  `onPointerDown/Up`, não `onClick` (importa pra teste automatizado).
- **O dado dramático** (`DramaticDice`): todo ataque pausa o combate numa tela
  cheia que rola o dado, mostra atacante e alvo e o resultado. É o "momento" do
  golpe — as animações de sprite de ataque (§15.2) tocam aqui, não no log.
  Ele **destaca quando um poder passivo do defensor entra em ação** na conta.
- **KO:** personagem com PV 0 cai e para de agir até o fim da luta. **PV e PM
  perdidos persistem entre lutas dentro do bairro** (só voltam no descanso,
  saindo ou dominando). Tropa inteira caída não entra em luta nenhuma.
- **Briga em Multidão** (`engine/ganguesBrigaMultidao.js`,
  `hooks/useGanguesModoMultidao.js`): um interruptor que resolve **a rodada
  inteira de uma vez** a cada toque (todo mundo age), em vez de turno a turno.
  - É oferecido quando a luta tem **5 ou mais combatentes no total**
    (jogador + inimigos). O botão pisca na 1ª vez, com tutorial próprio.
  - **Liga e desliga a qualquer momento:** os dois motores
    sincronizam o estado vivo da luta (`syncFrom` /
    `iniciarBrigaMultidaoDeCombatentes`). Só trava durante a animação de uma
    rodada ou depois do fim da luta.
  - Tem automático próprio (`useGanguesModoAutoMultidao`), que foca o
    inimigo mais perto de cair.
- **Modo automático** (`hooks/useGanguesModoAuto.js`): a luta anda sozinha,
  **só com ataque normal**. É **vantagem de assinante** (`TIERS_COM_MODO_AUTO`
  = elite e primordial), mas o botão **aparece pra todo mundo** de propósito,
  como chamariz de assinatura. Um botão "sair do automático" fica logo abaixo
  do roster do jogador (posição medida, pra nunca tampar a barra de PV).
- **"Mete o pé"** (fugir da luta) volta pra tela de **Modos**, não pro lobby.
- **Voltar nunca repete recompensa:** as fases de combate e vitória ficam fora
  da   pilha de histórico (`GANGUES_FASES_TRANSITORIAS`) — senão Voltar duplica XP.

### 17.2.2 Personas da IA, status e cura (28/09/2026)

**Personas** (`engine/ganguesPersonas.js`) — todo inimigo sorteia uma no
começo da luta, com peso pelo `preferred_mode` (fists → Brigão/Caçador/
Covarde/Doido; armed → Protetor/Brigão/Covarde/Doido; power → os 3
Mandingueiros). Os dois motores (normal e Multidão) usam a mesma decisão
(`decidirAcaoInimigo`):

| Persona | Em quem bate | Quando usa talento |
|---|---|---|
| Brigão | qualquer um (evita repetir o último) | raro (20%) |
| Covarde | o mais machucado | quando o alvo tá com ≤40% (ou 15%) |
| Caçador | quem tem mais Porrada | sempre que dá |
| Protetor (Paredão) | quem bateu num aliado dele | com ≤60% de Osso (ou 35%) |
| Doido | sorteio | 50% |
| Mandingueiro de ataque | o mais machucado | sempre que dá |
| Mandingueiro de cura | cura o aliado dele com ≤60%; senão bate | cura sempre que precisa |
| Mandingueiro de status | quem ainda não tem aquele status | sempre que dá |

- **Bando de 3+ sempre leva 1 mandingueiro** (o de mais Malandragem vira um).
- **Inimigo tem talento de verdade**: ficha de talentos montada na hora
  (subcaminho do papel; rank pela ficha: <20 pontos = 1, <50 = 2, senão 3).
  Ativo a partir de 3 pontos de ficha, passiva a partir de 8 — as mesmas
  passivas e talentos do jogador.

**Status** (`engine/ganguesStatus.js`, inspiração: Pokémon). **Só o
Mandingueiro causa status** (e os chips de reputação que emprestam poder).
ID É NÚMERO (regra do projeto); o nome na tela é gíria e mora no i18n
(`games.gangues.status.<id>`), com a explicação de cada um. Cada status dura N
vezes do lutador que carrega (desce 1 toda vez que chega a vez dele, agindo
ou não). Dano de status **nunca derruba**: para em 1 de Osso.

| id | Nome | O que faz | Dura | Quem causa (subcaminho · talento @nível) |
|---|---|---|---|---|
| 1 | 🐢 **Moscando** | Pique pela metade | 2 | Terreno · `ruptura_do_solo` (Raiz/Racha @40) |
| 2 | 🩸 **Sangrando** | −1 de Osso por vez | 3 | Terreno · `estilhaco_terrestre` (Racha @4) |
| 3 | 🥀 **Braço Mole** | −2 de Porrada | 2 | Ilusório · `reflexo_falso` (Espelho @4, Névoa @12) |
| 4 | 💢 **Guarda Aberta** | −2 de Couro | 2 | Terreno · `tremor` (Raiz/Racha @24) |
| 5 | 💤 **Apagado** | dorme: perde a vez 1–3 vezes; acorda ao apanhar | 1–3 | Ilusório · `quebra_de_realidade` (Névoa/Espelho @40) |
| 6 | 🧪 **Batizado** | −1/8 do Osso máximo por vez | 4 | `fenda_no_chao` (Racha @50), `espelho_quebrado` (Espelho @50) |
| 7 | 😵 **Grogue** | 1 em 3 de bater num parceiro (ou em si) | 3 | Ilusório · `distorcao` (Névoa @24) |
| 8 | ⚡ **Travado** | Pique pela metade + 1 em 4 de perder a vez | 3 | Terreno · `raiz_prendente` (Raiz @12) |
| 9 | 🔥 **Queimado** | −1/16 do Osso máximo por vez e −2 de Porrada | 3 | Ígneo · `combustao` (Cinza @12, Brasa @24), `explosao_termica` (Brasa @24) |

- **Status persiste entre lutas** (`status_atual`, gravado junto do PV/PM).
  Só sai com item ou no **descanso completo** (50 na birosca). Save antigo com
  status por nome (v3.64) é convertido sozinho (`normalizarStatus`).
- **Itens de curar status** (consumível): 30 Gelo no Tornozelo (Moscando) ·
  31 Atadura (Sangrando) · 32 Café Forte (Braço Mole) · 33 Pomada de Arnica
  (Guarda Aberta) · 35 Balde de Água Fria (Apagado) · 36 Leite Quente
  (Batizado) · 37 Água com Açúcar (Grogue) · 38 Emplastro (Travado) · 39
  Babosa (Queimado) — 12 cada; **34 Xarope da Vó** cura todos (30). Vendem na
  Lojinha do Zé (dobro do preço) e na loja da Pista; dá pra usar na luta e na
  bolsa.
- **Mandingueiro do jogador em 3 papéis** (todos são Mandingueiros; o status
  vem em cima do dano normal do talento — por isso o Mandingueiro tem mais
  poder que Porradeiro e Paredão, de propósito):
  - **Ataque**: Faísca e Trovão (Tempestade, sem status) · Brasa e Cinza
    (Ígneo — Queimado).
  - **Cura**: Maré e Chuva (Aquático) — `neblina` (@12/@24), `fluxo_restaurador`
    (Maré @24) e `temporal` (Chuva @50) curam `valor + metade da Malandragem`
    de Osso no aliado mais machucado, sem dado.
  - **Status**: Raiz e Racha (Terreno), Névoa e Espelho (Ilusório).
- **Na tela**: passiva que entrou aparece grande no dado ("PASSIVA ATIVOU",
  pulsando) e ganha linha no registro; o status que pegou aparece no dado com
  a explicação; o roster mostra o ícone + vezes restantes, e tocar no ícone
  mostra o que o status faz. Perder a vez (Apagado/Travado) e o Grogue
  acertando parceiro têm linha própria no registro.
- **Teste (motor real, 60 lutas)**: todos os status aplicam, Apagado/Travado
  fazem perder a vez, Grogue acerta parceiro, passivas disparam, todas as
  personas aparecem.

### 17.2.3 Apostas — A Banca do Tio Dado (29/09/2026)

Fonte de grana do farm sem porrada (a rinha dá só XP; o Clube paga 200).
Regra em `data/ganguesApostas.js`, tela em `components/cena/GanguesBanca.jsx`.
O Tio Dado (POI `banca`, retrato emprestado do Troco Certo/1402) fica **dentro
da birosca**, na mesa da direita.

- **Teto de aposta pela Rep**: <10 → 25 · <25 → 50 · <50 → 100 · 50+ → 200.
  Valores: 10, 25, 50, 100, 200 (só os que cabem no teto e na grana).
- **Desafio de mão**: escolhe a aposta e a dificuldade, o Tio Dado sorteia um
  puzzle da lib compartilhada (Simon, Decoder, Forca, Anagrama, Labirinto,
  Stealth — o Sliding fica de fora por ter estilo inline de outro jogo).
  Resolveu, leva **×1,5 (Mole) · ×2 (Na medida) · ×3 (Cabuloso)**; errou,
  perde a aposta. É farm por habilidade, de propósito.
- **Rinha de aposta**: duas fichas NPC do pool da rua, **mesma ficha** (≈8
  pontos na Pista), brigam sozinhas no motor da Multidão. A cotação sai de 150
  simulações da própria briga com **10% de margem da casa**, dos dois lados
  (testado: apostar sempre no favorito ou sempre no azarão rende ≈ −10%).
- **Aposta em você**: na carta de encarar a treta. A grana sai ao entrar e
  volta multiplicada se vencer, pela ficha do inimigo contra o seu mais forte:
  mais de 5 acima **×3** · 1–5 acima **×2** · até 2 abaixo **×1,5** · mais
  fraco que isso **×1,1** (farmar fraco com aposta quase não rende). Perdeu ou
  fugiu, perdeu a aposta.

### 17.3 Poderes / especiais (skill tree)

- **15 subcaminhos** (5 por caminho × 3 caminhos), **5 poderes cada** = 75
  poderes catalogados (`data/ganguesSpecials.js`), valores reais aplicados
  em `engine/ganguesSpecialEffects.js`.   Porradeiro: Bruto, Duelista, Fúria,
  Especialista, Vingador. Paredão: Muralha, Guardião, Provocador, Reativo,
  Resiliente. Mandingueiro: Ígneo, Aquático, Terreno, Tempestade, Ilusório.
- **Os 3 caminhos têm design próprio.** Os ids de subcaminho têm que bater
  com `signature_specials` do catálogo, senão o poder equipado não é achado
  em combate. Cada poder tem 3 níveis; só dá pra equipar **2 por vez** (`selected_specials`).
- **6º poder exclusivo por personagem**, nível 50, não repetido dentro do
  mesmo subcaminho — veio junto da correção acima.
- Poderes liberam/sobem via **AP → XP**, não mais via pontos de criação:
  ver §17.4.

### 17.4 Progressão (AP, XP, nível)

- **AP base por inimigo = 10** (história ou Torre). Chefe vale 5×; Torre escala +100% a
  cada 5 andares. Derrota rende sempre 1 AP simbólico.
- **Recompensa por risco** (`apPorInimigo` em `engine/ganguesVictoryResolver.js`). Cada inimigo rende AP
  pela diferença entre a ficha DELE e a do **personagem mais forte da
  gangue** (total bruto A+H+D+PV+PM, não o time inteiro). Motivo, nas
  palavras do Isaias: "subir não dá mais experiência do que ficar embaixo em
  frente a cara fraco".

  | Ficha do inimigo vs. a do mais forte da gangue | AP por inimigo |
  |---|---|
  | mais de 5 pontos acima | **40** (quádruplo) |
  | 1 a 5 pontos acima | **30** (triplo) |
  | igual até 2 pontos abaixo | **10** (cheio) |
  | mais de 2 pontos abaixo | 10 − (pontos além dos 2) × (tamanho da gangue), **piso 5** |

  O piso de 5 é fixo (não por cabeça) — o Isaias pediu "pelo menos 5 pontos"
  porque o farm de sobrevivência não rendia quase nada. O card de treta mostra
  um aviso de risco comparando **nível real** (`nivelRealDePontos` em
  `ganguesDificuldade.js`: nível 1 nasce com ~7 pontos), nunca pontos crus.
- **Divisão do AP entre a gangue** (`calcularPesosEParticipantes`): peso por
  faixa de contribuição (abates pesam mais que dano) — quem mais contribuiu
  pesa 3, a 2ª faixa pesa 2, o resto 1; empatados ficam na mesma faixa. Na
  derrota todo mundo pesa igual.
- **Grana da vitória** (`calcularGranaTotal`): **10 por inimigo
  derrotado na Pista**, escalando por bairro (15 · 20 · 30 · 40 · 55 · 75 —
  §9.7), inclusive nas tretas repetíveis (decisão do Isaias, 29/09); chefe
  garante um mínimo por território (`GANGUES_GRANA_CHEFE_MINIMO`: Carvão 250,
  depois 500 · 800 · 1.200 · 1.700 · 2.300 · 3.000). POI com `semGrana: true`
  (hoje só a **rinha**) não paga grana, só XP. Substituiu a grana autorada
  por POI — a Rep continua autorada por POI.
- **Marcos de reputação:** a cada 50 de Rep acumulada, a gangue ganha um chip
  de poder (§9.3).
- **Regra da frustração:** **2 derrotas seguidas** na
  história (`storyProgress.__derrotasSeguidas`,
  `GANGUES_FRUSTRACAO_LIMIAR = 2`) fazem a próxima treta comum vir com **um
  inimigo só, um degrau (3 pontos) abaixo** do normal (`suavizarPorFrustracao`).
  Não é "metade da ficha" — o Isaias corrigiu: "aí é fácil demais e fica
  roubado, melhor um nível anterior". Zera em qualquer vitória.
- **Custo de AP por nível**: `ganguesApCostForLevel(nível) = 5 × (nível + 1)`
  — nível 1 custa 10 AP, nível 2 custa 15, sobe 5 a cada nível
  (`data/ganguesLoadout.js`). 10 AP = 1 XP; 1 XP = 1 nível
  (`getGanguesLevelFromXp`).
- **Todo nível dá exatamente +1 ponto de atributo, sempre — sem exceção,
  sem custo escalonado.** A direção (qual atributo sobe em qual nível) é
  autorada por personagem via `growth_order` (identidade da ficha, não
  escolha livre do jogador); o que nunca varia é a quantidade: 1 nível =
  1 ponto cheio. `levels[]` dos 30 personagens no catálogo
  (`ldi_gangues_30_personagens_v1.json`) é gerado por
  `scripts/gangues-regen-catalog.cjs` (`node scripts/gangues-regen-catalog.cjs`
  reescreve o catálogo inteiro — fonte de verdade pra rebalancear ou
  adicionar personagem). Poderes liberam/sobem via **AP → XP** nos marcos
  autorados (4/12/24/40, ranks 52-70/78-96) — evento independente do
  atributo, nunca substitui o ganho de atributo do nível.
  - **Nunca reintroduzir custo escalonado por atributo** sem pedido explícito
    e playtest — já foi tentado e revertido ("estilo Ragnarok, todo nível
    sobe atributo").
- **1ª luta de toda conta nova é suavizada** (1 corpo só, metade dos
  pontos) — `suavizarPrimeiraLuta` em `data/ganguesEncontros.js`. É global
  por conta, não por território.

### 17.5 Tamanho de gangue e elenco

- Batalha da história começa travada em **2 fichas** (`GANGUES_INITIAL_PARTY_SIZE`),
  cresce **+1 vaga por território dominado** até o teto de **6**
  (`GANGUES_STORY_BATTLE_PARTY_MAX`, `getGanguesRosterLimitComHistoria`) —
  o maior valor entre "quanto o tier paga" e "quanto a história liberou"
  vale, não soma os dois.
- Limite de **fichas no roster** por tier: hoje achatado em 2 pra todos os
  planos (`GANGUES_ROSTER_LIMITS`) — cresce de verdade é pela história, não
  pela assinatura.
- **Saves**: 1/2/3 por tier free/elite/primordial (`GANGUES_SAVE_SLOT_LIMITS`).

### 17.6 Modo História — a cena navegável (hoje só a Pista)

Implementado pra Pista (`data/cenas/pista/`). Os outros 6 bairros ainda usam
a trilha simples de nós (`GanguesTerritorio.jsx`, 3 pontos comuns + chefe por
bairro). Os dois formatos usam o MESMO sistema de pontos fixos.

- Cada bairro-cena é um mapa navegável com **5 tipos de POI**: **Treta**
  (combate), **Parada** (mini-jogo, falhar pode virar treta), **Papo**
  (diálogo com escolhas), **Corre** (tarefa/stealth), **Achado** (loot sem
  interação) — mais `Descanso` (birosca) e `Loja`.
- **Grafo de descoberta**: POI escondido não aparece; resolver um revela o
  próximo. Portão do chefe só abre com os POIs-chave batidos.
- **Economia**: Grana (gasta em descanso/loja) e Rep/Nome (destranca POI,
  alimenta % de domínio). PV/PM perdido persiste dentro do bairro; só volta
  ao cheio saindo ou dominando.
- **Descanso, agiota e Clube da Luta**: regras completas na §4 (Pista). Em
  resumo: a birosca só cura (10 pra quem está de pé, 30 pra reviver todo
  mundo); a dívida é com o agiota Marimbondo (empréstimo de 100 que vira
  1.000, cada cura fiada dobra, teto 10.000 → Clube forçado); com dívida em
  aberto o chefe não aceita a luta.
- **Farol dos pinos** (`farolDe` em `GanguesCenaAtores.jsx`):
  **vermelho** = obrigatório e ainda não feito; **amarelo** = opcional;
  **verde** = já feito (treta repetível vencida uma vez também fica verde — o
  selo giratório ↻ é que avisa que dá pra repetir). Fora do farol de
  propósito: navegação (porta, saída, passagem) e o chefe (identidade própria
  vermelho-escuro com ★). Um NPC com missão pendente (ex.: a oferta do corre
  no Descanso) também fica verde, como "tem missão aqui".
- **O mapa não é estático:** cada
  personagem tem UM comportamento fixo (`movimentoDoPino` em
  `GanguesCenaAtores.jsx`, CSS em `styles/cena/mundo.css`):
  **parado** (só respira), **inquieto** (muda o peso de perna e olha pros
  lados), **patrulha** horizontal/vertical (anda devagar, e em cada ponta
  PARA, olha pra um lado, pro outro, dá uma viradinha e volta — ciclo de
  14–20s) ou **ronda** (volta num quadrado, com parada em cada canto).
  Quem conversa fica parado/inquieto; inimigos de treta ficam metade no
  lugar, metade andando; loja, agiota e chefe são
  fixos. Dá pra fixar qualquer um no dado (`poi.movimento`, ex.: o `sinal`
  é `patrulha-h`). Todos **congelam quando o jogador encosta**.
- **Gates de reputação** (`data/ganguesLoadout.js`): Rep **25** pra encarar o
  galpão do Carvão / Cão Louco (`GANGUES_REP_GATE_GALPAO`) e Rep **40** pra
  entrar no Clube da Luta por vontade própria (`GANGUES_REP_GATE_CLUBE`).
  Reputação virou "risco liberado", não vaga de elenco.
- **Bando inimigo é NÍVEL FIXO:** cada nó/POI tem um
  `pontosFixo` autorado (ladder subindo em degraus — ver `pontosFixo` nos
  nós de `ganguesTerritorios.js` e nos POIs de `data/cenas/pista/`), e a
  dificuldade escolhida (fácil/médio/difícil) só soma/tira um valor fixo em
  cima disso (`GANGUES_DIFICULDADE_AJUSTE` em `data/ganguesDificuldade.js`
  — ±2 por padrão, único lugar do jogo que decide isso). Chefe continua com
  orçamento **fixo** próprio (`GANGUES_CHEFE_BUDGET`), sempre acima dos 3
  pontos comuns do território — o loop de RPG é o jogador voltar mais
  forte, não o chefe ficar mais fraco.
- **Ladder da Pista hoje** (ficha em pontos por corpo; "rev" = revezamento:
  quase sempre 1 inimigo, às vezes dupla, e o 2º corpo sai 2–3 pontos
  abaixo). Regra do Isaias: **a 1ª luta é muito fácil de
  propósito (3); da 2ª em diante sobe de 3 em 3, sem exceção; o chefe quebra
  o padrão pra ser ralado.**

  | Ponto | Ficha | Forma | Obrigatório |
  |---|---|---|---|
  | `sinal` (apertar o pivete) | 3 | rev, dupla 15% | sim |
  | `rinha` (farm infinito) | sorteada de 5 abaixo a 2 acima do seu mais forte, o seu nível 2× mais comum; dupla só da metade de baixo (`niveisDaRinha`, 30/09/2026); perdeu com grana, paga a recuperação do bairro (30) e segue; sem grana, acaba | rev, dupla 35% | não |
  | `ferro` (falhar a gazua) | 8 | rev, dupla 10% | sim (a gazua) |
  | `beco` | 8 | rev, dupla 40% | sim |
  | `beco_2` | 11 | rev, dupla 40% | sim |
  | `beco_3` | 14 | rev, dupla 40% | sim |
  | `sinaleiro` (1451) | 17 | sempre sozinho (`fixo`) | sim |
  | `rasteira_velha` (1452) | 20 | sempre sozinha (`fixo`) | sim |
  | túnel `m1` / `m2` / `m3` | 4 / 6 / 5 | rev, pool fraco | sim (passagem) |
  | `posmuro_1` | 23 | rev, dupla 50% | sim (galpão) |
  | `posmuro_2` (Cão Louco) | 26 | rev, dupla 60%, Rep 25 | sim (galpão) |
  | galpão `m1` | 6 por corpo + 40% do time, 3–5 corpos | rev, bando | passagem |
  | galpão `m2` (1301) | 22 divididos em 3–5 corpos, Rep 25 | bando fixo | passagem |
  | encontro aleatório (perseguidor) | ~ficha do seu mais forte, mín. 2 corpos | rev, `baseMaisForte` | não |
  | **Carvão** (chefe) | **~29** + escolta ~19 (orçamento 48) | chefe fixo | — |

  A dificuldade soma ou tira 2 de cada número (fácil −2, médio 0,
  difícil +2).

### 17.7 Persistência

- Logado: ficha inteira (incluindo XP/poderes equipados) salva em
  `gangues_fichas` (Supabase), progresso de história em `gangues_saves` —
  ambos com debounce de escrita, sem depender de `localStorage` pra dado
  de jogo.
- **Dano gravado ao vivo** (`hooks/useGanguesDanoAoVivo.js`, 28/09/2026): PV,
  PM e status do time vão pro store a cada golpe e pra nuvem com debounce de
  1,5s — e na hora em que a aba vai pro segundo plano. Antes o dano só era
  gravado ao abrir o resultado: fugir, sair ou o celular recarregar a aba no
  meio da luta devolvia a tropa inteira (bug de imortalidade).
- Guest: tudo em memória, perde ao recarregar — banner avisa.
- **Logout limpa o store do Gangues de verdade** (`AuthContext.jsx`, no
  `onAuthStateChange`) — sem isso, o próximo guest/login na mesma aba
  herdava `_userId` órfão.

### 17.8 Estrutura de arquivos

```
src/pages/games/Gangues/
├── GanguesRoute.jsx      # shell/router — troca de fase, carrega i18n dedicado
├── Gangues.css           # índice de @import (a ORDEM é a cascata)
├── screens/              # uma tela por fase (Lobby, Combat, Cena, Create,
│                         # Modes, Victory*, Album, Batalha, Clube*, Naming,
│                         # Progression, SaveSelect, StoryMap, Territorio)
├── styles/               # CSS por assunto + paleta.css (--gang-*); cena/ e lobby/
├── assets/               # personagens/, enemies/, npcs/, backgrounds/, logos/, sons/
├── components/           # peças reutilizadas (dado dramático, orb, pista do Pique…)
│   └── cena/             # peças da cena navegável (atores, loja, descanso, agiota…)
├── data/                 # catálogos (30 personagens, 102 inimigos, itens, equip,
│   └── cenas/pista/      # especiais, territórios, encontros) — dados, não UI
├── engine/               # resolver, linha do tempo, Multidão, efeitos, cena,
│                         # encontro aleatório, vitória, status, personas (IA)
├── hooks/                # turno, auto, Multidão, movimento de cena, i18n,
│                         # dano ao vivo (PV/PM/status gravados durante a luta)
└── store/
    ├── useGanguesStore.js    # composição das slices (zustand)
    └── slices/               # save, sheet, story, progression, equip, colecao,
                              # birosca, cenaEconomia, cenaProgresso, match
```

CSS: `scripts/gangues-css-audit.cjs` roda no `predeploy` e barra seletor morto,
arquivo > 500 linhas, `@media` por largura ≥ 480px, `vw` cru e `fixed` com
`inset: 0`.

### 17.9 Referência completa — atributos e poderes por personagem (a cada 5 níveis)

Pedido do Isaias: ver como cada um dos 30 personagens evolui, atributo por
atributo, a cada 5 níveis até o teto (99), e em qual nível exato cada poder
abre/sobe de rank. Gerado direto do catálogo real
(`ldi_gangues_30_personagens_v1.json`) via
`scripts/gangues-gdd-referencia-personagens.cjs` — **rodar esse script de
novo e colar a saída aqui sempre que o catálogo for regenerado**
(`scripts/gangues-regen-catalog.cjs`), senão esta tabela fica desatualizada.
Colunas Osso/Malandragem = PV/PM (ver §17.1). Linhas fora do múltiplo de 5 aparecem
só quando cai um poder exatamente naquele nível (pra não perder o marco);
nível 1 (base) e 99 (teto) sempre aparecem, mesmo sem evento. Atributo sobe
+1 flat todo nível — sem gap nenhum (ver §17.4).

### Trinca — atacante (bruto)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 4 | 2 | 1 | 3 | 1 | ⚡ abre **soco_de_ferro** |
| 5 | 5 | 2 | 1 | 3 | 1 | — |
| 10 | 6 | 3 | 2 | 4 | 2 | ★ O Quebra-Linha |
| 12 | 7 | 3 | 3 | 4 | 2 | ⚡ abre **peso_bruto** |
| 15 | 8 | 3 | 4 | 5 | 2 | — |
| 20 | 9 | 4 | 5 | 6 | 3 | — |
| 24 | 11 | 4 | 6 | 7 | 3 | ⚡ abre **marreta** |
| 25 | 12 | 4 | 6 | 7 | 3 | — |
| 30 | 13 | 5 | 7 | 8 | 4 | — |
| 35 | 15 | 5 | 9 | 9 | 4 | — |
| 40 | 16 | 6 | 10 | 10 | 5 | ⚡ abre **fim_de_linha** |
| 45 | 19 | 6 | 11 | 11 | 5 | — |
| 50 | 20 | 7 | 12 | 12 | 6 | ⚡ abre **avalanche_de_socos** |
| 52 | 21 | 7 | 13 | 12 | 6 | ⬆ **soco_de_ferro** vira rank 2 |
| 55 | 22 | 7 | 14 | 13 | 6 | — |
| 58 | 23 | 8 | 14 | 13 | 7 | ⬆ **peso_bruto** vira rank 2 |
| 60 | 23 | 8 | 15 | 14 | 7 | — |
| 64 | 25 | 8 | 16 | 15 | 7 | ⬆ **marreta** vira rank 2 |
| 65 | 26 | 8 | 16 | 15 | 7 | — |
| 70 | 27 | 9 | 17 | 16 | 8 | ⬆ **fim_de_linha** vira rank 2 |
| 75 | 29 | 9 | 19 | 17 | 8 | — |
| 78 | 30 | 10 | 19 | 17 | 9 | ⬆ **soco_de_ferro** vira rank 3 |
| 80 | 30 | 10 | 20 | 18 | 9 | — |
| 84 | 32 | 10 | 21 | 19 | 9 | ⬆ **peso_bruto** vira rank 3 |
| 85 | 33 | 10 | 21 | 19 | 9 | — |
| 90 | 34 | 11 | 22 | 20 | 10 | ⬆ **marreta** vira rank 3 |
| 95 | 36 | 11 | 24 | 21 | 10 | — |
| 96 | 36 | 11 | 24 | 21 | 11 | ⬆ **fim_de_linha** vira rank 3 |
| 99 | 37 | 12 | 24 | 22 | 11 | — |

### Marreta — atacante (bruto)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 4 | 2 | 1 | 3 | 1 | ⚡ abre **investida** |
| 5 | 5 | 2 | 1 | 3 | 1 | — |
| 10 | 6 | 3 | 2 | 4 | 2 | ★ Demolidor |
| 12 | 7 | 3 | 3 | 4 | 2 | ⚡ abre **peso_bruto** |
| 15 | 8 | 3 | 4 | 5 | 2 | — |
| 20 | 9 | 4 | 5 | 6 | 3 | — |
| 24 | 11 | 4 | 6 | 7 | 3 | ⚡ abre **marreta** |
| 25 | 12 | 4 | 6 | 7 | 3 | — |
| 30 | 13 | 5 | 7 | 8 | 4 | — |
| 35 | 15 | 5 | 9 | 9 | 4 | — |
| 40 | 16 | 6 | 10 | 10 | 5 | ⚡ abre **fim_de_linha** |
| 45 | 19 | 6 | 11 | 11 | 5 | — |
| 50 | 20 | 7 | 12 | 12 | 6 | ⚡ abre **britadeira** |
| 52 | 21 | 7 | 13 | 12 | 6 | ⬆ **investida** vira rank 2 |
| 55 | 22 | 7 | 14 | 13 | 6 | — |
| 58 | 23 | 8 | 14 | 13 | 7 | ⬆ **peso_bruto** vira rank 2 |
| 60 | 23 | 8 | 15 | 14 | 7 | — |
| 64 | 25 | 8 | 16 | 15 | 7 | ⬆ **marreta** vira rank 2 |
| 65 | 26 | 8 | 16 | 15 | 7 | — |
| 70 | 27 | 9 | 17 | 16 | 8 | ⬆ **fim_de_linha** vira rank 2 |
| 75 | 29 | 9 | 19 | 17 | 8 | — |
| 78 | 30 | 10 | 19 | 17 | 9 | ⬆ **investida** vira rank 3 |
| 80 | 30 | 10 | 20 | 18 | 9 | — |
| 84 | 32 | 10 | 21 | 19 | 9 | ⬆ **peso_bruto** vira rank 3 |
| 85 | 33 | 10 | 21 | 19 | 9 | — |
| 90 | 34 | 11 | 22 | 20 | 10 | ⬆ **marreta** vira rank 3 |
| 95 | 36 | 11 | 24 | 21 | 10 | — |
| 96 | 36 | 11 | 24 | 21 | 11 | ⬆ **fim_de_linha** vira rank 3 |
| 99 | 37 | 12 | 24 | 22 | 11 | — |

### Fenda — atacante (duelista)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 3 | 4 | 1 | 2 | 1 | ⚡ abre **golpe_certeiro** |
| 5 | 3 | 4 | 1 | 3 | 1 | — |
| 10 | 5 | 5 | 2 | 3 | 2 | ★ Primeiro Corte |
| 12 | 6 | 5 | 3 | 3 | 2 | ⚡ abre **leitura_de_combate** |
| 15 | 7 | 6 | 3 | 4 | 2 | — |
| 20 | 8 | 7 | 5 | 5 | 2 | — |
| 24 | 10 | 8 | 6 | 5 | 2 | ⚡ abre **marca** |
| 25 | 10 | 8 | 6 | 6 | 2 | — |
| 30 | 12 | 9 | 7 | 6 | 3 | — |
| 35 | 14 | 10 | 8 | 7 | 3 | — |
| 40 | 15 | 11 | 10 | 8 | 3 | ⚡ abre **execucao** |
| 45 | 17 | 12 | 11 | 9 | 3 | — |
| 50 | 19 | 13 | 12 | 9 | 4 | ⚡ abre **corte_preciso** |
| 52 | 20 | 13 | 13 | 9 | 4 | ⬆ **golpe_certeiro** vira rank 2 |
| 55 | 21 | 14 | 13 | 10 | 4 | — |
| 58 | 22 | 14 | 14 | 11 | 4 | ⬆ **leitura_de_combate** vira rank 2 |
| 60 | 22 | 15 | 15 | 11 | 4 | — |
| 64 | 24 | 16 | 16 | 11 | 4 | ⬆ **marca** vira rank 2 |
| 65 | 24 | 16 | 16 | 12 | 4 | — |
| 70 | 26 | 17 | 17 | 12 | 5 | ⬆ **execucao** vira rank 2 |
| 75 | 28 | 18 | 18 | 13 | 5 | — |
| 78 | 29 | 18 | 19 | 14 | 5 | ⬆ **golpe_certeiro** vira rank 3 |
| 80 | 29 | 19 | 20 | 14 | 5 | — |
| 84 | 31 | 20 | 21 | 14 | 5 | ⬆ **leitura_de_combate** vira rank 3 |
| 85 | 31 | 20 | 21 | 15 | 5 | — |
| 90 | 33 | 21 | 22 | 15 | 6 | ⬆ **marca** vira rank 3 |
| 95 | 35 | 22 | 23 | 16 | 6 | — |
| 96 | 35 | 22 | 24 | 16 | 6 | ⬆ **execucao** vira rank 3 |
| 99 | 36 | 23 | 24 | 17 | 6 | — |

### Navalha — atacante (duelista)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 3 | 4 | 1 | 2 | 1 | ⚡ abre **fluidez** |
| 5 | 3 | 4 | 1 | 3 | 1 | — |
| 10 | 5 | 5 | 2 | 3 | 2 | ★ Sem Aviso |
| 12 | 6 | 5 | 3 | 3 | 2 | ⚡ abre **leitura_de_combate** |
| 15 | 7 | 6 | 3 | 4 | 2 | — |
| 20 | 8 | 7 | 5 | 5 | 2 | — |
| 24 | 10 | 8 | 6 | 5 | 2 | ⚡ abre **golpe_certeiro** |
| 25 | 10 | 8 | 6 | 6 | 2 | — |
| 30 | 12 | 9 | 7 | 6 | 3 | — |
| 35 | 14 | 10 | 8 | 7 | 3 | — |
| 40 | 15 | 11 | 10 | 8 | 3 | ⚡ abre **execucao** |
| 45 | 17 | 12 | 11 | 9 | 3 | — |
| 50 | 19 | 13 | 12 | 9 | 4 | ⚡ abre **danca_da_lamina** |
| 52 | 20 | 13 | 13 | 9 | 4 | ⬆ **fluidez** vira rank 2 |
| 55 | 21 | 14 | 13 | 10 | 4 | — |
| 58 | 22 | 14 | 14 | 11 | 4 | ⬆ **leitura_de_combate** vira rank 2 |
| 60 | 22 | 15 | 15 | 11 | 4 | — |
| 64 | 24 | 16 | 16 | 11 | 4 | ⬆ **golpe_certeiro** vira rank 2 |
| 65 | 24 | 16 | 16 | 12 | 4 | — |
| 70 | 26 | 17 | 17 | 12 | 5 | ⬆ **execucao** vira rank 2 |
| 75 | 28 | 18 | 18 | 13 | 5 | — |
| 78 | 29 | 18 | 19 | 14 | 5 | ⬆ **fluidez** vira rank 3 |
| 80 | 29 | 19 | 20 | 14 | 5 | — |
| 84 | 31 | 20 | 21 | 14 | 5 | ⬆ **leitura_de_combate** vira rank 3 |
| 85 | 31 | 20 | 21 | 15 | 5 | — |
| 90 | 33 | 21 | 22 | 15 | 6 | ⬆ **golpe_certeiro** vira rank 3 |
| 95 | 35 | 22 | 23 | 16 | 6 | — |
| 96 | 35 | 22 | 24 | 16 | 6 | ⬆ **execucao** vira rank 3 |
| 99 | 36 | 23 | 24 | 17 | 6 | — |

### Touro — atacante (furia)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 1 | 1 | 2 | 1 | Técnica base (class_basic) |
| 4 | 4 | 1 | 2 | 3 | 1 | ⚡ abre **sangue_fervente** |
| 5 | 5 | 1 | 2 | 3 | 1 | — |
| 10 | 6 | 2 | 3 | 4 | 2 | ★ Último de Pé |
| 12 | 7 | 2 | 4 | 4 | 2 | ⚡ abre **grito_de_guerra** |
| 15 | 8 | 2 | 5 | 5 | 2 | — |
| 20 | 9 | 2 | 6 | 7 | 3 | — |
| 24 | 11 | 2 | 7 | 8 | 3 | ⚡ abre **ignorar_a_dor** |
| 25 | 12 | 2 | 7 | 8 | 3 | — |
| 30 | 13 | 3 | 8 | 9 | 4 | — |
| 35 | 15 | 3 | 10 | 10 | 4 | — |
| 40 | 16 | 3 | 11 | 12 | 5 | ⚡ abre **ultima_investida** |
| 45 | 19 | 3 | 12 | 13 | 5 | — |
| 50 | 20 | 4 | 13 | 14 | 6 | ⚡ abre **furia_cega** |
| 52 | 21 | 4 | 14 | 14 | 6 | ⬆ **sangue_fervente** vira rank 2 |
| 55 | 22 | 4 | 15 | 15 | 6 | — |
| 58 | 23 | 4 | 15 | 16 | 7 | ⬆ **grito_de_guerra** vira rank 2 |
| 60 | 23 | 4 | 16 | 17 | 7 | — |
| 64 | 25 | 4 | 17 | 18 | 7 | ⬆ **ignorar_a_dor** vira rank 2 |
| 65 | 26 | 4 | 17 | 18 | 7 | — |
| 70 | 27 | 5 | 18 | 19 | 8 | ⬆ **ultima_investida** vira rank 2 |
| 75 | 29 | 5 | 20 | 20 | 8 | — |
| 78 | 30 | 5 | 20 | 21 | 9 | ⬆ **sangue_fervente** vira rank 3 |
| 80 | 30 | 5 | 21 | 22 | 9 | — |
| 84 | 32 | 5 | 22 | 23 | 9 | ⬆ **grito_de_guerra** vira rank 3 |
| 85 | 33 | 5 | 22 | 23 | 9 | — |
| 90 | 34 | 6 | 23 | 24 | 10 | ⬆ **ignorar_a_dor** vira rank 3 |
| 95 | 36 | 6 | 25 | 25 | 10 | — |
| 96 | 36 | 6 | 25 | 26 | 10 | ⬆ **ultima_investida** vira rank 3 |
| 99 | 37 | 6 | 26 | 26 | 11 | — |

### Sangue — atacante (furia)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 4 | 2 | 1 | 3 | 1 | ⚡ abre **grito_de_guerra** |
| 5 | 5 | 2 | 1 | 3 | 1 | — |
| 10 | 6 | 3 | 2 | 4 | 2 | ★ Tudo ou Nada |
| 12 | 7 | 3 | 3 | 4 | 2 | ⚡ abre **sangue_fervente** |
| 15 | 8 | 3 | 4 | 5 | 2 | — |
| 20 | 9 | 4 | 5 | 6 | 3 | — |
| 24 | 11 | 4 | 6 | 7 | 3 | ⚡ abre **folego_final** |
| 25 | 12 | 4 | 6 | 7 | 3 | — |
| 30 | 13 | 5 | 7 | 8 | 4 | — |
| 35 | 15 | 5 | 9 | 9 | 4 | — |
| 40 | 16 | 6 | 10 | 10 | 5 | ⚡ abre **ultima_investida** |
| 45 | 19 | 6 | 11 | 11 | 5 | — |
| 50 | 20 | 7 | 12 | 12 | 6 | ⚡ abre **instinto_de_sangue** |
| 52 | 21 | 7 | 13 | 12 | 6 | ⬆ **grito_de_guerra** vira rank 2 |
| 55 | 22 | 7 | 14 | 13 | 6 | — |
| 58 | 23 | 8 | 14 | 13 | 7 | ⬆ **sangue_fervente** vira rank 2 |
| 60 | 23 | 8 | 15 | 14 | 7 | — |
| 64 | 25 | 8 | 16 | 15 | 7 | ⬆ **folego_final** vira rank 2 |
| 65 | 26 | 8 | 16 | 15 | 7 | — |
| 70 | 27 | 9 | 17 | 16 | 8 | ⬆ **ultima_investida** vira rank 2 |
| 75 | 29 | 9 | 19 | 17 | 8 | — |
| 78 | 30 | 10 | 19 | 17 | 9 | ⬆ **grito_de_guerra** vira rank 3 |
| 80 | 30 | 10 | 20 | 18 | 9 | — |
| 84 | 32 | 10 | 21 | 19 | 9 | ⬆ **sangue_fervente** vira rank 3 |
| 85 | 33 | 10 | 21 | 19 | 9 | — |
| 90 | 34 | 11 | 22 | 20 | 10 | ⬆ **folego_final** vira rank 3 |
| 95 | 36 | 11 | 24 | 21 | 10 | — |
| 96 | 36 | 11 | 24 | 21 | 11 | ⬆ **ultima_investida** vira rank 3 |
| 99 | 37 | 12 | 24 | 22 | 11 | — |

### Mira — atacante (especialista)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 3 | 4 | 1 | 2 | 1 | ⚡ abre **precisao_absoluta** |
| 5 | 3 | 4 | 1 | 3 | 1 | — |
| 10 | 5 | 5 | 2 | 3 | 2 | ★ Cirúrgica |
| 12 | 6 | 5 | 3 | 3 | 2 | ⚡ abre **ponto_de_pressao** |
| 15 | 7 | 6 | 3 | 4 | 2 | — |
| 20 | 8 | 7 | 5 | 5 | 2 | — |
| 24 | 10 | 8 | 6 | 5 | 2 | ⚡ abre **foco_cirurgico** |
| 25 | 10 | 8 | 6 | 6 | 2 | — |
| 30 | 12 | 9 | 7 | 6 | 3 | — |
| 35 | 14 | 10 | 8 | 7 | 3 | — |
| 40 | 15 | 11 | 10 | 8 | 3 | ⚡ abre **colapso_mental** |
| 45 | 17 | 12 | 11 | 9 | 3 | — |
| 50 | 19 | 13 | 12 | 9 | 4 | ⚡ abre **tiro_certeiro** |
| 52 | 20 | 13 | 13 | 9 | 4 | ⬆ **precisao_absoluta** vira rank 2 |
| 55 | 21 | 14 | 13 | 10 | 4 | — |
| 58 | 22 | 14 | 14 | 11 | 4 | ⬆ **ponto_de_pressao** vira rank 2 |
| 60 | 22 | 15 | 15 | 11 | 4 | — |
| 64 | 24 | 16 | 16 | 11 | 4 | ⬆ **foco_cirurgico** vira rank 2 |
| 65 | 24 | 16 | 16 | 12 | 4 | — |
| 70 | 26 | 17 | 17 | 12 | 5 | ⬆ **colapso_mental** vira rank 2 |
| 75 | 28 | 18 | 18 | 13 | 5 | — |
| 78 | 29 | 18 | 19 | 14 | 5 | ⬆ **precisao_absoluta** vira rank 3 |
| 80 | 29 | 19 | 20 | 14 | 5 | — |
| 84 | 31 | 20 | 21 | 14 | 5 | ⬆ **ponto_de_pressao** vira rank 3 |
| 85 | 31 | 20 | 21 | 15 | 5 | — |
| 90 | 33 | 21 | 22 | 15 | 6 | ⬆ **foco_cirurgico** vira rank 3 |
| 95 | 35 | 22 | 23 | 16 | 6 | — |
| 96 | 35 | 22 | 24 | 16 | 6 | ⬆ **colapso_mental** vira rank 3 |
| 99 | 36 | 23 | 24 | 17 | 6 | — |

### Ponto — atacante (especialista)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 3 | 4 | 1 | 2 | 1 | ⚡ abre **ponto_de_pressao** |
| 5 | 3 | 4 | 1 | 3 | 1 | — |
| 10 | 5 | 5 | 2 | 3 | 2 | ★ Ponto Cego |
| 12 | 6 | 5 | 3 | 3 | 2 | ⚡ abre **precisao_absoluta** |
| 15 | 7 | 6 | 3 | 4 | 2 | — |
| 20 | 8 | 7 | 5 | 5 | 2 | — |
| 24 | 10 | 8 | 6 | 5 | 2 | ⚡ abre **fratura_de_ilusao** |
| 25 | 10 | 8 | 6 | 6 | 2 | — |
| 30 | 12 | 9 | 7 | 6 | 3 | — |
| 35 | 14 | 10 | 8 | 7 | 3 | — |
| 40 | 15 | 11 | 10 | 8 | 3 | ⚡ abre **colapso_mental** |
| 45 | 17 | 12 | 11 | 9 | 3 | — |
| 50 | 19 | 13 | 12 | 9 | 4 | ⚡ abre **ponto_fatal** |
| 52 | 20 | 13 | 13 | 9 | 4 | ⬆ **ponto_de_pressao** vira rank 2 |
| 55 | 21 | 14 | 13 | 10 | 4 | — |
| 58 | 22 | 14 | 14 | 11 | 4 | ⬆ **precisao_absoluta** vira rank 2 |
| 60 | 22 | 15 | 15 | 11 | 4 | — |
| 64 | 24 | 16 | 16 | 11 | 4 | ⬆ **fratura_de_ilusao** vira rank 2 |
| 65 | 24 | 16 | 16 | 12 | 4 | — |
| 70 | 26 | 17 | 17 | 12 | 5 | ⬆ **colapso_mental** vira rank 2 |
| 75 | 28 | 18 | 18 | 13 | 5 | — |
| 78 | 29 | 18 | 19 | 14 | 5 | ⬆ **ponto_de_pressao** vira rank 3 |
| 80 | 29 | 19 | 20 | 14 | 5 | — |
| 84 | 31 | 20 | 21 | 14 | 5 | ⬆ **precisao_absoluta** vira rank 3 |
| 85 | 31 | 20 | 21 | 15 | 5 | — |
| 90 | 33 | 21 | 22 | 15 | 6 | ⬆ **fratura_de_ilusao** vira rank 3 |
| 95 | 35 | 22 | 23 | 16 | 6 | — |
| 96 | 35 | 22 | 24 | 16 | 6 | ⬆ **colapso_mental** vira rank 3 |
| 99 | 36 | 23 | 24 | 17 | 6 | — |

### Cicatriz — atacante (vingador)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 1 | 1 | 2 | 1 | Técnica base (class_basic) |
| 4 | 4 | 1 | 2 | 3 | 1 | ⚡ abre **casca_dura** |
| 5 | 5 | 1 | 2 | 3 | 1 | — |
| 10 | 6 | 2 | 3 | 4 | 2 | ★ Dívida Antiga |
| 12 | 7 | 2 | 4 | 4 | 2 | ⚡ abre **absorver_impacto** |
| 15 | 8 | 2 | 5 | 5 | 2 | — |
| 20 | 9 | 2 | 6 | 7 | 3 | — |
| 24 | 11 | 2 | 7 | 8 | 3 | ⚡ abre **postura_firme** |
| 25 | 12 | 2 | 7 | 8 | 3 | — |
| 30 | 13 | 3 | 8 | 9 | 4 | — |
| 35 | 15 | 3 | 10 | 10 | 4 | — |
| 40 | 16 | 3 | 11 | 12 | 5 | ⚡ abre **retribuicao_final** |
| 45 | 19 | 3 | 12 | 13 | 5 | — |
| 50 | 20 | 4 | 13 | 14 | 6 | ⚡ abre **marca_de_guerra** |
| 52 | 21 | 4 | 14 | 14 | 6 | ⬆ **casca_dura** vira rank 2 |
| 55 | 22 | 4 | 15 | 15 | 6 | — |
| 58 | 23 | 4 | 15 | 16 | 7 | ⬆ **absorver_impacto** vira rank 2 |
| 60 | 23 | 4 | 16 | 17 | 7 | — |
| 64 | 25 | 4 | 17 | 18 | 7 | ⬆ **postura_firme** vira rank 2 |
| 65 | 26 | 4 | 17 | 18 | 7 | — |
| 70 | 27 | 5 | 18 | 19 | 8 | ⬆ **retribuicao_final** vira rank 2 |
| 75 | 29 | 5 | 20 | 20 | 8 | — |
| 78 | 30 | 5 | 20 | 21 | 9 | ⬆ **casca_dura** vira rank 3 |
| 80 | 30 | 5 | 21 | 22 | 9 | — |
| 84 | 32 | 5 | 22 | 23 | 9 | ⬆ **absorver_impacto** vira rank 3 |
| 85 | 33 | 5 | 22 | 23 | 9 | — |
| 90 | 34 | 6 | 23 | 24 | 10 | ⬆ **postura_firme** vira rank 3 |
| 95 | 36 | 6 | 25 | 25 | 10 | — |
| 96 | 36 | 6 | 25 | 26 | 10 | ⬆ **retribuicao_final** vira rank 3 |
| 99 | 37 | 6 | 26 | 26 | 11 | — |

### Troco — atacante (vingador)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 2 | 0 | 2 | 1 | Técnica base (class_basic) |
| 4 | 4 | 2 | 1 | 3 | 1 | ⚡ abre **contragolpe** |
| 5 | 5 | 2 | 1 | 3 | 1 | — |
| 10 | 6 | 3 | 2 | 4 | 2 | ★ Cobrança |
| 12 | 7 | 3 | 3 | 4 | 2 | ⚡ abre **casca_dura** |
| 15 | 8 | 3 | 4 | 5 | 2 | — |
| 20 | 9 | 4 | 5 | 6 | 3 | — |
| 24 | 11 | 4 | 6 | 7 | 3 | ⚡ abre **absorver_impacto** |
| 25 | 12 | 4 | 6 | 7 | 3 | — |
| 30 | 13 | 5 | 7 | 8 | 4 | — |
| 35 | 15 | 5 | 9 | 9 | 4 | — |
| 40 | 16 | 6 | 10 | 10 | 5 | ⚡ abre **retribuicao_final** |
| 45 | 19 | 6 | 11 | 11 | 5 | — |
| 50 | 20 | 7 | 12 | 12 | 6 | ⚡ abre **juro_composto** |
| 52 | 21 | 7 | 13 | 12 | 6 | ⬆ **contragolpe** vira rank 2 |
| 55 | 22 | 7 | 14 | 13 | 6 | — |
| 58 | 23 | 8 | 14 | 13 | 7 | ⬆ **casca_dura** vira rank 2 |
| 60 | 23 | 8 | 15 | 14 | 7 | — |
| 64 | 25 | 8 | 16 | 15 | 7 | ⬆ **absorver_impacto** vira rank 2 |
| 65 | 26 | 8 | 16 | 15 | 7 | — |
| 70 | 27 | 9 | 17 | 16 | 8 | ⬆ **retribuicao_final** vira rank 2 |
| 75 | 29 | 9 | 19 | 17 | 8 | — |
| 78 | 30 | 10 | 19 | 17 | 9 | ⬆ **contragolpe** vira rank 3 |
| 80 | 30 | 10 | 20 | 18 | 9 | — |
| 84 | 32 | 10 | 21 | 19 | 9 | ⬆ **casca_dura** vira rank 3 |
| 85 | 33 | 10 | 21 | 19 | 9 | — |
| 90 | 34 | 11 | 22 | 20 | 10 | ⬆ **absorver_impacto** vira rank 3 |
| 95 | 36 | 11 | 24 | 21 | 10 | — |
| 96 | 36 | 11 | 24 | 21 | 11 | ⬆ **retribuicao_final** vira rank 3 |
| 99 | 37 | 12 | 24 | 22 | 11 | — |

### Muro — defensor (muralha)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 3 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 1 | 4 | 3 | 1 | ⚡ abre **pele_de_aco** |
| 5 | 1 | 1 | 4 | 3 | 2 | — |
| 10 | 2 | 2 | 6 | 4 | 2 | ★ Fortaleza |
| 12 | 3 | 2 | 7 | 4 | 2 | ⚡ abre **postura_defensiva** |
| 15 | 3 | 2 | 8 | 5 | 3 | — |
| 20 | 5 | 2 | 9 | 6 | 4 | — |
| 24 | 6 | 2 | 11 | 7 | 4 | ⚡ abre **bastiao** |
| 25 | 6 | 2 | 11 | 7 | 5 | — |
| 30 | 7 | 3 | 13 | 8 | 5 | — |
| 35 | 8 | 3 | 15 | 9 | 6 | — |
| 40 | 10 | 3 | 16 | 10 | 7 | ⚡ abre **muralha_impenetravel** |
| 45 | 11 | 3 | 18 | 11 | 8 | — |
| 50 | 12 | 4 | 20 | 12 | 8 | ⚡ abre **linha_de_frente** |
| 52 | 13 | 4 | 21 | 12 | 8 | ⬆ **pele_de_aco** vira rank 2 |
| 55 | 13 | 4 | 22 | 13 | 9 | — |
| 58 | 14 | 4 | 23 | 13 | 10 | ⬆ **postura_defensiva** vira rank 2 |
| 60 | 15 | 4 | 23 | 14 | 10 | — |
| 64 | 16 | 4 | 25 | 15 | 10 | ⬆ **bastiao** vira rank 2 |
| 65 | 16 | 4 | 25 | 15 | 11 | — |
| 70 | 17 | 5 | 27 | 16 | 11 | ⬆ **muralha_impenetravel** vira rank 2 |
| 75 | 18 | 5 | 29 | 17 | 12 | — |
| 78 | 19 | 5 | 30 | 17 | 13 | ⬆ **pele_de_aco** vira rank 3 |
| 80 | 20 | 5 | 30 | 18 | 13 | — |
| 84 | 21 | 5 | 32 | 19 | 13 | ⬆ **postura_defensiva** vira rank 3 |
| 85 | 21 | 5 | 32 | 19 | 14 | — |
| 90 | 22 | 6 | 34 | 20 | 14 | ⬆ **bastiao** vira rank 3 |
| 95 | 23 | 6 | 36 | 21 | 15 | — |
| 96 | 24 | 6 | 36 | 21 | 15 | ⬆ **muralha_impenetravel** vira rank 3 |
| 99 | 24 | 6 | 37 | 22 | 16 | — |

### Concreto — defensor (muralha)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 3 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 1 | 4 | 3 | 1 | ⚡ abre **casco_robusto** |
| 5 | 1 | 1 | 4 | 3 | 2 | — |
| 10 | 2 | 2 | 6 | 4 | 2 | ★ Bloco Vivo |
| 12 | 3 | 2 | 7 | 4 | 2 | ⚡ abre **postura_defensiva** |
| 15 | 3 | 2 | 8 | 5 | 3 | — |
| 20 | 5 | 2 | 9 | 6 | 4 | — |
| 24 | 6 | 2 | 11 | 7 | 4 | ⚡ abre **pele_de_aco** |
| 25 | 6 | 2 | 11 | 7 | 5 | — |
| 30 | 7 | 3 | 13 | 8 | 5 | — |
| 35 | 8 | 3 | 15 | 9 | 6 | — |
| 40 | 10 | 3 | 16 | 10 | 7 | ⚡ abre **muralha_impenetravel** |
| 45 | 11 | 3 | 18 | 11 | 8 | — |
| 50 | 12 | 4 | 20 | 12 | 8 | ⚡ abre **fundacao** |
| 52 | 13 | 4 | 21 | 12 | 8 | ⬆ **casco_robusto** vira rank 2 |
| 55 | 13 | 4 | 22 | 13 | 9 | — |
| 58 | 14 | 4 | 23 | 13 | 10 | ⬆ **postura_defensiva** vira rank 2 |
| 60 | 15 | 4 | 23 | 14 | 10 | — |
| 64 | 16 | 4 | 25 | 15 | 10 | ⬆ **pele_de_aco** vira rank 2 |
| 65 | 16 | 4 | 25 | 15 | 11 | — |
| 70 | 17 | 5 | 27 | 16 | 11 | ⬆ **muralha_impenetravel** vira rank 2 |
| 75 | 18 | 5 | 29 | 17 | 12 | — |
| 78 | 19 | 5 | 30 | 17 | 13 | ⬆ **casco_robusto** vira rank 3 |
| 80 | 20 | 5 | 30 | 18 | 13 | — |
| 84 | 21 | 5 | 32 | 19 | 13 | ⬆ **postura_defensiva** vira rank 3 |
| 85 | 21 | 5 | 32 | 19 | 14 | — |
| 90 | 22 | 6 | 34 | 20 | 14 | ⬆ **pele_de_aco** vira rank 3 |
| 95 | 23 | 6 | 36 | 21 | 15 | — |
| 96 | 24 | 6 | 36 | 21 | 15 | ⬆ **muralha_impenetravel** vira rank 3 |
| 99 | 24 | 6 | 37 | 22 | 16 | — |

### Guarda — defensor (guardiao)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 2 | 3 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 2 | 4 | 3 | 1 | ⚡ abre **escudo_humano** |
| 5 | 1 | 2 | 4 | 3 | 2 | — |
| 10 | 2 | 3 | 6 | 4 | 2 | ★ Linha de Frente |
| 12 | 3 | 3 | 7 | 4 | 2 | ⚡ abre **guarda_compartilhada** |
| 15 | 4 | 3 | 8 | 4 | 3 | — |
| 20 | 5 | 4 | 9 | 5 | 4 | — |
| 24 | 6 | 4 | 11 | 6 | 4 | ⚡ abre **cobertura** |
| 25 | 6 | 4 | 11 | 6 | 5 | — |
| 30 | 7 | 5 | 13 | 7 | 5 | — |
| 35 | 9 | 5 | 15 | 7 | 6 | — |
| 40 | 10 | 6 | 16 | 8 | 7 | ⚡ abre **interceptar** |
| 45 | 11 | 6 | 18 | 9 | 8 | — |
| 50 | 12 | 7 | 20 | 10 | 8 | ⚡ abre **escudo_vivo** |
| 52 | 13 | 7 | 21 | 10 | 8 | ⬆ **escudo_humano** vira rank 2 |
| 55 | 14 | 7 | 22 | 10 | 9 | — |
| 58 | 14 | 8 | 23 | 11 | 9 | ⬆ **guarda_compartilhada** vira rank 2 |
| 60 | 15 | 8 | 23 | 11 | 10 | — |
| 64 | 16 | 8 | 25 | 12 | 10 | ⬆ **cobertura** vira rank 2 |
| 65 | 16 | 8 | 25 | 12 | 11 | — |
| 70 | 17 | 9 | 27 | 13 | 11 | ⬆ **interceptar** vira rank 2 |
| 75 | 19 | 9 | 29 | 13 | 12 | — |
| 78 | 19 | 10 | 30 | 14 | 12 | ⬆ **escudo_humano** vira rank 3 |
| 80 | 20 | 10 | 30 | 14 | 13 | — |
| 84 | 21 | 10 | 32 | 15 | 13 | ⬆ **guarda_compartilhada** vira rank 3 |
| 85 | 21 | 10 | 32 | 15 | 14 | — |
| 90 | 22 | 11 | 34 | 16 | 14 | ⬆ **cobertura** vira rank 3 |
| 95 | 24 | 11 | 36 | 16 | 15 | — |
| 96 | 24 | 12 | 36 | 16 | 15 | ⬆ **interceptar** vira rank 3 |
| 99 | 24 | 12 | 37 | 17 | 16 | — |

### Ombro — defensor (guardiao)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 3 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 1 | 4 | 3 | 1 | ⚡ abre **guarda_compartilhada** |
| 5 | 1 | 1 | 4 | 3 | 2 | — |
| 10 | 2 | 2 | 6 | 4 | 2 | ★ Ninguém Passa |
| 12 | 3 | 2 | 7 | 4 | 2 | ⚡ abre **escudo_humano** |
| 15 | 3 | 2 | 8 | 5 | 3 | — |
| 20 | 5 | 2 | 9 | 6 | 4 | — |
| 24 | 6 | 2 | 11 | 7 | 4 | ⚡ abre **interceptar** |
| 25 | 6 | 2 | 11 | 7 | 5 | — |
| 30 | 7 | 3 | 13 | 8 | 5 | — |
| 35 | 8 | 3 | 15 | 9 | 6 | — |
| 40 | 10 | 3 | 16 | 10 | 7 | ⚡ abre **ultimo_bastiao** |
| 45 | 11 | 3 | 18 | 11 | 8 | — |
| 50 | 12 | 4 | 20 | 12 | 8 | ⚡ abre **no_meu_ombro** |
| 52 | 13 | 4 | 21 | 12 | 8 | ⬆ **guarda_compartilhada** vira rank 2 |
| 55 | 13 | 4 | 22 | 13 | 9 | — |
| 58 | 14 | 4 | 23 | 13 | 10 | ⬆ **escudo_humano** vira rank 2 |
| 60 | 15 | 4 | 23 | 14 | 10 | — |
| 64 | 16 | 4 | 25 | 15 | 10 | ⬆ **interceptar** vira rank 2 |
| 65 | 16 | 4 | 25 | 15 | 11 | — |
| 70 | 17 | 5 | 27 | 16 | 11 | ⬆ **ultimo_bastiao** vira rank 2 |
| 75 | 18 | 5 | 29 | 17 | 12 | — |
| 78 | 19 | 5 | 30 | 17 | 13 | ⬆ **guarda_compartilhada** vira rank 3 |
| 80 | 20 | 5 | 30 | 18 | 13 | — |
| 84 | 21 | 5 | 32 | 19 | 13 | ⬆ **escudo_humano** vira rank 3 |
| 85 | 21 | 5 | 32 | 19 | 14 | — |
| 90 | 22 | 6 | 34 | 20 | 14 | ⬆ **interceptar** vira rank 3 |
| 95 | 23 | 6 | 36 | 21 | 15 | — |
| 96 | 24 | 6 | 36 | 21 | 15 | ⬆ **ultimo_bastiao** vira rank 3 |
| 99 | 24 | 6 | 37 | 22 | 16 | — |

### Boca — defensor (provocador)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 2 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 4 | 3 | 2 | 1 | ⚡ abre **voz_de_comando** |
| 5 | 1 | 4 | 4 | 2 | 1 | — |
| 10 | 2 | 5 | 5 | 3 | 2 | ★ Olha Pra Mim |
| 12 | 3 | 5 | 6 | 3 | 2 | ⚡ abre **provocacao** |
| 15 | 4 | 6 | 7 | 3 | 2 | — |
| 20 | 5 | 7 | 8 | 4 | 3 | — |
| 24 | 6 | 8 | 10 | 4 | 3 | ⚡ abre **casca_de_rua** |
| 25 | 6 | 8 | 11 | 4 | 3 | — |
| 30 | 7 | 9 | 12 | 5 | 4 | — |
| 35 | 9 | 10 | 14 | 5 | 4 | — |
| 40 | 10 | 11 | 15 | 6 | 5 | ⚡ abre **centro_das_atencoes** |
| 45 | 11 | 12 | 18 | 6 | 5 | — |
| 50 | 12 | 13 | 19 | 7 | 6 | ⚡ abre **grito_de_rua** |
| 52 | 13 | 13 | 20 | 7 | 6 | ⬆ **voz_de_comando** vira rank 2 |
| 55 | 14 | 14 | 21 | 7 | 6 | — |
| 58 | 14 | 14 | 22 | 8 | 7 | ⬆ **provocacao** vira rank 2 |
| 60 | 15 | 15 | 22 | 8 | 7 | — |
| 64 | 16 | 16 | 24 | 8 | 7 | ⬆ **casca_de_rua** vira rank 2 |
| 65 | 16 | 16 | 25 | 8 | 7 | — |
| 70 | 17 | 17 | 26 | 9 | 8 | ⬆ **centro_das_atencoes** vira rank 2 |
| 75 | 19 | 18 | 28 | 9 | 8 | — |
| 78 | 19 | 18 | 29 | 10 | 9 | ⬆ **voz_de_comando** vira rank 3 |
| 80 | 20 | 19 | 29 | 10 | 9 | — |
| 84 | 21 | 20 | 31 | 10 | 9 | ⬆ **provocacao** vira rank 3 |
| 85 | 21 | 20 | 32 | 10 | 9 | — |
| 90 | 22 | 21 | 33 | 11 | 10 | ⬆ **casca_de_rua** vira rank 3 |
| 95 | 24 | 22 | 35 | 11 | 10 | — |
| 96 | 24 | 22 | 35 | 12 | 10 | ⬆ **centro_das_atencoes** vira rank 3 |
| 99 | 24 | 23 | 36 | 12 | 11 | — |

### Isca — defensor (provocador)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 2 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 4 | 3 | 2 | 1 | ⚡ abre **marcar_alvo** |
| 5 | 1 | 4 | 4 | 2 | 1 | — |
| 10 | 2 | 5 | 5 | 3 | 2 | ★ Alvo Perfeito |
| 12 | 3 | 5 | 6 | 3 | 2 | ⚡ abre **provocacao** |
| 15 | 4 | 6 | 7 | 3 | 2 | — |
| 20 | 5 | 7 | 8 | 4 | 3 | — |
| 24 | 6 | 8 | 10 | 4 | 3 | ⚡ abre **voz_de_comando** |
| 25 | 6 | 8 | 11 | 4 | 3 | — |
| 30 | 7 | 9 | 12 | 5 | 4 | — |
| 35 | 9 | 10 | 14 | 5 | 4 | — |
| 40 | 10 | 11 | 15 | 6 | 5 | ⚡ abre **centro_das_atencoes** |
| 45 | 11 | 12 | 18 | 6 | 5 | — |
| 50 | 12 | 13 | 19 | 7 | 6 | ⚡ abre **alvo_facil** |
| 52 | 13 | 13 | 20 | 7 | 6 | ⬆ **marcar_alvo** vira rank 2 |
| 55 | 14 | 14 | 21 | 7 | 6 | — |
| 58 | 14 | 14 | 22 | 8 | 7 | ⬆ **provocacao** vira rank 2 |
| 60 | 15 | 15 | 22 | 8 | 7 | — |
| 64 | 16 | 16 | 24 | 8 | 7 | ⬆ **voz_de_comando** vira rank 2 |
| 65 | 16 | 16 | 25 | 8 | 7 | — |
| 70 | 17 | 17 | 26 | 9 | 8 | ⬆ **centro_das_atencoes** vira rank 2 |
| 75 | 19 | 18 | 28 | 9 | 8 | — |
| 78 | 19 | 18 | 29 | 10 | 9 | ⬆ **marcar_alvo** vira rank 3 |
| 80 | 20 | 19 | 29 | 10 | 9 | — |
| 84 | 21 | 20 | 31 | 10 | 9 | ⬆ **provocacao** vira rank 3 |
| 85 | 21 | 20 | 32 | 10 | 9 | — |
| 90 | 22 | 21 | 33 | 11 | 10 | ⬆ **voz_de_comando** vira rank 3 |
| 95 | 24 | 22 | 35 | 11 | 10 | — |
| 96 | 24 | 22 | 35 | 12 | 10 | ⬆ **centro_das_atencoes** vira rank 3 |
| 99 | 24 | 23 | 36 | 12 | 11 | — |

### Catraca — defensor (reativo)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 2 | 3 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 2 | 4 | 3 | 1 | ⚡ abre **reflexo_defensivo** |
| 5 | 1 | 2 | 4 | 3 | 2 | — |
| 10 | 2 | 3 | 6 | 4 | 2 | ★ Bateu, Voltou |
| 12 | 3 | 3 | 7 | 4 | 2 | ⚡ abre **aparar** |
| 15 | 4 | 3 | 8 | 4 | 3 | — |
| 20 | 5 | 4 | 9 | 5 | 4 | — |
| 24 | 6 | 4 | 11 | 6 | 4 | ⚡ abre **contragolpe_defensivo** |
| 25 | 6 | 4 | 11 | 6 | 5 | — |
| 30 | 7 | 5 | 13 | 7 | 5 | — |
| 35 | 9 | 5 | 15 | 7 | 6 | — |
| 40 | 10 | 6 | 16 | 8 | 7 | ⚡ abre **retorno_de_impacto** |
| 45 | 11 | 6 | 18 | 9 | 8 | — |
| 50 | 12 | 7 | 20 | 10 | 8 | ⚡ abre **giro_de_catraca** |
| 52 | 13 | 7 | 21 | 10 | 8 | ⬆ **reflexo_defensivo** vira rank 2 |
| 55 | 14 | 7 | 22 | 10 | 9 | — |
| 58 | 14 | 8 | 23 | 11 | 9 | ⬆ **aparar** vira rank 2 |
| 60 | 15 | 8 | 23 | 11 | 10 | — |
| 64 | 16 | 8 | 25 | 12 | 10 | ⬆ **contragolpe_defensivo** vira rank 2 |
| 65 | 16 | 8 | 25 | 12 | 11 | — |
| 70 | 17 | 9 | 27 | 13 | 11 | ⬆ **retorno_de_impacto** vira rank 2 |
| 75 | 19 | 9 | 29 | 13 | 12 | — |
| 78 | 19 | 10 | 30 | 14 | 12 | ⬆ **reflexo_defensivo** vira rank 3 |
| 80 | 20 | 10 | 30 | 14 | 13 | — |
| 84 | 21 | 10 | 32 | 15 | 13 | ⬆ **aparar** vira rank 3 |
| 85 | 21 | 10 | 32 | 15 | 14 | — |
| 90 | 22 | 11 | 34 | 16 | 14 | ⬆ **contragolpe_defensivo** vira rank 3 |
| 95 | 24 | 11 | 36 | 16 | 15 | — |
| 96 | 24 | 12 | 36 | 16 | 15 | ⬆ **retorno_de_impacto** vira rank 3 |
| 99 | 24 | 12 | 37 | 17 | 16 | — |

### Rebote — defensor (reativo)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 2 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 4 | 3 | 2 | 1 | ⚡ abre **aparar** |
| 5 | 1 | 4 | 4 | 2 | 1 | — |
| 10 | 2 | 5 | 5 | 3 | 2 | ★ Volta em Dobro |
| 12 | 3 | 5 | 6 | 3 | 2 | ⚡ abre **reflexo_defensivo** |
| 15 | 4 | 6 | 7 | 3 | 2 | — |
| 20 | 5 | 7 | 8 | 4 | 3 | — |
| 24 | 6 | 8 | 10 | 4 | 3 | ⚡ abre **resposta_automatica** |
| 25 | 6 | 8 | 11 | 4 | 3 | — |
| 30 | 7 | 9 | 12 | 5 | 4 | — |
| 35 | 9 | 10 | 14 | 5 | 4 | — |
| 40 | 10 | 11 | 15 | 6 | 5 | ⚡ abre **retorno_de_impacto** |
| 45 | 11 | 12 | 18 | 6 | 5 | — |
| 50 | 12 | 13 | 19 | 7 | 6 | ⚡ abre **efeito_bumerangue** |
| 52 | 13 | 13 | 20 | 7 | 6 | ⬆ **aparar** vira rank 2 |
| 55 | 14 | 14 | 21 | 7 | 6 | — |
| 58 | 14 | 14 | 22 | 8 | 7 | ⬆ **reflexo_defensivo** vira rank 2 |
| 60 | 15 | 15 | 22 | 8 | 7 | — |
| 64 | 16 | 16 | 24 | 8 | 7 | ⬆ **resposta_automatica** vira rank 2 |
| 65 | 16 | 16 | 25 | 8 | 7 | — |
| 70 | 17 | 17 | 26 | 9 | 8 | ⬆ **retorno_de_impacto** vira rank 2 |
| 75 | 19 | 18 | 28 | 9 | 8 | — |
| 78 | 19 | 18 | 29 | 10 | 9 | ⬆ **aparar** vira rank 3 |
| 80 | 20 | 19 | 29 | 10 | 9 | — |
| 84 | 21 | 20 | 31 | 10 | 9 | ⬆ **reflexo_defensivo** vira rank 3 |
| 85 | 21 | 20 | 32 | 10 | 9 | — |
| 90 | 22 | 21 | 33 | 11 | 10 | ⬆ **resposta_automatica** vira rank 3 |
| 95 | 24 | 22 | 35 | 11 | 10 | — |
| 96 | 24 | 22 | 35 | 12 | 10 | ⬆ **retorno_de_impacto** vira rank 3 |
| 99 | 24 | 23 | 36 | 12 | 11 | — |

### Ferro — defensor (resiliente)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 3 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 1 | 4 | 3 | 1 | ⚡ abre **carne_dura** |
| 5 | 1 | 1 | 4 | 3 | 2 | — |
| 10 | 2 | 2 | 6 | 4 | 2 | ★ Não Cai |
| 12 | 3 | 2 | 7 | 4 | 2 | ⚡ abre **firme_no_chao** |
| 15 | 3 | 2 | 8 | 5 | 3 | — |
| 20 | 5 | 2 | 9 | 6 | 4 | — |
| 24 | 6 | 2 | 11 | 7 | 4 | ⚡ abre **segunda_respiracao** |
| 25 | 6 | 2 | 11 | 7 | 5 | — |
| 30 | 7 | 3 | 13 | 8 | 5 | — |
| 35 | 8 | 3 | 15 | 9 | 6 | — |
| 40 | 10 | 3 | 16 | 10 | 7 | ⚡ abre **inquebravel** |
| 45 | 11 | 3 | 18 | 11 | 8 | — |
| 50 | 12 | 4 | 20 | 12 | 8 | ⚡ abre **pele_de_ferro** |
| 52 | 13 | 4 | 21 | 12 | 8 | ⬆ **carne_dura** vira rank 2 |
| 55 | 13 | 4 | 22 | 13 | 9 | — |
| 58 | 14 | 4 | 23 | 13 | 10 | ⬆ **firme_no_chao** vira rank 2 |
| 60 | 15 | 4 | 23 | 14 | 10 | — |
| 64 | 16 | 4 | 25 | 15 | 10 | ⬆ **segunda_respiracao** vira rank 2 |
| 65 | 16 | 4 | 25 | 15 | 11 | — |
| 70 | 17 | 5 | 27 | 16 | 11 | ⬆ **inquebravel** vira rank 2 |
| 75 | 18 | 5 | 29 | 17 | 12 | — |
| 78 | 19 | 5 | 30 | 17 | 13 | ⬆ **carne_dura** vira rank 3 |
| 80 | 20 | 5 | 30 | 18 | 13 | — |
| 84 | 21 | 5 | 32 | 19 | 13 | ⬆ **firme_no_chao** vira rank 3 |
| 85 | 21 | 5 | 32 | 19 | 14 | — |
| 90 | 22 | 6 | 34 | 20 | 14 | ⬆ **segunda_respiracao** vira rank 3 |
| 95 | 23 | 6 | 36 | 21 | 15 | — |
| 96 | 24 | 6 | 36 | 21 | 15 | ⬆ **inquebravel** vira rank 3 |
| 99 | 24 | 6 | 37 | 22 | 16 | — |

### Osso — defensor (resiliente)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 3 | 2 | 1 | Técnica base (class_basic) |
| 4 | 1 | 1 | 4 | 3 | 1 | ⚡ abre **firme_no_chao** |
| 5 | 1 | 1 | 4 | 3 | 2 | — |
| 10 | 2 | 2 | 6 | 4 | 2 | ★ Ainda de Pé |
| 12 | 3 | 2 | 7 | 4 | 2 | ⚡ abre **carne_dura** |
| 15 | 3 | 2 | 8 | 5 | 3 | — |
| 20 | 5 | 2 | 9 | 6 | 4 | — |
| 24 | 6 | 2 | 11 | 7 | 4 | ⚡ abre **recusar_queda** |
| 25 | 6 | 2 | 11 | 7 | 5 | — |
| 30 | 7 | 3 | 13 | 8 | 5 | — |
| 35 | 8 | 3 | 15 | 9 | 6 | — |
| 40 | 10 | 3 | 16 | 10 | 7 | ⚡ abre **inquebravel** |
| 45 | 11 | 3 | 18 | 11 | 8 | — |
| 50 | 12 | 4 | 20 | 12 | 8 | ⚡ abre **osso_duro** |
| 52 | 13 | 4 | 21 | 12 | 8 | ⬆ **firme_no_chao** vira rank 2 |
| 55 | 13 | 4 | 22 | 13 | 9 | — |
| 58 | 14 | 4 | 23 | 13 | 10 | ⬆ **carne_dura** vira rank 2 |
| 60 | 15 | 4 | 23 | 14 | 10 | — |
| 64 | 16 | 4 | 25 | 15 | 10 | ⬆ **recusar_queda** vira rank 2 |
| 65 | 16 | 4 | 25 | 15 | 11 | — |
| 70 | 17 | 5 | 27 | 16 | 11 | ⬆ **inquebravel** vira rank 2 |
| 75 | 18 | 5 | 29 | 17 | 12 | — |
| 78 | 19 | 5 | 30 | 17 | 13 | ⬆ **firme_no_chao** vira rank 3 |
| 80 | 20 | 5 | 30 | 18 | 13 | — |
| 84 | 21 | 5 | 32 | 19 | 13 | ⬆ **carne_dura** vira rank 3 |
| 85 | 21 | 5 | 32 | 19 | 14 | — |
| 90 | 22 | 6 | 34 | 20 | 14 | ⬆ **recusar_queda** vira rank 3 |
| 95 | 23 | 6 | 36 | 21 | 15 | — |
| 96 | 24 | 6 | 36 | 21 | 15 | ⬆ **inquebravel** vira rank 3 |
| 99 | 24 | 6 | 37 | 22 | 16 | — |

### Brasa — mistico (igneo)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 2 | 2 | 2 | 3 | ⚡ abre **bola_de_fogo** |
| 5 | 2 | 2 | 2 | 3 | 3 | — |
| 10 | 3 | 3 | 4 | 3 | 4 | ★ Incêndio |
| 12 | 4 | 3 | 4 | 4 | 4 | ⚡ abre **brasa_viva** |
| 15 | 5 | 3 | 5 | 4 | 5 | — |
| 20 | 6 | 4 | 6 | 5 | 6 | — |
| 24 | 7 | 4 | 8 | 5 | 7 | ⚡ abre **explosao_termica** |
| 25 | 7 | 4 | 8 | 6 | 7 | — |
| 30 | 8 | 5 | 10 | 6 | 8 | — |
| 35 | 10 | 5 | 11 | 7 | 9 | — |
| 40 | 11 | 6 | 12 | 8 | 10 | ⚡ abre **inferno_de_rua** |
| 45 | 12 | 6 | 14 | 9 | 11 | — |
| 50 | 13 | 7 | 16 | 9 | 12 | ⚡ abre **chama_eterna** |
| 52 | 14 | 7 | 16 | 10 | 12 | ⬆ **bola_de_fogo** vira rank 2 |
| 55 | 15 | 7 | 17 | 10 | 13 | — |
| 58 | 15 | 8 | 18 | 11 | 13 | ⬆ **brasa_viva** vira rank 2 |
| 60 | 16 | 8 | 18 | 11 | 14 | — |
| 64 | 17 | 8 | 20 | 11 | 15 | ⬆ **explosao_termica** vira rank 2 |
| 65 | 17 | 8 | 20 | 12 | 15 | — |
| 70 | 18 | 9 | 22 | 12 | 16 | ⬆ **inferno_de_rua** vira rank 2 |
| 75 | 20 | 9 | 23 | 13 | 17 | — |
| 78 | 20 | 10 | 24 | 14 | 17 | ⬆ **bola_de_fogo** vira rank 3 |
| 80 | 21 | 10 | 24 | 14 | 18 | — |
| 84 | 22 | 10 | 26 | 14 | 19 | ⬆ **brasa_viva** vira rank 3 |
| 85 | 22 | 10 | 26 | 15 | 19 | — |
| 90 | 23 | 11 | 28 | 15 | 20 | ⬆ **explosao_termica** vira rank 3 |
| 95 | 25 | 11 | 29 | 16 | 21 | — |
| 96 | 25 | 11 | 30 | 16 | 21 | ⬆ **inferno_de_rua** vira rank 3 |
| 99 | 25 | 12 | 30 | 17 | 22 | — |

### Cinza — mistico (igneo)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 2 | 2 | 2 | 3 | ⚡ abre **brasa_viva** |
| 5 | 2 | 2 | 2 | 3 | 3 | — |
| 10 | 3 | 3 | 4 | 3 | 4 | ★ Depois do Fogo |
| 12 | 4 | 3 | 4 | 4 | 4 | ⚡ abre **combustao** |
| 15 | 5 | 3 | 5 | 4 | 5 | — |
| 20 | 6 | 4 | 6 | 5 | 6 | — |
| 24 | 7 | 4 | 8 | 5 | 7 | ⚡ abre **bola_de_fogo** |
| 25 | 7 | 4 | 8 | 6 | 7 | — |
| 30 | 8 | 5 | 10 | 6 | 8 | — |
| 35 | 10 | 5 | 11 | 7 | 9 | — |
| 40 | 11 | 6 | 12 | 8 | 10 | ⚡ abre **inferno_de_rua** |
| 45 | 12 | 6 | 14 | 9 | 11 | — |
| 50 | 13 | 7 | 16 | 9 | 12 | ⚡ abre **cinzas_ao_vento** |
| 52 | 14 | 7 | 16 | 10 | 12 | ⬆ **brasa_viva** vira rank 2 |
| 55 | 15 | 7 | 17 | 10 | 13 | — |
| 58 | 15 | 8 | 18 | 11 | 13 | ⬆ **combustao** vira rank 2 |
| 60 | 16 | 8 | 18 | 11 | 14 | — |
| 64 | 17 | 8 | 20 | 11 | 15 | ⬆ **bola_de_fogo** vira rank 2 |
| 65 | 17 | 8 | 20 | 12 | 15 | — |
| 70 | 18 | 9 | 22 | 12 | 16 | ⬆ **inferno_de_rua** vira rank 2 |
| 75 | 20 | 9 | 23 | 13 | 17 | — |
| 78 | 20 | 10 | 24 | 14 | 17 | ⬆ **brasa_viva** vira rank 3 |
| 80 | 21 | 10 | 24 | 14 | 18 | — |
| 84 | 22 | 10 | 26 | 14 | 19 | ⬆ **combustao** vira rank 3 |
| 85 | 22 | 10 | 26 | 15 | 19 | — |
| 90 | 23 | 11 | 28 | 15 | 20 | ⬆ **bola_de_fogo** vira rank 3 |
| 95 | 25 | 11 | 29 | 16 | 21 | — |
| 96 | 25 | 11 | 30 | 16 | 21 | ⬆ **inferno_de_rua** vira rank 3 |
| 99 | 25 | 12 | 30 | 17 | 22 | — |

### Maré — mistico (aquatico)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2 | 3 | Técnica base (class_basic) |
| 4 | 2 | 1 | 2 | 3 | 3 | ⚡ abre **correnteza** |
| 5 | 2 | 1 | 2 | 3 | 4 | — |
| 10 | 3 | 1 | 4 | 4 | 5 | ★ Maré Cheia |
| 12 | 4 | 2 | 4 | 4 | 5 | ⚡ abre **neblina** |
| 15 | 4 | 2 | 5 | 5 | 6 | — |
| 20 | 6 | 2 | 6 | 6 | 7 | — |
| 24 | 7 | 2 | 8 | 7 | 7 | ⚡ abre **fluxo_restaurador** |
| 25 | 7 | 2 | 8 | 7 | 8 | — |
| 30 | 8 | 2 | 10 | 8 | 9 | — |
| 35 | 9 | 3 | 11 | 9 | 10 | — |
| 40 | 11 | 3 | 12 | 10 | 11 | ⚡ abre **mare_alta** |
| 45 | 12 | 3 | 14 | 11 | 12 | — |
| 50 | 13 | 3 | 16 | 12 | 13 | ⚡ abre **onda_de_choque** |
| 52 | 14 | 4 | 16 | 12 | 13 | ⬆ **correnteza** vira rank 2 |
| 55 | 14 | 4 | 17 | 13 | 14 | — |
| 58 | 15 | 4 | 18 | 14 | 14 | ⬆ **neblina** vira rank 2 |
| 60 | 16 | 4 | 18 | 14 | 15 | — |
| 64 | 17 | 4 | 20 | 15 | 15 | ⬆ **fluxo_restaurador** vira rank 2 |
| 65 | 17 | 4 | 20 | 15 | 16 | — |
| 70 | 18 | 4 | 22 | 16 | 17 | ⬆ **mare_alta** vira rank 2 |
| 75 | 19 | 5 | 23 | 17 | 18 | — |
| 78 | 20 | 5 | 24 | 18 | 18 | ⬆ **correnteza** vira rank 3 |
| 80 | 21 | 5 | 24 | 18 | 19 | — |
| 84 | 22 | 5 | 26 | 19 | 19 | ⬆ **neblina** vira rank 3 |
| 85 | 22 | 5 | 26 | 19 | 20 | — |
| 90 | 23 | 5 | 28 | 20 | 21 | ⬆ **fluxo_restaurador** vira rank 3 |
| 95 | 24 | 6 | 29 | 21 | 22 | — |
| 96 | 25 | 6 | 29 | 21 | 22 | ⬆ **mare_alta** vira rank 3 |
| 99 | 25 | 6 | 30 | 22 | 23 | — |

### Chuva — mistico (aquatico)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 0 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 4 | 1 | 2 | 2 | ⚡ abre **jato_pressurizado** |
| 5 | 2 | 4 | 1 | 2 | 3 | — |
| 10 | 3 | 5 | 3 | 3 | 3 | ★ Temporal |
| 12 | 4 | 5 | 3 | 3 | 4 | ⚡ abre **correnteza** |
| 15 | 5 | 6 | 4 | 3 | 4 | — |
| 20 | 6 | 7 | 5 | 4 | 5 | — |
| 24 | 7 | 8 | 7 | 4 | 5 | ⚡ abre **neblina** |
| 25 | 7 | 8 | 7 | 4 | 6 | — |
| 30 | 8 | 9 | 9 | 5 | 6 | — |
| 35 | 10 | 10 | 10 | 5 | 7 | — |
| 40 | 11 | 11 | 11 | 6 | 8 | ⚡ abre **mare_alta** |
| 45 | 12 | 12 | 13 | 6 | 9 | — |
| 50 | 13 | 13 | 15 | 7 | 9 | ⚡ abre **temporal** |
| 52 | 14 | 13 | 15 | 7 | 10 | ⬆ **jato_pressurizado** vira rank 2 |
| 55 | 15 | 14 | 16 | 7 | 10 | — |
| 58 | 15 | 14 | 17 | 8 | 11 | ⬆ **correnteza** vira rank 2 |
| 60 | 16 | 15 | 17 | 8 | 11 | — |
| 64 | 17 | 16 | 19 | 8 | 11 | ⬆ **neblina** vira rank 2 |
| 65 | 17 | 16 | 19 | 8 | 12 | — |
| 70 | 18 | 17 | 21 | 9 | 12 | ⬆ **mare_alta** vira rank 2 |
| 75 | 20 | 18 | 22 | 9 | 13 | — |
| 78 | 20 | 18 | 23 | 10 | 14 | ⬆ **jato_pressurizado** vira rank 3 |
| 80 | 21 | 19 | 23 | 10 | 14 | — |
| 84 | 22 | 20 | 25 | 10 | 14 | ⬆ **correnteza** vira rank 3 |
| 85 | 22 | 20 | 25 | 10 | 15 | — |
| 90 | 23 | 21 | 27 | 11 | 15 | ⬆ **neblina** vira rank 3 |
| 95 | 25 | 22 | 28 | 11 | 16 | — |
| 96 | 25 | 22 | 29 | 11 | 16 | ⬆ **mare_alta** vira rank 3 |
| 99 | 25 | 23 | 29 | 12 | 17 | — |

### Raiz — mistico (terreno)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2 | 3 | Técnica base (class_basic) |
| 4 | 2 | 1 | 2 | 3 | 3 | ⚡ abre **pele_de_pedra** |
| 5 | 2 | 1 | 2 | 3 | 4 | — |
| 10 | 3 | 1 | 4 | 4 | 5 | ★ Chão Fechado |
| 12 | 4 | 2 | 4 | 4 | 5 | ⚡ abre **raiz_prendente** |
| 15 | 4 | 2 | 5 | 5 | 6 | — |
| 20 | 6 | 2 | 6 | 6 | 7 | — |
| 24 | 7 | 2 | 8 | 7 | 7 | ⚡ abre **tremor** |
| 25 | 7 | 2 | 8 | 7 | 8 | — |
| 30 | 8 | 2 | 10 | 8 | 9 | — |
| 35 | 9 | 3 | 11 | 9 | 10 | — |
| 40 | 11 | 3 | 12 | 10 | 11 | ⚡ abre **ruptura_do_solo** |
| 45 | 12 | 3 | 14 | 11 | 12 | — |
| 50 | 13 | 3 | 16 | 12 | 13 | ⚡ abre **raizes_profundas** |
| 52 | 14 | 4 | 16 | 12 | 13 | ⬆ **pele_de_pedra** vira rank 2 |
| 55 | 14 | 4 | 17 | 13 | 14 | — |
| 58 | 15 | 4 | 18 | 14 | 14 | ⬆ **raiz_prendente** vira rank 2 |
| 60 | 16 | 4 | 18 | 14 | 15 | — |
| 64 | 17 | 4 | 20 | 15 | 15 | ⬆ **tremor** vira rank 2 |
| 65 | 17 | 4 | 20 | 15 | 16 | — |
| 70 | 18 | 4 | 22 | 16 | 17 | ⬆ **ruptura_do_solo** vira rank 2 |
| 75 | 19 | 5 | 23 | 17 | 18 | — |
| 78 | 20 | 5 | 24 | 18 | 18 | ⬆ **pele_de_pedra** vira rank 3 |
| 80 | 21 | 5 | 24 | 18 | 19 | — |
| 84 | 22 | 5 | 26 | 19 | 19 | ⬆ **raiz_prendente** vira rank 3 |
| 85 | 22 | 5 | 26 | 19 | 20 | — |
| 90 | 23 | 5 | 28 | 20 | 21 | ⬆ **tremor** vira rank 3 |
| 95 | 24 | 6 | 29 | 21 | 22 | — |
| 96 | 25 | 6 | 29 | 21 | 22 | ⬆ **ruptura_do_solo** vira rank 3 |
| 99 | 25 | 6 | 30 | 22 | 23 | — |

### Racha — mistico (terreno)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 2 | 2 | 2 | 3 | ⚡ abre **estilhaco_terrestre** |
| 5 | 2 | 2 | 2 | 3 | 3 | — |
| 10 | 3 | 3 | 4 | 3 | 4 | ★ Falha Sísmica |
| 12 | 4 | 3 | 4 | 4 | 4 | ⚡ abre **pele_de_pedra** |
| 15 | 5 | 3 | 5 | 4 | 5 | — |
| 20 | 6 | 4 | 6 | 5 | 6 | — |
| 24 | 7 | 4 | 8 | 5 | 7 | ⚡ abre **tremor** |
| 25 | 7 | 4 | 8 | 6 | 7 | — |
| 30 | 8 | 5 | 10 | 6 | 8 | — |
| 35 | 10 | 5 | 11 | 7 | 9 | — |
| 40 | 11 | 6 | 12 | 8 | 10 | ⚡ abre **ruptura_do_solo** |
| 45 | 12 | 6 | 14 | 9 | 11 | — |
| 50 | 13 | 7 | 16 | 9 | 12 | ⚡ abre **fenda_no_chao** |
| 52 | 14 | 7 | 16 | 10 | 12 | ⬆ **estilhaco_terrestre** vira rank 2 |
| 55 | 15 | 7 | 17 | 10 | 13 | — |
| 58 | 15 | 8 | 18 | 11 | 13 | ⬆ **pele_de_pedra** vira rank 2 |
| 60 | 16 | 8 | 18 | 11 | 14 | — |
| 64 | 17 | 8 | 20 | 11 | 15 | ⬆ **tremor** vira rank 2 |
| 65 | 17 | 8 | 20 | 12 | 15 | — |
| 70 | 18 | 9 | 22 | 12 | 16 | ⬆ **ruptura_do_solo** vira rank 2 |
| 75 | 20 | 9 | 23 | 13 | 17 | — |
| 78 | 20 | 10 | 24 | 14 | 17 | ⬆ **estilhaco_terrestre** vira rank 3 |
| 80 | 21 | 10 | 24 | 14 | 18 | — |
| 84 | 22 | 10 | 26 | 14 | 19 | ⬆ **pele_de_pedra** vira rank 3 |
| 85 | 22 | 10 | 26 | 15 | 19 | — |
| 90 | 23 | 11 | 28 | 15 | 20 | ⬆ **tremor** vira rank 3 |
| 95 | 25 | 11 | 29 | 16 | 21 | — |
| 96 | 25 | 11 | 30 | 16 | 21 | ⬆ **ruptura_do_solo** vira rank 3 |
| 99 | 25 | 12 | 30 | 17 | 22 | — |

### Faísca — mistico (tempestade)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 0 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 4 | 1 | 2 | 2 | ⚡ abre **raio_curto** |
| 5 | 2 | 4 | 1 | 2 | 3 | — |
| 10 | 3 | 5 | 3 | 3 | 3 | ★ Antes do Trovão |
| 12 | 4 | 5 | 3 | 3 | 4 | ⚡ abre **eletricidade_estatica** |
| 15 | 5 | 6 | 4 | 3 | 4 | — |
| 20 | 6 | 7 | 5 | 4 | 5 | — |
| 24 | 7 | 8 | 7 | 4 | 5 | ⚡ abre **passo_eletrico** |
| 25 | 7 | 8 | 7 | 4 | 6 | — |
| 30 | 8 | 9 | 9 | 5 | 6 | — |
| 35 | 10 | 10 | 10 | 5 | 7 | — |
| 40 | 11 | 11 | 11 | 6 | 8 | ⚡ abre **tempestade_total** |
| 45 | 12 | 12 | 13 | 6 | 9 | — |
| 50 | 13 | 13 | 15 | 7 | 9 | ⚡ abre **descarga** |
| 52 | 14 | 13 | 15 | 7 | 10 | ⬆ **raio_curto** vira rank 2 |
| 55 | 15 | 14 | 16 | 7 | 10 | — |
| 58 | 15 | 14 | 17 | 8 | 11 | ⬆ **eletricidade_estatica** vira rank 2 |
| 60 | 16 | 15 | 17 | 8 | 11 | — |
| 64 | 17 | 16 | 19 | 8 | 11 | ⬆ **passo_eletrico** vira rank 2 |
| 65 | 17 | 16 | 19 | 8 | 12 | — |
| 70 | 18 | 17 | 21 | 9 | 12 | ⬆ **tempestade_total** vira rank 2 |
| 75 | 20 | 18 | 22 | 9 | 13 | — |
| 78 | 20 | 18 | 23 | 10 | 14 | ⬆ **raio_curto** vira rank 3 |
| 80 | 21 | 19 | 23 | 10 | 14 | — |
| 84 | 22 | 20 | 25 | 10 | 14 | ⬆ **eletricidade_estatica** vira rank 3 |
| 85 | 22 | 20 | 25 | 10 | 15 | — |
| 90 | 23 | 21 | 27 | 11 | 15 | ⬆ **passo_eletrico** vira rank 3 |
| 95 | 25 | 22 | 28 | 11 | 16 | — |
| 96 | 25 | 22 | 29 | 11 | 16 | ⬆ **tempestade_total** vira rank 3 |
| 99 | 25 | 23 | 29 | 12 | 17 | — |

### Trovão — mistico (tempestade)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 2 | 2 | 2 | 3 | ⚡ abre **eletricidade_estatica** |
| 5 | 2 | 2 | 2 | 3 | 3 | — |
| 10 | 3 | 3 | 4 | 3 | 4 | ★ Queda do Céu |
| 12 | 4 | 3 | 4 | 4 | 4 | ⚡ abre **raio_curto** |
| 15 | 5 | 3 | 5 | 4 | 5 | — |
| 20 | 6 | 4 | 6 | 5 | 6 | — |
| 24 | 7 | 4 | 8 | 5 | 7 | ⚡ abre **cadeia_de_raios** |
| 25 | 7 | 4 | 8 | 6 | 7 | — |
| 30 | 8 | 5 | 10 | 6 | 8 | — |
| 35 | 10 | 5 | 11 | 7 | 9 | — |
| 40 | 11 | 6 | 12 | 8 | 10 | ⚡ abre **tempestade_total** |
| 45 | 12 | 6 | 14 | 9 | 11 | — |
| 50 | 13 | 7 | 16 | 9 | 12 | ⚡ abre **trovoada** |
| 52 | 14 | 7 | 16 | 10 | 12 | ⬆ **eletricidade_estatica** vira rank 2 |
| 55 | 15 | 7 | 17 | 10 | 13 | — |
| 58 | 15 | 8 | 18 | 11 | 13 | ⬆ **raio_curto** vira rank 2 |
| 60 | 16 | 8 | 18 | 11 | 14 | — |
| 64 | 17 | 8 | 20 | 11 | 15 | ⬆ **cadeia_de_raios** vira rank 2 |
| 65 | 17 | 8 | 20 | 12 | 15 | — |
| 70 | 18 | 9 | 22 | 12 | 16 | ⬆ **tempestade_total** vira rank 2 |
| 75 | 20 | 9 | 23 | 13 | 17 | — |
| 78 | 20 | 10 | 24 | 14 | 17 | ⬆ **eletricidade_estatica** vira rank 3 |
| 80 | 21 | 10 | 24 | 14 | 18 | — |
| 84 | 22 | 10 | 26 | 14 | 19 | ⬆ **raio_curto** vira rank 3 |
| 85 | 22 | 10 | 26 | 15 | 19 | — |
| 90 | 23 | 11 | 28 | 15 | 20 | ⬆ **cadeia_de_raios** vira rank 3 |
| 95 | 25 | 11 | 29 | 16 | 21 | — |
| 96 | 25 | 11 | 30 | 16 | 21 | ⬆ **tempestade_total** vira rank 3 |
| 99 | 25 | 12 | 30 | 17 | 22 | — |

### Névoa — mistico (ilusorio)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 0 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 4 | 1 | 2 | 2 | ⚡ abre **mente_nebulosa** |
| 5 | 2 | 4 | 1 | 2 | 3 | — |
| 10 | 3 | 5 | 3 | 3 | 3 | ★ Sem Rosto |
| 12 | 4 | 5 | 3 | 3 | 4 | ⚡ abre **reflexo_falso** |
| 15 | 5 | 6 | 4 | 3 | 4 | — |
| 20 | 6 | 7 | 5 | 4 | 5 | — |
| 24 | 7 | 8 | 7 | 4 | 5 | ⚡ abre **distorcao** |
| 25 | 7 | 8 | 7 | 4 | 6 | — |
| 30 | 8 | 9 | 9 | 5 | 6 | — |
| 35 | 10 | 10 | 10 | 5 | 7 | — |
| 40 | 11 | 11 | 11 | 6 | 8 | ⚡ abre **quebra_de_realidade** |
| 45 | 12 | 12 | 13 | 6 | 9 | — |
| 50 | 13 | 13 | 15 | 7 | 9 | ⚡ abre **veu_de_nevoa** |
| 52 | 14 | 13 | 15 | 7 | 10 | ⬆ **mente_nebulosa** vira rank 2 |
| 55 | 15 | 14 | 16 | 7 | 10 | — |
| 58 | 15 | 14 | 17 | 8 | 11 | ⬆ **reflexo_falso** vira rank 2 |
| 60 | 16 | 15 | 17 | 8 | 11 | — |
| 64 | 17 | 16 | 19 | 8 | 11 | ⬆ **distorcao** vira rank 2 |
| 65 | 17 | 16 | 19 | 8 | 12 | — |
| 70 | 18 | 17 | 21 | 9 | 12 | ⬆ **quebra_de_realidade** vira rank 2 |
| 75 | 20 | 18 | 22 | 9 | 13 | — |
| 78 | 20 | 18 | 23 | 10 | 14 | ⬆ **mente_nebulosa** vira rank 3 |
| 80 | 21 | 19 | 23 | 10 | 14 | — |
| 84 | 22 | 20 | 25 | 10 | 14 | ⬆ **reflexo_falso** vira rank 3 |
| 85 | 22 | 20 | 25 | 10 | 15 | — |
| 90 | 23 | 21 | 27 | 11 | 15 | ⬆ **distorcao** vira rank 3 |
| 95 | 25 | 22 | 28 | 11 | 16 | — |
| 96 | 25 | 22 | 29 | 11 | 16 | ⬆ **quebra_de_realidade** vira rank 3 |
| 99 | 25 | 23 | 29 | 12 | 17 | — |

### Espelho — mistico (ilusorio)

| Nível | Porrada | Pique | Couro | Osso | Malandragem | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 2 | 2 | 2 | 3 | ⚡ abre **reflexo_falso** |
| 5 | 2 | 2 | 2 | 3 | 3 | — |
| 10 | 3 | 3 | 4 | 3 | 4 | ★ Duas Verdades |
| 12 | 4 | 3 | 4 | 4 | 4 | ⚡ abre **mente_nebulosa** |
| 15 | 5 | 3 | 5 | 4 | 5 | — |
| 20 | 6 | 4 | 6 | 5 | 6 | — |
| 24 | 7 | 4 | 8 | 5 | 7 | ⚡ abre **duplo_ilusorio** |
| 25 | 7 | 4 | 8 | 6 | 7 | — |
| 30 | 8 | 5 | 10 | 6 | 8 | — |
| 35 | 10 | 5 | 11 | 7 | 9 | — |
| 40 | 11 | 6 | 12 | 8 | 10 | ⚡ abre **quebra_de_realidade** |
| 45 | 12 | 6 | 14 | 9 | 11 | — |
| 50 | 13 | 7 | 16 | 9 | 12 | ⚡ abre **espelho_quebrado** |
| 52 | 14 | 7 | 16 | 10 | 12 | ⬆ **reflexo_falso** vira rank 2 |
| 55 | 15 | 7 | 17 | 10 | 13 | — |
| 58 | 15 | 8 | 18 | 11 | 13 | ⬆ **mente_nebulosa** vira rank 2 |
| 60 | 16 | 8 | 18 | 11 | 14 | — |
| 64 | 17 | 8 | 20 | 11 | 15 | ⬆ **duplo_ilusorio** vira rank 2 |
| 65 | 17 | 8 | 20 | 12 | 15 | — |
| 70 | 18 | 9 | 22 | 12 | 16 | ⬆ **quebra_de_realidade** vira rank 2 |
| 75 | 20 | 9 | 23 | 13 | 17 | — |
| 78 | 20 | 10 | 24 | 14 | 17 | ⬆ **reflexo_falso** vira rank 3 |
| 80 | 21 | 10 | 24 | 14 | 18 | — |
| 84 | 22 | 10 | 26 | 14 | 19 | ⬆ **mente_nebulosa** vira rank 3 |
| 85 | 22 | 10 | 26 | 15 | 19 | — |
| 90 | 23 | 11 | 28 | 15 | 20 | ⬆ **duplo_ilusorio** vira rank 3 |
| 95 | 25 | 11 | 29 | 16 | 21 | — |
| 96 | 25 | 11 | 30 | 16 | 21 | ⬆ **quebra_de_realidade** vira rank 3 |
| 99 | 25 | 12 | 30 | 17 | 22 | — |
