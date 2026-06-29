export default function GameHUD({ rodada, totalTurnos, placarJogador, placarIA, labelVoce, labelIA }) {
  return (
    <div className="tt-game-header">
      <div className="tt-game-round">RODADA {rodada}/{totalTurnos}</div>
      <div className="tt-game-score">
        <span className="tt-score-you">{placarJogador}</span>
        <span className="tt-score-sep">:</span>
        <span className="tt-score-ai">{placarIA}</span>
      </div>
    </div>
  )
}
