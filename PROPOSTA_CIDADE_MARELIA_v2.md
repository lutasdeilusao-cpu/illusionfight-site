# 🏙️ PROPOSTA DE EXPANSÃO — CIDADE DE MARÉLIA V2

> **Data:** 2026-06-07  
> **Contexto:** LDI Tatics — CityOverworld + BuildingInterior  
> **Stack:** Canvas 2D + React 19 + Framer Motion 12 + Zustand 5

---

## 1. DIAGNÓSTICO DA CIDADE ATUAL

| Aspecto | Atual | Problema |
|---------|-------|----------|
| **Tamanho** | 55×30 tiles (1760×960 px) | Muito pequeno, exploração rasa |
| **Render** | Canvas único, `drawMap()` procedural | Tudo na memória o tempo todo |
| **Sessões** | Só 2 fases: `city` + `interior` | Cidade é monolítica |
| **Prédios** | 8 edifícios fixos | Poucos, sem variedade |
| **NPCs** | 1 Detetive (não interage de verdade) | Cidade vazia |
| **Tilemap** | Cores hardcoded no JSX | Díficil de editar/expandir |
| **Colisão** | Arrays hardcoded de água/obstáculos | Manual e frágil |
| **Minimapa** | 80×80px estático | Funcional mas básico |
| **Performance** | 55×30 = 1650 tiles desenhados todo frame | OK para esse tamanho, não escala |

---

## 2. ARQUITETURA PROPOSTA: CIDADE POR SESSÕES

### 2.1 — Conceito

Dividir Marélia em **distritos/sessões independentes** que carregam sob demanda, exatamente como já fazemos com `fase === 'interior'`.

**Analogia:** Cada sessão da cidade funciona como um `BuildingInterior` — um canvas próprio com seu próprio tilemap, colliders e pontos de transição.

### 2.2 — Mapa de Sessões

```
┌────────────────────────────────────────────────┐
│  SISTEMA DE TRANSIÇÃO ENTRE DISTRITOS          │
│                                                │
│  [PORTO] ←→ [CENTRAL] ←→ [RESIDENCIAL]        │
│     ↑            ↑              ↑              │
│     ↓            ↓              ↓              │
│  [COMERCIAL] ← [YOHUALTICIT] → [INDUSTRIAL]   │
│     ↑                          ↑              │
│     ↓                          ↓              │
│  [MERCADO]    [SUBÚRBIO] ← [TREINAMENTO]      │
│                                                │
│  Conexões: portas de zona (zone doors)         │
│  Cada seta = transição carregando nova sessão  │
└────────────────────────────────────────────────┘
```

### 2.3 — Estrutura de Dados

```js
// src/pages/ArenaTatics/data/districts.js
const DISTRICTS = {
  central: {
    id: 'central',
    name: 'PRAÇA CENTRAL',
    tilemap: 'central.json',       // arquivo tilemap Tiled
    width: 55, height: 30,         // tiles
    step: 32,
    music: 'ambient-central',
    exits: {
      norte: { to: 'residencial', spawn: { x: 10, y: 28 } },
      leste: { to: 'yohualticit',  spawn: { x: 1, y: 15 } },
      sul:   { to: 'comercial',    spawn: { x: 25, y: 1 } },
    },
    buildings: [
      { id: 'save', name: 'SAVE CENTER', x: 26, y: 12, w: 4, h: 3, ... },
      { id: 'info', name: 'POSTO DE INFORMAÇÕES', x: 20, y: 8, w: 3, h: 2, ... },
    ],
    npcs: [
      { id: 'detective', name: 'DETETIVE', x: 780, y: 600, dialogo: [...] },
      { id: 'vendedor', name: 'VENDEDOR AMBULANTE', x: 400, y: 300, ... },
    ],
    ambient: {
      trees: true, lamps: true, benches: true,
      particles: 'leaves',  // folhas caindo
    }
  },
  residencial: { ... },
  comercial: { ... },
  // etc.
}
```

### 2.4 — Sistema de Transição

```jsx
// No ArenaTaticsRoute.jsx
const [district, setDistrict] = useState('central')

// Quando o jogador chega na borda:
const handleDistrictTransition = (toDistrict, spawn) => {
  setDistrict(toDistrict)
  setCitySpawn(spawn)
  // O componente CityOverworld detecta o novo district e recarrega
}
```

**Efeito visual da transição:** Animação Framer Motion (fade out → fade in, ~300ms) enquanto troca o canvas.

---

## 3. USANDO O MELHOR DE REACT + CSS + JS

### 3.1 — Tilemaps via JSON (Tiled Editor)

Em vez de cores hardcoded no JSX, usar arquivos `.json` exportados do **Tiled** (editor de tilemaps gratuito).

```js
// tilemap já existe: src/pages/ArenaTatics/data/tilemaps/sample-map.json
// Só precisa ser adaptado para carregar dinamicamente
```

**Vantagens:**  
- Editor visual (arrastar/colocar tiles)  
- Vários layers (chão, decoração, colisão)  
- Cada distrito vira um arquivo separado  
- Suporte a tiles animados (água, luzes)

### 3.2 — Canvas 2D Otimizado

```js
// Em vez de redesenhar TUDO a cada frame:
function render() {
  // 1. Desenha tiles VISÍVEIS (viewport culling)
  const startTileX = Math.floor(camX / STEP)
  const endTileX = startTileX + Math.ceil(VW / STEP) + 1
  const startTileY = Math.floor(camY / STEP)
  const endTileY = startTileY + Math.ceil(VH_eff / STEP) + 1
  
  for (let ty = startTileY; ty < endTileY; ty++)
    for (let tx = startTileX; tx < endTileX; tx++)
      drawTile(ctx, tx, ty, getTile(district, tx, ty))
  
  // 2. Desenha buildings/NPCs visíveis (mesmo culling)
  // 3. Só move o canvas TRASNFORM (já fazemos isso!)
}
```

**Ganho:** De 1650 tiles/frame para ~200-300 tiles/frame.

### 3.3 — CSS Layers com Efeitos Visuais

```css
/* ── Overlays climáticos ── */
.city-overlay-rain {
  position: absolute;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  background: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(180, 200, 255, 0.03) 2px,
      rgba(180, 200, 255, 0.03) 4px
    );
  animation: rain-drop 0.5s linear infinite;
}

.city-overlay-night {
  position: absolute;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  background: rgba(0, 0, 20, 0.4);
  mix-blend-mode: multiply;
}

/* ── Transição entre distritos ── */
.city-transition-overlay {
  position: absolute;
  inset: 0;
  z-index: 500;
  background: #000;
  animation: city-transition-fade 0.3s ease;
}

@keyframes city-transition-fade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

### 3.4 — Framer Motion para Micro-Interações

```jsx
// Transição entre distritos
<AnimatePresence mode="wait">
  <motion.div
    key={district}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.25 }}
  >
    <canvas ref={canvasRef} />
  </motion.div>
</AnimatePresence>

// NPC com balão de fala animado
<AnimatePresence>
  {npcDialog && (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      className="city-npc-dialog"
    >
      <div className="city-npc-dialog-arrow" />
      <p>{npcDialog.text}</p>
    </motion.div>
  )}
</AnimatePresence>
```

### 3.5 — Zustand para Estado da Cidade

```js
// Em useArenaTaticsStore.js ou novo store cityStore
const useCityStore = create((set, get) => ({
  currentDistrict: 'central',
  visitedDistricts: ['central'],
  discoveredPlaces: [],
  cityTime: 0,        // 0-1440 (minutos do dia)
  cityWeather: 'clear', // 'clear' | 'rain' | 'night'
  npcStates: {},      // { [npcId]: { falou: false, quest: null } },
  
  enterDistrict: (id, from) => {
    set(s => ({
      currentDistrict: id,
      visitedDistricts: s.visitedDistricts.includes(id) 
        ? s.visitedDistricts : [...s.visitedDistricts, id],
    }))
  },
  
  advanceTime: (minutes) => {
    const t = (get().cityTime + minutes) % 1440
    set({ cityTime: t })
    // Atualiza clima baseado no tempo
    if (t < 360 || t > 1260) set({ cityWeather: 'night' })
    else set({ cityWeather: Math.random() > 0.85 ? 'rain' : 'clear' })
  },
}))
```

### 3.6 — HUD com Contexto

```jsx
// Componente reutilizável no canto superior
<CityHUD>
  <DistrictName district={district} />
  <CityClock time={cityTime} />
  <WeatherIndicator weather={cityWeather} />
  <MiniMap district={district} player={playerPos} />
</CityHUD>
```

---

## 4. EXPANSÃO DOS PRÉDIOS

### 4.1 — Novos Edifícios

| Prédio | Distrito | Função | Interior |
|--------|----------|--------|----------|
| Save Center | Central | Já existe | ✅ |
| Posto de Informações | Central | Tutorial, dicas | ✅ |
| Loja de Equipamentos | Comercial | Comprar armas/armaduras | ✅ Novo |
| Hospital (Recovery) | Residencial | Já existe | ✅ |
| Bar do Zé | Comercial | Já existe | ✅ |
| Training Center | Industrial | Já existe | ✅ |
| Arena Subterrânea | Industrial | Batalhas opcionais | ✅ Novo |
| Biblioteca | Central | Lore, história da cidade | ✅ Novo |
| Concessionária | Comercial | Comprar veículos/montaria | ✅ Novo |
| Templo Xakaxi | Residencial | Encontrar Pajé Yawanari | ⭐ Novo |
| Mercadinho Seu Jão | Mercado | Já existe | ✅ |
| Fashion Center | Comercial | Já existe | ✅ |
| Central Yohualticit | Yohualticit | Já existe | ✅ |
| Casa do Personagem | Residencial | Já existe | ✅ |
| Estação de Trem | Central | Portal para outras cidades | ⭐ Novo |

### 4.2 — Interiores com Mais Conteúdo

Cada interior ganha:
- NPCs com diálogo
- Itens interativos (baús, totens, painéis)
- Mini-quests (ex: "Leve este item para o Mercadinho")
- Decoração única por mapa (não mais genérica)

---

## 5. MAPA DE IMPLEMENTAÇÃO (FASES)

### 🔵 Fase 1 — Fundação (1-2 dias)

| Item | Arquivos | Esforço |
|------|----------|---------|
| Extrair `DISTRICTS` para `data/districts.js` | Novo arquivo + CityOverworld | ⭐ |
| Sistema de transição entre distritos | CityOverworld + ArenaTaticsRoute | ⭐⭐ |
| Componente `CityHUD` com nome do distrito + relógio | Novo componente | ⭐ |
| Animações Framer Motion nas transições | CityOverworld | ⭐ |

### 🟡 Fase 2 — Conteúdo (2-3 dias)

| Item | Arquivos | Esforço |
|------|----------|---------|
| Tilemaps via JSON (criar 3-4 distritos) | `data/districts/*.json` | ⭐⭐⭐ |
| Viewport culling no Canvas | CityOverworld | ⭐⭐ |
| 5+ novos interiores | BuildingInterior + data interiors | ⭐⭐⭐ |
| NPCs com diálogo | CityOverworld + NpcDialog component | ⭐⭐ |
| Sistema de clima (dia/noite/chuva) | CityOverworld + CSS | ⭐⭐ |

### 🔴 Fase 3 — Polish (1-2 dias)

| Item | Arquivos | Esforço |
|------|----------|---------|
| Partículas (folhas, chuva, fumaça) | CityOverworld + Canvas particles | ⭐⭐ |
| Música ambiente por distrito | Context + hook de áudio | ⭐⭐ |
| Minimapa dinâmico (mostra só o distrito atual) | MiniMap component | ⭐ |
| Efeitos sonoros (passos, portas) | Hook de áudio | ⭐ |
| Quest system simples | Novo store + componentes | ⭐⭐⭐ |

---

## 6. PERFORMANCE

### Por que NÃO vamos travar o navegador:

1. **Sessões** — Cada distrito é um canvas independente. Só UM está na tela por vez.
2. **Viewport culling** — Só desenha tiles VISÍVEIS na viewport (~200 tiles vs 1650).
3. **Tilemaps em JSON** — Carregamento assíncrono via `fetch()` ou `import()`.
4. **Canvas 2D** — Leve. Sem Three.js, sem WebGL pesado. Pixel art 32px.
5. **React** — Só rerenderiza o que muda (HUD, labels). O canvas é manipulado diretamente.
6. **Mobile-first** — Tudo pensado para 480px de largura. Viewport pequena = menos tiles.

### Estimativa de tiles por distrito:

| Distrito | Tamanho | Tiles | Visíveis (~) | Memória do JSON |
|----------|---------|-------|-------------|-----------------|
| Central | 55×30 | 1.650 | 250 | ~8 KB |
| Residencial | 55×30 | 1.650 | 250 | ~8 KB |
| Comercial | 60×35 | 2.100 | 250 | ~10 KB |
| Industrial | 50×30 | 1.500 | 250 | ~7 KB |
| Porto | 40×25 | 1.000 | 250 | ~5 KB |
| Yohualticit | 45×30 | 1.350 | 250 | ~6 KB |
| **Total** | | **9.250** | **~250/frame** | **~44 KB** |

> 🔥 **Ganho real:** 9.250 tiles espalhados em 6 distritos vs 1.650 tiles em 1 distrito — e o **custo por frame é o mesmo** (~250 tiles) graças ao culling.

---

## 7. EXEMPLO VISUAL DE UM DISTRITO

### Praça Central (após expansão):

```
🏛️ Posto de Informações    💾 Save Center
        │                        │
   ─────┘                        └─────
   🚶‍♂️🚶‍♂️🚶‍♂️🚶‍♂️🚶‍♂️🚶‍♂️🚶‍♂️🚶‍♂️🚶‍♂️🚶‍♂️
   ───────────────────────────────────
   🪑  🌳               🌳  🪑
        🗣️ VENDEDOR
   ───────────────────────────────────
   📚 BIBLIOTECA    🚉 ESTAÇÃO DE TREM
```

### Transição para Residencial (exemplo):

```
Você está na PRAÇA CENTRAL
→ Anda para o norte
→ Tela fade out (300ms)
→ "BAIRRO RESIDENCIAL"
→ Tela fade in (300ms)
→ Você aparece no sul do bairro
```

---

## 8. PRÓXIMOS PASSOS IMEDIATOS

Se aprovar a proposta, sugiro começarmos por:

1. **Extrair `districts.js`** com o distrito Central atual (55×30, 8 prédios) — refatoração zero risco
2. **Criar o hook `useDistrictTransition`** — lógica de transição com fade
3. **Criar o 2º distrito** (Residencial, 55×30) com casas, árvores, o Templo Xakaxi
4. **Conectar os dois** com uma porta de zona no norte da Central

Cada passo é funcional e publicável. Não precisa fazer tudo de uma vez.

---

**Resumo:** Passamos de 1 distrito monolítico de 55×30 para **6+ distritos conectados** de tamanho similar, usando o mesmo mecanismo de sessão que já usamos para interiores — só que para a cidade. Zero risco de travamento, performance igual ou melhor, e cidade 6× maior.
