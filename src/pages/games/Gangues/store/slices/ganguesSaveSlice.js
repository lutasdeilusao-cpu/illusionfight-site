// Slice: save slots — qual gangue (save) está aberta agora. Uma conta pode
// ter várias gangues em paralelo (ver GANGUES_SAVE_SLOT_LIMITS). `_saveId` é
// o save selecionado na tela GanguesSaveSelect — todo load/save de roster e
// progresso de história passa a ser escopado por ele, não mais só pelo
// user_id. Guest não tem save (joga só em memória).
// Extraído de store/useGanguesStore.js (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { listarSaves, criarSave, excluirSave } from '../ganguesStoryProgress.js'

export default function createGanguesSaveSlice(set, get) {
  return {
    _saveId: null,
    saves: [],

    listSaves: async (userId) => {
      const saves = await listarSaves(userId)
      set({ saves })
      return saves
    },

    criarNovoSave: async (userId) => {
      const id = await criarSave(userId)
      if (id) await get().listSaves(userId)
      return id
    },

    excluirSaveById: async (saveId, userId) => {
      const ok = await excluirSave(saveId)
      if (ok) await get().listSaves(userId)
      return ok
    },

    // Abre um save: carrega o progresso de história e o elenco daquela gangue
    // específica, e passa a persistir tudo nela a partir de agora.
    selecionarSave: async (saveId) => {
      set({ _saveId: saveId, roster: [], activeParty: [], gangName: '', storyProgress: {}, cenaProgresso: {}, grana: 0, rep: 0, inventario: {}, equipamentos: [] })
      await Promise.all([get().loadStoryProgress(saveId), get().loadSheets(saveId)])
    },
  }
}
