import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import { useHistoriasAcesso } from '../../../hooks/useHistoriasAcesso'
import { creatorAtivo } from '../../../lib/creator'
import { Secao } from './useRevela'
import './MundoMitologia.css'

/** A origem do mundo (o Caos, os sete deuses, a profecia dos Xakaxi).
 *  Aberta para assinante, creator ativo e admin; o resto vê o convite. */
export default function MundoMitologia({ mitologia, indice, titulo }) {
  const { t } = useLanguage()
  const { perfil } = useAuth()
  const { isAdmin, nivel } = useHistoriasAcesso()
  const aberta = isAdmin || nivel === 'elite' || nivel === 'primordial' || creatorAtivo(perfil)

  if (!mitologia) return null

  return (
    <Secao id="mitologia" indice={indice} titulo={titulo || t('pages.mundo.mitologia')} alt>

        {!aberta ? (
          <div className="mito-trava if-panel">
            <span className="if-eyebrow">{t('pages.mundo.mitologia_trava_eyebrow')}</span>
            <p className="mito-trava__texto">{t('pages.mundo.mitologia_trava_texto')}</p>
            <Link to="/assinar" className="if-btn mito-trava__cta">{t('pages.mundo.mitologia_trava_cta')}</Link>
          </div>
        ) : (
          <div className="mito">
            <p className="mito__intro">{mitologia.intro}</p>

            <div className="mito__canto">
              {mitologia.criacao.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <h3 className="uldi-sub">{mitologia.deuses_titulo}</h3>
            <div className="mito__deuses">
              {mitologia.deuses.map(d => (
                <div key={d.nome} className={`mito-deus if-panel mito-deus--${d.id}`}>
                  <span className="mito-deus__elemento">{d.elemento}</span>
                  <h4 className="mito-deus__nome">{d.nome}</h4>
                  <p className="mito-deus__texto">{d.texto}</p>
                </div>
              ))}
            </div>

            <h3 className="uldi-sub">{mitologia.profecia_titulo}</h3>
            <div className="mito__canto">
              {mitologia.profecia.map((p, i) => <p key={i}>{p}</p>)}
              <blockquote className="mito__verso">
                {mitologia.verso.map((v, i) => <span key={i}>{v}</span>)}
              </blockquote>
              {mitologia.depois.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <p className="mito__fecho">{mitologia.fecho}</p>
          </div>
        )}
    </Secao>
  )
}
