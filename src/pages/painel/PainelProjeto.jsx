// Aba "Projeto": o que a Temporada 1 promete e o quanto já está pronto.
// Tudo é lido dos próprios dados do site (capítulos, páginas, traduções, calendário),
// então a aba se atualiza sozinha quando algo entra. O que não dá pra medir pelos dados
// (jogos, clipes, páginas a refazer) fica em MANUAL, editado à mão.
import livro from '../../data/historias/lutas-de-ilusao.json'
import obras from '../../data/historias/obras.json'
import contos from '../../data/historias/contos.json'
import episodios from '../../data/episodios.json'
import mds from '../../data/mundo-das-sombras-episodios.json'
import contosWs from '../../data/contos-de-ilusao-episodios.json'
import { T1, MUSICAS_T1, CLIPES_T1, GAMES_ROADMAP } from '../../data/season-one-schedule'
import { Cartao } from './PainelBlocos'
import './PainelProjeto.css'

const MD = new Set(Object.keys(import.meta.glob('../../data/historias/**/*.md')).map(k => k.replace('../../data/historias/', '')))
const tem = caminho => MD.has(caminho)
const naT1 = d => d && d >= T1.inicio && d <= T1.fim

// Status que os dados não mostram. pronto | parcial | falta, com nota curta.
const MANUAL = {
  // páginas do Mundo das Sombras ainda no formato antigo (768×1024), por capítulo
  ...Object.fromEntries([[1, 1], [3, 50], [4, 50], [5, 50], [6, 44], [7, 46], [8, 50], [9, 50]]
    .map(([n, velhas]) => [`mds:${n}`, { status: 'parcial', nota: `${velhas} págs a refazer em 960×1637` }])),
  'jogo:trumps': { status: 'pronto' },
  'jogo:gangues': { status: 'parcial', nota: 'revisão pendente (LDI-12)' },
  'jogo:ldi': { status: 'parcial', nota: 'revisão pendente (LDI-11)' },
}

const idiomas = base => ['pt', 'en', 'es'].filter(l => tem(base.replace('{l}', l)))

function grupos() {
  const capsLivro = livro.filter(c => naT1(c.liberacao?.elite)).map(c => {
    const nn = String(c.numero).padStart(2, '0')
    const ls = idiomas(`lutas-de-ilusao/{l}/capitulo-${nn}.md`)
    return { id: `livro:${c.numero}`, rotulo: `Cap. ${c.numero}`, data: c.liberacao.elite, status: ls.length === 3 ? 'pronto' : ls.length ? 'parcial' : 'falta', nota: ls.length < 3 ? `idiomas: ${ls.join(', ') || '—'}` : '' }
  })
  const sombras = obras.find(o => o.id === 'mundo-das-sombras')?.capitulos || []
  const capsSombras = sombras.filter(c => naT1(c.liberacao?.elite)).map((c, i) => {
    const ls = idiomas(`obras/mundo-das-sombras/{l}/${c.id}.md`)
    return { id: `sombras:${c.id}`, rotulo: `Cap. ${i + 1}`, data: c.liberacao.elite, status: ls.length === 3 ? 'pronto' : ls.length ? 'parcial' : 'falta', nota: ls.length < 3 ? `idiomas: ${ls.join(', ') || '—'}` : '' }
  })
  const contosT1 = contos.filter(c => naT1(c.capitulos[0]?.liberacao?.elite)).map(c => {
    const total = c.capitulos.length
    const ok = c.capitulos.filter(cap => idiomas(`contos/${c.id}/{l}/${String(cap.numero).padStart(2, '0')}.md`).length === 3).length
    return { id: `conto:${c.id}`, rotulo: c.titulo, data: c.capitulos[0].liberacao.elite, status: ok === total ? 'pronto' : ok ? 'parcial' : 'falta', nota: ok < total ? `${ok}/${total} caps nos 3 idiomas` : `${total} caps` }
  })
  // página feita só conta como pronta com os 3 idiomas
  const statusWs = e => (!e.paginas ? 'falta' : (e.idiomas || []).length >= 3 ? 'pronto' : 'parcial')
  const notaWs = e => [e.paginas && (e.idiomas || []).length < 3 && `só ${(e.idiomas || ['pt']).join('/').toUpperCase()}`, e.paginas && `${e.paginas} págs`].filter(Boolean).join(' · ')
  const webshard = episodios.filter(e => !e.especial && naT1(e.liberacao?.elite)).map(e => (
    { id: `webshard:${e.numero}`, rotulo: `Cap. ${e.numero}`, data: e.liberacao.elite, status: statusWs(e), nota: notaWs(e) }
  ))
  // especial com página feita entra mesmo sem data de liberação (aguardando data)
  const especiais = episodios.filter(e => e.especial && (naT1(e.liberacao?.elite) || e.paginas)).map((e, i) => (
    { id: `especial:${i + 1}`, rotulo: e.serie ? `${e.titulo_pt.split(' — ')[0].replace(/^Especial de /, '')} P${e.parte}` : `E${i + 1}`, data: naT1(e.liberacao?.elite) ? e.liberacao.elite : null, status: e.paginas ? 'pronto' : 'falta', nota: [e.serie ? e.titulo_pt.split(': ').pop() : e.titulo_pt, e.paginas && `${e.paginas} págs`, !naT1(e.liberacao?.elite) && 'sem data'].filter(Boolean).join(' · ') }
  ))
  const mdsWs = Array.from({ length: 9 }, (_, i) => {
    const ep = mds.find(e => Number(e.id) === i + 1)
    const max = ep?.paginas || Math.max(0, ...(ep?.versoes || []).map(v => v.paginas || 0))
    return { id: `mds:${i + 1}`, rotulo: `Cap. ${i + 1}`, data: null, status: max ? 'pronto' : 'falta', nota: max ? `${max} págs` : '' }
  })
  const musicas = MUSICAS_T1.map(m => ({ id: `musica:${m.n}`, rotulo: m.titulo?.pt || `Música ${m.n}`, data: m.liberacao.elite, status: m.titulo ? 'pronto' : 'falta', nota: '' }))
  const clipes = CLIPES_T1.map(c => ({ id: `clipe:${c.n}`, rotulo: `Clipe ${c.n}`, data: c.liberacao.elite, status: 'falta', nota: '' }))
  const jogos = GAMES_ROADMAP.flatMap(f => f.jogos.map(j => ({ id: `jogo:${j}`, rotulo: j, data: f.data, status: 'falta', nota: '' })))
  const contosWsItens = contosWs.map(e => ({ id: `contosws:${e.id}`, rotulo: e.titulo_pt, data: naT1(e.liberacao?.elite) ? e.liberacao.elite : null, status: statusWs(e), nota: notaWs(e) }))
  const aplica = lista => lista.map(x => ({ ...x, ...(MANUAL[x.id] || {}) }))
  return [
    { id: 'livro', itens: aplica(capsLivro) },
    { id: 'webshard', itens: aplica(webshard) },
    { id: 'especiais', itens: aplica(especiais) },
    { id: 'sombras', itens: aplica(capsSombras) },
    { id: 'mds', itens: aplica(mdsWs) },
    { id: 'contos', itens: aplica(contosT1) },
    { id: 'musicas', itens: aplica(musicas) },
    { id: 'clipes', itens: aplica(clipes) },
    { id: 'jogos', itens: aplica(jogos) },
    { id: 'contosws', itens: aplica(contosWsItens) },
  ]
}

const pct = itens => itens.length ? Math.round(100 * itens.reduce((s, x) => s + (x.status === 'pronto' ? 1 : x.status === 'parcial' ? 0.5 : 0), 0) / itens.length) : 0

function Barra({ valor }) {
  return <div className="projeto-barra" style={{ '--p': `${valor}%` }}><span>{valor}%</span></div>
}

export default function PainelProjeto({ t, locale }) {
  const gs = grupos()
  const todos = gs.flatMap(g => g.itens)
  const hoje = new Date().toISOString().slice(0, 10)
  const proximas = todos.filter(x => x.status !== 'pronto' && x.data).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 8)
  const data = d => (d ? new Date(`${d}T12:00:00`).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: '2-digit' }) : '—')

  return (
    <>
      <Cartao titulo={t('painel.projeto.geral')}>
        <Barra valor={pct(todos)} />
        <p className="painel-nota">{t('painel.projeto.legenda', { pronto: todos.filter(x => x.status === 'pronto').length, total: todos.length })}</p>
      </Cartao>

      <Cartao titulo={t('painel.projeto.prioridades')}>
        {!proximas.length ? <p className="painel-vazio">{t('painel.vazio')}</p> : (
          <ul className="projeto-prioridades">
            {proximas.map(x => (
              <li key={x.id} className={`is-${x.status}${x.data < hoje ? ' is-atrasado' : ''}`}>
                <span className="projeto-prioridades__data">{data(x.data)}</span>
                <span>{t(`painel.projeto.grupo.${x.id.split(':')[0]}`)} · {x.id.startsWith('jogo:') ? t(`calendar.game_${x.rotulo}`) : x.rotulo}</span>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      {gs.map(g => (
        <Cartao key={g.id} titulo={t(`painel.projeto.grupo.${g.id}`)}>
          <Barra valor={pct(g.itens)} />
          <ul className="projeto-itens">
            {g.itens.map(x => (
              <li key={x.id} className={`projeto-item is-${x.status}`} title={x.nota}>
                <b>{x.id.startsWith('jogo:') ? t(`calendar.game_${x.rotulo}`) : x.rotulo}</b>
                <small>{x.data ? data(x.data) : t(`painel.projeto.status.${x.status}`)}</small>
                {x.nota && <small className="projeto-item__nota">{x.nota}</small>}
              </li>
            ))}
          </ul>
        </Cartao>
      ))}
    </>
  )
}
