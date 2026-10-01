import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { estaDisponivel } from '../../config/site'
import obras from '../../data/historias/obras.json'
import { historiaPorSlug, linhaPrincipal } from '../../lib/historias/catalogo'
import { useTrackedSession } from '../../lib/sessionAnalytics'
import LeitorCapitulo from '../../components/Leitor/LeitorCapitulo'

const obraLoaders = import.meta.glob('../../data/historias/obras/**/*.md', { query: '?raw', import: 'default' })
const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

/** Capítulo de uma obra de fora (Mundo das Sombras, Mar de Cinzas) — só
 *  resolve o dado; a tela é o LeitorCapitulo (components/Leitor). */
export default function ObraCapitulo() {
  const { slug, cap } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const [md, setMd] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const obra = obras.find(o => o.id === slug)
  const capitulo = obra?.capitulos.find(c => c.id === cap)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
  const resumoKey = locale === 'en' ? 'resumo_en' : locale === 'es' ? 'resumo_es' : 'resumo_pt'

  useEffect(() => {
    if (slug && cap) localStorage.setItem('ldi-obra-ultimo', `${slug}/${cap}`)
  }, [slug, cap])

  // chapter_open/chapter_time: content_type 'obra' + story_id = qual universo.
  useTrackedSession('chapter_open', 'chapter_time', {
    content_type: 'obra', story_id: slug,
    chapter_id: cap, chapter_numero: capitulo?.numero, chapter_titulo: capitulo?.[tituloKey],
  }, { active: Boolean(obra) && Boolean(capitulo) })

  useEffect(() => {
    setNotFound(false)
    setCarregando(true)
    if (!obra || !capitulo || !estaDisponivel(capitulo, isAdmin, { user, perfil })) { setNotFound(true); return }
    const idiomas = obra.idiomas || ['pt']
    const lang = idiomas.includes(locale) ? locale : 'pt'
    const loader = obraLoaders[`../../data/historias/obras/${slug}/${lang}/${cap}.md`] || obraLoaders[`../../data/historias/obras/${slug}/pt/${cap}.md`]
    if (!loader) { setNotFound(true); return }
    loader().then(texto => { setMd(texto); setCarregando(false) }).catch(() => setNotFound(true))
    window.scrollTo(0, 0)
  }, [slug, cap, obra, capitulo, isAdmin, locale])

  const disponiveis = obra ? obra.capitulos.filter(c => estaDisponivel(c, isAdmin, { user, perfil })) : []
  const cur = disponiveis.findIndex(c => c.id === cap)
  const passo = c => c && { rota: `/historias/${slug}/${c.id}`, titulo: c[tituloKey], numero: c.numero != null ? String(c.numero).padStart(2, '0') : c.id, resumo: c[resumoKey] }

  return (
    <LeitorCapitulo
      md={md}
      carregando={carregando}
      naoEncontrado={notFound}
      eyebrow={t('pages.historias.titulo')}
      obra={obra?.[tituloKey]}
      numero={capitulo?.numero != null ? String(capitulo.numero).padStart(2, '0') : null}
      titulo={capitulo?.[tituloKey]}
      tituloAba={capitulo ? `${capitulo[tituloKey]} — ${obra[tituloKey]}` : ''}
      onVoltar={() => navigate(`/historias/${slug || ''}`)}
      indice={{ rota: `/historias/${slug || ''}`, rotulo: t('pages.leitor.indice') }}
      anterior={passo(disponiveis[cur - 1])}
      proximo={passo(disponiveis[cur + 1])}
      reacoes={obra && capitulo ? { titulo: `obra-${obra.id}`, capitulo: capitulo.id } : null}
      historia={historiaPorSlug(slug, 'obra')}
      capId={capitulo?.id}
      completa={Boolean(obra && capitulo && obra.capitulos[obra.capitulos.length - 1]?.id === capitulo.id)}
      isAdmin={isAdmin}
      semConta={!user}
      idioma={locale}
    />
  )
}
