/**
 * ROSTER — 20 Personagens (Refactory v4.3)
 * Cada personagem: atributos, 2 skills (ataque + especial), elemental
 *
 * Atributos: forca(FOR), velocidade(AGI), resistencia(VIT), energia(INT), precisao(DES), tenacidade(SOR)
 * Skills: { dano: DMG, alcance: RNG, cd: CD, fx: efeito }
 */
export const ROSTER = [
  { id: 1, nome: 'Ferro Velho', classe: 'karuak', elemental: 'terra',
    atributos: { forca: 80, velocidade: 20, resistencia: 99, energia: 10, precisao: 15, tenacidade: 10 },
    skills: [
      { id: 'mao_de_ferro', nome: 'Mão de Ferro', custo: 2, alcance: 1, dano: 5, cd: 0, tipo: 'fisico', fx: 'empurra2', desc: 'Empurra alvo 2 casas para trás' },
      { id: 'avalanche_engrenagens', nome: 'Avalanche de Engrenagens', custo: 4, alcance: 4, dano: 4, cd: 2, tipo: 'fisico', fx: 'lentidao1', desc: 'Acerta todos na linha reta; Lentidão 1 turno' },
    ]},
  { id: 2, nome: 'Relâmpago Branco', classe: 'moraki', elemental: 'relampago',
    atributos: { forca: 20, velocidade: 99, resistencia: 25, energia: 10, precisao: 70, tenacidade: 30 },
    skills: [
      { id: 'rajada', nome: 'Rajada', custo: 2, alcance: 2, dano: 3, cd: 0, tipo: 'fisico', fx: 'mov3', desc: 'Move-se 3 casas antes do golpe' },
      { id: 'vacuo_sonico', nome: 'Vácuo Sônico', custo: 5, alcance: 2, dano: 6, cd: 1, tipo: 'fisico', fx: 'puxa2_atordoa1', desc: 'Puxa 2 alvos adjacentes 1 casa; Atordoados 1 turno' },
    ]},
  { id: 3, nome: 'Espiral', classe: 'tivara', elemental: 'luz',
    atributos: { forca: 5, velocidade: 15, resistencia: 30, energia: 99, precisao: 55, tenacidade: 20 },
    skills: [
      { id: 'trajetoria_calculada', nome: 'Trajetória Calculada', custo: 2, alcance: 6, dano: 3, cd: 0, tipo: 'magico', fx: 'ricocheteia', desc: 'Atinge alvo atrás de obstáculo' },
      { id: 'equacao_final', nome: 'Equação Final', custo: 6, alcance: 8, dano: 5, cd: 2, tipo: 'magico', fx: 'area3', desc: 'Atinge 3 casas, ignora obstáculos' },
    ]},
  { id: 4, nome: 'Dente de Sabre', classe: 'karuak', elemental: 'vento',
    atributos: { forca: 60, velocidade: 40, resistencia: 55, energia: 15, precisao: 65, tenacidade: 35 },
    skills: [
      { id: 'lacada', nome: 'Laçada', custo: 2, alcance: 5, dano: 2, cd: 0, tipo: 'fisico', fx: 'puxa3', desc: 'Puxa alvo até 3 casas' },
      { id: 'cobra_pedra', nome: 'Cobra de Pedra', custo: 5, alcance: 4, dano: 7, cd: 3, tipo: 'fisico', fx: 'enterrado2', desc: 'Área 2×2; alvos Enterrados 2 turnos' },
    ]},
  { id: 5, nome: 'Sombra de Gelo', classe: 'tivara', elemental: 'gelo',
    atributos: { forca: 10, velocidade: 55, resistencia: 30, energia: 25, precisao: 99, tenacidade: 15 },
    skills: [
      { id: 'estaca_gelo', nome: 'Estaca de Gelo', custo: 3, alcance: 3, dano: 4, cd: 0, tipo: 'magico', fx: 'imobiliza1', desc: 'Imobiliza alvo 1 turno' },
      { id: 'tempestade_silenciosa', nome: 'Tempestade Silenciosa', custo: 4, alcance: 5, dano: 3, cd: 1, tipo: 'magico', fx: 'gelo_terreno', desc: 'Diagonal; casas viram gelo por 2 turnos' },
    ]},
  { id: 6, nome: 'Montanha Viva', classe: 'karuak', elemental: 'terra',
    atributos: { forca: 99, velocidade: 10, resistencia: 80, energia: 10, precisao: 30, tenacidade: 5 },
    skills: [
      { id: 'empurrao_montanha', nome: 'Empurrão de Montanha', custo: 2, alcance: 1, dano: 5, cd: 0, tipo: 'fisico', fx: 'empurra4', desc: 'Empurra alvo até 4 casas' },
      { id: 'queda_controlada', nome: 'Queda Controlada', custo: 5, alcance: 2, dano: 7, cd: 2, tipo: 'fisico', fx: 'esmagado1', desc: 'Área 2×2; alvos Esmagados 1 turno' },
    ]},
  { id: 7, nome: 'Tocha Sagrada', classe: 'tivara', elemental: 'fogo',
    atributos: { forca: 15, velocidade: 35, resistencia: 50, energia: 85, precisao: 40, tenacidade: 25 },
    skills: [
      { id: 'chama_abencoada', nome: 'Chama Abençoada', custo: 2, alcance: 3, dano: 4, cd: 0, tipo: 'magico', fx: 'cura_adj', desc: 'Cura 2 HP de aliado OU ataca' },
      { id: 'pira_ancestral', nome: 'Pira Ancestral', custo: 5, alcance: 5, dano: 6, cd: 2, tipo: 'magico', fx: 'queimadura_semcura', desc: 'Coluna 1×3; queimadura + bloqueia cura' },
    ]},
  { id: 8, nome: 'Lobo de Wendor', classe: 'tivara', elemental: 'metal',
    atributos: { forca: 30, velocidade: 50, resistencia: 45, energia: 20, precisao: 80, tenacidade: 40 },
    skills: [
      { id: 'coronhada_precisa', nome: 'Coronhada Precisa', custo: 2, alcance: 1, dano: 5, cd: 0, tipo: 'fisico', fx: 'empurra3', desc: 'Empurra alvo 3 casas' },
      { id: 'campo_minado_gelo', nome: 'Campo Minado de Gelo', custo: 5, alcance: 7, dano: 0, cd: 2, tipo: 'magico', fx: 'mina_gelo', desc: 'Planta 4 minas invisíveis; quem pisar leva 4 DMG' },
    ]},
  { id: 9, nome: 'Sete Cicatrizes', classe: 'moraki', elemental: 'vento',
    atributos: { forca: 70, velocidade: 45, resistencia: 65, energia: 10, precisao: 45, tenacidade: 30 },
    skills: [
      { id: 'explosao_raiva', nome: 'Explosão de Raiva', custo: 2, alcance: 1, dano: 3, cd: 0, tipo: 'fisico', fx: 'cicatriz', desc: '+1 DMG por cicatriz ativa (max +7)' },
      { id: 'berserker', nome: 'Berserker', custo: 6, alcance: 2, dano: 8, cd: 2, tipo: 'fisico', fx: 'perde3hp', desc: 'Só com 5+ cicatrizes; perde 3 HP' },
    ]},
  { id: 10, nome: 'Língua de Cobra', classe: 'moraki', elemental: 'natureza',
    atributos: { forca: 10, velocidade: 60, resistencia: 40, energia: 50, precisao: 70, tenacidade: 35 },
    skills: [
      { id: 'veneno_contrato', nome: 'Veneno de Contrato', custo: 2, alcance: 2, dano: 2, cd: 0, tipo: 'magico', fx: 'veneno_acumula', desc: 'Veneno 1 stack; max 5; ignora DEF' },
      { id: 'flanquear', nome: 'Flanquear', custo: 4, alcance: 3, dano: 5, cd: 1, tipo: 'fisico', fx: 'teleporta', desc: 'Teleporta para diagonal; +2 DMG por trás' },
    ]},
  { id: 11, nome: 'Vidro Partido', classe: 'moraki', elemental: 'luz',
    atributos: { forca: 55, velocidade: 55, resistencia: 35, energia: 60, precisao: 45, tenacidade: 20 },
    skills: [
      { id: 'reflexo_cortante', nome: 'Reflexo Cortante', custo: 3, alcance: 3, dano: 4, cd: 0, tipo: 'fisico', fx: 'reflexo', desc: 'Se atacado antes, +2 DMG bônus' },
      { id: 'camara_espelhos', nome: 'Câmara de Espelhos', custo: 5, alcance: 4, dano: 0, cd: 2, tipo: 'magico', fx: 'desvia40', desc: 'Área 3×3; 40% de desviar ataques' },
    ]},
  { id: 12, nome: 'Névoa da Manhã', classe: 'moraki', elemental: 'agua',
    atributos: { forca: 10, velocidade: 70, resistencia: 55, energia: 65, precisao: 50, tenacidade: 15 },
    skills: [
      { id: 'redirecionamento', nome: 'Redirecionamento', custo: 2, alcance: 1, dano: 0, cd: 1, tipo: 'magico', fx: 'redireciona', desc: 'Devolve próximo ataque recebido' },
      { id: 'nevoa_impenetravel', nome: 'Névoa Impenetrável', custo: 4, alcance: 4, dano: 2, cd: 1, tipo: 'magico', fx: 'nevoa_area', desc: 'Área 3×3; precisão reduzida 3 turnos' },
    ]},
  { id: 13, nome: 'Corvo de Draymoor', classe: 'moraki', elemental: 'trevas',
    atributos: { forca: 25, velocidade: 65, resistencia: 40, energia: 55, precisao: 70, tenacidade: 20 },
    skills: [
      { id: 'rastro_sombra', nome: 'Rastro de Sombra', custo: 3, alcance: 2, dano: 3, cd: 1, tipo: 'magico', fx: 'sombra_chamariz', desc: 'Deixa sombra que age como chamariz 1 turno' },
      { id: 'detetive_duplo', nome: 'Detetive Duplo', custo: 6, alcance: 3, dano: 5, cd: 2, tipo: 'fisico', fx: 'ataque_duplo', desc: 'Corpo + Sombra atacam alvos diferentes; 5 DMG cada' },
    ]},
  { id: 14, nome: 'Cinza', classe: 'karuak', elemental: 'trevas',
    atributos: { forca: 50, velocidade: 50, resistencia: 50, energia: 40, precisao: 50, tenacidade: 30 },
    skills: [
      { id: 'cinzas_cegas', nome: 'Cinzas Cegas', custo: 2, alcance: 4, dano: 2, cd: 0, tipo: 'magico', fx: 'cegueira1', desc: 'Cegueira 1 turno' },
      { id: 'ressurreicao_cinzas', nome: 'Ressurreição de Cinzas', custo: 8, alcance: 0, dano: 0, cd: 3, tipo: 'magico', fx: 'cura_propria', desc: 'Restaura 5 HP. Uma vez por batalha.' },
    ]},
  { id: 15, nome: 'Raiz de Ferro', classe: 'karuak', elemental: 'terra',
    atributos: { forca: 65, velocidade: 30, resistencia: 70, energia: 35, precisao: 30, tenacidade: 35 },
    skills: [
      { id: 'lavra', nome: 'Lavra', custo: 2, alcance: 1, dano: 4, cd: 0, tipo: 'fisico', fx: 'terreno_aliado', desc: 'Cria terreno: aliados ignoram penalidade' },
      { id: 'raizes_profundas', nome: 'Raízes Profundas', custo: 5, alcance: 5, dano: 3, cd: 2, tipo: 'magico', fx: 'imobiliza2', desc: 'Área 2×4; imobiliza 2 turnos; +1 defesa aliados' },
    ]},
  { id: 16, nome: 'Última Chama', classe: 'tivara', elemental: 'fogo',
    atributos: { forca: 15, velocidade: 40, resistencia: 60, energia: 80, precisao: 45, tenacidade: 25 },
    skills: [
      { id: 'triagem', nome: 'Triagem', custo: 2, alcance: 2, dano: 0, cd: 0, tipo: 'magico', fx: 'cura3', desc: 'Cura 3 HP de aliado ou si mesma' },
      { id: 'choque_eletrico', nome: 'Choque Elétrico', custo: 5, alcance: 3, dano: 5, cd: 1, tipo: 'magico', fx: 'reanima', desc: 'Área 2×2; dano inimigos + reanima aliado com 2 HP' },
    ]},
  { id: 17, nome: 'Doutor Ferrugem', classe: 'karuak', elemental: 'metal',
    atributos: { forca: 55, velocidade: 35, resistencia: 60, energia: 45, precisao: 60, tenacidade: 15 },
    skills: [
      { id: 'parafuso_reverso', nome: 'Parafuso Reverso', custo: 3, alcance: 1, dano: 4, cd: 1, tipo: 'fisico', fx: 'trava_habilidade', desc: 'Desativa próximo ataque especial do alvo' },
      { id: 'perfuracao_espiral', nome: 'Perfuração Espiral', custo: 6, alcance: 2, dano: 7, cd: 2, tipo: 'fisico', fx: 'ignora_def', desc: 'Ignora toda DEF' },
    ]},
  { id: 18, nome: 'Mãos de Osso', classe: 'tivara', elemental: 'trevas',
    atributos: { forca: 45, velocidade: 40, resistencia: 35, energia: 70, precisao: 65, tenacidade: 15 },
    skills: [
      { id: 'incisao_precisa', nome: 'Incisão Precisa', custo: 2, alcance: 1, dano: 4, cd: 0, tipo: 'fisico', fx: 'meia_def', desc: 'Ignora metade da DEF' },
      { id: 'anatomia_medo', nome: 'Anatomia do Medo', custo: 4, alcance: 3, dano: 0, cd: 1, tipo: 'magico', fx: 'medo2', desc: 'Medo: -2 MOV, sem CD longo por 2 turnos' },
    ]},
  { id: 19, nome: 'Rugido', classe: 'tivara', elemental: 'relampago',
    atributos: { forca: 30, velocidade: 55, resistencia: 55, energia: 80, precisao: 40, tenacidade: 10 },
    skills: [
      { id: 'apitaco', nome: 'Apitaço', custo: 2, alcance: 4, dano: 3, cd: 0, tipo: 'magico', fx: 'atordoa_semoveu', desc: 'Atordoa se alvo já moveu este turno' },
      { id: 'grito_guerra', nome: 'Grito de Guerra', custo: 4, alcance: 0, dano: 0, cd: 1, tipo: 'magico', fx: 'buff_time', desc: '+3 ATQ e +1 MOV aliados raio 4 por 2 turnos' },
    ]},
  { id: 20, nome: 'Espinho Negro', classe: 'moraki', elemental: 'metal',
    atributos: { forca: 10, velocidade: 75, resistencia: 30, energia: 35, precisao: 90, tenacidade: 25 },
    skills: [
      { id: 'chuva_agulhas', nome: 'Chuva de Agulhas', custo: 2, alcance: 6, dano: 2, cd: 0, tipo: 'fisico', fx: 'sangramento3', desc: 'Área 1×3; Sangramento 1/turno por 3 turnos' },
      { id: 'tinta_viva', nome: 'Tinta Viva', custo: 3, alcance: 3, dano: 0, cd: 1, tipo: 'magico', fx: 'cego2', desc: 'Cego 2 turnos; falha ataques de longa distância' },
    ]},
]

/**
 * Constrói objeto de personagem jogável a partir do roster
 */
export function construirPersonagem(rosterId, posX, posY, lado = 'aliado') {
  const t = ROSTER.find(r => r.id === rosterId)
  if (!t) return null
  const hp = 40 + t.atributos.resistencia * 15 // VIT-based
  const energia = 20 + t.atributos.energia * 5 // INT-based
  return {
    id: `${lado}_${rosterId}`,
    nome: t.nome,
    classe: t.classe,
    elemental: t.elemental,
    atributos: { ...t.atributos },
    skills: t.skills ? t.skills.map(s => ({ ...s })) : [],
    hp, hpMax: hp,
    energia, energiaMax: energia,
    x: posX, y: posY,
    prec: 24 + t.atributos.precisao + Math.floor(t.atributos.tenacidade / 3),
    esquiva: t.atributos.velocidade + Math.floor(t.atributos.tenacidade / 5),
    def_leve: Math.floor(t.atributos.resistencia * 0.5 + t.atributos.velocidade * 0.2),
    def_pesada: 50 + t.atributos.resistencia * 3,
    crit: Math.floor(t.atributos.tenacidade * 0.3),
    jaMoveu: false,
    jaAtacou: false,
  }
}

/**
 * Cria time de inimigos (4) com posições próximas ao player
 */
export function getInimigosPadrao() {
  // IDs variados para inimigos: ferro velho, dente de sabre, sombra de gelo, lobo de wendor
  const ids = [1, 4, 5, 8]
  return ids.map((id, i) => {
    const p = construirPersonagem(id, 4 + (i % 2) * 2, 2 + i * 2, 'inimigo')
    return { ...p, id: `enemy_${i}` }
  })
}
