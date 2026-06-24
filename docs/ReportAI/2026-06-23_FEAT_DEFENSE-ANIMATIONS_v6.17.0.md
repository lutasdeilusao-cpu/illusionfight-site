# FEAT: Defense Animations — Hit + Block + MagicShield + v6.17.0

**Date:** 2026-06-23  
**Previous commit:** `50349076`  
**This commit:** `6903eb14`  

## What changed

- Created `engine/animations/defense/index.js` — `DefenseAnimId` enum + registry
- Created `engine/animations/defense/defenseAnim1Hit.js` — red flash + blood particles
- Created `engine/animations/defense/defenseAnim2Block.js` — gold flash + recoil + gold particles
- Created `engine/animations/defense/defenseAnim3MagicShield.js` — shield barrier + shake + fade + blue flash
- Added `drawShield()` to `engine/animations/particles.js`
- Added `charFlash` param to `drawCharacter()` in `drawCombatBoard.js`
- Added `animarDefesa()` to `useCombatEngine.js` — called in `aposAnimacaoAtaque` and IA `callbackFinal`
- Added `charFlash` state + `shieldRef` + `setCharFlashRef` to `Phase6CombatV2.jsx`
- Added `DefenseAnimId` enum to `Phase5bAnimDebug.jsx`
- Updated `SITE_MAP.md`

## Versions

| Constante | Antes | Depois |
|-----------|-------|--------|
| SITE_VERSION | 10.160.29 | **10.160.30** |
| ARENATESTBED_VERSION | 6.16.0 | **6.17.0** |

## Files

```
A docs/ReportAI/2026-06-23_FEAT_RANGE-ATTACK-ANIMATIONS_v6.16.0.md
A src/pages/Prototype/ArenaTestbed/engine/animations/defense/index.js
A src/pages/Prototype/ArenaTestbed/engine/animations/defense/defenseAnim1Hit.js
A src/pages/Prototype/ArenaTestbed/engine/animations/defense/defenseAnim2Block.js
A src/pages/Prototype/ArenaTestbed/engine/animations/defense/defenseAnim3MagicShield.js
M SITE_MAP.md
M src/config/version.js
M src/pages/Prototype/ArenaTestbed/engine/animations/particles.js
M src/pages/Prototype/ArenaTestbed/engine/drawCombatBoard.js
M src/pages/Prototype/ArenaTestbed/engine/useCombatEngine.js
M src/pages/Prototype/ArenaTestbed/phases/Phase5bAnimDebug.jsx
M src/pages/Prototype/ArenaTestbed/phases/Phase6CombatV2.jsx
```
