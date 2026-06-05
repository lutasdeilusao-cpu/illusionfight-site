import { useTamagoshiStore } from '../store/useTamagoshiStore'
import { getFala } from '../data/personalidades'
import CooldownTimer from '../components/CooldownTimer'
import { motion } from 'framer-motion'

export default function Luto() {
  const store = useTamagoshiStore()
  const epitafio = getFala(store.personalidade, 'morte')

  const cooldownAcabou = store.cooldownAte && Date.now() >= store.cooldownAte

  return (
    <div className="tama-screen">
      <div className="tama-luto">
        <motion.div
          className="tama-luto-emoji"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 0.8, 0.6, 0.8, 1], opacity: [1, 0.5, 0.3, 0.5, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          💔
        </motion.div>
        <h2 className="tama-luto-title">{store.nomeCustom} se foi</h2>
        <p className="tama-luto-epitafio">{epitafio}</p>
        <div className="tama-luto-cooldown">
          {cooldownAcabou ? (
            <p className="tama-luto-pronto">o ciclo recomeça — um novo ovo te espera</p>
          ) : (
            <>
              <p>novo ovo disponível em</p>
              <CooldownTimer ate={store.cooldownAte} />
            </>
          )}
        </div>
        {cooldownAcabou && (
          <motion.button
            className="tama-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => store.reset()}
          >
            [ recomeçar ]
          </motion.button>
        )}
      </div>
    </div>
  )
}
