import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import {
  GANGUES_TERRITORIOS,
  estadoTerritorio,
  progressoTerritorio,
  totalNos,
} from './data/ganguesTerritorios.js'
import './GanguesStory.css'

/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o mapa de Marelia
   Esqueleto visual: 5 territórios num mapa estilizado, ligados por
   uma rota. Você domina um, o próximo acende. O Isaias vai trocar
   a arte de fundo, os ícones e as animações — a estrutura fica.
   ══════════════════════════════════════════════════════════════ */

const CHECKS = [8, 21, 34, 47, 60, 73, 86] // pontinhos da rota entre territórios

export default function GanguesStoryMap({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const progress = store.storyProgress

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
      <header className="gang-story-head">
        <button className="gang-progression-screen-back" onClick={() => onNavigate('lobby')}>
          ← {t('games.gangues.progression.back_to_roster')}
        </button>
        <div className="gang-story-dominio">
          <span className="gang-story-dominio-num">{pct}%</span>
          <span>{t('games.gangues.story.dominio')}</span>
        </div>
      </header>

      <div className="gang-story-titulo-wrap">
        <span className="if-eyebrow">IF // MARELIA</span>
        <h1 className="gang-story-titulo">{t('games.gangues.story.titulo')}</h1>
        <p className="gang-story-sub">{t('games.gangues.story.sub')}</p>
      </div>

      {/* ── O mapa ── */}
      <div className="gang-story-mapa">
        <div className="gang-story-mapa-grid" aria-hidden="true" />
        <div className="gang-story-mapa-fog" aria-hidden="true" />

        {/* rota ligando os territórios, na ordem */}
        <svg className="gang-story-rota" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points={GANGUES_TERRITORIOS.map(terr => `${terr.pos.left},${terr.pos.top}`).join(' ')}
            fill="none"
            stroke="rgba(24,218,251,0.35)"
            strokeWidth="0.6"
            strokeDasharray="1.6 1.4"
          />
          {CHECKS.map(p => {
            // ponto interpolado ao longo da polilinha
            const segs = GANGUES_TERRITORIOS
            const t01 = p / 100
            const idx = Math.min(segs.length - 2, Math.floor(t01 * (segs.length - 1)))
            const local = t01 * (segs.length - 1) - idx
            const a = segs[idx].pos, b = segs[idx + 1].pos
            const x = a.left + (b.left - a.left) * local
            const y = a.top + (b.top - a.top) * local
            return <circle key={p} cx={x} cy={y} r="0.5" fill="rgba(24,218,251,0.5)" />
          })}
        </svg>

        {GANGUES_TERRITORIOS.map((terr, i) => {
          const estado = estadoTerritorio(terr, progress)
          const prog = progressoTerritorio(terr, progress)
          const feitos = Math.round(prog * totalNos(terr))
          return (
            <motion.button
              key={terr.id}
              className={`gang-story-terr gang-story-terr--${estado}`}
              style={{
                top: `${terr.pos.top}%`,
                left: `${terr.pos.left}%`,
                '--terr-cor': terr.cor,
              }}
              onClick={() => abrirTerritorio(terr)}
              disabled={estado === 'trancado'}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.09, type: 'spring', stiffness: 260, damping: 18 }}
            >
              <span className="gang-story-terr-halo" aria-hidden="true" />
              <span className="gang-story-terr-num">{String(terr.ordem).padStart(2, '0')}</span>
              <span className="gang-story-terr-nome">{t(`games.gangues.story.territorios.${terr.id}.nome`)}</span>
              <span className="gang-story-terr-dif">{t(`games.gangues.story.dificuldades.${terr.dificuldade}`)}</span>
              {estado === 'dominado' && <span className="gang-story-terr-flag">⚑</span>}
              {estado === 'trancado' && <span className="gang-story-terr-lock" aria-hidden="true">🔒</span>}
              {estado === 'aberto' && feitos > 0 && (
                <span className="gang-story-terr-prog">{feitos}/{totalNos(terr)}</span>
              )}
            </motion.button>
          )
        })}
      </div>

      <button className="gang-lobby-quit" onClick={() => onNavigate('lobby')}>
        {t('games.gangues.progression.back_to_roster')}
      </button>
    </main>
  )
}
