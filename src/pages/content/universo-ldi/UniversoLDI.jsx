import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { usePersonagens } from '../../../hooks/usePersonagens'
import CharacterCard from '../../../components/CharacterCard'
import { Secao } from './useRevela'
import MundoMitologia from './MundoMitologia'
import DoisMundos from './secoes/DoisMundos'
import Mapa from './secoes/Mapa'
import LinhaDoTempo from './secoes/LinhaDoTempo'
import Arena from './secoes/Arena'
import Xakaxi from './secoes/Xakaxi'
import Glossario from './secoes/Glossario'
import dataPt from '../../../data/mundo-pt.json'
import dataEn from '../../../data/mundo-en.json'
import dataEs from '../../../data/mundo-es.json'
import './UniversoLDI.css'
import './Hero.css'

const DADOS = { pt: dataPt, en: dataEn, es: dataEs }
const PROTAGONISTAS = ['kim', 'jack', 'nina']
const ORDEM = ['personagens', 'mitologia', 'mundos', 'bravara', 'timeline', 'ldi', 'xakaxi', 'glossario']

/** Barra fina no topo que acompanha a leitura da página. */
function useProgresso(barraRef) {
  useEffect(() => {
    let raf = 0
    const medir = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      barraRef.current?.style.setProperty('--uldi-progresso', p.toFixed(4))
    }
    const pedir = () => { if (!raf) raf = requestAnimationFrame(medir) }
    medir()
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    return () => { window.removeEventListener('scroll', pedir); window.removeEventListener('resize', pedir); cancelAnimationFrame(raf) }
  }, [barraRef])
}

/** Seção que está no meio da tela agora (para o índice). */
function useSecaoAtual() {
  const [atual, setAtual] = useState(ORDEM[0])
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(e => { if (e.isIntersecting) setAtual(e.target.id) })
    }, { rootMargin: '-45% 0px -50% 0px' })
    ORDEM.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])
  return atual
}

function Indice({ ui, atual }) {
  const [aberto, setAberto] = useState(false)
  useEffect(() => {
    if (!aberto) return
    const esc = e => { if (e.key === 'Escape') setAberto(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [aberto])

  const ir = id => {
    setAberto(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const posicao = Math.max(0, ORDEM.indexOf(atual))

  return createPortal(
    <>
      <button type="button" className="uldi-indice-btn" onClick={() => setAberto(true)} aria-expanded={aberto}>
        <span className="uldi-indice-btn__num">{String(posicao + 1).padStart(2, '0')}</span>
        <span className="uldi-indice-btn__nome">{ui.secoes[atual]}</span>
        <span className="uldi-indice-btn__rotulo">{ui.indice}</span>
      </button>
      <div className={`uldi-indice${aberto ? ' is-aberto' : ''}`} aria-hidden={!aberto}>
        <button type="button" className="uldi-indice__fundo" onClick={() => setAberto(false)} aria-label={ui.fechar} tabIndex={aberto ? 0 : -1} />
        <nav className="uldi-indice__folha">
          <span className="if-eyebrow">{ui.indice}</span>
          {ORDEM.map((id, i) => (
            <button
              key={id}
              type="button"
              tabIndex={aberto ? 0 : -1}
              className={`uldi-indice__item${id === atual ? ' is-atual' : ''}`}
              onClick={() => ir(id)}
            >
              <span className="uldi-indice__n">{String(i + 1).padStart(2, '0')}</span>
              {ui.secoes[id]}
            </button>
          ))}
        </nav>
      </div>
    </>,
    document.body
  )
}

export default function UniversoLDI() {
  const { locale, t } = useLanguage()
  const dados = DADOS[locale] ?? dataPt
  const { ui } = dados
  const todos = usePersonagens()
  const protagonistas = todos.filter(p => PROTAGONISTAS.includes(p.id))
  const barraRef = useRef(null)
  useProgresso(barraRef)
  const atual = useSecaoAtual()

  return (
    <div className="uldi">
      <Helmet>
        <title>{t('pages.helmet.mundo')}</title>
        <meta name="description" content={t('pages.mundo.og_desc')} />
        <meta property="og:title" content={t('pages.mundo.og_title')} />
        <meta property="og:description" content={t('pages.mundo.og_desc')} />
        <meta property="og:url" content="https://illusionfight.com/universos/lutas-de-ilusao" />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="uldi-progresso" ref={barraRef} aria-hidden="true" />

      <header className="uldi-hero">
        <span className="uldi-hero__ceu" aria-hidden="true" />
        <span className="uldi-hero__brasas" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => <i key={i} />)}
        </span>
        <span className="uldi-sigilo" aria-hidden="true">
          <span className="uldi-sigilo__aro" />
          <span className="uldi-sigilo__aro uldi-sigilo__aro--2" />
          <span className="uldi-sigilo__elementos">
            {Array.from({ length: 6 }, (_, i) => <i key={i} />)}
          </span>
          <span className="uldi-sigilo__nucleo" />
        </span>
        <div className="uldi-hero__corpo">
          <Link to="/universos" className="uldi-hero__voltar">{t('pages.universo.voltar')}</Link>
          <span className="if-eyebrow">{ui.eyebrow}</span>
          <h1 className="uldi-hero__titulo" data-texto={ui.titulo}>{ui.titulo}</h1>
          <p className="uldi-hero__sub">{ui.sub}</p>
          <dl className="uldi-hero__stats">
            {ui.stats.map(([valor, rotulo]) => (
              <div key={rotulo} className="uldi-stat">
                <dt>{valor}</dt>
                <dd>{rotulo}</dd>
              </div>
            ))}
          </dl>
          <span className="uldi-hero__rolar">{ui.rolar}</span>
        </div>
      </header>

      <Secao id="personagens" indice={1} titulo={ui.secoes.personagens}>
        <div className="uldi-personagens">
          {protagonistas.map(p => <CharacterCard key={p.id} character={p} />)}
        </div>
        <Link to="/personagens" className="if-btn uldi-cta">{ui.ver_todos}</Link>
      </Secao>

      <MundoMitologia mitologia={dados.mitologia} indice={2} titulo={ui.secoes.mitologia} />

      <Secao id="mundos" indice={3} titulo={ui.mundos_titulo} intro={ui.mundos_intro}>
        <DoisMundos mundos={dados.mundos} ui={ui} />
      </Secao>

      <Secao id="bravara" indice={4} titulo={ui.mapa_titulo} alt>
        <Mapa locais={dados.localizacoes} mapa={dados.mapa} ui={ui} />
      </Secao>

      <Secao id="timeline" indice={5} titulo={ui.timeline_titulo} intro={ui.timeline_intro}>
        <LinhaDoTempo pontos={dados.timeline} />
      </Secao>

      <Secao id="ldi" indice={6} titulo={ui.arena_titulo} intro={ui.arena_intro} alt>
        <Arena dados={dados} ui={ui} />
      </Secao>

      <Secao id="xakaxi" indice={7} titulo={ui.xakaxi_titulo} intro={dados.xakaxi.intro}>
        <Xakaxi xakaxi={dados.xakaxi} ui={ui} />
      </Secao>

      <Secao id="glossario" indice={8} titulo={ui.glossario_titulo} alt>
        <Glossario itens={dados.glossario} ui={ui} />
      </Secao>

      <Indice ui={ui} atual={atual} />
    </div>
  )
}
