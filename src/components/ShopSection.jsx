import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { iniciarCheckoutLoja } from '../lib/stripe'
import produtos from '../data/produtos.json'
import produtosDigitais from '../data/loja-digital.json'
import ProdutoDigitalCard from './ProdutoDigitalCard/ProdutoDigitalCard'
import './ShopSection.css'

export default function ShopSection() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const ref = useScrollReveal()
  const [aba, setAba] = useState('digital')
  const locale = localStorage.getItem('ldi_locale') || 'pt'
  const [adquiridos, setAdquiridos] = useState({})

  useEffect(() => {
    if (user) {
      supabase.from('loja_compras').select('produto_id').eq('user_id', user.id).eq('status', 'confirmado').then(({ data }) => {
        if (data) {
          const map = {}
          data.forEach(c => { map[c.produto_id] = true })
          setAdquiridos(map)
        }
      })
    }
  }, [user])

  const handleComprarDigital = async (produto) => {
    if (!user) { navigate('/login?redirect=/loja'); return }
    try {
      await iniciarCheckoutLoja(produto.id)
    } catch (err) {
      console.error('[LOJA] erro ao comprar:', err)
    }
  }

  return (
    <section ref={ref} className="shop-section reveal">
      <div className="shop-section-header">
        <h2 className="section-title">{t('shop.titulo')}</h2>
        <div className="shop-tabs">
          <button className={`shop-tab ${aba === 'digital' ? 'shop-tab--ativo' : ''}`} onClick={() => setAba('digital')}>
            {t('shop.digital') || 'DIGITAL'}
          </button>
          <button className={`shop-tab ${aba === 'fisico' ? 'shop-tab--ativo' : ''}`} onClick={() => setAba('fisico')}>
            {t('shop.fisico') || 'FÍSICO'}
          </button>
        </div>
      </div>

      {aba === 'fisico' && (
        <div className="shop-fisico-grid">
          {produtos.map((produto) => {
            const nome = locale === 'pt' ? produto.nome_pt : locale === 'es' ? produto.nome_es : produto.nome_en
            const badge = locale === 'pt' ? produto.badge_pt : locale === 'es' ? produto.badge_es : produto.badge_en
            return (
              <a
                key={produto.id}
                href={produto.url}
                className="sfc-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                {badge && (
                  <div className="sfc-badge">{badge}</div>
                )}
                <div className="sfc-icon">
                  {produto.imagem
                    ? <img src={produto.imagem} alt={nome} />
                    : <span className="sfc-tipo">{produto.tipo.toUpperCase()}</span>
                  }
                </div>
                <h3 className="sfc-nome">{nome}</h3>
                <div className="sfc-preco">{produto.preco}</div>
              </a>
            )
          })}
        </div>
      )}

      {aba === 'digital' && (
        <div className="shop-digital-grid">
          {produtosDigitais.map(produto => (
            <ProdutoDigitalCard
              key={produto.id}
              produto={produto}
              locale={locale}
              onComprar={handleComprarDigital}
              adquirido={adquiridos[produto.id]}
            />
          ))}
        </div>
      )}

      <div className="shop-footer">
        <button className="shop-ver-tudo" onClick={() => navigate('/loja')}>
          {t('shop.ver_tudo') || 'VER TUDO →'}
        </button>
      </div>
    </section>
  )
}
