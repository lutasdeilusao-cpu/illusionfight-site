// Convites de creator (migrations 053 e 055): gera o link (de uma conta ou de
// várias), acompanha se foi aberto, quem entrou por ele e o que cada conta acessou.
import { useEffect, useState } from 'react'
import { Cartao } from './PainelBlocos'
import { rpc } from './painelUtil'
import { LINK_CONVITE } from '../../lib/creatorConvite'

const MESES = [1, 2, 3, 4, 5, 6]

function tempo(seg) {
  if (!seg) return ''
  return seg < 60 ? `${seg}s` : `${Math.round(seg / 60)} min`
}

export default function PainelConvites({ t, locale }) {
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState(null)
  const [canal, setCanal] = useState('')
  const [meses, setMeses] = useState('3')
  const [multiplo, setMultiplo] = useState(true)
  const [copiado, setCopiado] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    setErro(null)
    rpc('admin_listar_convites')
      .then(r => setLista(r || []))
      .catch(e => setErro(e.faltaMigration ? t('painel.convites.falta_migration') : e.message))
  }, [recarga])

  async function criar(e) {
    e.preventDefault()
    try {
      const codigo = await rpc('admin_criar_convite', { p_canal: canal, p_meses: meses === 'sem' ? null : Number(meses), p_multiplo: multiplo })
      setCanal('')
      copiar(codigo)
      setRecarga(x => x + 1)
    } catch (err) {
      setErro(err.message)
    }
  }

  async function copiar(codigo) {
    try {
      await navigator.clipboard.writeText(LINK_CONVITE(codigo))
      setCopiado(codigo)
      setTimeout(() => setCopiado(null), 1800)
    } catch (err) {
      console.warn('[Painel] não deu pra copiar o convite:', err?.message)
    }
  }

  const quando = d => (d ? new Date(d).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '')

  function situacao(c) {
    if (c.contas?.length) return t('painel.convites.contas', { n: c.contas.length, aberturas: c.aberturas })
    if (c.aberto_em) return t('painel.convites.aberto', { n: c.aberturas, data: quando(c.aberto_em) })
    return t('painel.convites.nao_aberto')
  }

  return (
    <>
      <form className="painel-form" onSubmit={criar}>
        <input value={canal} onChange={e => setCanal(e.target.value)} placeholder={t('painel.convites.canal')} aria-label={t('painel.convites.canal')} />
        <select value={meses} onChange={e => setMeses(e.target.value)} aria-label={t('painel.creators.prazo')}>
          {MESES.map(m => <option key={m} value={m}>{t('painel.creators.meses', { n: m })}</option>)}
          <option value="sem">{t('painel.creators.sem_prazo')}</option>
        </select>
        <label className="painel-form__check is-largo">
          <input type="checkbox" checked={multiplo} onChange={e => setMultiplo(e.target.checked)} />
          {t('painel.convites.multiplo')}
        </label>
        <span className="painel-form__acoes">
          <button type="submit" className="painel-btn">{t('painel.convites.gerar')}</button>
        </span>
      </form>
      <p className="painel-nota">{t('painel.convites.nota')}</p>
      {erro && <p className="painel-erro">{erro}</p>}
      {!erro && (
        <Cartao titulo={t('painel.convites.titulo', { n: lista ? lista.length : '…' })}>
          {!lista ? <p className="painel-vazio">{t('painel.carregando')}</p> : !lista.length ? <p className="painel-vazio">{t('painel.convites.vazio')}</p> : (
            <ul className="painel-tabela">
              {lista.map(c => (
                <li key={c.codigo}>
                  <strong>{c.canal || c.codigo}</strong>
                  <small>{[c.multiplo ? t('painel.convites.tipo_multiplo') : t('painel.convites.tipo_unico'), c.meses ? t('painel.creators.meses', { n: c.meses }) : t('painel.creators.sem_prazo'), t('painel.convites.criado', { data: quando(c.criado_em) })].filter(Boolean).join(' · ')}</small>
                  <small className={c.contas?.length ? 'painel-convite--ok' : ''}>{situacao(c)}</small>
                  <span className="painel-filtros">
                    <button type="button" className="painel-chip" onClick={() => copiar(c.codigo)}>
                      {copiado === c.codigo ? t('painel.convites.copiado') : t('painel.convites.copiar')}
                    </button>
                  </span>
                  {c.contas?.map(conta => (
                    <details key={conta.email} className="painel-convite__acessos">
                      <summary>{t('painel.convites.conta', { email: conta.email || conta.nome || '', data: quando(conta.usado_em) })} · {t('painel.convites.acessos', { n: conta.acessos.length })}</summary>
                      {conta.visto_em && <small>{t('painel.convites.visto', { data: quando(conta.visto_em) })}</small>}
                      <ul>
                        {conta.acessos.map(a => (
                          <li key={a.rota}>
                            <span>{a.titulo || a.rota}</span>
                            <small>{[a.rota, `${a.vezes}×`, tempo(a.segundos), quando(a.ultimo)].filter(Boolean).join(' · ')}</small>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      )}
    </>
  )
}
