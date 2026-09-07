/* ══════════════════════════════════════════════════════════════
   Catálogo de itens — primeira versão, só pra validar o loop inteiro
   (comprar → guardar no inventário → usar em combate). Começa pequeno de
   propósito: 2 poções, custo/efeito fixo. Mais itens depois é só adicionar
   entrada aqui — loja e combate já leem a lista inteira dinamicamente.
   ══════════════════════════════════════════════════════════════ */
export const GANGUES_ITENS = {
  pocao_hp: { id: 'pocao_hp', nome: 'games.gangues.itens.pocao_hp', custo: 5, tipo: 'cura_pv', valor: 5, icone: '🩹' },
  pocao_mp: { id: 'pocao_mp', nome: 'games.gangues.itens.pocao_mp', custo: 5, tipo: 'cura_pm', valor: 5, icone: '💧' },
}

export const GANGUES_ITENS_LISTA = Object.values(GANGUES_ITENS)

export function getGanguesItem(itemId) {
  return GANGUES_ITENS[itemId] || null
}
