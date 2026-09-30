// Peças visuais do painel: número grande, lista ranqueada, série por dia, funil.

export function Kpi({ rotulo, valor, sub, destaque }) {
  return (
    <div className={`painel-kpi${destaque ? ' is-destaque' : ''}`}>
      <span className="painel-kpi__rotulo">{rotulo}</span>
      <strong className="painel-kpi__valor">{valor}</strong>
      {sub && <small className="painel-kpi__sub">{sub}</small>}
    </div>
  )
}

export function Cartao({ titulo, children, acao }) {
  return (
    <section className="painel-cartao">
      <header className="painel-cartao__topo">
        <h3>{titulo}</h3>
        {acao}
      </header>
      {children}
    </section>
  )
}

/** Lista com barra proporcional. `itens`: [{ chave, valor, extra }]. */
export function Lista({ itens, vazio, formatar = v => v, onEscolher }) {
  if (!itens?.length) return <p className="painel-vazio">{vazio}</p>
  const max = Math.max(1, ...itens.map(i => Number(i.valor) || 0))
  return (
    <ol className="painel-lista">
      {itens.map((i, n) => (
        <li key={`${i.chave}-${n}`}>
          <button type="button" className="painel-lista__linha" onClick={onEscolher ? () => onEscolher(i) : undefined} disabled={!onEscolher}>
            <span className="painel-lista__barra" style={{ '--p': `${(100 * (Number(i.valor) || 0)) / max}%` }} />
            <span className="painel-lista__chave" title={i.titulo || i.chave}>{i.chave}</span>
            {i.extra && <span className="painel-lista__extra">{i.extra}</span>}
            <b className="painel-lista__valor">{formatar(i.valor)}</b>
          </button>
        </li>
      ))}
    </ol>
  )
}

/** Barras por dia (ou hora). `pontos`: [{ rotulo, valor }]. */
export function Serie({ pontos, vazio, formatar = v => v }) {
  if (!pontos?.length) return <p className="painel-vazio">{vazio}</p>
  const max = Math.max(1, ...pontos.map(p => Number(p.valor) || 0))
  return (
    <div className="painel-serie" role="img">
      {pontos.map((p, i) => (
        <div key={i} className="painel-serie__col" title={`${p.rotulo}: ${formatar(p.valor)}`}>
          <b>{formatar(p.valor)}</b>
          <span className="painel-serie__barra" style={{ '--h': `${Math.max(2, (100 * (Number(p.valor) || 0)) / max)}%` }} />
          <small>{p.rotulo}</small>
        </div>
      ))}
    </div>
  )
}

/** Funil: cada etapa com a % da primeira. */
export function Funil({ etapas }) {
  const topo = Math.max(1, Number(etapas[0]?.valor) || 0)
  return (
    <ol className="painel-funil">
      {etapas.map(e => {
        const pct = Math.round((100 * (Number(e.valor) || 0)) / topo)
        return (
          <li key={e.rotulo} style={{ '--p': `${pct}%` }}>
            <span>{e.rotulo}</span>
            <b>{e.valor}</b>
            <small>{pct}%</small>
          </li>
        )
      })}
    </ol>
  )
}
