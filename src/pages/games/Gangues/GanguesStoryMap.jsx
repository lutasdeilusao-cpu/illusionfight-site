import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import GangDialog from './components/GangDialog'
import {
  GANGUES_TERRITORIOS,
  estadoTerritorio,
  progressoTerritorio,
  totalNos,
} from './data/ganguesTerritorios.js'
import './GanguesStory.css'

const INTRO_KEY = 'ldi-gangues-story-intro'

/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o mapa de Marelia (fragmentada, antes do Alan)
   Esqueleto visual: a cidade dividida em regiões (polígonos no SVG).
   Clica numa região → entra nela e enfrenta as gangues dos pontos.
   Domina a região → a próxima acende. O Isaias troca o SVG por arte
   de mapa de verdade — a estrutura de estados fica.
   ══════════════════════════════════════════════════════════════ */

function centro(poly) {
  const pts = poly.trim().split(/\s+/).map(p => p.split(',').map(Number))
  const x = pts.reduce((s, p) => s + p[0], 0) / pts.length
  const y = pts.reduce((s, p) => s + p[1], 0) / pts.length
  return { x, y }
}

export default function GanguesStoryMap({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const progress = store.storyProgress
  const [intro, setIntro] = useState(() => {
    try { return !localStorage.getItem(INTRO_KEY) } catch { return true }
  })
  const fecharIntro = () => {
    try { localStorage.setItem(INTRO_KEY, '1') } catch { /* ignora */ }
    setIntro(false)
  }

  const dominados = useMemo(
    () => GANGUES_TERRITORIOS.filter(terr => estadoTerritorio(terr, progress) === 'dominado').length,
    [progress],
  )
  const pct = Math.round((dominados / GANGUES_TERRITORIOS.length) * 100)

  const abrirTerritorio = (terr) => {
    const estado = estadoTerritorio(terr, progress)
    if (estado === 'trancado') { sfx.cancel(); return }
    sfx.select()
    store.setStoryTarget({ territorioId: terr.id })
    onNavigate('territorio')
  }

  return (
    <main className="gang-lobby gang-story">
      <AnimatePresence>
        {intro && (
          <GangDialog
            lines={t('games.gangues.story.abertura')}
            speaker={t('games.gangues.dialogo.veio_nome')}
            sub={t('games.gangues.dialogo.veio_sub')}
            onFinish={fecharIntro}
            onSkip={fecharIntro}
          />
        )}
      </AnimatePresence>

      <header className="gang-story-head">
        <button className="gang-progression-screen-back" onClick={() => onNavigate('modes')}>
          ← {t('games.gangues.progression.back_to_roster')}
        </button>
        <div className="gang-story-dominio">
          <span className="gang-story-dominio-num">{pct}%</span>
          <span>{t('games.gangues.story.dominio')}{store.gangName ? ` · ${store.gangName}` : ''}</span>
        </div>
      </header>

      <div className="gang-story-titulo-wrap">
        <span className="if-eyebrow">IF // MARELIA</span>
        <h1 className="gang-story-titulo">{t('games.gangues.story.titulo')}</h1>
        <p className="gang-story-sub">{t('games.gangues.story.sub')}</p>
      </div>

      {/* ── O mapa da cidade ── */}
      <div className="gang-story-mapa">
        <div className="gang-story-mapa-grid" aria-hidden="true" />

        <svg className="gang-story-mapa-svg" viewBox="0 0 100 108" preserveAspectRatio="none" aria-hidden="true">
          {/* linha do trem que corta a Baixada */}
          <line x1="49" y1="106" x2="49" y2="58" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 2" />
          {/* rota de avanço, região a região */}
          <polyline
            points={GANGUES_TERRITORIOS.map(terr => { const c = centro(terr.poly); return `${c.x},${c.y}` }).join(' ')}
            fill="none" stroke="rgba(24,218,251,0.32)" strokeWidth="0.7" strokeDasharray="1.6 1.6"
          />
          {GANGUES_TERRITORIOS.map((terr, i) => {
            const estado = estadoTerritorio(terr, progress)
            const c = centro(terr.poly)
            return (
              <g key={terr.id} onClick={() => abrirTerritorio(terr)} style={{ cursor: estado === 'trancado' ? 'not-allowed' : 'pointer' }}>
                <motion.polygon
                  points={terr.poly}
                  className={`gang-story-regiao gang-story-regiao--${estado}`}
                  style={{ '--terr-cor': terr.cor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                />
                {estado === 'aberto' && (
                  <circle cx={c.x} cy={c.y} r="1.4" className="gang-story-regiao-farol" style={{ '--terr-cor': terr.cor }} />
                )}
              </g>
            )
          })}
        </svg>

        <div className="gang-story-mapa-fog" aria-hidden="true" />

        {/* rótulos das regiões (HTML pra texto nítido) */}
        {GANGUES_TERRITORIOS.map((terr, i) => {
          const estado = estadoTerritorio(terr, progress)
          const prog = progressoTerritorio(terr, progress)
          const feitos = Math.round(prog * totalNos(terr))
          const gangues = new Set(terr.pontos.map(p => p.gangue)).size
          return (
            <motion.button
              key={terr.id}
              className={`gang-story-terr gang-story-terr--${estado}`}
              style={{ top: `${terr.pos.top}%`, left: `${terr.pos.left}%`, '--terr-cor': terr.cor }}
              onClick={() => abrirTerritorio(terr)}
              disabled={estado === 'trancado'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.09 }}
            >
              <span className="gang-story-terr-num">{String(terr.ordem).padStart(2, '0')}</span>
              <span className="gang-story-terr-nome">{t(`games.gangues.story.territorios.${terr.id}.nome`)}</span>
              <span className="gang-story-terr-dif">{t(`games.gangues.story.dificuldades.${terr.dificuldade}`)}</span>
              {estado === 'dominado'
                ? <span className="gang-story-terr-tag gang-story-terr-tag--ok">⚑ {t('games.gangues.story.dominado')}</span>
                : estado === 'trancado'
                  ? <span className="gang-story-terr-tag gang-story-terr-tag--lock">🔒</span>
                  : <span className="gang-story-terr-tag">{feitos > 0
                      ? `${feitos}/${totalNos(terr)}`
                      : t('games.gangues.story.n_gangues', { n: gangues })}</span>}
            </motion.button>
          )
        })}
      </div>

      <button className="gang-lobby-quit" onClick={() => onNavigate('modes')}>
        {t('games.gangues.progression.back_to_roster')}
      </button>
      {pct === 100 && <button className="gang-new-sheet gang-new-sheet--primary" onClick={() => store.resetStory()}>{t('games.gangues.story.new_campaign')}</button>}
    </main>
  )
}
