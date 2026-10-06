// Calendário da Temporada 1, montado a partir das datas reais de liberação
// (`liberacao` de cada capítulo nos índices editoriais) — o que aparece aqui é
// exatamente o que o site libera, sem lista paralela pra manter.
//
// Cronograma: a temporada anda em ciclos de 4 meses — 3 meses lançando e 1 de
// hiato. Histórias: 1 capítulo a cada 15 dias (dias 15 e 30) pro assinante,
// que começa cada ciclo com 2; a conta grátis recebe 15 dias depois e o
// público mais 15 (1 mês atrás). WEB SHARD: 1 capítulo por mês nos meses de
// lançamento, mesma defasagem. No hiato sai O Mundo das Sombras pro assinante
// e pra conta (+15); o público fica parado — o que cairia pra ele no mês de
// hiato sai na volta do ciclo — e Mar de Cinzas fica em avaliação.
import livro from './historias/lutas-de-ilusao.json'
import obras from './historias/obras.json'
import episodios from './episodios.json'

export const T1 = { inicio: '2026-11-15', fim: '2027-10-31' }
// Mês de hiato (YYYY-MM): aparece como faixa no topo do mês, nunca como dia.
export const HIATOS = [
  { n: 1, mes: '2027-02' },
  { n: 2, mes: '2027-06' },
  { n: 3, mes: '2027-10' },
]
const NIVEIS = [['subscriber', 'primordial'], ['account', 'conta'], ['public', 'publico']]
const naT1 = data => data >= T1.inicio && data <= T1.fim

function linhasDoTempo(itens) {
  const porData = {}
  const linha = data => (porData[data] ||= { date: data, subscriber: [], account: [], public: [] })
  for (const { item, liberacao } of itens) {
    for (const [nivel, campo] of NIVEIS) {
      const data = liberacao?.[campo]
      if (data && naT1(data)) linha(data)[nivel].push(item)
    }
  }
  return Object.values(porData).sort((a, b) => a.date.localeCompare(b.date)).map((row, i) => ({ number: i + 1, ...row }))
}

const sombras = obras.find(o => o.id === 'mundo-das-sombras')?.capitulos || []

const itensHistorias = [
  ...livro.map(c => ({ item: { tipo: 'livro', n: c.numero }, liberacao: c.liberacao })),
  ...sombras.map((c, i) => ({ item: { tipo: 'sombras', n: i + 1 }, liberacao: c.liberacao })),
]
const itensWebshard = episodios
  .filter(e => e.liberacao)
  .map(e => ({ item: e.especial ? { tipo: 'especial' } : { tipo: 'webshard', n: e.numero }, liberacao: e.liberacao }))

export const SEASON_ONE_DROPS = {
  chapters: linhasDoTempo(itensHistorias),
  webtoon: linhasDoTempo(itensWebshard),
}

// Quando cada obra fecha na T1, por nível. `null` = só na Temporada 2.
const ultimo = (lista, campo) => {
  const datas = lista.map(c => c.liberacao?.[campo]).filter(Boolean).sort()
  const fim = datas.at(-1)
  return fim && naT1(fim) ? fim : null
}
const conclusao = (id, lista) => ({ id, subscriber: ultimo(lista, 'primordial'), account: ultimo(lista, 'conta'), public: ultimo(lista, 'publico') })
const capsWebshard = episodios.filter(e => !e.especial && e.liberacao)
export const SEASON_ONE_COMPLETION = {
  chapters: [conclusao('ldi', livro), conclusao('shadows', sombras)],
  webtoon: [conclusao('webshard', capsWebshard)],
}

// Jogos por fase. Os da T1 já estão no ar no lançamento; os outros entram no
// 2º ciclo ou depois, sem data fechada.
export const GAMES_ROADMAP = [
  { fase: 't1', data: '2026-11-15', jogos: ['trumps', 'ldi', 'gangues'] },
  { fase: 'ciclo2', data: '2027-03-15', jogos: ['jack', 'tatics', 'tama', 'kernel'] },
  { fase: 'depois', data: null, jogos: ['duelo', 'rpg'] },
]

// Panorama: só a T1 é garantida; as próximas são a mesma cadência projetada.
export const SEASONS_OVERVIEW = [
  { season: 'T1', start: '2026-11-15', end: '2027-10-30', note: 'note_t1', confirmada: true },
  { season: 'T2', start: '2027-11-15', end: '2028-10-30', confirmada: false },
  { season: 'T3', start: '2028-11-15', end: '2029-10-30', confirmada: false },
  { season: 'T4', start: '2029-11-15', end: '2030-10-30', confirmada: false },
  { season: 'T5', start: '2030-11-15', end: '2031-10-30', confirmada: false },
  { season: 'T6', start: '2031-11-15', end: '2032-10-30', confirmada: false },
]
