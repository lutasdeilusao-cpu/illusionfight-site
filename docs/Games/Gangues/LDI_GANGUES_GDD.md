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
> **Fonte narrativa:** o conto **"Alan, o Campeão"** (`src/data/livro/contos/pt/02/01.md`
> … `19.md`, contos-index id `02`). O jogo é o pano de fundo histórico desse
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

> **Última revisão geral: 27/09/2026 — conferido contra o código de
> GANGUES 3.63.0 (SITE 10.295.x).** Entrou nesta revisão: **não existe game
> over** (§4, Pista), o **automático lembrado entre lutas** (§17.2.1), a
> **pista em raias** da linha do tempo (§17.2), a **sirene** do encontro com
> a polícia (§4), os pools de inimigo reais da Pista (§4), a pasta
> `styles/` + auditoria de CSS no deploy (§17.8), e correções: rótulos de
> atributo (§17.1), roster × time de batalha (§17.5), escala de nível dos
> chefes e AP da §12 (estavam da época do "1 nível = 1 ponto"), e o aviso de
> que os equipamentos raros não têm fonte nenhuma no jogo hoje (§9.4).
> Planejamentos novos (não implementados): **a Feira** em
> `PLANO_FEIRA.md` e **range + aprimoramento de equipamento** em
> `PLANO_ITENS_RANGE.md` (mesma pasta deste GDD).
>
> **Revisão geral anterior: 26/09/2026 — conferido contra o código de
> GANGUES 3.56.0 (SITE 10.293.1).** Esta revisão trouxe pro GDD tudo o que
> entrou no jogo entre a v3.30.0 (19/09) e a v3.56.0 (22/09) e que só
> existia no código: a agiotagem refeita (agora com o agiota **Marimbondo**,
> empréstimo em dinheiro e escada de dívida), o descanso com 2 preços,
> **"o bicho"** (depois substituído pelo encontro aleatório perseguidor, v3.61.0), a **Lojinha do Zé**, a recompensa por risco (AP), a fórmula
> de grana da vitória, a regra da frustração, o gate de dívida do chefe, a
> Briga em Multidão, o modo automático e o farol dos pinos. Também marcou
> como **planejado (não implementado)** o que o GDD descrevia como pronto
> mas não está no código: consumíveis 3–12 e equipamentos 121–139 (incluindo
> os 8 épicos de chefe).

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
| 3000–3099 | NPCs não-combatentes |
| 1–99 | Itens consumíveis *(contexto separa de "território")* |
| 101–999 | Equipamento |
| 10000+ | Cartas de socket (sistema futuro) |

> **✅ IMPLEMENTADO (v2.66.x, 2026-09-08).** `data/gangues-enemies.json` tem as
> **98 fichas** com id numérico + bloco `album` (91 da hierarquia + 7 chefes);
> `data/ganguesInimigos.js` é o módulo-catálogo. Tela `GanguesAlbum.jsx`
> acessível pelo lobby. As 70 fichas novas têm stats por fórmula
> (cargo × território) e trash_talk genérico por cargo — calibrar jogando.
>
> **O Ranking Clandestino foi REMOVIDO do projeto** (v2.66.1) — eram ecos de
> cânone antigo (O Coveiro/Kronos, Breu/Jack, Corte Fundo/Kaeda, Cascudo/Viran,
> etc.). O Modo Batalha avulso já estava bloqueado; `enemies_unlocked`,
> `unlockNextEnemy` e `GanguesEnemyPick` saíram junto.
>
> **Banco (v2.67.0):** o Gangues tem tabelas próprias — `gangues_saves` (a
> gangue/save) e `gangues_fichas` (os lutadores). Não toca mais em
> `character_sheets` (que é da "Lendas do LDI"). Migration única
> `038_gangues_church_unified.sql` substitui as 031–037 e faz reset total —
> beta, sem compat de save.
>
> **O álbum se organiza por CARGO, não por bairro.** Cada bairro tem inimigos em
> vários níveis de cargo; a UI do álbum tem abas por cargo
> (Vigia → Vapor → Gerente → Cobrador → General → Chefes), cada uma enchendo
> conforme o jogador sobe os bairros. A última aba de cada território é sempre o
> **General** — o "quase-chefe" que sinaliza que o portão vai abrir.
>
> Crosswalk das 28 fichas que eram string → id numérico: §5.7.

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

**POIs (estado atual, v3.63.0 — `data/cenas/pista/pois.js`):**

- **Obrigatórios pro portão** (`portao.precisa`, 8): A boca do sinal (`sinal`) ·
  O ferro-velho (`ferro`, `PuzzleSimonSays`) · **A oficina do Nando**
  (`oficina` — fetch quest estilo Zelda: junta 2× sucata, uma do `ferro` e
  outra do `achado`, e o Nando forja a Soqueira de Lata, 101, grátis + conta
  onde o Carvão se esconde) · O beco da Rasteira (`beco`) · O outro ponto da
  Rasteira (`beco_2`) · O terceiro ponto (`beco_3`) · **O Sinaleiro Chefe**
  (`sinaleiro`, 1451, General) · **A Rasteira Velha** (`rasteira_velha`, 1452,
  General). Os dois generais entram no Álbum aqui, antes do chefe.
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
- **Removido em 20/09/2026:** o POI `birosca` (papo à parte), que duplicava o
  Descanso. Estava preso em `portao.precisa` e fazia o portão nunca abrir —
  corrigido em 21/09/2026.

Ladder de força de cada ponto, lojas, descanso e agiota: §17.6.

**Mapa de RPG (v2.73–2.74):** o exterior é favela desenhada em CSS (barraco /
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

**Descanso, agiota e Clube da Luta (redesenho de 21/09/2026, v3.49–3.54 —
substitui por completo o fiado 5×/10× por contagem de antes):**

- **A birosca do Seu Nato (`descanso`) é só cura, sem dívida nenhuma.** Duas
  opções de preço: **10** recupera só quem **não caiu** (PV > 0); **30** (3×)
  recupera **todo mundo, revivendo os caídos**, com animação mais longa.
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
    (`data/ganguesLoadout.js`; o nome "NATO" ficou por legado, o texto na tela
    já fala do agiota).
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
  - **Vitória na ronda 3:** quita **toda** a dívida. Se entrou limpo e não
    pediu nenhum ajeite, leva ainda **+200 de grana**. Nunca dá XP.
  - **Derrota:** te remendam, a dívida **não cresce mais**, fica o que
    acumulou. Nunca é game over.
- **Trava:** tropa inteira no chão (todos PV 0) não entra em luta nenhuma.
- **Não existe game over (27/09/2026, v3.63.0).** Perdeu uma luta na cena
  (treta, chefe ou encontro aleatório — fora o Clube e a Torre, que têm regra
  própria): a tropa é **arrastada pra birosca mais perto** e acorda **lá
  dentro**, do lado do descanso, **recuperada por completo** (inclusive os
  caídos). A birosca é escolhida por `destinoSocorroDerrota`
  (`data/cenas/cenaHelpers.js`): qualquer interior com POI de descanso, o
  pós-muro só se o túnel/muro já abriu, o mais perto de onde o jogador estava,
  preferindo o mesmo lado do muro. A recuperação é o descanso que revive
  (**30**, 3× o preço) e é **cobrada na hora, sem perguntar**
  (`socorroDerrota`, `ganguesBiroscaSlice.js`):
  1. **Tem os 30** → paga do bolso.
  2. **Não tem e nunca pegou empréstimo** → o agiota empresta sozinho (**100**
     na mão, dívida **1.000**), a birosca leva os 30 e sobra o troco (**70**
     se estava zerado).
  3. **Não tem e já deve** → pega só os **30** emprestados, só que a **10×**:
     **+300 na dívida**. **Sem teto** nesse caminho — a dívida vai escalando.
     Passando do teto de 10.000, o agiota passa a oferecer o "socorro" (Clube
     forçado) normalmente.
  - A tela de derrota mostra a conta (`.gang-socorro-panel`) e o botão vira
    **"Acordar na birosca"**. A ideia do Isaias: "o jogo não dá game over, mas
    deixa uma dívida monstra" — e **só o Clube da Luta quita** (vencer a ronda
    3 zera tudo, sem XP; aceitar ou não o "ajeite" entre rondas não impede
    quitar, só decide os +200 de quem entrou limpo).
  - Territórios ainda no formato de trilha (sem cena, sem birosca) continuam
    com a derrota antiga (volta pro território).
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

**Encontro aleatório — o perseguidor (v3.61.0, 26/09/2026 — substitui por
completo "o bicho"):**

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
  arte por enquanto = bolinha colorida, moto e viatura vêm depois; desde a
  v3.62.3 a **polícia pisca a tela em vermelho/azul — sirene —** enquanto a
  viatura está no mapa e durante a onomatopeia, `.gang-cena-sirene`):

  | Tipo | Bolinha | Quem | Onomatopeia |
  |---|---|---|---|
  | **Dois numa moto** (assalto — "todo mundo tá sujeito") | amarela | 2–3: Piloto (1701) e Garupa (1702), ~90% do mais forte | VRUUUM! |
  | **A Ronda** (polícia) | azul | 2–3: Soldado (1711) e Cabo da Ronda (1712), no nível do mais forte | PARADO! |
  | **Bonde Rival** (outro bairro vem tirar satisfação) | vermelha | 3–4 de Feira/Baixada (1204–1209), ~75% | BANG! |
  | **O Cobrador** (vem cobrar o salve da Banca) | roxa | 2: cobrador (1401–1406) + capanga, ~115% | PÁ! |

  O 1º encontro é sempre a moto e o 2º a polícia; depois sorteia entre os 4, sem
  repetir o anterior. As fichas 1701–1712 ficam fora do Álbum (não são cargo da
  hierarquia).

**Balanço (v3.30.0, 19/09/2026 — substitui o ratio de v2.68.0):** todo bando do
jogo (rua, revezamento, chefe, evento) agora parte de um número de pontos FIXO
autorado por quem criou o encontro (ladder ponto-a-ponto, não mais um ratio
contra o total de pontos do time do jogador). Pedido do Isaias: "força
numericamente, é mais fácil de balancear". A dificuldade escolhida
(fácil/médio/difícil) soma ou tira um valor fixo em cima desse número — ver
`GANGUES_DIFICULDADE_AJUSTE` em `data/ganguesDificuldade.js`, o ÚNICO lugar
que decide isso pro jogo inteiro. Curva completa em §17.6 desta bíblia.

**Encontro de revezamento — dungeon (v2.74.5):** as tretas dentro do túnel (e
futuramente do galpão) NÃO usam a geração de bando do território. Um POI `treta`
com `revezamento: { pool:[ids], budgetPorCorpo, chanceDupla }` chama
`gerarBandoRevezamento` — sorteia 1 capanga (às vezes 2, pela `chanceDupla`) de
um punhado de fracos que se alternam, orçamento leve e FIXO por corpo (não escala
com o jogador). É o "estilo Pokémon" pedido pelo Isaias: quase sempre 1 sozinho,
de vez em quando uma dupla, sempre leve. Túnel da Pista: m1 `[1101,1102,1103]`
b4/0.22 · m2 b6/0.45 · m3 b5/0.30. **Pools reais hoje** (`data/cenas/pista/pools.js`):
`PISTA_POOL_TUNEL` = 1101–1110 (m1 e m3), `PISTA_POOL_RUA` = 1101–1109 +
1201–1205 (m2, e todas as tretas de rua), `PISTA_POOL_GALPAO` =
1206/1207/1208/1301/1302/1303/1401/1402 (pós-muro e galpão).

**Também nas primeiras tretas de rua (v2.74.6):** `beco` (a 1ª treta de
verdade), a `rinha` (farm) e as brigas-punição (`sinal`→apertar o pivete,
falhar a gazua do `ferro`) trocaram o `enemy` fixo / o sorteio dos 11 moldes
por `revezamento` do pool de rua (na v2.74.6 eram só 5 ids; hoje é o
`PISTA_POOL_RUA` inteiro, 14 fichas — 1101–1109 + 1201–1205). Antes a
`aperta`/`falha` davam SEMPRE uma Ratazana sozinha; agora sorteiam do pool,
quase sempre solo. Isso
vale para `viraTreta.revezamento` (não só `poi.revezamento`).

### Território 2 — A Feira · Muvuca · `#7ee787`
Facção: Acerto de Contas (103) / Os Gato (104). O comércio, os camelô, a luz de
gato. Aqui não tem tiro — tem **dívida**. Primeiro território costurado pelo
Retalho sem sangue.

POIs: **A banca do Turco** (onde a dívida é anotada, cabeça do esquema) · **O
beco da luz de gato** (Os Gato fazem a ligação clandestina) · **A feira de
domingo** (movimento intenso, boa pra se esconder ou negociar) · **O fiado da
Dona Regina** (NPC que empresta em troca de favor) · **A oficina de rádio**
(conserta rádio pirata, ponto de informação).

> **Plano da cena navegável da Feira (27/09/2026, não implementado):**
> `PLANO_FEIRA.md` — 37 eventos, a Feira em duas metades (de dia / no
> apagão), a Galeria dos Gato e o Mercadão como dungeons, ladder 26 → 47 e o
> Cobrador em 52, e a versão "upgrade" de cada sistema da Pista.

### Território 3 — A Baixada · Correria · `#18dafb`
Facção: os 3 cacos do Sombra (105/106/107). Do outro lado da linha do trem. A
facção do Sombra rachou em três. **Fragmentação** — o que acontece quando um
território perde o dono.

POIs: **A linha do trem** (fronteira física e simbólica com a Pista) · **O
valão** (onde o Sombra morreu, ninguém entra à noite) · **O barraco do Sombra**
(abandonado, cada caco disputa o direito de ocupar) · **O trio de esquinas**
(cada caco domina uma, briga constante entre elas).

### Território 4 — A Vila · Disputa · `#ffae32`
Facção: Bonde dos Prédio (108) / Os Andar de Cima (109). O conjunto, os prédios
de dez andares, a escada sem luz. **Resistência militarizada** — a única região
que entrou na órbita do Retalho por guerra.

POIs: **O térreo do bloco A** (primeira linha de defesa do bonde) · **A escada
sem luz** (sobe apanhando, andar por andar) · **O elevador quebrado**
(puzzle/obstáculo, atalho arriscado) · **A cobertura** (onde Os Andar de Cima
vivem, vista de toda a Vila).

### Território 5 — O Morro · Guerra · `#ff8f3c`
Facção: Frente da Escada (110) / Os Fogueteiro (111), sob Zefa. A favela de
encosta, a escadaria que muda de forma a cada laje nova. **Lealdade pessoal** — a
região que nunca foi realmente dominada, só negociada.

POIs: **A escadaria de cimento** (única subida, guardada pela Frente da Escada) ·
**A boca da Zefa** (onde ela recebe quem quer negociar) · **O posto de rojão**
(sistema de alerta dos Fogueteiro) · **A creche da Zefa** (onde ela criou a
molecada, intocável até pra rivais).

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

★ = já tem ficha de combate em `data/gangues-enemies.json` (ver crosswalk §5.4).
Os demais são canônicos mas ainda sem ficha.

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
| 1201 ★ | Ratazana | Pista | facão | Cria de ponto — a primeira treta de verdade da Pista. |
| 1202 ★ | Brasa | Pista | estilingue | Copiava o Carvão até o apelido colar. |
| 1203 | Chinelada | Pista | sandália reforçada | Briga suja, ataca 2× mais rápido, dano baixo. |
| 1204 ★ | Choque | Feira | faca | Faz ligação clandestina, some no meio das bancas. |
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
| 1301 ★ | Cão Louco | Pista | corrente | Agressivo, um degrau acima da cria de ponto. |
| 1302 | Riscado | Pista | canivete | Cicatrizes de quem já perdeu pra ele — troféus de guerra. |
| 1303 | Mão de Cola | Pista | corrente curta | Rouba o que vê, não solta o que pega. |
| 1304 ★ | Unha de Fome | Feira | porrete | Cobrador de rua — bate antes do chefe cobrar de verdade. |
| 1305 | Caderneta | Feira | — | Sabe o que cada morador deve, usa como arma psicológica. |
| 1306 | Pesagem | Feira | balança de ferro | "Pesa" tudo — inclusive gente, literalmente. |
| 1307 | Herdeiro | Baixada | faca dupla | Afirma ser sucessor legítimo, ninguém reconhece. |
| 1308 ★ | Sangria | Baixada | faca | O mais bravo dos três cacos do Sombra. |
| 1309 ★ | Gelo | Baixada | faca | O caco calculista — não erra. |
| 1310 ★ | Cadeado | Vila | chave de cano | Toma conta do térreo. |
| 1311 ★ | Trinco | Vila | chave de cano | Comanda um andar inteiro. |
| 1312 | Elevador | Vila | cano curto | Só ataca em espaço fechado, luta suja em corredor. |
| 1313 ★ | Cupim | Morro | faca | Vigia da escadaria com autoridade sobre a subida. |
| 1314 ★ | Cascalho | Morro | faca | Capitão — subiu rápido, bate mais forte que todo mundo. |
| 1315 | Última Escada | Morro | bastão | Guarda a última curva antes do Alto do Morro. |
| 1316 ★ | Verme | Alto do Morro | porrete | Um dos cinco que quase viraram cúpula. |
| 1317 ★ | Presa | Alto do Morro | porrete | Braço-direito da cúpula quase formada. |
| 1318 ★ | Engrenagem | Alto do Morro | corrente | Luta em formação, protege o centro. |
| 1319 ★ | Fiapo | Laje | facão | Primeira linha do bonde do Retalho. |
| 1320 ★ | Agulha | Laje | facão | Segunda linha, confiança de metade da Laje. |
| 1321 | Linha Reta | Laje | facão longo | General mais antigo, sem movimento desperdiçado. |

### 5.4 Nível 4 — COBRADOR (faixa 1401–1414)

Resolve dívida na marra. Já é um combatente sério, um degrau abaixo de encarar o
chefe.

| ID | Nome | Território | Arma | Lore |
|---|---|---|---|---|
| 1401 | Bala Solta | Pista | estilingue de metal | Vendedor de bala que guarda pedra no bolso. |
| 1402 | Troco Certo | Pista | porrete | Cobra até a última moeda, nunca erra a conta. |
| 1403 ★ | Marreta | Feira | porrete | Braço de confiança, cobra dívida grande sem conversa. |
| 1404 | Juro Alto | Feira | porrete de metal | Dobra a dívida se o prazo passar. |
| 1405 ★ | Sobra | Baixada | corrente | O mais desesperado dos cacos — nada a perder. |
| 1406 | Resto de Faca | Baixada | faca dupla | Cobra em nome dos três cacos ao mesmo tempo. |
| 1407 ★ | Goteira | Vila | taco | Olha o bonde de cima pra baixo. |
| 1408 | Aluguel Vencido | Vila | chave de cano | Cobra o "aluguel" que o bonde impõe em cada andar. |
| 1409 ★ | Pavio Curto | Morro | rojão (fogo) | Solta aviso, não se importa de acertar você. |
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
| 1463 ★ | Tesoura | Laje | facão | General — comanda a Laje inteira em nome do Retalho. |
| 1464 | Corte Certo | Laje | facão gêmeo | Braço-direito da Tesoura, nunca erra o corte final. |

### 5.6 ~~Ranking Clandestino~~ — REMOVIDO (v2.66.1)

A faixa **2001–2099 não existe mais**. Eram 8 fichas que ecoavam o cânone maior
do LDI (O Coveiro ← Kronos, Breu ← primordial Jack, Corte Fundo ← Kaeda, Cascudo
← Viran, Quebra-Queixo, Curto-Circuito, Traça, Saco de Pancada). Serviam ao Modo
Batalha avulso, que já estava bloqueado. Removidas do `gangues-enemies.json`, do
i18n, e junto com elas: `enemies_unlocked`, `unlockNextEnemy`, `GanguesEnemyPick`,
e o bloco `npc_names` (personas Azuma/Karnazar/SDR/Bravara/Xakaxi — mesma matéria
de eco de cânone). Se um dia voltar um Modo Batalha, ele puxa da própria
hierarquia (1101–1464), não de um roster à parte.

### 5.7 Crosswalk — fichas migradas de string → id numérico

As 28 fichas que existiam em string, com stats (A/H/R/D · PV/PM) e o id oficial:

| string atual | Nome | stats | id novo |
|---|---|---|---|
| `moleque_a` | Ratazana | 1/0/2/1 · 6/6 | 1201 |
| `moleque_c` | Brasa | 1/1/2/2 · 8/4 | 1202 |
| `gato_eletrico` | Choque | 2/3/4/1 · 12/12 | 1204 |
| `moleque_b` | Cão Louco | 2/1/3/1 · 9/9 | 1301 |
| `turco_batedor` | Unha de Fome | 2/1/3/1 · 9/9 | 1304 |
| `sombra_rubra` | Sangria | 3/1/4/2 · 12/12 | 1308 |
| `sombra_fria` | Gelo | 2/2/4/3 · 16/8 | 1309 |
| `bonde_predio_1` | Cadeado | 2/1/4/3 · 16/8 | 1310 |
| `bonde_predio_2` | Trinco | 3/2/6/3 · 18/18 | 1311 |
| `frente_escada_1` | Cupim | 3/3/6/2 · 18/18 | 1313 |
| `frente_escada_2` | Cascalho | 4/3/7/3 · 21/21 | 1314 |
| `os_cinco_1` | Verme | 4/3/5/2 · 20/10 | 1316 |
| `os_cinco_2` | Presa | 5/3/8/3 · 24/24 | 1317 |
| `a_roda` | Engrenagem | 5/3/7/4 · 28/14 | 1318 |
| `bonde_costura_1` | Fiapo | 4/4/8/3 · 24/24 | 1319 |
| `bonde_costura_2` | Agulha | 5/4/9/4 · 27/27 | 1320 |
| `turco_capanga` | Marreta | 2/2/3/1 · 12/6 | 1403 |
| `os_restos` | Sobra | 3/2/5/1 · 15/15 | 1405 |
| `andar_de_cima` | Goteira | 2/2/5/3 · 20/10 | 1407 |
| `fogueteiro` | Pavio Curto | 5/2/11/3 · 22/44 | 1409 |
| `bonde_costura_3` | Tesoura | 6/4/8/4 · 32/16 | 1463 |
| `fumaca` | Carvão | 3/1/4/1 · 12/12 | 1500 |
| `turco` | O Cobrador | 3/2/4/2 · 16/8 | 1501 |
| `espeto` | Fura-Bucho | 4/2/5/2 · 20/10 | 1502 |
| `sala` | Ferrugem | 3/2/5/4 · 20/10 | 1503 |
| `zefa` | A Fera | 4/3/12/4 · 24/48 | 1504 |
| `doutor` | O Contador | 5/4/15/5 · 30/60 | 1505 |
| `costura` | O Retalho | 6/5/17/5 · 34/68 | 1600 |

`preferred_mode` → caminho de combate: `fists→atacante`, `armed→defensor`,
`power→místico`.

---

## 6. Dossiê dos chefes (faixa 1500–1600)

### 1500 · Carvão — Chefe da Pista
Facção: Rato de Pista (101) · Arma: facão · Stats: 3/1/4/1 · 12/12.
Fala: *"Cê é ligeiro? Eu sou fumaça, cria. Pisca que eu sumo — e cê apanha no
escuro."* Some no meio da rua, ataca no escuro. Só desce pra encarar quando a
Pista inteira já conhece o nome da sua gangue.

### 1501 · O Cobrador — Chefe da Feira
Facção: Acerto de Contas (103) · Arma: porrete · Stats: 3/2/4/2 · 16/8.
Fala: *"Marélia inteira me deve. Agora a {suaGangue} também. Aqui quem não paga
em dinheiro, paga no osso."* Anota tudo, cobra tudo. Bate no braço antes de bater
na cara.

### 1502 · Fura-Bucho — Chefe da Baixada
Facção: os três cacos, temporariamente unidos sob ele · Arma: espeto · Stats:
4/2/5/2 · 20/10.
Fala: *"A Baixada é minha desde que o Sombra caiu no valão. Cê tomou meus ponto?
Vem tomar o resto."* Segura os três cacos numa lealdade frágil.

### 1503 · Ferrugem — Chefe da Vila
Facção: Bonde dos Prédio (108) · Arma: taco · Stats: 3/2/5/4 · 20/10.
Fala: *"Subiu os dez andar só pra apanhar no último? Respeito a disposição. Não
muda merda nenhuma."* Mora no último dos dez andares — a exaustão é a arma dele
antes da porrada.

### 1504 · A Fera / Zefa — Chefe do Morro
Facção: Frente da Escada (110) · Arma: vara · Stats: 4/3/12/4 · 24/48.
Fala: *"Eu criei metade da criançada que a {suaGangue} bateu pra chegar aqui.
Senta aí. O teu castigo vai demorar."* Sabe exatamente onde bater pra doer sem
machucar de verdade — a única chefe tratada como figura materna da quebrada.

### 1505 · O Contador — Chefe do Alto do Morro
Facção: A Roda (113) / Os Cinco (112) · Arma: bengala · Stats: 5/4/15/5 · 30/60.
Fala: *"Cê tem dois lutador. Eu tenho o Alto do Morro inteiro devendo favor. Faz
a conta e vai embora."* Não briga por raiva, briga porque a conta fecha assim.

### 1600 · O Retalho — Damião — Chefe Final
Facção: Bonde do Retalho (114) · Arma: facão · Stats: 6/5/17/5 · 34/68.
Fala: *"Marélia inteira já foi minha uma vez. Seis bairro na mão, a Laje no pé.
Só que essa porra não costura — nem eu segurei. Sobe aqui que eu te mostro na
marra."* O único que já segurou seis bairros de uma vez. Generais: **Tesoura**
(1463), **Corte Certo** (1464), e as linhas Fiapo (1319) / Agulha (1320).

---

## 7. Os 30 lutadores recrutáveis (o elenco do jogador)

Catálogo `ldi_gangues_30_personagens_v1.json` (fonte única — esta tabela é gerada
a partir de `unlock_plan`/`id`/`combat_path`/`special_path`/`max_evolution` do
catálogo, nunca autorada à mão). Nome curto de rua + subcaminho + título de
evolução máxima (nível 99, teto de personagem jogável).

**Ids 1-12 = os 12 personagens oficiais** (os únicos com arte pronta —
`RECRUTAVEIS/`: Trinca, Fenda, Muro, Catraca, Faísca, Cicatriz, Marreta, Mira,
Navalha, Ponto, Sangue, Troco), liberados durante o gameplay **principal**:
**`w1` = ids 1-5**, os 5 iniciais, disponíveis desde o começo · **`w2` = ids
6-12**, 1 por território derrotado (7 territórios ao todo — a Pista + os 6
bairros), na ordem: 6 Cicatriz, 7 Marreta, 8 Mira, 9 Navalha, 10 Ponto, 11
Sangue, 12 Troco. **Ids 13-30** (sem arte ainda) ficam fora do gameplay
principal por ora: `w3` = liberado ao zerar a campanha uma 2ª vez (New Game+),
`w4` = reservado só para evento/admin.

> **Renumeração 2026-09-17:** os ids do catálogo foram renumerados pra que os
> 12 oficiais ocupem 1-12 (antes espalhados: wave 1 era 1/3/11/17/27, e a
> arte pronta dos outros 7 estava em 2/4/6/7/8/9/10). **Os 5 iniciais não
> mudaram de personagem nem de stats/balanceamento** — só o número do id:
> Trinca continua id 1, Fenda vai de 3→2, Muro de 11→3, Catraca de 17→4,
> Faísca de 27→5. Os outros 25 ids também foram reajustados pra abrir espaço
> (ver `unlock_plan` no catálogo — fonte única). Atualizado junto:
> `ganguesBiografias.js` (bios remapeadas pro id novo de cada personagem) e
> `ganguesCombatAnimations.js` (`TEMPLATE_SLUG`, o mapa id→slug usado pela
> máquina de animação de combate: `11: 'muro'` virou `3: 'muro'`). Nenhum
> save de jogador existia em produção até esta data, então não houve
> migração de dado a fazer.

| id | Nome | Caminho | Subcaminho | Título nv.99 | Libera | Genero
|---|---|---|---|---|---|---|
| 1 | Trinca | Atacante | Bruto | O Quebra-Linha | w1 | M
| 2 | Fenda | Atacante | Duelista | Primeiro Corte | w1 | F
| 3 | Muro | Defensor | Muralha | Fortaleza | w1 | M
| 4 | Catraca | Defensor | Reativo | Bateu, Voltou | w1 |
| 5 | Faísca | Místico | Tempestade | Antes do Trovão | w1 | M
| 6 | Cicatriz | Atacante | Vingador | Dívida Antiga | w2 | M
| 7 | Marreta | Atacante | Bruto | Demolidor | w2 | M
| 8 | Mira | Atacante | Especialista | Cirúrgica | w2 | F
| 9 | Navalha | Atacante | Duelista | Sem Aviso | w2 | F
| 10 | Ponto | Atacante | Especialista | Ponto Cego | w2 | F
| 11 | Sangue | Atacante | Fúria | Tudo ou Nada | w2 | F
| 12 | Troco | Atacante | Vingador | Cobrança | w2 | M
| 13 | Touro | Atacante | Fúria | Último de Pé | w3 |
| 14 | Concreto | Defensor | Muralha | Bloco Vivo | w3 |
| 15 | Guarda | Defensor | Guardião | Linha de Frente | w3 |
| 16 | Ombro | Defensor | Guardião | Ninguém Passa | w3 |
| 17 | Boca | Defensor | Provocador | Olha Pra Mim | w3 |
| 18 | Isca | Defensor | Provocador | Alvo Perfeito | w3 |
| 19 | Rebote | Defensor | Reativo | Volta em Dobro | w4 |
| 20 | Ferro | Defensor | Resiliente | Não Cai | w4 |
| 21 | Osso | Defensor | Resiliente | Ainda de Pé | w4 |
| 22 | Brasa | Místico | Ígneo | Incêndio | w3 |
| 23 | Cinza | Místico | Ígneo | Depois do Fogo | w3 |
| 24 | Maré | Místico | Aquático | Maré Cheia | w3 |
| 25 | Chuva | Místico | Aquático | Temporal | w3 |
| 26 | Raiz | Místico | Terreno | Chão Fechado | w3 |
| 27 | Racha | Místico | Terreno | Falha Sísmica | w4 |
| 28 | Trovão | Místico | Tempestade | Queda do Céu | w4 |
| 29 | Névoa | Místico | Ilusório | Sem Rosto | w4 |
| 30 | Espelho | Místico | Ilusório | Duas Verdades | w4 |

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

> Numeração desta lista (`1.`, `2.`...) é só agrupamento de leitura por
> caminho de combate — ficou defasada em relação aos ids atuais depois da
> renumeração de 2026-09-17 (ver §7). O texto de cada bio está correto e
> igual ao de `ganguesBiografias.js`; só a ordem/numeral da lista aqui não
> foi reordenado ainda.

**ATACANTES**

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

2. **Marreta** — Bruto · Demolidor
   *Quem é:* Um sujeito enorme, quieto e assustadoramente forte.
   *História:* Trabalhou anos quebrando parede, carregando concreto e
   desmontando construção clandestina. Quando o patrão desapareceu sem
   pagar uma equipe inteira, Marreta vendeu as próprias ferramentas para
   dividir o dinheiro com os outros trabalhadores. Desde então trabalha
   por conta e escolhe muito bem para quem empresta a força.
   *Por que recrutar:* Quando estratégia acaba e alguma coisa
   simplesmente precisa cair, Marreta resolve.

3. **Fenda** — Duelista · Primeiro Corte
   *Quem é:* Uma lutadora rápida, fria e extremamente econômica nos
   movimentos.
   *História:* Fenda cresceu entre pequenos golpes e apostas de luta.
   Nunca foi a mais forte, então aprendeu a observar: distância,
   respiração, perna de apoio, mão dominante. Ela não procura dez
   oportunidades numa luta. Procura uma — a primeira.
   *Por que recrutar:* Fenda reconhece uma abertura antes que o
   adversário perceba que a deixou.

4. **Navalha** — Duelista · Sem Aviso
   *Quem é:* Um lutador veloz que odeia confronto prolongado.
   *História:* Foi criado trabalhando em barbearia e fazendo entrega
   pelas ruas estreitas de Marélia. Aprendeu a desaparecer por becos
   antes que problema virasse confusão. Quando começou a lutar, levou a
   mesma filosofia: entrar, resolver e sair antes de alguém entender o
   que aconteceu.
   *Por que recrutar:* Navalha é perfeito quando a gangue precisa
   derrubar alguém rápido antes que o resto do bando consiga reagir.

5. **Touro** — Fúria · Último de Pé
   *Quem é:* Um brigador que parece ficar mais perigoso quanto mais
   machucado fica.
   *História:* Touro cresceu numa família grande em que sempre era ele
   quem ficava para resolver o problema quando os outros já tinham ido
   embora. Virou segurança de festa, carregador e cobrador informal, mas
   nunca aceitou bater em quem não podia responder.
   *Por que recrutar:* Quando uma luta vira desastre e todo mundo começa
   a cair, Touro continua de pé.

6. **Sangue** — Fúria · Tudo ou Nada
   *Quem é:* Uma lutadora que entra em cada combate como se não
   existisse amanhã.
   *História:* Sangue sobreviveu a uma emboscada que derrubou todo o
   antigo grupo dela. Desde então desenvolveu uma relação quase
   doentia com risco: quanto pior a situação, mais tranquila ela fica.
   Não procura morrer — simplesmente parou de ter medo disso.
   *Por que recrutar:* É a pessoa que você coloca numa luta que todo
   mundo já considera perdida.

7. **Mira** — Especialista · Cirúrgica
   *Quem é:* Uma combatente obsessiva por precisão.
   *História:* Mira passou anos trabalhando em barraca de tiro e jogos
   de habilidade em festas de bairro. Transformou coordenação e leitura
   corporal em método de combate. Ela estuda o adversário durante
   minutos se for preciso, esperando exatamente o movimento que quer.
   *Por que recrutar:* Mira não desperdiça ataque. Quando decide acertar
   alguma coisa, geralmente acerta o ponto que realmente importa.

8. **Ponto** — Especialista · Ponto Cego
   *Quem é:* Um lutador especializado em atacar de onde ninguém está
   olhando.
   *História:* Ponto sobreviveu como entregador, olheiro e atravessador
   entre bairros rivais. Aprendeu que ser invisível vale mais do que ser
   forte. Ele conhece o segundo exato em que uma pessoa deixa de
   prestar atenção em determinado ângulo.
   *Por que recrutar:* Ele transforma distração em arma e é excelente
   contra inimigos mais poderosos que dependem de controle do campo.

9. **Cicatriz** — Vingador · Dívida Antiga
   *Quem é:* Uma veterana que guarda nomes melhor do que guarda dinheiro.
   *História:* Cicatriz perdeu gente demais para guerras que começaram
   por decisões de homens que nunca pisaram na rua onde o sangue caiu.
   Ela não esqueceu nenhum responsável. Passou anos ficando forte o
   bastante para cobrar cada dívida pessoalmente.
   *Por que recrutar:* É paciente, experiente e impossível de intimidar
   quando acredita que existe uma conta a ser acertada.

10. **Troco** — Vingador · Cobrança
    *Quem é:* Um lutador que acredita que tudo volta.
    *História:* Troco foi pequeno estelionatário, apostador e cobrador
    até ser traído pelo próprio grupo e abandonado com uma dívida que
    não era dele. Pagou centavo por centavo. Depois começou a procurar
    quem tinha colocado seu nome naquela conta.
    *Por que recrutar:* Troco nunca esquece quem bateu primeiro — e
    costuma devolver com juros.

**DEFENSORES**

11. **Muro** — Muralha · Fortaleza
    *Quem é:* Um defensor enorme, calmo e quase impossível de deslocar.
    *História:* Muro trabalhou descarregando caminhão e fazendo
    segurança de comércio. Ficou conhecido quando segurou sozinho a
    entrada de uma viela durante uma confusão para impedir que a briga
    chegasse às casas dos moradores. Não venceu ninguém. Só não deixou
    ninguém passar.
    *Por que recrutar:* Toda gangue precisa de alguém capaz de dizer
    "daqui ninguém passa" e fazer isso ser verdade.

12. **Concreto** — Muralha · Bloco Vivo
    *Quem é:* Um veterano pesado que luta como se tivesse sido
    construído no lugar.
    *História:* Passou a juventude na construção civil clandestina que
    ergueu boa parte dos puxadinhos de Marélia. Quedas, acidentes e anos
    carregando peso transformaram seu corpo numa muralha. É lento, mas
    aprendeu a nunca gastar movimento à toa.
    *Por que recrutar:* Concreto segura posições que outros personagens
    simplesmente não conseguiriam manter.

13. **Guarda** — Guardião · Linha de Frente
    *Quem é:* Uma lutadora que naturalmente coloca os outros atrás dela.
    *História:* Guarda sempre foi a irmã mais velha, a vizinha que
    buscava criança perdida e a primeira pessoa chamada quando havia
    confusão na rua. Nunca quis mandar em ninguém. Só desenvolveu o
    hábito de ficar entre o perigo e quem não consegue se defender.
    *Por que recrutar:* Ela não protege apenas a própria vida; protege a
    formação inteira da gangue.

14. **Ombro** — Guardião · Ninguém Passa
    *Quem é:* Um defensor conhecido por entrar literalmente no caminho
    dos golpes.
    *História:* Ombro ganhou o apelido jogando bola nas quadras da
    Vila, onde ninguém conseguia tirá-lo de posição. Mais tarde começou
    a acompanhar amigos em trabalhos perigosos e percebeu que tinha
    talento para proteger gente usando o próprio corpo.
    *Por que recrutar:* Se alguém importante precisa chegar vivo ao fim
    da luta, Ombro é quem você coloca ao lado.

15. **Boca** — Provocador · Olha Pra Mim
    *Quem é:* Um provocador profissional incapaz de ficar calado.
    *História:* Boca vendia qualquer coisa que coubesse numa sacola e
    conseguia discutir com cliente, guarda, rival e comerciante no
    mesmo minuto. Descobriu nas brigas que insultar o sujeito certo no
    momento certo pode controlar uma luta inteira.
    *Por que recrutar:* Boca faz o adversário esquecer o plano e atacar
    exatamente quem ele quer.

16. **Isca** — Provocador · Alvo Perfeito
    *Quem é:* Uma lutadora especializada em parecer mais vulnerável do
    que realmente é.
    *História:* Isca cresceu sobrevivendo a golpes em que seu papel era
    atrair atenção enquanto outra pessoa fazia o trabalho. Quando
    abandonou essa vida, manteve a habilidade. Ela sabe exatamente que
    postura faz alguém pensar: "essa é a mais fácil".
    *Por que recrutar:* Inimigos atacam Isca porque acham que estão
    escolhendo o alvo certo. Normalmente descobrem tarde demais que
    foram escolhidos por ela.

17. **Catraca** — Reativo · Bateu, Voltou
    *Quem é:* Uma defensora paciente que prefere que o adversário tome a
    primeira decisão.
    *História:* Catraca passou anos lidando com gente agressiva em
    ônibus, festas e comércio. Aprendeu a nunca oferecer o primeiro
    golpe. Espera, observa e usa o movimento do próprio agressor contra
    ele.
    *Por que recrutar:* Contra inimigos impulsivos, lutar com Catraca é
    quase lutar contra si mesmo.

18. **Rebote** — Reativo · Volta em Dobro
    *Quem é:* Um especialista em transformar pressão em contra-ataque.
    *História:* Rebote começou como parceiro de treino dos lutadores
    mais fortes do bairro. Passava horas apanhando porque ninguém queria
    enfrentar os grandões. Em vez de quebrá-lo, isso ensinou todos os
    padrões de ataque que existem numa briga de rua.
    *Por que recrutar:* Quanto mais previsível e agressivo o inimigo,
    mais perigoso Rebote se torna.

19. **Ferro** — Resiliente · Não Cai
    *Quem é:* Um sobrevivente que aparentemente não sabe quando deveria
    ficar no chão.
    *História:* Ferro trabalhou desde criança em ferro-velho e oficina.
    Acidentes que teriam afastado muita gente só viraram histórias que
    ele conta rindo. Ele não é invulnerável; simplesmente desenvolveu
    uma tolerância absurda a continuar funcionando machucado.
    *Por que recrutar:* Ferro compra para a gangue aquilo que nenhuma
    loja vende: tempo.

20. **Osso** — Resiliente · Ainda de Pé
    *Quem é:* Uma lutadora magra, dura e muito mais resistente do que a
    aparência sugere.
    *História:* Osso cresceu ouvindo que era pequena demais para tudo.
    Trabalho, briga, carregar peso, sobreviver sozinha. Aprendeu a
    responder da única maneira que respeitavam em Marélia: ficando em pé
    depois que quem duvidou já tinha caído.
    *Por que recrutar:* É uma sobrevivente nata e uma das últimas
    pessoas que você verá abandonar uma luta.

**MÍSTICOS**

21. **Brasa** — Ígneo · Incêndio
    *Quem é:* Uma mística explosiva cujo poder começa pequeno e cresce
    rapidamente.
    *História:* Brasa descobriu a afinidade com fogo trabalhando perto
    de fogão, carvão e metal quente. Durante muito tempo escondeu
    aquilo como truque. Quando percebeu que o fenômeno respondia às
    emoções dela, começou a aprender controle antes que alguém se
    machucasse.
    *Por que recrutar:* Se tiver tempo para crescer dentro da luta,
    Brasa transforma uma faísca em problema para o campo inteiro.

22. **Cinza** — Ígneo · Depois do Fogo
    *Quem é:* Um místico que entende o fogo pelo que sobra depois dele.
    *História:* Cinza perdeu a casa num incêndio e voltou no dia
    seguinte para ajudar os vizinhos a procurar o que ainda podia ser
    salvo. Foi entre as paredes queimadas que seu poder apareceu. Ao
    contrário de Brasa, ele não é explosivo: é paciente, silencioso e
    sufocante.
    *Por que recrutar:* Cinza domina batalhas longas. Ele não precisa
    queimar tudo de uma vez; só precisa garantir que o fogo nunca
    termine completamente.

23. **Maré** — Aquático · Maré Cheia
    *Quem é:* Uma mística adaptável que raramente enfrenta força com
    força.
    *História:* Maré cresceu perto dos canais e áreas alagadas da
    Baixada. Aprendeu a respeitar água porque viu rua virar rio em
    questão de minutos. Seu estilo segue a mesma lógica: contorna,
    acumula, recua e volta maior.
    *Por que recrutar:* Maré é excelente quando o plano original falha,
    porque muda de ritmo sem perder eficiência.

24. **Chuva** — Aquático · Temporal
    *Quem é:* Um místico cujo domínio da água é muito menos delicado do
    que o nome sugere.
    *História:* Chuva passou anos escondendo suas capacidades porque
    toda manifestação forte atraía atenção demais. O controle veio
    tarde, depois de vários acidentes e uma vida inteira aprendendo a se
    conter.
    *Por que recrutar:* Quando finalmente deixa de se conter, consegue
    alterar completamente o ritmo de uma batalha.

25. **Raiz** — Terreno · Chão Fechado
    *Quem é:* Uma mística ligada ao solo, à estabilidade e ao controle
    de espaço.
    *História:* Raiz cresceu numa família que ocupou e construiu a
    mesma área por gerações. Para ela, território não é linha num mapa:
    é memória. Seu poder apareceu defendendo justamente o terreno que
    sua família chamava de casa.
    *Por que recrutar:* Raiz transforma o lugar da luta em vantagem.
    Tirar terreno dela é tão difícil quanto tirá-la dele.

26. **Racha** — Terreno · Falha Sísmica
    *Quem é:* Um místico destrutivo que encontrou no chão a melhor
    maneira de atingir quem está acima.
    *História:* Racha trabalhou abrindo vala, quebrando piso e
    consertando tubulação. Começou percebendo pequenas vibrações
    através dos pés; depois descobriu que também conseguia devolvê-las.
    *Por que recrutar:* Excelente contra grupos e defesas rígidas.
    Racha não precisa atravessar uma formação quando pode quebrar o
    chão que sustenta todo mundo.

27. **Faísca** — Tempestade · Antes do Trovão
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

**NeoGuide** — mascote/guia oficial do universo LDI (cor `#00B4D8`, aparece em
outros jogos do site). Faz o onboarding e os tutoriais. **Não é personagem de
Marélia** — é a voz meta/tutorial, fora da ficção do crime.

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

> **Estado real (26/09/2026, `data/ganguesItens.js`):** só existem no jogo os
> ids **1, 2, 13, 20, 21 e 22**. Os ids **3 a 12** abaixo são **design
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

### 9.4 Equipamento — 6 slots por personagem

> **Proposta (27/09/2026, não implementada):** bônus de Porrada/Couro/Pique
> em **faixa** (ex.: Faca Serrilhada 1–3), **aprimoramento** +1 a +4 que
> estreita a faixa, acessórios de Pique novos (140–144) e preço por fórmula —
> ver `PLANO_ITENS_RANGE.md`.

Slots (bonecão de cima pra baixo): `cabeca` 🪖 · `corpo` 🦺 (a escolha PV vs PM) ·
`bracos` 🧤 · `pes` 🥾 · `amuleto` 📿 · `arma` 🥊.
Bônus = atributo plano (**A/H/D**) ou recurso plano (**pv/pm**, somado em cima do
máximo, **não passa por R**). Raridades: `comum` · `incomum` · `raro` · `epico`.
**Cartas/sockets** (`cardSlots` 0–2, estilo Ragnarok): os slots existem, as
cartas vêm do sistema de drop (faixa 10000+, futuro). **Tirar carta encaixada
DESTRÓI a carta. Desequipar o item inteiro não.**

> **⚠️ Achado da revisão de 27/09/2026:** os 8 **raros** (103, 106, 110, 111,
> 114, 117, 119, 120) **não têm fonte nenhuma no jogo hoje** — não estão em
> loja, nenhum POI dá (`daEquip` só existe na oficina, que dá a 101) e não há
> drop. Estão no catálogo mas nunca chegam na mão do jogador. Proposta de
> fonte em `PLANO_ITENS_RANGE.md`.
>
> **Estado real (26/09/2026, `data/ganguesEquip.js`):** o catálogo do jogo
> vai do **101 ao 120**. Os ids **121–131** abaixo e os épicos **132–139**
> (§9.5) são **design aprovado, ainda não implementado**. Preços abaixo =
> os do código (a coluna "—" = sem preço, não vendido em loja).

| id | Nome | slot | raridade | bônus | cartas | custo |
|---|---|---|---|---|---|---|
| 101 | Soqueira de Lata | arma | comum | +1 A | 0 | 28 💵 |
| 102 | Faca Serrilhada | arma | incomum | +2 A | 1 | 58 💵 |
| 103 | Cano de Ferro | arma | raro | +2 A, +1 H | 2 | — |
| 104 | Gorro de Moletom | cabeça | comum | +1 D | 0 | 22 💵 |
| 105 | Capacete de Obra | cabeça | incomum | +2 D | 1 | 44 💵 |
| 106 | Coroa de Lata | cabeça | raro | +1 A, +1 D | 2 | — |
| 107 | Colete Reforçado | corpo | comum | +6 PV | 0 | 36 💵 |
| 108 | Colete Leve | corpo | comum | +6 PM | 0 | 36 💵 |
| 109 | Colete de Placa | corpo | incomum | +12 PV | 1 | 80 💵 |
| 110 | Manto com Capuz | corpo | incomum | +12 PM | 1 | — |
| 111 | Armadura de Rua | corpo | raro | +18 PV | 2 | — |
| 112 | Luva de Couro | braços | comum | +1 D | 0 | 22 💵 |
| 113 | Manopla de Porca | braços | incomum | +2 A | 1 | 48 💵 |
| 114 | Braçadeira de Cravo | braços | raro | +1 A, +1 D | 2 | — |
| 115 | Tênis Furado | pés | comum | +1 H | 0 | 22 💵 |
| 116 | Coturno | pés | incomum | +1 H, +1 D | 1 | 44 💵 |
| 117 | Bota com Biqueira | pés | raro | +2 H | 2 | — |
| 118 | Corrente de Lata | amuleto | comum | +1 H | 1 | 28 💵 |
| 119 | Dente de Ouro | amuleto | incomum | +1 A | 1 | — |
| 120 | Medalha de Santa | amuleto | raro | +1 D, +1 H | 2 | — |
| *121–131* | *(planejados — abaixo)* | | | | | |
| 121 | Boné Vira-Lata | cabeça | comum | +1 H | 0 | 12 💵 |
| 122 | Balaclava de Pano | cabeça | incomum | +1 D, +1 H | 1 | — |
| 123 | Jaqueta de Bonde | corpo | comum | +6 PV | 0 | 20 💵 |
| 124 | Manto de Sintonia | corpo | raro | +18 PM | 2 | — |
| 125 | Manopla de Prego | braços | incomum | +2 A | 1 | — |
| 126 | Chinelo Reforçado | pés | comum | +1 H | 0 | 12 💵 |
| 127 | Corrente de Ouro Falso | amuleto | incomum | +1 A | 1 | — |
| 128 | Terço de Vó | amuleto | raro | +1 D, +1 H | 2 | — |
| 129 | Facão de Cabo Fita | arma | comum | +1 A | 0 | 16 💵 |
| 130 | Espeto de Grade | arma | raro | +2 A, +1 D | 2 | — |
| 131 | Bastão de Sinaleiro | arma | incomum | +1 A, +1 H | 1 | — |

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

- **A loja da Pista** (`loja`, do lado de lá do muro, só aparece depois do
  portão): `1, 2, 101, 102, 104, 105, 107, 108, 109, 112, 113, 115, 116, 118` —
  as poções, 1 comum por slot e os incomuns.
- **A Lojinha do Zé** (`loja_pocoes`, na rua, desde o começo — v3.48–3.56):
  só **poção de HP e MP, pelo dobro do preço** (`precoMultiplicador: 2`), "na
  cara de pau". Existe porque, com a recompensa por risco, quem quer arriscar
  luta mais forte precisa ir municiado. O dono é o Zé do Bar do Zé (retrato
  emprestado da ficha 1205). Chegou a se chamar "Balcão do Aperto" e a ficar
  dentro da birosca; voltou pra rua porque não tem nada a ver com a agiotagem.

---

## 10. Conto 02 — sinopse canônica ("Alan, o Campeão")

Fonte completa: `src/data/livro/contos/pt/02/01.md` … `19.md`. 1ª pessoa, contada
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

## 12. Endgame — nível 99, a Torre e o multiplayer (v2.71.0)

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
- **Escada de nível dos 7 chefes** (rev. dez/2026): cada chefe é **pau a pau**
  no nível-alvo — **Pista 15 · Feira 28 · Baixada 42 · Vila 56 · Morro 70 ·
  Alto 84 · Laje 99+** (~14 níveis entre cada). O 7º (Laje) é PAREDÃO: encara no
  L99 e ainda apanha, tem que voltar. Os 7 chefes usam **orçamento de pontos
  FIXO** (`GANGUES_CHEFE_BUDGET`, não escala com o jogador). ⚠️ **Essa escada
  é da calibragem antiga** (quando se contava "1 ficha nível N = N pontos").
  Hoje a conversão oficial é **nível real = pontos − 6** (`nivelRealDePontos`
  em `data/ganguesDificuldade.js`; uma ficha nível 1 tem 7–8 pontos) — então
  o Carvão com 30 pontos é um adversário de **nível ~24**, não 15. Os 6
  budgets seguintes ainda não foram recalculados; cada bairro recalibra quando
  ganhar cena (a Feira: ver `PLANO_FEIRA.md`). Budget original de cada chefe
  ≈ 1.15×→1.18× o total do time no nível-alvo
  (`{pista:50, feira:110, baixada:210, vila:345, morro:510, alto:606,
  laje:732}`). **Pista, rev. 15/09/2026:** budget 50, com 2 corpos
  (`GANGUES_CHEFE_CORPOS.pista`) e o líder levando 60% (`GANGUES_CHEFE_LIDER_FRAC`)
  → **Carvão com ficha 30** + 1 escolta com 20; `chefe.nivelRec` = 30. Os
  outros 6 budgets ainda são os da calibragem antiga, esperando cada bairro
  ganhar cena. AP por inimigo parte de **10** em qualquer modo (chegou a subir
  pra 30 no modo história e o Isaias reverteu em set/2026 — 2 inimigos já
  davam 60 AP), mas desde a v3.36 varia com o risco (recompensa por risco,
  §17.4: piso 5, triplo/quádruplo contra inimigo mais forte). Os chefes carregam `nivel` de fachada.
  **O Retalho é o único nível 100 do jogo.**
- **Estrutura de cada chefe** (rev. Isaias dez/2026 — só a Pista existe hoje, o
  resto é o plano pra quando cada bairro ganhar cena):
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
- **Multiplayer online libera com 3 fichas no nível 99** (era 1 até a v3.31.0 —
  `GANGUES_MULTIPLAYER_MIN_FICHAS = 3`, `GANGUES_MULTIPLAYER_LEVEL = 99`,
  `ganguesTemMultiplayer(roster)`). O online em si é fase futura — por ora só
  destrava o card em `GanguesModes`.
- **Cards bloqueados da tela de Modos são clicáveis** (v3.31–3.32): em vez de
  "EM BREVE", tocar num modo trancado abre um diálogo em tela cheia do Nego
  Véio explicando o que falta pra liberar.
- **A Coleção** (3º botão da HUD da cena + lobby): abas Inimigos (o Álbum),
  Itens (consumível + equipamento, descoberto via `storyProgress.__itens`) e
  Cartas (placeholder — sockets, faixa 10000+).

---

## 12.1 Índice de fontes

| Assunto | Arquivo |
|---|---|
| Conto "Alan, o Campeão" (texto completo) | `src/data/livro/contos/pt/02/01.md` … `19.md` |
| Mapa, territórios, gangues, chefes, portões | `src/pages/games/Gangues/data/ganguesTerritorios.js` |
| Fichas dos inimigos + trash talk | `src/pages/games/Gangues/data/gangues-enemies.json` |
| Geração de bando + equipe fixa dos chefes | `src/pages/games/Gangues/data/ganguesEncontros.js` |
| Cena navegável da Pista (POIs, NPCs, diálogos) | `src/pages/games/Gangues/data/cenas/pista/` |
| 30 lutadores recrutáveis | `data/ldi_gangues_30_personagens_v1.json` |
| Consumíveis / equipamento | `src/pages/games/Gangues/data/ganguesItens.js`, `data/ganguesEquip.js` |
| Loja / painel de equipamento | `src/pages/games/Gangues/components/cena/GanguesLoja.jsx`, `components/GanguesEquipPanel.jsx` |
| Inventário + economia (store) | `src/pages/games/Gangues/store/useGanguesStore.js` + `store/slices/` |
| Textos de história / itens (i18n) | `src/i18n/gangues-{pt,en,es}.json` → `games.gangues.{story,cena,dialogo,naming,itens,equip,loja,bag}` |
| Dificuldade (±2), degrau da ladder, frustração, nível real | `src/pages/games/Gangues/data/ganguesDificuldade.js` |
| AP por risco, divisão do AP, grana da vitória | `src/pages/games/Gangues/engine/ganguesVictoryResolver.js` |
| Descanso, agiota, Clube da Luta (store) | `src/pages/games/Gangues/store/slices/ganguesBiroscaSlice.js` |
| Gates de Rep, marcos de Rep, empréstimo, multiplayer | `src/pages/games/Gangues/data/ganguesLoadout.js` |
| Motor da cena (colisão, câmera) | `src/pages/games/Gangues/engine/ganguesCenaMotor.js` |
| Encontro aleatório (tipos, relógio, pathfinding) | `engine/ganguesEncontroAleatorio.js` + `hooks/useGanguesEncontroAleatorio.js` |
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
é convenção do projeto (ver Osso/Gás, Sobrinho, Patota, Mete o Pé). EN/ES
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

## 14. Auditoria de comunicação (set/2026) — i18n morto removido

Pedido do Isaias: revisar TODA fala/texto do jogo. Antes de revisar tom, foi
preciso separar o que é **conteúdo vivo** do que é **lixo de uma versão
anterior do jogo** — os `gangues-{pt,en,es}.json` tinham ~430 chaves de texto
(quase 1000 linhas em cada idioma) de um sistema de personagem **completamente
abandonado**: atributos F/H/R/A/PdF (não confundir com o A/H/D/R atual), um
sistema de 7 elementos (Fogo/Água/Terra/Ar/Trevas/Luz/Neutro — não confundir
com os 5 subcaminhos místicos atuais: Ígneo/Aquático/Terreno/Tempestade/
Ilusório), vantagens/desvantagens/perks/especializações estilo GURPS, um
"manual" que fala de "3 bilhões de jogadores num ranking SDR", uma tela de
criação de ficha "party.*" duplicada, e por aí vai. Confirmado com uma
varredura cruzada (grep de toda referência i18n em todo componente `.jsx`,
inclusive dentro de template strings com `${}` e ternários) que **nenhuma**
dessas chaves é lida por nenhum componente hoje. Removidas dos 3 idiomas de
uma vez (mesma estrutura, mesma remoção) — `gangues-pt.json` caiu de 2293
para 1358 linhas. Verificado com Playwright que a tela mais densa em i18n
(progressão/poderes da ficha) continua renderizando 100% certo, zero erro de
console, depois da limpeza.

Depois da limpeza, o que sobrou de comunicação **viva** (história, cena da
Pista, Clube da Luta, diálogos dos NPCs, nomes e álbum dos inimigos,
provocação de combate) já estava no tom certo — gíria de verdade, registro
consistente. Os únicos pontos fora do tom eram os já listados no início
desta seção 13 (e agora corrigidos): "FOI NÓS"/"provou seu valor na arena"
(fala de e-sports), "bairro"/"INIMIGO"/"GANGUE RIVAL"/"FUGIR" (formal
demais ou inventado sem checar gíria real). Não tem mais lixo de tom
solto pelo jogo — o que sobrou de "genérico" é rótulo de UI neutro de
propósito (ATACAR, EQUIPAR, Comprar, Fechar) ou nome de poder/habilidade
(estilizado por natureza, não é narração).

**Nota pós-limpeza (importante pra próxima auditoria):** a remoção acima
apagou por engano 5 chaves de verdade — todas escondidas atrás de um
ternário DENTRO de uma template string (ex.:
`` `games.gangues.progression.${equipado ? 'unequip' : 'equip'}` ``), padrão
que o grep automático (que só entende `${var.path}` simples) não enxerga.
Achado durante o teste visual do sistema de retratos (seção 15) — a chave
`recruitment.subtitle_initial` apareceu crua na tela. Restauradas as 5
(`recruitment.subtitle`/`subtitle_initial`, `progression.equip`/`unequip`,
`cena.acao.avancar`) com o texto exato do histórico do git, nos 3 idiomas.
Se for fazer outra varredura de chave morta no i18n do jogo, procure por
`\$\{[^}]*[?|][^}]*\}` (ternário ou `||` dentro de `${}`) ANTES de rodar
qualquer remoção automática — cada resultado precisa ter os dois lados do
ternário conferidos manualmente contra o arquivo final, não só o padrão
dinâmico simples.

## 15. Retratos de personagem (cabeça, pixel art) — set/2026

Pedido do Isaias: identidade visual que faltava — "juice" nas telas de
seleção, combate e navegação. Arte é só a CABEÇA, estilo pixel art,
transparente, uma por personagem (por ora — arquitetura já pensa em
expressões futuras).

- **Onde mora:** `src/pages/games/Gangues/assets/personagens/<slug>/<expressao>.png`
  — uma pasta por personagem, não um arquivo direto. `<slug>` é o mesmo
  campo `.slug` de cada entrada em `ldi_gangues_30_personagens_v1.json`
  (já existia, não é convenção nova). Hoje só existe a expressão `neutro`;
  quando entrarem expressões (raiva, dor, vitória...), cada uma vira outro
  arquivo na mesma pasta — nenhum código muda.
- **Resolução:** `src/pages/games/Gangues/data/ganguesPortraits.js` usa
  `import.meta.glob('../assets/personagens/*/neutro.png', { eager: true })`
  pra descobrir sozinho o que existe — adicionar personagem novo é só criar
  a pasta/arquivo, zero linha de código. `getGanguesPortrait(slug)` e
  `getGanguesPortraitByTemplateId(characterTemplateId)` (resolve o slug
  pelo catálogo) retornam `null` quando não tem arte — todo consumidor cai
  no fallback de sempre (inicial do nome) nesse caso.
- **Cobertura hoje:** os 12 personagens oficiais, ids 1-12 (Trinca, Fenda,
  Muro, Catraca, Faísca, Cicatriz, Marreta, Mira, Navalha, Ponto, Sangue,
  Troco) — os outros 18 do catálogo ainda não têm arte, caem no fallback
  normalmente. Portraits dos 7 novos (2026-09-17) vieram de
  `Personagens/LDI GANGUES/RECRUTAVEIS/<Nome>/<NOME>.png` (masters
  1254×1254 RGBA), processados com sharp: resize 256×256 (`fit: contain`,
  fundo transparente) + PNG paletizado (256 cores) — mesma receita dos 5
  originais, sem script dedicado no repo (feito ad-hoc, documentado aqui
  pra próxima vez).
- **Onde aparece:** card de recrutamento (`GanguesCreate.jsx`), card do
  elenco no lobby (`GanguesLobby.jsx`), avatar do quadradinho de combate
  (`GanguesCombatRoster.jsx`, só lado do jogador — inimigo não tem arte
  ainda), e o marcador de navegação da cena (`GanguesCenaAtores.jsx`
  `GangMarker` — a cabeça do LÍDER, `roster[0]`, flutua no lugar do escudo
  genérico quando existe retrato pra ele).
- **Pipeline de import:** arte de origem chegou em ~950KB/1254×1254 cada
  (5 arquivos). Redimensionada pra 256×256 com paleta indexada via `sharp`
  (instalado isolado num scratch dir, não polui `package.json` do site) —
  ficou ~25KB cada (−97%), mantendo a transparência. Nunca commitar a arte
  de origem em tamanho grande.
- **Retrato na ficha detalhada:** `GanguesFichaCard.jsx` (componente único
  usado no recrutamento, no popup rápido de combate e no topo da tela de
  progressão) recebe a prop `retrato` — quando existe, substitui a letra
  gigante translúcida do canto por a cabeça de verdade.

### 15.1 Corpo inteiro no "primeiro contato" (lobby inicial + recrutamento) — set/2026

Pedido do Isaias: a cabeça (§15) é ótima pro resto do jogo, mas o
**primeiro contato** do jogador com o elenco — a tela de fundação da
gangue e o recrutamento (`GanguesCreate.jsx`, o MESMO componente pra
ambos) — merece o personagem inteiro, não só a cabeça. A cabeça **continua
igual em todo o resto** (roster do lobby, roster de combate, marcador de
cena, progressão) — nada disso mudou.

- **Origem da arte:** cada pasta em `Personagens/LDI GANGUES/RECRUTAVEIS/<Nome>/`
  também traz um `<Nome>Sheet.png` — um turnaround de corpo inteiro
  (frente/costas/lado lado a lado, 1916×821 na maioria, 1672×941 no Muro
  que é mais largo). Só os 12 personagens oficiais (§7) têm esse arquivo
  hoje.
- **Recorte:** as 3 poses NÃO ficam em colunas perfeitamente iguais (o
  personagem de cada pose tem largura própria — o punho/arma de uma pose
  pode invadir o terço "certo" numericamente) — dividir a imagem em 3
  fatias iguais corta pedaço de personagem (aconteceu com o braço do Muro
  na 1ª tentativa). O jeito certo: varrer as colunas da imagem procurando
  os 2 "vãos" transparentes de verdade entre as 3 figuras (gap ≥ 20px sem
  nenhum pixel com alpha) e recortar exatamente nesses vãos, com ~12px de
  respiro. Cada pose recortada é `.trim()`ada (sharp, remove a margem
  transparente sobrando) e exportada `webp` qualidade 85 (~55-125KB cada,
  36 arquivos = ~3,2MB) — **nunca** `image-rendering: pixelated` aqui,
  essa arte é ilustração pintada de alto detalhe, não pixel art (isso é
  só pra cabeça).
- **Onde mora:** mesma pasta/convenção da cabeça —
  `assets/personagens/<slug>/corpo-<pose>.webp`, `pose` = `frente` |
  `costas` | `lado`. `ganguesPortraits.js` tem um segundo
  `import.meta.glob('.../corpo-*.webp')` só pra isso — `getGanguesCorpo(slug, pose)`
  e `getGanguesCorpoPoses(slug)` (as 3 de uma vez, ou `null` se não tiver
  nenhuma — a maioria do elenco, 18 dos 30, por ora).
- **Ciclo de pose por toque:** `GanguesRetratoCorpo.jsx` — um `<button>`
  que troca a pose a cada toque (frente → costas → lado → frente...,
  sempre nessa ordem, sempre voltando pro início) e mostra 3 pontinhos
  (`.gang-corpo-poses`) indicando a pose atual. Chama
  `event.stopPropagation()` no toque — importante porque ele SEMPRE vive
  dentro de um elemento clicável maior (o card inteiro, ou a moldura da
  ficha) que abre a ficha/faz outra coisa; sem o stop, tocar na imagem pra
  trocar de pose também disparava a ação do pai.
- **No card do carrossel** (`GanguesCreate.jsx`): só o card **atual**
  (`position === 'current'`) cicla pose — os dois de trás (`prev`/`next`,
  desbotados, só navegam) mostram a pose `frente` fixa. Isso forçou trocar
  o wrapper do card atual de `motion.button` pra `motion.div` (só ele tem
  conteúdo clicável ANINHADO — `<button>` dentro de `<button>` é HTML
  inválido; `prev`/`next` continuam `motion.button` porque não têm nada
  clicável dentro). O `onClick` de abrir a ficha continua no `div` inteiro
  — só a imagem, por dentro, intercepta e para a propagação.
- **Tamanho do card mudou, mas não como a 1ª tentativa fez:** a arte de
  corpo é ALTA e ESTREITA (retrato ~0.55 largura:altura) — só a ALTURA do
  portrait precisava crescer (232px → 342px), a largura original (242px)
  já sobrava espaço. Alargar o card pra 264px (1ª tentativa) só roubou
  espaço do peek `prev`/`next` sem ajudar a imagem em nada — corrigido pra
  236px (mais estreito que o original de propósito) com os peeks
  recuperando espaço.
- **Armadilha de CSS — `height: 100%` dentro de grid `place-items: end`
  não funciona:** o botão de ciclo (`.gang-fighter-card__corpo-btn`) é
  filho de um container `display: grid; place-items: end center`. Uma
  altura em `%` nesse filho depende da row `auto` do grid — e como
  `align-items` não é `stretch` (é `end`), a spec resolve essa porcentagem
  como **indefinida**, então o filho vira do tamanho do PRÓPRIO conteúdo
  em vez de preencher o pai (o botão cresceu pra ~415px sozinho, bem além
  dos 342px do portrait, e escondeu os pontinhos de pose lá embaixo fora
  da vista). Fix: `position: absolute; inset: 0` no botão em vez de
  `height: 100%` — ignora o problema de row do grid e cobre exatamente a
  área do pai (que já tem `position: relative`).
- **No modal de ficha** (`GanguesFichaCard.jsx`): prop nova `corpoSlug`
  (só `GanguesCreate.jsx` passa) — quando presente, o hero do modal vira
  um banner alto centralizado (imagem grande, nome/subcaminho abaixo dela)
  em vez da faixa baixa com a cabeça pequena no canto (`--corpo` modifica
  a classe `.gang-sheet-modal__hero`). Combate/cena/progressão não passam
  `corpoSlug`, continuam exatamente como eram.
- **Fallback:** sem nenhuma pose de corpo pro slug, cai de volta pra
  cabeça (`retrato`) — e sem cabeça também, cai pra inicial do nome, igual
  sempre foi.
- **Testado ao vivo** (Playwright, viewport 390×844, mobile): fundação da
  gangue → card mostra corpo inteiro → toque cicla frente/costas/lado/
  frente → abrir ficha mostra o mesmo corpo grande no modal, cicla lá
  também → seleção e confirmação de recrutamento funcionam normalmente →
  zero erro de console.

### 15.2 Máquina de animação de combate — cobertura (18/09/2026)

`ganguesCombatAnimations.js` (§ na doc de arquitetura do combate) — os
**5 personagens iniciais têm ataqueNormal + dano completos**: Trinca,
Muro (já existiam), Fenda, Catraca, Faísca (18/09/2026, mesma leva de arte
que trouxe `<Nome>SocoNormal.png`/`<Nome>DanoNormal.png` em cada pasta de
`RECRUTAVEIS/`). Nenhum dos 25 restantes tem ainda — cai no golpe sem
sprite (efeito de sempre).

- **Pipeline de recorte** (mesmo pra todos, verificado byte-a-byte contra
  o `ataque-normal.webp` já publicado do Trinca antes de aplicar nos 3
  novos): fonte `1448×1086` → `extend` (`bottom`) até a próxima altura
  múltipla de 8 (`1086`→`1088`, +2px transparente) → resize exato pela
  metade (`724×544`) → `webp({ lossless: true })`. O padding garante que
  cada quadro da grade 4×4 (`724/4=181`, `544/4=136`) saia em número
  inteiro de pixel — sem ele o último quadro de cada linha perderia
  precisão de arredondamento.
- **Frames de golpe são por personagem** (não existe convenção fixa de
  "frame 9 sempre") — cada folha tem seu próprio ritmo de animação;
  alguns golpes têm flash de impacto desenhado na própria arte (Trinca,
  Muro, Catraca — nesses o quadro do flash é óbvio), outros não desenham
  nenhum efeito (Fenda e Faísca, os dois de chute) — nesses o quadro de
  golpe escolhido foi o pico da extensão do membro (perna totalmente
  estendida), não um frame arbitrário.
- **Sem voz ainda** (Fenda/Catraca/Faísca) — a arte chegou sem
  `<Nome>FalaSocoNormal.mp3` (só Trinca/Muro têm); Isaias vai gravar as
  vozes depois no ElevenLabs. `sons.voz` fica de fora da entrada desses 3
  em `DADOS_POR_SLUG` até lá (o código já trata `voz`/`ambiente` como
  opcionais, `if (anim.sons.voz)` em `DramaticDice.jsx` — não quebra sem).
- **Som de impacto por GÊNERO, provisório** (pedido do Isaias, 18/09/2026:
  "as mulheres precisam de um som de soco diferente... aplicar golpe e
  tomar golpe diferente" — mas voz de verdade só depois): Fenda e Catraca
  compartilham um par `soco-leve.mp3`/`dano-leve.mp3` (Mixkit, licença
  Mixkit — "Soft quick punch"/"Weak hit impact", mesma fonte de licença
  já usada pros sons do Trinca) — é um som por GÊNERO por ora, não por
  personagem; ajustar quando cada uma ganhar efeito próprio. Faísca
  (homem) reaproveita os sons já existentes do Trinca (`trinca-soco`, no
  ataque) e do Muro (`muro-soco1`/`muro-soco2`, no dano) — sugestão do
  próprio Isaias.
- **BUG real, achado pelo Isaias jogando** (print de combate mostrando a
  Catraca sem cabeça, 18/09/2026): a 1ª verificação (checagem de dados +
  URL 200 via Playwright, sem olhar o VISUAL de cada quadro) não pegou
  isso — passou confiando que "mesmo pipeline do Trinca" bastava, e não
  bastou. Investigação real (renderizando os 16 quadros de cada folha com
  a MESMA fórmula CSS do `GanguesCombatSpriteAnim.jsx` — `background-size`/
  `background-position` por percentual — numa página HTML isolada,
  screenshot de cada quadro): os `ataqueNormal` (não os `dano`, esses
  vieram limpos nas 3) de Fenda, Catraca e Faísca têm a arte dos quadros
  9-16 desenhada fora do quadrado da célula — a cabeça da Catraca fica
  pra cima do quadro vizinho (só as pernas ficam visíveis), o corpo do
  Faísca (chute voador) sai quase inteiro pra fora (só a bota sobra). O
  Trinca, testado do mesmo jeito como controle, não tem NENHUM corte em
  nenhum dos 16 quadros — confirma que é a ARTE DE ORIGEM (`<Nome>SocoNormal.png`)
  que não respeita a grade 4×4 nessas linhas pra esses 3 personagens
  específicos, não o pipeline/código.
- **Fix aplicado**: `frames: 16` → `frames: 8` nos 3 `ataqueNormal`
  quebrados (não nos `dano`, que continuam 16) — corta a animação
  exatamente ANTES da parte com defeito; os quadros 1-8 foram conferidos
  um por um (limpos) e já incluem o golpe de cada um (frame 6 Fenda, 7
  Catraca, 7 Faísca — sobra folga). Quando a arte das linhas 3-4 vier
  redesenhada respeitando a grade, volta pra 16.
- **Verificado**: dados de `getGanguesAnimacao(id, tipo)` pros ids 1-5
  corretos (sheet/frames/golpes) via Playwright; as 10 URLs de sprite
  responderam 200; os 8 quadros de cada `ataqueNormal` afetado e os 16 de
  cada `dano` renderizados um a um (mesma fórmula CSS do componente real)
  sem nenhum corte, com prova em screenshot. **Não verificado dentro do
  `DramaticDice.jsx` durante uma luta real** — chegar lá pede simular
  arrasto de analógico na cena navegável (tentado, sem sucesso confiável
  em automação — o personagem trava contra obstáculo antes de alcançar o
  inimigo mais próximo); zero mudança de código nos componentes que
  renderizam a animação, só dado — a mesma fórmula CSS que eu testei
  isolada é a que o componente usa ao vivo, então o resultado deve ser
  idêntico, mas o Isaias vai confirmar jogando.

## 16. Líder da gangue (set/2026)

Pedido do Isaias: dar personalidade real ao "quem manda" da gangue, não só
decoração. Regras de hoje:

- **O 1º personagem que o jogador marca na fundação vira líder automático.**
  Aviso explícito na tela de recrutamento inicial
  (`recruitment.aviso_lider`) pra ninguém escolher sem saber disso.
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

## 17. Mecânica de combate e progressão (fonte única — set/2026)

Pedido do Isaias: **o GDD tem que ser a única bíblia**. Até aqui, a mecânica
(combate/skill tree/progressão/modo história) vivia espalhada em 4 arquivos
`.md` soltos na raiz de `src/pages/games/Gangues/` (`GANGUES_DESIGN.md`,
`GANGUES_HEADSUP.md`, `GANGUES_PROGRESSAO_RASCUNHO.md`,
`GANGUES_MODO_HISTORIA_ENCONTROS.md`) — **todos deletados** depois desta
seção ser escrita. Dois deles (`GANGUES_DESIGN.md`, `GANGUES_HEADSUP.md`)
descreviam o jogo na versão **v1.12–v1.14** (mais de 60 versões atrás):
atributos `{A,H,R,D}` com Resistência genérica, 8 inimigos fixos, criação
por 5 pontos livres, XP fixo de 10/1 por vitória/derrota, `GanguesTrainingZone`,
mascote NeoGuide — **nada disso existe mais**. O que segue abaixo foi
reconferido contra o código de verdade em set/2026, não copiado dos docs
antigos.

### 17.1 Ficha e atributos

- Cada personagem tem 5 atributos: **A** (Porrada), **H** (Pique),
  **D** (Couro), **PV** (Osso) e **PM** (Malandragem) (`GANGUES_ATTRS` em
  `data/ganguesCharacters.js`). **Não existe mais Resistência** — PV e PM
  são atributos próprios desde a revisão "PV/PM separados" (v2.75.x);
  crescem por nível seguindo o `growth_order` autorado de cada um dos 30
  personagens do catálogo (não são mais alocação livre do jogador).
- **PV máx / PM máx** = atributo PV/PM × uma taxa por caminho
  (`GANGUES_RESOURCE_RATES` em `data/ganguesLoadout.js`):

  | Caminho | PV máx por ponto de PV | PM máx por ponto de PM |
  |---|---|---|
  | Porradeiro (atacante) | 3 | 3 |
  | Paredão (defensor) | 4 | 2 |
  | Mandingueiro (místico) | 3 | 4 |

  Mandingueiro subiu de 2 pra 3 de PV por ponto em 26/09/2026 (defesa
  normal, não de vidro).

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
  como estavam. `F`, `R` e `PdF` foram removidos do `attr_labels` (26/09/2026).

- **Sistema do Pique (26/09/2026)** — papel de cada atributo:
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
- **Nível teto: 99** (`GANGUES_LEVEL_CAP`). Níveis 1–10 são estatísticas
  autoradas à mão; 11–99 crescem +1 ponto por nível seguindo o
  `growth_order` de cada ficha (fiel à identidade dela — um Bruto termina
  A altíssimo, um Muralha só D/PV).

### 17.2 Fórmula de combate

Tudo em `engine/ganguesCombatResolver.js`:

```
FA = Porrada + d3[+2 se crítico] + floor(Malandragem/2) só se usou TALENTO + efeitos de poder ativo
FD = Defesa efetiva + d3 + efeitos de poder passivo
DANO = max(0, FA − FD)   // SEM piso de dano — defesa bem investida pode zerar o golpe
```

**Ordem de ação — linha do tempo (Pique), 26/09/2026** (`engine/ganguesLinhaDoTempo.js`,
estilo Medabots/ATB do Chrono Trigger; substitui a iniciativa Malícia+d3):
- velocidade = Pique + base; base = 10% da ficha média da luta (mínimo 2);
- cada um enche uma barra até 100 (corre até o centro da pista na tela) e age;
- ataque normal custa 100, Talento custa 125 (o "preparo" demora mais);
- **teto: ninguém é mais que 3× o mais lento vivo**;
- rodada fecha quando todo vivo agiu ≥1 vez. Os dois motores (normal e
  Multidão) usam as mesmas funções.
- **Velocidade 1x/2x/3x**: só com o AUTOMÁTICO ligado (normal ou Multidão) —
  benefício de assinante no lançamento; no beta tudo liberado.
- **A pista na tela** (`components/GanguesPistaTempo.jsx`, v3.62.1–3.62.2):
  cada **raia** leva um aliado (vem da esquerda) e um inimigo (vem da
  direita); aparecem só as raias necessárias, **até 6** — passou disso, dois
  dividem a raia. Chegou no centro = é a vez dele; quem agiu volta pra
  largada. Na montagem todo mundo nasce na largada e **corre** pra posição
  (largada animada). A lista "Ordem" saiu do log — a pista é a ordem. A barra
  do automático fica embaixo.

- **Dado d3** (1 a 3) pros dois lados, ataque e defesa. Crítico = tirar o
  valor máximo (3) no dado de ataque, soma **+2** na rolagem (vira 5 no
  cálculo de FA). Só o ataque critica.
- **Sem dano mínimo garantido** — o clamp é `Math.max(0, ...)`, não
  `Math.max(1, ...)`. Foi tirado de propósito depois de muito playtest: com
  bandos grandes, "sempre acerta pelo menos 1" deixava toda defesa
  irrelevante.
- **Ordem de ação**: linha do tempo do Pique (ver acima) — não existe mais
  iniciativa sorteada (Habilidade + d3), aposentada em 26/09/2026.
- **IA inimiga**: ataca depois de um delay fixo. Escolha de alvo evita
  repetir o último quando dá — ~55% mira em quem tem menos PV entre os
  vivos, ~45% escolhe aleatório (`pickEnemyTarget` em `useGanguesTurnMachine.js`).
- **⚠️ Achado nesta auditoria: o bônus de caminho está DESLIGADO no código
  hoje.** Os 3 docs antigos (e a UI do log de combate, que ainda mostra
  "bônus de ataque: ativado/não ativou") descrevem Atacante +1 ataque
  ~50%, Defensor +1 defesa ~50%, Místico +1 garantido — mas
  `resolveAttackerBonus`/`resolveDefenderBonus` em `ganguesCombatResolver.js`
  **ignoram os parâmetros e sempre retornam `applied: false, amount: 0`**,
  hoje só stub. Não foi corrigido nesta auditoria (o pedido era consolidar
  documentação, não mexer em mecânica) — fica registrado aqui como bug real
  a decidir: religar o bônus, ou tirar de vez o texto/UI que promete ele.
  **Continua assim em 27/09/2026 (v3.63.0).**

### 17.2.1 Como o jogador age, e os modos de combate

- **A bolinha de ação** (`GanguesActionOrb`): no turno do personagem, o
  jogador escolhe **ATACAR** (ataque normal), **TALENTO** (um dos 2 poderes
  equipados, gasta PM ou PV) ou **ITEM** (consumível da gangue). A bolinha usa
  `onPointerDown/Up`, não `onClick` (importa pra teste automatizado).
- **O dado dramático** (`DramaticDice`): todo ataque pausa o combate numa tela
  cheia que rola o dado, mostra atacante e alvo e o resultado. É o "momento" do
  golpe — as animações de sprite de ataque (§15.2) tocam aqui, não no log.
  Desde a v3.37.0 ele **destaca quando um poder passivo do defensor entra em
  ação** na conta.
- **KO:** personagem com PV 0 cai e para de agir até o fim da luta. **PV e PM
  perdidos persistem entre lutas dentro do bairro** (só voltam no descanso,
  saindo ou dominando). Tropa inteira caída não entra em luta nenhuma.
  **Perder a luta na cena não é game over:** a tropa acorda recuperada na
  birosca e paga a recuperação (grana, empréstimo ou dívida — §4, Pista).
- **Briga em Multidão** (`engine/ganguesBrigaMultidao.js`,
  `hooks/useGanguesModoMultidao.js`): um interruptor que resolve **a rodada
  inteira de uma vez** a cada toque (todo mundo age), em vez de turno a turno.
  - É oferecido quando a luta tem **5 ou mais combatentes no total**
    (jogador + inimigos). O botão pisca na 1ª vez, com tutorial próprio.
  - **Liga e desliga a qualquer momento** (desde 13/09/2026): os dois motores
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
  - **Lembrado entre lutas (27/09/2026, v3.63.0):** terminou a luta no
    automático, a próxima **já começa com ele ligado** — porradaria direto.
    Só uma ação do próprio jogador (ligar/desligar o switch ou "sair do
    automático") muda o que fica gravado. Vale pro automático normal e pro da
    Briga em Multidão, cada um com o seu (`useGanguesAutoLembrado`,
    `hooks/useGanguesVelocidadeAuto.js`; `localStorage` `ldi-gangues-auto` /
    `ldi-gangues-auto-multidao` — preferência do navegador, igual à
    velocidade 1x/2x/3x, não vai pro save).
- **"Mete o pé"** (fugir da luta) volta pra tela de **Modos**, não pro lobby
  (v3.38.0).
- **Voltar nunca repete recompensa:** as fases de combate e vitória ficam fora
  da pilha de histórico (`GANGUES_FASES_TRANSITORIAS`) — corrigiu um exploit
  real de XP duplicado apertando Voltar (v3.34.0).

### 17.3 Poderes / especiais (skill tree)

- **15 subcaminhos** (5 por caminho × 3 caminhos), **5 poderes cada** = 75
  poderes catalogados (`data/ganguesSpecials.js`), valores reais aplicados
  em `engine/ganguesSpecialEffects.js`. Atacante: Bruto, Duelista, Fúria,
  Especialista, Vingador. Defensor: Muralha, Guardião, Provocador, Reativo,
  Resiliente. Místico: Ígneo, Aquático, Terreno, Tempestade, Ilusório.
- **Os 3 caminhos têm design próprio** desde a v2.75.1 — Defensor e
  Místico deixaram de usar template genérico (bug corrigido na mesma
  versão: os ids de 9 dos 10 subcaminhos de Defensor/Místico não batiam
  com `signature_specials` dos personagens, então o poder equipado nunca
  era achado em combate pra 20 dos 30 personagens). Cada poder tem 3
  níveis; só dá pra equipar **2 por vez** (`selected_specials`).
- **6º poder exclusivo por personagem**, nível 50, não repetido dentro do
  mesmo subcaminho — veio junto da correção acima.
- Poderes liberam/sobem via **AP → XP**, não mais via pontos de criação:
  ver §17.4.

### 17.4 Progressão (AP, XP, nível)

- **AP base por inimigo = 10** (história ou Torre) — chegou a subir pra 30 no
  modo história (dez/2026) mas foi revertido (set/2026, pedido do Isaias: "2
  inimigos já davam 60 AP numa luta só"). Chefe vale 5×; Torre escala +100% a
  cada 5 andares. Derrota rende sempre 1 AP simbólico.
- **Recompensa por risco** (v3.36.0, recalibrada na v3.41.0 —
  `apPorInimigo` em `engine/ganguesVictoryResolver.js`). Cada inimigo rende AP
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
- **Grana da vitória** (`calcularGranaTotal`): **10 garantido** em qualquer
  vitória (mesmo contra 1 inimigo só) **+5 por inimigo a mais** no bando
  (1 = 10, 2 = 15, 3 = 20…); chefe garante **no mínimo 500**. Era 10 por
  inimigo (v3.39.0) — cortado pra +5 por extra na v3.63.1 (27/09/2026, Isaias:
  "tá ganhando muita grana, muito fácil… qualquer coisa a gente diminui
  mais", constante `GANGUES_GRANA_POR_EXTRA`). Substituiu a grana autorada
  por POI — a Rep continua autorada por POI.
- **Marcos de reputação:** a cada 50 de Rep acumulada, a gangue ganha um chip
  de poder (§9.3).
- **Regra da frustração** (v3.30.1–3.30.2): **2 derrotas seguidas** na
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
  - Existiu, brevemente (set/2026), uma variante com **custo escalonado por
    atributo** (cada ponto ficando mais caro em XP quanto mais alto o
    atributo já estava, ao estilo de sistemas por pontos como 3D&T) — o
    Isaias pediu, jogou de verdade e reverteu por completo: "isso aqui é
    estilo Ragnarok, todo nível tem que subir atributo, como era antes".
    Sem essa curva, muitos níveis seguidos não davam ganho nenhum (ex.:
    Trinca NV96-99 zerado), o que quebrava a sensação de progressão. Não
    reintroduzir sem pedido explícito e teste real em jogo.
- **1ª luta de toda conta nova é suavizada** (1 corpo só, metade dos
  pontos) — `suavizarPrimeiraLuta` em `data/ganguesEncontros.js`. É global
  por conta, não por território.

### 17.5 Tamanho de gangue e elenco

- **Elenco (roster)** começa em **2 fichas** (`GANGUES_INITIAL_PARTY_SIZE`) e
  ganha **+1 vaga por território dominado** (`getGanguesRosterLimitComHistoria`):
  2 → 9 com os 7 bairros (teto técnico `GANGUES_STORY_ROSTER_MAX` = 10). O
  maior valor entre "quanto o tier paga" e "quanto a história liberou" vale,
  não soma os dois.
- **Time de batalha** da história: no máximo **6** fichas por luta
  (`GANGUES_STORY_BATTLE_PARTY_MAX`) — elenco maior que isso escala 6.
- Limite de **fichas no roster** por tier: hoje achatado em 2 pra todos os
  planos (`GANGUES_ROSTER_LIMITS`) — cresce de verdade é pela história, não
  pela assinatura.
- **Saves**: 1/2/3 por tier free/elite/primordial (`GANGUES_SAVE_SLOT_LIMITS`).

### 17.6 Modo História — a cena navegável (hoje só a Pista)

Sistema descrito originalmente em `GANGUES_MODO_HISTORIA_ENCONTROS.md`
(2026-09-04) e já implementado pra Pista (`data/cenas/pista/`) — os outros
6 bairros ainda usam a trilha simples de nós (`GanguesTerritorio.jsx`, 3
pontos comuns + chefe por bairro), sem cena navegável própria. Desde
v3.30.0 os dois formatos usam o MESMO sistema de pontos fixos.

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
  aberto o chefe não aceita a luta. **Sem game over:** perdeu, acorda
  recuperado na birosca mais perto pagando 30 (ou empréstimo automático, ou
  +300 na dívida se já deve).
- **Farol dos pinos** (13/09/2026, `farolDe` em `GanguesCenaAtores.jsx`):
  **vermelho** = obrigatório e ainda não feito; **amarelo** = opcional;
  **verde** = já feito (treta repetível vencida uma vez também fica verde — o
  selo giratório ↻ é que avisa que dá pra repetir). Fora do farol de
  propósito: navegação (porta, saída, passagem) e o chefe (identidade própria
  vermelho-escuro com ★). Um NPC com missão pendente (ex.: a oferta do corre
  no Descanso) também fica verde, como "tem missão aqui".
- **O mapa não é estático** (v3.60.0, 26/09/2026 — substitui a andadinha
  contínua de vaivém que TODO personagem fazia, "tá muito forçado"): cada
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
- **Bando inimigo é NÍVEL FIXO** (v3.30.0, 19/09/2026 — substitui o ratio
  contra o time do jogador que existia até aqui): cada nó/POI tem um
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
  abaixo). Regra do Isaias (15/09/2026): **a 1ª luta é muito fácil de
  propósito (3); da 2ª em diante sobe de 3 em 3, sem exceção; o chefe quebra
  o padrão pra ser ralado.**

  | Ponto | Ficha | Forma | Obrigatório |
  |---|---|---|---|
  | `sinal` (apertar o pivete) | 3 | rev, dupla 15% | sim |
  | `rinha` (farm) | ~ficha do seu mais forte (mín. 3) | rev, `baseMaisForte` | não |
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
  | **Carvão** (chefe) | **30** + escolta 20 | chefe fixo | — |

  A dificuldade soma ou tira 2 de cada número (fácil −2, médio 0,
  difícil +2).

### 17.7 Persistência

- Logado: ficha inteira (incluindo XP/poderes equipados) salva em
  `gangues_fichas` (Supabase), progresso de história em `gangues_saves` —
  ambos com debounce de escrita, sem depender de `localStorage` pra dado
  de jogo.
- Guest: tudo em memória, perde ao recarregar — banner avisa.
- **Logout limpa o store do Gangues de verdade** (`AuthContext.jsx`, no
  `onAuthStateChange`) — sem isso, o próximo guest/login na mesma aba
  herdava `_userId` órfão.

### 17.8 Estrutura de arquivos (atual, pós-reorganização de set/2026)

```
src/pages/games/Gangues/
├── GanguesRoute.jsx      # shell/router — troca de fase, carrega i18n dedicado
├── Gangues.css           # ÍNDICE de @import (a ordem dos imports = ordem da cascata)
├── styles/               # CSS por assunto (combate-*, cena/*, lobby/*, …) +
│                         # paleta.css (tokens --gang-*) — refatoração de set/2026
├── screens/              # uma tela por fase (Lobby, Combat, Cena, Create,
│                         # Modes, Victory*, Album, Batalha, Clube*, Naming,
│                         # Progression, SaveSelect, StoryMap, Territorio)
│                         # + CSS de cada uma, co-localizado
├── assets/               # retratos de personagem (personagens/<slug>/neutro.png)
├── components/           # peças reutilizadas por mais de uma screen
│   └── cena/             # peças específicas da cena navegável
├── data/                 # catálogo de personagens/inimigos/itens/território,
│   └── cenas/pista/      # regras de pontos, especiais — dados, não lógica de UI
├── engine/               # resolver de combate, efeitos de poder, motor de cena
├── hooks/                # turno, i18n sob demanda, movimento de cena, etc.
└── store/
    ├── useGanguesStore.js    # composição das slices (zustand)
    └── slices/               # um arquivo por fatia de estado
```

**Auditoria de CSS no deploy** (v3.59.0): `scripts/gangues-css-audit.cjs` roda
no `predeploy` e **barra o deploy** se achar seletor morto, arquivo de CSS com
mais de 500 linhas, `@media` por largura ≥ 480px, `vw` cru ou `position:fixed`
com `inset: 0` (tem que ser `inset: 0 var(--app-gutter)`, a coluna mobile).

**Índice cruzado**: qualquer comentário de código que ainda citar
`GANGUES_DESIGN.md`/`GANGUES_HEADSUP.md`/`GANGUES_PROGRESSAO_RASCUNHO.md`/
`GANGUES_MODO_HISTORIA_ENCONTROS.md` deveria apontar pra esta seção do GDD
a partir de agora — os 4 arquivos foram removidos do repositório.

### 17.9 Referência completa — atributos e poderes por personagem (a cada 5 níveis)

Pedido do Isaias: ver como cada um dos 30 personagens evolui, atributo por
atributo, a cada 5 níveis até o teto (99), e em qual nível exato cada poder
abre/sobe de rank. Gerado direto do catálogo real
(`ldi_gangues_30_personagens_v1.json`) via
`scripts/gangues-gdd-referencia-personagens.cjs` — **rodar esse script de
novo e colar a saída aqui sempre que o catálogo for regenerado**
(`scripts/gangues-regen-catalog.cjs`), senão esta tabela fica desatualizada.
Colunas Osso/Gás = PV/PM (ver §17.1). Linhas fora do múltiplo de 5 aparecem
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

