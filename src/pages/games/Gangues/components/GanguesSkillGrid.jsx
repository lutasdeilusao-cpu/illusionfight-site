import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { describeGanguesSpecialEffect, describeGanguesSpecialCost } from '../engine/ganguesSpecialEffects.js'

/* Grade de poderes do personagem (técnica base + 5 assinaturas), com toque
   pra abrir o que cada um FAZ. Usada na ficha da cena (Pista) e na tela de
   progressão — uma fonte só. `unlockedIds` = ids já abertos pelo nível;
   `levelsById` = nível de cada poder (special_levels da progressão). */
export default function GanguesSkillGrid({ character, unlockedIds = [], levelsById = {} }) {
  const { t } = useLanguage()
  const [aberta, setAberta] = useState(null)

  if (!character?.base_technique) return null

  const nodes = [
    { id: character.base_technique.id, kind: 'active', nvReq: 1, aberto: true, base: true },
    ...character.signature_specials.map((special, i) => ({
      id: special.id, kind: special.kind, nvReq: 3 + i * 2, aberto: unlockedIds.includes(special.id),
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
      <h3 className="gang-progression-section-title">{t('games.gangues.skill_info.titulo')}</h3>
      <div className="gang-skill-grid">
        {nodes.map(node => (
          <button
            key={node.id}
            type="button"
            className={`gang-skill-node${node.aberto ? ' gang-skill-node--equipped' : ' gang-skill-node--locked'}`}
            onClick={() => setAberta(node)}
          >
            {!node.base && <span>NV {node.nvReq}</span>}
            <strong className="gang-skill-node-name">{t(`games.gangues.progression.skills.${node.id}`)}</strong>
            <span className="gang-skill-node-kind">{node.aberto ? kindLabel(node.kind) : '🔒'}</span>
          </button>
        ))}
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
