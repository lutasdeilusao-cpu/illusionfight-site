export function attrNomeKey(id) {
  const map = {
    rank_sdr: 'atributo_rank_sdr',
    poder_mental: 'atributo_poder_mental',
    velocidade: 'atributo_velocidade',
    resistencia: 'atributo_resistencia',
    nivel_xama: 'atributo_nivel_xama',
    fator_caos: 'atributo_fator_caos',
    energia_base: 'atributo_energia_base',
  }
  return map[id] || 'atributo_poder_explosivo'
}
