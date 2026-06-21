export const PODERES_BASE = [
  {
    id: 1,
    chaveI18n: 'poder_forca_plus',
    custoMP: 3,
    gatilho: 'ataque',
    mecanicaId: 1,
    params: { atributo: 'fa', bonus: 2 },
    visualId: null,
    tipoExecucao: 'instantaneo',
    turnosCarregamento: 0,
    tipoPersonagem: 'forca',
  },
  {
    id: 2,
    chaveI18n: 'poder_pdf_plus',
    custoMP: 3,
    gatilho: 'ataque',
    mecanicaId: 1,
    params: { atributo: 'pdf', bonus: 2 },
    visualId: null,
    tipoExecucao: 'instantaneo',
    turnosCarregamento: 0,
    tipoPersonagem: 'pdf',
  },
  {
    id: 3,
    chaveI18n: 'poder_defesa_plus',
    custoMP: 3,
    gatilho: 'defesa',
    mecanicaId: 2,
    params: {},
    visualId: null,
    tipoExecucao: 'instantaneo',
    turnosCarregamento: 0,
    tipoPersonagem: 'universal',
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
