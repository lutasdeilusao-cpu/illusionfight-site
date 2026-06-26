/**
 * Combat engine — LDI Arena Testbed
 * Exatamente conforme GDD v0.1
 */

/**
 * Calcula FA (Força de Ataque)
 * @param {object} attacker - { forca, agi, dex, pdf, res, arm, tipoAtaque, equipamento }
 * @param {boolean} isCritico - se o d6 do atacante foi 6
 * @param {number} distancia - cells de distância do alvo (1 = adjacente)
 * @returns {number} FA final
 */
export function calcularFA(attacker, isCritico = false, distancia = 1, d6Atk = 1) {
  const dexEfetiva = isCritico ? attacker.dex : attacker.dex * 0.25
  let fa

  if (attacker.tipoAtaque === 'melee') {
    fa = attacker.forca + dexEfetiva + d6Atk
  } else {
    // Distância: FA = (PDF - 1) + (DEX × 0.25) + d6
    fa = (attacker.pdf - 1) + dexEfetiva + d6Atk
  }

  // Equipamento ofensivo
  if (attacker.equipamento === 'ofensivo' || attacker.equipamento === 'ambos') {
    fa += 2
  }

  return Math.max(0, Math.round(fa * 10) / 10)
}

/**
 * Calcula FD (Força de Defesa)
 * @param {object} defender - { forca, agi, dex, pdf, res, arm, equipamento }
 * @param {boolean} isCriticoDef - se o d6 do defensor foi 6
 * @returns {number} FD final
 */
export function calcularFD(defender, isCriticoDef = false, d6Def = 1) {
  const agiEfetiva = isCriticoDef ? defender.agi : defender.agi * 0.25
  let fd = defender.arm + agiEfetiva + d6Def

  // Equipamento defensivo
  if (defender.equipamento === 'defensivo' || defender.equipamento === 'ambos') {
    fd += 2
  }

  return Math.max(0, Math.round(fd * 10) / 10)
}

/**
 * Resolve um ataque completo
 * @returns {{ dano: number, criticoOfensivo: boolean, criticoDefensivo: boolean,
 *            fa: number, fd: number, d6Atk: number, d6Def: number,
 *            ataqueExtra: boolean, contraAtaque: object|null,
 *            log: string[] }}
 */
export function resolverAtaque(atacante, defensor, distancia = 1) {
  const logs = []
  const d6Atk = rolarD6()
  const d6Def = rolarD6()

  const isCriticoOfensivo = d6Atk === 6
  const isCriticoDefensivo = d6Def === 6

  const fa = calcularFA(atacante, isCriticoOfensivo, distancia, d6Atk)
  const fd = calcularFD(defensor, isCriticoDefensivo, d6Def)

  logs.push(`FA = ${fa} (${atacante.tipoAtaque === 'melee' ? `FOR=${atacante.forca}` : `PDF=${atacante.pdf}`}, DEX=${atacante.dex}, d6=${d6Atk}${isCriticoOfensivo ? ' [CRÍTICO OFENSIVO]' : ''})`)
  logs.push(`FD = ${fd} (ARM=${defensor.arm}, AGI=${defensor.agi}, d6=${d6Def}${isCriticoDefensivo ? ' [CRÍTICO DEFENSIVO]' : ''})`)

  let dano
  let contraAtaque = null
  let ataqueExtra = false

  if (isCriticoDefensivo) {
    dano = 0
    logs.push('CRÍTICO DEFENSIVO! Dano anulado. Contra-ataque concedido.')

    // Contra-ataque com FA/2
    const faContra = Math.round((fa / 2) * 10) / 10
    logs.push(`Contra-ataque FA = ${faContra}`)
    contraAtaque = {
      fa: faContra,
      // a fd do contra-ataque precisa de novo d6
      fd: calcularFD(atacante, false, rolarD6()),
    }
  } else {
    let danoBruto = Math.max(0, Math.round((fa - fd) * 10) / 10)

    // Redução de distância aplicada no dano bruto
    if (atacante.tipoAtaque === 'distancia') {
      if (distancia === 2) {
        danoBruto = Math.round(danoBruto * 0.75 * 10) / 10
        logs.push(`Redução de distância (75%): dano bruto → ${danoBruto}`)
      } else if (distancia >= 3) {
        danoBruto = Math.round(danoBruto * 0.5 * 10) / 10
        logs.push(`Redução de distância (50%): dano bruto → ${danoBruto}`)
      }
    }

    dano = Math.max(1, Math.round(danoBruto))
    logs.push(`Dano bruto: ${danoBruto} → dano final: ${dano}`)

    // Ataque extra: AGI atacante > 2× AGI defensor
    if (atacante.agi > defensor.agi * 2) {
      ataqueExtra = true
      const faExtra = Math.round((fa / 2) * 10) / 10
      logs.push(`ATAQUE EXTRA! AGI ${atacante.agi} > 2× ${defensor.agi}. FA/2 = ${faExtra}`)
    }
  }

  return {
    dano,
    criticoOfensivo: isCriticoOfensivo,
    criticoDefensivo: isCriticoDefensivo,
    fa,
    fd,
    d6Atk,
    d6Def,
    ataqueExtra,
    contraAtaque,
    logs,
  }
}

/**
 * Resolve contra-ataque (após crítico defensivo)
 */
export function resolverContraAtaque(defensorOriginal, atacanteOriginal, faContra) {
  const d6Def = rolarD6()
  const isCritico = d6Def === 6
  const fd = calcularFD(atacanteOriginal, isCritico, d6Def)

  const logs = []
  logs.push(`Contra-ataque: FA = ${faContra}`)
  logs.push(`FD do alvo = ${fd} (ARM=${atacanteOriginal.arm}, AGI=${atacanteOriginal.agi}, d6=${d6Def})`)

  let dano
  if (isCritico) {
    dano = 0
    logs.push('Crítico defensivo no contra-ataque! Dano anulado.')
  } else {
    dano = Math.max(1, Math.round(faContra - fd))
    logs.push(`Dano do contra-ataque: ${dano}`)
  }

  return { dano, fd, d6Def, logs }
}

/**
 * Rolagem de d6
 */
export function rolarD6() {
  return Math.floor(Math.random() * 6) + 1
}

/**
 * Calcula casas de movimento baseado em AGI
 * @param {number} agi - valor de AGI
 * @param {boolean} [agiUmPraUm=false] - se true, 1 AGI = 1 casa de movimento
 */
export function getCasasMovimento(agi, agiUmPraUm = false) {
  if (agiUmPraUm) return Math.max(1, agi)
  if (agi <= 2) return 1
  if (agi <= 5) return 2
  if (agi <= 8) return 3
  return 4
}

/**
 * Calcula HP baseado em RES
 * Base: cada ponto de RES = 10 HP. RES 1 = 10, RES 2 = 20, etc.
 */
export function getHP(res) {
  return res * 10
}

/**
 * Calcula MP baseado em RES
 * Base: cada ponto de RES = 10 MP. RES 1 = 10, RES 2 = 20, etc.
 */
export function getMP(res) {
  return res * 10
}

/**
 * Chance de acerto baseado em DEX atacante vs AGI defensor
 */
export function getChanceAcerto(dexAtk, agiDef) {
  if (dexAtk > agiDef) return 1.0
  if (agiDef <= 2) return 0.9
  if (agiDef === 3) return 0.8
  if (agiDef === 4) return 0.7
  if (agiDef === 5) return 0.6
  if (agiDef === 6) return 0.5
  if (agiDef === 7) return 0.4
  return 0.3
}

/**
 * Cria um personagem com stats calculados automaticamente
 */
export function criarPersonagem(nome, time, tipoAtaque, forca, agi, dex, pdf, res, arm, equipamento, hpPotion = 0, mpPotion = 0) {
  const hp = getHP(res)
  const mp = getMP(res)
  return {
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    nome,
    time, // 'jogador' | 'ia'
    tipoAtaque, // 'melee' | 'distancia'
    forca: tipoAtaque === 'distancia' ? 1 : forca,
    agi,
    dex,
    pdf: tipoAtaque === 'melee' ? 0 : pdf,
    res,
    arm,
    equipamento,
    hpMax: hp,
    hp,
    mpMax: mp,
    mp,
    inventario: {
      pocaoHP: hpPotion,
      pocaoMP: mpPotion,
    },
    casasMovimento: getCasasMovimento(agi),
    vivo: true,
    posicao: null, // { row, col }
  }
}
