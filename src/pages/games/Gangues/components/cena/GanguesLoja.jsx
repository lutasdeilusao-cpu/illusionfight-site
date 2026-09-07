import { useState } from 'react'
import { useLanguage } from '../../../../../context/LanguageContext'
import { useGanguesStore } from '../../store/useGanguesStore'
import { getGanguesItem } from '../../data/ganguesItens.js'
import { getGanguesEquip } from '../../data/ganguesEquip.js'
import { sfx } from '../../../../../lib/sfx'

/* Encontro LOJA — vende os itens do próprio POI (poi.itens: ['pocao_hp',
   'colete_couro',...]). O catálogo mistura consumível (data/ganguesItens.js)
   e equipamento (data/ganguesEquip.js) — cada região tem sua loja com seu
   catálogo próprio. Repetível: fica sempre disponível, nunca marca resolvido. */
export default function GanguesLoja({ poi, onClose }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [aviso, setAviso] = useState(null) // { itemId, texto }

  const catalogo = (poi.itens || []).map(id => {
    const equip = getGanguesEquip(id)
    if (equip) return { ...equip, _equip: true }
    return getGanguesItem(id)
  }).filter(Boolean)

  const contarNoInventario = (item) => item._equip
    ? store.equipamentos.filter(eq => eq.itemId === item.id).length
    : (store.inventario[item.id] || 0)

  const comprar = (item) => {
    const ok = item._equip ? store.comprarEquip(item.id, item.custo) : store.comprarItem(item.id, item.custo)
    if (ok) { sfx.reward?.(); setAviso({ itemId: item.id, texto: t('games.gangues.loja.compra_feita') }) }
    else { sfx.cancel(); setAviso({ itemId: item.id, texto: t('games.gangues.loja.sem_grana') }) }
    setTimeout(() => setAviso(null), 1400)
  }

  return (
    <div className="gang-cena-enc gang-cena-enc--loja">
      <button className="gang-cena-enc-x" onClick={onClose} aria-label={t('games.gangues.cena.fechar')}>✕</button>
      <span className="gang-cena-eyebrow">{t('games.gangues.cena.tipo.loja')}</span>
      <h3 className="gang-cena-enc-titulo">{t(`${poi.i18n}.nome`)}</h3>
      <p className="gang-cena-enc-sub">{t('games.gangues.loja.sub')}</p>
      <p className="gang-cena-enc-sub"><b>💵 {store.grana}</b></p>

      <div className="gang-loja-cena-lista">
        {catalogo.map(item => {
          const quantidade = contarNoInventario(item)
          return (
            <div key={item.id} className="gang-loja-cena-item">
              <span className="gang-loja-cena-item__icone">{item.icone}</span>
              <div className="gang-loja-cena-item__info">
                <strong>{t(item.nome)}</strong>
                {item._equip && <small>{t(`games.gangues.equip.slots.${item.slot}`)}</small>}
                <small>{t('games.gangues.loja.no_inventario', { n: quantidade })}</small>
              </div>
              <button className="gang-loja-cena-item__comprar" onClick={() => comprar(item)}>
                {t('games.gangues.loja.comprar')}<b>{t('games.gangues.loja.custo', { n: item.custo })}</b>
              </button>
              {aviso?.itemId === item.id && <span className="gang-loja-cena-item__aviso">{aviso.texto}</span>}
            </div>
          )
        })}
      </div>

      <div className="gang-cena-enc-acoes">
        <button className="gang-cena-btn" onClick={onClose}>{t('games.gangues.cena.fechar')}</button>
      </div>
    </div>
  )
}
