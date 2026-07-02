export default function KPResultOverlay({ result, onContinue }) {
  if (!result) return null

  const lethal = result.lethal
  const cls = `result-box ${lethal ? 'lethal' : 'miss'}`

  return (
    <div className="result-overlay show">
      <div className={cls} data-roll={result.rolled}>
        <div className="result-title">{lethal ? '🚀 ACERTOU' : '💥 ERROU'}</div>
        <div className="result-roll">
          <div className="die-face">{result.rolled}</div>
          <div className="result-calc">
            {lethal && result.savedByAlvo ? (
              <>Ataque absorvido pelo Decoy!</>
            ) : (
              <>
                Ataque {result.atk} - Defesa {result.def} = {result.atk - result.def}
                {result.perigoDefender > 0 ? ` + Perigo ${result.perigoDefender}` : ''}
                {' → '}Alvo {result.target}
                <br />
                Rolagem: {result.rolled}{lethal ? ' ≤' : ' >'} {result.target}
                {' → '}<span className={lethal ? 'hl' : 'hl-red'}>{lethal ? 'ATINGIDO' : 'FALHOU'}</span>
              </>
            )}
          </div>
        </div>
        <button className="btn-continue" onClick={onContinue}>CONTINUAR</button>
      </div>
    </div>
  )
}
