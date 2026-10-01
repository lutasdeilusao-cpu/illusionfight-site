import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { contoLiberado } from '../../config/site'
import index from '../../data/historias/contos.json'
import { historiaPorSlug, linhaPrincipal } from '../../lib/historias/catalogo'
import { useTrackedSession } from '../../lib/sessionAnalytics'
import LeitorCapitulo from '../../components/Leitor/LeitorCapitulo'

const contoLoaders = import.meta.glob('../../data/historias/contos/**/*.md', { query: '?raw', import: 'default' })
const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

/** Capítulo de um Conto de Ilusão — só resolve o dado; a tela é o
 *  LeitorCapitulo (components/Leitor). */
export default function ContoCapitulo() {
  const { historia, cap } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const [md, setMd] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const h = index.find(x => x.id === historia)
  const capitulo = h?.capitulos.find(c => c.id === cap)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
  const resumoKey = locale === 'en' ? 'resumo_en' : locale === 'es' ? 'resumo_es' : 'resumo_pt'

  useEffect(() => {
    if (historia && cap) localStorage.setItem('ldi-conto-ultimo', `${historia}/${cap}`)
  }, [historia, cap])

  // chapter_open/chapter_time: content_type 'conto' + story_id = qual conto.
  useTrackedSession('chapter_open', 'chapter_time', {
    content_type: 'conto', story_id: historia,
    chapter_id: cap, chapter_numero: capitulo?.numero, chapter_titulo: capitulo?.[tituloKey],
  }, { active: Boolean(h) && Boolean(capitulo) })

  useEffect(() => {
    setNotFound(false)
    setCarregando(true)
    if (!h || !capitulo || !contoLiberado(capitulo, isAdmin, { user, perfil })) { setNotFound(true); return }
    const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt'
    const loader = contoLoaders[`../../data/historias/contos/${historia}/${lang}/${cap}.md`] || contoLoaders[`../../data/historias/contos/${historia}/pt/${cap}.md`]
    if (!loader) { setNotFound(true); return }
    loader().then(texto => { setMd(texto); setCarregando(false) }).catch(() => setNotFound(true))
    window.scrollTo(0, 0)
  }, [historia, cap, h, capitulo, isAdmin, locale])

  const disponiveis = h ? h.capitulos.filter(c => contoLiberado(c, isAdmin, { user, perfil })) : []
  const cur = disponiveis.findIndex(c => c.id === cap)
  const passo = c => c && { rota: `/historias/contos/${historia}/${c.id}`, titulo: c[tituloKey], numero: String(c.numero).padStart(2, '0'), resumo: c[resumoKey] }

  return (
    <LeitorCapitulo
      md={md}
      carregando={carregando}
      naoEncontrado={notFound}
      eyebrow={t('pages.contos.linha_contos')}
      obra={h?.[tituloKey]}
      numero={capitulo ? String(capitulo.numero).padStart(2, '0') : null}
      titulo={capitulo?.[tituloKey]}
      tituloAba={capitulo ? `${capitulo[tituloKey]} — ${h[tituloKey]}` : ''}
      onVoltar={() => navigate(`/historias/contos/${historia || ''}`)}
      indice={{ rota: `/historias/contos/${historia || ''}`, rotulo: t('pages.leitor.indice') }}
      anterior={passo(disponiveis[cur - 1])}
      proximo={passo(disponiveis[cur + 1])}
      reacoes={h && capitulo ? { titulo: `conto-${h.id}`, capitulo: capitulo.id } : null}
      historia={historiaPorSlug(historia, 'conto')}
      capId={capitulo?.id}
      completa={Boolean(h && capitulo && h.capitulos[h.capitulos.length - 1]?.id === capitulo.id)}
      isAdmin={isAdmin}
      semConta={!user}
      idioma={locale}
    />
  )
}
