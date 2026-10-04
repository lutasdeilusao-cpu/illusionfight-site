// Slice: equipamento (comprar/equipar/desequipar) + toggle de poder equipado
// pra batalha. Extraído de store/useGanguesStore.js
// (PLANO_REFATORACAO_ARQUIVOS_GRANDES_GANGUES_2026-09-11.md §3).
import { createGanguesEquipInstance, normalizeGanguesEquipment, getGanguesEquip, aprimTeto, custoAprimoramento, GANGUES_SUCATA_ID, podeEquiparGangues } from '../../data/ganguesEquip.js'
import { toggleGanguesTemplateSpecial } from '../../data/ganguesCharacters.js'
import { getGanguesCarta } from '../../data/ganguesCartas.js'

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
      // Peça de caminho só vai no personagem daquele caminho.
      if (!podeEquiparGangues(def, get().roster.find(m => m.id === memberId))) return false
      const slot = def.slot
      let devolvidoAoInventario = null

      const aplicar = member => {
        if (member.id !== memberId) return member
        const equipment = normalizeGanguesEquipment(member.attributes?.equipment)
        const anterior = equipment[slot]
        if (anterior) devolvidoAoInventario = { uid: `eq-${anterior.itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: anterior.itemId, encaixe: Boolean(anterior.encaixe), cards: anterior.cards || [], aprim: anterior.aprim || 0 }
        equipment[slot] = { itemId: def.id, encaixe: Boolean(instancia.encaixe), cards: instancia.cards || [], aprim: instancia.aprim || 0 }
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
    // Peça que caiu de inimigo: vai pro bolso na versão com encaixe.
    ganharEquipDrop: (itemId, variante = {}) => {
      const instancia = createGanguesEquipInstance(itemId, variante.aprim || 0, true, variante.encaixes || 1)
      if (!instancia) return false
      set(state => ({ equipamentos: [...state.equipamentos, instancia] }))
      get().registrarItemVisto([itemId])
      get()._persistCena()
      return instancia.uid
    },

    // Encaixa uma carta (do inventário) num encaixe vazio da peça — pra
    // sempre. A carta tem que ser do mesmo espaço da peça.
    encaixarCarta: ({ uid = null, memberId = null, slot = null }, indice, cartaId) => {
      const carta = getGanguesCarta(cartaId)
      if (!carta || (get().inventario[cartaId] || 0) <= 0) return false
      const encaixar = peca => {
        const def = peca && getGanguesEquip(peca.itemId)
        if (!def || !peca.encaixe || def.slot !== carta.slot || !Array.isArray(peca.cards) || indice >= peca.cards.length || peca.cards[indice]) return null
        return { ...peca, cards: peca.cards.map((c, i) => (i === indice ? carta.id : c)) }
      }
      if (uid) {
        const nova = encaixar(get().equipamentos.find(eq => eq.uid === uid))
        if (!nova) return false
        set(state => ({ equipamentos: state.equipamentos.map(eq => (eq.uid === uid ? nova : eq)) }))
      } else {
        const member = get().roster.find(m => m.id === memberId)
        const equipment = normalizeGanguesEquipment(member?.attributes?.equipment)
        const nova = encaixar(equipment[slot])
        if (!nova) return false
        equipment[slot] = nova
        const aplicar = m => (m.id === memberId ? { ...m, attributes: { ...m.attributes, equipment } } : m)
        set(state => ({ roster: state.roster.map(aplicar), activeParty: state.activeParty.map(aplicar), sheet: state.sheet?.id === memberId ? aplicar(state.sheet) : state.sheet }))
        get().saveParticipantProgress([memberId])
      }
      set(state => ({ inventario: { ...state.inventario, [cartaId]: (state.inventario[cartaId] || 0) - 1 } }))
      get()._persistCena()
      return true
    },

    // Vende uma peça guardada (só o que está no bolso; equipada não vende).
    venderEquip: (uid, preco) => {
      if (!(preco > 0) || !get().equipamentos.some(eq => eq.uid === uid)) return false
      set(state => ({ equipamentos: state.equipamentos.filter(eq => eq.uid !== uid) }))
      get().ganharGrana(preco)
      get().contarStat({ vendas: 1 })
      return true
    },

    desequiparItem: (memberId, slot) => {
      let devolvido = null
      const aplicar = member => {
        if (member.id !== memberId) return member
        const equipment = normalizeGanguesEquipment(member.attributes?.equipment)
        const atual = equipment[slot]
        if (!atual) return member
        devolvido = { uid: `eq-${atual.itemId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, itemId: atual.itemId, encaixe: Boolean(atual.encaixe), cards: atual.cards || [], aprim: atual.aprim || 0 }
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

    // ── Aprimoramento (27/09/2026, PLANO_ITENS_RANGE.md §3) ──
    // Sobe 1 nível de uma peça — equipada (`memberId` + `slot`) ou guardada na
    // gangue (`uid`). `tetoFerreiro` = até onde AQUELE ferreiro aprimora (o
    // Nando da Pista faz só +1); o teto da própria peça também vale. O nível
    // mora na peça, não no personagem: vai junto se ela trocar de dono.
    // Devolve { ok, motivo?, nivel, custo }.
    aprimorarEquip: ({ uid = null, memberId = null, slot = null }, tetoFerreiro = 1) => {
      const member = memberId ? get().roster.find(m => m.id === memberId) : null
      const peca = uid
        ? get().equipamentos.find(eq => eq.uid === uid)
        : normalizeGanguesEquipment(member?.attributes?.equipment)[slot]
      const def = peca && getGanguesEquip(peca.itemId)
      if (!def) return { ok: false, motivo: 'sem_peca' }
      if (peca.encaixe) return { ok: false, motivo: 'encaixe' }
      const nivel = (peca.aprim || 0) + 1
      if (nivel > Math.min(aprimTeto(def), tetoFerreiro)) return { ok: false, motivo: 'teto' }
      const custo = custoAprimoramento(def, nivel)
      if (get().grana < custo.grana) return { ok: false, motivo: 'grana', custo }
      if ((get().inventario[GANGUES_SUCATA_ID] || 0) < custo.sucata) return { ok: false, motivo: 'sucata', custo }
      get().gastarItens({ [GANGUES_SUCATA_ID]: custo.sucata })
      get().gastarGrana(custo.grana)
      if (uid) {
        set(state => ({ equipamentos: state.equipamentos.map(eq => (eq.uid === uid ? { ...eq, aprim: nivel } : eq)) }))
      } else {
        const aplicar = m => {
          if (m.id !== memberId) return m
          const equipment = normalizeGanguesEquipment(m.attributes?.equipment)
          equipment[slot] = { ...equipment[slot], aprim: nivel }
          return { ...m, attributes: { ...m.attributes, equipment } }
        }
        set(state => {
          const roster = state.roster.map(aplicar)
          const byId = new Map(roster.map(m => [m.id, m]))
          return { roster, activeParty: state.activeParty.map(m => byId.get(m.id) || m), sheet: byId.get(state.sheet.id) || state.sheet }
        })
        get().saveParticipantProgress([memberId])
      }
      get()._persistCena()
      get().contarStat({ aprimoramentos: 1 })
      return { ok: true, nivel, custo }
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
