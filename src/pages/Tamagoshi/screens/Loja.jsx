import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { ITENS_LOJA } from '../data/itens_loja'

export default function Loja({ onVoltar }) {
  const store = useTamagoshiStore()
  const [saldo, setSaldo] = useState(store._dixSaldo || 0)
  const [msg, setMsg] = useState('')
  const inv = store.inventario || {}

  useEffect(() => {
    if (store._userId) store.getSaldoDix(store._userId).then(s => setSaldo(store._isAdmin ? '∞' : s))
  }, [])

  const handleComprar = async (item) => {
    try {
      await store.comprarItem(store._userId, item.id, item.preco)
      setMsg(`${item.emoji} ${item.nome} comprado!`)
      setSaldo(s => s - item.preco)
      setTimeout(() => setMsg(''), 2000)
    } catch (e) {
      setMsg(e.message)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div className="tama-acao-screen">
      <h2 className="tama-acao-title">🏪 loja DIX</h2>
      <div className="tama-loja-saldo">
        <span className="tama-loja-saldo-valor">{saldo}</span>
        <span className="tama-loja-saldo-label">DIX</span>
      </div>

      {msg && (
        <motion.p className="tama-acao-feedback"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>
          {msg}
        </motion.p>
      )}

      <div className="tama-loja-grid">
        {ITENS_LOJA.map((item, i) => {
          const qtd = inv[item.id] || 0
          return (
            <motion.div
              key={item.id}
              className="tama-loja-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="tama-loja-card-emoji">{item.emoji}</div>
              <div className="tama-loja-card-info">
                <span className="tama-loja-card-nome">{item.nome}</span>
                <span className="tama-loja-card-preco">{item.preco} DIX</span>
                {qtd > 0 && <span className="tama-loja-card-qtd">inv: {qtd}x</span>}
              </div>
              <button
                className="tama-btn tama-btn--sm"
                disabled={!store._isAdmin && saldo < item.preco}
                onClick={() => handleComprar(item)}
              >
                comprar
              </button>
            </motion.div>
          )
        })}
      </div>

      <motion.button
        className="tama-btn"
        style={{ marginTop: '1rem' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onVoltar}
      >
        [ voltar ]
      </motion.button>
    </div>
  )
}
