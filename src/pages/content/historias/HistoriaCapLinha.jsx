import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { formatarData, localizado } from '../../../lib/webshard/catalogo'
import { miniaturaCapHistoria, numeroCapHistoria } from '../../../lib/historias/catalogo'
import CascataLiberacao from '../webshard/components/CascataLiberacao'
import '../webshard/components/CapituloLinha.css'
import './Historias.css'

/** Linha de capítulo em texto — o mesmo .ws-cap do WEB SHARD (índice,
 *  varredura de luz, barra ativa), com o resumo do capítulo. Travado mostra
 *  a cascata assinante → conta → público; o último aberto leva a barra. */
export default function HistoriaCapLinha({ historia, cap, liberado, data, nivel, atual = false, previa = false, mostrarTitulo = false }) {
  const { t, locale } = useLanguage()
  const cascata = !liberado && cap.liberacao
  const resumo = localizado(cap, 'resumo', locale)

  let estado
  if (!liberado) estado = data ? t('webShard.cap.em_breve_data', { data: formatarData(data) }) : t('webShard.cap.em_breve')
  else if (atual) estado = t('webShard.continuar.eyebrow')
  else estado = t('pages.historias.ler_cap')

  const miolo = (
    <>
      <span className="ws-cap__thumb">
        <img src={miniaturaCapHistoria(historia, cap)} alt="" loading="lazy" decoding="async" />
        <span className="ws-cap__num">{numeroCapHistoria(cap)}</span>
      </span>
      <span className="ws-cap__corpo">
        <span className="ws-cap__rotulo">
          {mostrarTitulo ? `${localizado(historia, 'nome', locale)} · ` : ''}
          {t('webShard.cap.rotulo', { n: numeroCapHistoria(cap) })}
        </span>
        <span className="ws-cap__nome">{localizado(cap, 'titulo', locale)}</span>
        {resumo && <span className="hist-cap__resumo">{resumo}</span>}
        {cascata && <CascataLiberacao liberacao={cap.liberacao} nivel={nivel} />}
        {!cascata && (
          <span className="ws-cap__meta">
            <span className={`ws-cap__estado${atual ? ' is-lendo' : ''}`}>{estado}</span>
            {previa && <span className="ws-cap__previa">{t('webShard.leitor.admin_previa')}</span>}
          </span>
        )}
      </span>
      {liberado && <span className="ws-cap__seta" aria-hidden="true">›</span>}
    </>
  )

  const classe = `ws-cap hist-cap${liberado ? '' : ' ws-cap--travado'}${atual ? ' is-active' : ''}`
  return liberado
    ? <Link to={historia.rotaCap(cap)} className={classe} style={{ '--ws-cor': historia.cor }}>{miolo}</Link>
    : <div className={classe} style={{ '--ws-cor': historia.cor }}>{miolo}</div>
}
