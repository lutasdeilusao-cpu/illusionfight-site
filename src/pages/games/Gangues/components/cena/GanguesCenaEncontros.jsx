import enemiesData from '../../data/gangues-enemies.json'

// Os dois modais de "encarar ou não": o encontro aleatório de rua e a treta
// programada (POI/chefe). Extraído de GanguesCena.jsx
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
export function EventoVS({ fala, onSim, onNao, cenaId, t }) {
  const b = `games.gangues.cena.${cenaId}.evento`
  return <div className="gang-cena-enc gang-cena-enc--vs gang-cena-enc--evento">
    <span className="gang-cena-enc-selo">!</span>
    <span className="gang-cena-eyebrow">{t('games.gangues.cena.evento_tag')}</span>
    <h3 className="gang-cena-enc-titulo">{t(`${b}.nome`)}</h3>
    <p className="gang-cena-papo-fala">{fala}</p>
    <div className="gang-cena-enc-acoes">
      <button className="gang-cena-btn" onClick={onNao}>{t('games.gangues.cena.evento_nao')}</button>
      <button className="gang-cena-btn gang-cena-btn--go" onClick={onSim}>{t('games.gangues.cena.evento_sim')}</button>
    </div>
  </div>
}

export function TretaVS({ poi, fala, nivelTropa, avisoOff, onOcultarAviso, onSim, onNao, t }) {
  const enemy = enemiesData.find(e => e.id === poi.enemy), nome = poi.ehChefe ? t(`games.gangues.story.bosses.${poi.boss}.nome`) : t(`${poi.i18n}.nome`)
  const falaRaw = fala ?? (poi.ehChefe ? t(`games.gangues.story.bosses.${poi.boss}.fala`, { suaGangue: t('games.gangues.report.your_gang') }) : t(`${poi.i18n}.fala`))
  const falaShow = Array.isArray(falaRaw) ? falaRaw[0] : falaRaw
  // Aviso de nível: só quando a tropa tá 2+ níveis ABAIXO do recomendado — 1 de
  // diferença não conta (dado, equipamento e estratégia cobrem). Igual/acima
  // ou só 1 abaixo: nada. `avisoOff` = o jogador pediu pra não ver mais nesse
  // território (reseta ao trocar de bairro).
  const abaixo = !avisoOff && poi.nivelRec && Number.isFinite(nivelTropa) && (poi.nivelRec - nivelTropa) >= 2
  return <div className="gang-cena-enc gang-cena-enc--vs">
    <span className="gang-cena-enc-selo">{(nome || '?')[0]}</span>
    <span className="gang-cena-eyebrow">{poi.ehChefe ? t('games.gangues.story.boss_tag') : t('games.gangues.cena.tipo.treta')}</span>
    <h3 className="gang-cena-enc-titulo">{nome}{poi.ehChefe && enemy?.nivel ? <em className="gang-cena-vs-nivel"> · {t('games.gangues.cena.nivel', { n: enemy.nivel })}</em> : null}</h3>
    <p className="gang-cena-papo-fala">{falaShow}</p>
    {enemy && <span className="gang-cena-vs-stats">{['A', 'H', 'D', 'PV', 'PM'].map(a => <span key={a}><i>{a}</i>{enemy.stats?.[a] ?? '—'}</span>)}</span>}
    {abaixo && <div className="gang-cena-vs-aviso">⚠ {t('games.gangues.cena.nivel_rec_baixo', { rec: poi.nivelRec, atual: nivelTropa })}<button type="button" className="gang-cena-vs-aviso-off" onClick={onOcultarAviso}>{t('games.gangues.cena.nivel_rec_ocultar')}</button></div>}
    <div className="gang-cena-enc-acoes">
      <button className="gang-cena-btn" onClick={onNao}>{t('games.gangues.cena.treta_nao')}</button>
      <button className={`gang-cena-btn gang-cena-btn--go${abaixo ? ' gang-cena-btn--risco' : ''}`} onClick={onSim}>{t(abaixo ? 'games.gangues.cena.treta_sim_risco' : 'games.gangues.cena.treta_sim')}</button>
    </div>
  </div>
}
