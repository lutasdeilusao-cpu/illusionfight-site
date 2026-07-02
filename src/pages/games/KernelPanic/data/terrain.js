// ══════════════════════════════════════════
//  TERRAIN CARD DEFINITIONS — Kernel Panic
//  Extraídas de kernel-panic.html (L1203-L1224)
//  effect retorna { terrain_mods, terrain_contra_sol? }
//  em vez de mutar G, para compatibilidade com useReducer
// ══════════════════════════════════════════

export const TERRAIN_CARDS = [
  {
    id: 't_chuva', name: 'Chuva Ácida', icon: '☣',
    desc: '-3 Scan, +3 Sinal Fantasma para ambos.',
    effect: () => ({ terrain_mods: { visao: -3, camuflagem: 3 } }),
  },
  {
    id: 't_trovoada', name: 'Pulso EMP', icon: '⚡',
    desc: '−3 de Exposição após qualquer disparo.',
    effect: () => ({ terrain_mods: { perigo_after_shot: -3 } }),
  },
  {
    id: 't_sol', name: 'Luz Neon Intensa', icon: '🔆',
    desc: '-3 Mira Ocular, +3 Scan para ambos.',
    effect: () => ({ terrain_mods: { precisao: -3, visao: 3 } }),
  },
  {
    id: 't_contrasol', name: 'Interferência Solar', icon: '📡',
    desc: 'Sorteia um operador: −1 Scan/Sinal Fantasma. Outro: +1.',
    effect: () => {
      const lucky = Math.random() < 0.5 ? 0 : 1
      return { terrain_mods: { contra_sol: lucky }, terrain_contra_sol: lucky }
    },
  },
  {
    id: 't_neve', name: 'Névoa de Dados', icon: '🌫',
    desc: '+2 Sinal Fantasma para ambos.',
    effect: () => ({ terrain_mods: { camuflagem: 2 } }),
  },
  {
    id: 't_chuvaforte', name: 'Blackout de Rede', icon: '💀',
    desc: 'Anula todos os módulos de Scan.',
    effect: () => ({ terrain_mods: { anula_visao: true } }),
  },
  {
    id: 't_calor', name: 'Sobrecarga do Sistema', icon: '🔴',
    desc: 'Anula todos os módulos de Blindagem.',
    effect: () => ({ terrain_mods: { anula_protecao: true } }),
  },
  {
    id: 't_nublado', name: 'Ambiente Neutro', icon: '⬜',
    desc: 'Sem efeito.',
    effect: () => ({ terrain_mods: {} }),
  },
  {
    id: 't_noite', name: 'Modo Stealth', icon: '🌑',
    desc: '+3 Sinal Fantasma, +2 Exposição após disparo.',
    effect: () => ({ terrain_mods: { camuflagem: 3, perigo_after_shot: 2 } }),
  },
  {
    id: 't_conflito', name: 'Zona de Guerra Cyber', icon: '💾',
    desc: 'Exposição sobe 2 por ciclo (em vez de 1).',
    effect: () => ({ terrain_mods: { perigo_rate: 2 } }),
  },
]
