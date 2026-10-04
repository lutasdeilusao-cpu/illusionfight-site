import { getGanguesItem, precoVendaItem, textoEfeitoItem } from '../../data/ganguesItens.js'
import { getGanguesEquip, precoVendaEquip } from '../../data/ganguesEquip.js'
import { sfx } from '../../../../../lib/sfx'

/* Aba VENDER da loja: tudo que a gangue tem guardado e a loja compra, a 25%
   do preço (precoVendaItem / precoVendaEquip). Consumível vende 1 ou todos;
   equipamento vende só o que está no bolso, peça por peça. */
export default function GanguesLojaVenda({ store, t, aviso, notificar }) {
  const consumiveis = Object.entries(store.inventario)
    .map(([id, qtd]) => ({ item: getGanguesItem(id), qtd }))
    .filter(({ item, qtd }) => item && qtd > 0 && precoVendaItem(item) > 0)
    .sort((a, b) => a.item.id - b.item.id)
  const pecas = store.equipamentos
    .map(eq => ({ eq, def: getGanguesEquip(eq.itemId) }))
    .filter(({ def }) => def)
    .sort((a, b) => a.def.id - b.def.id)

  const venderItem = (item, qtd) => {
    const preco = precoVendaItem(item)
    const n = store.venderItem(item.id, preco, qtd)
    if (n > 0) { sfx.reward?.(); notificar(item.id, t('games.gangues.loja.venda_feita', { n: preco * n })) }
  }
  const venderPeca = (eq, def) => {
    const preco = precoVendaEquip(def)
    if (store.venderEquip(eq.uid, preco)) { sfx.reward?.(); notificar(eq.uid, t('games.gangues.loja.venda_feita', { n: preco })) }
  }

  if (!consumiveis.length && !pecas.length) return <p className="gang-cena-enc-sub">{t('games.gangues.loja.nada_vender')}</p>

  return (
    <div className="gang-loja-cena-lista">
      <p className="gang-loja-venda-nota">{t('games.gangues.loja.venda_sub')}</p>
      {consumiveis.map(({ item, qtd }) => {
        const preco = precoVendaItem(item)
        return (
          <div key={item.id} className="gang-loja-cena-item">
            <span className="gang-loja-cena-item__icone">{item.icone}</span>
            <span className="gang-loja-cena-item__info">
              <strong>{t(item.nome)}</strong>
              <small>{textoEfeitoItem(t, item) || t('games.gangues.loja.material')}</small>
              <small>{t('games.gangues.loja.no_inventario', { n: qtd })}</small>
            </span>
            <span className="gang-loja-venda-botoes">
              <button className="gang-loja-cena-item__comprar" onClick={() => venderItem(item, 1)}>
                {t('games.gangues.loja.vender')}<b>{t('games.gangues.loja.custo', { n: preco })}</b>
              </button>
              {qtd > 1 && (
                <button className="gang-loja-cena-item__comprar" onClick={() => venderItem(item, qtd)}>
                  {t('games.gangues.loja.vender_todos', { n: qtd })}<b>{t('games.gangues.loja.custo', { n: preco * qtd })}</b>
                </button>
              )}
            </span>
            {aviso?.itemId === item.id && <span className="gang-loja-cena-item__aviso">{aviso.texto}</span>}
          </div>
        )
      })}
      {pecas.map(({ eq, def }) => (
        <div key={eq.uid} className="gang-loja-cena-item">
          <span className="gang-loja-cena-item__icone">{def.icone}</span>
          <span className="gang-loja-cena-item__info">
            <strong>{t(def.nome)}{eq.aprim > 0 ? ` +${eq.aprim}` : ''}</strong>
            <small>{t(`games.gangues.equip.slots.${def.slot}`)} · {t(`games.gangues.equip.raridade.${def.raridade}`)}</small>
          </span>
          <button className="gang-loja-cena-item__comprar" onClick={() => venderPeca(eq, def)}>
            {t('games.gangues.loja.vender')}<b>{t('games.gangues.loja.custo', { n: precoVendaEquip(def) })}</b>
          </button>
          {aviso?.itemId === eq.uid && <span className="gang-loja-cena-item__aviso">{aviso.texto}</span>}
        </div>
      ))}
    </div>
  )
}
