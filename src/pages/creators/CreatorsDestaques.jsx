import { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { supabase } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import { creatorAtivo } from '../../lib/creator'
import { ADMIN_EMAILS } from '../../config/launch'
import './Creators.css'
import './CreatorsDestaques.css'

/** Destaques dos creators (/creators/destaques): no topo o creator envia o
 *  link do conteúdo que fez; embaixo, a vitrine pública do que o admin
 *  aprovou (migration 054). */
const REDES = ['YouTube', 'TikTok', 'Instagram', 'X', 'Twitch', 'Kwai', 'Outra']

function capaYoutube(link) {
  const m = String(link).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([\w-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

function FormEnvio({ t, onEnviado }) {
  const [form, setForm] = useState({ nome: '', arroba: '', rede: 'YouTube', link: '' })
  const [estado, setEstado] = useState(null)
  const campo = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    setEstado('enviando')
    const { data, error } = await supabase.rpc('creator_enviar', {
      p_nome: form.nome, p_arroba: form.arroba, p_rede: form.rede, p_link: form.link,
    })
    if (error || !data?.ok) {
      console.error('[Creators] envio falhou:', error?.message || data?.erro)
      setEstado(`erro_${data?.erro || 'generico'}`)
      return
    }
    trackEvent('creator_envio', { rede: form.rede })
    setForm(f => ({ ...f, link: '' }))
    setEstado('ok')
    onEnviado()
  }

  return (
    <form className="crd-form if-panel" onSubmit={enviar}>
      <span className="if-eyebrow">{t('creators.destaques.form_titulo')}</span>
      <p className="crd-form__sub">{t('creators.destaques.form_sub')}</p>
      <label className="if-label" htmlFor="crd-link">{t('creators.destaques.link')}</label>
      <input id="crd-link" className="if-field" type="url" inputMode="url" required placeholder="https://" value={form.link} onChange={campo('link')} />
      <div className="crd-form__linha">
        <span>
          <label className="if-label" htmlFor="crd-nome">{t('creators.destaques.nome')}</label>
          <input id="crd-nome" className="if-field" required maxLength={80} value={form.nome} onChange={campo('nome')} />
        </span>
        <span>
          <label className="if-label" htmlFor="crd-arroba">{t('creators.destaques.arroba')}</label>
          <input id="crd-arroba" className="if-field" maxLength={60} placeholder="@" value={form.arroba} onChange={campo('arroba')} />
        </span>
      </div>
      <label className="if-label" htmlFor="crd-rede">{t('creators.destaques.rede')}</label>
      <select id="crd-rede" className="if-field" value={form.rede} onChange={campo('rede')}>
        {REDES.map(r => <option key={r} value={r}>{r === 'Outra' ? t('creators.destaques.outra') : r}</option>)}
      </select>
      {estado && estado !== 'enviando' && (
        <p className={`crd-form__aviso${estado === 'ok' ? ' is-ok' : ''}`} role="status">
          {t(estado === 'ok' ? 'creators.destaques.enviado' : `creators.destaques.${estado}`)}
        </p>
      )}
      <button type="submit" className="if-btn if-btn--primary" disabled={estado === 'enviando'}>
        {t(estado === 'enviando' ? 'creators.destaques.enviando' : 'creators.destaques.enviar')}
      </button>
    </form>
  )
}

export default function CreatorsDestaques() {
  const { t, locale } = useLanguage()
  const { user, perfil, carregando } = useAuth()
  const [lista, setLista] = useState(null)
  const [meus, setMeus] = useState([])
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const podeEnviar = isAdmin || creatorAtivo(perfil)

  useEffect(() => {
    supabase.rpc('creator_destaques').then(({ data, error }) => {
      if (error) console.error('[Creators] vitrine:', error.message)
      setLista(data || [])
    })
  }, [])

  const carregarMeus = useCallback(() => {
    if (!podeEnviar) return
    supabase.rpc('creator_meus_envios').then(({ data }) => setMeus(data || []))
  }, [podeEnviar])
  useEffect(carregarMeus, [carregarMeus])

  const data = d => (d ? new Date(d).toLocaleDateString(locale) : '')

  let topo
  if (carregando || (user && !perfil)) topo = <div className="cr-carregando crd-topo-vazio" aria-hidden="true" />
  else if (podeEnviar) topo = <FormEnvio t={t} onEnviado={carregarMeus} />
  else {
    topo = (
      <div className="crd-form if-panel">
        <span className="if-eyebrow">{t('creators.destaques.form_titulo')}</span>
        <p className="crd-form__sub">{t(user ? 'creators.destaques.so_creator' : 'creators.destaques.entrar_texto')}</p>
        <Link className="if-btn if-btn--amber" to="/creators">{t(user ? 'creators.destaques.quero_ser' : 'creators.destaques.entrar')}</Link>
      </div>
    )
  }

  return (
    <div className="cr-page crd-page">
      <Helmet>
        <title>{t('creators.destaques.meta_titulo')}</title>
        <meta name="description" content={t('creators.destaques.meta_desc')} />
      </Helmet>

      <header className="crd-hero">
        <span className="if-eyebrow">{t('creators.destaques.eyebrow')}</span>
        <h1>{t('creators.destaques.titulo')}</h1>
        <p>{t('creators.destaques.sub')}</p>
      </header>

      {topo}

      {podeEnviar && meus.length > 0 && (
        <section className="crd-meus">
          <span className="if-eyebrow">{t('creators.destaques.meus')}</span>
          <ul>
            {meus.map(m => (
              <li key={m.id}>
                <span className="crd-meus__link">{m.link}</span>
                <span className={`if-badge crd-status crd-status--${m.status}`}>{t(`creators.destaques.status_${m.status}`)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="crd-vitrine">
        <span className="if-eyebrow">{t('creators.destaques.vitrine')}</span>
        {!lista ? <div className="cr-carregando crd-topo-vazio" aria-hidden="true" /> : !lista.length ? (
          <p className="crd-vazio">{t('creators.destaques.vazio')}</p>
        ) : (
          <ul className="crd-grade if-stagger">
            {lista.map(c => {
              const capa = capaYoutube(c.link)
              return (
                <li key={c.id} className={`crd-card${c.destaque ? ' is-destaque' : ''}`}>
                  <a href={c.link} target="_blank" rel="noopener noreferrer nofollow ugc" onClick={() => trackEvent('creator_destaque_click', { rede: c.rede || '' })}>
                    <span className="crd-card__capa">
                      {capa ? <img src={capa} alt="" loading="lazy" decoding="async" width="480" height="360" /> : <b aria-hidden="true">{(c.rede || '★').slice(0, 2)}</b>}
                      {c.destaque && <span className="if-badge crd-card__selo">{t('creators.destaques.selo')}</span>}
                    </span>
                    <span className="crd-card__info">
                      <strong>{c.nome}</strong>
                      <small>{[c.arroba, c.rede, data(c.data)].filter(Boolean).join(' · ')}</small>
                      <span className="crd-card__ver">{t('creators.destaques.ver')} ↗</span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
