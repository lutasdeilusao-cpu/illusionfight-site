import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { trackEvent } from '../../../lib/analytics'
import holo from '../../../assets/images/creators/neoguide-holo.webp'
import NeoGuideFala from './NeoGuideFala'
import CreatorsCardapio from './CreatorsCardapio'
import { CreatorsArtes, CreatorsDuvidas, CreatorsFicha } from './CreatorsServicos'
import CreatorsTemas from './CreatorsTemas'
import { ASSUNTOS, SERVICOS } from '../data/creatorsCardapio'
import './CreatorsSalao.css'

// O que só o creator lê/joga antes do público (a regra mora nos dados e nas rotas).
const EXCLUSIVOS = [
  ['webshard', '/webtoon/'], ['herois', '/webtoon/herois-da-cidade/'], ['livro', '/historias/'],
  ['contos', '/historias/'], ['games', '/games/'],
]
const CONTATO = 'lutasdeilusao@gmail.com'

// Interesse da primeira visita → assunto do cardápio que sobe pro topo.
const ASSUNTO_DO_INTERESSE = { livros: 'livros', quadrinhos: 'webtoon', games: 'games', musica: 'universo', lore: 'universo' }

/** A mesa do creator: a NeoGuide pergunta sobre o que ele quer falar
 *  hoje e serve o que ele escolher. */
export default function CreatorsSalao({ nome, dias, interesses }) {
  const { t } = useLanguage()
  const [vista, setVista] = useState(null)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [vista])

  const assuntos = useMemo(() => {
    const preferidos = new Set(interesses.map(i => ASSUNTO_DO_INTERESSE[i]).filter(Boolean))
    return [...ASSUNTOS].sort((a, b) => Number(preferidos.has(b.id)) - Number(preferidos.has(a.id)))
      .map(a => ({ ...a, preferido: preferidos.has(a.id) }))
  }, [interesses])

  function escolher(id) {
    trackEvent('ui_click', { component: 'creators', element_id: id })
    setVista(id)
  }

  const assunto = ASSUNTOS.find(a => a.id === vista)
  const fala = vista ? t(`creators.falas.${vista}`) : t('creators.salao.fala', { nome })

  return (
    <section className="cr-salao">
      <header className="cr-salao__topo">
        <img className="cr-salao__holo" src={holo} alt="" width="720" height="1260" />
        <div className="cr-salao__veu" />
        <div className="cr-salao__mesa">
          <span className="if-eyebrow">{t('creators.salao.eyebrow')}</span>
          <h1>{t('creators.salao.titulo', { nome })}</h1>
          <span className="if-badge if-badge--amber">
            {dias == null ? t('creators.salao.sem_prazo') : t('creators.salao.dias', { n: dias })}
          </span>
        </div>
      </header>

      <div className="cr-salao__conversa">
        <NeoGuideFala key={vista || 'mesa'} nome={t('creators.neoguide.nome')} texto={fala} />
      </div>

      {!vista && (
        <>
          <section className="cr-boasvindas if-panel">
            <span className="if-eyebrow">{t('creators.boasvindas.eyebrow')}</span>
            <h2>{t('creators.boasvindas.titulo')}</h2>
            <p>{t('creators.boasvindas.texto')}</p>
            <p className="cr-boasvindas__aviso">{t('creators.boasvindas.aviso')}</p>
            <ul className="cr-boasvindas__lista">
              {EXCLUSIVOS.map(([id, rota]) => (
                <li key={id}>
                  <Link to={rota} onClick={() => trackEvent('ui_click', { component: 'creators', element_id: `exclusivo_${id}` })}>
                    <strong>{t(`creators.boasvindas.itens.${id}.titulo`)}</strong>
                    <small>{t(`creators.boasvindas.itens.${id}.texto`)}</small>
                  </Link>
                </li>
              ))}
            </ul>
            <p>{t('creators.boasvindas.feedback')}</p>
            <div className="cr-boasvindas__acoes">
              <a className="if-btn if-btn--ghost" href={`mailto:${CONTATO}?subject=Feedback%20creator`}>{t('creators.boasvindas.mandar_feedback')}</a>
              <Link className="if-btn if-btn--amber" to="/creators/destaques/">{t('creators.boasvindas.enviar_conteudo')}</Link>
            </div>
          </section>
          <div className="cr-salao__menu if-stagger">
            {assuntos.map((a, i) => (
              <button key={a.id} type="button" className="cr-salao__assunto" onClick={() => escolher(a.id)}>
                <img src={a.arte} alt="" loading="lazy" />
                <span className="cr-salao__assunto-veu" />
                <span className="cr-salao__assunto-num">{String(i + 1).padStart(2, '0')}</span>
                {a.preferido && <span className="cr-salao__pref">{t('creators.salao.pra_voce')}</span>}
                <span className="cr-salao__assunto-txt">
                  <strong>{a.icone} {t(`creators.${a.id}.titulo`)}</strong>
                  <small>{t(`creators.${a.id}.chamada`)}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="cr-salao__servicos">
            {SERVICOS.map(s => (
              <button key={s.id} type="button" className="cr-salao__servico if-item" onClick={() => escolher(s.id)}>
                <span aria-hidden="true">{s.icone}</span>
                <span>{t(`creators.servicos.${s.id}`)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {assunto && <CreatorsCardapio assunto={assunto} />}
      {vista === 'temas' && <CreatorsTemas />}
      {vista === 'artes' && <CreatorsArtes />}
      {vista === 'ficha' && <CreatorsFicha />}
      {vista === 'duvidas' && <CreatorsDuvidas />}

      {vista && (
        <div className="cr-salao__voltar">
          <button type="button" className="if-btn if-btn--ghost cr-salao__voltar-btn" onClick={() => setVista(null)}>
            {t('creators.salao.voltar')}
          </button>
        </div>
      )}
    </section>
  )
}
