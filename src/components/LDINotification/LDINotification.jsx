import { useEffect, useRef } from 'react'
import { notificationManager } from '../../lib/notificationManager'
import notificacoes from '../../data/notificacoes.json'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const PERSONAGENS = ['jack', 'nina', 'tama']

function pickPersonagem() {
  return PERSONAGENS[Math.floor(Math.random() * PERSONAGENS.length)]
}

export default function LDINotification() {
  const indexRef = useRef(0)
  const shuffledRef = useRef(null)

  useEffect(() => {
    shuffledRef.current = shuffle(notificacoes)
    indexRef.current = 0

    // Primeira notificação após 3 min
    const firstTimer = setTimeout(() => pushNext(), 3 * 60 * 1000)

    // A cada 5 minutos, tenta empurrar a próxima dica
    const interval = setInterval(() => pushNext(), 5 * 60 * 1000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)
    }
  }, [])

  function pushNext() {
    const shuffled = shuffledRef.current
    if (!shuffled || shuffled.length === 0) return

    const idx = indexRef.current % shuffled.length
    const notif = shuffled[idx]
    indexRef.current = idx + 1

    const personagem = notif.personagem || pickPersonagem()

    notificationManager.push('ldi_tip', {
      mensagem: notif.mensagem,
      cta: notif.cta,
      url: notif.url,
      personagem,
      nome_personagem: notif.nome_personagem || undefined,
    })
  }

  return null
}
