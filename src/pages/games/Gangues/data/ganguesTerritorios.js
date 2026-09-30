import { GANGUES_LADDER_PASSO } from './ganguesDificuldade.js'
import enemiesData from './gangues-enemies.json'

/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — o mapa de Marelia, antes de ter dono
   Esqueleto pra o Isaias polir o visual e pôr arte dos bosses depois.

   AMBIENTAÇÃO (liga no conto "Alan, o Campeão", historias/contos.json id 02):
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
     Num ponto comum (não-chefe) é a MESMA ficha, escalada pro ponto fixo
     `pontosFixo` do nó (GanguesRoute trata como nível fixo, single-enemy —
     ver ganguesDificuldade.js). O chefe continua com orçamento fixo
     próprio (GANGUES_CHEFE_BUDGET, ganguesChefes.js), sempre acima dos
     3 pontos comuns do território.
   • `poly` / `pos` são coords no SVG do mapa (viewBox 0 0 100 108).

   LADDER DE PONTOS (19/09/2026 — limpeza do sistema de dificuldade, pedido
   do Isaias: "força numericamente, é mais fácil de balancear"). Antes, só a
   Pista (cena própria, data/cenas/pista/) tinha ladder de números fixos —
   os outros 6 territórios ainda escalavam num ratio contra o time do
   jogador (removido, ver ganguesDificuldade.js). Os 3 pontos comuns de cada
   território aqui embaixo continuam a MESMA ladder da Pista e da Feira (que
   termina em 47, antes do Cobrador=52), subindo de GANGUES_LADDER_PASSO em
   GANGUES_LADDER_PASSO (data/ganguesDificuldade.js — o mesmo passo usado
   pra "um nível abaixo/acima" no jogo inteiro) — pra rebalancear todo o
   jogo de uma vez, mexe só nesse número + no ponto de partida abaixo. */
// A Pista e a Feira têm CENA própria com a ladder autorada POI a POI (Pista
// 3→26 + Carvão 30; Feira 26→47 + Cobrador 52). A trilha dos outros bairros
// continua a escada de onde a Feira parou.
let ladderCursor = 47 // último degrau comum da Feira (deposito_2), antes do Cobrador (52)
const proximoDegrauLadder = () => (ladderCursor += GANGUES_LADDER_PASSO)

export const GANGUES_TERRITORIOS = [
  {
    id: 'pista',
    dificuldade: 'rato',
    ordem: 1,
    cor: '#3ddc97',
    // Formas encaixadas de verdade (sem vão entre regiões): cada território
    // compartilha o ponto exato da fronteira com o vizinho — é o que faz
    // parecer um mapa político real em vez de blocos soltos. viewBox do
    // mapa é "0 0 100 150" (ver GanguesStoryMap.jsx).
    poly: '0,138 16,150 32,140 50,148 43,130 57,112 40,118 20,108 0,120',
    pos: { top: 86, left: 29 },
    // A Pista tem CENA própria (ver data/cenas/pista/) — os combates são os
    // POIs de lá. Os ids abaixo ficam só como registro de domínio
    // (dominarTerritorioViaCena marca os 3 + o chefe).
    pontos: [
      { id: 'pista-1', gangue: 'rato_pista' },
      { id: 'pista-2', gangue: 'rato_pista' },
      { id: 'pista-3', gangue: 'bonde_sinal' },
    ],
    chefe: { id: 'pista-chefe', gangue: 'rato_pista', enemy: 1500, boss: 'fumaca' },
    // Teto de nível (escada do GDD §9.7, 29/09/2026: Pista 20, ~13 por bairro
    // até 99). Na simulação, dupla no nível 20 com o conjunto comum vence o
    // Carvão ~60%; sem item ~30%.
    nivelTeto: 20,
  },
  {
    id: 'feira',
    dificuldade: 'muvuca',
    ordem: 2,
    cor: '#7ee787',
    poly: '50,148 68,138 84,148 100,136 100,116 90,106 74,120 57,112 43,130',
    pos: { top: 85, left: 74 },
    // Ponte entre territórios: o chefe da Feira só abre depois de falar com o
    // informante da Pista (Duda, `informante` — grava __flags.feira). Na cena
    // da Feira isso trava o Cobrador (GanguesCena.jsx, iniciarTreta).
    precisaInformante: true,
    // A Feira tem CENA própria (data/cenas/feira/) desde a v3.65.0 — os
    // combates são os POIs de lá. Os ids abaixo ficam só como registro de
    // domínio (dominarTerritorioViaCena marca os 3 + o chefe).
    pontos: [
      { id: 'feira-1', gangue: 'cobranca_turco' },
      { id: 'feira-2', gangue: 'cobranca_turco' },
      { id: 'feira-3', gangue: 'os_gato' },
    ],
    chefe: { id: 'feira-chefe', gangue: 'cobranca_turco', enemy: 1501, boss: 'turco' },
    nivelTeto: 33,
  },
  {
    id: 'baixada',
    dificuldade: 'correria',
    ordem: 3,
    cor: '#18dafb',
    poly: '0,120 20,108 40,118 57,112 44,94 56,76 40,82 20,72 0,84 6,100',
    pos: { top: 64, left: 28 },
    // Ponte da Feira: o rádio pirata (POI `radio_pirata`) grava __flags.baixada.
    precisaInformante: true,
    pontos: [
      { id: 'baixada-1', gangue: 'sombra_rubra', enemy: 1308, pontosFixo: proximoDegrauLadder() },
      { id: 'baixada-2', gangue: 'sombra_fria', enemy: 1309, pontosFixo: proximoDegrauLadder() },
      { id: 'baixada-3', gangue: 'os_restos', enemy: 1405, pontosFixo: proximoDegrauLadder() },
    ],
    chefe: { id: 'baixada-chefe', gangue: 'sombra_fria', enemy: 1502, boss: 'espeto' },
    nivelTeto: 46,
  },
  {
    id: 'vila',
    dificuldade: 'disputa',
    ordem: 4,
    cor: '#ffae32',
    poly: '57,112 74,120 90,106 100,116 94,98 100,80 90,70 74,84 56,76 44,94',
    pos: { top: 64, left: 78 },
    // Ponte da Baixada: a Dona Lurdes (POI `informante_vila`) grava __flags.vila.
    precisaInformante: true,
    pontos: [
      { id: 'vila-1', gangue: 'bonde_predio', enemy: 1310, pontosFixo: proximoDegrauLadder() },
      { id: 'vila-2', gangue: 'bonde_predio', enemy: 1311, pontosFixo: proximoDegrauLadder() },
      { id: 'vila-3', gangue: 'os_andar_de_cima', enemy: 1407, pontosFixo: proximoDegrauLadder() },
    ],
    chefe: { id: 'vila-chefe', gangue: 'bonde_predio', enemy: 1503, boss: 'sala' },
    nivelTeto: 59,
  },
  {
    id: 'morro',
    dificuldade: 'guerra',
    ordem: 5,
    cor: '#ff8f3c',
    poly: '0,84 20,72 40,82 56,76 43,58 50,54 40,58 28,50 10,60 4,72',
    pos: { top: 44, left: 29 },
    pontos: [
      { id: 'morro-1', gangue: 'frente_escada', enemy: 1313, pontosFixo: proximoDegrauLadder() },
      { id: 'morro-2', gangue: 'frente_escada', enemy: 1314, pontosFixo: proximoDegrauLadder() },
      { id: 'morro-3', gangue: 'os_fogueteiro', enemy: 1409, pontosFixo: proximoDegrauLadder() },
    ],
    chefe: { id: 'morro-chefe', gangue: 'frente_escada', enemy: 1504, boss: 'zefa' },
    nivelTeto: 72,
  },
  {
    id: 'alto',
    dificuldade: 'sangue',
    ordem: 6,
    cor: '#ff6b6b',
    poly: '56,76 74,84 90,70 100,80 96,68 90,60 74,50 62,58 50,54 43,58',
    pos: { top: 44, left: 74 },
    pontos: [
      { id: 'alto-1', gangue: 'os_cinco', enemy: 1316, pontosFixo: proximoDegrauLadder() },
      { id: 'alto-2', gangue: 'os_cinco', enemy: 1317, pontosFixo: proximoDegrauLadder() },
      { id: 'alto-3', gangue: 'a_roda', enemy: 1318, pontosFixo: proximoDegrauLadder() },
    ],
    chefe: { id: 'alto-chefe', gangue: 'os_cinco', enemy: 1505, boss: 'doutor' },
    nivelTeto: 85,
  },
  {
    id: 'laje',
    dificuldade: 'coroa',
    ordem: 7,
    cor: '#a855f7',
    poly: '10,60 28,50 40,58 50,54 62,58 74,50 90,60 84,44 74,26 60,10 50,6 40,10 24,26 14,44',
    pos: { top: 27, left: 51 },
    pontos: [
      { id: 'laje-1', gangue: 'bonde_costura', enemy: 1319, pontosFixo: proximoDegrauLadder() },
      { id: 'laje-2', gangue: 'bonde_costura', enemy: 1320, pontosFixo: proximoDegrauLadder() },
      { id: 'laje-3', gangue: 'bonde_costura', enemy: 1463, pontosFixo: proximoDegrauLadder() },
    ],
    chefe: { id: 'laje-chefe', gangue: 'bonde_costura', enemy: 1600, boss: 'costura', ehFinal: true },
    nivelTeto: 99,
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

/** Teto de nível da área atual da história (pedido do Isaias, 28/09/2026:
 *  "você só pode upar até o level recomendado pro chefe daquela área").
 *  Área atual = 1º território (na ordem) cujo chefe ainda não caiu. O teto é
 *  `nivelTeto` do território (Pista = 20) ou, sem ele, o nível do chefe
 *  (`nivel` em gangues-enemies.json), sem nunca baixar entre áreas. Campanha zerada =
 *  teto do jogo (99). */
export function nivelTetoDaHistoria(storyProgress = {}, tetoJogo = 99) {
  let teto = 1
  for (const terr of [...GANGUES_TERRITORIOS].sort((a, b) => a.ordem - b.ordem)) {
    const nivelChefe = Number(terr.nivelTeto) || Number(enemiesData.find(e => e.id === terr.chefe?.enemy)?.nivel) || 0
    teto = Math.max(teto, nivelChefe)
    if (!storyProgress?.[terr.id]?.chefe) return Math.min(teto, tetoJogo)
  }
  return tetoJogo
}
