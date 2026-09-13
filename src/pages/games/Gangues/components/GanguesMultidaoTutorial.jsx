import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import GangTip from './GangTip'

// v2: novo passo sobre o botão de usar item por rodada — chave nova pra quem
// já viu a v1 (sem esse passo) ver a atualização.
// Escopado por save (`saveId`) — pedido do Isaias (13/09/2026): excluiu a
// gangue, começou outra, e o tutorial não voltou a aparecer porque essa
// flag ficava presa pro browser inteiro pra sempre, nunca por conta/gangue.
const TUTORIAL_KEY = 'ldi-gangues-multidao-tutorial-v2-visto'
// Fail-safe tem que cair pro lado de MOSTRAR se o storage falhar (mesmo
// raciocínio do GanguesCombatTutorial — errar mostrando de novo é bem menos
// grave que nunca explicar o modo pra quem tá vendo ele pela primeira vez).
function jaViu(saveId) { try { return localStorage.getItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`) === '1' } catch { return false } }
function marcarVisto(saveId) { try { localStorage.setItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`, '1') } catch {} }

const PASSOS = ['interruptor', 'alvo_automatico', 'poderes', 'item', 'avancar']

/** Tutorial da Briga em Multidão — aparece só na PRIMEIRA vez que o jogador
 *  vê o interruptor (bando com 6+ combatentes), autocontido igual o
 *  GanguesCombatTutorial. */
export default function GanguesMultidaoTutorial() {
  const { t } = useLanguage()
  const saveId = useGanguesStore(s => s._saveId)
  const [visto] = useState(() => jaViu(saveId))
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)

  if (visto || fechado) return null

  const ultimo = passo === PASSOS.length - 1
  const avancar = () => { if (ultimo) { marcarVisto(saveId); setFechado(true) } else setPasso(p => p + 1) }
  const pular = () => { marcarVisto(saveId); setFechado(true) }

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
