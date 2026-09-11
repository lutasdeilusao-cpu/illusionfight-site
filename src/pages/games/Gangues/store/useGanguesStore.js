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
import { defaultSheet } from './slices/ganguesSheetSlice.js'

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

  // BUG CORRIGIDO (relatado pelo Isaias): fazer logout sem recarregar a
  // página deixava _userId (e roster/sheet/saves da conta anterior) presos
  // no store — nada limpava isso, porque GanguesRoute só reage a `user`
  // ficando VERDADEIRO (login), nunca a ficar falso (logout). O próximo
  // guest/login na MESMA aba herdava esse _userId órfão: recruitTemplate via
  // `(userId || get()._userId)` achava que tinha conta e tentava salvar a
  // ficha na nuvem (saveToCloud) com um user_id de uma sessão que não existe
  // mais — o Supabase rejeita (RLS), e a gangue nunca terminava de ser
  // fundada ("a gangue não pode ser fundada"). Diferente de resetStory/reset
  // (que são pra zerar o PROGRESSO de uma conta continua logada, e por isso
  // persistem no Supabase), este aqui NÃO persiste nada — é só limpar a
  // memória local antes da aba passar a representar outra conta ou um guest.
  logoutReset: () => set({
    _userId: null, _saveId: null, saves: [],
    sheet: defaultSheet(), roster: [], activeParty: [],
    match: { playerTeam: [], enemyTeam: [], enemy: null, enemy_id: null, score: 0, status: 'idle', battleReport: null },
    gangName: '', storyProgress: {}, storyTarget: null, torre: null,
    campaignClears: 0, eventCharacterIds: [],
    grana: 0, rep: 0, cenaProgresso: {}, inventario: {}, equipamentos: [],
    progressionTargetId: null, posVitoriaAcao: null,
  }),
}))

// Gancho de debug — só em dev (npm run dev). Deixa um teste headless (Playwright)
// montar gangue/time/alvo direto no store, sem clicar a UI inteira.
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__ganguesStore = useGanguesStore
}
