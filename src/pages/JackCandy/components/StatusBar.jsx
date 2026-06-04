import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useJackStore } from '../store/useJackStore'

export default function StatusBar() {
  const { user } = useAuth()
  const store = useJackStore()
  const [saving, setSaving] = useState(false)

  const hpPct = store.hpMax > 0 ? Math.max(0, Math.round((store.hpAtual / store.hpMax) * 20)) : 0
  const hpBar = '█'.repeat(hpPct) + '░'.repeat(20 - hpPct)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await store.saveToCloud(user.id)
    setTimeout(() => setSaving(false), 1000)
  }

  const irPara = (fase) => {
    if (!store.flags.TEM_BENGALA) return
    if (fase === 'dungeon_onibus' && !store.dungeonsCompletas.includes('onibus')) store.setFase('dungeon_onibus')
    else if (fase === 'dungeon_rua' && store.dungeonsCompletas.includes('onibus')) store.setFase('dungeon_rua')
    else store.setFase(fase)
  }

  return (
    <div className="jdc-statusbar">
      <div className="jdc-statusbar-row">
        <span className="jdc-sb-resources">
          capangas: {store.capangas}  |  notas: {store.notas}
        </span>
        <span className="jdc-sb-nav">
          <button className={`jdc-sb-btn ${store.fase === 'vila' ? 'jdc-sb-btn--active' : ''}`}
            onClick={() => irPara('vila')} disabled={!store.flags.TEM_BENGALA}>VILA</button>
          <button className={`jdc-sb-btn ${store.fase === 'inventario' ? 'jdc-sb-btn--active' : ''}`}
            onClick={() => irPara('inventario')} disabled={!store.flags.TEM_BENGALA}>INV</button>
          <button className={`jdc-sb-btn ${store.fase.startsWith('dungeon') ? 'jdc-sb-btn--active' : ''}`}
            onClick={() => irPara(store.dungeonsCompletas.includes('onibus') ? 'dungeon_rua' : 'dungeon_onibus')}
            disabled={!store.flags.TEM_BENGALA}>
            {store.dungeonsCompletas.includes('rua') ? '✓DUN' : 'DUN'}
          </button>
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
        <span className="jdc-sb-level">LV {store.nivel} | cap/s {store.capangasPorSegundo}</span>
      </div>
    </div>
  )
}
