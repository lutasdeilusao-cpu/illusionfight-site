import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../../context/LanguageContext'
import { Link } from 'react-router-dom'
import { useRadio } from '../../components/RadioNina/RadioNinaContext'
import musicas from '../../data/musicas.json'
import { platformIconMap } from '../../components/PlatformIcons'
import arteBanda from '../../assets/images/banners/banner-04.webp'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import './Musicas.css'

/* /musicas — a área de música do portal, com a Rádio Nina dentro (redesign
   completo de 01/10/2026, no padrão do WEB SHARD e de Histórias):
   1. o herói é a RÁDIO: a arte da banda sangrando na coluna, um play e começa;
      tocando, vira o painel "no ar" com equalizador, faixa e controles;
   2. o lançamento em destaque;
   3. a discografia — estante de capas (tocar na capa = toca na rádio; no nome
      = "onde ouvir", as plataformas);
   4. o que só existe na rádio — lista numerada no padrão do drawer.
   O tocador é o MESMO da barra (useRadio, components/RadioNina). */

const capas = Object.values(import.meta.glob('../../assets/images/music/*.png', { eager: true, import: 'default' }))
const capaDe = i => capas[i % capas.length]
const mmss = s => (!Number.isFinite(s) || s < 0 ? '0:00' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`)
const num = i => String(i + 1).padStart(2, '0')

function Equalizador({ ativo }) {
  return <span className={`mu-eq${ativo ? ' is-on' : ''}`} aria-hidden="true"><i /><i /><i /><i /></span>
}

/** Folha "onde ouvir" de uma música: capa, tocar na rádio e as plataformas. */
// Data no formato curto do idioma (dd/mm/aaaa).
const dataCurta = (iso, locale) => new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-ES' : 'pt-BR', { timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))

/** Cadeado de música da T1 ainda exclusiva de assinante. */
function Cadeado({ trava, t, locale }) {
  return (
    <div className="mu-cadeado">
      <strong>🔒 {t('pages.musicas.trava_titulo')}</strong>
      <span>{t('pages.musicas.trava_libera', { data: dataCurta(trava.liberaEm, locale) })}</span>
      <Link to="/assinar" className="if-btn if-btn--amber">{t('pages.musicas.trava_assinar')}</Link>
    </div>
  )
}

function OndeOuvir({ musica, capa, tocando, onTocar, onFechar, t, trava, locale }) {
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onFechar])
  return (
    <div className="mu-folha" role="dialog" aria-modal="true" aria-label={musica.titulo}>
      <button type="button" className="mu-folha__fundo" onClick={onFechar} aria-label={t('pages.musicas.fechar')} />
      <div className="mu-folha__card">
        <div className="mu-folha__topo">
          <img src={capa} alt="" width="96" height="96" />
          <div>
            <span className="if-eyebrow">{t('pages.musicas.onde_ouvir')}</span>
            <strong>{musica.titulo}</strong>
            <small>{musica.artista}{musica.ano ? ` · ${musica.ano}` : ''}</small>
          </div>
        </div>
        {trava && <Cadeado trava={trava} t={t} locale={locale} />}
        {musica.arquivo && !trava && (
          <button type="button" className="if-btn if-btn--amber mu-folha__tocar" onClick={onTocar}>
            {tocando ? `⏸ ${t('pages.musicas.pausar')}` : `▶ ${t('pages.musicas.tocar_radio')}`}
          </button>
        )}
        <ul className="mu-folha__lista">
          {musica.plataformas.map((p, i) => {
            const Icon = platformIconMap[p.icone]
            return (
              <li key={p.nome}>
                <a className="if-item" href={p.url} target="_blank" rel="noopener noreferrer">
                  <span className="if-item__index">{num(i)}</span>
                  {Icon && <span className="mu-folha__icone"><Icon /></span>}
                  <span className="mu-folha__nome">{t('pages.musicas.ouvir_em', { nome: p.nome })}</span>
                  <span className="mu-folha__seta" aria-hidden="true">↗</span>
                </a>
              </li>
            )
          })}
        </ul>
        <button type="button" className="if-btn if-btn--ghost mu-folha__fechar" onClick={onFechar}>{t('pages.musicas.fechar')}</button>
      </div>
    </div>
  )
}

export default function Musicas() {
  const { t, locale } = useLanguage()
  const { estado, tocando, faixaAtual, tempo, duracao, pool, garantirPool, ligar, alternar, pular, tocarKey, seek, travaDe, travadas } = useRadio()
  const [aberta, setAberta] = useState(null) // índice da música na folha "onde ouvir"

  useEffect(() => { garantirPool() }, [garantirPool])

  const arquivos = useMemo(() => new Set(musicas.map(m => m.arquivo).filter(Boolean)), [])
  const soNaRadio = useMemo(() => pool.filter(f => !arquivos.has(f.key)), [pool, arquivos])
  const soNaRadioTravadas = useMemo(() => travadas.filter(f => !arquivos.has(f.key)), [travadas, arquivos])
  const destaque = musicas[0]

  const noAr = estado !== 'oculto' && Boolean(faixaAtual)
  const pct = duracao > 0 ? (tempo / duracao) * 100 : 0
  const eDaVez = key => Boolean(key) && faixaAtual?.key === key
  const tocandoEsta = key => eDaVez(key) && tocando
  const tocar = key => (eDaVez(key) ? alternar() : tocarKey(key))
  const tituloNoAr = faixaAtual?.ad ? t('pages.musicas.publicidade') : faixaAtual?.titulo

  return (
    <>
      <Helmet>
        <title>{t('pages.musicas.meta_title')}</title>
        <meta name="description" content={t('pages.musicas.meta_desc')} />
        <meta property="og:title" content={t('pages.musicas.meta_title')} />
        <meta property="og:description" content={t('pages.musicas.meta_desc')} />
        <meta property="og:url" content="https://illusionfight.com/musicas" />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/musicas" />
      </Helmet>

      <div className="mu">
        <div className="container">
          <header className="mu__cabeca">
            <span className="if-eyebrow">{t('pages.musicas.eyebrow')}</span>
            <h1 className="mu__h1">{t('pages.musicas.titulo')}</h1>
            <p className="mu__sub">{t('musicas.subtitle')}</p>
          </header>

          {/* ── 1. A Rádio Nina ── */}
          <section className={`mu-radio${noAr ? ' is-no-ar' : ''}${tocando ? ' is-tocando' : ''}`} aria-label={t('pages.musicas.radio_titulo')}>
            <div className="mu-radio__arte">
              <img src={arteBanda} alt="" fetchpriority="high" decoding="async" />
            </div>
            <div className="mu-radio__conteudo">
              <span className="mu-radio__selo">
                <Equalizador ativo={tocando} />
                {tocando ? t('pages.musicas.no_ar') : t('pages.musicas.radio_titulo')}
              </span>
              <h2 className="mu-radio__nome">{noAr ? tituloNoAr : t('pages.musicas.radio_titulo')}</h2>
              {noAr ? (
                <>
                  <div className="mu-radio__barra">
                    <div className="mu-radio__fill" style={{ '--pct': `${pct}%` }} />
                    <input type="range" min="0" max={duracao || 0} step="1" value={tempo} onChange={e => seek(Number(e.target.value))} aria-label={t('pages.musicas.posicao')} />
                  </div>
                  <div className="mu-radio__tempo"><span>{mmss(tempo)}</span><span>{mmss(duracao)}</span></div>
                  <div className="mu-radio__controles">
                    <button type="button" className="mu-radio__btn" onClick={() => pular(-1, 'user')} aria-label={t('pages.musicas.anterior')}>⏮</button>
                    <button type="button" className="mu-radio__btn mu-radio__btn--play" onClick={alternar} aria-label={tocando ? t('pages.musicas.pausar') : t('pages.musicas.tocar')}>{tocando ? '⏸' : '▶'}</button>
                    <button type="button" className="mu-radio__btn" onClick={() => pular(1, 'user')} aria-label={t('pages.musicas.proxima')}>⏭</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mu-radio__texto">{t('pages.musicas.radio_chamada')}</p>
                  <p className="mu-radio__meta">{t('pages.musicas.radio_sub', { n: pool.length || '…' })}</p>
                  <div className="mu-radio__acoes">
                    <button type="button" className="if-btn if-btn--primary" onClick={() => ligar('musicas')}>▶ {t('pages.musicas.ligar_radio')}</button>
                    <a href="#discografia" className="if-btn if-btn--ghost">{t('pages.musicas.ver_lancamentos')}</a>
                  </div>
                </>
              )}
              <img className="mu-radio__nina" src={ninaImg} alt="" width="84" height="84" aria-hidden="true" />
            </div>
          </section>

          {/* ── 2. Lançamento em destaque ── */}
          {destaque && (
            <section className="mu__secao">
              <div className="mu__secao-cabeca">
                <span className="if-eyebrow">{t('pages.musicas.destaque_eyebrow')}</span>
                <h2 className="mu__h2">{t('pages.musicas.destaque')}</h2>
              </div>
              <article className={`mu-destaque if-panel${eDaVez(destaque.arquivo) ? ' is-ativa' : ''}${travaDe(destaque.arquivo) ? ' is-travada' : ''}`} style={{ '--mu-cor': destaque.cor }}>
                <button type="button" className="mu-destaque__capa" onClick={() => (travaDe(destaque.arquivo) ? setAberta(0) : destaque.arquivo && tocar(destaque.arquivo))} aria-label={`${t('pages.musicas.tocar')} ${destaque.titulo}`}>
                  <img src={capaDe(0)} alt="" width="300" height="300" />
                  <span className="mu-destaque__play" aria-hidden="true">{travaDe(destaque.arquivo) ? '🔒' : tocandoEsta(destaque.arquivo) ? '⏸' : '▶'}</span>
                </button>
                <div className="mu-destaque__info">
                  <span className="if-badge if-badge--amber">{destaque.ano}</span>
                  <h3>{destaque.titulo}</h3>
                  <small>{destaque.artista}</small>
                  {travaDe(destaque.arquivo) && <Cadeado trava={travaDe(destaque.arquivo)} t={t} locale={locale} />}
                  <div className="mu-plataformas">
                    {destaque.plataformas.map(p => {
                      const Icon = platformIconMap[p.icone]
                      return <a key={p.nome} href={p.url} target="_blank" rel="noopener noreferrer" title={p.nome} aria-label={t('pages.musicas.ouvir_em', { nome: p.nome })}>{Icon ? <Icon /> : p.nome}</a>
                    })}
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* ── 3. Discografia ── */}
          <section className="mu__secao" id="discografia">
            <div className="mu__secao-cabeca">
              <span className="if-eyebrow">{t('pages.musicas.discografia_eyebrow', { n: musicas.length })}</span>
              <h2 className="mu__h2">{t('pages.musicas.discografia')}</h2>
              <p className="mu__hint">{t('pages.musicas.discografia_hint')}</p>
            </div>
            <div className="mu-estante if-stagger">
              {musicas.map((m, i) => (
                <article key={m.id} className={`mu-card${eDaVez(m.arquivo) ? ' is-ativa' : ''}${m.arquivo ? '' : ' is-fora'}${travaDe(m.arquivo) ? ' is-travada' : ''}`} style={{ '--mu-cor': m.cor }}>
                  <button type="button" className="mu-card__capa" onClick={() => (m.arquivo && !travaDe(m.arquivo) ? tocar(m.arquivo) : setAberta(i))} aria-label={m.arquivo ? `${t('pages.musicas.tocar')} ${m.titulo}` : t('pages.musicas.onde_ouvir')}>
                    <img src={capaDe(i)} alt="" width="300" height="300" loading="lazy" decoding="async" />
                    <span className="mu-card__indice">{num(i)}</span>
                    {m.arquivo
                      ? <span className="mu-card__play" aria-hidden="true">{travaDe(m.arquivo) ? '🔒' : tocandoEsta(m.arquivo) ? <Equalizador ativo /> : '▶'}</span>
                      : <span className="mu-card__fora">{t('pages.musicas.so_plataformas')}</span>}
                  </button>
                  <button type="button" className="mu-card__info" onClick={() => setAberta(i)}>
                    <strong>{m.titulo}</strong>
                    <small>{m.ano} · {t('pages.musicas.plataformas_n', { n: m.plataformas.length })}</small>
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* ── 4. Só na Rádio Nina ── */}
          {(soNaRadio.length > 0 || soNaRadioTravadas.length > 0) && (
            <section className="mu__secao">
              <div className="mu__secao-cabeca">
                <span className="if-eyebrow">{t('pages.musicas.exclusivas_eyebrow')}</span>
                <h2 className="mu__h2">{t('pages.musicas.so_na_radio')}</h2>
                <p className="mu__hint">{t('pages.musicas.so_na_radio_dica')}</p>
              </div>
              <ol className="mu-exclusivas">
                {soNaRadio.map((f, i) => (
                  <li key={f.key}>
                    <button type="button" className={`if-item mu-exclusiva${eDaVez(f.key) ? ' is-active' : ''}`} onClick={() => tocar(f.key)}>
                      <span className="if-item__index">{num(i)}</span>
                      <span className="mu-exclusiva__nome">{f.titulo}</span>
                      <span className="mu-exclusiva__acao" aria-hidden="true">{tocandoEsta(f.key) ? <Equalizador ativo /> : '▶'}</span>
                    </button>
                  </li>
                ))}
                {soNaRadioTravadas.map(f => (
                  <li key={f.key}>
                    <Link to="/assinar" className="if-item mu-exclusiva is-travada">
                      <span className="if-item__index">🔒</span>
                      <span className="mu-exclusiva__nome">{f.titulo}<small>{t('pages.musicas.trava_libera', { data: dataCurta(travaDe(f.key)?.liberaEm || '2099-01-01', locale) })}</small></span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <p className="mu__seo">{t('pages.musicas.seo')}</p>
        </div>
      </div>

      {aberta != null && musicas[aberta] && (
        <OndeOuvir
          musica={musicas[aberta]}
          capa={capaDe(aberta)}
          tocando={tocandoEsta(musicas[aberta].arquivo)}
          onTocar={() => tocar(musicas[aberta].arquivo)}
          trava={travaDe(musicas[aberta].arquivo)}
          locale={locale}
          onFechar={() => setAberta(null)}
          t={t}
        />
      )}
    </>
  )
}
