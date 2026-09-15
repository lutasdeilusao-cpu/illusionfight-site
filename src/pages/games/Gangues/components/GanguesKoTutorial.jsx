import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import GangTip from './GangTip'

// Explica o aviso de KO só na hora que ele acontece de VERDADE pela 1ª vez
// (pedido do Isaias, 13/09/2026 — tutorial progressivo: não faz sentido
// ensinar "o que acontece quando um aliado cai" antes de alguém ter caído).
// Escopado por CONTA (TutorialProgressContext), não mais por save/aparelho —
// pedido do Isaias (14/09/2026).
const TUTORIAL_ID = 'ko'

/** `koSide`: o `side` do koCena atual (fx.koCena?.side) — só reage a
 *  'player' (aliado de verdade caindo), nunca a inimigo. Uma vez que aparece
 *  fica na tela até o jogador fechar, mesmo que o cartão de KO (que some
 *  sozinho em ~3s) já tenha sumido — não trava o combate, só a dica. */
export default function GanguesKoTutorial({ koSide }) {
  const { t } = useLanguage()
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()
  const [mostrando, setMostrando] = useState(false)

  useEffect(() => {
    if (carregado && !jaViu(TUTORIAL_ID) && !mostrando && koSide === 'player') {
      marcarVisto(TUTORIAL_ID)
      setMostrando(true)
    }
  }, [carregado, jaViu, marcarVisto, mostrando, koSide])

  if (!mostrando) return null
  const fechar = () => setMostrando(false)
  return <GangTip text={t('games.gangues.ko_tutorial.aliado')} side="left" isLast onNext={fechar} onSkip={fechar} />
}
