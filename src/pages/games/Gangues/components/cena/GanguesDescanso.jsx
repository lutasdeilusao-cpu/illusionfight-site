import { useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'

/* Encontro DESCANSO — a birosca. Recupera o fôlego da gangue gastando
   grana. Repetível: não fica marcado como resolvido. */
export default function GanguesDescanso({ poi, cena, onClose }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const folego = store._cena(cena.id).folego ?? 100
  const [curou, setCurou] = useState(0)

  const custo = poi.custoGrana || 10
  const cheio = folego >= 100
  const semGrana = store.grana < custo

  const descansar = () => {
    if (cheio || semGrana) { sfx.cancel(); return }
    if (!store.gastarGrana(custo)) { sfx.cancel(); return }
    store.ajustarFolego(cena.id, poi.cura || 40)
    setCurou(poi.cura || 40)
    sfx.reward?.()
  }

  return (
    <div className="gang-cena-enc gang-cena-enc--descanso">
      <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      <span className="gang-cena-eyebrow">{t('games.gangues.cena.tipo.descanso')}</span>
      <h3 className="gang-cena-enc-titulo">{t(`${poi.i18n}.nome`)}</h3>
      <p className="gang-cena-enc-sub">{t(`${poi.i18n}.sub`)}</p>

      <div className="gang-cena-folego gang-cena-folego--big">
        <span className="gang-cena-folego-bar"><i style={{ '--pct': `${folego}%` }} /></span>
        <b>{folego}</b>
      </div>

      {curou > 0 ? (
        <p className="gang-cena-enc-desfecho">{t('games.gangues.cena.descanso_curou', { n: curou })}</p>
      ) : (
        <p className="gang-cena-enc-intro">
          {cheio
            ? t('games.gangues.cena.descanso_cheio')
            : semGrana
              ? t('games.gangues.cena.descanso_sem_grana')
              : t(`${poi.i18n}.intro`)}
        </p>
      )}

      <div className="gang-cena-enc-acoes">
        <button className="gang-cena-btn" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
        <button className="gang-cena-btn gang-cena-btn--go" onClick={descansar} disabled={cheio || semGrana}>
          {t('games.gangues.cena.descanso_curar', { grana: custo })}
        </button>
      </div>
    </div>
  )
}
