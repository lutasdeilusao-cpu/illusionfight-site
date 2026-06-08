import { useLanguage } from '../../context/LanguageContext'
import '../../lib/stripe' // side-effect check
import './ProdutoDigitalCard.css'

export default function ProdutoDigitalCard({ produto, locale, onComprar, adquirido }) {
  const { t } = useLanguage()
  const preco = locale === 'pt' ? produto.preco_brl : produto.preco_usd
  const moeda = locale === 'pt' ? 'R$' : '$'
  const nome = locale === 'pt' ? produto.nome_pt : locale === 'es' ? produto.nome_es : produto.nome_en
  const desc = locale === 'pt' ? produto.desc_pt : locale === 'es' ? produto.desc_es : produto.desc_en

  return (
    <div className={`pdc-card ${adquirido ? 'pdc-card--adquirido' : ''}`}>
      {produto.badge && (
        <div className="pdc-badge" style={{ '--badge-cor': produto.badge_cor }}>
          {produto.badge}
        </div>
      )}
      <div className="pdc-icone">{produto.icone}</div>
      <h3 className="pdc-nome">{nome}</h3>
      <p className="pdc-desc">{desc}</p>

      <div className="pdc-itens">
        {produto.fichas > 0 && (
          <div className="pdc-item">
            <span className="pdc-item-icon">🎰</span>
            <span className="pdc-item-label">{produto.fichas} {t('shop.fichas') || 'fichas'}</span>
          </div>
        )}
        {produto.dix_bonus > 0 && (
          <div className="pdc-item pdc-item--dix">
            <span className="pdc-item-icon">💎</span>
            <span className="pdc-item-label">+{produto.dix_bonus} DIX</span>
          </div>
        )}
        {produto.item_exclusivo && (
          <div className="pdc-item pdc-item--cosmetico">
            <span className="pdc-item-icon">✨</span>
            <span className="pdc-item-label">{t('shop.item_exclusivo') || 'Item exclusivo'}</span>
          </div>
        )}
        {produto.jogo && (
          <div className="pdc-item pdc-item--jogo">
            <span className="pdc-item-icon">🎮</span>
            <span className="pdc-item-label">{produto.jogo}</span>
          </div>
        )}
      </div>

      <div className="pdc-preco">{moeda} {preco.toFixed(2)}</div>

      {adquirido ? (
        <div className="pdc-adquirido">✓ {t('shop.adquirido') || 'Adquirido'}</div>
      ) : (
        <button className="pdc-comprar" onClick={() => onComprar(produto)}>
          {t('shop.comprar') || 'COMPRAR'}
        </button>
      )}
    </div>
  )
}
