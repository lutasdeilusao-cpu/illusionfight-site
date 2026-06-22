# Investigação — IA age durante turno do jogador

> Gerado em 2026-06-22. Versão: 6.3.5 / 10.158.10

---

## ETAPA 1 — Greps

### Grep 1 — useCombatEngine.js

```
24:  onVitoria, onTurnoJogador, onTurnoIA,
25:  onLockInput, onUnlockInput,
53:  const [iaThinking, setIaThinking] = useState(false)
64:  const iaThinkingRef = useRef(false)
150:  function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
151:    console.log('[INV-03] animarAtaqueMelee chamado', { onAnimarMeleeDefinido: !!onAnimarMelee, onFinalizarDefinido: !!onFinalizar })
152:    if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
153:    else if (onFinalizar) onFinalizar()
156:  function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
157:    console.log('[INV-04] animarAtaqueProjetil chamado', { onAnimarProjetilDefinido: !!onAnimarProjetil, onFinalizarDefinido: !!onFinalizar })
158:    if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
159:    else if (onFinalizar) onFinalizar()
162:  function aposAnimacaoAtaque(atacante, alvo, resultado) {
163:    console.log('[INV-05] aposAnimacaoAtaque chamado', { atacanteId: atacante.id, alvoId: alvo.id, criticoDefensivo: resultado.criticoDefensivo, ataqueExtra: resultado.ataqueExtra, dano: resultado.dano })
185:          console.log('[INV-07] disparando finalizarAposAtaque direto', { danoTotal: 0 })
186:          setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
195:        console.log('[INV-07] disparando finalizarAposAtaque direto', { danoTotal: Math.max(1, resultado.dano || 1) })
196:        setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
215:      console.log('[ATK-EXTRA] chamando finalizarAposAtaque', { danoAcumulado: 0, isCriticoDefExtra, alvoId: alvo.id })
216:      console.log('[INV-09] handleAtaqueExtra → finalizarAposAtaque', { danoAcumulado: 0, isCriticoDefExtra })
217:      finalizarAposAtaque(alvo, { dano: 0 })
222:      console.log('[ATK-EXTRA] chamando finalizarAposAtaque', { danoAcumulado: danoExtra, isCriticoDefExtra, alvoId: alvo.id })
223:      console.log('[INV-09] handleAtaqueExtra → finalizarAposAtaque', { danoAcumulado: danoExtra, isCriticoDefExtra })
224:      finalizarAposAtaque(alvo, { dano: danoExtra })
228:  // Bug 2 fix: finalizarAposAtaque volta para subPhase:'free' em vez de chamar onTurnoJogador
229:  function finalizarAposAtaque(alvo, resultado) {
230:    console.log('[ATK-EXTRA] finalizarAposAtaque iniciado', { alvoId: alvo.id, winnerRef: winnerRef.current, animatingRef: animatingRef.current, hpAtual: charsRef.current.find(c => c.id === alvo.id)?.hp ?? 'não encontrado' })
231:    console.log('[INV-10] finalizarAposAtaque chamado', { alvoId: alvo.id, winnerRef: winnerRef.current, animatingRef: animatingRef.current, hpAtual: charsRef.current.find(c => c.id === alvo.id)?.hp ?? 'não encontrado' })
248:        console.log('[ATK-EXTRA] chamando onUnlockInput', { hpAtual: ..., winnerRef: ... })
249:        console.log('[INV-11] onUnlockInput sendo chamado', { definido: !!onUnlockInput })
250:        if (onUnlockInput) onUnlockInput(1500)
260:        console.log('[ATK-EXTRA] chamando onUnlockInput', { hpAtual: ..., winnerRef: ... })
261:        console.log('[INV-11] onUnlockInput sendo chamado', { definido: !!onUnlockInput })
262:        if (onUnlockInput) onUnlockInput(1500)
296:    if (onLockInput) onLockInput()
336:    if (onUnlockInput) onUnlockInput(0)
384:    if (onLockInput) onLockInput()
404:    console.log('[INV-02] chamando animação', { tipo: currentChar.tipoAtaque, onFinalizarDefinido: false })
405:    if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado)
406:    else animarAtaqueProjetil(currentChar, target, resultado)
435:    avancarEAcionar()
438:  function configurarTurnoPara(charId) {
445:      if (onTurnoIA) onTurnoIA(proxChar)
446:      if (onLockInput) onLockInput()
449:      setIaThinking(false)
450:      iaThinkingRef.current = false
456:      if (onLockInput) onLockInput()
457:      if (onTurnoJogador) onTurnoJogador(proxChar)
461:  function avancarEAcionar() {
463:    if (nextId) configurarTurnoPara(nextId)
485:      configurarTurnoPara(tc.quemEstaNaVez())
501:      configurarTurnoPara(tc.quemEstaNaVez())
536:    configurarTurnoPara(tc.quemEstaNaVez())
546:    setIaThinking(true); iaThinkingRef.current = true
553:      if (!iaAtual || !iaAtual.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
591:      if (!iaAtual2 || !iaAtual2.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
626:              if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(atacante, alvo, res, callbackFinal)
627:              else animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
662:      iaThinkingRef.current = false; setIaThinking(false)
663:      if (onUnlockInput) onUnlockInput(0)
665:      avancarEAcionar()
671:      characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual, isPlayerTurn,
688:      setIaThinking, setPhase,
```

### Grep 2 — Phase6CombatV2.jsx

```
32:  const { inputLocked, inputLockedRef, lockInput, unlockInput } = useInputLock()
65:    onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
66:      console.log('[INV-12] onAnimarMelee callback chamado', { atacanteId: atacante.id, onFinalizarDefinido: !!onFinalizar })
82:          if (onFinalizar) {
83:            console.log('[INV-13] onAnimarMelee → chamando onFinalizar')
84:            onFinalizar()
90:    onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
91:      console.log('[INV-14] onAnimarProjetil callback chamado', { atacanteId: atacante.id, onFinalizarDefinido: !!onFinalizar })
95:      if (steps.length === 0) { console.log('[INV-15] onAnimarProjetil → chamando onFinalizar (steps vazio)'); if (onFinalizar) onFinalizar(); return }
101:          console.log('[INV-15] onAnimarProjetil → chamando onFinalizar (fim)'); if (onFinalizar) onFinalizar(); return
122:    onTurnoJogador: (proxChar) => {
123:      console.log('[INV-B05] onTurnoJogador callback', { proxCharId: proxChar.id })
125:      unlockInput(1500)
128:    onTurnoIA: (proxChar) => {
129:      console.log('[INV-B06] onTurnoIA callback', { proxCharId: proxChar.id })
133:    onLockInput: () => { console.log('[INV-B07] onLockInput chamado'); lockInput() },
134:    onUnlockInput: (delay) => { console.log('[INV-B08] onUnlockInput chamado', { delay }); unlockInput(delay) },
148:  const { characters, currentCharId, turnoAcoes, winner, iaThinking, itensChaoAtual } = combat
234:    if (subPhase === 'free' && isPlayerTurn && !iaThinking) {
260:  }, [isPlayerTurn, iaThinking, cols, rows, subPhase, subPhaseStep,
416:              {iaThinking && ` · ${t('prototype.arena_testbed.ia_thinking_short')}`}
466:          {isPlayerTurn && !iaThinking && !inputLocked ? (
```

### Grep 3 — TurnController.js

```
55:export function inicializar(ordemDefinida) {
63:  log('inicializar', { ordem: `[${ordemDefinida.join(',')}]` })
67:export function quemEstaNaVez() {
75:export function podeAgir(personagemId, tipoAcao) {
78:  const atual = quemEstaNaVez()
80:    log('podeAgir:NEGADO', { motivo: 'ninguem_na_vez', personagemId, tipoAcao })
84:    log('podeAgir:NEGADO', { motivo: 'nao_e_a_vez_dele', personagemId, vezDe: atual, tipoAcao })
88:    log('podeAgir:NEGADO', { motivo: 'personagem_morto', personagemId, tipoAcao })
92:    log('podeAgir:NEGADO', { motivo: `ja_${tipoAcao}`, personagemId, tipoAcao })
99:      log('podeAgir:NEGADO', { motivo: restricao.motivo, personagemId, tipoAcao })
106:export function registrarAcao(personagemId, tipoAcao) {
107:  if (!podeAgir(personagemId, tipoAcao)) return false
109:  log('registrarAcao', { personagemId, tipoAcao, acoes: { ...state.acoesDoTurno } })
114:export function avancarTurno() {
115:  const antigoId = quemEstaNaVez()
137:    log('avancarTurno:TODOS_MORTOS', { antigoId })
144:    log('avancarTurno:agendamento', { personagemId: novoId, turnosRestantes: agendamento.turnosRestantes })
160:  log('avancarTurno', { de: antigoId, para: novoId, mortosPulados, posicao: state.posicaoAtual })
164:export function marcarMorto(personagemId) {
167:  log('marcarMorto', { personagemId, totalMortos: state.mortos.size })
```

### Grep 4 — IA internals no engine

```
13:import { decidirAcaoIA } from './ai'
53:  const [iaThinking, setIaThinking] = useState(false)
64:  const iaThinkingRef = useRef(false)
447:      setAnimTimer(() => executarIA(proxChar), 1000)
449:      setIaThinking(false)
450:      iaThinkingRef.current = false
539:  function decidirAcaoComPersonalidade(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual, fase = 'acao') {
542:    return decidirAcaoIA(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual)
545:  function executarIA(iaChar) {
546:    setIaThinking(true); iaThinkingRef.current = true
548:    setAnimTimer(estagioPensar, 1500)
550:    function estagioPensar() {
553:      if (!iaAtual || !iaAtual.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
557:      const dec = decidirAcaoComPersonalidade(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual, 'movimento')
558:      setAnimTimer(estagioMover, 1800)
560:      function estagioMover() {
573:              setAnimTimer(estagioAgir, 300); return
583:          setAnimTimer(estagioAgir, 1000)
588:    function estagioAgir() {
591:      if (!iaAtual2 || !iaAtual2.vivo) { iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
594:      const dec2 = decidirAcaoComPersonalidade(iaAtual2, inimigos2, charsAgora2, obstaculos, cols, rows, itensChaoAtual)
601:          if (winnerRef.current) { finalizarTurnoIA(); return }
602:          if (isMiss) { adicionarBalao(alvo.id, 'MISS!', 'miss', alvo.posicao?.row, alvo.posicao?.col); setAnimTimer(() => finalizarTurnoIA(), 1300); return }
614:            setAnimTimer(() => { if (verificarVitoria()) return; finalizarTurnoIA() }, 1200)
615:          } else setAnimTimer(() => finalizarTurnoIA(), 800)
656:        setAnimTimer(finalizarTurnoIA, 500)
660:    function finalizarTurnoIA() {
662:      iaThinkingRef.current = false; setIaThinking(false)
663:      if (onUnlockInput) onUnlockInput(0)
665:      avancarEAcionar()
688:      setIaThinking, setPhase,
695:      usarItem, pularAcao, finalizarTurno, executarIA,
```

---

## ETAPA 2 — Trechos de código

### a) executarAtaque (engine, linhas 360-408)

```
360:   function executarAtaque(target) {
361:     console.log('[INV-A01] executarAtaque iniciado', { targetId: target.id, tipo: currentChar?.tipoAtaque })
362:     const currentChar = charsRef.current.find(c => c.id === currentCharIdRef.current)
363:     if (!currentChar || animatingRef.current) return
364:     if (!tc.podeAgir(currentCharIdRef.current, TipoAcao.ATACAR)) return
365:     clearAnimTimers()
366:     animatingRef.current = true
367:     if (onLockInput) onLockInput()
368:     setAttackCells([])
369:     let atacanteFinal = currentChar
370:     if (powerAttackMode) {
371:       const poder = getPoderesPorId(poderesEscolhidos[currentChar.id] || currentChar.poderesEscolhidos || [])
372:         .find(p => p.gatilho === 'ataque')
373:       if (poder && currentChar.mp >= poder.custoMP) {
374:         charsRef.current = charsRef.current.map(c => c.id === currentChar.id ? { ...c, mp: c.mp - poder.custoMP } : c)
375:         setCharacters(charsRef.current)
376:         atacanteFinal = executarMecanica(poder.mecanicaId, poder.params, { atacante: currentChar })
377:       }
378:       setPowerAttackMode(false)
379:     }
380:     const d6Val = rolarD6()
381:     const dist = distanciaHex(currentChar.posicao, target.posicao)
382:     const resultado = resolverAtaque(atacanteFinal, target, Math.ceil(dist))
383:     addLog(`⚔️ ${currentChar.nome} ataca ${target.nome}!`)
384:     resultado.logs.forEach(l => addLog(`  ${l}`))
385:     console.log('[INV-A02] chamando animação', { tipo: currentChar.tipoAtaque, onFinalizarDefinido: false })
386:     if (currentChar.tipoAtaque === 'melee') animarAtaqueMelee(currentChar, target, resultado)
387:     else animarAtaqueProjetil(currentChar, target, resultado)
388:   }
```

### b) animarAtaqueMelee (engine, linhas 150-154)

```
150:   function animarAtaqueMelee(atacante, alvo, resultado, onFinalizar) {
151:     console.log('[INV-A03] animarAtaqueMelee', { onAnimarMeleeDefinido: !!onAnimarMelee, onFinalizarDefinido: !!onFinalizar })
152:     if (onAnimarMelee) onAnimarMelee(atacante, alvo, resultado, onFinalizar)
153:     else if (onFinalizar) onFinalizar()
154:   }
```

### c) animarAtaqueProjetil (engine, linhas 156-160)

```
156:   function animarAtaqueProjetil(atacante, alvo, resultado, onFinalizar) {
157:     console.log('[INV-A04] animarAtaqueProjetil', { onAnimarProjetilDefinido: !!onAnimarProjetil, onFinalizarDefinido: !!onFinalizar })
158:     if (onAnimarProjetil) onAnimarProjetil(atacante, alvo, resultado, onFinalizar)
159:     else if (onFinalizar) onFinalizar()
160:   }
```

### d) aposAnimacaoAtaque (engine, linhas 162-198)

```
162:   function aposAnimacaoAtaque(atacante, alvo, resultado) {
163:     console.log('[INV-A05] aposAnimacaoAtaque', { atacanteId: atacante.id, alvoId: alvo.id, ataqueExtra: resultado.ataqueExtra, criticoDefensivo: resultado.criticoDefensivo })
164:     clearAnimTimers()
165:     if (resultado.criticoDefensivo) {
166:       addLog(`  🛡️ BLOQUEIO!`)
167:       adicionarBalao(alvo.id, 'CRÍTICO DEF!', 'block', alvo.posicao?.row, alvo.posicao?.col)
168:     } else {
169:       aplicarDano(alvo.id, Math.max(1, resultado.dano || 1), atacante)
170:     }
171:     if (resultado.criticoDefensivo) {
172:       adicionarFloatTexto(alvo.id, 'BLOQUEIO!', '#4488ff', alvo.posicao?.row, alvo.posicao?.col)
173:       setAnimTimer(() => {
174:         const contra = resolverContraAtaque(alvo, atacante, resultado.fa / 2)
175:         contra.logs.forEach(l => addLog(`  ↺ ${l}`))
176:         if (contra.dano > 0) {
177:           aplicarDano(atacante.id, contra.dano, alvo)
178:           adicionarFloatTexto(atacante.id, 'CONTRA!', '#ff8800', atacante.posicao?.row, atacante.posicao?.col)
179:         }
180:         if (resultado.ataqueExtra) {
181:           console.log('[INV-06] disparando handleAtaqueExtra', { danoTotal: 0, fa: resultado.fa })
182:           setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
183:         } else {
184:           console.log('[INV-07] disparando finalizarAposAtaque direto', { danoTotal: 0 })
185:           setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
186:         }
187:       }, 500)
188:     } else {
189:       if (resultado.ataqueExtra) {
190:         console.log('[INV-06] disparando handleAtaqueExtra', { danoTotal: Math.max(1, resultado.dano || 1), fa: resultado.fa })
191:         setAnimTimer(() => handleAtaqueExtra(atacante, alvo, resultado.fa), 600)
192:       } else {
193:         console.log('[INV-07] disparando finalizarAposAtaque direto', { danoTotal: Math.max(1, resultado.dano || 1) })
194:         setAnimTimer(() => finalizarAposAtaque(alvo, resultado), 400)
195:       }
196:     }
197:   }
```

### e) configurarTurnoPara (engine, linhas 438-462)

```
438:   function configurarTurnoPara(charId) {
439:     console.log('[INV-A08] configurarTurnoPara', { charId, time: charsRef.current.find(c => c.id === charId)?.time })
440:     setCurrentCharId(charId)
441:     currentCharIdRef.current = charId
442:     setTurnVersion(v => v + 1)
443:     const proxChar = charsRef.current.find(c => c.id === charId)
444:     if (!proxChar) return
445:     if (proxChar.time === 'ia') {
446:       if (onTurnoIA) onTurnoIA(proxChar)
447:       if (onLockInput) onLockInput()
448:       setAnimTimer(() => executarIA(proxChar), 1000)
449:     } else {
450:       console.log('[INV-A12] setIaThinking FALSE')
451:       setIaThinking(false)
452:       iaThinkingRef.current = false
453:       setTurnoAcoes({ moveu: false, atacou: false })
454:       setSubPhase('free')
455:       setHighlightedCells([])
456:       setAttackCells([])
457:       setRangeCells([])
458:       if (onLockInput) onLockInput()
459:       if (onTurnoJogador) onTurnoJogador(proxChar)
460:     }
461:   }
```

### f) executarIA (engine, linhas 545-668)

```
545:   function executarIA(iaChar) {
546:     console.log('[INV-A09] executarIA iniciado', { iaCharId: iaChar.id })
547:     console.log('[INV-A11] setIaThinking TRUE')
548:     setIaThinking(true); iaThinkingRef.current = true
549:     addLog(`🤖 Turno da IA: ${iaChar.nome}`)
550:     setAnimTimer(estagioPensar, 1500)
551: 
552:     function estagioPensar() {
553:       const charsAgora = charsRef.current
554:       const iaAtual = charsAgora.find(c => c.id === iaChar.id)
555:       if (!iaAtual || !iaAtual.vivo) { console.log('[INV-A12] setIaThinking FALSE'); iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
556:       addLog(`  ${iaChar.nome} — Fase: Movimento`)
557:       const inimigos = charsAgora.filter(c => c.vivo && c.time === 'jogador')
558:       setHighlightedCells(getCelulasAlcance(iaAtual.posicao.row, iaAtual.posicao.col, getCasasMovimento(iaAtual.agi, agiUmPraUm), cols, rows, obstaculos))
559:       const dec = decidirAcaoComPersonalidade(iaAtual, inimigos, charsAgora, obstaculos, cols, rows, itensChaoAtual, 'movimento')
560:       setAnimTimer(estagioMover, 1800)
561: 
562:       function estagioMover() {
563:         setHighlightedCells([])
564:         if (dec.tipo === 'andar') {
565:           const destino = { row: dec.detalhes.row, col: dec.detalhes.col }
566:           setAttackCells([destino])
567:           const origem = iaAtual.posicao
568:           const ocupadasIA = new Set(charsAgora.filter(c => c.vivo && c.id !== iaChar.id).map(c => `${c.posicao.row}_${c.posicao.col}`))
569:           const caminho = encontrarCaminho(origem.row, origem.col, destino.row, destino.col, cols, rows, obstaculos, ocupadasIA)
570:           const steps = caminho ? caminho.slice(1) : [destino]
571:           let stepIdx = 0
572:           function avancarPassoIA() {
573:             if (stepIdx >= steps.length) {
574:               setAttackCells([]); dec.logs.forEach(l => addLog(`  ${l}`))
575:               setAnimTimer(estagioAgir, 300); return
576:             }
577:             charsRef.current = charsRef.current.map(c => c.id === iaChar.id ? { ...c, posicao: { row: steps[stepIdx].row, col: steps[stepIdx].col } } : c)
578:             setCharacters(charsRef.current)
579:             if (onTrail) onTrail({ row: steps[stepIdx].row, col: steps[stepIdx].col })
580:             stepIdx++; setAnimTimer(avancarPassoIA, 150)
581:           }
582:           setAnimTimer(avancarPassoIA, 400)
583:         } else {
584:           addLog(`  ${iaChar.nome} não se moveu.`)
585:           setAnimTimer(estagioAgir, 1000)
586:         }
587:       }
588:     }
589: 
590:     function estagioAgir() {
591:       const charsAgora2 = charsRef.current
592:       const iaAtual2 = charsAgora2.find(c => c.id === iaChar.id)
593:       if (!iaAtual2 || !iaAtual2.vivo) { console.log('[INV-A12] setIaThinking FALSE'); iaThinkingRef.current = false; setIaThinking(false); finalizarTurno(); return }
594:       addLog(`  ${iaChar.nome} — Fase: Ação`)
595:       const inimigos2 = charsAgora2.filter(c => c.vivo && c.time === 'jogador')
596:       const dec2 = decidirAcaoComPersonalidade(iaAtual2, inimigos2, charsAgora2, obstaculos, cols, rows, itensChaoAtual)
597:       if (dec2.tipo === 'atacar') {
598:         const alvo = dec2.detalhes.alvo; const res = dec2.detalhes.resultado; const isMiss = dec2.detalhes.miss === true
599:         const atacante = iaAtual2
600:         setRangeCells(getCelulasAtaque(atacante.posicao.row, atacante.posicao.col, atacante.tipoAtaque, cols, rows, atacante.tipoAtaque === 'melee' ? 1 : atacante.pdf, obstaculos))
601:         setAttackCells([])
602:         const callbackFinal = () => {
603:           if (winnerRef.current) { finalizarTurnoIA(); return }
604:           if (isMiss) { adicionarBalao(alvo.id, 'MISS!', 'miss', alvo.posicao?.row, alvo.posicao?.col); setAnimTimer(() => finalizarTurnoIA(), 1300); return }
605:           if (res.criticoDefensivo) {
606:             adicionarBalao(atacante.id, 'CRÍTICO DEF!', 'block', atacante.posicao?.row, atacante.posicao?.col)
607:           } else {
608:             const danoFinal = Math.max(1, (res.dano || 1) - defesaBonusRef.current); defesaBonusRef.current = 0
609:             aplicarDano(alvo.id, danoFinal, atacante)
610:           }
611:           const hpAtual = charsRef.current.find(c => c.id === alvo.id)?.hp ?? 0
612:           if (hpAtual <= 0) {
613:             charsRef.current = charsRef.current.map(c => c.id === alvo.id ? { ...c, vivo: false } : c)
614:             setCharacters(charsRef.current); tc.marcarMorto(alvo.id)
615:             addLog(`💀 ${alvo.nome} foi derrotado!`)
616:             setAnimTimer(() => { if (verificarVitoria()) return; finalizarTurnoIA() }, 1200)
617:           } else setAnimTimer(() => finalizarTurnoIA(), 800)
618:         }
619:         const podeDefesa = alvo.time === 'jogador' && charsRef.current.find(c => c.id === alvo.id)?.mp >= 3 && temPoderDisponivel(alvo, poderesEscolhidos, 'defesa', 3)
620:         function iniciarAnimacaoAtaqueIA() {
621:           setAnimTimer(() => {
622:             setRangeCells([])
623:             setAttackCells([{ row: alvo.posicao.row, col: alvo.posicao.col }])
624:             setAnimTimer(() => {
625:               setRangeCells([]); setAttackCells([])
626:               addLog(`  ${atacante.nome} ataca ${alvo.nome}!`)
627:               dec2.logs.forEach(l => addLog(`  ${l}`))
628:               if (atacante.tipoAtaque === 'melee') animarAtaqueMelee(atacante, alvo, res, callbackFinal)
629:               else animarAtaqueProjetil(atacante, alvo, res, callbackFinal)
630:             }, 700)
631:           }, 1200)
632:         }
633:         if (podeDefesa) {
634:           if (onBannerIA) onBannerIA(atacante.nome)
635:           ...
636:         } else { defesaBonusRef.current = 0; if (onBannerIA) onBannerIA(atacante.nome); iniciarAnimacaoAtaqueIA() }
637:       } else {
638:         dec2.logs.forEach(l => addLog(`  ${l}`))
639:         setAnimTimer(finalizarTurnoIA, 500)
640:       }
641:     }
642: 
643:     function finalizarTurnoIA() {
644:       console.log('[INV-A10] finalizarTurnoIA', { iaCharId: iaChar.id, winnerRef: winnerRef.current })
645:       addLog(`  ✅ ${iaChar.nome} finalizou o turno.`)
646:       console.log('[INV-A12] setIaThinking FALSE')
647:       iaThinkingRef.current = false; setIaThinking(false)
648:       if (onUnlockInput) onUnlockInput(0)
649:       if (verificarVitoria()) return
650:       avancarEAcionar()
651:     }
652:   }
```

### g) onAnimarMelee (V2, linhas 65-86)

```
65:     onAnimarMelee: (atacante, alvo, resultado, onFinalizar) => {
66:       console.log('[INV-B01] onAnimarMelee callback', { atacanteId: atacante.id, onFinalizarDefinido: !!onFinalizar })
67:       const origem = atacante.posicao
68:       const destino = alvo.posicao
69:       const dirRow = destino.row - origem.row
70:       const dirCol = destino.col - origem.col
71:       const meioRow = Math.round(origem.row + dirRow * 0.7)
72:       const meioCol = Math.round(origem.col + dirCol * 0.7)
73:       engine.utils.syncCharacters(prev =>
74:         prev.map(c => c.id === atacante.id ? { ...c, posicao: { row: meioRow, col: meioCol } } : c)
75:       )
76:       engine.utils.setAnimTimer(() => {
77:         engine.utils.syncCharacters(prev =>
78:           prev.map(c => c.id === atacante.id ? { ...c, posicao: origem } : c)
79:         )
80:         engine.utils.setAnimTimer(() => {
81:           if (onFinalizar) {
82:             console.log('[INV-B02] onAnimarMelee → chamando onFinalizar')
83:             onFinalizar()
84:           }
85:         }, 200)
86:       }, 300)
87:     },
```

### h) onAnimarProjetil (V2, linhas 90-104)

```
 90:     onAnimarProjetil: (atacante, alvo, resultado, onFinalizar) => {
 91:       console.log('[INV-B03] onAnimarProjetil callback', { atacanteId: atacante.id, onFinalizarDefinido: !!onFinalizar })
 92:       const origem = atacante.posicao
 93:       const destino = alvo.posicao
 94:       const steps = getHexLine(origem.row, origem.col, destino.row, destino.col)
 95:       if (steps.length === 0) { console.log('[INV-B04] onAnimarProjetil → chamando onFinalizar (steps vazio)'); if (onFinalizar) onFinalizar(); return }
 96:       setProjectilePath(steps)
 97:       let stepIdx = 0
 98:       function avancar() {
 99:         if (stepIdx >= steps.length) {
100:           setProjectilePos(null); setProjectilePath([])
101:           console.log('[INV-B04] onAnimarProjetil → chamando onFinalizar (fim)'); if (onFinalizar) onFinalizar(); return
102:         }
103:         setProjectilePos({ row: steps[stepIdx].row, col: steps[stepIdx].col })
104:         setProjectilePath(prev => prev.filter((_, i) => i > 0))
105:         stepIdx++
106:         engine.utils.setAnimTimer(avancar, 320)
107:       }
108:       avancar()
109:     },
```

### i) onTurnoJogador (V2, linhas 122-126)

```
122:     onTurnoJogador: (proxChar) => {
123:       console.log('[INV-B05] onTurnoJogador callback', { proxCharId: proxChar.id })
124:       const nome = proxChar.aparencia?.nome || proxChar.nome || 'Jogador'
125:       uiCtrl.anunciar(t('prototype.arena_testbed.announce_player_turn', { nome }))
126:       unlockInput(1500)
127:     },
```

### j) onTurnoIA (V2, linhas 128-131)

```
128:     onTurnoIA: (proxChar) => {
129:       console.log('[INV-B06] onTurnoIA callback', { proxCharId: proxChar.id })
130:       const nome = proxChar.aparencia?.nome || proxChar.nome || 'IA'
131:       uiCtrl.anunciar(t('prototype.arena_testbed.announce_ia_turn', { nome }), 1500, 'ia')
132:     },
```

### k) onLockInput (V2, linha 133)

```
133:     onLockInput: () => { console.log('[INV-B07] onLockInput chamado'); lockInput() },
```

### l) onUnlockInput (V2, linha 134)

```
134:     onUnlockInput: (delay) => { console.log('[INV-B08] onUnlockInput chamado', { delay }); unlockInput(delay) },
```
