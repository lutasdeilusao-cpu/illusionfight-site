import { useState } from 'react'
import { getGanguesItem, precoVendaItem, textoEfeitoItem, grupoDoItem, GANGUES_GRUPOS_ITEM } from '../../data/ganguesItens.js'
import { getGanguesEquip, precoVendaEquip, nomePeca, textoBonusEquip } from '../../data/ganguesEquip.js'
import { sfx } from '../../../../../lib/sfx'

/* VENDER da loja: o que a gangue tem guardado e a loja compra, a 25% do
   preço (precoVendaItem / precoVendaEquip). Separado como a bolsa (cura,
   luta, material, equipamento); peças iguais ficam numa linha só. Vende 1
   ou todos. Peça equipada não aparece: tira antes na ficha. */
export default function GanguesLojaVenda({ store, t, avisar }) {
  const [grupo, setGrupo] = useState(null)

  const consumiveis = Object.entries(store.inventario)
    .map(([id, qtd]) => ({ item: getGanguesItem(id), qtd }))
    .filter(({ item, qtd }) => item && qtd > 0 && precoVendaItem(item) > 0)
    .map(({ item, qtd }) => ({ chave: `i${item.id}`, icone: item.icone, nome: t(item.nome), da: textoEfeitoItem(t, item) || t('games.gangues.loja.material'), qtd, preco: precoVendaItem(item), grupo: grupoDoItem(item), item }))
  const pecas = Object.values(store.equipamentos.reduce((acc, eq) => {
    const def = getGanguesEquip(eq.itemId); if (!def) return acc
    const chave = `e${eq.itemId}-${eq.encaixe ? 1 : 0}-${eq.aprim || 0}`
    acc[chave] = acc[chave] || { chave, icone: def.icone, nome: nomePeca(t, def, eq), da: `${t(`games.gangues.equip.slots.${def.slot}`)} · ${textoBonusEquip(t, def, eq.aprim || 0) || '—'}`, qtd: 0, preco: precoVendaEquip(def, eq.aprim), grupo: 'equip', uids: [] }
    acc[chave].qtd++; acc[chave].uids.push(eq.uid); return acc
  }, {}))
  const todos = [...consumiveis, ...pecas].sort((a, b) => b.preco - a.preco)
  const grupos = [...GANGUES_GRUPOS_ITEM, 'equip'].filter(g => todos.some(x => x.grupo === g))
  const ativo = grupos.includes(grupo) ? grupo : grupos[0]
  const lista = todos.filter(x => x.grupo === ativo)
  const valeTudo = todos.reduce((s, x) => s + x.preco * x.qtd, 0)

  const vender = (linha, qtd) => {
    let n = 0
    if (linha.item) n = store.venderItem(linha.item.id, linha.preco, qtd)
    else for (const uid of linha.uids.slice(0, qtd)) if (store.venderEquip(uid, linha.preco)) n++
    if (n > 0) { sfx.reward?.(); avisar(t('games.gangues.loja.venda_feita', { n: linha.preco * n, item: linha.nome })) }
  }

  if (!todos.length) return <p className="gloja__vazio">{t('games.gangues.loja.nada_vender')}</p>

  return <>
    <div className="gloja__resumo">
      <span>{t('games.gangues.loja.venda_regra')}</span>
      <b>{t('games.gangues.loja.vale_tudo', { n: valeTudo })}</b>
    </div>
    {grupos.length > 1 && <div className="gloja__cats" role="tablist">
      {grupos.map(g => (
        <button key={g} role="tab" aria-selected={g === ativo} className={`gang-bagq-slot${g === ativo ? ' is-ativa' : ''}`}
          onClick={() => { sfx.select?.(); setGrupo(g) }}>
          {t(`games.gangues.bag.abas.${g}`)}<b>{todos.filter(x => x.grupo === g).reduce((s, x) => s + x.qtd, 0)}</b>
        </button>
      ))}
    </div>}
    <div className="gloja__lista">
      {lista.map(linha => (
        <div key={linha.chave} className="gloja-item gloja-item--venda">
          <span className="gloja-item__info">
            <span className="gloja-item__icone">{linha.icone}</span>
            <span className="gloja-item__texto">
              <strong>{linha.nome}</strong>
              <small className="gloja-item__da">{linha.da}</small>
              <small className="gloja-item__meta">{t('games.gangues.loja.tens', { n: linha.qtd })} · {t('games.gangues.loja.paga_cada', { n: linha.preco })}</small>
            </span>
          </span>
          <span className="gloja-venda__botoes">
            <button className="gloja-preco gloja-preco--venda" onClick={() => vender(linha, 1)}>
              <b>+💵 {linha.preco}</b><small>{t('games.gangues.loja.vender_1')}</small>
            </button>
            {linha.qtd > 1 && <button className="gloja-preco gloja-preco--venda" onClick={() => vender(linha, linha.qtd)}>
              <b>+💵 {linha.preco * linha.qtd}</b><small>{t('games.gangues.loja.vender_todos', { n: linha.qtd })}</small>
            </button>}
          </span>
        </div>
      ))}
    </div>
    <p className="gloja__nota">{t('games.gangues.loja.venda_equipado')}</p>
  </>
}
