import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { getCidade } from '../data/cidades'

function loadSlot(slot) {
  try {
    const raw = localStorage.getItem(`jack_beer_slot_${slot}`)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

export default function MainMenu({ onStart }) {
  const store = useJackStore()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slots, setSlots] = useState([null, null, null])
  const [confirmNew, setConfirmNew] = useState(null)

  useEffect(() => {
    setSlots([loadSlot(1), loadSlot(2), loadSlot(3)])
  }, [])

  const handleStart = (slotNum) => {
    const save = slots[slotNum - 1]
    setSelectedSlot(slotNum)
    if (save) {
      const data = { ...save, _slot: slotNum, fase: save.fase || 'intro' }
      if (data.fase?.startsWith('dungeon_') || data.fase === 'dungeon_select' || data.fase?.startsWith('interior_')) {
        data.fase = 'vila'
      }
      useJackStore.setState(data)
      onStart(slotNum)
    } else {
      setConfirmNew(slotNum)
    }
  }

  const handleNewGame = () => {
    if (confirmNew === null) return
    const slotNum = confirmNew
    useJackStore.setState({
      ...useJackStore.getState(),
      cervejas: 0, cervejasPorSegundo: 1, cervejasTotais: 0,
      fragmentos: 0, notas: 0,
      hpAtual: 20, hpMax: 20, nivel: 1, xp: 0,
      fase: 'intro', flags: {}, dungeonsCompletas: [],
      inventario: [], equipado: { arma: null, armadura: null, acessorio: null },
      tempoJogo: 0, titleDone: false, monologoAtual: null,
      cidadeAtual: 'marelia', periodo: 'DIA',
      medidorPrimordial: 0, aliadoAtual: null,
      _slot: slotNum,
    })
    onStart(slotNum)
  }

  const handleDelete = (slotNum, e) => {
    e.stopPropagation()
    if (!window.confirm(`Apagar save do slot ${slotNum}?`)) return
    localStorage.removeItem(`jack_beer_slot_${slotNum}`)
    setSlots(s => { const n = [...s]; n[slotNum - 1] = null; return n })
  }

  return (
    <div className="jdc-intro" style={{ paddingTop: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="jdc-main-title">JACK DREAM BEER</h1>
        <p className="jack-text jack-text--dim" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          o sonho não tem regras. mas tem cerveja.
        </p>
      </motion.div>

      {confirmNew !== null ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="jack-text jack-text--amber" style={{ textAlign: 'center' }}>
            iniciar novo jogo no slot {confirmNew}?
          </p>
          <p className="jack-text jack-text--dim" style={{ textAlign: 'center', fontSize: '0.75rem' }}>
            todo progresso neste slot será perdido.
          </p>
          <div className="jack-buttons" style={{ margin: '1.5rem auto', maxWidth: '250px' }}>
            <button className="jack-btn jack-btn--amber" onClick={handleNewGame}>
              [ sim, novo jogo ]
            </button>
            <button className="jack-btn" onClick={() => setConfirmNew(null)}>
              [ cancelar ]
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="jdc-slots">
          {[1, 2, 3].map(num => {
            const save = slots[num - 1]
            const isSelected = selectedSlot === num
            const cidade = save?.cidadeAtual ? getCidade(save.cidadeAtual) : null
            return (
              <motion.button
                key={num}
                className={`jdc-slot-card ${isSelected ? 'jdc-slot-card--selected' : ''} ${save ? 'jdc-slot-card--filled' : ''}`}
                onClick={() => handleStart(num)}
                whileHover={{ scale: 1.02, borderColor: '#F5A623' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="jdc-slot-num">slot {num}</div>
                {save ? (
                  <div className="jdc-slot-info">
                    <div className="jdc-slot-stat">🍺 {save.cervejas || 0}</div>
                    <div className="jdc-slot-stat">LV {save.nivel || 1}</div>
                    <div className="jdc-slot-stat">{cidade?.nome || 'Marelia'}</div>
                    <div className="jdc-slot-stat" style={{ fontSize: '0.6rem', color: '#666' }}>
                      {save.dungeonsCompletas?.length || 0} dungeons · cap/s {(save.cervejasPorSegundo || 1)}
                    </div>
                  </div>
                ) : (
                  <div className="jdc-slot-info">
                    <div className="jdc-slot-stat jack-text--dim">vazio</div>
                    <div className="jdc-slot-stat jack-text--dim">novo jogo</div>
                  </div>
                )}
                {save && (
                  <span className="jdc-slot-delete" onClick={(e) => handleDelete(num, e)} title="apagar save">🗑️</span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
