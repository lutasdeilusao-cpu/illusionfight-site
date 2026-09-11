// Slice: equipamento (comprar/equipar/desequipar) + toggle de poder equipado
// pra batalha. Extraído de store/useGanguesStore.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { createGanguesEquipInstance, normalizeGanguesEquipment, getGanguesEquip } from '../../data/ganguesEquip.js'
import { toggleGanguesTemplateSpecial } from '../../data/ganguesCharacters.js'

export default function createGanguesEquipSlice(set, get) {
  return {
    // Compra 1 instância de equipamento da loja — cobra a grana e só cria a
    // instância (com sockets vazios) se o pagamento passar.
    comprarEquip: (itemId, custo) => {
      const instancia = createGanguesEquipInstance(itemId)
      if (!instancia || !get().gastarGrana(custo)) return false
      set(state => ({ equipamentos: [...state.equipamentos, instancia] }))
      get().registrarItemVisto([itemId])
      get()._persistCena()
      return instancia.uid
    },

    // Compra + equipa numa ação só (fluxo da loja — a decisão de comprar já é a
    // decisão de equipar). Se o slot do personagem já tinha peça, ela volta pro
    // inventário da gangue com as cartas. Devolve false se não deu pra pagar.
    comprarEEquipar: (itemId, custo, memberId) => {
      const uid = get().comprarEquip(itemId, custo)
      if (!uid) return false
      return get().equiparItem(memberId, uid)
    },

    // Equipa a instância `uid` no `slot` do personagem `memberId`. Se o slot já
    // tinha um item, ele volta pro inventário (com as cartas). A instância
    // equipada some do inventário e passa a viver em sheet.attributes.equipment.
    equiparItem: (memberId, uid) => {
      const instancia = get().equipamentos.find(eq => eq.uid === uid)
      const def = instancia && getGanguesEquip(instancia.itemId)
      if (!def) return false
      const slot = def.slot
      let devolvidoAoInventario = null

      const aplicar = member => {
        if (member.id !== memberId) return member
        const equipment = normalizeGanguesEquipment(member.attributes?.equipment)
        const anterior = equipment[slot]
        if (anterior) devolvidoAoInventario = { uid: `eq-${anterior.itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: anterior.itemId, cards: anterior.cards }
        equipment[slot] = { itemId: def.id, cards: instancia.cards }
        return { ...member, attributes: { ...member.attributes, equipment } }
      }

      set(state => {
        const roster = state.roster.map(aplicar)
        const byId = new Map(roster.map(m => [m.id, m]))
        const equipamentos = state.equipamentos.filter(eq => eq.uid !== uid)
        if (devolvidoAoInventario) equipamentos.push(devolvidoAoInventario)
        return {
          roster,
          activeParty: state.activeParty.map(m => byId.get(m.id) || m),
          sheet: byId.get(state.sheet.id) || state.sheet,
          equipamentos,
        }
      })
      get().saveParticipantProgress([memberId])
      get()._persistCena()
      return true
    },

    // Tira o item do `slot` do personagem e devolve ao inventário (com cartas).
    desequiparItem: (memberId, slot) => {
      let devolvido = null
      const aplicar = member => {
        if (member.id !== memberId) return member
        const equipment = normalizeGanguesEquipment(member.attributes?.equipment)
        const atual = equipment[slot]
        if (!atual) return member
        devolvido = { uid: `eq-${atual.itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: atual.itemId, cards: atual.cards }
        equipment[slot] = null
        return { ...member, attributes: { ...member.attributes, equipment } }
      }
      set(state => {
        const roster = state.roster.map(aplicar)
        const byId = new Map(roster.map(m => [m.id, m]))
        return {
          roster,
          activeParty: state.activeParty.map(m => byId.get(m.id) || m),
          sheet: byId.get(state.sheet.id) || state.sheet,
          equipamentos: devolvido ? [...state.equipamentos, devolvido] : state.equipamentos,
        }
      })
      if (devolvido) { get().saveParticipantProgress([memberId]); get()._persistCena() }
      return Boolean(devolvido)
    },

    // Equipa/desequipa um dos até-2 poderes ativos levados pra batalha (pedido
    // do Isaias: a única tela que existia pra isso, GanguesProgression, era
    // 100% leitura — nem no lobby dava pra trocar). Usável de qualquer lugar
    // que tenha o member (lobby E a ficha da cena/combate).
    toggleEspecial: (memberId, specialId) => {
      let mudou = false
      const aplicar = member => {
        if (member.id !== memberId) return member
        const change = toggleGanguesTemplateSpecial(member, specialId)
        if (!change) return member
        mudou = true
        return { ...member, ...change }
      }
      set(state => {
        const roster = state.roster.map(aplicar)
        const byId = new Map(roster.map(m => [m.id, m]))
        return {
          roster,
          activeParty: state.activeParty.map(m => byId.get(m.id) || m),
          sheet: byId.get(state.sheet.id) || state.sheet,
        }
      })
      if (mudou) { get().saveParticipantProgress([memberId]); get()._persistCena() }
      return mudou
    },
  }
}
