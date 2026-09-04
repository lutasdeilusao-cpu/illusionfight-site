/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o mapa de Marelia ANTES do Alan
   Esqueleto pra o Isaias polir o visual e ligar a lógica depois.

   AMBIENTAÇÃO (fiel ao conto "Alan, o Campeão", contos-index id 02):
   O LDI Gangues acontece ANTES de Marelia ter dono. A cidade é uma
   bagunça: dezenas de gangues pequenas, cada uma segurando seus
   pontos, ninguém manda em nada além do próprio quarteirão.

   O jogador monta a sua gangue e sobe nesse caos — toma ponto por
   ponto, região por região, engole gangue por gangue. Enquanto isso,
   do outro lado do mapa, um moleque chamado Alan está fazendo a mesma
   coisa. Os dois só se encontram no topo: na Laje.

   E ali Marelia ganha o Rei dela. Não é você. Você chega mais perto
   do que qualquer outro — e é por isso que, dali pra frente, quando
   o Alan fala o seu nome, ele fala com respeito.

   • REGIÕES (5, do pé do morro pro topo):
     A Rua → A Baixada → O Morro → O Alto do Morro → A Laje
   • Cada região tem VÁRIOS PONTOS, cada um segurado por uma gangue.
     Domina todos + a gangue dominante da região → a região é sua,
     e a próxima abre.
   • `gangue` referencia story.gangues.<key> na i18n (o Isaias troca
     os nomes/artes). `enemy` referencia gangues-enemies.json (o
     lutador que representa a gangue naquele ponto — placeholder).
   • `poly` / `pos` são coordenadas no SVG do mapa (viewBox 0 0 100 120)
     — arte de mapa de verdade entra por cima depois.
   ══════════════════════════════════════════════════════════════ */

// As 5 "dificuldades" = o quão quente está a disputa naquela região.
// Sem "fácil/difícil" — nomes de dentro do jogo.
export const GANGUES_DIFICULDADES = ['formiga', 'muvuca', 'disputa', 'guerra', 'coroa']

export const GANGUES_TERRITORIOS = [
  {
    id: 'rua',
    dificuldade: 'formiga',
    ordem: 1,
    cor: '#3ddc97',
    // distrito de baixo, colado no asfalto
    poly: '8,98 46,92 42,74 4,80',
    pos: { top: 84, left: 24 },
    // molecada de rua: rouba, corre, vende bala no sinal
    pontos: [
      { id: 'rua-p1', gangue: 'molecada_pista', enemy: 'treinamento', forca: 1 },
      { id: 'rua-p2', gangue: 'molecada_pista', enemy: 'treinamento', forca: 1 },
      { id: 'rua-p3', gangue: 'bonde_sinal', enemy: 'kaeda', forca: 2 },
      { id: 'rua-p4', gangue: 'bonde_sinal', enemy: 'kaeda', forca: 2 },
    ],
    chefe: { id: 'rua-chefe', gangue: 'bonde_sinal', enemy: 'kaeda', forca: 3 },
  },
  {
    id: 'baixada',
    dificuldade: 'muvuca',
    ordem: 2,
    cor: '#18dafb',
    // do outro lado da linha do trem
    poly: '52,90 96,84 92,62 48,68',
    pos: { top: 76, left: 74 },
    // a facção do Sombra rachou em três quando ele morreu — os cacos
    // brigam entre si antes de brigar com você
    pontos: [
      { id: 'baixada-p1', gangue: 'sombra_rubra', enemy: 'kaeda', forca: 2 },
      { id: 'baixada-p2', gangue: 'sombra_rubra', enemy: 'stormbyte', forca: 3 },
      { id: 'baixada-p3', gangue: 'sombra_fria', enemy: 'stormbyte', forca: 3 },
      { id: 'baixada-p4', gangue: 'os_restos', enemy: 'thunderbolt', forca: 3 },
    ],
    chefe: { id: 'baixada-chefe', gangue: 'sombra_fria', enemy: 'thunderbolt', forca: 4 },
  },
  {
    id: 'morro',
    dificuldade: 'disputa',
    ordem: 3,
    cor: '#ffae32',
    // a favela de encosta, a escadaria de cimento
    poly: '10,64 48,60 44,36 6,40',
    pos: { top: 52, left: 24 },
    // bocas soltas, cada dono no seu ponto — ninguém unificou ainda
    pontos: [
      { id: 'morro-p1', gangue: 'boca_escada', enemy: 'stormbyte', forca: 3 },
      { id: 'morro-p2', gangue: 'boca_escada', enemy: 'thunderbolt', forca: 4 },
      { id: 'morro-p3', gangue: 'frente_cimento', enemy: 'thunderbolt', forca: 4 },
      { id: 'morro-p4', gangue: 'os_fogueteiro', enemy: 'viran', forca: 4 },
    ],
    chefe: { id: 'morro-chefe', gangue: 'frente_cimento', enemy: 'viran', forca: 5 },
  },
  {
    id: 'alto',
    dificuldade: 'guerra',
    ordem: 4,
    cor: '#ff6b6b',
    // o alto do morro, atrás da porta de aço
    poly: '54,58 94,54 90,30 50,34',
    pos: { top: 46, left: 74 },
    // os barões que quase unificaram o Morro antes do Alan aparecer
    pontos: [
      { id: 'alto-p1', gangue: 'a_roda', enemy: 'viran', forca: 5 },
      { id: 'alto-p2', gangue: 'a_roda', enemy: 'campeao', forca: 5 },
      { id: 'alto-p3', gangue: 'os_cinco', enemy: 'campeao', forca: 6 },
      { id: 'alto-p4', gangue: 'os_cinco', enemy: 'kronos', forca: 6 },
    ],
    chefe: { id: 'alto-chefe', gangue: 'os_cinco', enemy: 'kronos', forca: 7 },
  },
  {
    id: 'laje',
    dificuldade: 'coroa',
    ordem: 5,
    cor: '#a855f7',
    // a laje no topo, de um lado Marelia inteira, do outro o Alan
    poly: '30,32 72,32 64,6 36,6',
    pos: { top: 18, left: 50 },
    // o bonde do Alan. E o Alan.
    pontos: [
      { id: 'laje-p1', gangue: 'bonde_alan', enemy: 'campeao', forca: 6 },
      { id: 'laje-p2', gangue: 'bonde_alan', enemy: 'kronos', forca: 7 },
      { id: 'laje-p3', gangue: 'bonde_alan', enemy: 'primordial_jack', forca: 8 },
    ],
    chefe: { id: 'laje-chefe', gangue: 'alan', enemy: 'campeao', forca: 10, ehAlan: true },
  },
]

export const GANGUES_TERRITORIO_POR_ID = Object.fromEntries(GANGUES_TERRITORIOS.map(t => [t.id, t]))

/** O confronto final contra o Alan — canon: você não fica com Marelia. */
export const GANGUES_NO_FINAL = { territorioId: 'laje', noId: 'laje-chefe' }
export function ehConfrontoFinal(alvo) {
  return alvo?.territorioId === GANGUES_NO_FINAL.territorioId && alvo?.noId === GANGUES_NO_FINAL.noId
}

/** Total de nós (pontos + chefe) de um território. */
export function totalNos(territorio) {
  return (territorio.pontos?.length || 0) + 1
}

/** Progresso 0..1 de um território a partir do storyProgress do store. */
export function progressoTerritorio(territorio, storyProgress = {}) {
  const p = storyProgress[territorio.id] || { pontos: [], chefe: false }
  const feitos = (p.pontos?.length || 0) + (p.chefe ? 1 : 0)
  return feitos / totalNos(territorio)
}

/** Estado de um território: 'dominado' | 'aberto' | 'trancado'.
 *  Abre quando o território de ordem anterior está dominado. */
export function estadoTerritorio(territorio, storyProgress = {}) {
  const p = storyProgress[territorio.id] || { pontos: [], chefe: false }
  const dominado = p.chefe && (p.pontos?.length || 0) >= (territorio.pontos?.length || 0)
  if (dominado) return 'dominado'
  if (territorio.ordem === 1) return 'aberto'
  const anterior = GANGUES_TERRITORIOS.find(t => t.ordem === territorio.ordem - 1)
  const antP = anterior ? (storyProgress[anterior.id] || { pontos: [], chefe: false }) : null
  const antDominado = antP && antP.chefe && (antP.pontos?.length || 0) >= (anterior.pontos?.length || 0)
  return antDominado ? 'aberto' : 'trancado'
}

/** Estado de um nó dentro de um território:
 *  'dominado' | 'atual' | 'trancado'. O chefe só abre com todos os pontos. */
export function estadoNo(territorio, noId, storyProgress = {}) {
  const p = storyProgress[territorio.id] || { pontos: [], chefe: false }
  const isChefe = territorio.chefe.id === noId
  if (isChefe) {
    if (p.chefe) return 'dominado'
    return (p.pontos?.length || 0) >= (territorio.pontos?.length || 0) ? 'atual' : 'trancado'
  }
  if ((p.pontos || []).includes(noId)) return 'dominado'
  const proximo = territorio.pontos.find(pt => !(p.pontos || []).includes(pt.id))
  return proximo?.id === noId ? 'atual' : 'trancado'
}
