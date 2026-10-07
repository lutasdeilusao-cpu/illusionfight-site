import { ST_TODOS, normalizarStatus } from '../../engine/ganguesStatus.js'
import { GANGUES_STATUS } from '../../engine/ganguesStatus.js'
import { Fragment, useState } from 'react'
import { sfx } from '../../../../../lib/sfx'
import { GANGUES_STORY_BATTLE_PARTY_MAX, getGanguesResources } from '../../data/ganguesLoadout.js'
import { getGanguesAttributesWithEquip, applyGanguesEquipResources, getGanguesEquip } from '../../data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA, GANGUES_GRUPOS_ITEM, grupoDoItem, textoEfeitoItem } from '../../data/ganguesItens.js'
import GanguesBagEquip from './GanguesBagEquip'
import { GANGUES_CARTAS_LISTA, nomeCarta, textoCarta } from '../../data/ganguesCartas.js'

// Bolsa da gangue — o que o bando tem de item (consumível + equipamento
// guardado). É a MESMA fonte que a loja abastece e que o combate lê pra usar
// poção (store.inventario / store.equipamentos) — um sistema só.
// A escolha de quem usa/equipa abre logo abaixo do item tocado.
export default function GanguesCenaBagSheet({ store, t, onClose }) {
  const [usando, setUsando] = useState(null)     // consumível escolhido pra usar (mostra o picker de personagem)
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
  const doGrupo = g => consumiveis.filter(it => grupoDoItem(it) === g)
  const abas = [
    ...GANGUES_GRUPOS_ITEM.filter(g => doGrupo(g).length),
    ...(pecas.length ? ['equip'] : []),
    ...(cartas.length ? ['cartas'] : []),
  ]
  const [abaEscolhida, setAba] = useState(null)
  const aba = abas.includes(abaEscolhida) ? abaEscolhida : abas[0]
  const listaConsumiveis = GANGUES_GRUPOS_ITEM.includes(aba) ? doGrupo(aba) : []
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
  return <div className="gang-cena-enc gang-cena-enc--bag">
    <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
    <span className="gang-cena-eyebrow">{t('games.gangues.bag.eyebrow')}</span>
    <h3 className="gang-cena-enc-titulo">{t('games.gangues.bag.titulo')}</h3>
    <p className="gang-cena-enc-sub"><b>💵 {store.grana}　⚑ {store.rep}</b></p>
    {feito && <p className="gang-bag-feito">{feito}</p>}
    {vazio && <p className="gang-cena-enc-sub">{t('games.gangues.bag.vazio')}</p>}
    {abas.length > 1 && <div className="gang-loja-abas" role="tablist">{abas.map(a => (
      <button key={a} role="tab" aria-selected={a === aba} className={`gang-loja-aba${a === aba ? " is-ativa" : ""}`} onClick={() => { sfx.select?.(); setAba(a); setUsando(null) }}>{t(`games.gangues.bag.abas.${a}`)}</button>
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
    {aba === 'equip' && <GanguesBagEquip store={store} t={t} onFeito={msg => { setFeito(msg); setTimeout(() => setFeito(null), 2800) }} />}
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
