import { getGanguesProgression } from '../data/ganguesLoadout.js'
import { GANGUES_SPECIAL_PATHS, getGanguesSpecials } from '../data/ganguesSpecials.js'
import { getGanguesCharacter } from '../data/ganguesCharacters.js'

// Valores numéricos padrão da skill tree — ponto de partida pra testar e balancear, não é
// balanceamento final. Design detalhado do Atacante em
// src/pages/games/Gangues/GANGUES_PROGRESSAO_RASCUNHO.md; alguns mecanismos de duração/fila de turno
// descritos lá (Investida furar iniciativa, Marca/Fratura durarem N turnos, Fôlego Final dar
// ação extra) foram simplificados aqui pra caber no modelo atual de 1 ação por turno, sem fila
// de status — o efeito líquido (bônus/penalidade) foi mantido, o "como" foi simplificado.
// Defensor e Místico ganharam design por poder na revisão de jan/2027 (ver
// bloco "DEFENSOR e MÍSTICO" abaixo) — cada um tem efeito próprio, igual o
// Atacante já tinha.

const E = (type, values, cost = null) => ({ type, values, cost })

const GANGUES_SPECIAL_EFFECTS = {
  golpe_forcado: E('damage_flat', [1], { kind: 'pm', values: [2] }),
  guarda: E('shield_next_hit', [1], { kind: 'pm', values: [2] }),
  ruptura: E('reduce_target_defense', [1], { kind: 'pm', values: [2] }),
  // Bruto
  soco_de_ferro: E('damage_flat', [3, 5, 7], { kind: 'pm', values: [2, 2, 2] }),
  investida: E('bonus_if_target_fresh', [2, 3, 4], { kind: 'pm', values: [1, 1, 1] }),
  peso_bruto: E('atk_flat_if_pm_above_half', [1, 2, 3]),
  marreta: E('damage_flat', [2, 4, 6], { kind: 'pm', values: [2, 2, 1] }),
  fim_de_linha: E('damage_flat', [6, 9, 12], { kind: 'pm', values: [4, 4, 3] }),

  // Duelista
  golpe_certeiro: E('ignore_def_pct', [20, 30, 40], { kind: 'pm', values: [2, 2, 2] }),
  fluidez: E('damage_flat', [3, 5, 7], { kind: 'pm', values: [3, 3, 2] }),
  leitura_de_combate: E('ignore_def_pct', [10, 15, 20]),
  marca: E('damage_flat', [2, 3, 5], { kind: 'pm', values: [1, 1, 1] }),
  execucao: E('execute_bonus', [50, 70, 90], { kind: 'pm', values: [3, 3, 2] }),

  // Fúria
  sangue_fervente: E('low_pv_scale', [3, 5, 8]),
  grito_de_guerra: E('self_sacrifice_damage', [3, 5, 7], { kind: 'pv', values: [10, 10, 8] }),
  folego_final: E('low_pv_gate_bonus', [4, 6, 8], { kind: 'pm', values: [2, 1, 1] }),
  ignorar_a_dor: E('shield_next_hit', [2, 3, 4], { kind: 'pm', values: [1, 1, 1] }),
  ultima_investida: E('lifetime_pv_lost_nuke', [30, 50, 70], { kind: 'pm', values: [4, 4, 3] }),

  // Especialista
  precisao_absoluta: E('habilidade_full_convert', [2, 1, 0]),
  ponto_de_pressao: E('damage_flat', [3, 4, 6], { kind: 'pm', values: [2, 2, 1] }),
  fratura_de_ilusao: E('damage_flat', [3, 4, 5], { kind: 'pm', values: [2, 1, 1] }),
  foco_cirurgico: E('damage_flat', [2, 4, 6], { kind: 'pm', values: [1, 1, 1] }),
  colapso_mental: E('damage_flat', [5, 8, 11], { kind: 'pm', values: [3, 3, 2] }),

  // Vingador
  casca_dura: E('def_flat', [1, 2, 3]),
  absorver_impacto: E('charge_on_hit_taken', [1, 2, 3]),
  contragolpe: E('spend_charge_damage', [1, 2, 3], { kind: 'pm', values: [1, 1, 1] }),
  postura_firme: E('shield_next_hit', [2, 3, 4], { kind: 'pm', values: [2, 1, 1] }),
  retribuicao_final: E('lifetime_pv_lost_nuke', [30, 50, 70], { kind: 'pm', values: [4, 4, 3] }),

  // ══════════════════════════════════════════════════════════════
  // DEFENSOR e MÍSTICO — design por poder (pedido do Isaias: "hoje só o
  // Atacante tem poder desenhado, o resto cai no genérico"). Reaproveita os
  // MESMOS tipos de efeito que o motor já sabe resolver (não inventa
  // mecânica nova sem testar o resolver) — a diferença de personagem pra
  // personagem, subcaminho pra subcaminho, é o TIPO escolhido + o valor/custo
  // tunado pra identidade daquele poder, não mais "os 2 mesmos efeitos genéricos
  // repetidos pra archetype inteiro".
  // ══════════════════════════════════════════════════════════════

  // Defensor · Muralha (Muro/Concreto) — parede pura, def_flat em camadas +
  // um escudo de verdade no ápice.
  pele_de_aco: E('def_flat', [2, 3, 4]),
  casco_robusto: E('def_flat', [2, 3, 5]),
  bastiao: E('charge_on_hit_taken', [1, 1, 2]),
  postura_defensiva: E('damage_reduction_next_hit', [3, 4, 6], { kind: 'pm', values: [2, 1, 1] }),
  muralha_impenetravel: E('damage_reduction_next_hit', [6, 9, 12], { kind: 'pm', values: [3, 3, 2] }),

  // Defensor · Guardião (Guarda/Ombro) — protege o time, escudo maior e mais
  // barato que a Muralha (é reativo aos outros, não só a si).
  escudo_humano: E('def_flat', [2, 3, 4]),
  cobertura: E('def_flat', [1, 2, 4]),
  ultimo_bastiao: E('def_flat', [3, 4, 6]),
  guarda_compartilhada: E('damage_reduction_next_hit', [3, 5, 7], { kind: 'pm', values: [2, 2, 1] }),
  interceptar: E('damage_reduction_next_hit', [2, 4, 6], { kind: 'pm', values: [1, 1, 1] }),

  // Defensor · Provocador (Boca/Isca) — abre a guarda do alvo (reduce_target_defense),
  // não a própria — a graça é fazer o outro bandido errar.
  voz_de_comando: E('def_flat', [1, 2, 3]),
  casca_de_rua: E('def_flat', [2, 3, 4]),
  centro_das_atencoes: E('charge_on_hit_taken', [1, 2, 2]),
  provocacao: E('reduce_target_defense', [2, 3, 5], { kind: 'pm', values: [1, 1, 1] }),
  marcar_alvo: E('reduce_target_defense', [3, 4, 6], { kind: 'pm', values: [2, 1, 1] }),

  // Defensor · Reativo (Catraca/Rebote) — mesma lógica do Vingador (carrega
  // ao apanhar, descarrega no contra-golpe), só que o passivo carrega mais
  // rápido (é a identidade "reflexo automático").
  reflexo_defensivo: E('charge_on_hit_taken', [1, 2, 3]),
  resposta_automatica: E('charge_on_hit_taken', [2, 2, 3]),
  retorno_de_impacto: E('def_flat', [1, 2, 3]),
  aparar: E('spend_charge_damage', [1, 2, 3], { kind: 'pm', values: [1, 1, 1] }),
  contragolpe_defensivo: E('spend_charge_damage', [2, 3, 4], { kind: 'pm', values: [2, 1, 1] }),

  // Defensor · Resiliente (Ferro/Osso) — o corpo que não cai; passivos de
  // parede pura + ativos que só ligam quando a vida tá crítica (desespero
  // vira força, não é escudo).
  carne_dura: E('def_flat', [2, 3, 5]),
  firme_no_chao: E('def_flat', [1, 2, 3]),
  inquebravel: E('def_flat', [3, 4, 6]),
  segunda_respiracao: E('low_pv_gate_bonus', [4, 6, 9], { kind: 'pm', values: [2, 1, 1] }),
  recusar_queda: E('low_pv_gate_bonus', [3, 5, 7], { kind: 'pm', values: [1, 1, 1] }),

  // Místico · Ígneo (Brasa/Cinza) — fogo que queima através da guarda.
  bola_de_fogo: E('damage_flat', [3, 5, 7], { kind: 'pm', values: [2, 2, 1] }),
  combustao: E('damage_flat', [4, 6, 8], { kind: 'pm', values: [2, 2, 1] }),
  brasa_viva: E('atk_flat', [1, 2, 3]),
  explosao_termica: E('ignore_def_pct', [20, 30, 40], { kind: 'pm', values: [2, 2, 2] }),
  inferno_de_rua: E('damage_flat', [6, 9, 13], { kind: 'pm', values: [4, 3, 3] }),

  // Místico · Aquático (Maré/Chuva) — fluxo que abre brecha na guarda alheia
  // em vez de reforçar a própria (a "cura" fluxo_restaurador virou um escudo
  // reforçado — o motor não tem cura de poder ainda, ver nota no fim do arquivo).
  correnteza: E('def_flat', [1, 2, 3]),
  neblina: E('reduce_target_defense', [2, 3, 5], { kind: 'pm', values: [1, 1, 1] }),
  jato_pressurizado: E('reduce_target_defense', [3, 4, 6], { kind: 'pm', values: [2, 1, 1] }),
  fluxo_restaurador: E('damage_reduction_next_hit', [4, 6, 8], { kind: 'pm', values: [2, 2, 1] }),
  mare_alta: E('damage_flat', [6, 9, 12], { kind: 'pm', values: [4, 3, 3] }),

  // Místico · Terreno (Raiz/Racha) — prende o alvo no chão (reduce_target_defense)
  // e estilhaça (damage_flat/ignore_def_pct) — peso e ruptura, não velocidade.
  pele_de_pedra: E('def_flat', [2, 3, 5]),
  raiz_prendente: E('reduce_target_defense', [3, 4, 6], { kind: 'pm', values: [2, 1, 1] }),
  tremor: E('damage_flat', [3, 5, 7], { kind: 'pm', values: [2, 2, 1] }),
  estilhaco_terrestre: E('damage_flat', [4, 6, 8], { kind: 'pm', values: [2, 2, 1] }),
  ruptura_do_solo: E('ignore_def_pct', [25, 35, 50], { kind: 'pm', values: [3, 3, 2] }),

  // Místico · Tempestade (Faísca/Trovão) — velocidade: golpeia antes do
  // alvo se recompor (bonus_if_target_fresh) e no topo ignora blindagem de vez.
  raio_curto: E('bonus_if_target_fresh', [2, 3, 5], { kind: 'pm', values: [1, 1, 1] }),
  cadeia_de_raios: E('bonus_if_target_fresh', [3, 5, 7], { kind: 'pm', values: [2, 2, 1] }),
  eletricidade_estatica: E('atk_flat', [1, 2, 3]),
  passo_eletrico: E('bonus_if_target_fresh', [3, 4, 6], { kind: 'pm', values: [2, 1, 1] }),
  tempestade_total: E('ignore_def_pct', [30, 40, 55], { kind: 'pm', values: [4, 3, 3] }),

  // Místico · Ilusório (Névoa/Espelho) — engana em vez de bloquear: escudo
  // fake absorve o golpe, distorção quebra a guarda alheia, e no topo
  // executa quem já tá desnorteado (execute_bonus).
  mente_nebulosa: E('def_flat', [1, 2, 3]),
  reflexo_falso: E('shield_next_hit', [3, 5, 7], { kind: 'pm', values: [2, 2, 1] }),
  duplo_ilusorio: E('shield_next_hit', [4, 6, 8], { kind: 'pm', values: [2, 2, 1] }),
  distorcao: E('reduce_target_defense', [3, 4, 6], { kind: 'pm', values: [2, 1, 1] }),
  quebra_de_realidade: E('execute_bonus', [40, 55, 75], { kind: 'pm', values: [3, 3, 2] }),

  // ══════════════════════════════════════════════════════════════
  // 6º PODER — 1 por personagem, NV 50 (pedido do Isaias: "aumentar a lista
  // de poderes"). Cada um pensado pro personagem específico, não copiado do
  // par do mesmo subcaminho (mesmo Trinca/Marreta, que dividem os 4 poderes
  // de sempre, ganham um 6º DIFERENTE um do outro aqui).
  // ══════════════════════════════════════════════════════════════
  avalanche_de_socos: E('damage_flat', [4, 7, 10], { kind: 'pm', values: [3, 3, 2] }), // Trinca
  britadeira: E('damage_flat', [5, 8, 11], { kind: 'pm', values: [3, 3, 2] }), // Marreta
  corte_preciso: E('ignore_def_pct', [30, 45, 60], { kind: 'pm', values: [2, 2, 2] }), // Fenda
  danca_da_lamina: E('bonus_if_target_fresh', [4, 6, 8], { kind: 'pm', values: [2, 1, 1] }), // Navalha
  furia_cega: E('low_pv_scale', [5, 8, 12], { kind: 'pm', values: [2, 2, 1] }), // Touro
  instinto_de_sangue: E('low_pv_scale', [5, 8, 12], { kind: 'pm', values: [2, 2, 1] }), // Sangue
  tiro_certeiro: E('execute_bonus', [45, 60, 80], { kind: 'pm', values: [2, 2, 1] }), // Mira
  ponto_fatal: E('execute_bonus', [40, 55, 75], { kind: 'pm', values: [2, 2, 1] }), // Ponto
  marca_de_guerra: E('def_flat', [2, 3, 4]), // Cicatriz
  juro_composto: E('spend_charge_damage', [2, 3, 5], { kind: 'pm', values: [2, 1, 1] }), // Troco
  linha_de_frente: E('def_flat', [2, 3, 4]), // Muro
  fundacao: E('def_flat', [2, 3, 4]), // Concreto
  escudo_vivo: E('damage_reduction_next_hit', [5, 7, 9], { kind: 'pm', values: [2, 2, 1] }), // Guarda
  no_meu_ombro: E('damage_reduction_next_hit', [5, 7, 9], { kind: 'pm', values: [2, 2, 1] }), // Ombro
  grito_de_rua: E('reduce_target_defense', [4, 5, 7], { kind: 'pm', values: [2, 1, 1] }), // Boca
  alvo_facil: E('reduce_target_defense', [4, 5, 7], { kind: 'pm', values: [2, 1, 1] }), // Isca
  giro_de_catraca: E('spend_charge_damage', [2, 3, 5], { kind: 'pm', values: [2, 1, 1] }), // Catraca
  efeito_bumerangue: E('spend_charge_damage', [2, 3, 5], { kind: 'pm', values: [2, 1, 1] }), // Rebote
  pele_de_ferro: E('def_flat', [3, 4, 5]), // Ferro
  osso_duro: E('def_flat', [3, 4, 5]), // Osso
  chama_eterna: E('damage_flat', [5, 7, 10], { kind: 'pm', values: [3, 2, 2] }), // Brasa
  cinzas_ao_vento: E('atk_flat', [2, 3, 4]), // Cinza
  onda_de_choque: E('damage_flat', [5, 7, 10], { kind: 'pm', values: [3, 2, 2] }), // Maré
  temporal: E('reduce_target_defense', [4, 5, 7], { kind: 'pm', values: [2, 1, 1] }), // Chuva
  raizes_profundas: E('def_flat', [3, 4, 5]), // Raiz
  fenda_no_chao: E('damage_flat', [5, 7, 10], { kind: 'pm', values: [3, 2, 2] }), // Racha
  descarga: E('bonus_if_target_fresh', [4, 6, 8], { kind: 'pm', values: [2, 1, 1] }), // Faísca
  trovoada: E('ignore_def_pct', [30, 45, 60], { kind: 'pm', values: [2, 2, 2] }), // Trovão
  veu_de_nevoa: E('def_flat', [3, 4, 5]), // Névoa
  espelho_quebrado: E('shield_next_hit', [5, 7, 9], { kind: 'pm', values: [2, 2, 1] }), // Espelho
}

const KIND_BY_ID = {}
const PATH_BY_ID = {}
for (const [combatPath, paths] of Object.entries(GANGUES_SPECIAL_PATHS)) {
  for (const item of paths) for (const special of item.specials) { KIND_BY_ID[special.id] = special.kind; PATH_BY_ID[special.id] = combatPath }
}

// Defensor e Místico ganharam design por poder (revisão jan/2027, ver bloco
// acima) — esta função genérica agora só serve de REDE DE SEGURANÇA pra um id
// novo que ainda não ganhou entrada própria (nunca deveria disparar em
// produção pros 30 personagens do catálogo).
function genericEffect(id) {
  const kind = KIND_BY_ID[id]
  const combatPath = PATH_BY_ID[id]
  if (combatPath === 'defensor') return kind === 'passive' ? E('def_flat', [1, 2, 3]) : E('damage_reduction_next_hit', [2, 3, 4], { kind: 'pm', values: [2, 2, 1] })
  if (combatPath === 'mistico') return kind === 'passive' ? E('atk_flat', [1, 2, 3]) : E('damage_flat', [3, 5, 7], { kind: 'pm', values: [2, 2, 2] })
  return E('damage_flat', [2, 3, 4], { kind: 'pm', values: [1, 1, 1] })
}

export function getGanguesSpecialEffect(id) {
  return GANGUES_SPECIAL_EFFECTS[id] || genericEffect(id)
}

/** Descrição do que o poder faz, gerada do efeito real (não do design intent) — o texto
 *  vem do i18n `games.gangues.skill_desc.<type>` com {v} interpolado pelo nível.
 *  Usado nas fichas (grade de poderes com toque pra ver o que faz). */
export function describeGanguesSpecialEffect(t, id, level = 1) {
  const effect = getGanguesSpecialEffect(id)
  const values = effect.values || []
  const v = values[Math.max(0, Math.min(values.length - 1, level - 1))]
  const key = `games.gangues.skill_desc.${effect.type}`
  const txt = t(key, { v })
  return txt === key ? '' : txt
}

/** Custo do poder (texto localizado) no nível dado. Passivo / base sem custo → string de "sem custo". */
export function describeGanguesSpecialCost(t, id, level = 1) {
  const effect = getGanguesSpecialEffect(id)
  if (!effect.cost) return t('games.gangues.skill_info.sem_custo')
  const c = effect.cost.values[Math.max(0, Math.min(effect.cost.values.length - 1, level - 1))]
  return effect.cost.kind === 'pv' ? t('games.gangues.skill_info.custo_pv', { c }) : t('games.gangues.skill_info.custo_pm', { c })
}

// Monta a lista de efeitos que valem nesta resolução: todos os passivos equipados + a ativa
// escolhida pelo jogador (se equipada, com nível > 0 e custo pagável). `activeSpecialId` só
// importa pro lado atacante — quem defende nunca "escolhe" usar uma ativa.
export function buildGanguesEffectsList(member, activeSpecialId = null) {
  const progression = getGanguesProgression(member)
  const specials = getGanguesSpecials(member)
  const equippedIds = progression.selected_specials || []
  const list = []
  const baseTechnique = getGanguesCharacter(member.character_template_id)?.base_technique
  if (baseTechnique?.id === activeSpecialId && (member.pm || 0) >= baseTechnique.pm_cost) {
    list.push({ id: baseTechnique.id, kind: 'active', level: 1, effect: getGanguesSpecialEffect(baseTechnique.id) })
  }
  for (const id of equippedIds) {
    const level = progression.special_levels[id] || 0
    if (level <= 0) continue
    const spec = specials.find(item => item.id === id)
    if (!spec) continue
    const effect = getGanguesSpecialEffect(id)
    if (spec.kind === 'active') {
      if (id !== activeSpecialId) continue
      if (effect.cost) {
        const cost = effect.cost.values[level - 1]
        if (effect.cost.kind === 'pm' && (member.pm || 0) < cost) continue
        if (effect.cost.kind === 'pv' && (member.pv || 0) <= 1) continue
      }
      list.push({ id, kind: 'active', level, effect })
    } else {
      list.push({ id, kind: 'passive', level, effect })
    }
  }
  return list
}

// Lista os poderes ativos equipados (nível > 0) do personagem, pra montar os botões de ação em
// combate — inclui mesmo os que ele não tem recurso pra pagar agora (o chamador decide como
// desabilitar visualmente).
export function getEquippedActiveGanguesSpecials(member) {
  const progression = getGanguesProgression(member)
  const specials = getGanguesSpecials(member)
  const equippedIds = progression.selected_specials || []
  const equipped = equippedIds
    .map(id => {
      const level = progression.special_levels[id] || 0
      const spec = specials.find(item => item.id === id)
      if (!spec || spec.kind !== 'active' || level <= 0) return null
      return { id, level, effect: getGanguesSpecialEffect(id) }
    })
    .filter(Boolean)
  const baseTechnique = getGanguesCharacter(member.character_template_id)?.base_technique
  if (baseTechnique) equipped.unshift({ id: baseTechnique.id, level: 1, effect: getGanguesSpecialEffect(baseTechnique.id) })
  return equipped
}

export function applyGanguesAttackerEffect(item, ctx) {
  const { effect, level } = item
  const v = effect.values[level - 1]
  switch (effect.type) {
    case 'atk_flat':
    case 'damage_flat':
      ctx.faMod += v; break
    case 'atk_flat_if_pm_above_half':
      if ((ctx.attacker.pm || 0) > (ctx.attacker.pmMax || 0) / 2) ctx.faMod += v
      break
    case 'low_pv_scale': {
      const ratio = 1 - (ctx.attacker.pv || 0) / Math.max(1, ctx.attacker.pvMax || 1)
      ctx.faMod += Math.round(v * ratio)
      break
    }
    case 'habilidade_full_convert': {
      const habilidade = Number(ctx.attacker.attributes?.H) || 0
      ctx.faMod += Math.ceil(habilidade / 2) - v
      break
    }
    case 'ignore_def_pct':
      ctx.ignoreDefPct = Math.max(ctx.ignoreDefPct, v); break
    case 'reduce_target_defense':
      ctx.targetDefenseReduction = Math.max(ctx.targetDefenseReduction || 0, v); break
    case 'bonus_if_target_fresh':
      if (!ctx.target.actedThisRound) ctx.faMod += v
      break
    case 'execute_bonus':
      if ((ctx.target.pv || 0) / Math.max(1, ctx.target.pvMax || 1) <= 0.3) { ctx.ignoreDefPct = Math.max(ctx.ignoreDefPct, v); ctx.faMod += 2 }
      break
    case 'self_sacrifice_damage':
      ctx.faMod += v; break
    case 'low_pv_gate_bonus':
      if ((ctx.attacker.pv || 0) / Math.max(1, ctx.attacker.pvMax || 1) <= 0.3) ctx.faMod += v
      break
    case 'shield_next_hit':
    case 'damage_reduction_next_hit':
      ctx.selfShieldSet = v; break
    case 'lifetime_pv_lost_nuke':
      ctx.faMod += Math.round((ctx.attacker.specialState?.totalPvLost || 0) * (v / 100))
      break
    case 'spend_charge_damage': {
      const charge = ctx.attacker.specialState?.charge || 0
      ctx.faMod += charge * v
      ctx.chargeSpent = charge
      break
    }
    default: break
  }
  if (item.kind === 'active' && effect.cost) {
    const cost = effect.cost.values[level - 1]
    if (effect.cost.kind === 'pm') ctx.pmCost = cost
    if (effect.cost.kind === 'pv') ctx.pvCostPct = cost
  }
}

export function applyGanguesDefenderEffect(item, ctx) {
  const { effect, level } = item
  const v = effect.values[level - 1]
  switch (effect.type) {
    case 'def_flat': ctx.fdMod += v; break
    case 'charge_on_hit_taken': ctx.chargeGain += v; break
    default: break
  }
}
