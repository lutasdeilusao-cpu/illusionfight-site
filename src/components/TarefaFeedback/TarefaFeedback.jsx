// Fim de capítulo de uma tarefa da Área do Administrador: quando o admin chega
// ao fim do capítulo que a tarefa dele aponta, a tarefa vai pra Feito e aparece
// a pergunta se ele quer deixar o feedback agora. Só monta pra admin.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { rpc } from '../../pages/painel/painelUtil'
import '../../pages/painel/PainelTarefas.css'

export default function TarefaFeedback() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const marca = useRef(null)
  const [tarefa, setTarefa] = useState(null)
  const [texto, setTexto] = useState('')
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const el = marca.current
    if (!el) return undefined
    let feito = false
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || feito) return
      feito = true
      rpc('admin_tarefa_concluir_link', { p_link: pathname }).then(r => r && setTarefa(r)).catch(() => {})
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [pathname])

  const enviar = async () => {
    if (texto.trim()) await rpc('admin_tarefa_feedback', { p_id: tarefa.id, p_texto: texto.trim() }).catch(() => {})
    setEnviado(true)
  }

  return (
    <>
      <span ref={marca} aria-hidden="true" />
      {tarefa && !enviado && createPortal(
        <div className="tarefa-fim" role="dialog" aria-modal="true">
          <div className="tarefa-fim__caixa">
            <span className="tarefa-fim__ok">✓ {t('painel.tarefas.fim.concluida')}</span>
            <strong>{tarefa.titulo}</strong>
            <p>{t('painel.tarefas.fim.pergunta')}</p>
            <textarea rows={6} value={texto} onChange={e => setTexto(e.target.value)} placeholder={t('painel.tarefas.fim.placeholder')} />
            <div className="painel-form__acoes">
              <button type="button" className="painel-btn is-primario" onClick={enviar} disabled={!texto.trim()}>{t('painel.tarefas.fim.enviar')}</button>
              <button type="button" className="painel-btn" onClick={() => setEnviado(true)}>{t('painel.tarefas.fim.depois')}</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
