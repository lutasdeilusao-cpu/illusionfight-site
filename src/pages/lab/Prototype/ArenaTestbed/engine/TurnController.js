export const TipoAcao = Object.freeze({
  MOVER: 'mover',
  ATACAR: 'atacar',
  USAR_PODER: 'usar_poder',
  USAR_ITEM: 'usar_item',
  CARREGAR_PODER: 'carregar_poder',
})

const CHAVES_ACAO = Object.values(TipoAcao)

function criarAcoes() {
  const acoes = {}
  CHAVES_ACAO.forEach(k => { acoes[k] = false })
  return acoes
}

const state = {
  ordem: [],
  posicaoAtual: 0,
  acoesDoTurno: criarAcoes(),
  mortos: new Set(),
  versao: 0,
  onTurnoIniciadoCallbacks: [],
  agendamentos: new Map(),
  agendamentoListoCallbacks: [],
  restricoes: new Map(),
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

function validarTipoAcao(tipoAcao) {
  if (!CHAVES_ACAO.includes(tipoAcao)) {
    console.error(
      `[TURN_CONTROLLER] ERRO: tipoAcao inválido recebido: "${tipoAcao}". ` +
      `Valores aceitos: ${CHAVES_ACAO.join(', ')}`
    )
    return false
  }
  return true
}

export function getVersao() {
  return state.versao
}

export function inicializar(ordemDefinida) {
  state.ordem = [...ordemDefinida]
  state.posicaoAtual = 0
  state.acoesDoTurno = criarAcoes()
  state.mortos = new Set()
  state.agendamentos = new Map()
  state.restricoes = new Map()
  state.versao++
  log('inicializar', { ordem: `[${ordemDefinida.join(',')}]` })
  return state.ordem[0] || null
}

export function quemEstaNaVez() {
  if (state.ordem.length === 0) return null
  const id = state.ordem[state.posicaoAtual]
  if (!id) return null
  if (state.mortos.has(id)) return null
  return id
}

export function podeAgir(personagemId, tipoAcao) {
  if (!validarTipoAcao(tipoAcao)) return false

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
  if (state.acoesDoTurno[tipoAcao]) {
    log('podeAgir:NEGADO', { motivo: `ja_${tipoAcao}`, personagemId, tipoAcao })
    return false
  }
  const restricao = state.restricoes.get(personagemId)
  if (restricao) {
    const bloqueado = restricao.tiposBloqueados === '*' || restricao.tiposBloqueados.includes(tipoAcao)
    if (bloqueado) {
      log('podeAgir:NEGADO', { motivo: restricao.motivo, personagemId, tipoAcao })
      return false
    }
  }
  return true
}

export function registrarAcao(personagemId, tipoAcao) {
  if (!podeAgir(personagemId, tipoAcao)) return false
  state.acoesDoTurno[tipoAcao] = true
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

  state.acoesDoTurno = criarAcoes()

  if (!encontrou) {
    state.versao++
    log('avancarTurno:TODOS_MORTOS', { antigoId })
    return null
  }

  const agendamento = state.agendamentos.get(novoId)
  if (agendamento) {
    agendamento.turnosRestantes--
    log('avancarTurno:agendamento', { personagemId: novoId, turnosRestantes: agendamento.turnosRestantes })
    if (agendamento.turnosRestantes <= 0) {
      state.agendamentos.delete(novoId)
      state.agendamentoListoCallbacks.forEach(cb => {
        try { cb(novoId, agendamento) } catch (e) { console.error(e) }
      })
    }
  }

  state.versao++

  state.onTurnoIniciadoCallbacks.forEach(cb => {
    try { cb(novoId) } catch (e) { console.error(e) }
  })

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

export function onTurnoIniciado(callback) {
  state.onTurnoIniciadoCallbacks.push(callback)
  return () => {
    const i = state.onTurnoIniciadoCallbacks.indexOf(callback)
    if (i !== -1) state.onTurnoIniciadoCallbacks.splice(i, 1)
  }
}

export function agendarAcao(personagemId, { turnosRestantes, tipoAcao, meta = {} }) {
  state.agendamentos.set(personagemId, { turnosRestantes, tipoAcao, meta })
  state.versao++
  log('agendarAcao', { personagemId, turnosRestantes, tipoAcao })
}

export function getAgendamento(personagemId) {
  return state.agendamentos.get(personagemId) || null
}

export function onAgendamentoListo(callback) {
  state.agendamentoListoCallbacks.push(callback)
  return () => {
    const i = state.agendamentoListoCallbacks.indexOf(callback)
    if (i !== -1) state.agendamentoListoCallbacks.splice(i, 1)
  }
}

export function definirRestricao(personagemId, { tiposBloqueados, motivo }) {
  state.restricoes.set(personagemId, { tiposBloqueados, motivo })
  state.versao++
  log('definirRestricao', { personagemId, tiposBloqueados: JSON.stringify(tiposBloqueados), motivo })
}

export function removerRestricao(personagemId) {
  state.restricoes.delete(personagemId)
  state.versao++
  log('removerRestricao', { personagemId })
}

export function getRestricoes(personagemId) {
  return state.restricoes.get(personagemId) || null
}
