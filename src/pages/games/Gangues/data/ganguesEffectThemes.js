import { GANGUES_SPECIAL_PATHS } from './ganguesSpecials.js'

// Efeito visual por PODER usado em combate (DramaticDice) — em vez de tratar
// os 75 poderes um por um (inviável escrever à mão de uma vez), cada um
// herda o visual do seu ARQUÉTIPO (special_path): todo poder de "furia" é
// vermelho-sangue agressivo, todo poder "aquatico" é azul líquido, etc. 15
// arquétipos (5 por caminho) + o soco comum (sem tema, visual genérico de
// sempre) já dá variedade real — bem diferente de todo poder parecendo
// idêntico ao soquinho, que era a reclamação original.
const T = (rgb, glyphs, particleCount = 8) => ({ rgb, glyphs, particleCount })

export const GANGUES_EFFECT_THEMES = {
  // Atacante
  bruto: T('255,138,61', ['💥', '🔨'], 10),
  duelista: T('255,77,109', ['⚔️', '✂️'], 8),
  furia: T('215,38,61', ['🔥', '💢'], 12),
  especialista: T('61,214,255', ['🎯', '✦'], 6),
  vingador: T('176,107,255', ['🛡️', '↩️'], 8),
  // Defensor
  muralha: T('154,165,173', ['🧱', '🛡️'], 6),
  guardiao: T('45,212,191', ['🛡️', '✦'], 6),
  provocador: T('245,197,66', ['❗', '😤'], 8),
  reativo: T('220,220,220', ['⚡', '↺'], 8),
  resiliente: T('126,217,87', ['💚', '✦'], 8),
  // Místico (o special_path já É o elemento aqui)
  igneo: T('255,90,31', ['🔥', '🌋'], 12),
  aquatico: T('46,160,255', ['💧', '🌊'], 10),
  terreno: T('138,109,59', ['🪨', '🌱'], 8),
  tempestade: T('201,168,255', ['⚡', '🌀'], 10),
  ilusorio: T('123,47,255', ['👁️', '🌫️'], 8),
  // Técnicas base (golpe_forcado/guarda/ruptura) — as três SEMPRE equipadas,
  // uma por caminho, não são "poder de nível" como os 75 de cima. Pedido
  // explícito: mesmo efeito simples pras três classes (não emprestar visual
  // de arquétipo nenhum), só pra dar uma diferença clara entre soco comum e
  // "usei o poder inicial" — sem competir com os poderes de verdade.
  basico: T('255,241,199', ['✨'], 6),
}

const BASE_TECHNIQUE_THEME = { golpe_forcado: 'basico', guarda: 'basico', ruptura: 'basico' }

let specialIdToTheme = null
function buildSpecialIdToTheme() {
  if (specialIdToTheme) return specialIdToTheme
  specialIdToTheme = { ...BASE_TECHNIQUE_THEME }
  for (const paths of Object.values(GANGUES_SPECIAL_PATHS)) {
    for (const p of paths) {
      for (const s of p.specials) specialIdToTheme[s.id] = p.id
    }
  }
  return specialIdToTheme
}

/** Tema visual pro poder `specialId`, ou null (soco comum → visual genérico). */
export function getGanguesEffectTheme(specialId) {
  if (!specialId) return null
  const themeId = buildSpecialIdToTheme()[specialId]
  return themeId ? GANGUES_EFFECT_THEMES[themeId] : null
}
