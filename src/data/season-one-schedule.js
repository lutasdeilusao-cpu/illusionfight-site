// Calendário da Temporada 1, montado a partir das datas reais de liberação
// (`liberacao` de cada capítulo nos índices editoriais) — o que aparece aqui é
// exatamente o que o site libera, sem lista paralela pra manter.
//
// Cronograma: a temporada anda em ciclos de 4 meses — 3 meses lançando e 1 de
// hiato. Histórias: 1 capítulo a cada 15 dias (dias 15 e 30) pro assinante,
// que só no lançamento da temporada começa com 2; a conta grátis recebe 15 dias depois e o
// público mais 15 (1 mês atrás). WEB SHARD: 1 capítulo por mês nos meses de
// lançamento, mesma defasagem; no mês de hiato o assinante recebe um WEB SHARD
// especial no dia 15, no lugar do capítulo. No hiato sai O Mundo das Sombras pro assinante
// no dia 15 (no 1º hiato, 15 e 30) e um conto inteiro no dia 30; a conta
// recebe 1 Mundo das Sombras por hiato no dia 30; o público não vê. Depois
// do último hiato o assinante recebe os contos restantes de 15 em 15 dias; o público fica parado — o que cairia pra ele no mês de
// hiato sai na volta do ciclo — e Mar de Cinzas fica em avaliação.
import livro from './historias/lutas-de-ilusao.json'
import obras from './historias/obras.json'
import contos from './historias/contos.json'
import episodios from './episodios.json'

export const T1 = { inicio: '2026-11-15', fim: '2028-01-31' }
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
  // Conto entra inteiro de uma vez: um item por conto, na data do 1º capítulo.
  ...contos.map(c => ({ item: { tipo: 'conto', titulo: { pt: c.titulo, en: c.titulo_en, es: c.titulo_es } }, liberacao: c.capitulos[0]?.liberacao })),
]
const itensWebshard = episodios
  .filter(e => e.liberacao)
  .map(e => ({ item: e.especial ? { tipo: 'especial', titulo: { pt: e.titulo_pt, en: e.titulo_en, es: e.titulo_es } } : { tipo: 'webshard', n: e.numero }, liberacao: e.liberacao }))

// Músicas: 1 por mês nos meses de lançamento (9 na T1), exclusiva da Rádio
// Nina pro assinante no dia 15; conta grátis 1 mês depois, público 2 meses depois.
const MESES_LANCAMENTO = ['2026-11', '2026-12', '2027-01', '2027-03', '2027-04', '2027-05', '2027-07', '2027-08', '2027-09']
const maisMeses = (mes, n) => {
  const [a, m] = mes.split('-').map(Number)
  const total = a * 12 + (m - 1) + n
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-15`
}
export const MUSICAS_T1 = MESES_LANCAMENTO.map((mes, i) => ({
  n: i + 1,
  liberacao: { primordial: `${mes}-15`, elite: `${mes}-15`, conta: maisMeses(mes, 1), publico: maisMeses(mes, 2) },
}))

export const SEASON_ONE_DROPS = {
  chapters: linhasDoTempo(itensHistorias),
  webtoon: linhasDoTempo(itensWebshard),
  music: linhasDoTempo(MUSICAS_T1.map(m => ({ item: { tipo: 'musica', n: m.n }, liberacao: m.liberacao }))),
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
  music: [conclusao('musicas', MUSICAS_T1)],
}

// Jogos por quadrimestre: cada um entra no começo do ciclo dele.
export const GAMES_ROADMAP = [
  { fase: 'q1', data: '2026-11-15', jogos: ['trumps', 'gangues', 'ldi'] },
  { fase: 'q2', data: '2027-03-15', jogos: ['tama', 'jack', 'tatics'] },
  { fase: 'q3', data: '2027-07-15', jogos: ['duelo', 'rpg', 'isometrico'] },
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
