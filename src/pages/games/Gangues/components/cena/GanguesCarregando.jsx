import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import logoPt from '../../assets/logos/logo-pt.png'
import logoEn from '../../assets/logos/logo-en.png'
import logoEs from '../../assets/logos/logo-es.png'

const LOGOS = { pt: logoPt, en: logoEn, es: logoEs }

// Tela de carregamento entre ambientes (rua, prédio, cômodo): cobre a tela inteira
// e segura os controles enquanto as imagens do lugar novo carregam.
export default function GanguesCarregando({ duracao }) {
  const { t, locale } = useLanguage()
  return (
    <motion.div className="gang-carregando" style={{ '--dur': `${duracao}ms` }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
      <img className="gang-carregando__logo" src={LOGOS[locale] || logoPt} alt="LDI Gangues" />
      <span className="gang-carregando__barra"><i /></span>
      <small className="gang-carregando__texto">{t('games.gangues.cena.carregando')}</small>
    </motion.div>
  )
}
