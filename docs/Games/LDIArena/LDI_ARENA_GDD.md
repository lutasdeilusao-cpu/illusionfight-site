# LDI Arena — GDD

Documento único do LDI Arena: o jogo que vamos construir, as regras e o que já existe no protótipo. Cada regra é marcada como **[CANON]** (já existe no livro, na mitologia ou nos dados do site e não muda), **[DECIDIDO]** (escolha do Isaias) ou **[PROPOSTA]** (a aprovar).

- **Parte 1** — o jogo: conceito, laço, clube, níveis, campanha, grind.
- **Parte 2** — sistema elemental oficial.
- **Parte 3** — times e regra de luta.
- **Parte 4** — ordem de construção.
- **Parte 5** — decisões em aberto.
- **Apêndice A** — o protótipo hoje (código em `src/pages/lab/Prototype/ArenaTestbed/`).
- **Apêndice B** — a base do universo (manual de batalha, golpes, a arena na história, o Tactics antigo, precedentes do portal).

Fontes do canon: `src/data/mundo-pt.json` (`elementais`), `docs/LDI/MITOLOGIA.md` §3, `docs/importantes/MANUAL_BATALHA_LDI.md`, `docs/LDI/ATAQUES_E_PODERES.md`, o livro (capítulos 14 e 17) e o RETCON (`DOCS/LLutas de Ilusão - Retcon.md`).

**[DECIDIDO]** O jogo não usa personagens oficiais do universo neste momento. Os lutadores do jogador são do próprio clube dele; no protótipo aparecem como Jogador 1–4 e Inimigo 1–10.

---

## Parte 1 — O jogo [PROPOSTA]

### 1. Que jogo é

O LDI Arena é um jogo de **montar e evoluir uma equipe** dentro do LDI. O jogador não é um personagem do livro: ele monta um **clube de lutadores**, novatos que acabaram de entrar no LDI. Leva **até 4 deles** pra cada luta no tabuleiro hexagonal e sobe com o clube no **ranking SDR**, da faixa de 1 milhão até o Top 128.

O que segura o jogador é o mesmo que segura num RPG de equipe: **cada lutador é dele**. Ele escolheu, treinou, equipou e viu subir de nível. Perder um lutador numa luta difícil dói; ver um novato virar o melhor do time dá orgulho.

Três formatos foram considerados:

| Formato | Como é | Por que sim / por que não |
|---|---|---|
| **A. Clube no ranking** (recomendado) | Elenco de lutadores próprios; campanha pelas faixas do SDR; grind em sala de treino. | Usa o canon (ranking, salas de treino, pacotes de arma, elementais) sem usar personagem do livro. O grind tem motivo: subir de faixa. |
| B. Torre de andares | Cada partida é uma subida de andares; o que sobra entre partidas é pouco. | Bom como modo extra (§7), fraco como jogo principal: não cria apego ao lutador. |
| C. Mapa de bairros | Como o Gangues: andar numa cidade e entrar nas lutas. | Repete o Gangues, que já existe no portal. |

### 2. O laço de jogo

```
lutar  →  ganhar XP e LT  →  subir nível / comprar pacote de armas / aprender poder
   ↑                                                                         ↓
   └──────────  montar os 4 da próxima luta (elemento, arma, poderes)  ←─────┘
```

- **Uma luta** dura de 3 a 8 minutos.
- **Uma faixa do ranking** tem de 8 a 12 lutas e fecha com um **chefe da faixa**.
- Vencer o chefe abre a faixa seguinte, que tem inimigos mais fortes, arenas novas e um teto de nível maior.

### 3. O clube (elenco)

- O clube começa com **2 lutadores** e pode chegar a **12**. Na luta entram **até 4**; o resto fica no **banco**.
- **Recrutar:** cada vitória sobre chefe de faixa traz um recruta. A sala de recrutamento também vende recrutas com LT.
- **Cada recruta nasce com:**
  - um **elemental sorteado** entre os 6 primários, os 18 secundários e o Neutro, sem troca nunca (canon). O elemental é o que faz cada recruta ser diferente;
  - uma **faca inicial** (canon: todo jogador começa com faca);
  - **1 poder instantâneo** do seu elemental;
  - um **estilo**: corpo a corpo ou distância.
- Nome, cor e ícone o jogador escolhe. Nada de personagem oficial.

### 4. Níveis e grind

Segue o que o Gangues já provou em jogo de verdade:

- **Nível 1 a 60.** Todo nível sobe **+1 atributo**, sempre, numa ordem que depende do estilo e do elemental. Sem custo escalonado.
- **Poderes liberam em níveis fixos:** 2º poder no nível 8, 3º no 18 e 4º no 30. Depois disso, um poder novo **troca** um dos 4 (canon: máximo de 4 ativos).
- **XP por luta**, pra quem lutou: mais XP contra inimigo mais forte, menos contra mais fraco.
- **Quem fica no banco ganha 25% do XP.** Assim o clube inteiro anda, mas devagar.
- **Teto de nível por faixa:** a faixa limita até onde o lutador sobe, como os territórios do Gangues. Pra passar do teto, tem de vencer o chefe.

### 5. Armas e poderes

- **Pacote de armas** (canon): comprado com LT, traz **5 armas às cegas**. Cada arma tem **modo normal** e **modo Xamã**; o Xamã gasta mais energia.
- **Arma do elemento:** a arma no modo Xamã pode **fundir** com o elemental do lutador (canon), virando um golpe próprio.
- **Raridade** das armas sobe com a faixa do ranking.
- **Poderes** vêm do elemental (Parte 2): 2 do primário e 2 do secundário, ou só do primário pra quem é primário. Durações instantâneo, médio e longo (canon).

### 6. Campanha: as faixas do ranking SDR

| Faixa | Posição no SDR | Teto de nível | Inimigos típicos |
|---|---|---|---|
| 1 | de 1 milhão a 500 mil | 10 | capangas em bando (até 10, fracos) |
| 2 | de 500 mil a 100 mil | 20 | grupos médios, 1º elite |
| 3 | de 100 mil a 50 mil | 30 | elites com poderes de área |
| 4 | de 50 mil a 10 mil | 40 | times completos, arenas com terreno |
| 5 | de 10 mil a mil | 50 | elites de secundário raro |
| 6 | de mil ao Top 128 | 60 | até 8 inimigos fortes |
| Final | Torneio Mundial (Top 128) | — | chave eliminatória |

Cada faixa tem **arenas-tema** do manual: Digital Clássica, Ruínas, Aquática, Neve, Vulcânica, Gravitacional e Torre Espiral. Cada uma tem uma regra de terreno simples.

### 7. Onde grindar

- **Sala de treino** (canon): repete lutas já vencidas, escolhendo arena e dificuldade, pra ganhar XP e LT. Rende menos que a campanha.
- **Automático:** como no Gangues, a luta pode rodar sozinha, com velocidade 1×, 2× ou 3×, pra grind sem ficar tocando a tela.
- **Torre** (depois de fechar a faixa 3): andares seguidos sem recuperar a vida entre eles. Recompensa em arma rara.

### 8. Desgaste: o motivo pra ter mais de 4

- **[CANON]** No LDI, depois de lutar, o avatar precisa de tempo pra se recuperar.
- **No jogo:** o lutador que **cai** numa luta fica **cansado** e não pode lutar nas próximas 2 lutas. Quem termina de pé recupera tudo (canon do manual: PV e PM voltam depois da batalha).
- Isso obriga a ter **banco**: o jogador precisa de 6 a 8 lutadores bons, não só de 4. É aí que o grind dos reservas faz sentido.

### 9. Inimigos

- **Capangas:** fracos, caem com um golpe e vêm em bando de 8 a 10 (Parte 3).
- **Elites:** poucos e fortes, com elemental e 2 a 4 poderes.
- **Chefes de faixa:** um por faixa, com regra própria. Os chefes finais usam os elementais fora do sistema (Parte 2 §15).
- **Personalidades de IA** (já existem: Sanguinária, Fujona, Persistente) e mais as que forem preciso.

### 10. Dinheiro do jogo (LT)

- **[CANON]** LT é a moeda do LDI: compra pacote de armas, treino e itens.
- **Ganha:** vitória, chefe e Torre.
- **Gasta:** pacote de armas, recruta, poção e reset de poder.
- Sem compra com dinheiro real neste momento.

### 11. Regras do portal que valem aqui

- Mobile only, **uma mão**: ação na metade de baixo da tela, zoom em botão, sem pinça.
- **Save só na conta** (Supabase). Sem conta, o jogo vive só na memória.
- Todo conteúdo (lutador, arma, poder, inimigo) tem **id numérico**; o nome mora no i18n, nos 3 idiomas.

---

## Parte 2 — Sistema elemental

### 12. O que o canon diz

- **[CANON]** Todo jogador é ligado a **um elemental**, atribuído pelo sistema no registro do avatar. Ninguém troca de elemental.
- **[CANON]** Um elemental pode ser **primário** ou **secundário**. Não há diferença de força entre eles: a força do poder vem da energia que o jogador põe nele. O secundário "só tem mais opções de combinação" (livro, cap. 14).
- **[CANON]** Os **6 primários** são os filhos do Caos: Fogo, Água, Terra, Ar, Luz e Trevas (Escuridão).
- **[CANON]** Cada primário tem **3 secundários**, os netos do Caos:

| Primário | Natureza no LDI | Secundários |
|---|---|---|
| 🔥 Fogo | Explosivo e agressivo. Dano alto e pressão o tempo todo. | Lava, Explosão, Calor |
| 💧 Água | Fluido. Controle, cura, se adapta a tudo. | Gelo, Névoa, Veneno |
| 🪨 Terra | Sólido. Defesa, atordoamento, quem aguenta mais. | Pedra, Metal, Areia |
| 💨 Ar | Veloz e esquivo. Quem age primeiro. | Vento, Som, Tempestade |
| ✨ Luz | Protege e cega. Cura e escudo. | Eletricidade, Cristal, Cura |
| 🌑 Trevas | Corrói e drena. Rouba a força do outro. | Sombra, Gravidade, Ilusão |

- **[CANON]** **Neutro** é o Equilíbrio: o pacto que os seis fizeram quando prenderam o pai. Não é filho do Caos. Quem nasce Neutro **não tem picos nem fraquezas**.
- **[CANON]** A Yohu publicou uma **tabela de compatibilidade** entre elementais no primeiro dia do LDI e nunca precisou atualizar (RETCON). As chamas negras do Kim **absorvem** poder, o que não existe em nenhuma tabela.
- **[CANON]** Elementais **fora do sistema**, que não vêm dos deuses:
  - **Digital / Dados** (NeoGuide, NexusPhantasm): imitações criadas pela Yohu.
  - **Escuridão Corrompida** (David Kronos): Trevas estragadas pelo rito do Powa.
  - **Vazio** (Void): o Caos vazando pela rachadura.
  - **Todos os primários** (Pajé Yawanari): o poder sagrado dos Xakaxi.
  - **Primordial**, o "oitavo elemental" dos fóruns: é o próprio Caos. O sistema não tem categoria pra ele e registra o que vê como Trevas.

### 13. A tabela de compatibilidade (a da Yohu) — [PROPOSTA]

O canon garante duas coisas que a tabela tem de respeitar:

1. Nenhum elemental é mais forte que outro.
2. O Neutro não tem picos nem fraquezas.

Por isso, a proposta é uma tabela **de choque**, não de vantagem:

- Os 6 primários formam **3 pares opostos**: **Fogo ↔ Água**, **Terra ↔ Ar**, **Luz ↔ Trevas**. Na mitologia são irmãos de natureza contrária.
- **Choque:** golpe elemental contra o elemental oposto causa **dano extra** (proposta: +2 na FA). Vale **nos dois sentidos**: o Fogo bate mais forte na Água e a Água bate mais forte no Fogo. Ninguém ganha a luta só pelo elemento, mas a luta entre opostos é mais curta e mais perigosa pros dois.
- **Mesmo elemento:** golpe contra o próprio elemento (ou contra um irmão de mesmo primário) causa **dano reduzido** (proposta: −2 na FA). O elemento não fere o próprio sangue.
- **Secundário herda o primário:** Eletricidade choca com Trevas e seus secundários, porque é neta da Luz. É assim que o secundário "tem mais opções de combinação": tem o choque do pai **e** o efeito próprio (§14).
- **Neutro:** não choca com ninguém e ninguém choca com ele. Sem extra e sem redução, nunca.
- **Fora do sistema:** não estão na tabela da Yohu. Cada um tem uma regra própria de chefe (§15).
- **Golpe sem elemento** (mãos livres e arma no modo normal) não passa pela tabela.

Alternativa que fica registrada, mas **não recomendada**: um ciclo de vantagens (Fogo vence Ar, Ar vence Terra…). Cria contra-ataque garantido, e o canon diz que nenhum elemental é mais forte.

### 14. O que cada elemental faz no tabuleiro — [PROPOSTA]

O hexágono é onde o elemento ganha corpo: posição, terreno e distância.

**Primário** = o estilo de luta (o "jeito" do lutador, um bônus fixo de identidade).

| Primário | Identidade no tabuleiro |
|---|---|
| Fogo | +dano nos poderes; seus golpes deixam a casa **em chamas** por 1 turno |
| Água | poderes podem **puxar** ou **empurrar** 1 casa; cura leve |
| Terra | +defesa; pode **erguer** um obstáculo de pedra numa casa vizinha |
| Ar | +movimento e iniciativa; pode **atravessar** aliados e inimigos |
| Luz | **cura** e **escudo** em aliados; pode **cegar** (alvo erra mais) |
| Trevas | **drena**: parte do dano vira vida ou energia pra quem bateu |

**Secundário** = um efeito próprio além do pai.

| Secundário | Efeito no tabuleiro |
|---|---|
| Lava | deixa a casa queimando por 3 turnos (fere quem pisa) |
| Explosão | golpe em **área** (o alvo e as casas vizinhas) |
| Calor | dano contínuo no alvo por 2 turnos (queimadura) |
| Gelo | **congela**: o alvo perde o movimento no próximo turno |
| Névoa | cria névoa numa área: **bloqueia a linha de visão** de ataque à distância |
| Veneno | dano contínuo por 3 turnos, que não some com escudo |
| Pedra | ergue **barreiras** (obstáculo de verdade, destrutível) |
| Metal | defesa muito alta; reduz o dano de golpe físico |
| Areia | deixa casas **lentas** (custam 2 de movimento) e pode cegar |
| Vento | **empurra** o alvo 2 casas (contra parede = dano extra) |
| Som | golpe em **linha ou cone**; pode atordoar |
| Tempestade | atinge casas **aleatórias** numa área grande |
| Eletricidade | o golpe **pula** pra outro inimigo vizinho do alvo |
| Cristal | **reflete** parte do dano recebido |
| Cura | cura forte e cura em área; pode tirar estado ruim |
| Sombra | **teleporta** pra casa de sombra (atrás de obstáculo) e some 1 turno |
| Gravidade | **puxa** o alvo ou prende no lugar |
| Ilusão | cria **cópia** que confunde a IA e absorve 1 golpe |

O Neutro não tem efeito próprio e não tem fraqueza. A troca é ser o lutador mais estável: nunca sofre choque, e o poder dele ignora redução de "mesmo elemento".

### 15. Elementais fora do sistema — [PROPOSTA]

São regras de chefe e de evento de história. O jogador não escolhe nenhum deles.

| Elemental | Quem | Regra no jogo |
|---|---|---|
| Primordial | — | **Absorve** poder elemental recebido (o canon das chamas negras). Evento raro de história, nunca um poder comum. |
| Escuridão Corrompida | — | Drena como Trevas, mas não sofre choque da Luz. É a "Trevas estragada": a tabela não pega nele. |
| Vazio | — | Abre casas de **gosma preta** no chão da arena (o Caos escorrendo), que ferem quem pisa. |
| Digital | — | Elementais do sistema: aparecem como **regras da arena** (treino, narrador), não como lutadores comuns. |
| Todos os primários | — | Troca de primário a cada turno. Chefe especial. |

### 16. Regras que ligam o elemental ao resto do jogo

- **[CANON]** **3 modos de luta:** mãos livres, arma e poder. Só o **modo poder** usa o elemental.
- **[CANON]** **Máximo de 4 poderes ativos** por luta. Um poder novo pode surgir no meio da luta e entra no lugar do último.
- **[CANON]** Poderes têm **3 durações**: instantâneo (barato), médio e longo (forte e caro). Carregar deixa o lutador exposto, e tomar golpe faz perder a carga.
- **[CANON]** Arma no **modo Xamã** gasta mais energia e pode **fundir** com o elemental (corte da arma + o poder do elemento).
- **[PROPOSTA]** Os 4 poderes de cada lutador saem do seu elemental: 2 do primário e 2 próprios. No caso do secundário, 2 do primário pai e 2 do secundário.
- **[PROPOSTA]** As **arenas** têm afinidade elemental: Vulcânica favorece Fogo e Lava; Aquática, Água; Neve, Gelo; Ruínas, Terra. Lutar na arena do seu elemento dá um bônus pequeno, como no "Especialista de Arena" do manual.

---

## Parte 3 — Times e regra de luta

### 17. Tamanho dos times

- **[DECIDIDO]** Do lado do jogador: **até 4** lutadores.
- **[DECIDIDO]** Do lado inimigo: **até 10**. Quantidade e força andam em sentido contrário:
  - **8 a 10 inimigos** só quando são **fracos** — capangas que caem com um golpe. É quantidade, não qualidade.
  - **Até 8 inimigos fortes** só no **fim do jogo**.
  - No começo e no meio do jogo, inimigo forte vem em grupo pequeno.
- No protótipo, o limite está em `engine/regrasFicha.js` (`MAX_TIME_JOGADOR`, `MAX_TIME_INIMIGO`). A força de cada inimigo ainda é livre na montagem; a regra de "muitos = fracos" entra quando existirem as lutas prontas da campanha.

### 18. Regra de luta: puxar o motor para o manual

**Proposta:** trocar os 6 atributos de hoje pelos 5 do manual (F, H, R, A, PdF), com as fórmulas do manual, dentro do `engine/regras.js`.

- Tudo passa por um lugar só, então a troca não espalha pelo código.
- A esquiva do manual (H contra H) substitui a tabela de chance de acerto.
- PV = R × 5 e PM = PdF × 5 separam vida de energia (hoje RES manda nas duas coisas e vira o único atributo que importa).
- O carregamento de poder com exposição (livro) já tem campo no dado (`turnosCarregamento`); o Vitória Finals do Jack é o exemplo pronto.
- **Ajuste necessário:** "sem dano mínimo" pode travar lutas entre defensores. Proposta: manter o dano mínimo 1 de hoje, ou testar no simulador antes.

### 19. Mapas

- **Mapas prontos**, um por tipo de arena do manual (Digital Clássica, Ruínas, Aquática, Vulcânica, Neve, Gravitacional, Torre Espiral), cada um com uma regra de terreno simples (lava fere, água lenta, gelo escorrega…).
- O editor de hoje vira **ferramenta de criar mapa** (admin), e os mapas viram dado (`data/mapas`), com posição inicial de cada time.
- Os obstáculos 3 e 4 (armadilha e caixa) ganham regra: destrutível, empurrável, explode.
- A câmera já aguenta mapa maior que a tela.

---

## Parte 4 — Ordem de construção

Do mais básico pro mais visível, cada passo jogável e testado antes do próximo:

1. **Regra de luta** (Parte 3 §18) e **tabela elemental** (Parte 2) no `engine/regras.js`, com um simulador de lutas pra calibrar os números.
2. **Lutador do clube:** recruta com elemental sorteado, estilo, faca, curva de nível e poderes por nível.
3. **Poderes de verdade** por elemental, com efeito no tabuleiro (Parte 2 §14).
4. **3 arenas prontas** e o editor de mapa fora do caminho do jogador (vira ferramenta de admin).
5. **Save na conta** (Supabase): clube, níveis, armas, LT.
6. **Faixa 1 do ranking completa**, com capangas, elites, chefe, XP, desgaste e recompensa.
7. **Fluxo final:** clube → escolher os 4 → arena → luta → recompensa. Sem tela de debug, tudo traduzido e usável com uma mão.

Com isso fechado, o jogo tem um ciclo completo pra 15/03/2027. As outras faixas, a Torre e o torneio entram depois, com o sistema firme. Multiplayer fica pro fim.

### 20. O que não fazer

- Não usar os 12 elementais nem o elenco inventado do Tactics antigo, nem personagens oficiais do livro.
- Não usar custo escalonado de atributo.
- Não deixar a ficha livre como modo principal.
- Não gravar progresso no `localStorage`.
- Não depender de pinça ou de duas mãos.
- Não começar pelo multiplayer.

---

## Parte 5 — Decisões em aberto

1. **O jogo é o clube no ranking SDR** (Parte 1 §1)?
2. **Clube de até 12, com 4 por luta e desgaste** pra quem cai (§3 e §8)?
3. **Níveis como no Gangues** (nível 1 a 60, +1 atributo por nível, poderes nos níveis 8, 18 e 30)? (§4)
4. **Banco ganha 25% do XP**? (§4)
5. **Recruta com elemental sorteado** ou escolhido pelo jogador? (§3)
6. A **tabela elemental** é de choque (opostos se ferem mais, nos dois sentidos)? (Parte 2 §13)
7. Os pares opostos são **Fogo ↔ Água, Terra ↔ Ar, Luz ↔ Trevas**?
8. O efeito de cada secundário (§14) está no espírito do elemento?
9. O Neutro fica sem efeito próprio, só com a estabilidade?
10. A **regra do manual** (5 atributos, PV/PM separados, esquiva por H) substitui a de hoje? O dano mínimo 1 fica? (Parte 3 §18)

---

## Apêndice A — O protótipo hoje

Caminhos relativos a `src/pages/lab/Prototype/ArenaTestbed/`.

### A1. Como se chega no jogo

- Rota: `/games/ldi-arena`, embrulhada em `<SoAdmin>` (`src/App.jsx`). `/prototype/arenatestbed` redireciona para ela.
- Também aparece no catálogo de protótipos (`src/pages/lab/Prototype/Prototype.jsx`, id `arena-testbed`).
- Ao montar, liga `readerMode` (some navbar) e pré-carrega os sons (`ArenaTestbed.jsx:39-41`).

### A2. Fluxo de fases

O orquestrador é `ArenaTestbed.jsx`. As fases são o enum `FaseArena` (`ArenaTestbed.jsx:17-26`) e a tabela `FASES_CONFIG` (`ArenaTestbed.jsx:137-171`). No topo há um indicador de 8 passos (bolinhas numeradas, ✓ nas já feitas). O estado que passa entre fases mora no orquestrador: `characters`, `boardState`, `poderesEscolhidos`, `animacoesPorChar`, `modoJogo`, `fichaId`.

| # | Fase | Arquivo | O que o jogador vê e faz |
|---|------|---------|--------------------------|
| 0 | INICIO | `phases/Phase0Start.jsx` | "Novo jogo" ou "Carregar". Lista de fichas salvas (nomes dos personagens), carregar ou apagar (com confirmação). Aviso quando atinge o limite de 9 fichas. O botão "Carregar" grande carrega sempre a 1ª ficha. |
| 1 | FICHA | `phases/Phase1SheetBuilder.jsx` | Monta até 4 combatentes do jogador e até 10 inimigos. Cada um: time (Jogador/IA), personalidade (só IA), tipo de ataque (corpo a corpo / distância), orçamento de pontos (3 a 30, de 3 em 3), distribuição nos 6 atributos, equipamento, poções HP/MP iniciais. Só avança com ≥1 jogador, ≥1 IA e todos os pontos gastos. |
| 2 | PERSONALIZACAO | `phases/Phase2Customize.jsx` | Só para os personagens do jogador (máx. 4): cor (4 fixas), ícone (círculo/quadrado/losango/triângulo) e nome (Jogador 1 a 4). Cor e nome não se repetem. Ao confirmar, a ficha é salva no `localStorage`. Carregar ficha pula direto pra cá. |
| 3 | MODO | `phases/Phase3ModeSelect.jsx` | Treino (ativo) ou Campanha (botão com selo "em breve", sem ação). |
| 4 | TABULEIRO | `phases/Phase4BoardSetup.jsx` | Editor do mapa em canvas: tamanho (até 10 colunas × 15 linhas, começa em 7×4), ferramentas Selecionar/Borracha, 4 tipos de obstáculo, poções no chão (HP/MP), posicionar personagens. Só libera "Iniciar" com jogadores na metade esquerda, IA na direita e sem sobreposição. |
| 5 | PODERES | `phases/Phase5PowerSelect.jsx` | Um card recolhível por personagem (jogador e IA). Grade de poderes filtrada pelo tipo do personagem, abas por elemento e ordenação por FA/FD/A-Z. Limite de poderes = `min(RES, 4)`. IA sem escolha recebe 1–3 poderes aleatórios (`ArenaTestbed.jsx:84-96`). |
| 6 | ANIM_DEBUG | `phases/Phase5bAnimDebug.jsx` | Tela de depuração (marcada "[DEBUG]", texto fixo em português): escolhe o id de animação de movimento, ataque corpo a corpo, ataque à distância, defesa, "habilidade" e "efeito" de cada personagem. |
| 7 | COMBATE_V2 | `phases/Phase6CombatV2.jsx` | A batalha (A6). No fim, tela de vitória/derrota com "jogar de novo" (volta à fase 0). |

### A3. Ficha do personagem

#### Atributos (`phases/Phase1SheetBuilder.jsx:7`)

`forca` (FOR), `agi` (AGI), `dex` (DEX), `pdf` (PdF, poder de fogo), `res` (RES), `arm` (ARM). Cada ponto custa 1 do orçamento. RES mínimo 1, demais mínimo 0.

- Corpo a corpo (`melee`): PdF travado em 0.
- Distância (`distancia`): FOR travada em 0 na tela; `criarPersonagem` grava FOR = 1 (`engine/combat.js:211`).

#### Valores derivados (`engine/combat.js`)

- HP = RES × 10 (`engine/combat.js:174-176`).
- MP = RES × 10 (`engine/combat.js:182-184`).
- Casas de movimento: tabela por faixa (AGI ≤2 → 1, ≤5 → 2, ≤8 → 3, senão 4) ou 1 AGI = 1 casa com `agiUmPraUm` (`engine/combat.js:162-168`). **O combate usa sempre 1:1** (`phases/Phase6CombatV2.jsx:78` passa `agiUmPraUm: true`; a IA também chama com `true`). O campo `casasMovimento` gravado na ficha usa a tabela e não é lido no combate.
- Alcance de ataque: corpo a corpo = 1 (vizinhos); distância = valor de PdF.
- Equipamento: `nenhum`, `ofensivo` (+2 FA), `defensivo` (+2 FD), `ambos`.
- Inventário: `pocaoHP`, `pocaoMP`.

#### Onde mora

- Nomes: Jogador 1–3 e Inimigo 1–3 (`engine/regrasFicha.js`, `phases/Phase1SheetBuilder.jsx`). Ficha antiga salva com nome de personagem do universo é trocada pro nome genérico na leitura (`data/fichaStorage.js`).
- Ficha em edição: estado React da fase 1. Objeto final por `criarPersonagem` (`engine/combat.js:203-230`), id `char_<timestamp>_<rand>`.
- Persistência: `data/fichaStorage.js`, `localStorage['ldi_arenatestbed_fichas']`, interface assíncrona. Uma "ficha" salva = a lista de personagens (jogador personalizado + IA).
- Regras de limite: `engine/regrasFicha.js` (9 fichas, 4 do jogador, 10 inimigos, 4 cores, 4 nomes).

### A4. Tabuleiro hexagonal

- Hexágonos de topo plano, coordenada offset `{row, col}` com deslocamento por coluna ímpar; distância e linha calculadas em coordenadas cúbicas (`engine/hexUtils.js:14-71`).
- Vizinhos: `getVizinhos` (`engine/hexUtils.js:75-88`).
- `gerarGrid` (`engine/hexUtils.js:50-63`, usado por `engine/useHexCanvas.js`) desloca por **linha** ímpar, diferente do resto do arquivo, que desloca por coluna. Inconsistência a resolver antes de qualquer mapa novo.
- Desenho do combate: `engine/drawCombatBoard.js` (canvas, cores em hex literal); tamanho/clique: `engine/useHexCanvas.js`. Textura de chão: `/assets/arena/terrenos/tile_default.png`.

#### Obstáculos (`phases/Phase4BoardSetup.jsx:9-14`)

| Tipo | Nome | Movimento | Corpo a corpo | Linha de visão (distância) |
|---|---|---|---|---|
| 1 | Parede 🧱 | bloqueia | bloqueia | bloqueia (`engine/hexUtils.js:145-157`) |
| 2 | Buraco 🕳️ | bloqueia | bloqueia | não bloqueia |
| 3 | Armadilha/destrutível 🪤 (HP 1–3, efeito nenhum/explosão/congelamento) | livre | livre | livre |
| 4 | Caixa 📦 (marcas "móvel"/"destrutível") | livre | livre | livre |

Os campos de HP, efeito, móvel e destrutível dos tipos 3 e 4 são gravados no mapa mas **nenhum código do combate os lê**. Na prática, tipo 3 e 4 são decoração.

#### Itens no chão

Poção HP ou MP numa casa. Quem termina o movimento nela coleta (+1 no inventário) (`engine/useCombatEngine.js:416-428`).

### A5. Ordem de turno (iniciativa)

Calculada uma vez no início e vale a partida inteira (`engine/turnOrder.js`, chamada em `engine/useCombatEngine.js:571-592`).

1. Ordena vivos por AGI decrescente (`engine/turnOrder.js:16-26`).
2. Empate só entre personagens do jogador → o jogador reordena numa tela com setas ("ordering", `phases/Phase6CombatV2.jsx:481-519`).
3. Empate só entre IAs → sorteio.
4. Empate jogador × IA → **Jokenpô** (componente compartilhado `src/components/Jokempo/Jokempo`); vencedores e perdedores se intercalam no bloco (`engine/turnOrder.js:98-127`).

O controle do turno é o módulo `engine/TurnController.js` (estado em variável de módulo, não React): ordem, quem está na vez, ações já feitas no turno, mortos (pulados ao avançar).

### A6. O combate

Tela: `phases/Phase6CombatV2.jsx` (layout) + motor `engine/useCombatEngine.js` (turno, animação e aplicação; a regra do golpe mora em `engine/regras.js`). Topo: de quem é a vez e botão ≡ do log; meio: canvas; abaixo: chips de HP/MP de cada vivo (toque abre `components/modals/CharModal.jsx` com os atributos); rodapé: botões de ação.

#### Turno do jogador

- Toque no próprio personagem abre o painel: **Mover**, **Atacar**, **Poção HP ×n**, **Poção MP ×n**. Há também **Finalizar turno**.
- Por turno: 1 movimento e 1 ataque, em qualquer ordem (`TurnController.podeAgir` + `turnoAcoes`). O turno só acaba quando o jogador aperta Finalizar ou usa poção.
- **Mover:** mostra casas alcançáveis por BFS até `AGI` passos, sem atravessar Parede/Buraco (`engine/hexUtils.js:216-241`); remove casas ocupadas. Escolhe o destino, vê o caminho, confirma. O caminho real é refeito com BFS que desvia de personagens (`engine/hexUtils.js:261-284`). Obs.: o alcance mostrado conta passos atravessando aliados/inimigos, mas o caminho real não atravessa — pode mostrar casa que custa mais passos que o AGI.
- **Atacar:** se tem poder de ataque com MP, abre `PowerChoiceModal` (comum ou poder). Destaca alcance e alvos inimigos; toque no alvo ataca.
- **Poção:** +5 HP ou +5 MP (até o máximo) e **encerra o turno** (`engine/useCombatEngine.js:514-530`).

#### Fórmulas (`engine/combat.js`)

- **FA corpo a corpo** = FOR + DEXef + d6 (`engine/combat.js:17-18`)
- **FA distância** = (PdF − 1) + DEXef + d6 (`engine/combat.js:20-21`)
- DEXef = DEX inteira se o d6 do atacante deu 6, senão DEX × 0,25 (`engine/combat.js:14`)
- Equipamento ofensivo/ambos: FA + 2 (`engine/combat.js:25-27`)
- **FD** = ARM + AGIef + d6; AGIef = AGI inteira se o d6 do defensor deu 6, senão AGI × 0,25; defensivo/ambos: + 2 (`engine/combat.js:38-46`)
- **Dano** = arredonda(FA − FD), mínimo 1 (`engine/combat.js:88`, `:101`)
- **Redução por distância** (só ataque à distância, sobre o dano bruto): distância 2 → ×0,75; distância ≥ 3 → ×0,5 (`engine/combat.js:91-99`). Distância 1 = 100%.
- **Crítico ofensivo** (d6 = 6): só libera a DEX inteira.
- **Crítico defensivo** (d6 do defensor = 6): dano 0 e contra-ataque com FA/2 contra a FD do atacante (`engine/combat.js:75-86`, resolvido em `resolverContraAtaque`, `engine/combat.js:129-148`; dano mínimo 1, anulado se o atacante tirar 6).
- **Ataque extra**: se AGI do atacante > 2 × AGI do defensor, golpe extra com FA/2 contra nova FD (`engine/combat.js:104-109`; rolado em `engine/regras.js`).
- **Chance de acerto** (`engine/combat.js:189-198`): 100% se DEX atacante > AGI defensor; senão 90% (AGI ≤2), 80%, 70%, 60%, 50%, 40%, 30% (AGI ≥8).

#### Regra única do golpe (`engine/regras.js`)

Jogador e IA passam pelo mesmo resolvedor, `resolverGolpe(atacante, alvo, { distancia, poderAtaque, poderDefesa })`. Ele é puro (sem React, sem animação) e devolve tudo já rolado: acerto, custo de MP de quem ataca e de quem defende, dano, contra-ataque e ataque extra. O motor (`engine/useCombatEngine.js`, `executarGolpe`) só paga o MP, anima e aplica; no fim, `aoTerminar` devolve o turno a quem bateu.

- **Acerto:** sempre rolado, para os dois lados (`getChanceAcerto`). Errou = balão MISS, sem dano.
- **Poder de ataque:** vale o poder escolhido. O jogador escolhe no modal; a IA escolhe pela personalidade (Sanguinária e Persistente pegam o mais forte que podem pagar, a Fujona ataca sem poder). Paga o `custoMP` do próprio poder e soma o bônus dele.
- **Poder de defesa:** vale o poder escolhido, com o custo e o valor dele (`valorComparativo.fd`, tirado do dano). O jogador escolhe no modal quando é atacado; a IA defende com o melhor poder de defesa que pode pagar.
- **Contra-ataque e ataque extra:** valem para os dois lados. Quem cai no contra-ataque também é marcado como derrotado.
- **A IA só decide:** as personalidades (`engine/ai/personalidades/`) e `engine/ai.js` devolvem só o pedido — `{ tipo: 'andar' | 'atacar' | 'finalizar', detalhes: { alvo, poderId } }` — e nunca calculam dano.
- O ataque da IA também passa pelo `TurnController` (`podeAgir`/`registrarAcao`), como o do jogador.

#### Poderes (`data/poderes.js`, `engine/mecanicasPoder.js`)

- 16 poderes: 3 base sem elemento (FOR+, PdF+, Defesa+) e 13 de amostra em 6 elementos (fogo, água, terra, ar, trevas, luz). Elementos são só filtro/etiqueta, sem efeito.
- Campos: `gatilho` (`ataque`/`defesa`), `tipoPersonagem` (`forca`/`pdf`/`universal`), `custoMP` (3–5), `mecanicaId`, `params`, `valorComparativo` (pra ordenar), `visualId` (sempre null), `tipoExecucao` (sempre `instantaneo`), `turnosCarregamento` (sempre 0).
- Mecânica 1 `bonusAtributo`: soma `bonus` (+2 ou +3) em FOR ou PdF só naquele ataque (`engine/mecanicasPoder.js:12-22`).
- Mecânica 2 `defesaPrompt`: o efeito vem do `valorComparativo.fd` do poder, aplicado em `resolverGolpe`.
- O modal de defesa só aparece se o jogador alvo tem algum poder de defesa que consiga pagar.

#### Efeitos de estado

Não existem. Não há veneno, atordoamento, congelamento, queimadura, buff com duração nem nada que dure além de um golpe.

#### IA (`engine/ai.js`, `engine/ai/personalidades/`)

Cada IA tem uma personalidade escolhida na ficha (`engine/ai/personalidades/index.js`). O turno da IA tem estágios com pausas encenadas (`engine/useCombatEngine.js:650-810`): pensa (1,5 s) → mostra alcance → decide movimento → anda → decide ação → ataca → encerra. A decisão é chamada duas vezes (fase "movimento" e fase "acao").

- **Sanguinária:** mira o inimigo de menor HP (no mapa todo); ataca se ele está ao alcance, senão avança pelo caminho mais curto até AGI casas.
- **Fujona:** no movimento foge **uma casa** para o vizinho mais longe dos inimigos (encurralada, avança uma casa); na ação ataca o inimigo mais fraco ao alcance.
- **Persistente:** fixa um alvo (menor HP) e só troca se outro ficar mais fraco; grava `alvoFixadoId` mutando o objeto do personagem.
- **Padrão** (`engine/ai.js`, sem personalidade): inimigo mais próximo; ataca ou anda; se nada, pega item no chão.
- Sanguinária e Persistente ignoram a fase: no estágio de movimento podem "decidir atacar" (resultado descartado), aí não andam e atacam no estágio seguinte. Nenhuma IA usa poção do inventário, poder ou obstáculo como cobertura.

#### Vitória e derrota

`verificarVitoria` (`engine/useCombatEngine.js:177-192`): sem jogador vivo → IA vence; sem IA viva → jogador vence. HP 0 = morto, marcado no `TurnController` e pulado. Sem limite de turnos, sem empate, sem recompensa nem progresso.

#### Câmera (`engine/useCamera.js`)

O tabuleiro é desenhado a partir de dois números: onde a grade começa na tela (`padRef`) e o tamanho do hexágono (`sizeRef`). A câmera só escreve neles a cada quadro (`camera.tick`, no `onFrame` da tela de combate), então desenho, animação, balões e toque seguem a câmera sem saber dela.

- **Seguir:** por padrão a câmera fica centrada em quem está agindo, e volta a seguir a cada troca de turno.
- **Olhar em volta:** na vez do jogador, arrastar o dedo no tabuleiro move a câmera. Arrasto de menos de 8 px conta como toque (selecionar casa).
- **Zoom:** botões − e + no canto de baixo à direita, ao alcance do dedão; nunca pinça. Os níveis são: tabuleiro inteiro, legível (hexágono de 30 px) e perto (44 px).
- **Centralizar:** o botão ⌖ volta a seguir quem está agindo.
- **Abertura:** se o tabuleiro inteiro cabe legível na tela, abre mostrando tudo; senão, abre no tamanho legível seguindo quem age.
- **Limites:** a câmera não sai do tabuleiro; no eixo em que o tabuleiro cabe na tela, ele fica centralizado.
- Tabuleiro de qualquer tamanho funciona sem mudar a câmera. O editor de tabuleiro (fase 4) ainda não usa a câmera.

#### Apresentação

- Animações por id: movimento (padrão, teleporte, estilingue), ataque corpo a corpo (padrão, padrão+, rage dash, soco de energia), distância (tiro reto, rajada, spirit gun), defesa (golpe, bloqueio, escudo mágico) em `engine/animations/`. Partículas, "juice" (tremor, hit stop) em `engine/animations/particles.js`, `engine/animations/juice.js`. "habilidade" e "efeito" da fase de debug não têm animação ligada.
- Efeitos/anúncios: `engine/useEffectMachine.js`, `components/effects/EffectRenderer.js`, `engine/eventBus.js`, `engine/useUIController.js`, `engine/useInputLock.js`, `engine/useCanvasLoop.js`.
- Som: `engine/audioManager.js`.
- Log da batalha em gaveta, com as contas de FA/FD.

### A7. O que é placeholder, morto ou quebrado

- `casasMovimento` da ficha e a tabela por faixa de AGI: não usados no combate.
- Obstáculos 3 e 4: propriedades sem efeito.
- Modo Campanha: só o botão.
- Fase ANIM_DEBUG faz parte do fluxo normal (todo jogador passa por ela) e tem texto fixo em português, fora do i18n.
- Textos fixos fora do i18n também na fase 1 ("CONSTRUÇÃO DE FICHAS", "JOGADOR", "EQUIPAMENTO", "+ NOVO COMBATENTE"…), no log de combate e nas personalidades.
- Ficha carregada só leva a personalização; a IA da ficha volta junto, mas não há como editar atributos de uma ficha salva.
- Muitos `console.log('[DEBUG] ...')` nas personalidades e no `TurnController` (diagnóstico, manter até decisão).

---

## Apêndice B — A base do universo

### B1. O manual de batalha do LDI (`docs/importantes/MANUAL_BATALHA_LDI.md`)

É a regra de luta "oficial" do universo, um 3D&T adaptado. O motor atual da Arena já é parente dele (d6, FA contra FD, crítico no 6, 1 ação + 1 movimento), mas com outros atributos.

| | Manual do LDI | Motor atual da Arena |
|---|---|---|
| Atributos | 5: F (potência), H (agilidade), R (resistência), A (proteção), PdF (poder elemental) | 6: FOR, AGI, DEX, PdF, RES, ARM |
| Escala | 0 a 5 (5 = topo absoluto) | orçamento de 3 a 30 pontos |
| Vida e energia | PV = R × 5; PM = PdF × 5 | HP = RES × 10; MP = RES × 10 |
| Ataque | F + H + d6 (perto) ou PdF + H + d6 (longe) | FOR + DEX/4 + d6 |
| Defesa | A + H + d6 | ARM + AGI/4 + d6 |
| Dano | FA − FD, sem dano mínimo | FA − FD, mínimo 1 |
| Crítico | 6 no dado dobra F/PdF (ataque) ou A (defesa) | 6 libera a DEX/AGI inteira |
| Esquiva | teste de H contra H; passou, não toma dano | tabela de chance de acerto pela AGI |
| Iniciativa | H + d6, rolada uma vez | AGI, com Jokenpô no empate |
| Pontos de ficha | Novato 5, Lutador 7, Campeão 10, Lenda 12 | livre |

- **Elementais:** o manual lista 7 (os 6 primários + Neutro), mas o sistema oficial do universo tem mais: 6 primários, cada um com 3 secundários, Neutro e os elementais fora do sistema. O sistema oficial está na Parte 2; o manual vale só pra fórmula de luta.
- **Poderes:** 6 por elemental, de 1 a 4 PM, com efeitos de verdade — área (Terremoto), empurrar (Ciclone), puxar (Corrente), impedir aproximação (Redemoinho), ignorar proteção (Lâmina d'Água), dano dobrado (Inferno). Equipa até H + 1, no máximo 5.
- **Vantagens** com custo em PM: movimento extra, alcance, cura, teleporte, regeneração, tiro carregável (fica indefeso 1 turno e dá PdF × 2), voo, ataque em área, paralisia, reflexão e dezenas de outras.
- **Arena como vantagem:** o manual já lista tipos de arena — Digital Clássica, Ruínas, Aquática, Gravitacional, Torre Espiral, Vulcânica, Neve — e lutador especialista ganha bônus no terreno dele.
- **Estados:** Perto da Morte (PV ≤ R), Indefeso, Surpreso e teste de morte no d6.
- **Recuperação:** nada entre turnos; tudo volta ao máximo depois da batalha.
- **XP:** vitória justa 10, derrota 1; a cada 100 XP, 1 ponto de personagem.

### B2. Os golpes dos personagens (`docs/LDI/ATAQUES_E_PODERES.md`)

Cada personagem do livro já tem arma, elemental e golpe-assinatura. É um elenco pronto com kit:

| Personagem | Elemental | Arma (normal → modo Xamã) | Golpe-assinatura |
|---|---|---|---|
| Kim | Fogo (manifesta Trevas) | 2 machadinhas com fio de aço que volta à mão → machado de duas lâminas | Golpe do escorpião, bola de fogo; "correntes" e modo pantera |
| Jack | Terra | bengala "Vitória" → nunchaku de 3 partes | Vitória Finals: carrega em 3 etapas, letal, deixa uma grande abertura |
| Nina | Luz | katana "Angel" → chicote segmentado de 2 a 3 m | Angel Luminus Blade: corte em área girando; fintas de Muay Thai |
| Thunderbolt | Luz → eletricidade | bastão elétrico | raio das mãos; some em fumaça e reaparece pelas costas |
| Shuntaro | Água | ioiôs → serra-escudo arremessável | Fatal Slices: 10 ioiôs, 5 m de alcance |
| Outros citados | — | Roxy (socos-ingleses), Pajé (todos os elementais), Powa/Kronos (dreno de vida), Lenna (Vento), Osvaldo (Terra) | sem golpes descritos |

Regras do LDI que o livro já fixou e que viram regra de jogo:

- 3 modos de luta combináveis: **mãos livres** (mais barato), **arma** e **poder**.
- Arma tem modo normal e **modo Xamã**, que gasta mais energia.
- **1 elemental por avatar**, sem troca.
- Poderes de 3 durações: instantâneo, médio e longo. **Carregar deixa exposto; tomar golpe perde a carga.**
- **No máximo 4 poderes ativos.**
- Formatos de luta: 1×1, 2×1, 10×1, 2×2, vitória por tempo, resistência ou objetivo, e Battle Royale.
- Salas de treino com obstáculos, desvantagem elemental e inimigos já enfrentados.

### B3. A arena na história

- O LDI é o jogo de luta virtual de Bravara: a consciência entra no MDI pelo SBI e a dor é real. São 3 bilhões de jogadores.
- **Ranking SDR:** faixas de 1 milhão até o **Top 128**, que disputa o Torneio Mundial na ilha Davoss, de Kronos, a cada 4 anos. Quem morre perde posição.
- Sistemas do LDI que já existem na história: SDA (apostas), SDD (doações com pedido de golpe), SAL (luta privada), STE (treino pago), SDP (patrocínio), moeda **LT** (pacotes de armas, treino e itens), o narrador **NexusPhantasm** e a NeoGuide.

### B4. O LDI Tactics antigo (`src/pages/games/ArenaTatics/`, `/games/ldi-tatics`, só admin)

Um jogo tático anterior, em grade **quadrada**, no estilo Ragnarok: nível até 99, 6 atributos com custo por faixa, 6 classes com árvore de 42 nós, 20 personagens inventados (fora do elenco do livro), 12 elementais (o manual tem 7), cidade de Marélia como mapa-mundo, cartas, eventos e save no Supabase (`arena_tatica_saves`).

- **Serve de referência:** save na conta, recompensa por luta, mapa-mundo com prédios, eventos de rodada, as 16 personalidades de IA documentadas (`docs/Games/LDITatics/IasLDITatics.md`).
- **Não serve de base:** os 12 elementais, o elenco inventado, nível 99 com milhares de HP e custo por faixa de atributo — tudo isso briga com o manual e com o livro.

### B5. O que os outros jogos do portal já provaram

- **Gangues:** personagens com atributos **autorados** (o jogador não distribui ponto); **todo nível sobe +1 atributo**, sempre; poderes liberam em níveis fixos; XP por inimigo, com bônus por lutar contra quem é mais forte; proteção contra frustração (2 derrotas seguidas deixam a próxima mais fácil); territórios com teto de nível e chefe fixo; save só na conta. O custo escalonado por atributo foi tentado duas vezes e **revertido** depois de jogar: "todo nível tem que subir atributo".
- **Lendas:** prova que uma escolha de identidade (a Veia) com poucas habilidades próprias dá vontade de rejogar.
- **Regras do portal que valem pro Arena:** mobile only, uma mão (ação na metade de baixo, sem pinça), nenhum save local de jogo, ID numérico pra todo conteúdo, nome no i18n dos 3 idiomas.

### B6. O que o sistema de hoje já entrega pro jogo final

| Peça | Estado | Vale pro jogo final? |
|---|---|---|
| Tabuleiro hexagonal, caminho, linha de visão | funciona | sim, é a base |
| Câmera (seguir, olhar, zoom) | funciona | sim, pronta pra mapa grande |
| Regra única do golpe (`engine/regras.js`) | funciona | sim, é onde a regra final entra |
| Turno, iniciativa, Jokenpô | funciona | sim |
| IA com personalidade (decide, não calcula) | funciona, simples | sim, precisa crescer |
| Animações, partículas, sons, efeitos | funciona | sim |
| Poderes (16, só +2/+3) | raso | o formato do dado serve; o efeito tem de ser refeito |
| Ficha livre com 6 atributos | funciona | não, se o jogo usar o manual e o elenco |
| Editor de mapa no caminho do jogador | funciona | vira ferramenta de criar mapa, fora do fluxo do jogador |
| Save no `localStorage` | funciona | não; tem de ir pra conta |
