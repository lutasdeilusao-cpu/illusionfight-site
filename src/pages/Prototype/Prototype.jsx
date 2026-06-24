import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useReader } from '../../context/ReaderContext'
import { SRGRM_VERSION, ARENATESTBED_VERSION } from '../../config/version'
import './Prototype.css'

console.log(`[SRGRM] versão carregada: ${SRGRM_VERSION}`)
console.log(`[ARENATESTBED] versão carregada: ${ARENATESTBED_VERSION}`)

const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

const PROTOTYPES = [
  {
    id: 'srgrm',
    titleKey: 'prototype.srgrm.title',
    descKey: 'prototype.srgrm.desc',
    version: SRGRM_VERSION,
    route: '/prototype/srgrm',
  },
  {
    id: 'arena-testbed',
    titleKey: 'prototype.arena_testbed.title',
    descKey: 'prototype.arena_testbed.desc',
    version: ARENATESTBED_VERSION,
    route: '/prototype/arenatestbed',
  },
]

export default function Prototype() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { setReaderMode } = useReader()

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

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

  return (
    <section className="prototype-page">
        <div className="prototype-header">
          <h2>{t('prototype.title')}</h2>
        </div>
      <div className="prototype-menu">
        <p className="prototype-subtitle">{t('prototype.select_prompt')}</p>
        <div className="prototype-grid">
          {PROTOTYPES.map(proto => (
            <button
              key={proto.id}
              className="prototype-card"
              onClick={() => navigate(proto.route)}
            >
              <span className="prototype-card-title">{t(proto.titleKey)}</span>
              <span className="prototype-card-desc">{t(proto.descKey)}</span>
              {proto.version && <span className="prototype-card-version">v{proto.version}</span>}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
