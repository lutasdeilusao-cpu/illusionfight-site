import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { sfx } from '../../../../lib/sfx'
import GanguesRetratoImg from './GanguesRetratoImg'

const TYPE_SPEED = 20

/* Diálogo padrão do LDI Gangues — cabeça grande e animada (idle: balanço
   + "respiração"; ganha um tiquinho de "fala" enquanto o texto tá sendo
   digitado) com um balão de fala saindo dela, sobre a parede de tijolo
   oficial (mesmo fundo de GanguesSaveSelect/GanguesNaming). Reconstrução
   pedida pelo Isaias (14/09/2026): "isso vai virar a comunicação padrão
   do LDI Gangues... cabeça com destaque e animação, balão de fala saindo
   da boca do personagem". `speaker`/`sub` = nome/legenda de quem fala;
   `retrato` = URL do PNG da cabeça (ver ganguesNpcPortraits.js) — sem
   retrato, cai na inicial do nome dentro do mesmo círculo animado. */
export default function GangDialog({ lines = [], speaker, sub, retrato, onFinish, onSkip }) {
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
    <motion.div className="gang-dlg-overlay gang-brickwall-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={advance}>
      <button className="gang-dlg-skip" onClick={skip}>{t('games.gangues.dialogo.pular')} ✕</button>

      <div className="gang-dlg-stage" onClick={event => event.stopPropagation()}>
        <motion.div
          className={`gang-dlg-portrait${typing ? ' gang-dlg-portrait--falando' : ''}`}
          initial={{ opacity: 0, scale: .5, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        >
          <span className="gang-dlg-portrait-idle">
            <GanguesRetratoImg src={retrato} fallback={<b aria-hidden="true">{nome[0]}</b>} />
          </span>
        </motion.div>

        <motion.div className="gang-dlg-bubble" initial={{ opacity: 0, scale: .85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: .1 }}>
          <span className="gang-dlg-bubble-tail" aria-hidden="true" />
          <span className="gang-dlg-bubble-name">
            {nome}{sub ? <em> · {sub}</em> : null}
          </span>
          <p className="gang-dlg-bubble-text">
            {line.slice(0, charIndex)}
            {typing && <motion.span className="gang-dlg-cursor" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}>▌</motion.span>}
          </p>
          <div className="gang-dlg-footer">
            <span className="gang-dlg-dots">{lines.map((_, index) => <i key={index} className={index === lineIndex ? 'gang-dlg-dot gang-dlg-dot--active' : 'gang-dlg-dot'} />)}</span>
            <button className="gang-dlg-next" onClick={advance}>
              {typing ? '▸▸' : isLast ? t('games.gangues.dialogo.fechar') : t('games.gangues.dialogo.proximo')}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
