/** Banner de beta do site — aviso não-bloqueante */
export const BETA_ACTIVE = true

/** Modo trial — usado por outros componentes para bypass de data (ex: book chapters) */
export const TRIAL_ACTIVE = false

/** Beta: os Contos de Ilusão ficam abertos pra todo mundo até o fechamento
 *  do produto antes do lançamento. A partir de FECHAMENTO_PRE_LANCAMENTO as
 *  datas de historias/contos.json passam a valer sozinhas. */
export const BETA_CONTOS_PUBLICO = true

/** Dia em que o produto fecha pra preparar o lançamento (15/11). */
export const FECHAMENTO_PRE_LANCAMENTO = '2026-11-01'

/** Hoje, no horário de Brasília (YYYY-MM-DD). */
const hojeBrasilia = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10)
export const antesDoFechamento = () => hojeBrasilia() < FECHAMENTO_PRE_LANCAMENTO
