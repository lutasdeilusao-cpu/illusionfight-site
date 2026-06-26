/**
 * ARENA TÁTICA — Inimigos por Tier
 * IA usa greedy: foca no alvo com menos HP, usa skill mais forte disponível
 */

export const ENEMIES_BY_TIER = {
  1: [
    { nome: 'Capanga de Rua', classe: 'karuak', nivel: 1, hp: 40, energia: 8, elemental: 'fogo', skills: ['soco_pesado'], recompensa_sdr: 10 },
    { nome: 'Ladrão Ágil', classe: 'moraki', nivel: 1, hp: 30, energia: 10, elemental: 'vento', skills: ['soco_vento'], recompensa_sdr: 10 },
  ],
  2: [
    { nome: 'Segurança Privado', classe: 'karuak', nivel: 3, hp: 60, energia: 12, elemental: 'metal', skills: ['soco_pesado', 'postura_defensiva'], recompensa_sdr: 20 },
    { nome: 'Mensageiro da Noite', classe: 'nami', nivel: 3, hp: 45, energia: 14, elemental: 'sombra', skills: ['adaga_rapida', 'rolamento_acrobatico'], recompensa_sdr: 20 },
  ],
  3: [
    { nome: 'Caçador de Recompensas', classe: 'tivara', nivel: 5, hp: 55, energia: 18, elemental: 'natureza', skills: ['flecha_certeira', 'marca_cacador'], recompensa_sdr: 35 },
    { nome: 'Monge do Fogo', classe: 'moraki', nivel: 5, hp: 50, energia: 20, elemental: 'fogo', skills: ['soco_vento', 'rajada_ciclonica'], recompensa_sdr: 35 },
  ],
  4: [
    { nome: 'Executor de Kronos', classe: 'ignis', nivel: 8, hp: 70, energia: 25, elemental: 'trevas', skills: ['bola_fogo', 'explosao', 'chama_rapida'], recompensa_sdr: 50 },
    { nome: 'Xamã da Tribo Xakaxi', classe: 'zephyra', nivel: 8, hp: 65, energia: 30, elemental: 'agua', skills: ['jato_dagua', 'onda_curativa', 'névoa_confusao'], recompensa_sdr: 50 },
  ],
  5: [
    { nome: 'Campeão da Arena', classe: 'karuak', nivel: 12, hp: 120, energia: 30, elemental: 'terra', skills: ['soco_pesado', 'pisao_tremendo', 'investida_colossal'], recompensa_sdr: 80 },
    { nome: 'Feiticeira das Sombras', classe: 'nami', nivel: 12, hp: 85, energia: 35, elemental: 'sombra', skills: ['chuva_laminas', 'sombra_fatal', 'clone_ilusao'], recompensa_sdr: 80 },
  ],
  6: [
    { nome: 'Guardião Primordial', classe: 'ignis', nivel: 15, hp: 150, energia: 40, elemental: 'fogo', skills: ['bola_fogo', 'sol_negro', 'combustao'], recompensa_sdr: 120 },
    { nome: 'Avatar de Kronos', classe: 'tivara', nivel: 15, hp: 130, energia: 45, elemental: 'trevas', skills: ['flecha_ancestral', 'tiro_triplo', 'olho_falcao'], recompensa_sdr: 120 },
  ],
}

export function getInimigoPorSDR(sdr) {
  const tier = Math.min(6, Math.max(1, Math.floor(sdr / 100) + 1))
  const pool = ENEMIES_BY_TIER[tier] || ENEMIES_BY_TIER[1]
  const idx = Math.floor(Math.random() * pool.length)
  return { ...pool[idx], tier }
}

export function gerarTimeInimigo(sdr) {
  const numInimigos = Math.min(3, Math.max(1, Math.floor(sdr / 50) + 1))
  const time = []
  const usados = new Set()
  for (let i = 0; i < numInimigos; i++) {
    let inimigo
    let tentativas = 0
    do {
      inimigo = getInimigoPorSDR(sdr + i * 20)
      tentativas++
    } while (usados.has(inimigo.nome) && tentativas < 10)
    usados.add(inimigo.nome)
    time.push(inimigo)
  }
  return time
}
