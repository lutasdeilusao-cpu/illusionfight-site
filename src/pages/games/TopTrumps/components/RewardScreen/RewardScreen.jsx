import TopTrumpsCard from '../../../../../components/TopTrumpsCard/TopTrumpsCard'
import './RewardScreen.css'

export default function RewardScreen({
  opcoes, selecionada, onSelecionar, onConfirmar, locale, tt, cardImage
}) {
  const localeStr = (localStorage.getItem('ldi-locale') || 'pt').slice(0, 2)
  return (
    <section className="tt-page">
      <div className="tt-recompensa">
        <h2 className="tt-recompensa-titulo">{tt('recompensa_titulo')}</h2>
        <p className="tt-recompensa-sub">{tt('recompensa_sub')}</p>
        <div className="tt-recompensa-cards">
          {opcoes?.map((carta) => (
            <div key={carta.id} className={`tt-recompensa-card${selecionada?.id === carta.id ? ' tt-recompensa-card--virada' : ''}`}
              onClick={() => onSelecionar(carta)}>
              {selecionada?.id === carta.id ? (
                <div className="tt-recompensa-card-virada-wrapper">
                  <TopTrumpsCard
                    characterImage={cardImage ? cardImage(carta) : (carta.imagem || '')}
                    name={carta.nome}
                    description={carta.descricao}
                    locale={localeStr}
                    attributes={carta.atributos}
                    templateIndex={0}
                  />
                </div>
              ) : (
                <div className="tt-recompensa-card-verso">
                  <span className="tt-recompensa-card-verso-texto">?</span>
                  <p className="tt-recompensa-card-verso-label">{tt('recompensa_carta_misteriosa')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="tt-btn-confirmar" disabled={!selecionada} onClick={onConfirmar}>
          {tt('recompensa_confirmar')}
        </button>
      </div>
    </section>
  )
}
