# LDI GANGUES — GDD (Game Design Document · a bíblia única)

> **Base oficial e única de tudo sobre o LDI Gangues — lore E mecânica.**
> Descreve o jogo como ele é hoje. Histórico de mudanças não entra aqui — mora
> no `git log`. O que ainda não está no código aparece marcado como
> **planejado**.
>
> **Fonte narrativa:** o conto **"Alan, o Campeão"** (`src/data/historias/contos/02/pt/01.md`
> … `19.md`, `historias/contos.json` id `02`). O jogo é o pano de fundo histórico desse
> conto: a década final da fragmentação de Marélia, terminando pouco antes de o
> Alan reivindicar a coroa. O Alan nunca aparece no jogo; quando citado, é
> sempre no futuro.
>
> Seções 1–14 = **o mundo** (quem manda, como o crime funciona, o que
> aconteceu antes, quem o jogador enfrenta e por quê, o que ele coleciona e
> equipa). Seções 15–17 = **mecânica** (retratos, líder, combate,
> progressão, estrutura de arquivos).

Grafia oficial: **Marélia** com acento.

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
| **1301–1322** | Inimigo comum — **Gerente de Boca** (22) |
| **1401–1414** | Inimigo comum — **Cobrador** (14) |
| **1451–1464** | Inimigo comum — **General / Braço-Direito** (14) |
| 1500–1599 | Chefes de território (7 bosses) |
| 1600–1699 | Chefe final + reservado |
| 1701–1799 | Fichas do encontro aleatório (fora do Álbum) |
| 3000–3099 | NPCs não-combatentes |
| 1–99 | Itens consumíveis *(contexto separa de "território")* |
| 101–999 | Equipamento |
| 10000+ | Cartas de socket (sistema futuro) |

> `data/gangues-enemies.json` tem **103 fichas** com id
> numérico — 92 da hierarquia (com bloco `album`), 7 chefes e 4 fichas do
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
   você só encara o Geral depois de bater os pontos. Na Pista o **muro** no
   fim da rua nunca abre por fora; depois de fechar os pontos você acha a
   **boca de um túnel** que fura *por baixo* do muro e emerge do outro lado.
   O muro físico só abre depois que você derruba o chefe, como atalho.
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
Cada território tem um **motivo histórico** pra sua dificuldade (§3). Id numérico
de cada um: `pista→1, feira→2, baixada→3, vila→4, morro→5, alto→6, laje→7`. Os 7
são cenas navegáveis com o mesmo motor (`data/cenas/<id>/`).

### Território 1 — A Pista · Rato de rua · `#3ddc97`
Facção: Rato de Pista (101) / Bonde do Sinal (102). O asfalto lá embaixo. Cria
que corre no farol, arranca corrente, vende bala. **Todo mundo começa aqui** — o
Retalho, o jogador, e (noutro bairro) o Alan.

Cena em `data/cenas/pista/`. Faixa de nível até **20**.

**POIs (`data/cenas/pista/pois.js`):**

- **Obrigatórios pro portão** (`portao.precisa`, 8): A boca do sinal (`sinal`) ·
  O ferro-velho (`ferro`, `PuzzleSimonSays`) · **A oficina do Nando**
  (`oficina` — junta 2× sucata, uma do `ferro` e outra do `achado`, e o Nando
  forja a Soqueira de Lata (237) grátis + conta onde o Carvão se esconde) · O
  beco da Rasteira (`beco`) · O outro ponto da Rasteira (`beco_2`) · O terceiro
  ponto (`beco_3`) · **O Sinaleiro Chefe** (`sinaleiro`, 1451, General) · **A
  Rasteira Velha** (`rasteira_velha`, 1452, General).
- O pino e a zona de interação do `ferro` ficam na calçada acima do prédio;
  quando um pino mora dentro de um prédio, uma marca de chão mostra onde
  interagir. Falhar a gazua do `ferro` vira treta sem travar o ponto
  (`falha.viraTreta.semTravar`).
- **Opcionais do lado de cá do muro:** o fundo do ferro-velho (`achado`) · o
  corre do Nato (`corre`, stealth — o convite aparece dentro do modal de
  Descanso) · a Rinha (`rinha`, farm infinito, §17.6) · Duda, o Orelha
  (`informante`, destrava o chefe da Feira) · Descanso na birosca (`descanso`)
  · **a Lojinha do Zé** (`loja_pocoes`, na rua) · e, na **sala dos fundos** da
  birosca, o agiota **Marimbondo** (`agiota`) e a **Banca do Tio Dado**
  (`banca`, §17.2.3).
- **Do lado de lá do muro** (`pos_portao`, via túnel): a loja da Pista (`loja`) ·
  o descanso do primo do Nato (`descanso_2`, dentro do barraco pm1) · os
  guarda-costas do Carvão (`posmuro_1` e `posmuro_2`, que destrancam o galpão) ·
  o galpão-dungeon com o Carvão no fim.
- **Encontro aleatório (perseguidor):** em qualquer lugar da rua — ver abaixo.

Ladder de força de cada ponto: §17.6.

**Mapa de RPG:** o exterior é favela desenhada em CSS (barraco / laje com caixa
d'água / sobrado / comércio com toldo / galpão) com rua de periferia (buracos,
entulho, fiação/gato) e praça. **Interiores navegáveis**: encosta na porta →
`ENTRAR` → fade → cômodo pequeno onde você anda até o dono e fala (birosca do
Nato, oficina do Nando, mercearia da Cida). **O covil do Carvão é um
galpão-dungeon de 4 cômodos** (doca → estoque → escritório → o breu): mobs da
Pista trancam a passagem entre os cômodos, uma prateleira dá achado, o contador
do movimento entrega a dica, e no último cômodo o Carvão está parado no escuro →
`DESAFIAR`. Motor único (`montarAmbiente`/`ctx`) serve rua e cômodo; comando
contextual (`ENTRAR`/`SAIR`/`VOLTAR`/`AVANÇAR`/`DESAFIAR`); a posição salva
inclui o interior.

**O túnel por baixo do muro:** o muro no fim da rua não abre por fora. Fechados
todos os `portao.precisa`, destranca a **boca do túnel** (prédio `tunel_ent`,
"Barraco do beco") — mini-dungeon de 3 cômodos com vigias do Sinal
(`tunel_m1/m2/m3`), passagem trancada até vencer cada um, e um achado ("Buraco
na parede"). Você sai no `tunel_sai` ("Barraco do outro lado"), já do lado de lá
do muro. Túnel bidirecional. O muro físico só abre com `prog.boss` (chefe
derrotado), aí vira atalho.

**Descanso, agiota e Clube da Luta** (regra igual em todo bairro; os valores
de cada um estão na tabela de §9.6):

- **A birosca (`descanso`) é só cura.** Três opções: **1×** o preço (10 na
  Pista) recupera só quem **não caiu**; **3×** recupera **todo mundo,
  revivendo os caídos**; **5×** (só aparece com alguém de status) é o descanso
  completo: vida, caídos e **status**. Store: `descansarTropa(custo,
  incluirCaidos, curarStatus)` / `descansoInfo()`.
- **Agiota** (`agiota`, na sala dos fundos). Escada de dívida:
  1. **Sem dívida:** pega um **empréstimo** (100 na Pista, `poi.emprestimo` nos
     outros bairros) e já fica devendo **10×**.
  2. **Já devendo:** cada **cura fiada DOBRA** a dívida atual.
  3. **No teto** (dívida × 2 passaria de 10.000): o agiota não fia mais e
     oferece o Clube da Luta.
  - A dívida é **global** (uma caderneta pra todas as biroscas) e
    **silenciosa** (sem HUD). Dá pra pagar parcial ou total a qualquer momento.
  - Constantes: `GANGUES_EMPRESTIMO_VALOR/MULT/TETO` = 100 / 10 / 10.000
    (`data/ganguesLoadout.js`).
  - Os textos da agiotagem são genéricos com `{agiota}` — o nome do NPC vem do
    POI de cada bairro.
- **Gate do chefe:** com qualquer dívida em aberto, **o chefe não aceita a
  luta** (aviso `aviso_divida_chefe`). O resto do bairro continua livre.
- **O Clube da Luta** é um módulo à parte (`clube/`): **gauntlet de 3 rondas**
  (`gerarBandoClube`, orçamento fixo por bairro — ronda 1 = 1 corpo, ronda 2 =
  2 corpos, ronda 3 = 3 casca-grossa; Pista 7 / 15 / 26, Feira 22 / 42 / 66,
  Baixada 36 / 70 / 110, Vila 49 / 96 / 150, Morro 61 / 120 / 186, Alto 74 /
  146 / 227, Laje 86 / 170 / 265; pool 1211/1212/1213/1219/1311/1312/1411/1412).
  O jogador entra **vendado** (saco na cabeça → holofote → rugido da plateia).
  - **Entrada:** soma **15× o preço do descanso** à dívida e cura a tropa.
    Quem entra **sem dívida** precisa de **Rep 40** (`GANGUES_REP_GATE_CLUBE`)
    e pode **apostar** na entrada (sai do bolso na hora).
  - **Entre rondas** (`GanguesClubeSala`): encarar machucado, **deixar o
    agiota ajeitar** (cura tudo e **dobra a dívida**) ou **cair fora** (te
    remendam, a dívida fica).
  - **Vitória na ronda 3:** quita **toda** a dívida, paga o **prêmio do
    bairro** (`clubePremioDe`: 200 · 300 · 450 · 650 · 900 · 1.200 · 1.600) +
    o **dobro da aposta**, e dá o **Chip Ígneo** (item 22). Nunca dá XP.
  - **Derrota:** te remendam, a dívida fica o que acumulou, a aposta se perde.
  - Portas de entrada do resto do jogo: `store.prepararEntradaClube()` (cena),
    `gerarBandoClube()` (GanguesRoute) e `store.fecharRondaClube()` (vitória).
- **Trava:** tropa inteira no chão (todos PV 0) não entra em luta nenhuma.
- **Derrota na cena — não existe game over.** A tropa acorda na birosca mais
  perto (`destinoSocorroDerrota`, `data/cenas/cenaHelpers.js`: o interior com
  descanso mais perto de onde caiu, do mesmo lado do muro/trilho; quem cai na
  rua nunca acorda num andar de cima; descanso com `precisa` só vale depois de
  liberado). A recuperação completa é cobrada na hora (`socorroDerrota`:
  3× o preço do descanso): tem grana → paga; não tem e não deve → empréstimo
  automático (100 na mão, dívida 1.000), paga e fica com o troco; não tem e já
  deve → pega só o valor, a 10× na dívida (sem teto). A tela de derrota mostra
  a conta e o botão vira "Acordar na birosca". Na Rinha a regra é outra
  (§17.6).
- Store: `ganguesBiroscaSlice.js` (persistido em `storyProgress.__birosca =
  { divida }`). Telas: `GanguesAgiota.jsx`, `GanguesAgiotagem.jsx`,
  `GanguesDescanso.jsx`, `clube/GanguesClube*.jsx`.

**Sala dos fundos.** Toda birosca tem na frente só o descanso (+ informante se
couber); agiota, Banca e o que for negócio escuso ficam num cômodo de trás —
`portaFundos(w)` + `salaDosFundos([refs])` (`data/cenas/salaDosFundos.js`, até
4 pinos, aceita `{ ref, precisaFlag }`). Regra geral: mais de 2–3 pinos num
cômodo de ~460×320 = criar outro cômodo. `com.nome` vira o nome no topo.

**Encontro aleatório — o perseguidor:**

- **Quando:** o 1º vem com **5 minutos de jogo** e depois **a cada 15 minutos**.
  O relógio conta só o tempo andando na RUA da cena (pausa em diálogo, luta,
  interior, mochila, ficha) e fica salvo no save (`storyProgress.__aleatorio`).
- **Como:** o **Nego Véio avisa** ("sujou o bagulho"), com 3 falas próprias de
  cada tipo. O perseguidor nasce longe (16–26 passos de caminho) e **vem atrás
  do jogador pelas ruas**, com pathfinding (BFS na grade de 20px, a mesma
  colisão que trava o jogador).
- **Não dá pra fugir:** ele anda um passo a cada 90ms, contra 110ms do jogador.
  Se o jogador entra em outra luta, num interior ou abre um menu, ele **congela
  onde está** e continua quando o jogador volta pra rua.
- **Alcançou:** uma **onomatopeia** estoura no centro do mapa (~1s) e a luta
  começa direto. Vitória ou derrota, ele some e o próximo fica agendado.
- **Sempre no mínimo 2 inimigos**, isento da suavização de 1ª luta e da regra
  da frustração. Força pelo personagem mais forte da gangue (`baseMaisForte`),
  nunca acima do líder do chefão do bairro.
- **Os tipos** (`ALEATORIO_TIPOS` em `engine/ganguesEncontroAleatorio.js`; cada
  cena escolhe quais sorteiam em `cena.aleatorio`):

  | Tipo | Bolinha | Quem | Onomatopeia |
  |---|---|---|---|
  | **Dois numa moto** (assalto) | amarela | 2–3: Piloto (1701) e Garupa (1702), ~90% do mais forte | VRUUUM! |
  | **A Ronda** (polícia) | azul | 2–3: Soldado (1711) e Cabo da Ronda (1712), no nível do mais forte | PARADO! |
  | **Bonde Rival** (outro bairro vem tirar satisfação) | vermelha | 3–4 de Feira/Baixada (1204–1209), ~75% | BANG! |
  | **O Cobrador** (vem cobrar o salve da Banca) | roxa | 2: cobrador (1401–1406) + capanga, ~115% | PÁ! |

  **Perdeu, perde coisa:** a moto te rapela (até 3 consumíveis da bolsa); a
  Ronda pega o acerto (20% da grana na mão) e ainda leva 1 consumível. A tela
  de derrota mostra quem levou o quê (`derrota` em `ALEATORIO_TIPOS`).

  O 1º encontro é sempre a moto e o 2º a polícia; depois sorteia entre os
  tipos da cena, sem repetir o anterior.
- **Sirene:** enquanto a Ronda persegue, a tela da cena pisca vermelho/azul.

**Balanço:** todo bando do jogo parte de um número de pontos FIXO autorado por
quem criou o encontro (ladder ponto a ponto, nunca um ratio contra o time do
jogador). A dificuldade escolhida (fácil/médio/difícil) soma ou tira um valor
fixo em cima desse número — `GANGUES_DIFICULDADE_AJUSTE` em
`data/ganguesDificuldade.js`, o único lugar que decide isso pro jogo inteiro.
**O inimigo mais forte de cada território é o chefão:** todo revezamento de
território passa por `revezamentoNoTerritorio` (cenaHelpers.js) com
`tetoTerritorio` — nenhum corpo passa da ficha real do líder do chefe.

**Encontro de revezamento ("estilo Pokémon"):** um POI `treta` com
`revezamento: { pool:[ids], budgetPorCorpo, chanceDupla }` chama
`gerarBandoRevezamento` — quase sempre 1 capanga, às vezes dupla (o 2º corpo
sai 2–3 pontos abaixo, `GANGUES_DUPLA_DEDUCAO_MIN/MAX`). Vale também dentro de
escolhas (`viraTreta.revezamento`). Pool da rua da Pista (`PISTA_POOL_RUA`):
Farejador/Zóio/Pingo/Ratazana/Chinelada (1101/1102/1103/1201/1203). Túnel:
m1 `[1101,1102,1103]` b4 · m2 `[1101,1102,1103,1201]` b6 · m3 `[1101,1102,1103]` b5.

### Território 2 — A Feira · Muvuca · `#7ee787`
Facção: Acerto de Contas (103) / Os Gato (104). O comércio, os camelô, a luz de
gato. Aqui não tem tiro — tem **dívida**. Primeiro território costurado pelo
Retalho sem sangue.

Cena em `data/cenas/feira/`. Faixa de nível **21–33**. O mapa é o esqueleto da
Pista **espelhado** (x' = 760 − x), com bancas de lona espalhadas.

- **Duas metades.** Embaixo, a Feira de dia. Em cima da **barricada do
  apagão** (o "muro" daqui), a Feira **no escuro**: só um círculo de luz em
  volta do jogador (`cena.apagao`) até o Cobrador cair. Chega-se lá pela
  **Galeria dos Gato** (o "túnel": 3 cômodos escuros, a porta do meio com o
  `PuzzleDecoder` — errar vira treta com Os Gato, sem travar o ponto).
- **Caminho obrigatório (abre a Galeria):** A Catraca → Banca do Turco (papo:
  paga 20 de taxa ou não; fala diferente pra quem deve ao agiota) → A cobrança
  → Quadro de Luz (labirinto; errar dá **choque** −2 PV na tropa e vira treta;
  dá o **fio de cobre**) → Beco dos Gato → Balança viciada → O Caderneta (**+1 Malícia contra quem deve**) → **Rádio do
  Toninho** (fetch quest: 1 fio de cobre + 3 válvulas; conserta e revela a Mão
  do Turco e o rádio pirata) → **Mão do Turco** (General fixo) → **Caixa
  Forte** (General fixo, **grana ×2**).
- **Lado apagado:** depósito 1 e depósito 2 (**Rep 60**) guardam o
  **Mercadão** — dungeon final em **labirinto de barracas**: 3 salas compridas
  em zigue-zague (`salaLabirinto` em `feira/interiores.js`: 3 fileiras por sala,
  cada uma com um vão alternando de lado), **2 brigas por sala** — a 2ª só
  aparece depois da 1ª e a passagem só abre depois da 2ª: barraca_1 →
  barraca_2 (bando de 3–5) → barraca_3 → barraca_4 (com o estoque escondido
  num canto) → barraca_5 → barraca_6 → o fundo com o **Marreta** e o bando dele
  e o livro-caixa → o cofre do Cobrador. 7 brigas obrigatórias dentro do
  Mercadão, 9 contando os depósitos.
- **Chefe — O Cobrador (1501):** ficha **33** (orçamento 82 × 0,40) + Mão do
  Turco e Caixa Forte de escolta, 3 corpos. Só aceita a luta depois do **Duda**
  (Pista) — `precisaInformante`. Com as **3 páginas da caderneta**
  (`pagina_1/2/3`, uma em cada metade + uma na Galeria) ele entra com **−2 de
  Couro** (`cena.fraquezaChefe`). Drop: **Porrete do Cobrador (138)**.
- **Opcionais:** Camelô (consumíveis + válvula + sucata, com **pechincha**:
  acertou o anagrama, −30% na visita) · Muamba de Domingo (stealth 6×6 com
  cronômetro, dá válvula) · **Pensão da Dona Regina** (**sem grana, ela cura
  fiado e a gangue fica devendo 1 favor** — `storyProgress.__regina`; os favores
  `favor_marmita`/`favor_devedor`/`favor_cobrador` pagam) e a pensão da filha
  do lado apagado · **Juro Alto** (agiota, empréstimo de 300) · **Rinha da
  Feira** (POI `rinha_apostas`, farm infinito como a da Pista) · Mercearia do
  Seu Aziz (lado apagado, a loja do bairro) · **Serralheria do Bigode**
  (aprimora até **+4**) · rádio pirata (informante da Baixada).
- **Encontro aleatório:** os 4 da Pista + **o Rapa** (laranja; se ganhar de
  você leva 1 consumível) + **o Apagão** (só no lado escuro, Os Gato no breu)
  + a **Cobrança do Turco** no lugar do Cobrador quando você deve ao agiota
  (se ganhar, leva 10% da grana na mão; nunca mexe na dívida).

### Território 3 — A Baixada · Correria · `#18dafb`
Facção: os 3 cacos do Sombra (105/106/107). Do outro lado da linha do trem. A
facção do Sombra rachou em três. **Fragmentação** — o que acontece quando um
território perde o dono.

Cena em `data/cenas/baixada/`, esqueleto da Pista **sem muro**: o bairro
inteiro é andável desde o começo. Faixa de nível **34–46**.

- **A virada.** O "chefe" que foge o bairro inteiro é o **folgado** — se
  apresenta como Fura-Bucho, mas é o **Zé Pavão (1322)**, o inimigo mais fraco
  da Baixada. O dono de verdade é o **velho da entrada**: grogue, com cara de
  morador de rua, sentado no meio-fio, que a cada conversa solta uma filosofia
  com gíria (`falasSorteadas` — "o céu vermelho contra o mundo azul", "o cego
  viu o que o surdo ouviu"…). Ele é o **Fura-Bucho (1502)**.
- **Barra de Respeito** (`cena.respeito.pois`, `GanguesBaixadaHud.jsx`). A
  cadeia do folgado (`folgado_1`…`folgado_5`) enche a barra: o folgado aparece
  com pino grande (`fuga`), solta a marra, joga um capanga — Sangria 34, Gelo
  36, Sobra 38, depois os Generais Caco Maior 41 e Nome do Sombra 43 — e some
  pro outro lado da linha. Barra cheia, ele não tem mais pra onde correr
  (`folgado_final`, 34).
- **O café.** Batido, o folgado entrega: "dá um café pro véio". A **Dona Cida**
  (padaria) libera o **Café do Véio (item 16)**; entregue ao velho
  (`veio_cafe`), ele acorda e vira o chefe no mesmo lugar (`someQuando` troca
  os pinos): Fura-Bucho **46** + os dois Generais de escolta (orçamento 115 ×
  0,40). Drop: o **Espeto do Fura-Bucho (140)**.
- **A linha do trem** (`cena.trem`, `hooks/useGanguesTrem.js`) corta o mapa:
  a cada ~24 s o trem apita (3 s) e passa (8 s), fechando a travessia. Quem
  estiver nos trilhos leva 2 de dano na tropa (nunca derruba) e é jogado pro
  lado mais perto.
- **O resto do bairro:** Rinha do Trilho (farm infinito), Birosca da Dona
  Lurdes e Pensão do Trilho (descansos dos dois lados da linha), o agiota
  **Resto de Faca** (empréstimo de 500), o **Depósito do Seu Nono** (loja) e a
  caixa na beira da linha. O chefe só abre depois do rádio pirata da Feira
  (`precisaInformante`).

### Território 4 — A Vila · Disputa · `#ffae32`
Facção: Bonde dos Prédio (108) / Os Andar de Cima (109). O conjunto, os prédios
de dez andares, a escada sem luz. **Resistência militarizada** — a única região
que entrou na órbita do Retalho por guerra.

Cena em `data/cenas/vila/`. Ponte: a Dona Lurdes (birosca da Baixada,
`informante_vila`) destranca o Ferrugem.

- **Térreo livre:** guarita (47) → o Portaria foge (48) → Cadeado (49) abre o
  **Bloco A**, um interior só com o hall e os 10 andares (um cômodo por andar,
  ligados por `passagem` com `precisa` + `voltaPara` — a escada trancada até
  bater quem segura o andar). Ladder 50 · 51 · Trinco 52 · 53 · 54 · 55 ·
  Bloco Inteiro 56 (G) · 57 · Chave Mestra Maior 58 (G) · **Ferrugem 59** na
  cobertura (+ escolta ~44/46; orçamento 148 × 0,40, 3 corpos; o chefe mora
  dentro do interior, `ref: '__chefe'`).
- **Andares 1–4 e 6 no escuro** (`comodo.escuro`) até o chefe cair.
- **Elevador quebrado** (`cena.elevador`): sem a chave (item 18, Dona Neide, 5º
  andar) só vai do hall ao 1º; com ela, térreo/5º/9º — só andar já liberado — e
  35% de travar (emboscada + 1 de alerta).
- **Barra de Alerta** (`cena.alerta`, `storyProgress.__alerta`, 0–3): perder na
  Vila ou o elevador travar sobe; cada ponto é +1 de ficha em todo corpo das
  tretas daqui (`pontosComAlerta`, nunca passa do Ferrugem); bater o Portaria
  desce, a última aparição dele (6º andar) zera e trava.
- Descanso na Birosca do Térreo e na Dona Neide (quem cai do 5º pra cima acorda
  nela), agiota Aluguel Vencido (empréstimo 800), Brechó da Síndica (loja +
  Poção de Osso 41), Oficina do Zelador (aprimora até +6), Rinha da Laje.
  Ponto fraco: a caixa d'água da cobertura (−2 Couro). Drop do chefe: Taco da
  Ferrugem (141).

### Território 5 — O Morro · Guerra · `#ff8f3c`
Facção: Frente da Escada (110) / Os Fogueteiro (111), sob Zefa. A favela de
encosta, a escadaria que muda de forma a cada laje nova. **Lealdade pessoal** — a
região que nunca foi realmente dominada, só negociada.

Cena em `data/cenas/morro/`. Mecânica: **a escadaria negociada**. Três portões
dos Fogueteiro (`cena.barreiras: [{ id, y1, y2, flag }]`) fecham a rua de lado a
lado; cada um só abre com o AVAL de um bairro já dominado, negociado na sala dos
fundos da birosca de lá (POI `papo` com `informante: '<flag>'`, pino com
`precisaFlag`): **Pista** — pedágio de 600 pro Marimbondo; **Feira** — 3
válvulas pros rádios dos Fogueteiro (Juro Alto); **Baixada** — 2 Poções de Osso
pro remédio da creche (Dona Lurdes). Os avais só aparecem depois do recado do
Morro (sala dos fundos da birosca da Vila, `informante_morro`, que também
destranca a Zefa).

- Ladder: escadaria 60 → Cupim 61 → [portão 1] → laje nova 63 → [portão 2] →
  posto de rojão 65 → Segunda Mãe 66 (G) → [portão 3] → Escadaria Inteira 68
  (G) → última escada 69 → a boca da Zefa: Conta do Morro 70 → **A Fera 72**
  (orçamento 180 × 0,40, 3 corpos, escolta ~54).
- Birosca do Pé do Morro (agiota Conta do Morro com empréstimo 1.000 nos
  fundos), Serralheria da Laje (+7), Venda do Morro (loja), Creche da Zefa
  (papo + achado), Rinha da Laje de Cima. Drop da Zefa: Vara da Fera (134).

### Território 6 — Alto do Morro · No sangue · `#ff6b6b`
Facção: Os Cinco (112) / A Roda (113). Atrás da porta de aço. **A ameaça que
quase virou cúpula paralela** — o ponto mais "político" do jogo.

Cena em `data/cenas/alto/`. Mecânica: **o Caderno do Contador**. Cada um dos
Cinco (Verme 75, Presa 76, Engrenagem 77, Quase-Cúpula 78, Quarto Nome 79) se
resolve COMPRANDO a dívida dele (600–800 de grana; o Contador perde 1 de Couro)
ou na PORRADA (de graça; o Contador ganha 1 de Porrada) — `cena.ajusteChefe`,
barra do caderno no topo. Ponte: o recado do Alto na sala dos fundos da birosca
do Morro.

- Caminho: porta de aço 73 → sala fechada 74 → os Cinco → a Roda 80 (sempre em
  dupla) → sala dos Cinco: Formação Completa 82 (G) → escritório: Favor Devido
  83 → **as fases do Contador**: antes da porrada se ganha dele em dois JOGOS
  (POI `tipo: 'jogo'`, `components/cena/jogos/GanguesJogoContador.jsx`), um
  cômodo por fase: **porrinha** (3 palitos cada, chuta o total, quem acerta joga
  um fora, zerou ganhou) e **bilhar de três bolas** (arrasta e solta, encaçapa
  as 3 em até 6 tacadas). Perder um jogo não custa nada e não marca o ponto
  (só a vitória chama `onResolve`). Só a fase final é porrada: **O Contador 85**
  (orçamento 213 × 0,40, escolta Quarto Nome + Formação Completa ~64).
- Birosca (agiota Dívida do Alto com 1.200 nos fundos), Ferraria (+8),
  Empório (loja), Rinha. Drop: Bengala do Contador (135).

### Território 7 — A Laje · A Coroa · `#a855f7`
Facção: Bonde do Retalho (114). O topo. De um lado, Marélia inteira. Do outro, o
Retalho. **Onde a pergunta do jogo ("dá pra segurar Marélia?") é respondida com
um não.**

Cena em `data/cenas/laje/`. O território mais longo e mais difícil. Ponte: o
recado da Laje nos fundos da birosca do Alto. Não abre no modo fácil
(`bloqueadoNoFacil`).

- **Revanches:** os 6 chefes anteriores voltam UMA vez cada, sozinhos, já na
  ficha da Laje (Carvão 87, Cobrador 89, Fura-Bucho 91, Ferrugem 93, Zefa 94,
  Contador 98).
- Rua (a entrada costurada): Última Guarda 86 → Carvão → Fiapo 88 → Cobrador →
  Agulha 90 → Fura-Bucho → Linha Reta 92 (G). Sala de costura (6 salas em
  fila): Ferrugem → Zefa → Costura Fina 95 → Tesoura 96 (G) → Corte Certo 97
  (G) → Contador.
- **O topo, sem descanso** (o dano passa de uma fase pra outra): fase 1 "A
  Costura" (o Retalho + Tesoura, Corte Certo e Costura Fina, bando de 4) →
  fase 2 "A Colcha" (ele levanta diferente, + as três linhas do bonde e Conta
  Fechada, bando de 5) → fase 3 **O Retalho 100** (orçamento 250 × 0,40,
  escolta Tesoura/Corte Certo ~76). As fases 1 e 2 são POIs de bando com
  orçamento total fixo (`liderFixo` + `moldesPool` + `pontosFixo` +
  `qtdMin/qtdMax`).
- **As linhas do Retalho:** um contato dele em cada um dos 6 bairros de baixo
  (sala dos fundos da birosca, só depois do recado), cortado na porrada no
  nível 88; cada linha que sobrar dá +1 Porrada e +1 Couro no Retalho final
  (até +6/+6) — `cena.ajusteChefe(prog, flags, cenaProgresso)`.
- Birosca (agiota Ponto da Laje com 1.500 nos fundos), Alfaiataria (+9), loja,
  Rinha. Drop: Coroa da Laje (133).

**Pontes entre bairros:** cada chefe só aceita a luta depois de um informante
do bairro anterior (a Feira pede o **Duda, o Orelha** (3002) da Pista, a
Baixada o rádio pirata da Feira, e assim por diante).

**Economia por bairro** (`engine/ganguesVictoryResolver.js`): grana por vitória
= base do bairro + 5 por inimigo a mais; chefe garante um mínimo; AP ×1,5 da
Feira em diante, menos na Baixada. Tabela em §9.7.

**Território novo entra só com dado.** O motor de cena não conhece nenhum
bairro: tudo é campo da cena (`data/cenas/<id>/index.js`) — `ruas`, `muro`
({y1,y2,aviso}), `postes`, `textos`, `posMuro`, `dicaQuest(prog, inventario)`,
`aleatorio`, `fraquezaChefe`, `ajusteChefe`, `apagao`, `trem`, `respeito`,
`alerta`, `elevador`, `barreiras`. Campos de POI genéricos: `fuga`,
`someQuando`, `falasSorteadas`, `oferta`, `precisaFlag`, `exigeItem`,
`precisaResolvido`, `elevador`. Cena sem `muro` funciona (nenhum prédio com
`pos_portao`; o chefe fica invisível até `portao.precisa` fechar). O mini-mapa
acha a porta do prédio sozinho (`posNoMapa`). Checklist de bairro novo:
(1) pasta `data/cenas/<id>/` com os mesmos arquivos; (2) registrar em
`CENAS_POR_ID` (`cenaHelpers.js`); (3) `GANGUES_CHEFE_BUDGET`/`liderFracChefe`/
`GANGUES_CHEFE_CORPOS` (`data/ganguesChefes.js`), rondas do Clube
(`clube/ganguesClubeRegras.js`), grana e AP (`ganguesVictoryResolver.js`),
loja e drops (`data/ganguesEquipDistribuicao.js`); (4) i18n ×3 em
`games.gangues.cena.<id>.*`; (5) checagem de alcance por BFS a partir do spawn
(toda zona de POI e porta alcançável, nenhum pino dentro de colisor).

---

## 5. O Álbum de Marélia — roster de inimigos

Cada inimigo derrotado pela **primeira vez** desbloqueia uma entrada. Organizado
por **cargo** (§0). **92 entradas colecionáveis** = a hierarquia da Banca inteira
(Vigia 21 + Vapor 21 + Gerente 22 + Cobrador 14 + General 14). Os 8 chefes (§6)
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

Todas as 92 entradas têm ficha de combate em `data/gangues-enemies.json`.
Retratos: §15.

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

### 5.3 Nível 3 — GERENTE DE BOCA (faixa 1301–1322)

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
| 1322 | Zé Pavão | Baixada | espeto de pau | O folgado que se apresenta como Fura-Bucho e foge o bairro inteiro (§4). |

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
fixo do bairro (`GANGUES_CHEFE_BUDGET`, §9.7) — na Pista o Carvão luta com
ficha ~29.

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
recrutar) — mostrada no botão **HISTÓRIA**
da ficha de recrutamento (`components/GanguesFichaBio.jsx`, texto em
`data/ganguesBiografias.js`, chave = `character_template_id`, o mesmo id
da tabela acima). **PT-first**: o botão/título/fechar respeitam o idioma
do jogador (pt/en/es), mas o texto de lore em si só existe em português
— a tradução pra en/es é **planejada**.

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

Sem id numérico (vivem só como POI/NPC da cena):
**Seu Nando** (oficina — forja a Soqueira de Lata com 2× sucata), **o agiota
Marimbondo** (sala dos fundos da birosca; retrato emprestado da ficha 1206), **o Zé**
(Lojinha do Zé; retrato emprestado da ficha 1205) e **a Cida** (mercearia).
Cada bairro tem os seus (Regina, Toninho, Aziz, Bigode, Dona Cida, Dona Lurdes,
Dona Neide, os agiotas de cada birosca — §4). O **Nego Véio** também é a voz
que avisa o encontro aleatório e explica os modos trancados.

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
- **Equipamento:** `store.equipamentos` `[{ uid, itemId, aprim, cards }]`, ids **101+**.
  Uma peça equipada sai do inventário da gangue e vive em
  `sheet.attributes.equipment[slot]`; volta ao desequipar.
- Ações: `comprarItem`, `usarItem`, `comprarEquip`, `comprarEEquipar`,
  `equiparItem`, `desequiparItem`.

### 9.3 Consumíveis e materiais (faixa 1–99)

Catálogo em `data/ganguesItens.js`; nome no i18n (`games.gangues.itens.<id>`).
Preço da tabela = preço base (a Lojinha do Zé cobra o dobro).

| id | Nome | tipo | efeito | preço | ícone |
|---|---|---|---|---|---|
| 1 | Poção de HP | `cura_pv` | +5 Osso | 20 | 🩹 |
| 2 | Poção de MP | `cura_pm` | +5 energia | 20 | 💧 |
| 3 | Cigarro de Palha | `cura_pm` | +3 energia, −1 Couro por 1 ação | 7 | 🚬 |
| 4 | Water Energético | `cura_pm` | +8 energia | 22 | 🥤 |
| 5 | Faixa de Pano | `cura_pv` | +3 Osso — só drop | — | 🧻 |
| 6 | Pinga | `buff` | +2 Porrada e −1 Couro por 2 ações | 18 | 🍾 |
| 8 | Bombinha de Fumaça | `debuff_inimigos` | −1 Pique em todos os inimigos por 1 ação | 25 | 💨 |
| 10 | Farinha de Guaraná | `cura_pv` | +7 Osso | 20 | 🥣 |
| 11 | Vela Benta | `buff` | +2 Couro por 2 ações | 18 | 🕯️ |
| 12 | Sacola de Bala | `cura_pv` | +2 Osso | 6 | 🍬 |
| 13 | Sucata | `material` | aprimoramento e a quest do Nando | 10 | 🔩 |
| 14 | Fio de Cobre | `material` | quest do Rádio do Toninho (Feira) | — | 🔌 |
| 15 | Válvula de Rádio | `material` | quest do Rádio do Toninho; aval do Morro | 20 | 💡 |
| 16 | Café do Véio | `material` | acorda o Fura-Bucho (Baixada) | — | ☕ |
| 18 | Chave do Elevador | `material` | libera o elevador da Vila (não se gasta) | — | 🔑 |
| 20 | Chip do Bruto | `poder_unico` | por 1 golpe, *Soco de Ferro* (nível 2) | não vende | 👊 |
| 21 | Chip da Muralha | `poder_unico` | por 1 golpe, *Postura Defensiva* (nível 2) | não vende | 🛡️ |
| 22 | Chip Ígneo | `poder_unico` | por 1 golpe, *Bola de Fogo* (nível 2) | não vende | 🔥 |
| 30–39 | Remédios de status | `cura_status` | §17.2.2 (34 Xarope da Vó cura todos) | 12 (34: 30) | — |
| 41 | Poção de Osso | `cura_pv` | +20 Osso | 80 | 🦴 |

**Chips de poder (20–22):** emprestam por um golpe um poder que o personagem
talvez nem tenha treinado (`forcedSpecial` em `ganguesSpecialEffects.js`).
Nunca são vendidos. Vêm de **marcos de reputação** (a cada **50 de Rep**
acumulada, sem teto, a gangue ganha 1 chip, ciclando 20 → 21 → 22, com tela de
recompensa — `repMarcosCruzados` em `ganguesLoadout.js`), do **drop** de
Gerentes, Cobradores e Generais (§9.8) e da vitória no Clube da Luta (chip 22).


### 9.4 Equipamento — 6 espaços, por caminho

Catálogo em `data/ganguesEquip.js`; nome em `games.gangues.equip.itens.<id>`;
historinha de cada peça em `games.gangues.lore.<id>` (card de detalhe da loja —
peça nova = historinha nova, uma ou duas frases, vocabulário da rua).

- **Espaços** (bonecão de cima pra baixo): `cabeca` 🪖 · `corpo` 🦺 · `bracos`
  🧤 · `pes` 🥾 · `amuleto` 📿 · `arma` 🥊.
- **Bônus:** Porrada (A), Couro (D) e Pique (H) vêm em **faixa** (`bonus: { A:
  [1, 3] }`); Osso/energia (`pv`/`pm`) e Malandragem são **fixos**.
  - A Porrada da peça rola **a cada golpe**, o Couro **a cada defesa**
    (`rolls.arma` / `rolls.armadura` em `resolveGanguesAction`), o Pique **uma
    vez na entrada da luta** (no `prepare`). Cada peça rola o próprio dado e
    soma; a Briga em Multidão usa o mesmo resolver.
  - O painel do golpe mostra a arma (🔪) e a armadura (🛡️) sorteadas na conta;
    a pista da linha do tempo mostra **"+N"** em cima de quem teve Pique
    sorteado; cards mostram a faixa (**"+1–3 Porrada"**). Toda previsão (loja,
    ficha, aviso de nível) usa a **média**, nunca o máximo
    (`getGanguesEquipBonuses` → `getGanguesAttributesWithEquip`).
- **Cada peça tem dono**: `caminho` = `atacante` (Porradeiro), `defensor`
  (Paredão), `mistico` (Mandingueiro) ou `livre` (qualquer um). Só o caminho
  certo **e** o nível mínimo equipam (`podeEquiparGangues`); a loja e a bolsa
  só oferecem equipar em quem pode. Na bolsa, a escolha de quem recebe abre
  logo abaixo da peça tocada.
- **Raridade = bairro.** Uma categoria por bairro, exclusiva: comum (Pista,
  201–238) · incomum (Feira) · raro (Baixada, 301–318) · pesado (Vila,
  401–418) · grife (Morro, 501–518) · nobre (Alto, 601–618) · lendário (Laje,
  701–718); **épico** é só drop de chefe. Cada categoria sobe +1 na faixa de
  atributo e ~30% em Osso/energia sobre a anterior (arma do atacante: 1–3 → 2–4
  → 3–5 → …). Nível mínimo = entrada do bairro (`nivelMinEquip`): 5 / 20 / 33 /
  46 / 59 / 72 / 85; épico 59, salvo Facão do Carvão 15, Porrete do Cobrador
  28 e Espeto do Fura-Bucho 44.
- **Regras fixas:** o **Paredão nunca passa de +1 de Porrada**; Porrada e
  Couro nunca entram em peça comum; o Mandingueiro rende mais com o mesmo
  orçamento (Malandragem = força do talento + gás).
- **Preço** = arredonda5(Σ média × peso × raridade) — pesos A 28 · D 22 · H 30
  · Osso/energia 6; raridade comum 1 · incomum 1,1 · raro 1,3 · pesado 1,45 ·
  grife 1,6 · nobre 1,75 · lendário 1,9 · épico 1,6 (`precoReferencia`). Peça
  sem `custo` não vende em loja.
- **Duas versões de cada peça.** A da **loja** (sem encaixe, aprimora no
  ferreiro) e a de **drop** (`encaixe: true`): 1 encaixe de carta, ou 2 na
  variação rara (teto de 2), e pode já vir aprimorada (+1/+2) — mas nunca
  aprimora no ferreiro. Nome na tela: "Faca Serrilhada [2] +1" (`nomePeca`).
- **Loja:** `GANGUES_LOJA_EQUIP` (`data/ganguesEquipDistribuicao.js`) — a loja do
  bairro vende ~10 peças: o caminho da especialidade inteiro + arma e corpo dos
  outros dois (Pista e Vila atacante, Feira e Morro defensor, Baixada e Alto
  místico; a Laje vende arma, corpo e amuleto de todos). Toda peça cai de algum
  inimigo (§9.8).

**Aprimoramento** (`aprimorarEquip` em `ganguesEquipSlice.js`, tela
`GanguesFerreiro.jsx`):
- Mexe só no **atributo principal** da peça (o 1º com faixa). **Nível ímpar =
  vantagem** (rola 2 vezes, fica com o maior, "▲" na tela); **nível par = sobe o
  mínimo em 1**. Teto = mínimo encosta no máximo (`aprimTeto`).
- **Custo:** grana = 25% do preço da peça × o nível (mín. 5) + **Sucata** igual
  ao nível. Peça sem preço de loja usa o preço da fórmula.
- O nível **mora na peça** (`aprim` na instância e no slot equipado) — vai junto
  ao trocar de dono.
- **Onde** (POI `ferreiro`, `poi.tetoAprim`): bancada do Nando (Pista, só depois
  da quest da sucata) +1 · Serralheria do Bigode (Feira) +4 · Oficina do
  Zelador (Vila) +6 · Serralheria da Laje (Morro) +7 · Ferraria (Alto) +8 ·
  Alfaiataria (Laje) +9. A Baixada não tem ferreiro.

**Catálogo completo** (gerado de `data/ganguesEquip.js` +
`data/ganguesEquipDistribuicao.js`):
| id | Nome | Caminho | Espaço | Raridade | Bônus | Nível mín. | Preço | Onde sai |
|---|---|---|---|---|---|---|---|---|
| 133 | Coroa da Laje | Livre | cabeça | épico | +2–4 Couro, +1–3 Pique | 59 | — | cai de: O Retalho 10% |
| 134 | Vara da Fera | Livre | arma | épico | +4–7 Porrada, +1–2 Pique | 59 | — | cai de: A Fera 10% |
| 135 | Bengala do Contador | Livre | amuleto | épico | +1–3 Porrada, +1–3 Couro | 59 | — | cai de: O Contador 10% |
| 138 | Porrete do Cobrador | Livre | arma | épico | +3–7 Porrada, +1–3 Pique, +0–2 Couro | 28 | — | cai de: O Cobrador 10% |
| 139 | Facão do Carvão | Livre | arma | épico | +2–5 Porrada, +0–2 Couro | 15 | — | cai de: Carvão 10% |
| 140 | Espeto do Fura-Bucho | Livre | arma | épico | +3–6 Porrada, +1–3 Couro | 44 | — | cai de: Fura-Bucho 10% |
| 141 | Taco da Ferrugem | Livre | arma | épico | +3–6 Porrada, +1–4 Couro | 59 | — | cai de: Ferrugem 10% |
| 201 | Cabo de Vassoura | Porradeiro | arma | comum | +0–2 Pique | 5 | 35 | loja pista · cai de: Farejador 1% |
| 202 | Boné Aba Reta | Porradeiro | cabeça | comum | +1 Osso | 5 | 25 | loja pista · cai de: Zóio 1%, Soldado da Ronda 1% |
| 203 | Regata Rasgada | Porradeiro | corpo | comum | +3 Osso | 5 | 30 | loja pista · cai de: Pingo 1%, Cabo da Ronda 1% |
| 204 | Faixa no Punho | Porradeiro | mãos | comum | +1 Osso | 5 | 25 | loja pista · cai de: Ratazana 1% |
| 205 | Tênis Furado | Porradeiro | pés | comum | +1 Osso | 5 | 25 | loja pista · cai de: Brasa 1% |
| 206 | Corrente de Lata | Porradeiro | amuleto | comum | +2 energia | 5 | 30 | loja pista · cai de: Chinelada 1% |
| 207 | Soqueira de Ferro | Porradeiro | arma | incomum | +1–3 Porrada | 20 | 150 | loja feira · cai de: Extensão 1% |
| 208 | Bandana de Bonde | Porradeiro | cabeça | incomum | +2 Osso | 20 | 75 | cai de: Boleto Vencido 1% |
| 209 | Jaqueta de Couro | Porradeiro | corpo | incomum | +4 Osso | 20 | 95 | loja feira · cai de: Luz de Gato 1% |
| 210 | Munhequeira | Porradeiro | mãos | incomum | +0–2 Pique | 20 | 100 | cai de: Choque 1% |
| 211 | Coturno | Porradeiro | pés | incomum | +1 Osso | 20 | 70 | cai de: Balconista 1% |
| 212 | Dente de Ouro | Porradeiro | amuleto | incomum | +2 energia | 20 | 75 | cai de: Fiado Vencido 1% |
| 213 | Cano Curto | Paredão | arma | comum | +2 Osso | 5 | 30 | loja pista · cai de: Cão Louco 1,5% |
| 214 | Gorro de Moletom | Paredão | cabeça | comum | +1 Osso | 5 | 25 | cai de: Riscado 1,5% |
| 215 | Colete Reforçado | Paredão | corpo | comum | +4 Osso | 5 | 35 | loja pista · cai de: Mão de Cola 1,5% |
| 216 | Luva de Couro | Paredão | mãos | comum | +1 Osso | 5 | 25 | cai de: Bala Solta 1,5% |
| 217 | Chinelo Reforçado | Paredão | pés | comum | +2 Osso | 5 | 30 | cai de: Troco Certo 1,5%, Piloto 1% |
| 218 | Medalhinha | Paredão | amuleto | comum | +2 energia | 5 | 30 | cai de: Sinaleiro Chefe 3%, Garupa 1% |
| 219 | Tampa de Bueiro | Paredão | arma | incomum | +0–2 Couro | 20 | 110 | loja feira · cai de: Unha de Fome 1,5% |
| 220 | Capacete de Obra | Paredão | cabeça | incomum | +0–2 Couro | 20 | 110 | loja feira · cai de: Caderneta 1,5% |
| 221 | Colete de Placa | Paredão | corpo | incomum | +8 Osso | 20 | 125 | loja feira · cai de: Pesagem 1,5% |
| 222 | Braçadeira de Pneu | Paredão | mãos | incomum | +2 Osso | 20 | 70 | loja feira · cai de: Marreta 1,5% |
| 223 | Bota com Biqueira | Paredão | pés | incomum | +3 Osso | 20 | 80 | loja feira · cai de: Juro Alto 1,5% |
| 224 | Terço da Vó | Paredão | amuleto | incomum | +2 energia | 20 | 75 | loja feira · cai de: Mão do Turco 3% |
| 225 | Vela Preta | Mandingueiro | arma | comum | +1 Malandragem | 5 | 45 | loja pista · cai de: Rasteira Velha 3% |
| 226 | Capuz Surrado | Mandingueiro | cabeça | comum | +2 energia | 5 | 25 | cai de: Farejador 1% |
| 227 | Manto de Feira | Mandingueiro | corpo | comum | +4 energia | 5 | 35 | loja pista · cai de: Zóio 1% |
| 228 | Pulseira de Miçanga | Mandingueiro | mãos | comum | +2 Osso | 5 | 25 | cai de: Pingo 1% |
| 229 | Sandália de Couro | Mandingueiro | pés | comum | +1 Osso | 5 | 25 | cai de: Ratazana 1% |
| 230 | Guia de Contas | Mandingueiro | amuleto | comum | +2 energia | 5 | 30 | cai de: Brasa 1%, Carvão 5% |
| 231 | Cajado de Galho | Mandingueiro | arma | incomum | +0–2 Porrada | 20 | 110 | loja feira · cai de: Caixa Forte 3% |
| 232 | Turbante | Mandingueiro | cabeça | incomum | +1 Malandragem | 20 | 110 | cai de: Extensão 1% |
| 233 | Manto de Sintonia | Mandingueiro | corpo | incomum | +5 energia, +2 Osso | 20 | 125 | loja feira · cai de: Boleto Vencido 1% |
| 234 | Anel de Coco | Mandingueiro | mãos | incomum | +3 Osso | 20 | 70 | cai de: Luz de Gato 1% |
| 235 | Chinelo Benzido | Mandingueiro | pés | incomum | +3 energia | 20 | 75 | cai de: Choque 1%, O Cobrador 5% |
| 236 | Olho Grego | Mandingueiro | amuleto | incomum | +1 Malandragem | 20 | 110 | cai de: Balconista 1%, O Cobrador 5% |
| 237 | Soqueira de Lata | Livre | arma | comum | +0–2 Porrada | 5 | — | oficina do Nando (Pista) |
| 238 | Boné Vira-Lata | Livre | cabeça | comum | +1 Osso | 5 | 20 | loja pista · cai de: Chinelada 1%, Carvão 5% |
| 301 | Espeto de Churrasco | Porradeiro | arma | raro | +2–4 Porrada | 33 | 330 | loja baixada · cai de: Maré Baixa 1% |
| 302 | Capuz Preto | Porradeiro | cabeça | raro | +3 Osso | 33 | 75 | cai de: Trilho 1% |
| 303 | Colete Cravejado | Porradeiro | corpo | raro | +6 Osso | 33 | 135 | loja baixada · cai de: Boato 1% |
| 304 | Luva de Boxe Rasgada | Porradeiro | mãos | raro | +1–3 Pique | 33 | 240 | cai de: Água Parada 1% |
| 305 | Tênis Falsificado | Porradeiro | pés | raro | +0–2 Pique | 33 | 120 | cai de: Ferro Velho 1% |
| 306 | Corrente de Prata | Porradeiro | amuleto | raro | +2 energia | 33 | 45 | cai de: Valão 1% |
| 307 | Porta de Geladeira | Paredão | arma | raro | +1–3 Couro | 33 | 165 | loja baixada · cai de: Herdeiro 1,5% |
| 308 | Capacete de Moto | Paredão | cabeça | raro | +0–2 Couro | 33 | 90 | cai de: Sangria 1,5% |
| 309 | Colete de Pneu | Paredão | corpo | raro | +10 Osso | 33 | 240 | loja baixada · cai de: Gelo 1,5% |
| 310 | Caneleira de Cano | Paredão | mãos | raro | +4 Osso | 33 | 90 | cai de: Zé Pavão 1,5% |
| 311 | Bota de Segurança | Paredão | pés | raro | +5 Osso | 33 | 120 | loja baixada · cai de: Sobra 1,5% |
| 312 | Figa de Arruda | Paredão | amuleto | raro | +3 energia | 33 | 75 | loja baixada · cai de: Resto de Faca 1,5% |
| 313 | Cajado de Arruda | Mandingueiro | arma | raro | +2 Malandragem | 33 | 315 | loja baixada · cai de: Caco Maior 3% |
| 314 | Chapéu de Palha Benzido | Mandingueiro | cabeça | raro | +4 energia | 33 | 90 | loja baixada · cai de: Nome do Sombra 3% |
| 315 | Manto de Chita | Mandingueiro | corpo | raro | +6 energia, +3 Osso | 33 | 210 | loja baixada · cai de: Maré Baixa 1% |
| 316 | Fita do Bonfim | Mandingueiro | mãos | raro | +4 Osso | 33 | 90 | loja baixada · cai de: Trilho 1% |
| 317 | Sandália de Corda | Mandingueiro | pés | raro | +4 energia | 33 | 90 | loja baixada · cai de: Boato 1%, Fura-Bucho 5% |
| 318 | Patuá | Mandingueiro | amuleto | raro | +1 Malandragem, +2 energia | 33 | 210 | loja baixada · cai de: Água Parada 1%, Fura-Bucho 5% |
| 401 | Chave de Cano | Porradeiro | arma | pesado | +3–5 Porrada | 46 | 460 | loja vila · cai de: Portaria 1% |
| 402 | Capacete de Obra Pintado | Porradeiro | cabeça | pesado | +3 Osso | 46 | 105 | loja vila · cai de: Escada Cega 1% |
| 403 | Colete do Bonde | Porradeiro | corpo | pesado | +6 Osso, +0–2 Couro | 46 | 230 | loja vila · cai de: Vizinho Barulhento 1% |
| 404 | Cotoveleira de Borracha | Porradeiro | mãos | pesado | +1–3 Pique | 46 | 335 | loja vila · cai de: Varal 1% |
| 405 | Bota de Trabalho | Porradeiro | pés | pesado | +0–2 Porrada | 46 | 250 | loja vila · cai de: Condomínio 1% |
| 406 | Molho de Chaves | Porradeiro | amuleto | pesado | +3 energia | 46 | 65 | loja vila · cai de: Zelador 1% |
| 407 | Porta de Aço | Paredão | arma | pesado | +2–4 Couro, +1 Porrada | 46 | 330 | loja vila · cai de: Cadeado 1,5% |
| 408 | Balde de Concreto | Paredão | cabeça | pesado | +0–2 Couro | 46 | 125 | cai de: Trinco 1,5% |
| 409 | Colchão Amarrado | Paredão | corpo | pesado | +12 Osso | 46 | 335 | loja vila · cai de: Elevador 1,5% |
| 410 | Grade de Janela | Paredão | mãos | pesado | +0–2 Couro | 46 | 125 | cai de: Goteira 1,5% |
| 411 | Bota de Borracha | Paredão | pés | pesado | +6 Osso | 46 | 170 | cai de: Aluguel Vencido 1,5% |
| 412 | Crachá da Síndica | Paredão | amuleto | pesado | +3 energia, +3 Osso | 46 | 170 | cai de: Bloco Inteiro 3% |
| 413 | Antena de TV | Mandingueiro | arma | pesado | +3–5 Malandragem | 46 | 440 | loja vila · cai de: Chave Mestra Maior 3% |
| 414 | Touca de Alumínio | Mandingueiro | cabeça | pesado | +4 energia, +1 Porrada | 46 | 200 | cai de: Portaria 1% |
| 415 | Cortina de Renda | Mandingueiro | corpo | pesado | +6 energia, +3 Osso, +1 Couro | 46 | 330 | loja vila · cai de: Escada Cega 1% |
| 416 | Pulseira de Fio | Mandingueiro | mãos | pesado | +1 Pique, +3 Osso | 46 | 190 | cai de: Vizinho Barulhento 1% |
| 417 | Chinelo de Quarto | Mandingueiro | pés | pesado | +4 energia | 46 | 125 | cai de: Varal 1%, Ferrugem 5% |
| 418 | Santinho do Elevador | Mandingueiro | amuleto | pesado | +1 Malandragem, +2 energia | 46 | 290 | cai de: Condomínio 1%, Ferrugem 5% |
| 501 | Rojão de Mão | Porradeiro | arma | grife | +4–6 Porrada | 59 | 645 | loja morro · cai de: Vento do Alto 1% |
| 502 | Boné de Grife | Porradeiro | cabeça | grife | +4 Osso | 59 | 145 | cai de: Fumaça de Rojão 1% |
| 503 | Jaqueta da Frente | Porradeiro | corpo | grife | +8 Osso, +1–3 Couro | 59 | 320 | loja morro · cai de: Beco sem Saída 1% |
| 504 | Luva de Pedreiro | Porradeiro | mãos | grife | +2–4 Pique | 59 | 470 | cai de: Ladeira 1% |
| 505 | Tênis de Grife | Porradeiro | pés | grife | +1–3 Porrada | 59 | 350 | cai de: Laje Nova 1% |
| 506 | Cordão de Prata | Porradeiro | amuleto | grife | +4 energia | 59 | 90 | cai de: Criação da Zefa 1% |
| 507 | Tampa de Caixa d'Água | Paredão | arma | grife | +3–5 Couro, +1 Porrada | 59 | 460 | loja morro · cai de: Cupim 1,5% |
| 508 | Capacete de Laje | Paredão | cabeça | grife | +1–3 Couro | 59 | 175 | loja morro · cai de: Cascalho 1,5% |
| 509 | Colete de Saco de Cimento | Paredão | corpo | grife | +16 Osso | 59 | 470 | loja morro · cai de: Última Escada 1,5% |
| 510 | Caneleira de Bambu | Paredão | mãos | grife | +1–3 Couro | 59 | 175 | loja morro · cai de: Pavio Curto 1,5% |
| 511 | Bota de Obra | Paredão | pés | grife | +8 Osso | 59 | 240 | loja morro · cai de: Conta do Morro 1,5% |
| 512 | Escapulário | Paredão | amuleto | grife | +4 energia, +4 Osso | 59 | 240 | loja morro · cai de: Segunda Mãe 3% |
| 513 | Vara da Benzedeira | Mandingueiro | arma | grife | +4–6 Malandragem | 59 | 615 | loja morro · cai de: Escadaria Inteira 3% |
| 514 | Lenço de Cabeça | Mandingueiro | cabeça | grife | +5 energia, +2 Porrada | 59 | 280 | cai de: Vento do Alto 1% |
| 515 | Saia de Chita | Mandingueiro | corpo | grife | +8 energia, +4 Osso, +2 Couro | 59 | 460 | loja morro · cai de: Fumaça de Rojão 1% |
| 516 | Pulseira de Semente | Mandingueiro | mãos | grife | +2 Pique, +4 Osso | 59 | 265 | cai de: Beco sem Saída 1% |
| 517 | Alpargata | Mandingueiro | pés | grife | +5 energia | 59 | 175 | cai de: Ladeira 1%, A Fera 5% |
| 518 | Guia de Sete Linhas | Mandingueiro | amuleto | grife | +2 Malandragem, +3 energia | 59 | 405 | cai de: Laje Nova 1%, A Fera 5% |
| 601 | Taco de Sinuca | Porradeiro | arma | nobre | +5–7 Porrada | 72 | 900 | loja alto · cai de: Porta de Aço 1% |
| 602 | Chapéu Panamá | Porradeiro | cabeça | nobre | +5 Osso | 72 | 205 | cai de: Sala Fechada 1% |
| 603 | Paletó Riscado | Porradeiro | corpo | nobre | +10 Osso, +2–4 Couro | 72 | 450 | loja alto · cai de: Favor Devido 1% |
| 604 | Abotoadura de Ouro | Porradeiro | mãos | nobre | +3–5 Pique | 72 | 655 | cai de: Círculo 1% |
| 605 | Sapato Bicolor | Porradeiro | pés | nobre | +2–4 Porrada | 72 | 490 | cai de: Disciplina 1% |
| 606 | Relógio de Bolso | Porradeiro | amuleto | nobre | +5 energia | 72 | 125 | cai de: Doutrina 1% |
| 607 | Porta de Cofre | Paredão | arma | nobre | +4–6 Couro, +1 Porrada | 72 | 645 | loja alto · cai de: Verme 1,5% |
| 608 | Boina de Feltro | Paredão | cabeça | nobre | +2–4 Couro | 72 | 245 | cai de: Presa 1,5% |
| 609 | Sobretudo Blindado | Paredão | corpo | nobre | +19 Osso | 72 | 655 | loja alto · cai de: Engrenagem 1,5% |
| 610 | Luva de Couro Fino | Paredão | mãos | nobre | +2–4 Couro | 72 | 245 | cai de: Quase-Cúpula 1,5% |
| 611 | Sapato de Bico Fino | Paredão | pés | nobre | +10 Osso | 72 | 335 | cai de: Dívida do Alto 1,5% |
| 612 | Medalha do Alto | Paredão | amuleto | nobre | +5 energia, +5 Osso | 72 | 335 | cai de: Quarto Nome 3% |
| 613 | Baralho Marcado | Mandingueiro | arma | nobre | +5–7 Malandragem | 72 | 860 | loja alto · cai de: Formação Completa 3% |
| 614 | Óculos Escuros | Mandingueiro | cabeça | nobre | +6 energia, +2 Porrada | 72 | 390 | loja alto · cai de: Porta de Aço 1% |
| 615 | Colete de Seda | Mandingueiro | corpo | nobre | +10 energia, +5 Osso, +2 Couro | 72 | 645 | loja alto · cai de: Sala Fechada 1% |
| 616 | Anel de Formatura | Mandingueiro | mãos | nobre | +2 Pique, +5 Osso | 72 | 370 | loja alto · cai de: Favor Devido 1% |
| 617 | Mocassim | Mandingueiro | pés | nobre | +6 energia | 72 | 245 | loja alto · cai de: Círculo 1%, O Contador 5% |
| 618 | Dado Viciado | Mandingueiro | amuleto | nobre | +2 Malandragem, +3 energia | 72 | 570 | loja alto · cai de: Disciplina 1%, O Contador 5% |
| 701 | Facão Costurado | Porradeiro | arma | lendário | +6–8 Porrada | 85 | 1260 | loja laje · cai de: Última Guarda 1% |
| 702 | Bandana de Retalho | Porradeiro | cabeça | lendário | +6 Osso | 85 | 290 | cai de: Olho da Costura 1% |
| 703 | Jaqueta de Retalhos | Porradeiro | corpo | lendário | +11 Osso, +3–5 Couro | 85 | 630 | loja laje · cai de: Sentinela do Topo 1% |
| 704 | Luva Remendada | Porradeiro | mãos | lendário | +4–6 Pique | 85 | 920 | cai de: Retalho Solto 1% |
| 705 | Coturno Costurado | Porradeiro | pés | lendário | +3–5 Porrada | 85 | 685 | cai de: Ponto da Laje 1% |
| 706 | Dedal de Ferro | Porradeiro | amuleto | lendário | +6 energia | 85 | 180 | loja laje · cai de: Fio Cortado 1% |
| 707 | Escudo de Lona | Paredão | arma | lendário | +5–7 Couro, +1 Porrada | 85 | 905 | loja laje · cai de: Fiapo 1,5% |
| 708 | Capacete Remendado | Paredão | cabeça | lendário | +3–5 Couro | 85 | 345 | cai de: Agulha 1,5% |
| 709 | Colcha Blindada | Paredão | corpo | lendário | +23 Osso | 85 | 920 | loja laje · cai de: Linha Reta 1,5% |
| 710 | Braçadeira de Couro Grosso | Paredão | mãos | lendário | +3–5 Couro | 85 | 345 | cai de: Costura Fina 1,5% |
| 711 | Bota de Sola Dupla | Paredão | pés | lendário | +11 Osso | 85 | 465 | cai de: Conta Fechada 1,5% |
| 712 | Carretel | Paredão | amuleto | lendário | +6 energia, +6 Osso | 85 | 465 | loja laje · cai de: Tesoura 3% |
| 713 | Agulha de Crochê | Mandingueiro | arma | lendário | +6–8 Malandragem | 85 | 1205 | loja laje · cai de: Corte Certo 3% |
| 714 | Touca de Tricô | Mandingueiro | cabeça | lendário | +8 energia, +3 Porrada | 85 | 550 | cai de: Última Guarda 1% |
| 715 | Manto de Retalhos | Mandingueiro | corpo | lendário | +11 energia, +6 Osso, +3 Couro | 85 | 905 | loja laje · cai de: Olho da Costura 1% |
| 716 | Fita Métrica | Mandingueiro | mãos | lendário | +3 Pique, +6 Osso | 85 | 520 | cai de: Sentinela do Topo 1% |
| 717 | Pantufa de Lã | Mandingueiro | pés | lendário | +8 energia | 85 | 345 | cai de: Retalho Solto 1%, O Retalho 5% |
| 718 | Botão do Retalho | Mandingueiro | amuleto | lendário | +3 Malandragem, +4 energia | 85 | 795 | loja laje · cai de: Ponto da Laje 1%, O Retalho 5% |

### 9.5 Épicos — drop de chefe

Caminho livre, cai do chefe (10%, garantido em 10 vitórias — o chefe batido
fica no mapa como revanche repetível):
Facão do Carvão (139) · Porrete do Cobrador (138) · Espeto do Fura-Bucho (140)
· Taco da Ferrugem (141) · Vara da Fera (134) · Bengala do Contador (135) ·
Coroa da Laje (133, o Retalho). Bônus na tabela acima.

### 9.8 Drop dos inimigos

Não existe prêmio de 1ª vitória: o que vem de luta é **drop**. Cada inimigo tem
uma tabela própria (`data/ganguesDrops.js`, gerada por regra a partir do
território do álbum e do cargo, então todo inimigo novo já nasce com tabela) e
cada corpo derrotado sorteia a dele (`engine/ganguesDrop.js`, ação
`store.aplicarDrops`).

| Linha | Chance | Garantido em |
|---|---|---|
| Sucata | 10% | 10 |
| Consumível comum do bairro | 15% | 7 |
| Consumível secundário | 5% | 20 |
| Válvula (só Feira) | 5% | 20 |
| Chip de poder (Gerente/Cobrador · General) | 2% · 3% | 50 · 34 |
| Peça com encaixe (Vigia/Vapor · Gerente/Cobrador · General · chefe) | 1% · 1,5% · 3% · 5% | 100 · 67 · 34 · 20 |
| Épico do chefe | 10% | 10 |
| Consumível do chefe | 30% | 4 |
| **Carta do próprio inimigo** (Vigia/Vapor · Gerente/Cobrador · General · chefe · aleatório) | 0,2% · 0,25% · 0,5% · 1% · 0,5% | 500 · 400 · 200 · 100 · 200 |

- **Garantia (sem frustração):** cada linha tem um contador por inimigo
  (`storyProgress.__drops`). Quem tem chance p ganha o drop, no máximo, na
  ceil(1/p)-ésima vitória sobre aquele inimigo; antes disso o sorteio vale
  normal. Caiu, o contador zera.
- **Variação da peça que cai:** 10% de vir com 2 encaixes; 5% de vir +2 e 20%
  de vir +1 (até o teto da peça) — `rolarVariante`.
- As peças de cada bairro são repartidas entre os inimigos dele (toda peça cai
  de pelo menos um); o chefe leva as duas últimas. A Soqueira de Lata (237) é
  prêmio da oficina do Nando e não cai.
- **Rinha não dá drop e não conta pra garantia** (nem no farm calculado).
- **Onde aparece:** a carta de "quem vou enfrentar" (botão "Ver o que ele
  derruba"), a ficha do inimigo na Coleção e o painel "Caiu do bando" na
  vitória — sempre com a chance e quantas vitórias faltam pra garantia.
- **Chefe batido vira revanche repetível** (`storyTarget.revanche`): dá drop e
  XP, mas não domina o bairro de novo nem conta a campanha outra vez.

### 9.9 Cartas

Uma carta por inimigo (103), id = 10000 + id do inimigo, estilo Ragnarok
(`data/ganguesCartas.js`, gerada por regra; os 7 chefes têm carta própria com
dois efeitos). Só cai do próprio inimigo (§9.8) e mora no inventário da gangue.

- **Espaço:** cada carta só entra num espaço de peça (arma, corpo, cabeça, mãos,
  pés, amuleto). Encaixa num encaixe vazio de peça de drop, pela ficha do
  personagem (`GanguesCartaEncaixe.jsx`, ação `encaixarCarta`). **Encaixou,
  ficou pra sempre** — a carta não sai mais da peça (a peça leva a carta junto se
  trocar de dono ou for vendida).
- **Força:** o território do inimigo (1 Pista … 7 Laje; General vale +1).
- **Efeitos por espaço:**

  | Espaço | Variações |
  |---|---|
  | Arma | +Porrada · chance de status ao bater · chance de soltar um talento de graça |
  | Corpo | +Couro · +Osso máximo · chance de bloquear o golpe |
  | Cabeça | imune a um status (+Osso) · +energia · +Malandragem |
  | Mãos | chance de curar Osso ao acertar · +Porrada |
  | Pés | +Pique · −dano em todo golpe recebido |
  | Amuleto | +% de grana na vitória · cura ao derrubar · +energia e +Osso |

- **No motor:** a soma fixa (atributo, Osso, energia) entra no `prepare` e na
  ficha (`getGanguesEquipBonuses`); o resto vem de `cartaEfeitos` e é aplicado no
  golpe (`engine/ganguesCartaEfeitos.js`): talento automático só em ataque normal,
  sem gastar energia nem contar como talento na linha do tempo; status ao bater só
  se o talento não pôs nenhum; imunidade do alvo barra; bloqueio zera o golpe;
  redução tira do dano; cura entra depois do golpe. Vale nos dois motores (normal
  e Multidão). O painel do golpe mostra cada carta que disparou, com o rosto do dono.
- **Coleção:** aba Cartas (103, com retrato do inimigo, espaço e efeito).

### 9.6 Lojas, descansos e ferreiros por bairro

POI de tipo `loja` com `poi.itens` (mistura consumível e equipamento;
`poi.precoMultiplicador` opcional). Só consumível se repete entre lojas.

| Bairro | Loja (consumível) | Equipamento | Descanso (1×) | Empréstimo do agiota |
|---|---|---|---|---|
| Pista | Loja da Pista (pós-muro): 1, 2, 30–39 · Lojinha do Zé (rua): os mesmos, preço ×2 | comum | 10 | 100 |
| Feira | Camelô: 1, 2, 3, 4, 6, 8, 10, 11, 12, 13, 15 · Mercearia do Seu Aziz: 1, 2, 4, 10, 34 | incomum (Aziz) | 15 | 300 |
| Baixada | Depósito do Seu Nono: 1, 2, 4, 10, 34 | raro | 20 | 500 |
| Vila | Brechó da Síndica: 1, 2, 10, 34, 41 | pesado | 30 | 800 |
| Morro | Venda do Morro: 1, 2, 10, 34, 41 | grife | 40 | 1.000 |
| Alto | Empório: 1, 2, 10, 34, 41 | nobre | 50 | 1.200 |
| Laje | loja da Laje: 1, 2, 10, 34, 41 | lendário | 60 | 1.500 |

**Venda:** toda loja tem a aba **Vender** (`GanguesLojaVenda.jsx`) e compra o que a
gangue tem guardado a **25% do preço base**, mínimo 1 (`GANGUES_VENDA_FRAC`,
`precoVendaItem` / `precoVendaEquip`). A **Sucata** vale fixo **1** (`venda: 1`).
Item de missão sem preço (fio de cobre, café do véio, chave do elevador) e chip
de poder não vendem. Equipamento só vende guardado, peça por peça, pelo preço
da peça + 2 por nível de aprimoramento; épico usa o preço da fórmula. Consumível
vende 1 ou todos de uma vez.

A Lojinha do Zé existe porque quem quer arriscar luta mais forte precisa ir
municiado desde o começo. O dono é o Zé do Bar do Zé (retrato emprestado da
ficha 1205).

### 9.7 Escada de nível e economia por bairro

~13 níveis por bairro, fechando no 99; o Retalho é o único nível 100. Teto de
nível por área em `nivelTeto` (`ganguesTerritorios.js`, §17.1).

| # | Território | Teto de nível | Chefe (ficha do líder) | Orçamento × fração | Grana por vitória | Chefe (mínimo) | Clube (vitória) | AP |
|---|---|---|---|---|---|---|---|---|
| 1 | Pista | 20 | Carvão ~29 | 48 × 0,60, 2 corpos | 10 | 250 | 200 | ×1 |
| 2 | Feira | 33 | Cobrador 33 | 82 × 0,40, 3 corpos | 15 | 500 | 300 | ×1,5 |
| 3 | Baixada | 46 | Fura-Bucho 46 | 115 × 0,40, 3 corpos | 20 | 800 | 450 | ×1 |
| 4 | Vila | 59 | Ferrugem 59 | 148 × 0,40, 3 corpos | 30 | 1.200 | 650 | ×1,5 |
| 5 | Morro | 72 | A Fera 72 | 180 × 0,40, 3 corpos | 40 | 1.700 | 900 | ×1,5 |
| 6 | Alto do Morro | 85 | Contador 85 | 213 × 0,40, 3 corpos | 55 | 2.300 | 1.200 | ×1,5 |
| 7 | Laje | 99 | Retalho 100 | 250 × 0,40, 3 corpos | 75 | 3.000 | 1.600 | ×1,5 |

- Orçamento do chefe: `GANGUES_CHEFE_BUDGET` / `liderFracChefe` /
  `GANGUES_CHEFE_CORPOS` em `data/ganguesChefes.js`. Fixo, nunca escala com o
  jogador.
- Grana por vitória = base do bairro + 5 por inimigo a mais
  (`calcularGranaTotal`); chefe garante o mínimo.
- O conjunto completo de cada loja vale ~12% da ficha no teto daquele bairro
  (~15% no Mandingueiro). Conta em pontos: 1 de atributo = 1 ponto, 3 de Osso
  = 1, 3 de energia = 1.
- Grana pro time inteiro vem também do Clube e da Banca, de propósito: o
  conjunto do time todo custa mais que uma passada pelo bairro.

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
| Gerente de Boca (1301–1322) | 22 |
| Cobrador (1401–1414) | 14 |
| General / Braço-Direito (1451–1464) | 14 |
| **Total colecionável (hierarquia da Banca)** | **92** |
| Chefes de território + chefe final (1500–1600) | 8 *(aba própria, fora da contagem)* |

Reserva: cada faixa comporta crescer até ~99 sem remapear.

---

## 12. Endgame — nível 99, a Torre e o multiplayer

- **Teto de nível: 99** (`GANGUES_LEVEL_CAP`). Cada um dos 30 personagens tem os
  **99 níveis autorados** no catálogo (`ldi_gangues_30_personagens_v1.json`):
  níveis 1–10 são os stats desenhados à mão; do 11 ao 99 cada personagem
  **segue o próprio `growth_order`** — +1 atributo por nível, sempre, fiel à
  identidade do caminho (um Bruto termina A altíssimo, um Muralha só D/PV, um
  Resiliente puro PM). Nada procedural em runtime — o catálogo vem gerado
  (`scripts/gangues-regen-catalog.cjs`). Poderes de assinatura liberam nos
  níveis 4 / 12 / 24 / 40 e sobem de rank (→2 nos níveis 52–70, →3 nos 78–96).
- **Chefes:** escada e orçamentos em §9.7. **O Retalho é o único nível 100 do
  jogo.** Estruturas próprias: Baixada (o chefe que foge + o velho da
  entrada), Vila (andares + cobertura), Morro (portões negociados), Alto (dois
  jogos antes da porrada), Laje (revanches + 3 fases encadeadas sem descanso)
  — §4.
- **Modo Batalha = A Torre** (`GanguesBatalha`). Destrava ao zerar a campanha
  1× (`campaignClears`). Luta atrás de luta, o jogador escolhe o bairro-tema e
  a *folga de nível* (folgado → brabo). Cada andar sobe a dificuldade e o AP
  (+100% a cada 5 andares). Recorde de andar por bairro em
  `storyProgress.__torre`.
- **Multiplayer online libera com 3 fichas no nível 99**
  (`GANGUES_MULTIPLAYER_MIN_FICHAS = 3`, `GANGUES_MULTIPLAYER_LEVEL = 99`,
  `ganguesTemMultiplayer(roster)`). O online em si é **planejado** — por ora só
  destrava o card em `GanguesModes`.
- **Cards bloqueados da tela de Modos são clicáveis:** tocar num modo trancado
  abre o Nego Véio explicando o que falta pra liberar.
- **A Coleção** (botão da HUD da cena + lobby): abas Inimigos (o Álbum, com a
  tabela de drop de cada um), Itens (consumível + equipamento, descoberto via
  `storyProgress.__itens`), Cartas (§9.9) e Troféus.
- **Troféus** (`data/ganguesTrofeus.js`, 51, id numérico: 1xx progressão · 2xx
  porrada · 3xx drop e coleção · 4xx rua). Cada um mede um número do save
  (`medir(estado)`) contra um alvo; os contadores que não saem do save direto
  moram em `storyProgress.__stats` (vitórias, inimigos, drops, peças com encaixe,
  chefe sem ninguém cair, Clube, revanches, aprimoramentos, vendas, Banca —
  ação `contarStat`). O vigia `components/GanguesTrofeus.jsx` (montado no
  GanguesRoute) confere a cada mudança do save, marca em `storyProgress.__trofeus`,
  entrega a recompensa (grana, consumível, chip) e mostra o aviso; mais de 3 de
  uma vez (save antigo) vira um aviso só de resumo. Texto por tipo no i18n
  (`games.gangues.trofeus.tipos.<tipo>`). Lista com progresso em
  `GanguesTrofeusLista.jsx`, usada na Coleção e na aba Gangues do perfil do site
  (`PerfilGangues.jsx`, lê `gangues_saves`/`gangues_fichas` de cada gangue).

---

## 12.1 Índice de fontes

| Assunto | Arquivo |
|---|---|
| Conto "Alan, o Campeão" (texto completo) | `src/data/historias/contos/02/pt/01.md` … `19.md` |
| Mapa, territórios, gangues, teto de nível | `src/pages/games/Gangues/data/ganguesTerritorios.js` |
| Fichas dos inimigos + trash talk | `src/pages/games/Gangues/data/gangues-enemies.json` |
| Geração de bando | `data/ganguesEncontros.js` |
| Chefes (orçamento, fração, corpos) | `data/ganguesChefes.js` |
| Cenas navegáveis dos 7 bairros | `data/cenas/<bairro>/` + `data/cenas/cenaHelpers.js`, `data/cenas/salaDosFundos.js` |
| 30 lutadores recrutáveis | `data/ldi_gangues_30_personagens_v1.json` |
| Consumíveis / equipamento / onde cada peça sai | `data/ganguesItens.js`, `data/ganguesEquip.js`, `data/ganguesEquipDistribuicao.js` |
| Loja / painel de equipamento / bolsa | `components/cena/GanguesLoja.jsx`, `components/GanguesEquipPanel.jsx`, `components/cena/GanguesCenaBagSheet.jsx` |
| Inventário + economia (store) | `store/useGanguesStore.js` + `store/slices/` |
| Textos (i18n) | `src/i18n/gangues-{pt,en,es}.json` (carregado por `hooks/useGanguesI18n.js`) → `games.gangues.*` |
| Dificuldade, degrau da ladder, frustração, nível real | `data/ganguesDificuldade.js` |
| AP por risco, divisão do AP, grana da vitória | `engine/ganguesVictoryResolver.js` |
| Descanso, agiota, socorro de derrota | `store/slices/ganguesBiroscaSlice.js` |
| Clube da Luta (módulo) | `clube/` |
| Gates de Rep, marcos de Rep, empréstimo, multiplayer, talentos equipados | `data/ganguesLoadout.js` |
| Motor da cena (colisão, câmera, mini-mapa) | `engine/ganguesCenaMotor.js` |
| Encontro aleatório | `engine/ganguesEncontroAleatorio.js` + `hooks/useGanguesEncontroAleatorio.js` |
| Briga automática da rua | `hooks/useGanguesBrigaAutomatica.js` |
| Rinha e farm calculado | `data/cenas/cenaHelpers.js` (`niveisDaRinha`), `engine/ganguesFarmAusente.js`, `components/cena/GanguesFarmAusente.jsx` |
| Jogo vivo com a aba no fundo | `hooks/useGanguesManterVivo.js` |
| Linha do tempo (Pique) + pista visual | `engine/ganguesLinhaDoTempo.js`, `components/GanguesPistaTempo.jsx` |
| Teclado | `hooks/useGanguesTeclado.js` |
| Opções (som, volume, controles) | `components/GanguesOpcoes.jsx` |
| CSS do jogo | `styles/` (auditado por `scripts/gangues-css-audit.cjs` no predeploy) |
| Retratos (cabeça, corpo, inimigo, NPC) | `data/ganguesPortraits.js`, `data/ganguesEnemyPortraits.js`, `data/ganguesNpcPortraits.js` |
| Status + itens de cura | `engine/ganguesStatus.js`, `data/ganguesItens.js` (30–39) |
| Personas da IA inimiga | `engine/ganguesPersonas.js` |
| Dano gravado durante a luta | `hooks/useGanguesDanoAoVivo.js` |
| Apostas (Banca do Tio Dado) | `data/ganguesApostas.js`, `components/cena/GanguesBanca.jsx` |
| Briga em Multidão / modo automático | `engine/ganguesBrigaMultidao.js`, `hooks/useGanguesModoMultidao.js`, `hooks/useGanguesModoAuto.js`, `hooks/useGanguesModoAutoMultidao.js` |
| Todo texto falado na Pista (pt/en/es, em ordem de fluxo) | `docs/Games/Gangues/PISTA_COMUNICACAO.md` |
| **Mecânica** (combate, progressão, skill tree, modo história) | Seção 17 desta bíblia |

---

## 13. Vocabulário de gíria de rua (referência pra escrever texto)

Banco de palavras pra puxar quando for escrever diálogo, nome de item, rótulo
de UI ou texto de flavor — **não é lista de tarefa**, é fonte de consulta.
Curada em cima de um dicionário de gírias do crime/cadeia brasileiro; ficam de fora
de propósito os termos racistas, homofóbicos/transfóbicos e a gíria de droga
pesada (a economia de vício do jogo já é fictícia — birosca/agiotagem — não
precisa emprestar vocabulário de droga real). O que entra é neutro o
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
attr_labels, btn_fugir}`.

## 14. Regras de texto do jogo

- Todo texto visível está em `src/i18n/gangues-{pt,en,es}.json`, nos 3
  idiomas, com adaptação livre de gíria por idioma (§13).
- Rótulo de UI neutro é de propósito (ATACAR, EQUIPAR, Comprar, Fechar);
  narração e fala usam gíria de rua de verdade.
- **Antes de apagar chave "morta" do i18n**, procure por
  `\$\{[^}]*[?|][^}]*\}` (ternário ou `||` dentro de template string, ex.:
  `` `games.gangues.progression.${equipado ? 'unequip' : 'equip'}` ``) e
  confira os dois lados manualmente — o grep simples não enxerga esses usos.
- Espanhol neutro latino-americano (tuteo, sem regionalismo de um país só);
  inglês americano natural. Nomes de personagem em EN/ES: conferir
  `story.bosses`/`enemy_names` antes de escrever texto novo.

## 15. Retratos e animação

### 15.0 Cabeça (pixel art)

- **Recrutáveis:** `assets/personagens/<slug>/neutro.png` (`<slug>` = campo
  `.slug` do catálogo). `data/ganguesPortraits.js` descobre por
  `import.meta.glob` — personagem novo é só criar a pasta.
  `getGanguesPortrait(slug)` / `getGanguesPortraitByTemplateId(id)`.
  Cobertura: os **12 oficiais** (ids 1–12). Os 18 restantes caem no fallback
  (inicial do nome).
- **Inimigos:** `assets/enemies/<slug>/neutro.png`, resolvidos por id numérico
  via `ENEMY_ID_SLUG` em `data/ganguesEnemyPortraits.js`. Cobertura: 26
  inimigos — o elenco de combate da Pista e alguns moldes de outros bairros;
  o resto cai no fallback (inicial).
- **NPCs:** `assets/npcs/<slug>/neutro.png` (§8).
- **Onde aparece:** recrutamento, elenco do lobby, roster de combate (os dois
  lados), painel do golpe, card de KO, fala final, relatório de vitória, álbum,
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
`getGanguesAnimacao(id, tipo)`), tocada em cima do painel do golpe — o
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

- **O 1º personagem que o jogador marca na fundação vira líder automático.**
  Aviso explícito na tela de recrutamento inicial
  (`recruitment.aviso_lider`).
- **Guardado em `storyProgress.__lider`** (mesmo JSONB/padrão de
  `__dificuldade`/`__torre`) — **não depende da ordem do array `roster`** (o
  roster da nuvem vem ordenado por `created_at DESC`). `getLiderId()` valida
  que o id salvo ainda existe no elenco (senão cai pro primeiro do roster).
- **Troca livre:** estrela clicável (`☆`/`★`) no card do elenco no lobby —
  `store.definirLider(sheetId)`. Sempre tem que ter um líder (não dá pra
  "desligar", só trocar).
- **Onde aparece:** a cabeça do líder (via retrato — ver seção 15) é o
  marcador de navegação flutuante na cena (`GangMarker`). Se ele ainda não
  tem retrato, cai no escudo genérico de sempre.
- **Planejado:** (1) IA de combate — um aliado tanque, quando existir a
  mecânica de "proteger", prioriza o líder como alvo de proteção; (2) desafio
  "líder contra líder" como modalidade de confronto (não confundir com o chefe
  comum de cada bairro).

---

## 17. Mecânica de combate e progressão (fonte única)

Fonte única da mecânica, conferida contra o código.

### 17.1 Ficha e atributos

- Cada personagem tem 5 atributos: **A** (Porrada), **H** (Pique),
  **D** (Couro), **PV** (Osso) e **PM** (Malandragem) (`GANGUES_ATTRS` em
  `data/ganguesCharacters.js`). Crescem por nível seguindo o `growth_order` autorado de cada um dos 30
  personagens do catálogo (o jogador não distribui pontos).
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
  adaptação livre por idioma, nunca tradução literal):

  | Código | PT | EN | ES |
  |---|---|---|---|
  | A | **Porrada** | Wallop | Trompada |
  | H | **Pique** | Pace | Pique |
  | D | **Couro** | Hide | Cuero |
  | PV | **Osso** | Grit | Aguante |
  | PM | **Malandragem** | Street Smarts | Viveza |
  | poderes | **Talento(s)** | Talent(s) | Talento(s) |

  O nome é só do atributo: a ação de atacar continua "ataque" no texto, e os
  identificadores de código são `A/H/D`, `onUsarPoder`, `orb.poder`.

- **Papel de cada atributo (sistema do Pique):**
  - **Porrada (A)**: ataque. **Couro (D)**: defesa. **Osso (PV)**: vida.
  - **Pique (H)**: só velocidade na linha do tempo (§17.2).
  - **Malandragem (PM)**: o pool de PM E a força dos Talentos (+metade dela
    em todo golpe de talento).
- **Nome dos caminhos na tela** (ids `atacante/defensor/mistico` no código): Atacante → **Porradeiro** (Brawler/Pegador), Defensor →
  **Paredão** (Wall/Muralla), Místico → **Mandingueiro** (Hexer/Brujo).
- **Velocidade é personalidade, não classe**: cada um dos 30 tem `speed_tier`
  (lento/médio/rápido) no catálogo. Crescimento por 20 níveis: base do caminho
  (Porradeiro A7 D5 Osso6 Mal2 · Paredão A5 D7 Osso5 Mal3 · Mandingueiro A5 D6
  Osso5 Mal4) e o Pique sai do Osso/Malandragem: lento Pique 1 (−1 Osso),
  médio Pique 2 (−2 Osso), rápido Pique 4 (−3 Osso −1 Mal). Porrada/Couro
  nunca pagam o Pique (com dano por subtração, 1 ponto a menos ali pesa
  demais). Todo mundo tem Pique.
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
  benefício de assinante no lançamento (**planejado**); hoje liberado pra todos.

- **Dado d3** (1 a 3) pros dois lados, ataque e defesa. Crítico = tirar o
  valor máximo (3) no dado de ataque, soma **+2** na rolagem (vira 5 no
  cálculo de FA). Só o ataque critica.
- **Sem dano mínimo garantido** — o clamp é `Math.max(0, ...)`: defesa bem
  investida pode zerar o golpe.
- **IA inimiga**: ataca depois de um delay fixo. Escolha de alvo evita
  repetir o último quando dá — ~55% mira em quem tem menos PV entre os
  vivos, ~45% escolhe aleatório (`pickEnemyTarget` em `useGanguesTurnMachine.js`).
### 17.2.1 Como o jogador age, e os modos de combate

- **A bolinha de ação** (`GanguesActionOrb`): no turno do personagem, o
  jogador escolhe **ATACAR** (ataque normal), **TALENTO** (um talento ativo
  equipado, gasta PM ou PV) ou **ITEM** (consumível da gangue). A bolinha usa
  `onPointerDown/Up`, não `onClick` (importa pra teste automatizado).
- **O painel do golpe** (`components/golpe/`): todo ataque abre um painel na
  parte de baixo da tela, com a luta visível atrás. Mostra quem bate em quem
  (rostos), **dois dados 3D** (three.js, `GanguesDado3D.jsx`, carregado só na
  luta: ataque vermelho, defesa azul, d3 de verdade com faces 1-1-2-2-3-3, o
  resultado na face de cima), **a conta inteira** (cada parcela de ataque e
  defesa: atributo, dado, crítico, arma, Malandragem, bônus de talento,
  armadura, quanto a defesa foi furada), o dano, a barra de PV do alvo caindo e
  cada efeito que entrou (talento, passiva, carta, escudo, status) com o rosto
  do dono. A regra que monta isso é `golpeConta.js`; o resolver devolve as
  parcelas em `result.conta`. A animação de sprite do golpe (§15.2) toca em cima
  do painel. Em 2x/3x fica sem sprite e mais rápido. Com o automático ligado o
  painel reserva o espaço da barra do automático.
- **Tela de resultado** (`components/resultado/`, organizada por
  `GanguesVictoryReport.jsx`): de cima pra baixo, vitória ou derrota (com quem
  caiu), o socorro da derrota, a recompensa (rosto, nível e barra de cada
  lutador, AP, grana, reputação, drops), os destaques (quem mais bateu, quem
  derrubou mais, maior golpe, rodadas, dano dos dois lados, críticos) e os
  detalhes fechados (estado final, ordem do Pique, registro). Botões presos
  embaixo. O modal de subida de nível é `LevelUpModal.jsx`.
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
  **só com ataque normal**. Está liberado pra todos (`MODO_AUTO_EXIGE_ASSINATURA
  = false`); quando ligado, vira vantagem de assinante (`TIERS_COM_MODO_AUTO` =
  elite e primordial). Um botão "sair do automático" fica logo abaixo do roster
  do jogador (posição medida, pra nunca tampar a barra de PV).
  - **É lembrado entre lutas, por save** (`useGanguesAutoLembrado`, chaves
    `ldi-gangues-auto`, `ldi-gangues-auto-multidao`, `ldi-gangues-briga-auto`,
    `ldi-gangues-auto-config` + `:<saveId>`): terminou a luta no automático, a
    próxima já começa com ele. Gangue nova nasce com tudo desligado. Só a
    velocidade segue global.
- **Briga automática da rua** (`hooks/useGanguesBrigaAutomatica.js`, tecla B):
  com o switch ligado, encostou num adversário, a luta começa. Voltar em cima
  dele e brigar de novo é o farm: na volta, quem anda nasce na ponta do
  caminho mais longe do jogador e vem buscar ele; em cima de quem é parado,
  emenda direto. Só briga barrada por trava (rep, dívida…) fica ignorada. Pra
  parar: botão "Parar briga de rua" na barra do automático dentro da luta.
- **Jogo vivo no fundo** (`hooks/useGanguesManterVivo.js`, montado no
  `GanguesRoute`): um `<audio>` de ruído quase mudo (2 s em loop) começa no 1º
  toque e fica tocando enquanto o Gangues está aberto, e os timers da página
  passam pra um Web Worker sempre que a aba esconde — o jogo não pausa com o
  app no fundo. Som de luta e `sfx` ficam mudos com a aba escondida. Limite:
  o navegador ainda pode matar a aba por memória ou economia de bateria.
- **"Mete o pé"** (fugir da luta) volta pra tela de **Modos**, não pro lobby.
- **Voltar nunca repete recompensa:** as fases de combate e vitória ficam fora
  da pilha de histórico (`GANGUES_FASES_TRANSITORIAS`) — senão Voltar duplica XP.

### 17.2.2 Personas da IA, status e cura

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
  Ativo a partir de 3 pontos de ficha, passiva a partir de 8 — os mesmos
  talentos do jogador.

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
  Só sai com item ou no **descanso completo** (5× o preço do descanso).
- **Itens de curar status** (consumível): 30 Gelo no Tornozelo (Moscando) ·
  31 Atadura (Sangrando) · 32 Café Forte (Braço Mole) · 33 Pomada de Arnica
  (Guarda Aberta) · 35 Balde de Água Fria (Apagado) · 36 Leite Quente
  (Batizado) · 37 Água com Açúcar (Grogue) · 38 Emplastro (Travado) · 39
  Babosa (Queimado) — 12 cada; **34 Xarope da Vó** cura todos (30). Lojas: §9.6.
  Dá pra usar na luta e na bolsa.
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
  pulsando, com o dono) e ganha linha no registro; o status que pegou aparece no dado com
  a explicação; o roster mostra o ícone + vezes restantes, e tocar no ícone
  mostra o que o status faz. Perder a vez (Apagado/Travado) e o Grogue
  acertando parceiro têm linha própria no registro.

### 17.2.3 Apostas

**Aposta só existe em dois lugares:** a **Banca do Tio Dado** e a entrada do
**Clube da Luta** de quem entra sem dívida (§4). Luta comum não tem aposta.

A Banca: regra em `data/ganguesApostas.js`, tela em
`components/cena/GanguesBanca.jsx`. O Tio Dado (POI `banca`, retrato emprestado
do Troco Certo/1402) fica na **sala dos fundos** da birosca.

- **Teto de aposta pela Rep**: <10 → 25 · <25 → 50 · <50 → 100 · 50+ → 200.
  Valores: 10, 25, 50, 100, 200 (só os que cabem no teto e na grana).
- **Desafio de mão**: escolhe a aposta e a dificuldade, o Tio Dado sorteia um
  puzzle da lib compartilhada (Simon, Decoder, Forca, Anagrama, Labirinto,
  Stealth). Resolveu, leva **×1,5 (Mole) · ×2 (Na medida) · ×3 (Cabuloso)**;
  errou, perde a aposta.
- **Rinha NPC × NPC**: duas fichas NPC do pool da rua, **mesma ficha** (≈8
  pontos na Pista), brigam sozinhas no motor da Multidão. A cotação sai de 150
  simulações da própria briga com **10% de margem da casa**, dos dois lados.

### 17.3 Poderes / especiais (skill tree)

- **15 subcaminhos** (5 por caminho × 3 caminhos), **5 poderes cada** = 75
  poderes catalogados (`data/ganguesSpecials.js`), valores reais aplicados
  em `engine/ganguesSpecialEffects.js`. Porradeiro: Bruto, Duelista, Fúria,
  Especialista, Vingador. Paredão: Muralha, Guardião, Provocador, Reativo,
  Resiliente. Mandingueiro: Ígneo, Aquático, Terreno, Tempestade, Ilusório.
- **Os 3 caminhos têm design próprio.** Os ids de subcaminho têm que bater
  com `signature_specials` do catálogo, senão o poder equipado não é achado
  em combate. Cada poder tem 3 níveis.
- **6º poder exclusivo por personagem**, nível 50, não repetido dentro do
  mesmo subcaminho.
- Poderes liberam/sobem via **AP → XP** (§17.4).
- **Equipados pra luta: 2 talentos, ativo ou passivo** (`selected_specials`,
  máx. 2 — `hydrateGanguesTemplateSheet` / `toggleGanguesTemplateSpecial` em
  `data/ganguesLoadout.js`). A técnica base vai sempre. Passiva só vale se
  estiver equipada. Talento novo entra sozinho se tiver vaga (puxa o mais
  novo, de qualquer tipo). A ficha (`GanguesSkillGrid`) tem EQUIPAR/TIRAR nos
  dois tipos, e todo lugar que mostra talento mostra o efeito
  (`describeGanguesSpecialEffect`): a ficha, o aviso de subida de nível e o
  dado quando a passiva dispara.

### 17.4 Progressão (AP, XP, nível)

- **AP base por inimigo = 10** (história ou Torre). Chefe vale 5×; Torre escala +100% a
  cada 5 andares. Derrota rende sempre 1 AP simbólico.
- **Recompensa por risco** (`apPorInimigo` em `engine/ganguesVictoryResolver.js`). Cada inimigo rende AP
  pela diferença entre a ficha DELE e a do **personagem mais forte da
  gangue** (total bruto A+H+D+PV+PM, não o time inteiro): encarar quem é mais
  forte rende mais que farmar fraco.

  | Ficha do inimigo vs. a do mais forte da gangue | AP por inimigo |
  |---|---|
  | mais de 5 pontos acima | **40** (quádruplo) |
  | 1 a 5 pontos acima | **30** (triplo) |
  | igual até 2 pontos abaixo | **10** (cheio) |
  | mais de 2 pontos abaixo | 10 − (pontos além dos 2) × (tamanho da gangue), **piso 5** |

  O piso de 5 é fixo (não por cabeça). O card de treta mostra
  um aviso de risco comparando **nível real** (`nivelRealDePontos` em
  `ganguesDificuldade.js`: nível 1 nasce com ~7 pontos), nunca pontos crus.
- **Divisão do AP entre a gangue** (`calcularPesosEParticipantes`): peso por
  faixa de contribuição (abates pesam mais que dano) — quem mais contribuiu
  pesa 3, a 2ª faixa pesa 2, o resto 1; empatados ficam na mesma faixa. Na
  derrota todo mundo pesa igual.
- **Grana da vitória** (`calcularGranaTotal`): base do bairro (10 na Pista ·
  15 · 20 · 30 · 40 · 55 · 75) + 5 por inimigo a mais no bando, inclusive nas
  tretas repetíveis; chefe garante um mínimo por território
  (`GANGUES_GRANA_CHEFE_MINIMO`, §9.7). POI com `semGrana: true` (as Rinhas)
  não paga grana, só XP. A Rep é autorada por POI.
- **Marcos de reputação:** a cada 50 de Rep acumulada, a gangue ganha um chip
  de poder (§9.3).
- **Regra da frustração:** **2 derrotas seguidas** na
  história (`storyProgress.__derrotasSeguidas`,
  `GANGUES_FRUSTRACAO_LIMIAR = 2`) fazem a próxima treta comum vir com **um
  inimigo só, um degrau (3 pontos) abaixo** do normal (`suavizarPorFrustracao`).
  Zera em qualquer vitória.
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
  - Não existe custo escalonado por atributo: todo nível sobe atributo.
- **1ª luta de toda conta nova é suavizada** (1 corpo só, metade dos
  pontos) — `suavizarPrimeiraLuta` em `data/ganguesEncontros.js`. É global
  por conta, não por território.

### 17.5 Tamanho de gangue e elenco

- Batalha da história começa travada em **2 fichas** (`GANGUES_INITIAL_PARTY_SIZE`),
  cresce **+1 vaga por território dominado** até o teto de **6**
  (`GANGUES_STORY_BATTLE_PARTY_MAX`, `getGanguesRosterLimitComHistoria`) —
  o maior valor entre "quanto o tier paga" e "quanto a história liberou"
  vale, não soma os dois.
- Limite de **fichas no roster** por tier: 2 pra todos os planos (`GANGUES_ROSTER_LIMITS`) — cresce de verdade é pela história, não
  pela assinatura.
- **Saves**: 1/2/3 por tier free/elite/primordial (`GANGUES_SAVE_SLOT_LIMITS`).

### 17.6 Modo História — a cena navegável

Os 7 bairros são cenas navegáveis (`data/cenas/<id>/`, §4), todas no mesmo
motor e no mesmo sistema de pontos fixos.

- Cada bairro-cena é um mapa navegável com **5 tipos de POI**: **Treta**
  (combate), **Parada** (mini-jogo, falhar pode virar treta), **Papo**
  (diálogo com escolhas), **Corre** (tarefa/stealth), **Achado** (loot sem
  interação) — mais `Descanso`, `Loja`, `Agiota`, `Banca`, `Ferreiro` e `Jogo`.
- **Grafo de descoberta**: POI escondido não aparece; resolver um revela o
  próximo. Portão do chefe só abre com os POIs-chave batidos.
- **Economia**: Grana (gasta em descanso/loja/ferreiro) e Rep/Nome (destranca
  POI, alimenta % de domínio). PV/PM perdido persiste dentro do bairro; só
  volta ao cheio saindo ou dominando.
- **Descanso, agiota, Clube da Luta e derrota**: §4 (Pista).
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
  entrar no Clube da Luta sem dívida (`GANGUES_REP_GATE_CLUBE`). Reputação é
  "risco liberado", não vaga de elenco.
- **Bando inimigo é NÍVEL FIXO:** cada nó/POI tem um
  `pontosFixo` autorado (ladder subindo em degraus — ver `pontosFixo` nos
  POIs de `data/cenas/<id>/`), e a
  dificuldade escolhida (fácil/médio/difícil) só soma/tira um valor fixo em
  cima disso (`GANGUES_DIFICULDADE_AJUSTE` em `data/ganguesDificuldade.js`
  — ±2 por padrão, único lugar do jogo que decide isso). Chefe continua com
  orçamento **fixo** próprio (`GANGUES_CHEFE_BUDGET`), sempre o mais forte do
  bairro — o loop de RPG é o jogador voltar mais forte, não o chefe ficar mais
  fraco.
- **Ladder da Pista** (ficha em pontos por corpo; "rev" = revezamento:
  quase sempre 1 inimigo, às vezes dupla, e o 2º corpo sai 2–3 pontos
  abaixo). Regra: **a 1ª luta é muito fácil de propósito (3); da 2ª em diante
  sobe de 3 em 3, sem exceção; o chefe quebra o padrão pra ser ralado.**

  | Ponto | Ficha | Forma | Obrigatório |
  |---|---|---|---|
  | `sinal` (apertar o pivete) | 3 | rev, dupla 15% | sim |
  | `rinha` (farm infinito) | de 8 a 4 abaixo do seu mais forte (§ Rinha abaixo) | rev, dupla 35% | não |
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

- **A Rinha** (todo bairro tem uma; POI com `rinhaInfinita`, `semGrana`) é
  pra grindar: luta fraca e rápida, uma atrás da outra
  (`useGanguesAvancoAutomatico({ forcar })`; a casa remenda a tropa da 2ª luta
  em diante).
  - **Ficha:** de **8 a 4 abaixo** da ficha do teu mais forte, pesada pro lado
    fraco (`GANGUES_RINHA_FAIXA`, −8 e −7 os mais comuns); teto duro em −4
    (`GANGUES_RINHA_TETO`, corta também o estouro de arredondamento).
  - **Luta marcada:** uma a cada 5 a 8 lutas (sorteado,
    `storyTarget.rinhaForteEm`, `avancarRinha`), em −8
    (`GANGUES_RINHA_MARCADA`).
  - **Perdeu com grana:** a casa cobra a recuperação do bairro (3× o descanso,
    `custoRecuperacaoRinha`) e a roda segue. **Perdeu sem grana:** a Rinha
    acaba e vale o socorro de derrota normal (§4).
  - **App no fundo:** 20 s de folga (troca rápida de app), depois desmonta e
    entra no modo calculado — 1 luta a cada 5 min (`simularFarmRinha`,
    `engine/ganguesFarmAusente.js`, marca `storyProgress.__farmAusente` gravada
    na hora), com cartão de resumo na volta. Fora da Rinha o jogo segue ao vivo
    no fundo (§17.2.1), sem marca nem cartão.

### 17.7 Persistência

- Logado: ficha inteira (incluindo XP/poderes equipados) salva em
  `gangues_fichas` (Supabase), progresso de história em `gangues_saves` —
  ambos com debounce de escrita, sem depender de `localStorage` pra dado
  de jogo.
- **Dano gravado ao vivo** (`hooks/useGanguesDanoAoVivo.js`): PV, PM e status
  do time vão pro store a cada golpe e pra nuvem com debounce de 1,5s — e na
  hora em que a aba vai pro segundo plano.
- Estado que precisa sobreviver ao app ir pro fundo mora no save, nunca só na
  memória da página.
- **Sem save local:** guest joga tudo em memória e perde ao recarregar —
  banner avisa. No `localStorage` só ficam preferências (automático por save,
  velocidade, volume, flags de tutorial "já visto" escopadas por save).
- **Logout limpa o store do Gangues** (`AuthContext.jsx`, no
  `onAuthStateChange`).

### 17.7.1 Controles e opções

- **Teclado** (`hooks/useGanguesTeclado.js`): E/Enter/Espaço confirmar ·
  Esc fechar/voltar · 1–9 opção N · A atacar · B briga automática · I mochila
  · F ficha · setas/WASD andam · O abre as Opções (fora de campo de texto).
  Overlay por cima de outra tela usa `prioridade` 1. Botão que só reage a toque
  (`onPointerDown/Up`) precisa de atalho.
- **Opções** (`components/GanguesOpcoes.jsx`, botão ⚙ na fundação, nos saves
  e no lobby): volume geral dos efeitos (`ldi-sfx-volume`, todo som do jogo
  passa por `sfx`), liga/desliga som, e o aviso de controles (muda no
  computador). A trilha é a Rádio Nina do site.

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
├── components/           # peças reutilizadas (golpe/, resultado/, orb, pista do Pique…)
│   └── cena/             # peças da cena navegável (atores, loja, descanso, agiota…)
├── clube/                # Clube da Luta: telas, regras e slice próprios
├── data/                 # catálogos (30 personagens, 103 inimigos, itens, equip,
│   └── cenas/<bairro>/   # especiais, territórios, encontros, chefes) — dados, não UI
├── engine/               # resolver, linha do tempo, Multidão, efeitos, cena,
│                         # encontro aleatório, vitória, status, personas (IA)
├── hooks/                # turno, auto, Multidão, movimento de cena, i18n,
│                         # dano ao vivo, teclado, trem, briga automática, manter vivo
└── store/
    ├── useGanguesStore.js    # composição das slices (zustand)
    └── slices/               # save, sheet, story, progression, equip, colecao,
                              # birosca, cenaEconomia, cenaProgresso, match
```

CSS: `scripts/gangues-css-audit.cjs` roda no `predeploy` e barra seletor morto,
arquivo > 500 linhas, `@media` por largura ≥ 480px, `vw` cru e `fixed` com
`inset: 0`.

### 17.9 Referência completa — atributos e poderes por personagem (a cada 5 níveis)

Como cada um dos 30 personagens evolui, atributo por atributo, a cada 5 níveis
até o teto (99), e em qual nível exato cada poder abre/sobe de rank. Gerado direto do catálogo real
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
