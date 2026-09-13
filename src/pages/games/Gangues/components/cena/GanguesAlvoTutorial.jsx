import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import GangTip from '../GangTip'

// Explica o farol de status dos alvos na rua em 2 momentos bem separados
// (pedido do Isaias, 13/09/2026 — quer tutorial PROGRESSIVO, cada coisa
// explicada só quando ela realmente importa, não tudo de uma vez no início):
//  - "farol" na 1ª vez que o jogador vê a rua com algum alvo disponível —
//    explica vermelho (obrigatório) e amarelo (opcional);
//  - "feito" só quando o PRIMEIRO alvo vira verde de verdade (resolvido OU
//    farmável — ver `farolDe()` em GanguesCenaAtores.jsx) — explica que
//    treta repetível continua batível à vontade mesmo já "feita".
// v2 (13/09/2026): trocado de verde=alvo/azul=farmável pro farol
// vermelho/amarelo/verde (pedido do Isaias — "farol" é mais representativo
// e universal, não precisa de tutorial pra decorar o que cada cor quer
// dizer) — chave nova de propósito pra reexibir pra quem só viu a versão
// antiga, já que o SIGNIFICADO das cores mudou, não só o texto.
// Escopado por save, mesmo padrão dos outros tutoriais autocontidos do
// Gangues (ver GanguesCombatTutorial.jsx).
const KEY_FAROL = 'ldi-gangues-alvo-farol-v2-visto'
const KEY_FEITO = 'ldi-gangues-alvo-feito-v2-visto'
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
  const [vistoFarol, setVistoFarol] = useState(true)
  const [vistoFeito, setVistoFeito] = useState(true)
  useEffect(() => {
    setVistoFarol(jaViu(KEY_FAROL, saveId))
    setVistoFeito(jaViu(KEY_FEITO, saveId))
  }, [saveId])

  if (!alvos?.length) return null

  if (!vistoFarol) {
    const fechar = () => { marcarVisto(KEY_FAROL, saveId); setVistoFarol(true) }
    return <GangTip text={t('games.gangues.alvo_tutorial.farol')} side="right" isLast onNext={fechar} onSkip={fechar} />
  }

  if (!vistoFeito && alvos.some(a => a.estado === 'resolvido' || a.farmCompleto)) {
    const fechar = () => { marcarVisto(KEY_FEITO, saveId); setVistoFeito(true) }
    return <GangTip text={t('games.gangues.alvo_tutorial.feito')} side="left" isLast onNext={fechar} onSkip={fechar} />
  }

  return null
}
