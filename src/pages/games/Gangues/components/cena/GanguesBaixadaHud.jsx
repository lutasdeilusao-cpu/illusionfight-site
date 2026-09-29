// Peças visuais da Baixada: a linha do trem (dentro do mundo) e a Barra de
// Respeito (no topo da tela). Só aparecem em cena que tem `trem` / `respeito`.

/** Os trilhos na faixa do trem, o apito piscando e o trem cruzando a tela. */
export function TremFaixa({ trem, fase, t }) {
  return (
    <div className={`gang-trem is-${fase}`} style={{ top: trem.y1, height: trem.y2 - trem.y1, '--passa': `${trem.passa}ms` }} aria-hidden="true">
      <i className="gang-trem__trilho" />
      {fase === 'apito' && <b className="gang-trem__apito">{t('games.gangues.cena.baixada.trem_apito')}</b>}
      {fase === 'passando' && <span className="gang-trem__vagoes"><i /><i /><i /><i /><i /></span>}
    </div>
  )
}

/** Quanto do respeito da Baixada a gangue já ganhou (a cadeia do folgado). */
export function BarraRespeito({ cena, prog, t }) {
  const lista = cena.respeito.pois
  const feitos = lista.filter(id => prog.resolvidos[id]).length
  const cheia = feitos >= lista.length
  return (
    <div className={`gang-respeito${cheia ? ' is-cheia' : ''}`}>
      <small>{t('games.gangues.cena.baixada.respeito_titulo')}</small>
      <span className="gang-respeito__barra">{lista.map((id, i) => <i key={id} className={i < feitos ? 'is-on' : ''} />)}</span>
      <em>{t(cheia ? 'games.gangues.cena.baixada.respeito_cheio' : 'games.gangues.cena.baixada.respeito_falta', { n: lista.length - feitos })}</em>
    </div>
  )
}
