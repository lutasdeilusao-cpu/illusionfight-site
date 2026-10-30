// Regras do quadro de tarefas: colunas, a ação principal de cada cartão e quem pode fazê-la.
// Fluxo: a fazer → em progresso → em teste → feito → arquivo. Em teste, só o revisor aprova ou reprova.

export const COLUNAS = ['fazer', 'progresso', 'teste', 'feito', 'arquivo']
export const PRIORIDADES = ['alta', 'normal', 'baixa']
export const VAZIA = { titulo: '', descricao: '', para: '', revisor: '', prioridade: 'normal', prazo: '', status: 'fazer', link: '' }

export const chave = x => `LDI-${x.id}`
export const colunaDe = x => (x.arquivada ? 'arquivo' : x.status)
export const primeiroNome = n => (n || '').split(' ')[0]
export const iniciais = n => (n || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('')

/** Hoje no relógio de Brasília (AAAA-MM-DD). */
export const hojeBR = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())

export const atrasada = x => !x.arquivada && x.status !== 'feito' && x.prazo && x.prazo < hojeBR()

/** Quem revisa: o revisor marcado; sem revisor, quem pediu (se não for quem faz). */
export const revisorDe = x => x.revisor || (x.pedido_por && x.pedido_por !== x.para ? x.pedido_por : null)

/** Revisor sugerido ao escolher quem faz: a outra pessoa da equipe. */
export function revisorSugerido(para, pessoas, eu) {
  const outro = pessoas.find(p => p.id !== (para || eu))
  return outro?.id || ''
}

/**
 * Ação principal do cartão para quem está olhando.
 * Devolve { rotulo, para, comentario?, bloqueada? } ou null.
 */
export function acaoDe(x, eu) {
  const col = colunaDe(x)
  if (col === 'fazer') return { rotulo: 'comecar', para: 'progresso' }
  if (col === 'progresso') return { rotulo: 'pra_teste', para: 'teste' }
  if (col === 'teste') {
    const rev = revisorDe(x)
    if (!rev || rev === eu) return { rotulo: 'aprovar', para: 'feito', reprovar: { rotulo: 'reprovar', para: 'progresso', comentario: true } }
    return { rotulo: 'aguardando', bloqueada: true }
  }
  if (col === 'feito') return { rotulo: 'arquivar', para: 'arquivo' }
  return { rotulo: 'reabrir', para: 'fazer' }
}

/** Ordem dentro da coluna: atrasadas, prioridade, prazo, mais nova. */
export function ordenar(a, b) {
  return (atrasada(b) - atrasada(a))
    || PRIORIDADES.indexOf(a.prioridade) - PRIORIDADES.indexOf(b.prioridade)
    || (a.prazo || '9').localeCompare(b.prazo || '9')
    || b.id - a.id
}

export const FILTROS = {
  tudo: () => true,
  comigo: (x, eu) => !x.para || x.para === eu,
  revisar: (x, eu) => colunaDe(x) === 'teste' && revisorDe(x) === eu,
  pedi: (x, eu) => x.pedido_por === eu && x.para !== eu,
  alta: x => x.prioridade === 'alta',
}
