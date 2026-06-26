// Banco de pistas — Jack Dream Beer v3.0
// Chave = pista.id, valor = dados da pista

export const PISTAS = {
  // === CASO 1 — A Oficina Fechada ===
  p1_1: {
    id: 'p1_1', casoId: 'caso1', tipo: 'rastro',
    texto: 'marcas de luta no chão da oficina. alguém foi arrastado. não saiu andando.',
    aponta: 'sus1_1', // Cobrador Fantasma
  },
  p1_2: {
    id: 'p1_2', casoId: 'caso1', tipo: 'testemunho',
    texto: '"vi um homem de capa levando o ferreiro. não vi o rosto. mas a capa era igual à do pessoal da dívida." — Pajé',
    aponta: 'sus1_1',
  },
  p1_3: {
    id: 'p1_3', casoId: 'caso1', tipo: 'objeto',
    texto: 'recibo de dívida no nome do Cobrador Fantasma. valor: 200 cervejas e uma bengala encantada.',
    aponta: 'sus1_1',
  },
  p1_4: {
    id: 'p1_4', casoId: 'caso1', tipo: 'documento',
    texto: 'mensagem decifrada: "OFICINA 23H. LEVAR A BENGALA. NÃO FALHAR." remetente anônimo.',
    aponta: 'sus1_1',
  },
  p1_5: {
    id: 'p1_5', casoId: 'caso1', tipo: 'alibiFalso',
    texto: 'o segurança do Risca a Faca jurou que o Cobrador estava lá dançando às 23h. mas o recibo do cortiço mostra que ele estava lá às 22h50. não dava tempo.',
    aponta: 'sus1_1',
  },

  // === CASO 2 — O Carregamento Sumido ===
  p2_1: {
    id: 'p2_1', casoId: 'caso2', tipo: 'rastro',
    texto: 'container aberto no Porto Velho. fragmentos esquecidos no chão. mas só alguns. o resto foi levado às pressas.',
    aponta: 'sus2_1', // Operativo
  },
  p2_2: {
    id: 'p2_2', casoId: 'caso2', tipo: 'testemunho',
    texto: '"fragmentos? não sei de nenhum fragmento." o operativo suava frio. ninguém sua frio em auranis.',
    aponta: 'sus2_1',
  },
  p2_3: {
    id: 'p2_3', casoId: 'caso2', tipo: 'documento',
    texto: 'nota reconstituída: coordenadas da Doca Abandonada. letra miúda no canto: "entrega confirmada — OP."',
    aponta: 'sus2_1',
  },
  p2_4: {
    id: 'p2_4', casoId: 'caso2', tipo: 'objeto',
    texto: 'símbolo do Mercado Negro marcado na parede da Doca. tinta fresca. alguém esteve aqui essa noite.',
    aponta: 'sus2_1',
  },
  p2_5: {
    id: 'p2_5', casoId: 'caso2', tipo: 'alibiFalso',
    texto: 'registro decifrado: o Operativo disse que estava no Terminal às 23h. mas o log mostra que ele saiu às 22h30 e voltou só às 2h.',
    aponta: 'sus2_1',
  },

  // === CASO 3 — A Pista Sem Remetente ===
  p3_1: {
    id: 'p3_1', casoId: 'caso3', tipo: 'testemunho',
    texto: '"esse símbolo... eu já vi isso antes. nos arquivos antigos da tribo Xakaxi. mas não aqui. não em karnazar." — Viran, pálido.',
    aponta: 'sus3_2', // Viran (sabe mais)
  },
  p3_2: {
    id: 'p3_2', casoId: 'caso3', tipo: 'rastro',
    texto: 'pegadas na neve da Rua Branca. andam dez passos e somem. não voltam. não continuam. simplesmente param.',
    aponta: 'sus3_1', // Kronos
  },
  p3_3: {
    id: 'p3_3', casoId: 'caso3', tipo: 'objeto',
    texto: 'segundo envelope no Escuro. mesmo símbolo. mesma caligrafia. data de três dias atrás. antes do primeiro caso.',
    aponta: 'sus3_3', // Jack (remetente é ele mesmo)
  },
  p3_4: {
    id: 'p3_4', casoId: 'caso3', tipo: 'documento',
    texto: 'arquivo de Tira reconstituído: Kronos aparece em dois lugares ao mesmo tempo em todas as datas. como se fosse dois.',
    aponta: 'sus3_1',
  },
  p3_5: {
    id: 'p3_5', casoId: 'caso3', tipo: 'alibiFalso',
    texto: 'Kronos não pode estar em dois lugares. a menos que uma das aparições não seja ele. a letra nos envelopes... é a minha.',
    aponta: 'sus3_3',
  },

  // === CASO 4 — Quem Sabotou o Sonho ===
  p4_1: {
    id: 'p4_1', casoId: 'caso4', tipo: 'objeto',
    texto: 'copo no Boteco do Jazz com impressão digital. não é de nenhum suspeito dos casos anteriores. é do garçom que me serviu todas as noites.',
    aponta: 'sus4_1', // Kim
  },
  p4_2: {
    id: 'p4_2', casoId: 'caso4', tipo: 'rastro',
    texto: 'marca de bengala no chão da oficina. não é a minha. é mais fina. mais precisa. kim sempre foi mais preciso que eu.',
    aponta: 'sus4_1',
  },
  p4_3: {
    id: 'p4_3', casoId: 'caso4', tipo: 'testemunho',
    texto: '"vi um garçom. chapéu preto. conversando com o sujeito do mercado negro. achei estranho porque garçom não tem nada que fazer no porto." — estivador.',
    aponta: 'sus4_1',
  },
  p4_4: {
    id: 'p4_4', casoId: 'caso4', tipo: 'documento',
    texto: 'anotação de Karim: "J disse que o carregamento ia dar problema. J estava certo." Kim. Kim avisou Karim. Kim sabia.',
    aponta: 'sus4_1',
  },
  p4_5: {
    id: 'p4_5', casoId: 'caso4', tipo: 'alibiFalso',
    texto: '"kim? passou por aqui faz tempo. treinou comigo umas três sessões. disse que precisava estar pronto pro que vinha." — Viran.',
    aponta: 'sus4_1',
  },
  p4_6: {
    id: 'p4_6', casoId: 'caso4', tipo: 'objeto',
    texto: 'terceiro envelope no Escuro. mesma caligrafia dos outros. mas dessa vez tem um bilhete dentro: "você ainda não entendeu. mas vai entender. — K"',
    aponta: 'sus4_1',
  },
}
