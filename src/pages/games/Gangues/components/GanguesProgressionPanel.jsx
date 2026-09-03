import { useEffect, useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import {
  GANGUES_ATTRIBUTE_XP_COSTS,
  GANGUES_SPECIAL_COSTS,
  GANGUES_SPECIAL_PATH_ATTRIBUTE_REQUIREMENT,
  GANGUES_SPECIAL_PATH_XP_COST,
  getGanguesProgression,
  selectGanguesSpecialPath,
  toggleGanguesSpecial,
  upgradeGanguesAttribute,
  upgradeGanguesSpecial,
} from '../data/ganguesLoadout.js'
import { getGanguesSpecialPath, getGanguesSpecialPaths } from '../data/ganguesSpecials.js'

const SPECIAL_ICON = { bruto: '⚔', duelista: '†', furia: '♦', especialista: '◈', vingador: '▣', muralha: '▰', guardiao: '◇', provocador: '!', reativo: '↯', resiliente: '✚', igneo: '♨', aquatico: '≋', terreno: '◆', tempestade: 'ϟ', ilusorio: '◉' }
const ATTRIBUTES = ['A', 'H', 'R', 'D']

/** onApply(member, change, meta) — meta.cost e meta.label alimentam a
 *  confirmação na tela de progressão. cost 0 = aplica direto (ex: equipar). */
export default function GanguesProgressionPanel({ member, onApply, onDelete }) {
  const { t } = useLanguage()
  const progression = getGanguesProgression(member)
  const paths = getGanguesSpecialPaths(member.combat_path)
  const [previewPathId, setPreviewPathId] = useState(progression.special_path || paths[0]?.id || null)
  const unlockedPath = progression.special_path ? getGanguesSpecialPath(member.combat_path, progression.special_path) : null
  const previewPath = getGanguesSpecialPath(member.combat_path, unlockedPath?.id || previewPathId)
  const specials = previewPath?.specials || []
  const attributeTotal = ATTRIBUTES.reduce((sum, attribute) => sum + (Number(member.attributes?.[attribute]) || 0), 0)
  const pathRequirementMet = attributeTotal >= GANGUES_SPECIAL_PATH_ATTRIBUTE_REQUIREMENT
  const canUnlockPath = pathRequirementMet && progression.xp_unspent >= GANGUES_SPECIAL_PATH_XP_COST

  useEffect(() => {
    setPreviewPathId(progression.special_path || paths[0]?.id || null)
  }, [member.id, progression.special_path])

  return <section className={`gang-progression gang-progression--${member.combat_path}`}>
    <div className="gang-progression-header">
      <span className={`gang-progression-avatar gang-path--${member.combat_path}`}>{member.sheet_name[0].toUpperCase()}</span>
      <div className="gang-progression-headline">
        <h2>{t('games.gangues.progression.title')}</h2>
        <p>{member.sheet_name} · {t(`games.gangues.loadout.paths.${member.combat_path}.name`)}</p>
      </div>
      {onDelete && <button className="gang-progression-delete" onClick={() => onDelete(member)} aria-label={t('games.gangues.progression.delete')}>🗑</button>}
    </div>

    <div className="gang-progression-stats">
      <div className="gang-progression-ap">
        <span>{t('games.gangues.progression.ap', { n: progression.ap })}</span>
        <progress className="gang-progression-ap-bar" max="10" value={progression.ap} />
      </div>
      <div className="gang-progression-xp">✦ {t('games.gangues.progression.xp_available', { n: progression.xp_unspent })}</div>
    </div>

    {/* ── Atributos: um stepper por atributo ── */}
    <h3 className="gang-progression-section-title">{t('games.gangues.progression.attributes')}</h3>
    <p className="gang-progression-help">{t('games.gangues.progression.attributes_help', { n: attributeTotal, required: GANGUES_SPECIAL_PATH_ATTRIBUTE_REQUIREMENT })}</p>
    <div className="gang-attr-steppers">{ATTRIBUTES.map(attribute => {
      const value = Number(member.attributes?.[attribute]) || 0
      const cost = GANGUES_ATTRIBUTE_XP_COSTS[value]
      const podeSubir = Boolean(cost) && progression.xp_unspent >= cost
      return (
        <div key={attribute} className="gang-attr-stepper">
          <span className="gang-attr-stepper-letter">{attribute}</span>
          <span className="gang-attr-stepper-name">{t(`games.gangues.attr_labels.${attribute}`)}</span>
          <span className="gang-attr-stepper-val">
            {value}{cost && <b> → {value + 1}</b>}
          </span>
          <span className="gang-attr-stepper-cost">{cost ? t('games.gangues.progression.cost_xp', { n: cost }) : t('games.gangues.progression.maxed')}</span>
          <button
            className="gang-attr-stepper-plus"
            disabled={!podeSubir}
            aria-label={`+1 ${attribute}`}
            onClick={() => onApply(member, upgradeGanguesAttribute(member, attribute), {
              cost,
              label: `${t(`games.gangues.attr_labels.${attribute}`)} ${value} → ${value + 1}`,
            })}
          >+</button>
        </div>
      )
    })}</div>

    {/* ── Subcaminho ── */}
    <h3 className="gang-progression-section-title">{t('games.gangues.progression.special_path')}</h3>
    <p className="gang-progression-help">{unlockedPath ? t('games.gangues.progression.path_unlocked') : t('games.gangues.progression.path_help', { required: GANGUES_SPECIAL_PATH_ATTRIBUTE_REQUIREMENT, cost: GANGUES_SPECIAL_PATH_XP_COST })}</p>
    <div className="gang-special-paths" role="group" aria-label={t('games.gangues.progression.special_path')}>{paths.map(item => {
      const selected = item.id === previewPath?.id
      const lockedOut = Boolean(unlockedPath && item.id !== unlockedPath.id)
      return <button key={item.id} disabled={lockedOut} className={`${selected ? 'gang-special-path gang-special-path--selected' : 'gang-special-path'} ${lockedOut ? 'gang-special-path--unavailable' : ''}`} onClick={() => setPreviewPathId(item.id)}><span>{SPECIAL_ICON[item.id] || '★'}</span>{t(`games.gangues.progression.paths.${item.id}`)}</button>
    })}</div>
    {!unlockedPath && <button
      className="gang-special-path-unlock"
      disabled={!canUnlockPath}
      onClick={() => onApply(member, selectGanguesSpecialPath(member, previewPath?.id), {
        cost: GANGUES_SPECIAL_PATH_XP_COST,
        label: t(`games.gangues.progression.paths.${previewPath?.id}`),
      })}
    >{pathRequirementMet ? t('games.gangues.progression.unlock_path', { name: t(`games.gangues.progression.paths.${previewPath?.id}`), n: GANGUES_SPECIAL_PATH_XP_COST }) : t('games.gangues.progression.path_requirement', { n: attributeTotal, required: GANGUES_SPECIAL_PATH_ATTRIBUTE_REQUIREMENT })}</button>}

    {/* ── Poderes ── */}
    <h3 className="gang-progression-section-title">{t('games.gangues.progression.specials')}<span className="gang-progression-loadout">{t('games.gangues.progression.loadout', { n: progression.selected_specials.length })}</span></h3>
    {!unlockedPath && <p className="gang-progression-preview-label">{t('games.gangues.progression.preview')}</p>}
    <div className="gang-skill-grid">{specials.map(special => {
      const level = progression.special_levels[special.id] || 0
      const equipped = progression.selected_specials.includes(special.id)
      const cost = GANGUES_SPECIAL_COSTS[level]
      const purchasable = Boolean(unlockedPath && unlockedPath.id === previewPath?.id)
      const skillName = t(`games.gangues.progression.skills.${special.id}`)
      return (
        <div key={special.id} className={`gang-skill-node ${equipped ? 'gang-skill-node--equipped' : ''} ${level === 0 ? 'gang-skill-node--locked' : ''}`}>
          <div className="gang-skill-node-icon">{SPECIAL_ICON[previewPath?.id] || '★'}</div>
          <strong className="gang-skill-node-name">{skillName}</strong>
          <span className="gang-skill-node-kind">{t(`games.gangues.progression.${special.kind}`)}</span>
          <div className="gang-skill-node-pips">{[0, 1, 2].map(pip => <i key={pip} className={pip < level ? 'gang-skill-pip gang-skill-pip--filled' : 'gang-skill-pip'} />)}</div>
          <div className="gang-skill-node-actions">
            <button
              disabled={!purchasable || !cost || progression.xp_unspent < cost}
              onClick={() => onApply(member, upgradeGanguesSpecial(member, special.id), { cost, label: skillName })}
            >{purchasable && cost ? t('games.gangues.progression.cost_xp', { n: cost }) : t('games.gangues.progression.unlock_path_first')}</button>
            {purchasable && level > 0 && (
              <button
                className="gang-skill-node-toggle"
                disabled={!equipped && progression.selected_specials.length >= 2}
                onClick={() => onApply(member, toggleGanguesSpecial(member, special.id), { cost: 0 })}
              >{t(`games.gangues.progression.${equipped ? 'unequip' : 'equip'}`)}</button>
            )}
          </div>
        </div>
      )
    })}</div>
  </section>
}
