import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { trackEvent } from '../../lib/analytics'
import './ShareButton.css'

const SITE_URL = 'https://illusionfight.com'

/** Compartilha um link: folha nativa do sistema (WhatsApp, Instagram,
 *  Telegram…) quando o navegador tem Web Share API; senão copia o link.
 *  Devolve 'compartilhado' | 'copiado' | 'cancelado' | 'erro'.
 *  O domínio é sempre o oficial (nunca window.location.origin — num
 *  preview/localhost o link mandado pra alguém não abriria). */
export async function compartilharLink({ title, text, url }) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url })
      return 'compartilhado'
    }
    await navigator.clipboard.writeText(url)
    return 'copiado'
  } catch (err) {
    return err?.name === 'AbortError' ? 'cancelado' : 'erro'
  }
}

/** Botão "compartilhar esta página". Existe porque no app instalado (PWA
 *  em tela cheia) não tem barra de endereço nem menu do navegador — sem
 *  ele, justo quem mais compartilharia não tinha como mandar link.
 *  Cada seção do site tem rota própria e prévia própria (prerender), então
 *  compartilhar a rota atual já manda a pessoa pro lugar certo.
 *  `variante`: 'icone' (navbar) ou 'item' (linha do drawer). */
export default function ShareButton({ variante = 'icone', onFeito }) {
  const { t } = useLanguage()
  const { pathname, search } = useLocation()
  const [aviso, setAviso] = useState('')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const mostrar = msg => {
    setAviso(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAviso(''), 2200)
  }

  const compartilhar = async () => {
    const url = `${SITE_URL}${pathname}${search}`
    const title = document.title || 'Illusion Fight'
    const resultado = await compartilharLink({ title, text: title, url })
    trackEvent('share_page', { path: pathname, resultado })
    if (resultado === 'copiado') mostrar(t('nav.link_copiado'))
    else if (resultado === 'erro') mostrar(url)
    if (resultado !== 'cancelado') onFeito?.()
  }

  return (
    <>
      <button
        type="button"
        className={`share-btn share-btn--${variante}`}
        onClick={compartilhar}
        aria-label={t('nav.compartilhar')}
      >
        <svg className="share-btn__icone" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="2.6" />
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="18" cy="19" r="2.6" />
          <path d="M8.3 10.8l7.4-4.3M8.3 13.2l7.4 4.3" />
        </svg>
        {variante === 'item' && <span>{t('nav.compartilhar')}</span>}
      </button>
      {/* Portal pro body: a navbar/drawer têm transform/backdrop e prenderiam
          um position:fixed dentro do stacking context deles. */}
      {aviso && createPortal(<div className="share-btn__aviso" role="status">{aviso}</div>, document.body)}
    </>
  )
}
