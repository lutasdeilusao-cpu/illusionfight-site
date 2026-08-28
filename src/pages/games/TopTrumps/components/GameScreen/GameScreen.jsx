import { useState, useEffect, useRef } from 'react'
import './GameScreen.css'
import TopTrumpsCard from '../../../../../components/TopTrumpsCard/TopTrumpsCard'
import FireParticles from '../FireParticles/FireParticles'
import CurtainReveal from '../CurtainReveal/CurtainReveal'

export default function GameScreen({
  cartaJogador, cartaIA, cartaJogadorImg, cartaIAImg,
  placar, rodada, totalTurnos, vezAtual, iaEscolhendo,
  girando, confirmandoAtributo, atributos, maxAtrib, templateIdxJogador, templateIdxIA,
  cortinaAtiva, onomaTexto, onClickAtributo, onCancelar, onConfirmar,
  onDesistir, locale, tt
}) {
  const [showDesistirModal, setShowDesistirModal] = useState(false)
  const isVezIA = vezAtual === 'ia'
  const localeStr = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)

  // Calcula a escala de cada carta para caber EXATAMENTE no espaço disponível.
  // Resolve o corte das cartas em telas baixas (Chrome/Safari iOS com barra de URL).
  const playerBoxRef = useRef(null)
  const miniBoxRef = useRef(null)
  useEffect(() => {
    const CARD_W = 550, CARD_H = 720
    const fit = (box) => {
      if (!box) return
      const r = box.getBoundingClientRect()
      if (!r.width || !r.height) return
      const s = Math.min(r.width / CARD_W, r.height / CARD_H)
      box.style.setProperty('--tt-card-scale', String(Math.max(s, 0)))
    }
    const apply = () => { fit(playerBoxRef.current); fit(miniBoxRef.current) }
    apply()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null
    if (ro) {
      if (playerBoxRef.current) ro.observe(playerBoxRef.current)
      if (miniBoxRef.current) ro.observe(miniBoxRef.current)
    }
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    const t1 = setTimeout(apply, 150)
    const t2 = setTimeout(apply, 600)
    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
      clearTimeout(t1); clearTimeout(t2)
    }
  }, [])

  return (
    <>
      <div className="tt-fire-particles">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="tt-fire-particle" />
        ))}
      </div>
      <section className="tt-page">
        <div className="tt-game-container">
          <div className="tt-game-header">
            <div className="tt-game-round">{tt('hud_rodada', { n: rodada, total: totalTurnos })}</div>
            <div className="tt-game-score">
              <span className="tt-score-you">{tt('voce')} {placar.jogador}</span>
              <span className="tt-score-sep">:</span>
              <span className="tt-score-ai">{tt('ia')} {placar.ia}</span>
            </div>
          </div>
          <div className="tt-player-card-wrapper" ref={playerBoxRef}>
            <TopTrumpsCard
              characterImage={cartaJogadorImg}
              name={cartaJogador?.nome}
              description={cartaJogador?.descricao}
              locale={localeStr}
              attributes={cartaJogador?.atributos}
              onAttributeClick={!isVezIA ? (attr) => onClickAtributo(attr) : undefined}
              disabled={girando || !!confirmandoAtributo || isVezIA || iaEscolhendo}
              templateIndex={templateIdxJogador}
            />
          </div>
          <div className="tt-vs-heartbeat">
            <div className="tt-vs-heartbeat-glow" />
            <span className="tt-vs-heartbeat-text">VS</span>
          </div>
          <div className="tt-opponent-mini-wrapper">
            <span className="tt-opponent-mini-label">
              {isVezIA ? tt('adversario_escolhendo') : tt('adversario')}
            </span>
            <div className="tt-card--mini-wrapper" ref={miniBoxRef}>
              <TopTrumpsCard mystery={true} mini={true} locale={localeStr} templateIndex={cartaIA ? (cartaIA.id % 6) : 0} />
            </div>
          </div>
          <div className="tt-game-footer">
            <button className="tt-btn-desistir" onClick={() => setShowDesistirModal(true)}>
              {tt('desistir')}
            </button>
          </div>
        </div>

        {confirmandoAtributo && (() => {
          const attr = atributos.find(a => a.id === confirmandoAtributo)
          const vJ = cartaJogador?.atributos?.[confirmandoAtributo]
          const maxV = maxAtrib?.[confirmandoAtributo]
          const pctMax = maxV ? Math.round((vJ / maxV) * 100) : 0
          return (
            <div className="tt-confirm-overlay">
              <div className="tt-confirm-modal">
                <span className="tt-confirm-label">{tt('confirmar_atributo')}</span>
                <span className="tt-confirm-attr-nome">{attr ? tt(attr.nomeKey) : ''}</span>
                <div className="tt-confirm-values">
                  <div className="tt-confirm-value-box">
                    <span className="tt-confirm-value-label">{tt('seu_valor')}</span>
                    <span className="tt-confirm-value-num">{vJ}</span>
                  </div>
                  <div className="tt-confirm-value-box">
                    <span className="tt-confirm-value-label">{tt('valor_maximo')}</span>
                    <span className="tt-confirm-value-num tt-confirm-value-max">{maxV}</span>
                  </div>
                </div>
                <div className="tt-confirm-bar">
                  <div className="tt-confirm-bar-fill" ref={el => { if (el) el.style.width = `${pctMax}%` }} />
                </div>
                <span className="tt-confirm-pct">{tt('do_maximo', { pct: pctMax })}</span>
                <div className="tt-confirm-buttons">
                  <button className="tt-confirm-btn tt-confirm-btn--cancel" onClick={onCancelar}>{tt('cancelar')}</button>
                  <button className="tt-confirm-btn tt-confirm-btn--ok" onClick={onConfirmar}>{tt('confirmar')}</button>
                </div>
              </div>
            </div>
          )
        })()}

        <CurtainReveal ativo={cortinaAtiva} texto={onomaTexto} />

        {showDesistirModal && (
          <div className="tt-desistir-overlay" onClick={() => setShowDesistirModal(false)}>
            <div className="tt-desistir-modal" onClick={e => e.stopPropagation()}>
              <h3 className="tt-desistir-modal-titulo">{tt('desistir_modal_titulo')}</h3>
              <p className="tt-desistir-modal-desc">{tt('desistir_modal_desc')}</p>
              <div className="tt-desistir-modal-actions">
                <button className="tt-desistir-modal-btn tt-desistir-modal-btn--cancel" onClick={() => setShowDesistirModal(false)}>{tt('cancelar')}</button>
                <button className="tt-desistir-modal-btn tt-desistir-modal-btn--confirm" onClick={() => { setShowDesistirModal(false); onDesistir() }}>{tt('desistir_modal_confirmar')}</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
