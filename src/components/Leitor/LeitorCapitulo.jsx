import { useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useReader } from '../../context/ReaderContext'
import { useBarraAutoOculta } from '../../hooks/useBarraAutoOculta'
import GateLeitura, { cortarTexto } from '../GateLeitura/GateLeitura'
import LeitorBarra from './LeitorBarra'
import LeitorAjustes from './LeitorAjustes'
import LeitorFim from './LeitorFim'
import { leitorMarkdown, semTituloDoArquivo } from './leitorMarkdown'
import { useLeitorPreferencias } from './useLeitorPreferencias'
import { useProgressoLeitura, minutosDeLeitura } from './useProgressoLeitura'
import './LeitorCapitulo.css'

/* O LEITOR de capítulo de texto do site — um só pra linha principal, contos
   e obras (30/09/2026; antes eram três cópias de ~200 linhas cada). A página
   de cada tipo só resolve o dado (qual .md, quem pode ler, próximo e anterior)
   e entrega aqui. Aqui é só apresentação: barra, cabeçalho, texto, ajustes e
   o fim com reações.

   Props:
     md            texto do capítulo (markdown)
     carregando    ainda buscando o .md
     naoEncontrado capítulo inexistente ou não liberado
     eyebrow       "CONTOS DE ILUSÃO"
     obra          nome da história (vai na barra e no cabeçalho)
     numero        "03" | null
     titulo        título do capítulo
     tituloAba     <title> da página
     onVoltar      volta pro índice
     indice        { rota, rotulo }
     anterior / proximo   { rota, titulo, numero, resumo } | null
     reacoes       { titulo, capitulo } — chave das reações (ver lib/webshard/reacoes)
     isAdmin, semConta   (semConta = visitante: lê até a metade, GateLeitura)
     sentinelRef   ref opcional no fim do texto (conquista de leitura completa)
     idioma */
export default function LeitorCapitulo({
  md = '', carregando, naoEncontrado, eyebrow, obra, numero, titulo, tituloAba,
  onVoltar, indice, anterior, proximo, reacoes, isAdmin, semConta, sentinelRef, idioma,
}) {
  const { t } = useLanguage()
  const { setReaderMode } = useReader()
  const prefs = useLeitorPreferencias()
  const [ajustes, setAjustes] = useState(false)
  const { visivel } = useBarraAutoOculta()
  const textoRef = useRef(null)

  useEffect(() => { setReaderMode(true); return () => setReaderMode(false) }, [setReaderMode])

  const corpo = useMemo(() => semTituloDoArquivo(md), [md])
  const visivelNoGate = cortarTexto(corpo, semConta)
  const cortado = semConta && visivelNoGate !== corpo
  const minutos = useMemo(() => minutosDeLeitura(corpo), [corpo])
  const pct = useProgressoLeitura(textoRef, corpo)

  if (naoEncontrado) {
    return (
      <main className="leitor leitor--vazio">
        <Helmet><title>{t('pages.helmet.capitulo_nao_encontrado')}</title></Helmet>
        <p className="leitor-vazio__texto">{t('pages.livro.nao_encontrado')}</p>
        <Link to={indice.rota} className="leitor-vazio__link">{indice.rotulo}</Link>
      </main>
    )
  }

  return (
    <main className={`leitor leitor--fonte-${prefs.fonte} leitor--espaco-${prefs.espaco}`} style={{ '--leitor-tamanho': `${prefs.tamanho}px` }}>
      <Helmet><title>{tituloAba}</title></Helmet>
      <LeitorBarra visivel={visivel || ajustes} onVoltar={onVoltar} rotulo={numero ? `${t('pages.leitor.cap')} ${numero}` : eyebrow} nome={obra} pct={pct} onAjustes={() => setAjustes(true)} />

      <header className="leitor-cabeca">
        <span className="leitor-cabeca__eyebrow">{eyebrow}</span>
        <span className="leitor-cabeca__obra">{obra}</span>
        {numero && <span className="leitor-cabeca__numero" aria-hidden="true">{numero}</span>}
        <h1 className="leitor-cabeca__titulo">{titulo}</h1>
        <span className="leitor-cabeca__meta">{carregando ? '…' : t('pages.leitor.minutos', { n: minutos })}</span>
      </header>

      <article className="leitor-texto" ref={textoRef}>
        <ReactMarkdown components={leitorMarkdown}>{visivelNoGate}</ReactMarkdown>
        {cortado && <GateLeitura />}
        {!cortado && sentinelRef && <div ref={sentinelRef} className="leitor-texto__sentinela" />}
      </article>

      {!cortado && !carregando && (
        <LeitorFim reacoes={reacoes} idioma={idioma} isAdmin={isAdmin} proximo={proximo} anterior={anterior} indice={indice} />
      )}

      <LeitorAjustes aberto={ajustes} onFechar={() => setAjustes(false)} prefs={prefs} />
    </main>
  )
}
