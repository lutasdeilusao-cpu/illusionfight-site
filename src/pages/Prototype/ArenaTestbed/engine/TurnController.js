/**
 * TurnController — Orquestrador único de turno
 *
 * Módulo puro (sem JSX, sem React). Estado interno nunca exposto diretamente.
 * Toda interação com turno passa exclusivamente pela API pública.
 *
 * Uso:
 *   import * as tc from './TurnController'
 *   tc.inicializar(['id1','id2','id3'])
 *   tc.quemEstaNaVez()           // → 'id1'
 *   tc.avancarTurno()            // → 'id2'
 *   tc.podeAgir('id2', 'mover')  // → true
 */

const state = {
  ordem: [],
  posicaoAtual: 0,
  acoesDoTurno: { moveu: false, atacou: false },
  mortos: new Set(),
  versao: 0,
}

function log(acao, detalhes) {
  const vivos = state.ordem.filter(id => !state.mortos.has(id))
  const info = {
    posicao: state.posicaoAtual,
    ordem: `[${state.ordem.join(',')}]`,
    vivos: `[${vivos.join(',')}]`,
    ...detalhes,
  }
  console.log(`[TURN_CONTROLLER] ${acao}`, info)
}

export function getVersao() {
  return state.versao
}

export function inicializar(ordemDefinida) {
  state.ordem = [...ordemDefinida]
  state.posicaoAtual = 0
  state.acoesDoTurno = { moveu: false, atacou: false }
  state.mortos = new Set()
  state.versao++
  log('inicializar', { ordem: `[${ordemDefinida.join(',')}]` })
  return state.ordem[0] || null
}

export function quemEstaNaVez() {
  if (state.ordem.length === 0) return null
  const id = state.ordem[state.posicaoAtual]
  if (!id) return null
  return id
}

export function podeAgir(personagemId, tipoAcao) {
  const atual = quemEstaNaVez()
  if (!atual) {
    log('podeAgir:NEGADO', { motivo: 'ninguem_na_vez', personagemId, tipoAcao })
    return false
  }
  if (atual !== personagemId) {
    log('podeAgir:NEGADO', { motivo: 'nao_e_a_vez_dele', personagemId, vezDe: atual, tipoAcao })
    return false
  }
  if (state.mortos.has(personagemId)) {
    log('podeAgir:NEGADO', { motivo: 'personagem_morto', personagemId, tipoAcao })
    return false
  }
  if (tipoAcao === 'mover' && state.acoesDoTurno.moveu) {
    log('podeAgir:NEGADO', { motivo: 'ja_moveu', personagemId, tipoAcao })
    return false
  }
  if (tipoAcao === 'atacar' && state.acoesDoTurno.atacou) {
    log('podeAgir:NEGADO', { motivo: 'ja_atacou', personagemId, tipoAcao })
    return false
  }
  return true
}

export function registrarAcao(personagemId, tipoAcao) {
  if (!podeAgir(personagemId, tipoAcao)) return false
  if (tipoAcao === 'mover') state.acoesDoTurno.moveu = true
  if (tipoAcao === 'atacar') state.acoesDoTurno.atacou = true
  log('registrarAcao', { personagemId, tipoAcao, acoes: { ...state.acoesDoTurno } })
  state.versao++
  return true
}

export function avancarTurno() {
  const antigoId = quemEstaNaVez()
  const ordem = state.ordem
  if (ordem.length === 0) return null

  let tentativas = 0
  let encontrou = false
  let novoId = null

  while (tentativas < ordem.length) {
    state.posicaoAtual = (state.posicaoAtual + 1) % ordem.length
    novoId = ordem[state.posicaoAtual]
    tentativas++
    if (novoId && !state.mortos.has(novoId)) {
      encontrou = true
      break
    }
  }

  state.acoesDoTurno = { moveu: false, atacou: false }
  state.versao++

  if (!encontrou) {
    log('avancarTurno:TODOS_MORTOS', { antigoId })
    return null
  }

  const mortosPulados = tentativas - 1
  log('avancarTurno', { de: antigoId, para: novoId, mortosPulados, posicao: state.posicaoAtual })
  return novoId
}

export function marcarMorto(personagemId) {
  state.mortos.add(personagemId)
  state.versao++
  log('marcarMorto', { personagemId, totalMortos: state.mortos.size })
}

export function estaVivo(personagemId) {
  return !state.mortos.has(personagemId)
}

export function getOrdemCompleta() {
  return [...state.ordem]
}

export function getAcoesDoTurno() {
  return { ...state.acoesDoTurno }
}
