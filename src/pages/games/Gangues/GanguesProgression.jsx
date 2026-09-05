import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { getGanguesCharacter, getGanguesLevelFromXp, getGanguesNextLevel, getGanguesUnlockedSpecials } from './data/ganguesCharacters.js'

export default function GanguesProgression({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const member = store.roster.find(item => item.id === store.progressionTargetId) || null

  const voltar = () => {
    store.setProgressionTarget(null)
    const action = store.posVitoriaAcao
    store.setPosVitoriaAcao(null)
    if (action) action()
    else onNavigate('lobby')
  }

  if (!member) return <main className="gang-lobby gang-progression-screen"><p className="gang-lobby-empty">{t('games.gangues.progression.no_member')}</p><button className="gang-new-sheet gang-new-sheet--back" onClick={voltar}>{t('games.gangues.progression.back_to_roster')}</button></main>
  if (member.character_type !== 'template') return <main className="gang-lobby gang-progression-screen"><button className="gang-progression-screen-back" onClick={voltar}>← {t('games.gangues.progression.back_to_roster')}</button><p className="gang-lobby-empty">{t('games.gangues.progression.no_member')}</p></main>

  const character = getGanguesCharacter(member.character_template_id)
  const level = getGanguesLevelFromXp(member.xp_total)
  const next = getGanguesNextLevel(character.id, member.xp_total)
  const unlocked = getGanguesUnlockedSpecials(character.id, member.xp_total)
  const ap = member.attributes?.progression?.ap || 0

  return <main className="gang-lobby gang-progression-screen">
    <header className="gang-progression-screen-head">
      <button className="gang-progression-screen-back" onClick={voltar}>← {t('games.gangues.progression.back_to_roster')}</button>
      <div className="gang-progression-screen-xp"><span className="gang-progression-screen-xp-num">{level}</span><span>NV</span></div>
    </header>
    <section className="gang-progression-panel">
      <div className="gang-progression-ident"><div className={`gang-progression-avatar gang-path--${character.combat_path}`}>{character.name[0]}</div><div><h2>{character.name}</h2><p>{t(`games.gangues.loadout.paths.${character.combat_path}.name`)} · {t(`games.gangues.progression.paths.${character.special_path}`)}</p></div></div>
      <div className="gang-progression-ap"><span>{t('games.gangues.progression.ap', { n: ap })}</span><progress className="gang-progression-ap-bar" max="10" value={ap} /></div>
      <h3 className="gang-progression-section-title">{t('games.gangues.progression.attributes')}</h3>
      <div className="gang-attr-steppers">{['A', 'H', 'R', 'D'].map(attribute => <div className="gang-attr-stepper" key={attribute}><span className="gang-attr-stepper-letter">{attribute}</span><span className="gang-attr-stepper-name">{t(`games.gangues.attr_labels.${attribute}`)}</span><strong>{member.attributes[attribute]}</strong></div>)}</div>
      <h3 className="gang-progression-section-title">{t('games.gangues.progression.specials')}</h3>
      <div className="gang-skill-grid">
        <div className="gang-skill-node gang-skill-node--equipped"><strong className="gang-skill-node-name">{t(`games.gangues.progression.skills.${character.base_technique.id}`)}</strong><span className="gang-skill-node-kind">3 PM</span></div>
        {character.signature_specials.map((special, index) => {
          const open = unlocked.some(item => item.id === special.id)
          return <div key={special.id} className={`gang-skill-node${open ? ' gang-skill-node--equipped' : ' gang-skill-node--locked'}`}><span>NV {3 + index * 2}</span><strong className="gang-skill-node-name">{t(`games.gangues.progression.skills.${special.id}`)}</strong><span className="gang-skill-node-kind">{open ? t(`games.gangues.progression.${special.kind}`) : '🔒'}</span></div>
        })}
      </div>
      {next && <div className="gang-character-technique"><strong>NV {next.level}</strong><span>{next.events.map(event => event.attribute ? `+${event.delta} ${event.attribute}` : t(`games.gangues.progression.skills.${event.id}`)).join(' · ')}</span></div>}
    </section>
  </main>
}
