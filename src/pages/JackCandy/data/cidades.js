// Definição das cidades e seus locais
// Pronto para i18n: cada cidade tem nome, desc, skyline emoji

export const CIDADES = {
  marelia: {
    id: 'marelia',
    nome: 'M A R E L I A',
    desc: 'a cidade nunca dorme. ninguém dorme.',
    skyline: ['🏢','🏠','🏚️','🏪','🏛️','🌙'],
    desbloqueadaPorPadrao: true,
    locais: [
      { id: 'paje', nome: 'Pajé', emoji: '⛺', desc: 'Barraca do Pajé', cor: '#F5A623', npc: 'paje' },
      { id: 'kim', nome: 'Kim', emoji: '🍺', desc: 'Boteco do Jazz', cor: '#8B0000', npc: 'kim', requerFlag: 'KIM_LIBERADO' },
      { id: 'nina', nome: 'Nina', emoji: '⭐', desc: 'Delegacia', cor: '#A855F4', npc: 'nina', requerFlag: 'NINA_LIBERADO' },
      { id: 'osvaldo', nome: 'Osvaldo', emoji: '🔧', desc: 'Oficina', cor: '#F97316', npc: 'osvaldo', requerFlag: 'OSVALDO_LIBERADO' },
      { id: 'risca_faca', nome: 'Risca a Faca', emoji: '💃', desc: 'Clube noturno', cor: '#EC4899', npc: 'lara', requerFlag: 'RISCA_FACA_LIBERADO' },
      { id: 'cortico', nome: 'Cortiço', emoji: '🏠', desc: 'Quarto alugado', cor: '#78716C', interior: false, requerFlag: 'CORTICO_LIBERADO', missao: 'abrigo' },
      { id: 'terminal', nome: 'Terminal', emoji: '📟', desc: 'Cabine de comunicação', cor: '#06B6D4', interior: false, requerFlag: 'TERMINAL_OUVIU', antesFlag: true },
      { id: 'escadaria', nome: 'Escadaria', emoji: '🪜', desc: '?????', cor: '#444', interior: false, requerFlag: 'ESCADARIA_VISITADA', secreto: true },
    ],
  },
  auranis: {
    id: 'auranis',
    nome: 'A U R A N I S',
    desc: 'porto de auranis. a névoa não levanta.',
    skyline: ['🏗️','🚢','🌫️','🏭','⚓','🌊'],
    desbloqueadaPorPadrao: false,
    requerFlag: 'AURANIS_LIBERADO',
    locais: [
      { id: 'porto_velho', nome: 'Porto Velho', emoji: '⚓', desc: 'Dungeon', cor: '#8B0000', dungeon: 'porto_velho' },
      { id: 'karim', nome: 'Karim', emoji: '🏚️', desc: 'Pensão da Rua 7', cor: '#F97316', npc: 'karim' },
      { id: 'operativo', nome: 'Operativo', emoji: '🕶️', desc: 'Mercado Negro', cor: '#A855F4', npc: 'operativo' },
      { id: 'doca', nome: 'Doca Abandonada', emoji: '🌑', desc: 'Dungeon noturna', cor: '#8B0000', dungeon: 'doca_abandonada', requerFlag: 'KARIM_CONFIA', noturna: true },
      { id: 'torre_kronos', nome: 'Torre Kronos', emoji: '🗼', desc: 'Dungeon de fuga', cor: '#EC4899', dungeon: 'torre_kronos', requerFlag: 'DOCA_COMPLETA' },
      { id: 'terminal_auranis', nome: 'Terminal', emoji: '📟', desc: 'Cabine de comunicação', cor: '#06B6D4', interior: false },
    ],
  },
  karnazar: {
    id: 'karnazar',
    nome: 'K A R N A Z A R',
    desc: 'karnazar. o frio não é do clima.',
    skyline: ['🏔️','❄️','🏯','🌨️','⛩️','🌌'],
    desbloqueadaPorPadrao: false,
    requerFlag: 'KARNAZAR_LIBERADO',
    locais: [
      { id: 'viran', nome: 'Viran', emoji: '🥋', desc: 'Dojô de Viran', cor: '#F5A623', npc: 'viran' },
      { id: 'rua_branca', nome: 'Rua Branca', emoji: '🌨️', desc: 'Dungeon', cor: '#8B0000', dungeon: 'rua_branca' },
      { id: 'porto_seco', nome: 'Porto Seco', emoji: '🏚️', desc: 'Dungeon', cor: '#8B0000', dungeon: 'porto_seco', requerFlag: 'VIRAN_APROVOU' },
      { id: 'escuro', nome: 'O Escuro', emoji: '🕳️', desc: 'Sala secreta', cor: '#444', interior: false, requerFlag: 'PORTO_SECO_COMPLETO' },
      { id: 'tira', nome: 'Tira', emoji: '👁️', desc: 'Observatório', cor: '#06B6D4', npc: 'tira' },
      { id: 'ilha_privada', nome: 'Ilha Privada', emoji: '🏝️', desc: 'Dungeon final', cor: '#EC4899', dungeon: 'ilha_privada', requerFlag: 'ILHA_PRIVADA_LIBERADA' },
    ],
  },
}

export function getCidade(cidadeId) {
  return CIDADES[cidadeId] || CIDADES.marelia
}

export function getLocaisVisiveis(cidadeId, flags) {
  const cidade = getCidade(cidadeId)
  if (!cidade) return []
  return cidade.locais.filter(local => {
    if (local.secreto) return false
    if (!local.requerFlag) return true
    if (local.antesFlag) return !flags[local.requerFlag]
    return !!flags[local.requerFlag]
  })
}

export function getCidadeNavegacao(cidadeId) {
  const ordem = ['marelia', 'auranis', 'karnazar']
  const idx = ordem.indexOf(cidadeId)
  return {
    anterior: idx > 0 ? ordem[idx - 1] : null,
    proxima: idx < ordem.length - 1 ? ordem[idx + 1] : null,
  }
}
