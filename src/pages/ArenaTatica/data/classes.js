/**
 * ARENA TÁTICA — 6 Classes Base
 * Cada classe: atributos base, skills (3 iniciais + 2 por evolução), passiva, evoluções
 */

export const CLASSES = {
  karuak: {
    id: 'karuak',
    nome: 'KARUAK',
    tipo: 'Mãos Livres',
    papel: 'Tanque',
    desc: 'Guerreiro Bruto. Corpo fechado, pegada que desmonta. Quanto mais bate, mais resistente fica.',
    desc_en: 'Brute Warrior. Dense body, crushing grip. The more he hits, the tougher he gets.',
    atributos_base: { forca: 14, velocidade: 8, resistencia: 16, energia: 6, precisao: 7, tenacidade: 12 },
    sprite: { corpo: 'square', cor_primaria: '#8B4513', cor_secundaria: '#D2691E' },
    acessorios: ['capacete_chifres', 'cota_ombros', 'mascara_ferro'],
    passiva: { nome: 'Pele de Pedra', desc: '-15% dano recebido. Acumula até -30% após 3 turnos consecutivos causando dano.' },
    skills_base: [
      { id: 'soco_pesado', nome: 'Soco Pesado', custo: 2, alcance: 1, dano: 1.2, tipo: 'fisico', desc: 'Golpe frontal. Empurra inimigo 1 casa.' },
      { id: 'postura_defensiva', nome: 'Postura Defensiva', custo: 1, alcance: 0, dano: 0, tipo: 'buff', desc: 'Reduz dano recebido em 50% por 1 turno.' },
      { id: 'pisao_tremendo', nome: 'Pisão Tremendo', custo: 3, alcance: 2, dano: 0.7, tipo: 'fisico', desc: 'Atinge área 2×2. Inimigos atordoados 1 turno.' },
    ],
    evolucoes: {
      nivel40: {
        nome: 'KARUAK — MURALHA',
        desc: 'Escudo de pedra envolve o corpo. Passiva dobra de eficácia.',
        skills_novas: [
          { id: 'muralha_escudo', nome: 'Muralha de Escudo', custo: 3, alcance: 0, dano: 0, tipo: 'buff', desc: 'Aliados adjacentes recebem -30% dano por 2 turnos.' },
          { id: 'investida_colossal', nome: 'Investida Colossal', custo: 4, alcance: 3, dano: 1.5, tipo: 'fisico', desc: 'Corre em linha reta. Derruba todos no caminho.' },
        ],
        passiva_melhorada: { nome: 'Pele de Pedra +', desc: '-25% dano recebido. Acumula até -50% após 3 turnos.' },
      },
      nivel70: {
        nome: 'KARUAK — AVALANCHE',
        desc: 'A muralha agora avança. Dano e defesa em igual medida.',
        skills_novas: [
          { id: 'terremoto', nome: 'Terremoto', custo: 5, alcance: 3, dano: 1.8, tipo: 'fisico', desc: 'Área 3×3. Dano + atordoamento 1 turno.' },
          { id: 'furia_da_terra', nome: 'Fúria da Terra', custo: 6, alcance: 1, dano: 2.5, tipo: 'fisico', desc: 'Golpe final. Dano máximo se HP < 30%.' },
        ],
      },
    },
  },

  moraki: {
    id: 'moraki',
    nome: 'MORAKI',
    tipo: 'Mãos Livres',
    papel: 'DPS/Disruptor',
    desc: 'Monge dos Ventos. Velocidade pura. Some e reaparece onde ninguém espera.',
    desc_en: 'Wind Monk. Pure speed. Vanishes and reappears where no one expects.',
    atributos_base: { forca: 10, velocidade: 18, resistencia: 7, energia: 12, precisao: 14, tenacidade: 5 },
    sprite: { corpo: 'triangular', cor_primaria: '#4A90D9', cor_secundaria: '#7EC8E3' },
    acessorios: ['bandana_vento', 'braceletes_metal', 'cape_leve'],
    passiva: { nome: 'Passos do Vento', desc: 'Após usar skill, pode mover 1 casa extra. (máx 1 vez por turno)' },
    skills_base: [
      { id: 'soco_vento', nome: 'Soco do Vento', custo: 1, alcance: 2, dano: 0.8, tipo: 'fisico', desc: 'Golpe rápido a distância. Reduz velocidade do alvo em 20%.' },
      { id: 'desvio_fantasma', nome: 'Desvio Fantasma', custo: 2, alcance: 0, dano: 0, tipo: 'buff', desc: 'Esquiva do próximo ataque recebido. Pode contra-atacar.' },
      { id: 'rajada_ciclonica', nome: 'Rajada Ciclônica', custo: 3, alcance: 2, dano: 1.0, tipo: 'fisico', desc: 'Atinge 3 inimigos em cone. Empurra 1 casa.' },
    ],
    evolucoes: {
      nivel40: {
        nome: 'MORAKI — FANTASMA',
        desc: 'O vento veste o lutador. Imprevisível como nunca.',
        skills_novas: [
          { id: 'teleporte_combate', nome: 'Teleporte de Combate', custo: 2, alcance: 4, dano: 0, tipo: 'mov', desc: 'Teletransporta para qualquer casa vazia no alcance.' },
          { id: 'cem_golpes', nome: 'Cem Golpes', custo: 4, alcance: 1, dano: 1.8, tipo: 'fisico', desc: 'Múltiplos golpes. Dano aumenta 10% por golpe consecutivo no mesmo alvo.' },
        ],
      },
      nivel70: {
        nome: 'MORAKI — TUFÃO',
        desc: 'A tempestade se torna uma só com o lutador.',
        skills_novas: [
          { id: 'olho_tufao', nome: 'Olho do Tufão', custo: 5, alcance: 3, dano: 2.0, tipo: 'fisico', desc: 'Área circular 3×3. Puxa inimigos para o centro.' },
          { id: 'vento_cortante', nome: 'Vento Cortante', custo: 3, alcance: 5, dano: 1.2, tipo: 'fisico', desc: 'Linha reta. Ignora obstáculos. Sangramento 2 turnos.' },
        ],
      },
    },
  },

  tivara: {
    id: 'tivara',
    nome: 'TIVARA',
    tipo: 'Armas',
    papel: 'DPS',
    desc: 'Xamã Arqueira. Flechas carregadas de energia elemental. Precisão cirúrgica.',
    desc_en: 'Shaman Archer. Arrows charged with elemental energy. Surgical precision.',
    atributos_base: { forca: 8, velocidade: 13, resistencia: 7, energia: 15, precisao: 18, tenacidade: 6 },
    sprite: { corpo: 'elipse', cor_primaria: '#2ECC71', cor_secundaria: '#A8E6CF' },
    acessorios: ['tiara_penas', 'bracelete_arqueiro', 'capa_floresta'],
    passiva: { nome: 'Olho de Águia', desc: '+20% precisão em alcance 3+. Acerto crítico causa +50% dano.' },
    skills_base: [
      { id: 'flecha_certeira', nome: 'Flecha Certeira', custo: 1, alcance: 4, dano: 0.9, tipo: 'arma', desc: 'Tiro preciso. Ignora bônus de defesa.' },
      { id: 'chuva_flechas', nome: 'Chuva de Flechas', custo: 3, alcance: 3, dano: 0.7, tipo: 'arma', desc: 'Área 2×2. Dano em todos na área.' },
      { id: 'marca_cacador', nome: 'Marca do Caçador', custo: 2, alcance: 4, dano: 0, tipo: 'debuff', desc: 'Marca inimigo. Próximo ataque contra ele causa +40% dano.' },
    ],
    evolucoes: {
      nivel40: {
        nome: 'TIVARA — PRECISÃO',
        desc: 'Cada flecha encontra seu alvo. Sem exceção.',
        skills_novas: [
          { id: 'flecha_perfurante', nome: 'Flecha Perfurante', custo: 3, alcance: 5, dano: 1.3, tipo: 'arma', desc: 'Atravessa inimigos em linha. Dano reduz 10% por alvo.' },
          { id: 'tiro_triplo', nome: 'Tiro Triplo', custo: 4, alcance: 3, dano: 1.5, tipo: 'arma', desc: 'Três flechas em alvos diferentes (máx 2 casas entre alvos).' },
        ],
      },
      nivel70: {
        nome: 'TIVARA — ARCO ANCESTRAL',
        desc: 'O arco desperta. Flechas que rasgam o céu.',
        skills_novas: [
          { id: 'flecha_ancestral', nome: 'Flecha Ancestral', custo: 6, alcance: 5, dano: 2.5, tipo: 'arma', desc: 'Máximo de energia elemental. Dano massivo em área 2×2.' },
          { id: 'olho_falcao', nome: 'Olho de Falcão', custo: 2, alcance: 0, dano: 0, tipo: 'buff', desc: 'Próximos 2 ataques têm alcance +2 e +30% crítico.' },
        ],
      },
    },
  },

  zephyra: {
    id: 'zephyra',
    nome: 'ZEPHYRA',
    tipo: 'Poder',
    papel: 'Suporte/Controle',
    desc: 'Feiticeira das Marés. Manipula água e emoções. Cura e confunde.',
    desc_en: 'Tide Sorceress. Manipulates water and emotions. Heals and confuses.',
    atributos_base: { forca: 5, velocidade: 9, resistencia: 8, energia: 20, precisao: 10, tenacidade: 10 },
    sprite: { corpo: 'gota', cor_primaria: '#1E90FF', cor_secundaria: '#87CEEB' },
    acessorios: ['coroa_mar', 'colar_conchas', 'vestes_ondas'],
    passiva: { nome: 'Fluxo Contínuo', desc: 'Skills de cura curam +20%. Aliados curados ganham 1 de Energia Mental.' },
    skills_base: [
      { id: 'jato_dagua', nome: 'Jato D\'Água', custo: 1, alcance: 3, dano: 0.6, tipo: 'poder', desc: 'Dano leve. Reduz velocidade do alvo em 1 casa no próximo turno.' },
      { id: 'onda_curativa', nome: 'Onda Curativa', custo: 2, alcance: 2, dano: 0, tipo: 'cura', desc: 'Cura 25% HP máximo de um aliado.' },
      { id: 'névoa_confusao', nome: 'Névoa da Confusão', custo: 3, alcance: 3, dano: 0, tipo: 'debuff', desc: 'Área 2×2. Inimigos têm 40% de chance de errar ações por 1 turno.' },
    ],
    evolucoes: {
      nivel40: {
        nome: 'ZEPHYRA — SIRENA',
        desc: 'O canto da sereia confunde até os mais fortes.',
        skills_novas: [
          { id: 'canto_sereia', nome: 'Canto da Sereia', custo: 3, alcance: 4, dano: 0, tipo: 'debuff', desc: 'Inimigo age 1 turno a favor do aliado mais próximo.' },
          { id: 'mare_vital', nome: 'Maré Vital', custo: 4, alcance: 3, dano: 0, tipo: 'cura', desc: 'Cura 40% HP de TODOS os aliados na área 2×2.' },
        ],
      },
      nivel70: {
        nome: 'ZEPHYRA — TSUNAMI',
        desc: 'A feiticeira se torna a tempestade. Cura e destruição em igual medida.',
        skills_novas: [
          { id: 'tsunami', nome: 'Tsunami', custo: 6, alcance: 4, dano: 1.8, tipo: 'poder', desc: 'Onda massiva em cone. Dano + empurra 2 casas + atordoamento.' },
          { id: 'renovacao', nome: 'Renovação', custo: 5, alcance: 2, dano: 0, tipo: 'cura', desc: 'Cura 60% HP + remove todos os debuffs de um aliado.' },
        ],
      },
    },
  },

  ignis: {
    id: 'ignis',
    nome: 'IGNIS',
    tipo: 'Poder',
    papel: 'DPS/Burst',
    desc: 'Piromante Instável. Fogo que consome tudo — inclusive o próprio usuário.',
    desc_en: 'Unstable Pyromancer. Fire that consumes everything — including the user.',
    atributos_base: { forca: 4, velocidade: 11, resistencia: 5, energia: 22, precisao: 12, tenacidade: 8 },
    sprite: { corpo: 'chama', cor_primaria: '#FF4500', cor_secundaria: '#FFD700' },
    acessorios: ['coroa_fogo', 'manto_chamas', 'bracelete_brasas'],
    passiva: { nome: 'Chamas Caóticas', desc: 'Skills têm 20% de chance de causar queimadura (dano 5% HP por turno).' },
    skills_base: [
      { id: 'bola_fogo', nome: 'Bola de Fogo', custo: 2, alcance: 3, dano: 1.1, tipo: 'poder', desc: 'Dano médio. Chance 30% de queimadura.' },
      { id: 'explosao', nome: 'Explosão', custo: 3, alcance: 2, dano: 1.5, tipo: 'poder', desc: 'Área 2×2. Dano alto. Autodano 10% HP.' },
      { id: 'chama_rapida', nome: 'Chama Rápida', custo: 1, alcance: 2, dano: 0.5, tipo: 'poder', desc: 'Dano baixo. Aplica queimadura garantida por 2 turnos.' },
    ],
    evolucoes: {
      nivel40: {
        nome: 'IGNIS — LABAREDA',
        desc: 'O fogo controlado é mais perigoso que o fogo solto.',
        skills_novas: [
          { id: 'labareda', nome: 'Labareda', custo: 4, alcance: 4, dano: 1.8, tipo: 'poder', desc: 'Linha reta. Queimadura garantida + dano em área no final.' },
          { id: 'combustao', nome: 'Combustão', custo: 3, alcance: 2, dano: 1.3, tipo: 'poder', desc: 'Inimigos queimados recebem +50% dano desta skill.' },
        ],
      },
      nivel70: {
        nome: 'IGNIS — SOL NEGRO',
        desc: 'A chama que não se apaga. O sol que queima até a escuridão.',
        skills_novas: [
          { id: 'sol_negro', nome: 'Sol Negro', custo: 7, alcance: 3, dano: 3.0, tipo: 'poder', desc: 'Dano massivo em área 2×2. Autodano 20% HP. Só usa uma vez por batalha.' },
          { id: 'nucleo_ardente', nome: 'Núcleo Ardente', custo: 2, alcance: 0, dano: 0, tipo: 'buff', desc: 'Próximas 3 skills custam -1 Energia Mental.' },
        ],
      },
    },
  },

  nami: {
    id: 'nami',
    nome: 'NAMI',
    tipo: 'Armas',
    papel: 'Disruptor/Mobilidade',
    desc: 'Dançarina de Lâminas. Adaga e acrobacia. O palco é dela — você só está no caminho.',
    desc_en: 'Blade Dancer. Dagger and acrobatics. The stage is hers — you\'re just in the way.',
    atributos_base: { forca: 11, velocidade: 17, resistencia: 6, energia: 10, precisao: 15, tenacidade: 7 },
    sprite: { corpo: 'losango', cor_primaria: '#9B59B6', cor_secundaria: '#E8A0E8' },
    acessorios: ['mascara_veludo', 'cinto_facas', 'cape_rolo'],
    passiva: { nome: 'Dança das Facas', desc: 'Após matar um inimigo, ganha turno extra (1x por batalha).' },
    skills_base: [
      { id: 'adaga_rapida', nome: 'Adaga Rápida', custo: 1, alcance: 1, dano: 0.7, tipo: 'arma', desc: 'Golpe rápido. Pode atacar e mover na mesma ação.' },
      { id: 'rolamento_acrobatico', nome: 'Rolamento Acrobático', custo: 1, alcance: 3, dano: 0, tipo: 'mov', desc: 'Move para qualquer casa vazia no alcance. Inimigos adjacentes levam dano leve.' },
      { id: 'chuva_laminas', nome: 'Chuva de Lâminas', custo: 3, alcance: 2, dano: 1.2, tipo: 'arma', desc: 'Área 2×2. Sangramento 2 turnos.' },
    ],
    evolucoes: {
      nivel40: {
        nome: 'NAMI — SOMBRA',
        desc: 'As lâminas se movem antes da luz.',
        skills_novas: [
          { id: 'sombra_fatal', nome: 'Sombra Fatal', custo: 3, alcance: 1, dano: 1.8, tipo: 'arma', desc: 'Ataque pelas costas: +100% dano se alvo não está virado para Nami.' },
          { id: 'clone_ilusao', nome: 'Clone de Ilusão', custo: 2, alcance: 2, dano: 0, tipo: 'mov', desc: 'Cria um clone que dura 1 turno. Inimigo pode atacar o clone.' },
        ],
      },
      nivel70: {
        nome: 'NAMI — CREPÚSCULO',
        desc: 'Entre a luz e a escuridão, a dançarina decide quem cai.',
        skills_novas: [
          { id: 'danca_crepusculo', nome: 'Dança do Crepúsculo', custo: 5, alcance: 2, dano: 2.2, tipo: 'arma', desc: 'Sequência de 4 golpes em alvos diferentes. Último golpe causa +100% se todos acertarem.' },
          { id: 'escapista', nome: 'Escapista', custo: 2, alcance: 4, dano: 0, tipo: 'mov', desc: 'Teletransporta + invisibilidade por 1 turno.' },
        ],
      },
    },
  },
}

/** Retorna todas as classes com flag locked se não disponível para o tier */
export function getClassesDisponiveis(tier, rotacaoSemanal = 0) {
  const todas = Object.keys(CLASSES)
  if (tier === 'elite' || tier === 'primordial') {
    return todas.map(id => ({ ...CLASSES[id], id, locked: false }))
  }
  // Free: mostra todas, mas só 2 estão desbloqueadas (rodízio semanal)
  const idx = rotacaoSemanal % todas.length
  const disponiveis = [todas[idx], todas[(idx + 1) % todas.length]]
  return todas.map(id => ({ ...CLASSES[id], id, locked: !disponiveis.includes(id) }))
}

/** Evolução de classe por nível */
export function getEvolucao(classeId, nivel) {
  const cls = CLASSES[classeId]
  if (!cls) return null
  if (nivel >= 70 && cls.evolucoes.nivel70) return cls.evolucoes.nivel70
  if (nivel >= 40 && cls.evolucoes.nivel40) return cls.evolucoes.nivel40
  return null
}
