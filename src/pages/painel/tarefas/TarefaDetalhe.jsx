// Tarefa em tela cheia: campos, descrição, atividade (comentários + mudanças de status)
// e a ação principal no rodapé, ao alcance do dedão. A edição é na mesma tela; o que
// está sendo escrito vira rascunho no navegador, então recarregar não perde nada.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { rpc } from '../painelUtil'
import { Avatar } from './TarefaCartao'
import { PRIORIDADES, acaoDe, atrasada, chave, colunaDe, revisorDe, revisorSugerido } from './tarefasFluxo'

const chaveRascunho = id => `ldi-painel-tarefa-rascunho:${id || 'nova'}`
const ler = id => { try { return JSON.parse(localStorage.getItem(chaveRascunho(id)) || 'null') } catch { return null } }
const gravar = (id, d) => { try { localStorage.setItem(chaveRascunho(id), JSON.stringify(d)) } catch { /* sem storage */ } }
const limpar = id => { try { localStorage.removeItem(chaveRascunho(id)) } catch { /* sem storage */ } }

function TextoLongo({ value, onChange, ...resto }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
  return <textarea ref={ref} value={value} onChange={onChange} rows={3} {...resto} />
}

function Formulario({ tarefa, pessoas, eu, t, onCancelar, onSalvar, onApagar }) {
  const rascunho = ler(tarefa.id)
  const [form, setForm] = useState(rascunho || tarefa)
  const [salvando, setSalvando] = useState(false)
  const mudar = k => e => {
    const novo = { ...form, [k]: e.target.value }
    if (k === 'para' && (!form.revisor || form.revisor === revisorSugerido(form.para, pessoas, eu))) novo.revisor = revisorSugerido(novo.para, pessoas, eu)
    setForm(novo); gravar(tarefa.id, novo)
  }
  const mudou = JSON.stringify(form) !== JSON.stringify(tarefa)
  const cancelar = () => {
    if (mudou && !window.confirm(t('painel.tarefas.descartar'))) return
    limpar(tarefa.id); onCancelar()
  }
  const salvar = async e => {
    e.preventDefault(); setSalvando(true)
    try { await onSalvar(form); limpar(tarefa.id) } catch { setSalvando(false) }
  }
  const apagar = async () => {
    if (!window.confirm(t('painel.tarefas.confirmar_apagar'))) return
    limpar(tarefa.id); await onApagar(tarefa.id)
  }
  return (
    <form className="tq-folha__form" onSubmit={salvar}>
      <div className="tq-folha__corpo tq-form">
        {rascunho && <p className="tq-aviso">{t('painel.tarefas.rascunho_recuperado')}</p>}
        <label>{t('painel.tarefas.titulo')}<input value={form.titulo} onChange={mudar('titulo')} required autoFocus={!tarefa.id} /></label>
        <label>{t('painel.tarefas.descricao')}<TextoLongo value={form.descricao || ''} onChange={mudar('descricao')} /></label>
        <div className="tq-form__linha">
          <label>{t('painel.tarefas.responsavel')}
            <select value={form.para || ''} onChange={mudar('para')}>
              <option value="">{t('painel.tarefas.equipe')}</option>
              {pessoas.map(p => <option key={p.id} value={p.id}>{p.curto}</option>)}
            </select>
          </label>
          <label>{t('painel.tarefas.revisor')}
            <select value={form.revisor || ''} onChange={mudar('revisor')}>
              <option value="">{t('painel.tarefas.sem_revisor')}</option>
              {pessoas.map(p => <option key={p.id} value={p.id}>{p.curto}</option>)}
            </select>
          </label>
        </div>
        <div className="tq-form__linha">
          <label>{t('painel.tarefas.prioridade')}
            <select value={form.prioridade} onChange={mudar('prioridade')}>
              {PRIORIDADES.map(p => <option key={p} value={p}>{t(`painel.tarefas.prio.${p}`)}</option>)}
            </select>
          </label>
          <label>{t('painel.tarefas.prazo')}<input type="date" value={form.prazo || ''} onChange={mudar('prazo')} /></label>
        </div>
        <label>{t('painel.tarefas.link')}<input value={form.link || ''} placeholder="/webtoon/05" onChange={mudar('link')} /></label>
        {tarefa.id && <button type="button" className="tq-apagar" onClick={apagar}>{t('painel.tarefas.apagar')}</button>}
      </div>
      <footer className="tq-folha__base">
        <button type="button" className="tq-acao" onClick={cancelar}>{t('painel.cancelar')}</button>
        <button type="submit" className="tq-acao is-primaria" disabled={salvando || !form.titulo?.trim()}>{salvando ? '…' : t('painel.salvar')}</button>
      </footer>
    </form>
  )
}

export default function TarefaDetalhe({ tarefa, pessoas, pessoa, eu, t, locale, onFechar, onSalvar, onApagar, onAcao }) {
  const [editando, setEditando] = useState(!tarefa.id || Boolean(ler(tarefa.id)))
  const [eventos, setEventos] = useState([])
  const [texto, setTexto] = useState('')
  const [reprovando, setReprovando] = useState(false)

  const carregar = () => tarefa.id && rpc('admin_tarefa_eventos', { p_id: tarefa.id }).then(setEventos).catch(() => {})
  useEffect(() => { carregar() }, [tarefa.id, tarefa.status, tarefa.arquivada])
  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [])

  const quando = d => new Date(d).toLocaleString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const dia = d => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: '2-digit', month: 'long' })
  const acao = tarefa.id && acaoDe(tarefa, eu)
  const col = colunaDe(tarefa)

  const comentar = async () => {
    if (!texto.trim()) return
    if (reprovando) await onAcao(tarefa, { ...acao.reprovar, texto })
    else await rpc('admin_tarefa_comentar', { p_id: tarefa.id, p_texto: texto }).catch(() => {})
    setTexto(''); setReprovando(false); carregar()
  }

  return createPortal(
    <div className="tq-folha" role="dialog" aria-modal="true">
      <header className="tq-folha__topo">
        <button type="button" className="tq-folha__fechar" onClick={onFechar} aria-label={t('painel.tarefas.fechar')}>←</button>
        <span className="tq-chave">{tarefa.id ? chave(tarefa) : t('painel.tarefas.nova')}</span>
        {tarefa.id && !editando && <span className={`tq-status is-${col}`}>{t(`painel.tarefas.col.${col}`)}</span>}
        {tarefa.id && !editando && <button type="button" className="tq-folha__editar" onClick={() => setEditando(true)} aria-label={t('painel.tarefas.editar')}>✎</button>}
      </header>

      {editando ? (
        <Formulario tarefa={tarefa} pessoas={pessoas} eu={eu} t={t}
          onCancelar={() => (tarefa.id ? setEditando(false) : onFechar())}
          onSalvar={async f => { await onSalvar(f); tarefa.id ? setEditando(false) : onFechar() }}
          onApagar={async id => { await onApagar(id); onFechar() }} />
      ) : (
        <>
          <div className="tq-folha__corpo">
            <h2 className="tq-folha__titulo">{tarefa.titulo}</h2>
            <dl className="tq-campos">
              <div><dt>{t('painel.tarefas.responsavel')}</dt><dd><Avatar pessoa={pessoa(tarefa.para)} pequeno />{pessoa(tarefa.para)?.curto || t('painel.tarefas.equipe')}</dd></div>
              <div><dt>{t('painel.tarefas.revisor')}</dt><dd><Avatar pessoa={pessoa(revisorDe(tarefa))} pequeno />{pessoa(revisorDe(tarefa))?.curto || t('painel.tarefas.sem_revisor')}</dd></div>
              {tarefa.pedido_por && <div><dt>{t('painel.tarefas.pedido_por')}</dt><dd><Avatar pessoa={pessoa(tarefa.pedido_por)} pequeno />{pessoa(tarefa.pedido_por)?.curto}</dd></div>}
              <div><dt>{t('painel.tarefas.prioridade')}</dt><dd><span className={`tq-prio is-${tarefa.prioridade}`}>{t(`painel.tarefas.prio.${tarefa.prioridade}`)}</span></dd></div>
              {tarefa.prazo && <div><dt>{t('painel.tarefas.prazo')}</dt><dd className={atrasada(tarefa) ? 'is-perigo' : ''}>{dia(tarefa.prazo)}</dd></div>}
              {tarefa.link && <div><dt>{t('painel.tarefas.onde')}</dt><dd><a href={tarefa.link}>{tarefa.link} ↗</a></dd></div>}
            </dl>
            <p className={`tq-folha__texto${tarefa.descricao ? '' : ' is-vazio'}`}>{tarefa.descricao || t('painel.tarefas.sem_descricao')}</p>

            <h3 className="tq-folha__secao">{t('painel.tarefas.atividade')}</h3>
            <ol className="tq-atividade">
              {eventos.map(e => (
                <li key={e.id} className={`is-${e.tipo}`}>
                  <Avatar pessoa={pessoa(e.autor)} pequeno />
                  <div>
                    <span className="tq-atividade__quem"><b>{pessoa(e.autor)?.curto || '—'}</b> · {quando(e.criado_em)}</span>
                    {e.tipo === 'status' && (
                      <span className="tq-atividade__status">
                        {e.de ? <>{t(`painel.tarefas.col.${e.de}`)} → </> : `${t('painel.tarefas.criou')} · `}
                        <b className={`is-${e.para}`}>{t(`painel.tarefas.col.${e.para}`)}</b>
                      </span>
                    )}
                    {e.texto && <p>{e.texto}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <footer className="tq-folha__base is-coluna">
            <div className={`tq-comentar${reprovando ? ' is-reprovando' : ''}`}>
              {reprovando && <span className="tq-comentar__aviso">{t('painel.tarefas.motivo_reprovar')}</span>}
              <TextoLongo value={texto} onChange={e => setTexto(e.target.value)} rows={1}
                placeholder={t(reprovando ? 'painel.tarefas.motivo_placeholder' : 'painel.tarefas.comentar')} />
              <button type="button" className="tq-acao is-primaria" disabled={!texto.trim()} onClick={comentar}>{t(reprovando ? 'painel.tarefas.acao.reprovar' : 'painel.tarefas.enviar')}</button>
            </div>
            {acao && !reprovando && (
              <div className="tq-folha__acoes">
                {tarefa.link && col !== 'feito' && col !== 'arquivo' && (
                  <a className="tq-acao" href={tarefa.link} onClick={() => col === 'fazer' && onAcao(tarefa, { para: 'progresso' })}>↗ {t('painel.tarefas.abrir_link')}</a>
                )}
                {acao.reprovar && <button type="button" className="tq-acao is-perigo" onClick={() => setReprovando(true)}>{t('painel.tarefas.acao.reprovar')}</button>}
                <button type="button" className={`tq-acao${acao.bloqueada ? ' is-espera' : ' is-primaria'}`} disabled={acao.bloqueada} onClick={() => onAcao(tarefa, acao)}>
                  {acao.bloqueada ? t('painel.tarefas.acao.aguardando', { n: pessoa(revisorDe(tarefa))?.curto || '—' }) : t(`painel.tarefas.acao.${acao.rotulo}`)}
                </button>
              </div>
            )}
            {reprovando && <button type="button" className="tq-acao" onClick={() => { setReprovando(false); setTexto('') }}>{t('painel.cancelar')}</button>}
          </footer>
        </>
      )}
    </div>,
    document.body,
  )
}
