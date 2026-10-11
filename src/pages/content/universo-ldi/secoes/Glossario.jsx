import { useMemo, useState } from 'react'
import './Glossario.css'

const SISTEMAS = new Set(['LDI', 'SBI', 'MDI', 'MDR', 'SDR', 'PowWow', 'DIX', 'NeoGuide', 'SDA', 'SDD', 'SAL', 'STE', 'SDP', 'SVN'])

const semAcento = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Glossário com busca e filtro. */
export default function Glossario({ itens, ui }) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const lista = useMemo(() => {
    const q = semAcento(busca.trim())
    return itens.filter(g => {
      const tipo = SISTEMAS.has(g.sigla) ? 'sistema' : 'lore'
      if (filtro !== 'todos' && filtro !== tipo) return false
      if (!q) return true
      return semAcento(`${g.sigla} ${g.nome} ${g.descricao}`).includes(q)
    })
  }, [itens, busca, filtro])

  return (
    <div className="glo">
      <label className="glo__busca">
        <span className="glo__lupa" aria-hidden="true" />
        <input type="search" value={busca} onChange={e => setBusca(e.target.value)} placeholder={ui.busca} aria-label={ui.busca} />
      </label>

      <div className="glo__filtros">
        {[['todos', ui.filtro_todos], ['sistema', ui.filtro_sistema], ['lore', ui.filtro_lore]].map(([id, nome]) => (
          <button key={id} type="button" className={`glo__filtro${filtro === id ? ' is-ativo' : ''}`}
            onClick={() => setFiltro(id)} aria-pressed={filtro === id}>
            {nome}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="glo__vazio">{ui.vazio}</p>
      ) : (
        <dl className="glo__lista">
          {lista.map(g => (
            <div key={g.sigla} className="glo__item">
              <dt>
                <span className="glo__sigla">{g.sigla}</span>
                {g.nome !== g.sigla && <span className="glo__nome">{g.nome}</span>}
              </dt>
              <dd>{g.descricao}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
