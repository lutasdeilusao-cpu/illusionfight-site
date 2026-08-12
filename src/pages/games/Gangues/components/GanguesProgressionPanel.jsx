import { useLanguage } from '../../../../context/LanguageContext'
import { GANGUES_ATTRIBUTE_XP_COSTS, GANGUES_SPECIAL_COSTS, getGanguesProgression, selectGanguesSpecialPath, toggleGanguesSpecial, upgradeGanguesAttribute, upgradeGanguesSpecial } from '../data/ganguesLoadout.js'
import { getGanguesSpecialPath, getGanguesSpecialPaths } from '../data/ganguesSpecials.js'

const SPECIAL_ICON = { atacante: '⚔', muralha: '▰', guardiao: '◇', provocador: '!', reativo: '↯', resiliente: '✚', igneo: '♨', aquatico: '≋', terreno: '◆', tempestade: 'ϟ', ilusorio: '◉' }

export default function GanguesProgressionPanel({ member, onApply }) {
  const { t } = useLanguage()
  const progression = getGanguesProgression(member)
  const paths = getGanguesSpecialPaths(member.combat_path)
  const currentPath = getGanguesSpecialPath(member.combat_path, progression.special_path)
  const specials = currentPath?.specials || []

  return <section className={`gang-progression gang-progression--${member.combat_path}`}>
    <div className="gang-progression-header"><span className={`gang-progression-avatar gang-path--${member.combat_path}`}>{member.sheet_name[0].toUpperCase()}</span><div className="gang-progression-headline"><h2>{t('games.gangues.progression.title')}</h2><p>{member.sheet_name} · {t(`games.gangues.loadout.paths.${member.combat_path}.name`)}</p></div></div>
    <div className="gang-progression-stats"><div className="gang-progression-ap"><span>{t('games.gangues.progression.ap', { n: progression.ap })}</span><progress className="gang-progression-ap-bar" max="10" value={progression.ap} /></div><div className="gang-progression-xp">✦ {t('games.gangues.progression.xp_available', { n: progression.xp_unspent })}</div></div>
    <h3 className="gang-progression-section-title">{t('games.gangues.progression.attributes')}</h3>
    <div className="gang-attr-upgrade-grid">{['A', 'H', 'R', 'D'].map(attribute => { const value = member.attributes?.[attribute] || 0; const cost = GANGUES_ATTRIBUTE_XP_COSTS[value]; return <button key={attribute} className="gang-attr-upgrade-card" disabled={!cost || progression.xp_unspent < cost} onClick={() => onApply(member, upgradeGanguesAttribute(member, attribute))}><span className="gang-attr-upgrade-letter">{attribute}</span><span className="gang-attr-upgrade-values">{value} <b>→</b> {value + 1}</span><span className="gang-attr-upgrade-cost">{cost ? t('games.gangues.progression.upgrade', { n: cost }) : '—'}</span></button> })}</div>
    <h3 className="gang-progression-section-title">{t('games.gangues.progression.special_path')}</h3>
    <div className="gang-special-paths" role="group" aria-label={t('games.gangues.progression.special_path')}>{paths.map(item => <button key={item.id} className={item.id === currentPath?.id ? 'gang-special-path gang-special-path--selected' : 'gang-special-path'} onClick={() => onApply(member, selectGanguesSpecialPath(member, item.id))}><span>{SPECIAL_ICON[item.id] || '★'}</span>{t(`games.gangues.progression.paths.${item.id}`)}</button>)}</div>
    <h3 className="gang-progression-section-title">{t('games.gangues.progression.specials')}<span className="gang-progression-loadout">{t('games.gangues.progression.loadout', { n: progression.selected_specials.length })}</span></h3>
    <div className="gang-skill-grid">{specials.map(special => { const level = progression.special_levels[special.id] || 0; const equipped = progression.selected_specials.includes(special.id); const cost = GANGUES_SPECIAL_COSTS[level]; return <div key={special.id} className={`gang-skill-node ${equipped ? 'gang-skill-node--equipped' : ''} ${level === 0 ? 'gang-skill-node--locked' : ''}`}><div className="gang-skill-node-icon">{SPECIAL_ICON[currentPath?.id] || '★'}</div><strong className="gang-skill-node-name">{t(`games.gangues.progression.skills.${special.id}`)}</strong><span className="gang-skill-node-kind">{t(`games.gangues.progression.${special.kind}`)}</span><div className="gang-skill-node-pips">{[0, 1, 2].map(pip => <i key={pip} className={pip < level ? 'gang-skill-pip gang-skill-pip--filled' : 'gang-skill-pip'} />)}</div><div className="gang-skill-node-actions"><button disabled={!cost || progression.xp_unspent < cost} onClick={() => onApply(member, upgradeGanguesSpecial(member, special.id))}>{cost ? t('games.gangues.progression.upgrade', { n: cost }) : '—'}</button>{level > 0 && <button className="gang-skill-node-toggle" disabled={!equipped && progression.selected_specials.length >= 2} onClick={() => onApply(member, toggleGanguesSpecial(member, special.id))}>{t(`games.gangues.progression.${equipped ? 'unequip' : 'equip'}`)}</button>}</div></div> })}</div>
  </section>
}
