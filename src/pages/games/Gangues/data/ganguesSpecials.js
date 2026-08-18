const special = (id, kind) => ({ id, kind })
const path = (id, specials) => ({ id, specials })

export const GANGUES_SPECIAL_PATHS = {
  atacante: [
    path('bruto', [special('soco_de_ferro', 'active'), special('investida', 'active'), special('peso_bruto', 'passive'), special('marreta', 'active'), special('fim_de_linha', 'active')]),
    path('duelista', [special('golpe_certeiro', 'active'), special('fluidez', 'active'), special('leitura_de_combate', 'passive'), special('marca', 'active'), special('execucao', 'active')]),
    path('furia', [special('sangue_fervente', 'passive'), special('grito_de_guerra', 'active'), special('folego_final', 'active'), special('ignorar_a_dor', 'active'), special('ultima_investida', 'active')]),
    path('especialista', [special('precisao_absoluta', 'passive'), special('ponto_de_pressao', 'active'), special('fratura_de_ilusao', 'active'), special('foco_cirurgico', 'active'), special('colapso_mental', 'active')]),
    path('vingador', [special('casca_dura', 'passive'), special('absorver_impacto', 'active'), special('contragolpe', 'active'), special('postura_firme', 'active'), special('retribuicao_final', 'active')]),
  ],
  defensor: [
    path('muralha', [special('pele_de_aco', 'passive'), special('bastiao', 'passive'), special('casco_robusto', 'passive'), special('postura_defensiva', 'active'), special('muralha_impenetravel', 'active')]),
    path('guardiao', [special('instinto_de_protecao', 'passive'), special('postura_de_guarda', 'passive'), special('vinculo_de_escudo', 'passive'), special('intervencao', 'active'), special('bastiao_do_grupo', 'active')]),
    path('provocador', [special('presenca_intimidadora', 'passive'), special('armadura_de_escarnio', 'passive'), special('casca_grossa', 'passive'), special('provocacao', 'active'), special('ultima_provocacao', 'active')]),
    path('reativo', [special('reflexo_de_combate', 'passive'), special('guarda_ativa', 'passive'), special('dominio_postural', 'passive'), special('golpe_de_reacao', 'active'), special('contencao_total', 'active')]),
    path('resiliente', [special('regeneracao', 'passive'), special('folego_de_ferro', 'passive'), special('vitalidade_extra', 'passive'), special('segunda_vida', 'active'), special('renascimento', 'active')]),
  ],
  mistico: [
    path('igneo', [special('chama_ignea', 'passive'), special('explosao_de_chamas', 'active'), special('fogo_interior', 'active'), special('incendiar', 'active'), special('inferno_final', 'active')]),
    path('aquatico', [special('fluxo_vital', 'passive'), special('corrente_curativa', 'active'), special('neblina_evasiva', 'active'), special('mare_controlada', 'active'), special('tsunami', 'active')]),
    path('terreno', [special('pele_de_pedra', 'passive'), special('muro_de_terra', 'active'), special('terremoto', 'active'), special('armadura_rochosa', 'active'), special('furia_da_terra', 'active')]),
    path('tempestade', [special('reflexos_do_vento', 'passive'), special('rajada', 'active'), special('choque_eletrico', 'active'), special('vortice', 'active'), special('furia_da_tempestade', 'active')]),
    path('ilusorio', [special('veu_da_ilusao', 'passive'), special('miragem', 'active'), special('sussurro_sombrio', 'active'), special('fragmentar_mente', 'active'), special('pesadelo_desperto', 'active')]),
  ],
}

export const GANGUES_ALL_SPECIALS = Object.values(GANGUES_SPECIAL_PATHS).flat().flatMap(item => item.specials)

export function getGanguesSpecialPaths(combatPath) {
  return GANGUES_SPECIAL_PATHS[combatPath] || []
}

export function getGanguesSpecialPath(combatPath, specialPath) {
  const paths = getGanguesSpecialPaths(combatPath)
  return paths.find(item => item.id === specialPath) || paths[0] || null
}

export function getGanguesSpecials(sheet) {
  return getGanguesSpecialPath(sheet?.combat_path, sheet?.attributes?.progression?.special_path || sheet?.progression?.special_path)?.specials || []
}

export function isGanguesSpecialAllowed(combatPath, specialPath, specialId) {
  return Boolean(getGanguesSpecialPath(combatPath, specialPath)?.specials.some(item => item.id === specialId))
}
