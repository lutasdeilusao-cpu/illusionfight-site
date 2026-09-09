import { useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { sfx } from '../../../../../lib/sfx'

/* Encontro DESCANSO — a birosca. Restaura o PV/PM de TODA a tropa gastando
   grana e mostra quanto cada personagem recuperou. Repetível. */
export default function GanguesDescanso({ poi, onClose }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [res, setRes] = useState(null)

  const custo = poi.custoGrana || 10
  const semGrana = store.grana < custo

  const descansar = () => {
    const r = store.descansarTropa(custo)
    setRes(r)
    r.ok ? sfx.reward?.() : sfx.cancel()
  }

  return (
    <div className="gang-cena-enc gang-cena-enc--descanso">
      <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      <span className="gang-cena-eyebrow">{t('games.gangues.cena.tipo.descanso')}</span>
      <h3 className="gang-cena-enc-titulo">{t(`${poi.i18n}.nome`)}</h3>
      <p className="gang-cena-enc-sub">{t(`${poi.i18n}.sub`)}</p>

      {res?.ok ? (
        <>
          <p className="gang-cena-enc-desfecho">{t('games.gangues.cena.descanso_titulo')}</p>
          <ul className="gang-cena-descanso-lista">
            {res.detalhe.map(d => (
              <li key={d.id}>
                <strong>{d.nome}</strong>
                <span>
                  {d.pv > 0 && <em className="is-pv">+{d.pv} PV</em>}
                  {d.pm > 0 && <em className="is-pm">+{d.pm} PM</em>}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="gang-cena-enc-intro">
          {res?.motivo === 'inteira'
            ? t('games.gangues.cena.descanso_ja_inteira')
            : (res?.motivo === 'grana' || semGrana)
              ? t('games.gangues.cena.descanso_sem_grana')
              : t(`${poi.i18n}.intro`)}
        </p>
      )}

      <div className="gang-cena-enc-acoes">
        <button className="gang-cena-btn" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
        {!res?.ok && (
          <button className="gang-cena-btn gang-cena-btn--go" onClick={descansar} disabled={semGrana}>
            {t('games.gangues.cena.descanso_curar', { grana: custo })}
          </button>
        )}
      </div>
    </div>
  )
}
