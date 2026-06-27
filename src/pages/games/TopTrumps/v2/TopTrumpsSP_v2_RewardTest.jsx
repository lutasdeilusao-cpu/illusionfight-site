import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { getDeck } from '../../../../lib/getDeck'
import { attrNomeKey } from '../utils/attrNomeKey'
import RewardScreen from './components/RewardScreen/RewardScreen'
import { sfx } from '../../../../lib/sfx'

export default function TopTrumpsSP_v2_RewardTest() {
  const { tt, locale } = useLanguage()
  const deck = getDeck(locale)
  const opcoes = [...deck.cartas].sort(() => Math.random() - 0.5).slice(0, 3)
  const [selecionada, setSelecionada] = useState(null)
  const [confirmada, setConfirmada] = useState(false)

  if (confirmada) {
    return (
      <div style={{ color: '#fff', padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#1ea064' }}>Recompensa confirmada</h2>
        <p>Carta selecionada: {selecionada?.nome}</p>
        <p style={{ color: '#8B8F96', fontSize: '0.8rem' }}>
          (nenhum dado foi salvo — esta é apenas uma tela de teste)
        </p>
        <button
          onClick={() => { setSelecionada(null); setConfirmada(false) }}
          style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#e8853a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, color: '#000' }}
        >
          Testar novamente
        </button>
      </div>
    )
  }

  return (
    <RewardScreen
      opcoes={opcoes}
      selecionada={selecionada}
      onSelecionar={(carta) => { sfx.select?.(); setSelecionada(carta) }}
      onConfirmar={() => { if (selecionada) setConfirmada(true) }}
      locale={locale}
      tt={tt}
      cardImage={(carta) => (carta?.imagem || '')}
    />
  )
}
