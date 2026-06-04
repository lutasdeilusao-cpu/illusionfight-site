import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useJackStore } from '../store/useJackStore'

export default function StatusBar() {
  const { user } = useAuth()
  const store = useJackStore()
  const [saving, setSaving] = useState(false)
  const [periodoCd, setPeriodoCd] = useState(0)

  const hpPct = store.hpMax > 0 ? Math.max(0, Math.round((store.hpAtual / store.hpMax) * 100)) : 0
  const hpColor = hpPct > 60 ? '#22C55E' : hpPct > 30 ? '#F5A623' : '#8B0000'
  const reducao = (store.equipado?.armadura?.reducaoDano || 0)
  const danoArma = store.equipado?.arma?.dano || 0

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    await store.saveToCloud(user.id)
    setTimeout(() => setSaving(false), 1000)
  }

  const alternarPeriodo = () => {
    if (periodoCd > 0) return
    // HP baixo: descansar em vez de alternar periodo
    if (store.hpAtual <= 0 || store.hpAtual < store.hpMax * 0.5) {
      if (store.fase !== 'vila') store.setFase('vila')
      store.setFase('descanso')
      return
    }
    store.alternarPeriodo()
    setPeriodoCd(30)
  }

  useEffect(() => {
    if (periodoCd <= 0) return
    const t = setInterval(() => setPeriodoCd(p => p - 1), 1000)
    return () => clearInterval(t)
  }, [periodoCd])

  const temFragmentos = store.flags.JA_VIU_FRAGMENTOS || store.fragmentos > 0
  const mostraPrimordial = store.flags.KRONOS_VIU

  return (
    <div className="jdc-statusbar">
      <div className="jdc-statusbar-row">
        <span className="jdc-sb-resources">
          🍺 {store.cervejas} {temFragmentos ? `| 💎 ${store.fragmentos}` : ''} | notas: {store.notas}
        </span>
        <span className="jdc-sb-nav">
          <button className={`jdc-sb-btn ${store.fase === 'vila' ? 'jdc-sb-btn--active' : ''}`}
            onClick={() => store.flags.TEM_BENGALA && store.setFase('vila')}
            disabled={!store.flags.TEM_BENGALA}>MND</button>
          <button className={`jdc-sb-btn ${store.fase === 'inventario' ? 'jdc-sb-btn--active' : ''}`}
            onClick={() => store.flags.TEM_BENGALA && store.setFase('inventario')}
            disabled={!store.flags.TEM_BENGALA}>INV</button>
          <button className={`jdc-sb-btn ${store.fase === 'dungeon_select' || store.fase.startsWith('dungeon_') ? 'jdc-sb-btn--active' : ''}`}
            onClick={() => store.flags.TEM_BENGALA && store.setFase('dungeon_select')}
            disabled={!store.flags.TEM_BENGALA}>DUN</button>
          <button className="jdc-sb-btn"
            onClick={alternarPeriodo}
            disabled={periodoCd > 0}
            style={{ borderColor: '#F5A62333', color: periodoCd > 0 ? '#444' : '#F5A62366' }}>
            {periodoCd > 0 ? `${periodoCd}s` : store.hpAtual < store.hpMax * 0.5 ? '😴' : store.periodo === 'DIA' ? '🌙' : '☀️'}
          </button>
          {mostraPrimordial && (
            <span className="jdc-sb-primordial" title={`Medidor Primordial: ${store.medidorPrimordial}/10`}>
              {'🔥'.repeat(Math.min(store.medidorPrimordial, 10))}
            </span>
          )}
          <button className="jdc-sb-btn" onClick={() => {
            if (window.confirm('Resetar todo o progresso do Jack Dream Beer?')) {
              store.reset()
              window.location.reload()
            }
          }} style={{ borderColor: '#8B000033', color: '#8B000066', fontSize: '0.6rem' }}>RST</button>
          <button className="jdc-sb-btn jdc-sb-btn--save" onClick={handleSave} disabled={saving}>
            {saving ? '...' : 'SAVE'}
          </button>
        </span>
      </div>
      <div className="jdc-statusbar-row">
        <span className="jdc-sb-hp-label">HP</span>
        <div className="jdc-sb-hpbar-wrap">
          <div className="jdc-sb-hpbar-fill" style={{ width: `${hpPct}%`, backgroundColor: hpColor }} />
        </div>
        <span className="jdc-sb-hp-text">{store.hpAtual}/{store.hpMax}</span>
        <span className="jdc-sb-level">
          LV {store.nivel} | 🍺/s {store.cervejasPorSegundo}
          {reducao > 0 ? ` | 🛡️ -${reducao}` : ''}
          {danoArma > 0 ? ` | ⚔️ +${danoArma}` : ''}
        </span>
      </div>
    </div>
  )
}
