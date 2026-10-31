// Seção "Tarefas": quadro kanban no jeito do Jira.
// No celular, uma coluna por vez; de 900px pra cima, todas lado a lado.
// Fluxo a fazer → em progresso → em teste → feito → arquivo (regras em tarefas/tarefasFluxo.js).
// Dados só pelas RPCs admin_* (migrations 058–062); a tabela não tem policy.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { rpc } from './painelUtil'
import TarefaCartao from './tarefas/TarefaCartao'
import TarefaDetalhe from './tarefas/TarefaDetalhe'
import { COLUNAS, FILTROS, VAZIA, colunaDe, ordenar, primeiroNome, revisorDe, revisorSugerido } from './tarefas/tarefasFluxo'
import './PainelTarefas.css'

const SEMANA = 7 * 86400000
const LARGO = '(min-width: 900px)'

export default function PainelTarefas({ t, locale }) {
  const { user } = useAuth()
  const eu = user?.id
  const [tarefas, setTarefas] = useState(null)
  const [pessoas, setPessoas] = useState([])
  const [coluna, setColuna] = useState('fazer')
  const [filtro, setFiltro] = useState('tudo')
  const [busca, setBusca] = useState('')
  const [aberta, setAberta] = useState(null)
  const [erro, setErro] = useState(null)
  const [criada, setCriada] = useState(null)
  const barra = useRef(null)
  const toque = useRef(null)
  const [largo, setLargo] = useState(() => window.matchMedia(LARGO).matches)

  const carregar = () => rpc('admin_tarefas_listar').then(setTarefas).catch(e => setErro(e.faltaMigration ? t('painel.falta_migration') : e.message))
  useEffect(() => {
    carregar()
    rpc('admin_pessoas').then(ps => setPessoas(ps.map((p, i) => ({ ...p, curto: primeiroNome(p.nome), cor: i % 4 })))).catch(() => {})
  }, [])

  useEffect(() => {
    const m = window.matchMedia(LARGO)
    const mudar = () => setLargo(m.matches)
    m.addEventListener('change', mudar)
    return () => m.removeEventListener('change', mudar)
  }, [])

  // A coluna ativa fica sempre à vista na barra que rola de lado.
  useEffect(() => {
    barra.current?.querySelector('.is-ativa')?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [coluna])

  const pessoa = id => pessoas.find(p => p.id === id) || null
  const termo = busca.trim().toLowerCase()
  const visiveis = useMemo(() => (tarefas || []).filter(x => FILTROS[filtro](x, eu)
    && (!termo || `${x.titulo} ${x.descricao || ''} ldi-${x.id}`.toLowerCase().includes(termo))), [tarefas, filtro, termo, eu])
  const daColuna = c => visiveis.filter(x => colunaDe(x) === c).sort((a, b) => (b.id === criada) - (a.id === criada) || ordenar(a, b))

  const todas = tarefas || []
  const foco = {
    fazer: todas.filter(x => ['fazer', 'progresso'].includes(colunaDe(x)) && x.para === eu).length,
    revisar: todas.filter(x => colunaDe(x) === 'teste' && revisorDe(x) === eu).length,
    entregues: todas.filter(x => x.para === eu && x.feito_em && Date.now() - new Date(x.feito_em) < SEMANA).length,
  }

  const atualizarLocal = (id, mudanca) => {
    setTarefas(ts => ts.map(y => (y.id === id ? { ...y, ...mudanca } : y)))
    setAberta(a => (a && a.id === id ? { ...a, ...mudanca } : a))
  }
  const agir = async (x, acao) => {
    if (acao.comentario && !acao.texto) { setAberta(x); return }
    if (acao.para === 'arquivo') {
      atualizarLocal(x.id, { arquivada: true })
      await rpc('admin_tarefa_arquivar', { p_id: x.id, p_arquivar: true }).catch(() => {})
    } else {
      atualizarLocal(x.id, { status: acao.para, arquivada: false })
      await rpc('admin_tarefa_mover', { p_id: x.id, p_status: acao.para, p_texto: acao.texto || null }).catch(() => {})
    }
    carregar()
  }
  // Tarefa nova vai pro topo da coluna dela, com aviso, pra quem criou ver que foi.
  const salvar = async f => {
    const id = await rpc('admin_tarefa_salvar', { p: f })
    await carregar()
    if (!f.id) { setCriada(Number(id)); setFiltro('tudo'); setBusca(''); setColuna(f.status || 'fazer'); window.scrollTo({ top: 0 }) }
  }
  const apagar = async id => { await rpc('admin_tarefa_apagar', { p_id: id }); carregar() }
  const nova = () => setAberta({ ...VAZIA, para: revisorSugerido(eu, pessoas, eu), revisor: eu || '', status: coluna === 'arquivo' ? 'fazer' : coluna })

  // Deslizar o dedo na lista troca de coluna.
  const inicioToque = e => { toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const fimToque = e => {
    if (!toque.current) return
    const dx = e.changedTouches[0].clientX - toque.current.x
    const dy = e.changedTouches[0].clientY - toque.current.y
    toque.current = null
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    const i = COLUNAS.indexOf(coluna) + (dx < 0 ? 1 : -1)
    if (COLUNAS[i]) setColuna(COLUNAS[i])
  }

  const data = d => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: '2-digit', month: 'short' })

  const lista = c => {
    const itens = daColuna(c)
    if (!itens.length) return <p className="tq-vazio">{t(`painel.tarefas.vazio_col.${c}`)}</p>
    return (
      <ul className="tq-lista">
        {itens.map(x => (
          <TarefaCartao key={x.id} x={x} nova={x.id === criada} eu={eu} pessoa={pessoa} t={t} data={data} onAbrir={setAberta} onAcao={agir} />
        ))}
      </ul>
    )
  }

  if (erro) return <p className="painel-erro">{erro}</p>
  if (!tarefas) return <p className="painel-vazio">{t('painel.carregando')}</p>

  return (
    <div className="tq">
      <section className="tq-foco" aria-label={t('painel.tarefas.meu_foco')}>
        <button type="button" className={`tq-foco__item${filtro === 'comigo' ? ' is-ativo' : ''}`} onClick={() => { setFiltro('comigo'); setColuna('fazer') }}>
          <b>{foco.fazer}</b><span>{t('painel.tarefas.foco.fazer')}</span>
        </button>
        <button type="button" className={`tq-foco__item is-teste${filtro === 'revisar' ? ' is-ativo' : ''}`} onClick={() => { setFiltro('revisar'); setColuna('teste') }}>
          <b>{foco.revisar}</b><span>{t('painel.tarefas.foco.revisar')}</span>
        </button>
        <div className="tq-foco__item is-feito">
          <b>{foco.entregues}</b><span>{t('painel.tarefas.foco.entregues')}</span>
        </div>
      </section>

      <div className="tq-busca">
        <input type="search" value={busca} onChange={e => setBusca(e.target.value)} placeholder={t('painel.tarefas.buscar')} aria-label={t('painel.tarefas.buscar')} />
      </div>
      <div className="tq-filtros" role="group">
        {Object.keys(FILTROS).map(f => (
          <button key={f} type="button" className={`tq-chip${filtro === f ? ' is-ativo' : ''}`} onClick={() => setFiltro(f)}>{t(`painel.tarefas.filtro.${f}`)}</button>
        ))}
      </div>

      {largo ? (
        <div className="tq-quadro">
          {COLUNAS.map(c => (
            <section key={c} className={`tq-quadro__col is-${c}`}>
              <h3><span>{t(`painel.tarefas.col.${c}`)}</span><b>{daColuna(c).length}</b></h3>
              {lista(c)}
            </section>
          ))}
        </div>
      ) : (
        <>
          <nav className="tq-colunas" role="tablist" ref={barra}>
            {COLUNAS.map(c => (
              <button key={c} type="button" role="tab" aria-selected={coluna === c} className={`is-${c}${coluna === c ? ' is-ativa' : ''}`} onClick={() => setColuna(c)}>
                <span>{t(`painel.tarefas.col.${c}`)}</span>
                <b>{daColuna(c).length}</b>
              </button>
            ))}
          </nav>

          <div className="tq-lista-area" onTouchStart={inicioToque} onTouchEnd={fimToque}>
            {lista(coluna)}
          </div>
        </>
      )}

      {criada && <p className="tq-aviso-criada" role="status">{t('painel.tarefas.criada', { n: `LDI-${criada}` })}</p>}

      <button type="button" className="tq-nova" onClick={nova} aria-label={t('painel.tarefas.nova')}>+</button>

      {aberta && (
        <TarefaDetalhe key={aberta.id || 'nova'} tarefa={aberta} pessoas={pessoas} pessoa={pessoa} eu={eu} t={t} locale={locale}
          onFechar={() => setAberta(null)} onSalvar={salvar} onApagar={apagar} onAcao={agir} />
      )}
    </div>
  )
}
