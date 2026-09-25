import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import './AvisoAutor.css'

/** Recado do autor antes de o capítulo começar (campo `aviso_autor` do
 *  capítulo em episodios.json → webShard.avisos.<id> no i18n). Aparece
 *  TODA vez que o capítulo abre — é posicionamento, não tutorial, então não
 *  existe "já visto". Portal pro <body> pra não ficar preso em ancestral
 *  com transform (ver AGENTS.md, GangTip). */
export default function AvisoAutor({ id, cor, onFechar }) {
  const { t } = useLanguage()
  const paragrafos = t(`webShard.avisos.${id}.paragrafos`)

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [])

  return createPortal(
    <div className="ws-aviso" style={{ '--ws-cor': cor }} role="dialog" aria-modal="true" aria-labelledby="ws-aviso-titulo">
      <div className="ws-aviso__card">
        <span className="ws-aviso__eyebrow">{t(`webShard.avisos.${id}.eyebrow`)}</span>
        <h2 id="ws-aviso-titulo" className="ws-aviso__titulo">{t(`webShard.avisos.${id}.titulo`)}</h2>
        <div className="ws-aviso__texto">
          {Array.isArray(paragrafos) && paragrafos.map((p, i) => <p key={i}>{p}</p>)}
          <p className="ws-aviso__destaque">{t(`webShard.avisos.${id}.destaque`)}</p>
        </div>
        <p className="ws-aviso__assinatura">{t(`webShard.avisos.${id}.assinatura`)}</p>
        <button type="button" className="if-btn if-btn--primary ws-aviso__ok" onClick={onFechar} autoFocus>
          {t(`webShard.avisos.${id}.ok`)}
        </button>
      </div>
    </div>,
    document.body
  )
}
