import { motion } from 'framer-motion'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { PASSEIOS, PASSEIO_KEY_MAP } from '../data/passeios'
import { PERSONALIDADES, PERS_NOME_KEY } from '../data/personalidades'

export default function Passeio() {
  const { t } = useLanguage()
  const store = useTamagoshiStore()
  const pers = PERSONALIDADES[store.personalidade] || PERSONALIDADES.CARENTE

  return (
    <div className="tama-screen">
      <div className="tama-passeio">
        <h2 className="tama-passeio-title">{t('games.tamagoshi.passeio_title')}</h2>
        <p className="tama-passeio-sub">{t('games.tamagoshi.passeio_sub')}</p>
        <div className="tama-passeio-grid">
          {PASSEIOS.map((p, i) => {
            const bonus = p.bonus[store.personalidade] || 2
            const pKey = PASSEIO_KEY_MAP[p.id]
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
                  <span className="tama-passeio-card-nome">{t('games.tamagoshi.passeio_' + pKey)}</span>
                  <span className="tama-passeio-card-desc">{t('games.tamagoshi.passeio_' + pKey + '_desc')}</span>
                  <span className="tama-passeio-card-bonus" style={{ color: pers.cor }}>
                    +{bonus} energia extra ({t('games.tamagoshi.personalidade_' + PERS_NOME_KEY[store.personalidade])})
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
          [ {t('games.tamagoshi.voltar')} ]
        </motion.button>
      </div>
    </div>
  )
}
