import { useState } from 'react'
import { useKpI18n } from '../hooks/useKpI18n'

export default function KPDefenseModal({ open, playerField, atkSelection, playerIdx, onConfirm, onCancel }) {
  const { t } = useKpI18n()
  const [selected, setSelected] = useState([])

  if (!open) return null

  const defCards = playerField.map((c, i) => c && c.kind === 'def' ? { card: c, slotIdx: i } : null).filter(Boolean)
  const efxCards = playerField.map((c, i) => c && c.kind === 'efx' && c.trigger === 'on_hit_defend' ? { card: c, slotIdx: i } : null).filter(Boolean)

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
    return s.role === 'def' ? 'chosen-def' : 'chosen-efx'
  }

  const defPower = selected.filter(s => s.role === 'def')
    .reduce((a, s) => a + (s.card.bonus || 0), 0)

  return (
    <div className="shot-overlay show">
      <div className="shot-box">
        <h2>{t('kp.defense.titulo')}</h2>
        <div className="shot-sub">{t('kp.defense.selecione_defesa', { player: playerIdx + 1 })}</div>

        <div className="shot-section-label">{t('kp.defense.defesa')}</div>
        <div className="shot-cards">
          {defCards.map(({ card, slotIdx }) => (
            <button key={slotIdx} className={`shot-card-btn ${getChosenClass(slotIdx)}`}
              onClick={() => toggleCard({ card, slotIdx }, 'def')}>
              {card.name} {card.bonus > 0 ? `+${card.bonus}` : ''}
            </button>
          ))}
          {defCards.length === 0 && <span style={{ color: 'var(--ghost)', fontSize: 'var(--fs-xs)' }}>{t('kp.defense.sem_defesa')}</span>}
        </div>

        {efxCards.length > 0 && (
          <>
            <div className="shot-section-label">{t('kp.defense.reacao')}</div>
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
          {t('kp.defense.total')} <span className="hl">{defPower}</span>
        </div>

        <div className="shot-actions">
          <button className="btn-fire" onClick={() => onConfirm(selected)}>
            {t('kp.defense.confirmar')}
          </button>
          <button className="btn-cancel-shot" onClick={() => { setSelected([]); onCancel() }}>
            {t('kp.defense.cancelar')}
          </button>
        </div>
      </div>
    </div>
  )
}
