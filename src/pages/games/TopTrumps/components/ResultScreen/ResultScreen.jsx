import TopTrumpsCard from '../../../../../components/TopTrumpsCard/TopTrumpsCard'
import FireParticles from '../FireParticles/FireParticles'
import BurstParticles from '../BurstParticles/BurstParticles'

export default function ResultScreen({
  cartaJogador, cartaIA, cartaJogadorImg, cartaIAImg,
  atributoEscolhido, resultado, placar, rodada,
  totalTurnos, swipeRevealed, onSwipeToggle, onProximaRodada, particulas,
  templateIdxJogador, templateIdxIA, atributos, locale, tt
}) {
  const attr = atributos?.find(a => a.id === atributoEscolhido)
  const localeStr = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
  const vJ = cartaJogador?.atributos?.[atributoEscolhido]
  const vI = cartaIA?.atributos?.[atributoEscolhido]

  return (
    <>
      <div className="tt-fire-particles">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="tt-fire-particle" />
        ))}
      </div>
      <section className="tt-page">
        {particulas?.map(p => (
          <div key={p.id} className={`tt-particula tt-particula--${p.tipo} tt-particula--v${p.variante}`} />
        ))}
        <div className="tt-result-container">
          <div className="tt-game-header">
            <div className="tt-game-round">{tt('hud_rodada', { n: rodada, total: totalTurnos })}</div>
            <div className="tt-game-score">
              <span className="tt-score-you">{placar?.jogador}</span>
              <span className="tt-score-sep">:</span>
              <span className="tt-score-ai">{placar?.ia}</span>
            </div>
          </div>
          <div className={`tt-result-badge ${
            resultado === 'ganhou' ? 'tt-result-win' :
            resultado === 'perdeu' ? 'tt-result-lose' : 'tt-result-draw'
          }`}>
            {resultado === 'ganhou' ? tt('voce_venceu') :
             resultado === 'perdeu' ? tt('ia_venceu') : tt('empate')}
          </div>
          {attr && (
            <div className="tt-result-attr-comparison">
              <div className="tt-result-attr-name">{tt(attr.nomeKey)}</div>
              <div className="tt-result-values">
                <span className="tt-result-val-you">{vJ}</span>
                <span className="tt-result-val-sep">{'\u00D7'}</span>
                <span className="tt-result-val-ai">{vI}</span>
              </div>
            </div>
          )}
          <div className="tt-cards-swipe-container">
            <div className={`tt-cards-swipe-track${swipeRevealed ? ' tt-cards-swipe-track--revealed' : ''}`}>
              <div className="tt-swipe-card-slot">
                <span className="tt-swipe-label">{tt('sua_carta')}</span>
                <TopTrumpsCard
                  characterImage={cartaJogadorImg}
                  name={cartaJogador?.nome}
                  description={cartaJogador?.descricao}
                  locale={localeStr}
                  attributes={cartaJogador?.atributos}
                  disabled={true}
                  templateIndex={templateIdxJogador}
                />
              </div>
              <div className="tt-swipe-card-slot">
                <span className="tt-swipe-label">{tt('carta_adversario')}</span>
                <TopTrumpsCard
                  characterImage={cartaIAImg}
                  name={cartaIA?.nome}
                  description={cartaIA?.descricao}
                  locale={localeStr}
                  attributes={cartaIA?.atributos}
                  disabled={true}
                  templateIndex={templateIdxIA}
                />
              </div>
            </div>
            <button
              className={`tt-swipe-btn${swipeRevealed ? ' tt-swipe-btn--left' : ' tt-swipe-btn--right'}`}
              onClick={onSwipeToggle}
              aria-label={swipeRevealed ? tt('swipe_voltar') : tt('swipe_ver_adversario')}
            >
              {swipeRevealed ? '\u2190' : '\u2192'}
            </button>
          </div>
          <button className="tt-btn-next-round" onClick={onProximaRodada}>
            {rodada >= totalTurnos ? tt('result_final') : tt('proxima_rodada')}
          </button>
        </div>
      </section>
    </>
  )
}
