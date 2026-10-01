import { useState } from 'react'
import { useLanguage } from '../../../../context/LanguageContext'
import { describeGanguesSpecialEffect, describeGanguesSpecialCost } from '../engine/ganguesSpecialEffects.js'
import { getGanguesSpecialUnlockLevel } from '../data/ganguesCharacters.js'

/* Talentos do personagem, em DUAS partes (Isaias, 30/09/2026: "tá meio
   confuso... você só pode levar dois poderes pra batalha, tem que equipar...
   e tem que explicar o que essas passivas fazem"):
   • LEVA PRA LUTA — a técnica base (vai sempre) + os talentos ATIVOS; o
     jogador equipa até 2 (botão EQUIPAR/TIRAR) e troca antes de cada briga.
   • PASSIVAS — valem em toda luta, não ocupam vaga.
   Cada talento aberto mostra o que faz direto no cartão; tocar abre o detalhe
   (efeito + custo). `selectedIds` + `onToggle` (opcionais) ligam o equipar;
   sem eles a grade fica só leitura. Usada na ficha da cena e na Progressão. */
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
  const ativos = nodes.filter(n => n.kind !== 'passive')
  const passivas = nodes.filter(n => n.kind === 'passive')

  const kindLabel = kind => t(`games.gangues.skill_info.${kind === 'passive' ? 'passiva' : 'ativa'}`)
  const efeito = node => describeGanguesSpecialEffect(t, node.id, levelsById[node.id] || 1)

  const detalhe = aberta && {
    nome: t(`games.gangues.progression.skills.${aberta.id}`),
    kind: kindLabel(aberta.kind),
    efeito: aberta.aberto ? efeito(aberta) : t('games.gangues.skill_info.nivel_req', { n: aberta.nvReq }),
    custo: aberta.aberto && aberta.kind !== 'passive' ? describeGanguesSpecialCost(t, aberta.id, levelsById[aberta.id] || 1) : null,
  }

  const cartao = node => {
    const podeEquipar = editavel && !node.base && node.aberto && node.kind === 'active'
    const equipado = node.base || (podeEquipar && selectedIds.includes(node.id))
    const classe = !node.aberto ? ' gang-skill-node--locked' : node.kind === 'passive' ? ' gang-skill-node--passiva' : equipado ? ' gang-skill-node--equipped' : ''
    return (
      <div key={node.id} className={`gang-skill-node${classe}`}>
        {equipado && <span className="gang-skill-node-badge">{t(node.base ? 'games.gangues.skill_info.sempre' : 'games.gangues.progression.equipped_badge')}</span>}
        <button type="button" className="gang-skill-node-open" onClick={() => setAberta(node)}>
          {!node.base && <span>NV {node.nvReq}</span>}
          <strong className="gang-skill-node-name">{t(`games.gangues.progression.skills.${node.id}`)}</strong>
          <span className="gang-skill-node-kind">{node.aberto ? kindLabel(node.kind) : '🔒'}</span>
          {node.aberto && <small className="gang-skill-node-efeito">{efeito(node)}</small>}
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
  }

  return (
    <div className="gang-skillgrid">
      <h3 className="gang-progression-section-title">
        {t('games.gangues.skill_info.titulo_luta')}
        {editavel && <span className="gang-progression-loadout">{t('games.gangues.progression.loadout', { n: selectedIds.length })}</span>}
      </h3>
      <p className="gang-skillgrid-dica">{t('games.gangues.skill_info.dica_luta')}</p>
      <div className="gang-skill-grid">{ativos.map(cartao)}</div>

      {passivas.length > 0 && (
        <>
          <h3 className="gang-progression-section-title">{t('games.gangues.skill_info.titulo_passivas')}</h3>
          <p className="gang-skillgrid-dica">{t('games.gangues.skill_info.dica_passivas')}</p>
          <div className="gang-skill-grid">{passivas.map(cartao)}</div>
        </>
      )}

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
