import './GanguesMultidaoActionBar.css'

// Barra de ação da Briga em Multidão, embaixo, no dedão: o foco (inimigo
// marcado tocando nele) e a Tática em cima; AVANÇAR RODADA e o automático
// embaixo. Sair fica no "Mete o pé" da barra do topo.
export default function GanguesMultidaoActionBar({ t, focoNome, onLimparFoco, onAbrirTatica, taticasAtivas, avancarRodada, revelandoRodada, prontoPraAvancar, autoOn, onToggleAuto }) {
  return (
    <div className="gang-mdao">
      <div className="gang-mdao__linha">
        {focoNome
          ? <button type="button" className="gang-mdao__foco is-on" onClick={onLimparFoco} aria-label={t('games.gangues.multidao.foco_tirar')}>
              <span aria-hidden="true">🎯</span>
              <span className="gang-mdao__foco-texto"><small>{t('games.gangues.multidao.foco')}</small><strong>{focoNome}</strong></span>
              <b aria-hidden="true">✕</b>
            </button>
          : <p className="gang-mdao__foco"><span aria-hidden="true">🎯</span>{t('games.gangues.multidao.foco_dica')}</p>}
        <button type="button" className="gang-mdao__tatica" onClick={onAbrirTatica}>
          {t('games.gangues.multidao.tatica')}
          {taticasAtivas > 0 && <b>{taticasAtivas}</b>}
        </button>
      </div>
      <div className="gang-mdao__linha">
        <button type="button" className="gang-mdao__avancar" disabled={revelandoRodada || !prontoPraAvancar} onClick={avancarRodada}>
          <b aria-hidden="true">⚔️</b>{revelandoRodada ? t('games.gangues.multidao.rodando') : t('games.gangues.multidao.avancar_rodada')}
        </button>
        <button type="button" className={`gang-mdao__auto${autoOn ? ' is-on' : ''}`} aria-pressed={autoOn} title={t('games.gangues.multidao.auto_switch_titulo')} onClick={onToggleAuto}>
          <span className="gang-mdao__track"><span className="gang-mdao__dot" /></span>
          {t('games.gangues.auto.switch_label')}
        </button>
      </div>
    </div>
  )
}
