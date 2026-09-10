import { useMemo, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { sfx } from '../../../lib/sfx'
import { GANGUES_TERRITORIOS, estadoTerritorio, progressoTerritorio, totalNos } from './data/ganguesTerritorios.js'
import './GanguesWorldMap.css'

/* Mapa político de Marelia — cada território é uma região desenhada no SVG
   (poly/pos/cor já existiam nos dados, só nunca tinham sido usados; o
   carrossel antigo ignorava isso). Tocar numa região seleciona ela; o
   painel de baixo mostra os detalhes e o botão de entrar. */
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

  // NO FÁCIL você joga até o PENÚLTIMO bairro (estilo Doom). Ao tentar entrar
  // no 7º e último, o jogo te zoa e manda subir a dificuldade — o chefão final
  // não se rebaixa a encarar pivete.
  const modo = store.dificuldadeJogo?.() || 'medio'
  const ultimoId = GANGUES_TERRITORIOS[GANGUES_TERRITORIOS.length - 1]?.id
  const bloqueadoNoFacil = modo === 'facil' && active.id === ultimoId
    && activeState !== 'trancado' && activeState !== 'dominado'

  const selecionar = (territorio) => {
    setActiveIndex(GANGUES_TERRITORIOS.indexOf(territorio))
    sfx.select?.()
  }

  const enter = () => {
    if (activeState === 'trancado') { sfx.cancel(); return }
    if (bloqueadoNoFacil) { sfx.cancel(); onNavigate('modes'); return }
    sfx.select?.()
    store.setStoryTarget({ territorioId: active.id })
    onNavigate('territorio')
  }

  return (
    <main className="gang-world">
      <header className="gang-world__top">
        <button onClick={() => onNavigate('modes')}>← {t('games.gangues.story.menu')}</button>
        <span><b>{domainPct}%</b>{t('games.gangues.story.dominio')}</span>
        <button className="gang-world__top-gang" onClick={() => { sfx.select?.(); onNavigate('lobby') }}>
          👥 {t('games.gangues.story.gerenciar_gangue')}
        </button>
      </header>

      <div className="gang-world__title">
        <h1>{t('games.gangues.story.world_title')}</h1>
        <p>{t('games.gangues.story.world_hint')}</p>
      </div>

      <section className={`gang-world__intel${bloqueadoNoFacil ? ' gang-world__intel--facil' : ''}`}>
        <span>{t('games.gangues.story.territorio_selecionado')}</span>
        <h2>{t(`games.gangues.story.territorios.${active.id}.nome`)}</h2>
        <p>{bloqueadoNoFacil ? t('games.gangues.story.facil_ultimo') : t(`games.gangues.story.territorios.${active.id}.desc`)}</p>
        {!bloqueadoNoFacil && (
          <div className="gang-world__intel-progress">
            <progress max={totalNos(active)} value={Math.round(progressoTerritorio(active, progress) * totalNos(active))} />
            <small>{Math.round(progressoTerritorio(active, progress) * totalNos(active))}/{totalNos(active)}</small>
          </div>
        )}
        <button onClick={enter} disabled={activeState === 'trancado'}>
          {activeState === 'trancado'
            ? t('games.gangues.story.bloqueado_cta')
            : bloqueadoNoFacil
              ? t('games.gangues.story.facil_ultimo_cta')
              : t('games.gangues.story.entrar_territorio')} <b>→</b>
        </button>
      </section>

      <section className="gang-world__city" aria-label={t('games.gangues.story.titulo')}>
        <div className="gang-world__sky" aria-hidden="true"><i /><i /><i /><i /><i /></div>

        <div className="gang-world__map" role="group" aria-label={t('games.gangues.story.titulo')}>
          <svg viewBox="0 0 100 150" className="gang-world__svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            {GANGUES_TERRITORIOS.map(territorio => {
              const state = estadoTerritorio(territorio, progress)
              return (
                <polygon
                  key={territorio.id}
                  points={territorio.poly}
                  className={`gang-world__region gang-world__region--${state}${territorio.id === active.id ? ' is-selected' : ''}`}
                  style={{ '--regiao-cor': territorio.cor }}
                  onClick={() => selecionar(territorio)}
                />
              )
            })}
          </svg>
          {GANGUES_TERRITORIOS.map(territorio => {
            const state = estadoTerritorio(territorio, progress)
            return (
              <button
                key={territorio.id}
                type="button"
                className={`gang-world__region-label gang-world__region-label--${state}${territorio.id === active.id ? ' is-selected' : ''}`}
                style={{ top: `${territorio.pos.top}%`, left: `${territorio.pos.left}%`, '--regiao-cor': territorio.cor }}
                onClick={() => selecionar(territorio)}
              >
                <b>{String(territorio.ordem).padStart(2, '0')}</b>
                <span>{t(`games.gangues.story.territorios.${territorio.id}.nome`)}</span>
                {state === 'dominado' && <i className="gang-world__region-label-flag" aria-hidden="true">⚑</i>}
                {state === 'trancado' && <i className="gang-world__region-label-lock" aria-hidden="true">🔒</i>}
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}
