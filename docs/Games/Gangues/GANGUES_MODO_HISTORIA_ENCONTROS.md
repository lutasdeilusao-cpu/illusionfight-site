# LDI Gangues — Modo História: encontros, navegação e mini-jogos

> **Plano, não implementação.** Escrito em 2026-09-04 a partir do pedido do Isaias:
> "quando entro na Pista já aparece tudo que vou enfrentar — eu queria uma coisa
> mais game, sensação de navegação, encontros, lugares pra visitar, e mini-jogos
> resolvidos pela equipe além das brigas. Vamos usar a Pista como base, planejar
> primeiro, e se gostar a gente replica pros outros bairros."
>
> Nada aqui está decidido. As decisões abertas estão na seção 7.

---

## 1. O problema hoje

O bairro (`GanguesTerritorio.jsx`) mostra uma **trilha linear de nós já toda
visível**: ponto 1, ponto 2, ponto 3, chefe. Você sabe tudo que vem antes de
começar. Não tem descoberta, não tem escolha, não tem nada além de brigar.

## 2. O que a gente quer

- **Sensação de navegar a quebrada** — sem d-pad/setinha (é mobile only), mas
  também sem "lista de tudo". Você chega, vê pouca coisa, e vai descobrindo.
- **Encontros** — nem todo ponto é briga. Tem papo, tem corre, tem parada pra
  resolver, tem achado.
- **Mini-jogos resolvidos pela equipe** — a gangue inteira num problema, não só
  luta.
- Construir **uma vez** os tipos de encontro; cada bairro vira só **conteúdo
  (dados + i18n)**.

## 3. O que já temos no projeto pra reaproveitar

| Fonte | O que dá pra puxar |
|---|---|
| **Jack Dream Beer** (`JackCandy/screens/Vila.jsx`) | Hub de cards tocáveis, "próximo objetivo" com glow, locais que abrem por flag, NPCs, casos que aparecem. É **exatamente** o padrão de navegação sem d-pad. |
| **`src/components/Puzzles/`** (lib compartilhada) | 7 mini-jogos prontos e touch-first: `PuzzleForça` (gazua/senha), `PuzzleDecoder` (cifra), `PuzzleSimonSays` (memória), `PuzzleSlidingTiles` (15-puzzle), `PuzzleLabirinto`, `PuzzleAnagrama`, `PuzzleStealthGrid` (não ser visto). |
| **LDI** (`PuzzleRouter`) | Contrato pronto: `<PuzzleRouter type diff onComplete={(ok, rewards) => …} />`. Puzzle devolve recompensa. |
| **Jack Dream Beer** (`Interrogatorio.jsx`) | Papo com pressão / escolhas que mudam o rumo. |
| **Tamagoshi** (`Alimentar`, `RestaurarSaude`, `Passeio`) | Ideia de "descanso na birosca" — recuperar PV entre brigas gastando grana. |
| **Top Trumps** | Jogo de carta de esquina como POI opcional (aposta = fonte/ralo de grana). |
| **KernelGames** (`BulletHellRafael`, enduro) | "Corre de bike" — perseguição como mini-jogo. |
| **Pesadelo Particular** (`MapaCidade` + `Investigacao` + `Confronto`) | Loop hub → investiga → confronto. |

**Conclusão:** quase tudo que precisa já existe. O trabalho é a **cola** (o
modelo de cena) + o conteúdo.

---

## 4. O modelo proposto: o bairro vira uma CENA

Cada região deixa de ser "trilha de nós" e vira uma **cena navegável**:

```
CENA "A Pista"
 ├── fala de chegada (voz da quebrada — GangDialog, uma linha)
 ├── 5–7 PONTOS DE INTERESSE (POIs), revelados aos poucos
 │     cada POI tem um TIPO (ver 4.1) e um estado
 │     (escondido → disponível → resolvido)
 ├── grafo de descoberta: resolver o POI X revela o POI Y
 └── PORTÃO DO CHEFE: o boss só aparece quando N POIs-chave caíram
```

### 4.1 Os 5 tipos de POI (constrói uma vez cada)

| Tipo | O que é | Componente | Recompensa típica |
|---|---|---|---|
| **Treta** | Um ponto segurado por gangue. É o combate atual. | `GanguesCombat` (já existe) | rep + grana + XP, revela POI |
| **Parada** | Um problema pra equipe resolver. | lib `Puzzles/` via um `GanguesParada` (clone enxuto do `PuzzleRouter`) | grana + XP + item; **falhar** pode cair numa treta |
| **Papo** | Conversa com um local. 2–3 escolhas → consequências. | `GangDialog` + botões de escolha | info (revela POI), aliado temporário, rep, ou vira treta |
| **Corre** | Tarefa da gangue: entrega, segurar esquina, fuga. | mini-jogo de stealth/tempo/perseguição | grana + rep |
| **Achado** | Loot. Sem interação, só recompensa + linha de texto. | card simples | grana / item / XP / rep |

### 4.2 Como navegar sem d-pad

- Os POIs ficam numa **fita** (vertical, estilo cards do Jack Dream Beer — é o
  mais seguro no mobile) OU como **pinos ao longo de uma rua desenhada**, com o
  token da gangue "pulando" de um pro outro (mais "navegação", mais trampo — é
  decisão aberta, seção 7).
- No começo só **1–2 POIs** aparecem. Resolver um **revela** o próximo (ou revela
  um escondido — ex: um papo te conta onde é a boca do chefe).
- Breadcrumb "Você tá na Pista · 2/6" no topo. O token anda = sensação de estar
  percorrendo o bairro.
- Nenhum POI mostra o conteúdo antes de você entrar. "Tem um ferro-velho ali" —
  só isso. O que tem dentro, você descobre entrando.

### 4.3 Economia leve (proposta — decisão aberta)

Pra encontro que não é briga **valer a pena**, entram duas moedas:

- **Grana** — de corre, achado, briga. Gasta em: descanso/cura entre brigas,
  comprar uma vantagem pontual, (depois) recrutar.
- **Nome / Rep** — a fama da gangue. Sobe com vitória e escolha ousada. Destranca
  POI ("o cara só fala com quem tem nome"), alimenta o **% de domínio** e o texto
  do final.

Mini-jogo dá XP + grana + rep. Briga dá tudo, mais.

---

## 5. A Pista — a primeira interação completa (protótipo)

Cena com **6 POIs + chefe**, descobertos em ordem:

| # | POI | Tipo | Mini-jogo / conteúdo | Ao resolver |
|---|---|---|---|---|
| 1 | **A boca do sinal** *(visível)* | Papo | moleque vendendo bala. Escolhas: *compra* (−trocado, ele solta info), *aperta ele* (treta fácil, −rep), *ignora* | revela #2 |
| 2 | **O ferro-velho** | Parada | `PuzzleForça` (gazua no portão). Falha → o vigia acorda → treta | revela #3; achado dentro (grana + sucata=item) |
| 3 | **O beco da Molecada da Pista** | Treta | 1º ponto de gangue de verdade | +rep, revela #4 |
| 4 | **A birosca do Seu Nato** | Papo (hub) | o coroa da esquina (o mesmo "Nego Véio"). Dá 1 corre e conta onde o Fumaça tá | revela #5 e #6 |
| 5 | **O corre do Nato** *(opcional)* | Corre | `PuzzleStealthGrid` (leva o pacote sem a viatura ver) | grana + rep |
| 6 | **O outro ponto da Molecada** | Treta | 2º ponto | +rep |
| ★ | **BOSS: Fumaça** *(trancado)* | Treta | abre com #3 + #6 + (#2 ou #5) feitos | **A Pista dominada → A Feira abre** |

**Experiência do jogador:** chega na Pista → só vê o farol e o ferro-velho →
conversa com o moleque → força a gazua → cai numa treta com o vigia → acha a
birosca do Nato → faz o corre dele → bate os dois pontos → o Fumaça sai pra
brigar. **Nunca viu tudo de uma vez. Sentiu que andou pela quebrada.**

---

## 6. Como replica pros outros bairros

Bairro dominado = escrever um JSON de cena: lista de POIs (tipo + conteúdo) +
grafo de descoberta + regra do portão do chefe. Os 5 componentes de tipo já
existem. Ideias de mini-jogo por bairro (casam com a ambientação):

| Bairro | Paradas / corres que combinam |
|---|---|
| **A Feira** | `PuzzleDecoder` (decifrar a caderneta de dívida do Turco), `PuzzleAnagrama` (senha do fiado) |
| **A Baixada** | `PuzzleStealthGrid` (atravessar a linha do trem), `PuzzleLabirinto` (o valão) |
| **A Vila** | `PuzzleSlidingTiles` (destravar o elevador), `PuzzleSimonSays` (subir os andares na ordem das luzes) |
| **O Morro** | `PuzzleLabirinto` (a escadaria que muda de forma) |
| **O Alto do Morro** | `PuzzleDecoder` / `PuzzleForça` (a porta de aço) |
| **A Laje** | só treta — é o clímax, sem mini-jogo |

Extras de outros jogos que podem virar POI: papo com pressão (estilo
interrogatório do Jack), descanso na birosca (estilo Tamagoshi), jogo de carta de
aposta (Top Trumps), corre de bike / perseguição (KernelGames).

---

## 7. Decisões abertas (é o que precisamos fechar antes de codar)

1. **Economia:** entra Grana + Rep agora, ou fica só XP por enquanto?
   *(recomendo Grana + Rep — é o que faz o conteúdo fora-de-briga importar.)*
2. **Navegação:** fita de cards vertical (seguro, rápido, estilo Jack Dream Beer)
   **ou** pinos numa rua desenhada com o token da gangue andando (mais imersivo,
   mais trabalho)?
3. **Mini-jogos:** usa a lib `Puzzles/` como está (rápido) ou re-tematiza com a
   cara de gangue (mais lento, mais bonito)?
4. **Descoberta:** revelação progressiva (POI só aparece depois de destravar) ou
   tudo visível com alguns cinza? *(recomendo progressiva — é o ponto do pedido.)*
5. **Dano entre encontros:** a gangue carrega PV perdido de um POI pro outro
   (aí "descanso" importa) ou reseta a cada encontro (mais leve)?
6. **Tamanho do protótipo da Pista:** os 6 POIs acima, ou começa menor (ex: 1
   papo + 1 parada + 2 tretas + boss) pra validar o modelo antes?

---

## 8. Ordem de implementação sugerida (depois de fechar a seção 7)

1. `GanguesCena.jsx` — o container: carrega a cena, renderiza a fita de POIs,
   controla estado (escondido/disponível/resolvido), grafo de descoberta, portão
   do chefe. Substitui o `GanguesTerritorio.jsx` atual.
2. `GanguesParada.jsx` — wrapper fino sobre `Puzzles/` (baseado no `PuzzleRouter`
   da LDI) devolvendo recompensa pro store.
3. `GanguesPapo.jsx` — `GangDialog` + escolhas + consequências.
4. `data/cenas/pista.js` — a cena da Pista (seção 5) como dados.
5. Store: `grana`, `rep`, `cenaProgresso[cenaId]` (quais POIs caíram), no mesmo
   padrão localStorage do `storyProgress` (esqueleto; Supabase depois).
6. Ligar vitória de treta / sucesso de parada → `marcarPoiResolvido` → revelação.
7. Só quando a Pista estiver gostosa: escrever as cenas dos outros 6 bairros.

---

## 9. O que NÃO muda

- O mapa das 7 regiões (`GanguesStoryMap`) — continua igual, gostou.
- Seleção de modo (História × Batalha), fundação da gangue, o mapa em polígonos.
- O combate em si (`GanguesCombat`), progressão de ficha, o boss final (o Costura).
- Modo Batalha (avulso) — não é tocado.
