/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o mapa de Marelia
   Esqueleto pra o Isaias polir o visual e ligar a lógica depois.

   Estrutura fiel ao conto "Alan, o Campeão" (contos-index id 02):

   • GEOGRAFIA (os 5 territórios, de baixo pra cima):
     A Rua → A Baixada → O Morro → O Alto do Morro → A Laje.
   • HIERARQUIA DA BANCA (os degraus dentro de cada território — os
     "pontos" a dominar): bucha de canhão → olheiro/fogueteiro →
     vapor → cobrador → segurança → gerente de boca → frente/dono
     de bairro → cúpula → o Campeão (o topo).
   • REGRA MÁXIMA DO MORRO: "quem manda é quem entrega". A hierarquia
     ainda se resolve do jeito antigo: dois num espaço vazio, o resto
     do Morro em volta olhando. Quem fica em pé, sobe.

   `enemy` referencia gangues-enemies.json (o Isaias vai criar os
   desafiantes/chefes de verdade e trocar aqui).
   `pos` é % no mapa (top/left) — layout livre pra mexer.
   ══════════════════════════════════════════════════════════════ */

// As 5 dificuldades = os degraus da Banca. Sem "fácil/difícil".
export const GANGUES_DIFICULDADES = ['bucha', 'vapor', 'cobrador', 'frente', 'coroa']

export const GANGUES_TERRITORIOS = [
  {
    id: 'rua',
    dificuldade: 'bucha',
    ordem: 1,
    pos: { top: 82, left: 27 },
    cor: '#3ddc97',
    // os degraus de baixo: a molecada de rua que a Banca usa e descarta
    pontos: [
      { id: 'rua-1', enemy: 'treinamento', rank: 'bucha' },
      { id: 'rua-2', enemy: 'treinamento', rank: 'olheiro' },
      { id: 'rua-3', enemy: 'kaeda', rank: 'vapor' },
    ],
    chefe: { id: 'rua-chefe', enemy: 'kaeda', rank: 'gerente' },
  },
  {
    id: 'baixada',
    dificuldade: 'vapor',
    ordem: 2,
    pos: { top: 64, left: 67 },
    cor: '#18dafb',
    // do outro lado da linha do trem: os cacos da facção do Sombra
    pontos: [
      { id: 'baixada-1', enemy: 'kaeda', rank: 'vapor' },
      { id: 'baixada-2', enemy: 'stormbyte', rank: 'cobrador' },
      { id: 'baixada-3', enemy: 'thunderbolt', rank: 'seguranca' },
    ],
    chefe: { id: 'baixada-chefe', enemy: 'thunderbolt', rank: 'chefe_baixada' },
  },
  {
    id: 'morro',
    dificuldade: 'cobrador',
    ordem: 3,
    pos: { top: 46, left: 28 },
    cor: '#ffae32',
    // a favela de encosta, a escadaria de cimento, as bocas
    pontos: [
      { id: 'morro-1', enemy: 'stormbyte', rank: 'cobrador' },
      { id: 'morro-2', enemy: 'thunderbolt', rank: 'seguranca' },
      { id: 'morro-3', enemy: 'viran', rank: 'gerente' },
      { id: 'morro-4', enemy: 'viran', rank: 'frente' },
    ],
    chefe: { id: 'morro-chefe', enemy: 'viran', rank: 'dono_bairro' },
  },
  {
    id: 'alto',
    dificuldade: 'frente',
    ordem: 4,
    pos: { top: 30, left: 67 },
    cor: '#ff6b6b',
    // atrás da porta de aço: a cúpula, os 4-5 que a rua nunca vê
    pontos: [
      { id: 'alto-1', enemy: 'viran', rank: 'dono_bairro' },
      { id: 'alto-2', enemy: 'campeao', rank: 'cupula' },
      { id: 'alto-3', enemy: 'campeao', rank: 'cupula' },
      { id: 'alto-4', enemy: 'campeao', rank: 'cupula' },
    ],
    chefe: { id: 'alto-chefe', enemy: 'campeao', rank: 'cupula' },
  },
  {
    id: 'laje',
    dificuldade: 'coroa',
    ordem: 5,
    pos: { top: 14, left: 40 },
    cor: '#a855f7',
    // a laje do alto do Morro, onde a hierarquia se resolve na porrada
    pontos: [
      { id: 'laje-1', enemy: 'campeao', rank: 'braco_direito' },
      { id: 'laje-2', enemy: 'kronos', rank: 'braco_direito' },
      { id: 'laje-3', enemy: 'primordial_jack', rank: 'braco_direito' },
    ],
    chefe: { id: 'laje-chefe', enemy: 'campeao', rank: 'campeao' },
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
  const proximo = territorio.pontos.find(pt => !(p.pontos || []).includes(pt.id))
  return proximo?.id === noId ? 'atual' : 'trancado'
}
