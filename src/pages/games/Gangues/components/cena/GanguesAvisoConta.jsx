import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useAuth } from '../../../../../context/AuthContext'
import useGanguesTeclado from '../../hooks/useGanguesTeclado'
import './GanguesAvisoConta.css'

const CHAVE = 'ldi-gangues-aviso-conta'

/* Interior com ponto de descanso = birosca (na Feira, a pensão). */
export function ehBirosca(cena, interiorId) {
  const int = cena?.interiores?.[interiorId]
  return Boolean(int?.comodos?.some(c => c.pois?.some(p => (p.poi || cena.pois?.find(x => x.id === p.ref))?.tipo === 'descanso')))
}

/* Quem joga sem conta perde o progresso: ao entrar numa birosca, avisa e
   oferece criar conta. Uma vez por aba. */
export default function GanguesAvisoConta({ ativo }) {
  const { t } = useLanguage()
  const { user, carregando } = useAuth()
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!ativo || carregando || user) return
    try { if (sessionStorage.getItem(CHAVE)) return } catch { /* segue */ }
    setAberto(true)
  }, [ativo, carregando, user])

  const fechar = () => {
    try { sessionStorage.setItem(CHAVE, '1') } catch { /* sem storage */ }
    setAberto(false)
  }
  const criar = () => { fechar(); navigate('/cadastro') }

  useGanguesTeclado({ enter: criar, e: criar, escape: fechar }, aberto, 1)

  if (!aberto) return null
  return createPortal(
    <div className="gang-aviso-conta" onClick={fechar}>
      <motion.div className="gang-aviso-conta__card if-panel" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={e => e.stopPropagation()}>
        <p className="if-eyebrow">{t('games.gangues.aviso_conta.titulo')}</p>
        <p className="gang-aviso-conta__texto">{t('games.gangues.aviso_conta.texto')}</p>
        <button className="if-btn if-btn--primary gang-aviso-conta__btn" onClick={criar}>{t('games.gangues.aviso_conta.criar')}</button>
        <button className="gang-aviso-conta__depois" onClick={fechar}>{t('games.gangues.aviso_conta.depois')}</button>
      </motion.div>
    </div>,
    document.body,
  )
}
