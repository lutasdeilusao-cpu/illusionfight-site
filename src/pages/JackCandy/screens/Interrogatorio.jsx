import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { useLanguage } from '../../../context/LanguageContext'

const DIALOGO_KIM = [
  { jack: 'era você.', kim: 'era eu.' },
  { jack: 'por quê?', kim: '...' },
  { kim: 'eu avisei.', jack: 'avisou o quê?' },
  { kim: 'que esse sonho ia dar problema.' },
  { jack: 'você sabotou tudo. osvaldo. o carregamento. os envelopes.' },
  { kim: 'senta.', jack: '...' },
  { kim: 'não foi sabotagem. foi preparação.' },
  { jack: 'preparação pra quê?' },
  { kim: 'pra isso. pra você chegar aqui. pra você entender.' },
  { jack: 'entender o quê, kim?' },
  { kim: 'que você não tá sozinho nesse sonho. que eu tô aqui desde o começo. que eu sempre vou estar.' },
  { jack: '...' },
  { kim: 'o sonho vai acabar. você vai acordar. e eu vou estar do seu lado.' },
  { kim: 'não como garçom. como eu. kim de verdade.' },
  { jack: 'você é um idiota.' },
  { kim: 'eu sei.' },
]

export default function Interrogatorio() {
  const { t } = useLanguage()
  const store = useJackStore()
  const [passo, setPasso] = useState(0)
  const [terminou, setTerminou] = useState(false)

  const avancar = () => {
    if (passo < DIALOGO_KIM.length - 1) {
      setPasso(p => p + 1)
    } else {
      setTerminou(true)
    }
  }

  const finalizar = () => {
    store.resolverCaso('CASO4_RESOLVIDO')
    store.setFlag('KIM_REVELADO')
    store.showResultCard({
      title: 'Quem Sabotou o Sonho',
      subtitle: 'Caso 4 resolvido',
      context: 'caso',
      stats: [
        { label: 'Casos', value: '4/4' },
        { label: 'Cervejas', value: `🍺 ${store.cervejas}` },
        { label: 'Dungeons', value: store.dungeonsCompletas?.length || 0 },
        { label: 'Nível', value: `LV ${store.nivel}` },
      ],
    })
    store.setMonologo('kim caiu. mas ele estava sorrindo. eu odeio quando ele faz isso. "te preparando", ele disse. "acorda, jack." eu acordei. kim tava do meu lado mandando meme no whatsapp. típico.')
    store.setFase('vila')
  }

  if (terminou) {
    return (
      <motion.div className="jdc-interrogatorio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-interrogatorio-fim">
          <p className="jack-text jack-text--amber" style={{ fontSize: '1.2rem' }}>
            {DIALOGO_KIM[passo]?.kim || DIALOGO_KIM[passo]?.jack || '"...pronto. satisfeito?"'}
          </p>
          <p className="jack-text jack-text--dim" style={{ marginTop: '1rem', fontStyle: 'italic' }}>
            {t('games.jackcandy.interrogatorio_fim')}
          </p>
          <button className="jack-btn jack-btn--amber" onClick={finalizar} style={{ marginTop: '1.5rem' }}>
            {t('games.jackcandy.interrogatorio_acordar')}
          </button>
        </div>
      </motion.div>
    )
  }

  const linha = DIALOGO_KIM[passo]

  return (
    <motion.div className="jdc-interrogatorio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onClick={avancar} style={{ cursor: 'pointer' }}>
      <p className="jack-text jack-text--dim" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>
        {t('games.jackcandy.interrogatorio_clique')}
      </p>

      <div className="jdc-interrogatorio-cena">
        <div className="jdc-interrogatorio-personagens">
          <div className="jdc-interrogatorio-jack">🕵️ Jack</div>
          <div className="jdc-interrogatorio-vs">vs</div>
          <div className="jdc-interrogatorio-kim">🍺 Kim</div>
        </div>

        <div className="jdc-interrogatorio-dialogo">
          {linha.jack && (
            <motion.p className="jdc-interrogatorio-fala jdc-interrogatorio-fala--jack"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="jdc-interrogatorio-nome">Jack:</span> "{linha.jack}"
            </motion.p>
          )}
          {linha.kim && (
            <motion.p className="jdc-interrogatorio-fala jdc-interrogatorio-fala--kim"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="jdc-interrogatorio-nome">Kim:</span> "{linha.kim}"
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
