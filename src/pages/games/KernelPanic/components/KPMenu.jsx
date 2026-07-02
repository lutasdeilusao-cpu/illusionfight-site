import { useState } from 'react'

export default function KPMenu({ onStart }) {
  const [sub, setSub] = useState(null)

  if (sub === 'solo') {
    return (
      <div className="menu-overlay show">
        <div className="diff-box">
          <div className="diff-title">DIFICULDADE</div>
          <div className="diff-sub">Selecione o nível</div>
          <button className="menu-btn" onClick={() => onStart('solo-easy')}>
            <span className="menu-btn-arrow">▶</span>
            <span className="menu-btn-label">FÁCIL<span className="menu-btn-sub">IA prioritiza aleatoriedade</span></span>
          </button>
          <button className="menu-btn" onClick={() => onStart('solo-medium')}>
            <span className="menu-btn-arrow">▶</span>
            <span className="menu-btn-label">MÉDIO<span className="menu-btn-sub">IA toma decisões táticas</span></span>
          </button>
          <button className="diff-back" onClick={() => setSub(null)}>← Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="menu-overlay show">
      <div className="menu-box">
        <div className="menu-logo">KERNEL PANIC</div>
        <div className="menu-tagline">Ataque Cibernético</div>
        <button className="menu-btn" onClick={() => onStart('local')}>
          <span className="menu-btn-arrow">▶</span>
          <span className="menu-btn-label">VERSUS<span className="menu-btn-sub">2 jogadores no mesmo dispositivo</span></span>
        </button>
        <button className="menu-btn" onClick={() => setSub('solo')}>
          <span className="menu-btn-arrow">▶</span>
          <span className="menu-btn-label">SOLO<span className="menu-btn-sub">Enfrente a IA</span></span>
        </button>
      </div>
    </div>
  )
}
