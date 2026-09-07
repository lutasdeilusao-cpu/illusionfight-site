import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { useGanguesStore } from './store/useGanguesStore'
import { GANGUES_ITENS_LISTA } from './data/ganguesItens.js'
import { sfx } from '../../../lib/sfx'
import './GanguesLobby.css'

/** Loja — primeira versão do sistema de item. Só 2 poções por enquanto, pra
 *  validar o loop inteiro (comprar → guardar no inventário → usar em
 *  combate) antes de crescer o catálogo. Compra com a grana da gangue
 *  inteira, guarda no inventário compartilhado (store.inventario). */
export default function GanguesLoja({ onNavigate }) {
  const { t } = useLanguage()
  const store = useGanguesStore()
  const [aviso, setAviso] = useState(null) // { itemId, texto } — feedback temporário por item

  const comprar = (item) => {
    const ok = store.comprarItem(item.id, item.custo)
    if (ok) { sfx.click(); setAviso({ itemId: item.id, texto: t('games.gangues.loja.compra_feita') }) }
    else { sfx.cancel?.(); setAviso({ itemId: item.id, texto: t('games.gangues.loja.sem_grana') }) }
    setTimeout(() => setAviso(null), 1400)
  }

  return (
    <main className="gang-lobby gang-loja-screen">
      <header className="gang-lobby-hero gang-lobby-hero--compact">
        <button className="gang-lobby-rename" onClick={() => onNavigate('lobby')}>← {t('games.gangues.progression.back_to_roster')}</button>
        <h1 className="gang-lobby-nome">{t('games.gangues.loja.titulo')}</h1>
        <p className="gang-loja-sub">{t('games.gangues.loja.sub')}</p>
        <span className="gang-lobby-econ-grana">💵 {store.grana}</span>
      </header>

      <div className="gang-loja-lista">
        {GANGUES_ITENS_LISTA.map(item => {
          const quantidade = store.inventario[item.id] || 0
          return (
            <div key={item.id} className="gang-loja-item">
              <span className="gang-loja-item__icone">{item.icone}</span>
              <div className="gang-loja-item__info">
                <strong>{t(item.nome)}</strong>
                <small>{t('games.gangues.loja.no_inventario', { n: quantidade })}</small>
              </div>
              <button className="gang-loja-item__comprar" onClick={() => comprar(item)}>
                {t('games.gangues.loja.comprar')}<b>{t('games.gangues.loja.custo', { n: item.custo })}</b>
              </button>
              {aviso?.itemId === item.id && <span className="gang-loja-item__aviso">{aviso.texto}</span>}
            </div>
          )
        })}
      </div>
    </main>
  )
}
