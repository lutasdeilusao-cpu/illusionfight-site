import { Link } from 'react-router-dom'
import { useLanguage } from '../../../../context/LanguageContext'
import {
  capituloTemConteudo, diasAte, emBeta, formatarData, localizado, miniaturaCapitulo, numeroCapitulo, rotaCapitulo, rotuloCapitulo,
} from '../../../../lib/webshard/catalogo'
import CascataLiberacao from './CascataLiberacao'
import './CapituloLinha.css'

/** Uma linha de capítulo (lista do título e feed do hub). Liberado vira
 *  link; travado mostra a data de saída. `progresso` é o do título inteiro
 *  — só pinta "lendo/lido" se for deste capítulo. */
export default function CapituloLinha({ titulo, cap, liberado, data, nivel, progresso, mostrarTitulo = false, previa = false }) {
  const { t, locale } = useLanguage()
  const temConteudo = capituloTemConteudo(cap)
  const doCapitulo = progresso?.cap === cap.id ? progresso : null
  const lido = doCapitulo && doCapitulo.total && doCapitulo.pagina >= doCapitulo.total
  // Travado com cascata (assinante/conta/público): mostra os 3 degraus em
  // vez de só a data do nível de quem vê.
  const cascata = !liberado && cap.liberacao
  // Aberto pela Beta: selo com prazo + a cascata oficial (quando libera de verdade).
  const beta = liberado && emBeta(cap) && cap.liberacao
  const faltam = beta ? diasAte(cap.beta_ate) : 0

  let estado
  if (!liberado) {
    estado = data
      ? t('webShard.cap.em_breve_data', { data: formatarData(data) })
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
          {rotuloCapitulo(cap, t)}
        </span>
        <span className="ws-cap__nome">{temConteudo || cap.especial ? localizado(cap, 'titulo', locale) : t('webShard.cap.em_breve')}</span>
        {cascata && <CascataLiberacao liberacao={cap.liberacao} nivel={nivel} />}
        {beta && (
          <>
            <span className="ws-cap__beta">
              <span className="ws-cap__beta-selo">{t('webShard.beta.selo', { data: formatarData(cap.beta_ate).slice(0, 5) })}</span>
              <span className="ws-cap__beta-prazo">{faltam > 0 ? t('webShard.beta.faltam', { n: faltam }) : t('webShard.beta.ultimo_dia')}</span>
            </span>
            <span className="ws-cap__oficial">{t('webShard.beta.oficial')}</span>
            <CascataLiberacao liberacao={cap.liberacao} nivel={nivel} />
          </>
        )}
        {!cascata && <span className="ws-cap__meta">
          <span className={`ws-cap__estado${lido ? ' is-lido' : ''}${doCapitulo && !lido ? ' is-lendo' : ''}`}>{estado}</span>
          {temConteudo && (cap.idiomas || ['pt']).map(l => (
            <span key={l} className="ws-cap__lang">{l.toUpperCase()}</span>
          ))}
          {previa && <span className="ws-cap__previa">{t('webShard.leitor.admin_previa')}</span>}
        </span>}
      </span>
      {liberado && <span className="ws-cap__seta" aria-hidden="true">›</span>}
    </>
  )

  const classe = `ws-cap${liberado ? '' : ' ws-cap--travado'}${doCapitulo && !lido ? ' is-active' : ''}`
  return liberado
    ? <Link to={rotaCapitulo(titulo, cap)} className={classe} style={{ '--ws-cor': titulo.cor }}>{miolo}</Link>
    : <div className={classe} style={{ '--ws-cor': titulo.cor }}>{miolo}</div>
}
