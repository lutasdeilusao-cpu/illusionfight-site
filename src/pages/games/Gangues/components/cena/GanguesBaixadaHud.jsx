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

/** Barra de Alerta (Vila, `cena.alerta`): o quanto o bonde tá avisado —
 *  cada ponto soma +1 de ficha nos corpos das tretas daqui. */
export function BarraAlerta({ cena, n, t }) {
  const max = cena.alerta.max
  return (
    <div className={`gang-respeito gang-alerta${n >= max ? ' is-cheia' : ''}`}>
      <small>{t('games.gangues.cena.vila.alerta.titulo')}</small>
      <span className="gang-respeito__barra">{Array.from({ length: max }, (_, i) => <i key={i} className={i < n ? 'is-on' : ''} />)}</span>
      <em>{t(n > 0 ? 'games.gangues.cena.vila.alerta.sobe' : 'games.gangues.cena.vila.alerta.calmo', { n })}</em>
    </div>
  )
}

/** Portão da escadaria (Morro, `cena.barreiras`): fecha a rua de lado a lado
 *  até a gangue negociar o aval no bairro de baixo. */
export function BarreiraFaixa({ b, t }) {
  return (
    <div className="gang-barreira" style={{ top: b.y1, height: b.y2 - b.y1 }}>
      <b>🔒 {t(`games.gangues.cena.morro.barreira.${b.id}`)}</b>
    </div>
  )
}
