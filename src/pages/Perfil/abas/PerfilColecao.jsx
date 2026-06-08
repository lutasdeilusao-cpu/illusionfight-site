import { useState, useEffect } from 'react'
import { carregarDeck } from '../../../hooks/useTopTrumpsDB'
import deck from '../../../data/supertrunfo-pt.json'

export default function PerfilColecao({ userId }) {
  const [deckIds, setDeckIds] = useState([])
  const [filtro, setFiltro] = useState('todas')

  useEffect(() => {
    if (!userId) return
    carregarDeck(userId).then(ids => {
      if (ids && ids.length > 0) {
        // Garante que sejam números para comparar com id_num
        setDeckIds(ids.map(Number))
      } else {
        const chave = `ldi-toptrumps-deck-${userId}`
        const salvos = JSON.parse(localStorage.getItem(chave) || '[]')
        setDeckIds(salvos.map(id => {
          // Aceita tanto string (antigo) quanto número (novo)
          const n = Number(id)
          return isNaN(n) ? id : n
        }))
      }
    })
  }, [userId])

  const tierNomes = { free: 'FREE', elite: 'ELITE', primordial: 'PRIMORDIAL', lendario: 'LENDÁRIO', sombra: 'SOMBRA' }
  const tierCor = { free: '#00c8a8', elite: '#e8853a', primordial: '#6B0F1A', lendario: '#9b59b6', sombra: '#2c3e50' }

  const cartasFiltradas = deck.cartas.filter((_, i) => {
    if (filtro === 'obtidas') return deckIds.includes(deck.cartas[i].id_num)
    if (filtro === 'faltando') return !deckIds.includes(deck.cartas[i].id_num)
    return true
  })

  return (
    <div className="perfil-colecao">
      <div className="perfil-colecao-filtros">
        {['todas', 'obtidas', 'faltando'].map(f => (
          <button key={f} className={`perfil-colecao-filtro-btn${filtro === f ? ' perfil-colecao-filtro-btn--ativo' : ''}`} onClick={() => setFiltro(f)}>
            {f === 'todas' ? 'Todas' : f === 'obtidas' ? 'Obtidas' : 'Faltando'}
          </button>
        ))}
      </div>
      <div className="perfil-deck-grid">
        {cartasFiltradas.map((carta, i) => {
          const tem = deckIds.includes(carta.id_num)
          return (
            <div key={carta.id} className={`perfil-deck-card ${tem ? 'perfil-deck-card--tem' : 'perfil-deck-card--falta'}`}>
              {tem ? (
                <>
                  <div className="perfil-deck-avatar" style={{ background: `hsl(${i * 47}, 65%, 45%)` }}>{carta.nome[0]}</div>
                  <div className="perfil-deck-nome">{carta.nome}</div>
                  <div className="perfil-deck-atributos">
                    {['rank_sdr','poder_mental','velocidade','resistencia','nivel_xama','fator_caos'].map(a => (
                      <div key={a} className="perfil-deck-attr"><span className="perfil-deck-attr-nome">{a === 'rank_sdr' ? 'SDR' : a === 'poder_mental' ? 'MEN' : a === 'velocidade' ? 'VEL' : a === 'resistencia' ? 'RES' : a === 'nivel_xama' ? 'XAM' : 'CAOS'}</span><span className="perfil-deck-attr-val">{carta.atributos[a]}</span></div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="perfil-deck-silhueta">
                  <div className="perfil-deck-avatar perfil-deck-avatar--ghost">?</div>
                  <div className="perfil-deck-nome perfil-deck-nome--ghost">???</div>
                  <div className="perfil-deck-atributos">{[1,2,3,4,5,6].map(j => <div key={j} className="perfil-deck-attr"><span>—</span><span>—</span></div>)}</div>
                  {carta.tier !== 'free' && <div className="perfil-deck-tier-tag" style={{ background: tierCor[carta.tier] }}>{tierNomes[carta.tier]}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
