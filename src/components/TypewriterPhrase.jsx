import { useLanguage } from '../context/LanguageContext'
import { useTypewriter } from '../hooks/useTypewriter'
import './TypewriterPhrase.css'

export default function TypewriterPhrase() {
  const { t } = useLanguage()
  const phrase = t('hero.subtitle')
  const { displayText, showCursor } = useTypewriter(phrase)

  if (!displayText && !showCursor) return null

  return (
    <div className="typewriter">
      <span className="typewriter__text">{displayText}</span>
      <span className={`typewriter__cursor${showCursor ? '' : ' typewriter__cursor--hidden'}`}>|</span>
    </div>
  )
}
