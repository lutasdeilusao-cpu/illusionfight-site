import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import { GANGUES_TERRITORIOS, estadoTerritorio, progressoTerritorio, totalNos } from './data/ganguesTerritorios.js'
import './GanguesWorldMap.css'

export default function GanguesStoryMap({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const progress = store.storyProgress
  const firstOpen = Math.max(0, GANGUES_TERRITORIOS.findIndex(territorio => estadoTerritorio(territorio, progress) === 'aberto'))
  const [activeIndex, setActiveIndex] = useState(firstOpen)
  const active = GANGUES_TERRITORIOS[activeIndex]
  const activeState = estadoTerritorio(active, progress)
  const dominados = useMemo(() => GANGUES_TERRITORIOS.filter(territorio => estadoTerritorio(territorio, progress) === 'dominado').length, [progress])
  const domainPct = Math.round((dominados / GANGUES_TERRITORIOS.length) * 100)

  const move = direction => {
    setActiveIndex(index => Math.max(0, Math.min(GANGUES_TERRITORIOS.length - 1, index + direction)))
    sfx.select?.()
  }

  const enter = () => {
    if (activeState === 'trancado') { sfx.cancel(); return }
    sfx.select?.()
    store.setStoryTarget({ territorioId: active.id })
    onNavigate('territorio')
  }

  return (
    <main className="gang-world">
      <header className="gang-world__top">
        <button onClick={() => onNavigate('modes')}>← {t('games.gangues.story.menu')}</button>
        <span><b>{domainPct}%</b>{t('games.gangues.story.dominio')}</span>
      </header>

      <section className="gang-world__city" aria-label={t('games.gangues.story.titulo')}>
        <div className="gang-world__sky" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="gang-world__title">
          <small>LDI // {t('games.gangues.modes.marelia')}</small>
          <h1>{t('games.gangues.story.world_title')}</h1>
          <p>{t('games.gangues.story.world_hint')}</p>
        </div>

        <motion.div className="gang-world__rail" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18}
          onDragEnd={(_, info) => { if (info.offset.x < -45) move(1); if (info.offset.x > 45) move(-1) }}>
          {[-1, 0, 1].map(offset => {
            const index = activeIndex + offset
            const territorio = GANGUES_TERRITORIOS[index]
            if (!territorio) return <div key={offset} className="gang-world__ghost" />
            const state = estadoTerritorio(territorio, progress)
            const completed = Math.round(progressoTerritorio(territorio, progress) * totalNos(territorio))
            return <motion.button key={territorio.id}
              className={`gang-world-card gang-world-card--${offset === 0 ? 'active' : 'side'} gang-world-card--${state} gang-world-card--${territorio.id}`}
              onClick={() => offset === 0 ? enter() : setActiveIndex(index)}
              animate={{ scale: offset === 0 ? 1 : .84, opacity: offset === 0 ? 1 : .42 }}>
              <span className="gang-world-card__number">{String(territorio.ordem).padStart(2, '0')}</span>
              <span className="gang-world-card__scene" aria-hidden="true"><i /><i /><i /></span>
              <span className="gang-world-card__state">{state === 'dominado' ? t('games.gangues.story.dominado') : state === 'trancado' ? t('games.gangues.modes.bloqueado') : t('games.gangues.story.disponivel')}</span>
              <strong>{t(`games.gangues.story.territorios.${territorio.id}.nome`)}</strong>
              <small>{t(`games.gangues.story.dificuldades.${territorio.dificuldade}`)}</small>
              <span className="gang-world-card__progress"><progress max={totalNos(territorio)} value={completed} />{completed}/{totalNos(territorio)}</span>
            </motion.button>
          })}
        </motion.div>

        <div className="gang-world__controls">
          <button onClick={() => move(-1)} disabled={activeIndex === 0} aria-label={t('games.gangues.story.anterior')}>‹</button>
          <div>{GANGUES_TERRITORIOS.map((territorio, index) => <button key={territorio.id} className={index === activeIndex ? 'is-active' : ''} onClick={() => setActiveIndex(index)} aria-label={t(`games.gangues.story.territorios.${territorio.id}.nome`)} />)}</div>
          <button onClick={() => move(1)} disabled={activeIndex === GANGUES_TERRITORIOS.length - 1} aria-label={t('games.gangues.story.proximo')}>›</button>
        </div>
      </section>

      <section className="gang-world__intel">
        <span>{t('games.gangues.story.territorio_selecionado')}</span>
        <h2>{t(`games.gangues.story.territorios.${active.id}.nome`)}</h2>
        <p>{t(`games.gangues.story.territorios.${active.id}.desc`)}</p>
        <button onClick={enter} disabled={activeState === 'trancado'}>{activeState === 'trancado' ? t('games.gangues.story.bloqueado_cta') : t('games.gangues.story.entrar_territorio')} <b>→</b></button>
      </section>
    </main>
  )
}
