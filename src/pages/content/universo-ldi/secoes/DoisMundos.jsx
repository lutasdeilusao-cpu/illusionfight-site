import { useState } from 'react'
import './DoisMundos.css'

/** Um cartão só que vira do MDR pro MDI quando o leitor "coloca o SBI". */
export default function DoisMundos({ mundos, ui }) {
  const [dentro, setDentro] = useState(false)
  const [real, ilusao] = mundos

  return (
    <div className={`dmundos${dentro ? ' is-dentro' : ''}`}>
      <div className="dmundos__palco">
        {[real, ilusao].map(m => (
          <article key={m.id} className={`dmundos__mundo dmundos__mundo--${m.id}`} aria-hidden={(m.id === 'mdi') !== dentro}>
            <span className="dmundos__sigla">{m.sigla}</span>
            <h3 className="dmundos__nome">{m.nome}</h3>
            <p className="dmundos__texto">{m.texto}</p>
            <ul className="dmundos__itens">
              {m.itens.map(it => <li key={it}>{it}</li>)}
            </ul>
          </article>
        ))}
        <span className="dmundos__flash" aria-hidden="true" />
      </div>

      <button type="button" className="dmundos__trocar" onClick={() => setDentro(d => !d)} aria-pressed={dentro}>
        <span className="dmundos__led" aria-hidden="true" />
        {dentro ? ui.mundos_trocar_mdr : ui.mundos_trocar_mdi}
      </button>
    </div>
  )
}
