/**
 * LDI TACTICS — Sistema de Combate v1
 * Sequência de resolução (seção 12 do documento):
 * 1. Dano Bruto
 * 2. Esquiva Perfeita → MISS
 * 3. Precisão vs Esquiva → MISS
 * 4. Crítico (físico): ×1.4
 * 5. DEF leve (subtração) + DEF pesada (%)
 * 6. Aplicar HP
 */

/**
 * Calcula dano completo seguindo a sequência de resolução
 * @param {Object} atacante - Personagem atacando (com atributos, skills)
 * @param {Object} defensor - Personagem sendo atacado
 * @param {Object} skill - Habilidade usada
 * @param {number} multElemental - Multiplicador elemental (1.0, 1.25, 0.75)
 * @returns {{ dano: number, acertou: boolean, critico: boolean, missTipo: string }}
 */
export function resolverAtaque(atacante, defensor, skill, multElemental = 1.0) {
  // ── 1. Dano Bruto ──
  const danoBase = skill?.dano || 1
  const atqAtributos = atacante.atributos?.forca || 0
  const atqTotal = atqAtributos + danoBase * 3 // escala: DMG 1-10 vira 3-30
  let danoBruto = Math.round(atqTotal * multElemental)

  // ── 2. Esquiva Perfeita (SOR/10 %) ──
  const esquivaPerfeita = (defensor.atributos?.tenacidade || 0) / 10
  if (Math.random() * 100 < esquivaPerfeita) {
    return { dano: 0, acertou: false, critico: false, missTipo: 'perfeita' }
  }

  // ── 3. Precisão vs Esquiva ──
  const precisao = atacante.prec || calcPrecisao(atacante)
  const esquiva = defensor.esquiva || calcEsquiva(defensor)
  const chanceAcerto = Math.max(5, Math.min(100, precisao - esquiva))
  if (Math.random() * 100 > chanceAcerto) {
    return { dano: 0, acertou: false, critico: false, missTipo: 'normal' }
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

  // Se skill ignora DEF
  if (skill?.fx === 'ignora_def') {
    danoPosDef = danoFinal
  }
  // Se skill ignora metade da DEF
  if (skill?.fx === 'meia_def') {
    danoPosDef = Math.round(danoPosDef * 1.5)
  }

  // ── 6. Aplicar ──
  const danoAplicado = Math.max(1, danoPosDef) // mínimo 1 de dano

  return { dano: danoAplicado, acertou: true, critico, missTipo: null }
}

// ── Helpers de cálculo ──

export function calcPrecisao(p) {
  const des = p.atributos?.precisao || 0
  const sor = p.atributos?.tenacidade || 0
  return 24 + des + Math.floor(sor / 3)
}

export function calcEsquiva(p) {
  const agi = p.atributos?.velocidade || 0
  const sor = p.atributos?.tenacidade || 0
  return agi + Math.floor(sor / 5)
}

export function calcDefLeve(p) {
  const vit = p.atributos?.resistencia || 0
  const agi = p.atributos?.velocidade || 0
  return Math.floor(vit * 0.5 + agi * 0.2)
}

export function calcDefPesada(p) {
  const vit = p.atributos?.resistencia || 0
  return 50 + vit * 3
}

export function calcCrit(p) {
  const sor = p.atributos?.tenacidade || 0
  return Math.floor(sor * 0.3)
}
