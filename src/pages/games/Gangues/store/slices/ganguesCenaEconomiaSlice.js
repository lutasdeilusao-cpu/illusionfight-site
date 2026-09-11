// Slice: economia da cena (grana/rep/inventário) + o debounce de persistência
// no Supabase que quase todo outro slice do modo história usa (_persistStory/
// _persistCena). Extraído de store/useGanguesStore.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { salvarProgressoHistoria } from '../ganguesStoryProgress.js'

// Debounce dos writes de progresso do modo história: várias ações batem em
// sequência (marcar POI + grana + rep) e não faz sentido um upsert por campo.
let storySaveTimer = null

export default function createGanguesCenaEconomiaSlice(set, get) {
  return {
    // ── Modo história: a CENA (bairro navegável) ──
    // Economia leve + progresso por cena.
    // cenaProgresso: { [cenaId]: { resolvidos, revelados, boss, posicao:{x,y} } }
    grana: 0,
    rep: 0,
    cenaProgresso: {},
    // Inventário de item — { [itemId]: quantidade }, compartilhado pela gangue
    // inteira (comprado com a grana de todos), não por personagem. Ver
    // data/ganguesItens.js pro catálogo.
    inventario: {},

    // Inventário de EQUIPAMENTO — lista de instâncias { uid, itemId, cards },
    // compartilhada pela gangue (comprado/dropado com a grana de todos). Uma
    // instância sai daqui quando é equipada num personagem
    // (sheet.attributes.equipment[slot]) e volta pra cá ao ser desequipada,
    // com as cartas que tiver. Ver data/ganguesEquip.js.
    equipamentos: [],

    // Escreve no Supabase com debounce — várias ações do modo história disparam
    // essa persistência em sequência (marcar POI + grana + rep) e não
    // faz sentido um upsert por campo. Guest e quem ainda não abriu um save
    // (sem `_saveId`) não salva nada, igual à ficha: o banner já avisa que o
    // progresso não fica.
    _persistStory: () => {
      const saveId = get()._saveId
      if (!saveId) return
      clearTimeout(storySaveTimer)
      storySaveTimer = setTimeout(() => {
        const { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds, inventario, equipamentos } = get()
        salvarProgressoHistoria(saveId, { gangName, storyProgress, cenaProgresso, grana, rep, campaignClears, eventCharacterIds, inventario, equipamentos })
      }, 800)
    },

    _persistCena: () => get()._persistStory(),

    _cena: (cenaId) => get().cenaProgresso[cenaId] || { resolvidos: {}, revelados: {}, boss: false },

    ganharGrana: (n) => { set(state => ({ grana: Math.max(0, state.grana + (n || 0)) })); get()._persistCena() },
    ganharRep: (n) => { set(state => ({ rep: Math.max(0, state.rep + (n || 0)) })); get()._persistCena() },
    gastarGrana: (n) => {
      if (get().grana < n) return false
      set(state => ({ grana: state.grana - n }))
      get()._persistCena()
      return true
    },

    // Compra 1 unidade de um item da loja (ver data/ganguesItens.js) — cobra a
    // grana e só adiciona ao inventário se o pagamento passar.
    comprarItem: (itemId, custo) => {
      if (!get().gastarGrana(custo)) return false
      set(state => ({ inventario: { ...state.inventario, [itemId]: (state.inventario[itemId] || 0) + 1 } }))
      get().registrarItemVisto([itemId])
      get()._persistCena()
      return true
    },

    // Consome 1 unidade do item do inventário (usado em combate) — devolve
    // false se não tinha nenhum sobrando, pra quem chamar não aplicar o
    // efeito à toa.
    usarItem: (itemId) => {
      const atual = get().inventario[itemId] || 0
      if (atual <= 0) return false
      set(state => ({ inventario: { ...state.inventario, [itemId]: atual - 1 } }))
      get()._persistCena()
      return true
    },

    resetCena: () => {
      set({ grana: 0, rep: 0, cenaProgresso: {}, inventario: {}, equipamentos: [] })
      get()._persistStory()
    },
  }
}
