import { useState } from 'react'
import './Xakaxi.css'

function Carta({ p }) {
  const [virada, setVirada] = useState(false)
  return (
    <button type="button" className={`xk-carta${virada ? ' is-virada' : ''}`} onClick={() => setVirada(v => !v)} aria-pressed={virada}>
      <span className="xk-carta__miolo">
        <span className="xk-carta__frente">
          <span className="xk-carta__sinal" aria-hidden="true" />
          <span className="xk-carta__nome">{p.nome}</span>
          <span className="xk-carta__papel">{p.papel}</span>
        </span>
        <span className="xk-carta__verso">
          <span className="xk-carta__nome xk-carta__nome--sm">{p.nome}</span>
          <span className="xk-carta__texto">{p.texto}</span>
        </span>
      </span>
    </button>
  )
}

export default function Xakaxi({ xakaxi, ui }) {
  return (
    <div className="xk">
      <h3 className="uldi-sub">{ui.xakaxi_povo}</h3>
      <p className="xk__dica">{ui.virar}</p>
      <div className="xk__povo">
        {xakaxi.povo.map(p => <Carta key={p.nome} p={p} />)}
      </div>

      <h3 className="uldi-sub">{ui.xakaxi_tec}</h3>
      <div className="xk__tec">
        {xakaxi.tecnologias.map(t => (
          <div key={t.nome} className="xk__tec-item">
            <span className="xk__tec-nome">{t.nome}</span>
            <p>{t.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
