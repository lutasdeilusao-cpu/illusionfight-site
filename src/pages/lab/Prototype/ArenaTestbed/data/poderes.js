export const PODERES_BASE = [
  {
    id: 1,
    elemento: null,
    chaveI18n: 'poder_forca_plus',
    chaveI18nDescricao: 'poder_forca_plus_desc',
    custoMP: 3,
    gatilho: 'ataque',
    tipoPersonagem: 'forca',
    mecanicaId: 1,
    params: { atributo: 'fa', bonus: 2 },
    visualId: null,
    tipoExecucao: 'instantaneo',
    turnosCarregamento: 0,
    valorComparativo: { fa: 2, fd: null },
  },
  {
    id: 2,
    elemento: null,
    chaveI18n: 'poder_pdf_plus',
    chaveI18nDescricao: 'poder_pdf_plus_desc',
    custoMP: 3,
    gatilho: 'ataque',
    tipoPersonagem: 'pdf',
    mecanicaId: 1,
    params: { atributo: 'pdf', bonus: 2 },
    visualId: null,
    tipoExecucao: 'instantaneo',
    turnosCarregamento: 0,
    valorComparativo: { fa: 2, fd: null },
  },
  {
    id: 3,
    elemento: null,
    chaveI18n: 'poder_defesa_plus',
    chaveI18nDescricao: 'poder_defesa_plus_desc',
    custoMP: 3,
    gatilho: 'defesa',
    tipoPersonagem: 'universal',
    mecanicaId: 2,
    params: {},
    visualId: null,
    tipoExecucao: 'instantaneo',
    turnosCarregamento: 0,
    valorComparativo: { fa: null, fd: 2 },
  },
  // ── Amostra ── 2-3 por elemento (placeholders de teste)
  { id: 10, elemento: 'fogo', chaveI18n: 'poder_chama', chaveI18nDescricao: 'poder_chama_desc', custoMP: 3, gatilho: 'ataque', tipoPersonagem: 'forca', mecanicaId: 1, params: { atributo: 'fa', bonus: 2 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 2, fd: null } },
  { id: 11, elemento: 'fogo', chaveI18n: 'poder_labareda', chaveI18nDescricao: 'poder_labareda_desc', custoMP: 5, gatilho: 'ataque', tipoPersonagem: 'forca', mecanicaId: 1, params: { atributo: 'fa', bonus: 3 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 3, fd: null } },
  { id: 12, elemento: 'fogo', chaveI18n: 'poder_escudo_fogo', chaveI18nDescricao: 'poder_escudo_fogo_desc', custoMP: 4, gatilho: 'defesa', tipoPersonagem: 'universal', mecanicaId: 2, params: {}, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: null, fd: 2 } },
  { id: 13, elemento: 'agua', chaveI18n: 'poder_geada', chaveI18nDescricao: 'poder_geada_desc', custoMP: 3, gatilho: 'ataque', tipoPersonagem: 'pdf', mecanicaId: 1, params: { atributo: 'pdf', bonus: 2 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 2, fd: null } },
  { id: 14, elemento: 'agua', chaveI18n: 'poder_nevasca', chaveI18nDescricao: 'poder_nevasca_desc', custoMP: 5, gatilho: 'ataque', tipoPersonagem: 'pdf', mecanicaId: 1, params: { atributo: 'pdf', bonus: 3 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 3, fd: null } },
  { id: 15, elemento: 'agua', chaveI18n: 'poder_escudo_gelo', chaveI18nDescricao: 'poder_escudo_gelo_desc', custoMP: 4, gatilho: 'defesa', tipoPersonagem: 'universal', mecanicaId: 2, params: {}, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: null, fd: 2 } },
  { id: 16, elemento: 'terra', chaveI18n: 'poder_rocha', chaveI18nDescricao: 'poder_rocha_desc', custoMP: 3, gatilho: 'ataque', tipoPersonagem: 'forca', mecanicaId: 1, params: { atributo: 'fa', bonus: 2 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 2, fd: null } },
  { id: 17, elemento: 'terra', chaveI18n: 'poder_muralha', chaveI18nDescricao: 'poder_muralha_desc', custoMP: 4, gatilho: 'defesa', tipoPersonagem: 'universal', mecanicaId: 2, params: {}, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: null, fd: 3 } },
  { id: 18, elemento: 'ar', chaveI18n: 'poder_vento', chaveI18nDescricao: 'poder_vento_desc', custoMP: 3, gatilho: 'ataque', tipoPersonagem: 'pdf', mecanicaId: 1, params: { atributo: 'pdf', bonus: 2 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 2, fd: null } },
  { id: 19, elemento: 'ar', chaveI18n: 'poder_tempestade', chaveI18nDescricao: 'poder_tempestade_desc', custoMP: 5, gatilho: 'ataque', tipoPersonagem: 'pdf', mecanicaId: 1, params: { atributo: 'pdf', bonus: 3 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 3, fd: null } },
  { id: 20, elemento: 'trevas', chaveI18n: 'poder_sombra', chaveI18nDescricao: 'poder_sombra_desc', custoMP: 3, gatilho: 'ataque', tipoPersonagem: 'forca', mecanicaId: 1, params: { atributo: 'fa', bonus: 2 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 2, fd: null } },
  { id: 21, elemento: 'trevas', chaveI18n: 'poder_abismo', chaveI18nDescricao: 'poder_abismo_desc', custoMP: 4, gatilho: 'defesa', tipoPersonagem: 'universal', mecanicaId: 2, params: {}, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: null, fd: 2 } },
  { id: 22, elemento: 'luz', chaveI18n: 'poder_raio_luz', chaveI18nDescricao: 'poder_raio_luz_desc', custoMP: 3, gatilho: 'ataque', tipoPersonagem: 'pdf', mecanicaId: 1, params: { atributo: 'pdf', bonus: 2 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 2, fd: null } },
  { id: 23, elemento: 'luz', chaveI18n: 'poder_fulgor', chaveI18nDescricao: 'poder_fulgor_desc', custoMP: 5, gatilho: 'ataque', tipoPersonagem: 'pdf', mecanicaId: 1, params: { atributo: 'pdf', bonus: 3 }, visualId: null, tipoExecucao: 'instantaneo', turnosCarregamento: 0, valorComparativo: { fa: 3, fd: null } },
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
