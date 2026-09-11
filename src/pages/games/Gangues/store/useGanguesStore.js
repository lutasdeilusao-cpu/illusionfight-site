// Store central do LDI Gangues — composto por "slices" (padrão recomendado
// pelo Zustand pra stores grandes): cada slice é uma função (set, get) => ({
// ...estado, ...ações }) que devolve um pedaço do store; aqui só combinamos
// todos com spread dentro de um único create(). Nada muda pra quem consome —
// continua sendo um hook só (`useGanguesStore()`) com todos os campos e ações
// no mesmo objeto. Slices podem chamar ações de outros slices via `get()`
// normalmente (nunca importando um arquivo de slice de dentro de outro, pra
// não criar dependência circular).
// Extraído do antigo arquivo único (918 linhas) — ver
// PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3.
import { create } from 'zustand'
import createGanguesSaveSlice from './slices/ganguesSaveSlice.js'
import createGanguesSheetSlice, { limiteFichasPorTier, podeCriarFicha } from './slices/ganguesSheetSlice.js'
import createGanguesMatchSlice from './slices/ganguesMatchSlice.js'
import createGanguesProgressionSlice from './slices/ganguesProgressionSlice.js'
import createGanguesColecaoSlice from './slices/ganguesColecaoSlice.js'
import createGanguesStorySlice from './slices/ganguesStorySlice.js'
import createGanguesCenaEconomiaSlice from './slices/ganguesCenaEconomiaSlice.js'
import createGanguesEquipSlice from './slices/ganguesEquipSlice.js'
import createGanguesCenaProgressoSlice from './slices/ganguesCenaProgressoSlice.js'
import createGanguesBiroscaSlice from './slices/ganguesBiroscaSlice.js'

export { limiteFichasPorTier, podeCriarFicha }

export const useGanguesStore = create((set, get) => ({
  ...createGanguesSaveSlice(set, get),
  ...createGanguesMatchSlice(set, get),
  ...createGanguesColecaoSlice(set, get),
  ...createGanguesCenaEconomiaSlice(set, get),
  ...createGanguesEquipSlice(set, get),
  ...createGanguesCenaProgressoSlice(set, get),
  ...createGanguesSheetSlice(set, get),
  ...createGanguesStorySlice(set, get),
  ...createGanguesProgressionSlice(set, get),
  ...createGanguesBiroscaSlice(set, get),
}))

// Gancho de debug — só em dev (npm run dev). Deixa um teste headless (Playwright)
// montar gangue/time/alvo direto no store, sem clicar a UI inteira.
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__ganguesStore = useGanguesStore
}
