// Seção "Tarefas": kanban entre os sócios (a fazer / em progresso / feito).
// Dados só pelas RPCs admin_* (migration 058); a tabela não tem policy.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { rpc } from './painelUtil'
import PainelTarefaModal from './PainelTarefaModal'
import './PainelTarefas.css'

const COLUNAS = ['fazer', 'progresso', 'feito']
const PRIORIDADES = ['alta', 'normal', 'baixa']
const VAZIA = { titulo: '', descricao: '', para: '', prioridade: 'normal', prazo: '', status: 'fazer', link: '', feedback: '' }
const primeiroNome = n => (n || '').split(' ')[0]

export default function PainelTarefas({ t, locale }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const eu = user?.id
  const [tarefas, setTarefas] = useState(null)
  const [pessoas, setPessoas] = useState([])
  const [coluna, setColuna] = useState('fazer')
  const [filtro, setFiltro] = useState('todas')
  const [edit, setEdit] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = () => rpc('admin_tarefas_listar').then(setTarefas).catch(e => setErro(e.faltaMigration ? t('painel.falta_migration') : e.message))
  useEffect(() => {
    carregar()
    rpc('admin_pessoas').then(setPessoas).catch(() => {})
  }, [])

  const socio = pessoas.find(p => p.id !== eu)
  const nome = id => (id ? primeiroNome(pessoas.find(p => p.id === id)?.nome) || '?' : t('painel.tarefas.os_dois'))
  const hoje = new Date().toISOString().slice(0, 10)

  const FILTROS = {
    todas: () => true,
    minhas: x => !x.para || x.para === eu,
    socio: x => !x.para || x.para === socio?.id,
    pedi: x => x.pedido_por === eu && x.para && x.para !== eu,
  }
  const visiveis = useMemo(() => (tarefas || []).filter(FILTROS[filtro]), [tarefas, filtro, eu, socio?.id])
  const daColuna = visiveis.filter(x => x.status === coluna)
    .sort((a, b) => PRIORIDADES.indexOf(a.prioridade) - PRIORIDADES.indexOf(b.prioridade) || (a.prazo || '9').localeCompare(b.prazo || '9'))

  const mover = (x, dir) => moverPara(x, COLUNAS[COLUNAS.indexOf(x.status) + dir])
  const moverPara = async (x, novo) => {
    if (!novo) return
    setTarefas(ts => ts.map(y => (y.id === x.id ? { ...y, status: novo } : y)))
    setEdit(e => (e && e.id === x.id ? { ...e, status: novo } : e))
    await rpc('admin_tarefa_mover', { p_id: x.id, p_status: novo }).catch(() => {})
    carregar()
  }
  // Iniciar: passa pra Em progresso e abre o lugar da tarefa.
  const iniciar = async x => {
    if (x.status === 'fazer') await rpc('admin_tarefa_mover', { p_id: x.id, p_status: 'progresso' }).catch(() => {})
    navigate(x.link)
  }
  const semana = new Date(Date.now() - 7 * 86400000).toISOString()
  const placar = pessoas.map(pe => {
    const delas = (tarefas || []).filter(x => !x.para || x.para === pe.id)
    return { id: pe.id, nome: primeiroNome(pe.nome), fazer: delas.filter(x => x.status === 'fazer').length,
      progresso: delas.filter(x => x.status === 'progresso').length, feito: delas.filter(x => x.status === 'feito' && x.feito_em > semana).length }
  })

  const salvar = async tarefa => {
    await rpc('admin_tarefa_salvar', { p: tarefa })
    carregar()
  }
  const apagar = async id => {
    await rpc('admin_tarefa_apagar', { p_id: id })
    carregar()
  }
  const abrir = x => setEdit({ ...VAZIA, ...x, para: x.para || '', prazo: x.prazo || '' })
  const data = d => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: '2-digit', month: 'short' })

  if (erro) return <p className="painel-erro">{erro}</p>
  if (!tarefas) return <p className="painel-vazio">{t('painel.carregando')}</p>

  return (
    <div className="tarefas">
      <div className="tarefas-placar">
        {placar.map(pe => (
          <div key={pe.id} className={`tarefas-placar__pessoa${pe.id === eu ? ' is-eu' : ''}`}>
            <b>{pe.nome}</b>
            <span><i className="is-fazer">{pe.fazer}</i>{t('painel.tarefas.col.fazer')}</span>
            <span><i className="is-progresso">{pe.progresso}</i>{t('painel.tarefas.col.progresso')}</span>
            <span><i className="is-feito">{pe.feito}</i>{t('painel.tarefas.feito_semana')}</span>
          </div>
        ))}
      </div>

      <div className="tarefas-filtros">
        {Object.keys(FILTROS).map(f => (
          <button key={f} type="button" className={`painel-chip${filtro === f ? ' is-ativo' : ''}`} onClick={() => setFiltro(f)}>
            {t(`painel.tarefas.filtro.${f}`, { socio: primeiroNome(socio?.nome) || '—' })}
          </button>
        ))}
      </div>

      <nav className="tarefas-colunas" role="tablist">
        {COLUNAS.map(c => (
          <button key={c} type="button" role="tab" aria-selected={coluna === c} className={`is-${c}${coluna === c ? ' is-ativa' : ''}`} onClick={() => setColuna(c)}>
            <span>{t(`painel.tarefas.col.${c}`)}</span>
            <b>{visiveis.filter(x => x.status === c).length}</b>
          </button>
        ))}
      </nav>

      {!daColuna.length ? <p className="painel-vazio">{t('painel.tarefas.vazio')}</p> : (
        <ul className="tarefas-lista">
          {daColuna.map(x => {
            const atrasada = x.status !== 'feito' && x.prazo && x.prazo < hoje
            return (
              <li key={x.id} className={`tarefa is-${x.prioridade}${atrasada ? ' is-atrasada' : ''}`}>
                <button type="button" className="tarefa__corpo" onClick={() => abrir(x)}>
                  <strong>{x.titulo}</strong>
                  {x.descricao && <span className="tarefa__desc">{x.descricao}</span>}
                  <span className="tarefa__meta">
                    <em className="tarefa__para">{nome(x.para)}</em>
                    {x.pedido_por && <span>{t('painel.tarefas.pedido_por', { n: nome(x.pedido_por) })}</span>}
                    {x.prazo && <span className="tarefa__prazo">{data(x.prazo)}</span>}
                  </span>
                  {x.feedback && <span className="tarefa__feedback">💬 {x.feedback}</span>}
                </button>
                {x.link && x.status !== 'feito' && (
                  <button type="button" className="tarefa__iniciar" onClick={() => iniciar(x)}>
                    ▶ {t(x.status === 'fazer' ? 'painel.tarefas.iniciar' : 'painel.tarefas.continuar')}
                  </button>
                )}
                <div className="tarefa__acoes">
                  <button type="button" disabled={x.status === 'fazer'} onClick={() => mover(x, -1)} aria-label={t('painel.tarefas.voltar')}>‹</button>
                  <button type="button" disabled={x.status === 'feito'} onClick={() => mover(x, 1)} aria-label={t('painel.tarefas.avancar')}>›</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <button type="button" className="tarefas-nova painel-btn is-primario" onClick={() => setEdit({ ...VAZIA, status: coluna })}>+ {t('painel.tarefas.nova')}</button>

      {edit && (
        <PainelTarefaModal key={edit.id || 'nova'} tarefa={edit} pessoas={pessoas} t={t} locale={locale} nome={nome}
          onFechar={() => setEdit(null)} onSalvar={salvar} onApagar={apagar} onMover={moverPara} onIniciar={iniciar} />
      )}
    </div>
  )
}
