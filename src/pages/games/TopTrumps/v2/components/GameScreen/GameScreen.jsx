import { useState } from 'react'
import TopTrumpsCard from '../../../../../../components/TopTrumpsCard/TopTrumpsCard'
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
          <div className="tt-player-card-wrapper">
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
            <div className="tt-card--mini-wrapper">
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
