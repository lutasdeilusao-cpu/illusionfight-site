import { useState } from 'react'
import { useJackStore } from '../store/useJackStore'

export default function StatusBar() {
  const store = useJackStore()
  const [saving, setSaving] = useState(false)

  const hpPct = store.hpMax > 0 ? Math.max(0, Math.round((store.hpAtual / store.hpMax) * 20)) : 0
  const hpBar = '█'.repeat(hpPct) + '░'.repeat(20 - hpPct)

  const handleSave = async () => {
    setSaving(true)
    await store.saveToCloud()
    setTimeout(() => setSaving(false), 1000)
  }

  return (
    <div className="jdc-statusbar">
      <div className="jdc-statusbar-row">
        <span className="jdc-sb-resources">
          capangas: {store.capangas}  |  notas: {store.notas}
        </span>
        <span className="jdc-sb-nav">
          <button
            className={`jdc-sb-btn ${store.fase === 'vila' ? 'jdc-sb-btn--active' : ''}`}
            onClick={() => store.setFase('vila')}
            disabled={!store.flags.TEM_BENGALA}
          >
            VILA
          </button>
          <button className="jdc-sb-btn jdc-sb-btn--disabled" disabled>INV</button>
          <button className="jdc-sb-btn jdc-sb-btn--disabled" disabled>MAP</button>
          <button className="jdc-sb-btn jdc-sb-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? '...' : 'SAVE'}
          </button>
        </span>
      </div>
      <div className="jdc-statusbar-row">
        <span className="jdc-sb-hp-label">HP</span>
        <span className="jdc-sb-hp-bar">{hpBar}</span>
        <span className="jdc-sb-hp-text">{store.hpAtual}/{store.hpMax}</span>
        <span className="jdc-sb-level">LV {store.nivel}</span>
      </div>
    </div>
  )
}
