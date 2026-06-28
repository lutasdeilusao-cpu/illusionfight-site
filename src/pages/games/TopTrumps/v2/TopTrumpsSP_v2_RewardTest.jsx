import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { getDeck } from '../../../../lib/getDeck'
import { attrNomeKey } from '../utils/attrNomeKey'
import RewardScreen from './components/RewardScreen/RewardScreen'
import { sfx } from '../../../../lib/sfx'
import cardFallback from '../../../../assets/images/cards/characters/card-fallback.png'
import img01 from '../../../../assets/images/cards/characters/card-01.png'
import img02 from '../../../../assets/images/cards/characters/card-02.png'
import img03 from '../../../../assets/images/cards/characters/card-03.png'
import img04 from '../../../../assets/images/cards/characters/card-04.png'
import img05 from '../../../../assets/images/cards/characters/card-05.png'
import img06 from '../../../../assets/images/cards/characters/card-06.png'
import img07 from '../../../../assets/images/cards/characters/card-07.png'
import img08 from '../../../../assets/images/cards/characters/card-08.png'
import img09 from '../../../../assets/images/cards/characters/card-09.png'
import img10 from '../../../../assets/images/cards/characters/card-10.png'
import img11 from '../../../../assets/images/cards/characters/card-11.png'
import img12 from '../../../../assets/images/cards/characters/card-12.png'
import img13 from '../../../../assets/images/cards/characters/card-13.png'
import img14 from '../../../../assets/images/cards/characters/card-14.png'
import img15 from '../../../../assets/images/cards/characters/card-15.png'
import img21 from '../../../../assets/images/cards/characters/card-21.png'
import img23 from '../../../../assets/images/cards/characters/card-23.png'

const CARD_IMAGES = {
  1: img01, 2: img02, 3: img03, 4: img04, 5: img05,
  6: img06, 7: img07, 8: img08, 9: img09, 10: img10,
  11: img11, 12: img12, 13: img13, 14: img14, 15: img15,
  21: img21, 23: img23,
}

function cardImage(carta) {
  return CARD_IMAGES[carta?.id] || cardFallback
}

export default function TopTrumpsSP_v2_RewardTest() {
  const { tt, locale } = useLanguage()
  const deck = getDeck(locale)
  const [opcoes] = useState(() => [...deck.cartas].sort(() => Math.random() - 0.5).slice(0, 3))
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
      cardImage={cardImage}
    />
  )
}
