# MARÉLIA — A Bíblia do Crime (pré-Alan)

> **Base oficial e única da lore do LDI Gangues.** Escrita em 2026-09-08.
> Substitui todos os docs de lore anteriores da pasta. Tudo aqui é **cânone
> fechado** — não é rascunho, não é proposta.
>
> **Fonte narrativa:** o conto **"Alan, o Campeão"** (`src/data/livro/contos/pt/02/01.md`
> a `19.md`, contos-index id `02`). O jogo é o pano de fundo histórico desse conto:
> a década final da fragmentação de Marélia, terminando pouco antes de o Alan
> reivindicar a coroa.
>
> Mecânica (atributos, dados, skill tree, progressão, sistema de turno) **não
> mora aqui** — está em `src/pages/games/Gangues/GANGUES_DESIGN.md`,
> `GANGUES_HEADSUP.md`, `GANGUES_PROGRESSAO_RASCUNHO.md` e
> `GANGUES_MODO_HISTORIA_ENCONTROS.md`. Esta bíblia é **o mundo**: quem manda,
> como o crime funciona, o que aconteceu antes, quem o jogador enfrenta e por quê.

Grafia oficial: **Marélia** com acento (o conto usa assim). O i18n do jogo ainda
tem "Marelia" sem acento em vários lugares — alinhar quando for mexer em texto.

---

## 0. Princípio de dados — faixas de ID

**Nenhuma entidade de jogo referencia nome, só ID.** O nome vive só no i18n
(`games.gangues.enemies.<id>.name`, etc.) — o motor nunca compara string.

| Faixa | Categoria |
|---|---|
| 1–99 | Territórios (7 oficiais + expansão futura) *(consumíveis usam a mesma faixa — ver §6; contexto separa)* |
| 100–199 | Facções / gangues (donas de território + subgrupos) |
| 200–299 | Cargos da hierarquia (flavor text dinâmico, não stats) |
| 1000–1499 | Inimigos comuns de campanha (por território) |
| 1500–1599 | Chefes de território (bosses de campanha) |
| 1600–1699 | Chefe final + generais / braços-direitos de chefe |
| 2000–2099 | Ranking clandestino (modo batalha avulso) |
| 3000–3099 | NPCs não-combatentes |
| 101–999 | Equipamento |
| 10000+ | Cartas de socket (sistema futuro) |

> Os dados atuais (`data/gangues-enemies.json`, `data/ganguesTerritorios.js`)
> ainda usam ids em string (`moleque_a`, `fumaca`, `pista`…). A migração pra
> essas faixas numéricas é canônica — o crosswalk está em cada seção abaixo.

---

## 1. A estrutura de poder — como o crime funciona em Marélia

### 1.1 A Banca — a organização-mãe

A Banca **não é uma gangue, é o sistema.** É o nome que todo mundo usa pra "como
as coisas funcionam" — o guarda-chuva que todo bonde de bairro reconhece, mesmo
brigando entre si. Nasceu **dentro do sistema prisional de Marélia**, há mais de
vinte anos, quando presos de facções soltas perceberam que unidos cobravam mais
caro e viviam mais.

A Banca não manda diretamente em cada esquina. Ela **licencia** (é uma franquia):
- cada bairro tem seu **bonde**;
- cada bonde responde pela própria área e paga um **salve** (repasse) pra cúpula;
- em troca recebe **logística** — arma, rota, proteção jurídica, advogado quando
  precisa.

A matriz fornece estrutura; o bonde local fornece gente e sangue.

Quando um bonde discorda da Banca, tem duas saídas: ficar quieto e pagar, ou
**rachar**. Foi assim que a facção do Sombra, na Baixada, virou três cacos — uma
cisão antiga que só explodiu quando o Sombra caiu no valão (§3, Ano 1–2).

**No conto:** é a Banca que puxa o Alan pra dentro aos ~4 anos (a "Tia" era o RH),
que o usa de **bucha de canhão**, que o abandona no reformatório aos 7, que o
recebe de volta aos 10 com o "plano de dominância", e que aos 16 manda ele sumir
quando ele vira alvo grande demais. A cúpula da Banca é quem, no fim, não gosta
que o Campeão "passa pano" pro Kim e pro Jack.

### 1.2 A hierarquia — de baixo pra cima (faixa 200–299)

| ID | Cargo | O que faz | Exemplos em jogo |
|---|---|---|---|
| 201 | Fogueteiro / Vigia | Fica na entrada, avisa quando estranho ou viatura sobe | Pavio Curto (1043), Cupim (1041) |
| 202 | Vapor | Vende na boca, cara a cara com o cliente | Ratazana (1001), Choque (1013) |
| 203 | Gerente de boca | Administra 1 ponto de venda — estoque, turno, disciplina dos vapores | Unha de Fome (1011), Cadeado (1031) |
| 204 | Cobrador | Cobra dívida, empresta com juro, "resolve" atraso | Marreta da Feira (1012), O Cobrador (1501) |
| 205 | Frente / Geral de bairro | Dono do bairro inteiro, responde direto pra cúpula | os 7 chefes de território (§5) |
| 206 | Sintonia | Conselho informal entre os Gerais — resolve disputa de fronteira sem guerra | não-jogável, citada em diálogo |
| 207 | Cúpula | 4–5 pessoas que a rua nunca vê. Decidem expansão, guerra, quem sobe | citada, nunca mostrada (gancho futuro) |
| 208 | O Dono de Marélia | Cargo vago desde sempre. Só o Retalho chegou perto. Depois dele, o Alan | — |

No conto, o Alan passa por quase todos esses degraus entre os 4 e os 13 anos:
bucha → olheiro → rua com os adultos → (reformatório) → executor da cúpula (mata o
Sombra aos 11) → **dono de bairro aos 13**, coordenando adultos de 30, 40 anos.

### 1.3 O Proceder — o código que segura tudo

Código não-escrito, mais forte que qualquer lei formal: quem quebra não vai preso,
**desaparece**. Nome que a própria comunidade usa no jogo:

1. **Ninguém rouba de morador.** Rouba de fora, de rival, nunca de quem paga
   aluguel na mesma rua que você.
2. **Dívida se paga.** Não tem prazo bom nem ruim — tem prazo vencido.
3. **Boca não se invade sem sintonia.** Tomar ponto de outro bairro sem avisar a
   Sintonia é declaração de guerra.
4. **Não se desafia o topo sem rachar a base primeiro.** Na prática do jogo, isso
   é o **portão do chefe**: você só encara o Geral depois de já ter desestabilizado
   a base dele (bater os pontos do território).
5. **Criança não é dono, mas também não é intocável.** É a brecha que o Alan usou
   a vida inteira — bucha primeiro, cria de proteção depois. Personagens jovens
   recrutados carregam essa dualidade: menos suspeita narrativa, menos R inicial.

---

## 2. As facções — quem é dono de cada pedaço (faixa 100–199)

Cada uma é uma organização com filosofia própria, não só "a gangue do bairro X".

| ID | Facção | Território | Filosofia / o que os move |
|---|---|---|---|
| 101 | **Rato de Pista** | A Pista | Sem ambição de subir — só querem não ser pisados. Território mais mutável de Marélia, muda de mão o tempo todo. |
| 102 | **Bonde do Sinal** | A Pista | Molecada do farol — **informação** é a moeda deles, não droga. |
| 103 | **Acerto de Contas** | A Feira | Não vende droga como prioridade — vende **dívida**. O Cobrador é um contador antes de ser bandido. |
| 104 | **Os Gato** | A Feira | Ligação clandestina de energia. Não são violentos por natureza — são **essenciais**, e isso os protege. |
| 105 | **Sombra Rubra** | A Baixada | O caco mais violento da antiga facção do Sombra — acha que é o herdeiro legítimo. |
| 106 | **Sombra Fria** | A Baixada | O caco calculista — não disputa território por orgulho, só por lucro. |
| 107 | **Os Restos** | A Baixada | O caco desesperado — sem nada a perder é o mais perigoso dos três, mesmo sendo o mais fraco. |
| 108 | **Bonde dos Prédio** | A Vila | Controla **verticalmente** — de baixo pra cima, andar por andar. Estrutura quase militar. |
| 109 | **Os Andar de Cima** | A Vila | Olham o bonde de cima — donos dos últimos andares, se acham a aristocracia da Vila. |
| 110 | **Frente da Escada** | O Morro | Guarda a única subida — controla quem entra e quem sai **fisicamente**. |
| 111 | **Os Fogueteiro** | O Morro | Sistema de alerta do bairro inteiro — rojão é comunicação, não só ameaça. |
| 112 | **Os Cinco** | Alto do Morro | Quase viraram cúpula. A ambição deles é o motivo de o Retalho ter pressa em consolidar. |
| 113 | **A Roda** | Alto do Morro | Lutam em formação — não têm líder carismático, têm **doutrina**. |
| 114 | **O Bonde do Retalho** | A Laje | Único bonde que já segurou 6 bairros de uma vez. Estrutura mais "corporativa" de Marélia — o Retalho trata crime como logística. |

---

## 3. Linha do tempo — os 10 anos antes do Rei

Pano de fundo histórico. Não precisa ser narrado em jogo — é o "porquê" por trás
de cada território. Roda **em paralelo** ao arco do Alan no conto (ele subindo os
próprios degraus, dos 4 aos 16, num bairro específico; os dois arcos só se cruzam
depois, quando o Alan já é o Campeão).

- **Ano 1–2 — A Rachadura.** O Sombra, dono incontestável da Baixada, morre
  (afogado no valão — causa nunca esclarecida, **e o jogo não esclarece de
  propósito**). *[No conto: foi o Alan quem o matou, aos 11, disfarçado de
  mendigo. Marélia nunca soube.]* A Banca não intervém rápido. Três tenentes —
  futuros **Sangria, Gelo e Sobra** — não concordam em quem herda. A Baixada
  racha em três. Primeiro sinal público de que Marélia pode ser tomada em pedaços.
- **Ano 3 — O Aprendizado do Retalho.** Um cobrador de bairro médio, sem nome de
  peso, observa a rachadura e tira a lição: **território não se segura com força,
  se segura com costura** — amarrar vários bondes pequenos numa lealdade só, sem
  dominar todos por violência direta. Esse cobrador é **Damião**.
- **Ano 4–5 — A Costura Começa.** Damião consolida a Pista e a Feira como "sócio
  maior", não dono absoluto. Ganha o apelido **Retalho**: "cose pedaço com
  pedaço" — cada bairro que entra na órbita dele continua parecendo independente
  por fora, mas responde por dentro.
- **Ano 6 — A Vila resiste.** O Bonde dos Prédio, militarizado, recusa a costura.
  Primeira guerra de verdade da década. A Vila entra na órbita mesmo assim, mas
  **ressentida** — é por isso que dominar a Vila é o degrau onde a dificuldade
  sobe mais duro (`disputa`).
- **Ano 7 — O Morro nunca foi tomado por fora.** **Zefa ("A Fera")** negocia como
  igual com o Retalho em vez de ser engolida — criou metade da criançada da
  região, tem lealdade que dinheiro não compra. O acordo nunca vira submissão
  completa. É por isso que o Morro é `guerra` e não `disputa` — resistência
  genuína, não fraqueza.
- **Ano 8 — Os Cinco quase viram cúpula.** No Alto do Morro, cinco figuras se
  organizam **horizontalmente**, sem líder único, imitando a lógica da própria
  Banca. Se terminarem, rivalizam a Banca inteira. O Retalho intervém antes —
  engole o Alto por **absorção**, não por guerra.
- **Ano 9 — A Laje.** Damião sobe pra Laje, o topo físico e simbólico. Seis
  bairros já respondem a ele. Ninguém nunca chegou tão perto de ser dono de
  Marélia inteira.
- **Ano 10 — O jogo.** O jogador entra lá embaixo, na Pista, com uma gangue de
  dois. Sobe bairro por bairro — **exatamente a rota que o Retalho subiu**, sem
  saber que repete os passos dele. Derruba o Retalho na Laje. Em duas semanas o
  mapa racha de novo: nem o Retalho segurou, nem a gangue do jogador segura.
- **Anos depois (fora do jogo).** Um garoto de cabelo esquisito, **nascido dentro
  do sistema** — bucha desde os três anos, não um cobrador que subiu — consegue o
  que nem o Retalho nem a gangue do jogador conseguiram: vira o **primeiro Rei de
  fato de Marélia**. Esse é o **Alan**.

---

## 4. Os 7 territórios — versão oficial (faixa 1–99)

Escala de temperatura: `rato → muvuca → correria → disputa → guerra → sangue → coroa`.
Cada território tem um **motivo histórico** pra sua dificuldade (§3) — não é só
escalonamento de número.

| ID | Território | Facção dona | Temp. | Tema central |
|---|---|---|---|---|
| 1 | **A Pista** | Rato de Pista (101) / Bonde do Sinal (102) | Rato de rua | **Origem** — todo mundo começa aqui: o Retalho, o jogador, e (noutro bairro) o Alan |
| 2 | **A Feira** | Acerto de Contas (103) / Os Gato (104) | Muvuca | **Dívida, não violência** — o primeiro território costurado pelo Retalho sem sangue |
| 3 | **A Baixada** | os 3 cacos do Sombra (105/106/107) | Correria | **Fragmentação** — o que acontece quando um território perde o dono e ninguém segura o vácuo |
| 4 | **A Vila** | Bonde dos Prédio (108) / Andar de Cima (109) | Disputa | **Resistência militarizada** — a única região que entrou na órbita do Retalho por guerra, não por costura |
| 5 | **O Morro** | Frente da Escada (110) / Fogueteiro (111), sob Zefa | Guerra | **Lealdade pessoal** — a região que nunca foi realmente dominada, só negociada |
| 6 | **Alto do Morro** | Os Cinco (112) / A Roda (113) | No sangue | **A ameaça que quase virou cúpula paralela** — o ponto mais "político" do jogo |
| 7 | **A Laje** | Bonde do Retalho (114) | A Coroa | **O topo** — onde a pergunta do jogo ("dá pra segurar Marélia?") é respondida com um **não** |

**Crosswalk de id (string atual → id oficial):**
`pista→1, feira→2, baixada→3, vila→4, morro→5, alto→6, laje→7`.

Ponte entre regiões (mantida): a Feira só libera o chefe depois de o jogador
voltar na Pista e falar com o informante **Duda, o Orelha** (3002).

---

## 5. Roster de inimigos — o Álbum de Marélia

Cada inimigo derrotado pela **primeira vez** desbloqueia uma entrada no álbum:
nome, arma, facção, lore curta. Shape canônico:

```json
{
  "id": 1001,
  "faccaoId": 101,
  "territorioId": 1,
  "arma": "facão",
  "elemento": null,
  "album": {
    "titulo": "Ratazana",
    "linha": "Molecada de ponto. A primeira treta de verdade do jogador em Marélia.",
    "desbloqueadoEm": "primeira_vitoria"
  }
}
```

Total: **46 entradas de campanha + 8 do ranking = 54.** Entradas marcadas
*(atual)* já têm ficha em `data/gangues-enemies.json` (stats no `GANGUES_DESIGN.md`
§6 / `GANGUES_INVENTARIO` não existe mais — stats abaixo). Marcadas *(novo)* são
canônicas mas ainda sem ficha de combate.

### A Pista — facção 101/102 · território 1

| id | Nome | Arma | A/H/R/D · PV/PM | Lore | Origem |
|---|---|---|---|---|---|
| 1001 | Ratazana | facão | 1/0/2/1 · 6/6 | Molecada de ponto — a primeira treta de verdade. | atual (`moleque_a`) |
| 1002 | Cão Louco | corrente | 2/1/3/1 · 9/9 | Um degrau acima, agressivo por natureza. | atual (`moleque_b`) |
| 1003 | Brasa | estilingue | 1/1/2/2 · 8/4 | Copiava o Carvão até o apelido colar. | atual (`moleque_c`) |
| 1004 | Farejador | — | a definir | Não briga — corre e avisa. Enfrentá-lo é sempre uma perseguição antes da porrada. | novo |
| 1005 | Dedo-Duro | faca pequena | a definir | Vende informação pros dois lados. Ninguém confia, todo mundo usa. | novo |
| **1500** | **Carvão** *(chefe)* | facão | 3/1/4/1 · 12/12 | Some no meio da rua, bate no escuro. Chefe da Pista. | atual (`fumaca`) |

### A Feira — facção 103/104 · território 2

| id | Nome | Arma | A/H/R/D · PV/PM | Lore | Origem |
|---|---|---|---|---|---|
| 1011 | Unha de Fome | porrete | 2/1/3/1 · 9/9 | Cobrador de rua — bate na porta antes do chefe cobrar de verdade. | atual (`turco_batedor`) |
| 1012 | Marreta | porrete | 2/2/3/1 · 12/6 | Braço de confiança, cobra dívida grande sem conversa. | atual (`turco_capanga`) |
| 1013 | Choque | faca | 2/3/4/1 · 12/12 | Ligação clandestina de energia — rápido, some no meio das bancas. | atual (`gato_eletrico`) |
| 1014 | Caderneta | — | a definir | Luta com números. Sabe o que cada morador deve e usa isso como arma psicológica (debuff: −Rep se perder pra ele). | novo |
| 1015 | Luz de Gato | fiapo elétrico | a definir | Um dos Gato mais experientes — choque leve, dano baixo mas atordoante. | novo |
| **1501** | **O Cobrador** *(chefe)* | porrete | 3/2/4/2 · 16/8 | Anota tudo, cobra tudo. Chefe da Feira. | atual (`turco`) |

### A Baixada — facção 105/106/107 · território 3

| id | Nome | Arma | A/H/R/D · PV/PM | Lore | Origem |
|---|---|---|---|---|---|
| 1021 | Sangria | faca | 3/1/4/2 · 12/12 | O pedaço mais bravo dos três cacos do Sombra. | atual (`sombra_rubra`) |
| 1022 | Gelo | faca | 2/2/4/3 · 16/8 | O pedaço calculista — não erra. | atual (`sombra_fria`) |
| 1023 | Sobra | corrente | 3/2/5/1 · 15/15 | O mais desesperado — nada a perder. | atual (`os_restos`) |
| 1024 | Valão | remo improvisado | a definir | Vive perto de onde o Sombra caiu — supersticioso, os outros dois cacos o evitam. | novo |
| 1025 | Herdeiro | faca dupla | a definir | Afirma ser o verdadeiro sucessor do Sombra — nenhum dos três o reconhece, e ele não desiste. | novo |
| **1502** | **Fura-Bucho** *(chefe)* | espeto | 4/2/5/2 · 20/10 | Assumiu a Baixada inteira quando o Sombra morreu. | atual (`espeto`) |

### A Vila — facção 108/109 · território 4

| id | Nome | Arma | A/H/R/D · PV/PM | Lore | Origem |
|---|---|---|---|---|---|
| 1031 | Cadeado | chave de cano | 2/1/4/3 · 16/8 | Toma conta do térreo. | atual (`bonde_predio_1`) |
| 1032 | Trinco | chave de cano | 3/2/6/3 · 18/18 | Comanda um andar inteiro. | atual (`bonde_predio_2`) |
| 1033 | Goteira | taco | 2/2/5/3 · 20/10 | Mora nos andares de cima, olha o bonde de cima pra baixo. | atual (`andar_de_cima`) |
| 1034 | Elevador | cano curto | a definir | Só ataca em espaço fechado — luta suja em corredor. | novo |
| 1035 | Zelador | chave-de-fenda | a definir | Infiltrado — parece morador comum, é braço armado do bonde. | novo |
| **1503** | **Ferrugem** *(chefe)* | taco | 3/2/5/4 · 20/10 | Último andar — quem sobe já chega cansado. | atual (`sala`) |

### O Morro — facção 110/111 · território 5

| id | Nome | Arma | A/H/R/D · PV/PM | Lore | Origem |
|---|---|---|---|---|---|
| 1041 | Cupim | faca | 3/3/6/2 · 18/18 | Vigia da escadaria. | atual (`frente_escada_1`) |
| 1042 | Cascalho | faca | 4/3/7/3 · 21/21 | Capitão — subiu rápido, bate mais forte que todo mundo. | atual (`frente_escada_2`) |
| 1043 | Pavio Curto | rojão (fogo) | 5/2/11/3 · 22/44 | Solta aviso — e não se importa de acertar você com ele. | atual (`fogueteiro`) |
| 1044 | Ladeira | facão curto | a definir | Luta na descida — usa a inclinação do próprio Morro como arma. | novo |
| 1045 | Criação da Zefa | punhos | a definir | Um dos moleques que a Fera criou — briga com técnica emprestada dela. | novo |
| **1504** | **A Fera / Zefa** *(chefe)* | vara | 4/3/12/4 · 24/48 | Criou metade da criançada da região. Chefe do Morro. | atual (`zefa`) |

### Alto do Morro — facção 112/113 · território 6

| id | Nome | Arma | A/H/R/D · PV/PM | Lore | Origem |
|---|---|---|---|---|---|
| 1051 | Verme | porrete | 4/3/5/2 · 20/10 | Um dos cinco que quase viraram cúpula. | atual (`os_cinco_1`) |
| 1052 | Presa | porrete | 5/3/8/3 · 24/24 | Braço-direito da cúpula quase formada. | atual (`os_cinco_2`) |
| 1053 | Engrenagem | corrente | 5/3/7/4 · 28/14 | Luta em formação, protege o centro. | atual (`a_roda`) |
| 1054 | Porta de Aço | barra de ferro | a definir | Guarda literal da entrada do Alto — não sai do posto nem sob pressão. | novo |
| 1055 | Doutrina | bastão | a definir | Recruta e treina pros Cinco — ensina a lutar em formação, não sozinho. | novo |
| **1505** | **O Contador** *(chefe)* | bengala | 5/4/15/5 · 30/60 | Tem o Alto inteiro devendo favor. | atual (`doutor`) |

### A Laje — facção 114 · território 7

| id | Nome | Arma | A/H/R/D · PV/PM | Lore | Origem |
|---|---|---|---|---|---|
| 1061 | Fiapo | facão | 4/4/8/3 · 24/24 | Primeira linha do bonde do Retalho. | atual (`bonde_costura_1`) |
| 1062 | Agulha | facão | 5/4/9/4 · 27/27 | Segunda linha — o Retalho confia nele com metade da Laje. | atual (`bonde_costura_2`) |
| 1063 | Tesoura | facão | 6/4/8/4 · 32/16 | General — comanda a Laje em nome do Retalho. | atual (`bonde_costura_3`) |
| 1064 | Linha Reta | facão longo | a definir | O mais antigo dos generais do Retalho — luta sem desperdiçar um movimento. | novo |
| **1600** | **O Retalho / Damião** *(chefe final)* | facão | 6/5/17/5 · 34/68 | O único que já segurou seis bairros de uma vez. | atual (`costura`) |

### Ranking clandestino — modo batalha avulso (faixa 2000–2099)

Fora da campanha. Eco distante do cânone maior do LDI (reflavorizados na
v2.33/2.34 pra cortar o cruzamento direto com Torre Kronos, Dojô de Karnazar,
Kim, Jack).

| id | Nome | A/H/R/D · PV/PM | Arma | Elem. | Lore | string atual |
|---|---|---|---|---|---|---|
| 2001 | Saco de Pancada | 1/0/2/0 · 6/6 | punhos | — | Bonequinho de pano que apanha pra quem tá começando treinar. | `treinamento` |
| 2002 | Corte Fundo | 3/3/4/2 · 16/8 | katana | fogo | Lutadora veterana de Marélia. Agressiva com a katana. | `kaeda` |
| 2003 | Curto-Circuito | 4/4/10/2 · 20/40 | bastão | ar | Enrola fio elétrico no bastão antes de entrar na roda. Nome que já correu vários bairros. | `thunderbolt` |
| 2004 | Traça | 3/5/13/3 · 26/52 | lâmina-corrente | trevas | Clona cartão, invade câmera, some antes da polícia. Trabalha pra quem paga mais. | `stormbyte` |
| 2005 | Cascudo | 5/5/10/5 · 30/30 | mãos | terra | Treinou metade dos capoeiristas de rua num terreiro sem placa. Defesa impenetrável. | `viran` |
| 2006 | Quebra-Queixo | 6/5/12/4 · 36/36 | punhos | neutro | Ninguém no rachão clandestino nunca o colocou no chão. Defende o título há anos. | `campeao` |
| 2007 | O Coveiro | 7/7/25/6 · 50/100 | — | trevas | Ninguém sabe o nome nem viu o rosto. Manda em toda Marélia das sombras. | `kronos` |
| 2008 | Breu | 8/6/30/5 · 60/120 | bengala | fogo | Luta com chama negra nos punhos. O nome no topo de todo ranking clandestino. | `primordial_jack` |

`preferred_mode` → caminho de combate: `fists→atacante`, `armed→defensor`,
`power→místico`.

---

## 6. Os 30 lutadores recrutáveis (o elenco do jogador)

Catálogo `ldi_gangues_30_personagens_v1.json`. Nome curto de rua + subcaminho +
título de evolução máxima (nível 10). Liberação: `w1` = 5 iniciais · `w2` =
durante a 1ª campanha · `w3` = 2º clear · `w4` = só evento.

| id | Nome | Caminho | Subcaminho | Título nv.10 | Libera |
|---|---|---|---|---|---|
| 1 | Trinca | Atacante | Bruto | O Quebra-Linha | w1 |
| 2 | Marreta | Atacante | Bruto | Demolidor | w2 |
| 3 | Fenda | Atacante | Duelista | Primeiro Corte | w1 |
| 4 | Navalha | Atacante | Duelista | Sem Aviso | w2 |
| 5 | Touro | Atacante | Fúria | Último de Pé | w3 |
| 6 | Sangue | Atacante | Fúria | Tudo ou Nada | w3 |
| 7 | Mira | Atacante | Especialista | Cirúrgica | w4 |
| 8 | Ponto | Atacante | Especialista | Ponto Cego | w4 |
| 9 | Cicatriz | Atacante | Vingador | Dívida Antiga | w4 |
| 10 | Troco | Atacante | Vingador | Cobrança | w4 |
| 11 | Muro | Defensor | Muralha | Fortaleza | w1 |
| 12 | Concreto | Defensor | Muralha | Bloco Vivo | w3 |
| 13 | Guarda | Defensor | Guardião | Linha de Frente | w2 |
| 14 | Ombro | Defensor | Guardião | Ninguém Passa | w3 |
| 15 | Boca | Defensor | Provocador | Olha Pra Mim | w3 |
| 16 | Isca | Defensor | Provocador | Alvo Perfeito | w3 |
| 17 | Catraca | Defensor | Reativo | Bateu, Voltou | w1 |
| 18 | Rebote | Defensor | Reativo | Volta em Dobro | w4 |
| 19 | Ferro | Defensor | Resiliente | Não Cai | w4 |
| 20 | Osso | Defensor | Resiliente | Ainda de Pé | w4 |
| 21 | Brasa | Místico | Ígneo | Incêndio | w2 |
| 22 | Cinza | Místico | Ígneo | Depois do Fogo | w3 |
| 23 | Maré | Místico | Aquático | Maré Cheia | w2 |
| 24 | Chuva | Místico | Aquático | Temporal | w4 |
| 25 | Raiz | Místico | Terreno | Chão Fechado | w3 |
| 26 | Racha | Místico | Terreno | Falha Sísmica | w3 |
| 27 | Faísca | Místico | Tempestade | Antes do Trovão | w1 |
| 28 | Trovão | Místico | Tempestade | Queda do Céu | w3 |
| 29 | Névoa | Místico | Ilusório | Sem Rosto | w4 |
| 30 | Espelho | Místico | Ilusório | Duas Verdades | w4 |

> Colisão de apelidos: **Marreta** (2) e **Brasa** (21) também são nomes de
> inimigo (1012, 1003) — apelidos de rua se repetem, não é a mesma pessoa.

A gangue tem **nome escolhido pelo jogador** — é o nome que os inimigos cospem e
que "o Retalho vai cuspir quando cê chegar na Laje". Sugestões do jogo: *Bonde do
Fim de Linha, A Firma, Trilha de Cima, Sindicato do Beco, Quebrada Nova*.

---

## 7. NPCs não-combatentes (faixa 3000–3099)

Da cena navegável da Pista (`data/cenas/pista.js`):

| id | Nome | Papel |
|---|---|---|
| 3001 | **Nego Véio / Seu Nato** | O coroa da esquina, dono da birosca. Dá um corre (levar pacote sem a viatura ver) e conta onde o Carvão se enfia. Depois disso a birosca fica aberta pra gangue descansar. |
| 3002 | **Duda, o Orelha** | "Sabe tudo que rola em Marélia." Informante que destranca o chefe da Feira. Fica na Pista mesmo depois dela virar bairro dominado. |
| 3003 | **A cria do sinal** | Moleque vendendo bala no farol. "Eu vejo tudo desse farol." Vende informação sobre o ferro-velho; pode ser apertado (vira treta fácil, −rep). |

**NeoGuide** — mascote/guia oficial do universo LDI (cor `#00B4D8`, aparece em
outros jogos do site). Faz o onboarding e os tutoriais. **Não é personagem de
Marélia** — é a voz meta/tutorial, fora da ficção do crime.

---

## 8. Itens — catálogo oficial

### 8.1 Economia
Duas moedas, só no modo história: **Grana** 💵 (corre, achado, treta, chefe →
gasta em loja e descanso) e **Nome / Rep** (vitória, escolha ousada → destranca
POI, alimenta o % de domínio e o texto do final). Estado em `store.grana` /
`store.rep`, persistido em `gangues_story_progress`.

### 8.2 Inventário — é da GANGUE, não do personagem
- **Consumível:** `store.inventario` `{ [id]: qtd }`, ids **1–99**.
- **Equipamento:** `store.equipamentos` `[{ uid, itemId, cards }]`, ids **101+**.
  Uma peça equipada sai do inventário da gangue e vive em
  `sheet.attributes.equipment[slot]`; volta ao desequipar.
- Ações: `comprarItem`, `usarItem`, `comprarEquip`, `comprarEEquipar`,
  `equiparItem`, `desequiparItem`.

### 8.3 Consumíveis

| id | Nome | tipo | efeito | custo | ícone | origem |
|---|---|---|---|---|---|---|
| 1 | Poção de HP | `cura_pv` | +5 PV | 5 💵 | 🩹 | atual |
| 2 | Poção de MP | `cura_pm` | +5 PM | 5 💵 | 💧 | atual |
| 3 | Cigarro de Palha | `cura_pm` leve | +3 PM, −1 D por 1 turno (tremedeira) | 3 💵 | 🚬 | oficial |
| 4 | Water (energético) | `cura_pm` | +8 PM | 8 💵 | 🥤 | oficial |
| 5 | Faixa de Pano | `cura_pv` fraca | +3 PV — só craftável (drop, não compra) | — | 🩹 | oficial |
| 6 | Pinga | `buff_ataque` | +2 A por 2 turnos, −1 D (coragem líquida) | 6 💵 | 🍾 | oficial |
| 7 | Apito | `fuga` | Chance de fugir do combate sem penalidade | 5 💵 | 📯 | oficial |
| 8 | Fumaça (bombinha) | `debuff_inimigo` | −1 H em todos os inimigos por 1 turno | 10 💵 | 💨 | oficial |
| 9 | Trocado Marcado | `isca` | Some com 1 inimigo por 1 turno (ele "cai na esperteza") | 6 💵 | 🪙 | oficial |

### 8.4 Equipamento — 6 slots por personagem

Slots (bonecão de cima pra baixo): `cabeca` 🪖 · `corpo` 🦺 (a escolha PV vs PM) ·
`bracos` 🧤 · `pes` 🥾 · `amuleto` 📿 · `arma` 🥊.
Bônus = atributo plano (**A/H/D**) ou recurso plano (**pv/pm**, somado em cima do
máximo, **não passa por R**). Raridades: `comum` · `incomum` · `raro` · `epico`.
**Cartas/sockets** (`cardSlots` 0–2, estilo Ragnarok): os slots existem, as cartas
vêm do sistema de drop (faixa 10000+, futuro). **Tirar carta encaixada DESTRÓI a
carta. Desequipar o item inteiro não.**

| id | Nome | slot | raridade | bônus | cartas | custo | origem |
|---|---|---|---|---|---|---|---|
| 101 | Soqueira de Lata | arma | comum | +1 A | 0 | 16 💵 | atual |
| 102 | Faca Serrilhada | arma | incomum | +2 A | 1 | — | atual |
| 103 | Cano de Ferro | arma | raro | +2 A, +1 H | 2 | — | atual |
| 104 | Gorro de Moletom | cabeça | comum | +1 D | 0 | 12 💵 | atual |
| 105 | Capacete de Obra | cabeça | incomum | +2 D | 1 | — | atual |
| 106 | Coroa de Lata | cabeça | raro | +1 A, +1 D | 2 | — | atual |
| 107 | Colete Reforçado | corpo | comum | +6 PV | 0 | 20 💵 | atual |
| 108 | Colete Leve | corpo | comum | +6 PM | 0 | 20 💵 | atual |
| 109 | Colete de Placa | corpo | incomum | +12 PV | 1 | — | atual |
| 110 | Manto com Capuz | corpo | incomum | +12 PM | 1 | — | atual |
| 111 | Armadura de Rua | corpo | raro | +18 PV | 2 | — | atual |
| 112 | Luva de Couro | braços | comum | +1 D | 0 | 12 💵 | atual |
| 113 | Manopla de Porca | braços | incomum | +2 A | 1 | — | atual |
| 114 | Braçadeira de Cravo | braços | raro | +1 A, +1 D | 2 | — | atual |
| 115 | Tênis Furado | pés | comum | +1 H | 0 | 12 💵 | atual |
| 116 | Coturno | pés | incomum | +1 H, +1 D | 1 | — | atual |
| 117 | Bota com Biqueira | pés | raro | +2 H | 2 | — | atual |
| 118 | Corrente de Lata | amuleto | comum | +1 H | 1 | 16 💵 | atual |
| 119 | Dente de Ouro | amuleto | incomum | +1 A | 1 | — | atual |
| 120 | Medalha de Santa | amuleto | raro | +1 D, +1 H | 2 | — | atual |
| 121 | Boné Vira-Lata | cabeça | comum | +1 H | 0 | 12 💵 | oficial |
| 122 | Balaclava de Pano | cabeça | incomum | +1 D, +1 H | 1 | — | oficial |
| 123 | Jaqueta de Bonde | corpo | comum | +6 PV | 0 | 20 💵 | oficial |
| 124 | Manto de Sintonia | corpo | raro | +18 PM | 2 | — | oficial |
| 125 | Manopla de Prego | braços | incomum | +2 A | 1 | — | oficial |
| 126 | Chinelo Reforçado | pés | comum | +1 H | 0 | 12 💵 | oficial |
| 127 | Corrente de Ouro Falso | amuleto | incomum | +1 A, **+1 Rep** | 1 | — | oficial |
| 128 | Terço de Vó | amuleto | raro | +1 D, +1 H | 2 | — | oficial |
| 129 | Facão de Cabo Fita | arma | comum | +1 A | 0 | 16 💵 | oficial |
| 130 | Espeto de Grade | arma | raro | +2 A, +1 D | 2 | — | oficial |
| 131 | Bastão de Sinaleiro | arma | incomum | +1 A, +1 H | 1 | — | oficial |

**Épicos** (drop de chefe):

| id | Nome | slot | bônus | drop de |
|---|---|---|---|---|
| 132 | Facão do Retalho | arma | +4 A, +2 D, 2 cartas | chefe final (1600), campanha |
| 133 | Coroa da Laje | cabeça | +3 D, +2 H, 2 cartas | chefe final (1600), campanha |
| 134 | Corda de Vara (Zefa) | arma | +3 A, +1 H, cura 5 PV ao derrotar inimigo | chefe do Morro (1504) |

> **+1 Rep em equipamento** (item 127) é o primeiro efeito **fora de combate** —
> precisa de spec própria quando for implementar.

### 8.5 Loja
POI de tipo `loja`; catálogo por região (`poi.itens`, mistura consumível e
equipamento). Hoje só a Pista tem: `1, 2, 104, 107, 108, 112, 115, 118, 101`.
Cada região ganha catálogo próprio.

---

## 9. Conto 02 — sinopse canônica ("Alan, o Campeão")

Fonte completa: `src/data/livro/contos/pt/02/01.md` … `19.md`. 1ª pessoa, contada
pelo Campeão. Peso pesado, canônico.

| Cap | Título | O que estabelece |
|---|---|---|
| 1 | O Rei | Alan hoje é o **Rei de Marélia** (nome que o Jack deu). Aqui em cima a hierarquia se resolve metade no dinheiro, metade "do jeito antigo" — dois homens, um espaço vazio, o Morro em volta. Quem fica em pé contra todo mundo vira Rei. Ele carrega **duas pedras no sapato**: o Kim e o Jack. Bateu neles anos a fio, nunca viu nenhum dos dois ganhar, nunca viu nenhum dos dois parar. |
| 2 | Três Anos | Aos 3, Alan vê **o pai estrangular a mãe** na cozinha. Vai embora descalço na madrugada. Primeira regra: *se você não anda, ninguém anda por você.* |
| 3 | A Bucha | O crime é a única coisa que emprega quem "não existe no papel". Aos ~4 a **Banca** o puxa (a "Tia" = RH). Vira **bucha de canhão**: pego de propósito com o produto na mão porque menor não responde. É **pago pra ser preso**. |
| 4 | O Reformatório | Aos 7, pego "pra valer" (uma arma no meio). A Banca não move um dedo. 3 anos preso. Descobre — vendo o bruto **Toninho** obedecer o magrelo **Escrivão** — que *força te leva até um ponto; depois quem sobe é quem pensa.* Estuda a biblioteca inteira, se pune fisicamente a cada erro, organiza o lugar, recruta, escreve um **plano de dominância**. |
| 5 | O Alto do Morro | Sai aos 10, a **cúpula** (4–5 pessoas que a rua nunca vê) o espera no portão. Ele apresenta o plano: **território é costura, não parede** — toma as bordas fracas, uma por mês, sem bandeira. Acordo: "Começa pelo Beco da Lúnica. Se der certo, você não é mais bucha. Se der errado, você nunca trabalhou aqui." |
| 6 | O Mendigo | Primeiro nome da lista: **o Sombra**, chefe da Baixada — fantasma sem rotina. A rachadura dele é café. Alan, aos 11, disfarçado de mendigo manco, o mata com uma faca ("quinze, dezesseis, dezessete"). Troca de roupa num beco, vira playboy. **A Baixada racha em três.** Deixa de ser bucha. |
| 7 | Dono de Bairro | 3 anos de serviços (o cobrador que roubava migalha; a briga de muro que ele comprou e virou beco; o policial que queria transferência). Aos **13 vira dono de bairro** — coordena adultos de 30, 40 anos. Regra do Morro: **quem manda é quem entrega.** O gerente Boiadeiro testa; Alan senta na boca dele anotando clientes até a venda parar. |
| 8 | O Indiozinho | Terça comum, Alan carregando 2 kg de pó na mochila. Um moleque (~6-7, metade da idade dele) derruba dois na rua dele e **planta o pé na frente dele, sem medo, e não sai.** Alan não pode deixar barato — rua que vê isso sem consequência começa a fazer conta. |
| 9 | A Pantera | Primeira briga com o indiozinho. Ele entra numa **postura** que alguém ensinou; tem noção sem experiência. Quanto mais apanha, mais **selvagem** fica — mãos no chão, "pantera filhote". Resistência anormal: **não cai.** Alan vai embora com pressa, achando que nunca mais vê o moleque. |
| 10 | O Cabelinho Verde | Uma semana depois, outro moleque — negro, dentes brancos, cabelo verde mal pintado — sobe o Morro **procurando "Alan" pelo nome**. Pula abestado, leva chute, ri do chão: *"vou te chamar de Campeão."* **O nome pega** — anos depois Kim e Jack ainda usam ([linha principal, cap. 3](/historias/lutas-de-ilusao/capitulo-03)). Esse fica cada vez mais **preciso** apanhando, mas sabe perder: *"eu volto. E da próxima vez eu venço você."* |
| 11 | O Parque | Alan vê os dois brigando entre si num terreno baldio. Trombadinhas miram o celular quebrado deles. Os dois **trocam um olhar e viram de costas um pro outro**, cada um cobrindo uma metade — como se já fosse combinado. |
| 12 | De Costas | "Uma pessoa dividida em dois corpos." Limpam um grupo grande sem combinar nada, cada um tapando o buraco do outro; quando acaba, **voltam a brigar entre si de onde pararam**. Alan decide que **precisa** recrutar os dois — "ferramenta que a Banca ia levar dez anos pra fabricar". |
| 13 | Primeira Segunda-Feira | Alan propõe: **toda 1ª segunda do mês** os dois podem subir o Morro e brigar com ele, juntos. Ganham o respeito dele se puserem **um joelho dele no chão**. Jack: "a gente não quer seu respeito, só quer te vencer... acaba com a sua raça." Kim: "não me mete nas suas coisas." |
| 14 | A Cerimônia | ~2 anos de brigas mensais. **1º mês:** Alan descobre que brigar com eles é *divertido* — sentimento que ele nunca tinha tido. **3º mês:** Kim doma a pantera (selvagem com propósito); Jack lê as dicas do Alan. **6º mês:** Kim quase põe um joelho dele no chão. **1 ano:** o Morro inteiro assiste da laje. Sempre Jack para primeiro ("parou, por hoje chega"); Kim **nunca** cai. |
| 15 | Marcado | Alan aos 16, dois anos de bairro. Virou alvo grande demais — família do Sombra, restos da Baixada, cobradores/gerentes que passou pra trás. A cúpula manda ele **sumir**: rota, documento novo, nova área. Ele reparte o bairro entre dois subcomandantes. Quer só a **última 1ª segunda** antes de ir — não conta que é a última. |
| 16 | Não Há Regras | Última briga. Idades: Alan 16, os dois 9. Troca de nomes: **Kim** cospe "Kim"; **Jack**: "meu nome não é Jack, mas esse carinha me chama de Jack, então tá valendo". Alan avisa que hoje vai "apostar tudo". Pergunta a única regra da briga de rua → **"NÃO HÁ REGRAS"** (a frase que o Kim usa no cap. 3 da linha principal — **Alan é a origem dela**). Gancho no queixo do Jack = **apagado** (1ª vez em 2 anos que o Jack vai ao chão). Kim olha pro amigo, leva joelhada no plexo. Aí **o olhar do Kim muda** — frio, parado — e Alan sente medo. |
| 17 | A Pantera Solta | Kim vira feral **com técnica**: morde a panturrilha, rola, volta de outro lado, sobe nas costas, morde o pescoço, cabeçada na testa, **arranca e mastiga um pedaço da orelha do Alan**. Alan perde força e visão, entende que vai **PERDER pela 1ª vez na vida** — e não tem certeza de que o Kim vai parar quando ele cair. Sente os dois joelhos dobrando. |
| 18 | A Coronhada | O **braço-direito** do Alan (o subcomandante de confiança, que ia herdar o bairro) dá uma **coronhada na cabeça do Kim**. Os joelhos do Alan tocam o chão no mesmo instante; os dois moleques apagados. **Ninguém acordado viu.** Oficialmente o Campeão nunca perdeu — mas o Alan sabe que perdeu, e que sem a coronhada pelas costas não estaria vivo pra contar. |
| 19 | Sob Minha Proteção | Alan manda grana pros dois e deixa uma ordem em todo canto — bairro, Banca, cúpula: **Kim e Jack sob proteção total do Campeão.** Ninguém — polícia nem crime — encosta neles. **8 anos** limpando confusão deles (briga com a Baixada nova que pôs preço na cabeça dos dois; briga com filho de gente importante; briga com os próprios homens do Alan). Hoje eles têm **17** e começaram a quebrar a **segurança que a Banca aluga pra "uma turminha de elite de escola cara"** (dovetail com o Brock, linha principal cap. 3). O nome dos dois entrou na pauta da Banca; a cúpula não gosta que o Campeão passa pano. *"Essa não é a história de como eu virei o Rei de Marélia. Essa fica pra outro dia."* |

### Personagens do conto — resumo canônico

- **Alan / O Campeão / O Rei de Marélia** — `personagens-pt.json` id `alan`. Hoje
  24 anos ("aos dezoito virou o Rei do Crime de Marélia"). Viu a mãe morrer aos 3
  → bucha da Banca aos ~4 → reformatório aos 7 (3 anos) → executor da cúpula, mata
  o Sombra aos 11 → dono de bairro aos 13 → marcado e exilado aos 16 → volta e
  vira Rei aos 18. Rival histórico de Kim e Jack ("80% das derrotas dos dois têm o
  nome dele"; é por causa dele que os dois viraram amigos).
- **Kim** — "o indiozinho". Pele marrom, cabelo preto liso. Estilo: técnico que
  vira **feral sob dano** ("a pantera"). Nunca cai, nunca diz "parou". Herdou de
  Alan a frase "não há regras".
- **Jack** — "o cabelinho verde". Negro, cabelo verde mal pintado, fanfarrão.
  Estilo: fica **mais preciso** apanhando. Aceita perder pra poder voltar. Nome
  real nunca dito ("meu nome não é Jack, mas esse carinha me chama de Jack").
  Cunhou "o Campeão".
- **O Sombra** — chefe original da Baixada, fantasma sem rotina. Morto pelo Alan
  aos 11. A Baixada racha em três (Sangria/Gelo/Sobra). **No jogo ele já morreu
  antes do Ano 1.**
- **A Banca / a cúpula** — ver §1.
- **O braço-direito do Alan** — subcomandante de confiança, deu a coronhada no
  Kim. Ficaria com metade do bairro no exílio do Alan.
- **Boiadeiro** — gerente que testou o Alan aos 13. Não-jogável.

---

## 10. Índice de fontes

| Assunto | Arquivo |
|---|---|
| Conto "Alan, o Campeão" (texto completo) | `src/data/livro/contos/pt/02/01.md` … `19.md` |
| Mapa, territórios, gangues, chefes, portões | `src/pages/games/Gangues/data/ganguesTerritorios.js` |
| Fichas dos inimigos + trash talk | `src/pages/games/Gangues/data/gangues-enemies.json` |
| Geração de bando + equipe fixa dos chefes | `src/pages/games/Gangues/data/ganguesEncontros.js` |
| Cena navegável da Pista (POIs, NPCs, diálogos) | `src/pages/games/Gangues/data/cenas/pista.js` |
| 30 lutadores recrutáveis | `ldi_gangues_30_personagens_v1.json` |
| Consumíveis / equipamento | `src/pages/games/Gangues/data/ganguesItens.js`, `data/ganguesEquip.js` |
| Loja / painel de equipamento | `src/pages/games/Gangues/components/cena/GanguesLoja.jsx`, `components/GanguesEquipPanel.jsx` |
| Inventário + economia (store) | `src/pages/games/Gangues/store/useGanguesStore.js` |
| Textos de história / itens (i18n) | `src/i18n/gangues-{pt,en,es}.json` → `games.gangues.{story,cena,dialogo,naming,itens,equip,loja,bag}` |
| **Mecânica** (não é lore) | `src/pages/games/Gangues/GANGUES_DESIGN.md`, `GANGUES_HEADSUP.md`, `GANGUES_PROGRESSAO_RASCUNHO.md`, `GANGUES_MODO_HISTORIA_ENCONTROS.md` |
