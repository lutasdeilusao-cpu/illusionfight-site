import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { getGanguesCharacter, getGanguesLevelFromXp, getGanguesNextLevel, getGanguesUnlockedSpecials } from './data/ganguesCharacters.js'
import { getGanguesResources, getGanguesProgression } from './data/ganguesLoadout.js'
import GanguesFichaCard from './components/GanguesFichaCard'

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
  const progression = getGanguesProgression(member)
  const resources = getGanguesResources(character.combat_path, member.attributes?.R)

  return <main className="gang-lobby gang-progression-screen">
    <header className="gang-progression-screen-head">
      <button className="gang-progression-screen-back" onClick={voltar}>← {t('games.gangues.progression.back_to_roster')}</button>
    </header>
    <section className="gang-progression-panel">
      <GanguesFichaCard
        nome={character.name}
        caminho={character.combat_path}
        subcaminho={`${t(`games.gangues.loadout.paths.${character.combat_path}.name`)} · ${t(`games.gangues.progression.paths.${character.special_path}`)}`}
        nivel={level}
        atributos={member.attributes}
        pv={{ max: resources.pvMax }}
        pm={{ max: resources.pmMax }}
        xp={{ atual: progression.ap, max: 10, disponivel: progression.xp_unspent }}
      />
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
