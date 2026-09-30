import { useEffect, useState } from 'react'
import { BETA_ACTIVE } from '../config/trial'
import { LAUNCH_DATE, ADMIN_EMAILS } from '../config/launch'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import './TrialBanner.css'

// Meia-noite de Brasília do dia do lançamento.
const ALVO = new Date(`${LAUNCH_DATE}T00:00:00-03:00`).getTime()

function restante(agora) {
  const ms = Math.max(0, ALVO - agora)
  const s = Math.floor(ms / 1000)
  return { ms, d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 }
}

const dois = n => String(n).padStart(2, '0')

/** Faixa do beta: contagem regressiva até o lançamento oficial. */
export default function TrialBanner({ hidden }) {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const [agora, setAgora] = useState(() => Date.now())

  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const ativo = BETA_ACTIVE && !hidden && !isAdmin

  useEffect(() => {
    if (!ativo) return undefined
    const id = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(id)
  }, [ativo])

  if (!ativo) return null

  const r = restante(agora)
  const data = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo',
  }).format(ALVO)

  const blocos = [
    { v: r.d, rotulo: t('beta.dias') },
    { v: dois(r.h), rotulo: t('beta.horas') },
    { v: dois(r.m), rotulo: t('beta.min') },
    { v: dois(r.s), rotulo: t('beta.seg') },
  ]

  return (
    <aside className="trial-banner" aria-label={t('beta.eyebrow')}>
      <div className="trial-banner__info">
        <span className="trial-banner__eyebrow">
          <i className="trial-banner__pulso" aria-hidden="true" />
          {t('beta.eyebrow')}
        </span>
        <span className="trial-banner__data">{t('beta.lancamento')} · {data}</span>
      </div>
      {r.ms > 0 ? (
        <div className="trial-banner__relogio" role="timer">
          {blocos.map((b, i) => (
            <span key={i} className="trial-banner__bloco">
              <b>{b.v}</b>
              <small>{b.rotulo}</small>
            </span>
          ))}
        </div>
      ) : (
        <strong className="trial-banner__no-ar">{t('beta.no_ar')}</strong>
      )}
    </aside>
  )
}
