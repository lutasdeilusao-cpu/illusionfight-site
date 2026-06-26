/**
 * turnOrder — Funções puras de cálculo de ordem de turno
 *
 * Separação clara:
 * - Cálculo puro → funções exportadas (aqui)
 * - Estado de UI/React → em Phase6Combat.jsx (orquestrador)
 *
 * Regras de negócio (validadas):
 * - AGI maior → primeiro na fila (decrescente)
 * - Empate interno (2+ jogadores, sem IA) → reordenação manual
 * - Empate cruzado (jogador + IA) → Jokenpo
 * - Empate só entre IAs → aleatório
 * - Ordem definida uma vez, vale a partida inteira
 */

export function calcularGruposEOrdem(characters) {
  const alive = characters.filter(c => c.vivo)
  const sorted = [...alive].sort((a, b) => b.agi - a.agi)

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
    if (grupo.length === 1) {
      ordemParcial.push(grupo[0])
      continue
    }
    const jogadores = grupo.filter(c => c.time === 'jogador')
    const ias = grupo.filter(c => c.time === 'ia')

    if (ias.length === 0) {
      ordemParcial.push(...jogadores)
      if (jogadores.length >= 2) {
        empatesInternosJogador.push({ agi: grupo[0].agi, chars: jogadores })
      }
    } else if (jogadores.length === 0) {
      const shuffled = [...ias].sort(() => Math.random() - 0.5)
      ordemParcial.push(...shuffled)
    } else {
      const shuffledIas = [...ias].sort(() => Math.random() - 0.5)
      ordemParcial.push(...jogadores, ...shuffledIas)
      if (jogadores.length >= 2) {
        empatesInternosJogador.push({ agi: grupo[0].agi, chars: jogadores })
      }
      empatesCruzados.push({ agi: grupo[0].agi, jogadores, ias: shuffledIas })
    }
  }

  return { ordemParcial, empatesInternosJogador, empatesCruzados }
}

export function aplicarOrdemInterna(ordemBase, playerTeamOrder) {
  let jogadorIdx = 0
  return ordemBase.map(c => {
    if (c.time === 'jogador') return playerTeamOrder[jogadorIdx++]
    return c
  })
}

export function encontrarProximoJokenpo(queue, crossTieResults) {
  if (queue.length === 0) return null

  const grupo = queue[0]
  const jogadoresRestantes = grupo.jogadores.filter(j =>
    !crossTieResults.some(r => r.winner?.id === j.id || r.loser?.id === j.id)
  )
  const iasRestantes = grupo.ias.filter(ia =>
    !crossTieResults.some(r => r.winner?.id === ia.id || r.loser?.id === ia.id)
  )

  if (jogadoresRestantes.length === 0 || iasRestantes.length === 0) {
    return { grupo, salto: true, remainingQueue: queue.slice(1) }
  }

  return {
    grupo,
    salto: false,
    playerChar: jogadoresRestantes[0],
    iaChar: iasRestantes[0],
    remainingQueue: queue,
  }
}

export function processarResultadoJokenpo(playerChar, iaChar, winnerName) {
  const winner = winnerName === playerChar.nome ? playerChar : iaChar
  const loser = winner.id === playerChar.id ? iaChar : playerChar
  return { winner, loser }
}

export function aplicarResultadosCruzados(ordemBase, crossTieResults) {
  const novaOrdem = [...ordemBase]

  for (const grupo of [...new Set(crossTieResults.map(r => r.winner.agi))]) {
    const blocoIdx = []
    novaOrdem.forEach((c, i) => {
      if (c.agi === grupo && crossTieResults.some(r => r.winner.id === c.id || r.loser.id === c.id)) blocoIdx.push(i)
    })
    if (blocoIdx.length === 0) continue

    const winners = crossTieResults.filter(r => r.winner.agi === grupo).map(r => r.winner)
    const losers = crossTieResults.filter(r => r.loser.agi === grupo).map(r => r.loser)
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
