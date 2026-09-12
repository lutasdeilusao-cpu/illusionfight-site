import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { getGanguesCharacter, getGanguesLevelFromXp, getGanguesUnlockedSpecials } from './data/ganguesCharacters.js'
import { getGanguesResources, getGanguesProgression, ganguesXpMaxForSheet } from './data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources } from './data/ganguesEquip.js'
import { getGanguesPortrait } from './data/ganguesPortraits.js'
import GanguesFichaCard from './components/GanguesFichaCard'
import GanguesEquipPanel from './components/GanguesEquipPanel'
import GanguesSkillGrid from './components/GanguesSkillGrid'

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
  const unlocked = getGanguesUnlockedSpecials(character.id, member.xp_total)
  const progression = getGanguesProgression(member)
  // Atributos e recursos já com o equipamento somado — é o que vale em combate,
  // então é o que a ficha tem que mostrar.
  const effAttrs = getGanguesAttributesWithEquip(member.attributes)
  const resources = applyGanguesEquipResources(getGanguesResources(character.combat_path, effAttrs.PV, effAttrs.PM), member.attributes?.equipment)

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
        retrato={getGanguesPortrait(character.slug)}
        atributos={effAttrs}
        pv={{ atual: Math.min(resources.pvMax, member.attributes?.pv_atual ?? resources.pvMax), max: resources.pvMax }}
        pm={{ atual: Math.min(resources.pmMax, member.attributes?.pm_atual ?? resources.pmMax), max: resources.pmMax }}
        xp={{ atual: progression.ap, max: ganguesXpMaxForSheet(member), disponivel: progression.xp_unspent }}
      />
      <GanguesSkillGrid
        character={character}
        unlockedIds={unlocked.map(s => s.id)}
        levelsById={progression.special_levels}
        // NÃO usa progression.selected_specials (getGanguesProgression) aqui —
        // aquele getter filtra pelo sistema de "caminho especial" GENÉRICO
        // (ganguesSpecials.js), que não reconhece os ids dos signature_specials
        // autorados por personagem (ex: soco_de_ferro) e zeraria a seleção.
        // O valor cru salvo na ficha (já validado por toggleGanguesTemplateSpecial
        // / hydrateGanguesTemplateSheet) é a fonte certa pra template.
        selectedIds={Array.isArray(member.attributes?.progression?.selected_specials) ? member.attributes.progression.selected_specials : []}
        onToggle={specialId => store.toggleEspecial(member.id, specialId)}
      />
      <GanguesEquipPanel member={member} />
    </section>
  </main>
}
