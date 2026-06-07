import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { ITENS_LOJA } from '../data/itens_loja'

export default function Loja({ onVoltar }) {
  const { t } = useLanguage()
  const store = useTamagoshiStore()
  const [saldo, setSaldo] = useState(store._isAdmin ? '∞' : (store._dixSaldo || 0))
  const [msg, setMsg] = useState('')
  const inv = store.inventario || {}

  useEffect(() => {
    if (store._userId) store.getSaldoDix(store._userId).then(s => setSaldo(store._isAdmin ? '∞' : s))
  }, [])

  const handleComprar = async (item) => {
    try {
      await store.comprarItem(store._userId, item.id, item.preco)
      setMsg(`${item.emoji} ${item.nome} comprado!`)
      setTimeout(() => setMsg(''), 2000)
    } catch (e) {
      setMsg(e.message)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const itensComprados = ITENS_LOJA.filter(item => (inv[item.id] || 0) > 0)

  return (
    <div className="tama-acao-screen">
      <h2 className="tama-acao-title">{t('games.tamagoshi.loja_titulo')}</h2>
      <div className="tama-loja-saldo">
        <span className="tama-loja-saldo-valor">{saldo}</span>
        <span className="tama-loja-saldo-label">{t('games.tamagoshi.dix_label')}</span>
      </div>

      {msg && (
        <motion.p className="tama-acao-feedback"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>
          {msg}
        </motion.p>
      )}

      {itensComprados.length > 0 && (
        <div className="tama-loja-inventario">
          <h3 className="tama-loja-inventario-title">{t('games.tamagoshi.inventario_titulo')}</h3>
          <div className="tama-loja-inventario-grid">
            {itensComprados.map(item => (
              <div key={item.id} className="tama-loja-inventario-item">
                <span className="tama-loja-inventario-emoji">{item.emoji}</span>
                <span className="tama-loja-inventario-nome">{item.nome}</span>
                <span className="tama-loja-inventario-qtd">{inv[item.id]}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tama-loja-grid">
        {ITENS_LOJA.map((item, i) => {
          const qtd = inv[item.id] || 0
          const podeComprar = store._isAdmin || saldo >= item.preco
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
                disabled={!podeComprar}
                onClick={() => handleComprar(item)}
              >
                {store._isAdmin ? t('games.tamagoshi.pegar') : t('games.tamagoshi.comprar')}
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
