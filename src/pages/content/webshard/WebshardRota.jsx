import { Navigate, useParams } from 'react-router-dom'
import { useWebshardAcesso } from '../../../hooks/useWebshardAcesso'
import { capituloMovido, tituloLegado, tituloPorSlug } from '../../../lib/webshard/catalogo'
import WebshardTitulo from './WebshardTitulo'
import WebshardLeitor from './WebshardLeitor'

/* Resolve as URLs do WEB SHARD:
   /webtoon/:param        → slug de título = página do título;
                            qualquer outra coisa = capítulo de Lutas de
                            Ilusão (URLs antigas /webtoon/01; /webtoon/00 → 01).
   /webtoon/:slug/:cap    → leitor do título; pra Lutas de Ilusão manda pra
                            URL canônica antiga. */
export default function WebshardRota() {
  const { param, slug, cap } = useParams()
  const { veOculto, isAdmin, carregando } = useWebshardAcesso()
  const legado = tituloLegado()

  if (param) {
    const tituloConhecido = tituloPorSlug(param, { isAdmin: true, soAdmin: true })
    if (carregando && tituloConhecido && !['publico', 'previa'].includes(tituloConhecido.visivel)) return null
    const titulo = tituloPorSlug(param, { isAdmin: veOculto, soAdmin: isAdmin })
    if (titulo) return <WebshardTitulo titulo={titulo} />
    if (tituloConhecido) return <Navigate to="/webtoon" replace />
    const novo = capituloMovido(legado, param)
    if (novo) return <Navigate to={`/webtoon/${novo}`} replace />
    return <WebshardLeitor titulo={legado} capId={param} />
  }

  if (slug === legado.slug) return <Navigate to={`/webtoon/${cap}`} replace />
  const tituloConhecido = tituloPorSlug(slug, { isAdmin: true, soAdmin: true })
  if (carregando && tituloConhecido && !['publico', 'previa'].includes(tituloConhecido.visivel)) return null
  const titulo = tituloPorSlug(slug, { isAdmin: veOculto, soAdmin: isAdmin })
  if (!titulo) return <Navigate to="/webtoon" replace />
  return <WebshardLeitor titulo={titulo} capId={cap} />
}
