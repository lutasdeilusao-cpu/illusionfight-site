import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'

const TYPE_SPEED = 20

/* Diálogo de rua — alguém de Marelia falando com você. Sem mascote, sem
   NeoGuide: é um humano, voz de quebrada. `speaker` é o nome/vulgo de
   quem fala; `sub` é a legenda (ex: "dono da Baixada"). O Isaias troca
   por retrato dos bosses depois — o slot fica em .gang-dlg-face. */
export default function GangDialog({ lines = [], speaker, sub, onFinish, onSkip }) {
  const { t } = useLanguage()
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [typing, setTyping] = useState(true)
  const line = lines[lineIndex] || ''
  const isLast = lineIndex + 1 >= lines.length
  const nome = speaker || t('games.gangues.dialogo.voz')

  useEffect(() => { setCharIndex(0); setTyping(true) }, [lineIndex])

  useEffect(() => {
    if (!typing || charIndex >= line.length) { if (charIndex >= line.length) setTyping(false); return }
    const timer = setTimeout(() => setCharIndex(i => i + 1), TYPE_SPEED)
    return () => clearTimeout(timer)
  }, [charIndex, typing, line])

  const advance = useCallback(() => {
    sfx.click()
    if (typing) { setCharIndex(line.length); setTyping(false); return }
    if (isLast) { onFinish?.(); return }
    setLineIndex(i => i + 1)
  }, [typing, line, isLast, onFinish])

  const skip = useCallback((event) => {
    event.stopPropagation()
    sfx.click()
    onSkip?.()
  }, [onSkip])

  if (!lines.length) return null

  return (
    <motion.div className="neoguide-overlay gang-dlg-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={advance}>
      <button className="neoguide-skip" onClick={skip}>{t('games.gangues.dialogo.pular')} ✕</button>

      <motion.div
        className="neoguide-box gang-dlg-box" onClick={event => event.stopPropagation()}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
      >
        <span className="gang-dlg-face" aria-hidden="true">{nome[0]}</span>
        <span className="neoguide-name gang-dlg-name">
          {nome}{sub ? <em className="gang-dlg-sub"> · {sub}</em> : null}
        </span>
        <p className="neoguide-text" onClick={advance}>
          {line.slice(0, charIndex)}
          {typing && <motion.span className="neoguide-cursor" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}>▌</motion.span>}
        </p>
        <div className="neoguide-footer">
          <span className="neoguide-dots">{lines.map((_, index) => <i key={index} className={index === lineIndex ? 'neoguide-dot neoguide-dot--active' : 'neoguide-dot'} />)}</span>
          <button className="neoguide-next" onClick={advance}>
            {typing ? '▸▸' : isLast ? t('games.gangues.dialogo.fechar') : t('games.gangues.dialogo.proximo')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
