import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import GangTip from '../GangTip'

// Explica a cor dos alvos na rua em 2 momentos bem separados (pedido do
// Isaias, 13/09/2026 — quer tutorial PROGRESSIVO, cada coisa explicada só
// quando ela realmente importa, não tudo de uma vez no início):
//  - "verde" na 1ª vez que o jogador vê a rua com algum alvo disponível;
//  - "azul" só quando o PRIMEIRO alvo repetível vira farmável (ver
//    `farmCompleto` em ganguesCenaMotor.js/estadoPoi) — ou seja, depois que
//    ele já venceu pelo menos 1 treta repetível e voltou pra rua.
// Escopado por save, mesmo padrão dos outros tutoriais autocontidos do
// Gangues (ver GanguesCombatTutorial.jsx).
const KEY_VERDE = 'ldi-gangues-alvo-verde-visto'
const KEY_AZUL = 'ldi-gangues-alvo-azul-visto'
function jaViu(key, saveId) { try { return localStorage.getItem(`${key}:${saveId || 'guest'}`) === '1' } catch { return false } }
function marcarVisto(key, saveId) { try { localStorage.setItem(`${key}:${saveId || 'guest'}`, '1') } catch {} }

/** `alvos`: os alvos atuais da cena (amb.alvos). Quem monta decide QUANDO
 *  faz sentido (rua, sem intro/fade/encontro cobrindo a tela) — este
 *  componente só decide QUAL dos 2 avisos (se algum) mostrar. */
export default function GanguesAlvoTutorial({ alvos }) {
  const { t } = useLanguage()
  const saveId = useGanguesStore(s => s._saveId)
  // Começa "já visto" (os dois) e corrige assim que `saveId` estabiliza — ver
  // nota igual em GanguesMultidaoTutorial.jsx (race de F5: `_saveId` podia
  // ainda não ter hidratado no 1º render, e o `useState` preguiçoso não
  // reavalia sozinho depois — mostrava de novo pra quem já tinha visto).
  const [vistoVerde, setVistoVerde] = useState(true)
  const [vistoAzul, setVistoAzul] = useState(true)
  useEffect(() => {
    setVistoVerde(jaViu(KEY_VERDE, saveId))
    setVistoAzul(jaViu(KEY_AZUL, saveId))
  }, [saveId])

  if (!alvos?.length) return null

  if (!vistoVerde) {
    const fechar = () => { marcarVisto(KEY_VERDE, saveId); setVistoVerde(true) }
    return <GangTip text={t('games.gangues.alvo_tutorial.verde')} side="right" isLast onNext={fechar} onSkip={fechar} />
  }

  if (!vistoAzul && alvos.some(a => a.farmCompleto)) {
    const fechar = () => { marcarVisto(KEY_AZUL, saveId); setVistoAzul(true) }
    return <GangTip text={t('games.gangues.alvo_tutorial.azul')} side="left" isLast onNext={fechar} onSkip={fechar} />
  }

  return null
}
