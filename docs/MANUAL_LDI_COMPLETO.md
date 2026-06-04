# LENDAS DO LDI — Manual Completo do Sistema

*LDI_VERSION: 1.0.60*

---

## 1. VISÃO GERAL

**Lutas de Ilusão (LDI)** é um RPG narrativo digital onde você cria um avatar, explora uma arena de combate virtual e enfrenta inimigos em batalhas táticas por turno. O sistema é baseado em dados (d6), atributos, modos de combate e poderes elementais.

### Estrutura do Jogo
- A história é dividida em **Arcos**
- Cada arco contém **Dias**
- Cada dia oferece **cenas narrativas** com escolhas que afetam a trama
- Combates acontecem quando a narrativa leva a um confronto
- Suas decisões desbloqueiam finais diferentes e afetam seus atributos

---

## 2. CRIAÇÃO DE FICHA

### 2.1 Atributos (5 atributos base)

| Atributo | Sigla | Função Principal | Cálculo Derivado |
|---|---|---|---|
| Potência | **F** | Dano corpo a corpo. Essencial em Mãos Livres e Armado | — |
| Agilidade | **H** | Iniciativa e esquiva. Favorece Armado | Iniciativa = H + d6 |
| Resistência | **R** | HP máximo | **PV = R × 5** |
| Proteção | **A** | Defesa e redução de dano. Favorece Mãos Livres | — |
| Poder Elemental | **PdF** | Dano elemental. Essencial no modo Poder | **PM = PdF × 4** |

### 2.2 Sistema de Pontos

**Regra:** Você começa com **10 pontos base** para distribuir entre os 5 atributos.

**Ganhos:** Desvantagens concedem pontos extras para gastar.

**Gastos:** Vantagens e Perícias consomem pontos.

**Validação:** O botão "ENTRAR NO LDI" só libera quando `pontos_restantes === 0` — você precisa gastar tudo.

### 2.3 NeoGuide (Criação Guiada)

Um assistente passo a passo que coleta suas preferências via perguntas narrativas:
1. Seu nome de lutador
2. Sua arma preferida
3. Seu elemental
4. Distribuição de atributos

As respostas são convertidas em valores da ficha automaticamente.

### 2.4 Criação Manual

Você define cada aspecto diretamente na interface de criação com 4 categorias:

**Atributos:** Distribua 10+ pontos entre F, H, R, A, PdF.

**Vantagens (8 opções):**

| Vantagem | Custo | Efeito |
|---|---|---|
| Reflexos Rápidos | 2 | +1 em rolagens de iniciativa, age primeiro |
| Corpo Adaptado | 2 | -1 em todo dano físico recebido |
| Sangue Frio | 3 | Ignora penalidades de PV crítico, imune a medo |
| Sintonia Elemental | 3 | Ataques de Poder custam 1 PM a menos |
| Mestre de Arma | 2 | +1 de dano com sua arma equipada |
| Leitura de Combate | 2 | +1 FD contra o primeiro ataque de cada turno |
| Regeneração Rápida | 3 | Recupera 1 PV por turno de combate |
| Foco Mental | 2 | +1 FA no modo Poder |

**Desvantagens (8 opções):**

| Desvantagem | Ganho | Penalidade |
|---|---|---|
| Corpo Frágil | +2 | PV máximo reduzido em 2 |
| Medo da Arena | +2 | -1 FA no primeiro turno de cada combate |
| Impulsivo | +2 | Fuga falha em rolagem 1-3 no d6 |
| Sobrecarga Sensorial | +3 | Perde 1 PM no início de cada combate |
| Desconfiado | +1 | Algumas escolhas de diálogo indisponíveis |
| Dreno Energético | +2 | Recupera 1 PM a menos por dia |
| Ataduras Frágeis | +2 | Cura recebida reduzida em 1 |
| Marca Visível | +1 | Inimigos mais agressivos contra você |

**Perícias (8 opções):**

| Perícia | Custo | Efeito |
|---|---|---|
| Perícia: Katana | 1 | +1 FA com Katana no modo Armado |
| Perícia: Lâminas Gêmeas | 1 | +1 dano total com Lâminas Gêmeas |
| Perícia: Lâmina de Corrente | 1 | +1 FD com Lâmina de Corrente |
| Esquiva Ágil | 1 | +1 FD se sua H > H do inimigo |
| Golpe Pesado | 2 | +2 dano em crítico (FA - FD ≥ 5) |
| Postura Defensiva | 1 | +2 FD, -1 FA neste turno |
| Ataque Preciso | 1 | Não atacar em um turno → +2 FA no próximo |
| Canalização | 2 | Ataques no modo Poder ignoram 2 de FD |

### 2.5 Arma e Elemental

**Armas disponíveis:** Katana, Lâminas Gêmeas, Lâmina de Corrente (e outras definidas pela narrativa)

**Elementais disponíveis (7):**
- 🔥 **Fogo** — Dano explosivo, queimaduras
- 💧 **Água** — Cura, controle, gelo
- 🪨 **Terra** — Defesa, atordoamento
- 💨 **Ar** — Velocidade, evasão
- 🌑 **Trevas** — Dreno, medo, absorção
- ✨ **Luz** — Cura, proteção, cegueira
- ⚪ **Neutro** — Equilibrado, versátil

### 2.6 Especializações (5 opções)

| Especialização | Efeito |
|---|---|
| Combate Total | +1 FA e +1 FD, -1 em testes furtivos |
| Técnico de Arena | -1 PM no custo de ações especiais |
| Sombra Digital | Vantagem em ações furtivas, fuga sem penalidade |
| Suporte Tático | +1 PV em descansos, compartilhar PM com aliados |
| Elemental Puro | Modo Poder: gaste 2 PM extras para dobrar dano elemental |

---

## 3. SISTEMA DE COMBATE

### 3.1 Modos de Combate (3 modos)

| Modo | Fórmula FA | Característica |
|---|---|---|
| ✊ **Mãos Livres** | F + H + d6 | Dano moderado, usa A para defesa |
| ⚔️ **Armado** | H + bônus_arma + d6 | Dano alto, iniciativa alta |
| ⚡ **Poder** | PdF + H + d6 | Dano elemental, consome PM |

### 3.2 Fluxo de Combate

```
1. INICIATIVA → H + d6 (quem tiver mais age primeiro)
2. JOGADOR ATACA → FA = fórmula do modo + d6
3. INIMIGO DEFENDE → FD = A + H + d6
4. DANO → FA - FD (mínimo 0)
5. INIMIGO ATACA → mesma lógica invertida
6. REPETE até PV de um lado chegar a 0
```

### 3.3 Cálculos de Combate

**FA (Força de Ataque):**
- Mãos Livres: `F + H + d6`
- Armado: `H + bônus_arma + d6`
- Poder: `PdF + H + d6`

**FD (Força de Defesa):**
- Com Habilidade: `A + H + d6`
- Sem Habilidade (debuff): `A + d6`

**Dano:** `max(0, FA - FD)`

**Iniciativa:** `H + d6`

### 3.4 Morte e Estados

**Perto da Morte:** Quando `PV_atual ≤ R`, a tela pulsa vermelho e um badge pisca no card do jogador.

**Teste de Morte (PV = 0):**

| Rolagem d6 | Resultado |
|---|---|
| 1-2 | Fraco (Debilitado) |
| 3-4 | Inconsciente |
| 5 | À Beira da Morte |
| 6 | Eliminado |

### 3.5 Sistema de Poderes

Você seleciona **até 4 poderes** antes de cada combate baseados no seu elemental. Cada poder custa **PM** (Pontos de Magia).

**Exemplos por Elemental (6 poderes cada, 42 no total):**

| Elemental | Poderes de Destaque |
|---|---|
| Fogo | Chama Rápida (+2 dano), Inferno (dano x2), Escudo de Fogo (+2 FD) |
| Água | Projétil (+2 dano), Cura Leve (+2 PV), Nevoeiro (-2 FA inimigo) |
| Terra | Muralha (+3 FD), Terremoto (dano x2 + atordoamento), Armadura (+2 FD por 2 turnos) |
| Ar | Rajada (+2 dano), Ciclone (dano x2), Passos Leves (+2 H) |
| Trevas | Dreno (dano + cura 1 PV), Névoa Escura (-2 FA inimigo), Absorção (+1 PM) |
| Luz | Raio (+2 dano), Cura Radiante (+3 PV), Explosão (dano x2 + -1 FA inimigo) |
| Neutro | Impacto (+2 dano), Barreira (+2 FD), Sobrecarga (+3 dano próximo ataque) |

### 3.6 System Messages no Combate (WhatsApp-Style)

O log de combate é renderizado como bolhas de chat:
- **Jogador:** bolhas à direita, fundo teal escuro
- **Inimigo:** bolhas à esquerda, fundo vermelho escuro
- **Provocação:** bolhas âmbar itálico
- **Sistema:** centralizado, azul

Pausa dramática: overlay `=== VEZ DO INIMIGO ===` por 1.5s antes do ataque inimigo.

---

## 4. PROGRESSÃO

### 4.1 Experiência (XP)
- **Ganho:** 10 XP por vitória em combate
- **Threshold:** 100 XP para subir de nível
- **Level Up:** Ao atingir 100 XP, abre modal de level up com 1 ponto de atributo para distribuir

### 4.2 Level Up Modal
- Mostra atributos atuais com botões **+** e **-** para redistribuir o ponto
- Título: "PONTOS DE AÇÃO"
- **CONFIRMAR** só libera quando `pontos_restantes === 0`
- Mostra valor antigo → novo (ex: "F: 3 → 4")
- Auto-save no Supabase ao confirmar
- Custo XP progressivo: `10 + n*2` por ponto de atributo (onde n = pontos já gastos)

### 4.3 Arcos Narrativos
- **Arco 1:** Descobrimento — Você é um novo lutador explorando o mundo do LDI
- Cada arco tem múltiplos dias com cenas narrativas
- Escolhas afetam flags, relacionamentos e finais disponíveis

---

## 5. SISTEMA DE CENAS

### 5.1 Estrutura de Cena
Cada cena contém:
- **Texto narrativo** com identidade visual do personagem
- **Escolhas** que afetam a progressão
- **Flags** que controlam desbloqueios futuros
- **Efeitos** que modificam atributos

### 5.2 Tipografia por Personagem

| Personagem | Cor | Fonte | Detecção |
|---|---|---|---|
| NeoGuide | Teal `#00B4D8` | Share Tech Mono | Cenas 1.1–1.1d |
| Kaeda | Vermelho | Rajdhani | Cenas 2.1–2.1d |
| Voz | Roxo | JetBrains Mono | Prefixo `"Voz:"` |
| StormByte_91 | Laranja | Share Tech Mono | Prefixo `"StormByte:"` |
| Sistema | Verde | JetBrains Mono | Prefixo `"Sistema:"` |

### 5.3 Destaque de Cena
Cenas marcadas com `destaque: true` no JSON recebem borda teal pulsante, título maior, e fundo sutil para indicar momentos importantes.

---

## 6. SISTEMA DE PISTAS (CLUES)

- Pistas são coletadas durante a exploração
- Visualizadas no **Caderno de Pistas** (`Clues.jsx`)
- Conexões automáticas entre pistas relacionadas
- Afetam diálogos e desfechos disponíveis

---

## 7. PUZZLES

### 7.1 Sliding Tiles (3×3 / 4×4)
Peças deslizantes para reconstituir uma imagem/documento.

### 7.2 Stealth Grid
Navegar por uma grade sem ser detectado por câmeras.

### 7.3 Decoder (Frequência)
Sintonizar a frequência correta (0-100 MHz) para decifrar uma mensagem.

---

## 8. INTERFACE

### 8.1 Lobby
- Título "LENDAS DO LDI" com efeito typewriter + glitch
- Cards de ficha com badges de atributos, arma, elemental, arco
- Botão CONTINUAR em teal
- Modal "Nova Ficha" com opção A (guiada/NeoGuide) vs B (manual)
- Drawer do Manual do Jogo

### 8.2 Ficha (Sheet)
- Cards visuais com barras de PV (vermelho) e PM (azul)
- Atributos com valores e tooltips ao passar o mouse
- Arma e Elemental com ícones

### 8.3 Manual do Jogo
- 9 seções de regras acessíveis via drawer lateral
- Disponível no Lobby, Game (HUD) e Combat

---

## 9. ARQUITETURA TÉCNICA

### 9.1 Stack
React 19 · Zustand · Framer Motion · Supabase

### 9.2 Estrutura de Arquivos
```
src/pages/LDI/
├── Lobby.jsx              # Hub principal
├── Create.jsx             # Criação de ficha (NeoGuide + Manual)
├── Game.jsx               # Tela de cena narrativa
├── Combat.jsx             # Sistema de combate
├── Sheet.jsx              # Ficha do personagem
├── Clues.jsx              # Caderno de pistas
├── End.jsx                # Tela de fim de jogo
├── store/
│   ├── useGameStore.js    # Estado global (save, sheet, cenas)
│   └── useCombatStore.js  # Estado de combate
├── engine/
│   ├── dice.js            # Rolagem de dados (d6, testAttribute)
│   ├── combat.js          # Cálculos 3D&T (FA, FD, dano, status)
│   ├── flags.js           # Sistema de flags narrativas
│   ├── scenes.js          # Carregamento e filtragem de cenas
│   └── character.js       # PV, PM, XP, Perto da Morte
├── data/
│   ├── characterData.js   # Vantagens, Desvantagens, Perícias, Especializações
│   ├── powersData.js      # 42 poderes em 7 elementais
│   ├── manualData.js      # 9 seções do Manual
│   ├── scenes/            # JSON com todas as cenas
│   └── enemies/           # JSON com fichas de inimigos
└── components/
    ├── Typewriter.jsx     # Efeito de digitação + detecção de personagem
    ├── SceneView.jsx      # Container de cena + transição
    ├── ChoiceList.jsx     # Escolhas com stagger + bloqueio
    ├── CombatView.jsx     # Grid de combate 3 colunas
    ├── DiceRoll.jsx       # Dado animado + onomatopeias
    ├── ManualDrawer.jsx   # Drawer lateral do Manual
    └── ...puzzles
```

### 9.3 Supabase
- **Tabela `character_sheets`:** Fichas persistentes entre runs
- **Tabela `game_saves`:** Estado de cada run vinculado à ficha
- **RLS:** `auth.uid() = user_id`
- **Auto-save:** após criação de ficha, cada escolha, fim de combate, fim de jogo

---

## 10. RESUMO RÁPIDO

| O que | Como |
|---|---|
| Criar personagem | Lobby → Nova Ficha → NeoGuide (guiado) ou Manual |
| Distribuir atributos | 10 pontos base + ganhos de desvantagens − custos de vantagens/perícias |
| Escolher arma | Katana, Lâminas Gêmeas ou Lâmina de Corrente |
| Escolher elemental | Fogo, Água, Terra, Ar, Trevas, Luz ou Neutro |
| Jogar uma cena | Ler o texto → escolher uma opção → ver a consequência |
| Combater | Selecionar modo (Mãos Livres/Armado/Poder) → usar poderes se tiver PM |
| Ganhar XP | 10 XP por vitória em combate |
| Subir de nível | 100 XP → modal de level up com 1 ponto de atributo |
| Salvar | Automático no Supabase ao avançar de cena |
