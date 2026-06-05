import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { CRIATURAS } from '../data/criaturas'
import { TEXTOS_PARTIDA } from '../data/moedas'

export default function Partida({ onSalaoFama, onNovaAdocao }) {
  const store = useTamagoshiStore()
  const [animando, setAnimando] = useState(true)
  const [concluiu, setConcluiu] = useState(false)

  const texto = TEXTOS_PARTIDA[store.personalidade] || TEXTOS_PARTIDA.CARENTE
  const criatura = CRIATURAS.find(c => c.id === store.criaturaId)
  const passouDos365 = store.nascidoEm && (Date.now() - store.nascidoEm) > 365 * 86400000

  useEffect(() => {
    if (passouDos365 && !concluiu) {
      store.executarPartida(store._userId)
      setConcluiu(true)
      setTimeout(() => setAnimando(false), 2500)
    }
  }, [])

  return (
    <div className="tama-acao-screen">
      <AnimatePresence mode="wait">
        {animando ? (
          <motion.div
            className="tama-partida-animacao"
            key="animacao"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className="tama-partida-sprite"
              animate={{ x: [0, 60, 120, 200], opacity: [1, 0.8, 0.4, 0] }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            >
              {criatura?.emoji || '✨'}
            </motion.div>
            <motion.div
              className="tama-partida-luz"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 2] }}
              transition={{ duration: 2.5, delay: 0.5 }}
            />
            <p className="tama-partida-texto">{texto}</p>
          </motion.div>
        ) : (
          <motion.div
            className="tama-partida-botoes"
            key="botoes"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="tama-acao-title">✨ partida concluída</h2>
            <p className="tama-partida-texto">{criatura?.nome || 'Sua criatura'} entrou para o salão da fama de Marelia.</p>
            <div className="tama-partida-acoes">
              <motion.button
                className="tama-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSalaoFama}
              >
                [ ver no salão da fama ]
              </motion.button>
              <motion.button
                className="tama-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNovaAdocao}
                style={{ marginTop: '0.5rem' }}
              >
                [ adotar nova criatura ]
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
