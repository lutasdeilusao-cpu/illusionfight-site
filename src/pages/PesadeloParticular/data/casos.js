export const CASOS = [
  {
    "id": "caso_01",
    "desbloqueado": true,
    "reputacao_minima": 0,
    "reputacao_ganho": 100,
    "dificuldade": 1,
    "desbloqueia": [
      "caso_02",
      "caso_03"
    ],
    "thumbnail": "🌧️",
    "i18n": {
      "pt": {
        "nome": "A Primeira Noite",
        "subtitulo": "Osvaldo sumiu."
      },
      "en": {
        "nome": "The First Night",
        "subtitulo": "Osvaldo vanished."
      },
      "es": {
        "nome": "La Primera Noche",
        "subtitulo": "Osvaldo desapareció."
      }
    },
    "suspeitos": [
      {
        "id": "osvaldo",
        "i18n": {
          "pt": {
            "nome": "Osvaldo",
            "bio": "Dono do bar. Sabe de tudo."
          },
          "en": {
            "nome": "Osvaldo",
            "bio": "Bar owner. Knows everything."
          },
          "es": {
            "nome": "Osvaldo",
            "bio": "Dueño del bar. Lo sabe todo."
          }
        },
        "culpado": false,
        "avatar": "👴"
      },
      {
        "id": "homem_terno",
        "i18n": {
          "pt": {
            "nome": "O Homem do Terno",
            "bio": "Sempre de terno."
          },
          "en": {
            "nome": "The Man in the Suit",
            "bio": "Always in a suit."
          },
          "es": {
            "nome": "El Hombre del Traje",
            "bio": "Siempre de traje."
          }
        },
        "culpado": true,
        "avatar": "🕴️"
      }
    ],
    "pistas_necessarias": 3,
    "locais": [
      {
        "id": "beco_estacao",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Beco da Estação",
            "desc": "Úmido. Escuro."
          },
          "en": {
            "nome": "Station Alley",
            "desc": "Damp. Dark."
          },
          "es": {
            "nome": "Callejón de la Estación",
            "desc": "Húmedo. Oscuro."
          }
        },
        "pista_id": "p01a"
      },
      {
        "id": "bar_esquina",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Bar da Esquina",
            "desc": "Todo mundo passa."
          },
          "en": {
            "nome": "Corner Bar",
            "desc": "Everyone passes by."
          },
          "es": {
            "nome": "Bar da Esquina",
            "desc": "Todo mundo passa."
          }
        },
        "pista_id": "p01b"
      },
      {
        "id": "delegacia",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Delegacia Central",
            "desc": "Arquivos empoeirados."
          },
          "en": {
            "nome": "Central Police Station",
            "desc": "Dusty files."
          },
          "es": {
            "nome": "Comisaría Central",
            "desc": "Archivos polvorientos."
          }
        },
        "pista_id": "p01c"
      }
    ],
    "pistas": [
      {
        "id": "p01a",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "O substituto suava",
            "desc": "Mais do que o calor justificava."
          },
          "en": {
            "titulo": "The substitute was sweating",
            "desc": "More than the heat justified."
          },
          "es": {
            "titulo": "El sustituto sudaba",
            "desc": "Más de lo que el calor justificaba."
          }
        }
      },
      {
        "id": "p01b",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Relato do Zé do Bar",
            "desc": "Viu tudo e não queria ter visto."
          },
          "en": {
            "titulo": "Zé from the Bar's account",
            "desc": "Saw everything and wished he hadn't."
          },
          "es": {
            "titulo": "Relato del Zé del Bar",
            "desc": "Vio todo y no quería haberlo visto."
          }
        }
      },
      {
        "id": "p01c",
        "tipo": "fio",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Envelope sem Remetente",
            "desc": "Uma inicial: K. Guardei no bolso."
          },
          "en": {
            "titulo": "Envelope with no Sender",
            "desc": "One initial: K. I kept it in my pocket."
          },
          "es": {
            "titulo": "Sobre sin Remitente",
            "desc": "Una inicial: K. Lo guardé en el bolsillo."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "nina",
          "i18n": {
            "pt": "Jack.",
            "en": "Jack.",
            "es": "Jack."
          },
          "delay": 0
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "JACK.",
            "en": "JACK.",
            "es": "JACK."
          },
          "delay": 1600
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "minha senhora, são 23h, eu tô de serviço",
            "en": "ma'am it's 11pm",
            "es": "señora son las 23h"
          },
          "delay": 3000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "o serviço é descansar",
            "en": "the duty is resting",
            "es": "el servicio es descansar"
          },
          "delay": 4200
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "o Osvaldo sumiu",
            "en": "Osvaldo is gone",
            "es": "Osvaldo desapareció"
          },
          "delay": 6000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "define sumiu",
            "en": "define gone",
            "es": "define desapareció"
          },
          "delay": 9500
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "não chegou em casa. ninguém viu ele depois das 19h",
            "en": "he didnt come home",
            "es": "no llegó a casa"
          },
          "delay": 11000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "osvaldo não some. osvaldo É o portão",
            "en": "osvaldo IS the gate",
            "es": "osvaldo ES la reja"
          },
          "delay": 14000
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "exatamente",
            "en": "exactly",
            "es": "exactamente"
          },
          "delay": 16000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "...tô pegando minha bengala",
            "en": "...I'm getting my cane",
            "es": "...voy a buscar mi bastón"
          },
          "delay": 17500
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "ele foi voluntariamente",
            "en": "he left willingly",
            "es": "se fue voluntariamente"
          },
          "delay": 0
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "alguém mandou um envelope. ele leu e foi",
            "en": "someone sent an envelope",
            "es": "alguien mandó un sobre"
          },
          "delay": 1500
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "pra onde",
            "en": "where to",
            "es": "a dónde"
          },
          "delay": 3000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "não sei ainda",
            "en": "don't know yet",
            "es": "todavía no sé"
          },
          "delay": 4500
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "a letra no envelope",
            "en": "the letter on the envelope",
            "es": "la letra en el sobre"
          },
          "delay": 6000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "K",
            "en": "K",
            "es": "K"
          },
          "delay": 7500
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "quem é K",
            "en": "who is K",
            "es": "quién es K"
          },
          "delay": 13000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "boa pergunta pra dormir pensando",
            "en": "good question to sleep on",
            "es": "buena pregunta"
          },
          "delay": 15000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "boa noite nina",
            "en": "good night nina",
            "es": "buenas noches nina"
          },
          "delay": 16500
        },
        {
          "de": "nina",
          "i18n": {
            "pt": "...boa noite",
            "en": "...good night",
            "es": "...buenas noches"
          },
          "delay": 18500
        }
      ],
      "narracao_abertura": {
        "pt": "Osvaldo era o tipo de homem que a cidade esquece que precisa até o dia que ele não está mais lá.",
        "en": "Osvaldo was the kind of man the city forgets it needs until the day he's no longer there.",
        "es": "Osvaldo era el tipo de hombre que la ciudad olvida que necesita hasta el día que ya no está."
      },
      "narracao_final": {
        "pt": "Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele.",
        "en": "Osvaldo always opened doors for people. Now someone had opened a door for him.",
        "es": "Osvaldo siempre abrió puertas para la gente. Ahora alguien le había abierto una puerta a él."
      }
    },
    "pista_kronos": {
      "pt": "No envelope, uma letra: K.",
      "en": "On the envelope, one letter: K.",
      "es": "En el sobre, una letra: K."
    }
  },
  {
  "id": "caso_02",
  "desbloqueado": false,
  "reputacao_minima": 0,
  "reputacao_ganho": 100,
  "dificuldade": 1,
  "desbloqueia": [
    "caso_04"
  ],
  "thumbnail": "🔒",
  "i18n": {
    "pt": {
      "nome": "O Portão Fechado",
      "subtitulo": "Alguém trancava o portão toda noite. Por quê?"
    },
    "en": {
      "nome": "The Locked Gate",
      "subtitulo": "Someone locked the gate every night. Why?"
    },
    "es": {
      "nome": "La Reja Cerrada",
      "subtitulo": "Alguien cerraba la reja cada noche. ¿Por qué?"
    }
  },
  "suspeitos": [
    {
      "id": "zelador",
      "i18n": {
        "pt": {
          "nome": "Zelador",
          "bio": "Varre o mesmo trecho três vezes. Homem nervoso."
        },
        "en": {
          "nome": "Janitor",
          "bio": "Sweeps the same stretch three times. Nervous man."
        },
        "es": {
          "nome": "Conserje",
          "bio": "Barre el mismo tramo tres veces. Hombre nervioso."
        }
      },
      "culpado": true,
      "avatar": "🧹"
    },
    {
      "id": "aluno_rico",
      "i18n": {
        "pt": {
          "nome": "Aluno Rico",
          "bio": "Histórico de vandalismo. Sempre tem álibi."
        },
        "en": {
          "nome": "Rich Student",
          "bio": "History of vandalism. Always has an alibi."
        },
        "es": {
          "nome": "Estudiante Rico",
          "bio": "Historial de vandalismo. Siempre tiene coartada."
        }
      },
      "culpado": false,
      "avatar": "👦"
    }
  ],
  "pistas_necessarias": 2,
  "locais": [
    {
      "id": "portao_servico",
      "puzzle": null,
      "i18n": {
        "pt": {
          "nome": "Portão de Serviço",
          "desc": "Trancado toda noite. Sem explicação oficial."
        },
        "en": {
          "nome": "Service Gate",
          "desc": "Locked every night. No official explanation."
        },
        "es": {
          "nome": "Puerta de Servicio",
          "desc": "Cerrada cada noche. Sin explicación oficial."
        }
      },
      "pista_id": "p02a"
    },
    {
      "id": "deposito",
      "puzzle": "labirinto",
      "i18n": {
        "pt": {
          "nome": "Depósito",
          "desc": "Fundos da escola. Onde ninguém olha."
        },
        "en": {
          "nome": "Storage Room",
          "desc": "Back of the school. Where nobody looks."
        },
        "es": {
          "nome": "Depósito",
          "desc": "Fondo de la escuela. Donde nadie mira."
        }
      },
      "pista_id": "p02b"
    }
  ],
  "pistas": [
    {
      "id": "p02a",
      "tipo": "objeto",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "Cadeado Novo",
          "desc": "Comprado essa semana. Zelador pagou com dinheiro vivo."
        },
        "en": {
          "titulo": "New Padlock",
          "desc": "Bought this week. Janitor paid in cash."
        },
        "es": {
          "titulo": "Candado Nuevo",
          "desc": "Comprado esta semana. Conserje pagó en efectivo."
        }
      }
    },
    {
      "id": "p02b",
      "tipo": "documento",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "Envelope de Dinheiro",
          "desc": "Espécie. Sem nome. Quem paga em espécie não quer ser encontrado."
        },
        "en": {
          "titulo": "Money Envelope",
          "desc": "Cash. No name. Whoever pays in cash doesn't want to be found."
        },
        "es": {
          "titulo": "Sobre de Dinero",
          "desc": "Efectivo. Sin nombre. Quien paga en efectivo no quiere ser encontrado."
        }
      }
    }
  ],
  "dialogo": {
    "abertura": [
      {
        "de": "anonimo",
        "i18n": {
          "pt": "boa noite. me indicaram o senhor",
          "en": "good evening",
          "es": "buenas noches"
        },
        "delay": 0
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "pode chamar de Jack. o senhor me envelhece",
          "en": "call me jack",
          "es": "llámame jack"
        },
        "delay": 3000
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "o portão de serviço da escola tá sendo trancado toda noite há uma semana",
          "en": "the school gate has been locked every night for a week",
          "es": "la reja de la escuela cerrada cada noche"
        },
        "delay": 4500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "e a escola não resolve?",
          "en": "school wont fix it?",
          "es": "la escuela no lo resuelve?"
        },
        "delay": 8500
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "disseram que não sabem quem faz",
          "en": "they said they dont know who",
          "es": "dijeron que no saben"
        },
        "delay": 10000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "conveniente",
          "en": "convenient",
          "es": "conveniente"
        },
        "delay": 12000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "me manda o endereço",
          "en": "send me the address",
          "es": "mándame la dirección"
        },
        "delay": 13500
      }
    ],
    "resolucao": [
      {
        "de": "jack",
        "i18n": {
          "pt": "zelador. alguém pagou ele pra trancar",
          "en": "janitor. someone paid him",
          "es": "conserje. alguien le pagó"
        },
        "delay": 0
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "quem pagou?",
          "en": "who paid?",
          "es": "quién pagó?"
        },
        "delay": 2000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "não sabe. espécie. entregue por terceiro",
          "en": "doesnt know. cash. middleman",
          "es": "no sabe. efectivo. tercero"
        },
        "delay": 3500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "mas o portão não vai ser trancado de novo",
          "en": "but the gate wont be locked again",
          "es": "la reja no se cerrará de nuevo"
        },
        "delay": 5000
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "como o senhor tem certeza?",
          "en": "how can you be sure?",
          "es": "cómo está seguro?"
        },
        "delay": 6500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "tive uma conversa com ele",
          "en": "I had a conversation with him",
          "es": "tuve una conversación"
        },
        "delay": 8000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "foi uma conversa muito esclarecedora",
          "en": "it was very enlightening",
          "es": "fue muy esclarecedora"
        },
        "delay": 9500
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "...obrigada",
          "en": "...thank you",
          "es": "...gracias"
        },
        "delay": 11500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "cuida do seu filho",
          "en": "take care of your son",
          "es": "cuida a tu hijo"
        },
        "delay": 13000
      }
    ],
    "narracao_abertura": {
      "pt": "Portões trancados em Marelia não eram novidade. O que era novidade era alguém se importar o suficiente pra contratar um detetive de sonho pra descobrir quem trancava.",
      "en": "Locked gates in Marelia were nothing new. What was new was someone caring enough to hire a dream detective to find out who was locking them.",
      "es": "Portones cerrados en Marelia no eran novedad. Lo nuevo era que alguien se preocupara lo suficiente como para contratar a un detective de sueños para descubrir quién los cerraba."
    },
    "narracao_final": {
      "pt": "O zelador ia ficar com o dinheiro e com a consciência. Era mais do que a maioria das pessoas de Marelia carregava.",
      "en": "The janitor would keep the money and his conscience. That was more than most people in Marelia carried.",
      "es": "El conserje se quedaría con el dinero y la conciencia. Era más de lo que la mayoría de la gente en Marelia cargaba."
    }
  },
  "pista_kronos": null
},
  {
  "id": "caso_03",
  "desbloqueado": false,
  "reputacao_minima": 0,
  "reputacao_ganho": 100,
  "dificuldade": 1,
  "desbloqueia": [
    "caso_05"
  ],
  "thumbnail": "👒",
  "i18n": {
    "pt": {
      "nome": "A Mulher do Chapéu",
      "subtitulo": "Ela aparece toda quinta no beco. Ninguém sabe o nome."
    },
    "en": {
      "nome": "The Woman in the Hat",
      "subtitulo": "She appears every Thursday in the alley. Nobody knows her name."
    },
    "es": {
      "nome": "La Mujer del Sombrero",
      "subtitulo": "Aparece cada jueves en el callejón. Nadie sabe su nombre."
    }
  },
  "suspeitos": [
    {
      "id": "mulher_chapeu",
      "i18n": {
        "pt": {
          "nome": "A Mulher do Chapéu",
          "bio": "Espera 10 minutos no beco toda quinta."
        },
        "en": {
          "nome": "The Woman in the Hat",
          "bio": "Waits 10 minutes in the alley every Thursday."
        },
        "es": {
          "nome": "La Mujer del Sombrero",
          "bio": "Espera 10 minutos en el callejón cada jueves."
        }
      },
      "culpado": false,
      "avatar": "👒"
    },
    {
      "id": "entregador",
      "i18n": {
        "pt": {
          "nome": "Entregador",
          "bio": "Passa no mesmo horário toda semana."
        },
        "en": {
          "nome": "Delivery Guy",
          "bio": "Passes by at the same time every week."
        },
        "es": {
          "nome": "Repartidor",
          "bio": "Pasa a la misma hora cada semana."
        }
      },
      "culpado": true,
      "avatar": "📦"
    }
  ],
  "pistas_necessarias": 3,
  "locais": [
    {
      "id": "beco_norte",
      "puzzle": null,
      "i18n": {
        "pt": {
          "nome": "Beco Norte",
          "desc": "Onde ela espera. Toda quinta."
        },
        "en": {
          "nome": "North Alley",
          "desc": "Where she waits. Every Thursday."
        },
        "es": {
          "nome": "Callejón Norte",
          "desc": "Donde ella espera. Cada jueves."
        }
      },
      "pista_id": "p03a"
    },
    {
      "id": "correio",
      "puzzle": "anagrama",
      "i18n": {
        "pt": {
          "nome": "Correio",
          "desc": "Rota do entregador."
        },
        "en": {
          "nome": "Post Office",
          "desc": "Delivery guy's route."
        },
        "es": {
          "nome": "Correos",
          "desc": "Ruta del repartidor."
        }
      },
      "pista_id": "p03b"
    },
    {
      "id": "lojas",
      "puzzle": "sliding",
      "i18n": {
        "pt": {
          "nome": "Lojas do Beco",
          "desc": "As duas vítimas."
        },
        "en": {
          "nome": "Alley Shops",
          "desc": "The two victims."
        },
        "es": {
          "nome": "Tiendas del Callejón",
          "desc": "Las dos víctimas."
        }
      },
      "pista_id": "p03c"
    }
  ],
  "pistas": [
    {
      "id": "p03a",
      "tipo": "testemunho",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "Ela esperava o ônibus",
          "desc": "Era só isso. Marelia inteira era culpada pelo horário."
        },
        "en": {
          "titulo": "She was waiting for the bus",
          "desc": "That was it. All of Marelia was guilty of bad timing."
        },
        "es": {
          "titulo": "Esperaba el autobús",
          "desc": "Eso era todo. Marelia entera era culpable por el horario."
        }
      }
    },
    {
      "id": "p03b",
      "tipo": "rastro",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "O entregador",
          "desc": "Não entregava nada no beco. Só olhava. Só calculava."
        },
        "en": {
          "titulo": "The delivery guy",
          "desc": "He didn't deliver anything in the alley. Just watched. Just calculated."
        },
        "es": {
          "titulo": "El repartidor",
          "desc": "No entregaba nada en el callejón. Solo miraba. Solo calculaba."
        }
      }
    },
    {
      "id": "p03c",
      "tipo": "documento",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "Padrão dos roubos",
          "desc": "Os dois roubados viravam as costas quando o entregador passava."
        },
        "en": {
          "titulo": "Robbery pattern",
          "desc": "Both victims turned their backs when the delivery guy passed by."
        },
        "es": {
          "titulo": "Patrón de robos",
          "desc": "Ambos robados daban la espalda cuando el repartidor pasaba."
        }
      }
    }
  ],
  "dialogo": {
    "abertura": [
      {
        "de": "anonimo",
        "i18n": {
          "pt": "você é o detetive?",
          "en": "are you the detective?",
          "es": "eres el detective?"
        },
        "delay": 0
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "depende do que você precisa",
          "en": "depends on what you need",
          "es": "depende de lo que necesitas"
        },
        "delay": 1500
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "tem uma mulher que aparece toda quinta",
          "en": "there is a woman who appears every thursday",
          "es": "hay una mujer que aparece cada jueves"
        },
        "delay": 3000
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "fica parada 10 minutos no beco e vai embora",
          "en": "she stands 10 minutes and leaves",
          "es": "se queda 10 minutos y se va"
        },
        "delay": 4500
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "dois vizinhos meus foram roubados depois",
          "en": "two neighbors were robbed after",
          "es": "dos vecinos fueron robados después"
        },
        "delay": 6000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "interessante. quinta que vem eu estou lá",
          "en": "interesting. next thursday I will be there",
          "es": "interesante. el próximo jueves estaré allí"
        },
        "delay": 9000
      }
    ],
    "resolucao": [
      {
        "de": "anonimo",
        "i18n": {
          "pt": "então foi o entregador",
          "en": "so it was the delivery guy",
          "es": "entonces fue el repartidor"
        },
        "delay": 0
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "ela não sabe de nada. ele usava o movimento dela como distração",
          "en": "she knows nothing. he used her movement as distraction",
          "es": "ella no sabe nada. él usaba su movimiento"
        },
        "delay": 2500
      },
      {
        "de": "anonimo",
        "i18n": {
          "pt": "coitada",
          "en": "poor thing",
          "es": "pobrecita"
        },
        "delay": 4500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "já avisei a empresa dele. anonimamente",
          "en": "I already told his company. anonymously",
          "es": "ya avisé a su empresa. anónimamente"
        },
        "delay": 6000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "ela continua esperando o ônibus toda quinta",
          "en": "she keeps waiting for the bus every thursday",
          "es": "ella sigue esperando el bus cada jueves"
        },
        "delay": 8000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "algumas coisas em marelia são imutáveis",
          "en": "some things in marelia never change",
          "es": "algunas cosas en marelia nunca cambian"
        },
        "delay": 10000
      }
    ],
    "narracao_abertura": {
      "pt": "A mulher do chapéu não sabia que era isca. Às vezes as pessoas mais inocentes são as que mais trabalho dão, porque você precisa provar que são inocentes antes de chegar em quem não é.",
      "en": "The woman in the hat didn't know she was bait. Sometimes the most innocent people are the ones that give you the most work, because you have to prove they're innocent before you can get to whoever isn't.",
      "es": "La mujer del sombrero no sabía que era carnada. A veces las personas más inocentes son las que más trabajo dan, porque tienes que probar que son inocentes antes de llegar a quien no lo es."
    },
    "narracao_final": {
      "pt": "O entregador ia perder o emprego. A mulher do chapéu ia continuar sem saber que existiu por um momento no centro de tudo. Marelia era cheia de pessoas importantes que nunca iam descobrir que foram importantes.",
      "en": "The delivery guy would lose his job. The woman in the hat would go on never knowing she existed for a moment at the center of everything. Marelia was full of important people who would never find out they were important.",
      "es": "El repartidor perdería su trabajo. La mujer del sombrero seguiría sin saber que existió por un momento en el centro de todo. Marelia estaba llena de personas importantes que nunca descubrirían que fueron importantes."
    }
  },
  "pista_kronos": null
},
  {
  "id": "caso_04",
  "desbloqueado": false,
  "reputacao_minima": 50,
  "reputacao_ganho": 150,
  "dificuldade": 2,
  "desbloqueia": [
    "caso_06"
  ],
  "thumbnail": "🩸",
  "i18n": {
    "pt": {
      "nome": "Sangue no Asfalto",
      "subtitulo": "Uma mancha de sangue na frente do prédio. Jack não consegue parar de pensar."
    },
    "en": {
      "nome": "Blood on the Asphalt",
      "subtitulo": "A blood stain in front of the building. Jack can't stop thinking about it."
    },
    "es": {
      "nome": "Sangre en el Asfalto",
      "subtitulo": "Una mancha de sangre frente al edificio. Jack no puede dejar de pensar."
    }
  },
  "suspeitos": [
    {
      "id": "morador_3andar",
      "i18n": {
        "pt": {
          "nome": "Morador do 3º Andar",
          "bio": "Briga doméstica frequente."
        },
        "en": {
          "nome": "3rd Floor Resident",
          "bio": "Frequent domestic disputes."
        },
        "es": {
          "nome": "Residente del 3er Piso",
          "bio": "Pelea doméstica frecuente."
        }
      },
      "culpado": true,
      "avatar": "🏠"
    },
    {
      "id": "homem_carro",
      "i18n": {
        "pt": {
          "nome": "Homem do Carro",
          "bio": "Mora no carro estacionado na rua."
        },
        "en": {
          "nome": "Car Man",
          "bio": "Lives in the car parked on the street."
        },
        "es": {
          "nome": "Hombre del Carro",
          "bio": "Vive en el carro estacionado en la calle."
        }
      },
      "culpado": false,
      "avatar": "🚗"
    }
  ],
  "pistas_necessarias": 3,
  "locais": [
    {
      "id": "predio_jack",
      "puzzle": null,
      "i18n": {
        "pt": {
          "nome": "Frente do Prédio",
          "desc": "A mancha no asfalto. Já lavada."
        },
        "en": {
          "nome": "Building Front",
          "desc": "The stain on the asphalt. Already washed."
        },
        "es": {
          "nome": "Frente del Edificio",
          "desc": "La mancha en el asfalto. Ya lavada."
        }
      },
      "pista_id": "p04a"
    },
    {
      "id": "beco_lateral",
      "puzzle": "labirinto",
      "i18n": {
        "pt": {
          "nome": "Beco Lateral",
          "desc": "O rastro vai até aqui e para."
        },
        "en": {
          "nome": "Side Alley",
          "desc": "The trail comes here and stops."
        },
        "es": {
          "nome": "Callejón Lateral",
          "desc": "El rastro llega hasta aquí y se detiene."
        }
      },
      "pista_id": "p04b"
    },
    {
      "id": "porta_vitima",
      "puzzle": null,
      "i18n": {
        "pt": {
          "nome": "Porta da Vítima",
          "desc": "3º andar. Ela atendeu."
        },
        "en": {
          "nome": "Victim's Door",
          "desc": "3rd floor. She answered."
        },
        "es": {
          "nome": "Puerta de la Víctima",
          "desc": "3er piso. Ella abrió."
        }
      },
      "pista_id": "p04c"
    }
  ],
  "pistas": [
    {
      "id": "p04a",
      "tipo": "rastro",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "O rastro ia até o beco e parava",
          "desc": "Não porque parava de verdade: alguém tinha lavado o resto. Quem lava rastro de sangue às três da manhã não está protegendo a vítima."
        },
        "en": {
          "titulo": "The trail went to the alley and stopped",
          "desc": "Not because it really stopped: someone had washed the rest away. Whoever washes a blood trail at three in the morning isn't protecting the victim."
        },
        "es": {
          "titulo": "El rastro iba al callejón y se detenía",
          "desc": "No porque realmente se detuviera: alguien había lavado el resto. Quien lava un rastro de sangre a las tres de la mañana no está protegiendo a la víctima."
        }
      }
    },
    {
      "id": "p04b",
      "tipo": "testemunho",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "Ela ouviu. Todo mundo ouviu",
          "desc": "Ninguém foi ver. Marelia ensinava as pessoas a ficarem com a cabeça baixa e eu não podia culpá-las."
        },
        "en": {
          "titulo": "She heard. Everyone heard",
          "desc": "Nobody went to check. Marelia taught people to keep their heads down and I couldn't blame them."
        },
        "es": {
          "titulo": "Ella oyó. Todos oyeron",
          "desc": "Nadie fue a mirar. Marelia enseñaba a la gente a mantener la cabeza baja y no podía culparlos."
        }
      }
    },
    {
      "id": "p04c",
      "tipo": "testemunho",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "A vítima",
          "desc": "Ela abriu a porta com olho roxo novo em cima de olho roxo antigo e disse que estava tudo bem. Eu disse que sabia que não estava."
        },
        "en": {
          "titulo": "The victim",
          "desc": "She opened the door with a fresh black eye on top of an old one and said everything was fine. I said I knew it wasn't."
        },
        "es": {
          "titulo": "La víctima",
          "desc": "Abrió la puerta con un ojo morado nuevo sobre uno viejo y dijo que todo estaba bien. Le dije que sabía que no lo estaba."
        }
      }
    }
  ],
  "dialogo": {
    "abertura": [
      {
        "de": "jack",
        "i18n": {
          "pt": "às vezes o caso chega antes do cliente",
          "en": "sometimes the case arrives before the client",
          "es": "a veces el caso llega antes del cliente"
        },
        "delay": 0
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "você desce pro corredor de manhã e o caso já está lá",
          "en": "you go down the hallway and its already there",
          "es": "bajas al pasillo y ya está ahí"
        },
        "delay": 2000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "vermelho escuro no asfalto, esperando",
          "en": "dark red on the asphalt, waiting",
          "es": "rojo oscuro en el asfalto, esperando"
        },
        "delay": 4000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "eu podia ter ignorado. era o que a maioria fazia",
          "en": "I could have ignored it. most people would",
          "es": "podría haberlo ignorado. es lo que la mayoría haría"
        },
        "delay": 6000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "mas eu sou burro desse jeito específico",
          "en": "but I am stupid in this specific way",
          "es": "pero soy estúpido de esta manera específica"
        },
        "delay": 8000
      }
    ],
    "resolucao": [
      {
        "de": "jack",
        "i18n": {
          "pt": "eu sabia quem era. eu sabia onde morava",
          "en": "I knew who it was. I knew where he lived",
          "es": "yo sabía quién era. sabía dónde vivía"
        },
        "delay": 0
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "eu sabia que ela não ia registrar",
          "en": "I knew she wouldnt report it",
          "es": "sabía que ella no lo denunciaría"
        },
        "delay": 2500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "então eu fiz a única coisa que me restava",
          "en": "so I did the only thing left",
          "es": "entonces hice lo único que quedaba"
        },
        "delay": 5000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "fui embora. e carreguei isso comigo",
          "en": "I walked away. and carried it with me",
          "es": "me fui. y lo cargué conmigo"
        },
        "delay": 7500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "algumas resoluções não resolvem nada",
          "en": "some resolutions resolve nothing",
          "es": "algunas resoluciones no resuelven nada"
        },
        "delay": 10000
      }
    ],
    "narracao_abertura": {
      "pt": "Às vezes o caso chega antes do cliente. Às vezes você desce pro corredor de manhã e o caso já está lá, vermelho escuro no asfalto, esperando.",
      "en": "Sometimes the case arrives before the client. Sometimes you go down the hallway in the morning and the case is already there, dark red on the asphalt, waiting.",
      "es": "A veces el caso llega antes que el cliente. A veces bajas al pasillo por la mañana y el caso ya está ahí, rojo oscuro en el asfalto, esperando."
    },
    "narracao_final": {
      "pt": "Não cobrei nada. Não tinha o que cobrar.",
      "en": "I charged nothing. There was nothing to charge.",
      "es": "No cobré nada. No había nada que cobrar."
    }
  },
  "pista_kronos": null
},
  {
  "id": "caso_05",
  "desbloqueado": false,
  "reputacao_minima": 50,
  "reputacao_ganho": 150,
  "dificuldade": 2,
  "desbloqueia": [
    "caso_06"
  ],
  "thumbnail": "📸",
  "i18n": {
    "pt": {
      "nome": "O Mensageiro Mudo",
      "subtitulo": "Kim recebeu uma foto. Alguém o seguiu. Alguém o fotografou de costas."
    },
    "en": {
      "nome": "The Silent Messenger",
      "subtitulo": "Kim received a photo. Someone followed him. Someone photographed him from behind."
    },
    "es": {
      "nome": "El Mensajero Mudo",
      "subtitulo": "Kim recibió una foto. Alguien lo siguió. Alguien lo fotografió por detrás."
    }
  },
  "suspeitos": [
    {
      "id": "fotografo",
      "i18n": {
        "pt": {
          "nome": "Fotógrafo do Prédio",
          "bio": "Câmera nova demais pro aluguel que pagava."
        },
        "en": {
          "nome": "Building Photographer",
          "bio": "Camera too new for the rent he paid."
        },
        "es": {
          "nome": "Fotógrafo del Edificio",
          "bio": "Cámara demasiado nueva para el alquiler que pagaba."
        }
      },
      "culpado": true,
      "avatar": "📷"
    },
    {
      "id": "ex_colega",
      "i18n": {
        "pt": {
          "nome": "Ex-colega de Escola",
          "bio": "Rancor antigo. Motivo possível."
        },
        "en": {
          "nome": "Former Schoolmate",
          "bio": "Old grudge. Possible motive."
        },
        "es": {
          "nome": "Excompañero de Escuela",
          "bio": "Rencores antiguos. Motivo posible."
        }
      },
      "culpado": false,
      "avatar": "🎓"
    }
  ],
  "pistas_necessarias": 3,
  "locais": [
    {
      "id": "predio_kim",
      "puzzle": null,
      "i18n": {
        "pt": {
          "nome": "Prédio do Kim",
          "desc": "A foto foi tirada daqui."
        },
        "en": {
          "nome": "Kim's Building",
          "desc": "The photo was taken from here."
        },
        "es": {
          "nome": "Edificio de Kim",
          "desc": "La foto fue tomada desde aquí."
        }
      },
      "pista_id": "p05a"
    },
    {
      "id": "estudio_foto",
      "puzzle": "decoder",
      "i18n": {
        "pt": {
          "nome": "Estúdio do Fotógrafo",
          "desc": "Equipamento caro demais."
        },
        "en": {
          "nome": "Photographer's Studio",
          "desc": "Way too expensive equipment."
        },
        "es": {
          "nome": "Estudio del Fotógrafo",
          "desc": "Equipo demasiado caro."
        }
      },
      "pista_id": "p05b"
    },
    {
      "id": "correio_central",
      "puzzle": null,
      "i18n": {
        "pt": {
          "nome": "Correio Central",
          "desc": "De onde veio a encomenda do número."
        },
        "en": {
          "nome": "Central Post Office",
          "desc": "Where the number's package came from."
        },
        "es": {
          "nome": "Correo Central",
          "desc": "De donde vino el encargo del número."
        }
      },
      "pista_id": "p05c"
    }
  ],
  "pistas": [
    {
      "id": "p05a",
      "tipo": "objeto",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "Câmera nova demais",
          "desc": "Pro aluguel que ele pagava. Às vezes a inconsistência mais importante não é o que as pessoas dizem: é o que as pessoas têm."
        },
        "en": {
          "titulo": "Camera too new",
          "desc": "For the rent he paid. Sometimes the most important inconsistency isn't what people say — it's what people have."
        },
        "es": {
          "titulo": "Cámara demasiado nueva",
          "desc": "Para el alquiler que pagaba. A veces la inconsistencia más importante no es lo que la gente dice — es lo que la gente tiene."
        }
      }
    },
    {
      "id": "p05b",
      "tipo": "documento",
      "fio": true,
      "i18n": {
        "pt": {
          "titulo": "Número desconhecido",
          "desc": "Usado uma vez. Uma transferência, uma instrução, uma foto. Quem usa número assim não planeja ser encontrado."
        },
        "en": {
          "titulo": "Unknown number",
          "desc": "Used once. One transfer, one instruction, one photo. Whoever uses a number like that doesn't plan to be found."
        },
        "es": {
          "titulo": "Número desconocido",
          "desc": "Usado una vez. Una transferencia, una instrucción, una foto. Quien usa un número así no planea ser encontrado."
        }
      }
    },
    {
      "id": "p05c",
      "tipo": "rastro",
      "fio": false,
      "i18n": {
        "pt": {
          "titulo": "DDD da ilha",
          "desc": "DDD de ilha privada no Pacífico Sul. Ilhas privadas no Pacífico Sul não contratam fotógrafos de Marelia por acidente."
        },
        "en": {
          "titulo": "Island area code",
          "desc": "Private island area code in the South Pacific. Private islands in the South Pacific don't hire photographers from Marelia by accident."
        },
        "es": {
          "titulo": "Código de la isla",
          "desc": "Código de isla privada en el Pacífico Sur. Islas privadas en el Pacífico Sur no contratan fotógrafos de Marelia por accidente."
        }
      }
    }
  ],
  "dialogo": {
    "abertura": [
      {
        "de": "kim",
        "i18n": {
          "pt": "jack",
          "en": "jack",
          "es": "jack"
        },
        "delay": 0
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "bom dia pra você também",
          "en": "good morning to you too",
          "es": "buenos días para ti también"
        },
        "delay": 1500
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "alguém deixou um envelope debaixo da minha porta",
          "en": "someone left an envelope under my door",
          "es": "alguien dejó un sobre debajo de mi puerta"
        },
        "delay": 3000
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "tem uma foto minha de costas na rua",
          "en": "theres a photo of me from behind on the street",
          "es": "hay una foto mía de espaldas en la calle"
        },
        "delay": 4500
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "alguém me seguiu e tirou foto sem eu perceber",
          "en": "someone followed me and took a photo without me noticing",
          "es": "alguien me siguió y me fotografió sin que me diera cuenta"
        },
        "delay": 6000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "você tá em casa agora?",
          "en": "are you home right now?",
          "es": "estás en casa ahora?"
        },
        "delay": 8500
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "sim",
          "en": "yes",
          "es": "sí"
        },
        "delay": 9500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "fica lá",
          "en": "stay there",
          "es": "quédate ahí"
        },
        "delay": 10000
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "jack eu não preciso que você",
          "en": "jack I dont need you to",
          "es": "jack no necesito que"
        },
        "delay": 10500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "KIM",
          "en": "KIM",
          "es": "KIM"
        },
        "delay": 11000
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "tô em casa",
          "en": "im home",
          "es": "estoy en casa"
        },
        "delay": 11500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "tô indo",
          "en": "im on my way",
          "es": "voy para allá"
        },
        "delay": 12000
      }
    ],
    "resolucao": [
      {
        "de": "jack",
        "i18n": {
          "pt": "fotógrafo do seu prédio. foi pago pra te seguir e fotografar",
          "en": "photographer from your building. paid to follow and photograph you",
          "es": "fotógrafo de tu edificio. pagado para seguirte y fotografiarte"
        },
        "delay": 0
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "quem pagou",
          "en": "who paid",
          "es": "quién pagó"
        },
        "delay": 2500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "número que não existe mais. DDD de fora do brasil",
          "en": "number that no longer exists. area code from outside brazil",
          "es": "número que ya no existe. código de área de fuera de brasil"
        },
        "delay": 4000
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "fora do brasil",
          "en": "outside brazil",
          "es": "fuera de brasil"
        },
        "delay": 6000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "ilha privada. pacífico sul",
          "en": "private island. south pacific",
          "es": "isla privada. pacífico sur"
        },
        "delay": 7500
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "tá bom",
          "en": "ok",
          "es": "está bien"
        },
        "delay": 10000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "kim",
          "en": "kim",
          "es": "kim"
        },
        "delay": 11000
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "eu ouvi",
          "en": "I heard you",
          "es": "te oí"
        },
        "delay": 11500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "isso não é aleatório",
          "en": "this is not random",
          "es": "esto no es aleatorio"
        },
        "delay": 12000
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "eu sei jack",
          "en": "I know jack",
          "es": "lo sé jack"
        },
        "delay": 13500
      },
      {
        "de": "kim",
        "i18n": {
          "pt": "obrigado",
          "en": "thank you",
          "es": "gracias"
        },
        "delay": 14500
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "não precisa",
          "en": "no need",
          "es": "no hace falta"
        },
        "delay": 15500
      }
    ],
    "narracao_abertura": {
      "pt": "Kim não pedia ajuda. Era constitucional nele, era estrutural, era parte do código. Quando ele mandou aquela mensagem eu entendi que era sério antes de entender o que era.",
      "en": "Kim didn't ask for help. It was constitutional in him, structural, part of the code. When he sent that message I knew it was serious before I understood what it was.",
      "es": "Kim no pedía ayuda. Era constitucional en él, estructural, parte del código. Cuando envió ese mensaje supe que era serio antes de entender qué era."
    },
    "narracao_final": {
      "pt": "Ele agradeceu. Kim não agradecia. Eu fui pra cama e não consegui dormir e não sei se foi por causa do caso ou por causa do jeito que ele disse obrigado, como se já soubesse que era só o começo.",
      "en": "He thanked me. Kim didn't thank people. I went to bed and couldn't sleep and I don't know if it was because of the case or because of the way he said thank you, like he already knew it was just the beginning.",
      "es": "Me agradeció. Kim no agradecía. Me fui a la cama y no pude dormir y no sé si fue por el caso o por la forma en que dijo gracias, como si ya supiera que era solo el comienzo."
    }
  },
  "pista_kronos": {
    "pt": "DDD de ilha privada. K.",
    "en": "Private island area code. K.",
    "es": "Código de isla privada. K."
  }
},
  {
    "id": "caso_06",
    "desbloqueado": false,
    "reputacao_minima": 250,
    "reputacao_ganho": 220,
    "dificuldade": 2,
    "desbloqueia": [
      "caso_07"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Ferreiro",
        "subtitulo": "Ferreiro inconsciente na forja."
      },
      "en": {
        "nome": "The Blacksmith",
        "subtitulo": "Blacksmith unconscious at the forge."
      },
      "es": {
        "nome": "El Herrero",
        "subtitulo": "Herrero inconsciente en la forja."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_06_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_06_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_06_1",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_06_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 6.",
            "en": "[PH] Case 6.",
            "es": "[PH] Caso 6."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 6.",
        "en": "Case 6.",
        "es": "Caso 6."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": {
      "pt": "K.",
      "en": "K.",
      "es": "K."
    }
  },
  {
    "id": "caso_07",
    "desbloqueado": false,
    "reputacao_minima": 300,
    "reputacao_ganho": 240,
    "dificuldade": 2,
    "desbloqueia": [
      "caso_08"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Enfermeira",
        "subtitulo": "Enfermeira some toda semana."
      },
      "en": {
        "nome": "The Nurse",
        "subtitulo": "Nurse disappears every week."
      },
      "es": {
        "nome": "La Enfermera",
        "subtitulo": "Enfermera desaparece cada semana."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_07_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_07_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_07_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_07_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 7.",
            "en": "[PH] Case 7.",
            "es": "[PH] Caso 7."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 7.",
        "en": "Case 7.",
        "es": "Caso 7."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_08",
    "desbloqueado": false,
    "reputacao_minima": 350,
    "reputacao_ganho": 260,
    "dificuldade": 2,
    "desbloqueia": [
      "caso_09"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Contador",
        "subtitulo": "Contador sumiu com os livros."
      },
      "en": {
        "nome": "The Accountant",
        "subtitulo": "Accountant disappeared with the books."
      },
      "es": {
        "nome": "El Contador",
        "subtitulo": "Contador desapareció con los libros."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_08_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_08_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_08_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_08_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 8.",
            "en": "[PH] Case 8.",
            "es": "[PH] Caso 8."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 8.",
        "en": "Case 8.",
        "es": "Caso 8."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_09",
    "desbloqueado": false,
    "reputacao_minima": 400,
    "reputacao_ganho": 280,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_10"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Lista Incompleta",
        "subtitulo": "Uma lista com seu nome."
      },
      "en": {
        "nome": "The Incomplete List",
        "subtitulo": "A list with your name on it."
      },
      "es": {
        "nome": "La Lista Incompleta",
        "subtitulo": "Una lista con tu nombre."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_09_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_09_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_09_1",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_09_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 9.",
            "en": "[PH] Case 9.",
            "es": "[PH] Caso 9."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 9.",
        "en": "Case 9.",
        "es": "Caso 9."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": {
      "pt": "K.",
      "en": "K.",
      "es": "K."
    }
  },
  {
    "id": "caso_10",
    "desbloqueado": false,
    "reputacao_minima": 450,
    "reputacao_ganho": 300,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_11"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Dentro do Porto",
        "subtitulo": "Carga some do porto."
      },
      "en": {
        "nome": "Inside the Harbor",
        "subtitulo": "Cargo disappears from the port."
      },
      "es": {
        "nome": "Dentro del Puerto",
        "subtitulo": "Carga desaparece del puerto."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_10_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_10_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_10_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_10_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 10.",
            "en": "[PH] Case 10.",
            "es": "[PH] Caso 10."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 10.",
        "en": "Case 10.",
        "es": "Caso 10."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_11",
    "desbloqueado": false,
    "reputacao_minima": 500,
    "reputacao_ganho": 320,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_12"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Fora da Lei",
        "subtitulo": "Identidade clonada."
      },
      "en": {
        "nome": "Outside the Law",
        "subtitulo": "Cloned identity."
      },
      "es": {
        "nome": "Fuera de la Ley",
        "subtitulo": "Identidad clonada."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_11_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_11_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_11_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_11_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 11.",
            "en": "[PH] Case 11.",
            "es": "[PH] Caso 11."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 11.",
        "en": "Case 11.",
        "es": "Caso 11."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_12",
    "desbloqueado": false,
    "reputacao_minima": 550,
    "reputacao_ganho": 340,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_13"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Nome no Muro",
        "subtitulo": "Nome pichado nos muros."
      },
      "en": {
        "nome": "The Name on the Wall",
        "subtitulo": "Name spray-painted on walls."
      },
      "es": {
        "nome": "El Nombre en el Muro",
        "subtitulo": "Nombre pintado en los muros."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_12_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_12_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_12_1",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_12_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 12.",
            "en": "[PH] Case 12.",
            "es": "[PH] Caso 12."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 12.",
        "en": "Case 12.",
        "es": "Caso 12."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": {
      "pt": "K.",
      "en": "K.",
      "es": "K."
    }
  },
  {
    "id": "caso_13",
    "desbloqueado": false,
    "reputacao_minima": 600,
    "reputacao_ganho": 360,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_14"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Gravação",
        "subtitulo": "Demo vazada antes do lançamento."
      },
      "en": {
        "nome": "The Recording",
        "subtitulo": "Demo leaked before release."
      },
      "es": {
        "nome": "La Grabación",
        "subtitulo": "Demo filtrada antes del lanzamiento."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_13_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_13_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_13_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_13_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 13.",
            "en": "[PH] Case 13.",
            "es": "[PH] Caso 13."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 13.",
        "en": "Case 13.",
        "es": "Caso 13."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_14",
    "desbloqueado": false,
    "reputacao_minima": 650,
    "reputacao_ganho": 380,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_15"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Arquivo",
        "subtitulo": "Arquivo histórico queimado."
      },
      "en": {
        "nome": "The Archive",
        "subtitulo": "Historical archive burned."
      },
      "es": {
        "nome": "El Archivo",
        "subtitulo": "Archivo histórico quemado."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_14_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_14_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_14_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_14_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 14.",
            "en": "[PH] Case 14.",
            "es": "[PH] Caso 14."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 14.",
        "en": "Case 14.",
        "es": "Caso 14."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_15",
    "desbloqueado": false,
    "reputacao_minima": 700,
    "reputacao_ganho": 400,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_16"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Testemunha Protegida",
        "subtitulo": "Criança com medo de falar."
      },
      "en": {
        "nome": "A Testemunha Protegida",
        "subtitulo": "Criança com medo de falar."
      },
      "es": {
        "nome": "A Testemunha Protegida",
        "subtitulo": "Criança com medo de falar."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_15_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_15_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_15_1",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_15_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 15.",
            "en": "[PH] Case 15.",
            "es": "[PH] Caso 15."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 15.",
        "en": "Case 15.",
        "es": "Caso 15."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": {
      "pt": "K.",
      "en": "K.",
      "es": "K."
    }
  },
  {
    "id": "caso_16",
    "desbloqueado": false,
    "reputacao_minima": 750,
    "reputacao_ganho": 420,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_17"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Tudo Leva a Ele",
        "subtitulo": "Shuntaro teve seus arquivos lidos."
      },
      "en": {
        "nome": "Tudo Leva a Ele",
        "subtitulo": "Shuntaro teve seus arquivos lidos."
      },
      "es": {
        "nome": "Tudo Leva a Ele",
        "subtitulo": "Shuntaro teve seus arquivos lidos."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_16_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_16_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_16_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_16_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 16.",
            "en": "[PH] Case 16.",
            "es": "[PH] Caso 16."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 16.",
        "en": "Case 16.",
        "es": "Caso 16."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_17",
    "desbloqueado": false,
    "reputacao_minima": 800,
    "reputacao_ganho": 440,
    "dificuldade": 5,
    "desbloqueia": [
      "caso_18"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Confronto Direto",
        "subtitulo": "Helena sendo seguida."
      },
      "en": {
        "nome": "Confronto Direto",
        "subtitulo": "Helena sendo seguida."
      },
      "es": {
        "nome": "Confronto Direto",
        "subtitulo": "Helena sendo seguida."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_17_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_17_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_17_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_17_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 17.",
            "en": "[PH] Case 17.",
            "es": "[PH] Caso 17."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 17.",
        "en": "Case 17.",
        "es": "Caso 17."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_18",
    "desbloqueado": false,
    "reputacao_minima": 850,
    "reputacao_ganho": 460,
    "dificuldade": 5,
    "desbloqueia": [
      "caso_19"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Fuga Planejada",
        "subtitulo": "Rotas de fuga de Kim."
      },
      "en": {
        "nome": "Fuga Planejada",
        "subtitulo": "Rotas de fuga de Kim."
      },
      "es": {
        "nome": "Fuga Planejada",
        "subtitulo": "Rotas de fuga de Kim."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_18_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_18_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_18_1",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_18_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 18.",
            "en": "[PH] Case 18.",
            "es": "[PH] Caso 18."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 18.",
        "en": "Case 18.",
        "es": "Caso 18."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": {
      "pt": "K.",
      "en": "K.",
      "es": "K."
    }
  },
  {
    "id": "caso_19",
    "desbloqueado": false,
    "reputacao_minima": 900,
    "reputacao_ganho": 480,
    "dificuldade": 5,
    "desbloqueia": [
      "caso_20"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "PESADELO PARTICULAR",
        "subtitulo": "O sonho termina aqui."
      },
      "en": {
        "nome": "PESADELO PARTICULAR",
        "subtitulo": "O sonho termina aqui."
      },
      "es": {
        "nome": "PESADELO PARTICULAR",
        "subtitulo": "O sonho termina aqui."
      }
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_19_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_19_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_19_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_19_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 19.",
            "en": "[PH] Case 19.",
            "es": "[PH] Caso 19."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 19.",
        "en": "Case 19.",
        "es": "Caso 19."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_20",
    "desbloqueado": false,
    "reputacao_minima": 950,
    "reputacao_ganho": 500,
    "dificuldade": 5,
    "desbloqueia": [],
    "thumbnail": "📋",
    "i18n": {
      "pt": {},
      "en": {},
      "es": {}
    },
    "suspeitos": [
      {
        "id": "s1",
        "i18n": {
          "pt": {
            "nome": "Suspeito A",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect A",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp A",
            "bio": "PH"
          }
        },
        "culpado": true,
        "avatar": "👤"
      },
      {
        "id": "s2",
        "i18n": {
          "pt": {
            "nome": "Suspeito B",
            "bio": "Placeholder."
          },
          "en": {
            "nome": "Suspect B",
            "bio": "PH"
          },
          "es": {
            "nome": "Sosp B",
            "bio": "PH"
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 2,
    "locais": [
      {
        "id": "loc1",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Local A",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place A",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar A",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_20_1"
      },
      {
        "id": "loc2",
        "puzzle": null,
        "i18n": {
          "pt": {
            "nome": "Local B",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place B",
            "desc": "PH"
          },
          "es": {
            "nome": "Lugar B",
            "desc": "PH"
          }
        },
        "pista_id": "pcaso_20_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_20_1",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Desc."
          }
        }
      },
      {
        "id": "pcaso_20_2",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Desc."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Desc."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Desc."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Caso 20.",
            "en": "[PH] Case 20.",
            "es": "[PH] Caso 20."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[PH] solved.",
            "es": "[PH] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "Caso 20.",
        "en": "Case 20.",
        "es": "Caso 20."
      },
      "narracao_final": {
        "pt": "Fim.",
        "en": "End.",
        "es": "Fin."
      }
    },
    "pista_kronos": null
  }
]
