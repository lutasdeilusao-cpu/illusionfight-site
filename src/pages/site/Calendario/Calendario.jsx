import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { resolveAccessLevel } from '../../../lib/releaseAccess'
import { SEASON_ONE_COMPLETION, SEASON_ONE_DROPS, SEASONS_OVERVIEW, GAMES_ROADMAP } from '../../../data/season-one-schedule'
import './Calendario.css'

// Defasagem em dias até o capítulo abrir e quantos capítulos cada nível tem
// no dia do lançamento (o assinante começa com 2).
const levelRows = [
  { id: 'subscriber', access: ['elite', 'primordial'], delay: 0, launch: 2, tales: 5 },
  { id: 'account', access: ['conta'], delay: 15, launch: 0, tales: 0 },
  { id: 'public', access: ['publico'], delay: 30, launch: 0, tales: 0 },
]
const NIVEIS_DROP = ['subscriber', 'account', 'public']
const channels = ['chapters', 'webtoon', 'games', 'music', 'partners']

function formatDate(date, locale) {
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

function intlLocale(locale) {
  return locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US'
}

function pad2(n) { return String(n).padStart(2, '0') }

// A Temporada 1 inteira: nov/2026 até out/2027.
const CALENDAR_START = { year: 2026, month: 10 }
const CALENDAR_END = { year: 2027, month: 9 }

// Texto de um item do calendário (capítulo, hiato...) no idioma da tela.
function textoItem(t, item) {
  return t(`calendar.item_${item.tipo}`, { n: item.n })
}
const textoLista = (t, itens) => (itens.length ? itens.map(i => textoItem(t, i)).join(' + ') : '—')

function buildMonths(start, end) {
  const months = []
  let y = start.year, m = start.month
  while (y < end.year || (y === end.year && m <= end.month)) {
    months.push({ year: y, month: m })
    m += 1
    if (m > 11) { m = 0; y += 1 }
  }
  return months
}

function buildMonthCells(year, month) {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const cells = []
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function monthLabel(year, month, locale) {
  return new Intl.DateTimeFormat(intlLocale(locale), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month, 1)))
}

function weekdayLabels(locale) {
  const fmt = new Intl.DateTimeFormat(intlLocale(locale), { weekday: 'narrow', timeZone: 'UTC' })
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2023, 0, 1 + i))))
}

export default function Calendario() {
  const { t, locale } = useLanguage()
  const { user, perfil } = useAuth()
  const [channel, setChannel] = useState('chapters')
  const access = resolveAccessLevel(user, perfil)
  const today = new Date().toISOString().slice(0, 10)
  const drops = SEASON_ONE_DROPS[channel] || []
  const currentIndex = drops.findLastIndex(drop => drop.date <= today)
  const nextIndex = drops.findIndex(drop => drop.date > today)
  const eventsByDate = Object.fromEntries(drops.map(d => [d.date, d]))
  const months = buildMonths(CALENDAR_START, CALENDAR_END)
  const weekdays = weekdayLabels(locale)

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

      {channel === 'games' && (
        <section className="calendar-section" aria-labelledby="games-title">
          <div className="calendar-section-heading"><span>01</span><h2 id="games-title">{t('calendar.games_title')}</h2></div>
          <p className="calendar-seasons-disclaimer">{t('calendar.games_intro')}</p>
          <div className="calendar-games">
            {GAMES_ROADMAP.map(f => (
              <article key={f.fase} className={`calendar-game-fase is-${f.fase}`}>
                <span className="calendar-season-badge">{f.data ? formatDate(f.data, locale) : t('calendar.games_sem_data')}</span>
                <h3>{t(`calendar.games_fase_${f.fase}`)}</h3>
                <ul>{f.jogos.map(j => <li key={j}><b>{t(`calendar.game_${j}`)}</b><small>{t(`calendar.game_${j}_desc`)}</small></li>)}</ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {channel !== 'chapters' && channel !== 'webtoon' && channel !== 'games' && (
        <motion.section className="calendar-channel-empty" key={channel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <span>{t('calendar.signal_pending')}</span>
          <h2>{t(`calendar.channel_${channel}`)}</h2>
          <p>{t('calendar.channel_empty')}</p>
        </motion.section>
      )}

      {(channel === 'chapters' || channel === 'webtoon') && <>

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
          {SEASON_ONE_COMPLETION[channel].map(obra => (
            <article key={obra.id}>
              <h3>{t(`calendar.work_${obra.id}`)}</h3>
              {NIVEIS_DROP.map(nivel => (
                <div key={nivel}><span>{t(`calendar.level_${nivel}`)}</span><time>{obra[nivel] ? formatDate(obra[nivel], locale) : t('calendar.na_t2')}</time></div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="calendar-section" aria-labelledby="drops-title">
        <div className="calendar-section-heading"><span>03</span><h2 id="drops-title">{t('calendar.drops_title')}</h2></div>

        <div className="calendar-months">
          {months.map(({ year, month }) => {
            const cells = buildMonthCells(year, month)
            return (
              <div className="calendar-month" key={`${year}-${month}`}>
                <h3 className="calendar-month-head">{monthLabel(year, month, locale)}</h3>
                <div className="calendar-weekdays">
                  {weekdays.map((w, i) => <span key={i}>{w}</span>)}
                </div>
                <div className="calendar-month-grid">
                  {cells.map((d, i) => {
                    if (!d) return <div className="calendar-day is-empty" key={i} />
                    const dateStr = `${year}-${pad2(month + 1)}-${pad2(d)}`
                    const event = eventsByDate[dateStr]
                    return (
                      <div className={`calendar-day${event ? ' has-event' : ''}${dateStr === today ? ' is-today' : ''}`} key={i}>
                        <span className="calendar-day-num">{d}</span>
                        {event && (
                          <div className="calendar-day-dots">
                            {NIVEIS_DROP.map(nivel => event[nivel].length > 0 && (
                              <span key={nivel} className={`calendar-day-dot is-${nivel}`} title={`${t(`calendar.level_${nivel}`)}: ${textoLista(t, event[nivel])}`} />
                            ))}
                            {event.marcos.some(m => m.tipo === 'hiato') && <span className="calendar-day-dot is-hiato" title={textoLista(t, event.marcos)} />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="calendar-drops">
          {drops.map((drop, index) => {
            const state = index === currentIndex ? 'current' : index === nextIndex ? 'next' : index < currentIndex ? 'past' : 'future'
            const souEu = { subscriber: access === 'primordial' || access === 'elite', account: access === 'conta', public: access === 'publico' }
            return <article className={`calendar-drop is-${state}${drop.marcos.length ? ' is-hiato' : ''}`} key={drop.date}>
              <div className="calendar-drop-date"><span>DROP {String(drop.number).padStart(2, '0')}</span><time>{formatDate(drop.date, locale)}</time></div>
              {(state === 'current' || state === 'next') && <span className="calendar-drop-state">{t(`calendar.${state}`)}</span>}
              {drop.marcos.map((m, i) => <p key={i} className="calendar-drop-marco">{textoItem(t, m)}</p>)}
              {NIVEIS_DROP.map(nivel => drop[nivel].length > 0 && (
                <div key={nivel} className={`calendar-drop-line${souEu[nivel] ? ' is-you' : ''}`}><b>{t(`calendar.level_${nivel}`)}</b><span>{textoLista(t, drop[nivel])}</span></div>
              ))}
            </article>
          })}
        </div>
        <div className="calendar-finale"><span>{formatDate(SEASONS_OVERVIEW[1].start, locale)}</span><strong>{t('calendar.finale')}</strong></div>
      </section>

      <section className="calendar-section" aria-labelledby="seasons-title">
        <div className="calendar-section-heading"><span>04</span><h2 id="seasons-title">{t('calendar.seasons_title')}</h2></div>
        <p className="calendar-seasons-disclaimer">{t('calendar.seasons_disclaimer')}</p>
        <div className="calendar-seasons">
          {SEASONS_OVERVIEW.map(s => (
            <article key={s.season} className={`calendar-season${s.confirmada ? ' is-confirmed' : ' is-projected'}`}>
              <span className="calendar-season-badge">{t(s.confirmada ? 'calendar.season_confirmed' : 'calendar.season_projected')}</span>
              <h3>{s.season}</h3>
              <div><span>{t('calendar.season_start')}</span><time>{formatDate(s.start, locale)}</time></div>
              <div><span>{t('calendar.season_end')}</span><time>{formatDate(s.end, locale)}</time></div>
              {s.note && <p className="calendar-season-note">{t(`calendar.${s.note}`)}</p>}
            </article>
          ))}
        </div>
      </section>
      </>}
    </main>
  )
}
