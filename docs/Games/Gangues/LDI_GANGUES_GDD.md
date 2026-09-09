# LDI GANGUES — GDD (Game Design Document · lore + mundo)

> **Base oficial e única da lore do LDI Gangues.** v1 — 2026-09-08.
> Tudo aqui é **cânone fechado**. Substitui todos os docs de lore anteriores.
>
> **Fonte narrativa:** o conto **"Alan, o Campeão"** (`src/data/livro/contos/pt/02/01.md`
> … `19.md`, contos-index id `02`). O jogo é o pano de fundo histórico desse
> conto: a década final da fragmentação de Marélia, terminando pouco antes de o
> Alan reivindicar a coroa.
>
> **Mecânica de combate / skill tree / turno** não mora aqui — está em
> `src/pages/games/Gangues/GANGUES_DESIGN.md`, `GANGUES_HEADSUP.md`,
> `GANGUES_PROGRESSAO_RASCUNHO.md`, `GANGUES_MODO_HISTORIA_ENCONTROS.md`.
> Este GDD é **o mundo**: quem manda, como o crime funciona, o que aconteceu
> antes, quem o jogador enfrenta e por quê, o que ele coleciona e equipa.

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
`src/pages/games/Gangues/GANGUES_MODO_HISTORIA_ENCONTROS.md §5`.

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
simulação em `src/pages/games/Gangues/GANGUES_MODO_HISTORIA_ENCONTROS.md §10`.

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
| 1105 | Cliente Ruim | Feira | garrafa quebrada | Devedor que virou capanga pra pagar a própria dívida. |
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
  **segue o próprio `growth_order`** — +1 atributo por nível, fiel à identidade
  do caminho (um Bruto termina A altíssimo, um Muralha só D/R, um Resiliente
  puro R). Nada procedural em runtime. Poderes de assinatura liberam **devagar**
  (níveis 4 / 12 / 24 / 40) e sobem de rank (→2 nos níveis 52–70, →3 nos 78–96).
  PV/PM de R pela taxa do caminho. `GANGUES_LEVEL_CAP = 99`.
- **Dá pra zerar a campanha em ~L49** (~7 níveis por bairro). Os 7 chefes usam
  **orçamento de pontos FIXO** (`GANGUES_CHEFE_BUDGET`, não escala com o jogador)
  — quanto mais nível, mais confortável a mesma luta. Alvo da Pista (calibrado
  por sim): **L5–7 quase errado de encarar, L8 pau a pau, L10 confortável**. Os
  chefes carregam `nivel` de fachada (Carvão 14 … O Contador 84) — a Laje é o
  clímax. **O Retalho é o único nível 100 do jogo.**
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
| Cena navegável da Pista (POIs, NPCs, diálogos) | `src/pages/games/Gangues/data/cenas/pista.js` |
| 30 lutadores recrutáveis | `ldi_gangues_30_personagens_v1.json` |
| Consumíveis / equipamento | `src/pages/games/Gangues/data/ganguesItens.js`, `data/ganguesEquip.js` |
| Loja / painel de equipamento | `src/pages/games/Gangues/components/cena/GanguesLoja.jsx`, `components/GanguesEquipPanel.jsx` |
| Inventário + economia (store) | `src/pages/games/Gangues/store/useGanguesStore.js` |
| Textos de história / itens (i18n) | `src/i18n/gangues-{pt,en,es}.json` → `games.gangues.{story,cena,dialogo,naming,itens,equip,loja,bag}` |
| **Mecânica** (não é lore) | `src/pages/games/Gangues/GANGUES_DESIGN.md`, `GANGUES_HEADSUP.md`, `GANGUES_PROGRESSAO_RASCUNHO.md`, `GANGUES_MODO_HISTORIA_ENCONTROS.md` |
