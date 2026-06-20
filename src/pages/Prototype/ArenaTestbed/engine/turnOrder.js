export function buildOrderFromCharacters(aliveChars) {
  const sorted = [...aliveChars].sort((a, b) => b.agi - a.agi)
  const agiGroups = {}
  sorted.forEach(ch => {
    if (!agiGroups[ch.agi]) agiGroups[ch.agi] = []
    agiGroups[ch.agi].push(ch)
  })
  const grupos = Object.values(agiGroups).sort((a, b) => b[0].agi - a[0].agi)

  const ordemParcial = []
  const empatesInternosJogador = []
  const empatesCruzados = []

  for (const grupo of grupos) {
    if (grupo.length === 1) { ordemParcial.push(grupo[0]); continue }
    const jogadores = grupo.filter(c => c.time === 'jogador')
    const ias = grupo.filter(c => c.time === 'ia')
    if (ias.length === 0) {
      ordemParcial.push(...jogadores)
      empatesInternosJogador.push({ agi: grupo[0].agi, chars: jogadores })
    } else if (jogadores.length === 0) {
      ordemParcial.push(...[...ias].sort(() => Math.random() - 0.5))
    } else {
      const shuffledIas = [...ias].sort(() => Math.random() - 0.5)
      ordemParcial.push(...jogadores, ...shuffledIas)
      empatesInternosJogador.push({ agi: grupo[0].agi, chars: jogadores })
      empatesCruzados.push({ agi: grupo[0].agi, jogadores, ias: shuffledIas })
    }
  }
  return { ordemParcial, empatesInternosJogador, empatesCruzados }
}

export function confirmarOrdemInterna(
  baseOrder, playerTeamOrder, crossTieQueue, crossTieResults,
) {
  let jogadorIdx = 0
  const novaOrdem = baseOrder.map(c => {
    if (c.time === 'jogador') return playerTeamOrder[jogadorIdx++]
    return c
  })

  if (crossTieQueue.length > 0) {
    return {
      result: 'cross_tie',
      ordem: novaOrdem,
      queue: crossTieQueue,
      results: crossTieResults,
    }
  }

  return {
    result: 'done',
    ordem: novaOrdem,
    order: novaOrdem.map(c => c.id),
  }
}

export function iniciarProximoJokenpoCruzado(
  queue, ordemAtual, crossTieResults,
) {
  if (queue.length === 0) {
    const ordemFinal = aplicarOrdemCruzada(ordemAtual, crossTieResults)
    return { result: 'done', ordem: ordemFinal, order: ordemFinal.map(c => c.id) }
  }

  const grupo = queue[0]
  const jogadoresRestantes = grupo.jogadores.filter(j =>
    !crossTieResults.some(r => r.winner?.id === j.id || r.loser?.id === j.id)
  )
  const iasRestantes = grupo.ias.filter(ia =>
    !crossTieResults.some(r => r.winner?.id === ia.id || r.loser?.id === ia.id)
  )

  if (jogadoresRestantes.length === 0 || iasRestantes.length === 0) {
    return iniciarProximoJokenpoCruzado(queue.slice(1), ordemAtual, crossTieResults)
  }

  return {
    result: 'jokenpo',
    playerChar: jogadoresRestantes[0],
    iaChar: iasRestantes[0],
    grupoAgi: grupo.agi,
    remainingQueue: queue,
  }
}

export function handleJokenpoResultCruzado(winnerName, crossTieState, crossTieResults) {
  const { playerChar, iaChar, remainingQueue } = crossTieState
  const winner = winnerName === playerChar.nome ? playerChar : iaChar
  const loser = winner.id === playerChar.id ? iaChar : playerChar
  const newResults = [...crossTieResults, { winner, loser }]
  return { winner, loser, newResults }
}

export function aplicarOrdemCruzada(ordemBase, crossTieResults) {
  const results = crossTieResults
  const novaOrdem = [...ordemBase]

  for (const grupo of [...new Set(results.map(r => r.winner.agi))]) {
    const blocoIdx = []
    novaOrdem.forEach((c, i) => {
      if (c.agi === grupo && results.some(r => r.winner.id === c.id || r.loser.id === c.id)) blocoIdx.push(i)
    })
    if (blocoIdx.length === 0) continue

    const winners = results.filter(r => r.winner.agi === grupo).map(r => r.winner)
    const losers = results.filter(r => r.loser.agi === grupo).map(r => r.loser)
    const bloco = blocoIdx.map(i => novaOrdem[i])

    const winnerOrdem = winners.filter(w => bloco.some(b => b.id === w.id))
    const loserOrdem = losers.filter(l => bloco.some(b => b.id === l.id))
    const blocoOrdenado = []
    const maxLen = Math.max(winnerOrdem.length, loserOrdem.length)
    for (let i = 0; i < maxLen; i++) {
      if (winnerOrdem[i]) blocoOrdenado.push(winnerOrdem[i])
      if (loserOrdem[i]) blocoOrdenado.push(loserOrdem[i])
    }
    blocoIdx.forEach((pos, i) => {
      if (blocoOrdenado[i]) novaOrdem[pos] = blocoOrdenado[i]
    })
  }

  return novaOrdem
}