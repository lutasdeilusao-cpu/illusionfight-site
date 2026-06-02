import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TRIAL_ACTIVE } from '../../config/trial'
import searchIndex from '../../data/search-index'
import './SearchModal.css'

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSearch = useCallback((q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const lower = q.toLowerCase()
    const filtered = searchIndex
      .map(item => {
        const titleScore = item.titulo.toLowerCase().includes(lower) ? 2 : 0
        const descScore = item.descricao.toLowerCase().includes(lower) ? 1 : 0
        return { ...item, score: titleScore + descScore }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
    setResults(filtered)
  }, [])

  const handleSelect = (item) => {
    if (item.premium && !TRIAL_ACTIVE) {
      navigate('/assinar')
    } else {
      navigate(item.url)
    }
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  const groups = {}
  results.forEach(r => {
    if (!groups[r.tipo]) groups[r.tipo] = []
    groups[r.tipo].push(r)
  })

  return (
    <div className="search-overlay" onKeyDown={handleKeyDown}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-field">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Buscar personagens, capítulos, lore..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
          />
          <button className="search-close" onClick={onClose}>ESC</button>
        </div>

        {query.length >= 2 && results.length === 0 && (
          <p className="search-empty">Nenhum resultado para "{query}"</p>
        )}

        {results.length > 0 && (
          <div className="search-results">
            {Object.entries(groups).map(([tipo, items]) => (
              <div key={tipo} className="search-group">
                <span className="search-group-label">{tipo}</span>
                {items.map((item, i) => (
                  <div
                    key={`${item.titulo}-${i}`}
                    className="search-item"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="search-item-header">
                      <span className="search-item-tipo">{item.tipo}</span>
                      {item.premium && <span className="search-item-premium">PREMIUM</span>}
                    </div>
                    <span className="search-item-titulo">{item.titulo}</span>
                    <p className="search-item-desc">{item.descricao.slice(0, 80)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
