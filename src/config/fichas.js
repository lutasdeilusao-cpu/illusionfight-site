/**
 * Fichas Gate — Flag central de ativação do sistema de fichas.
 *
 * FICHAS_GATE_ATIVO = false:
 *   Desliga todo o gate de fichas no frontend.
 *   - FichaGateRoute renderiza children sem verificar saldo
 *   - useFichaGate retorna estado "liberado" sem chamar Supabase
 *   - UI não exibe contadores de fichas
 *
 * FICHAS_GATE_ATIVO = true:
 *   Sistema de fichas funciona normalmente (gasto, modais, contadores).
 *
 * ⚠️ Esta flag NÃO altera dados no banco. RPCs, tabelas e migrações
 *    permanecem intocadas. Apenas o frontend é afetado.
 */
export const FICHAS_GATE_ATIVO = false
