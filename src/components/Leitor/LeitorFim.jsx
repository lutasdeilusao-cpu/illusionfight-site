import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import Reacoes from '../Reacoes/Reacoes'
import './LeitorFim.css'

/** Fim do capítulo: a marca de fim, as reações (as mesmas do WEB SHARD) e o
 *  caminho — o próximo capítulo em destaque, o anterior e o índice. */
export default function LeitorFim({ reacoes, idioma, isAdmin, proximo, anterior, indice }) {
  const { t } = useLanguage()
  return (
    <footer className="leitor-fim">
      <div className="leitor-fim__marca" aria-hidden="true"><span>{t('pages.leitor.fim_capitulo')}</span></div>

      {reacoes && (
        <div className="leitor-fim__reacoes">
          <Reacoes titulo={reacoes.titulo} capitulo={reacoes.capitulo} idioma={idioma} isAdmin={isAdmin} />
        </div>
      )}

      {proximo && (
        <Link to={proximo.rota} className="leitor-fim__proximo">
          <span className="leitor-fim__eyebrow">{t('pages.leitor.proximo')} · {proximo.numero}</span>
          <strong>{proximo.titulo}</strong>
          {proximo.resumo && <p>{proximo.resumo}</p>}
          <span className="leitor-fim__seta" aria-hidden="true">→</span>
        </Link>
      )}

      <nav className="leitor-fim__caminho">
        {anterior ? <Link to={anterior.rota} className="leitor-fim__link">← {anterior.titulo}</Link> : <span />}
        <Link to={indice.rota} className="leitor-fim__link leitor-fim__link--indice">{indice.rotulo}</Link>
      </nav>
    </footer>
  )
}
