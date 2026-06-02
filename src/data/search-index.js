import personagens from './personagens-pt.json'
import livro from './livro-index.json'
import episodios from './episodios.json'
import musicas from './musicas.json'
import mundo from './mundo-pt.json'

const index = []

personagens.forEach(p => {
  index.push({
    tipo: 'Personagem',
    titulo: p.nome,
    descricao: p.descricaoBreve || '',
    url: `/personagens/${p.id}`,
    premium: false,
  })
})

livro.forEach(ch => {
  index.push({
    tipo: 'Capítulo',
    titulo: `Capítulo ${String(ch.numero).padStart(2, '0')} — ${ch.titulo}`,
    descricao: ch.resumo_pt || '',
    url: `/livro/${ch.id.replace('capitulo-', '')}`,
    premium: !ch.publicado,
  })
})

episodios.filter(ep => ep.publicado).forEach(ep => {
  index.push({
    tipo: 'Webtoon',
    titulo: `Episódio ${String(ep.numero).padStart(2, '0')} — ${ep.titulo_pt}`,
    descricao: ep.descricao_pt || '',
    url: `/webtoon/${ep.id}`,
    premium: false,
  })
})

musicas.filter(m => m.plataformas.length > 0).forEach(m => {
  index.push({
    tipo: 'Música',
    titulo: m.titulo,
    descricao: `${m.artista} — Disponível nas plataformas`,
    url: '/musicas',
    premium: false,
  })
})

if (mundo.glossario) {
  mundo.glossario.forEach(g => {
    index.push({
      tipo: 'Lore',
      titulo: g.sigla,
      descricao: g.descricao.slice(0, 120),
      url: '/mundo',
      premium: g.premium || false,
    })
  })
}

if (mundo.localizacoes) {
  mundo.localizacoes.forEach(l => {
    index.push({
      tipo: 'Lore',
      titulo: l.nome,
      descricao: l.descricao.slice(0, 120),
      url: '/mundo',
      premium: false,
    })
  })
}

if (mundo.timeline) {
  mundo.timeline.forEach(t => {
    index.push({
      tipo: 'Lore',
      titulo: `${t.ano} — ${t.titulo}`,
      descricao: t.texto.slice(0, 120),
      url: '/mundo#timeline',
      premium: false,
    })
  })
}

index.push({
  tipo: 'Quiz',
  titulo: 'Quiz SDR — Teste seu Ranking',
  descricao: 'Responda perguntas sobre o universo LDI e descubra sua posição no SDR entre 3 bilhões de jogadores.',
  url: '/quiz',
  premium: false,
})

export default index
