import { ST_TODOS, normalizarStatus } from '../../engine/ganguesStatus.js'
import { GANGUES_STATUS } from '../../engine/ganguesStatus.js'
import { Fragment, useState } from 'react'
import { sfx } from '../../../../../lib/sfx'
import { GANGUES_STORY_BATTLE_PARTY_MAX, getGanguesResources } from '../../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources, getGanguesEquip, podeEquiparGangues, caminhoAceitaGangues, nivelMinEquip, nomePeca, normalizeGanguesEquipment, textoBonusEquip } from '../../data/ganguesEquip.js'
import { getGanguesCharacter } from '../../data/ganguesCharacters.js'
import { GANGUES_ITENS_LISTA, textoEfeitoItem } from '../../data/ganguesItens.js'
import { GANGUES_CARTAS_LISTA, nomeCarta, textoCarta } from '../../data/ganguesCartas.js'

// Bolsa da gangue — o que o bando tem de item (consumível + equipamento
// guardado). É a MESMA fonte que a loja abastece e que o combate lê pra usar
// poção (store.inventario / store.equipamentos) — um sistema só.
// A escolha de quem usa/equipa abre logo abaixo do item tocado.
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

const ABA_DO_TIPO = { cura_pv: 'cura', cura_pm: 'cura', cura_status: 'cura', material: 'material' }

export default function GanguesCenaBagSheet({ store, t, onClose }) {
  const [usando, setUsando] = useState(null)     // consumível escolhido pra usar (mostra o picker de personagem)
  const [equipando, setEquipando] = useState(null) // { def } — peça escolhida pra equipar da bolsa
  const [feito, setFeito] = useState(null)       // feedback
  const consumiveis = GANGUES_ITENS_LISTA.map(it => ({ ...it, qtd: store.inventario[it.id] || 0 })).filter(it => it.qtd > 0)
  const pecas = Object.values(store.equipamentos.reduce((acc, eq) => {
    const def = getGanguesEquip(eq.itemId); if (!def) return acc
    const chave = `${eq.itemId}-${eq.encaixe ? 1 : 0}-${eq.aprim || 0}`
    acc[chave] = acc[chave] || { chave, def, peca: eq, qtd: 0 }; acc[chave].qtd++; return acc
  }, {}))
  const cartas = GANGUES_CARTAS_LISTA.filter(c => (store.inventario[c.id] || 0) > 0)
  const vazio = consumiveis.length === 0 && pecas.length === 0 && cartas.length === 0
  // Abas por tipo de item; só aparece aba que tem alguma coisa.
  const grupoDe = it => (ABA_DO_TIPO[it.tipo] || 'luta')
  const doGrupo = g => consumiveis.filter(it => grupoDe(it) === g)
  const abas = [
    ...['cura', 'luta', 'material'].filter(g => doGrupo(g).length),
    ...(pecas.length ? ['equip'] : []),
    ...(cartas.length ? ['cartas'] : []),
  ]
  const [abaEscolhida, setAba] = useState(null)
  const aba = abas.includes(abaEscolhida) ? abaEscolhida : abas[0]
  const listaConsumiveis = ['cura', 'luta', 'material'].includes(aba) ? doGrupo(aba) : []
  // PV/PM atuais de cada ficha do time — pro picker de "usar poção".
  const time = (store.activeParty.length ? store.activeParty : store.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => {
    const attrs = getGanguesAttributesWithEquip(m.attributes)
    const res = applyGanguesEquipResources(getGanguesResources(m.combat_path, attrs?.PV, attrs?.PM), m.attributes?.equipment)
    return {
      id: m.id, nome: m.sheet_name || '?',
      pv: Math.min(res.pvMax, Number(m.attributes?.pv_atual ?? res.pvMax)), pvMax: res.pvMax,
      pm: Math.min(res.pmMax, Number(m.attributes?.pm_atual ?? res.pmMax)), pmMax: res.pmMax,
      statuses: normalizarStatus(m.attributes?.status_atual),
    }
  })
  const podeUsar = it => it.tipo === 'cura_pv' || it.tipo === 'cura_pm' || it.tipo === 'cura_status'
  const temStatus = (m, status) => m.statuses.some(s => status === ST_TODOS || s.id === status)
  const usarEm = (item, memberId) => {
    if (item.tipo === 'cura_status') {
      const nome = time.find(m => m.id === memberId)?.nome || '?'
      if (store.curarStatusMembro(memberId, item.status) > 0) { store.usarItem(item.id); sfx.reward?.(); setFeito(t('games.gangues.bag.status_curado', { nome })) }
      else { sfx.cancel(); setFeito(t('games.gangues.bag.sem_status', { nome })) }
      setUsando(null); setTimeout(() => setFeito(null), 2200)
      return
    }
    const r = store.curarMembro(memberId, item.tipo, item.valor)
    if (r.curou > 0) { store.usarItem(item.id); sfx.reward?.(); setFeito(`${r.nome} +${r.curou} ${r.campo}`) }
    else { sfx.cancel(); setFeito(t('games.gangues.bag.ja_cheio', { nome: r.nome })) }
    setUsando(null); setTimeout(() => setFeito(null), 2200)
  }
  // Time pro picker de equipar (só fichas de template — legado não equipa).
  const timeEquip = (store.activeParty.length ? store.activeParty : store.roster).filter(m => m.character_type === 'template').slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)
  const equiparEm = (def, memberId, peca) => {
    const inst = store.equipamentos.find(eq => eq.itemId === def.id && Boolean(eq.encaixe) === Boolean(peca?.encaixe) && (eq.aprim || 0) === (peca?.aprim || 0))
    const membro = store.roster.find(m => m.id === memberId)
    if (inst && store.equiparItem(memberId, inst.uid)) {
      sfx.select?.()
      setFeito(t('games.gangues.bag.equipou', { nome: membro?.sheet_name || '?', item: nomePeca(t, def, peca), slot: t(`games.gangues.equip.slots.${def.slot}`) }))
    } else sfx.cancel()
    setEquipando(null); setTimeout(() => setFeito(null), 2800)
  }
  return <div className="gang-cena-enc gang-cena-enc--bag">
    <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
    <span className="gang-cena-eyebrow">{t('games.gangues.bag.eyebrow')}</span>
    <h3 className="gang-cena-enc-titulo">{t('games.gangues.bag.titulo')}</h3>
    <p className="gang-cena-enc-sub"><b>💵 {store.grana}　⚑ {store.rep}</b></p>
    {feito && <p className="gang-bag-feito">{feito}</p>}
    {vazio && <p className="gang-cena-enc-sub">{t('games.gangues.bag.vazio')}</p>}
    {abas.length > 1 && <div className="gang-loja-abas" role="tablist">{abas.map(a => (
      <button key={a} role="tab" aria-selected={a === aba} className={`gang-loja-aba${a === aba ? " is-ativa" : ""}`} onClick={() => { sfx.select?.(); setAba(a); setUsando(null); setEquipando(null) }}>{t(`games.gangues.bag.abas.${a}`)}</button>
    ))}</div>}
    {listaConsumiveis.length > 0 && <>
      <div className="gang-bag-lista">{listaConsumiveis.map(it => (
        <Fragment key={it.id}>
        <div className="gang-bag-row">
          <span>{it.icone}</span><strong>{t(it.nome)}<small className="gang-bag-efeito">{textoEfeitoItem(t, it)}</small></strong>
          {podeUsar(it) && time.length > 0 && <button className="gang-bag-usar" onClick={() => setUsando(u => u?.id === it.id ? null : it)}>{t('games.gangues.bag.usar')}</button>}
          <b>×{it.qtd}</b>
        </div>
        {usando?.id === it.id && <div className="gang-bag-alvos">
        <small>{t('games.gangues.bag.usar_em', { item: t(usando.nome) })}</small>
        {time.map(m => {
          const ehStatus = usando.tipo === 'cura_status'
          const cheio = ehStatus ? !temStatus(m, usando.status) : usando.tipo === 'cura_pm' ? m.pm >= m.pmMax : m.pv >= m.pvMax
          return <button key={m.id} className="gang-bag-alvo" disabled={cheio} onClick={() => usarEm(usando, m.id)}>
            <strong>{m.nome}</strong>
            <em>{ehStatus ? (m.statuses.map(s => GANGUES_STATUS[s.id]?.icone).join(' ') || '—') : usando.tipo === 'cura_pm' ? `${m.pm}/${m.pmMax} PM` : `${m.pv}/${m.pvMax} PV`}</em>
          </button>
        })}
        </div>}
        </Fragment>
      ))}</div>
      {aba !== 'material' && <p className="gang-bag-nota">{t('games.gangues.bag.nota_combate')}</p>}
    </>}
    {aba === 'equip' && <>
      <div className="gang-bag-lista">{pecas.map(({ chave, def, peca, qtd }) => (
        <Fragment key={chave}>
        <div className="gang-bag-row">
          <span>{def.icone}</span>
          <strong>{nomePeca(t, def, peca)}<small className="gang-bag-efeito">{textoBonusEquip(t, def, peca?.aprim || 0)}</small></strong>
          <small>{t(`games.gangues.equip.slots.${def.slot}`)}</small>
          {timeEquip.length > 0 && <button className="gang-bag-usar" onClick={() => setEquipando(e => e?.chave === chave ? null : { chave, def, peca })}>{t('games.gangues.equip.equipar')}</button>}
          <b>×{qtd}</b>
        </div>
        {equipando?.chave === chave && <div className="gang-bag-alvos">
        <small>{t('games.gangues.bag.equipar_em', { item: nomePeca(t, equipando.def, equipando.peca), slot: t(`games.gangues.equip.slots.${equipando.def.slot}`) })}</small>
        {timeEquip.map(m => {
          // Quem não pode usar aparece apagado, com o motivo.
          if (!podeEquiparGangues(equipando.def, m)) {
            const motivo = caminhoAceitaGangues(equipando.def, m)
              ? t('games.gangues.equip.nivel_min', { n: nivelMinEquip(equipando.def) })
              : t('games.gangues.equip.so_caminho', { caminho: t(`games.gangues.loadout.paths.${equipando.def.caminho}.name`) })
            return <button key={m.id} className="gang-bag-alvo" disabled><strong>{m.sheet_name || '?'}</strong><em>{motivo}</em></button>
          }
          const { deltas, noSlot, defAtual } = resumoTroca(t, m, equipando.def, equipando.peca)
          const jaEssa = noSlot && noSlot.itemId === equipando.def.id && (noSlot.aprim || 0) === (equipando.peca?.aprim || 0)
          return <button key={m.id} className="gang-bag-alvo" disabled={jaEssa} onClick={() => equiparEm(equipando.def, m.id, equipando.peca)}>
            <strong>{m.sheet_name || '?'}</strong>
            <em>{jaEssa ? t('games.gangues.bag.ja_equipado') : defAtual ? `↺ ${nomePeca(t, defAtual, noSlot)}` : t('games.gangues.equip.vazio')}</em>
            {defAtual && !jaEssa && <small className="gang-bag-alvo__agora">{t('games.gangues.bag.usa_agora', { bonus: textoBonusEquip(t, defAtual, noSlot.aprim || 0) || '—' })}</small>}
            {!jaEssa && <span className="gang-loja-cmp__deltas">
              {deltas.length ? deltas.map(([label, de, para]) => (
                <span key={label}>{label} <b>{de}</b>→<b className={para > de ? 'is-up' : 'is-down'}>{para}</b></span>
              )) : <span>{t('games.gangues.bag.sem_mudanca')}</span>}
            </span>}
          </button>
        })}
        </div>}
        </Fragment>
      ))}</div>
      <p className="gang-bag-nota">{t('games.gangues.bag.nota_equip')}</p>
    </>}
    {aba === 'cartas' && <>
      <div className="gang-bag-lista">{cartas.map(c => (
        <div key={c.id} className="gang-bag-row">
          <span>🃏</span>
          <strong>{nomeCarta(t, c)}<small className="gang-bag-efeito">{t(`games.gangues.equip.slots.${c.slot}`)} · {textoCarta(t, c)}</small></strong>
          <b>×{store.inventario[c.id]}</b>
        </div>
      ))}</div>
      <p className="gang-bag-nota">{t('games.gangues.bag.nota_cartas')}</p>
    </>}
    <div className="gang-cena-enc-acoes"><button className="gang-cena-btn gang-cena-btn--go" onClick={onClose}>{t('games.gangues.cena.fechar')}</button></div>
  </div>
}
