// Cardápio da área Creator: cada assunto que a NeoGuide serve.
// Textos no i18n da área (creators.<assunto>.*); aqui só estrutura, rota e arte.
import bannerLivro from '../../../assets/images/banners/banner-01.webp'
import bannerWebtoon from '../../../assets/images/banners/banner-02.webp'
import bannerGames from '../../../assets/images/banners/banner-03.webp'
import bannerMusica from '../../../assets/images/banners/banner-04.webp'
import capaSombras from '../../../assets/obras/mundo-das-sombras/capa.webp'
import capaCinzas from '../../../assets/obras/mar-de-cinzas/capa.webp'
import capaContos from '../../../assets/images/contos/capa-illusion-tales.webp'
import capaWebshard from '../../../assets/webshard/capa-lutas-de-ilusao.webp'
import capaLivro from '../../../assets/images/livro/capitulo-01.webp'
import fichaKim from '../../../assets/images/creators/fichas/ficha-kim.webp'
import fichaJack from '../../../assets/images/creators/fichas/ficha-jack.webp'
import fichaNina from '../../../assets/images/creators/fichas/ficha-nina.webp'
import fichaRyan from '../../../assets/images/creators/fichas/ficha-ryan.webp'

export const STEAM_APP = 'https://store.steampowered.com/app/1876210'
export const STEAM_DEMO = 'https://store.steampowered.com/app/5188520'

/** Ordem do menu "sobre o que você quer falar hoje?". */
export const ASSUNTOS = [
  {
    id: 'livros',
    icone: '📖',
    arte: bannerLivro,
    pratos: [
      { id: 'lutas', rota: '/historias/lutas-de-ilusao', arte: capaLivro, selo: 'exclusivo' },
      { id: 'sombras', rota: '/historias/mundo-das-sombras', arte: capaSombras, selo: 'exclusivo' },
      { id: 'cinzas', rota: '/historias/mar-de-cinzas', arte: capaCinzas, selo: 'inedito' },
      { id: 'contos', rota: '/historias/contos', arte: capaContos, selo: 'aberto' },
    ],
    pautas: 4,
  },
  {
    id: 'webtoon',
    icone: '🗂️',
    arte: bannerWebtoon,
    pratos: [
      { id: 'webshard', rota: '/webtoon', arte: capaWebshard, selo: 'exclusivo' },
    ],
    pautas: 3,
  },
  {
    id: 'games',
    icone: '🎮',
    arte: bannerGames,
    pratos: [
      { id: 'gangues', rota: '/games/ldi-gangues', icone: '🥊', selo: 'completo' },
      { id: 'lendas', rota: '/games/ldi', icone: '⚔️', selo: 'completo' },
      { id: 'trunfo', rota: '/games/toptrumps', icone: '🃏', selo: 'online' },
      { id: 'steam', href: STEAM_DEMO, icone: '🚂', selo: 'steam' },
    ],
    pautas: 4,
  },
  {
    id: 'universo',
    icone: '🌌',
    arte: bannerMusica,
    pratos: [
      { id: 'universos', rota: '/universos', icone: '🌌', selo: 'aberto' },
      { id: 'personagens', rota: '/personagens', icone: '🧬', selo: 'aberto' },
      { id: 'radio', rota: '/musicas', icone: '🎧', selo: 'aberto' },
      { id: 'autor', rota: '/autor', icone: '✍️', selo: 'aberto' },
    ],
    pautas: 3,
  },
]

/** Atalhos que não são assunto de conteúdo, mas serviço da casa. */
export const SERVICOS = [
  { id: 'temas', icone: '💡' },
  { id: 'artes', icone: '🎨' },
  { id: 'ficha', icone: '📋' },
  { id: 'duvidas', icone: '💬' },
]

/** Interesses perguntados na primeira visita (gravados no perfil). */
export const INTERESSES = ['livros', 'quadrinhos', 'games', 'musica', 'lore']

/** Artes liberadas pra uso no conteúdo do creator. */
export const ARTES = [
  { id: 'banner-livro', arquivo: bannerLivro },
  { id: 'banner-webtoon', arquivo: bannerWebtoon },
  { id: 'banner-games', arquivo: bannerGames },
  { id: 'banner-musica', arquivo: bannerMusica },
  { id: 'capa-sombras', arquivo: capaSombras },
  { id: 'capa-cinzas', arquivo: capaCinzas },
  { id: 'capa-contos', arquivo: capaContos },
  { id: 'capa-webshard', arquivo: capaWebshard },
  { id: 'ficha-kim', arquivo: fichaKim, largo: true },
  { id: 'ficha-jack', arquivo: fichaJack, largo: true },
  { id: 'ficha-nina', arquivo: fichaNina, largo: true },
  { id: 'ficha-ryan', arquivo: fichaRyan, largo: true },
]

/** Press kit completo (artes + textos de imprensa), gerado no build. */
export const PRESSKIT = '/presskit/illusion-fight-presskit.zip'

/** Perguntas que a NeoGuide responde. */
export const DUVIDAS = ['o_que_e', 'ano_todo', 'hiato', 'gratis', 'posso_falar', 'republicar', 'prazo', 'idiomas', 'lancamento', 'steam', 'contato']

/** Linhas da ficha técnica (texto pronto pra copiar). */
export const FICHA = ['nome', 'criador', 'formato', 'jogos', 'idiomas', 'preco', 'nextfest', 'lancamento', 'site', 'steam']

/** "Sobre o que eu posso falar?": temas que a NeoGuide sugere, cada um com
 *  os links onde o creator encontra o material. */
export const TEMAS = [
  { id: 'autor', icone: '✍️', links: [{ id: 'historias_autor', rota: '/historias/autor' }, { id: 'autor', rota: '/autor' }] },
  { id: 'personagens', icone: '🧬', links: [{ id: 'personagens', rota: '/personagens' }, { id: 'conto_nina', rota: '/historias/contos/04' }, { id: 'conto_jack', rota: '/historias/contos/05' }] },
  { id: 'contos', icone: '📜', links: [{ id: 'conto_alan', rota: '/historias/contos/02' }, { id: 'conto_ryan', rota: '/historias/contos/01' }, { id: 'conto_correntes', rota: '/historias/contos/07' }, { id: 'contos', rota: '/historias/contos' }] },
  { id: 'principal', icone: '📖', links: [{ id: 'livro', rota: '/historias/lutas-de-ilusao' }, { id: 'webtoon', rota: '/webtoon' }] },
  { id: 'temporada', icone: '🗓️', links: [{ id: 'calendario', rota: '/calendario' }, { id: 'sombras', rota: '/historias/mundo-das-sombras' }, { id: 'cinzas', rota: '/historias/mar-de-cinzas' }] },
  { id: 'games', icone: '🎮', links: [{ id: 'gangues', rota: '/games/ldi-gangues' }, { id: 'lendas', rota: '/games/ldi' }, { id: 'trunfo', rota: '/games/toptrumps' }] },
  { id: 'musica', icone: '🎧', links: [{ id: 'radio', rota: '/musicas' }, { id: 'conto_banda', rota: '/historias/contos/03' }] },
  { id: 'universo', icone: '🌌', links: [{ id: 'universos', rota: '/universos' }, { id: 'sombras', rota: '/historias/mundo-das-sombras' }, { id: 'cinzas', rota: '/historias/mar-de-cinzas' }] },
]
