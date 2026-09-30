// Aba "Logs": log de depuração das contas admin (migration 046, lib/debugLog.js).
// Filtra por conta, sessão e tipo; cada linha abre o JSON; copia a sessão
// inteira em ordem cronológica pra colar numa investigação de bug.
import { useEffect, useMemo, useState } from 'react'
import { Cartao } from './PainelBlocos'
import { rpc, horaCurta, hora } from './painelUtil'

const nomeDe = l => l.nome || l.email || ''

export default function PainelLogs({ t, locale, inicio }) {
  const [linhas, setLinhas] = useState(null)
  const [erro, setErro] = useState(null)
  const [contas, setContas] = useState({})
  const [conta, setConta] = useState('')
  const [sessao, setSessao] = useState('')
  const [tipo, setTipo] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    setLinhas(null); setErro(null)
    rpc('debug_log_ler', { p_user: conta || null, p_sessao: sessao || null, p_tipo: tipo || null, p_desde: inicio.toISOString(), p_limite: 1000 })
      .then(r => {
        setLinhas(r || [])
        setContas(c => { const n = { ...c }; (r || []).forEach(l => { n[l.user_id] = nomeDe(l) || l.user_id }); return n })
      })
      .catch(e => setErro(e.faltaMigration ? t('painel.logs.falta_migration') : e.message))
  }, [conta, sessao, tipo, inicio.getTime(), recarga])

  const sessoes = useMemo(() => {
    const m = new Map()
    for (const l of linhas || []) if (!m.has(l.sessao)) m.set(l.sessao, l)
    return [...m.values()]
  }, [linhas])

  async function copiarSessao() {
    const r = await rpc('debug_log_ler', { p_sessao: sessao, p_limite: 5000 })
    const texto = JSON.stringify((r || []).slice().reverse().map(({ id: _id, user_id: _u, ...l }) => l), null, 1)
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* sem clipboard */ }
  }

  const classe = tp => (/^(erro|console\.error)/.test(tp) ? ' is-erro' : tp === 'console.warn' ? ' is-aviso' : '')

  return (
    <>
      <section className="painel-filtros">
        <select value={conta} onChange={e => setConta(e.target.value)} aria-label={t('painel.logs.conta')}>
          <option value="">{t('painel.logs.conta')}</option>
          {Object.entries(contas).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
        </select>
        <select value={sessao} onChange={e => setSessao(e.target.value)} aria-label={t('painel.logs.sessao')}>
          <option value="">{t('painel.logs.sessao')}</option>
          {sessoes.map(s => <option key={s.sessao} value={s.sessao}>{`${hora(s.criado_em, locale)} · ${nomeDe(s)} · ${s.sessao.slice(0, 8)}`}</option>)}
        </select>
        <input className="painel-logs__tipo" value={tipo} onChange={e => setTipo(e.target.value.trim())} placeholder={t('painel.logs.tipo')} aria-label={t('painel.logs.tipo')} />
        <button type="button" className="painel-chip" onClick={() => setRecarga(r => r + 1)}>{t('painel.atualizar')}</button>
        {sessao && <button type="button" className="painel-btn" onClick={copiarSessao}>{copiado ? t('painel.logs.copiado') : t('painel.logs.copiar')}</button>}
      </section>
      {erro && <p className="painel-erro">{erro}</p>}
      {!erro && (
        <Cartao titulo={t('painel.logs.titulo', { n: linhas ? linhas.length : '…' })}>
          {!linhas ? <p className="painel-vazio">{t('painel.carregando')}</p> : !linhas.length ? <p className="painel-vazio">{t('painel.logs.vazio')}</p> : (
            <ol className="painel-logs">
              {linhas.map(l => (
                <li key={l.id} className={`painel-log${classe(l.tipo)}`}>
                  <details>
                    <summary>
                      <time>{horaCurta(l.criado_em, locale)}</time>
                      <strong>{l.tipo}</strong>
                      <button type="button" className="painel-log__sessao" onClick={e => { e.preventDefault(); setSessao(l.sessao) }}>{l.sessao.slice(0, 6)}</button>
                      <span>{l.rota}</span>
                    </summary>
                    <pre>{JSON.stringify(l.dados, null, 1)}</pre>
                    <p className="painel-nota">{`${nomeDe(l)} · v${l.versao || '?'}`}</p>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </Cartao>
      )}
    </>
  )
}
