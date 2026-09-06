import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import GangTip from './GangTip'

// v2: tutorial ganhou passos novos (escolher alvo, ver ficha, trash talk) —
// chave nova pra quem já tinha visto a v1 (só 3 passos) ver a versão
// completa, em vez de ficar escondido pra sempre por já ter marcado "visto".
const TUTORIAL_KEY = 'ldi-gangues-combate-tutorial-v2-visto'
// Falha ao ler localStorage (privacidade estrita, storage bloqueado) tem que
// falhar pro lado de MOSTRAR o tutorial, nunca de escondê-lo — errar
// mostrando de novo pra quem já viu é bem menos grave que nunca ensinar
// quem tá vendo o jogo pela primeira vez (mesmo padrão de cenaIntroJaVista
// em GanguesCena.jsx).
function jaViu() { try { return localStorage.getItem(TUTORIAL_KEY) === '1' } catch { return false } }
function marcarVisto() { try { localStorage.setItem(TUTORIAL_KEY, '1') } catch {} }

const PASSOS = [
  { chave: 'iniciativa', lado: 'right' },
  { chave: 'escolher_alvo', lado: 'left' },
  { chave: 'ver_ficha', lado: 'right' },
  { chave: 'trash_talk', lado: 'left' },
  { chave: 'golpes', lado: 'right' },
  { chave: 'atacar', lado: 'left' },
]

/** Tutorial de combate — só aparece na PRIMEIRA luta da conta (flag no
 *  localStorage, mesmo padrão dos tutoriais do NeoGuide em outras telas).
 *  Autocontido: quem monta este componente não precisa saber se é a
 *  primeira luta ou não, ele mesmo decide e renderiza null depois disso. */
export default function GanguesCombatTutorial() {
  const { t } = useLanguage()
  const [visto] = useState(jaViu)
  const [passo, setPasso] = useState(0)
  const [fechado, setFechado] = useState(false)

  if (visto || fechado) return null

  const atual = PASSOS[passo]
  const ultimo = passo === PASSOS.length - 1
  const avancar = () => { if (ultimo) { marcarVisto(); setFechado(true) } else setPasso(p => p + 1) }
  const pular = () => { marcarVisto(); setFechado(true) }

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
