import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { resolveAccessLevel } from '../../../lib/releaseAccess'
import { SEASON_ONE_COMPLETION, SEASON_ONE_DROPS } from '../../../data/season-one-schedule'
import './Calendario.css'

const levelRows = [
  { id: 'subscriber', access: ['elite', 'primordial'], delay: 0, launch: 3, tales: 5 },
  { id: 'account', access: ['conta'], delay: 14, launch: 2, tales: 0 },
  { id: 'public', access: ['publico'], delay: 28, launch: 1, tales: 0 },
]
const channels = ['chapters', 'webtoon', 'games', 'music', 'partners']

function formatDate(date, locale) {
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

export default function Calendario() {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const [channel, setChannel] = useState('chapters')
  const access = resolveAccessLevel(user, perfil)
  const today = new Date().toISOString().slice(0, 10)
  const currentIndex = SEASON_ONE_DROPS.findLastIndex(drop => drop.date <= today)
  const nextIndex = SEASON_ONE_DROPS.findIndex(drop => drop.date > today)

  return (
    <main className="calendar-page">
      <Helmet><title>{t('calendar.meta_title')}</title></Helmet>
      <div className="calendar-grid" aria-hidden="true" />
      <motion.header className="calendar-hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <span className="calendar-kicker">{t('calendar.kicker')}</span>
        <h1>{t('calendar.title')}</h1>
        <p className="calendar-manifesto">{t('calendar.manifesto')}</p>
        <div className="calendar-cadence"><span className="calendar-pulse" />{t('calendar.cadence')}</div>
      </motion.header>

      <nav className="calendar-channels" aria-label={t('calendar.channels_label')}>
        {channels.map(id => (
          <button key={id} className={channel === id ? 'is-active' : ''} onClick={() => setChannel(id)}>
            <span className={`calendar-channel-icon is-${id}`} aria-hidden="true" />
            {t(`calendar.channel_${id}`)}
          </button>
        ))}
      </nav>

      {channel !== 'chapters' && (
        <motion.section className="calendar-channel-empty" key={channel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span>{t('calendar.signal_pending')}</span>
          <h2>{t(`calendar.channel_${channel}`)}</h2>
          <p>{t('calendar.channel_empty')}</p>
        </motion.section>
      )}

      {channel === 'chapters' && <>

      <section className="calendar-section" aria-labelledby="levels-title">
        <div className="calendar-section-heading"><span>01</span><h2 id="levels-title">{t('calendar.levels_title')}</h2></div>
        <div className="calendar-levels">
          {levelRows.map(row => (
            <article key={row.id} className={`calendar-level${row.access.includes(access) ? ' is-you' : ''}`}>
              {row.access.includes(access) && <span className="calendar-you">{t('calendar.you')}</span>}
              <h3>{t(`calendar.level_${row.id}`)}</h3>
              <strong>{t(`calendar.cost_${row.id}`)}</strong>
              <dl>
                <div><dt>{t('calendar.delay')}</dt><dd>{row.delay} {t('calendar.days')}</dd></div>
                <div><dt>{t('calendar.launch')}</dt><dd>{row.launch}</dd></div>
                <div><dt>{t('calendar.tales')}</dt><dd>{row.tales}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="calendar-section" aria-labelledby="completion-title">
        <div className="calendar-section-heading"><span>02</span><h2 id="completion-title">{t('calendar.completion_title')}</h2></div>
        <div className="calendar-completion">
          {SEASON_ONE_COMPLETION.map(([id, publicDate, accountDate, subscriberDate]) => (
            <article key={id}>
              <h3>{t(`calendar.work_${id}`)}</h3>
              <div><span>{t('calendar.level_public')}</span><time>{formatDate(publicDate, locale)}</time></div>
              <div><span>{t('calendar.level_account')}</span><time>{formatDate(accountDate, locale)}</time></div>
              <div><span>{t('calendar.level_subscriber')}</span><time>{formatDate(subscriberDate, locale)}</time></div>
            </article>
          ))}
        </div>
      </section>

      <section className="calendar-section" aria-labelledby="drops-title">
        <div className="calendar-section-heading"><span>03</span><h2 id="drops-title">{t('calendar.drops_title')}</h2></div>
        <div className="calendar-drops">
          {SEASON_ONE_DROPS.map((drop, index) => {
            const state = index === currentIndex ? 'current' : index === nextIndex ? 'next' : index < currentIndex ? 'past' : 'future'
            return <article className={`calendar-drop is-${state}`} key={drop.date}>
              <div className="calendar-drop-date"><span>DROP {String(drop.number).padStart(2, '0')}</span><time>{formatDate(drop.date, locale)}</time></div>
              {(state === 'current' || state === 'next') && <span className="calendar-drop-state">{t(`calendar.${state}`)}</span>}
              <div className={`calendar-drop-line${access === 'primordial' || access === 'elite' ? ' is-you' : ''}`}><b>{t('calendar.level_subscriber')}</b><span>{drop.subscriber}</span></div>
              <div className={`calendar-drop-line${access === 'conta' ? ' is-you' : ''}`}><b>{t('calendar.level_account')}</b><span>{drop.account}</span></div>
              <div className={`calendar-drop-line${access === 'publico' ? ' is-you' : ''}`}><b>{t('calendar.level_public')}</b><span>{drop.public}</span></div>
            </article>
          })}
        </div>
        <div className="calendar-finale"><span>30.11.2027</span><strong>{t('calendar.finale')}</strong></div>
      </section>
      </>}
    </main>
  )
}
