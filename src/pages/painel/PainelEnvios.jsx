// Conteúdo enviado pelos creators (migration 054): o pendente vem primeiro;
// aprovar põe na vitrine pública /creators/destaques, "destacar" dá o card grande.
import { useEffect, useState } from 'react'
import { Cartao } from './PainelBlocos'
import { rpc } from './painelUtil'

export default function PainelEnvios({ t, locale }) {
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState(null)
  const [recarga, setRecarga] = useState(0)

  useEffect(() => {
    setErro(null)
    rpc('admin_listar_envios')
      .then(r => setLista(r || []))
      .catch(e => setErro(e.faltaMigration ? t('painel.envios.falta_migration') : e.message))
  }, [recarga])

  async function decidir(id, status, destaque = false) {
    try {
      await rpc('admin_decidir_envio', { p_id: id, p_status: status, p_destaque: destaque })
      setRecarga(x => x + 1)
    } catch (e) {
      setErro(e.message)
    }
  }

  const quando = d => new Date(d).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })
  const pendentes = lista ? lista.filter(e => e.status === 'pendente').length : '…'

  if (erro) return <p className="painel-erro">{erro}</p>
  return (
    <Cartao titulo={t('painel.envios.titulo', { n: pendentes })}>
      {!lista ? <p className="painel-vazio">{t('painel.carregando')}</p> : !lista.length ? <p className="painel-vazio">{t('painel.envios.vazio')}</p> : (
        <ul className="painel-tabela">
          {lista.map(e => (
            <li key={e.id}>
              <strong>{[e.nome, e.arroba].filter(Boolean).join(' · ')}</strong>
              <a className="painel-envio__link" href={e.link} target="_blank" rel="noopener noreferrer">{e.link}</a>
              <small>{[e.rede, e.email, quando(e.criado_em), t(`painel.envios.status_${e.status}`), e.destaque ? t('painel.envios.destaque') : ''].filter(Boolean).join(' · ')}</small>
              <span className="painel-filtros">
                {e.status !== 'aprovado' && <button type="button" className="painel-chip" onClick={() => decidir(e.id, 'aprovado')}>{t('painel.envios.aprovar')}</button>}
                {!(e.status === 'aprovado' && e.destaque) && <button type="button" className="painel-chip" onClick={() => decidir(e.id, 'aprovado', true)}>{t('painel.envios.destacar')}</button>}
                {e.status !== 'recusado' && <button type="button" className="painel-chip" onClick={() => decidir(e.id, 'recusado')}>{t('painel.envios.recusar')}</button>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  )
}
