# JACK DREAM BEER — Game Design Document v2.1.0

*Documento completo do estado atual do jogo, fluxo de gameplay e arquitetura*

---

## 1. CONCEITO

**Título:** Jack Dream Beer  
**Gênero:** Idle Game Narrativo Noir  
**Tema:** Sonho lúcido em uma realidade paralela de Marelia  
**Stack:** React 19 · Zustand · Framer Motion · Supabase · localStorage  

Jack dorme e entra em um sonho onde Marelia é noir, silenciosa e repleta de perigo. No sonho, pessoas reais assumem papéis diferentes: Kim é garçom do Boteco do Jazz, Nina está na delegacia, Osvaldo é ferreiro, o Pajé Yawanari vende itens misteriosos em uma barraca. O jogador acumula cervejas como recurso principal, explora dungeons automáticas com dados, compra equipamentos e avança por três cidades em um mundo onírico onde cada decisão revela mais sobre o que está realmente acontecendo com Jack.

---

## 2. RECURSOS

| Recurso | Ícone | Como obter | Para que serve |
|---|---|---|---|
| Cervejas 🍺 | `cervejas` | +1/s passivo + drops de dungeon | Comprar itens, pagar missões |
| Notas 💵 | `notas` | Drops de dungeon (ônibus, rua, etc.) | Comprar itens premium |
| Fragmentos 💎 | `fragmentos` | Drops em dungeons de Auranis/Karnazar | Comprar itens no Mercado Negro e Tira |
| HP ❤️ | `hpAtual/hpMax` | Base 20, aumentado por armaduras | Sobreviver em dungeons |
| Nível | `nivel` | Framework (uso futuro) | Desbloquear cidades, scaling |
| XP | `xp` | Framework (uso futuro) | Progressão de nível |

---

## 3. SISTEMAS ATIVOS

### 3.1 Sistema Dia/Noite
- Botão 🌙/☀️ na StatusBar alterna entre DIA e NOITE
- Cooldown de 30 segundos entre trocas
- Doca Abandonada (dungeon) só aparece à noite
- NPCs têm saudações diferentes por período:
  - Kim de noite: *"última rodada. o que vai ser?"*
  - Lara de dia: *"fechado. volte quando escurecer."*

### 3.2 Sistema Primordial
- Medidor de 0 a 10, invisível até obter flag `KRONOS_VIU`
- Cada dungeon completada adiciona +1 ao medidor
- Ao atingir 10: na próxima dungeon, Jack transforma (🔥 emoji), dobra o dano e zera o medidor
- Essencial para vencer a Ilha Privada (Kronos 100 HP)

### 3.3 Sistema de Aliados
- Antes de entrar em dungeon, pode chamar um aliado (custa notas)
- Kim (20 notas): reduz dano recebido em 1
- Nina (15 notas): aumenta drop de notas em 50%
- Shuntaro (30 notas): aumenta dano em 2 (requer `KRONOS_VIU`)

### 3.4 Sistema de Slots
- 3 save slots independentes (`jack_beer_slot_1/2/3`)
- Main Menu ao entrar: escolher slot ou novo jogo
- F5 retorna ao Main Menu
- Cada slot armazena progresso completo

### 3.5 Sistema de Dicas (Professor Máquina)
- Após 20s parado na tela de cidade, toast com 👓 aparece
- 10 dicas contextuais baseadas no progresso
- Cooldown de 2 minutos entre dicas
- Cards do próximo objetivo brilham com animação pulsante dourada

---

## 4. MUNDO — 3 CIDADES

### 4.1 MARELIA (Arco I)
**Skyline:** 🏢🏠🏚️🏪🏛️🌙  
**Frase:** "a cidade nunca dorme. ninguém dorme."

| Local | Ícone | NPC | Desbloqueio |
|---|---|---|---|
| Barraca do Pajé | ⛺ | Pajé Yawanari | Início |
| Boteco do Jazz | 🍺 | Kim | `KIM_LIBERADO` (pós-onibus+rua) |
| Delegacia | ⭐ | Nina | `NINA_LIBERADO` (pós-rua) |
| Oficina | 🔧 | Osvaldo | `OSVALDO_LIBERADO` (pós-onibus+rua) |
| Risca a Faca | 💃 | Lara | `RISCA_FACA_LIBERADO` (pós-onibus+rua) |
| Cortiço | 🏠 | — | `CORTICO_LIBERADO` (compra armadura couro) |
| Terminal | 📟 | Analista (voz) | Pós-onibus+rua |
| Escadaria | 🪜 | — | 60s idle na Vila (some após visita) |

### 4.2 AURANIS (Arco II)
**Desbloqueio:** Nível 8 + `TERMINAL_OUVIU` + completar Porto Velho + Doca + Torre  
**Skyline:** 🏗️🚢🌫️🏭⚓🌊  
**Frase:** "porto de auranis. a névoa não levanta."

| Local | Ícone | NPC | Desbloqueio |
|---|---|---|---|
| Porto Velho | ⚓ | Dungeon | Início de Auranis |
| Pensão da Rua 7 | 🏚️ | Karim | Início de Auranis |
| Mercado Negro | 🕶️ | Operativo | Início de Auranis |
| Doca Abandonada | 🌑 | Dungeon | `KARIM_CONFIA` + NOITE |
| Torre Kronos | 🗼 | Dungeon (fuga) | `DOCA_COMPLETA` |
| Terminal | 📟 | Analista | Início de Auranis |

### 4.3 KARNAZAR (Arco III)
**Desbloqueio:** Nível 15 + `KRONOS_VIU` + `DOCA_COMPLETA`  
**Skyline:** 🏔️❄️🏯🌨️⛩️🌌  
**Frase:** "karnazar. o frio não é do clima."

| Local | Ícone | NPC | Desbloqueio |
|---|---|---|---|
| Dojô de Viran | 🥋 | Viran | Início de Karnazar |
| Rua Branca | 🌨️ | Dungeon | Início de Karnazar |
| Porto Seco | 🏚️ | Dungeon | `VIRAN_APROVOU` |
| O Escuro | 🕳️ | — | `PORTO_SECO_COMPLETO` |
| Observatório | 👁️ | Tira | Início de Karnazar |
| Ilha Privada | 🏝️ | Dungeon final | `TIRA_CONFIA` + `ESCURO_VISITADO` |

---

## 5. DUNGEONS — 11 no total

### Combate padrão
- Sistema automático: a cada 1.2s rola 1d6+arma vs 1d6 defesa
- Acerto: mata 1 inimigo, ganha +1 cerveja
- Erro: inimigo ataca, dano = min(3, 1d6 - armadura)
- Vitória: todos inimigos mortos
- Morte: HP chega a 0
- Boss: batalha extra com 2 tentativas
- Rejogar: 50% do drop de cervejas

### Lista de Dungeons

| # | Dungeon | Cidade | Inimigos | Boss | Drop | Mecânica | Desbloqueio |
|---|---|---|---|---|---|---|---|
| 1 | O Anexo | Marelia | 3 (HP 3) | — | 30🍺 | Tutorial | Início |
| 2 | O Ônibus | Marelia | 5 (HP 4) | — | 80🍺 | Padrão | Início |
| 3 | Ônibus Noturno | Marelia | ∞ (escala) | — | 30🍺 | Infinito, escala c/ nível | `NOTAS_LIBERADO` |
| 4 | Rua de Marelia | Marelia | 8 (HP 6) | Cobrador Fantasma (20HP) | 150🍺+5💵 | Padrão | Ônibus completo |
| 5 | Risca a Faca Int. | Marelia | 10 (HP 7) | Segurança Veterano (25HP) | 200🍺+10💵 | **Stealth** | `RISCA_FACA_LIBERADO` |
| 6 | Porto Velho | Auranis | 10 (HP 8) | Doceiro (30HP) | 200🍺+10💎 | Padrão | Auranis |
| 7 | Doca Abandonada | Auranis | 12 (HP 10) | — | 250🍺+15💎 | Noturna (NOITE) | `KARIM_CONFIA` |
| 8 | Torre Kronos | Auranis | — | — | 500🍺 | **Fuga** (15 rounds) | `DOCA_COMPLETA` |
| 9 | Rua Branca | Karnazar | 15 (HP 12) | Cobrador do Norte (40HP) | 400🍺+20💎 | Padrão | Karnazar |
| 10 | Porto Seco | Karnazar | 18 (HP 15) | Capitão Sem Nome (50HP) | 500🍺+30💎 | Padrão | `VIRAN_APROVOU` |
| 11 | Ilha Privada | Karnazar | 20+1 | Kronos (100HP, 4 fases) | 2000🍺+100💎 | Estágios+fases | `ILHA_PRIVADA_LIBERADA` |

### Mecânicas especiais
- **Stealth (Risca a Faca):** Rola 1d6 para não ser visto. Sucesso = drop x3. Falha = combate normal.
- **Fuga (Torre Kronos):** 15 rounds de esquiva. Rola 1d6, 4+ = sucesso. ≤3 = perde HP. Sempre termina com "ejeção", nunca morte.
- **Fases (Kronos):** A cada 25 HP perdido, Kronos aumenta dano em +2. 4 fases no total.

---

## 6. ITENS — 28 no total

### Arco I — Marelia

| Item | Slot | Preço | Efeito | Vendedor |
|---|---|---|---|---|
| Bengala Steampunk | ⚔️ Arma | 100🍺 | dano +2 | Pajé |
| Sapatos de Couro | 💍 Acess. | 200🍺 | 🍺/s +1 | Pajé |
| Relógio de Bolso | 💍 Acess. | 300🍺 | combat speed +1 | Pajé |
| Cachaça | 🧪 Cons. | 15🍺 | cura 5 HP | Kim |
| Paletó Noir | 🛡️ Arm. | 350🍺 | dano +1, HP +5 | Kim |
| Gravata Vermelha | 💍 Acess. | 180🍺 | 🍺/s +2 | Kim |
| Upgrade Bengala +1 | 🔧 Upg. | 100🍺 | dano arma +1 | Kim |
| Upgrade Bengala +2 | 🔧 Upg. | 250🍺 | dano arma +1 | Kim |
| Energético | 🧪 Cons. | 30🍺 | cura 10 HP | Kim |
| Armadura de Couro | 🛡️ Arm. | 400🍺 | HP max +10 | Osvaldo |
| Bengala Encantada | ⚔️ Arma | 500💵 | dano +4 | Osvaldo |
| Colete Reforçado | 🛡️ Arm. | 600🍺 | reduz dano -1 | Lara |
| Canivete | ⚔️ Arma | 400💵 | dano +3 | Lara |
| Cigarro de Marelia | 🧪 Cons. | 50💵 | cura 15 HP | Lara |

### Arco II — Auranis

| Item | Slot | Preço | Efeito | Vendedor |
|---|---|---|---|---|
| Protetor de Costelas | 🛡️ Arm. | 800🍺 | HP max +15 | Karim |
| Luvas Pesadas | ⚔️ Arma | 500🍺 | dano +3 | Karim |
| Kit Médico | 🧪 Cons. | 80🍺 | cura 25 HP | Karim |
| Casaco de Kevlar | 🛡️ Arm. | 15💎 | HP +20, reduz dano -2 | Operativo |
| Bengala de Choque | ⚔️ Arma | 20💎 | dano +5 | Operativo |
| Antídoto | 🧪 Cons. | 10💎 | cura 30 HP | Operativo |

### Arco III — Karnazar

| Item | Slot | Preço | Efeito | Vendedor |
|---|---|---|---|---|
| Trench Coat Noir | 🛡️ Arm. | 40💎 | dano +3, HP +20 | Tira (loja secreta) |
| Bengala do Avô | ⚔️ Arma | 60💎 | dano +8 | Tira (loja secreta) |
| Último Cigarro | 🧪 Cons. | 25💎 | cura HP total (único) | Tira (loja secreta) |

---

## 7. NPCs — 10 personagens

| NPC | Cidade | Interior | Vende | Moeda | Missões | Aliado |
|---|---|---|---|---|---|---|
| Pajé Yawanari | Marelia | Barraca | Bengala, Sapatos, Relógio | 🍺 | — | — |
| Kim | Marelia | Boteco do Jazz | Cachaça, Paletó, Gravata, Upgrades, Energético | 🍺 | — | ✅ (20💵) |
| Nina | Marelia | Delegacia | — | — | O Informante | ✅ (15💵) |
| Osvaldo | Marelia | Oficina | Armadura Couro, Bengala Encantada | 🍺/💵 | Osvaldo Desapareceu | — |
| Lara | Marelia | Risca a Faca | Colete, Canivete, Cigarro | 🍺/💵 | — | — |
| Karim | Auranis | Pensão Rua 7 | Protetor, Luvas, Kit Médico | 🍺 | O Favor de Karim | — |
| Operativo | Auranis | Mercado Negro | Casaco Kevlar, Bengala Choque, Antídoto | 💎 | — | — |
| Viran | Karnazar | Dojô | — | — | 3 Sessões de treino | — |
| Tira | Karnazar | Observatório | Trench Coat, Bengala Avô, Último Cigarro (loja secreta) | 💎 | O Arquivo | — |
| Shuntaro | — | — | — | — | — | ✅ (30💵) |

---

## 8. FLUXO COMPLETO DE GAMEPLAY

### FASE 0 — Main Menu
1. Jogador chega em `/extras/jackcandy`
2. LoginGate → faz login
3. Main Menu com 3 slots
4. Escolhe slot vazio → "Novo Jogo" → confirma
5. Entra na Intro

### FASE 1 — Introdução (Intro)
1. Título "jack dream beer." em typewriter
2. Avatar do Jack pulsando
3. "você está dormindo. sonhos não têm lógica. esse tem cervejas."
4. Contador de cervejas 🍺 acumula passivamente
5. Ao atingir 100🍺: Pajé aparece
6. Comprar Bengala Steampunk (100🍺) → desbloqueia vila

### FASE 2 — Marelia: Primeiros Passos
1. Após comprar bengala, jogador aparece em Marelia
2. Skyline da cidade, título "M A R E L I A"
3. Card do Pajé disponível (ícone ⛺)
4. Card do Anexo (🏚️ dungeon tutorial) disponível via DUN

**Objetivo imediato:** Ir para DUN → selecionar O Anexo
- Anexo: 3 inimigos, tutorial de combate
- Vitória → flag `ANEXO_COMPLETO`, +30🍺
- **Dica do Professor:** "o anexo nos fundos da escola. todo bom plano começa com um tutorial."

**Próximo:** Ir para DUN → selecionar O Ônibus
- Ônibus: 5 inimigos, drop 80🍺
- Vitória → flag `NOTAS_LIBERADO`, recurso 💵 desbloqueado
- **Dica do Professor:** "kim está esperando no boteco do jazz."

**Agora:** Voltar pra Marelia → Rua de Marelia (DUN)
- Rua: 8 inimigos + boss Cobrador Fantasma (20HP)
- Vitória → flags `KIM_LIBERADO`, `NINA_LIBERADO`, `OSVALDO_LIBERADO`, `RISCA_FACA_LIBERADO`, `CORTICO_LIBERADO`

### FASE 3 — Marelia: Exploração Completa
Com Kim, Nina, Osvaldo, Lara, Cortiço e Terminal desbloqueados:

1. **Boteco do Jazz (Kim):** Comprar upgrades de bengala (+1, +2), paletó (+1 dano, +5 HP), gravata (+2🍺/s)
2. **Oficina (Osvaldo):** Comprar Armadura de Couro (+10 HP) → desbloqueia Cortiço
3. **Risca a Faca (Lara):** Comprar Colete Reforçado (reduz dano), Canivete (dano +3)
4. **Risca a Faca Interior (DUN):** Dungeon stealth. 10 inimigos + boss. Stealth bem-sucedido = drop x3
5. **Ônibus Noturno (DUN):** Dungeon infinita para farm de cervejas
6. **Cortiço:** Missão passiva (200🍺/semana = +5 HP max permanente)
7. **Terminal:** Visitar 3 vezes → `TERMINAL_OUVIU`

### FASE 4 — Transição para Auranis
**Condições:**
- Dungeons completas: Ônibus, Rua, Risca a Faca
- Nível 8+
- Flag `TERMINAL_OUVIU` (3 visitas ao Terminal)
- Completar Porto Velho + Doca Abandonada + Torre Kronos em Auranis

Ao atingir as condições, Auranis desbloqueia automaticamente com monólogo:
*"auranis no sonho cheirava a sal e a negócio inacabado."*

### FASE 5 — Auranis
1. **Porto Velho (DUN):** 10 inimigos + boss Doceiro (30HP). Drop: 200🍺 + 10💎
2. **Pensão Rua 7 (Karim):** Comprar Protetor de Costelas (+15 HP), Luvas Pesadas (dano +3), Kit Médico
3. **Mercado Negro (Operativo):** Comprar com 💎: Casaco Kevlar (+20 HP, reduz dano -2), Bengala de Choque (dano +5)
4. **Missão de Karim:** Completar Doca Abandonada → `KARIM_CONFIA`
5. **Doca Abandonada (DUN):** Só à NOITE. 12 inimigos. Drop: 250🍺 + 15💎
6. **Torre Kronos (DUN):** Mecânica de fuga. 15 rounds de esquiva. Drop: 500🍺 + `KRONOS_VIU`

### FASE 6 — Transição para Karnazar
**Condições:**
- Nível 15+
- Flags `KRONOS_VIU` + `DOCA_COMPLETA`
- Medidor Primordial visível na StatusBar (🔥)

Ao atingir as condições, Karnazar desbloqueia:
*"o frio de karnazar no sonho era diferente. entrava nos ossos antes de você perceber."*

### FASE 7 — Karnazar (Endgame)
1. **Dojô de Viran:** 3 missões de treino. Cada uma dá +5 HP max
   - Primeira Sessão: Completar Rua Branca com HP > 50%
   - Segunda Sessão: Completar Porto Seco
   - Última Lição: Visitar O Escuro
2. **Rua Branca (DUN):** 15 inimigos + boss Cobrador do Norte (40HP). Drop: 400🍺 + 20💎
3. **Porto Seco (DUN):** Requer `VIRAN_APROVOU`. 18 inimigos + boss Capitão Sem Nome (50HP). Drop: 500🍺 + 30💎
4. **O Escuro:** Cena sem combate. Pajé aparece sério. Flag `ESCURO_VISITADO`
5. **Observatório (Tira):** Missão O Arquivo → `TIRA_CONFIA`. Loja secreta com itens finais
6. **Ilha Privada (DUN):** Dungeon final. 2 estágios.
   - Estágio 1: 20 inimigos
   - Estágio 2: Kronos (100HP, 4 fases, dano aumenta a cada 25HP perdido)
   - Primordial no 10 é essencial (dano x2)
   - Vitória: 2000🍺 + 100💎 + `KRONOS_DERROTADO`
   - Monólogo final: *"ele caiu. no sonho isso resolveu alguma coisa. acordado eu sei que não resolve. mas no sonho sim."*

### FASE 8 — Pós-Jogo
- Todas as dungeons permanecem rejogáveis
- Ônibus Noturno escala infinitamente
- Loja secreta da Tira disponível permanentemente
- Todos os aliados disponíveis para dungeons

---

## 9. ARQUITETURA TÉCNICA

### Estrutura de Arquivos
```
src/pages/JackCandy/
├── JackCandy.jsx                   # Container: MainMenu gate, fase routing, intervals, auto-unlock
├── JackCandy.css                   # 1140 linhas de estilos noir
├── store/
│   └── useJackStore.js             # Zustand: 238 linhas, 30+ actions, localStorage + Supabase
├── data/
│   ├── flags.js                    # 30 flags com descrições
│   ├── cidades.js                  # 3 cidades + 22 locais + navegação
│   ├── npcs.js                     # 10 NPCs com itens, missões, aliados
│   ├── itens.js                    # 28 itens com 3 moedas (🍺💵💎)
│   ├── dungeons.js                 # 11 dungeons com 3 mecânicas
│   └── monologues.js               # 55 monólogos narrativos
├── screens/
│   ├── MainMenu.jsx                # Tela inicial: 3 save slots
│   ├── Intro.jsx                   # Typewriter + Pajé + compra da bengala
│   ├── Vila.jsx                    # Hub multi-cidade com cards + glow
│   ├── Interior.jsx                # Loja: balão, abas, ícones, missões
│   ├── Inventario.jsx              # Equip slots, swap, dropdown, abas
│   ├── Dungeon.jsx                 # Combate automático + stealth + fuga
│   └── DungeonSelect.jsx           # Grid de dungeons com unlock progressivo
└── components/
    ├── StatusBar.jsx               # HP bar CSS, recursos, navegação MND/INV/DUN, 🌙/☀️, 🔥, SAVE, RST
    ├── DicaToast.jsx               # Professor Máquina: dicas contextuais pós-idle
    ├── Monologue.jsx               # Balão de monólogo fixo no rodapé
    └── CombatLog.jsx               # (legado, não usado ativamente)
```

### Store (useJackStore)
**Estado:**
```js
{
  cervejas, cervejasPorSegundo, cervejasTotais,
  fragmentos, notas,
  hpAtual, hpMax, nivel, xp,
  fase, flags, dungeonsCompletas,
  inventario, equipado: { arma, armadura, acessorio },
  tempoJogo, titleDone, monologoAtual,
  cidadeAtual, periodo, medidorPrimordial, aliadoAtual,
  _userId, _slot
}
```

**Actions principais:** tick, regenHp, comprarItem, equiparPorId, usarItem, completarDungeon, alternarPeriodo, incrementarMedidor, setAliado, saveToCloud, loadFromCloud

### Persistência
- **localStorage:** `jack_beer_slot_1/2/3` — save por slot (auto-save 30s)
- **Supabase:** `jack_saves` — save cloud (vinculado ao user_id)
- **Migração:** Save v1 (`jack_candy_save`) é migrado automaticamente para v2

---

## 10. INTERFACE

### StatusBar (fixa no topo)
```
🍺 89 | notas: 0
MND  INV  DUN  🌙/☀️  🔥  RST  SAVE
HP [████████████░░░░░░░░] 20/20  LV 1 | 🍺/s 1 | ⚔️ +2
```

### Cards de local (Vila + DungeonSelect)
- Grid 2 colunas com borda esquerda colorida
- Emoji descritivo, nome, descrição
- Estados: normal, 🔒 trancado, 🔄 rejogável, ✨ glow (próximo objetivo)
- Hover: scale 1.03 + mudança de cor da borda

### Interior (Loja)
- Balão de saudação do NPC no topo
- Abas: todos, arma, armadura, consumível, acessório
- Cards de item com: ícone de slot, nome, descrição, stats, preço, botão comprar
- Missões do NPC listadas abaixo do balão

### Inventário
- 3 slots de equipamento: ⚔️ Arma, 🛡️ Armadura, 💍 Acessório
- Clique no slot vazio → dropdown com itens equipáveis da mochila
- Clique no slot preenchido → desequipar (volta pra mochila)
- Abas: mochila (todos), consumíveis, upgrades
- Stats resumidos: ⚔️ dano, 🛡️ def, 🍺/s

### Dungeon
- Battle scene: 🕵️ Jack vs 👤👤👤 inimigos
- Barra de progresso + contagem de inimigos restantes
- HP bar com cor dinâmica (verde > amarelo > vermelho)
- Log de combate com últimas 6 entradas
- Botões de uso rápido de consumíveis durante o combate
- Botão fugir (volta pra vila, sem penalidade além de perder o progresso da dungeon)

---

## 11. VERSÃO ATUAL

**JACK_VERSION:** 2.1.0  
**Console:** `[JACK] versão carregada: 2.1.0`  
**Rota:** `/extras/jackcandy`  
**Acesso:** FREE (requer login)  
**Saves:** 3 slots localStorage + nuvem Supabase
