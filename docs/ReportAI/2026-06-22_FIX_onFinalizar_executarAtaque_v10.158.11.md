# FIX: executarAtaque não passa onFinalizar para animação do jogador

> Versão: 6.3.6 / 10.158.11
> Data: 2026-06-22

---

## Causa raiz

`executarAtaque` (linha 405-406) chamava `animarAtaqueMelee` e `animarAtaqueProjetil` sem passar o 4º parâmetro `onFinalizar`. O hook nunca recebia o sinal de que a animação terminou. `aposAnimacaoAtaque` nunca era chamado. O turno não avançava.

A IA (linha 630) passava `callbackFinal` como `onFinalizar` corretamente — por isso o turno da IA funcionava.

## Etapa 1 — Prova de leitura

```
grep -n "animarAtaqueMelee|animarAtaqueProjetil|aposAnimacaoAtaque|onFinalizar" useCombatEngine.js

150:  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
151:    console.log('[INV-03]...', { onAnimarMeleeDefinido: !!onAnimarMelee, onFinalizarDefinido: !!onFinalizar })
152:    if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
153:    else if (onFinalizar) onFinalizar()
156:  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
157:    console.log('[INV-04]...', { onAnimarProjetilDefinido: !!onAnimarProjetil, onFinalizarDefinido: !!onFinalizar })
158:    if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
159:    else if (onFinalizar) onFinalizar()
162:  function aposAnimacaoAtaque(atacante, alvo, resultado) { ...
404:    console.log('[INV-02] chamando animação', { tipo: currentChar.tipoAtaque, onFinalizarDefinido: false })
405:    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado)
406:    else animarAtaqueProjetil(currentChar, target, resultado)
630:    if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(atacante, alvo, res, callbackFinal)
631:    else animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
```

### Linhas 398-407 (região do executarAtaque)

```
398: 
399:     const d6Val = rolarD6()
400:     const dist = distanciaHex(currentChar.posicao, target.posicao)
401:     const resultado = resolverAtaque(atacanteFinal, target, Math.ceil(dist))
402:     addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
403:     resultado.logs.forEach(l => addLog(`  ${l}`))
404:     console.log('[INV-02] chamando animação', { tipo: currentChar.tipoAtaque, onFinalizarDefinido: false })
405:     if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado)
406:     else animarAtaqueProjetil(currentChar, target, resultado)
407:   }
```

## Etapa 2 — Correção

### ANTES (linhas 404-406)

```js
    console.log('[INV-02] chamando animação', { tipo: currentChar.tipoAtaque, onFinalizarDefinido: false })
    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado)
    else animarAtaqueProjetil(currentChar, target, resultado)
```

### DEPOIS (linhas 404-407)

```js
    console.log('[INV-02] chamando animação', { tipo: currentChar.tipoAtaque, onFinalizarDefinido: false })
    const cbFinalizar = () => aposAnimacaoAtaque(currentChar, target, resultado)
    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado, cbFinalizar)
    else animarAtaqueProjetil(currentChar, target, resultado, cbFinalizar)
```

## Teste lógico

| Fluxo | Status |
|-------|--------|
| 1 — Jogador ataca melee: cbFinalizar → onAnimarMelee → V2 anima → onFinalizar → aposAnimacaoAtaque → turno avança | ✅ |
| 2 — Jogador ataca projétil: cbFinalizar → onAnimarProjetil → V2 anima → onFinalizar → aposAnimacaoAtaque → turno avança | ✅ |
| 3 — IA não afetada: linha 628-631 não foi tocada, callbackFinal ainda é passado como onFinalizar | ✅ |

## Build

```
✓ built in ~950ms
```

## Versões

| Versão | Antes | Depois |
|--------|-------|--------|
| ARENATESTBED_VERSION | 6.3.5 | → **6.3.6** |
| SITE_VERSION | 10.158.10 | → **10.158.11** |

## Commit

`hash do commit` — `fix(arenatestbed): executarAtaque passa onFinalizar para animação do jogador + v10.158.11`
