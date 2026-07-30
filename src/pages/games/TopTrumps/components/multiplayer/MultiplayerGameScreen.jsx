import TopTrumpsCard from '../../../../../components/TopTrumpsCard/TopTrumpsCard'
import FireParticles from '../FireParticles/FireParticles'
import CurtainReveal from '../CurtainReveal/CurtainReveal'
import SoundToggle from '../SoundToggle/SoundToggle'
import './MultiplayerGameScreen.css'

export default function MultiplayerGameScreen({
  cartaLocal,
  cartaLocalImg,
  placar,
  rodada,
  totalTurnos,
  tempoRestante,
  oponenteNome,
  locale,
  rodadaLiberada,
  ehMinhaVez,
  jaMovi,
  girando,
  somAtivo,
  cortinaAtiva,
  onomaTexto,
  onToggleSom,
  onJogarAtributo,
  tt,
}) {
  const localeCarta = (locale || 'pt').slice(0, 2)
  const interacaoBloqueada = !rodadaLiberada || !ehMinhaVez || jaMovi || girando

  let status = tt('mp.sua_vez')
  if (!rodadaLiberada) status = tt('mp.selecionando')
  else if (jaMovi || !ehMinhaVez) status = tt('mp.hud_adversario_escolhendo')

  return (
    <>
      <FireParticles />
      <section className="ttmp-page ttmp-game-screen">
        <SoundToggle
          ativo={somAtivo}
          onToggle={onToggleSom}
          labelAtivo={tt('som_desativar')}
          labelInativo={tt('som_ativar')}
          iconAtivo="🔊"
          iconInativo="🔇"
          className="ttmp-sound-toggle"
        />

        <header className="ttmp-game-hud">
          <div className="ttmp-game-score ttmp-game-score--local">
            <span className="ttmp-game-score-label">{tt('mp.hud_voce')}</span>
            <strong>{placar.eu}</strong>
          </div>

          <div className="ttmp-game-round">
            <span>{tt('mp.hud_rodada', { n: rodada, total: totalTurnos })}</span>
            <div className={`ttmp-timer${tempoRestante <= 5 ? ' ttmp-timer--warn' : ''}`}>
              <svg viewBox="0 0 60 60" className="ttmp-timer-svg" aria-hidden="true">
                <circle cx="30" cy="30" r="26" className="ttmp-timer-bg" />
                <circle cx="30" cy="30" r="26" className="ttmp-timer-fill" transform="rotate(-90 30 30)" />
              </svg>
              <span className="ttmp-timer-texto">{tempoRestante}</span>
            </div>
          </div>

          <div className="ttmp-game-score ttmp-game-score--opponent">
            <span className="ttmp-game-score-label">{oponenteNome}</span>
            <strong>{placar.oponente}</strong>
          </div>
        </header>

        <div className="ttmp-game-status" aria-live="polite">
          <span className={`ttmp-game-status-dot${interacaoBloqueada ? '' : ' ttmp-game-status-dot--ready'}`} />
          <span>{status}</span>
        </div>

        <main className={`ttmp-game-board${interacaoBloqueada ? ' ttmp-game-board--locked' : ''}`}>
          <div className="ttmp-game-local-card">
            <TopTrumpsCard
              characterImage={cartaLocalImg}
              name={cartaLocal.nome}
              description={cartaLocal.descricao}
              locale={localeCarta}
              attributes={cartaLocal.atributos}
              onAttributeClick={onJogarAtributo}
              disabled={interacaoBloqueada}
              templateIndex={cartaLocal.id % 6}
            />
          </div>

          <div className="ttmp-game-opponent">
            <span className="ttmp-game-opponent-label">{oponenteNome}</span>
            <div className="ttmp-game-opponent-card">
              <TopTrumpsCard
                mystery
                mini
                locale={localeCarta}
                templateIndex={0}
              />
            </div>
          </div>
        </main>

        <CurtainReveal ativo={cortinaAtiva} texto={onomaTexto} />
      </section>
    </>
  )
}
