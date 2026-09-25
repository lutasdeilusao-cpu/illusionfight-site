import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import {
  capituloTemConteudo, formatarData, localizado, miniaturaCapitulo, rotaCapitulo, rotaTitulo, rotuloCapitulo,
} from '../../../../lib/webshard/catalogo'
import Reacoes from './Reacoes'
import CascataLiberacao from './CascataLiberacao'
import LerAntesCta from './LerAntesCta'
import './LeitorFim.css'

/** Fim do capítulo: reagir, seguir pro próximo (ou saber quando sai),
 *  compartilhar, voltar pra lista. */
export default function LeitorFim({ titulo, cap, proximo, proximoLiberado, proximoData, nivel, idioma, isAdmin, onCompartilhar, avisoCompartilhar }) {
  const { t, locale } = useLanguage()
  const proximoReal = proximo && capituloTemConteudo(proximo)

  return (
    <section className="ws-fim" style={{ '--ws-cor': titulo.cor }}>
      <div className="ws-fim__corte" aria-hidden="true" />
      <div className="container ws-fim__miolo">
        <span className="ws-fim__eyebrow">{t('webShard.leitor.fim_eyebrow')}</span>
        <p className="ws-fim__cap">
          {rotuloCapitulo(cap, t)} · {localizado(cap, 'titulo', locale)}
        </p>

        <div className="ws-fim__bloco">
          <Reacoes titulo={titulo.slug} capitulo={cap.id} idioma={idioma} isAdmin={isAdmin} onCompartilhar={onCompartilhar} />
        </div>

        <div className="ws-fim__bloco">
          {proximoReal && proximoLiberado ? (
            <Link to={rotaCapitulo(titulo, proximo)} className="ws-fim__proximo">
              <img src={miniaturaCapitulo(titulo, proximo, locale)} alt="" decoding="async" loading="lazy" />
              <span className="ws-fim__proximo-corpo">
                <span className="if-eyebrow">{t('webShard.leitor.proximo')}</span>
                <span className="ws-fim__proximo-nome">
                  {rotuloCapitulo(proximo, t)} · {localizado(proximo, 'titulo', locale)}
                </span>
              </span>
              <span className="ws-fim__proximo-seta" aria-hidden="true">›</span>
            </Link>
          ) : (
            <div className="ws-fim__espera">
              <p className="ws-fim__aguarde">
                {proximo?.liberacao
                  ? `${t('webShard.leitor.proximo')} · ${rotuloCapitulo(proximo, t)}`
                  : proximoData
                    ? t('webShard.leitor.proximo_em', { data: formatarData(proximoData) })
                    : t('webShard.leitor.proximo_breve')}
              </p>
              {proximo?.liberacao && (
                <>
                  <CascataLiberacao liberacao={proximo.liberacao} nivel={nivel} />
                  <LerAntesCta nivel={nivel} />
                </>
              )}
            </div>
          )}
        </div>

        <div className="ws-fim__acoes">
          <button type="button" className="if-btn if-btn--amber" onClick={onCompartilhar}>
            {t('webShard.leitor.compartilhar')}
          </button>
          <Link to={rotaTitulo(titulo)} className="if-btn if-btn--ghost">{t('webShard.leitor.todos_capitulos')}</Link>
        </div>
        <p className="ws-fim__aviso" role="status">{avisoCompartilhar}</p>
      </div>
    </section>
  )
}
