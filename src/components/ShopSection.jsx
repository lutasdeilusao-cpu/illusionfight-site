import { useRef, useEffect, useState } from 'react'
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
  const trackRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const [aba, setAba] = useState('fisico')
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

  const items = [...produtos, ...produtos, ...produtos]

  const onPointerDown = (e) => {
    isDragging.current = true
    startX.current = e.pageX - trackRef.current.offsetLeft
    scrollLeft.current = trackRef.current.scrollLeft
    trackRef.current.style.cursor = 'grabbing'
    trackRef.current.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!isDragging.current) return
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    trackRef.current.scrollLeft = scrollLeft.current - walk
  }

  const onPointerUp = () => {
    isDragging.current = false
    if (trackRef.current) trackRef.current.style.cursor = 'grab'
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const handleScroll = () => {
      const itemWidth = track.scrollWidth / 3
      if (track.scrollLeft < itemWidth * 0.1) {
        track.scrollLeft += itemWidth
      } else if (track.scrollLeft > itemWidth * 1.9) {
        track.scrollLeft -= itemWidth
      }
    }
    track.addEventListener('scroll', handleScroll)
    track.scrollLeft = track.scrollWidth / 3
    return () => track.removeEventListener('scroll', handleScroll)
  }, [aba])

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
          <button className={`shop-tab ${aba === 'fisico' ? 'shop-tab--ativo' : ''}`} onClick={() => setAba('fisico')}>
            {t('shop.fisico') || 'FÍSICO'}
          </button>
          <button className={`shop-tab ${aba === 'digital' ? 'shop-tab--ativo' : ''}`} onClick={() => setAba('digital')}>
            {t('shop.digital') || 'DIGITAL'}
          </button>
        </div>
      </div>

      {aba === 'fisico' && (
        <div
          ref={trackRef}
          className="shop-track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {items.map((produto, i) => {
            const nome = locale === 'pt' ? produto.nome_pt : locale === 'es' ? produto.nome_es : produto.nome_en
            const badge = locale === 'pt' ? produto.badge_pt : locale === 'es' ? produto.badge_es : produto.badge_en
            return (
            <a
              key={`${produto.id}-${i}`}
              href={produto.url}
              className="shop-card"
              draggable="false"
              onClick={(e) => { if (isDragging.current) e.preventDefault() }}
            >
              <div className="shop-card-image">
                {produto.imagem
                  ? <img src={produto.imagem} alt={nome} draggable="false" />
                  : <div className="shop-card-placeholder">
                      <span className="shop-card-tipo">{produto.tipo.toUpperCase()}</span>
                    </div>
                }
              <span className="shop-card-badge">{badge}</span>
            </div>
            <div className="shop-card-footer">
              <p className="shop-card-nome">{nome}</p>
              <p className="shop-card-preco">{produto.preco}</p>
            </div>
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
