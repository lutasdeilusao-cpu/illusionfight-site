import { useState } from 'react'
import './Arena.css'
import './Elementais.css'

const ECONOMIA = ['SDA', 'SDD', 'SAL', 'STE', 'SDP', 'SVN']
const COR = ['fogo', 'terra', 'ar', 'agua', 'luz', 'trevas']

function Modos({ modos }) {
  const [i, setI] = useState(0)
  const m = modos[i]
  return (
    <div className="arena-modos">
      <div className="arena-modos__abas">
        {modos.map((x, n) => (
          <button key={x.nome} type="button" className={`arena-modos__aba${n === i ? ' is-ativa' : ''}`}
            onClick={() => setI(n)} aria-pressed={n === i}>
            <span className="arena-modos__icone" aria-hidden="true">{x.icone}</span>
            <span>{x.nome}</span>
          </button>
        ))}
      </div>
      <p className="arena-modos__desc" key={i}>{m.descricao}</p>
    </div>
  )
}

function Elementais({ el, ui }) {
  const [sel, setSel] = useState(null)
  const [anomalia, setAnomalia] = useState(false)
  const escolhido = sel != null ? el.primarios[sel] : null

  const escolher = n => { setAnomalia(false); setSel(n === sel ? null : n) }

  return (
    <div className="elem">
      <div className={`elem__roda${sel != null ? ' tem-sel' : ''}${anomalia ? ' is-anomalia' : ''}`}>
        <span className="elem__aro" aria-hidden="true" />
        {el.primarios.map((nome, n) => (
          <button key={nome} type="button" data-pos={n}
            className={`elem__no elem__no--${COR[n]}${sel === n ? ' is-sel' : ''}`}
            onClick={() => escolher(n)} aria-pressed={sel === n}>
            {nome}
          </button>
        ))}
        <button type="button" className="elem__centro" onClick={() => { setSel(null); setAnomalia(a => !a) }} aria-pressed={anomalia}>
          {ui.anomalia_btn}
        </button>
      </div>

      <div className="elem__painel if-panel" aria-live="polite">
        {anomalia ? (
          <div className="elem__info elem__info--anomalia" key="anomalia">
            <span className="if-eyebrow">{ui.anomalia_titulo}</span>
            <p>{el.anomalia}</p>
          </div>
        ) : escolhido ? (
          <div className={`elem__info elem__info--${COR[sel]}`} key={escolhido}>
            <h4 className="elem__nome">{escolhido}</h4>
            <p>{el.descricoes[escolhido]}</p>
            <span className="elem__rotulo">{ui.secundarios}</span>
            <div className="elem__secs">
              {el.secundarios[escolhido].map(s => <span key={s} className="elem__sec">{s}</span>)}
            </div>
          </div>
        ) : (
          <div className="elem__info" key="vazio">
            <p className="elem__intro">{el.intro}</p>
            <span className="elem__dica">{ui.elementais_toque}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function Ranking({ faixas, ui }) {
  const [n, setN] = useState(0)
  const f = faixas[n]
  return (
    <div className="rank">
      <div className="rank__escada" aria-hidden="true">
        {faixas.map((x, i) => <span key={x.faixa} className={`rank__degrau${i <= n ? ' is-cheio' : ''}`} />)}
      </div>
      <div className={`rank__cartao if-panel${n === faixas.length - 1 ? ' is-topo' : ''}`} key={n}>
        <span className="rank__faixa">{f.faixa}</span>
        <h4 className="rank__label">{f.label}</h4>
        <p className="rank__desc">{f.descricao}</p>
      </div>
      <label className="rank__controle">
        <span>{ui.ranking_arraste}</span>
        <input type="range" min="0" max={faixas.length - 1} step="1" value={n}
          onChange={e => setN(Number(e.target.value))} />
      </label>
    </div>
  )
}

export default function Arena({ dados, ui }) {
  const economia = dados.glossario.filter(g => ECONOMIA.includes(g.sigla))
  return (
    <div className="arena">
      <h3 className="uldi-sub">{ui.sistema_titulo}</h3>
      <div className="arena-sistema">
        {dados.sistema.map((s, i) => (
          <div key={s.nome} className="arena-sistema__item" data-i={i}>
            <span className="arena-sistema__nome">{s.nome}</span>
            <p>{s.texto}</p>
          </div>
        ))}
      </div>

      <h3 className="uldi-sub">{ui.modos_titulo}</h3>
      <Modos modos={dados.modos_combate} />

      <h3 className="uldi-sub">{ui.elementais_titulo}</h3>
      <Elementais el={dados.elementais} ui={ui} />

      <h3 className="uldi-sub">{ui.ranking_titulo}</h3>
      <Ranking faixas={dados.ranking_sdr} ui={ui} />

      <h3 className="uldi-sub">{ui.economia_titulo}</h3>
      <div className="arena-economia">
        {economia.map(g => (
          <div key={g.sigla} className="arena-economia__item">
            <span className="arena-economia__sigla">{g.sigla}</span>
            <span className="arena-economia__nome">{g.nome}</span>
            <p>{g.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
