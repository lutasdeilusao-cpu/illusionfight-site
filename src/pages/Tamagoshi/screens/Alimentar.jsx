import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { sfx } from '../sfx'
import { CRIATURAS } from '../data/criaturas'
import CriaturaSprite from '../components/CriaturaSprite'
import { ITENS_LOJA, COMIDA_TEMATICA } from '../data/itens_loja'
import { CRIATURA_ID_TO_SLUG } from '../data/criaturas'
import { DIX_POR_ACAO } from '../data/moedas'

export default function Alimentar({ onConcluir }) {
  const { t } = useLanguage()
  const store = useTamagoshiStore()
  const [progress, setProgress] = useState(0)
  const [animando, setAnimando] = useState(false)
  const [ultimoItem, setUltimoItem] = useState(null)

  const inv = store.inventario || {}
  const comidasDisponiveis = ITENS_LOJA.filter(i => i.categoria === 'comida')
  const tematica = COMIDA_TEMATICA[CRIATURA_ID_TO_SLUG[store.criaturaId]]
  const todasComidas = tematica ? [tematica, ...comidasDisponiveis] : comidasDisponiveis
  const comidasNoInv = todasComidas.filter(c => (inv[c.id] || 0) > 0)
  const temAlguma = comidasNoInv.length > 0
  const emojiExibicao = ultimoItem?.emoji || comidasNoInv[0]?.emoji || '🍖'

  const handleAlimentar = async (itemId) => {
    if (animando) return
    sfx.clique()
    const item = todasComidas.find(c => c.id === itemId)
    setUltimoItem(item)
    setAnimando(true)
    const novo = Math.min(progress + 25, 100)
    setProgress(novo)
    if (novo >= 100) {
      sfx.sucesso()
      try {
        if (itemId) await store.consumirItem(itemId)
        store.alimentar()
        store.ganharDix(store._userId, DIX_POR_ACAO, 'alimentou criatura')
        onConcluir()
      } catch (e) { console.error(e) }
    }
    setAnimando(false)
  }

  return (
    <div className="tama-acao-screen">
      <h2 className="tama-acao-title">{t('games.tamagoshi.alimentar_title')}</h2>

      <div className="tama-acao-progress-container">
        <div className="tama-acao-progress-track">
          <div className="tama-acao-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="tama-acao-progress-label">{Math.round(progress)}%</span>
      </div>

      <div className="tama-acao-sprite-area">
        <AnimatePresence mode="wait">
          {animando && (
            <motion.div className="tama-acao-item-voando"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}>
              {emojiExibicao}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="tama-acao-sprite">
          <CriaturaSprite
            criaturaId={store.criaturaId}
            status={store.status}
            estagio={store.estagio}
            criaturas={CRIATURAS}
          />
        </div>
      </div>

      {temAlguma ? (
        <div className="tama-alimentar-itens">
          {comidasNoInv.map(comida => (
            <motion.button
              key={comida.id}
              className="tama-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAlimentar(comida.id)}
              disabled={animando}
              className="tama-alimentar-item-btn"
            >
              {comida.emoji} {comida.nome} ({inv[comida.id]}x)
            </motion.button>
          ))}
        </div>
      ) : (
        <p className="tama-aviso">{t('games.tamagoshi.alimentar_sem_comida')}</p>
      )}

      <motion.button
        className="tama-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onConcluir}
      >
        [ {t('games.tamagoshi.voltar')} ]
      </motion.button>
    </div>
  )
}
