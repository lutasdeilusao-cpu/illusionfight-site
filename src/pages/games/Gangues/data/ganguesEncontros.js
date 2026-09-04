/* ══════════════════════════════════════════════════════════════
   MODO HISTÓRIA — geração de bando inimigo por encontro (não fixo)

   Em vez de um `enemy`+`qtd` fixos por nó, cada tentativa da MESMA treta
   sorteia uma composição diferente — quantidade e distribuição de pontos
   variam a cada vez, feito "encontro selvagem" de RPG: você sabe a região,
   não sabe exatamente quem vai aparecer.

   Calibrado por SIMULAÇÃO (rodada centenas de vezes com times de jogador
   diversificados nos 3 caminhos — atacante/defensor/místico), não por
   fórmula no papel: um inimigo concentrado (poucos corpos, PV alto) é MUITO
   mais perigoso que o mesmo total de pontos espalhado em vários corpos
   fracos, porque PV só vem do atributo R e um time do jogador espalha esse
   investimento em vários personagens — por isso o total de pontos do bando
   fica ABAIXO do total do jogador (não acima), e a quantidade mínima é
   amarrada ao tamanho do time do jogador (bando muito concentrado é o
   cenário mais injusto, mesmo com poucos pontos).
   ══════════════════════════════════════════════════════════════ */

// Moldes de inimigo por região (mistura aleatória) + faixa de quantidade de
// corpos no bando — a quantidade real também respeita o tamanho do time do
// jogador (ver gerarBandoInimigo).
export const GANGUES_TERRITORIO_ENCONTRO = {
  pista: { moldes: ['moleque_a', 'moleque_b'], min: 1, max: 4 },
  feira: { moldes: ['turco_batedor', 'turco_capanga', 'gato_eletrico'], min: 2, max: 5 },
  baixada: { moldes: ['sombra_rubra', 'sombra_fria', 'os_restos'], min: 3, max: 6 },
  vila: { moldes: ['bonde_predio_1', 'bonde_predio_2', 'andar_de_cima'], min: 3, max: 6 },
  morro: { moldes: ['frente_escada_1', 'frente_escada_2', 'fogueteiro'], min: 4, max: 8 },
  alto: { moldes: ['os_cinco_1', 'os_cinco_2', 'a_roda'], min: 5, max: 10 },
  laje: { moldes: ['bonde_costura_1', 'bonde_costura_2', 'bonde_costura_3'], min: 6, max: 10 },
}

// Total de pontos do bando = pontos do jogador * esse fator. "normal" ~65%
// deu, na simulação, algo entre "ralado" e "vencível" na maioria dos
// tamanhos de time testados. "dificil"/"facil" alternam dentro do
// território pra não empilhar luta puxada atrás de luta puxada.
export const GANGUES_DIFICULDADE_RATIO = { facil: 0.5, normal: 0.65, dificil: 0.78 }

export function calcularPontosTime(team) {
  return team.reduce((sum, m) => sum + ['A', 'H', 'R', 'D'].reduce((s, k) => s + (Number(m.attributes?.[k]) || 0), 0), 0)
}

function distribuirPontos(total, qtd) {
  const base = Math.floor(total / qtd)
  const resto = total - base * qtd
  const partes = Array.from({ length: qtd }, () => base)
  for (let i = 0; i < resto; i++) partes[i % qtd] += 1
  return partes.map(p => Math.max(1, p))
}

function escalarInimigo(molde, pontosAlvo) {
  const pontosOriginais = molde.stats.A + molde.stats.H + molde.stats.R + molde.stats.D
  const fator = pontosOriginais > 0 ? pontosAlvo / pontosOriginais : 1
  return {
    ...molde,
    stats: {
      A: Math.max(0, Math.round(molde.stats.A * fator)),
      H: Math.max(0, Math.round(molde.stats.H * fator)),
      R: Math.max(0, Math.round(molde.stats.R * fator)),
      D: Math.max(0, Math.round(molde.stats.D * fator)),
    },
    pv_max: Math.max(4, Math.round(molde.pv_max * fator)),
    pm_max: Math.max(2, Math.round(molde.pm_max * fator)),
  }
}

/** Sorteia um bando inimigo pro território/dificuldade dados, escalado contra o time atual do jogador. */
export function gerarBandoInimigo({ territorioId, dificuldade = 'normal', playerTeam, enemiesData }) {
  const config = GANGUES_TERRITORIO_ENCONTRO[territorioId]
  if (!config || !playerTeam?.length) return null

  const pontosJogador = calcularPontosTime(playerTeam)
  // Bando muito concentrado (poucos corpos) é o cenário mais perigoso — o
  // mínimo de corpos acompanha o tamanho do seu time, não só o teto fixo
  // do território.
  const qtdMin = Math.max(config.min, Math.ceil(playerTeam.length * 0.6))
  const qtdMax = Math.max(qtdMin, config.max)
  const qtd = qtdMin + Math.floor(Math.random() * (qtdMax - qtdMin + 1))

  const ratio = GANGUES_DIFICULDADE_RATIO[dificuldade] || GANGUES_DIFICULDADE_RATIO.normal
  const totalAlvo = Math.max(qtd, Math.round(pontosJogador * ratio))
  const partes = distribuirPontos(totalAlvo, qtd)

  return partes.map(pontos => {
    const moldeId = config.moldes[Math.floor(Math.random() * config.moldes.length)]
    const molde = enemiesData.find(e => e.id === moldeId)
    return molde ? escalarInimigo(molde, pontos) : null
  }).filter(Boolean)
}
