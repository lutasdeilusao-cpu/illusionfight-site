/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o mapa de Marelia
   Esqueleto pra o Isaias polir o visual e ligar a lógica depois.

   Cada território tem uma dificuldade, uma posição no mapa, alguns
   PONTOS a dominar (lutas normais) e um CHEFE. Domine todos os
   pontos + o chefe → território conquistado → o próximo libera.

   As 5 dificuldades ganharam nome de gameplay em vez de
   "fácil/difícil". A lore vem do crime organizado de Marelia
   (conto "Alan, o Campeão"): a Beira, a Baixada, o Morro, a Zona,
   o Alto — de baixo pra cima da hierarquia da Banca.

   `enemy` referencia os ids de gangues-enemies.json.
   `pos` é % no mapa (top/left) — o layout visual é livre pra mexer.
   ══════════════════════════════════════════════════════════════ */

export const GANGUES_DIFICULDADES = ['iniciacao', 'rua', 'territorio', 'guerra', 'coroa']

export const GANGUES_TERRITORIOS = [
  {
    id: 'beira',
    dificuldade: 'iniciacao',
    ordem: 1,
    pos: { top: 82, left: 27 },
    cor: '#3ddc97',
    pontos: [
      { id: 'beira-1', enemy: 'treinamento' },
      { id: 'beira-2', enemy: 'treinamento' },
      { id: 'beira-3', enemy: 'kaeda' },
    ],
    chefe: { id: 'beira-chefe', enemy: 'kaeda' },
  },
  {
    id: 'baixada',
    dificuldade: 'rua',
    ordem: 2,
    pos: { top: 64, left: 67 },
    cor: '#18dafb',
    pontos: [
      { id: 'baixada-1', enemy: 'kaeda' },
      { id: 'baixada-2', enemy: 'stormbyte' },
      { id: 'baixada-3', enemy: 'thunderbolt' },
    ],
    chefe: { id: 'baixada-chefe', enemy: 'thunderbolt' },
  },
  {
    id: 'morro',
    dificuldade: 'territorio',
    ordem: 3,
    pos: { top: 46, left: 28 },
    cor: '#ffae32',
    pontos: [
      { id: 'morro-1', enemy: 'stormbyte' },
      { id: 'morro-2', enemy: 'thunderbolt' },
      { id: 'morro-3', enemy: 'viran' },
      { id: 'morro-4', enemy: 'viran' },
    ],
    chefe: { id: 'morro-chefe', enemy: 'viran' },
  },
  {
    id: 'zona',
    dificuldade: 'guerra',
    ordem: 4,
    pos: { top: 30, left: 67 },
    cor: '#ff6b6b',
    pontos: [
      { id: 'zona-1', enemy: 'viran' },
      { id: 'zona-2', enemy: 'campeao' },
      { id: 'zona-3', enemy: 'campeao' },
      { id: 'zona-4', enemy: 'campeao' },
    ],
    chefe: { id: 'zona-chefe', enemy: 'campeao' },
  },
  {
    id: 'alto',
    dificuldade: 'coroa',
    ordem: 5,
    pos: { top: 14, left: 40 },
    cor: '#a855f7',
    pontos: [
      { id: 'alto-1', enemy: 'campeao' },
      { id: 'alto-2', enemy: 'kronos' },
      { id: 'alto-3', enemy: 'kronos' },
      { id: 'alto-4', enemy: 'primordial_jack' },
    ],
    chefe: { id: 'alto-chefe', enemy: 'primordial_jack' },
  },
]

export const GANGUES_TERRITORIO_POR_ID = Object.fromEntries(GANGUES_TERRITORIOS.map(t => [t.id, t]))

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
  // o próximo ponto não-dominado é o "atual"
  const proximo = territorio.pontos.find(pt => !(p.pontos || []).includes(pt.id))
  return proximo?.id === noId ? 'atual' : 'trancado'
}
