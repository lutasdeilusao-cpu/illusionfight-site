import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import {
  capituloTemConteudo, formatarData, localizado, miniaturaCapitulo, numeroCapitulo, rotaCapitulo,
} from '../../../../lib/webshard/catalogo'
import './CapituloLinha.css'

/** Uma linha de capítulo (lista do título e feed do hub). Liberado vira
 *  link; travado mostra a data de saída. `progresso` é o do título inteiro
 *  — só pinta "lendo/lido" se for deste capítulo. */
export default function CapituloLinha({ titulo, cap, liberado, progresso, mostrarTitulo = false, previa = false }) {
  const { t, locale } = useLanguage()
  const temConteudo = capituloTemConteudo(cap)
  const doCapitulo = progresso?.cap === cap.id ? progresso : null
  const lido = doCapitulo && doCapitulo.total && doCapitulo.pagina >= doCapitulo.total

  let estado
  if (!liberado) {
    estado = cap.data_publicacao
      ? t('webShard.cap.em_breve_data', { data: formatarData(cap.data_publicacao) })
      : t('webShard.cap.em_breve')
  } else if (lido) {
    estado = t('webShard.cap.lido')
  } else if (doCapitulo) {
    estado = t('webShard.cap.lendo', { p: doCapitulo.pagina, t: doCapitulo.total || cap.paginas })
  } else {
    estado = t('webShard.cap.paginas', { n: cap.paginas })
  }

  const miolo = (
    <>
      <span className="ws-cap__thumb">
        {temConteudo && <img src={miniaturaCapitulo(titulo, cap)} alt="" loading="lazy" decoding="async" />}
        <span className="ws-cap__num">{numeroCapitulo(cap)}</span>
      </span>
      <span className="ws-cap__corpo">
        <span className="ws-cap__rotulo">
          {mostrarTitulo ? `${localizado(titulo, 'nome', locale)} · ` : ''}
          {t('webShard.cap.rotulo', { n: numeroCapitulo(cap) })}
        </span>
        <span className="ws-cap__nome">{temConteudo ? localizado(cap, 'titulo', locale) : t('webShard.cap.em_breve')}</span>
        <span className="ws-cap__meta">
          <span className={`ws-cap__estado${lido ? ' is-lido' : ''}${doCapitulo && !lido ? ' is-lendo' : ''}`}>{estado}</span>
          {temConteudo && (cap.idiomas || ['pt']).map(l => (
            <span key={l} className="ws-cap__lang">{l.toUpperCase()}</span>
          ))}
          {previa && <span className="ws-cap__previa">{t('webShard.leitor.admin_previa')}</span>}
        </span>
      </span>
      {liberado && <span className="ws-cap__seta" aria-hidden="true">›</span>}
    </>
  )

  const classe = `ws-cap${liberado ? '' : ' ws-cap--travado'}${doCapitulo && !lido ? ' is-active' : ''}`
  return liberado
    ? <Link to={rotaCapitulo(titulo, cap)} className={classe} style={{ '--ws-cor': titulo.cor }}>{miolo}</Link>
    : <div className={classe} style={{ '--ws-cor': titulo.cor }}>{miolo}</div>
}
