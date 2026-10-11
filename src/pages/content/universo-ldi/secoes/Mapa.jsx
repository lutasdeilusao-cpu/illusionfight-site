import { useState } from 'react'
import './Mapa.css'

const FORA_DE_BRAVARA = new Set(['Azuma', 'Davoss'])

/** Duas abas (Bravara / o mundo) e uma lista de lugares que abrem ao toque. */
export default function Mapa({ locais, mapa, ui }) {
  const [aba, setAba] = useState('bravara')
  const [aberto, setAberto] = useState(null)

  const daCasa = locais.filter(l => !FORA_DE_BRAVARA.has(l.nome))
  const nomes = new Set(daCasa.map(l => l.nome))
  const bravara = [...daCasa, ...mapa.bravara.filter(l => !nomes.has(l.nome))].map(l => ({ ...l, texto: l.texto || l.descricao }))
  const lista = aba === 'bravara' ? bravara : mapa.mundo

  const trocar = id => { setAba(id); setAberto(null) }

  return (
    <div className="mapa">
      <div className="mapa__abas" role="tablist">
        {[['bravara', ui.mapa_bravara], ['mundo', ui.mapa_mundo]].map(([id, nome]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id}
            className={`mapa__aba${aba === id ? ' is-ativa' : ''}`} onClick={() => trocar(id)}>
            {nome}
          </button>
        ))}
      </div>

      <div className={`mapa__radar mapa__radar--${aba}`} aria-hidden="true">
        <span className="mapa__varredura" />
        {lista.map((l, i) => (
          <i key={l.nome} className={`mapa__ponto${aberto === l.nome ? ' is-aceso' : ''}`} data-i={i % 12} />
        ))}
      </div>

      <p className="mapa__dica">{ui.mapa_toque}</p>

      <ul className="mapa__lista" key={aba}>
        {lista.map((l, i) => {
          const ativo = aberto === l.nome
          return (
            <li key={l.nome} className={`mapa__lugar${ativo ? ' is-aberto' : ''}`} data-i={i % 12}>
              <button type="button" className="mapa__lugar-btn" aria-expanded={ativo}
                onClick={() => setAberto(ativo ? null : l.nome)}>
                <span className="mapa__tag">{l.tag}</span>
                <span className="mapa__nome">{l.nome}</span>
                <span className="mapa__seta" aria-hidden="true" />
              </button>
              <div className="mapa__texto"><p>{l.texto}</p></div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
