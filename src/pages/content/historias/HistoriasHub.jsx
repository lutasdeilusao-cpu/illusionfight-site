import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useHistoriasAcesso } from '../../../hooks/useHistoriasAcesso'
import { localizado } from '../../../lib/webshard/catalogo'
import {
  capaPadrao, linhaPrincipal, listarHistorias, miniaturaCapHistoria, numeroCapHistoria, progressoHistoria,
} from '../../../lib/historias/catalogo'
import Farol, { PESOS } from '../../../components/Farol/Farol'
import TituloHero from '../webshard/components/TituloHero'
import HistoriaCapLinha from './HistoriaCapLinha'
import HistoriasUniversos from './HistoriasUniversos'
import '../webshard/WebshardHub.css'
import '../webshard/components/ContinuarLendo.css'
import '../webshard/components/CapituloLinha.css'
import './Historias.css'

const hojeISO = () => new Date().toISOString().slice(0, 10)

/* /historias (tudo) e /historias/contos (só os Contos de Ilusão) — a vitrine
   de leitura no padrão do WEB SHARD: um título em destaque, "continuar
   lendo", a estante numerada com o farol de peso, os próximos capítulos com
   a cascata de liberação e os que acabaram de sair. */
export default function HistoriasHub({ tipo = null }) {
  const { t, locale } = useLanguage()
  const { nivel, liberado, previa, dataPara } = useHistoriasAcesso()
  const [peso, setPeso] = useState(null)
  const hoje = hojeISO()

  // "Em andamento" = já tem capítulo aberto pro público de verdade (sem o passe de admin).
  const comStatus = h => ({
    ...h,
    status: h.capitulos.some(c => liberado(h, c) && !previa(h, c)) ? 'em_andamento' : 'em_breve',
  })
  const historias = listarHistorias(tipo).map(comStatus)
  const estante = historias.filter(h => !peso || h.peso === peso)
  const pesosPresentes = PESOS.filter(p => historias.some(h => h.peso === p))

  const destaque = tipo ? null : comStatus(linhaPrincipal())
  const colecao = {
    cor: 'var(--if-amber)',
    status: historias.some(h => h.status === 'em_andamento') ? 'em_andamento' : 'em_breve',
  }
  const capAtualDestaque = destaque && progressoHistoria(destaque)
  const capContinuar = capAtualDestaque && liberado(destaque, capAtualDestaque) ? capAtualDestaque : null
  const capHero = capContinuar || (destaque && destaque.capitulos.find(c => liberado(destaque, c)))

  const continuar = historias
    .map(h => ({ h, cap: progressoHistoria(h) }))
    .filter(({ h, cap }) => cap && liberado(h, cap) && h.slug !== destaque?.slug)
    .slice(0, 3)

  const todosCaps = historias.flatMap(h => h.capitulos.map(cap => ({ h, cap, data: dataPara(cap) })))
  const proximos = todosCaps
    .filter(({ h, cap, data }) => !liberado(h, cap) && data && data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 5)
  const recentes = todosCaps
    .filter(({ h, cap, data }) => liberado(h, cap) && !previa(h, cap) && data && data <= hoje)
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5)

  const meta = tipo === 'conto'
    ? { title: t('pages.contos.og_title'), desc: t('pages.contos.og_desc'), url: 'https://illusionfight.com/historias/contos' }
    : { title: t('pages.historias.og_title'), desc: t('pages.historias.og_desc'), url: 'https://illusionfight.com/historias' }

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.desc} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.desc} />
        <meta property="og:url" content={meta.url} />
        <meta property="og:image" content="https://illusionfight.com/og-image-webshard.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="ws-hub hist-hub">
        <div className="container">
          {tipo && <Link to="/historias" className="hist-voltar">{t('pages.historias.voltar')}</Link>}

          {!tipo && (
            <header className="ws-hub__cabeca">
              <h1 className="ws-hub__h1">{t('pages.historias.titulo')}</h1>
              <p className="ws-hub__sub">{t('pages.historias.intro')}</p>
            </header>
          )}

          {/* Contos: mesma página de título das outras histórias — capa grande
              no topo e a lista em linhas logo abaixo. */}
          {tipo === 'conto' && (
            <TituloHero
              titulo={colecao}
              capa={capaPadrao()}
              nome={t('pages.contos.titulo')}
              as="h1"
              eyebrow={t('pages.historias.secao_ldi')}
              texto={t('pages.contos.descricao')}
              selos={[t('pages.historias.contos_qtd', { n: historias.length })]}
            />
          )}

          {destaque && (
            <TituloHero
              titulo={destaque}
              capa={destaque.capa}
              eyebrow={t('pages.historias.destaque_eyebrow')}
              texto={localizado(destaque, 'tagline', locale)}
              selos={[t(`pages.contos.peso_${destaque.peso}`)]}
            >
              {capHero && (
                <Link to={destaque.rotaCap(capHero)} className="if-btn if-btn--primary">
                  {capContinuar
                    ? t('webShard.titulo.continuar', { n: numeroCapHistoria(capHero) })
                    : t('webShard.hub.ler_agora')}
                </Link>
              )}
              <Link to={destaque.rota} className="if-btn if-btn--ghost">{t('webShard.hub.ver_titulo')}</Link>
            </TituloHero>
          )}

          {continuar.length > 0 && (
            <div className="hist-hub__continuar">
              {continuar.map(({ h, cap }) => (
                <Link key={h.slug} to={h.rotaCap(cap)} className="ws-continuar hist-continuar" style={{ '--ws-cor': h.cor }}>
                  <img className="ws-continuar__thumb" src={miniaturaCapHistoria(h, cap)} alt="" decoding="async" />
                  <span className="ws-continuar__corpo">
                    <span className="if-eyebrow">{t('webShard.continuar.eyebrow')}</span>
                    <span className="ws-continuar__nome">{localizado(cap, 'titulo', locale)}</span>
                    <span className="ws-continuar__meta">
                      {localizado(h, 'nome', locale)} · {t('webShard.cap.rotulo', { n: numeroCapHistoria(cap) })}
                    </span>
                  </span>
                  <span className="ws-continuar__cta">{t('webShard.continuar.cta')}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Hub geral: estante por universo. Contos: a estante dos 5 com o filtro do farol. */}
          {!tipo && <HistoriasUniversos historias={historias} />}

          {tipo && (
          <section className="ws-hub__secao">
            <div className="ws-hub__secao-cabeca">
              <h2 className="ws-hub__h2">{t('pages.historias.contos_lista')}</h2>
              <p className="ws-hub__hint">{t('pages.contos.farol_intro')}</p>
            </div>

            {pesosPresentes.length > 1 && (
              <div className="hist-filtro" role="group" aria-label={t('pages.contos.farol_titulo')}>
                <button type="button" className={`hist-filtro__chip${!peso ? ' is-ativo' : ''}`} onClick={() => setPeso(null)}>
                  {t('pages.contos.farol_todas')}
                </button>
                {pesosPresentes.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`hist-filtro__chip hist-filtro__chip--${p}${peso === p ? ' is-ativo' : ''}`}
                    onClick={() => setPeso(peso === p ? null : p)}
                  >
                    {t(`pages.contos.peso_${p}`)}
                  </button>
                ))}
              </div>
            )}

            {estante.length ? (
              <div className="ws-hub__lista if-stagger">
                {estante.map(h => {
                  const travado = h.status === 'em_breve'
                  return (
                    <Link key={h.slug} to={h.rota} className={`ws-cap${travado ? ' ws-cap--travado' : ''}`} style={{ '--ws-cor': h.cor }}>
                      <span className="ws-cap__thumb">
                        <img src={h.capa} alt="" loading="lazy" decoding="async" />
                        <span className="ws-cap__num">{h.slug}</span>
                      </span>
                      <span className="ws-cap__corpo">
                        <span className="ws-cap__rotulo">{t('pages.historias.conto_rotulo', { n: h.slug })}</span>
                        <span className="ws-cap__nome">{localizado(h, 'nome', locale)}</span>
                        <span className="hist-cap__resumo">{localizado(h, 'tagline', locale)}</span>
                        <Farol peso={h.peso} canon={h.canon} temas={[]} size="sm" showTemas={false} />
                        <span className="ws-cap__meta">
                          <span className="ws-cap__estado">
                            {travado ? t('webShard.cap.em_breve') : t('pages.historias.caps', { n: h.capitulos.length })}
                          </span>
                        </span>
                      </span>
                      <span className="ws-cap__seta" aria-hidden="true">›</span>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="ws-hub__hint">{t('pages.contos.farol_vazio')}</p>
            )}
          </section>
          )}

          {proximos.length > 0 && (
            <section className="ws-hub__secao">
              <div className="ws-hub__secao-cabeca">
                <span className="if-eyebrow">{t('pages.historias.proximos_eyebrow')}</span>
                <h2 className="ws-hub__h2">{t('pages.historias.proximos')}</h2>
                <p className="ws-hub__hint">{t('pages.historias.proximos_hint')}</p>
              </div>
              <div className="ws-hub__lista">
                {proximos.map(({ h, cap, data }) => (
                  <HistoriaCapLinha
                    key={`${h.slug}-${cap.id}`}
                    historia={h}
                    cap={cap}
                    liberado={false}
                    data={data}
                    nivel={nivel}
                    mostrarTitulo
                  />
                ))}
              </div>
            </section>
          )}

          {recentes.length > 0 && (
            <section className="ws-hub__secao">
              <div className="ws-hub__secao-cabeca">
                <span className="if-eyebrow">{t('webShard.hub.recentes_eyebrow')}</span>
                <h2 className="ws-hub__h2">{t('webShard.hub.recentes')}</h2>
              </div>
              <div className="ws-hub__lista">
                {recentes.map(({ h, cap, data }) => (
                  <HistoriaCapLinha
                    key={`${h.slug}-${cap.id}`}
                    historia={h}
                    cap={cap}
                    liberado
                    data={data}
                    nivel={nivel}
                    mostrarTitulo
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
