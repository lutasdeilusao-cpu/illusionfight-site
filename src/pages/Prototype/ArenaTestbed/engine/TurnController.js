export const TipoAcao = Object.freeze({
  MOVER: 'mover',
  ATACAR: 'atacar',
  USAR_PODER: 'usar_poder',
  USAR_ITEM: 'usar_item',
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
