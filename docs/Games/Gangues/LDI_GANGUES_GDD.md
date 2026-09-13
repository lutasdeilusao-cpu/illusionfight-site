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

**POIs (versão final, v2.71.0 — 9 obrigatórias + chefe, breadcrumb 10/10):** A
boca do sinal · O ferro-velho (`PuzzleSimonSays`) + O fundo do ferro-velho
(achado — 2º pedaço de sucata) · **A oficina do Nando** (fetch quest estilo
Zelda: junta 2× sucata → forja uma peça grátis + dica de onde o Carvão se
esconde) · O beco da Rasteira (1º ponto) · A birosca do Seu Nato (hub) · O corre
do Nato (stealth opcional) · O outro ponto da Rasteira (2º ponto) · **O terceiro
ponto** (`beco_3`) · **O Sinaleiro Chefe** (1451 — 1ª luta de General,
`liderFixo`) · **A Rasteira Velha** (1452 — 2ª luta de General, `liderFixo`) · A
rinha do beco (farm) · Duda, o Orelha · Descanso na birosca · **A loja da Pista**
(do outro lado do muro — só alcançável pelo túnel, depois de fechar os pontos).
Os dois generais da Pista caem na cena antes do chefe (entram no Álbum aqui). Detalhe em
§17.6 desta bíblia.

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

**Agiotagem da birosca + Clube da Luta (v2.74.14–15):** o Seu Nato **fia o
descanso** quando falta grana. A dívida é **global** (uma caderneta pra toda
birosca de todo bairro) e **silenciosa** — sem HUD, o jogador só topa com ela ao
abrir o descanso. O preço do fiado **não aparece antes de aceitar**: só depois,
no "contrato". 1º fiado = **5×** o descanso, 2º = **10×**; depois de 2 o nome
suja e ele não fia mais. Dá pra passar só pra pagar (parcial/total) — quitou,
nome limpa. **Trava:** tropa inteira no chão (todos PV 0) não entra em luta
nenhuma. Quando o cara está nesse beco — 2 fiados, dívida aberta, tropa no chão,
sem grana — o Nato oferece **o Clube da Luta** (o 3º fiado, **15×**, que já cura
a tropa e enfia o cara na roda). O Clube é **negócio do Nato** — é assim que ele
arruma lutadores. O jogador é **vendado**, levado sem saber pra onde, atravessa
uma jaula de espera e cai numa luta dura de bando fixo (`gerarBandoClube`,
budget fixo 26, pool de brigões 12xx/13xx/14xx). **Vitória = dívida zerada, só
isso** (zero AP, zero grana). **Derrota = te remendam, a dívida cresce +15× e o
Clube continua disponível** — nunca é game over. Store: `fiarDescanso`,
`pagarBirosca`, `tropaNoChao`, `clubeDaLutaElegivel`, `entrarClubeDaLuta`,
`resolverClubeDaLuta` (persistido em `storyProgress.__birosca`). Componentes:
`GanguesClube.jsx` (sequestro + saguão), branch `clube` em `GanguesVictory`.

**O túnel por baixo do muro (v2.74.4):** o portão/muro no fim da rua **não abre
mais sozinho**. Fechados todos os `portao.precisa`, destranca a **boca do túnel**
(prédio `tunel_ent`, "Barraco do beco") — mini-dungeon de 3 cômodos com vigias do
Sinal (`tunel_m1/m2/m3`), passagem trancada até vencer cada um, e um achado
("Buraco na parede"). Você sai no `tunel_sai` ("Barraco do outro lado"), já do
lado de lá do muro, onde ficam a loja e o galpão. Túnel bidirecional. O muro
físico só abre com `prog.boss` (chefe derrotado), aí vira atalho.

**Balanço (v2.68.0):** a primeira treta (`beco`) puxa 1 a 4 corpos
sorteados dos 11 comuns da Pista — tipo e quantidade mudam a cada tentativa —
num `ratio` de 0.42 (fácil de propósito, ~97% de vitória). O bando escala com os
pontos do time e o `ratio` sobe bairro por bairro até a Laje (0.74), pra o jogo
"sempre ir igualando a ficha do jogador". Curva completa + resultados de
simulação em §17.6 desta bíblia.

**Encontro de revezamento — dungeon (v2.74.5):** as tretas dentro do túnel (e
futuramente do galpão) NÃO usam a geração de bando do território. Um POI `treta`
com `revezamento: { pool:[ids], budgetPorCorpo, chanceDupla }` chama
`gerarBandoRevezamento` — sorteia 1 capanga (às vezes 2, pela `chanceDupla`) de
um punhado de fracos que se alternam, orçamento leve e FIXO por corpo (não escala
com o jogador). É o "estilo Pokémon" pedido pelo Isaias: quase sempre 1 sozinho,
de vez em quando uma dupla, sempre leve. Túnel da Pista: m1 `[1101,1102,1103]`
b4/0.22 · m2 `[1101,1102,1103,1201]` b6/0.45 · m3 `[1101,1102,1103]` b5/0.30.

**Também nas primeiras tretas de rua (v2.74.6):** `beco` (a 1ª treta de
verdade), a `rinha` (farm) e as brigas-punição (`sinal`→apertar o pivete,
falhar a gazua do `ferro`) trocaram o `enemy` fixo / o sorteio dos 11 moldes
por `revezamento` do pool fraco `[1101,1102,1103,1201,1203]`
(Farejador/Zóio/Pingo/Ratazana/Chinelada). Antes a `aperta`/`falha`
davam SEMPRE uma Ratazana sozinha; agora rodam os 5, quase sempre solo. Isso
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

| id | Nome | tipo | efeito | custo | ícone |
|---|---|---|---|---|---|
| 1 | Poção de HP | `cura_pv` | +5 PV | 5 💵 | 🩹 |
| 2 | Poção de MP | `cura_pm` | +5 PM | 5 💵 | 💧 |
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

### 9.4 Equipamento — 6 slots por personagem

Slots (bonecão de cima pra baixo): `cabeca` 🪖 · `corpo` 🦺 (a escolha PV vs PM) ·
`bracos` 🧤 · `pes` 🥾 · `amuleto` 📿 · `arma` 🥊.
Bônus = atributo plano (**A/H/D**) ou recurso plano (**pv/pm**, somado em cima do
máximo, **não passa por R**). Raridades: `comum` · `incomum` · `raro` · `epico`.
**Cartas/sockets** (`cardSlots` 0–2, estilo Ragnarok): os slots existem, as
cartas vêm do sistema de drop (faixa 10000+, futuro). **Tirar carta encaixada
DESTRÓI a carta. Desequipar o item inteiro não.**

| id | Nome | slot | raridade | bônus | cartas | custo |
|---|---|---|---|---|---|---|
| 101 | Soqueira de Lata | arma | comum | +1 A | 0 | 16 💵 |
| 102 | Faca Serrilhada | arma | incomum | +2 A | 1 | — |
| 103 | Cano de Ferro | arma | raro | +2 A, +1 H | 2 | — |
| 104 | Gorro de Moletom | cabeça | comum | +1 D | 0 | 12 💵 |
| 105 | Capacete de Obra | cabeça | incomum | +2 D | 1 | — |
| 106 | Coroa de Lata | cabeça | raro | +1 A, +1 D | 2 | — |
| 107 | Colete Reforçado | corpo | comum | +6 PV | 0 | 20 💵 |
| 108 | Colete Leve | corpo | comum | +6 PM | 0 | 20 💵 |
| 109 | Colete de Placa | corpo | incomum | +12 PV | 1 | — |
| 110 | Manto com Capuz | corpo | incomum | +12 PM | 1 | — |
| 111 | Armadura de Rua | corpo | raro | +18 PV | 2 | — |
| 112 | Luva de Couro | braços | comum | +1 D | 0 | 12 💵 |
| 113 | Manopla de Porca | braços | incomum | +2 A | 1 | — |
| 114 | Braçadeira de Cravo | braços | raro | +1 A, +1 D | 2 | — |
| 115 | Tênis Furado | pés | comum | +1 H | 0 | 12 💵 |
| 116 | Coturno | pés | incomum | +1 H, +1 D | 1 | — |
| 117 | Bota com Biqueira | pés | raro | +2 H | 2 | — |
| 118 | Corrente de Lata | amuleto | comum | +1 H | 1 | 16 💵 |
| 119 | Dente de Ouro | amuleto | incomum | +1 A | 1 | — |
| 120 | Medalha de Santa | amuleto | raro | +1 D, +1 H | 2 | — |
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

Um por chefe. Sempre 2 slots de carta.

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
equipamento). Hoje só a Pista tem: `1, 2, 104, 107, 108, 112, 115, 118, 101`.
Cada região ganha catálogo próprio.

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
  FIXO** (`GANGUES_CHEFE_BUDGET`, não escala com o jogador) — como o
  crescimento autorado é +1 ponto por nível, 1 ficha nível N = N pontos; o
  budget de cada chefe ≈ 1.15×→1.18× o total do time no nível-alvo
  (`{pista:44, feira:110, baixada:210, vila:345, morro:510, alto:606,
  laje:732}`). AP por inimigo é **10 fixo em qualquer modo** (chegou a subir
  pra 30 no modo história pra acompanhar o ritmo dos ~15 eventos de cada
  bairro, mas o Isaias reverteu em set/2026 — rendia AP demais numa luta só,
  2 inimigos já davam 60 AP). Os chefes carregam `nivel` de fachada.
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
- **Multiplayer online libera com 1 ficha no nível 99** (estilo carta de mestre).
  `ganguesTemMultiplayer(roster)`. O online em si é fase futura — por ora só
  destrava o card em `GanguesModes`.
- **A Coleção** (3º botão da HUD da cena + lobby): abas Inimigos (o Álbum),
  Itens (consumível + equipamento, descoberto via `storyProgress.__itens`) e
  Cartas (placeholder — sockets, faixa 10000+).

---

## 12. Índice de fontes

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
attr_labels, btn_fugir}`. Ver também [[gangues-lore-biblia-mundo]].

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
- **Cobertura hoje:** só os 5 personagens iniciais (Trinca, Fenda, Muro,
  Catraca, Faísca) — os outros 25 do catálogo ainda não têm arte, caem no
  fallback normalmente.
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

- Cada personagem tem 5 atributos: **A** (Ataque), **H** (Habilidade),
  **D** (Defesa), **PV/Osso** e **PM/Gás** (`GANGUES_ATTRS` em
  `data/ganguesCharacters.js`). **Não existe mais Resistência** — PV e PM
  são atributos próprios desde a revisão "PV/PM separados" (v2.75.x);
  crescem por nível seguindo o `growth_order` autorado de cada um dos 30
  personagens do catálogo (não são mais alocação livre do jogador).
- **PV máx / PM máx** = atributo PV/PM × uma taxa por caminho
  (`GANGUES_RESOURCE_RATES` em `data/ganguesLoadout.js`):

  | Caminho | PV máx por ponto de PV | PM máx por ponto de PM |
  |---|---|---|
  | Atacante | 3 | 3 |
  | Defensor | 4 | 2 |
  | Místico | 2 | 4 |

- **Criação de gangue não distribui pontos livres** — o jogador escolhe 2
  dos 30 personagens pré-autorados do catálogo (`ldi_gangues_30_personagens_v1.json`),
  cada um já vem com `base_stats`/`base_resources` fixos do nível 1. Os
  outros 28 liberam por reputação/campanha/evento — ver `getGanguesAvailableCharacterIds`.
  Nome/rótulo dos atributos: `attr_labels` no i18n (Osso/Gás em pt, Grit/Gas
  em en, Aguante/Pila em es).
- **Nível teto: 99** (`GANGUES_LEVEL_CAP`). Níveis 1–10 são estatísticas
  autoradas à mão; 11–99 crescem +1 ponto por nível seguindo o
  `growth_order` de cada ficha (fiel à identidade dela — um Bruto termina
  A altíssimo, um Muralha só D/PV).

### 17.2 Fórmula de combate

Tudo em `engine/ganguesCombatResolver.js`:

```
FA = Ataque + floor(Habilidade/2) + d3[+2 se crítico] + efeitos de poder ativo
FD = Defesa efetiva + d3 + efeitos de poder passivo
DANO = max(0, FA − FD)   // SEM piso de dano — defesa bem investida pode zerar o golpe
```

- **Dado d3** (1 a 3) pros dois lados, ataque e defesa. Crítico = tirar o
  valor máximo (3) no dado de ataque, soma **+2** na rolagem (vira 5 no
  cálculo de FA). Só o ataque critica.
- **Sem dano mínimo garantido** — o clamp é `Math.max(0, ...)`, não
  `Math.max(1, ...)`. Foi tirado de propósito depois de muito playtest: com
  bandos grandes, "sempre acerta pelo menos 1" deixava toda defesa
  irrelevante.
- **Iniciativa**: `Habilidade + d3` por combatente, sorteada uma vez no
  início da luta, maior age primeiro, segue em loop pulando quem já caiu
  (empate por Habilidade, depois aleatório).
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

- **AP por inimigo = 10, fixo em qualquer modo** (história ou Torre) —
  chegou a subir pra 30 no modo história (dez/2026) mas foi revertido
  (set/2026, pedido do Isaias: "2 inimigos já davam 60 AP numa luta só").
  Chefe vale 5×; Torre escala +100% a cada 5 andares.
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
  pontos) — ver §13/§14 desta bíblia.

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

Sistema descrito originalmente em `GANGUES_MODO_HISTORIA_ENCONTROS.md`
(2026-09-04) e já implementado pra Pista (`data/cenas/pista/`) — os outros
6 bairros ainda usam a trilha antiga de nós (`GanguesTerritorio.jsx`).

- Cada bairro-cena é um mapa navegável com **5 tipos de POI**: **Treta**
  (combate), **Parada** (mini-jogo, falhar pode virar treta), **Papo**
  (diálogo com escolhas), **Corre** (tarefa/stealth), **Achado** (loot sem
  interação) — mais `Descanso` (birosca) e `Loja`.
- **Grafo de descoberta**: POI escondido não aparece; resolver um revela o
  próximo. Portão do chefe só abre com os POIs-chave batidos.
- **Economia**: Grana (gasta em descanso/loja) e Rep/Nome (destranca POI,
  alimenta % de domínio). PV/PM perdido persiste dentro do bairro; só volta
  ao cheio saindo ou dominando.
- **Agiotagem da birosca**: o Nato fia o descanso (dívida que dobra se
  "remendado" de novo), e o **Clube da Luta** é um gauntlet de 3 rondas
  sempre oferecido como saída da dívida — ver [[gangues-agiotagem-birosca-clube-luta]].
- **Bando inimigo escala contra o time do jogador** (`gerarBandoInimigo`),
  ratio sobe por território (Pista ~0.52 até Laje ~0.74) + offset por
  dificuldade (fácil/médio/difícil, ±0.10) — calibrado por simulação
  headless (script `sim_boss7.py`, 3000+ batalhas por célula), não por
  fórmula no papel. Chefe usa orçamento **fixo** (`GANGUES_CHEFE_BUDGET`),
  não escala — o loop de RPG é o jogador voltar mais forte, não o chefe
  ficar mais fraco.

### 17.7 Persistência

- Logado: ficha inteira (incluindo XP/poderes equipados) salva em
  `gangues_fichas` (Supabase), progresso de história em `gangues_saves` —
  ambos com debounce de escrita, sem depender de `localStorage` pra dado
  de jogo.
- Guest: tudo em memória, perde ao recarregar — banner avisa.
- **Logout limpa o store do Gangues de verdade** (`AuthContext.jsx`, ver
  memória [[gangues-supabase-acesso-manutencao]] e a correção desta sessão
  no `onAuthStateChange`) — sem isso, o próximo guest/login na mesma aba
  herdava `_userId` órfão.

### 17.8 Estrutura de arquivos (atual, pós-reorganização de set/2026)

```
src/pages/games/Gangues/
├── GanguesRoute.jsx      # shell/router — troca de fase, carrega i18n dedicado
├── Gangues.css           # folha de estilo base do módulo inteiro
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

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 0 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 4 | 0 | 1 | 3 | 2 | ⚡ abre **soco_de_ferro** |
| 5 | 4 | 0 | 2 | 3 | 2 | — |
| 10 | 7 | 0 | 3 | 4 | 2 | ★ O Quebra-Linha |
| 12 | 9 | 0 | 3 | 4 | 2 | ⚡ abre **peso_bruto** |
| 15 | 10 | 0 | 4 | 5 | 2 | — |
| 20 | 13 | 0 | 5 | 6 | 2 | — |
| 24 | 16 | 0 | 5 | 7 | 2 | ⚡ abre **marreta** |
| 25 | 16 | 0 | 6 | 7 | 2 | — |
| 30 | 19 | 0 | 7 | 8 | 2 | — |
| 35 | 22 | 0 | 8 | 9 | 2 | — |
| 40 | 25 | 0 | 9 | 10 | 2 | ⚡ abre **fim_de_linha** |
| 45 | 28 | 0 | 10 | 11 | 2 | — |
| 50 | 31 | 0 | 11 | 12 | 2 | ⚡ abre **avalanche_de_socos** |
| 52 | 33 | 0 | 11 | 12 | 2 | ⬆ **soco_de_ferro** vira rank 2 |
| 55 | 34 | 0 | 12 | 13 | 2 | — |
| 58 | 36 | 0 | 12 | 14 | 2 | ⬆ **peso_bruto** vira rank 2 |
| 60 | 37 | 0 | 13 | 14 | 2 | — |
| 64 | 40 | 0 | 13 | 15 | 2 | ⬆ **marreta** vira rank 2 |
| 65 | 40 | 0 | 14 | 15 | 2 | — |
| 70 | 43 | 0 | 15 | 16 | 2 | ⬆ **fim_de_linha** vira rank 2 |
| 75 | 46 | 0 | 16 | 17 | 2 | — |
| 78 | 48 | 0 | 16 | 18 | 2 | ⬆ **soco_de_ferro** vira rank 3 |
| 80 | 49 | 0 | 17 | 18 | 2 | — |
| 84 | 52 | 0 | 17 | 19 | 2 | ⬆ **peso_bruto** vira rank 3 |
| 85 | 52 | 0 | 18 | 19 | 2 | — |
| 90 | 55 | 0 | 19 | 20 | 2 | ⬆ **marreta** vira rank 3 |
| 95 | 58 | 0 | 20 | 21 | 2 | — |
| 96 | 59 | 0 | 20 | 21 | 2 | ⬆ **fim_de_linha** vira rank 3 |
| 99 | 61 | 0 | 20 | 22 | 2 | — |

### Marreta — atacante (bruto)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 0 | 1 | 1 | 1 | Técnica base (class_basic) |
| 4 | 5 | 1 | 1 | 1 | 1 | ⚡ abre **investida** |
| 5 | 5 | 1 | 1 | 2 | 1 | — |
| 10 | 8 | 2 | 1 | 3 | 1 | ★ Demolidor |
| 12 | 10 | 2 | 1 | 3 | 1 | ⚡ abre **peso_bruto** |
| 15 | 11 | 3 | 1 | 4 | 1 | — |
| 20 | 14 | 4 | 1 | 5 | 1 | — |
| 24 | 17 | 5 | 1 | 5 | 1 | ⚡ abre **marreta** |
| 25 | 17 | 5 | 1 | 6 | 1 | — |
| 30 | 20 | 6 | 1 | 7 | 1 | — |
| 35 | 23 | 7 | 1 | 8 | 1 | — |
| 40 | 26 | 8 | 1 | 9 | 1 | ⚡ abre **fim_de_linha** |
| 45 | 29 | 9 | 1 | 10 | 1 | — |
| 50 | 32 | 10 | 1 | 11 | 1 | ⚡ abre **britadeira** |
| 52 | 34 | 10 | 1 | 11 | 1 | ⬆ **investida** vira rank 2 |
| 55 | 35 | 11 | 1 | 12 | 1 | — |
| 58 | 37 | 12 | 1 | 12 | 1 | ⬆ **peso_bruto** vira rank 2 |
| 60 | 38 | 12 | 1 | 13 | 1 | — |
| 64 | 41 | 13 | 1 | 13 | 1 | ⬆ **marreta** vira rank 2 |
| 65 | 41 | 13 | 1 | 14 | 1 | — |
| 70 | 44 | 14 | 1 | 15 | 1 | ⬆ **fim_de_linha** vira rank 2 |
| 75 | 47 | 15 | 1 | 16 | 1 | — |
| 78 | 49 | 16 | 1 | 16 | 1 | ⬆ **investida** vira rank 3 |
| 80 | 50 | 16 | 1 | 17 | 1 | — |
| 84 | 53 | 17 | 1 | 17 | 1 | ⬆ **peso_bruto** vira rank 3 |
| 85 | 53 | 17 | 1 | 18 | 1 | — |
| 90 | 56 | 18 | 1 | 19 | 1 | ⬆ **marreta** vira rank 3 |
| 95 | 59 | 19 | 1 | 20 | 1 | — |
| 96 | 60 | 19 | 1 | 20 | 1 | ⬆ **fim_de_linha** vira rank 3 |
| 99 | 62 | 20 | 1 | 20 | 1 | — |

### Fenda — atacante (duelista)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 2 | 0 | 1 | 1 | Técnica base (class_basic) |
| 4 | 3 | 4 | 0 | 1 | 1 | ⚡ abre **golpe_certeiro** |
| 5 | 3 | 4 | 1 | 1 | 1 | — |
| 10 | 5 | 6 | 2 | 1 | 1 | ★ Primeiro Corte |
| 12 | 6 | 7 | 2 | 1 | 1 | ⚡ abre **leitura_de_combate** |
| 15 | 7 | 8 | 3 | 1 | 1 | — |
| 20 | 9 | 10 | 4 | 1 | 1 | — |
| 24 | 11 | 12 | 4 | 1 | 1 | ⚡ abre **marca** |
| 25 | 11 | 12 | 5 | 1 | 1 | — |
| 30 | 13 | 14 | 6 | 1 | 1 | — |
| 35 | 15 | 16 | 7 | 1 | 1 | — |
| 40 | 17 | 18 | 8 | 1 | 1 | ⚡ abre **execucao** |
| 45 | 19 | 20 | 9 | 1 | 1 | — |
| 50 | 21 | 22 | 10 | 1 | 1 | ⚡ abre **corte_preciso** |
| 52 | 22 | 23 | 10 | 1 | 1 | ⬆ **golpe_certeiro** vira rank 2 |
| 55 | 23 | 24 | 11 | 1 | 1 | — |
| 58 | 25 | 25 | 11 | 1 | 1 | ⬆ **leitura_de_combate** vira rank 2 |
| 60 | 25 | 26 | 12 | 1 | 1 | — |
| 64 | 27 | 28 | 12 | 1 | 1 | ⬆ **marca** vira rank 2 |
| 65 | 27 | 28 | 13 | 1 | 1 | — |
| 70 | 29 | 30 | 14 | 1 | 1 | ⬆ **execucao** vira rank 2 |
| 75 | 31 | 32 | 15 | 1 | 1 | — |
| 78 | 33 | 33 | 15 | 1 | 1 | ⬆ **golpe_certeiro** vira rank 3 |
| 80 | 33 | 34 | 16 | 1 | 1 | — |
| 84 | 35 | 36 | 16 | 1 | 1 | ⬆ **leitura_de_combate** vira rank 3 |
| 85 | 35 | 36 | 17 | 1 | 1 | — |
| 90 | 37 | 38 | 18 | 1 | 1 | ⬆ **marca** vira rank 3 |
| 95 | 39 | 40 | 19 | 1 | 1 | — |
| 96 | 40 | 40 | 19 | 1 | 1 | ⬆ **execucao** vira rank 3 |
| 99 | 41 | 42 | 19 | 1 | 1 | — |

### Navalha — atacante (duelista)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 0 | 1 | 1 | Técnica base (class_basic) |
| 4 | 2 | 5 | 0 | 1 | 1 | ⚡ abre **fluidez** |
| 5 | 3 | 5 | 0 | 1 | 1 | — |
| 10 | 5 | 7 | 1 | 1 | 1 | ★ Sem Aviso |
| 12 | 5 | 8 | 2 | 1 | 1 | ⚡ abre **leitura_de_combate** |
| 15 | 7 | 9 | 2 | 1 | 1 | — |
| 20 | 9 | 11 | 3 | 1 | 1 | — |
| 24 | 10 | 13 | 4 | 1 | 1 | ⚡ abre **golpe_certeiro** |
| 25 | 11 | 13 | 4 | 1 | 1 | — |
| 30 | 13 | 15 | 5 | 1 | 1 | — |
| 35 | 15 | 17 | 6 | 1 | 1 | — |
| 40 | 17 | 19 | 7 | 1 | 1 | ⚡ abre **execucao** |
| 45 | 19 | 21 | 8 | 1 | 1 | — |
| 50 | 21 | 23 | 9 | 1 | 1 | ⚡ abre **danca_da_lamina** |
| 52 | 21 | 24 | 10 | 1 | 1 | ⬆ **fluidez** vira rank 2 |
| 55 | 23 | 25 | 10 | 1 | 1 | — |
| 58 | 24 | 26 | 11 | 1 | 1 | ⬆ **leitura_de_combate** vira rank 2 |
| 60 | 25 | 27 | 11 | 1 | 1 | — |
| 64 | 26 | 29 | 12 | 1 | 1 | ⬆ **golpe_certeiro** vira rank 2 |
| 65 | 27 | 29 | 12 | 1 | 1 | — |
| 70 | 29 | 31 | 13 | 1 | 1 | ⬆ **execucao** vira rank 2 |
| 75 | 31 | 33 | 14 | 1 | 1 | — |
| 78 | 32 | 34 | 15 | 1 | 1 | ⬆ **fluidez** vira rank 3 |
| 80 | 33 | 35 | 15 | 1 | 1 | — |
| 84 | 34 | 37 | 16 | 1 | 1 | ⬆ **leitura_de_combate** vira rank 3 |
| 85 | 35 | 37 | 16 | 1 | 1 | — |
| 90 | 37 | 39 | 17 | 1 | 1 | ⬆ **golpe_certeiro** vira rank 3 |
| 95 | 39 | 41 | 18 | 1 | 1 | — |
| 96 | 39 | 41 | 19 | 1 | 1 | ⬆ **execucao** vira rank 3 |
| 99 | 40 | 43 | 19 | 1 | 1 | — |

### Touro — atacante (furia)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 0 | 0 | 3 | 3 | Técnica base (class_basic) |
| 4 | 3 | 0 | 0 | 4 | 4 | ⚡ abre **sangue_fervente** |
| 5 | 4 | 0 | 0 | 4 | 4 | — |
| 10 | 6 | 0 | 1 | 5 | 5 | ★ Último de Pé |
| 12 | 6 | 0 | 2 | 6 | 5 | ⚡ abre **grito_de_guerra** |
| 15 | 8 | 0 | 2 | 6 | 6 | — |
| 20 | 10 | 0 | 3 | 7 | 7 | — |
| 24 | 11 | 0 | 4 | 8 | 8 | ⚡ abre **ignorar_a_dor** |
| 25 | 12 | 0 | 4 | 8 | 8 | — |
| 30 | 14 | 0 | 5 | 9 | 9 | — |
| 35 | 16 | 0 | 6 | 10 | 10 | — |
| 40 | 18 | 0 | 7 | 11 | 11 | ⚡ abre **ultima_investida** |
| 45 | 20 | 0 | 8 | 12 | 12 | — |
| 50 | 22 | 0 | 9 | 13 | 13 | ⚡ abre **furia_cega** |
| 52 | 22 | 0 | 10 | 14 | 13 | ⬆ **sangue_fervente** vira rank 2 |
| 55 | 24 | 0 | 10 | 14 | 14 | — |
| 58 | 25 | 0 | 11 | 15 | 14 | ⬆ **grito_de_guerra** vira rank 2 |
| 60 | 26 | 0 | 11 | 15 | 15 | — |
| 64 | 27 | 0 | 12 | 16 | 16 | ⬆ **ignorar_a_dor** vira rank 2 |
| 65 | 28 | 0 | 12 | 16 | 16 | — |
| 70 | 30 | 0 | 13 | 17 | 17 | ⬆ **ultima_investida** vira rank 2 |
| 75 | 32 | 0 | 14 | 18 | 18 | — |
| 78 | 33 | 0 | 15 | 19 | 18 | ⬆ **sangue_fervente** vira rank 3 |
| 80 | 34 | 0 | 15 | 19 | 19 | — |
| 84 | 35 | 0 | 16 | 20 | 20 | ⬆ **grito_de_guerra** vira rank 3 |
| 85 | 36 | 0 | 16 | 20 | 20 | — |
| 90 | 38 | 0 | 17 | 21 | 21 | ⬆ **ignorar_a_dor** vira rank 3 |
| 95 | 40 | 0 | 18 | 22 | 22 | — |
| 96 | 40 | 0 | 19 | 22 | 22 | ⬆ **ultima_investida** vira rank 3 |
| 99 | 41 | 0 | 19 | 23 | 23 | — |

### Sangue — atacante (furia)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 3 | 1 | 0 | 1 | 1 | Técnica base (class_basic) |
| 4 | 5 | 1 | 0 | 2 | 1 | ⚡ abre **grito_de_guerra** |
| 5 | 5 | 2 | 0 | 2 | 1 | — |
| 10 | 8 | 3 | 0 | 3 | 1 | ★ Tudo ou Nada |
| 12 | 10 | 3 | 0 | 3 | 1 | ⚡ abre **sangue_fervente** |
| 15 | 11 | 4 | 0 | 4 | 1 | — |
| 20 | 14 | 5 | 0 | 5 | 1 | — |
| 24 | 17 | 5 | 0 | 6 | 1 | ⚡ abre **folego_final** |
| 25 | 17 | 6 | 0 | 6 | 1 | — |
| 30 | 20 | 7 | 0 | 7 | 1 | — |
| 35 | 23 | 8 | 0 | 8 | 1 | — |
| 40 | 26 | 9 | 0 | 9 | 1 | ⚡ abre **ultima_investida** |
| 45 | 29 | 10 | 0 | 10 | 1 | — |
| 50 | 32 | 11 | 0 | 11 | 1 | ⚡ abre **instinto_de_sangue** |
| 52 | 34 | 11 | 0 | 11 | 1 | ⬆ **grito_de_guerra** vira rank 2 |
| 55 | 35 | 12 | 0 | 12 | 1 | — |
| 58 | 37 | 12 | 0 | 13 | 1 | ⬆ **sangue_fervente** vira rank 2 |
| 60 | 38 | 13 | 0 | 13 | 1 | — |
| 64 | 41 | 13 | 0 | 14 | 1 | ⬆ **folego_final** vira rank 2 |
| 65 | 41 | 14 | 0 | 14 | 1 | — |
| 70 | 44 | 15 | 0 | 15 | 1 | ⬆ **ultima_investida** vira rank 2 |
| 75 | 47 | 16 | 0 | 16 | 1 | — |
| 78 | 49 | 16 | 0 | 17 | 1 | ⬆ **grito_de_guerra** vira rank 3 |
| 80 | 50 | 17 | 0 | 17 | 1 | — |
| 84 | 53 | 17 | 0 | 18 | 1 | ⬆ **sangue_fervente** vira rank 3 |
| 85 | 53 | 18 | 0 | 18 | 1 | — |
| 90 | 56 | 19 | 0 | 19 | 1 | ⬆ **folego_final** vira rank 3 |
| 95 | 59 | 20 | 0 | 20 | 1 | — |
| 96 | 60 | 20 | 0 | 20 | 1 | ⬆ **ultima_investida** vira rank 3 |
| 99 | 62 | 20 | 0 | 21 | 1 | — |

### Mira — atacante (especialista)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 2 | 0 | 1 | 1 | Técnica base (class_basic) |
| 4 | 3 | 3 | 1 | 1 | 1 | ⚡ abre **precisao_absoluta** |
| 5 | 3 | 4 | 1 | 1 | 1 | — |
| 10 | 5 | 6 | 2 | 1 | 1 | ★ Cirúrgica |
| 12 | 6 | 7 | 2 | 1 | 1 | ⚡ abre **ponto_de_pressao** |
| 15 | 7 | 8 | 3 | 1 | 1 | — |
| 20 | 9 | 10 | 4 | 1 | 1 | — |
| 24 | 11 | 11 | 5 | 1 | 1 | ⚡ abre **foco_cirurgico** |
| 25 | 11 | 12 | 5 | 1 | 1 | — |
| 30 | 13 | 14 | 6 | 1 | 1 | — |
| 35 | 15 | 16 | 7 | 1 | 1 | — |
| 40 | 17 | 18 | 8 | 1 | 1 | ⚡ abre **colapso_mental** |
| 45 | 19 | 20 | 9 | 1 | 1 | — |
| 50 | 21 | 22 | 10 | 1 | 1 | ⚡ abre **tiro_certeiro** |
| 52 | 22 | 23 | 10 | 1 | 1 | ⬆ **precisao_absoluta** vira rank 2 |
| 55 | 23 | 24 | 11 | 1 | 1 | — |
| 58 | 25 | 25 | 11 | 1 | 1 | ⬆ **ponto_de_pressao** vira rank 2 |
| 60 | 25 | 26 | 12 | 1 | 1 | — |
| 64 | 27 | 27 | 13 | 1 | 1 | ⬆ **foco_cirurgico** vira rank 2 |
| 65 | 27 | 28 | 13 | 1 | 1 | — |
| 70 | 29 | 30 | 14 | 1 | 1 | ⬆ **colapso_mental** vira rank 2 |
| 75 | 31 | 32 | 15 | 1 | 1 | — |
| 78 | 33 | 33 | 15 | 1 | 1 | ⬆ **precisao_absoluta** vira rank 3 |
| 80 | 33 | 34 | 16 | 1 | 1 | — |
| 84 | 35 | 35 | 17 | 1 | 1 | ⬆ **ponto_de_pressao** vira rank 3 |
| 85 | 35 | 36 | 17 | 1 | 1 | — |
| 90 | 37 | 38 | 18 | 1 | 1 | ⬆ **foco_cirurgico** vira rank 3 |
| 95 | 39 | 40 | 19 | 1 | 1 | — |
| 96 | 40 | 40 | 19 | 1 | 1 | ⬆ **colapso_mental** vira rank 3 |
| 99 | 41 | 41 | 20 | 1 | 1 | — |

### Ponto — atacante (especialista)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 0 | 1 | 1 | Técnica base (class_basic) |
| 4 | 3 | 4 | 0 | 1 | 1 | ⚡ abre **ponto_de_pressao** |
| 5 | 3 | 4 | 1 | 1 | 1 | — |
| 10 | 5 | 6 | 2 | 1 | 1 | ★ Ponto Cego |
| 12 | 6 | 7 | 2 | 1 | 1 | ⚡ abre **precisao_absoluta** |
| 15 | 7 | 8 | 3 | 1 | 1 | — |
| 20 | 9 | 10 | 4 | 1 | 1 | — |
| 24 | 11 | 12 | 4 | 1 | 1 | ⚡ abre **fratura_de_ilusao** |
| 25 | 11 | 12 | 5 | 1 | 1 | — |
| 30 | 13 | 14 | 6 | 1 | 1 | — |
| 35 | 15 | 16 | 7 | 1 | 1 | — |
| 40 | 17 | 18 | 8 | 1 | 1 | ⚡ abre **colapso_mental** |
| 45 | 19 | 20 | 9 | 1 | 1 | — |
| 50 | 21 | 22 | 10 | 1 | 1 | ⚡ abre **ponto_fatal** |
| 52 | 22 | 23 | 10 | 1 | 1 | ⬆ **ponto_de_pressao** vira rank 2 |
| 55 | 23 | 24 | 11 | 1 | 1 | — |
| 58 | 24 | 26 | 11 | 1 | 1 | ⬆ **precisao_absoluta** vira rank 2 |
| 60 | 25 | 26 | 12 | 1 | 1 | — |
| 64 | 27 | 28 | 12 | 1 | 1 | ⬆ **fratura_de_ilusao** vira rank 2 |
| 65 | 27 | 28 | 13 | 1 | 1 | — |
| 70 | 29 | 30 | 14 | 1 | 1 | ⬆ **colapso_mental** vira rank 2 |
| 75 | 31 | 32 | 15 | 1 | 1 | — |
| 78 | 32 | 34 | 15 | 1 | 1 | ⬆ **ponto_de_pressao** vira rank 3 |
| 80 | 33 | 34 | 16 | 1 | 1 | — |
| 84 | 35 | 36 | 16 | 1 | 1 | ⬆ **precisao_absoluta** vira rank 3 |
| 85 | 35 | 36 | 17 | 1 | 1 | — |
| 90 | 37 | 38 | 18 | 1 | 1 | ⬆ **fratura_de_ilusao** vira rank 3 |
| 95 | 39 | 40 | 19 | 1 | 1 | — |
| 96 | 39 | 41 | 19 | 1 | 1 | ⬆ **colapso_mental** vira rank 3 |
| 99 | 41 | 42 | 19 | 1 | 1 | — |

### Cicatriz — atacante (vingador)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 0 | 1 | 3 | 3 | Técnica base (class_basic) |
| 4 | 2 | 0 | 2 | 4 | 3 | ⚡ abre **casca_dura** |
| 5 | 2 | 0 | 2 | 4 | 4 | — |
| 10 | 3 | 0 | 4 | 5 | 5 | ★ Dívida Antiga |
| 12 | 3 | 0 | 5 | 6 | 5 | ⚡ abre **absorver_impacto** |
| 15 | 4 | 0 | 6 | 6 | 6 | — |
| 20 | 5 | 0 | 8 | 7 | 7 | — |
| 24 | 6 | 0 | 10 | 8 | 7 | ⚡ abre **postura_firme** |
| 25 | 6 | 0 | 10 | 8 | 8 | — |
| 30 | 7 | 0 | 12 | 9 | 9 | — |
| 35 | 8 | 0 | 14 | 10 | 10 | — |
| 40 | 9 | 0 | 16 | 11 | 11 | ⚡ abre **retribuicao_final** |
| 45 | 10 | 0 | 18 | 12 | 12 | — |
| 50 | 11 | 0 | 20 | 13 | 13 | ⚡ abre **marca_de_guerra** |
| 52 | 11 | 0 | 21 | 14 | 13 | ⬆ **casca_dura** vira rank 2 |
| 55 | 12 | 0 | 22 | 14 | 14 | — |
| 58 | 12 | 0 | 24 | 15 | 14 | ⬆ **absorver_impacto** vira rank 2 |
| 60 | 13 | 0 | 24 | 15 | 15 | — |
| 64 | 14 | 0 | 26 | 16 | 15 | ⬆ **postura_firme** vira rank 2 |
| 65 | 14 | 0 | 26 | 16 | 16 | — |
| 70 | 15 | 0 | 28 | 17 | 17 | ⬆ **retribuicao_final** vira rank 2 |
| 75 | 16 | 0 | 30 | 18 | 18 | — |
| 78 | 16 | 0 | 32 | 19 | 18 | ⬆ **casca_dura** vira rank 3 |
| 80 | 17 | 0 | 32 | 19 | 19 | — |
| 84 | 18 | 0 | 34 | 20 | 19 | ⬆ **absorver_impacto** vira rank 3 |
| 85 | 18 | 0 | 34 | 20 | 20 | — |
| 90 | 19 | 0 | 36 | 21 | 21 | ⬆ **postura_firme** vira rank 3 |
| 95 | 20 | 0 | 38 | 22 | 22 | — |
| 96 | 20 | 0 | 39 | 22 | 22 | ⬆ **retribuicao_final** vira rank 3 |
| 99 | 21 | 0 | 40 | 23 | 22 | — |

### Troco — atacante (vingador)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 1 | 2 | 3 | 2 | ⚡ abre **contragolpe** |
| 5 | 2 | 1 | 3 | 3 | 2 | — |
| 10 | 4 | 1 | 5 | 4 | 2 | ★ Cobrança |
| 12 | 5 | 1 | 6 | 4 | 2 | ⚡ abre **casca_dura** |
| 15 | 6 | 1 | 7 | 5 | 2 | — |
| 20 | 8 | 1 | 9 | 6 | 2 | — |
| 24 | 10 | 1 | 10 | 7 | 2 | ⚡ abre **absorver_impacto** |
| 25 | 10 | 1 | 11 | 7 | 2 | — |
| 30 | 12 | 1 | 13 | 8 | 2 | — |
| 35 | 14 | 1 | 15 | 9 | 2 | — |
| 40 | 16 | 1 | 17 | 10 | 2 | ⚡ abre **retribuicao_final** |
| 45 | 18 | 1 | 19 | 11 | 2 | — |
| 50 | 20 | 1 | 21 | 12 | 2 | ⚡ abre **juro_composto** |
| 52 | 21 | 1 | 22 | 12 | 2 | ⬆ **contragolpe** vira rank 2 |
| 55 | 22 | 1 | 23 | 13 | 2 | — |
| 58 | 24 | 1 | 24 | 13 | 2 | ⬆ **casca_dura** vira rank 2 |
| 60 | 24 | 1 | 25 | 14 | 2 | — |
| 64 | 26 | 1 | 26 | 15 | 2 | ⬆ **absorver_impacto** vira rank 2 |
| 65 | 26 | 1 | 27 | 15 | 2 | — |
| 70 | 28 | 1 | 29 | 16 | 2 | ⬆ **retribuicao_final** vira rank 2 |
| 75 | 30 | 1 | 31 | 17 | 2 | — |
| 78 | 32 | 1 | 32 | 17 | 2 | ⬆ **contragolpe** vira rank 3 |
| 80 | 32 | 1 | 33 | 18 | 2 | — |
| 84 | 34 | 1 | 34 | 19 | 2 | ⬆ **casca_dura** vira rank 3 |
| 85 | 34 | 1 | 35 | 19 | 2 | — |
| 90 | 36 | 1 | 37 | 20 | 2 | ⬆ **absorver_impacto** vira rank 3 |
| 95 | 38 | 1 | 39 | 21 | 2 | — |
| 96 | 39 | 1 | 39 | 21 | 2 | ⬆ **retribuicao_final** vira rank 3 |
| 99 | 40 | 1 | 40 | 22 | 2 | — |

### Muro — defensor (muralha)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | 3 | 2 | 2 | Técnica base (class_basic) |
| 4 | 0 | 0 | 5 | 3 | 2 | ⚡ abre **pele_de_aco** |
| 5 | 0 | 0 | 5 | 3 | 3 | — |
| 10 | 0 | 0 | 8 | 4 | 4 | ★ Fortaleza |
| 12 | 0 | 0 | 10 | 4 | 4 | ⚡ abre **postura_defensiva** |
| 15 | 0 | 0 | 11 | 5 | 5 | — |
| 20 | 0 | 0 | 14 | 6 | 6 | — |
| 24 | 0 | 0 | 17 | 7 | 6 | ⚡ abre **bastiao** |
| 25 | 0 | 0 | 17 | 7 | 7 | — |
| 30 | 0 | 0 | 20 | 8 | 8 | — |
| 35 | 0 | 0 | 23 | 9 | 9 | — |
| 40 | 0 | 0 | 26 | 10 | 10 | ⚡ abre **muralha_impenetravel** |
| 45 | 0 | 0 | 29 | 11 | 11 | — |
| 50 | 0 | 0 | 32 | 12 | 12 | ⚡ abre **linha_de_frente** |
| 52 | 0 | 0 | 34 | 12 | 12 | ⬆ **pele_de_aco** vira rank 2 |
| 55 | 0 | 0 | 35 | 13 | 13 | — |
| 58 | 0 | 0 | 37 | 14 | 13 | ⬆ **postura_defensiva** vira rank 2 |
| 60 | 0 | 0 | 38 | 14 | 14 | — |
| 64 | 0 | 0 | 41 | 15 | 14 | ⬆ **bastiao** vira rank 2 |
| 65 | 0 | 0 | 41 | 15 | 15 | — |
| 70 | 0 | 0 | 44 | 16 | 16 | ⬆ **muralha_impenetravel** vira rank 2 |
| 75 | 0 | 0 | 47 | 17 | 17 | — |
| 78 | 0 | 0 | 49 | 18 | 17 | ⬆ **pele_de_aco** vira rank 3 |
| 80 | 0 | 0 | 50 | 18 | 18 | — |
| 84 | 0 | 0 | 53 | 19 | 18 | ⬆ **postura_defensiva** vira rank 3 |
| 85 | 0 | 0 | 53 | 19 | 19 | — |
| 90 | 0 | 0 | 56 | 20 | 20 | ⬆ **bastiao** vira rank 3 |
| 95 | 0 | 0 | 59 | 21 | 21 | — |
| 96 | 0 | 0 | 60 | 21 | 21 | ⬆ **muralha_impenetravel** vira rank 3 |
| 99 | 0 | 0 | 62 | 22 | 21 | — |

### Concreto — defensor (muralha)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | 2 | 3 | 3 | Técnica base (class_basic) |
| 4 | 0 | 0 | 3 | 4 | 4 | ⚡ abre **casco_robusto** |
| 5 | 0 | 0 | 4 | 4 | 4 | — |
| 10 | 1 | 0 | 6 | 5 | 5 | ★ Bloco Vivo |
| 12 | 2 | 0 | 6 | 6 | 5 | ⚡ abre **postura_defensiva** |
| 15 | 2 | 0 | 8 | 6 | 6 | — |
| 20 | 3 | 0 | 10 | 7 | 7 | — |
| 24 | 4 | 0 | 11 | 8 | 8 | ⚡ abre **pele_de_aco** |
| 25 | 4 | 0 | 12 | 8 | 8 | — |
| 30 | 5 | 0 | 14 | 9 | 9 | — |
| 35 | 6 | 0 | 16 | 10 | 10 | — |
| 40 | 7 | 0 | 18 | 11 | 11 | ⚡ abre **muralha_impenetravel** |
| 45 | 8 | 0 | 20 | 12 | 12 | — |
| 50 | 9 | 0 | 22 | 13 | 13 | ⚡ abre **fundacao** |
| 52 | 10 | 0 | 22 | 14 | 13 | ⬆ **casco_robusto** vira rank 2 |
| 55 | 10 | 0 | 24 | 14 | 14 | — |
| 58 | 11 | 0 | 25 | 15 | 14 | ⬆ **postura_defensiva** vira rank 2 |
| 60 | 11 | 0 | 26 | 15 | 15 | — |
| 64 | 12 | 0 | 27 | 16 | 16 | ⬆ **pele_de_aco** vira rank 2 |
| 65 | 12 | 0 | 28 | 16 | 16 | — |
| 70 | 13 | 0 | 30 | 17 | 17 | ⬆ **muralha_impenetravel** vira rank 2 |
| 75 | 14 | 0 | 32 | 18 | 18 | — |
| 78 | 15 | 0 | 33 | 19 | 18 | ⬆ **casco_robusto** vira rank 3 |
| 80 | 15 | 0 | 34 | 19 | 19 | — |
| 84 | 16 | 0 | 35 | 20 | 20 | ⬆ **postura_defensiva** vira rank 3 |
| 85 | 16 | 0 | 36 | 20 | 20 | — |
| 90 | 17 | 0 | 38 | 21 | 21 | ⬆ **pele_de_aco** vira rank 3 |
| 95 | 18 | 0 | 40 | 22 | 22 | — |
| 96 | 19 | 0 | 40 | 22 | 22 | ⬆ **muralha_impenetravel** vira rank 3 |
| 99 | 19 | 0 | 41 | 23 | 23 | — |

### Guarda — defensor (guardiao)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 2 | 2 | 2 | Técnica base (class_basic) |
| 4 | 0 | 2 | 3 | 3 | 2 | ⚡ abre **escudo_humano** |
| 5 | 0 | 2 | 4 | 3 | 2 | — |
| 10 | 0 | 3 | 6 | 4 | 3 | ★ Linha de Frente |
| 12 | 0 | 3 | 7 | 4 | 4 | ⚡ abre **guarda_compartilhada** |
| 15 | 0 | 4 | 8 | 5 | 4 | — |
| 20 | 0 | 5 | 10 | 6 | 5 | — |
| 24 | 0 | 6 | 11 | 7 | 6 | ⚡ abre **cobertura** |
| 25 | 0 | 6 | 12 | 7 | 6 | — |
| 30 | 0 | 7 | 14 | 8 | 7 | — |
| 35 | 0 | 8 | 16 | 9 | 8 | — |
| 40 | 0 | 9 | 18 | 10 | 9 | ⚡ abre **interceptar** |
| 45 | 0 | 10 | 20 | 11 | 10 | — |
| 50 | 0 | 11 | 22 | 12 | 11 | ⚡ abre **escudo_vivo** |
| 52 | 0 | 11 | 23 | 12 | 12 | ⬆ **escudo_humano** vira rank 2 |
| 55 | 0 | 12 | 24 | 13 | 12 | — |
| 58 | 0 | 12 | 25 | 14 | 13 | ⬆ **guarda_compartilhada** vira rank 2 |
| 60 | 0 | 13 | 26 | 14 | 13 | — |
| 64 | 0 | 14 | 27 | 15 | 14 | ⬆ **cobertura** vira rank 2 |
| 65 | 0 | 14 | 28 | 15 | 14 | — |
| 70 | 0 | 15 | 30 | 16 | 15 | ⬆ **interceptar** vira rank 2 |
| 75 | 0 | 16 | 32 | 17 | 16 | — |
| 78 | 0 | 16 | 33 | 18 | 17 | ⬆ **escudo_humano** vira rank 3 |
| 80 | 0 | 17 | 34 | 18 | 17 | — |
| 84 | 0 | 18 | 35 | 19 | 18 | ⬆ **guarda_compartilhada** vira rank 3 |
| 85 | 0 | 18 | 36 | 19 | 18 | — |
| 90 | 0 | 19 | 38 | 20 | 19 | ⬆ **cobertura** vira rank 3 |
| 95 | 0 | 20 | 40 | 21 | 20 | — |
| 96 | 0 | 20 | 40 | 21 | 21 | ⬆ **interceptar** vira rank 3 |
| 99 | 0 | 21 | 41 | 22 | 21 | — |

### Ombro — defensor (guardiao)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 0 | 2 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 0 | 3 | 3 | 2 | ⚡ abre **guarda_compartilhada** |
| 5 | 2 | 0 | 3 | 3 | 3 | — |
| 10 | 3 | 0 | 5 | 4 | 4 | ★ Ninguém Passa |
| 12 | 3 | 0 | 6 | 5 | 4 | ⚡ abre **escudo_humano** |
| 15 | 4 | 0 | 7 | 5 | 5 | — |
| 20 | 5 | 0 | 9 | 6 | 6 | — |
| 24 | 6 | 0 | 11 | 7 | 6 | ⚡ abre **interceptar** |
| 25 | 6 | 0 | 11 | 7 | 7 | — |
| 30 | 7 | 0 | 13 | 8 | 8 | — |
| 35 | 8 | 0 | 15 | 9 | 9 | — |
| 40 | 9 | 0 | 17 | 10 | 10 | ⚡ abre **ultimo_bastiao** |
| 45 | 10 | 0 | 19 | 11 | 11 | — |
| 50 | 11 | 0 | 21 | 12 | 12 | ⚡ abre **no_meu_ombro** |
| 52 | 11 | 0 | 22 | 13 | 12 | ⬆ **guarda_compartilhada** vira rank 2 |
| 55 | 12 | 0 | 23 | 13 | 13 | — |
| 58 | 12 | 0 | 25 | 14 | 13 | ⬆ **escudo_humano** vira rank 2 |
| 60 | 13 | 0 | 25 | 14 | 14 | — |
| 64 | 14 | 0 | 27 | 15 | 14 | ⬆ **interceptar** vira rank 2 |
| 65 | 14 | 0 | 27 | 15 | 15 | — |
| 70 | 15 | 0 | 29 | 16 | 16 | ⬆ **ultimo_bastiao** vira rank 2 |
| 75 | 16 | 0 | 31 | 17 | 17 | — |
| 78 | 16 | 0 | 33 | 18 | 17 | ⬆ **guarda_compartilhada** vira rank 3 |
| 80 | 17 | 0 | 33 | 18 | 18 | — |
| 84 | 18 | 0 | 35 | 19 | 18 | ⬆ **escudo_humano** vira rank 3 |
| 85 | 18 | 0 | 35 | 19 | 19 | — |
| 90 | 19 | 0 | 37 | 20 | 20 | ⬆ **interceptar** vira rank 3 |
| 95 | 20 | 0 | 39 | 21 | 21 | — |
| 96 | 20 | 0 | 40 | 21 | 21 | ⬆ **ultimo_bastiao** vira rank 3 |
| 99 | 21 | 0 | 41 | 22 | 21 | — |

### Boca — defensor (provocador)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 2 | 2 | 1 | 1 | Técnica base (class_basic) |
| 4 | 0 | 3 | 3 | 2 | 1 | ⚡ abre **voz_de_comando** |
| 5 | 0 | 4 | 3 | 2 | 1 | — |
| 10 | 0 | 6 | 5 | 3 | 1 | ★ Olha Pra Mim |
| 12 | 0 | 7 | 6 | 3 | 1 | ⚡ abre **provocacao** |
| 15 | 0 | 8 | 7 | 4 | 1 | — |
| 20 | 0 | 10 | 9 | 5 | 1 | — |
| 24 | 0 | 11 | 11 | 6 | 1 | ⚡ abre **casca_de_rua** |
| 25 | 0 | 12 | 11 | 6 | 1 | — |
| 30 | 0 | 14 | 13 | 7 | 1 | — |
| 35 | 0 | 16 | 15 | 8 | 1 | — |
| 40 | 0 | 18 | 17 | 9 | 1 | ⚡ abre **centro_das_atencoes** |
| 45 | 0 | 20 | 19 | 10 | 1 | — |
| 50 | 0 | 22 | 21 | 11 | 1 | ⚡ abre **grito_de_rua** |
| 52 | 0 | 23 | 22 | 11 | 1 | ⬆ **voz_de_comando** vira rank 2 |
| 55 | 0 | 24 | 23 | 12 | 1 | — |
| 58 | 0 | 25 | 25 | 12 | 1 | ⬆ **provocacao** vira rank 2 |
| 60 | 0 | 26 | 25 | 13 | 1 | — |
| 64 | 0 | 27 | 27 | 14 | 1 | ⬆ **casca_de_rua** vira rank 2 |
| 65 | 0 | 28 | 27 | 14 | 1 | — |
| 70 | 0 | 30 | 29 | 15 | 1 | ⬆ **centro_das_atencoes** vira rank 2 |
| 75 | 0 | 32 | 31 | 16 | 1 | — |
| 78 | 0 | 33 | 33 | 16 | 1 | ⬆ **voz_de_comando** vira rank 3 |
| 80 | 0 | 34 | 33 | 17 | 1 | — |
| 84 | 0 | 35 | 35 | 18 | 1 | ⬆ **provocacao** vira rank 3 |
| 85 | 0 | 36 | 35 | 18 | 1 | — |
| 90 | 0 | 38 | 37 | 19 | 1 | ⬆ **casca_de_rua** vira rank 3 |
| 95 | 0 | 40 | 39 | 20 | 1 | — |
| 96 | 0 | 40 | 40 | 20 | 1 | ⬆ **centro_das_atencoes** vira rank 3 |
| 99 | 0 | 41 | 41 | 21 | 1 | — |

### Isca — defensor (provocador)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 1 | 1 | Técnica base (class_basic) |
| 4 | 2 | 3 | 2 | 1 | 1 | ⚡ abre **marcar_alvo** |
| 5 | 2 | 4 | 2 | 1 | 1 | — |
| 10 | 3 | 6 | 3 | 2 | 1 | ★ Alvo Perfeito |
| 12 | 3 | 7 | 3 | 3 | 1 | ⚡ abre **provocacao** |
| 15 | 4 | 8 | 4 | 3 | 1 | — |
| 20 | 5 | 10 | 5 | 4 | 1 | — |
| 24 | 6 | 11 | 6 | 5 | 1 | ⚡ abre **voz_de_comando** |
| 25 | 6 | 12 | 6 | 5 | 1 | — |
| 30 | 7 | 14 | 7 | 6 | 1 | — |
| 35 | 8 | 16 | 8 | 7 | 1 | — |
| 40 | 9 | 18 | 9 | 8 | 1 | ⚡ abre **centro_das_atencoes** |
| 45 | 10 | 20 | 10 | 9 | 1 | — |
| 50 | 11 | 22 | 11 | 10 | 1 | ⚡ abre **alvo_facil** |
| 52 | 11 | 23 | 11 | 11 | 1 | ⬆ **marcar_alvo** vira rank 2 |
| 55 | 12 | 24 | 12 | 11 | 1 | — |
| 58 | 13 | 25 | 12 | 12 | 1 | ⬆ **provocacao** vira rank 2 |
| 60 | 13 | 26 | 13 | 12 | 1 | — |
| 64 | 14 | 27 | 14 | 13 | 1 | ⬆ **voz_de_comando** vira rank 2 |
| 65 | 14 | 28 | 14 | 13 | 1 | — |
| 70 | 15 | 30 | 15 | 14 | 1 | ⬆ **centro_das_atencoes** vira rank 2 |
| 75 | 16 | 32 | 16 | 15 | 1 | — |
| 78 | 17 | 33 | 16 | 16 | 1 | ⬆ **marcar_alvo** vira rank 3 |
| 80 | 17 | 34 | 17 | 16 | 1 | — |
| 84 | 18 | 35 | 18 | 17 | 1 | ⬆ **provocacao** vira rank 3 |
| 85 | 18 | 36 | 18 | 17 | 1 | — |
| 90 | 19 | 38 | 19 | 18 | 1 | ⬆ **voz_de_comando** vira rank 3 |
| 95 | 20 | 40 | 20 | 19 | 1 | — |
| 96 | 20 | 40 | 20 | 20 | 1 | ⬆ **centro_das_atencoes** vira rank 3 |
| 99 | 21 | 41 | 21 | 20 | 1 | — |

### Catraca — defensor (reativo)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 2 | 1 | 1 | Técnica base (class_basic) |
| 4 | 2 | 2 | 3 | 1 | 1 | ⚡ abre **reflexo_defensivo** |
| 5 | 2 | 2 | 4 | 1 | 1 | — |
| 10 | 3 | 4 | 6 | 1 | 1 | ★ Bateu, Voltou |
| 12 | 3 | 5 | 7 | 1 | 1 | ⚡ abre **aparar** |
| 15 | 4 | 6 | 8 | 1 | 1 | — |
| 20 | 5 | 8 | 10 | 1 | 1 | — |
| 24 | 6 | 10 | 11 | 1 | 1 | ⚡ abre **contragolpe_defensivo** |
| 25 | 6 | 10 | 12 | 1 | 1 | — |
| 30 | 7 | 12 | 14 | 1 | 1 | — |
| 35 | 8 | 14 | 16 | 1 | 1 | — |
| 40 | 9 | 16 | 18 | 1 | 1 | ⚡ abre **retorno_de_impacto** |
| 45 | 10 | 18 | 20 | 1 | 1 | — |
| 50 | 11 | 20 | 22 | 1 | 1 | ⚡ abre **giro_de_catraca** |
| 52 | 11 | 21 | 23 | 1 | 1 | ⬆ **reflexo_defensivo** vira rank 2 |
| 55 | 12 | 22 | 24 | 1 | 1 | — |
| 58 | 12 | 24 | 25 | 1 | 1 | ⬆ **aparar** vira rank 2 |
| 60 | 13 | 24 | 26 | 1 | 1 | — |
| 64 | 14 | 26 | 27 | 1 | 1 | ⬆ **contragolpe_defensivo** vira rank 2 |
| 65 | 14 | 26 | 28 | 1 | 1 | — |
| 70 | 15 | 28 | 30 | 1 | 1 | ⬆ **retorno_de_impacto** vira rank 2 |
| 75 | 16 | 30 | 32 | 1 | 1 | — |
| 78 | 16 | 32 | 33 | 1 | 1 | ⬆ **reflexo_defensivo** vira rank 3 |
| 80 | 17 | 32 | 34 | 1 | 1 | — |
| 84 | 18 | 34 | 35 | 1 | 1 | ⬆ **aparar** vira rank 3 |
| 85 | 18 | 34 | 36 | 1 | 1 | — |
| 90 | 19 | 36 | 38 | 1 | 1 | ⬆ **contragolpe_defensivo** vira rank 3 |
| 95 | 20 | 38 | 40 | 1 | 1 | — |
| 96 | 20 | 39 | 40 | 1 | 1 | ⬆ **retorno_de_impacto** vira rank 3 |
| 99 | 21 | 40 | 41 | 1 | 1 | — |

### Rebote — defensor (reativo)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 1 | 1 | Técnica base (class_basic) |
| 4 | 2 | 3 | 2 | 1 | 1 | ⚡ abre **aparar** |
| 5 | 2 | 4 | 2 | 1 | 1 | — |
| 10 | 3 | 6 | 4 | 1 | 1 | ★ Volta em Dobro |
| 12 | 3 | 7 | 5 | 1 | 1 | ⚡ abre **reflexo_defensivo** |
| 15 | 4 | 8 | 6 | 1 | 1 | — |
| 20 | 5 | 10 | 8 | 1 | 1 | — |
| 24 | 6 | 11 | 10 | 1 | 1 | ⚡ abre **resposta_automatica** |
| 25 | 6 | 12 | 10 | 1 | 1 | — |
| 30 | 7 | 14 | 12 | 1 | 1 | — |
| 35 | 8 | 16 | 14 | 1 | 1 | — |
| 40 | 9 | 18 | 16 | 1 | 1 | ⚡ abre **retorno_de_impacto** |
| 45 | 10 | 20 | 18 | 1 | 1 | — |
| 50 | 11 | 22 | 20 | 1 | 1 | ⚡ abre **efeito_bumerangue** |
| 52 | 11 | 23 | 21 | 1 | 1 | ⬆ **aparar** vira rank 2 |
| 55 | 12 | 24 | 22 | 1 | 1 | — |
| 58 | 12 | 25 | 24 | 1 | 1 | ⬆ **reflexo_defensivo** vira rank 2 |
| 60 | 13 | 26 | 24 | 1 | 1 | — |
| 64 | 14 | 27 | 26 | 1 | 1 | ⬆ **resposta_automatica** vira rank 2 |
| 65 | 14 | 28 | 26 | 1 | 1 | — |
| 70 | 15 | 30 | 28 | 1 | 1 | ⬆ **retorno_de_impacto** vira rank 2 |
| 75 | 16 | 32 | 30 | 1 | 1 | — |
| 78 | 16 | 33 | 32 | 1 | 1 | ⬆ **aparar** vira rank 3 |
| 80 | 17 | 34 | 32 | 1 | 1 | — |
| 84 | 18 | 35 | 34 | 1 | 1 | ⬆ **reflexo_defensivo** vira rank 3 |
| 85 | 18 | 36 | 34 | 1 | 1 | — |
| 90 | 19 | 38 | 36 | 1 | 1 | ⬆ **resposta_automatica** vira rank 3 |
| 95 | 20 | 40 | 38 | 1 | 1 | — |
| 96 | 20 | 40 | 39 | 1 | 1 | ⬆ **retorno_de_impacto** vira rank 3 |
| 99 | 21 | 41 | 40 | 1 | 1 | — |

### Ferro — defensor (resiliente)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 0 | 1 | 4 | 4 | Técnica base (class_basic) |
| 4 | 0 | 0 | 2 | 5 | 5 | ⚡ abre **carne_dura** |
| 5 | 0 | 0 | 3 | 5 | 5 | — |
| 10 | 0 | 0 | 5 | 7 | 6 | ★ Não Cai |
| 12 | 0 | 0 | 5 | 9 | 6 | ⚡ abre **firme_no_chao** |
| 15 | 0 | 0 | 7 | 9 | 7 | — |
| 20 | 0 | 0 | 9 | 11 | 8 | — |
| 24 | 0 | 0 | 10 | 13 | 9 | ⚡ abre **segunda_respiracao** |
| 25 | 0 | 0 | 11 | 13 | 9 | — |
| 30 | 0 | 0 | 13 | 15 | 10 | — |
| 35 | 0 | 0 | 15 | 17 | 11 | — |
| 40 | 0 | 0 | 17 | 19 | 12 | ⚡ abre **inquebravel** |
| 45 | 0 | 0 | 19 | 21 | 13 | — |
| 50 | 0 | 0 | 21 | 23 | 14 | ⚡ abre **pele_de_ferro** |
| 52 | 0 | 0 | 21 | 25 | 14 | ⬆ **carne_dura** vira rank 2 |
| 55 | 0 | 0 | 23 | 25 | 15 | — |
| 58 | 0 | 0 | 24 | 27 | 15 | ⬆ **firme_no_chao** vira rank 2 |
| 60 | 0 | 0 | 25 | 27 | 16 | — |
| 64 | 0 | 0 | 26 | 29 | 17 | ⬆ **segunda_respiracao** vira rank 2 |
| 65 | 0 | 0 | 27 | 29 | 17 | — |
| 70 | 0 | 0 | 29 | 31 | 18 | ⬆ **inquebravel** vira rank 2 |
| 75 | 0 | 0 | 31 | 33 | 19 | — |
| 78 | 0 | 0 | 32 | 35 | 19 | ⬆ **carne_dura** vira rank 3 |
| 80 | 0 | 0 | 33 | 35 | 20 | — |
| 84 | 0 | 0 | 34 | 37 | 21 | ⬆ **firme_no_chao** vira rank 3 |
| 85 | 0 | 0 | 35 | 37 | 21 | — |
| 90 | 0 | 0 | 37 | 39 | 22 | ⬆ **segunda_respiracao** vira rank 3 |
| 95 | 0 | 0 | 39 | 41 | 23 | — |
| 96 | 0 | 0 | 39 | 42 | 23 | ⬆ **inquebravel** vira rank 3 |
| 99 | 0 | 0 | 40 | 43 | 24 | — |

### Osso — defensor (resiliente)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 0 | 1 | 3 | 3 | Técnica base (class_basic) |
| 4 | 2 | 0 | 2 | 4 | 3 | ⚡ abre **firme_no_chao** |
| 5 | 2 | 0 | 2 | 4 | 4 | — |
| 10 | 3 | 0 | 4 | 5 | 5 | ★ Ainda de Pé |
| 12 | 3 | 0 | 5 | 6 | 5 | ⚡ abre **carne_dura** |
| 15 | 4 | 0 | 6 | 6 | 6 | — |
| 20 | 5 | 0 | 8 | 7 | 7 | — |
| 24 | 6 | 0 | 10 | 8 | 7 | ⚡ abre **recusar_queda** |
| 25 | 6 | 0 | 10 | 8 | 8 | — |
| 30 | 7 | 0 | 12 | 9 | 9 | — |
| 35 | 8 | 0 | 14 | 10 | 10 | — |
| 40 | 9 | 0 | 16 | 11 | 11 | ⚡ abre **inquebravel** |
| 45 | 10 | 0 | 18 | 12 | 12 | — |
| 50 | 11 | 0 | 20 | 13 | 13 | ⚡ abre **osso_duro** |
| 52 | 11 | 0 | 21 | 14 | 13 | ⬆ **firme_no_chao** vira rank 2 |
| 55 | 12 | 0 | 22 | 14 | 14 | — |
| 58 | 13 | 0 | 23 | 15 | 14 | ⬆ **carne_dura** vira rank 2 |
| 60 | 13 | 0 | 24 | 15 | 15 | — |
| 64 | 14 | 0 | 26 | 16 | 15 | ⬆ **recusar_queda** vira rank 2 |
| 65 | 14 | 0 | 26 | 16 | 16 | — |
| 70 | 15 | 0 | 28 | 17 | 17 | ⬆ **inquebravel** vira rank 2 |
| 75 | 16 | 0 | 30 | 18 | 18 | — |
| 78 | 17 | 0 | 31 | 19 | 18 | ⬆ **firme_no_chao** vira rank 3 |
| 80 | 17 | 0 | 32 | 19 | 19 | — |
| 84 | 18 | 0 | 34 | 20 | 19 | ⬆ **carne_dura** vira rank 3 |
| 85 | 18 | 0 | 34 | 20 | 20 | — |
| 90 | 19 | 0 | 36 | 21 | 21 | ⬆ **recusar_queda** vira rank 3 |
| 95 | 20 | 0 | 38 | 22 | 22 | — |
| 96 | 20 | 0 | 39 | 22 | 22 | ⬆ **inquebravel** vira rank 3 |
| 99 | 21 | 0 | 40 | 23 | 22 | — |

### Brasa — mistico (igneo)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 1 | 1 | 1 | 1 | Técnica base (class_basic) |
| 4 | 4 | 2 | 1 | 1 | 1 | ⚡ abre **bola_de_fogo** |
| 5 | 4 | 2 | 1 | 2 | 1 | — |
| 10 | 7 | 3 | 1 | 3 | 1 | ★ Incêndio |
| 12 | 9 | 3 | 1 | 3 | 1 | ⚡ abre **brasa_viva** |
| 15 | 10 | 4 | 1 | 4 | 1 | — |
| 20 | 13 | 5 | 1 | 5 | 1 | — |
| 24 | 16 | 6 | 1 | 5 | 1 | ⚡ abre **explosao_termica** |
| 25 | 16 | 6 | 1 | 6 | 1 | — |
| 30 | 19 | 7 | 1 | 7 | 1 | — |
| 35 | 22 | 8 | 1 | 8 | 1 | — |
| 40 | 25 | 9 | 1 | 9 | 1 | ⚡ abre **inferno_de_rua** |
| 45 | 28 | 10 | 1 | 10 | 1 | — |
| 50 | 31 | 11 | 1 | 11 | 1 | ⚡ abre **chama_eterna** |
| 52 | 33 | 11 | 1 | 11 | 1 | ⬆ **bola_de_fogo** vira rank 2 |
| 55 | 34 | 12 | 1 | 12 | 1 | — |
| 58 | 36 | 13 | 1 | 12 | 1 | ⬆ **brasa_viva** vira rank 2 |
| 60 | 37 | 13 | 1 | 13 | 1 | — |
| 64 | 40 | 14 | 1 | 13 | 1 | ⬆ **explosao_termica** vira rank 2 |
| 65 | 40 | 14 | 1 | 14 | 1 | — |
| 70 | 43 | 15 | 1 | 15 | 1 | ⬆ **inferno_de_rua** vira rank 2 |
| 75 | 46 | 16 | 1 | 16 | 1 | — |
| 78 | 48 | 17 | 1 | 16 | 1 | ⬆ **bola_de_fogo** vira rank 3 |
| 80 | 49 | 17 | 1 | 17 | 1 | — |
| 84 | 52 | 18 | 1 | 17 | 1 | ⬆ **brasa_viva** vira rank 3 |
| 85 | 52 | 18 | 1 | 18 | 1 | — |
| 90 | 55 | 19 | 1 | 19 | 1 | ⬆ **explosao_termica** vira rank 3 |
| 95 | 58 | 20 | 1 | 20 | 1 | — |
| 96 | 59 | 20 | 1 | 20 | 1 | ⬆ **inferno_de_rua** vira rank 3 |
| 99 | 61 | 21 | 1 | 20 | 1 | — |

### Cinza — mistico (igneo)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 2 | 1 | 3 | 2 | ⚡ abre **brasa_viva** |
| 5 | 2 | 2 | 1 | 3 | 3 | — |
| 10 | 4 | 3 | 1 | 4 | 4 | ★ Depois do Fogo |
| 12 | 5 | 3 | 1 | 5 | 4 | ⚡ abre **combustao** |
| 15 | 6 | 4 | 1 | 5 | 5 | — |
| 20 | 8 | 5 | 1 | 6 | 6 | — |
| 24 | 10 | 6 | 1 | 7 | 6 | ⚡ abre **bola_de_fogo** |
| 25 | 10 | 6 | 1 | 7 | 7 | — |
| 30 | 12 | 7 | 1 | 8 | 8 | — |
| 35 | 14 | 8 | 1 | 9 | 9 | — |
| 40 | 16 | 9 | 1 | 10 | 10 | ⚡ abre **inferno_de_rua** |
| 45 | 18 | 10 | 1 | 11 | 11 | — |
| 50 | 20 | 11 | 1 | 12 | 12 | ⚡ abre **cinzas_ao_vento** |
| 52 | 21 | 11 | 1 | 13 | 12 | ⬆ **brasa_viva** vira rank 2 |
| 55 | 22 | 12 | 1 | 13 | 13 | — |
| 58 | 24 | 12 | 1 | 14 | 13 | ⬆ **combustao** vira rank 2 |
| 60 | 24 | 13 | 1 | 14 | 14 | — |
| 64 | 26 | 14 | 1 | 15 | 14 | ⬆ **bola_de_fogo** vira rank 2 |
| 65 | 26 | 14 | 1 | 15 | 15 | — |
| 70 | 28 | 15 | 1 | 16 | 16 | ⬆ **inferno_de_rua** vira rank 2 |
| 75 | 30 | 16 | 1 | 17 | 17 | — |
| 78 | 32 | 16 | 1 | 18 | 17 | ⬆ **brasa_viva** vira rank 3 |
| 80 | 32 | 17 | 1 | 18 | 18 | — |
| 84 | 34 | 18 | 1 | 19 | 18 | ⬆ **combustao** vira rank 3 |
| 85 | 34 | 18 | 1 | 19 | 19 | — |
| 90 | 36 | 19 | 1 | 20 | 20 | ⬆ **bola_de_fogo** vira rank 3 |
| 95 | 38 | 20 | 1 | 21 | 21 | — |
| 96 | 39 | 20 | 1 | 21 | 21 | ⬆ **inferno_de_rua** vira rank 3 |
| 99 | 40 | 21 | 1 | 22 | 21 | — |

### Maré — mistico (aquatico)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 1 | 2 | 2 | 3 | 2 | ⚡ abre **correnteza** |
| 5 | 1 | 2 | 2 | 3 | 3 | — |
| 10 | 1 | 3 | 4 | 4 | 4 | ★ Maré Cheia |
| 12 | 1 | 3 | 5 | 5 | 4 | ⚡ abre **neblina** |
| 15 | 1 | 4 | 6 | 5 | 5 | — |
| 20 | 1 | 5 | 8 | 6 | 6 | — |
| 24 | 1 | 6 | 10 | 7 | 6 | ⚡ abre **fluxo_restaurador** |
| 25 | 1 | 6 | 10 | 7 | 7 | — |
| 30 | 1 | 7 | 12 | 8 | 8 | — |
| 35 | 1 | 8 | 14 | 9 | 9 | — |
| 40 | 1 | 9 | 16 | 10 | 10 | ⚡ abre **mare_alta** |
| 45 | 1 | 10 | 18 | 11 | 11 | — |
| 50 | 1 | 11 | 20 | 12 | 12 | ⚡ abre **onda_de_choque** |
| 52 | 1 | 11 | 21 | 13 | 12 | ⬆ **correnteza** vira rank 2 |
| 55 | 1 | 12 | 22 | 13 | 13 | — |
| 58 | 1 | 12 | 24 | 14 | 13 | ⬆ **neblina** vira rank 2 |
| 60 | 1 | 13 | 24 | 14 | 14 | — |
| 64 | 1 | 14 | 26 | 15 | 14 | ⬆ **fluxo_restaurador** vira rank 2 |
| 65 | 1 | 14 | 26 | 15 | 15 | — |
| 70 | 1 | 15 | 28 | 16 | 16 | ⬆ **mare_alta** vira rank 2 |
| 75 | 1 | 16 | 30 | 17 | 17 | — |
| 78 | 1 | 16 | 32 | 18 | 17 | ⬆ **correnteza** vira rank 3 |
| 80 | 1 | 17 | 32 | 18 | 18 | — |
| 84 | 1 | 18 | 34 | 19 | 18 | ⬆ **neblina** vira rank 3 |
| 85 | 1 | 18 | 34 | 19 | 19 | — |
| 90 | 1 | 19 | 36 | 20 | 20 | ⬆ **fluxo_restaurador** vira rank 3 |
| 95 | 1 | 20 | 38 | 21 | 21 | — |
| 96 | 1 | 20 | 39 | 21 | 21 | ⬆ **mare_alta** vira rank 3 |
| 99 | 1 | 21 | 40 | 22 | 21 | — |

### Chuva — mistico (aquatico)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 1 | 1 | Técnica base (class_basic) |
| 4 | 1 | 4 | 1 | 2 | 1 | ⚡ abre **jato_pressurizado** |
| 5 | 2 | 4 | 1 | 2 | 1 | — |
| 10 | 3 | 6 | 1 | 3 | 2 | ★ Temporal |
| 12 | 3 | 7 | 1 | 3 | 3 | ⚡ abre **correnteza** |
| 15 | 4 | 8 | 1 | 4 | 3 | — |
| 20 | 5 | 10 | 1 | 5 | 4 | — |
| 24 | 5 | 12 | 1 | 6 | 5 | ⚡ abre **neblina** |
| 25 | 6 | 12 | 1 | 6 | 5 | — |
| 30 | 7 | 14 | 1 | 7 | 6 | — |
| 35 | 8 | 16 | 1 | 8 | 7 | — |
| 40 | 9 | 18 | 1 | 9 | 8 | ⚡ abre **mare_alta** |
| 45 | 10 | 20 | 1 | 10 | 9 | — |
| 50 | 11 | 22 | 1 | 11 | 10 | ⚡ abre **temporal** |
| 52 | 11 | 23 | 1 | 11 | 11 | ⬆ **jato_pressurizado** vira rank 2 |
| 55 | 12 | 24 | 1 | 12 | 11 | — |
| 58 | 12 | 25 | 1 | 13 | 12 | ⬆ **correnteza** vira rank 2 |
| 60 | 13 | 26 | 1 | 13 | 12 | — |
| 64 | 13 | 28 | 1 | 14 | 13 | ⬆ **neblina** vira rank 2 |
| 65 | 14 | 28 | 1 | 14 | 13 | — |
| 70 | 15 | 30 | 1 | 15 | 14 | ⬆ **mare_alta** vira rank 2 |
| 75 | 16 | 32 | 1 | 16 | 15 | — |
| 78 | 16 | 33 | 1 | 17 | 16 | ⬆ **jato_pressurizado** vira rank 3 |
| 80 | 17 | 34 | 1 | 17 | 16 | — |
| 84 | 17 | 36 | 1 | 18 | 17 | ⬆ **correnteza** vira rank 3 |
| 85 | 18 | 36 | 1 | 18 | 17 | — |
| 90 | 19 | 38 | 1 | 19 | 18 | ⬆ **neblina** vira rank 3 |
| 95 | 20 | 40 | 1 | 20 | 19 | — |
| 96 | 20 | 40 | 1 | 20 | 20 | ⬆ **mare_alta** vira rank 3 |
| 99 | 20 | 42 | 1 | 21 | 20 | — |

### Raiz — mistico (terreno)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 2 | 2 | 2 | Técnica base (class_basic) |
| 4 | 0 | 1 | 3 | 3 | 3 | ⚡ abre **pele_de_pedra** |
| 5 | 0 | 2 | 3 | 3 | 3 | — |
| 10 | 0 | 3 | 5 | 4 | 4 | ★ Chão Fechado |
| 12 | 0 | 3 | 6 | 5 | 4 | ⚡ abre **raiz_prendente** |
| 15 | 0 | 4 | 7 | 5 | 5 | — |
| 20 | 0 | 5 | 9 | 6 | 6 | — |
| 24 | 0 | 5 | 11 | 7 | 7 | ⚡ abre **tremor** |
| 25 | 0 | 6 | 11 | 7 | 7 | — |
| 30 | 0 | 7 | 13 | 8 | 8 | — |
| 35 | 0 | 8 | 15 | 9 | 9 | — |
| 40 | 0 | 9 | 17 | 10 | 10 | ⚡ abre **ruptura_do_solo** |
| 45 | 0 | 10 | 19 | 11 | 11 | — |
| 50 | 0 | 11 | 21 | 12 | 12 | ⚡ abre **raizes_profundas** |
| 52 | 0 | 11 | 22 | 13 | 12 | ⬆ **pele_de_pedra** vira rank 2 |
| 55 | 0 | 12 | 23 | 13 | 13 | — |
| 58 | 0 | 12 | 25 | 14 | 13 | ⬆ **raiz_prendente** vira rank 2 |
| 60 | 0 | 13 | 25 | 14 | 14 | — |
| 64 | 0 | 13 | 27 | 15 | 15 | ⬆ **tremor** vira rank 2 |
| 65 | 0 | 14 | 27 | 15 | 15 | — |
| 70 | 0 | 15 | 29 | 16 | 16 | ⬆ **ruptura_do_solo** vira rank 2 |
| 75 | 0 | 16 | 31 | 17 | 17 | — |
| 78 | 0 | 16 | 33 | 18 | 17 | ⬆ **pele_de_pedra** vira rank 3 |
| 80 | 0 | 17 | 33 | 18 | 18 | — |
| 84 | 0 | 17 | 35 | 19 | 19 | ⬆ **raiz_prendente** vira rank 3 |
| 85 | 0 | 18 | 35 | 19 | 19 | — |
| 90 | 0 | 19 | 37 | 20 | 20 | ⬆ **tremor** vira rank 3 |
| 95 | 0 | 20 | 39 | 21 | 21 | — |
| 96 | 0 | 20 | 40 | 21 | 21 | ⬆ **ruptura_do_solo** vira rank 3 |
| 99 | 0 | 20 | 41 | 22 | 22 | — |

### Racha — mistico (terreno)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 2 | 2 | Técnica base (class_basic) |
| 4 | 2 | 1 | 2 | 3 | 2 | ⚡ abre **estilhaco_terrestre** |
| 5 | 3 | 1 | 2 | 3 | 2 | — |
| 10 | 5 | 2 | 3 | 4 | 2 | ★ Falha Sísmica |
| 12 | 6 | 3 | 3 | 4 | 2 | ⚡ abre **pele_de_pedra** |
| 15 | 7 | 3 | 4 | 5 | 2 | — |
| 20 | 9 | 4 | 5 | 6 | 2 | — |
| 24 | 10 | 5 | 6 | 7 | 2 | ⚡ abre **tremor** |
| 25 | 11 | 5 | 6 | 7 | 2 | — |
| 30 | 13 | 6 | 7 | 8 | 2 | — |
| 35 | 15 | 7 | 8 | 9 | 2 | — |
| 40 | 17 | 8 | 9 | 10 | 2 | ⚡ abre **ruptura_do_solo** |
| 45 | 19 | 9 | 10 | 11 | 2 | — |
| 50 | 21 | 10 | 11 | 12 | 2 | ⚡ abre **fenda_no_chao** |
| 52 | 22 | 11 | 11 | 12 | 2 | ⬆ **estilhaco_terrestre** vira rank 2 |
| 55 | 23 | 11 | 12 | 13 | 2 | — |
| 58 | 24 | 12 | 12 | 14 | 2 | ⬆ **pele_de_pedra** vira rank 2 |
| 60 | 25 | 12 | 13 | 14 | 2 | — |
| 64 | 26 | 13 | 14 | 15 | 2 | ⬆ **tremor** vira rank 2 |
| 65 | 27 | 13 | 14 | 15 | 2 | — |
| 70 | 29 | 14 | 15 | 16 | 2 | ⬆ **ruptura_do_solo** vira rank 2 |
| 75 | 31 | 15 | 16 | 17 | 2 | — |
| 78 | 32 | 16 | 16 | 18 | 2 | ⬆ **estilhaco_terrestre** vira rank 3 |
| 80 | 33 | 16 | 17 | 18 | 2 | — |
| 84 | 34 | 17 | 18 | 19 | 2 | ⬆ **pele_de_pedra** vira rank 3 |
| 85 | 35 | 17 | 18 | 19 | 2 | — |
| 90 | 37 | 18 | 19 | 20 | 2 | ⬆ **tremor** vira rank 3 |
| 95 | 39 | 19 | 20 | 21 | 2 | — |
| 96 | 39 | 20 | 20 | 21 | 2 | ⬆ **ruptura_do_solo** vira rank 3 |
| 99 | 40 | 20 | 21 | 22 | 2 | — |

### Faísca — mistico (tempestade)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 3 | 0 | 1 | 1 | Técnica base (class_basic) |
| 4 | 2 | 5 | 0 | 1 | 1 | ⚡ abre **raio_curto** |
| 5 | 2 | 5 | 0 | 2 | 1 | — |
| 10 | 3 | 8 | 0 | 3 | 1 | ★ Antes do Trovão |
| 12 | 3 | 10 | 0 | 3 | 1 | ⚡ abre **eletricidade_estatica** |
| 15 | 4 | 11 | 0 | 4 | 1 | — |
| 20 | 5 | 14 | 0 | 5 | 1 | — |
| 24 | 6 | 17 | 0 | 5 | 1 | ⚡ abre **passo_eletrico** |
| 25 | 6 | 17 | 0 | 6 | 1 | — |
| 30 | 7 | 20 | 0 | 7 | 1 | — |
| 35 | 8 | 23 | 0 | 8 | 1 | — |
| 40 | 9 | 26 | 0 | 9 | 1 | ⚡ abre **tempestade_total** |
| 45 | 10 | 29 | 0 | 10 | 1 | — |
| 50 | 11 | 32 | 0 | 11 | 1 | ⚡ abre **descarga** |
| 52 | 11 | 34 | 0 | 11 | 1 | ⬆ **raio_curto** vira rank 2 |
| 55 | 12 | 35 | 0 | 12 | 1 | — |
| 58 | 13 | 37 | 0 | 12 | 1 | ⬆ **eletricidade_estatica** vira rank 2 |
| 60 | 13 | 38 | 0 | 13 | 1 | — |
| 64 | 14 | 41 | 0 | 13 | 1 | ⬆ **passo_eletrico** vira rank 2 |
| 65 | 14 | 41 | 0 | 14 | 1 | — |
| 70 | 15 | 44 | 0 | 15 | 1 | ⬆ **tempestade_total** vira rank 2 |
| 75 | 16 | 47 | 0 | 16 | 1 | — |
| 78 | 17 | 49 | 0 | 16 | 1 | ⬆ **raio_curto** vira rank 3 |
| 80 | 17 | 50 | 0 | 17 | 1 | — |
| 84 | 18 | 53 | 0 | 17 | 1 | ⬆ **eletricidade_estatica** vira rank 3 |
| 85 | 18 | 53 | 0 | 18 | 1 | — |
| 90 | 19 | 56 | 0 | 19 | 1 | ⬆ **passo_eletrico** vira rank 3 |
| 95 | 20 | 59 | 0 | 20 | 1 | — |
| 96 | 20 | 60 | 0 | 20 | 1 | ⬆ **tempestade_total** vira rank 3 |
| 99 | 21 | 62 | 0 | 20 | 1 | — |

### Trovão — mistico (tempestade)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 2 | 2 | 0 | 1 | 1 | Técnica base (class_basic) |
| 4 | 4 | 3 | 0 | 1 | 1 | ⚡ abre **eletricidade_estatica** |
| 5 | 4 | 3 | 0 | 2 | 1 | — |
| 10 | 7 | 4 | 0 | 3 | 1 | ★ Queda do Céu |
| 12 | 9 | 4 | 0 | 3 | 1 | ⚡ abre **raio_curto** |
| 15 | 10 | 5 | 0 | 4 | 1 | — |
| 20 | 13 | 6 | 0 | 5 | 1 | — |
| 24 | 16 | 7 | 0 | 5 | 1 | ⚡ abre **cadeia_de_raios** |
| 25 | 16 | 7 | 0 | 6 | 1 | — |
| 30 | 19 | 8 | 0 | 7 | 1 | — |
| 35 | 22 | 9 | 0 | 8 | 1 | — |
| 40 | 25 | 10 | 0 | 9 | 1 | ⚡ abre **tempestade_total** |
| 45 | 28 | 11 | 0 | 10 | 1 | — |
| 50 | 31 | 12 | 0 | 11 | 1 | ⚡ abre **trovoada** |
| 52 | 33 | 12 | 0 | 11 | 1 | ⬆ **eletricidade_estatica** vira rank 2 |
| 55 | 34 | 13 | 0 | 12 | 1 | — |
| 58 | 36 | 14 | 0 | 12 | 1 | ⬆ **raio_curto** vira rank 2 |
| 60 | 37 | 14 | 0 | 13 | 1 | — |
| 64 | 40 | 15 | 0 | 13 | 1 | ⬆ **cadeia_de_raios** vira rank 2 |
| 65 | 40 | 15 | 0 | 14 | 1 | — |
| 70 | 43 | 16 | 0 | 15 | 1 | ⬆ **tempestade_total** vira rank 2 |
| 75 | 46 | 17 | 0 | 16 | 1 | — |
| 78 | 48 | 18 | 0 | 16 | 1 | ⬆ **eletricidade_estatica** vira rank 3 |
| 80 | 49 | 18 | 0 | 17 | 1 | — |
| 84 | 52 | 19 | 0 | 17 | 1 | ⬆ **raio_curto** vira rank 3 |
| 85 | 52 | 19 | 0 | 18 | 1 | — |
| 90 | 55 | 20 | 0 | 19 | 1 | ⬆ **cadeia_de_raios** vira rank 3 |
| 95 | 58 | 21 | 0 | 20 | 1 | — |
| 96 | 59 | 21 | 0 | 20 | 1 | ⬆ **tempestade_total** vira rank 3 |
| 99 | 61 | 22 | 0 | 20 | 1 | — |

### Névoa — mistico (ilusorio)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 0 | 3 | 1 | 1 | 1 | Técnica base (class_basic) |
| 4 | 0 | 5 | 2 | 1 | 1 | ⚡ abre **mente_nebulosa** |
| 5 | 0 | 5 | 2 | 2 | 1 | — |
| 10 | 0 | 7 | 4 | 3 | 1 | ★ Sem Rosto |
| 12 | 0 | 8 | 5 | 3 | 1 | ⚡ abre **reflexo_falso** |
| 15 | 0 | 9 | 6 | 4 | 1 | — |
| 20 | 0 | 11 | 8 | 5 | 1 | — |
| 24 | 0 | 13 | 10 | 5 | 1 | ⚡ abre **distorcao** |
| 25 | 0 | 13 | 10 | 6 | 1 | — |
| 30 | 0 | 15 | 12 | 7 | 1 | — |
| 35 | 0 | 17 | 14 | 8 | 1 | — |
| 40 | 0 | 19 | 16 | 9 | 1 | ⚡ abre **quebra_de_realidade** |
| 45 | 0 | 21 | 18 | 10 | 1 | — |
| 50 | 0 | 23 | 20 | 11 | 1 | ⚡ abre **veu_de_nevoa** |
| 52 | 0 | 24 | 21 | 11 | 1 | ⬆ **mente_nebulosa** vira rank 2 |
| 55 | 0 | 25 | 22 | 12 | 1 | — |
| 58 | 0 | 26 | 24 | 12 | 1 | ⬆ **reflexo_falso** vira rank 2 |
| 60 | 0 | 27 | 24 | 13 | 1 | — |
| 64 | 0 | 29 | 26 | 13 | 1 | ⬆ **distorcao** vira rank 2 |
| 65 | 0 | 29 | 26 | 14 | 1 | — |
| 70 | 0 | 31 | 28 | 15 | 1 | ⬆ **quebra_de_realidade** vira rank 2 |
| 75 | 0 | 33 | 30 | 16 | 1 | — |
| 78 | 0 | 34 | 32 | 16 | 1 | ⬆ **mente_nebulosa** vira rank 3 |
| 80 | 0 | 35 | 32 | 17 | 1 | — |
| 84 | 0 | 37 | 34 | 17 | 1 | ⬆ **reflexo_falso** vira rank 3 |
| 85 | 0 | 37 | 34 | 18 | 1 | — |
| 90 | 0 | 39 | 36 | 19 | 1 | ⬆ **distorcao** vira rank 3 |
| 95 | 0 | 41 | 38 | 20 | 1 | — |
| 96 | 0 | 41 | 39 | 20 | 1 | ⬆ **quebra_de_realidade** vira rank 3 |
| 99 | 0 | 43 | 40 | 20 | 1 | — |

### Espelho — mistico (ilusorio)

| Nível | A | H | D | Osso | Gás | Poder/evento neste nível |
|---|---|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 1 | 1 | Técnica base (class_basic) |
| 4 | 2 | 3 | 2 | 1 | 1 | ⚡ abre **reflexo_falso** |
| 5 | 2 | 3 | 3 | 1 | 1 | — |
| 10 | 3 | 5 | 5 | 1 | 1 | ★ Duas Verdades |
| 12 | 3 | 6 | 6 | 1 | 1 | ⚡ abre **mente_nebulosa** |
| 15 | 4 | 7 | 7 | 1 | 1 | — |
| 20 | 5 | 9 | 9 | 1 | 1 | — |
| 24 | 6 | 11 | 10 | 1 | 1 | ⚡ abre **duplo_ilusorio** |
| 25 | 6 | 11 | 11 | 1 | 1 | — |
| 30 | 7 | 13 | 13 | 1 | 1 | — |
| 35 | 8 | 15 | 15 | 1 | 1 | — |
| 40 | 9 | 17 | 17 | 1 | 1 | ⚡ abre **quebra_de_realidade** |
| 45 | 10 | 19 | 19 | 1 | 1 | — |
| 50 | 11 | 21 | 21 | 1 | 1 | ⚡ abre **espelho_quebrado** |
| 52 | 11 | 22 | 22 | 1 | 1 | ⬆ **reflexo_falso** vira rank 2 |
| 55 | 12 | 23 | 23 | 1 | 1 | — |
| 58 | 12 | 25 | 24 | 1 | 1 | ⬆ **mente_nebulosa** vira rank 2 |
| 60 | 13 | 25 | 25 | 1 | 1 | — |
| 64 | 14 | 27 | 26 | 1 | 1 | ⬆ **duplo_ilusorio** vira rank 2 |
| 65 | 14 | 27 | 27 | 1 | 1 | — |
| 70 | 15 | 29 | 29 | 1 | 1 | ⬆ **quebra_de_realidade** vira rank 2 |
| 75 | 16 | 31 | 31 | 1 | 1 | — |
| 78 | 16 | 33 | 32 | 1 | 1 | ⬆ **reflexo_falso** vira rank 3 |
| 80 | 17 | 33 | 33 | 1 | 1 | — |
| 84 | 18 | 35 | 34 | 1 | 1 | ⬆ **mente_nebulosa** vira rank 3 |
| 85 | 18 | 35 | 35 | 1 | 1 | — |
| 90 | 19 | 37 | 37 | 1 | 1 | ⬆ **duplo_ilusorio** vira rank 3 |
| 95 | 20 | 39 | 39 | 1 | 1 | — |
| 96 | 20 | 40 | 39 | 1 | 1 | ⬆ **quebra_de_realidade** vira rank 3 |
| 99 | 21 | 41 | 40 | 1 | 1 | — |

