import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { sfx } from '../../../../lib/sfx'
import { GANGUES_TERRITORIOS, estadoTerritorio, progressoTerritorio, totalNos } from '../data/ganguesTerritorios.js'
import GanguesVoltarBtn from '../components/GanguesVoltarBtn'
import useGanguesTeclado from '../hooks/useGanguesTeclado'
import mapaArte from '../assets/backgrounds/mapa-marelia.webp'
import '../styles/parede.css' // .gang-brickwall-bg (o resto do CSS base vem do Gangues.css, importado pelo GanguesRoute)
import './GanguesWorldMap.css'

/* Mapa de Marelia — ilustração em pixel art com as regiões do SVG por cima
   (poly/pos/cor de cada território). Tocar numa região abre a pergunta
   "entrar?" embaixo, com o resumo do bairro; tocar fora cancela. */
export default function GanguesStoryMap({ onNavigate, onVoltar }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const progress = store.storyProgress
  const firstOpen = Math.max(0, GANGUES_TERRITORIOS.findIndex(territorio => estadoTerritorio(territorio, progress) === 'aberto'))
  const [activeIndex, setActiveIndex] = useState(firstOpen)
  const [perguntando, setPerguntando] = useState(false)
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
    setPerguntando(true)
    sfx.select?.()
  }
  const cancelar = () => { setPerguntando(false); sfx.cancel?.() }
  useGanguesTeclado({ escape: cancelar, enter: () => enter(), e: () => enter() }, perguntando, 1)

  const enter = () => {
    if (activeState === 'trancado') { sfx.cancel(); return }
    if (bloqueadoNoFacil) { sfx.cancel(); onNavigate('modes'); return }
    sfx.select?.()
    store.setStoryTarget({ territorioId: active.id })
    onNavigate('territorio')
  }

  return (
    <main className="gang-world gang-brickwall-bg">
      <header className="gang-world__top">
        <GanguesVoltarBtn onClick={onVoltar || (() => onNavigate('modes'))} />
        <span><b>{domainPct}%</b>{t('games.gangues.story.dominio')}</span>
        <button className="gang-world__top-gang" onClick={() => { sfx.select?.(); onNavigate('lobby') }}>
          👥 {t('games.gangues.story.gerenciar_gangue')}
        </button>
      </header>

      <div className="gang-world__title">
        <h1>{t('games.gangues.story.world_title')}</h1>
        <p>{t('games.gangues.story.world_hint')}</p>
      </div>

      <section className="gang-world__city" aria-label={t('games.gangues.story.titulo')}>
        <div className="gang-world__sky" aria-hidden="true"><i /><i /><i /><i /><i /></div>

        <div className="gang-world__map" role="group" aria-label={t('games.gangues.story.titulo')}>
          <img className="gang-world__arte" src={mapaArte} alt="" aria-hidden="true" draggable="false" />
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
      {perguntando && createPortal(
        <div className="gang-world__pergunta-bg" onClick={cancelar}>
          <section className={`gang-world__intel gang-world__pergunta${bloqueadoNoFacil ? ' gang-world__intel--facil' : ''}`} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <span>{t('games.gangues.story.territorio_selecionado')}</span>
            <h2>{t(`games.gangues.story.territorios.${active.id}.nome`)}</h2>
            <p>{bloqueadoNoFacil ? t('games.gangues.story.facil_ultimo') : t(`games.gangues.story.territorios.${active.id}.desc`)}</p>
            {!bloqueadoNoFacil && (
              <div className="gang-world__intel-progress">
                <progress max={totalNos(active)} value={Math.round(progressoTerritorio(active, progress) * totalNos(active))} />
                <small>{Math.round(progressoTerritorio(active, progress) * totalNos(active))}/{totalNos(active)}</small>
              </div>
            )}
            {activeState === 'trancado' ? (
              <>
                <strong className="gang-world__pergunta-txt">{t('games.gangues.story.bloqueado_cta')}</strong>
                <div className="gang-world__pergunta-acoes"><button type="button" className="is-nao" onClick={cancelar}>{t('games.gangues.story.pergunta_ok')}</button></div>
              </>
            ) : bloqueadoNoFacil ? (
              <div className="gang-world__pergunta-acoes">
                <button type="button" className="is-nao" onClick={cancelar}>{t('games.gangues.story.pergunta_nao')}</button>
                <button type="button" onClick={enter}>{t('games.gangues.story.facil_ultimo_cta')}</button>
              </div>
            ) : (
              <>
                <strong className="gang-world__pergunta-txt">{t('games.gangues.story.pergunta_entrar')}</strong>
                <div className="gang-world__pergunta-acoes">
                  <button type="button" className="is-nao" onClick={cancelar}>{t('games.gangues.story.pergunta_nao')}</button>
                  <button type="button" onClick={enter}>{t('games.gangues.story.pergunta_sim')}</button>
                </div>
              </>
            )}
          </section>
        </div>,
        document.body,
      )}
    </main>
  )
}
