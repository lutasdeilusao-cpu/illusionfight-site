import { motion } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { PASSEIOS } from '../data/passeios'
import { PERSONALIDADES } from '../data/personalidades'

export default function Passeio() {
  const store = useTamagoshiStore()
  const pers = PERSONALIDADES[store.personalidade] || PERSONALIDADES.CARENTE

  return (
    <div className="tama-screen">
      <div className="tama-passeio">
        <h2 className="tama-passeio-title">🌙 passeio por Marelia</h2>
        <p className="tama-passeio-sub">pra onde vamos?</p>
        <div className="tama-passeio-grid">
          {PASSEIOS.map((p, i) => {
            const bonus = p.bonus[store.personalidade] || 2
            return (
              <motion.button
                key={p.id}
                className="tama-passeio-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  store.passear(p.id)
                }}
              >
                <div className="tama-passeio-card-emoji">{p.emoji}</div>
                <div className="tama-passeio-card-info">
                  <span className="tama-passeio-card-nome">{p.nome}</span>
                  <span className="tama-passeio-card-desc">{p.desc}</span>
                  <span className="tama-passeio-card-bonus" style={{ color: pers.cor }}>
                    +{bonus} energia extra ({pers.nome})
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
        <motion.button
          className="tama-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => store.setFase('criatura')}
          style={{ marginTop: '1rem' }}
        >
          [ voltar ]
        </motion.button>
      </div>
    </div>
  )
}
