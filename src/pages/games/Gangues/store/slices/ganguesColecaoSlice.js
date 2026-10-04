// Slice: Álbum de Marélia, coleção de itens vistos e drop dos inimigos.
import { idsValidosUnicos } from '../../data/ganguesInimigos.js'
import { rolarDrops } from '../../engine/ganguesDrop.js'

export default function createGanguesColecaoSlice(set, get) {
  return {
    // Álbum de Marélia — registra os inimigos derrotados (ids numéricos) no
    // progresso do save. Guardado dentro do próprio storyProgress (chave
    // reservada __album), igual ao __flags do informante — sem coluna nova no
    // Supabase. Chamado pela tela de vitória com todo o bando batido.
    registrarNoAlbum: (ids = []) => {
      const novos = idsValidosUnicos(ids)
      if (!novos.length) return
      set(state => {
        const atual = state.storyProgress.__album || []
        const merge = [...new Set([...atual, ...novos])]
        if (merge.length === atual.length) return state
        return { storyProgress: { ...state.storyProgress, __album: merge } }
      })
      get()._persistStory()
    },

    // Coleção de ITENS — mesmo padrão do álbum (chave reservada __itens no
    // storyProgress, sem coluna nova). Marca todo id de item/equipamento que o
    // jogador já viu passar pela mão (comprou, ganhou de recompensa, dropou) —
    // a aba "Itens" da Coleção usa isso pra separar descoberto de "???".
    registrarItemVisto: (ids = []) => {
      const novos = ids.map(Number).filter(Number.isFinite)
      if (!novos.length) return
      set(state => {
        const atual = state.storyProgress.__itens || []
        const merge = [...new Set([...atual, ...novos])]
        if (merge.length === atual.length) return state
        return { storyProgress: { ...state.storyProgress, __itens: merge } }
      })
      get()._persistStory()
    },

    // Ganhar item sem pagar (recompensa de POI, drop) — ao contrário de
    // comprarItem, não cobra grana. Marca no __itens.
    darItem: (itemId, qtd = 1) => {
      const id = Number(itemId)
      if (!Number.isFinite(id)) return
      set(state => ({ inventario: { ...state.inventario, [id]: (state.inventario[id] || 0) + Math.max(1, qtd) } }))
      get().registrarItemVisto([id])
      get()._persistCena()
    },

    // Drop dos inimigos derrotados (um id por corpo batido). Sorteia com a
    // garantia (engine/ganguesDrop.js), entrega e grava os contadores em
    // storyProgress.__drops. Devolve o que caiu.
    aplicarDrops: (enemyIds = []) => {
      const ids = enemyIds.map(Number).filter(Number.isFinite)
      if (!ids.length) return []
      const { ganhos, contadores } = rolarDrops(ids, get().storyProgress.__drops || {})
      set(state => ({ storyProgress: { ...state.storyProgress, __drops: contadores } }))
      for (const g of ganhos) {
        if (g.tipo === 'equip') get().ganharEquipDrop(g.id, g.variante)
        else get().darItem(g.id, 1)
      }
      get()._persistStory()
      return ganhos
    },

    temItens: (mapa = {}) => Object.entries(mapa).every(([id, q]) => (get().inventario[id] || 0) >= q),

    // Consome vários itens de uma vez (fetch quest: "traz 2 sucata"). Tudo ou
    // nada — devolve false sem gastar se faltar qualquer um.
    gastarItens: (mapa = {}) => {
      if (!get().temItens(mapa)) return false
      set(state => {
        const inv = { ...state.inventario }
        for (const [id, q] of Object.entries(mapa)) inv[id] = (inv[id] || 0) - q
        return { inventario: inv }
      })
      get()._persistCena()
      return true
    },
  }
}
