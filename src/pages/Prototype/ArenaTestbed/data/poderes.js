export const PODERES_BASE = [
  {
    id: 'forca_plus',
    nome_pt: 'Força+2',
    nome_en: 'Strength+2',
    nome_es: 'Fuerza+2',
    tipo: 'ativo',
    gatilho: 'ataque',
    custoMP: 3,
    efeito: { atributo: 'fa', bonus: 2 },
  },
  {
    id: 'pdf_plus',
    nome_pt: 'PDF+2',
    nome_en: 'PDF+2',
    nome_es: 'PDF+2',
    tipo: 'ativo',
    gatilho: 'ataque',
    custoMP: 3,
    efeito: { atributo: 'pdf', bonus: 2 },
  },
  {
    id: 'defesa_plus',
    nome_pt: 'Defesa+2',
    nome_en: 'Defense+2',
    nome_es: 'Defensa+2',
    tipo: 'ativo',
    gatilho: 'defesa',
    custoMP: 3,
    efeito: { atributo: 'fd', bonus: 2 },
  },
  {
    id: 'investida',
    nome_pt: 'Investida',
    nome_en: 'Charge',
    nome_es: 'Carga',
    tipo: 'ativo',
    gatilho: 'ataque',
    custoMP: 5,
    padrao: 'linha_reta',
  },
]

export function getPoderesPorId(ids) {
  return ids.map(id => PODERES_BASE.find(p => p.id === id)).filter(Boolean)
}

export function getPoderesDisponiveis(char, poderesIds) {
  const ids = poderesIds[char.id] || char.poderesEscolhidos || []
  return ids.map(id => PODERES_BASE.find(p => p.id === id)).filter(Boolean)
}

export function temPoderDisponivel(char, poderesIds, gatilho, mpNeeded) {
  const poderes = getPoderesDisponiveis(char, poderesIds)
  return poderes.some(p => p.gatilho === gatilho && char.mp >= (mpNeeded ?? p.custoMP))
}

export function aplicarBonusPoder(char, poderId, bonusAtual = 0) {
  const poder = PODERES_BASE.find(p => p.id === poderId)
  if (!poder) return bonusAtual
  return bonusAtual + poder.efeito.bonus
}