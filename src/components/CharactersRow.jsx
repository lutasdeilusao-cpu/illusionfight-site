import { Link, useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './CharactersRow.css'

export default function CharactersRow() {
  const ref = useScrollReveal()
  const navigate = useNavigate()

  return (
    <section ref={ref} className="characters-row reveal">
      <div className="container">
        <h2 className="section-title">O UNIVERSO</h2>

        <div className="characters-row__timeline-teaser" onClick={() => navigate('/mundo#timeline')}>
          {[
            { ano: '1450', label: 'Xakaxi no Auge' },
            { ano: '1500', label: 'Invasão' },
            { ano: '2022', label: 'LDI Nasce' },
            { ano: '2030', label: 'Kim Entra' },
          ].map(p => (
            <div key={p.ano} className="crt-point">
              <span className="crt-ano">{p.ano}</span>
              <span className="crt-label">{p.label}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/mundo" className="btn btn--outline">EXPLORAR O UNIVERSO</Link>
        </div>
      </div>
    </section>
  )
}
