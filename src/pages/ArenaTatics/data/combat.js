/**
 * LDI TACTICS — Sistema de Combate v2 + Status Effects
 * Sequência de resolução (seção 12 do documento):
 * 1. Dano Bruto
 * 2. Esquiva Perfeita → MISS
 * 3. Precisão vs Esquiva → MISS
 * 4. Crítico (físico): ×1.4
 * 5. DEF leve (subtração) + DEF pesada (%)
 * 6. Aplicar HP
 * 7. Aplicar status (se acertou)
 */

/** Tabela de status: tolerância por atributo */
const STATUS_TOL = {
  sangramento: 'velocidade', // AGI
  envenenamento: 'resistencia', // VIT
  atordoamento: 'resistencia', // VIT
  imobilizacao: 'forca', // FOR
  cegueira: 'energia', // INT
  silencio: 'energia', // INT
  congelado: 'velocidade', // AGI
  queimadura: 'resistencia', // VIT
  medo: 'energia', // INT
  esmagado: 'forca', // FOR
  lentidao: 'velocidade', // AGI
}

/** Descrição dos efeitos FX das skills */
export const FX_INFO = {
  empurra2: { nome: 'Empurrão', desc: 'Empurra 2 casas' },
  empurra3: { nome: 'Empurrão', desc: 'Empurra 3 casas' },
  empurra4: { nome: 'Empurrão', desc: 'Empurra até 4 casas' },
  puxa2_atordoa1: { nome: 'Vácuo Sônico', desc: 'Puxa 2 adjacentes; Atordoa 1 turno' },
  puxa3: { nome: 'Laçada', desc: 'Puxa até 3 casas' },
  atordoa_semoveu: { nome: 'Apitaço', desc: 'Atordoa se moveu' },
  atordoa1: { nome: 'Atordoamento', desc: 'Atordoado 1 turno' },
  sangramento3: { nome: 'Sangramento', desc: '1 DMG/turno por 3 turnos', status: { tipo: 'sangramento', duracao: 3, danoPorTurno: 1 } },
  veneno_acumula: { nome: 'Veneno', desc: 'Acumula veneno (max 5 stacks)', status: { tipo: 'envenenamento', duracao: 5, danoPorTurno: 1, acumulavel: true } },
  cegueira1: { nome: 'Cegueira', desc: 'Cego por 1 turno', status: { tipo: 'cegueira', duracao: 1 } },
  cego2: { nome: 'Cegueira', desc: 'Cego por 2 turnos', status: { tipo: 'cegueira', duracao: 2 } },
  imobiliza1: { nome: 'Imobilização', desc: 'Imobilizado 1 turno', status: { tipo: 'imobilizacao', duracao: 1 } },
  imobiliza2: { nome: 'Imobilização', desc: 'Imobilizado 2 turnos', status: { tipo: 'imobilizacao', duracao: 2 } },
  enterrado2: { nome: 'Enterrado', desc: 'Enterrado 2 turnos', status: { tipo: 'imobilizacao', duracao: 2 } },
  esmagado1: { nome: 'Esmagado', desc: 'Esmagado 1 turno', status: { tipo: 'esmagado', duracao: 1 } },
  lentidao1: { nome: 'Lentidão', desc: 'Lento 1 turno', status: { tipo: 'lentidao', duracao: 1 } },
  medo2: { nome: 'Medo', desc: 'Medo 2 turnos', status: { tipo: 'medo', duracao: 2 } },
  queimadura_semcura: { nome: 'Queimadura', desc: 'Queimadura + bloqueia cura', status: { tipo: 'queimadura', duracao: 2, danoPorTurno: 2 } },
  mov3: { nome: 'Movimento', desc: 'Move-se 3 casas antes' },
  cura_adj: { nome: 'Cura', desc: 'Cura 2 HP de aliado' },
  cura3: { nome: 'Cura', desc: 'Cura 3 HP' },
  cura_propria: { nome: 'Auto-cura', desc: 'Restaura 5 HP. 1x/batalha.' },
  reanima: { nome: 'Reanimação', desc: 'Reanima aliado com 2 HP' },
  buff_time: { nome: 'Grito de Guerra', desc: '+3 ATQ e +1 MOV aliados' },
  sombra_chamariz: { nome: 'Sombra', desc: 'Cria chamariz por 1 turno' },
  ataque_duplo: { nome: 'Ataque Duplo', desc: 'Corpo + sombra atacam' },
  ricocheteia: { nome: 'Ricochete', desc: 'Ignora obstáculos' },
  area3: { nome: 'Área 3', desc: 'Atinge 3 casas' },
  mina_gelo: { nome: 'Minas', desc: 'Planta 4 minas de gelo' },
  reflexo: { nome: 'Reflexo', desc: '+2 DMG se atacado antes' },
  desvia40: { nome: 'Desvio', desc: '40% desviar ataques distância' },
  redireciona: { nome: 'Redirecionar', desc: 'Devolve ataque recebido' },
  nevoa_area: { nome: 'Névoa', desc: 'Névoa 3×3; precisão reduzida' },
  teleporta: { nome: 'Teleporte', desc: 'Teleporta para diagonal' },
  cicatriz: { nome: 'Cicatriz', desc: '+1 DMG por cicatriz' },
  perde3hp: { nome: 'Berserker', desc: 'Perde 3 HP ao usar' },
  trava_habilidade: { nome: 'Trava', desc: 'Desativa próximo especial' },
  ignora_def: { nome: 'Perfuração', desc: 'Ignora DEF' },
  meia_def: { nome: 'Precisão', desc: 'Ignora metade da DEF' },
  terreno_aliado: { nome: 'Terreno', desc: 'Aliados ignoram penalidade' },
  gelo_terreno: { nome: 'Gelo', desc: 'Casas viram gelo' },
}

/**
 * Calcula dano completo + aplica status
 */
export function resolverAtaque(atacante, defensor, skill, multElemental = 1.0) {
  // ── 1. Dano Bruto ──
  const danoBase = skill?.dano || 1
  const atqAtributos = atacante.atributos?.forca || 0
  const atqTotal = atqAtributos + danoBase * 3
  let danoBruto = Math.round(atqTotal * multElemental)

  // ── 2. Esquiva Perfeita (SOR/10 %) ──
  const esquivaPerfeita = (defensor.atributos?.tenacidade || 0) / 10
  if (Math.random() * 100 < esquivaPerfeita) {
    return { dano: 0, acertou: false, critico: false, missTipo: 'perfeita', status: null }
  }

  // ── 3. Precisão vs Esquiva ──
  const precisao = atacante.prec || calcPrecisao(atacante)
  const esquiva = defensor.esquiva || calcEsquiva(defensor)
  const chanceAcerto = Math.max(5, Math.min(100, precisao - esquiva))
  if (Math.random() * 100 > chanceAcerto) {
    return { dano: 0, acertou: false, critico: false, missTipo: 'normal', status: null }
  }

  // ── 4. Crítico (apenas físico) ──
  let critico = false
  let danoFinal = danoBruto
  if (skill?.tipo === 'fisico' || !skill?.tipo) {
    const chanceCrit = atacante.crit || calcCrit(atacante)
    if (Math.random() * 100 < chanceCrit) {
      danoFinal = Math.round(danoBruto * 1.4)
      critico = true
    }
  }

  // ── 5. DEF ──
  const defLeve = defensor.def_leve || calcDefLeve(defensor)
  const defPesada = defensor.def_pesada || calcDefPesada(defensor)
  const reducaoPesada = defPesada / (defPesada + 500)

  let danoPosDef = Math.max(0, danoFinal - defLeve)
  danoPosDef = Math.round(danoPosDef * (1 - reducaoPesada))

  if (skill?.fx === 'ignora_def') danoPosDef = danoFinal
  if (skill?.fx === 'meia_def') danoPosDef = Math.round(danoPosDef * 1.5)

  const danoAplicado = Math.max(1, danoPosDef)

  // ── 7. Status ──
  const fxInfo = skill?.fx ? FX_INFO[skill.fx] : null
  let status = null
  if (fxInfo?.status && fxInfo.status.tipo) {
    status = aplicarStatus(defensor, fxInfo.status)
  }

  return { dano: danoAplicado, acertou: true, critico, missTipo: null, status }
}

/**
 * Tenta aplicar um status no defensor. Retorna o status aplicado ou null.
 * Chance_aplicar = 100 - Tolerância_do_alvo (default 100%)
 * Duração_real = Duração_base - Redução
 */
export function aplicarStatus(defensor, statusBase) {
  const { tipo, duracao, danoPorTurno = 0, acumulavel = false } = statusBase
  const attrTol = STATUS_TOL[tipo]
  if (!attrTol) return null

  const tolerancia = defensor.atributos?.[attrTol] || 0
  const chanceAplicar = Math.max(0, 100 - tolerancia) // Tolerância reduz chance
  if (Math.random() * 100 >= chanceAplicar) return null

  // Duração: reduz pela metade da tolerância (cada 10 = -1 turno)
  const reducao = Math.floor(tolerancia / 10)
  const duracaoReal = Math.max(1, duracao - reducao)

  if (!defensor.status) defensor.status = []

  // Status acumuláveis (ex: veneno) podem ter múltiplas instâncias
  if (acumulavel) {
    const existente = defensor.status.find(s => s.tipo === tipo)
    if (existente) {
      existente.stacks = (existente.stacks || 1) + 1
      existente.duracao = Math.max(existente.duracao, duracaoReal)
      return existente
    }
    defensor.status.push({ tipo, duracao: duracaoReal, danoPorTurno, stacks: 1 })
  } else {
    // Substitui se já existir (renova duração)
    const existente = defensor.status.find(s => s.tipo === tipo)
    if (existente) {
      existente.duracao = Math.max(existente.duracao, duracaoReal)
      return existente
    }
    defensor.status.push({ tipo, duracao: duracaoReal, danoPorTurno })
  }

  return defensor.status[defensor.status.length - 1]
}

/**
 * Processa status no início do turno de um personagem
 * Retorna { danoTotal, statusRemovidos }
 */
export function processarStatus(personagem) {
  if (!personagem.status || personagem.status.length === 0) return { danoTotal: 0, statusRemovidos: [] }

  let danoTotal = 0
  const statusRemovidos = []

  personagem.status = personagem.status.filter(s => {
    // Dano por turno
    if (s.danoPorTurno) {
      const dano = s.danoPorTurno * (s.stacks || 1)
      danoTotal += dano
    }
    s.duracao--
    if (s.duracao <= 0) {
      statusRemovidos.push(s.tipo)
      return false
    }
    return true
  })

  if (danoTotal > 0) {
    personagem.hp = Math.max(0, personagem.hp - danoTotal)
  }

  return { danoTotal, statusRemovidos }
}

/** Verifica se personagem tem um status específico */
export function temStatus(personagem, tipo) {
  return personagem.status?.some(s => s.tipo === tipo) || false
}

/**
 * Retorna true se o personagem pode agir (não está atordoado/silenciado/etc)
 */
export function podeAgir(personagem) {
  return !temStatus(personagem, 'atordoamento')
}

export function podeMover(personagem) {
  return !temStatus(personagem, 'imobilizacao') && !temStatus(personagem, 'esmagado') && !temStatus(personagem, 'congelado')
}
