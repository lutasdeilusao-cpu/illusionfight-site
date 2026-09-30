import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../context/AuthContext'
import { estaDisponivel } from '../../config/site'
import { useAchievements } from '../../context/AchievementsContext'
import { useEventos } from '../../context/EventosContext'
import { useReadingCompletionGate } from '../../hooks/useReadingCompletionGate'
import { notificationManager } from '../../lib/notificationManager'
import { useTrackedSession } from '../../lib/sessionAnalytics'
import index from '../../data/livro-index.json'
import LeitorCapitulo from '../../components/Leitor/LeitorCapitulo'

const chapterLoaders = import.meta.glob('../../data/livro/**/*.md', { query: '?raw', import: 'default' })
const ADMIN_EMAILS = ['isaiasgamedev@gmail.com', 'gramikgames@gmail.com']

/** Capítulo da linha principal (o livro Lutas de Ilusão) — só resolve o dado
 *  e o que é do livro (conquista do capítulo 1, evento de leitura, posição
 *  de rolagem); a tela é o LeitorCapitulo (components/Leitor). */
export default function LivroCapitulo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { user, perfil } = useAuth()
  const { desbloquearOuConvidar } = useAchievements()
  const { registrarEvento } = useEventos()
  const isAdmin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')
  const desbloquearOuConvidarRef = useRef(desbloquearOuConvidar)
  useEffect(() => { desbloquearOuConvidarRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
  const sentinelRef = useRef(null)
  const [md, setMd] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const chapter = index.find(ch => ch.id === id)
  const tituloKey = locale === 'en' ? 'titulo_en' : locale === 'es' ? 'titulo_es' : 'titulo'
  const resumoKey = locale === 'en' ? 'resumo_en' : locale === 'es' ? 'resumo_es' : 'resumo_pt'
  const liberado = c => c.id === 'capitulo-01' || estaDisponivel(c, isAdmin, { user, perfil })

  useEffect(() => { localStorage.setItem('ldi-livro-ultimo', id) }, [id])
  useEffect(() => { if (id) registrarEvento('capitulo_lido', `Leu o capítulo ${id}`, Number(id)) }, [id])

  // Volta onde o leitor parou neste capítulo (grava ao sair).
  useEffect(() => {
    const saveScroll = () => localStorage.setItem(`ldi-livro-scroll-${id}`, window.scrollY)
    window.addEventListener('beforeunload', saveScroll)
    return () => { saveScroll(); window.removeEventListener('beforeunload', saveScroll) }
  }, [id])
  useEffect(() => {
    if (carregando) return
    const saved = localStorage.getItem(`ldi-livro-scroll-${id}`)
    window.scrollTo(0, saved ? parseInt(saved) : 0)
  }, [id, carregando])

  // chapter_open/chapter_time: linha principal x contos x obras.
  useTrackedSession('chapter_open', 'chapter_time', {
    content_type: 'livro_principal', story_id: 'lutas-de-ilusao',
    chapter_id: id, chapter_numero: chapter?.numero, chapter_titulo: chapter?.[tituloKey],
  }, { active: Boolean(chapter) })

  useEffect(() => {
    setNotFound(false)
    setCarregando(true)
    if (!chapter || !liberado(chapter)) { setNotFound(true); return }
    const lang = locale === 'en' ? 'en' : locale === 'es' ? 'es' : 'pt'
    const loader = chapterLoaders[`../../data/livro/${lang}/${id}.md`] || chapterLoaders[`../../data/livro/pt/${id}.md`]
    if (!loader) { setNotFound(true); return }
    loader().then(texto => { setMd(texto); setCarregando(false) }).catch(() => setNotFound(true))
  }, [id, chapter, isAdmin, locale])

  useLayoutEffect(() => {
    if (id === 'capitulo-01') notificationManager.removeByAchievementId('leitor_marelia')
  }, [id])

  useReadingCompletionGate({
    sentinelRef,
    contentKey: `livro:${id}`,
    enabled: id === 'capitulo-01' && Boolean(md),
    onComplete: () => desbloquearOuConvidarRef.current('leitor_marelia'),
  })

  const capitulos = index.filter(liberado)
  const cur = capitulos.findIndex(c => c.id === id)
  const passo = c => c && { rota: `/historias/lutas-de-ilusao/${c.id}`, titulo: c[tituloKey], numero: String(c.numero).padStart(2, '0'), resumo: c[resumoKey] }

  return (
    <LeitorCapitulo
      md={md}
      carregando={carregando}
      naoEncontrado={notFound}
      eyebrow={t('pages.contos.linha_principal')}
      obra={t('site.nome_curto')}
      numero={chapter ? String(chapter.numero).padStart(2, '0') : null}
      titulo={chapter?.[tituloKey]}
      tituloAba={chapter ? `${chapter[tituloKey]} — ${t('site.nome_curto')}` : ''}
      onVoltar={() => navigate('/historias/lutas-de-ilusao')}
      indice={{ rota: '/historias/lutas-de-ilusao', rotulo: t('pages.leitor.indice') }}
      anterior={passo(capitulos[cur - 1])}
      proximo={passo(capitulos[cur + 1])}
      reacoes={chapter ? { titulo: 'livro-lutas-de-ilusao', capitulo: chapter.id } : null}
      isAdmin={isAdmin}
      semConta={!user}
      sentinelRef={sentinelRef}
      idioma={locale}
    />
  )
}
