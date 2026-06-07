# PLANO DE IMPLEMENTAÇÃO — Sistema de Classes e Evolução (Ragnarok-Style)

> Baseado no documento `RefactoryBattleLDITatics.md`, no sistema atual do LDI Tatics (v6.4.0),
> e na árvore de classes do Ragnarök Online (browiki.org/wiki/Classes).

---

## 1. DIAGNÓSTICO — O QUE JÁ EXISTE

### ✅ Sistema de Atributos (já implementado no `combat.js` e `roster.js`)
- **6 atributos:** `forca` (FOR), `velocidade` (AGI), `resistencia` (VIT), `energia` (INT), `precisao` (DES), `tenacidade` (SOR) — já mapeados 1:1 com Ragnarok
- **Cálculo de dano** completo: ATQ atributos + ATQ arma + ATQ equip, DEF leve + DEF pesada, crítico, conjuração
- **Level progression** linear Lv1→Lv99 (`levelProgression.js`)
- **HP/SP** calculados por VIT e INT multiplicativamente
- **Precisão vs Esquiva**, **Esquiva Perfeita**, **CRIT**, **Status Effects**
- **Elementais** (12 tipos) com vantagem/desvantagem

### ✅ Classes Base (já existem em `classes.js`)
| Classe | Papel | Tipo |
|--------|-------|------|
| KARUAK | Tanque | Mãos Livres |
| MORAKI | DPS/Disruptor | Mãos Livres |
| TIVARA | DPS | Armas |
| ZEPHYRA | Suporte/Controle | Poder |
| IGNIS | DPS/Burst | Poder |
| NAMI | Disruptor/Mobilidade | Armas |

### ✅ Evoluções por Nível (já existem em `classes.js`)
- **Nível 40** → 1ª evolução (+2 skills, passiva melhora)
- **Nível 70** → 2ª evolução (+2 skills avançadas)

### ✅ 20 Personagens no Roster (`roster.js`)
- Cada um tem classe, elemental, atributos fixos no nível 99
- Skills desbloqueiam nos níveis 5, 25, 50, 75
- Sistema de level progression linear do nível 1 ao 99

---

## 2. O QUE PRECISA MUDAR — VISÃO GERAL

> ⚠️ **IMPORTANTE:** Isso NÃO cria 40 classes novas. As **6 classes base continuam sendo 6**. O que muda é que cada uma ganha **ramos de evolução** — o personagem escolhe UM caminho entre 2 opções no nível 40, e depois UM entre 2 sub-caminhos no nível 70. É como Pokémon: Squirtle → Wartortle → Blastoide não são 3 Pokémon diferentes, é uma linha evolutiva.

O usuário quer implementar o **sistema de ramificação de classes do Ragnarök Online**:

```
Classe Base → Ramo A ou B (Nv40) → Sub-ramo A1/A2 ou B1/B2 (Nv70)
```

**No LDI Tatics temos 6 classes base.** Cada uma vira uma árvore completa — **mas ainda é UMA classe por personagem, que apenas evolui de nome/skills/passiva:**

```
KARUAK (Tanque)     → [Ramo A: Muralha]    → [Evolução A1] ou [Evolução A2]
                      [Ramo B: Avalanche]   → [Evolução B1] ou [Evolução B2]

MORAKI (DPS/Disrup) → [Ramo A: Fantasma]   → ...
                      [Ramo B: Tufão]       → ...

TIVARA (DPS)        → [Ramo A: Precisão]   → ...
                      [Ramo B: Arco Ancest.]→ ...

ZEPHYRA (Sup/Contr) → [Ramo A: Sirena]     → ...
                      [Ramo B: Tsunami]     → ...

IGNIS (DPS/Burst)   → [Ramo A: Labareda]   → ...
                      [Ramo B: Sol Negro]   → ...

NAMI (Disrup/Mob)   → [Ramo A: Sombra]     → ...
                      [Ramo B: Crepúsculo]  → ...
```

---

## 3. ARQUITETURA PROPOSTA

### 3.1 Estrutura de Arquivos

```
src/pages/ArenaTatics/
├── data/
│   ├── classes.js           ← REFATORAR: separar em arquivo de árvore
│   ├── classTree.js         ← NOVO: árvore de classes completa (Ragnarok-style)
│   ├── roster.js            ← MANTER: 20 personagens com classeId
│   ├── levelProgression.js  ← ADAPTAR: parar no nível 99, trigger evolutivos
│   ├── combat.js            ← MANTER: sistema de batalha (já completo)
│   ├── equipment.js         ← MANTER
│   └── ...
├── screens/
│   ├── ClasseSelect.jsx     ← REFATORAR: mostrar árvore de evolução
│   ├── EvolutionScreen.jsx  ← NOVO: tela de evolução de classe
│   └── ...
├── store/
│   └── useArenaTaticsStore.js ← ADAPTAR: adicionar classeAtual, classeTree
```

### 3.2 Nova Estrutura de Dados — `classTree.js`

Cada classe base vira uma árvore com 3 níveis (equivalente a Classe 1 → Classe 2 → Classe 3 do Ragnarok):

```javascript
export const CLASS_TREE = {
  karuak: {
    id: 'karuak',
    nome: 'KARUAK',
    // Dados atuais...
    
    // NÍVEL 1: Classe base (nível 1-39)
    // skills_base já existe
    
    // NÍVEL 2: Duas opções de evolução (nível 40+)
    ramos: {
      muralha: {
        nome: 'KARUAK — MURALHA',
        requisito: { nivel: 40, classe: 'karuak' },
        // O que já existe como evolucoes.nivel40
      },
      avalanche: {
        nome: 'KARUAK — AVALANCHE',
        requisito: { nivel: 40, classe: 'karuak' },
        // Mover o que existe em evolucoes.nivel70 para ser um ramo alternativo
      }
    },
    
    // NÍVEL 3: Cada ramo tem 2 sub-ramos (nível 70+)
    // NOVO — não existe ainda
    subRamos: {
      'muralha': {
        bastiao: {
          nome: 'KARUAK — BASTIÃO',
          requisito: { nivel: 70, classe: 'muralha' },
          passiva: { nome: 'Muralha Viva', desc: 'Aliados atrás recebem -50% dano.' },
          skills: [ /* 2 novas */ ]
        },
        fortaleza: {
          nome: 'KARUAK — FORTALEZA',
          requisito: { nivel: 70, classe: 'muralha' },
          passiva: { nome: 'Campo de Proteção', desc: 'Regenera 5% HP por turno em área 2×2.' },
          skills: [ /* 2 novas */ ]
        }
      },
      'avalanche': {
        colosso: {
          nome: 'KARUAK — COLOSSO',
          requisito: { nivel: 70, classe: 'avalanche' },
          // ...
        },
        cataclisma: {
          nome: 'KARUAK — CATACLISMA',
          requisito: { nivel: 70, classe: 'avalanche' },
          // ...
        }
      }
    }
  },
  // ... outros 5 personagens
}
```

### 3.3 Mapeamento Ragnarok → LDI Tatics

| Classe Ragnarok | Classe LDI Tatics | Ramo A (Nv40) | Ramo B (Nv40) |
|----------------|-------------------|---------------|---------------|
| Espadachim → Cavaleiro | **KARUAK** | MURALHA | AVALANCHE |
| Gatuno → Mercenário | **MORAKI** | FANTASMA | TUFÃO |
| Arqueiro → Caçador | **TIVARA** | PRECISÃO | ARCO ANCESTRAL |
| Mago → Bruxo | **ZEPHYRA** | SIRENA | TSUNAMI |
| Mago → Sábio | **IGNIS** | LABAREDA | SOL NEGRO |
| Gatuno → Arruaceiro | **NAMI** | SOMBRA | CREPÚSCULO |

---

## 4. SISTEMA DE NÍVEIS E EVOLUÇÃO

### 4.1 Marcos de Evolução (baseado no Ragnarok)

| Nível do Personagem | Evento |
|---------------------|--------|
| **1–39** | Classe Base (KARUAK, MORAKI, etc.) |
| **40** | **1ª Evolução** — Escolhe entre 2 ramos (ex: MURALHA ou AVALANCHE) |
| **40–69** | Classe evoluída (skills do ramo escolhido) |
| **70** | **2ª Evolução** — Escolhe entre 2 sub-ramos (ex: BASTIÃO ou FORTALEZA) |
| **70–99** | Classe final (skills da escolha final) |
| **99 → ???** | **Transclasse** (futuro — Renascimento estilo Ragnarok) |

### 4.2 Fluxo de Tela

```
[LEVEL UP! 40]
     ↓
[EvolutionScreen] → "KARUAK atingiu o nível 40!"
                  → "Escolha seu caminho:"
                  → [MURALHA]  ou  [AVALANCHE]
                  → Preview dos atributos e skills de cada
     ↓
[Confirmação] → "Tem certeza? Esta escolha é permanente."
     ↓
[Personagem atualizado] → Nova passiva, novas skills, novo nome
```

### 4.3 O Que Muda na Evolução

| O quê | Muda? |
|-------|-------|
| Nome da classe | ✅ Sim (ex: "KARUAK — MURALHA") |
| Sprite/ícone | ✅ Sim (novo visual da carta) |
| Passiva | ✅ Sim (melhora ou troca) |
| Skills | ✅ Sim (+2 novas, mantém as anteriores) |
| Atributos base | ✅ Pequeno bônus (+2 a +5 em stats chave) |
| HP/SP base | ✅ Bônus percentual (+10% a +20%) |
| Atributos primários (FOR, AGI, etc.) | ❌ Mantém os points do jogador |

### 4.4 Transclasse (Renascimento — Fase 2 futura)

Sistema de **Renascimento** igual ao Ragnarok:
- Personagem atinge nível 99
- Pode "renascer" como **Aprendiz Transcendental**
- Volta ao nível 1 com bônus:
  - +25% HP e SP base
  - Pontos de atributo extras
  - Habilidades passivas do "karma" (classe anterior)
- Sobe novamente pelos níveis, podendo reescolher ramos

---

## 5. IMPACTO NOS 20 PERSONAGENS DO ROSTER

### 5.1 Situação Atual

Cada personagem no `roster.js` tem:
```javascript
{ id: 1, nome: 'Ferro Velho', classe: 'karuak', elemental: 'terra',
  atributos: { forca: 80, velocidade: 20, ... },
  skills: [skill1, skill2]  // só 2 skills base (nível 5 e 25)
}
```

Atualmente a classe é uma string simples. Skills 3 e 4 vêm de `SKILLS_LV50` e `SKILLS_LV75`.

### 5.2 O Que Precisa Mudar

Cada personagem precisa de um **caminho de evolução padrão** (definido no roteiro do personagem ou escolhido pelo jogador):

```javascript
{ id: 1, nome: 'Ferro Velho', classe: 'karuak',
  caminhoEvolutivo: {
    nivel40: 'muralha',   // ramo escolhido
    nivel70: 'bastiao',   // sub-ramo escolhido
  },
  // OU null se ainda não escolheu
  // ... resto igual
}
```

### 5.3 Personagens vs Classes

Nem todo personagem precisa seguir exatamente a árvore. Podemos ter:

| Personagem | Classe Base | Ramo Lv40 Sugerido | Sub-ramo Lv70 Sugerido |
|-----------|-------------|-------------------|----------------------|
| Ferro Velho | KARUAK | MURALHA | BASTIÃO |
| Montanha Viva | KARUAK | AVALANCHE | COLOSSO |
| Relâmpago Branco | MORAKI | FANTASMA | ESPECTRO |
| Sete Cicatrizes | MORAKI | TUFÃO | CICLONE |
| Língua de Cobra | MORAKI | FANTASMA | SOMBRA |
| Espiral | TIVARA | PRECISÃO | PERFURAÇÃO |
| Sombra de Gelo | TIVARA | PRECISÃO | MIRAGEM |
| Lobo de Wendor | TIVARA | ARCO ANCESTRAL | ARCO SAGRADO |
| Tocha Sagrada | TIVARA | ARCO ANCESTRAL | ARCO NEGRO |
| Dente de Sabre | KARUAK | AVALANCHE | CATACLISMA |
| Cinza | KARUAK | MURALHA | FORTALEZA |
| Raiz de Ferro | KARUAK | MURALHA | BASTIÃO |
| Doutor Ferrugem | KARUAK | AVALANCHE | COLOSSO |
| Vidro Partido | MORAKI | FANTASMA | ESPECTRO |
| Névoa da Manhã | MORAKI | TUFÃO | VÓRTICE |
| Corvo de Draymoor | MORAKI | FANTASMA | SOMBRA |
| Espinho Negro | MORAKI | TUFÃO | CICLONE |
| Mãos de Osso | TIVARA | PRECISÃO | MIRAGEM |
| Rugido | TIVARA | ARCO ANCESTRAL | PERFURAÇÃO |
| Última Chama | TIVARA | ARCO ANCESTRAL | ARCO NEGRO |

### 5.4 E as classes ZEPHYRA, IGNIS e NAMI?

Elas **não têm personagens no roster atual** — são classes jogáveis que o usuário cria na tela `ClasseSelect`. O sistema de evolução (`classTree.js`) vai servir tanto para:

1. **Personagens do roster** (que têm caminho pré-definido ou escolha do jogador)
2. **Personagens criados** (que o jogador monta do zero e evolui escolhendo ramos)

---

## 6. ETAPAS DE IMPLEMENTAÇÃO

### Fase 1 — Fundação (arquivos de dados)

| # | Tarefa | Arquivos |
|---|--------|----------|
| 1.1 | Criar `classTree.js` com a árvore completa das 6 classes | `src/pages/ArenaTatics/data/classTree.js` |
| 1.2 | Mover dados de `classes.js` para `classTree.js` sem quebrar nada | `classes.js` → `classTree.js` |
| 1.3 | Adicionar sub-ramos de nível 70 para cada ramo de nível 40 | `classTree.js` |
| 1.4 | Adicionar campo `caminhoEvolutivo` no roster | `roster.js` |
| 1.5 | Adaptar `levelProgression.js` para incluir bônus de evolução | `levelProgression.js` |

### Fase 2 — Mecânica de Evolução

| # | Tarefa | Arquivos |
|---|--------|----------|
| 2.1 | Função `getEvolucaoAtual(personagem, nivel)` que retorna a classe atual considerando ramos | `classTree.js` |
| 2.2 | Função `aplicaBonusEvolucao(personagem, ramo)` que aplica bônus de atributos/HP/SP | `levelProgression.js` |
| 2.3 | Função `getSkillsEvolutivas(personagem, nivel, ramo)` que combina skills base + skills do ramo | `levelProgression.js` |
| 2.4 | Store: adicionar `evoluirPersonagem(rosterId, ramo, subRamo)` | `useArenaTaticsStore.js` |

### Fase 3 — Interface de Evolução

| # | Tarefa | Arquivos |
|---|--------|----------|
| 3.1 | Criar `EvolutionScreen.jsx` — tela de escolha de evolução | `screens/EvolutionScreen.jsx` |
| 3.2 | Adicionar rota/modal para EvolutionScreen no fluxo | `ArenaTaticsRoute.jsx` |
| 3.3 | Mostrar preview de skills e atributos antes de confirmar | `EvolutionScreen.jsx` |
| 3.4 | Animação de evolução (efeito visual) | `EvolutionScreen.jsx`, `ArenaTatics.css` |

### Fase 4 — Integração com o Combate

| # | Tarefa | Arquivos |
|---|--------|----------|
| 4.1 | Ao construir personagem via `construirPersonagemNivelado`, considerar o ramo evolutivo | `levelProgression.js` |
| 4.2 | Exibir nome da classe evoluída no `StatusBar` | `components/StatusBar.jsx` |
| 4.3 | Exibir ícone/sprite diferente por ramo | `components/GridCanvas.jsx` |
| 4.4 | Adaptar `construirPersonagem` em `roster.js` para suportar níveis abaixo de 99 com evolução | `roster.js` |

### Fase 5 — Transclasse (futuro)

| # | Tarefa | Arquivos |
|---|--------|----------|
| 5.1 | Adicionar conceito de "renascimento" ao atingir nível 99 | `levelProgression.js` |
| 5.2 | Tela de renascimento | `screens/RenascimentoScreen.jsx` |
| 5.3 | Bônus de Transclasse (+25% HP/SP, pontos extras) | `levelProgression.js` |

---

## 7. DETALHAMENTO — classTree.js

### 7.1 Estrutura Base

```javascript
export const CLASS_TREE = {
  karuak: {
    id: 'karuak',
    nome: 'KARUAK',
    nome_en: 'KARUAK',
    tipo: 'Mãos Livres',
    papel: 'Tanque',
    papel_en: 'Tank',
    desc: 'Guerreiro Bruto...',
    desc_en: 'Brute Warrior...',
    
    // Stats base da classe (nível 1)
    atributos_base: { forca: 14, velocidade: 8, resistencia: 16, energia: 6, precisao: 7, tenacidade: 12 },
    
    // HP/SP base multiplier (por nível)
    hpPorNivel: 12,  // 12 HP por nível
    spPorNivel: 4,   // 4 SP por nível
    
    // Passiva base
    passiva: { ... },
    
    // Skills base (nível 1-39, sempre disponíveis)
    skills_base: [ ... ],
    
    // Sprite/ícone base
    sprite: { ... },
    
    // RAMOS DE EVOLUÇÃO (nível 40)
    ramos: {
      muralha: {
        id: 'muralha',
        nome: 'KARUAK — MURALHA',
        desc: 'Escudo de pedra envolve o corpo...',
        
        // Bônus ao evoluir
        bonusAtributos: { resistencia: +3, forca: +2 },
        bonusHp: 0.20,  // +20% HP
        bonusSp: 0.10,  // +10% SP
        
        passiva: { ... },
        skills_novas: [ ... ],
        sprite: { ... },
        
        // SUB-RAMOS (nível 70)
        subRamos: {
          bastiao: {
            id: 'bastiao',
            nome: 'KARUAK — BASTIÃO',
            desc: 'A muralha que protege todos...',
            bonusAtributos: { resistencia: +3, tenacidade: +2 },
            bonusHp: 0.15,
            bonusSp: 0.10,
            passiva: { ... },
            skills_novas: [ ... ],
            sprite: { ... },
          },
          fortaleza: {
            id: 'fortaleza',
            nome: 'KARUAK — FORTALEZA',
            desc: 'Ninguém passa...',
            bonusAtributos: { resistencia: +5 },
            bonusHp: 0.25,
            bonusSp: 0.05,
            passiva: { ... },
            skills_novas: [ ... ],
            sprite: { ... },
          }
        }
      },
      avalanche: {
        id: 'avalanche',
        nome: 'KARUAK — AVALANCHE',
        // ...similar
        subRamos: {
          colosso: { ... },
          cataclisma: { ... }
        }
      }
    }
  }
}
```

### 7.2 Quantidade de Skills por Estágio

| Estágio | Skills Base | Skills do Ramo | Total |
|---------|------------|----------------|-------|
| Base (Lv1-39) | 3 | 0 | 3 |
| 1ª Evolução (Lv40-69) | 3 | 2 | 5 |
| 2ª Evolução (Lv70-99) | 3 | 4 | 7 |

### 7.3 Funções Principais

```javascript
// Retorna o estágio atual de evolução
export function getEstagioEvolucao(classeId, ramoId, subRamoId) { ... }

// Retorna todos os ramos disponíveis para uma classe em dado nível
export function getRamosDisponiveis(classeId, nivel) { ... }

// Retorna skills completas considerando ramo
export function getSkillsCompletas(classeId, ramoId, subRamoId) { ... }

// Aplica bônus de evolução nos atributos
export function aplicarBonusEvolucao(atributos, classeId, ramoId, subRamoId) { ... }
```

---

## 8. REGRAS DE BALANCEAMENTO

### 8.1 Bônus de Atributos por Evolução (cumulativo)

| Evolução | Bônus total nos atributos primários |
|----------|-------------------------------------|
| 1ª (Lv40) | ~+5 pontos distribuídos |
| 2ª (Lv70) | ~+5 pontos adicionais |

**Cada personagem de nível 99 continua com os mesmos ~450 pontos de atributo** — a evolução apenas redistribui alguns pontos para reforçar o papel do ramo, não aumenta o total significativamente.

### 8.2 HP/SP Bônus

| Evolução | HP Bônus | SP Bônus |
|----------|----------|----------|
| 1ª (Lv40) | +15-20% | +10-15% |
| 2ª (Lv70) | +15-25% | +10-15% |

**Total cumulativo no Lv99:** ~30-50% de HP bônus e ~20-30% de SP bônus sobre a classe base.

### 8.3 Passivas Evolutivas

Cada ramo/ sub-ramo tem uma **passiva única** que define o estilo de jogo:

| Classe | Ramo | Passiva Exemplo |
|--------|------|----------------|
| KARUAK → Muralha | Bastião | "Aliados atrás de KARUAK recebem -30% dano" |
| KARUAK → Muralha | Fortaleza | "KARUAK regenera 8% HP por turno em área 2×2" |
| KARUAK → Avalanche | Colosso | "Skills de dano causam +20% se KARUAK não moveu no turno" |
| KARUAK → Avalanche | Cataclisma | "Ao matar um inimigo, causa 50% do dano em área 2×2" |
| MORAKI → Fantasma | Espectro | "Passos do Vento: pode mover 2 casas extras (antes era 1)" |
| MORAKI → Fantasma | Sombra | "Ao usar Teleporte, deixa uma ilusão que pode ser atacada" |
| MORAKI → Tufão | Ciclone | "Rajada Ciclônica tem área +1 e empurra +1 casa" |
| MORAKI → Tufão | Vórtice | "Inimigos na área do Olho do Tufão têm -2 MOV por 1 turno" |

---

## 9. INTEGRAÇÃO COM O SISTEMA ATUAL

### 9.1 O Que NÃO Precisa Mudar

- `combat.js` — sistema de resolução de dano (já completo)
- `equipment.js` — sistema de equipamentos
- `elementais.js` — sistema elemental
- `cosmeticos.js` — cores e aparência
- `juice.js` — efeitos visuais
- `GridCanvas.jsx` — renderização do grid
- `ActionMenu.jsx` — menu de ações

### 9.2 O Que Precisa de Adaptação Leve

| Arquivo | Mudança |
|---------|---------|
| `roster.js` | Adicionar `caminhoEvolutivo` opcional em cada personagem |
| `levelProgression.js` | Funções `getSkillsNoNivel` e `construirPersonagemNivelado` precisam aceitar ramo |
| `Batalha.jsx` | `getSkills(p)` deve considerar ramo evolutivo |
| `StatusBar.jsx` | Exibir nome da classe evoluída |
| `ClasseSelect.jsx` | Mostrar árvore de evolução (não só classe base) |
| `useArenaTaticsStore.js` | Novo campo `evolucoesMap` + função `evoluirPersonagem` |
| A tabela `arena_tatica_saves` no Supabase | Adicionar coluna `evolucoes_map` |

---

## 10. TABELA DE PRIORIDADE

| Prioridade | Tarefa | Esforço | Impacto |
|-----------|--------|---------|---------|
| 🔴 **P0** | Criar `classTree.js` com as 6 árvores (classes + ramos nv40 + sub-ramos nv70) | 1 dia | Mecânica |
| 🔴 **P0** | Adaptar `levelProgression.js` para suportar ramos | 1 dia | Mecânica |
| 🔴 **P0** | Adaptar `roster.js` com campo `caminhoEvolutivo` | 0.5 dia | Dados |
| 🟡 **P1** | Criar `EvolutionScreen.jsx` — tela de escolha de evolução | 1 dia | Interface |
| 🟡 **P1** | Adicionar rota/modal para EvolutionScreen no fluxo | 0.5 dia | Interface |
| 🟢 **P2** | Adaptar `ClasseSelect.jsx` para mostrar preview da árvore | 0.5 dia | UI |
| 🟢 **P2** | Atualizar `StatusBar` para exibir classe evoluída | 0.5 dia | UI |
| 🟢 **P2** | Animação visual de evolução | 1 dia | Visual |
| 🔵 **P3** | Sistema de Transclasse (Renascimento) | 3 dias | Futuro |

---

## 11. PERGUNTAS EM ABERTO PARA DECIDIR

1. **Escolha automática vs manual?** Personagens do roster (Ferro Velho etc.) devem ter um caminho de evolução pré-definido pela lore ou o jogador escolhe na hora?

2. **Custo da evolução?** Precisa de algum item/requisito (ex: derrotar um chefe, pagar fichas) ou é automática ao atingir o nível?

3. **Personagens ZEPHYRA, IGNIS e NAMI?** Elas não têm representantes no roster de 20. Vão ganhar personagens próprios ou ficam só como classe "criada pelo jogador"?

4. **Visual das cartas?** Cada evolução teria um sprite/desenho diferente? O usuário mencionou que "só muda o desenho da carta" — precisamos definir se isso é prioridade agora ou depois.

5. **Quantos níveis de evolução de cada classe?** O Ragnarok tem até Classe 4 (ex: Cavaleiro Draconiano). Vamos parar na 3ª evolução (Lv70) ou teremos 4ª (Lv99)?

---

## 12. RESUMO — O QUE É O SISTEMA NOVO

```
ANTES:
  Classe única (KARUAK) → Evolução fixa nivel40 → Evolução fixa nivel70
  (6 classes base, cada uma com 1 caminho linear)

DEPOIS:
  Classe base (KARUAK) → 2 ramos no nivel40 → 2 sub-ramos cada no nivel70
  (6 classes base, cada uma com 4 caminhos possíveis)

  COM TRANSCLASSE (futuro):
  Cada classe base teria 8 caminhos (4 × 2 pelo renascimento)
```

**Traduzindo em números:**

| Conceito | Valor |
|----------|-------|
| Classes base (já existem) | **6** (KARUAK, MORAKI, etc.) |
| Ramos de nível 40 | **2 por classe** (ex: MURALHA ou AVALANCHE) |
| Sub-ramos de nível 70 | **2 por ramo** (ex: BASTIÃO ou FORTALEZA) |
| **Caminhos possíveis por classe** | **4** (2 ramos × 2 sub-ramos) |
| **Caminhos possíveis no total** | **24** (6 classes × 4 caminhos) |

>Cada classe SEMPRE será UMA das 6 classes base. O nome "KARUAK — MURALHA — BASTIÃO" é só o nome composto que indica a posição na árvore evolutiva. Isso NÃO cria 40 classes novas — cria **6 árvores com 4 finais cada**.

**Nas cartas:**
- O que muda por evolução é o **desenho da carta** (sprite/ícone diferente)
- As **skills** mudam (ganha novas do ramo)
- A **passiva** muda
- Os atributos primários (FOR, AGI, etc.) continuam os mesmos que o jogador investiu — a evolução dá pequenos bônus

**Comparação com Pokémon:** KARUAK é como Charmander. Escolher MURALHA ou AVALANCHE é Charmeleon. Escolher BASTIÃO ou FORTALEZA é Charizard. Ainda é a mesma linha evolutiva, não 4 Pokémon diferentes.

---

> **Próximo passo:** Quando você autorizar, começo pela Fase 1 — criar `classTree.js` com toda a árvore de classes, migrar os dados de `classes.js`, e preparar o terreno para o resto. A prioridade é não quebrar nada do que já existe.
