# Investigação — banner iaThinking visível na tela durante turno do jogador

> Versão: 6.3.9 / 10.158.14
> Data: 2026-06-22

---

## Etapa 1 — Grep

```
145:  const { characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual } = combat
177:    console.log('[TC-16] iaThinking mudou', {...})
178:  }, [iaThinking])
236:    if (subPhase === 'free' && isPlayerTurn && !iaThinking) {
262:  }, [isPlayerTurn, iaThinking, ...]
419:                if (iaThinking) {
420:                  console.log('[VIS-01] texto iaThinking VISÍVEL NA TELA (top bar)', {...})
422:                return iaThinking ? ` · ${t('...ia_thinking_short')}` : null
474:          {(() => {
475:            console.log('[VIS-02] texto iaThinking VISÍVEL NA TELA (bottom nav spinner)', {...})
479:          {isPlayerTurn && !iaThinking && !inputLocked ? (
507:            <div className="atb-ia-thinking-row">
508:              <span className="atb-ia-dots">{t('...ia_thinking')}</span>
```

## Logs adicionados

| ID | Arquivo | Linha | Local |
|----|---------|-------|-------|
| VIS-01 | V2 | 420 | Top bar: mostra `· AI THINKING` quando `iaThinking = true` |
| VIS-02 | V2 | 475 | Bottom nav: mostra spinner quando `!isPlayerTurn \|\| iaThinking \|\| inputLocked` |

Ambos incluem `quemEstaNaVezId` e `quemEstaNaVezTime` lidos de `engine.combat` para confirmar quem realmente está na vez segundo o TurnController.

## Build

```
✓ built in 915ms
```

## Instrução para teste

1. Abrir Treino V2 + console F12
2. Mover jogador, atacar IA
3. Observar se algum log VIS-01 ou VIS-02 aparece enquanto o jogador pode jogar
4. Colar console completo — especialmente VIS-01 e VIS-02 que mostram `quemEstaNaVez`
