# Análise Candy Box 2 → Jack Dream Candy

## 1. Arquitetura CB2 (TypeScript Vanilla)

### Core Systems
| Sistema | Arquivo | Função |
|---|---|---|
| Game loop | `Game.ts` | Centraliza tudo, gerencia renderização e update |
| Place | `Place.ts` | Classe base para toda tela (render + update) |
| Quest | `Quest.ts` | Place com entidades, colisão, log, drops |
| QuestEntity | `QuestEntity.ts` | Tudo que se move: player, rat, troll |
| RenderArea | `RenderArea.ts` | Matriz 2D de caracteres + links clicáveis |
| StatusBar | `StatusBar.ts` | Barra fixa com recursos, tabs, HP |
| Saving | `Saving.ts` | Key-value store com `register*()` e `load*()`/`save*()` |
| Database | `Database.ts` | Textos em múltiplos idiomas |
| Resource | `Resource.ts` | Candies, lollipops com current/max/accumulated |

### Fluxo de Tela
```
Game.render()
  ├── statusBar.render() → #statusBar
  └── currentPlace.render() → #mainContent
       ├── RenderArea: matriz de char
       ├── addLinkCall() para cliques
       └── draw() envia pro DOM
```

### Progressão por Features
CB2 desbloqueia recursos progressivamente gastando doces:
1. `statusBarUnlocked` (30 candies) — mostra a barra
2. `statusBarUnlockedCfg` (5) — configurações
3. `statusBarUnlockedSave` (5) — save manual
4. `statusBarUnlockedHealthBar` (5) — HP bar
5. `statusBarUnlockedMap` (10) — abre o mapa/mundo

### Quest System (Dungeon)
```
Cellar extends Quest
  ├── resizeQuest(100, 3) — área 100x3 caracteres
  ├── addPlayerCollisionBoxes() — bordas da tela
  ├── player.setQuestEntityMovement(new Pos(1,0)) — auto-walk
  ├── addRats() — inimigos em posições aleatórias
  ├── update(): chamado a cada tick
  │   ├── thePlayerWon()? → endQuest(true)
  │   ├── player.shouldDie()? → endQuest(false)
  │   └── updateEntities() — move todos
  └── drawEntities() — renderiza no RenderArea
```

### Sistema de Itens
```
EqItem (arma, chapeu, armadura, luvas, botas)
  ├── inventorySpecialNothingWeapon (padrão)
  ├── WoodenSword, IronAxe, PolishedSilverSword...
  └── Cada um: getDamage(), getAsciiRender(), getTooltip()
```

---

## 2. O que o CB2 faz MELHOR que a gente

| Aspecto | CB2 | Nós (atual) |
|---|---|---|
| **StatusBar** | Limpa, tabulada, com `+----+` borders | Texto solto, sem bordas |
| **Progressão** | Features desbloqueadas com candies | Tudo liberado de uma vez |
| **HP bar** | Dentro da StatusBar com `Your health : X/X` | Separado, sem contexto visual |
| **ASCII quest** | Entidades com animação, colisão, movimento | `@` anda reto, inimigos `X` parados |
| **RenderArea** | Matriz 2D com links clicáveis | JSX misturado, sem grid de caracteres |
| **Log de quest** | `QuestLog` com mensagens tipadas | Array de strings simples |
| **Drops** | Candies + chocolate bars + items | Só capangas |
| **Loja** | Múltiplos NPCs com items variados | Já temos, mas faltam animações |
| **Economia** | Candies, lollipops, chocolate, pains | Capangas + notas |
| **Save** | Slot-based, key-value register, export/import text | Só localStorage + Supabase |
| **Mapa** | Clickable ASCII map com lugares trancados | ASCII decorativo + lista de botões |
| **Feedback visual** | Cores no texto, hitboxes mostradas com "D" | Tudo cinza, sem variedade |

---

## 3. O que NÓS fazemos MELHOR que o CB2

| Aspecto | CB2 | Nós |
|---|---|---|
| **Tech stack** | TypeScript vanilla 2013 | React 19 + Zustand + Framer Motion |
| **Animações** | Só troca de ASCII frame | Framer Motion: fade, slide, scale |
| **CSS** | Inline via `<span style="...">` | CSS Modules com variáveis |
| **Persistência** | Só localStorage | localStorage + Supabase cloud |
| **Login** | Não tem | LoginGate integrado |
| **Responsividade** | Tamanho fixo | Flexível, mobile-ready |

---

## 4. Plano de Implementação (6 Etapas)

### Etapa 1: UI Revolution 🎨
**O que:** Refinar tudo que já existe com CSS fodástico, animações, feedback visual

**StatusBar renovada:**
```css
.jdc-statusbar {
  background: linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 100%);
  border-bottom: 1px solid #8B0000;
  box-shadow: 0 2px 10px rgba(139,0,0,0.2);
}
.jdc-sb-btn--active {
  background: rgba(139,0,0,0.15);
  border-color: #8B0000;
  text-shadow: 0 0 8px rgba(139,0,0,0.5);
}
```

**HP bar animada:**
- Gradiente verde → amarelo → vermelho baseado no percentual
- Animação Framer Motion quando toma dano (shake)
- Efeito de glow quando HP crítico

**Dungeon:**
- `@` com animação de passo (alterna entre `@` e `O`)
- `X` com glow vermelho quando ataca
- Log com fade-in em cada entrada
- HP bar estilo CB2 com gradiente dinâmico

**Transições:**
- Fade entre telas (Vila → Interior → Dungeon)
- Slide para modal de loja
- Scale para itens comprados

---

### Etapa 2: Progressão Real 📈
**O que:** Features desbloqueiam com capangas (igual CB2)

| Custo | Feature |
|---|---|
| 0 (início) | Intro + acumular capangas |
| 100 | Pajé + bengala → desbloqueia VILA |
| 200 | Dungeon 1 (Ônibus) |
| 400 | StatusBar completa (VILA + INV + DUN) |
| Após D1 | Notas de dix |
| Após D2 | Nina + Osvaldo |

**Implementação:**
- Adicionar `flags` progressão no save
- Mostrar "gasto X capangas para desbloquear" nas opções bloqueadas
- Hint visual: item cinza com cadeado + custo

---

### Etapa 3: Sistema de Itens + Inventário 🎒
**O que:** Inventário visual com grid de slots, tooltips, equipar/usar com animação

**Itens com arte ASCII própria:**
```
⚔️ Bengala Steampunk  [dano +2]
  ╔═══╗
  ║ ⚙ ║
  ╚═══╝
```

**Slots:**
- Grid 3x3: Arma | Armadura | Acessório | Mochila (6 slots)
- Drag & click pra equipar (em vez de botão)
- Tooltip em hover mostrando stats

**Consumíveis:**
- Usar com clique + animação de cura (+HP flutuante)
- Pilha de items (quantidade)

---

### Etapa 4: Mapa + Dungeons 🗺️
**O que:** Mapa interativo com lugares clicáveis, dungeons com entidades visuais

**Mapa renovado:**
```html
<pre class="jdc-map">
  [CASA]  [LOJA]  [FERREIRO]
    🏠      🏪      🔨
  
       [DUNGEON 1] 🚌
       [DUNGEON 2] 🏙️
</pre>
```

**Dungeon estilo CB2 real:**
- Player `@` com animação de movimento
- Inimigos com arte ASCII (`r at`, `T`, `W`) 
- Colisão: quando `@` encosta, combate
- Background diferente por dungeon (ônibus = escuro, rua = cinza)

---

### Etapa 5: Economia + Loja + Upgrades 💰
**O que:** Loja visual com cards de item, animação de compra, upgrade visível na bengala

**Loja CB2 style:**
```html
┌──────────────────────────────┐
│        BOTECO DO JAZZ        │
├──────────────────────────────┤
│ 🍺 Upgrade Bengala +1  100c  │
│ 🥫 Energético +10 HP   30c   │
│ 👞 Sapatos de Couro   200c   │
└──────────────────────────────┘
```

**Upgrade visível:**
- Bengala troca de arte conforme dano (+1, +2, +3)
- Fumaça/solta ao comprar upgrade

---

### Etapa 6: Monólogos + Lore + Final 🎭
**O que:** Sistema de monólogos com digitação, conquistas visuais, tela de fim

**Monólogo estilo visual novel:**
```html
┌──────────────────────────────┐
│                              │
│  "no sonho eu sempre soube   │
│   que ia precisar de algo    │
│   pra bater."                │
│                              │
│          [OK]                │
└──────────────────────────────┘
```

**Conquistas:**
- Badge visual na StatusBar
- Toast notification ao desbloquear
- Tela de conquistas com progresso

---

## 5. Prioridade de Execução

| Ordem | Etapa | Arquivos | Tempo |
|---|---|---|---|
| 1 | **UI Revolution** | CSS + componentes existentes | 2-3 sessões |
| 2 | **Progressão** | Store + flags + unlocks | 1 sessão |
| 3 | **Itens/Inventário** | Inventario.jsx + itens.js | 1-2 sessões |
| 4 | **Mapa + Dungeons** | Dungeon.jsx + Vila.jsx | 2-3 sessões |
| 5 | **Loja + Economia** | Interior.jsx + store | 1 sessão |
| 6 | **Monólogos + Final** | Monologue.jsx + End | 1 sessão |

---

## 6. Inspiração Visual do CB2 para CSS

```css
/* Borda de quest CB2 */
.jdc-cb2-border {
  border: 1px solid #444;
  font-family: 'Share Tech Mono', monospace;
  line-height: 1.4;
  padding: 0.5rem;
  background: #0a0a0a;
}

/* HP bar CB2 */
.jdc-cb2-hp {
  background: rgba(20, 212, 0, 0.1);
  padding: 0.1rem 0.3rem;
  font-size: 0.75rem;
}

/* Tab ativa CB2 */
.jdc-cb2-tab-active {
  background: #BFBFBF;
  color: #000;
}
```

---

## Próxima Ação

Começar pela **Etapa 1: UI Revolution** - refinamento visual completo de tudo que já existe antes de adicionar features novas.


   __/=====\__
    ( -  - )
     \_∧_/
    /|___|\


                                      =#*##                                     
                                     =*##++=                                    
                                    **#%%%#*###                                 
                                 ++**++*#*+##*+*                                
                                    =-=+*+-+#                                   
                                     -**#==%%                                   
                                   +#%=++#=%**                                  
                                  +*%@:#-==%#***                                
                               *++**%#:*=:%%@**##***                            
                              #++++#@#:%+%%*######%++                           
                              +*#++#@*@%#%+####%%#%#*#                          
                              +*=++#%#%*#@*####%%#%%#+                          
                             ***+=*%@##@@#*##%*%%%%##*+                         
                             ++#==#@@#@%%+#*%#*##%%%##*                         
                            *##%+*%@@%%#%+#@%#***%@@%%#%                        
                            ++##++%@@%%%%+%%%#**#@@#####                        
                            +*##++%@@%#%%#%###*#%@%###*                         
                            ++*++#@@@#%%%*%%##*%@%###*                          
                            ##+*+%@@%#%%%#%###%#@###**                          
                            %+**+@@@@@%%@###########*                           
                             *++*@@%@@%%%########*                              
                             +++*@@@@%@%%######**+                              
                             +++#@@@%@@@%######*++                              
                             +++%@@@@@@@%######*=+                              
                             =++%@@@@@@@%######*++*                             
                             ++*@@@%%@@@@######*+#+                             
                             ++*@@@@%@@@@######*+++                             
                             ++*@@@%%%@@@######*+++                             
                             ++%@@%%@@@@@######**++                             
                             ++%@@@%@@#@@######**+%                             
                             *+%%#%%%%%@@######****                             
                             +* =*%%%%   ######****                             
                             %* %%%%%## %######***                              
                                %#%%%%% %###%%%#=                               
                                 #%%%#%    %#%%%#                               
                               %#@@%###    ##%##                                
                           ***%@%%@@%%#    +#@++                                
                          #%%%%%#           *@+=+                               
                                            #*%+#                               
                                             %%                         