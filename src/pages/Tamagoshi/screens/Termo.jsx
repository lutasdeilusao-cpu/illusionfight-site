import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useTamagoshiStore } from '../store/useTamagoshiStore'
import './Termo.css'

export default function Termo({ onVoltar }) {
  const { t } = useLanguage()
  const store = useTamagoshiStore()
  const [etapa, setEtapa] = useState(1)

  const handleLi = () => {
    setEtapa(2)
  }

  const handleRecusar = () => {
    onVoltar()
  }

  const handleAceitar = async () => {
    const flags = { ...(store.flags || {}), termo_aceito: true }
    store.setFlags(flags)
    await store.saveToCloud(store._userId)
  }

  if (etapa === 1) {
    return (
      <div className="tama-screen">
        <div className="tama-termo">
          <h2 className="tama-termo-titulo">{t('games.tamagoshi.termo.titulo')}</h2>
          <p className="tama-termo-intro">{t('games.tamagoshi.termo.intro')}</p>
          <ul className="tama-termo-regras">
            <li>{t('games.tamagoshi.termo.regra_alimentar')}</li>
            <li>{t('games.tamagoshi.termo.regra_higiene')}</li>
            <li>{t('games.tamagoshi.termo.regra_passear')}</li>
            <li>{t('games.tamagoshi.termo.regra_brincar')}</li>
            <li>{t('games.tamagoshi.termo.regra_saude')}</li>
          </ul>
          <div className="tama-termo-avisos">
            <p>{t('games.tamagoshi.termo.aviso_morte')}</p>
            <p>{t('games.tamagoshi.termo.aviso_cooldown')}</p>
            <p>{t('games.tamagoshi.termo.aviso_vida')}</p>
            <p>{t('games.tamagoshi.termo.aviso_fama')}</p>
          </div>
          <button className="tama-termo-btn" onClick={handleLi}>
            [ {t('games.tamagoshi.termo.btn_li')} ]
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tama-screen">
      <div className="tama-termo">
        <h2 className="tama-termo-titulo">{t('games.tamagoshi.termo.confirmacao_titulo')}</h2>
        <p className="tama-termo-intro">{t('games.tamagoshi.termo.confirmacao_texto')}</p>
        <div className="tama-termo-acoes">
          <button className="tama-termo-btn" onClick={handleAceitar}>
            [ {t('games.tamagoshi.termo.btn_aceitar')} ]
          </button>
          <button className="tama-termo-btn-recusar" onClick={handleRecusar}>
            [ {t('games.tamagoshi.termo.btn_recusar')} ]
          </button>
        </div>
      </div>
    </div>
  )
}
