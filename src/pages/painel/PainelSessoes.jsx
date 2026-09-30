// Abas "Agora" (quem está no site, atualiza sozinho) e "Sessões" (cada visita
// e a trilha dela, em ordem).
import { useEffect, useState } from 'react'
import { Cartao, Kpi } from './PainelBlocos'
import { rpc, duracao, hora, horaCurta } from './painelUtil'

// Selo do tipo de conta: visitante, free ou assinante + nível.
function Conta({ conta, t }) {
  const tipo = conta?.tipo || 'visitante'
  return (
    <b className={`painel-conta is-${tipo}`}>
      {tipo === 'assinante' ? `${t('painel.conta.assinante')} ${conta.tier || ''}${conta.status === 'past_due' ? ` · ${t('painel.fin.status.past_due')}` : ''}` : t(`painel.conta.${tipo}`)}
    </b>
  )
}

export function PainelAgora({ t, locale }) {
  const [agora, setAgora] = useState(null)
  useEffect(() => {
    let vivo = true
    const puxar = () => rpc('painel_agora').then(d => { if (vivo) setAgora(d) }).catch(() => {})
    puxar()
    const id = setInterval(puxar, 10000)
    return () => { vivo = false; clearInterval(id) }
  }, [])
  const sessoes = agora?.sessoes || []
  return (
    <div className="painel-grade">
      <div className="painel-kpis">
        <Kpi rotulo={t('painel.agora.online')} valor={agora?.online ?? '…'} sub={t('painel.agora.janela')} destaque />
      </div>
      <Cartao titulo={t('painel.agora.quem')}>
        {!sessoes.length ? <p className="painel-vazio">{t('painel.agora.ninguem')}</p> : (
          <ul className="painel-agora">
            {sessoes.map((s, i) => (
              <li key={i}>
                <i className="painel-pulso" aria-hidden="true" />
                <div>
                  <strong>{s.titulo || s.rota}</strong>
                  <small>{s.rota}</small>
                </div>
                <span className="painel-agora__pais">{s.pais || '?'}{s.lugar ? ` · ${s.lugar}` : ''}</span>
                <span><Conta conta={s.conta} t={t} /> {s.dispositivo}</span>
                <em>{t('painel.agora.ha', { t: duracao(s.ha) })}</em>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
      <p className="painel-nota">{t('painel.agora.nota', { hora: hora(new Date().toISOString(), locale) })}</p>
    </div>
  )
}

export function PainelSessoes({ t, locale, inicio, fim }) {
  const [sessoes, setSessoes] = useState(null)
  const [aberta, setAberta] = useState(null)
  const [trilha, setTrilha] = useState(null)

  useEffect(() => {
    setSessoes(null)
    rpc('painel_sessoes', { p_inicio: inicio.toISOString(), p_fim: fim.toISOString(), p_limite: 200 }).then(setSessoes).catch(() => setSessoes([]))
  }, [inicio.getTime(), fim.getTime()])

  useEffect(() => {
    if (!aberta) return undefined
    let vivo = true
    const puxar = () => rpc('painel_trilha', { p_sessao: aberta.sessao }).then(d => { if (vivo) setTrilha(d) }).catch(() => {})
    setTrilha(null)
    puxar()
    // sessão ao vivo: a trilha vai crescendo na tela
    const id = aberta.aovivo ? setInterval(puxar, 10000) : null
    return () => { vivo = false; if (id) clearInterval(id) }
  }, [aberta?.sessao])

  if (aberta) {
    return (
      <Cartao titulo={t('painel.sessoes.trilha')} acao={<button type="button" className="painel-btn" onClick={() => setAberta(null)}>{t('painel.voltar')}</button>}>
        <p className="painel-trilha__resumo">
          {aberta.aovivo && <b className="painel-aovivo">{t('painel.sessoes.aovivo')}</b>}
          <Conta conta={aberta.conta} t={t} /> 
          {hora(aberta.ini, locale)} · {duracao(aberta.duracao)} · {aberta.pais || '?'}{aberta.lugar ? `, ${aberta.lugar}` : ''} · {aberta.aparelho} · {aberta.navegador} · {aberta.origem}
        </p>
        {!trilha ? <p className="painel-vazio">{t('painel.carregando')}</p> : (
          <ol className="painel-trilha">
            {trilha.map((p, i) => (
              <li key={i} className={`is-${p.tipo}`}>
                <time>{horaCurta(p.quando, locale)}</time>
                <div>
                  <strong>{p.tipo === 'page' ? (p.titulo || p.rota) : p.nome}</strong>
                  <small>{p.tipo === 'page' ? p.rota : [p.dados?.game_id, p.dados?.chapter_titulo, p.dados?.chapter_id, p.dados?.placement].filter(Boolean).join(' · ')}</small>
                </div>
                <span>
                  {p.tempo != null && duracao(p.tempo)}
                  {p.repeticoes > 1 && ` ×${p.repeticoes}`}
                </span>
              </li>
            ))}
          </ol>
        )}
      </Cartao>
    )
  }

  return (
    <Cartao titulo={t('painel.sessoes.titulo', { n: sessoes?.length ?? '…' })}>
      {!sessoes ? <p className="painel-vazio">{t('painel.carregando')}</p> : !sessoes.length ? <p className="painel-vazio">{t('painel.vazio')}</p> : (
        <ul className="painel-sessoes">
          {sessoes.map(s => (
            <li key={s.sessao}>
              <button type="button" onClick={() => setAberta(s)}>
                <span className="painel-sessoes__quando">
                  {s.aovivo && <i className="painel-pulso" aria-hidden="true" />}
                  {hora(s.ini, locale)}
                </span>
                <strong>{s.entrada}{s.saida !== s.entrada ? ` → ${s.saida}` : ''}</strong>
                <small><b>{s.pais || '?'}</b>{s.lugar ? ` · ${s.lugar}` : ''} · {s.aparelho}</small>
                <small>{s.paginas} {t('painel.sessoes.pags')} · {duracao(s.duracao)}</small>
                <small><Conta conta={s.conta} t={t} /> {s.origem}{s.novo ? ` · ${t('painel.novo')}` : ''}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  )
}
