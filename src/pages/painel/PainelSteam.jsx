// Aba "Steam": quem chegou pela demo da Steam (migration 056).
// Visitas vêm da coleta do painel (origem 'steam'); contas, do perfil.
import { useEffect, useState } from 'react'
import { Kpi, Cartao, Lista } from './PainelBlocos'
import { rpc } from './painelUtil'

export default function PainelSteam({ t, locale, inicio, fim }) {
  const [d, setD] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setD(null); setErro(null)
    rpc('painel_steam', { p_inicio: inicio.toISOString(), p_fim: fim.toISOString() })
      .then(setD)
      .catch(e => setErro(e.faltaMigration ? t('painel.falta_migration') : e.message))
  }, [inicio.getTime(), fim.getTime()])

  if (erro) return <p className="painel-erro">{erro}</p>
  if (!d) return <p className="painel-vazio">{t('painel.carregando')}</p>

  const quando = v => (v ? new Date(v).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—')

  return (
    <>
      <div className="painel-kpis">
        <Kpi rotulo={t('painel.steam.sessoes')} valor={d.sessoes} destaque />
        <Kpi rotulo={t('painel.steam.visitantes')} valor={d.visitantes} />
        <Kpi rotulo={t('painel.steam.minutos')} valor={d.minutos} />
        <Kpi rotulo={t('painel.steam.criadas')} valor={d.contas_criadas} sub={t('painel.steam.total', { n: d.contas_criadas_total })} />
        <Kpi rotulo={t('painel.steam.acessaram')} valor={d.contas_acessaram} />
      </div>
      <Cartao titulo={t('painel.steam.rotas')}>
        <Lista itens={(d.rotas || []).map(r => ({ chave: r.rota, valor: r.n }))} vazio={t('painel.vazio')} />
      </Cartao>
      <Cartao titulo={t('painel.steam.versoes')}>
        <Lista itens={(d.versoes || []).map(v => ({ chave: v.versao, valor: v.n }))} vazio={t('painel.vazio')} />
      </Cartao>
      <Cartao titulo={t('painel.steam.contas')}>
        {!d.contas?.length ? <p className="painel-vazio">{t('painel.vazio')}</p> : (
          <ul className="painel-tabela">
            {d.contas.map(c => (
              <li key={c.email}>
                <strong>{c.nome || c.email}</strong>
                <small>{c.email} · {c.origem === 'steam' ? t('painel.steam.origem_steam') : t('painel.steam.origem_web')}</small>
                <small>{t('painel.steam.primeiro', { data: quando(c.primeiro) })} · {t('painel.steam.ultimo', { data: quando(c.visto) })}</small>
              </li>
            ))}
          </ul>
        )}
      </Cartao>
    </>
  )
}
