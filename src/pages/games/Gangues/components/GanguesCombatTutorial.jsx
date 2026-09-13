import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import GangTip from './GangTip'

// v4: dois passos novos — aviso de KO (aliado caído) e a regra de divisão de
// XP por contribuição (matar pesa mais que só bater, mas todo mundo garante
// pelo menos 1 XP). Chave nova de novo, mesmo motivo das versões anteriores.
// Escopado por save (`saveId`) — pedido do Isaias (13/09/2026): excluiu a
// gangue, começou outra, e o tutorial não voltou a aparecer porque essa
// flag ficava presa pro browser inteiro pra sempre, nunca por conta/gangue.
const TUTORIAL_KEY = 'ldi-gangues-combate-tutorial-v4-visto'
// Falha ao ler localStorage (privacidade estrita, storage bloqueado) tem que
// falhar pro lado de MOSTRAR o tutorial, nunca de escondê-lo — errar
// mostrando de novo pra quem já viu é bem menos grave que nunca ensinar
// quem tá vendo o jogo pela primeira vez (mesmo padrão de cenaIntroJaVista
// em GanguesCena.jsx).
function jaViu(saveId) { try { return localStorage.getItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`) === '1' } catch { return false } }
function marcarVisto(saveId) { try { localStorage.setItem(`${TUTORIAL_KEY}:${saveId || 'guest'}`, '1') } catch {} }

// Reduzido de 8 pra 3 passos (pedido do Isaias, 13/09/2026 — achou o
// tutorial "com muita informação, muito texto de uma vez só", quer
// progressivo: só o essencial pra começar a lutar aqui; ver ficha/trash
// talk/arrastar a bolinha viram descoberta natural (detalhe de UI, não
// travam nada); aviso de KO e regra de XP viram tutoriais PRÓPRIOS,
// contextuais ao momento certo (ver GanguesKoTutorial.jsx, mostrado só
// quando um aliado cai de verdade, e o tip de XP em GanguesVictoryReport.jsx,
// mostrado na 1ª tela de vitória) — não faz sentido explicar "o que acontece
// quando alguém cai" ou "como o XP é dividido" ANTES de qualquer um dos dois
// ter acontecido.
const PASSOS = [
  { chave: 'iniciativa', lado: 'right' },
  { chave: 'escolher_alvo', lado: 'left' },
  { chave: 'bolinha', lado: 'right' },
]

/** Tutorial de combate — só aparece na PRIMEIRA luta da conta (flag no
 *  localStorage, mesmo padrão dos tutoriais do NeoGuide em outras telas).
 *  Autocontido: quem monta este componente não precisa saber se é a
 *  primeira luta ou não, ele mesmo decide e renderiza null depois disso. */
export default function GanguesCombatTutorial() {
  const { t } = useLanguage()
  const saveId = useGanguesStore(s => s._saveId)
  // Começa "já visto" e corrige assim que `saveId` estabiliza — ver nota
  // igual em GanguesMultidaoTutorial.jsx (race de F5: `_saveId` podia ainda
  // não ter hidratado no 1º render, e o `useState` preguiçoso não reavalia
  // sozinho depois).
  const [visto, setVisto] = useState(true)
  useEffect(() => { setVisto(jaViu(saveId)) }, [saveId])
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)

  if (visto || fechado) return null

  const atual = PASSOS[passo]
  const ultimo = passo === PASSOS.length - 1
  const avancar = () => { if (ultimo) { marcarVisto(saveId); setFechado(true) } else setPasso(p => p + 1) }
  const pular = () => { marcarVisto(saveId); setFechado(true) }

  return (
    <GangTip
      text={t(`games.gangues.combat_tutorial.${atual.chave}`)}
      side={atual.lado}
      isLast={ultimo}
      onNext={avancar}
      onSkip={pular}
    />
  )
}
