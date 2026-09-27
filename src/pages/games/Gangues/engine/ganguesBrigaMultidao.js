import { resolveGanguesAction } from './ganguesCombatResolver.js'
import { iniciarLinhaDoTempo, proximaVez, consumirVez, marcarAgiu, ordemDeVelocidade } from './ganguesLinhaDoTempo.js'
import { prepare, pickEnemyTarget } from '../hooks/useGanguesTurnMachine.js'

/* ══════════════════════════════════════════════════════════════
   BRIGA EM MULTIDÃO — RODADA a rodada, não a luta inteira de um clique.

   O jogo é por turno: cada clique em "avançar rodada" resolve UMA rodada
   completa (todo mundo vivo age pelo menos uma vez, na ordem da linha do
   tempo do Pique — o mais rápido pode agir 2-3 vezes — jogador
   focando o inimigo mais fraco, inimigo com a IA de sempre) e PARA. O
   jogador vê o resultado daquela rodada e decide se continua. Só o alvo
   automático (em vez de escolher manualmente) e o dano em lote (em vez de
   um DramaticDice por golpe) são "rápidos" — o ritmo de jogo (uma decisão
   por rodada) continua igual ao combate normal.

   Usa exatamente as mesmas contas do combate normal (mesmo
   resolveGanguesAction, mesmo prepare/pickEnemyTarget da
   useGanguesTurnMachine).
   ══════════════════════════════════════════════════════════════ */

const d3 = () => Math.floor(Math.random() * 3) + 1

function podePagarCusto(actor, special) {
  if (!special) return true
  const cost = special.effect?.cost
  if (!cost) return true
  const value = cost.values[special.level - 1]
  if (cost.kind === 'pm') return (actor.pm || 0) >= value
  if (cost.kind === 'pv') return (actor.pv || 0) > 1
  return true
}

function montar(combatants, round, eventosIniciais) {
  const t0 = iniciarLinhaDoTempo(combatants)
  const initiative = ordemDeVelocidade(combatants, t0)
  return {
    combatants, tempo: t0, initiative, round, lastEnemyTargetKey: null,
    terminado: false, outcome: null,
    eventosIniciais: eventosIniciais || [],
    seq: 0,
  }
}

/** Monta o estado inicial da briga (times preparados + linha do tempo). Nenhuma rodada resolvida ainda. */
export function iniciarBrigaMultidao({ playerTeam, enemyTeam }) {
  const combatants = [
    ...playerTeam.map((m, i) => prepare(m, 'player', i)),
    ...enemyTeam.map((m, i) => prepare(m, 'enemy', i)),
  ]
  return montar(combatants, 1, [{ type: 'battle_start', id: 'bm-start' }])
}

/** Como iniciarBrigaMultidao, mas a partir de combatentes JÁ preparados (com
 *  pv/pm/status atuais) — usado ao LIGAR o switch no meio da luta. Recebe a
 *  linha do tempo viva do motor normal (`tempo`) pra continuar de onde ele
 *  parou — quem já agiu nessa rodada continua marcado (`actedThisRound`), sem
 *  ação extra de graça (exploit de 14/09/2026). */
export function iniciarBrigaMultidaoDeCombatentes(combatants, roundAtual = 1, tempo = null) {
  const clone = combatants.map(c => ({ ...c }))
  const estado = montar(clone, roundAtual, null)
  if (tempo) { estado.tempo = tempo; estado.initiative = ordemDeVelocidade(clone, tempo) }
  return estado
}

/** Resolve UMA rodada a partir do estado atual — roda a linha do tempo até
 *  todo vivo ter agido (a rodada fechar) ou a luta acabar. Retorna o novo
 *  estado + os eventos só dessa rodada.
 *  poderesPorPersonagem/especiaisPorPersonagem são lidos a cada chamada — o jogador pode trocar o poder entre uma rodada e outra.
 *  personagensUsandoItem: { [memberId]: true } — quem marcou "usar item" abre mão do ataque (gasta a vez). */
export function avancarRodadaMultidao(estado, poderesPorPersonagem = {}, especiaisPorPersonagem = {}, personagensUsandoItem = {}) {
  let lista = estado.combatants.map(c => ({ ...c }))
  let { tempo, round, lastEnemyTargetKey, seq } = estado
  const rodadaAlvo = round
  const eventosRodada = []
  const get = key => lista.find(c => c.key === key)

  const checarFim = () => {
    const playersAlive = lista.some(c => c.side === 'player' && c.pv > 0)
    const enemiesAlive = lista.some(c => c.side === 'enemy' && c.pv > 0)
    if (playersAlive && enemiesAlive) return null
    return enemiesAlive ? 'defeat' : 'victory'
  }

  let outcome = checarFim()
  let guarda = 0
  while (!outcome && guarda++ < 200) {
    const vez = proximaVez(lista, tempo)
    tempo = vez.tempo
    const actor = get(vez.key)
    if (!actor) break
    let usouTalento = false

    if (actor.side === 'player' && personagensUsandoItem[actor.id]) {
      seq += 1
      eventosRodada.push({ type: 'item', id: `bm-${seq}`, actorKey: actor.key, round: rodadaAlvo })
    } else {
      let target = null
      let activeSpecialId = null
      if (actor.side === 'player') {
        // Foca sempre o inimigo mais perto de cair — eficiente pra limpar um bando grande.
        target = lista.filter(c => c.side === 'enemy' && c.pv > 0).sort((a, b) => a.pv - b.pv)[0] || null
        const especiais = especiaisPorPersonagem[actor.id] || []
        const escolhaId = poderesPorPersonagem[actor.id] || null
        const especial = escolhaId ? especiais.find(s => s.id === escolhaId) : null
        activeSpecialId = especial && podePagarCusto(actor, especial) ? escolhaId : null
      } else {
        target = pickEnemyTarget(lista, lastEnemyTargetKey, Math.random)
        lastEnemyTargetKey = target?.key || null
      }
      if (target) {
        const result = resolveGanguesAction({
          attacker: actor, defender: target, action: { type: 'attack', mode: 'attack' },
          rolls: { fa: d3(), fd: d3() },
          activeSpecialId,
        })
        usouTalento = Boolean(result.activeSpecialId)
        lista = lista.map(c => {
          if (c.key === actor.key) return { ...c, statuses: result.attackerStatuses, pm: Math.max(0, c.pm - result.pmCost), pv: Math.max(0, c.pv - (result.pvCost || 0)), specialState: result.attackerSpecialState }
          if (c.key === target.key) return { ...c, statuses: result.defenderStatuses, pv: Math.max(0, c.pv - result.damage), specialState: result.defenderSpecialState }
          return c
        })
        seq += 1
        eventosRodada.push({ type: 'attack', id: `bm-${seq}`, side: actor.side, actorKey: actor.key, targetKey: target.key, result, round: rodadaAlvo })
      }
    }

    tempo = consumirVez(tempo, actor.key, usouTalento)
    outcome = checarFim()
    if (outcome) break
    const marcado = marcarAgiu(lista, actor.key)
    lista = marcado.combatants
    if (marcado.fechouRodada) { round += 1; break }
  }

  if (!outcome) outcome = checarFim()
  return {
    combatants: lista, tempo, initiative: ordemDeVelocidade(lista, tempo), round, lastEnemyTargetKey, seq,
    terminado: Boolean(outcome), outcome: outcome || null,
    eventosRodada,
  }
}
