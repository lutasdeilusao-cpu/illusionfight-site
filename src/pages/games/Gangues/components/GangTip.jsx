import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'

/* Balão de dica de rua — mesma mecânica do antigo NeoGuideTip, mas sem
   mascote: é um recado seco, voz de quebrada. `nextLabel` sobrescreve o
   rótulo do botão. */
export default function GangTip({ text, side = 'right', isLast, nextLabel, onNext, onSkip }) {
  const { t } = useLanguage()
  const fromRight = side === 'right'
  const advance = () => { sfx.click(); onNext?.() }
  const skip = (event) => { event.stopPropagation(); sfx.click(); onSkip?.() }

  return (
    <motion.div
      className={`gang-tip gang-tip--${side}`}
      initial={{ opacity: 0, x: fromRight ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: fromRight ? 30 : -30 }}
      transition={{ duration: 0.35, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      <button className="gang-tip-skip" onClick={skip}>{t('games.gangues.dialogo.pular')} ✕</button>
      <p className="gang-tip-text">{text}</p>
      <button className="gang-tip-next" onClick={advance}>
        {nextLabel || (isLast ? t('games.gangues.dialogo.fechar') : t('games.gangues.dialogo.proximo'))}
      </button>
    </motion.div>
  )
}
