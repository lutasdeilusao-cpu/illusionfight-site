import { useMemo, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { useGanguesStore } from '../store/useGanguesStore'
import { GANGUES_EQUIP_SLOTS, getGanguesEquip, normalizeGanguesEquipment } from '../data/ganguesEquip.js'
import { sfx } from '../../../../lib/sfx'
import './GanguesEquipPanel.css'

const ATTR_ORDER = ['A', 'H', 'R', 'D']

/** Lê o bônus de um item como "+1 A · +1 D" pros dois idiomas (usa attr_labels curtos). */
function bonusResumo(t, bonus = {}) {
  return ATTR_ORDER.filter(attr => bonus[attr]).map(attr => `+${bonus[attr]} ${t(`games.gangues.attr_labels.${attr}`)}`).join(' · ')
}

/** Quadradinhos de slot de carta — vazios por enquanto (cartas vêm com o drop). */
function CardSlots({ t, quantidade }) {
  if (!quantidade) return <span className="gang-equip-cards gang-equip-cards--none">{t('games.gangues.equip.sem_carta')}</span>
  return (
    <span className="gang-equip-cards" title={t('games.gangues.equip.carta_em_breve')}>
      {Array.from({ length: quantidade }, (_, i) => <b key={i} className="gang-equip-card-slot" />)}
    </span>
  )
}

export default function GanguesEquipPanel({ member }) {
  const { t } = useLanguage()
  const equipamentos = useGanguesStore(state => state.equipamentos)
  const equiparItem = useGanguesStore(state => state.equiparItem)
  const desequiparItem = useGanguesStore(state => state.desequiparItem)
  const [slotAberto, setSlotAberto] = useState(null)

  const equipment = useMemo(() => normalizeGanguesEquipment(member?.attributes?.equipment), [member])

  if (!member) return null

  const disponiveisDoSlot = slot => equipamentos
    .map(inst => ({ inst, def: getGanguesEquip(inst.itemId) }))
    .filter(entry => entry.def?.slot === slot)

  const fechar = () => setSlotAberto(null)

  const equipar = (uid) => {
    if (equiparItem(member.id, uid)) sfx.select?.()
    else sfx.cancel?.()
    fechar()
  }

  const desequipar = (slot) => {
    if (desequiparItem(member.id, slot)) sfx.cancel?.()
    fechar()
  }

  return (
    <div className="gang-equip">
      <h3 className="gang-progression-section-title">{t('games.gangues.equip.titulo')}</h3>
      <p className="gang-equip-sub">{t('games.gangues.equip.sub')}</p>

      <ul className="gang-equip-slots">
        {GANGUES_EQUIP_SLOTS.map(({ id: slot, icone }) => {
          const equipada = equipment[slot]
          const def = equipada && getGanguesEquip(equipada.itemId)
          return (
            <li key={slot}>
              <button className={`gang-equip-slot${def ? ' is-filled' : ''}`} onClick={() => { sfx.click?.(); setSlotAberto(slot) }}>
                <span className="gang-equip-slot__icone">{def ? def.icone : icone}</span>
                <span className="gang-equip-slot__info">
                  <small>{t(`games.gangues.equip.slots.${slot}`)}</small>
                  <strong>{def ? t(def.nome) : t('games.gangues.equip.vazio')}</strong>
                  {def && <em>{bonusResumo(t, def.bonus)}</em>}
                </span>
                {def && <CardSlots t={t} quantidade={def.cardSlots} />}
              </button>
            </li>
          )
        })}
      </ul>

      {slotAberto && (
        <div className="gang-equip-picker" role="dialog" aria-modal="true">
          <button className="gang-equip-picker__scrim" onClick={fechar} aria-label={t('games.gangues.cena.fechar')} />
          <div className="gang-equip-picker__card">
            <header className="gang-equip-picker__head">
              <strong>{t(`games.gangues.equip.slots.${slotAberto}`)}</strong>
              <button onClick={fechar} aria-label={t('games.gangues.cena.fechar')}>×</button>
            </header>

            {equipment[slotAberto] && (() => {
              const def = getGanguesEquip(equipment[slotAberto].itemId)
              return (
                <div className="gang-equip-picker__equipada">
                  <span className="gang-equip-slot__icone">{def.icone}</span>
                  <span className="gang-equip-slot__info">
                    <strong>{t(def.nome)}</strong>
                    <em>{bonusResumo(t, def.bonus)}</em>
                    <CardSlots t={t} quantidade={def.cardSlots} />
                  </span>
                  <button className="gang-equip-btn gang-equip-btn--off" onClick={() => desequipar(slotAberto)}>{t('games.gangues.equip.desequipar')}</button>
                </div>
              )
            })()}

            <div className="gang-equip-picker__lista">
              {disponiveisDoSlot(slotAberto).length === 0 && <p className="gang-equip-picker__vazio">{t('games.gangues.equip.sem_itens')}</p>}
              {disponiveisDoSlot(slotAberto).map(({ inst, def }) => (
                <div key={inst.uid} className={`gang-equip-oferta gang-equip-oferta--${def.raridade}`}>
                  <span className="gang-equip-slot__icone">{def.icone}</span>
                  <span className="gang-equip-slot__info">
                    <strong>{t(def.nome)}</strong>
                    <small>{t(`games.gangues.equip.raridade.${def.raridade}`)}</small>
                    <em>{bonusResumo(t, def.bonus)}</em>
                    <CardSlots t={t} quantidade={def.cardSlots} />
                  </span>
                  <button className="gang-equip-btn" onClick={() => equipar(inst.uid)}>{t('games.gangues.equip.equipar')}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
