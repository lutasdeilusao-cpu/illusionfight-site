// Tarefa em tela cheia: lê o texto inteiro, muda o status com um toque e edita
// na mesma tela. O que está sendo escrito vira rascunho no navegador
// (localStorage), então recarregar a página ou fechar sem querer não perde nada.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const COLUNAS = ['fazer', 'progresso', 'feito']
const PRIORIDADES = ['alta', 'normal', 'baixa']
const chaveRascunho = id => `ldi-painel-tarefa-rascunho:${id || 'nova'}`
const primeiroNome = n => (n || '').split(' ')[0]

function lerRascunho(id) {
  try { return JSON.parse(localStorage.getItem(chaveRascunho(id)) || 'null') } catch { return null }
}
function gravarRascunho(id, dados) {
  try { localStorage.setItem(chaveRascunho(id), JSON.stringify(dados)) } catch { /* sem storage */ }
}
function apagarRascunho(id) {
  try { localStorage.removeItem(chaveRascunho(id)) } catch { /* sem storage */ }
}

// Campo de texto que cresce com o conteúdo: a página rola, o campo não.
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

export default function PainelTarefaModal({ tarefa, pessoas, t, locale, nome, onFechar, onSalvar, onApagar, onMover, onArquivar, onIniciar }) {
  const rascunho = lerRascunho(tarefa.id)
  const [modo, setModo] = useState(!tarefa.id || rascunho ? 'editar' : 'ver')
  const [form, setForm] = useState(rascunho || tarefa)
  const [recuperado, setRecuperado] = useState(Boolean(rascunho))
  const [salvando, setSalvando] = useState(false)
  const mudou = JSON.stringify(form) !== JSON.stringify(tarefa)

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [])

  const campo = k => e => {
    const novo = { ...form, [k]: e.target.value }
    setForm(novo)
    gravarRascunho(tarefa.id, novo)
  }

  const descartar = () => {
    if (mudou && !window.confirm(t('painel.tarefas.descartar'))) return false
    apagarRascunho(tarefa.id)
    return true
  }
  const fechar = () => { if (modo === 'ver' || descartar()) onFechar() }
  const cancelarEdicao = () => {
    if (!tarefa.id) return fechar()
    if (!descartar()) return
    setForm(tarefa); setRecuperado(false); setModo('ver')
  }
  const salvar = async e => {
    e.preventDefault()
    setSalvando(true)
    try {
      await onSalvar(form)
      apagarRascunho(tarefa.id)
      onFechar()
    } catch { setSalvando(false) }
  }
  const apagar = async () => {
    if (!window.confirm(t('painel.tarefas.confirmar_apagar'))) return
    apagarRascunho(tarefa.id)
    await onApagar(tarefa.id)
    onFechar()
  }

  const data = d => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: '2-digit', month: 'long' })
  const hoje = new Date().toISOString().slice(0, 10)

  return createPortal(
    <div className="tarefa-modal" role="dialog" aria-modal="true">
      <header className="tarefa-modal__topo">
        <button type="button" className="tarefa-modal__fechar" onClick={fechar} aria-label={t('painel.tarefas.fechar')}>✕</button>
        <span className="tarefa-modal__rotulo">{modo === 'ver' ? t(`painel.tarefas.col.${tarefa.status}`) : (tarefa.id ? t('painel.tarefas.editar') : t('painel.tarefas.nova'))}</span>
      </header>

      {modo === 'ver' ? (
        <>
          <div className="tarefa-modal__corpo">
            <h2 className="tarefa-modal__titulo">{tarefa.titulo}</h2>
            <div className="tarefa-modal__chips">
              <span className={`tarefa-modal__chip is-${tarefa.prioridade}`}>{t(`painel.tarefas.prio.${tarefa.prioridade}`)}</span>
              <span className="tarefa-modal__chip">{t('painel.tarefas.para')}: {nome(tarefa.para)}</span>
              {tarefa.pedido_por && <span className="tarefa-modal__chip">{t('painel.tarefas.pedido_por', { n: nome(tarefa.pedido_por) })}</span>}
              {tarefa.prazo && <span className={`tarefa-modal__chip${tarefa.status !== 'feito' && tarefa.prazo < hoje ? ' is-atrasada' : ''}`}>{t('painel.tarefas.prazo')}: {data(tarefa.prazo)}</span>}
            </div>
            {tarefa.descricao
              ? <p className="tarefa-modal__texto">{tarefa.descricao}</p>
              : <p className="tarefa-modal__texto is-vazio">{t('painel.tarefas.sem_descricao')}</p>}
            {tarefa.feedback && (
              <section className="tarefa-modal__feedback">
                <h3>{t('painel.tarefas.feedback')}</h3>
                <p>{tarefa.feedback}</p>
              </section>
            )}
            {tarefa.link && tarefa.status !== 'feito' && (
              <button type="button" className="tarefa-modal__iniciar" onClick={() => onIniciar(tarefa)}>
                ▶ {t(tarefa.status === 'fazer' ? 'painel.tarefas.iniciar' : 'painel.tarefas.continuar')}
              </button>
            )}
          </div>
          <footer className="tarefa-modal__base">
            <div className="tarefa-modal__status" role="group" aria-label={t('painel.tarefas.status')}>
              {COLUNAS.map(c => {
                const ativo = !tarefa.arquivada && tarefa.status === c
                return (
                  <button key={c} type="button" className={`is-${c}${ativo ? ' is-ativo' : ''}`}
                    aria-pressed={ativo} onClick={() => !ativo && onMover(tarefa, c)}>
                    {t(`painel.tarefas.col.${c}`)}
                  </button>
                )
              })}
              <button type="button" className={`is-arquivo${tarefa.arquivada ? ' is-ativo' : ''}`}
                aria-pressed={!!tarefa.arquivada} onClick={() => !tarefa.arquivada && onArquivar(tarefa)}>
                {t('painel.tarefas.col.arquivo')}
              </button>
            </div>
            <button type="button" className="painel-btn is-primario tarefa-modal__editar" onClick={() => setModo('editar')}>✎ {t('painel.tarefas.editar')}</button>
          </footer>
        </>
      ) : (
        <form className="tarefa-modal__form" onSubmit={salvar}>
          <div className="tarefa-modal__corpo tarefa-form">
            {recuperado && <p className="tarefa-modal__aviso">{t('painel.tarefas.rascunho_recuperado')}</p>}
            <label>{t('painel.tarefas.titulo')}<input value={form.titulo} onChange={campo('titulo')} required autoFocus={!tarefa.id} /></label>
            <label>{t('painel.tarefas.descricao')}<TextoLongo value={form.descricao || ''} onChange={campo('descricao')} /></label>
            <div className="tarefa-form__linha">
              <label>{t('painel.tarefas.para')}
                <select value={form.para || ''} onChange={campo('para')}>
                  <option value="">{t('painel.tarefas.os_dois')}</option>
                  {pessoas.map(p => <option key={p.id} value={p.id}>{primeiroNome(p.nome)}</option>)}
                </select>
              </label>
              <label>{t('painel.tarefas.prazo')}<input type="date" value={form.prazo || ''} onChange={campo('prazo')} /></label>
            </div>
            <div className="tarefa-form__linha">
              <label>{t('painel.tarefas.prioridade')}
                <select value={form.prioridade} onChange={campo('prioridade')}>
                  {PRIORIDADES.map(p => <option key={p} value={p}>{t(`painel.tarefas.prio.${p}`)}</option>)}
                </select>
              </label>
              <label>{t('painel.tarefas.status')}
                <select value={form.status} onChange={campo('status')}>
                  {COLUNAS.map(c => <option key={c} value={c}>{t(`painel.tarefas.col.${c}`)}</option>)}
                </select>
              </label>
            </div>
            <label>{t('painel.tarefas.link')}<input value={form.link || ''} placeholder="/webtoon/05" onChange={campo('link')} /></label>
            <label>{t('painel.tarefas.feedback')}<TextoLongo value={form.feedback || ''} onChange={campo('feedback')} /></label>
            {tarefa.id && <button type="button" className="painel-btn is-perigo tarefa-modal__apagar" onClick={apagar}>{t('painel.tarefas.apagar')}</button>}
          </div>
          <footer className="tarefa-modal__base tarefa-modal__base--form">
            <button type="button" className="painel-btn" onClick={cancelarEdicao}>{t('painel.cancelar')}</button>
            <button type="submit" className="painel-btn is-primario" disabled={salvando || !form.titulo?.trim()}>{salvando ? '…' : t('painel.salvar')}</button>
          </footer>
        </form>
      )}
    </div>,
    document.body
  )
}
