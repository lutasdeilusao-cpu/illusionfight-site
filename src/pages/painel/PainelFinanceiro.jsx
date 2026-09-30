// Aba "Financeiro": receita (por moeda), assinantes, movimento, custos
// cadastrados e o resultado do período (receita − custo proporcional).
import { useEffect, useState } from 'react'
import { Kpi, Cartao, Lista, Serie } from './PainelBlocos'
import { rpc, dinheiro, hora, num } from './painelUtil'

const DIA = 86400000
const CATEGORIAS = ['infra', 'pagamentos', 'marketing', 'ferramentas', 'outros']
const RECORRENCIAS = ['mensal', 'anual', 'unico']
const VAZIO = { nome: '', categoria: 'infra', valor: '', moeda: 'BRL', recorrencia: 'mensal', nota: '' }

// Custo que cabe no período: mensal/anual proporcional aos dias; único só se
// a data dele cair dentro.
function custoNoPeriodo(c, inicio, fim) {
  const ini = new Date(`${c.desde}T00:00:00-03:00`)
  const ate = c.ate ? new Date(`${c.ate}T23:59:59-03:00`) : fim
  const a = Math.max(inicio.getTime(), ini.getTime()), b = Math.min(fim.getTime(), ate.getTime())
  if (c.recorrencia === 'unico') return ini >= inicio && ini < fim ? c.valor_centavos : 0
  if (b <= a) return 0
  const dias = (b - a) / DIA
  return Math.round(c.valor_centavos * dias / (c.recorrencia === 'anual' ? 365 : 30))
}

export default function PainelFinanceiro({ t, locale, inicio, fim }) {
  const [fin, setFin] = useState(null)
  const [custos, setCustos] = useState([])
  const [edit, setEdit] = useState(null)
  const [erro, setErro] = useState(null)

  const carregar = () => {
    rpc('painel_financeiro', { p_inicio: inicio.toISOString(), p_fim: fim.toISOString() }).then(setFin).catch(e => setErro(e.message))
    rpc('painel_custos_listar').then(setCustos).catch(() => {})
  }
  useEffect(carregar, [inicio.getTime(), fim.getTime()])

  const salvar = async () => {
    const valor = Math.round(parseFloat(String(edit.valor).replace(',', '.')) * 100) || 0
    await rpc('painel_custo_salvar', { p: { ...edit, valor_centavos: valor, valor: undefined } })
    setEdit(null); carregar()
  }
  const apagar = async id => { await rpc('painel_custo_apagar', { p_id: id }); carregar() }

  if (erro) return <p className="painel-erro">{erro}</p>
  if (!fin) return <p className="painel-vazio">{t('painel.carregando')}</p>

  const moedas = fin.por_moeda?.length ? fin.por_moeda : [{ moeda: 'BRL', bruto: 0, reembolsos: 0, assinaturas: 0, loja: 0, pagamentos: 0 }]
  const custoPorMoeda = custos.reduce((acc, c) => { acc[c.moeda] = (acc[c.moeda] || 0) + custoNoPeriodo(c, inicio, fim); return acc }, {})
  const mensalPorMoeda = custos.filter(c => !c.ate || new Date(c.ate) >= new Date())
    .reduce((acc, c) => { acc[c.moeda] = (acc[c.moeda] || 0) + (c.recorrencia === 'anual' ? c.valor_centavos / 12 : c.recorrencia === 'mensal' ? c.valor_centavos : 0); return acc }, {})
  const assinantes = fin.assinantes || []
  const mrr = assinantes.filter(a => a.status !== 'past_due').reduce((acc, a) => { const m = a.moeda || 'BRL'; acc[m] = (acc[m] || 0) + (a.ultimo_valor || 0); return acc }, {})
  const dm = (v, m) => dinheiro(v, m, locale)

  return (
    <div className="painel-grade">
      {moedas.map(m => {
        const liquido = m.bruto - m.reembolsos
        const custo = custoPorMoeda[m.moeda] || 0
        return (
          <div key={m.moeda} className="painel-kpis">
            <Kpi rotulo={t('painel.fin.receita', { m: m.moeda })} valor={dm(liquido, m.moeda)} sub={t('painel.fin.receita_sub', { ass: dm(m.assinaturas, m.moeda), loja: dm(m.loja, m.moeda) })} destaque />
            <Kpi rotulo={t('painel.fin.custo')} valor={dm(custo, m.moeda)} sub={t('painel.fin.custo_sub')} />
            <Kpi rotulo={t('painel.fin.resultado')} valor={dm(liquido - custo, m.moeda)} />
            <Kpi rotulo={t('painel.fin.reembolsos')} valor={dm(m.reembolsos, m.moeda)} sub={t('painel.fin.pagamentos', { n: m.pagamentos })} />
          </div>
        )
      })}

      <div className="painel-kpis">
        <Kpi rotulo={t('painel.fin.assinantes')} valor={num(assinantes.length, locale)} sub={Object.entries(fin.por_tier || {}).map(([k, v]) => `${k} ${v}`).join(' · ') || '—'} destaque />
        <Kpi rotulo={t('painel.fin.mrr')} valor={Object.entries(mrr).map(([m, v]) => dm(v, m)).join(' + ') || dm(0)} sub={t('painel.fin.mrr_sub')} />
        <Kpi rotulo={t('painel.fin.custo_mensal')} valor={Object.entries(mensalPorMoeda).map(([m, v]) => dm(v, m)).join(' + ') || dm(0)} />
        <Kpi rotulo={t('painel.fin.movimento')} valor={`+${fin.movimento?.novos || 0} / −${fin.movimento?.cancelados || 0}`} sub={t('painel.fin.movimento_sub', { falhas: fin.movimento?.falhas || 0, inad: fin.inadimplentes || 0 })} />
        <Kpi rotulo={t('painel.fin.contas')} valor={num(fin.contas, locale)} sub={fin.contas ? t('painel.fin.conversao', { p: ((100 * assinantes.length) / fin.contas).toFixed(1) }) : null} />
      </div>

      <Cartao titulo={t('painel.fin.por_dia')}>
        <Serie pontos={(fin.serie || []).map(d => ({ rotulo: `${d.dia.slice(8)}/${d.dia.slice(5, 7)}`, valor: d.valor, moeda: d.moeda }))} vazio={t('painel.fin.sem_receita')} formatar={v => dm(v, moedas[0].moeda)} />
      </Cartao>

      <Cartao titulo={t('painel.fin.lista_assinantes')}>
        {!assinantes.length ? <p className="painel-vazio">{t('painel.fin.sem_assinantes')}</p> : (
          <ul className="painel-tabela">
            {assinantes.map(a => (
              <li key={a.email}>
                <strong>{a.nome || a.email}</strong>
                <small>{a.email}</small>
                <span className={`painel-tag is-${a.status}`}>{a.tier} · {t(`painel.fin.status.${a.status}`)}</span>
                <small>{a.ultimo_valor ? dm(a.ultimo_valor, a.moeda) : '—'}{a.renova ? ` · ${t('painel.fin.renova', { d: hora(a.renova, locale) })}` : ''}</small>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      <Cartao titulo={t('painel.fin.ultimos')}>
        {!fin.ultimos?.length ? <p className="painel-vazio">{t('painel.fin.sem_movimento')}</p> : (
          <ul className="painel-tabela">
            {fin.ultimos.map((u, i) => (
              <li key={i}>
                <strong>{t(`painel.fin.tipo.${u.tipo}`)}{u.tier ? ` · ${u.tier}` : ''}</strong>
                <small>{u.email || '—'} · {hora(u.quando, locale)}</small>
                <span className={`painel-tag is-${u.tipo}`}>{u.valor ? dm(u.tipo === 'reembolso' ? -u.valor : u.valor, u.moeda) : '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      <Cartao titulo={t('painel.custos.titulo')} acao={!edit && <button type="button" className="painel-btn" onClick={() => setEdit({ ...VAZIO })}>{t('painel.custos.novo')}</button>}>
        {edit ? (
          <form className="painel-form" onSubmit={e => { e.preventDefault(); salvar() }}>
            <label>{t('painel.custos.nome')}<input value={edit.nome} onChange={e => setEdit({ ...edit, nome: e.target.value })} required /></label>
            <label>{t('painel.custos.valor')}<input inputMode="decimal" value={edit.valor} onChange={e => setEdit({ ...edit, valor: e.target.value })} /></label>
            <label>{t('painel.custos.moeda')}
              <select value={edit.moeda} onChange={e => setEdit({ ...edit, moeda: e.target.value })}>{['BRL', 'USD', 'EUR'].map(m => <option key={m}>{m}</option>)}</select>
            </label>
            <label>{t('painel.custos.recorrencia')}
              <select value={edit.recorrencia} onChange={e => setEdit({ ...edit, recorrencia: e.target.value })}>{RECORRENCIAS.map(r => <option key={r} value={r}>{t(`painel.custos.rec.${r}`)}</option>)}</select>
            </label>
            <label>{t('painel.custos.categoria')}
              <select value={edit.categoria} onChange={e => setEdit({ ...edit, categoria: e.target.value })}>{CATEGORIAS.map(c => <option key={c} value={c}>{t(`painel.custos.cat.${c}`)}</option>)}</select>
            </label>
            <label>{t('painel.custos.desde')}<input type="date" value={edit.desde || ''} onChange={e => setEdit({ ...edit, desde: e.target.value })} /></label>
            <label className="is-largo">{t('painel.custos.nota')}<input value={edit.nota || ''} onChange={e => setEdit({ ...edit, nota: e.target.value })} /></label>
            <div className="painel-form__acoes">
              <button type="submit" className="painel-btn is-primario">{t('painel.salvar')}</button>
              <button type="button" className="painel-btn" onClick={() => setEdit(null)}>{t('painel.cancelar')}</button>
            </div>
          </form>
        ) : (
          <Lista
            itens={custos.map(c => ({ chave: c.nome, valor: c.valor_centavos, extra: `${t(`painel.custos.rec.${c.recorrencia}`)} · ${t(`painel.custos.cat.${c.categoria || 'outros'}`)}`, c }))}
            vazio={t('painel.custos.vazio')}
            formatar={v => dm(v, 'BRL')}
            onEscolher={i => setEdit({ ...i.c, valor: (i.c.valor_centavos / 100).toFixed(2) })}
          />
        )}
        {edit?.id && <button type="button" className="painel-btn is-perigo" onClick={() => { apagar(edit.id); setEdit(null) }}>{t('painel.custos.apagar')}</button>}
      </Cartao>
    </div>
  )
}
