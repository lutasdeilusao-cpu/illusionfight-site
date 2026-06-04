import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { ITENS } from '../data/itens'

export default function Inventario() {
  const store = useJackStore()

  const handleItemAction = (itemId) => {
    const item = ITENS[itemId]
    if (!item) return
    if (item.cura) {
      store.usarItem(itemId)
    } else if (item.slot) {
      store.equiparPorId(itemId)
    }
  }

  return (
    <motion.div className="jdc-inventario-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-inventario-header">
        <span className="jack-text--amber">INVENTÁRIO</span>
        <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ fontSize: '0.7rem' }}>[ voltar ]</button>
      </div>

      <div className="jdc-inventario-section">
        <p className="jack-text jack-text--dim">equipado</p>
        {['arma', 'armadura', 'acessorio'].map(slot => {
          const item = store.equipado[slot]
          return (
            <div key={slot} className="jdc-inv-item">
              <span className="jack-text--amber">{slot}:</span>
              <span className="jack-text">{item?.nome || 'vazio'}</span>
              {item && <span className="jack-text jack-text--dim">{item.dano ? `dano +${item.dano}` : ''}</span>}
            </div>
          )
        })}
      </div>

      <div className="jdc-inventario-section">
        <p className="jack-text jack-text--dim">mochila</p>
        {store.inventario.length === 0 && <p className="jack-text jack-text--dim">vazia.</p>}
        {store.inventario.map((item, i) => {
          const fullItem = ITENS[item.id]
          const isConsumivel = fullItem?.cura
          return (
            <div key={i} className="jdc-inv-item">
              <span className="jack-text">{item.nome}</span>
              {fullItem?.cura && <span className="jack-text jack-text--dim">cura +{fullItem.cura} HP</span>}
              <button className="jack-btn" onClick={() => handleItemAction(item.id)} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                {isConsumivel ? '[ usar ]' : fullItem?.slot ? '[ equipar ]' : '[ aplicar ]'}
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
