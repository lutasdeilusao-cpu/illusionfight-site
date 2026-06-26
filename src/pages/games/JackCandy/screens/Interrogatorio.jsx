import { useState } from 'react'
import { motion } from 'framer-motion'
import { useJackStore } from '../store/useJackStore'
import { useLanguage } from '../../../../context/LanguageContext'

const DIALOGO_KIM = [
  { jack: 'era vocÃª.', kim: 'era eu.' },
  { jack: 'por quÃª?', kim: '...' },
  { kim: 'eu avisei.', jack: 'avisou o quÃª?' },
  { kim: 'que esse sonho ia dar problema.' },
  { jack: 'vocÃª sabotou tudo. osvaldo. o carregamento. os envelopes.' },
  { kim: 'senta.', jack: '...' },
  { kim: 'nÃ£o foi sabotagem. foi preparaÃ§Ã£o.' },
  { jack: 'preparaÃ§Ã£o pra quÃª?' },
  { kim: 'pra isso. pra vocÃª chegar aqui. pra vocÃª entender.' },
  { jack: 'entender o quÃª, kim?' },
  { kim: 'que vocÃª nÃ£o tÃ¡ sozinho nesse sonho. que eu tÃ´ aqui desde o comeÃ§o. que eu sempre vou estar.' },
  { jack: '...' },
  { kim: 'o sonho vai acabar. vocÃª vai acordar. e eu vou estar do seu lado.' },
  { kim: 'nÃ£o como garÃ§om. como eu. kim de verdade.' },
  { jack: 'vocÃª Ã© um idiota.' },
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
        { label: 'Cervejas', value: `ðŸº ${store.cervejas}` },
        { label: 'Dungeons', value: store.dungeonsCompletas?.length || 0 },
        { label: 'NÃ­vel', value: `LV ${store.nivel}` },
      ],
    })
    store.setMonologo('kim caiu. mas ele estava sorrindo. eu odeio quando ele faz isso. "te preparando", ele disse. "acorda, jack." eu acordei. kim tava do meu lado mandando meme no whatsapp. tÃ­pico.')
    store.setFase('vila')
  }

  if (terminou) {
    return (
      <motion.div className="jdc-interrogatorio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="jdc-interrogatorio-fim">
          <p className="jack-text jack-text--amber jdc-interrogatorio-fim-titulo">
            {DIALOGO_KIM[passo]?.kim || DIALOGO_KIM[passo]?.jack || '"...pronto. satisfeito?"'}
          </p>
          <p className="jack-text jack-text--dim jdc-interrogatorio-fim-texto">
            {t('games.jackcandy.interrogatorio_fim')}
          </p>
          <button className="jack-btn jack-btn--amber jdc-interrogatorio-fim-btn" onClick={finalizar}>
            {t('games.jackcandy.interrogatorio_acordar')}
          </button>
        </div>
      </motion.div>
    )
  }

  const linha = DIALOGO_KIM[passo]

  return (
    <motion.div className="jdc-interrogatorio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onClick={avancar} className="jdc-interrogatorio-clickable">
      <p className="jack-text jack-text--dim jdc-interrogatorio-aviso">
        {t('games.jackcandy.interrogatorio_clique')}
      </p>

      <div className="jdc-interrogatorio-cena">
        <div className="jdc-interrogatorio-personagens">
          <div className="jdc-interrogatorio-jack">ðŸ•µï¸ Jack</div>
          <div className="jdc-interrogatorio-vs">vs</div>
          <div className="jdc-interrogatorio-kim">ðŸº Kim</div>
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
