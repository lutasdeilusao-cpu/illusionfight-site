import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import GangTip from './GangTip'

// Explica o aviso de KO só na hora que ele acontece de VERDADE pela 1ª vez
// (pedido do Isaias, 13/09/2026 — tutorial progressivo: não faz sentido
// ensinar "o que acontece quando um aliado cai" antes de alguém ter caído).
// Escopado por save, mesmo padrão dos outros tutoriais autocontidos do
// Gangues (ver GanguesCombatTutorial.jsx).
const TUTORIAL_KEY = 'ldi-gangues-ko-tutorial-visto'
function jaViu(saveId) { try { return localStorage.getItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`) === '1' } catch { return false } }
function marcarVisto(saveId) { try { localStorage.setItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`, '1') } catch {} }

/** `koSide`: o `side` do koCena atual (fx.koCena?.side) — só reage a
 *  'player' (aliado de verdade caindo), nunca a inimigo. Uma vez que aparece
 *  fica na tela até o jogador fechar, mesmo que o cartão de KO (que some
 *  sozinho em ~3s) já tenha sumido — não trava o combate, só a dica. */
export default function GanguesKoTutorial({ koSide }) {
  const { t } = useLanguage()
  const saveId = useGanguesStore(s => s._saveId)
  // Começa NÃO elegível (não "não visto" direto) e só confirma depois que
  // `saveId` estabiliza — ver nota igual em GanguesMultidaoTutorial.jsx (race
  // de F5: `_saveId` podia ainda não ter hidratado no 1º render; aqui a
  // consequência seria pior que nas outras dicas — `elegivel` ficaria preso
  // em `true` mesmo pra quem já viu, já que checar sob a chave errada
  // `guest` sempre dá "não visto").
  const [elegivel, setElegivel] = useState(false)
  useEffect(() => { setElegivel(!jaViu(saveId)) }, [saveId])
  const [mostrando, setMostrando] = useState(false)

  useEffect(() => {
    if (elegivel && !mostrando && koSide === 'player') {
      marcarVisto(saveId)
      setMostrando(true)
    }
  }, [elegivel, mostrando, koSide, saveId])

  if (!mostrando) return null
  const fechar = () => setMostrando(false)
  return <GangTip text={t('games.gangues.ko_tutorial.aliado')} side="left" isLast onNext={fechar} onSkip={fechar} />
}
