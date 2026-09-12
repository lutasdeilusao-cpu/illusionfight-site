import { motion } from 'framer-motion'
import { useLanguage } from '../../../../context/LanguageContext'
import { getGanguesBiografia } from '../data/ganguesBiografias.js'

/** Painel de história/lore de um personagem — aberto pelo botão "HISTÓRIA"
 *  na ficha de recrutamento (pedido do Isaias, set/2026). Sobe por cima da
 *  ficha (mesma linguagem visual do gang-sheet-modal). Texto vem de
 *  data/ganguesBiografias.js (PT-first, ver comentário lá — sem tradução
 *  en/es ainda). Se o personagem não tiver bio cadastrada, o botão nem
 *  aparece (ver checagem em quem chama). */
export default function GanguesFichaBio({ characterTemplateId, nome, onClose }) {
  const { t } = useLanguage()
  const bio = getGanguesBiografia(characterTemplateId)
  if (!bio) return null

  return (
    <motion.div
      className="gang-ficha-bio"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gang-ficha-bio-nome"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      <button className="gang-ficha-bio__close" onClick={onClose} aria-label={t('games.gangues.recruitment.close')}>×</button>
      <h3 id="gang-ficha-bio-nome">{nome}</h3>
      <div className="gang-ficha-bio__body">
        <section>
          <b>{t('games.gangues.recruitment.bio_quem_e')}</b>
          <p>{bio.quemE}</p>
        </section>
        <section>
          <b>{t('games.gangues.recruitment.bio_historia')}</b>
          <p>{bio.historia}</p>
        </section>
        <section>
          <b>{t('games.gangues.recruitment.bio_por_que')}</b>
          <p>{bio.porQueRecrutar}</p>
        </section>
      </div>
    </motion.div>
  )
}
