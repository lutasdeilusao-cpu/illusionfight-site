import { useState } from 'react'
import { useKpI18n } from '../hooks/useKpI18n'

export default function KPShotModal({ open, playerField, playerIdx, onConfirm, onCancel }) {
  const { t } = useKpI18n()
  const [selected, setSelected] = useState([])

  if (!open) return null

  const atkCards = playerField.map((c, i) => c && c.kind === 'atk' ? { card: c, slotIdx: i } : null).filter(Boolean)
  const defCards = playerField.map((c, i) => c && c.kind === 'def' ? { card: c, slotIdx: i } : null).filter(Boolean)
  const efxCards = playerField.map((c, i) => c && c.kind === 'efx' ? { card: c, slotIdx: i } : null).filter(Boolean)

  function toggleCard(item, role) {
    setSelected(prev => {
      const exists = prev.find(s => s.slotIdx === item.slotIdx)
      if (exists) return prev.filter(s => s.slotIdx !== item.slotIdx)
      return [...prev, { key: `${role}_${item.slotIdx}`, card: item.card, slotIdx: item.slotIdx, role }]
    })
  }

  function isChosen(slotIdx) {
    return selected.some(s => s.slotIdx === slotIdx)
  }

  function getChosenClass(slotIdx) {
    const s = selected.find(x => x.slotIdx === slotIdx)
    if (!s) return ''
    if (s.role === 'atk') return 'chosen-atk'
    if (s.role === 'def') return 'chosen-def'
    if (s.role === 'efx') return 'chosen-efx'
    return ''
  }

  const atkPower = selected.filter(s => s.role === 'atk').reduce((a, s) => a + (s.card.bonus || 0), 0)
  const defPower = selected.filter(s => s.role === 'def').length

  return (
    <div className="shot-overlay show">
      <div className="shot-box">
        <h2>{t('kp.shot.confirmar_ataque')}</h2>
        <div className="shot-sub">{t('kp.shot.selecione_ataque')}</div>

        <div className="shot-section-label">{t('kp.shot.ataque')}</div>
        <div className="shot-cards">
          {atkCards.map(({ card, slotIdx }) => (
            <button key={slotIdx} className={`shot-card-btn ${getChosenClass(slotIdx)}`}
              onClick={() => toggleCard({ card, slotIdx }, 'atk')}>
              {card.name} {card.bonus > 0 ? `+${card.bonus}` : ''}
            </button>
          ))}
          {atkCards.length === 0 && <span style={{ color: 'var(--ghost)', fontSize: 'var(--fs-xs)' }}>{t('kp.shot.sem_ataque')}</span>}
        </div>

        <div className="shot-section-label">{t('kp.shot.defesa_opcional')}</div>
        <div className="shot-cards">
          {defCards.map(({ card, slotIdx }) => (
            <button key={slotIdx} className={`shot-card-btn ${getChosenClass(slotIdx)}`}
              onClick={() => toggleCard({ card, slotIdx }, 'def')}>
              {card.name} {card.bonus > 0 ? `+${card.bonus}` : ''}
            </button>
          ))}
          {defCards.length === 0 && <span style={{ color: 'var(--ghost)', fontSize: 'var(--fs-xs)' }}>{t('kp.shot.sem_defesa')}</span>}
        </div>

        {efxCards.length > 0 && (
          <>
            <div className="shot-section-label">{t('kp.shot.efeito')}</div>
            <div className="shot-cards">
              {efxCards.map(({ card, slotIdx }) => (
                <button key={slotIdx} className={`shot-card-btn ${getChosenClass(slotIdx)}`}
                  onClick={() => toggleCard({ card, slotIdx }, 'efx')}>
                  {card.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="shot-summary">
          {t('kp.shot.potencia_fogo')} <span className="hl">{atkPower}</span> | {t('kp.shot.defesa')} <span className="hl">{defPower}</span>
        </div>

        <div className="shot-actions">
          <button className="btn-fire" disabled={selected.filter(s => s.role === 'atk').length === 0}
            onClick={() => onConfirm(selected)}>
            {t('kp.shot.atirar')}
          </button>
          <button className="btn-cancel-shot" onClick={() => { setSelected([]); onCancel() }}>
            {t('kp.shot.cancelar')}
          </button>
        </div>
      </div>
    </div>
  )
}
