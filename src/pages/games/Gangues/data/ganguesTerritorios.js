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
   • `enemy` no CHEFE é a ficha de combate de verdade (gangues-enemies.json).
     Num ponto comum (não-chefe) é só um "molde semente" — o bando de
     verdade é sorteado na hora (GanguesRoute → gerarBandoInimigo, moldes
     por território em data/ganguesEncontros.js), calibrado contra o total
     de pontos do time atual do jogador. `dificuldade` (facil/normal/dificil)
     alterna dentro do território pra não empilhar luta puxada atrás de
     luta puxada.
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
    // A Pista tem CENA própria (ver data/cenas/pista.js) — GanguesCena
    // substitui essa trilha em jogo. Os campos abaixo (enemy/forca) ficam
    // só pra bookkeeping de domínio (marcarNoDominado usa os ids); os
    // combates de verdade usam os POIs da cena, não estes.
    pontos: [
      { id: 'pista-1', gangue: 'rato_pista', enemy: 'moleque_a', forca: 1, dificuldade: 'normal' },
      { id: 'pista-2', gangue: 'rato_pista', enemy: 'moleque_a', forca: 1, dificuldade: 'dificil' },
      { id: 'pista-3', gangue: 'bonde_sinal', enemy: 'moleque_b', forca: 2, dificuldade: 'facil' },
    ],
    chefe: { id: 'pista-chefe', gangue: 'rato_pista', enemy: 'fumaca', forca: 3, boss: 'fumaca' },
  },
  {
    id: 'feira',
    dificuldade: 'muvuca',
    ordem: 2,
    cor: '#7ee787',
    poly: '52,98 96,92 92,74 48,80',
    pos: { top: 80, left: 72 },
    // Reaproveitamento: os 3 pontos da Feira não bastam pra abrir o chefe —
    // precisa também ter falado com o informante lá na Pista (POI
    // repetível `informante`, ver data/cenas/pista.js). É a primeira ponte
    // entre territórios: o jogo obriga voltar num bairro já dominado pra
    // avançar num novo, em vez de só progresso linear pra frente.
    precisaInformante: true,
    pontos: [
      { id: 'feira-1', gangue: 'cobranca_turco', enemy: 'turco_batedor', forca: 2, dificuldade: 'normal' },
      { id: 'feira-2', gangue: 'cobranca_turco', enemy: 'turco_capanga', forca: 3, dificuldade: 'dificil' },
      { id: 'feira-3', gangue: 'os_gato', enemy: 'gato_eletrico', forca: 3, dificuldade: 'facil' },
    ],
    chefe: { id: 'feira-chefe', gangue: 'cobranca_turco', enemy: 'turco', forca: 4, boss: 'turco' },
  },
  {
    id: 'baixada',
    dificuldade: 'correria',
    ordem: 3,
    cor: '#18dafb',
    poly: '8,80 46,76 42,58 6,62',
    pos: { top: 66, left: 24 },
    pontos: [
      { id: 'baixada-1', gangue: 'sombra_rubra', enemy: 'sombra_rubra', forca: 3, dificuldade: 'normal' },
      { id: 'baixada-2', gangue: 'sombra_fria', enemy: 'sombra_fria', forca: 4, dificuldade: 'dificil' },
      { id: 'baixada-3', gangue: 'os_restos', enemy: 'os_restos', forca: 4, dificuldade: 'facil' },
    ],
    chefe: { id: 'baixada-chefe', gangue: 'sombra_fria', enemy: 'espeto', forca: 5, boss: 'espeto' },
  },
  {
    id: 'vila',
    dificuldade: 'disputa',
    ordem: 4,
    cor: '#ffae32',
    poly: '52,74 96,70 92,52 50,56',
    pos: { top: 58, left: 72 },
    pontos: [
      { id: 'vila-1', gangue: 'bonde_predio', enemy: 'bonde_predio_1', forca: 4, dificuldade: 'normal' },
      { id: 'vila-2', gangue: 'bonde_predio', enemy: 'bonde_predio_2', forca: 5, dificuldade: 'dificil' },
      { id: 'vila-3', gangue: 'os_andar_de_cima', enemy: 'andar_de_cima', forca: 5, dificuldade: 'facil' },
    ],
    chefe: { id: 'vila-chefe', gangue: 'bonde_predio', enemy: 'sala', forca: 6, boss: 'sala' },
  },
  {
    id: 'morro',
    dificuldade: 'guerra',
    ordem: 5,
    cor: '#ff8f3c',
    poly: '10,56 48,52 44,34 8,38',
    pos: { top: 42, left: 24 },
    pontos: [
      { id: 'morro-1', gangue: 'frente_escada', enemy: 'frente_escada_1', forca: 5, dificuldade: 'normal' },
      { id: 'morro-2', gangue: 'frente_escada', enemy: 'frente_escada_2', forca: 6, dificuldade: 'dificil' },
      { id: 'morro-3', gangue: 'os_fogueteiro', enemy: 'fogueteiro', forca: 6, dificuldade: 'facil' },
    ],
    chefe: { id: 'morro-chefe', gangue: 'frente_escada', enemy: 'zefa', forca: 7, boss: 'zefa' },
  },
  {
    id: 'alto',
    dificuldade: 'sangue',
    ordem: 6,
    cor: '#ff6b6b',
    poly: '52,50 94,46 90,28 50,32',
    pos: { top: 34, left: 72 },
    pontos: [
      { id: 'alto-1', gangue: 'os_cinco', enemy: 'os_cinco_1', forca: 6, dificuldade: 'normal' },
      { id: 'alto-2', gangue: 'os_cinco', enemy: 'os_cinco_2', forca: 7, dificuldade: 'dificil' },
      { id: 'alto-3', gangue: 'a_roda', enemy: 'a_roda', forca: 8, dificuldade: 'facil' },
    ],
    chefe: { id: 'alto-chefe', gangue: 'os_cinco', enemy: 'doutor', forca: 9, boss: 'doutor' },
  },
  {
    id: 'laje',
    dificuldade: 'coroa',
    ordem: 7,
    cor: '#a855f7',
    poly: '30,30 72,30 64,4 36,4',
    pos: { top: 15, left: 49 },
    pontos: [
      { id: 'laje-1', gangue: 'bonde_costura', enemy: 'bonde_costura_1', forca: 7, dificuldade: 'normal' },
      { id: 'laje-2', gangue: 'bonde_costura', enemy: 'bonde_costura_2', forca: 8, dificuldade: 'dificil' },
      { id: 'laje-3', gangue: 'bonde_costura', enemy: 'bonde_costura_3', forca: 9, dificuldade: 'facil' },
    ],
    chefe: { id: 'laje-chefe', gangue: 'bonde_costura', enemy: 'costura', forca: 10, boss: 'costura', ehFinal: true },
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
    const pontosFeitos = (p.pontos?.length || 0) >= (territorio.pontos?.length || 0)
    const informanteOk = !territorio.precisaInformante || Boolean(storyProgress.__flags?.[territorio.id])
    return pontosFeitos && informanteOk ? 'atual' : 'trancado'
  }
  if ((p.pontos || []).includes(noId)) return 'dominado'
  const proximo = territorio.pontos.find(pt => !(p.pontos || []).includes(pt.id))
  return proximo?.id === noId ? 'atual' : 'trancado'
}

/** O chefe está com os pontos feitos mas ainda falta o informante de outro
 *  território? Usado pra dar uma dica específica em vez do cadeado mudo. */
export function precisaVoltarNoInformante(territorio, storyProgress = {}) {
  if (!territorio.precisaInformante) return false
  const p = storyProgress[territorio.id] || { pontos: [], chefe: false }
  const pontosFeitos = (p.pontos?.length || 0) >= (territorio.pontos?.length || 0)
  return pontosFeitos && !storyProgress.__flags?.[territorio.id]
}
