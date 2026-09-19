/* ══════════════════════════════════════════════════════════════
   Ajuste de DIFICULDADE — componente único e desacoplado.

   Pedido do Isaias (19/09/2026): o sistema antigo (GANGUES_MODO_RATIO/
   GANGUES_TERRITORIO_STEP/GANGUES_DIFICULDADE_OFFSET/GANGUES_MODO_MULT,
   removidos de ganguesEncontros.js) calculava a ficha do inimigo como um
   RATIO em cima do total de pontos do TIME do jogador — "força numericamente
   [em vez disso], porque aí é mais fácil balancear". Só a Pista tinha virado
   ladder de números fixos por POI (`poi.fixo`/`poi.pontosFixo`, ver
   data/cenas/pista/pois.js) e mesmo essa ladder não reagia à escolha de
   fácil/médio/difícil — os outros 6 territórios continuavam 100% no ratio
   antigo. Essa mistura de dois sistemas era a "sujeira" que ele pediu pra
   limpar antes de mexer em qualquer número novo.

   Agora TODO encontro do jogo (rua, revezamento, chefe, evento aleatório)
   parte de um número de pontos FIXO, autorado por quem criou o encontro
   (ver ganguesTerritorios.js e data/cenas/pista/*). Esse arquivo é o ÚNICO
   lugar que decide quanto a dificuldade ESCOLHIDA PELO JOGADOR soma ou tira
   em cima desse número fixo — pra rebalancear o jogo inteiro, mexe só no
   objeto abaixo.

   A 1ª luta da CONTA (não de cada território) continua suavizada à parte
   por `suavizarPrimeiraLuta` (ganguesEncontros.js) — não duplicar essa
   exceção aqui.
   ══════════════════════════════════════════════════════════════ */

export const GANGUES_DIFICULDADE_AJUSTE = { facil: -2, medio: 0, dificil: 2 }

/** "Regra da frustração" (pedido do Isaias, 19/09/2026): quantas derrotas
 *  SEGUIDAS na história (storyProgress.__derrotasSeguidas, ganguesStorySlice.js)
 *  disparam a suavização da próxima treta comum (ver GanguesRoute.jsx —
 *  reaproveita `suavizarPrimeiraLuta`: um inimigo só, metade da ficha, nunca
 *  "ficha cheia mais fraca"). Zera em qualquer vitória. */
export const GANGUES_FRUSTRACAO_LIMIAR = 2

/** Aplica o ajuste de dificuldade num alvo de pontos fixo, nunca deixando
 *  passar de 1 (uma ficha de 0 ou negativa quebra escalarInimigo). */
export function ajustarPontosFixo(pontosBase, modo = 'medio') {
  const ajuste = GANGUES_DIFICULDADE_AJUSTE[modo] ?? 0
  return Math.max(1, Math.round(pontosBase + ajuste))
}
