import { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../../context/LanguageContext'
import { useRadio } from '../../components/RadioNina/RadioNinaContext'
import musicas from '../../data/musicas.json'
import { platformIconMap } from '../../components/PlatformIcons'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import './Musicas.css'

// Capas: as 16 artes da pasta music/, distribuídas na ordem do catálogo.
const capas = Object.values(import.meta.glob('../../assets/images/music/*.png', { eager: true, import: 'default' }))
const capaDe = i => capas[i % capas.length]

const mmss = s => (!Number.isFinite(s) || s < 0 ? '0:00' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`)

/** A área de Músicas com a Rádio Nina dentro (redesign de 30/09/2026): o
 *  tocador da rádio no topo — um play e começa a ouvir —, a lista das músicas
 *  lançadas (cada uma toca na hora pela rádio e leva pras plataformas), e as
 *  faixas que só existem na rádio. O tocador é o MESMO da barra (useRadio). */
export default function Musicas() {
  const { t } = useLanguage()
  const radio = useRadio()
  const { estado, tocando, faixaAtual, tempo, duracao, pool, garantirPool, ligar, alternar, pular, tocarKey, seek } = radio

  useEffect(() => { garantirPool() }, [garantirPool])

  const noCatalogo = useMemo(() => new Set(musicas.map(m => m.arquivo).filter(Boolean)), [])
  // Faixas que estão no servidor da rádio e não no catálogo (versões, inéditas).
  const soNaRadio = useMemo(() => pool.filter(f => !noCatalogo.has(f.key)), [pool, noCatalogo])

  const ligada = estado !== 'oculto' && Boolean(faixaAtual)
  const pct = duracao > 0 ? (tempo / duracao) * 100 : 0
  const play = () => (ligada ? alternar() : ligar('musicas'))
  const tocarFaixa = key => (faixaAtual?.key === key ? alternar() : tocarKey(key))
  const estaTocando = key => faixaAtual?.key === key && tocando

  return (
    <>
      <Helmet>
        <title>Music — Illusion Fight</title>
        <meta name="description" content="Listen to the Illusion Fight original soundtrack on Nina Radio — every song from the LDI universe, nonstop, right in your browser." />
        <meta property="og:title" content="Music — Illusion Fight" />
        <meta property="og:description" content="Listen to the Illusion Fight original soundtrack on Nina Radio." />
        <meta property="og:url" content="https://illusionfight.com/musicas" />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="website" />
        <link rel="alternate" hrefLang="pt" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hrefLang="en" href="https://illusionfight.com/musicas" />
        <link rel="alternate" hrefLang="es" href="https://illusionfight.com/musicas" />
      </Helmet>

      <div className="container musicas">
        <header className="musicas__head">
          <span className="if-eyebrow">{t('pages.musicas.eyebrow')}</span>
          <h1>{t('pages.musicas.titulo')}</h1>
          <p>{t('musicas.subtitle')}</p>
        </header>

        {/* ── A Rádio Nina ── */}
        <section className={`musicas-radio${tocando ? ' is-tocando' : ''}`} aria-label={t('pages.musicas.radio_titulo')}>
          <img className="musicas-radio__nina" src={ninaImg} alt="Nina" width="96" height="96" />
          <div className="musicas-radio__info">
            <span className="musicas-radio__selo">
              <i aria-hidden="true" />{tocando ? t('pages.musicas.no_ar') : t('pages.musicas.radio_titulo')}
            </span>
            <strong className="musicas-radio__faixa">
              {ligada ? (faixaAtual.ad ? t('pages.musicas.publicidade') : faixaAtual.titulo) : t('pages.musicas.radio_chamada')}
            </strong>
            <small>{ligada ? `${mmss(tempo)} / ${mmss(duracao)}` : t('pages.musicas.radio_sub', { n: pool.length || '…' })}</small>
          </div>
          <div className="musicas-radio__controles">
            {ligada && <button type="button" onClick={() => pular(-1, 'user')} aria-label={t('pages.musicas.anterior')}>⏮</button>}
            <button type="button" className="musicas-radio__play" onClick={play} aria-label={tocando ? t('pages.musicas.pausar') : t('pages.musicas.tocar')}>
              {tocando ? '⏸' : '▶'}
            </button>
            {ligada && <button type="button" onClick={() => pular(1, 'user')} aria-label={t('pages.musicas.proxima')}>⏭</button>}
          </div>
          {ligada && (
            <div className="musicas-radio__barra">
              <div className="musicas-radio__barra-fill" style={{ "--pct": `${pct}%` }} />
              <input type="range" min="0" max={duracao || 0} step="1" value={tempo} onChange={e => seek(Number(e.target.value))} aria-label={t('pages.musicas.posicao')} />
            </div>
          )}
        </section>

        {/* ── As músicas lançadas ── */}
        <section className="musicas-lista">
          <h2 className="musicas__sub">{t('pages.musicas.lancadas', { n: musicas.length })}</h2>
          <ol>
            {musicas.map((m, i) => {
              const ativa = m.arquivo && faixaAtual?.key === m.arquivo
              return (
                <li key={m.id} className={`musica-linha${ativa ? ' is-ativa' : ''}`}>
                  <button
                    type="button"
                    className="musica-linha__capa"
                    onClick={m.arquivo ? () => tocarFaixa(m.arquivo) : undefined}
                    disabled={!m.arquivo}
                    aria-label={m.arquivo ? `${estaTocando(m.arquivo) ? t('pages.musicas.pausar') : t('pages.musicas.tocar')} ${m.titulo}` : m.titulo}
                  >
                    <img src={capaDe(i)} alt="" width="56" height="56" loading="lazy" decoding="async" />
                    {m.arquivo && <span aria-hidden="true">{estaTocando(m.arquivo) ? '⏸' : '▶'}</span>}
                  </button>
                  <div className="musica-linha__info">
                    <strong>{m.titulo}</strong>
                    <small>{m.artista}{m.ano ? ` · ${m.ano}` : ''}{!m.arquivo && ` · ${t('pages.musicas.so_plataformas')}`}</small>
                    {m.plataformas.length > 0 && (
                      <div className="musica-linha__plataformas">
                        {m.plataformas.map(p => {
                          const Icon = platformIconMap[p.icone]
                          return (
                            <a key={p.nome} href={p.url} target="_blank" rel="noopener noreferrer" title={p.nome} aria-label={`${m.titulo} · ${p.nome}`}>
                              {Icon ? <Icon /> : p.nome}
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {/* ── Só na rádio: versões e faixas que ainda não saíram nas plataformas ── */}
        {soNaRadio.length > 0 && (
          <section className="musicas-lista">
            <h2 className="musicas__sub">{t('pages.musicas.so_na_radio')}</h2>
            <p className="musicas__dica">{t('pages.musicas.so_na_radio_dica')}</p>
            <ol>
              {soNaRadio.map((f, i) => (
                <li key={f.key} className={`musica-linha musica-linha--radio${faixaAtual?.key === f.key ? ' is-ativa' : ''}`}>
                  <button type="button" className="musica-linha__capa" onClick={() => tocarFaixa(f.key)} aria-label={`${estaTocando(f.key) ? t('pages.musicas.pausar') : t('pages.musicas.tocar')} ${f.titulo}`}>
                    <img src={capaDe(i + 7)} alt="" width="56" height="56" loading="lazy" decoding="async" />
                    <span aria-hidden="true">{estaTocando(f.key) ? '⏸' : '▶'}</span>
                  </button>
                  <div className="musica-linha__info">
                    <strong>{f.titulo}</strong>
                    <small>Isaias Leal · {t('pages.musicas.radio_titulo')}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </>
  )
}
