# LDI Arena — GDD

Documento de design do jogo. Cada regra é marcada como **[CANON]** (já existe no livro, na mitologia ou nos dados do site e não muda) ou **[PROPOSTA]** (decisão de jogo, ainda a aprovar).

O que o protótipo tem hoje, o material do universo e o plano de construção estão em `docs/Games/LDIArena/LDI_ARENA.md`.

Fontes do canon:

- `src/data/mundo-pt.json` → `elementais` (a página do universo no site).
- `docs/LDI/MITOLOGIA.md` §3 (deuses, Neutro, o oitavo, secundários, elementais fora do sistema).
- O livro: capítulos 14 e 17 (`src/data/historias/lutas-de-ilusao/`) e o RETCON (`DOCS/LLutas de Ilusão - Retcon.md`).

---

## 1. Sistema elemental

### 1.1 O que o canon diz

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

### 1.2 Personagens

O jogo não usa personagens oficiais do universo neste momento. Os lutadores têm nomes genéricos: **Jogador 1, Jogador 2, Jogador 3** e **Inimigo 1, Inimigo 2, Inimigo 3**. O elemental de cada um é escolhido na montagem do time.

### 1.2.1 Tamanho dos times

- **[DECIDIDO]** Do lado do jogador: **até 4** lutadores.
- **[DECIDIDO]** Do lado inimigo: **até 10**. Quantidade e força andam em sentido contrário:
  - **8 a 10 inimigos** só quando são **fracos** — capangas que caem com um golpe. É quantidade, não qualidade.
  - **Até 8 inimigos fortes** só no **fim do jogo**.
  - No começo e no meio do jogo, inimigo forte vem em grupo pequeno.
- No protótipo, o limite está em `engine/regrasFicha.js` (`MAX_TIME_JOGADOR`, `MAX_TIME_INIMIGO`). A força de cada inimigo ainda é livre na montagem; a regra de "muitos = fracos" entra quando existirem as lutas prontas da campanha.

### 1.3 A tabela de compatibilidade (a da Yohu) — [PROPOSTA]

O canon garante duas coisas que a tabela tem de respeitar:

1. Nenhum elemental é mais forte que outro.
2. O Neutro não tem picos nem fraquezas.

Por isso, a proposta é uma tabela **de choque**, não de vantagem:

- Os 6 primários formam **3 pares opostos**: **Fogo ↔ Água**, **Terra ↔ Ar**, **Luz ↔ Trevas**. Na mitologia são irmãos de natureza contrária.
- **Choque:** golpe elemental contra o elemental oposto causa **dano extra** (proposta: +2 na FA). Vale **nos dois sentidos**: o Fogo bate mais forte na Água e a Água bate mais forte no Fogo. Ninguém ganha a luta só pelo elemento, mas a luta entre opostos é mais curta e mais perigosa pros dois.
- **Mesmo elemento:** golpe contra o próprio elemento (ou contra um irmão de mesmo primário) causa **dano reduzido** (proposta: −2 na FA). O elemento não fere o próprio sangue.
- **Secundário herda o primário:** Eletricidade choca com Trevas e seus secundários, porque é neta da Luz. É assim que o secundário "tem mais opções de combinação": tem o choque do pai **e** o efeito próprio (§1.4).
- **Neutro:** não choca com ninguém e ninguém choca com ele. Sem extra e sem redução, nunca.
- **Fora do sistema:** não estão na tabela da Yohu. Cada um tem uma regra própria de chefe (§1.5).
- **Golpe sem elemento** (mãos livres e arma no modo normal) não passa pela tabela.

Alternativa que fica registrada, mas **não recomendada**: um ciclo de vantagens (Fogo vence Ar, Ar vence Terra…). Cria contra-ataque garantido, e o canon diz que nenhum elemental é mais forte.

### 1.4 O que cada elemental faz no tabuleiro — [PROPOSTA]

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

### 1.5 Elementais fora do sistema — [PROPOSTA]

São regras de chefe e de evento de história. O jogador não escolhe nenhum deles.

| Elemental | Quem | Regra no jogo |
|---|---|---|
| Primordial | — | **Absorve** poder elemental recebido (o canon das chamas negras). Evento raro de história, nunca um poder comum. |
| Escuridão Corrompida | — | Drena como Trevas, mas não sofre choque da Luz. É a "Trevas estragada": a tabela não pega nele. |
| Vazio | — | Abre casas de **gosma preta** no chão da arena (o Caos escorrendo), que ferem quem pisa. |
| Digital | — | Elementais do sistema: aparecem como **regras da arena** (treino, narrador), não como lutadores comuns. |
| Todos os primários | — | Troca de primário a cada turno. Chefe especial. |

### 1.6 Regras que ligam o elemental ao resto do jogo

- **[CANON]** **3 modos de luta:** mãos livres, arma e poder. Só o **modo poder** usa o elemental.
- **[CANON]** **Máximo de 4 poderes ativos** por luta. Um poder novo pode surgir no meio da luta e entra no lugar do último.
- **[CANON]** Poderes têm **3 durações**: instantâneo (barato), médio e longo (forte e caro). Carregar deixa o lutador exposto, e tomar golpe faz perder a carga.
- **[CANON]** Arma no **modo Xamã** gasta mais energia e pode **fundir** com o elemental (corte da arma + o poder do elemento).
- **[PROPOSTA]** Os 4 poderes de cada lutador saem do seu elemental: 2 do primário e 2 próprios. No caso do secundário, 2 do primário pai e 2 do secundário.
- **[PROPOSTA]** As **arenas** têm afinidade elemental: Vulcânica favorece Fogo e Lava; Aquática, Água; Neve, Gelo; Ruínas, Terra. Lutar na arena do seu elemento dá um bônus pequeno, como no "Especialista de Arena" do manual.

---

## 2. Decisões em aberto (sistema elemental)

1. A tabela da Yohu é de **choque** (opostos se ferem mais, nos dois sentidos)? Ou outra forma? (§1.3)
2. Os pares opostos são **Fogo ↔ Água, Terra ↔ Ar, Luz ↔ Trevas**?
3. O efeito de cada secundário (§1.4) está no espírito do elemento? Algum que não combina?
4. O Neutro fica sem efeito próprio, só com a estabilidade?
