import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import GangTip from './GangTip'

const TUTORIAL_KEY = 'ldi-gangues-multidao-tutorial-visto'
// Fail-safe tem que cair pro lado de MOSTRAR se o storage falhar (mesmo
// raciocínio do GanguesCombatTutorial — errar mostrando de novo é bem menos
// grave que nunca explicar o modo pra quem tá vendo ele pela primeira vez).
function jaViu() { try { return localStorage.getItem(TUTORIAL_KEY) === '1' } catch { return false } }
function marcarVisto() { try { localStorage.setItem(TUTORIAL_KEY, '1') } catch {} }

const PASSOS = ['interruptor', 'alvo_automatico', 'poderes', 'avancar']

/** Tutorial da Briga em Multidão — aparece só na PRIMEIRA vez que o jogador
 *  vê o interruptor (bando com 6+ combatentes), autocontido igual o
 *  GanguesCombatTutorial. */
export default function GanguesMultidaoTutorial() {
  const { t } = useLanguage()
  const [visto] = useState(jaViu)
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)

  if (visto || fechado) return null

  const ultimo = passo === PASSOS.length - 1
  const avancar = () => { if (ultimo) { marcarVisto(); setFechado(true) } else setPasso(p => p + 1) }
  const pular = () => { marcarVisto(); setFechado(true) }

  return (
    <GangTip
      text={t(`games.gangues.multidao_tutorial.${PASSOS[passo]}`)}
      side={passo % 2 === 0 ? 'right' : 'left'}
      isLast={ultimo}
      onNext={avancar}
      onSkip={pular}
    />
  )
}
