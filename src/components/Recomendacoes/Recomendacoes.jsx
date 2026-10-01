/* As duas portas de recomendação do portal (lib/historias/recomendacoes.js):
   • <RecomendacaoFim> — no fim do último capítulo disponível de uma história:
     "você terminou", o que ler depois e o que no portal conversa com ela.
   • <PraVoce> — a prateleira da Home pra quem volta: continuar de onde parou,
     porque você leu X, e as novidades. Some pra quem nunca leu nada. */
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { lerAfinidade, aoMudarAfinidade, registrarUso, itemDaRota, ligarConta } from '../../lib/recomendacao/afinidade'
import { useLanguage } from '../../context/LanguageContext'
import { useHistoriasAcesso } from '../../hooks/useHistoriasAcesso'
import { localizado, imagemWebshard, tituloLegado } from '../../lib/webshard/catalogo'
import { miniaturaCapHistoria, numeroCapHistoria } from '../../lib/historias/catalogo'
import { lerHistorico, aoMudarHistorico } from '../../lib/historias/historico'
import { recomendarDepoisDe, extrasDe, praVoce, recomendadosPraVoce } from '../../lib/historias/recomendacoes'
import ninaImg from '../../assets/images/characters/nina-balloon.png'
import paredeGangues from '../../pages/games/Gangues/assets/backgrounds/parede-oficial.jpg'
import { getTopTrumpsCardImage } from '../../lib/topTrumpsCardImages'
import './Recomendacoes.css'

const CAPA_EXTRA = {
  gangues: () => paredeGangues,
  trunfo: () => getTopTrumpsCardImage(9),
  webshard: () => imagemWebshard(tituloLegado().capa),
  radio: () => ninaImg,
}

function useHistorico() {
  const [h, setH] = useState(lerHistorico)
  useEffect(() => aoMudarHistorico(setH), [])
  return h
}

function useAfinidade() {
  const [a, setA] = useState(lerAfinidade)
  useEffect(() => aoMudarAfinidade(setA), [])
  return a
}

/** Conta o uso do portal (montado uma vez no App): cada página de jogo,
 *  história, WEB SHARD ou música soma uma visita e o tempo de tela dela
 *  (só o tempo com a aba visível). Com conta, liga a sincronização. */
export function AfinidadeTracker() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  useEffect(() => { ligarConta(user?.id) }, [user?.id])
  useEffect(() => {
    const item = itemDaRota(pathname)
    if (!item) return
    registrarUso(item)
    let desde = document.visibilityState === 'visible' ? Date.now() : null
    const fechar = () => { if (desde) { registrarUso(item, (Date.now() - desde) / 1000); desde = null } }
    const vis = () => { if (document.visibilityState === 'visible') desde = Date.now(); else fechar() }
    document.addEventListener('visibilitychange', vis)
    return () => { document.removeEventListener('visibilitychange', vis); fechar() }
  }, [pathname])
  return null
}

function useDisponivel() {
  const { liberado } = useHistoriasAcesso()
  return useMemo(() => ({
    disponivel: h => h.capitulos.some(c => liberado(h, c)),
    capLiberado: liberado,
  }), [liberado])
}

function textoMotivo(t, m) {
  if (!m) return null
  return m.tipo === 'personagem'
    ? t('pages.recomendacoes.motivo_personagem', { nome: t(`pages.recomendacoes.personagens.${m.valor}`) })
    : t('pages.recomendacoes.motivo_tema', { tema: t(`pages.recomendacoes.temas.${m.valor}`) })
}

function CartaoHistoria({ historia, sub, rota, capa }) {
  const { locale } = useLanguage()
  return (
    <Link to={rota || historia.rota} className="rec-cartao" style={{ '--rec-cor': historia.cor }}>
      <img src={capa || historia.capa} alt="" loading="lazy" decoding="async" />
      <span className="rec-cartao__info">
        <strong>{localizado(historia, 'nome', locale)}</strong>
        {sub && <small>{sub}</small>}
      </span>
    </Link>
  )
}

function CartaoExtra({ extra }) {
  const { t } = useLanguage()
  return (
    <Link to={extra.rota} className="rec-cartao rec-cartao--extra">
      <img src={CAPA_EXTRA[extra.chave]?.()} alt="" loading="lazy" decoding="async" />
      <span className="rec-cartao__info">
        <strong>{t(`pages.recomendacoes.extras.${extra.chave}.titulo`)}</strong>
        <small>{t(`pages.recomendacoes.extras.${extra.chave}.sub`)}</small>
      </span>
    </Link>
  )
}

/** No fim do último capítulo disponível. `completa` = era o último capítulo
 *  que a história tem (senão o próximo só ainda não saiu). */
export function RecomendacaoFim({ historia, completa }) {
  const { t, locale } = useLanguage()
  const historico = useHistorico()
  const { disponivel } = useDisponivel()
  const recs = useMemo(() => recomendarDepoisDe(historia.slug, { historico, disponivel, n: 3 }), [historia.slug, historico, disponivel])
  const extras = extrasDe(historia.slug)
  if (!recs.length && !extras.length) return null
  return (
    <section className="rec-fim">
      <span className="rec-fim__eyebrow">{t(completa ? 'pages.recomendacoes.fim_completa' : 'pages.recomendacoes.fim_por_enquanto')}</span>
      <h2>{t('pages.recomendacoes.fim_titulo', { nome: localizado(historia, 'nome', locale) })}</h2>
      {recs.length > 0 && (
        <>
          <p className="rec-fim__sub">{t('pages.recomendacoes.leia_depois')}</p>
          <div className="rec-fim__lista">
            {recs.map(r => <CartaoHistoria key={r.historia.slug} historia={r.historia} sub={textoMotivo(t, r.motivo) || localizado(r.historia, 'tagline', locale)} />)}
          </div>
        </>
      )}
      {extras.length > 0 && (
        <>
          <p className="rec-fim__sub">{t('pages.recomendacoes.alem')}</p>
          <div className="rec-fim__lista">{extras.map(e => <CartaoExtra key={e.chave} extra={e} />)}</div>
        </>
      )}
    </section>
  )
}

function Fileira({ titulo, children }) {
  return (
    <div className="rec-fileira">
      <h3>{titulo}</h3>
      <div className="rec-fileira__trilho">{children}</div>
    </div>
  )
}

function textoMotivoRec(t, m, locale) {
  switch (m?.tipo) {
    case 'favorito': return t('pages.recomendacoes.motivo_favorito')
    case 'categoria': return t(`pages.recomendacoes.motivo_cat_${m.valor}`)
    case 'porque_leu': return t('pages.recomendacoes.porque_leu', { nome: localizado(m.historia, 'nome', locale) })
    case 'novo': return t('pages.recomendacoes.novidades')
    default: return t('pages.recomendacoes.motivo_popular')
  }
}

function Poster({ rec }) {
  const { t, locale } = useLanguage()
  const ehExtra = rec.tipo === 'extra'
  const rota = ehExtra ? rec.extra.rota : rec.historia.rota
  const capa = ehExtra ? CAPA_EXTRA[rec.chave]?.() : rec.historia.capa
  const nome = ehExtra ? t(`pages.recomendacoes.extras.${rec.chave}.titulo`) : localizado(rec.historia, 'nome', locale)
  return (
    <Link to={rota} className={`rec-poster rec-poster--${rec.motivo.tipo}`}>
      <span className="rec-poster__capa"><img src={capa} alt="" loading="lazy" decoding="async" /></span>
      <strong>{nome}</strong>
      <small>{textoMotivoRec(t, rec.motivo, locale)}</small>
    </Link>
  )
}

/** A prateleira "Pra você" na Home: a 1ª fileira é a do algoritmo (todo o
 *  portal, ordenado pelo uso da pessoa); embaixo, continuar / porque leu /
 *  novidades das histórias. */
export function PraVoce() {
  const { t, locale } = useLanguage()
  const historico = useHistorico()
  const { disponivel, capLiberado } = useDisponivel()
  const afinidade = useAfinidade()
  const dados = useMemo(() => praVoce({ historico, disponivel, capLiberado }) || { continuar: [], porque: null, novidades: [] }, [historico, disponivel, capLiberado])
  const recs = useMemo(() => recomendadosPraVoce({ afinidade, historico, disponivel, capLiberado, excluir: dados.continuar.map(c => c.historia.slug) }), [afinidade, historico, disponivel, capLiberado, dados])
  const capSub = cap => `${t('pages.recomendacoes.cap')} ${numeroCapHistoria(cap)} · ${localizado(cap, 'titulo', locale)}`
  return (
    <section className="rec-pra-voce">
      <div className="container">
        <span className="rec-fim__eyebrow">{t('pages.recomendacoes.pra_voce_eyebrow')}</span>
        <h2 className="rec-pra-voce__titulo">{t(recs.usou ? 'pages.recomendacoes.pra_voce' : 'pages.recomendacoes.comece')}</h2>
        <div className="rec-fileira">
          <div className="rec-fileira__trilho rec-fileira__trilho--poster">
            {recs.lista.map(r => <Poster key={r.tipo === 'extra' ? r.chave : r.historia.slug} rec={r} />)}
          </div>
        </div>
        {dados.continuar.length > 0 && (
          <Fileira titulo={t('pages.recomendacoes.continuar')}>
            {dados.continuar.map(({ historia, cap }) => (
              <CartaoHistoria key={historia.slug} historia={historia} rota={historia.rotaCap(cap)} capa={miniaturaCapHistoria(historia, cap)} sub={capSub(cap)} />
            ))}
          </Fileira>
        )}
        {dados.porque?.itens.length > 0 && (
          <Fileira titulo={t('pages.recomendacoes.porque_leu', { nome: localizado(dados.porque.base, 'nome', locale) })}>
            {dados.porque.itens.map(r => <CartaoHistoria key={r.historia.slug} historia={r.historia} sub={textoMotivo(t, r.motivo) || localizado(r.historia, 'tagline', locale)} />)}
            {extrasDe(dados.porque.base.slug).map(e => <CartaoExtra key={e.chave} extra={e} />)}
          </Fileira>
        )}
        {dados.novidades.length > 0 && (
          <Fileira titulo={t('pages.recomendacoes.novidades')}>
            {dados.novidades.map(({ historia, cap }) => (
              <CartaoHistoria key={`${historia.slug}-${cap.id}`} historia={historia} rota={historia.rotaCap(cap)} capa={miniaturaCapHistoria(historia, cap)} sub={capSub(cap)} />
            ))}
          </Fileira>
        )}
      </div>
    </section>
  )
}
