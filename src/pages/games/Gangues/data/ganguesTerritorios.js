/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o mapa de Marelia, antes de ter dono
   Esqueleto pra o Isaias polir o visual e pôr arte dos bosses depois.

   AMBIENTAÇÃO (liga no conto "Alan, o Campeão", contos-index id 02):
   Anos antes do Alan, um cara chamado Damião — o Costura — quase fez o
   que o Alan ia fazer: juntar Marelia inteira numa bandeira só. Chegou
   a segurar seis bairros e a Laje. Não durou. Marelia rachou de novo.

   O LDI Gangues é essa época. Você monta a sua gangue lá embaixo, na
   Pista, e sobe bairro por bairro: primeiro as gangue pequena de cada
   ponto, depois o foda da região — o boss da gangue dona do lugar.
   No topo, na Laje, tem o Costura. Você derruba ele. E aí descobre o
   que ele já sabia: essa porra não se segura na mão de ninguém.
   (Só o Alan ia conseguir. Mas isso é depois.)

   • `boss` referencia story.bosses.<key> — nome/vulgo + trash talk.
     Os boss são gente, voz de rua. O Isaias põe os retratos depois.
   • `gangue` referencia story.gangues.<key>.
   • `enemy` referencia gangues-enemies.json (o lutador que representa
     aquele ponto/boss — placeholder até ter os de verdade).
   • `poly` / `pos` são coords no SVG do mapa (viewBox 0 0 100 108).
   ══════════════════════════════════════════════════════════════ */

// As 7 "dificuldades" = o quão quente é a disputa na região. Sem fácil/difícil.
export const GANGUES_DIFICULDADES = ['rato', 'muvuca', 'correria', 'disputa', 'guerra', 'sangue', 'coroa']

export const GANGUES_TERRITORIOS = [
  {
    id: 'pista',
    dificuldade: 'rato',
    ordem: 1,
    cor: '#3ddc97',
    poly: '6,102 44,96 40,80 4,84',
    pos: { top: 88, left: 24 },
    pontos: [
      { id: 'pista-1', gangue: 'rato_pista', enemy: 'treinamento', forca: 1 },
      { id: 'pista-2', gangue: 'rato_pista', enemy: 'treinamento', forca: 1 },
      { id: 'pista-3', gangue: 'bonde_sinal', enemy: 'kaeda', forca: 2 },
    ],
    chefe: { id: 'pista-chefe', gangue: 'rato_pista', enemy: 'kaeda', forca: 3, boss: 'fumaca' },
  },
  {
    id: 'feira',
    dificuldade: 'muvuca',
    ordem: 2,
    cor: '#7ee787',
    poly: '52,98 96,92 92,74 48,80',
    pos: { top: 80, left: 72 },
    pontos: [
      { id: 'feira-1', gangue: 'cobranca_turco', enemy: 'kaeda', forca: 2 },
      { id: 'feira-2', gangue: 'cobranca_turco', enemy: 'kaeda', forca: 3 },
      { id: 'feira-3', gangue: 'os_gato', enemy: 'stormbyte', forca: 3 },
    ],
    chefe: { id: 'feira-chefe', gangue: 'cobranca_turco', enemy: 'stormbyte', forca: 4, boss: 'turco' },
  },
  {
    id: 'baixada',
    dificuldade: 'correria',
    ordem: 3,
    cor: '#18dafb',
    poly: '8,80 46,76 42,58 6,62',
    pos: { top: 66, left: 24 },
    pontos: [
      { id: 'baixada-1', gangue: 'sombra_rubra', enemy: 'stormbyte', forca: 3 },
      { id: 'baixada-2', gangue: 'sombra_fria', enemy: 'thunderbolt', forca: 4 },
      { id: 'baixada-3', gangue: 'os_restos', enemy: 'thunderbolt', forca: 4 },
    ],
    chefe: { id: 'baixada-chefe', gangue: 'sombra_fria', enemy: 'thunderbolt', forca: 5, boss: 'espeto' },
  },
  {
    id: 'vila',
    dificuldade: 'disputa',
    ordem: 4,
    cor: '#ffae32',
    poly: '52,74 96,70 92,52 50,56',
    pos: { top: 58, left: 72 },
    pontos: [
      { id: 'vila-1', gangue: 'bonde_predio', enemy: 'thunderbolt', forca: 4 },
      { id: 'vila-2', gangue: 'bonde_predio', enemy: 'viran', forca: 5 },
      { id: 'vila-3', gangue: 'os_andar_de_cima', enemy: 'viran', forca: 5 },
    ],
    chefe: { id: 'vila-chefe', gangue: 'bonde_predio', enemy: 'viran', forca: 6, boss: 'sala' },
  },
  {
    id: 'morro',
    dificuldade: 'guerra',
    ordem: 5,
    cor: '#ff8f3c',
    poly: '10,56 48,52 44,34 8,38',
    pos: { top: 42, left: 24 },
    pontos: [
      { id: 'morro-1', gangue: 'frente_escada', enemy: 'viran', forca: 5 },
      { id: 'morro-2', gangue: 'frente_escada', enemy: 'campeao', forca: 6 },
      { id: 'morro-3', gangue: 'os_fogueteiro', enemy: 'campeao', forca: 6 },
    ],
    chefe: { id: 'morro-chefe', gangue: 'frente_escada', enemy: 'campeao', forca: 7, boss: 'zefa' },
  },
  {
    id: 'alto',
    dificuldade: 'sangue',
    ordem: 6,
    cor: '#ff6b6b',
    poly: '52,50 94,46 90,28 50,32',
    pos: { top: 34, left: 72 },
    pontos: [
      { id: 'alto-1', gangue: 'os_cinco', enemy: 'campeao', forca: 6 },
      { id: 'alto-2', gangue: 'os_cinco', enemy: 'kronos', forca: 7 },
      { id: 'alto-3', gangue: 'a_roda', enemy: 'kronos', forca: 8 },
    ],
    chefe: { id: 'alto-chefe', gangue: 'os_cinco', enemy: 'kronos', forca: 9, boss: 'doutor' },
  },
  {
    id: 'laje',
    dificuldade: 'coroa',
    ordem: 7,
    cor: '#a855f7',
    poly: '30,30 72,30 64,4 36,4',
    pos: { top: 15, left: 49 },
    pontos: [
      { id: 'laje-1', gangue: 'bonde_costura', enemy: 'kronos', forca: 7 },
      { id: 'laje-2', gangue: 'bonde_costura', enemy: 'primordial_jack', forca: 8 },
      { id: 'laje-3', gangue: 'bonde_costura', enemy: 'primordial_jack', forca: 9 },
    ],
    chefe: { id: 'laje-chefe', gangue: 'bonde_costura', enemy: 'primordial_jack', forca: 10, boss: 'costura', ehFinal: true },
  },
]

export const GANGUES_TERRITORIO_POR_ID = Object.fromEntries(GANGUES_TERRITORIOS.map(t => [t.id, t]))

/** O confronto final — o Costura, na Laje. Canon: Marelia não fica com você. */
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
