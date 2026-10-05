// Aba "Creators": concede, renova e tira a tag de creator (migration 052).
// O tempo segue a tabela do programa: 1 a 6 meses conforme o canal.
import { useEffect, useState } from 'react'
import { Cartao } from './PainelBlocos'
import { rpc } from './painelUtil'

const MESES = [1, 2, 3, 4, 5, 6]

export default function PainelCreators({ t, locale }) {
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [email, setEmail] = useState('')
  const [canal, setCanal] = useState('')
  const [meses, setMeses] = useState('1')
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    setLista(null); setErro(null)
    rpc('admin_listar_creators')
      .then(r => setLista(r || []))
      .catch(e => setErro(e.faltaMigration ? t('painel.creators.falta_migration') : e.message))
  }, [recarga])

  async function definir(alvo, m, canalAlvo = null) {
    setAviso(null)
    try {
      const r = await rpc('admin_definir_creator', { p_email: alvo, p_meses: m, p_canal: canalAlvo })
      if (!r?.ok) { setAviso(t('painel.creators.nao_achou', { email: alvo })); return }
      setAviso(m === 0 ? t('painel.creators.removido', { email: alvo }) : t('painel.creators.liberado', { email: alvo }))
      setRecarga(x => x + 1)
    } catch (e) {
      setAviso(e.message)
    }
  }

  function enviar(e) {
    e.preventDefault()
    if (!email.trim()) return
    definir(email.trim(), meses === 'sem' ? null : Number(meses), canal)
    setEmail(''); setCanal('')
  }

  const data = d => (d ? new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString(locale) : t('painel.creators.sem_prazo'))

  return (
    <>
      <form className="painel-form" onSubmit={enviar}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t('painel.creators.email')} aria-label={t('painel.creators.email')} />
        <input value={canal} onChange={e => setCanal(e.target.value)} placeholder={t('painel.creators.canal')} aria-label={t('painel.creators.canal')} />
        <select value={meses} onChange={e => setMeses(e.target.value)} aria-label={t('painel.creators.prazo')}>
          {MESES.map(m => <option key={m} value={m}>{t('painel.creators.meses', { n: m })}</option>)}
          <option value="sem">{t('painel.creators.sem_prazo')}</option>
        </select>
        <button type="submit" className="painel-btn">{t('painel.creators.liberar')}</button>
      </form>
      <p className="painel-nota">{t('painel.creators.nota')}</p>
      {aviso && <p className="painel-nota">{aviso}</p>}
      {erro && <p className="painel-erro">{erro}</p>}
      {!erro && (
        <Cartao titulo={t('painel.creators.titulo', { n: lista ? lista.length : '…' })}>
          {!lista ? <p className="painel-vazio">{t('painel.carregando')}</p> : !lista.length ? <p className="painel-vazio">{t('painel.creators.vazio')}</p> : (
            <ul className="painel-tabela">
              {lista.map(c => (
                <li key={c.email}>
                  <strong>{c.nome || c.email}</strong>
                  <small>{[c.email, c.canal].filter(Boolean).join(' · ')}</small>
                  <small>
                    {c.ativo ? t('painel.creators.ate', { data: data(c.ate) }) : t('painel.creators.expirou', { data: data(c.ate) })}
                    {' · '}
                    {c.termos_em ? t('painel.creators.termos_ok') : t('painel.creators.termos_pendente')}
                    {c.interesses?.length ? ` · ${c.interesses.join(', ')}` : ''}
                  </small>
                  <span className="painel-filtros">
                    <button type="button" className="painel-chip" onClick={() => definir(c.email, 1)}>{t('painel.creators.mais_mes')}</button>
                    <button type="button" className="painel-chip" onClick={() => definir(c.email, 0)}>{t('painel.creators.remover')}</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      )}
    </>
  )
}
