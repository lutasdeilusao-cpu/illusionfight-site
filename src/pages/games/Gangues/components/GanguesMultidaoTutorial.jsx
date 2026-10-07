import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import GangTip from './GangTip'

// Escopado por CONTA (TutorialProgressContext): aparece uma vez por conta.
const TUTORIAL_ID = 'multidao_v4'
const PASSOS = ['interruptor', 'foco', 'tatica', 'avancar']

/** Tutorial da Briga em Multidão — aparece só na PRIMEIRA vez que o jogador
 *  vê a Briga em Multidão, autocontido igual o GanguesCombatTutorial. */
export default function GanguesMultidaoTutorial() {
  const { t } = useLanguage()
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)

  if (!carregado || jaViu(TUTORIAL_ID) || fechado) return null

  const ultimo = passo === PASSOS.length - 1
  const avancar = () => { if (ultimo) { marcarVisto(TUTORIAL_ID); setFechado(true) } else setPasso(p => p + 1) }
  const pular = () => { marcarVisto(TUTORIAL_ID); setFechado(true) }

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
