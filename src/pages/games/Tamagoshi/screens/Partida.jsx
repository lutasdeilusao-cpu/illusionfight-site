import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { CRIATURAS } from '../data/criaturas'

const TIPO_PARA_KEY = {
  FOFO: 'fofo',
  AGRESSIVO: 'agressivo',
  INDEPENDENTE: 'independente',
  CARENTE: 'carente',
  FILOSOFO: 'filosofo',
  COMICO: 'comico',
}

export default function Partida({ onSalaoFama, onNovaAdocao }) {
  const { t } = useLanguage()
  const store = useTamagoshiStore()
  const [animando, setAnimando] = useState(true)
  const [concluiu, setConcluiu] = useState(false)

  const tipoKey = TIPO_PARA_KEY[store.personalidade] || 'carente'
  const texto = t('games.tamagoshi.partida_texto_' + tipoKey)
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
              {criatura?.emoji || 'âœ¨'}
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
            <h2 className="tama-acao-title">{t('games.tamagoshi.partida_concluida')}</h2>
            <p className="tama-partida-texto">{t('games.tamagoshi.partida_salao_fama', { nome: criatura?.nome || 'Sua criatura' })}</p>
            <div className="tama-partida-acoes">
              <motion.button
                className="tama-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSalaoFama}
              >
                {t('games.tamagoshi.partida_ver_salao')}
              </motion.button>
              <motion.button
                className="tama-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNovaAdocao}
              >
                {t('games.tamagoshi.partida_adotar_nova')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
