import { useState } from 'react'
import { sfx } from '../../../../../lib/sfx'
import { GANGUES_STORY_BATTLE_PARTY_MAX, getGanguesResources } from '../../data/ganguesLoadout.js'
import { getGanguesCharacter, getGanguesLevelFromXp } from '../../data/ganguesCharacters.js'
import { getGanguesPortraitByTemplateId } from '../../data/ganguesPortraits.js'
import {
  getGanguesAttributesWithEquip, applyGanguesEquipResources, getGanguesEquip, podeEquiparGangues,
  caminhoAceitaGangues, nivelMinEquip, nomePeca, normalizeGanguesEquipment, textoBonusEquip,
} from '../../data/ganguesEquip.js'
import GanguesRetratoImg from '../GanguesRetratoImg'

// Aba Equipamento da bolsa: filtra por lugar do corpo, lista as peças numa
// linha cada, e tocar numa peça abre o detalhe com o "em quem?" comparando a
// ficha de cada um antes e depois.

const SLOTS = ['arma', 'cabeca', 'corpo', 'bracos', 'pes', 'amuleto']
const ATTRS_TROCA = ['A', 'H', 'D', 'PM']

/** Como a ficha de `member` fica se ele vestir esta peça (com o aprimoramento
 *  dela): o que ele usa agora no lugar e cada número que muda. */
function resumoTroca(t, member, def, peca) {
  const ch = getGanguesCharacter(member.character_template_id)
  const eqAtual = normalizeGanguesEquipment(member.attributes?.equipment)
  const noSlot = eqAtual[def.slot]
  const defAtual = noSlot && getGanguesEquip(noSlot.itemId)
  if (!ch) return { deltas: [], noSlot, defAtual }
  const eqNovo = { ...eqAtual, [def.slot]: { itemId: def.id, encaixe: Boolean(peca?.encaixe), cards: [], aprim: peca?.aprim || 0 } }
  const atual = getGanguesAttributesWithEquip(member.attributes)
  const novo = getGanguesAttributesWithEquip({ ...member.attributes, equipment: eqNovo })
  const rA = applyGanguesEquipResources(getGanguesResources(ch.combat_path, atual.PV, atual.PM), eqAtual)
  const rN = applyGanguesEquipResources(getGanguesResources(ch.combat_path, novo.PV, novo.PM), eqNovo)
  const deltas = ATTRS_TROCA.filter(a => novo[a] !== atual[a]).map(a => [t(`games.gangues.attr_labels.${a}`), atual[a], novo[a]])
  if (rN.pvMax !== rA.pvMax) deltas.push(['PV', rA.pvMax, rN.pvMax])
  if (rN.pmMax !== rA.pmMax) deltas.push(['PM', rA.pmMax, rN.pmMax])
  return { deltas, noSlot, defAtual }
}

/** Um personagem no "quem veste?" (bolsa e loja): quem é, o que usa hoje, o
 *  que muda na ficha e o botão. `acao` = { label, preco?, semGrana?, onClick }. */
export function Candidato({ t, member, def, peca, acao }) {
  const nivel = getGanguesLevelFromXp(member.xp_total)
  const pode = podeEquiparGangues(def, member)
  const { deltas, noSlot, defAtual } = resumoTroca(t, member, def, peca)
  const jaEssa = noSlot && noSlot.itemId === def.id && (noSlot.aprim || 0) === (peca?.aprim || 0)
  const motivo = !pode
    ? (caminhoAceitaGangues(def, member)
      ? t('games.gangues.equip.nivel_min', { n: nivelMinEquip(def) })
      : t('games.gangues.equip.so_caminho', { caminho: t(`games.gangues.loadout.paths.${def.caminho}.name`) }))
    : jaEssa ? t('games.gangues.bag.ja_equipado') : null
  return (
    <div className={`gang-bagq-cand${motivo ? ' is-off' : ''}`}>
      <GanguesRetratoImg className="gang-bagq-cand__foto" src={getGanguesPortraitByTemplateId(member.character_template_id)} fallback={<span className="gang-bagq-cand__foto">{(member.sheet_name || '?')[0]}</span>} />
      <div className="gang-bagq-cand__info">
        <strong>{member.sheet_name || '?'} <small>NV {nivel}</small></strong>
        <small className="gang-bagq-cand__agora">
          {defAtual ? <>{defAtual.icone} {nomePeca(t, defAtual, noSlot)} · {textoBonusEquip(t, defAtual, noSlot.aprim || 0) || '—'}</> : t('games.gangues.bag.slot_vazio')}
        </small>
        {!motivo && <span className="gang-troca-deltas">
          {deltas.length ? deltas.map(([label, de, para]) => (
            <span key={label}>{label} <b>{de}</b>→<b className={para > de ? 'is-up' : 'is-down'}>{para}</b></span>
          )) : <span>{t('games.gangues.bag.sem_mudanca')}</span>}
        </span>}
      </div>
      {motivo
        ? <em className="gang-bagq-cand__motivo">{motivo}</em>
        : <button className="gang-bagq-cand__btn" disabled={acao.semGrana} onClick={() => acao.onClick(member.id)}>
          {acao.label}{acao.preco != null && <b>💵 {acao.preco}</b>}
        </button>}
    </div>
  )
}

export default function GanguesBagEquip({ store, t, onFeito }) {
  const [slot, setSlot] = useState('todos')
  const [aberta, setAberta] = useState(null) // chave da peça com o detalhe aberto
  const pecas = Object.values(store.equipamentos.reduce((acc, eq) => {
    const def = getGanguesEquip(eq.itemId); if (!def) return acc
    const chave = `${eq.itemId}-${eq.encaixe ? 1 : 0}-${eq.aprim || 0}`
    acc[chave] = acc[chave] || { chave, def, peca: eq, qtd: 0 }; acc[chave].qtd++; return acc
  }, {})).sort((a, b) => SLOTS.indexOf(a.def.slot) - SLOTS.indexOf(b.def.slot) || nivelMinEquip(b.def) - nivelMinEquip(a.def))
  const porSlot = Object.fromEntries(SLOTS.map(s => [s, pecas.filter(p => p.def.slot === s).reduce((n, p) => n + p.qtd, 0)]))
  const lista = slot === 'todos' ? pecas : pecas.filter(p => p.def.slot === slot)
  const time = (store.activeParty.length ? store.activeParty : store.roster).filter(m => m.character_type === 'template').slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)

  const equiparEm = ({ def, peca }, memberId) => {
    const inst = store.equipamentos.find(eq => eq.itemId === def.id && Boolean(eq.encaixe) === Boolean(peca?.encaixe) && (eq.aprim || 0) === (peca?.aprim || 0))
    const membro = store.roster.find(m => m.id === memberId)
    if (inst && store.equiparItem(memberId, inst.uid)) {
      sfx.select?.()
      onFeito(t('games.gangues.bag.equipou', { nome: membro?.sheet_name || '?', item: nomePeca(t, def, peca), slot: t(`games.gangues.equip.slots.${def.slot}`) }))
      setAberta(null)
    } else sfx.cancel()
  }

  return <>
    <div className="gang-bagq-slots" role="tablist">
      {['todos', ...SLOTS.filter(s => porSlot[s])].map(s => (
        <button key={s} role="tab" aria-selected={s === slot} className={`gang-bagq-slot${s === slot ? ' is-ativa' : ''}`}
          onClick={() => { sfx.select?.(); setSlot(s); setAberta(null) }}>
          {s === 'todos' ? t('games.gangues.bag.todos') : t(`games.gangues.equip.slots.${s}`)}
          <b>{s === 'todos' ? pecas.reduce((n, p) => n + p.qtd, 0) : porSlot[s]}</b>
        </button>
      ))}
    </div>
    <div className="gang-bag-lista">{lista.map(item => {
      const { chave, def, peca, qtd } = item
      const aberto = aberta === chave
      return <div key={chave} className={`gang-bagq-peca${aberto ? ' is-aberta' : ''}`}>
        <button className="gang-bagq-peca__linha" aria-expanded={aberto} onClick={() => { sfx.select?.(); setAberta(aberto ? null : chave) }}>
          <span className="gang-bagq-peca__icone">{def.icone}</span>
          <span className="gang-bagq-peca__nome">
            <strong>{nomePeca(t, def, peca)}</strong>
            <small>{textoBonusEquip(t, def, peca?.aprim || 0) || '—'}</small>
          </span>
          <span className="gang-bagq-peca__qtd">×{qtd}</span>
          <span className="gang-bagq-peca__seta">{aberto ? '▴' : '▾'}</span>
        </button>
        {aberto && <div className="gang-bagq-det">
          <p className="gang-bagq-det__tags">
            {t(`games.gangues.equip.slots.${def.slot}`)} · {t(`games.gangues.equip.raridade.${def.raridade}`)} · {def.caminho === 'livre' ? t('games.gangues.equip.qualquer_caminho') : t('games.gangues.equip.so_caminho', { caminho: t(`games.gangues.loadout.paths.${def.caminho}.name`) })} · {t('games.gangues.equip.nivel_min', { n: nivelMinEquip(def) })}
          </p>
          <small className="gang-bagq-det__quem">{t('games.gangues.bag.quem_usa')}</small>
          {time.map(m => <Candidato key={m.id} t={t} member={m} def={def} peca={peca} acao={{ label: t('games.gangues.equip.equipar'), onClick: id => equiparEm(item, id) }} />)}
        </div>}
      </div>
    })}</div>
    <p className="gang-bag-nota">{t('games.gangues.bag.nota_equip')}</p>
  </>
}
