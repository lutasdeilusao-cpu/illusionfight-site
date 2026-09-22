import { useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useTutorialProgress } from '../../../../../context/TutorialProgressContext'
import GangTip from '../GangTip'

// 3 tutoriais autocontidos da birosca/agiota (pedido do Isaias, 13/09/2026 —
// tutorial progressivo, cada um só na 1ª vez que a tela em questão abre):
//  - GanguesDescansoTutorial: a tela normal do descanso (só cura PV/PM).
//  - GanguesAgiotaTutorial: a tela do agiota (empréstimo/escada/socorro) —
//    agiotagem migrou pra um pino próprio em 21/09/2026, ver GanguesAgiota.jsx.
//  - GanguesClubeTutorial: a tela de oferta do Clube da Luta.
// Escopado por CONTA (TutorialProgressContext), não mais por save/aparelho —
// pedido do Isaias (14/09/2026).

function useTutorialPassos(tutorialId, passos) {
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)
  if (!carregado || jaViu(tutorialId) || fechado) return null
  const ultimo = passo === passos.length - 1
  return {
    chave: passos[passo],
    ultimo,
    avancar: () => { if (ultimo) { marcarVisto(tutorialId); setFechado(true) } else setPasso(p => p + 1) },
    pular: () => { marcarVisto(tutorialId); setFechado(true) },
  }
}

const DESCANSO_ID = 'descanso'
const DESCANSO_PASSOS = ['recuperar']
export function GanguesDescansoTutorial() {
  const { t } = useLanguage()
  const estado = useTutorialPassos(DESCANSO_ID, DESCANSO_PASSOS)
  if (!estado) return null
  return (
    <GangTip
      text={t(`games.gangues.descanso_tutorial.${estado.chave}`)}
      side="right" isLast={estado.ultimo}
      onNext={estado.avancar} onSkip={estado.pular}
    />
  )
}

const AGIOTA_ID = 'agiota'
const AGIOTA_PASSOS = ['emprestimo']
export function GanguesAgiotaTutorial() {
  const { t } = useLanguage()
  const estado = useTutorialPassos(AGIOTA_ID, AGIOTA_PASSOS)
  if (!estado) return null
  return (
    <GangTip
      text={t(`games.gangues.agiota_tutorial.${estado.chave}`)}
      side="right" isLast={estado.ultimo}
      onNext={estado.avancar} onSkip={estado.pular}
    />
  )
}

const CLUBE_ID = 'clube'
const CLUBE_PASSOS = ['como_funciona', 'cura_dobra']
export function GanguesClubeTutorial() {
  const { t } = useLanguage()
  const estado = useTutorialPassos(CLUBE_ID, CLUBE_PASSOS)
  if (!estado) return null
  return (
    <GangTip
      text={t(`games.gangues.clube_tutorial.${estado.chave}`)}
      side="left" isLast={estado.ultimo}
      onNext={estado.avancar} onSkip={estado.pular}
    />
  )
}
