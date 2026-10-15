// Seção "Tarefas": kanban entre os sócios (a fazer / em progresso / feito).
// Dados só pelas RPCs admin_* (migration 058); a tabela não tem policy.
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { rpc } from './painelUtil'
import './PainelTarefas.css'

const COLUNAS = ['fazer', 'progresso', 'feito']
const PRIORIDADES = ['alta', 'normal', 'baixa']
const VAZIA = { titulo: '', descricao: '', para: '', prioridade: 'normal', prazo: '', status: 'fazer' }
const primeiroNome = n => (n || '').split(' ')[0]

export default function PainelTarefas({ t, locale }) {
  const { user } = useAuth()
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

  const mover = async (x, dir) => {
    const novo = COLUNAS[COLUNAS.indexOf(x.status) + dir]
    if (!novo) return
    setTarefas(ts => ts.map(y => (y.id === x.id ? { ...y, status: novo } : y)))
    await rpc('admin_tarefa_mover', { p_id: x.id, p_status: novo }).catch(() => {})
    carregar()
  }
  const salvar = async () => {
    await rpc('admin_tarefa_salvar', { p: edit })
    setEdit(null); carregar()
  }
  const apagar = async id => {
    await rpc('admin_tarefa_apagar', { p_id: id })
    setEdit(null); carregar()
  }
  const data = d => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: '2-digit', month: 'short' })

  if (erro) return <p className="painel-erro">{erro}</p>
  if (!tarefas) return <p className="painel-vazio">{t('painel.carregando')}</p>

  if (edit) {
    return (
      <form className="tarefa-form painel-cartao" onSubmit={e => { e.preventDefault(); salvar() }}>
        <h3 className="tarefa-form__titulo">{edit.id ? t('painel.tarefas.editar') : t('painel.tarefas.nova')}</h3>
        <label>{t('painel.tarefas.titulo')}<input value={edit.titulo} onChange={e => setEdit({ ...edit, titulo: e.target.value })} required autoFocus /></label>
        <label>{t('painel.tarefas.descricao')}<textarea rows={4} value={edit.descricao || ''} onChange={e => setEdit({ ...edit, descricao: e.target.value })} /></label>
        <div className="tarefa-form__linha">
          <label>{t('painel.tarefas.para')}
            <select value={edit.para || ''} onChange={e => setEdit({ ...edit, para: e.target.value })}>
              <option value="">{t('painel.tarefas.os_dois')}</option>
              {pessoas.map(p => <option key={p.id} value={p.id}>{primeiroNome(p.nome)}</option>)}
            </select>
          </label>
          <label>{t('painel.tarefas.prazo')}<input type="date" value={edit.prazo || ''} onChange={e => setEdit({ ...edit, prazo: e.target.value })} /></label>
        </div>
        <div className="tarefa-form__linha">
          <label>{t('painel.tarefas.prioridade')}
            <select value={edit.prioridade} onChange={e => setEdit({ ...edit, prioridade: e.target.value })}>
              {PRIORIDADES.map(p => <option key={p} value={p}>{t(`painel.tarefas.prio.${p}`)}</option>)}
            </select>
          </label>
          <label>{t('painel.tarefas.status')}
            <select value={edit.status} onChange={e => setEdit({ ...edit, status: e.target.value })}>
              {COLUNAS.map(c => <option key={c} value={c}>{t(`painel.tarefas.col.${c}`)}</option>)}
            </select>
          </label>
        </div>
        <div className="painel-form__acoes">
          <button type="submit" className="painel-btn is-primario">{t('painel.salvar')}</button>
          <button type="button" className="painel-btn" onClick={() => setEdit(null)}>{t('painel.cancelar')}</button>
          {edit.id && <button type="button" className="painel-btn is-perigo" onClick={() => apagar(edit.id)}>{t('painel.tarefas.apagar')}</button>}
        </div>
      </form>
    )
  }

  return (
    <div className="tarefas">
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
                <button type="button" className="tarefa__corpo" onClick={() => setEdit({ ...VAZIA, ...x, para: x.para || '', prazo: x.prazo || '' })}>
                  <strong>{x.titulo}</strong>
                  {x.descricao && <span className="tarefa__desc">{x.descricao}</span>}
                  <span className="tarefa__meta">
                    <em className="tarefa__para">{nome(x.para)}</em>
                    {x.pedido_por && <span>{t('painel.tarefas.pedido_por', { n: nome(x.pedido_por) })}</span>}
                    {x.prazo && <span className="tarefa__prazo">{data(x.prazo)}</span>}
                  </span>
                </button>
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
    </div>
  )
}
