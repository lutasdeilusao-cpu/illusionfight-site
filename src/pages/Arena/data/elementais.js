/**
 * ARENA TÁTICA — 12 Elementais
 * Interações: vantagem (+25% dano), desvantagem (-25% dano), neutro
 */

export const ELEMENTAIS = {
  fogo: {
    id: 'fogo', nome: 'Fogo', cor: '#FF4500', icone: '🔥',
    vantagem: ['gelo', 'trevas'],
    desvantagem: ['agua', 'terra'],
    desc: 'Poder bruto que queima e destrói.',
  },
  agua: {
    id: 'agua', nome: 'Água', cor: '#1E90FF', icone: '💧',
    vantagem: ['fogo', 'terra'],
    desvantagem: ['relampago', 'vento'],
    desc: 'Fluido e adaptável. Cura e controla.',
  },
  terra: {
    id: 'terra', nome: 'Terra', cor: '#8B4513', icone: '🪨',
    vantagem: ['fogo', 'relampago'],
    desvantagem: ['agua', 'vento'],
    desc: 'Firme e inabalável. Defesa pura.',
  },
  vento: {
    id: 'vento', nome: 'Vento', cor: '#87CEEB', icone: '🌪️',
    vantagem: ['agua', 'terra'],
    desvantagem: ['fogo', 'gelo'],
    desc: 'Rápido e imprevisível. Mobilidade total.',
  },
  relampago: {
    id: 'relampago', nome: 'Relâmpago', cor: '#FFD700', icone: '⚡',
    vantagem: ['agua', 'trevas'],
    desvantagem: ['terra', 'luz'],
    desc: 'Velocidade pura. Ataques que não se pode ver.',
  },
  gelo: {
    id: 'gelo', nome: 'Gelo', cor: '#00BFFF', icone: '❄️',
    vantagem: ['vento', 'agua'],
    desvantagem: ['fogo', 'trevas'],
    desc: 'Controla o campo. Congela inimigos no lugar.',
  },
  luz: {
    id: 'luz', nome: 'Luz', cor: '#FFD700', icone: '✨',
    vantagem: ['trevas', 'relampago'],
    desvantagem: ['sombra', 'fogo'],
    desc: 'Cura e purifica. A luz que protege.',
  },
  trevas: {
    id: 'trevas', nome: 'Trevas', cor: '#8B008B', icone: '🌑',
    vantagem: ['gelo', 'luz'],
    desvantagem: ['fogo', 'relampago'],
    desc: 'Poder oculto. Drena a força do inimigo.',
  },
  sombra: {
    id: 'sombra', nome: 'Sombra', cor: '#2F4F4F', icone: '👻',
    vantagem: ['luz', 'psiquico'],
    desvantagem: ['trevas', 'gelo'],
    desc: 'Ilusão e engano. O inimigo nunca sabe onde está.',
  },
  psiquico: {
    id: 'psiquico', nome: 'Psíquico', cor: '#DA70D6', icone: '🧠',
    vantagem: ['sombra', 'gelo'],
    desvantagem: ['trevas', 'luz'],
    desc: 'Mente sobre matéria. Controla o campo de batalha.',
  },
  metal: {
    id: 'metal', nome: 'Metal', cor: '#C0C0C0', icone: '⚙️',
    vantagem: ['terra', 'gelo'],
    desvantagem: ['fogo', 'relampago'],
    desc: 'Resistente e afiado. Dano consistente.',
  },
  natureza: {
    id: 'natureza', nome: 'Natureza', cor: '#228B22', icone: '🌿',
    vantagem: ['agua', 'terra'],
    desvantagem: ['fogo', 'gelo'],
    desc: 'Vida e crescimento. Regenera aliados.',
  },
}

export function getMultiplicadorElemental(atkElem, defElem) {
  if (!atkElem || !defElem) return 1.0
  const elem = ELEMENTAIS[atkElem]
  if (!elem) return 1.0
  if (elem.vantagem.includes(defElem)) return 1.25
  if (elem.desvantagem.includes(defElem)) return 0.75
  return 1.0
}
