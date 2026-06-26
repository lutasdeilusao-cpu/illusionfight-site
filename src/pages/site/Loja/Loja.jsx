import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { iniciarCheckoutLoja } from '../../../lib/stripe'
import ProdutoDigitalCard from '../../../components/ProdutoDigitalCard/ProdutoDigitalCard'
import produtos from '../../../data/produtos.json'
import produtosDigitais from '../../../data/loja-digital.json'
import './Loja.css'

export default function Loja() {
  const { t, locale } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [aba, setAba] = useState('digital')
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
    <>
      <Helmet>
        <title>{t('shop.page_title') || 'Loja — Illusion Fight'}</title>
        <meta name="description" content={t('shop.page_desc') || 'Compre fichas, DIX e itens exclusivos do universo Illusion Fight.'} />
        <meta property="og:title" content={t('shop.page_title') || 'Loja — Illusion Fight'} />
        <meta property="og:description" content={t('shop.page_og_desc') || 'Compre fichas, DIX e itens exclusivos.'} />
        <meta property="og:url" content="https://illusionfight.com/loja" />
      </Helmet>

      <div className="loja-page">
        <div className="loja-header">
          <h1 className="loja-titulo">
            <span className="loja-titulo-glitch" data-text={t('shop.titulo')}>{t('shop.titulo')}</span>
          </h1>
          <p className="loja-subtitulo">
            <span className="loja-cursor">█</span> {t('shop.subtitulo') || 'fichas, DIX e itens exclusivos'}
          </p>
        </div>

        <div className="loja-tabs">
          <button className={`loja-tab ${aba === 'digital' ? 'loja-tab--ativo' : ''}`} onClick={() => setAba('digital')}>
            🎰 {t('shop.digital') || 'DIGITAL'}
          </button>
          <button className={`loja-tab ${aba === 'fisico' ? 'loja-tab--ativo' : ''}`} onClick={() => setAba('fisico')}>
            📦 {t('shop.fisico') || 'FÍSICO'}
          </button>
        </div>

        {aba === 'digital' && (
          <div className="loja-digital-grid">
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

        {aba === 'fisico' && (
          <div className="loja-fisico-grid">
            {produtos.map(produto => {
              const nome = locale === 'pt' ? produto.nome_pt : locale === 'es' ? produto.nome_es : produto.nome_en
              const badge = locale === 'pt' ? produto.badge_pt : locale === 'es' ? produto.badge_es : produto.badge_en
              return (
                <a key={produto.id} href={produto.url} className="loja-card" target="_blank" rel="noopener noreferrer">
                  <div className="loja-card-img">
                    {produto.imagem
                      ? <img src={produto.imagem} alt={nome} />
                      : <div className="loja-card-placeholder">{produto.tipo.toUpperCase()}</div>
                    }
                  </div>
                  <div className="loja-card-body">
                    <span className="loja-card-badge">{badge}</span>
                    <p className="loja-card-nome">{nome}</p>
                    <p className="loja-card-preco">{produto.preco}</p>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        <div className="loja-footer">
          <p className="loja-footer-text">{t('shop.footer') || '© 2026 Illusion Fight — Compre com segurança via Stripe'}</p>
        </div>
      </div>
    </>
  )
}
