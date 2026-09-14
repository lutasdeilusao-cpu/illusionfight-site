import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import GangTip from './GangTip'

// v3 (13/09/2026): a v2 apontava pra `games.gangues.multidao_tutorial.*`,
// chave que NUNCA existiu no i18n — todo jogador que chegava aqui via o
// texto cru da chave na tela (bug real, achado revisando os tutoriais).
// Escrito de verdade agora, e reduzido de 5 pra 3 passos junto (mesmo pedido
// do Isaias do GanguesCombatTutorial: menos texto de uma vez, só o
// essencial). Id novo de propósito pra reexibir pra quem só viu a versão
// quebrada.
// Escopado por CONTA (TutorialProgressContext), não mais por save/aparelho —
// pedido do Isaias (14/09/2026): "toda vez que abro num aparelho novo o
// tutorial aparece de novo, grava isso no Supabase".
const TUTORIAL_ID = 'multidao_v3'
const PASSOS = ['interruptor', 'alvo_automatico', 'avancar']

/** Tutorial da Briga em Multidão — aparece só na PRIMEIRA vez que o jogador
 *  vê o interruptor (bando com 6+ combatentes), autocontido igual o
 *  GanguesCombatTutorial. */
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
