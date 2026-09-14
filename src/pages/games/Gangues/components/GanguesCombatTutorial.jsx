import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useTutorialProgress } from '../../../../context/TutorialProgressContext'
import GangTip from './GangTip'

// v4: dois passos novos — aviso de KO (aliado caído) e a regra de divisão de
// XP por contribuição (matar pesa mais que só bater, mas todo mundo garante
// pelo menos 1 XP). Id novo de novo, mesmo motivo das versões anteriores.
// Escopado por CONTA (TutorialProgressContext), não mais por save/aparelho —
// pedido do Isaias (14/09/2026): "toda vez que abro num aparelho novo o
// tutorial aparece de novo, grava isso no Supabase".
const TUTORIAL_ID = 'combate_v4'

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
  const { jaViu, marcarVisto, carregado } = useTutorialProgress()
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)

  if (!carregado || jaViu(TUTORIAL_ID) || fechado) return null

  const atual = PASSOS[passo]
  const ultimo = passo === PASSOS.length - 1
  const avancar = () => { if (ultimo) { marcarVisto(TUTORIAL_ID); setFechado(true) } else setPasso(p => p + 1) }
  const pular = () => { marcarVisto(TUTORIAL_ID); setFechado(true) }

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
