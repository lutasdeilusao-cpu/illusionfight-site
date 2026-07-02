import { useKpI18n } from '../hooks/useKpI18n'

export default function KPResultOverlay({ result, onContinue }) {
  const { t } = useKpI18n()
  if (!result) return null

  const lethal = result.lethal
  const cls = `result-box ${lethal ? 'lethal' : 'miss'}`

  return (
    <div className="result-overlay show">
      <div className={cls} data-roll={result.rolled}>
        <div className="result-title">{lethal ? t('kp.result.acertou') : t('kp.result.errou')}</div>
        <div className="result-roll">
          <div className="die-face">{result.rolled}</div>
          <div className="result-calc">
            {lethal && result.savedByAlvo ? (
              <>{t('kp.result.decoy')}</>
            ) : (
              <>
                {t('kp.result.calc_atk_def', { atk: result.atk, def: result.def, diff: result.atk - result.def })}
                {result.perigoDefender > 0 ? ` ${t('kp.result.calc_perigo', { perigo: result.perigoDefender })}` : ''}
                {' → '}{t('kp.result.alvo', { target: result.target })}
                <br />
                {lethal
                  ? t('kp.result.rolagem_hit', { rolled: result.rolled, target: result.target })
                  : t('kp.result.rolagem_miss', { rolled: result.rolled, target: result.target })}
                {' → '}<span className={lethal ? 'hl' : 'hl-red'}>{lethal ? t('kp.result.atingido') : t('kp.result.falhou')}</span>
              </>
            )}
          </div>
        </div>
        <button className="btn-continue" onClick={onContinue}>{t('kp.result.continuar')}</button>
      </div>
    </div>
  )
}
