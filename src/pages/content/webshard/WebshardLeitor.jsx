import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useReader } from '../../../context/ReaderContext'
import { useAchievements } from '../../../context/AchievementsContext'
import { useEventos } from '../../../context/EventosContext'
import { useReadingCompletionGate } from '../../../hooks/useReadingCompletionGate'
import { useWebshardAcesso } from '../../../hooks/useWebshardAcesso'
import { notificationManager } from '../../../lib/notificationManager'
import { useTrackedSession } from '../../../lib/sessionAnalytics'
import { trackEvent } from '../../../lib/analytics'
import {
  capituloPorId, formatarData, idiomaInicial, localizado, paginasDe, rotaCapitulo, rotaTitulo, rotuloCapitulo, vizinhos,
} from '../../../lib/webshard/catalogo'
import { lerProgresso, salvarProgresso } from '../../../lib/webshard/progresso'
import { useBarraAutoOculta } from './hooks/useBarraAutoOculta'
import LeitorBarra from './components/LeitorBarra'
import LeitorPaginas from './components/LeitorPaginas'
import LeitorFim from './components/LeitorFim'
import AvisoAutor from './components/AvisoAutor'
import GateLeitura, { cortarLista, useGateLeitura } from '../../../components/GateLeitura/GateLeitura'
import './WebshardLeitor.css'

/* Leitor WEB SHARD — /webtoon/:id (Lutas de Ilusão, URL legada) e
   /webtoon/:slug/:cap (demais títulos). Imersivo: navbar some (ReaderMode),
   a barra própria recolhe ao descer, as páginas ocupam a coluna inteira. */
export default function WebshardLeitor({ titulo, capId }) {
  const { setReaderMode } = useReader()
  const navigate = useNavigate()
  const { locale, t } = useLanguage()
  const { isAdmin, nivel, liberado, previa, dataPara } = useWebshardAcesso()
  const { desbloquearOuConvidar } = useAchievements()
  const { registrarEvento } = useEventos()
  const desbloquearRef = useRef(desbloquearOuConvidar)
  useEffect(() => { desbloquearRef.current = desbloquearOuConvidar }, [desbloquearOuConvidar])
  const ultimaPaginaRef = useRef(null)

  const cap = capituloPorId(titulo, capId)
  const podeLer = Boolean(cap && liberado(cap))
  // Página salva deste capítulo (se deu pra ler um pedaço e parou no meio).
  // Lida no render, não num efeito: o observer das páginas (efeito do
  // filho, roda antes do efeito do pai) já grava "página 1" na montagem e
  // apagaria o progresso antes de alguém ler.
  const paginaSalva = () => {
    const salvo = lerProgresso(titulo.slug)
    const total = cap?.paginas || 0
    return salvo?.cap === capId && salvo.pagina > 2 && salvo.pagina < total ? salvo.pagina : null
  }
  const chaveCap = `${titulo.slug}/${capId}`
  const [capAtual, setCapAtual] = useState(chaveCap)
  const [idioma, setIdioma] = useState(() => idiomaInicial(cap, locale))
  const [pagina, setPagina] = useState(1)
  const [retomar, setRetomar] = useState(paginaSalva)
  const [aviso, setAviso] = useState('')
  // Recado do autor (cap.aviso_autor): abre em TODA entrada no capítulo.
  const [avisoAutorAberto, setAvisoAutorAberto] = useState(Boolean(cap?.aviso_autor))
  // Troca de capítulo (próximo/anterior): o Router reaproveita o componente,
  // então o estado é reajustado aqui, durante o render.
  if (capAtual !== chaveCap) {
    setCapAtual(chaveCap)
    setIdioma(idiomaInicial(cap, locale))
    setPagina(1)
    setRetomar(paginaSalva())
    setAviso('')
    setAvisoAutorAberto(Boolean(cap?.aviso_autor))
  }
  const retomarRef = useRef(retomar)
  retomarRef.current = retomar
  const { visivel, alternar, mostrar } = useBarraAutoOculta()

  const paginas = useMemo(() => (podeLer ? paginasDe(cap, idioma) : []), [cap, idioma, podeLer])
  // Sem conta: só a 1ª metade das páginas; o final pede conta grátis.
  const gate = useGateLeitura()
  const paginasVisiveis = useMemo(() => cortarLista(paginas, gate), [paginas, gate])
  const cortado = paginasVisiveis.length < paginas.length
  const idiomaIncompleto = Boolean(cap?.paginas_faltando?.[idioma]?.length)
  const nomeCap = cap ? localizado(cap, 'titulo', locale) : ''
  // Conquista de "terminou o capítulo" vem do dado (episodios.json).
  const conquista = cap?.conquista_ao_terminar || null

  useEffect(() => {
    setReaderMode(true)
    return () => setReaderMode(false)
  }, [setReaderMode])

  useEffect(() => {
    window.scrollTo(0, 0)
    mostrar()
  }, [chaveCap, mostrar])

  useEffect(() => {
    if (podeLer) registrarEvento('webtoon_lido', `Leu o episódio ${capId}`, Number(capId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeLer, titulo.slug, capId])

  useLayoutEffect(() => {
    if (conquista) notificationManager.removeByAchievementId(conquista)
  }, [conquista])

  useReadingCompletionGate({
    sentinelRef: ultimaPaginaRef,
    contentKey: `webtoon:${titulo.slug}:${capId}`,
    enabled: Boolean(conquista) && podeLer,
    onComplete: () => desbloquearRef.current(conquista),
  })

  useTrackedSession('webtoon_open', 'webtoon_time', {
    titulo: titulo.slug, episode_id: capId, episode_numero: cap?.numero, episode_titulo: nomeCap, idioma,
  }, { active: podeLer })

  const onPagina = useCallback(n => {
    setPagina(n)
    // Enquanto o "continuar da pág. N" está oferecido e o leitor ainda está
    // no começo, não sobrescreve o progresso salvo.
    if (retomarRef.current && n <= 2) return
    if (n > 2) setRetomar(null)
    salvarProgresso(titulo.slug, capId, n, cap?.paginas || 0)
  }, [titulo.slug, capId, cap])

  const irParaRetomar = () => {
    document.getElementById(`ws-pag-${retomar}`)?.scrollIntoView({ block: 'start' })
    setRetomar(null)
  }

  const trocarIdioma = l => {
    setIdioma(l)
    trackEvent('webshard_idioma', { titulo: titulo.slug, capitulo: capId, idioma: l })
  }

  const compartilhar = async () => {
    const url = `https://illusionfight.com${rotaCapitulo(titulo, cap)}`
    const texto = t('webShard.leitor.share_texto', { titulo: localizado(titulo, 'nome', locale), cap: nomeCap })
    trackEvent('webshard_compartilhar', { titulo: titulo.slug, capitulo: capId })
    try {
      if (navigator.share) {
        await navigator.share({ title: nomeCap, text: texto, url })
        return
      }
      await navigator.clipboard.writeText(`${texto} ${url}`)
      setAviso(t('webShard.leitor.copiado'))
    } catch (err) {
      if (err?.name !== 'AbortError') setAviso(url)
    }
  }

  if (!podeLer) {
    return (
      <div className="ws-leitor-bloqueado" style={{ '--ws-cor': titulo.cor }}>
        <div className="container">
          <span className="if-eyebrow">{t('webShard.hub.eyebrow')}</span>
          <p className="ws-leitor-bloqueado__texto">
            {!cap
              ? t('webShard.leitor.nao_encontrado')
              : dataPara(cap)
                ? t('webShard.leitor.bloqueado', { data: formatarData(dataPara(cap)) })
                : t('webShard.leitor.bloqueado_sem_data')}
          </p>
          <Link to={rotaTitulo(titulo)} className="if-btn if-btn--ghost">{t('webShard.leitor.todos_capitulos')}</Link>
        </div>
      </div>
    )
  }

  const { proximo } = vizinhos(titulo, cap)

  return (
    <>
      <Helmet><title>{`${nomeCap} — ${localizado(titulo, 'nome', locale)} — ${t('site.nome_curto')}`}</title></Helmet>

      <div className="ws-leitor" style={{ '--ws-cor': titulo.cor }}>
        <LeitorBarra
          visivel={visivel}
          onVoltar={() => navigate(rotaTitulo(titulo))}
          rotulo={`${localizado(titulo, 'nome', locale)} · ${rotuloCapitulo(cap, t)}`}
          nome={nomeCap}
          pagina={pagina}
          total={cap.paginas}
          idiomas={cap.idiomas || ['pt']}
          idioma={idioma}
          onIdioma={trocarIdioma}
          previa={previa(cap)}
        />

        {(retomar || (idiomaIncompleto && pagina <= 2)) && (
          <div className={`ws-leitor__avisos${visivel ? '' : ' is-alto'}`}>
            {retomar && (
              <button type="button" className="ws-leitor__retomar" onClick={irParaRetomar}>
                {t('webShard.leitor.continuar_de', { n: retomar })}
              </button>
            )}
            {idiomaIncompleto && pagina <= 2 && <p className="ws-leitor__nota">{t('webShard.leitor.fallback_idioma')}</p>}
          </div>
        )}

        <LeitorPaginas
          paginas={paginasVisiveis}
          proporcao={cap.proporcao}
          onPagina={onPagina}
          onToque={alternar}
          ultimaRef={cortado ? null : ultimaPaginaRef}
        />

        {cortado && <GateLeitura />}

        {avisoAutorAberto && cap.aviso_autor && (
          <AvisoAutor id={cap.aviso_autor} cor={titulo.cor} onFechar={() => setAvisoAutorAberto(false)} />
        )}

        {!cortado && <LeitorFim
          titulo={titulo}
          cap={cap}
          proximo={proximo}
          proximoLiberado={Boolean(proximo && liberado(proximo))}
          proximoData={proximo ? dataPara(proximo) : null}
          nivel={nivel}
          idioma={idioma}
          isAdmin={isAdmin}
          onCompartilhar={compartilhar}
          avisoCompartilhar={aviso}
        />}
      </div>
    </>
  )
}
