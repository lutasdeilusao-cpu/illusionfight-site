import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { ITENS } from '../data/itens'

const SLOTS = ['arma', 'armadura', 'acessorio']
const SLOT_ICONS = { arma: '⚔️', armadura: '🛡️', acessorio: '💍' }
const SLOT_LABELS = { arma: 'Arma', armadura: 'Armadura', acessorio: 'Acessório' }

export default function Inventario() {
  const store = useJackStore()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [aba, setAba] = useState('mochila')

  const handleEquipSlot = (item) => {
    store.equiparPorId(item.id)
    setSelectedSlot(null)
  }

  const handleDesequipar = (slot) => {
    const equipado = store.equipado[slot]
    if (!equipado) return
    set(state => ({
      equipado: { ...state.equipado, [slot]: null },
      inventario: [...state.inventario, { id: equipado.id, nome: equipado.nome }],
    }))
  }

  const handleItemAction = (itemId) => {
    const item = ITENS[itemId]
    if (!item) return
    if (item.cura) {
      store.usarItem(itemId)
    } else if (item.slot) {
      store.equiparPorId(itemId)
    } else if (item.danoBonus) {
      store.aplicarUpgrade(itemId)
    }
  }

  const itensEquipaveis = store.inventario.filter(i => {
    const item = ITENS[i.id]
    return item?.slot && !item.cura && !item.danoBonus
  })

  const itensConsumiveis = store.inventario.filter(i => {
    const item = ITENS[i.id]
    return item?.cura
  })

  const itensUpgrades = store.inventario.filter(i => {
    const item = ITENS[i.id]
    return item?.danoBonus
  })

  const iconeSlot = (item) => {
    if (item?.cura) return '🧪'
    if (item?.slot === 'arma') return '⚔️'
    if (item?.slot === 'armadura') return '🛡️'
    if (item?.slot === 'acessorio') return '💍'
    if (item?.danoBonus) return '🔧'
    return '📦'
  }

  return (
    <motion.div className="jdc-inventario-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-inventario-header">
        <span className="jack-text--amber" style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>INVENTÁRIO</span>
        <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ fontSize: '0.7rem' }}>[ voltar ]</button>
      </div>

      {/* Equipment Slots */}
      <div className="jdc-inv-equipment">
        <p className="jack-text jack-text--dim" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>equipamento</p>
        <div className="jdc-inv-slots">
          {SLOTS.map(slot => {
            const item = store.equipado[slot]
            const isSelected = selectedSlot === slot
            return (
              <div key={slot} className={`jdc-inv-slot ${isSelected ? 'jdc-inv-slot--selected' : ''} ${item ? 'jdc-inv-slot--filled' : ''}`}
                onClick={() => {
                  if (item) {
                    handleDesequipar(slot)
                  } else {
                    setSelectedSlot(isSelected ? null : slot)
                  }
                }}>
                <div className="jdc-inv-slot-icon">{SLOT_ICONS[slot]}</div>
                <div className="jdc-inv-slot-info">
                  <span className="jdc-inv-slot-label">{SLOT_LABELS[slot]}</span>
                  <span className={`jdc-inv-slot-item ${item ? 'jack-text--amber' : 'jack-text--dim'}`}>
                    {item ? item.nome : 'vazio'}
                  </span>
                </div>
                {item && (
                  <div className="jdc-inv-slot-stats">
                    {item.dano > 0 && <span>⚔️+{item.dano}</span>}
                    {item.reducaoDano > 0 && <span>🛡️-{item.reducaoDano}</span>}
                  </div>
                )}
                <button className="jdc-inv-slot-action" onClick={(e) => { e.stopPropagation(); handleDesequipar(slot); }}>
                  {item ? '🗑️' : '▶'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Quick equip selection */}
        {selectedSlot && (
          <motion.div className="jdc-inv-swap" initial={{ height: 0 }} animate={{ height: 'auto' }}>
            <p className="jack-text jack-text--dim" style={{ fontSize: '0.65rem' }}>escolha um item para equipar em {SLOT_LABELS[selectedSlot]}:</p>
            {itensEquipaveis.filter(i => {
              const item = ITENS[i.id]
              return item?.slot === selectedSlot
            }).map(i => (
              <button key={i.id} className="jack-btn" onClick={() => handleEquipSlot(i)}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'block', width: '100%', textAlign: 'left' }}>
                {iconeSlot(ITENS[i.id])} {i.nome}
              </button>
            ))}
            {itensEquipaveis.filter(i => ITENS[i.id]?.slot === selectedSlot).length === 0 && (
              <p className="jack-text jack-text--dim">sem itens para este slot na mochila.</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="jdc-inv-stats">
        <span>⚔️ dano: {store.equipado?.arma?.dano || 0}</span>
        <span>🛡️ def: {store.equipado?.armadura?.reducaoDano || 0}</span>
        <span>🍺/s: {store.cervejasPorSegundo}</span>
      </div>

      {/* Abas */}
      <div className="jack-tabs" style={{ marginTop: '0.75rem' }}>
        <button className={`jack-tab ${aba === 'mochila' ? 'jack-tab--active' : ''}`} onClick={() => setAba('mochila')}>
          mochila ({store.inventario.length})
        </button>
        <button className={`jack-tab ${aba === 'consumiveis' ? 'jack-tab--active' : ''}`} onClick={() => setAba('consumiveis')}>
          consumíveis ({itensConsumiveis.length})
        </button>
        <button className={`jack-tab ${aba === 'upgrades' ? 'jack-tab--active' : ''}`} onClick={() => setAba('upgrades')}>
          upgrades ({itensUpgrades.length})
        </button>
      </div>

      {/* Item list */}
      <div className="jdc-inv-list">
        {(aba === 'mochila' ? store.inventario : aba === 'consumiveis' ? itensConsumiveis : itensUpgrades).length === 0 && (
          <p className="jack-text jack-text--dim">vazia.</p>
        )}
        {(aba === 'mochila' ? store.inventario : aba === 'consumiveis' ? itensConsumiveis : itensUpgrades).map((item, i) => {
          const full = ITENS[item.id]
          if (!full) return null
          const isConsumivel = !!full.cura
          const isUpgrade = !!full.danoBonus
          const isEquipavel = !!full.slot && !isConsumivel && !isUpgrade
          return (
            <motion.div key={item.id + i} className="jdc-inv-list-item"
              whileHover={{ background: 'rgba(245,166,35,0.03)' }}>
              <div className="jdc-inv-list-icon">{iconeSlot(full)}</div>
              <div className="jdc-inv-list-info">
                <span className="jack-text">{item.nome}</span>
                <span className="jack-text--dim" style={{ fontSize: '0.65rem' }}>{full.desc}</span>
                {full.cura && <span className="jack-text--crimson" style={{ fontSize: '0.65rem' }}>🧪 +{full.cura} HP</span>}
                {full.danoBonus && <span className="jack-text--amber" style={{ fontSize: '0.65rem' }}>⚔️ +{full.danoBonus} dano</span>}
              </div>
              <button className="jack-btn" onClick={() => handleItemAction(item.id)}
                style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                {isConsumivel ? '[ usar ]' : isUpgrade ? '[ aplicar ]' : isEquipavel ? '[ equipar ]' : '...'}
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
