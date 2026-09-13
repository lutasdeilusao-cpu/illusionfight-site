import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import GangTip from './GangTip'

// v3 (13/09/2026): a v2 apontava pra `games.gangues.multidao_tutorial.*`,
// chave que NUNCA existiu no i18n — todo jogador que chegava aqui via o
// texto cru da chave na tela (bug real, achado revisando os tutoriais).
// Escrito de verdade agora, e reduzido de 5 pra 3 passos junto (mesmo pedido
// do Isaias do GanguesCombatTutorial: menos texto de uma vez, só o
// essencial). Chave nova de propósito pra reexibir pra quem só viu a versão
// quebrada.
// Escopado por save (`saveId`) — pedido do Isaias (13/09/2026): excluiu a
// gangue, começou outra, e o tutorial não voltou a aparecer porque essa
// flag ficava presa pro browser inteiro pra sempre, nunca por conta/gangue.
const TUTORIAL_KEY = 'ldi-gangues-multidao-tutorial-v3-visto'
// Fail-safe tem que cair pro lado de MOSTRAR se o storage falhar (mesmo
// raciocínio do GanguesCombatTutorial — errar mostrando de novo é bem menos
// grave que nunca explicar o modo pra quem tá vendo ele pela primeira vez).
function jaViu(saveId) { try { return localStorage.getItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`) === '1' } catch { return false } }
function marcarVisto(saveId) { try { localStorage.setItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`, '1') } catch {} }

const PASSOS = ['interruptor', 'alvo_automatico', 'avancar']

/** Tutorial da Briga em Multidão — aparece só na PRIMEIRA vez que o jogador
 *  vê o interruptor (bando com 6+ combatentes), autocontido igual o
 *  GanguesCombatTutorial. */
export default function GanguesMultidaoTutorial() {
  const { t } = useLanguage()
  const saveId = useGanguesStore(s => s._saveId)
  // Começa assumindo "já visto" (não `jaViu(saveId)` direto) — no 1º render
  // depois de um F5 dentro do jogo, `_saveId` ainda pode não ter terminado
  // de hidratar; um `useState` preguiçoso travaria nesse valor pra sempre
  // (não reavalia sozinho) e podia reabrir o tutorial de quem já viu, sob a
  // chave errada (`guest` em vez do save de verdade). Corrige assim que
  // `saveId` estabiliza. Achado 13/09/2026 — Isaias viu o tutorial reaparecer
  // 1x isolada num F5, sem repetir depois.
  const [visto, setVisto] = useState(true)
  useEffect(() => { setVisto(jaViu(saveId)) }, [saveId])
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
