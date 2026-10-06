import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import { useRadio } from '../../../../components/RadioNina/RadioNinaContext'
import musicas from '../../../../data/musicas.json'
import HomeSectionHeading from './HomeSectionHeading'
import './MusicSection.css'

const capas = Object.values(import.meta.glob('../../../../assets/images/music/*.png', { eager: true, import: 'default' }))

/** Músicas na Home: o carrossel dos lançamentos — tocar numa capa já toca a
 *  música pela Rádio Nina (o mesmo tocador da barra e da página /musicas) —
 *  e o botão de ligar a rádio. Sem "em breve": só o que já saiu. */
export default function MusicSection() {
  const { t } = useLanguage()
  const { estado, tocando, faixaAtual, ligar, alternar, tocarKey, travaDe } = useRadio()

  const lista = useMemo(() => {
    const comCapa = musicas.map((m, i) => ({ ...m, _img: capas[i % capas.length] }))
    return [...comCapa, ...comCapa]
  }, [])

  const tocandoEsta = key => tocando && faixaAtual?.key === key
  const tocar = m => (faixaAtual?.key === m.arquivo ? alternar() : tocarKey(m.arquivo))
  const radioLigada = estado !== 'oculto' && Boolean(faixaAtual)

  return (
    <section className="music-section">
      <div className="container">
        <HomeSectionHeading eyebrow={t('home.section_music_category')} title={t('home.section_music')} />
        <div className="music-carousel">
          <div className="music-carousel__track">
            {lista.map((m, i) => (
              <div key={`${m.id}-${i}`} className="music-item">
                {m.arquivo && travaDe(m.arquivo) ? (
                  <Link to="/musicas" className="music-circle is-travada" aria-label={`🔒 ${m.titulo}`}>
                    <img src={m._img} alt="" width="300" height="300" loading="lazy" decoding="async" />
                    <span className="music-circle__play" aria-hidden="true">🔒</span>
                  </Link>
                ) : m.arquivo ? (
                  <button type="button" className={`music-circle${faixaAtual?.key === m.arquivo ? ' is-ativa' : ''}`} onClick={() => tocar(m)} aria-label={`${t('pages.musicas.tocar')} ${m.titulo}`}>
                    <img src={m._img} alt="" width="300" height="300" loading="lazy" decoding="async" />
                    <span className="music-circle__play" aria-hidden="true">{tocandoEsta(m.arquivo) ? '⏸' : '▶'}</span>
                  </button>
                ) : (
                  <Link to="/musicas" className="music-circle" aria-label={m.titulo}>
                    <img src={m._img} alt="" width="300" height="300" loading="lazy" decoding="async" />
                  </Link>
                )}
                <p className="music-title">{m.titulo}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="music-section__acoes">
          <button type="button" className="music-section__radio" onClick={() => (radioLigada ? alternar() : ligar('home'))}>
            {tocando ? `⏸ ${t('pages.musicas.pausar_radio')}` : `▶ ${t('pages.musicas.ouvir_radio')}`}
          </button>
          <Link to="/musicas" className="music-section__todas">{t('pages.musicas.ver_todas')} →</Link>
        </div>
      </div>
    </section>
  )
}
