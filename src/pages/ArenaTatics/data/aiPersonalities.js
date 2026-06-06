/**
 * AI PERSONALITIES — 16 Personalidades de IA para LDI TACTICS
 * Cada IA controla inimigos com filosofia de combate própria.
 * Sistema sorteia 1-2 IAs por batalha.
 */

/* ─────────── 1. O EXTERMINADOR ─────────── */
const EXTERMINADOR = {
  id: 'exterminador',
  nome: 'O Exterminador',
  descricao: 'Elimina alvos em ordem crescente de HP.',

  selecionarTime(pool) {
    return [...pool].sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal)).slice(0, 4)
  },
  escolherAlvo(meus, inimigos) {
    return [...inimigos].sort((a, b) => a.hp - b.hp)[0]
  },
  escolherPersonagem(disponiveis) {
    return [...disponiveis].sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
  prioridade(meus, inimigos) {
    for (const meu of meus) {
      for (const ini of inimigos) {
        const melhor = (meu.skills || []).filter(s => (s.custo || 0) <= (meu.energia || 0) && !s.emRecarga).sort((a, b) => (b.dano || 0) - (a.dano || 0))[0]
        if (melhor && (melhor.dano || 0) >= (ini.hp || 0)) return { personagem: meu, skill: melhor, alvo: ini }
      }
    }
    return null
  },
}

/* ─────────── 2. O CONTROLADOR ─────────── */
const CONTROLADOR = {
  id: 'controlador',
  nome: 'O Controlador',
  descricao: 'Paralisa o inimigo antes de atacar.',

  SKILLS_CONTROLE: ['Imobiliza', 'Atordoa', 'Silencia', 'Cega', 'Congela', 'Enreda', 'Medo'],

  selecionarTime(pool) {
    const pontuados = pool.map(p => ({
      p, score: (p.skills || []).filter(s => s.efeitos?.some(ef => this.SKILLS_CONTROLE.includes(ef))).length
    }))
    return pontuados.sort((a, b) => b.score - a.score).slice(0, 4).map(x => x.p)
  },
  escolherAlvo(_meus, inimigos) {
    const semDebuff = inimigos.filter(i => !i.status?.length)
    if (semDebuff.length) return semDebuff.sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0]
    return [...inimigos].sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0]
  },
  escolherSkill(personagem, alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    const controle = skills.find(s => s.efeitos?.some(ef => this.SKILLS_CONTROLE.includes(ef)) && !(alvo?.status || []).find(st => s.efeitos.includes(st.tipo)))
    if (controle) return controle
    const qqControle = skills.find(s => s.efeitos?.some(ef => this.SKILLS_CONTROLE.includes(ef)))
    if (qqControle) return qqControle
    return null
  },
}

/* ─────────── 3. O OPORTUNISTA ─────────── */
const OPORTUNISTA = {
  id: 'oportunista',
  nome: 'O Oportunista',
  descricao: 'Explora fraquezas abertas.',

  selecionarTime(pool) {
    return [...pool].slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => this.calcOportunidade(b) - this.calcOportunidade(a))[0]
  },
  calcOportunidade(inimigo) {
    let score = 0
    const hpPct = (inimigo.hp || 0) / (inimigo.hpMax || 1)
    if (hpPct < 0.25) score += 40
    else if (hpPct < 0.5) score += 20
    if ((inimigo.status || []).find(s => s.tipo === 'imobilizacao')) score += 30
    if ((inimigo.status || []).find(s => s.tipo === 'silencio')) score += 25
    return score
  },
  escolherSkill(personagem, alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    if ((alvo?.hp || 0) / (alvo?.hpMax || 1) < 0.3) return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
    return skills[Math.floor(Math.random() * skills.length)] || null
  },
}

/* ─────────── 4. O SITIADOR ─────────── */
const SITIADOR = {
  id: 'sitiador',
  nome: 'O Sitiador',
  descricao: 'Controla o terreno, força o player a vir até ele.',

  selecionarTime(pool) {
    const keywords = ['Terreno', 'Armadilha', 'Raízes', 'Imobiliza', 'Empurra']
    return [...pool].sort((a, b) => {
      const sa = (a.skills || []).filter(s => s.efeitos?.some(e => keywords.includes(e))).length
      const sb = (b.skills || []).filter(s => s.efeitos?.some(e => keywords.includes(e))).length
      return sb - sa
    }).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => a.hp - b.hp)[0]
  },
  escolherSkill(personagem) {
    const keywords = ['Terreno', 'Armadilha', 'Raízes']
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    const setup = skills.find(s => s.efeitos?.some(e => keywords.includes(e)))
    if (setup) return setup
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 5. O VAMPIRO ─────────── */
const VAMPIRO = {
  id: 'vampiro',
  nome: 'O Vampiro',
  descricao: 'Nunca morre. Vence no desgaste.',

  selecionarTime(pool) {
    return [...pool].filter(p => (p.hpMax || 0) > 600 || (p.skills || []).some(s => s.efeitos?.includes('Cura')))
      .sort((a, b) => (b.hpMax || 0) - (a.hpMax || 0)).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => a.hp - b.hp)[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    const cura = skills.find(s => s.efeitos?.includes('Cura'))
    if (cura) return cura
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 6. O CAÇADOR ─────────── */
const CACADOR = {
  id: 'cacador',
  nome: 'O Caçador',
  descricao: 'Elimina o suporte inimigo primeiro.',

  ARQUETIPO_PRIORIDADE: ['suporte', 'mago', 'debuffador', 'assassino', 'atirador', 'bruiser', 'tanque'],

  selecionarTime(pool) {
    return [...pool].slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => {
      const prioA = this.ARQUETIPO_PRIORIDADE.indexOf(a.arquetipo)
      const prioB = this.ARQUETIPO_PRIORIDADE.indexOf(b.arquetipo)
      return (prioA === -1 ? 99 : prioA) - (prioB === -1 ? 99 : prioB)
    })[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 7. O KAMIKAZE ─────────── */
const KAMIKAZE = {
  id: 'kamikaze',
  nome: 'O Kamikaze',
  descricao: 'Troca dano sem recuar.',

  selecionarTime(pool) {
    return [...pool].sort((a, b) => (b.atqTotal || 0) - (a.atqTotal || 0)).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => a.hp - b.hp)[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 8. O ESTRATEGISTA ─────────── */
const ESTRATEGISTA = {
  id: 'estrategista',
  nome: 'O Estrategista',
  descricao: 'Analisa o time inimigo e adapta decisões.',

  selecionarTime(pool) {
    return [...pool].slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => {
      const ameacaA = (a.atqTotal || 0) + (a.atqmTotal || 0)
      const vulnA = 1 - ((a.hp || 0) / (a.hpMax || 1))
      const ameacaB = (b.atqTotal || 0) + (b.atqmTotal || 0)
      const vulnB = 1 - ((b.hp || 0) / (b.hpMax || 1))
      return (ameacaB * (1 + vulnB)) - (ameacaA * (1 + vulnA))
    })[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 9. O ESPELHO ─────────── */
const ESPELHO = {
  id: 'espelho',
  nome: 'O Espelho',
  descricao: 'Copia a estratégia do player e devolve melhorada.',

  selecionarTime(pool) {
    return [...pool].slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    const curador = inimigos.find(i => (i.skills || []).some(s => s.efeitos?.includes('Cura')))
    if (curador) return curador
    return [...inimigos].sort((a, b) => (b.atqTotal || 0) - (a.atqTotal || 0))[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 10. O PACIFISTA ─────────── */
const PACIFISTA = {
  id: 'pacifista',
  nome: 'O Pacifista',
  descricao: 'Não mata se puder imobilizar.',

  selecionarTime(pool) {
    return [...pool].sort((a, b) => {
      const scoreControle = (p) => (p.skills || []).filter(s => s.efeitos?.some(e => ['Imobiliza', 'Empurra', 'Atordoa', 'Congela', 'Armadilha'].includes(e))).length
      return scoreControle(b) - scoreControle(a)
    }).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    const validos = inimigos.filter(i => (i.hp || 0) / (i.hpMax || 1) >= 0.3)
    if (!validos.length) return [...inimigos].sort((a, b) => b.hp - a.hp)[0]
    return validos.sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0]
  },
  escolherSkill(personagem, alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    if ((alvo?.hp || 0) / (alvo?.hpMax || 1) < 0.3) {
      const controle = skills.find(s => s.efeitos?.some(e => ['Imobiliza', 'Atordoa', 'Congela', 'Silencia'].includes(e)) && (s.dano || 0) === 0)
      if (controle) return controle
      return null
    }
    const comControle = skills.find(s => s.efeitos?.some(e => ['Imobiliza', 'Empurra', 'Atordoa'].includes(e)))
    return comControle || null
  },
}

/* ─────────── 11. O SANGUINÁRIO ─────────── */
const SANGUINARIO = {
  id: 'sanguinario',
  nome: 'O Sanguinário',
  descricao: 'Só ataca quem está abaixo de 50% HP.',

  selecionarTime(pool) {
    return [...pool].sort((a, b) => {
      const execA = (a.skills || []).filter(s => (s.dano || 0) >= 5).length
      const execB = (b.skills || []).filter(s => (s.dano || 0) >= 5).length
      return execB - execA
    }).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    const fracos = inimigos.filter(i => (i.hp || 0) / (i.hpMax || 1) < 0.5)
    if (fracos.length) return fracos.sort((a, b) => a.hp - b.hp)[0]
    return null
  },
  escolherSkill(personagem, alvo) {
    if (!alvo) return null
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    const killSkill = skills.find(s => (s.dano || 0) >= (alvo.hp || 0))
    if (killSkill) return killSkill
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 12. O COVARDE ─────────── */
const COVARDE = {
  id: 'covarde',
  nome: 'O Covarde',
  descricao: 'Só ataca em superioridade numérica.',

  selecionarTime(pool) {
    return [...pool].slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => a.hp - b.hp)[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 13. O NECROMANTE ─────────── */
const NECROMANTE = {
  id: 'necromante',
  nome: 'O Necromante',
  descricao: 'Elimina quem pode ressuscitar primeiro.',

  RESSUSCITADORES: ['Última Chama', 'Tocha Sagrada', 'Cinza'],

  selecionarTime(pool) {
    return [...pool].slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    const ressuscitador = inimigos.find(i => this.RESSUSCITADORES.includes(i.nome))
    if (ressuscitador) return ressuscitador
    return [...inimigos].sort((a, b) => b.hp - a.hp)[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 14. O TÁTICO ─────────── */
const TATICO = {
  id: 'tatico',
  nome: 'O Tático',
  descricao: 'Foco em posicionamento e sinergia de equipe.',

  selecionarTime(pool) {
    return [...pool].sort((a, b) => ((b.atqTotal || 0) + (b.def_pesada || 0)) - ((a.atqTotal || 0) + (a.def_pesada || 0))).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => (b.atqTotal + b.atqmTotal) - (a.atqTotal + a.atqmTotal))[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── 15. O SELVAGEM ─────────── */
const SELVAGEM = {
  id: 'selvagem',
  nome: 'O Selvagem',
  descricao: 'Avança sem parar, sempre no alvo mais próximo.',

  selecionarTime(pool) {
    return [...pool].sort((a, b) => (b.atqTotal || 0) - (a.atqTotal || 0)).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => a.hp - b.hp)[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    return skills[0] || null
  },
}

/* ─────────── 16. O MÍSTICO ─────────── */
const MISTICO = {
  id: 'mistico',
  nome: 'O Místico',
  descricao: 'Prefere skills mágicas e de status.',

  selecionarTime(pool) {
    return [...pool].sort((a, b) => ((b.atqmTotal || 0)) - ((a.atqmTotal || 0))).slice(0, 4)
  },
  escolherAlvo(_meus, inimigos) {
    return [...inimigos].sort((a, b) => {
      const statusA = (a.status || []).length
      const statusB = (b.status || []).length
      return statusA - statusB
    })[0]
  },
  escolherSkill(personagem, _alvo) {
    const skills = (personagem.skills || []).filter(s => (s.custo || 0) <= (personagem.energia || 0) && !s.emRecarga)
    const magica = skills.find(s => s.tipo === 'magico')
    if (magica) return magica
    return skills.sort((a, b) => (b.dano || 0) - (a.dano || 0))[0] || null
  },
}

/* ─────────── EXPORT ─────────── */

export const TODAS_IAS = [
  EXTERMINADOR, CONTROLADOR, OPORTUNISTA, SITIADOR,
  VAMPIRO, CACADOR, KAMIKAZE, ESTRATEGISTA,
  ESPELHO, PACIFISTA, SANGUINARIO, COVARDE,
  NECROMANTE, TATICO, SELVAGEM, MISTICO,
]

/**
 * Sorteia IAs para a batalha
 */
export function sortearIAs() {
  const shuffled = [...TODAS_IAS].sort(() => Math.random() - 0.5)
  return { ia1: shuffled[0], ia2: shuffled[1] }
}

/**
 * Resolve ação de IA para um personagem inimigo
 */
export function resolverAcaoIA(personagem, ia1, ia2, meusPersonagens, inimigos) {
  // Encontra por ID (não por referência — evita stale reference bug)
  const idx = meusPersonagens.findIndex(p => p.id === personagem.id)
  const ia = idx % 2 === 0 ? ia1 : ia2

  // Prioridade
  if (ia.prioridade) {
    const prio = ia.prioridade(meusPersonagens, inimigos)
    if (prio) return prio
  }

  const alvo = ia.escolherAlvo ? ia.escolherAlvo(meusPersonagens, inimigos) : inimigos[0]
  const skill = ia.escolherSkill ? ia.escolherSkill(personagem, alvo) : null

  return { personagem, skill, alvo }
}

/**
 * Descrição amigável do cenário de IA
 */
export function getDescricaoIA(ia1, ia2) {
  return `${ia1.nome} + ${ia2.nome}`
}
