/**
 * LEVEL PROGRESSION — LDI Tatics v5.4
 *
 * Cada personagem vai do nível 1 ao 99 com atributos fixos (player não escolhe).
 * Stats evoluem linearmente do nivel 1 (tudo 1) ao nivel 99 (distribuição única).
 *
 * Skill unlock:
 *   Nv 5  → skill #1 (ataque básico)
 *   Nv 25 → skill #2 (especial)
 *   Nv 50 → skill #3 (poder superior)
 *   Nv 75 → skill #4 (ultimate)
 */

// ── Stats base (nível 1) ──
const BASE_L1 = { forca: 1, velocidade: 1, resistencia: 1, energia: 1, precisao: 1, tenacidade: 1 }

// ── Skills de nível 50 e 75 para cada personagem ──
// (skills 1 e 2 já existem no roster.js, para níveis 5 e 25)
export const SKILLS_LV50 = {
  1: { id: 'escudo_ferro', nome: 'Escudo de Ferro', custo: 3, alcance: 0, dano: 0, cd: 1, tipo: 'fisico', fx: 'buff_def', desc: 'Ganha +40 DEF pesada por 2 turnos' },
  2: { id: 'relampago_serie', nome: 'Relâmpago em Série', custo: 4, alcance: 2, dano: 5, cd: 1, tipo: 'fisico', fx: 'multi_ataque2', desc: 'Ataca 2 alvos diferentes; 5 DMG cada' },
  3: { id: 'matriz_dimensional', nome: 'Matriz Dimensional', custo: 5, alcance: 7, dano: 7, cd: 2, tipo: 'magico', fx: 'area5', desc: 'Área 5 casas; dano máximo; 2 turnos de conjuração' },
  4: { id: 'laco_triplo', nome: 'Laço Triplo', custo: 4, alcance: 4, dano: 3, cd: 1, tipo: 'fisico', fx: 'puxa3_area', desc: 'Puxa até 3 alvos em cone 1×3' },
  5: { id: 'lança_gelo', nome: 'Lança de Gelo Perfurante', custo: 4, alcance: 5, dano: 6, cd: 1, tipo: 'magico', fx: 'imobiliza_area', desc: 'Área 1×3; imobiliza 1 turno' },
  6: { id: 'terremoto', nome: 'Terremoto', custo: 5, alcance: 3, dano: 6, cd: 2, tipo: 'fisico', fx: 'area2_esmaga', desc: 'Área 2×2; Esmagado 1 turno' },
  7: { id: 'chama_vital', nome: 'Chama Vital', custo: 3, alcance: 3, dano: 4, cd: 1, tipo: 'magico', fx: 'cura_dano', desc: 'Cura 3 HP de aliado + ataca inimigo 4 DMG' },
  8: { id: 'armadilha_choque', nome: 'Armadilha de Choque', custo: 4, alcance: 6, dano: 5, cd: 2, tipo: 'magico', fx: 'mina_paralisia', desc: 'Planta 3 minas; paralisia 1 turno' },
  9: { id: 'furia_cicatriz', nome: 'Fúria de Cicatrizes', custo: 5, alcance: 2, dano: 6, cd: 1, tipo: 'fisico', fx: 'cicatriz_dobra', desc: 'Dobra cicatrizes ativas; dissipa após uso' },
  10: { id: 'veneno_mortal', nome: 'Veneno Mortal', custo: 4, alcance: 3, dano: 3, cd: 1, tipo: 'magico', fx: 'veneno5_acumula', desc: 'Veneno 3 stacks; se 5 stacks, perde 10% HP' },
  11: { id: 'cacos_afiados', nome: 'Cacos Afiados', custo: 4, alcance: 3, dano: 5, cd: 1, tipo: 'fisico', fx: 'sangramento_cascata', desc: 'Sangramento 2/turno; se já sangrando, dobra' },
  12: { id: 'névoa_cortante', nome: 'Névoa Cortante', custo: 3, alcance: 4, dano: 4, cd: 1, tipo: 'magico', fx: 'nevoa_precisao', desc: 'Área 2×2; reduz precisão de inimigos em 30%' },
  13: { id: 'sombras_gemeas', nome: 'Sombras Gêmeas', custo: 5, alcance: 3, dano: 4, cd: 2, tipo: 'fisico', fx: 'clone_ataque', desc: 'Invoca sombra que ataca mesmo alvo; 4 DMG extra' },
  14: { id: 'nuvem_cinzas', nome: 'Nuvem de Cinzas', custo: 4, alcance: 5, dano: 3, cd: 1, tipo: 'magico', fx: 'area4_cegueira', desc: 'Área 4×4; cegueira 1 turno + 3 DMG' },
  15: { id: 'muralha_raiz', nome: 'Muralha de Raízes', custo: 4, alcance: 3, dano: 0, cd: 2, tipo: 'magico', fx: 'barreira_terreno', desc: 'Cria barreira 1×3 que bloqueia passagem 2 turnos' },
  16: { id: 'reanimar_chama', nome: 'Reanimar Chama', custo: 6, alcance: 2, dano: 0, cd: 2, tipo: 'magico', fx: 'ressuscita', desc: 'Reanima aliado com 40% HP; uma vez por batalha' },
  17: { id: 'solda_fria', nome: 'Solda Fria', custo: 4, alcance: 2, dano: 5, cd: 1, tipo: 'fisico', fx: 'enferruja', desc: 'Reduz DEF do alvo em 30% por 2 turnos' },
  18: { id: 'dissecao', nome: 'Dissecação', custo: 4, alcance: 1, dano: 6, cd: 1, tipo: 'fisico', fx: 'ignora_def_total', desc: 'Ignora 100% da DEF; causa Medo 1 turno' },
  19: { id: 'rugido_estrategico', nome: 'Rugido Estratégico', custo: 3, alcance: 0, dano: 0, cd: 1, tipo: 'magico', fx: 'buff_time_ataque_extra', desc: '+2 ATQ e +2 MOV aliados; aliado mais próximo ganha ataque extra' },
  20: { id: 'mar_agulhas', nome: 'Mar de Agulhas', custo: 4, alcance: 5, dano: 4, cd: 1, tipo: 'fisico', fx: 'area3x3_sangramento', desc: 'Área 3×3; Sangramento 2/turno por 2 turnos' },
}

export const SKILLS_LV75 = {
  1: { id: 'bigorna', nome: 'Bigorna', custo: 7, alcance: 1, dano: 10, cd: 3, tipo: 'fisico', fx: 'atordoamento2', desc: 'Dano máximo; Atordoa 2 turnos; autocura 3 HP' },
  2: { id: 'ventania', nome: 'Ventania', custo: 6, alcance: 1, dano: 8, cd: 2, tipo: 'fisico', fx: 'multi_ataque3_empurra', desc: '3 ataques em alvos diferentes; empurra 1 casa' },
  3: { id: 'equacao_primordial', nome: 'Equação Primordial', custo: 8, alcance: 9, dano: 10, cd: 3, tipo: 'magico', fx: 'area_grande_ignora', desc: 'Área 5×5; ignora DEFM; 3 turnos de conjuração' },
  4: { id: 'curral', nome: 'Curral', custo: 6, alcance: 6, dano: 0, cd: 2, tipo: 'fisico', fx: 'imobiliza_todos_area', desc: 'Imobiliza todos inimigos em área 3×3 por 1 turno' },
  5: { id: 'tempestade_perpetua', nome: 'Tempestade Perpétua', custo: 6, alcance: 6, dano: 7, cd: 2, tipo: 'magico', fx: 'gelo_terreno_imobiliza', desc: 'Gela terreno 3×3; imobiliza quem pisar 1 turno' },
  6: { id: 'montanha_anda', nome: 'A Montanha Anda', custo: 7, alcance: 2, dano: 9, cd: 3, tipo: 'fisico', fx: 'esmaga_atordoa', desc: 'Área 2×2; Esmagado + Atordoado 1 turno' },
  7: { id: 'pira_final', nome: 'Pira Final', custo: 7, alcance: 4, dano: 8, cd: 2, tipo: 'magico', fx: 'queimadura_eterna', desc: 'Queimadura 4/turno; alvos não podem ser curados' },
  8: { id: 'cacada_implacavel', nome: 'Caçada Implacável', custo: 6, alcance: 2, dano: 7, cd: 2, tipo: 'fisico', fx: 'marca_morte', desc: 'Marca alvo; qualquer ataque contra marcado causa +50% dano' },
  9: { id: 'sete_espadas', nome: 'Sete Espadas', custo: 8, alcance: 2, dano: 0, cd: 3, tipo: 'fisico', fx: 'sete_golpes', desc: '7 ataques em área 3×3; 3 DMG cada; uma vez por batalha' },
  10: { id: 'peçonha_total', nome: 'Peçonha Total', custo: 6, alcance: 3, dano: 5, cd: 2, tipo: 'magico', fx: 'veneno_area_dobra', desc: 'Área 2×2; Veneno + dobra veneno existente' },
  11: { id: 'estilhaçar', nome: 'Estilhaçar', custo: 6, alcance: 3, dano: 5, cd: 2, tipo: 'fisico', fx: 'reflexo_total', desc: 'Reflete 60% do dano recebido no turno + 5 DMG base' },
  12: { id: 'névoa_mortalha', nome: 'Névoa Mortalha', custo: 5, alcance: 4, dano: 5, cd: 2, tipo: 'magico', fx: 'nevoa_dano_curar', desc: 'Área 3×3: inimigos 5 DMG, aliados 3 cura' },
  13: { id: 'corte_sombrio', nome: 'Corte Sombrio', custo: 7, alcance: 3, dano: 6, cd: 2, tipo: 'fisico', fx: 'ataque_duplo_sombra', desc: 'Corpo + Sombra atacam; 6 DMG cada; não pode ser esquivado' },
  14: { id: 'ultima_cinza', nome: 'Última Cinza', custo: 10, alcance: 0, dano: 0, cd: 4, tipo: 'magico', fx: 'ressureicao_total', desc: 'Reanima TODOS aliados caídos com 50% HP; uma vez por batalha' },
  15: { id: 'floresta_ferro', nome: 'Floresta de Ferro', custo: 6, alcance: 5, dano: 5, cd: 2, tipo: 'magico', fx: 'terreno_impassavel', desc: 'Área 3×5: terreno impassável 3 turnos + 5 DMG' },
  16: { id: 'ultimo_sopro', nome: 'Último Sopro', custo: 8, alcance: 3, dano: 8, cd: 3, tipo: 'magico', fx: 'ressuscita_ataque', desc: 'Reanima aliado com 60% HP + aliado ataca imediatamente' },
  17: { id: 'desmontagem_total', nome: 'Desmontagem Total', custo: 7, alcance: 2, dano: 8, cd: 2, tipo: 'fisico', fx: 'quebra_equip', desc: 'Remove bônus de equipamento do alvo por 3 turnos + 8 DMG' },
  18: { id: 'autopsia', nome: 'Autópsia', custo: 7, alcance: 2, dano: 7, cd: 2, tipo: 'fisico', fx: 'revela_fraqueza', desc: 'Revela fraqueza elemental do alvo; próximo ataque contra ele é crítico' },
  19: { id: 'estrondo', nome: 'Estrondo', custo: 7, alcance: 6, dano: 7, cd: 2, tipo: 'magico', fx: 'area_grande_atordoa', desc: 'Área 4×4; Atordoa inimigos 1 turno; aliados ganham +5 ATQ' },
  20: { id: 'chuvas_metal', nome: 'Chuvas de Metal', custo: 6, alcance: 7, dano: 6, cd: 2, tipo: 'fisico', fx: 'perfura_sangramento', desc: 'Área coluna 1×4; Sangramento 3/turno; ignora 30% DEF' },
}

// ── Skill slots ──
export const SKILL_SLOTS = { lv5: 0, lv25: 1, lv50: 2, lv75: 3 }

/**
 * Calcula atributos em um dado nível (1–99)
 * Proporção linear entre level 1 (tudo 1) e level 99 (atributo alvo)
 */
export function calcAtributosNoNivel(rosterEntry, nivel) {
  if (nivel <= 1) return { ...BASE_L1 }
  if (nivel >= 99) return { ...rosterEntry.atributos }

  const ratio = (nivel - 1) / 98
  const out = {}
  for (const key of Object.keys(BASE_L1)) {
    const base = BASE_L1[key]
    const alvo = rosterEntry.atributos[key]
    out[key] = Math.round(base + (alvo - base) * ratio)
  }
  return out
}

/**
 * Retorna as skills disponíveis em um dado nível
 * Todo personagem tem um ataque básico (custo 0) desde o nível 1
 */
export function getSkillsNoNivel(rosterEntry, nivel) {
  const skills = []
  // Ataque básico — nível 1, custo 0, sempre disponível
  if (nivel >= 1) {
    skills.push({
      id: `basico_${rosterEntry.id}`,
      nome: 'Ataque Básico',
      custo: 0,
      alcance: 1,
      dano: 1,
      cd: 0,
      tipo: 'fisico',
      fx: 'nenhum',
      desc: 'Um golpe simples que não gasta energia',
    })
  }
  // skill 1 (index 0) — nível 5
  if (nivel >= 5 && rosterEntry.skills[0]) skills.push({ ...rosterEntry.skills[0] })
  // skill 2 (index 1) — nível 25
  if (nivel >= 25 && rosterEntry.skills[1]) skills.push({ ...rosterEntry.skills[1] })
  // skill 3 — nível 50
  if (nivel >= 50 && SKILLS_LV50[rosterEntry.id]) skills.push({ ...SKILLS_LV50[rosterEntry.id] })
  // skill 4 — nível 75
  if (nivel >= 75 && SKILLS_LV75[rosterEntry.id]) skills.push({ ...SKILLS_LV75[rosterEntry.id] })
  return skills
}

/**
 * Constrói personagem em qualquer nível com stats e skills corretos
 */
export function construirPersonagemNivelado(rosterEntry, nivel, posX, posY, lado = 'aliado') {
  const attrs = calcAtributosNoNivel(rosterEntry, nivel)
  const skills = getSkillsNoNivel(rosterEntry, nivel)
  const hp = 40 + attrs.resistencia * 10
  const energia = 20 + attrs.energia * 5
  return {
    id: `${lado}_${rosterEntry.id}`,
    nome: rosterEntry.nome,
    classe: rosterEntry.classe,
    elemental: rosterEntry.elemental,
    nivel,
    atributos: attrs,
    skills,
    hp, hpMax: hp,
    energia, energiaMax: energia,
    x: posX, y: posY,
    prec: 24 + attrs.precisao + Math.floor(attrs.tenacidade / 3),
    esquiva: attrs.velocidade + Math.floor(attrs.tenacidade / 5),
    def_leve: Math.floor(attrs.resistencia * 0.5 + attrs.velocidade * 0.2),
    def_pesada: 50 + attrs.resistencia * 3,
    crit: Math.floor(attrs.tenacidade * 0.3),
    status: [],
    jaMoveu: false,
    jaAtacou: false,
    equipamento: { arma: null, armadura: null, acessorio: null },
    itens: [null, null, null],
  }
}
