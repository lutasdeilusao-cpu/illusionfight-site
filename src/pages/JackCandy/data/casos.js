// Os 4 casos de investigação — Jack Dream Beer v3.0
// Pronto para i18n: todos os textos como chaves (pt-br padrão)

export const CASOS = {
  caso1: {
    id: 'caso1',
    nome: 'A Oficina Fechada',
    cidade: 'marelia',
    cliente: 'Nina',
    flagRequisito: 'NINA_LIBERADO',
    flagResolucao: 'CASO1_RESOLVIDO',
    abertura: [
      '"osvaldo sumiu", ela disse. "três dias. a oficina tá fechada."',
      'eu olhei pra minha cerveja. depois pra ela. depois pra cerveja de novo.',
      '"quanto você paga?" "nada." "tô dentro."',
    ],
    suspeitos: [
      { id: 'sus1_1', nome: 'Cobrador Fantasma', desc: 'Vigia de dívidas. Visto perto da oficina na noite do sumiço.', culpado: true },
      { id: 'sus1_2', nome: 'Dono do Cortiço', desc: 'Osvaldo devia aluguel atrasado. Motivo claro.', culpado: false },
      { id: 'sus1_3', nome: 'Analista do Terminal', desc: 'Tinha negócio inacabado com Osvaldo. Mensagens cifradas.', culpado: false },
    ],
    locais: [
      {
        id: 'loc1_1', nome: 'Oficina (porta dos fundos)', desc: 'A oficina está fechada. Mas a porta dos fundos...',
        pistas: ['p1_1'],
        puzzle: 'stealth',
        puzzleLabel: 'entrar sem ser visto',
      },
      {
        id: 'loc1_2', nome: 'Barraca do Pajé', desc: 'O Pajé sempre vê mais do que conta.',
        pistas: ['p1_2'],
      },
      {
        id: 'loc1_3', nome: 'Cortiço', desc: 'O dono do cortiço guarda recibos de todo mundo.',
        pistas: ['p1_3'],
      },
      {
        id: 'loc1_4', nome: 'Terminal', desc: 'A Analista disse que tinha dados. Dados custam tempo.',
        pistas: ['p1_4'],
        puzzle: 'decoder',
        puzzleLabel: 'decifrar mensagem',
      },
      {
        id: 'loc1_5', nome: 'Risca a Faca', desc: 'O segurança do clube disse que viu algo. Mas o horário não fecha.',
        pistas: ['p1_5'],
        dungeon: 'risca_faca_interior',
        dungeonLabel: 'entrar no clube (3 inimigos)',
      },
    ],
    pistasNecessarias: 4,
    confronto: { dungeon: 'onibus', boss: 'Cobrador Fantasma' },
    resolucao: {
      monologo: 'osvaldo não disse obrigado. mas fez uma manutenção na bengala de graça. no sonho isso conta como gratidão.',
      recompensa: { flag: 'OSVALDO_ALIADO', monologo: 'osvaldo agora luta ao seu lado. +1 dano em todas as dungeons.' },
    },
  },

  caso2: {
    id: 'caso2',
    nome: 'O Carregamento Sumido',
    cidade: 'auranis',
    cliente: 'Karim',
    flagRequisito: 'AURANIS_LIBERADO',
    flagResolucao: 'CASO2_RESOLVIDO',
    abertura: [
      'auranis cheirava a sal e a negócio inacabado.',
      '"o carregamento sumiu", karim disse. "fragmentos. muito valor."',
      '"tem suspeito?" "tem três." típico.',
    ],
    suspeitos: [
      { id: 'sus2_1', nome: 'Operativo do Mercado Negro', desc: 'Sabia do carregamento. Tinha acesso ao porto.', culpado: true },
      { id: 'sus2_2', nome: 'Capitão do Porto Velho', desc: 'Controlava entrada e saída. Ninguém passava sem ele saber.', culpado: false },
      { id: 'sus2_3', nome: 'Informante Anônimo', desc: 'Vendeu a rota do carregamento pra alguém. Quem?', culpado: false },
    ],
    locais: [
      {
        id: 'loc2_1', nome: 'Porto Velho', desc: 'Container aberto. Fragmentos esquecidos no chão.',
        pistas: ['p2_1'],
        dungeon: 'porto_velho',
        dungeonLabel: 'derrotar guardas (5 inimigos)',
      },
      {
        id: 'loc2_2', nome: 'Mercado Negro', desc: 'O Operativo estava nervoso. Respostas vagas.',
        pistas: ['p2_2'],
      },
      {
        id: 'loc2_3', nome: 'Pensão Rua 7', desc: 'Karim tinha uma nota com coordenadas. Rasgada.',
        pistas: ['p2_3'],
        puzzle: 'sliding',
        puzzleLabel: 'reconstituir nota rasgada',
      },
      {
        id: 'loc2_4', nome: 'Doca Abandonada', desc: 'Símbolo do Mercado Negro marcado na parede.',
        pistas: ['p2_4'],
        requerNoite: true,
      },
      {
        id: 'loc2_5', nome: 'Terminal Auranis', desc: 'O Operativo disse que esteve aqui. Mas o registro diz outra coisa.',
        pistas: ['p2_5'],
        puzzle: 'decoder',
        puzzleLabel: 'decifrar registro',
      },
    ],
    pistasNecessarias: 4,
    confronto: { dungeon: 'doca_abandonada', boss: 'Operativo' },
    resolucao: {
      monologo: 'o operativo caiu. os fragmentos voltaram pra karim. ele me ofereceu parte. eu recusei. no sonho eu tenho princípios.',
      recompensa: { flag: 'KARIM_DEVE_FAVOR', flagDungeon: 'KARIM_CONFIA', monologo: 'karim me deve um favor. isso vale mais que dinheiro.' },
    },
  },

  caso3: {
    id: 'caso3',
    nome: 'A Pista Sem Remetente',
    cidade: 'karnazar',
    cliente: null,
    flagRequisito: 'KARNAZAR_LIBERADO',
    flagResolucao: 'CASO3_RESOLVIDO',
    abertura: [
      'karnazar. eu não lembro de ter vindo pra cá.',
      'tinha um envelope na minha mão quando acordei dentro do sonho.',
      'sem nome. sem endereço. coordenadas de um lugar que não devia existir.',
    ],
    suspeitos: [
      { id: 'sus3_1', nome: 'Kronos', desc: 'Espírito que aparece na Torre. Ligado às coordenadas.', culpado: false },
      { id: 'sus3_2', nome: 'Viran', desc: 'Sabe mais do que conta. Treina Jack sem explicar por quê.', culpado: false },
      { id: 'sus3_3', nome: 'O Próprio Jack?', desc: 'E se o remetente for Jack de outro sonho? A letra... parece familiar.', culpado: true },
    ],
    locais: [
      {
        id: 'loc3_1', nome: 'Dojô de Viran', desc: 'Viran reconheceu o símbolo do envelope. Ficou pálido.',
        pistas: ['p3_1'],
      },
      {
        id: 'loc3_2', nome: 'Rua Branca', desc: 'Pegadas que somem no meio do caminho.',
        pistas: ['p3_2'],
        dungeon: 'rua_branca',
        dungeonLabel: 'enfrentar o frio (8 inimigos)',
      },
      {
        id: 'loc3_3', nome: 'O Escuro', desc: 'Segundo envelope. Mesmo símbolo. Data diferente.',
        pistas: ['p3_3'],
        especial: 'escuro',
      },
      {
        id: 'loc3_4', nome: 'Observatório (Tira)', desc: 'Tira tem um arquivo. Nome de Kronos. As coordenadas.',
        pistas: ['p3_4'],
        puzzle: 'sliding',
        puzzleLabel: 'reconstituir arquivo',
      },
      {
        id: 'loc3_5', nome: 'Ilha Privada (entrada)', desc: 'Kronos estava em dois lugares ao mesmo tempo. Impossível... a não ser que...',
        pistas: ['p3_5'],
        puzzle: 'stealth',
        puzzleLabel: 'passar sem ser visto',
      },
    ],
    pistasNecessarias: 4,
    confronto: { dungeon: 'torre_kronos', mecanica: 'fuga' },
    resolucao: {
      monologo: 'ele não mandou o envelope. eu mandei. de algum lugar no sonho que eu ainda não fui.',
      recompensa: { flag: 'KRONOS_VIU_CASO3', monologo: 'o medidor primordial aparece. você sente algo diferente.' },
    },
  },

  caso4: {
    id: 'caso4',
    nome: 'Quem Sabotou o Sonho',
    cidade: 'revisita',
    cliente: null,
    flagRequisito: 'CASO3_RESOLVIDO',
    flagResolucao: 'CASO4_RESOLVIDO',
    abertura: [
      'eu tinha resolvido três casos.',
      'e só agora percebi: tinha alguém em todos eles.',
      'no boteco. no porto. na pensão. sempre lá.',
      'eu precisava revisitar tudo. e dessa vez, eu sabia o que procurar.',
    ],
    suspeitos: [
      { id: 'sus4_1', nome: 'Kim', desc: 'Garçom do Boteco do Jazz. Presente em todos os casos. Sempre com cara de quem sabe mais.', culpado: true },
    ],
    locais: [
      { id: 'loc4_1', nome: 'Boteco do Jazz (Marelia)', desc: 'Copo com impressão digital. Não é de nenhum suspeito.', pistas: ['p4_1'] },
      { id: 'loc4_2', nome: 'Oficina (Marelia)', desc: 'Marca de bengala no chão. Não é a minha.', pistas: ['p4_2'] },
      { id: 'loc4_3', nome: 'Porto Velho (Auranis)', desc: 'Estivador viu um garçom de chapéu conversando com o Operativo.', pistas: ['p4_3'] },
      { id: 'loc4_4', nome: 'Pensão (Auranis)', desc: 'Karim tem anotação com nome "J". Não é Jack.', pistas: ['p4_4'] },
      { id: 'loc4_5', nome: 'Dojô de Viran (Karnazar)', desc: 'Viran diz que Kim "passou por aqui faz tempo".', pistas: ['p4_5'] },
      { id: 'loc4_6', nome: 'O Escuro (Karnazar)', desc: 'Terceiro envelope. A letra é de Kim.', pistas: ['p4_6'] },
    ],
    pistasNecessarias: 5,
    confronto: { especial: 'interrogatorio' },
    resolucao: {
      monologo: 'kim caiu. mas ele estava sorrindo. eu odeio quando ele faz isso. "te preparando", ele disse. "acorda, jack." eu acordei. kim tava do meu lado mandando meme no whatsapp. típico.',
      recompensa: { flag: 'KIM_REVELADO', monologo: 'o sonho termina. ou começa. com kim nunca se sabe.' },
    },
  },
}
