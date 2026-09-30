// Painel de administrador — rota escondida (ROTA_PAINEL), sem link em lugar
// nenhum, fora do sitemap e do prerender. Quem não é admin vê a página de
// "não encontrada", sem saber que existe um painel aqui.
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { ADMIN_EMAILS } from '../../config/launch'
import PainelVisao from './PainelVisao'
import PainelFinanceiro from './PainelFinanceiro'
import { PainelAgora, PainelSessoes } from './PainelSessoes'
import { PERIODOS, intervalo, rpc, localeDe } from './painelUtil'
import './Painel.css'

const NotFound = lazy(() => import('../site/NotFound/NotFound'))
const ABAS = ['visao', 'agora', 'sessoes', 'financeiro']
const FILTROS = ['origem', 'rota', 'dispositivo', 'idioma', 'pais', 'logado']

export default function Painel() {
  const { user, perfil, carregando } = useAuth()
  const { t, locale } = useLanguage()
  const lc = localeDe(locale)
  const admin = perfil?.is_admin === true || ADMIN_EMAILS.includes(user?.email || '')

  const [aba, setAba] = useState('visao')
  const [periodo, setPeriodo] = useState('7d')
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [filtros, setFiltros] = useState({})
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [ip, setIp] = useState(null)
  const [recarga, setRecarga] = useState(0)

  const [inicio, fim] = useMemo(() => intervalo(periodo, de, ate), [periodo, de, ate, recarga])

  // Quem abre o painel: o IP de onde está acessando para de contar visita.
  useEffect(() => {
    if (!admin) return
    try { localStorage.setItem('ldi-analytics-off', '1') } catch { /* sem storage */ }
    rpc('painel_excluir_meu_ip').then(setIp).catch(() => {})
  }, [admin])

  useEffect(() => {
    if (!admin || aba !== 'visao') return
    setDados(null); setErro(null)
    rpc('painel_dados', { p_inicio: inicio.toISOString(), p_fim: fim.toISOString(), p_filtros: filtros })
      .then(setDados)
      .catch(e => setErro(e.faltaMigration ? t('painel.falta_migration') : e.message))
  }, [admin, aba, inicio.getTime(), fim.getTime(), JSON.stringify(filtros)])

  if (carregando) return null
  if (!admin) return <Suspense fallback={null}><NotFound /></Suspense>

  const filtrar = (campo, valor) => setFiltros(f => ({ ...f, [campo]: valor }))
  const tirarFiltro = campo => setFiltros(({ [campo]: _, ...resto }) => resto)
  const opcoes = {
    origem: dados?.opcoes?.origens || [],
    pais: dados?.opcoes?.paises || [],
    dispositivo: ['celular', 'tablet', 'desktop'],
    idioma: ['pt', 'en', 'es'],
    logado: ['sim', 'nao'],
  }

  return (
    <main className="painel">
      <Helmet>
        <title>{t('painel.titulo')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="painel-topo">
        <div>
          <span className="painel-topo__eyebrow">{t('painel.eyebrow')}</span>
          <h1>{t('painel.titulo')}</h1>
        </div>
        <button type="button" className="painel-btn" onClick={() => setRecarga(r => r + 1)}>{t('painel.atualizar')}</button>
      </header>
      {ip && <p className="painel-nota">{t('painel.ip_excluido', { ip })}</p>}

      <nav className="painel-abas" role="tablist">
        {ABAS.map(a => (
          <button key={a} type="button" role="tab" aria-selected={aba === a} className={aba === a ? 'is-ativa' : ''} onClick={() => { setAba(a); setErro(null) }}>
            {t(`painel.aba.${a}`)}
          </button>
        ))}
      </nav>

      {aba !== 'agora' && (
        <section className="painel-controles">
          <div className="painel-periodos">
            {PERIODOS.map(p => (
              <button key={p} type="button" className={periodo === p ? 'is-ativo' : ''} onClick={() => setPeriodo(p)}>{t(`painel.periodo.${p}`)}</button>
            ))}
          </div>
          {periodo === 'custom' && (
            <div className="painel-datas">
              <input type="date" value={de} onChange={e => setDe(e.target.value)} aria-label={t('painel.de')} />
              <input type="date" value={ate} onChange={e => setAte(e.target.value)} aria-label={t('painel.ate')} />
            </div>
          )}
          {aba === 'visao' && (
            <div className="painel-filtros">
              {FILTROS.map(campo => campo === 'rota' ? (
                filtros.rota ? <button key={campo} type="button" className="painel-chip is-ativo" onClick={() => tirarFiltro('rota')}>{filtros.rota} ✕</button> : null
              ) : (
                <select key={campo} value={filtros[campo] || ''} onChange={e => (e.target.value ? filtrar(campo, e.target.value) : tirarFiltro(campo))} aria-label={t(`painel.filtro.${campo}`)}>
                  <option value="">{t(`painel.filtro.${campo}`)}</option>
                  {opcoes[campo].map(o => <option key={o} value={o}>{campo === 'logado' ? t(`painel.filtro.logado_${o}`) : o}</option>)}
                </select>
              ))}
              {Object.keys(filtros).length > 0 && <button type="button" className="painel-chip" onClick={() => setFiltros({})}>{t('painel.limpar')}</button>}
            </div>
          )}
        </section>
      )}

      {erro && aba === 'visao' && <p className="painel-erro">{erro}</p>}
      {aba === 'visao' && !erro && (dados ? <PainelVisao dados={dados} t={t} locale={lc} onFiltro={filtrar} /> : <p className="painel-vazio">{t('painel.carregando')}</p>)}
      {aba === 'agora' && <PainelAgora t={t} locale={lc} />}
      {aba === 'sessoes' && <PainelSessoes t={t} locale={lc} inicio={inicio} fim={fim} />}
      {aba === 'financeiro' && <PainelFinanceiro t={t} locale={lc} inicio={inicio} fim={fim} />}
    </main>
  )
}
