const special = (id, kind) => ({ id, kind })
const path = (id, specials) => ({ id, specials })

export const GANGUES_SPECIAL_PATHS = {
  // Cada path aqui embaixo lista TODOS os poderes possíveis daquele
  // subcaminho, incluindo o 6º poder (NV 50, um por personagem — dá pra
  // repetir personagem A e B do mesmo subcaminho com poderes diferentes,
  // por isso path('bruto',...) tem os 4 clássicos + os 2 sextos poderes
  // (Trinca e Marreta), mesmo que cada ficha só desbloqueie o seu).
  atacante: [
    path('bruto', [special('soco_de_ferro', 'active'), special('investida', 'active'), special('peso_bruto', 'passive'), special('marreta', 'active'), special('fim_de_linha', 'active'), special('avalanche_de_socos', 'active'), special('britadeira', 'active')]),
    path('duelista', [special('golpe_certeiro', 'active'), special('fluidez', 'active'), special('leitura_de_combate', 'passive'), special('marca', 'active'), special('execucao', 'active'), special('corte_preciso', 'active'), special('danca_da_lamina', 'active')]),
    path('furia', [special('sangue_fervente', 'passive'), special('grito_de_guerra', 'active'), special('folego_final', 'active'), special('ignorar_a_dor', 'active'), special('ultima_investida', 'active'), special('furia_cega', 'active'), special('instinto_de_sangue', 'active')]),
    path('especialista', [special('precisao_absoluta', 'passive'), special('ponto_de_pressao', 'active'), special('fratura_de_ilusao', 'active'), special('foco_cirurgico', 'active'), special('colapso_mental', 'active'), special('tiro_certeiro', 'active'), special('ponto_fatal', 'active')]),
    path('vingador', [special('casca_dura', 'passive'), special('absorver_impacto', 'active'), special('contragolpe', 'active'), special('postura_firme', 'active'), special('retribuicao_final', 'active'), special('marca_de_guerra', 'passive'), special('juro_composto', 'active')]),
  ],
  // FIX CRÍTICO (achado ao desenhar efeito por poder pro Defensor/Místico,
  // pedido do Isaias): só 'bruto'..'vingador' (atacante) e 'muralha'
  // (defensor) tinham os ids batendo com o catálogo dos 30 personagens
  // (ldi_gangues_30_personagens_v1.json). Os outros 9 subcaminhos abaixo
  // (guardiao/provocador/reativo/resiliente + os 5 místicos) tinham uma
  // lista de ids TOTALMENTE DIFERENTE, sobra de um rascunho anterior —
  // getGanguesSpecials()/isGanguesSpecialAllowed() nunca achavam o poder de
  // verdade da ficha (ex: 'escudo_humano' do Guarda não existia aqui, só
  // 'instinto_de_protecao', que não é poder de personagem nenhum). Na
  // prática, pra 20 dos 30 personagens (tudo Defensor exceto Muro/Concreto
  // + todo Místico), o motor de combate NUNCA achava a ativa equipada
  // (buildGanguesEffectsList/getEquippedActiveGanguesSpecials sempre
  // retornavam null pra ela) — o poder simplesmente não aparecia pra usar
  // em luta, só a técnica base. Corrigido: ids batendo 1:1 com signature_specials
  // de cada personagem do catálogo.
  defensor: [
    path('muralha', [special('pele_de_aco', 'passive'), special('bastiao', 'passive'), special('casco_robusto', 'passive'), special('postura_defensiva', 'active'), special('muralha_impenetravel', 'active'), special('linha_de_frente', 'passive'), special('fundacao', 'passive')]),
    path('guardiao', [special('escudo_humano', 'passive'), special('cobertura', 'passive'), special('ultimo_bastiao', 'passive'), special('guarda_compartilhada', 'active'), special('interceptar', 'active'), special('escudo_vivo', 'active'), special('no_meu_ombro', 'active')]),
    path('provocador', [special('voz_de_comando', 'passive'), special('casca_de_rua', 'passive'), special('centro_das_atencoes', 'passive'), special('provocacao', 'active'), special('marcar_alvo', 'active'), special('grito_de_rua', 'active'), special('alvo_facil', 'active')]),
    path('reativo', [special('reflexo_defensivo', 'passive'), special('retorno_de_impacto', 'passive'), special('resposta_automatica', 'passive'), special('aparar', 'active'), special('contragolpe_defensivo', 'active'), special('giro_de_catraca', 'active'), special('efeito_bumerangue', 'active')]),
    path('resiliente', [special('carne_dura', 'passive'), special('firme_no_chao', 'passive'), special('inquebravel', 'passive'), special('segunda_respiracao', 'active'), special('recusar_queda', 'active'), special('pele_de_ferro', 'passive'), special('osso_duro', 'passive')]),
  ],
  mistico: [
    path('igneo', [special('brasa_viva', 'passive'), special('bola_de_fogo', 'active'), special('combustao', 'active'), special('explosao_termica', 'active'), special('inferno_de_rua', 'active'), special('chama_eterna', 'active'), special('cinzas_ao_vento', 'passive')]),
    path('aquatico', [special('correnteza', 'passive'), special('neblina', 'active'), special('jato_pressurizado', 'active'), special('fluxo_restaurador', 'active'), special('mare_alta', 'active'), special('onda_de_choque', 'active'), special('temporal', 'active')]),
    path('terreno', [special('pele_de_pedra', 'passive'), special('raiz_prendente', 'active'), special('tremor', 'active'), special('estilhaco_terrestre', 'active'), special('ruptura_do_solo', 'active'), special('raizes_profundas', 'passive'), special('fenda_no_chao', 'active')]),
    path('tempestade', [special('eletricidade_estatica', 'passive'), special('raio_curto', 'active'), special('cadeia_de_raios', 'active'), special('passo_eletrico', 'active'), special('tempestade_total', 'active'), special('descarga', 'active'), special('trovoada', 'active')]),
    path('ilusorio', [special('mente_nebulosa', 'passive'), special('reflexo_falso', 'active'), special('duplo_ilusorio', 'active'), special('distorcao', 'active'), special('quebra_de_realidade', 'active'), special('veu_de_nevoa', 'passive'), special('espelho_quebrado', 'active')]),
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
