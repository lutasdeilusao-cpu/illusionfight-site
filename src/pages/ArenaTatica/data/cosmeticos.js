/**
 * ARENA TÁTICA — Paletas, Efeitos Visuais e Acessórios
 */

export const PALETAS_CORES = [
  { nome: 'Rubi', cor: '#DC143C' },
  { nome: 'Safira', cor: '#0000CD' },
  { nome: 'Esmeralda', cor: '#00FF7F' },
  { nome: 'Ametista', cor: '#9932CC' },
  { nome: 'Topázio', cor: '#FF8C00' },
  { nome: 'Jade', cor: '#00A86B' },
  { nome: 'Coral', cor: '#FF7F50' },
  { nome: 'Prata', cor: '#C0C0C0' },
  { nome: 'Bronze', cor: '#CD7F32' },
  { nome: 'Ouro', cor: '#FFD700' },
  { nome: 'Cobre', cor: '#B87333' },
  { nome: 'Ébano', cor: '#3D0C02' },
]

export const EFEITO_AURA = {
  fogo: { particulas: '🔥', brilho: '#FF4500', animacao: 'pulse' },
  agua: { particulas: '💧', brilho: '#1E90FF', animacao: 'wave' },
  terra: { particulas: '🪨', brilho: '#8B4513', animacao: 'shake' },
  vento: { particulas: '🌪️', brilho: '#87CEEB', animacao: 'spin' },
  relampago: { particulas: '⚡', brilho: '#FFD700', animacao: 'flicker' },
  gelo: { particulas: '❄️', brilho: '#00BFFF', animacao: 'float' },
  luz: { particulas: '✨', brilho: '#FFD700', animacao: 'radial' },
  trevas: { particulas: '🌑', brilho: '#8B008B', animacao: 'absorb' },
  sombra: { particulas: '👻', brilho: '#2F4F4F', animacao: 'warp' },
  psiquico: { particulas: '🧠', brilho: '#DA70D6', animacao: 'pulse_slow' },
  metal: { particulas: '⚙️', brilho: '#C0C0C0', animacao: 'metallic' },
  natureza: { particulas: '🌿', brilho: '#228B22', animacao: 'grow' },
}

export function getCorPorElemental(elementalId) {
  const elem = EFEITO_AURA[elementalId]
  return elem ? elem.brilho : '#888'
}
