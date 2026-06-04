export const NPCS = {
  paje: {
    id: 'paje', nome: 'Pajé', saudacao: '"cheguei pra divar. o que vai ser?"',
    interior: 'barraca',
    itens: ['bengala_steampunk', 'sapatos_couro', 'relogio_bolso'],
  },
  kim: {
    id: 'kim', nome: 'Kim', saudacao: '"sobreviveu. parabéns."',
    interior: 'boteco',
    itens: ['upgrade_bengala_1', 'upgrade_bengala_2', 'energetico'],
    requerFlag: 'KIM_LIBERADO',
  },
  nina: {
    id: 'nina', nome: 'Nina', saudacao: '"casos em andamento. volte mais tarde."',
    interior: 'delegacia',
    itens: [],
    requerFlag: 'NINA_LIBERADO',
    missoes: [{ id: 'informante', nome: 'O Informante', disponivel: true }],
  },
  osvaldo: {
    id: 'osvaldo', nome: 'Osvaldo', saudacao: '"pode deixar comigo."',
    interior: 'oficina',
    itens: ['bengala_encantada', 'armadura_couro'],
    requerFlag: 'OSVALDO_LIBERADO',
  },
}
