import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { describeGanguesSpecialEffect, describeGanguesSpecialCost } from '../engine/ganguesSpecialEffects.js'
import { getGanguesSpecialUnlockLevel } from '../data/ganguesCharacters.js'

/* Grade de poderes do personagem (técnica base + 5 assinaturas), com toque
   pra abrir o que cada um FAZ. Usada na ficha da cena (Pista) e na tela de
   progressão — uma fonte só. `unlockedIds` = ids já abertos pelo nível;
   `levelsById` = nível de cada poder (special_levels da progressão).
   `selectedIds` + `onToggle` (opcionais): quando vêm preenchidos, cada poder
   ATIVO desbloqueado ganha um botão EQUIPAR/DESEQUIPAR (máx. 2 selecionados
   por vez — o jogador escolhe quais 2 leva pra batalha). Sem eles a grade
   fica só leitura, do jeito que já era. */
export default function GanguesSkillGrid({ character, unlockedIds = [], levelsById = {}, selectedIds = null, onToggle = null }) {
  const { t } = useLanguage()
  const [aberta, setAberta] = useState(null)

  if (!character?.base_technique) return null

  const editavel = Array.isArray(selectedIds) && typeof onToggle === 'function'

  const nodes = [
    { id: character.base_technique.id, kind: 'active', nvReq: 1, aberto: true, base: true },
    ...character.signature_specials.map((special) => ({
      id: special.id, kind: special.kind,
      nvReq: getGanguesSpecialUnlockLevel(character, special.id) || '—',
      aberto: unlockedIds.includes(special.id),
    })),
  ]

  const kindLabel = kind => t(`games.gangues.skill_info.${kind === 'passive' ? 'passiva' : 'ativa'}`)

  const detalhe = aberta && (() => {
    const lvl = levelsById[aberta.id] || 1
    return {
      nome: t(`games.gangues.progression.skills.${aberta.id}`),
      kind: kindLabel(aberta.kind),
      efeito: aberta.aberto
        ? describeGanguesSpecialEffect(t, aberta.id, lvl)
        : t('games.gangues.skill_info.nivel_req', { n: aberta.nvReq }),
      custo: aberta.aberto && aberta.kind !== 'passive' ? describeGanguesSpecialCost(t, aberta.id, lvl) : null,
    }
  })()

  return (
    <div className="gang-skillgrid">
      <h3 className="gang-progression-section-title">
        {t('games.gangues.skill_info.titulo')}
        {editavel && <span className="gang-progression-loadout">{t('games.gangues.progression.loadout', { n: selectedIds.length })}</span>}
      </h3>
      <div className="gang-skill-grid">
        {nodes.map(node => {
          const podeEquipar = editavel && !node.base && node.aberto && node.kind === 'active'
          const equipado = podeEquipar && selectedIds.includes(node.id)
          return (
            <div key={node.id} className={`gang-skill-node${node.aberto ? ' gang-skill-node--equipped' : ' gang-skill-node--locked'}`}>
              {equipado && <span className="gang-skill-node-badge">{t('games.gangues.progression.equipped_badge')}</span>}
              <button type="button" className="gang-skill-node-open" onClick={() => setAberta(node)}>
                {!node.base && <span>NV {node.nvReq}</span>}
                <strong className="gang-skill-node-name">{t(`games.gangues.progression.skills.${node.id}`)}</strong>
                <span className="gang-skill-node-kind">{node.aberto ? kindLabel(node.kind) : '🔒'}</span>
              </button>
              {podeEquipar && (
                <div className="gang-skill-node-actions">
                  <button
                    type="button"
                    className="gang-skill-node-toggle"
                    disabled={!equipado && selectedIds.length >= 2}
                    onClick={() => onToggle(node.id)}
                  >{t(`games.gangues.progression.${equipado ? 'unequip' : 'equip'}`)}</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {detalhe && (
        <div className="gang-skill-sheet" role="dialog" aria-modal="true">
          <button className="gang-skill-sheet__scrim" onClick={() => setAberta(null)} aria-label={t('games.gangues.cena.fechar')} />
          <div className="gang-skill-sheet__card">
            <button className="gang-skill-sheet__x" onClick={() => setAberta(null)} aria-label={t('games.gangues.cena.fechar')}>×</button>
            <span className="gang-skill-sheet__kind">{detalhe.kind}</span>
            <strong className="gang-skill-sheet__nome">{detalhe.nome}</strong>
            <p className="gang-skill-sheet__efeito">{detalhe.efeito}</p>
            {detalhe.custo && <p className="gang-skill-sheet__custo">{detalhe.custo}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
