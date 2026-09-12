import { getGanguesResources, getGanguesProgression, ganguesXpMaxForSheet } from '../../data/ganguesLoadout.js'
import { getGanguesCharacter, getGanguesLevelFromXp, getGanguesUnlockedSpecials } from '../../data/ganguesCharacters.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources } from '../../data/ganguesEquip.js'
import { getGanguesPortrait } from '../../data/ganguesPortraits.js'
import GanguesFichaCard from '../GanguesFichaCard'
import GanguesEquipPanel from '../GanguesEquipPanel'
import GanguesSkillGrid from '../GanguesSkillGrid'

// Mesma leitura de dados que GanguesProgression.jsx usa pra montar a ficha —
// aqui a grade de poderes JÁ VEM EDITÁVEL também (pedido do Isaias: trocar o
// poder levado pra batalha direto daqui, sem ter que voltar pro lobby só pra
// isso). `onToggleEspecial` = store.toggleEspecial, injetado pelo caller.
// Extraído de GanguesCena.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
export default function GanguesCenaFichaCard({ member, t, onToggleEspecial }) {
  if (member.character_type !== 'template') return null
  const character = getGanguesCharacter(member.character_template_id)
  const level = getGanguesLevelFromXp(member.xp_total)
  const progression = getGanguesProgression(member)
  const effAttrs = getGanguesAttributesWithEquip(member.attributes)
  const resources = applyGanguesEquipResources(getGanguesResources(character.combat_path, effAttrs.PV, effAttrs.PM), member.attributes?.equipment)
  return <>
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
      unlockedIds={getGanguesUnlockedSpecials(character.id, member.xp_total).map(s => s.id)}
      levelsById={progression.special_levels}
      // Raw da ficha, não getGanguesProgression().selected_specials — ver
      // comentário igual em GanguesProgression.jsx (filtro incompatível com
      // os ids autorados por personagem).
      selectedIds={Array.isArray(member.attributes?.progression?.selected_specials) ? member.attributes.progression.selected_specials : []}
      onToggle={onToggleEspecial ? (specialId => onToggleEspecial(member.id, specialId)) : null}
    />
    <GanguesEquipPanel member={member} />
  </>
}
