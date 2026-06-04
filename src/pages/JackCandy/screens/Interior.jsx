import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { NPCS } from '../data/npcs'
import { ITENS } from '../data/itens'

export default function Interior({ npcId }) {
  const store = useJackStore()
  const npc = NPCS[npcId]
  const [msg, setMsg] = useState('')

  if (!npc) return null

  const handleComprar = (itemId) => {
    const item = ITENS[itemId]
    if (!item) return
    const moeda = item.moeda === 'nota' ? store.notas : store.capangas
    if (moeda < item.preco) { setMsg('você não tem recursos suficientes.'); return }
    if (item.cura) {
      store.comprarItem(itemId)
      setMsg(`+${item.cura} HP.`)
      return
    }
    store.comprarItem(itemId)
    setMsg(`${item.nome} comprado.`)
  }

  return (
    <motion.div className="jdc-interior" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="jdc-interior-header">
        <span className="jdc-interior-nome">{npc.interior} do {npc.nome}</span>
        <button className="jack-btn" onClick={() => store.setFase('vila')} style={{ fontSize: '0.7rem' }}>[ sair ]</button>
      </div>
      <p className="jack-text jack-text--amber">{npc.saudacao}</p>
      {npc.missoes?.length > 0 && (
        <div className="jack-buttons">
          {npc.missoes.map(m => (
            <button key={m.id} className="jack-btn" disabled={!m.disponivel}>
              {m.disponivel ? `[ ${m.nome} ]` : `[ ${m.nome} — 🔒 ]`}
            </button>
          ))}
        </div>
      )}
      <div className="jdc-interior-itens">
        {npc.itens.filter(itemId => {
          const e = store.equipado
          const inv = store.inventario
          if (store.flags.TEM_BENGALA && itemId === 'bengala_steampunk') return false
          if (e.arma?.id === itemId || e.armadura?.id === itemId || e.acessorio?.id === itemId) return false
          if (inv.find(i => i.id === itemId)) return false
          return true
        }).map(itemId => {
          const item = ITENS[itemId]
          if (!item) return null
          const podeComprar = item.moeda === 'nota' ? store.notas >= item.preco : store.capangas >= item.preco
          return (
            <div key={itemId} className="jdc-interior-item">
              <div>
                <span className="jack-text--amber">{item.nome}</span>
                <p className="jack-text jack-text--dim">{item.desc}</p>
                <p className="jack-text jack-text--crimson">
                  {item.preco} {item.moeda === 'nota' ? 'notas' : 'capangas'}
                  {item.dano ? ` · dano +${item.dano}` : ''}
                  {item.capPerSeg ? ` · cap/s +${item.capPerSeg}` : ''}
                  {item.hpMaxBonus ? ` · HP max +${item.hpMaxBonus}` : ''}
                  {item.cura ? ` · cura +${item.cura} HP` : ''}
                </p>
              </div>
              <button className="jack-btn" onClick={() => handleComprar(itemId)} disabled={!podeComprar}>
                [ comprar ]
              </button>
            </div>
          )
        })}
      </div>
      {msg && <p className="jack-text jack-text--amber">{msg}</p>}
    </motion.div>
  )
}
