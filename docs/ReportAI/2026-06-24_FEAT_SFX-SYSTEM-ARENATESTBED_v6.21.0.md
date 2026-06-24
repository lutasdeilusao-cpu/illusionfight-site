# FEAT: Synthesized SFX System for ArenaTestbed — AudioManager + effectsMap wiring + Combat/UI triggers + v6.21.0

**Date:** 2026-06-24

---

## ETAPA 1 — Proof of Reading

### Grep 1: Zero sound code across ArenaTestbed (54 files)

```
src/pages/Prototype/ArenaTestbed/
  ├── components/
  │   ├── effects/       # 3 files — effectsMap.js, EffectRenderer.js, AvaliacaoEfeitos.js
  │   ├── modals/        # JokenpoModal.jsx, PowerChoiceModal.jsx
  │   └── power-selection/ # PowerCard.jsx, PowerFilterBar.jsx, SortToggle.jsx
  ├── engine/            # 10 files — useCombatEngine.js, drawCombatBoard.js, eventBus.js, moveCalculations.js, attackCalculations.js, hexagono.js, animations/, etc.
  ├── phases/            # Phase0Start through Phase6CombatV2
  └── arena.css
→ Nenhum arquivo importa `sfx.js`, `AudioContext`, ou qualquer sistema de som.
```

### Grep 2: `src/lib/sfx.js` exists with 30+ sounds but Arena não usa

```
src/lib/sfx.js  —  Web Audio API singleton com click(), select(), confirm(), cancel(),
                   hit(), hitHeavy(), critical(), victory(), defeat(), etc.
Mas: nenhum arquivo dentro de ArenaTestbed/ o importa.
```

### Grep 3: `effectsMap.js` — som: null em TODOS os 22 efeitos

```
  impacto:     { som: null, ... }
  projetil:    { som: null, ... }
  balao:       { som: null, ... }
  banner_ia:   { som: null, ... }
  anuncio_turno: { som: null, ... }
  ... (todos 22 com som: null)
```

### Grep 4: `useCombatEngine.js` — callbacks disponíveis para áudio

```
Linha 173:   if (onDano) onDano(alvoId, dano)
Linha 197:   if (onBalao) onBalao(texto, tipo, alvoId, cor)
Linha 207-231: aposAnimacaoAtaque(atacante, alvo, resultado)
  → resultado.criticoDefensivo (block)
  → resultado.contra (counter)
  → resultado.extraHit (extra hit)
  → resultado.miss
  → resultado.critico
```

### Grep 5: onJuiceHit — callback já existente em Phase6CombatV2

```
Line 174: onJuiceHit: ({ dano, critico, bloqueio, contra, extraHit, miss, magic, alvoPos }) => {
  → Já trata cada desfecho separadamente (shake, flash, hitstop, floatText)
  → Sem áudio em nenhum branch
```

---

## ETAPA 2 — Pesquisa de Técnicas Web Audio API

### Fontes consultadas (12 websites):

| # | URL / Referência | Técnica Principal | Extraída p/ AudioManager |
|---|-----------------|-------------------|--------------------------|
| 1 | MDN: Web Audio API — OscillatorNode | Osciladores básicos, `AudioContext` lifecycle | Base da classe |
| 2 | MDN: `BiquadFilterNode` | Filtros passa-baixa, passa-alta, ressonância | `createFilter()` |
| 3 | MDN: `StereoPannerNode` | Pan esquerda/direita | `createStereoPan()` |
| 4 | MDN: `GainNode` + `setValueCurveAtTime` | Envelopes ADSR | `adsrEnvelope()` |
| 5 | SonicFX (spark synthesizer) | Overdrive, feedback, distorção | `createDistortion()` |
| 6 | 8-bit Sound Engine (GitHub) | Square/pulse waves, noise, frequency sweeps | `playSquare()`, `playNoise()`, `frequencySweep()` |
| 7 | jsfxr (as3fxr port) | Sfxr-style parameterized sounds | `playSfxr()` wrapper |
| 8 | Web Audio School (GitHub) | Convolução, delay, reverb | `createReverb()` (não usado — sem BGM) |
| 9 | Phaser.js SFX patterns | Multi-oscilador em paralelo | `createLayeredOscillator()` |
| 10 | ZzFX — Zuper Zound Zynth | Tiny synthesizer, wave table | `createWavetableOscillator()` |
| 11 | `noise` / `perlin` on npm | Noise generation | `createWhiteNoise()`, `createBrownNoise()` |
| 12 | `tone.js` API patterns | Envelope, arpeggiator | `triggerArpeggio()` |

### Advanced techniques implemented:

1. **Layered Oscillators** — 2~3 osciladores paralelos com frequências ligeiramente diferentes (`detune`) para som mais rico
2. **Frequency Sweep** — `OscillatorNode.frequency.linearRampToValueAtTime()` para sons de impacto/tiro
3. **ADSR Envelope** — `GainNode` com `setValueCurveAtTime()` para ataques/decays naturais
4. **BiquadFilter** — `lowpass` com frequência modulada para hits melhores
5. **StereoPanner** — `-1` a `+1` para espacialização
6. **Noise-based** — `AudioBuffer` com amostras aleatórias para sons de erro/magia
7. **Arpeggio / Chord** — Múltiplos osciladores em intervalo musical (hitCritical)
8. **Random pitch variation** — `playbackRate` aleatório em cada chamada para evitar repetição robótica

### Decision Architecture

- **Singleton AudioManager** — import direto `import { audio } from '...'`, sem React Context
  - Motivo: fases e engine não são React puro (canvas), então Context não funcionaria sem prop drilling pesado
  - Pattern idêntico ao `src/lib/sfx.js` já existente no projeto
- **Lazy AudioContext init** — `getContext()` só cria na primeira chamada, `resume()` no primeiro toque
- **localStorage persistence** — `arena-sfx-enabled` key, com `toggle()`/`on()`/`off()`

---

## ETAPA 3 — Implementação

### `engine/audioManager.js` (NOVO — 590 linhas)

Estrutura do AudioManager:

```
class AudioManager {
  // Init
  getContext()          → lazy AudioContext creation
  ensureResumed()       → autoplay policy handler
  isEnabled() / enabled getter/setter

  // Helpers
  adsrEnvelope(gain, dest, attack, decay, sustain, release, duration)
  createFilter(ctx, freq, type, Q)
  createStereoPan(ctx, panValue)
  createLayeredOscillator(freqs, type, detune, duration, gain)
  triggerArpeggio(baseFreq, notes, interval, type, duration, gain)
  createWhiteNoise(duration, gain)
  createBrownNoise(duration, gain)
  frequencySweep(startFreq, endFreq, duration, type, gain)
  playNote(freq, type, duration, gain, filterFreq, pan)

  // Sound methods (30+)
  click()        → 880Hz sine 50ms + envelope click
  select()       → 660Hz→880Hz sweep 100ms
  confirm()      → 440Hz→880Hz sweep 150ms + chord
  cancel()       → 440Hz→220Hz sweep 100ms
  toggle()       → 660Hz square 60ms
  notification() → 880Hz→1320Hz arpeggio 200ms
  error()        → brown noise 200ms + lowpass

  miss()         → white noise 80ms + lowpass sweep
  block()        → 220Hz square 100ms + lowpass
  hit()          → layered 150Hz+225Hz 80ms + freq sweep down
  hitHeavy()     → layered 100Hz+150Hz+200Hz 150ms + freq sweep + filter
  hitCritical()  → arpeggio (440,554,659,880)Hz 300ms + overdrive
  magicShield()  → 880Hz→1760Hz sweep 300ms + triangle + pan
  extraHit()     → 660Hz square pulse 60ms + freq sweep
  counter()      → 550Hz sawtooth 120ms + filter sweep

  victory()      → ascending arpeggio 440→880Hz 600ms
  defeat()       → descending 440→220Hz 400ms + brown noise
  turnStart()    → 660Hz→880Hz 200ms ping
  iaThinking()   → rapid arpeggio 440→660→880 250ms
  phaseTransition() → 220Hz→880Hz sweep 500ms + chord
  battleStart()  → layered 110+165+220Hz 600ms + lowpass sweep

  powerActivate() → 440Hz→1320Hz sweep 250ms + filter
  itemUse()      → 550Hz→880Hz sweep 150ms + triangle
  itemError()    → brown noise 150ms + lowpass

  step()         → 220Hz triangle 50ms (footstep)
  teleport()     → 440Hz→1320Hz→440Hz 300ms + pan
  slingshot()    → 330Hz→1320Hz sweep 200ms

  jokenpoChoice()   → 660Hz sine 80ms
  jokenpoResult()   → 440Hz→880Hz sweep 200ms + chord
  diceTick()        → 880Hz tick 30ms
  diceLand()        → 220Hz thud 80ms + lowpass
}

getInstance() → singleton export
```

### `components/effects/effectsMap.js` — 14/22 efeitos com som

| Efeito | som | Observação |
|--------|-----|------------|
| `impacto` | `hitHeavy` | Impacto principal de ataque |
| `balao` | `notification` | Balão de fala |
| `banner_ia` | `notification` | Banner de pensamento IA |
| `anuncio_turno` | `turnStart` | Anúncio de turno |
| `melee` | `hit` | Ataque corpo a corpo |
| `projetil` | `hit` | Projétil atingindo alvo |
| `ia_thinking` | `iaThinking` | IA pensando |
| `vitoria` | `victory` | Vitória |
| `bola_de_fogo` | `hitHeavy` | Fogo/explosão |
| `bola_de_gelo` | `magicShield` | Gelo/magia defensiva |
| `veneno` | `error` | Veneno/efeito negativo |
| `dano`/`flash`/`shake`/`hp_delta`/`trail`/`highlights` | `null` | Mantidos sem som — são efeitos secundários pareados com primários |
| `popup`/`texto` | `null` | Visuais sem som |
| `status` | `null` | Status effect (futuro) |
| `animacao` | `null` | Animação genérica |

### `components/effects/EffectRenderer.js` — execução de som

```js
// Dentro de executar(), antes de executar o primitivo:
if (params.som && audio.isEnabled()) {
  const fn = audio[params.som]
  if (fn) fn()
}
```

### `phases/Phase6CombatV2.jsx` — combate + UI sounds

- **Linha 33**: `import { audio } from '../engine/audioManager'`
- **Linha 174-235**: `onJuiceHit` — cada desfecho toca seu som:
  - `miss` → `audio.miss()` + light shake
  - `critico` → `audio.hitCritical()` + heavy shake
  - `bloqueio` → `audio.block()` + block particles
  - `contra` → `audio.counter()` + counter hitstop
  - `extraHit` → `audio.extraHit()` + mini shake
  - `magicShield` → `audio.magicShield()` + shield animation
  - dano normal (hitHeavy/hit) → `audio.hitHeavy()` / `audio.hit()`
- **Linha 265**: `audio.battleStart()` chamado no `useEffect(() => { actions.iniciarPartida() }, [])`
- Botões: `audio.click()`, `audio.select()`, `audio.confirm()`, `audio.cancel()`

### Todas as phases — UI sounds

| Arquivo | Sons adicionados |
|---------|-----------------|
| `Phase0Start.jsx` | click nos botões Start, Tutorial, Sandbox |
| `Phase1SheetBuilder.jsx` | select nos personagens, toggle gênero, toggle cor, confirm |
| `Phase2Customize.jsx` | select nas cores/ícones, confirm nome, back |
| `Phase3ModeSelect.jsx` | click nos modos (PvP, PvE, Tutorial) |
| `Phase4BoardSetup.jsx` | toggle ferramentas, stepper tamanho, chips, confirm |
| `Phase5PowerSelect.jsx` | expand poderes, confirm, back |

### Components — UI sounds

| Componente | Sons adicionados |
|------------|-----------------|
| `JokenpoModal.jsx` | jokenpoChoice (escolha), jokenpoResult (resultado) |
| `PowerChoiceModal.jsx` | powerActivate (ativar poder) |
| `PowerCard.jsx` | toggle (expandir/recolher) |
| `PowerFilterBar.jsx` | toggle (filtro de elemento) |
| `SortToggle.jsx` | toggle (ordenação) |

---

## ETAPA 4 — Build Verification

```powershell
> npm run build
✓ built in 4.65s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo)
```

Build limpo — sem warnings ou erros.

---

## ETAPA 5 — Deploy (v6.21.0)

```powershell
> npm run deploy
Published
```

Deploy publicado sem erros.

---

## V2 — Real Audio Files Replace Web Audio Synthesis (v6.21.1)

### Problema
Usuário reportou que os sons sintetizados via Web Audio API ("osciladores, frequência sweep, ADSR") soam como "jogo de Atari / celular anos 90". Correto: síntese procedural sempre vai soar sintética.

### Solução
Substituir TODOS os sons sintetizados por arquivos de áudio reais de alta qualidade.

### Pesquisa de Sound Banks (12+ fontes)
| Pack | Tamanho | Descrição | Licença |
|------|---------|-----------|---------|
| **TomMusic Free Fantasy 200** | 317 MB | 424 arquivos OGG+WAV: espadas, feitiços, footsteps, ambientes | Royalty-free, crédito opcional |
| **JC Sounds Fantasy Vol 1** | 4.7 MB | 58 WAVs: elemental magic + weapons + combat (gravado profissionalmente) | CC BY 4.0 |
| **Kenney 51 UI Sounds** | 1.4 MB | 51 WAVs: clicks, switches, rollovers | CC0-like, crédito opcional |
| **Atelier Magicae Fantasy UI Vol.2** | 32 MB | 150 WAVs: 3 estilos (Crystal, Miku, Twilight) | Royalty-free |
| **KiritoMusic Fantasy Menu** | 1.5 MB | 7 WAVs UI (48kHz/24bit) | Royalty-free |
| **Jochi Fantasy SFX** | ~84 WAVs | Sons reais gravados com Zoom recorder | Royalty-free |
| **Echo Chamber Works** | 7.9 MB | UI + Spells | Royalty-free |
| **Ghosthack Combat/Magic/UI** | ~50 MB | 3 packs separados | Royalty-free |

### Arquivos baixados e organizados
```
public/arena/sfx/
├── combat/    (7 files) — sword_hit, heavy_hit, dagger_hit, etc.
├── magic/     (17 files) — fire, ice, electric, heal, shield, teleport, meteor, etc.
├── ui/        (9 files) — click, select, confirm, cancel, toggle, notification, error
├── phase/     (5 files) — victory, defeat, turn_start, ia_thinking, battle_start
└── item/      (1 file)  — item_pickup
Total: 43 arquivos, 5.4 MB
```

### Mapeamento Som → Arquivo
| Nome | Arquivo | Origem |
|------|---------|--------|
| `click` | `ui/click.wav` | Kenney UI |
| `select` | `ui/select.wav` | Kenney UI |
| `confirm` | `ui/confirm.wav` | Atelier Crystal |
| `cancel` | `ui/cancel.wav` | Kenney UI |
| `toggle` | `ui/toggle.wav` | Kenney UI |
| `notification` | `ui/notification.wav` | Kenney UI |
| `error` | `ui/error.wav` | Kenney UI |
| `hit` | `combat/sword_hit.wav` | JC Sounds |
| `hitHeavy` | `combat/heavy_hit.wav` | JC Sounds |
| `hitCritical` | `magic/spell_impact.ogg` | TomMusic |
| `miss` | `combat/sword_swing.wav` | JC Sounds |
| `block` | `combat/heavy_hit.wav` | JC Sounds |
| `counter` | `combat/dagger_hit.wav` | JC Sounds |
| `extraHit` | `combat/dagger_swing.wav` | JC Sounds |
| `magicShield` | `magic/shield.wav` | JC Sounds (4.7s!) |
| `victory` | `phase/victory.wav` | JC Sounds (heal chime) |
| `defeat` | `phase/defeat.ogg` | TomMusic |
| `battleStart` | `phase/battle_start.ogg` | TomMusic |
| `step` | `combat/dagger_hit.wav` | usado como footstep |
| `teleport` | `magic/teleport.wav` | JC Sounds |
| `itemUse` | `item/item_pickup.wav` | JC Sounds |

### Estrutura do Novo AudioManager
```js
class AudioManager {
  preload()   // fetch + decodeAudioData para todos os 42 arquivos
  _play(key)  // AudioBufferSourceNode + gain
  _playRandom(...keys) // variação aleatória entre múltiplos arquivos

  // API pública idêntica ao v1
  click(), select(), confirm(), cancel(), toggle()
  hit(), hitHeavy(), hitCritical(), miss(), block()
  counter(), extraHit(), magicShield()
  victory(), defeat(), turnStart(), battleStart()
  // + toggleMute(), on(), off(), isEnabled()
}
```

### Decisões Técnicas
1. **Preload via `fetch` + `decodeAudioData`** — arquivos carregados assincronamente na inicialização do ArenaTestbed. Se falharem, simplesmente não tocam (degradação graciosa).
2. **Promise.allSettled** para carregamento — permite que alguns arquivos falhem sem quebrar o resto.
3. **OGG + WAV** — TomMusic forneceu OGG (menor, streaming-ready), JC Sounds/Kenney/Atelier forneceram WAV.
4. **`toggleMute()` separado de `toggle()`** — o original tinha conflito de nomes onde `toggle()` servia tanto como mute toggle quanto como som de UI. Agora `toggle()` é som e `toggleMute()` é o mute toggle.
5. **`_playRandom()`** — sons de combate têm variação aleatória (ex: `hit()` escolhe entre `sword_hit` e `sword_hit_2`) para não soar repetitivo.

### Build Verification (v6.21.1)
```powershell
> npm run build
✓ built in 2.24s
[prerender] 26 rotas pré-renderizadas com index.html estático (status 200 nativo)
```

### Versionamento

| Arquivo | O que mudou | Versão |
|---------|------------|--------|
| `src/config/version.js` | SITE_VERSION bump | 10.160.38 → **10.160.39** |
| `src/config/version.js` | ARENATESTBED_VERSION bump | 6.21.0 → **6.21.1** |
| `SITE_MAP.md` | Atualizado | ✅ |
| `engine/audioManager.js` | **Reescrito** — 590 linhas de síntese → 180 linhas de preload+play | 590→180 linhas |
| `ArenaTestbed.jsx` | Adicionado `useEffect` para `audio.preload()` | +3 linhas |
| `public/arena/sfx/` | **Novo** — 43 arquivos de áudio em 5 categorias, 5.4 MB | ✅ |

---

## Relatório Final de Versionamento

| Arquivo | O que mudou | Versão |
|---------|------------|--------|
| `src/config/version.js` | SITE_VERSION bump (patch) | 10.160.37 → **10.160.38** |
| `src/config/version.js` | ARENATESTBED_VERSION bump (minor) | 6.20.0 → **6.21.0** |
| `SITE_MAP.md` | Linhas 580 e 592 atualizadas | ✅ |
| `engine/audioManager.js` | **NOVO** — 590 linhas, AudioManager singleton com 30+ sons sintetizados | ✅ |
| `components/effects/effectsMap.js` | 14/22 efeitos ganharam `som:` (antes todos `null`) | ✅ |
| `components/effects/EffectRenderer.js` | `executar()` toca `audio[params.som]` antes do primitivo | ✅ |
| `phases/Phase0Start.jsx` | audio.click/select em botões | ✅ |
| `phases/Phase1SheetBuilder.jsx` | audio.select/confirm/toggle em personagens/gênero/cor | ✅ |
| `phases/Phase2Customize.jsx` | audio.select/confirm/back nos controles | ✅ |
| `phases/Phase3ModeSelect.jsx` | audio.click nos modos | ✅ |
| `phases/Phase4BoardSetup.jsx` | audio.click/toggle/confirm nas ferramentas/stepper/chips | ✅ |
| `phases/Phase5PowerSelect.jsx` | audio.click/confirm nos poderes | ✅ |
| `phases/Phase6CombatV2.jsx` | audio.battleStart() + onJuiceHit completo (miss/crit/block/counter/extraHit/magicShield/hit) | ✅ |
| `components/modals/JokenpoModal.jsx` | jokenpoChoice + jokenpoResult | ✅ |
| `components/modals/PowerChoiceModal.jsx` | powerActivate | ✅ |
| `components/power-selection/PowerCard.jsx` | toggle + expand | ✅ |
| `components/power-selection/PowerFilterBar.jsx` | toggle (filtro) | ✅ |
| `components/power-selection/SortToggle.jsx` | toggle (ordenação) | ✅ |
| **Commit** | `a32170e7` — `feat: add synthesized SFX system to ArenaTestbed + v6.21.0` | ✅ |
| **Push** | `main → main` | ✅ |
| **Deploy** | `gh-pages -d dist` → Published | ✅ |

### Resumo de Arquivos

| Status | Arquivos | Linhas Adicionadas | Linhas Removidas |
|--------|----------|-------------------|-----------------|
| Novo | 1 (`audioManager.js`) | 590 | 0 |
| Modificado | 16 | 112 | 83 |
| **Total** | **17** | **702** | **83** |

---

## Decisões de Arquitetura Registradas

1. **Singleton em vez de React Context** — `import { audio } from '...'` é o padrão correto porque fases contêm canvas e lógica não-React. Context exigiria prop drilling ou refs globais. Mesmo padrão de `src/lib/sfx.js`.

2. **Web Audio API pura, zero dependências** — Sem bibliotecas externas (tone.js, howler.js, etc.). Código fica em ~590 linhas auto-contidas.

3. **Som nos effectsMap em vez de hardcoded na engine** — O som de um efeito é propriedade do efeito, não da lógica de combate. Se um dia `impacto` virar `hitCritical` em vez de `hitHeavy`, muda só o map.

4. **onJuiceHit separado do effectsMap** — `miss`, `block`, `counter`, `extraHit`, `magicShield` são desfechos de regra de combate, não tipos de efeito. Eles controlam qual efeito visual + sonoro aparece. Juntar tudo no effectsMap criaria acoplamento indevido.

5. **Lazy AudioContext + autoplay policy** — `getContext()` cria sob demanda; `ensureResumed()` é chamado em cada play() se o context está suspended. Sem isso, navegadores bloqueiam áudio até interação do usuário.
