import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

/** Copia um texto pronto pra área de transferência. */
export default function BotaoCopiar({ texto, rotulo }) {
  const { t } = useLanguage()
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch (e) {
      console.warn('[Creators] não deu pra copiar:', e?.message)
    }
  }

  return (
    <button type="button" className={`cr-copiar${copiado ? ' is-copiado' : ''}`} onClick={copiar}>
      {copiado ? t('creators.copiar.copiado') : (rotulo || t('creators.copiar.copiar'))}
    </button>
  )
}
