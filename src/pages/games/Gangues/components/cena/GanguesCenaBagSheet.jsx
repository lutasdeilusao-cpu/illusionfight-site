import { useState } from 'react'
import { sfx } from '../../../../../lib/sfx'
import { GANGUES_STORY_BATTLE_PARTY_MAX, getGanguesResources } from '../../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources, getGanguesEquip } from '../../data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA } from '../../data/ganguesItens.js'

// Bolsa da gangue — o que o bando tem de item (consumível + equipamento
// guardado). É a MESMA fonte que a loja abastece e que o combate lê pra usar
// poção (store.inventario / store.equipamentos) — um sistema só.
// Extraído de GanguesCena.jsx (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §5).
export default function GanguesCenaBagSheet({ store, t, onClose }) {
  const [usando, setUsando] = useState(null)     // consumível escolhido pra usar (mostra o picker de personagem)
  const [equipando, setEquipando] = useState(null) // { def } — peça escolhida pra equipar da bolsa
  const [feito, setFeito] = useState(null)       // feedback
  const consumiveis = GANGUES_ITENS_LISTA.map(it => ({ ...it, qtd: store.inventario[it.id] || 0 })).filter(it => it.qtd > 0)
  const pecas = Object.values(store.equipamentos.reduce((acc, eq) => {
    const def = getGanguesEquip(eq.itemId); if (!def) return acc
    acc[eq.itemId] = acc[eq.itemId] || { def, qtd: 0 }; acc[eq.itemId].qtd++; return acc
  }, {}))
  const vazio = consumiveis.length === 0 && pecas.length === 0
  // PV/PM atuais de cada ficha do time — pro picker de "usar poção".
  const time = (store.activeParty.length ? store.activeParty : store.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => {
    const attrs = getGanguesAttributesWithEquip(m.attributes)
    const res = applyGanguesEquipResources(getGanguesResources(m.combat_path, attrs?.PV, attrs?.PM), m.attributes?.equipment)
    return {
      id: m.id, nome: m.sheet_name || '?',
      pv: Math.min(res.pvMax, Number(m.attributes?.pv_atual ?? res.pvMax)), pvMax: res.pvMax,
      pm: Math.min(res.pmMax, Number(m.attributes?.pm_atual ?? res.pmMax)), pmMax: res.pmMax,
    }
  })
  const podeUsar = it => it.tipo === 'cura_pv' || it.tipo === 'cura_pm'
  const usarEm = (item, memberId) => {
    const r = store.curarMembro(memberId, item.tipo, item.valor)
    if (r.curou > 0) { store.usarItem(item.id); sfx.reward?.(); setFeito(`${r.nome} +${r.curou} ${r.campo}`) }
    else { sfx.cancel(); setFeito(t('games.gangues.bag.ja_cheio', { nome: r.nome })) }
    setUsando(null); setTimeout(() => setFeito(null), 2200)
  }
  // Time pro picker de equipar (só fichas de template — legado não equipa).
  const timeEquip = (store.activeParty.length ? store.activeParty : store.roster).filter(m => m.character_type === 'template').slice(0, GANGUES_STORY_BATTLE_PARTY_MAX)
  const equiparEm = (def, memberId) => {
    const inst = store.equipamentos.find(eq => eq.itemId === def.id)
    const membro = store.roster.find(m => m.id === memberId)
    if (inst && store.equiparItem(memberId, inst.uid)) {
      sfx.select?.()
      setFeito(t('games.gangues.bag.equipou', { nome: membro?.sheet_name || '?', item: t(def.nome), slot: t(`games.gangues.equip.slots.${def.slot}`) }))
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
    {consumiveis.length > 0 && <>
      <small className="gang-bag-sec">{t('games.gangues.bag.consumiveis')}</small>
      <div className="gang-bag-lista">{consumiveis.map(it => (
        <div key={it.id} className="gang-bag-row">
          <span>{it.icone}</span><strong>{t(it.nome)}</strong>
          {podeUsar(it) && time.length > 0 && <button className="gang-bag-usar" onClick={() => setUsando(u => u?.id === it.id ? null : it)}>{t('games.gangues.bag.usar')}</button>}
          <b>×{it.qtd}</b>
        </div>
      ))}</div>
      {usando && <div className="gang-bag-alvos">
        <small>{t('games.gangues.bag.usar_em', { item: t(usando.nome) })}</small>
        {time.map(m => {
          const cheio = usando.tipo === 'cura_pm' ? m.pm >= m.pmMax : m.pv >= m.pvMax
          return <button key={m.id} className="gang-bag-alvo" disabled={cheio} onClick={() => usarEm(usando, m.id)}>
            <strong>{m.nome}</strong>
            <em>{usando.tipo === 'cura_pm' ? `${m.pm}/${m.pmMax} PM` : `${m.pv}/${m.pvMax} PV`}</em>
          </button>
        })}
      </div>}
      <p className="gang-bag-nota">{t('games.gangues.bag.nota_combate')}</p>
    </>}
    {pecas.length > 0 && <>
      <small className="gang-bag-sec">{t('games.gangues.bag.equip_bolso')}</small>
      <div className="gang-bag-lista">{pecas.map(({ def, qtd }) => (
        <div key={def.id} className="gang-bag-row">
          <span>{def.icone}</span>
          <strong>{t(def.nome)}</strong>
          <small>{t(`games.gangues.equip.slots.${def.slot}`)}</small>
          {timeEquip.length > 0 && <button className="gang-bag-usar" onClick={() => setEquipando(e => e?.def?.id === def.id ? null : { def })}>{t('games.gangues.equip.equipar')}</button>}
          <b>×{qtd}</b>
        </div>
      ))}</div>
      {equipando && <div className="gang-bag-alvos">
        <small>{t('games.gangues.bag.equipar_em', { item: t(equipando.def.nome), slot: t(`games.gangues.equip.slots.${equipando.def.slot}`) })}</small>
        {timeEquip.map(m => {
          const noSlot = m.attributes?.equipment?.[equipando.def.slot]
          const defAtual = noSlot && getGanguesEquip(noSlot.itemId)
          const jaEssa = noSlot && noSlot.itemId === equipando.def.id
          return <button key={m.id} className="gang-bag-alvo" disabled={jaEssa} onClick={() => equiparEm(equipando.def, m.id)}>
            <strong>{m.sheet_name || '?'}</strong>
            <em>{jaEssa ? t('games.gangues.bag.ja_equipado') : defAtual ? `↺ ${t(defAtual.nome)}` : t('games.gangues.equip.vazio')}</em>
          </button>
        })}
      </div>}
      <p className="gang-bag-nota">{t('games.gangues.bag.nota_equip')}</p>
    </>}
    <div className="gang-cena-enc-acoes"><button className="gang-cena-btn gang-cena-btn--go" onClick={onClose}>{t('games.gangues.cena.fechar')}</button></div>
  </div>
}
