export const CASOS = [
  //══ CASO 01 ═══════════════════════════════════════════
  {
    id: 'caso_01', desbloqueado: true, reputacao_minima: 0, reputacao_ganho: 100, dificuldade: 1, desbloqueia: ['caso_02', 'caso_03'], thumbnail: '🌧️',
    i18n: { pt: { nome: 'A Primeira Noite', subtitulo: 'Osvaldo sumiu. Alguém queria que ele sumisse.' }, en: { nome: 'The First Night', subtitulo: 'Osvaldo is gone. Someone wanted him gone.' }, es: { nome: 'La Primera Noche', subtitulo: 'Osvaldo desapareció. Alguien quería que desapareciera.' } },
    suspeitos: [
      { id: 'osvaldo', i18n: { pt: { nome: 'Osvaldo', bio: 'Dono do bar. Sabe de tudo, fala de menos.' }, en: { nome: 'Osvaldo', bio: 'Bar owner. Knows everything, says nothing.' }, es: { nome: 'Osvaldo', bio: 'Dueño del bar. Sabe todo, habla poco.' } }, culpado: false, avatar: '👴' },
      { id: 'homem_terno', i18n: { pt: { nome: 'O Homem do Terno', bio: 'Sempre de terno. Sempre onde não deveria estar.' }, en: { nome: 'The Man in the Suit', bio: 'Always in a suit.' }, es: { nome: 'El Hombre del Traje', bio: 'Siempre de traje.' } }, culpado: true, avatar: '🕴️' },
    ],
    pistas_necessarias: 3,
    locais: [
      { id: 'beco_estacao', puzzle: 'decoder', i18n: { pt: { nome: 'Beco da Estação', desc: 'Úmido. Escuro. Cheira a cigarro velho e segredos.' }, en: { nome: 'Station Alley', desc: 'Damp. Dark. Smells of old cigarettes.' }, es: { nome: 'Callejón de la Estación', desc: 'Húmedo. Oscuro.' } }, pista_id: 'pista_01_01' },
      { id: 'bar_esquina', puzzle: null, i18n: { pt: { nome: 'Bar da Esquina', desc: 'Todo mundo passa por aqui mais cedo ou mais tarde.' }, en: { nome: 'Corner Bar', desc: 'Everyone passes through sooner or later.' }, es: { nome: 'Bar de la Esquina', desc: 'Todo el mundo pasa por aquí.' } }, pista_id: 'pista_01_02' },
      { id: 'delegacia', puzzle: 'stealth', i18n: { pt: { nome: 'Delegacia Central', desc: 'Arquivos empoeirados e casos não resolvidos.' }, en: { nome: 'Central Precinct', desc: 'Dusty files and unsolved cases.' }, es: { nome: 'Comisaría Central', desc: 'Archivos polvorientos.' } }, pista_id: 'pista_01_03' },
    ],
    pistas: [
      { id: 'pista_01_01', tipo: 'objeto', fio: false, i18n: { pt: { titulo: 'Bituca de Charuto Caro', desc: 'Marca importada. Osvaldo fumava cigarro barato.' }, en: { titulo: 'Expensive Cigar Stub', desc: 'Imported brand.' }, es: { titulo: 'Punta de Cigarro Caro', desc: 'Marca importada.' } } },
      { id: 'pista_01_02', tipo: 'testemunho', fio: false, i18n: { pt: { titulo: 'Relato do Zé do Bar', desc: 'Viu Osvaldo ser abordado por um homem de terno.' }, en: { titulo: "Bar Owner's Testimony", desc: 'Saw Osvaldo approached by a man in a suit.' }, es: { titulo: 'Testimonio del Barman', desc: 'Vio a Osvaldo ser abordado por un hombre de traje.' } } },
      { id: 'pista_01_03', tipo: 'fio', fio: true, i18n: { pt: { titulo: 'Envelope sem Remetente', desc: 'Carta manuscrita. Uma inicial no verso: K.' }, en: { titulo: 'Anonymous Envelope', desc: 'Handwritten letter. One initial on the back: K.' }, es: { titulo: 'Sobre sin Remitente', desc: 'Carta manuscrita. Una inicial al dorso: K.' } } },
    ],
    dialogo: {
      abertura: [
        { de: 'nina', i18n: { pt: 'Jack.', en: 'Jack.', es: 'Jack.' }, delay: 0 },
        { de: 'nina', i18n: { pt: 'JACK.', en: 'JACK.', es: 'JACK.' }, delay: 1600 },
        { de: 'jack', i18n: { pt: 'minha senhora, são 23h, eu tô de serviço', en: "ma'am, it's 11pm, I'm on duty", es: 'señora, son las 23h, estoy de servicio' }, delay: 3000 },
        { de: 'jack', i18n: { pt: 'o serviço é descansar', en: 'the duty is resting', es: 'el servicio es descansar' }, delay: 4200 },
        { de: 'nina', i18n: { pt: 'o Osvaldo sumiu', en: 'Osvaldo is gone', es: 'Osvaldo desapareció' }, delay: 6000 },
        { de: 'jack', i18n: { pt: 'define sumiu', en: "define 'gone'", es: 'define desapareció' }, delay: 9500 },
        { de: 'nina', i18n: { pt: 'não chegou em casa. ninguém viu ele depois das 19h', en: "didn't come home. nobody saw him after 7pm", es: 'no llegó a casa. nadie lo vio después de las 19h' }, delay: 11000 },
        { de: 'jack', i18n: { pt: 'osvaldo não some. osvaldo É o portão', en: "osvaldo doesn't disappear. osvaldo IS the gate", es: 'osvaldo no desaparece. osvaldo ES la reja' }, delay: 14000 },
        { de: 'nina', i18n: { pt: 'exatamente', en: 'exactly', es: 'exactamente' }, delay: 16000 },
        { de: 'jack', i18n: { pt: '...tô pegando minha bengala', en: "...I'm getting my cane", es: '...voy a buscar mi bastón' }, delay: 17500 },
      ],
      resolucao: [
        { de: 'jack', i18n: { pt: 'ele foi voluntariamente', en: 'he left willingly', es: 'se fue voluntariamente' }, delay: 0 },
        { de: 'jack', i18n: { pt: 'alguém mandou um envelope. ele leu e foi', en: 'someone sent an envelope. he read it and left', es: 'alguien mandó un sobre. lo leyó y se fue' }, delay: 1500 },
        { de: 'nina', i18n: { pt: 'pra onde', en: 'where to', es: 'a dónde' }, delay: 3000 },
        { de: 'jack', i18n: { pt: 'não sei ainda', en: "don't know yet", es: 'todavía no sé' }, delay: 4500 },
        { de: 'nina', i18n: { pt: 'a letra no envelope', en: 'the letter on the envelope', es: 'la letra en el sobre' }, delay: 6000 },
        { de: 'jack', i18n: { pt: 'K', en: 'K', es: 'K' }, delay: 7500 },
        { de: 'nina', i18n: { pt: 'quem é K', en: 'who is K', es: 'quién es K' }, delay: 13000 },
        { de: 'jack', i18n: { pt: 'boa pergunta pra dormir pensando', en: 'good question to sleep on', es: 'buena pregunta para pensar al dormir' }, delay: 15000 },
        { de: 'jack', i18n: { pt: 'boa noite nina', en: 'good night nina', es: 'buenas noches nina' }, delay: 16500 },
        { de: 'nina', i18n: { pt: '...boa noite', en: '...good night', es: '...buenas noches' }, delay: 18500 },
      ],
      narracao_abertura: { pt: 'Osvaldo era o tipo de homem que a cidade esquece que precisa até o dia que ele não está mais lá.', en: 'Osvaldo was the kind of man the city forgets it needs.', es: 'Osvaldo era el tipo de hombre que la ciudad olvida que necesita.' },
      narracao_final: { pt: 'Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele.', en: 'Osvaldo always opened doors for us.', es: 'Osvaldo siempre nos abrió puertas.' },
    },
    pista_kronos: { pt: 'No envelope, uma letra: K.', en: 'On the envelope, one letter: K.', es: 'En el sobre, una letra: K.' },
  },
  //══ CASO 02 ═══════════════════════════════════════════
  {
    id: 'caso_02', desbloqueado: false, reputacao_minima: 0, reputacao_ganho: 100, dificuldade: 1, desbloqueia: ['caso_04'], thumbnail: '🔒',
    i18n: { pt: { nome: 'O Portão Fechado', subtitulo: 'Alguém trancava o portão toda noite. Por quê?' }, en: { nome: 'The Locked Gate', subtitulo: 'Someone locked the gate every night. Why?' }, es: { nome: 'La Reja Cerrada', subtitulo: 'Alguien cerraba la reja cada noche. ¿Por qué?' } },
    suspeitos: [
      { id: 'zelador', i18n: { pt: { nome: 'Zelador', bio: 'Varre o mesmo trecho três vezes. Homem nervoso.' }, en: { nome: 'Janitor', bio: 'Sweeps the same spot three times.' }, es: { nome: 'Conserje', bio: 'Barre el mismo tramo tres veces.' } }, culpado: true, avatar: '🧹' },
      { id: 'aluno_rico', i18n: { pt: { nome: 'Aluno Rico', bio: 'Histórico de vandalismo. Sempre tem álibi.' }, en: { nome: 'Rich Student', bio: 'History of vandalism.' }, es: { nome: 'Alumno Rico', bio: 'Historial de vandalismo.' } }, culpado: false, avatar: '👦' },
    ],
    pistas_necessarias: 2,
    locais: [
      { id: 'portao', puzzle: null, i18n: { pt: { nome: 'Portão de Serviço', desc: 'Trancado toda noite. Sem explicação oficial.' }, en: { nome: 'Service Gate', desc: 'Locked every night.' }, es: { nome: 'Portón de Servicio', desc: 'Cerrado cada noche.' } }, pista_id: 'pista_02_01' },
      { id: 'deposito', puzzle: 'labirinto', i18n: { pt: { nome: 'Depósito', desc: 'Fundos da escola. Onde ninguém olha.' }, en: { nome: 'Storage Room', desc: 'School backyard.' }, es: { nome: 'Almacén', desc: 'Donde nadie mira.' } }, pista_id: 'pista_02_02' },
    ],
    pistas: [
      { id: 'pista_02_01', tipo: 'objeto', fio: false, i18n: { pt: { titulo: 'Cadeado Novo', desc: 'Comprado essa semana. Zelador pagou com dinheiro vivo.' }, en: { titulo: 'New Padlock', desc: 'Bought this week. Janitor paid cash.' }, es: { titulo: 'Candado Nuevo', desc: 'Comprado esta semana.' } } },
      { id: 'pista_02_02', tipo: 'documento', fio: false, i18n: { pt: { titulo: 'Envelope de Dinheiro', desc: 'Espécie. Sem nome. Quem paga em espécie não quer ser encontrado.' }, en: { titulo: 'Cash Envelope', desc: 'Cash. No name.' }, es: { titulo: 'Sobre con Efectivo', desc: 'Efectivo. Sin nombre.' } } },
    ],
    dialogo: {
      abertura: [
        { de: 'anonimo', i18n: { pt: 'boa noite. me indicaram o senhor', en: 'good evening. I was referred to you', es: 'buenas noches. me lo recomendaron' }, delay: 0 },
        { de: 'jack', i18n: { pt: 'pode chamar de jack. o senhor me envelhece', en: 'call me jack', es: 'llámame jack' }, delay: 3000 },
        { de: 'anonimo', i18n: { pt: 'o portão da escola tá sendo trancado toda noite há uma semana', en: 'the school gate has been locked every night for a week', es: 'la reja de la escuela está siendo cerrada cada noche' }, delay: 4500 },
        { de: 'jack', i18n: { pt: 'e a escola não resolve?', en: "and the school won't fix it?", es: '¿y la escuela no lo resuelve?' }, delay: 8500 },
        { de: 'anonimo', i18n: { pt: 'disseram que não sabem quem faz', en: "they said they don't know who does it", es: 'dijeron que no saben quién lo hace' }, delay: 10000 },
        { de: 'jack', i18n: { pt: 'conveniente', en: 'convenient', es: 'conveniente' }, delay: 12000 },
        { de: 'jack', i18n: { pt: 'me manda o endereço', en: 'send me the address', es: 'mándame la dirección' }, delay: 13500 },
      ],
      resolucao: [
        { de: 'jack', i18n: { pt: 'zelador. alguém pagou ele pra trancar', en: 'janitor. someone paid him to lock it', es: 'conserje. alguien le pagó para cerrarlo' }, delay: 0 },
        { de: 'anonimo', i18n: { pt: 'quem pagou?', en: 'who paid?', es: '¿quién pagó?' }, delay: 2000 },
        { de: 'jack', i18n: { pt: 'não sabe. espécie. entregue por terceiro', en: "doesn't know. cash. delivered by a middleman", es: 'no sabe. efectivo. entregado por un tercero' }, delay: 3500 },
        { de: 'jack', i18n: { pt: 'tive uma conversa com ele', en: 'I had a conversation with him', es: 'tuve una conversación con él' }, delay: 8000 },
        { de: 'jack', i18n: { pt: 'cuida do seu filho', en: 'take care of your son', es: 'cuida a tu hijo' }, delay: 13000 },
      ],
      narracao_abertura: { pt: 'Portões trancados em Marelia não eram novidade.', en: 'Locked gates in Marelia were not unusual.', es: 'Las rejas cerradas en Marelia no eran novedad.' },
      narracao_final: { pt: 'O zelador ia ficar com o dinheiro e com a consciência.', en: 'The janitor would keep the money and the guilt.', es: 'El conserje se quedaría con el dinero.' },
    },
    pista_kronos: null,
  },
]

// casos 03-19: placeholder com estrutura mínima
for (let i = 3; i <= 19; i++) {
  const id = `caso_${String(i).padStart(2, '0')}`
  const deps = id === 'caso_06' ? ['caso_04', 'caso_05'] : id === 'caso_10' ? ['caso_07', 'caso_08', 'caso_09'] : id === 'caso_13' ? ['caso_11', 'caso_12'] : id === 'caso_17' ? ['caso_14', 'caso_15', 'caso_16'] : [i - 1].map(n => `caso_${String(n).padStart(2, '0')}`)
  const nextId = [`caso_${String(i + 1).padStart(2, '0')}`]
  if (id === 'caso_06') { nextId.push('caso_07', 'caso_08', 'caso_09') }
  if (id === 'caso_13') { nextId.push('caso_14', 'caso_15', 'caso_16') }
  if (id === 'caso_17') { nextId.push('caso_18', 'caso_19') }
  CASOS.push({
    id, desbloqueado: false, reputacao_minima: (i - 1) * 50, reputacao_ganho: 100 + i * 20, dificuldade: Math.min(5, Math.ceil(i / 4)),
    desbloqueia: id === 'caso_19' ? ['caso_20'] : nextId, thumbnail: '📋',
    i18n: { pt: { nome: `Caso ${i}`, subtitulo: `[placeholder] Investigação em Marelia.` }, en: { nome: `Case ${i}`, subtitulo: `[placeholder] Investigation in Marelia.` }, es: { nome: `Caso ${i}`, subtitulo: `[placeholder] Investigación en Marelia.` } },
    suspeitos: [{ id: 'sus1', i18n: { pt: { nome: 'Suspeito A', bio: 'Placeholder.' }, en: { nome: 'Suspect A', bio: 'Placeholder.' }, es: { nome: 'Sospechoso A', bio: 'Placeholder.' } }, culpado: true, avatar: '👤' }, { id: 'sus2', i18n: { pt: { nome: 'Suspeito B', bio: 'Placeholder.' }, en: { nome: 'Suspect B', bio: 'Placeholder.' }, es: { nome: 'Sospechoso B', bio: 'Placeholder.' } }, culpado: false, avatar: '👤' }],
    pistas_necessarias: 2, locais: [{ id: 'loc1', puzzle: 'decoder', i18n: { pt: { nome: 'Local A', desc: 'Placeholder.' }, en: { nome: 'Place A', desc: 'Placeholder.' }, es: { nome: 'Lugar A', desc: 'Placeholder.' } }, pista_id: `pista_${id}_01` }, { id: 'loc2', puzzle: null, i18n: { pt: { nome: 'Local B', desc: 'Placeholder.' }, en: { nome: 'Place B', desc: 'Placeholder.' }, es: { nome: 'Lugar B', desc: 'Placeholder.' } }, pista_id: `pista_${id}_02` }],
    pistas: [{ id: `pista_${id}_01`, tipo: 'objeto', fio: i % 3 === 0, i18n: { pt: { titulo: 'Pista A', desc: 'Placeholder.' }, en: { titulo: 'Clue A', desc: 'Placeholder.' }, es: { titulo: 'Pista A', desc: 'Placeholder.' } } }, { id: `pista_${id}_02`, tipo: 'testemunho', fio: false, i18n: { pt: { titulo: 'Pista B', desc: 'Placeholder.' }, en: { titulo: 'Clue B', desc: 'Placeholder.' }, es: { titulo: 'Pista B', desc: 'Placeholder.' } } }],
    dialogo: { abertura: [{ de: 'jack', i18n: { pt: `[placeholder] Caso ${i}.`, en: `[placeholder] Case ${i}.`, es: `[placeholder] Caso ${i}.` }, delay: 0 }], resolucao: [{ de: 'jack', i18n: { pt: '[placeholder] resolvido.', en: '[placeholder] solved.', es: '[placeholder] resuelto.' }, delay: 0 }], narracao_abertura: { pt: `[placeholder] Caso ${i}.`, en: `[placeholder] Case ${i}.`, es: `[placeholder] Caso ${i}.` }, narracao_final: { pt: '[placeholder]', en: '[placeholder]', es: '[placeholder]' } },
    pista_kronos: i % 3 === 0 ? { pt: '[placeholder] K.', en: '[placeholder] K.', es: '[placeholder] K.' } : null,
  })
}

//══ CASO 20 ═══════════════════════════════════════════
CASOS.push({
  id: 'caso_20', desbloqueado: false, reputacao_minima: 1500, reputacao_ganho: 1000, dificuldade: 5, desbloqueia: [], thumbnail: '💀',
  i18n: { pt: { nome: 'PESADELO PARTICULAR', subtitulo: 'O sonho termina aqui.' }, en: { nome: 'PRIVATE NIGHTMARE', subtitulo: 'The dream ends here.' }, es: { nome: 'PESADILLA PARTICULAR', subtitulo: 'El sueño termina aquí.' } },
  suspeitos: [{ id: 'kim', i18n: { pt: { nome: 'Kim', bio: 'O dono do bar. O cérebro. O fim de tudo.' }, en: { nome: 'Kim', bio: 'The bar owner. The brain.' }, es: { nome: 'Kim', bio: 'El dueño del bar.' } }, culpado: true, avatar: '🔥' }],
  pistas_necessarias: 0, locais: [],
  pistas: [],
  dialogo: {
    abertura: [
      { de: 'jack', i18n: { pt: 'Você manipulou tudo. Cada caso. Cada morte. Por quê?', en: 'You manipulated everything. Every case. Every death. Why?', es: 'Manipulaste todo. Cada caso. Cada muerte. ¿Por qué?' }, delay: 0 },
      { de: 'kim', i18n: { pt: 'Porque alguém precisava. E eu era o único que podia.', en: 'Because someone needed to. And I was the only one who could.', es: 'Porque alguien necesitaba. Y yo era el único que podía.' }, delay: 3000 },
      { de: 'jack', i18n: { pt: 'Então me conta. Tudo.', en: 'Then tell me. Everything.', es: 'Entonces cuéntame. Todo.' }, delay: 6000 },
      { de: 'kim', i18n: { pt: 'Você quer saber o que realmente aconteceu?', en: 'You want to know what really happened?', es: '¿Quieres saber lo que realmente pasó?' }, delay: 9000 },
      { de: 'jack', i18n: { pt: 'Quero.', en: 'I do.', es: 'Quiero.' }, delay: 12000 },
      { de: 'kim', i18n: { pt: 'Então ouça. Porque essa é a última conversa que teremos.', en: 'Then listen. Because this is the last conversation we will have.', es: 'Entonces escucha. Porque esta es la última conversación que tendremos.' }, delay: 15000 },
    ],
    resolucao: [
      { de: 'narracao', i18n: { pt: 'O sonho está acabando.', en: 'The dream is ending.', es: 'El sueño está terminando.' }, delay: 0 },
    ],
    narracao_abertura: { pt: 'O bar está vazio. Kim espera atrás do balcão.', en: 'The bar is empty. Kim waits behind the counter.', es: 'El bar está vacío. Kim espera detrás de la barra.' },
    narracao_final: { pt: 'Jack acorda.', en: 'Jack wakes up.', es: 'Jack despierta.' },
    final_completo: [{ de: 'kim', i18n: { pt: 'Você coletou tudo. Não tem como negar.', en: 'You collected everything. I cannot deny it.', es: 'Recolectaste todo. No puedo negarlo.' }, delay: 0 }, { de: 'jack', i18n: { pt: 'Acabou, Kim.', en: "It's over, Kim.", es: 'Se acabó, Kim.' }, delay: 3000 }, { de: 'kim', i18n: { pt: '...Você tem razão.', en: "...You're right.", es: '...Tienes razón.' }, delay: 6000 }],
    final_fragmentado: [{ de: 'kim', i18n: { pt: 'Você não tem todas as provas. E sabe disso.', en: "You don't have all the evidence. And you know it.", es: 'No tienes todas las pruebas. Y lo sabes.' }, delay: 0 }, { de: 'jack', i18n: { pt: '...', en: '...', es: '...' }, delay: 3000 }, { de: 'kim', i18n: { pt: 'Talvez na próxima vez.', en: 'Maybe next time.', es: 'Quizás la próxima vez.' }, delay: 6000 }],
  },
  pista_kronos: { pt: 'A verdade completa. Kim revela tudo.', en: 'The complete truth. Kim reveals everything.', es: 'La verdad completa. Kim revela todo.' },
})
