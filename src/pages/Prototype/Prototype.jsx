import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { PROTOTYPE_VERSION } from '../../config/version'
import HexBoard from './HexBoard'
import './Prototype.css'

console.log(`[PROTOTYPE] versão carregada: ${PROTOTYPE_VERSION}`)

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

const PROTOTYPES = [
  {
    id: 'morto-engine',
    titleKey: 'prototype.morto_engine.title',
    descKey: 'prototype.morto_engine.desc',
    type: 'iframe',
    src: '/prototype/rpg-morto.html',
  },
  {
    id: 'hex-board',
    titleKey: 'prototype.hex_board.title',
    descKey: 'prototype.hex_board.desc',
    type: 'component',
    component: 'HexBoard',
  },
]

export default function Prototype() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  if (!user) {
    return (
      <section className="prototype-page">
        <div className="prototype-bloqueado">
          <h2>{t('prototype.title')}</h2>
          <p>{t('prototype.login_required')}</p>
          <button className="proto-btn proto-btn-primary" onClick={() => navigate('/login')}>
            {t('prototype.go_login')}
          </button>
        </div>
      </section>
    )
  }

  if (!isAdmin) {
    return (
      <section className="prototype-page">
        <div className="prototype-bloqueado">
          <h2>{t('prototype.title')}</h2>
          <p>{t('prototype.restricted')}</p>
          <button className="proto-btn proto-btn-secondary" onClick={() => navigate('/')}>
            {t('prototype.back_home')}
          </button>
        </div>
      </section>
    )
  }

  if (selected) {
    const proto = PROTOTYPES.find(p => p.id === selected)
    return (
      <section className="prototype-page">
        <div className="prototype-header">
          <h2>{t(proto.titleKey)}</h2>
          <button className="proto-btn proto-btn-secondary" onClick={() => setSelected(null)}>
            {t('prototype.back')}
          </button>
        </div>
        <div className="prototype-content">
          {proto.type === 'iframe' ? (
            <iframe
              src={proto.src}
              title={t(proto.titleKey)}
              className="prototype-iframe"
            />
          ) : proto.id === 'hex-board' ? (
            <HexBoard />
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section className="prototype-page">
      <div className="prototype-header">
        <h2>{t('prototype.title')}</h2>
        <span className="prototype-version">v{PROTOTYPE_VERSION}</span>
      </div>
      <div className="prototype-menu">
        <p className="prototype-subtitle">{t('prototype.select_prompt')}</p>
        <div className="prototype-grid">
          {PROTOTYPES.map(proto => (
            <button
              key={proto.id}
              className="prototype-card"
              onClick={() => setSelected(proto.id)}
            >
              <span className="prototype-card-title">{t(proto.titleKey)}</span>
              <span className="prototype-card-desc">{t(proto.descKey)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
