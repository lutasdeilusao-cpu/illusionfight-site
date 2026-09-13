import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import GangTip from '../GangTip'

// 2 tutoriais autocontidos da birosca (pedido do Isaias, 13/09/2026 —
// tutorial progressivo, cada um só na 1ª vez que a tela em questão abre):
//  - GanguesDescansoTutorial: a tela normal do descanso (cura PV/PM + fiado).
//  - GanguesClubeTutorial: a tela de oferta do Clube da Luta.
// Mesmo padrão de save-scoping/fail-open dos outros tutoriais do Gangues
// (ver GanguesCombatTutorial.jsx).
function jaViu(key, saveId) { try { return localStorage.getItem(`${key}:${saveId || 'guest'}`) === '1' } catch { return false } }
function marcarVisto(key, saveId) { try { localStorage.setItem(`${key}:${saveId || 'guest'}`, '1') } catch {} }

function useTutorialPassos(key, passos) {
  const saveId = useGanguesStore(s => s._saveId)
  // Começa "já visto" e corrige assim que `saveId` estabiliza — ver nota
  // igual em GanguesMultidaoTutorial.jsx (race de F5: `_saveId` podia ainda
  // não ter hidratado no 1º render, e o `useState` preguiçoso não reavalia
  // sozinho depois — mostrava de novo pra quem já tinha visto).
  const [visto, setVisto] = useState(true)
  useEffect(() => { setVisto(jaViu(key, saveId)) }, [key, saveId])
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)
  if (visto || fechado) return null
  const ultimo = passo === passos.length - 1
  return {
    chave: passos[passo],
    ultimo,
    avancar: () => { if (ultimo) { marcarVisto(key, saveId); setFechado(true) } else setPasso(p => p + 1) },
    pular: () => { marcarVisto(key, saveId); setFechado(true) },
  }
}

const DESCANSO_KEY = 'ldi-gangues-descanso-tutorial-visto'
const DESCANSO_PASSOS = ['recuperar', 'fiado']
export function GanguesDescansoTutorial() {
  const { t } = useLanguage()
  const estado = useTutorialPassos(DESCANSO_KEY, DESCANSO_PASSOS)
  if (!estado) return null
  return (
    <GangTip
      text={t(`games.gangues.descanso_tutorial.${estado.chave}`)}
      side="right" isLast={estado.ultimo}
      onNext={estado.avancar} onSkip={estado.pular}
    />
  )
}

const CLUBE_KEY = 'ldi-gangues-clube-tutorial-visto'
const CLUBE_PASSOS = ['como_funciona', 'cura_dobra']
export function GanguesClubeTutorial() {
  const { t } = useLanguage()
  const estado = useTutorialPassos(CLUBE_KEY, CLUBE_PASSOS)
  if (!estado) return null
  return (
    <GangTip
      text={t(`games.gangues.clube_tutorial.${estado.chave}`)}
      side="left" isLast={estado.ultimo}
      onNext={estado.avancar} onSkip={estado.pular}
    />
  )
}
