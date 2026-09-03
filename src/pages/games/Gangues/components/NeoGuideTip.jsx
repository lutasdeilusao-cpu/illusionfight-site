import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import neoGuideProfile from '../assets/neoguide-perfil.png'

/** `nextLabel` sobrescreve o rótulo do botão: num aviso de campo faltando,
 *  "COMEÇAR" não faz sentido — o certo é "ENTENDI". */
export default function NeoGuideTip({ text, side = 'right', isLast, nextLabel, onNext, onSkip }) {
  const { t } = useLanguage()
  const fromRight = side === 'right'

  const advance = () => { sfx.click(); onNext?.() }
  const skip = (event) => { event.stopPropagation(); sfx.click(); onSkip?.() }

  return (
    <motion.div
      className={`neoguide-tip neoguide-tip--${side}`}
      initial={{ opacity: 0, x: fromRight ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: fromRight ? 40 : -40 }}
      transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      <img src={neoGuideProfile} alt="NeoGuide" className="neoguide-tip-portrait" style={fromRight ? { transform: 'scaleX(-1)' } : undefined} />
      <div className="neoguide-tip-bubble">
        <button className="neoguide-tip-skip" onClick={skip}>{t('games.gangues.neoguide.pular')} ✕</button>
        <p className="neoguide-tip-text">{text}</p>
        <button className="neoguide-tip-next" onClick={advance}>
          {nextLabel || (isLast ? t('games.gangues.neoguide.comecar') : t('games.gangues.neoguide.proximo'))}
        </button>
      </div>
    </motion.div>
  )
}
