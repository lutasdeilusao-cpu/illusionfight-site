import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { estaDisponivel } from '../../config/site'
import { ADMIN_EMAILS } from '../../config/launch'
import { historiasDoAutor } from '../../lib/historias/catalogo'
import { localizado } from '../../lib/webshard/catalogo'
import { useTrackedSession } from '../../lib/sessionAnalytics'
import LeitorCapitulo from '../../components/Leitor/LeitorCapitulo'

const autorLoaders = import.meta.glob('../../data/historias/autor/**/*.md', { query: '?raw', import: 'default' })

/** Capítulo das Histórias do Autor (/historias/autor/:cap): resolve o dado
 *  e entrega pro LeitorCapitulo. */
export default function AutorCapitulo() {
  const { cap } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const [md, setMd] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const historia = historiasDoAutor()
  const capitulo = historia.capitulos.find(c => c.id === cap)
  const nome = localizado(historia, 'nome', locale)
  const tituloCap = capitulo ? localizado(capitulo, 'titulo', locale) : ''

  useEffect(() => {
    if (cap) localStorage.setItem('ldi-autor-ultimo', `${historia.slug}/${cap}`)
  }, [cap, historia.slug])

  useTrackedSession('chapter_open', 'chapter_time', {
    content_type: 'autor', story_id: historia.slug,
    chapter_id: cap, chapter_numero: capitulo?.numero, chapter_titulo: tituloCap,
  }, { active: Boolean(capitulo) })

  // O perfil chega depois do primeiro render: o efeito tem que refazer quando o acesso muda.
  const aberto = Boolean(capitulo && estaDisponivel(capitulo, isAdmin, { user, perfil }))

  useEffect(() => {
    setNotFound(false)
    setCarregando(true)
    if (!aberto) { setNotFound(true); return }
    const loader = autorLoaders[`../../data/historias/autor/${locale}/${cap}.md`] || autorLoaders[`../../data/historias/autor/pt/${cap}.md`]
    if (!loader) { setNotFound(true); return }
    loader().then(texto => { setMd(texto); setCarregando(false) }).catch(() => setNotFound(true))
    window.scrollTo(0, 0)
  }, [cap, aberto, locale])

  const disponiveis = historia.capitulos.filter(c => estaDisponivel(c, isAdmin, { user, perfil }))
  const cur = disponiveis.findIndex(c => c.id === cap)
  const passo = c => c && {
    rota: historia.rotaCap(c),
    titulo: localizado(c, 'titulo', locale),
    numero: String(c.numero).padStart(2, '0'),
    resumo: localizado(c, 'resumo', locale),
  }

  return (
    <LeitorCapitulo
      md={md}
      carregando={carregando}
      naoEncontrado={notFound}
      eyebrow={t('pages.historias.titulo')}
      obra={nome}
      numero={capitulo ? String(capitulo.numero).padStart(2, '0') : null}
      titulo={tituloCap}
      tituloAba={capitulo ? `${tituloCap} — ${nome}` : ''}
      onVoltar={() => navigate(historia.rota)}
      indice={{ rota: historia.rota, rotulo: t('pages.leitor.indice') }}
      anterior={passo(disponiveis[cur - 1])}
      proximo={passo(disponiveis[cur + 1])}
      reacoes={capitulo ? { titulo: 'autor', capitulo: capitulo.id } : null}
      historia={historia}
      capId={capitulo?.id}
      completa={Boolean(capitulo && historia.capitulos[historia.capitulos.length - 1]?.id === capitulo.id)}
      isAdmin={isAdmin}
      semConta={!user}
      idioma={locale}
    />
  )
}
