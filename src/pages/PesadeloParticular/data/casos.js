export const CASOS = [
  {
    "id": "caso_01",
    "desbloqueado": true,
    "reputacao_minima": 200,
    "reputacao_ganho": 100,
    "dificuldade": 1,
    "desbloqueia": "🌧️",
    "thumbnail": [
      {
        "id": "osvaldo",
        "i18n": {
          "pt": {
            "nome": "Osvaldo",
            "bio": "Dono do bar. Sabe de tudo, fala de menos."
          },
          "en": {
            "nome": "Osvaldo",
            "bio": "Dono do bar. Sabe de tudo, fala de menos."
          },
          "es": {
            "nome": "Osvaldo",
            "bio": "Dono do bar. Sabe de tudo, fala de menos."
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
            "bio": "Sempre de terno. Sempre onde não deveria estar."
          },
          "en": {
            "nome": "O Homem do Terno",
            "bio": "Sempre de terno. Sempre onde não deveria estar."
          },
          "es": {
            "nome": "O Homem do Terno",
            "bio": "Sempre de terno. Sempre onde não deveria estar."
          }
        },
        "culpado": true,
        "avatar": "🕴️"
      }
    ],
    "i18n": {
      "pt": {
        "nome": "A Primeira Noite",
        "subtitulo": "Osvaldo sumiu. Alguém queria que ele sumisse."
      },
      "en": {
        "nome": "A Primeira Noite",
        "subtitulo": "Osvaldo sumiu. Alguém queria que ele sumisse."
      },
      "es": {
        "nome": "A Primeira Noite",
        "subtitulo": "Osvaldo sumiu. Alguém queria que ele sumisse."
      }
    },
    "suspeitos": [
      {
        "id": "beco_estacao",
        "puzzle": "decoder",
        "i18n": {
          "pt": {
            "nome": "Beco da Estação",
            "desc": "Úmido. Escuro. Cheira a cigarro velho e segredos."
          },
          "en": {
            "nome": "Beco da Estação",
            "desc": "Úmido. Escuro. Cheira a cigarro velho e segredos."
          },
          "es": {
            "nome": "Beco da Estação",
            "desc": "Úmido. Escuro. Cheira a cigarro velho e segredos."
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
            "desc": "Ponto de encontro. Todo mundo passa por aqui."
          },
          "en": {
            "nome": "Bar da Esquina",
            "desc": "Ponto de encontro. Todo mundo passa por aqui."
          },
          "es": {
            "nome": "Bar da Esquina",
            "desc": "Ponto de encontro. Todo mundo passa por aqui."
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
            "desc": "Arquivos empoeirados e casos não resolvidos."
          },
          "en": {
            "nome": "Delegacia Central",
            "desc": "Arquivos empoeirados e casos não resolvidos."
          },
          "es": {
            "nome": "Delegacia Central",
            "desc": "Arquivos empoeirados e casos não resolvidos."
          }
        },
        "pista_id": "p01c"
      }
    ],
    "pistas_necessarias": 10,
    "locais": [
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
            "titulo": "O substituto suava",
            "desc": "Mais do que o calor justificava."
          },
          "es": {
            "titulo": "O substituto suava",
            "desc": "Mais do que o calor justificava."
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
            "desc": "Viu tudo e não queria ter visto. A testemunha mais honesta de Marelia."
          },
          "en": {
            "titulo": "Relato do Zé do Bar",
            "desc": "Viu tudo e não queria ter visto. A testemunha mais honesta de Marelia."
          },
          "es": {
            "titulo": "Relato do Zé do Bar",
            "desc": "Viu tudo e não queria ter visto. A testemunha mais honesta de Marelia."
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
            "desc": "Letra manuscrita no verso. Uma inicial: K. Guardei no bolso e fingi que não senti o frio."
          },
          "en": {
            "titulo": "Envelope sem Remetente",
            "desc": "Letra manuscrita no verso. Uma inicial: K. Guardei no bolso e fingi que não senti o frio."
          },
          "es": {
            "titulo": "Envelope sem Remetente",
            "desc": "Letra manuscrita no verso. Uma inicial: K. Guardei no bolso e fingi que não senti o frio."
          }
        }
      }
    ],
    "pistas": [
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
          "en": "ma'am it's 11pm I'm on duty",
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
          "en": "he didnt come home. nobody saw him after 7pm",
          "es": "no llegó a casa"
        },
        "delay": 11000
      },
      {
        "de": "jack",
        "i18n": {
          "pt": "osvaldo não some. osvaldo É o portão",
          "en": "osvaldo doesn't disappear. osvaldo IS the gate",
          "es": "osvaldo no desaparece"
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
    "dialogo": {
      "abertura": [
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
            "en": "someone sent an envelope. he read it and left",
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
            "es": "buena pregunta para pensar"
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
      "resolucao": {
        "pt": "Osvaldo era o tipo de homem que a cidade esquece que precisa até o dia que ele não está mais lá. Eu conhecia cada ruga do rosto dele. Se ele sumiu, alguém quis que ele sumisse.",
        "en": "Osvaldo era o tipo de homem que a cidade esquece que precisa até o dia que ele não está mais lá. Eu conhecia cada ruga do rosto dele. Se ele sumiu, alguém quis que ele sumisse.",
        "es": "Osvaldo era o tipo de homem que a cidade esquece que precisa até o dia que ele não está mais lá. Eu conhecia cada ruga do rosto dele. Se ele sumiu, alguém quis que ele sumisse."
      },
      "narracao_abertura": {
        "pt": "Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele. Eu não gostava de não saber o que estava do outro lado.",
        "en": "Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele. Eu não gostava de não saber o que estava do outro lado.",
        "es": "Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele. Eu não gostava de não saber o que estava do outro lado."
      },
      "narracao_final": {
        "pt": "No envelope, uma letra: K.",
        "en": "On the envelope, one letter: K.",
        "es": "En el sobre, una letra: K."
      }
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
        "nome": "O Portão Fechado",
        "subtitulo": "Alguém trancava o portão toda noite. Por quê?"
      },
      "es": {
        "nome": "O Portão Fechado",
        "subtitulo": "Alguém trancava o portão toda noite. Por quê?"
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
            "nome": "Zelador",
            "bio": "Varre o mesmo trecho três vezes. Homem nervoso."
          },
          "es": {
            "nome": "Zelador",
            "bio": "Varre o mesmo trecho três vezes. Homem nervoso."
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
            "nome": "Aluno Rico",
            "bio": "Histórico de vandalismo. Sempre tem álibi."
          },
          "es": {
            "nome": "Aluno Rico",
            "bio": "Histórico de vandalismo. Sempre tem álibi."
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
            "nome": "Portão de Serviço",
            "desc": "Trancado toda noite. Sem explicação oficial."
          },
          "es": {
            "nome": "Portão de Serviço",
            "desc": "Trancado toda noite. Sem explicação oficial."
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
            "nome": "Depósito",
            "desc": "Fundos da escola. Onde ninguém olha."
          },
          "es": {
            "nome": "Depósito",
            "desc": "Fundos da escola. Onde ninguém olha."
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
            "titulo": "Cadeado Novo",
            "desc": "Comprado essa semana. Zelador pagou com dinheiro vivo."
          },
          "es": {
            "titulo": "Cadeado Novo",
            "desc": "Comprado essa semana. Zelador pagou com dinheiro vivo."
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
            "titulo": "Envelope de Dinheiro",
            "desc": "Espécie. Sem nome. Quem paga em espécie não quer ser encontrado."
          },
          "es": {
            "titulo": "Envelope de Dinheiro",
            "desc": "Espécie. Sem nome. Quem paga em espécie não quer ser encontrado."
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
            "en": "good evening I was referred to you",
            "es": "buenas noches me recomendaron"
          },
          "delay": 0
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "pode chamar de Jack. o senhor me envelhece",
            "en": "call me jack. sir makes me feel old",
            "es": "llámame jack"
          },
          "delay": 3000
        },
        {
          "de": "anonimo",
          "i18n": {
            "pt": "o portão de serviço da escola tá sendo trancado toda noite há uma semana",
            "en": "the school service gate has been locked every night for a week",
            "es": "la reja de servicio cerrada cada noche"
          },
          "delay": 4500
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "e a escola não resolve?",
            "en": "and the school won't fix it?",
            "es": "y la escuela no lo resuelve?"
          },
          "delay": 8500
        },
        {
          "de": "anonimo",
          "i18n": {
            "pt": "disseram que não sabem quem faz",
            "en": "they said they don't know who does it",
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
            "en": "janitor. someone paid him to lock it",
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
            "en": "doesn't know. cash. delivered by a middleman",
            "es": "no sabe. efectivo"
          },
          "delay": 3500
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
            "pt": "cuida do seu filho",
            "en": "take care of your son",
            "es": "cuida a tu hijo"
          },
          "delay": 13000
        }
      ],
      "narracao_abertura": {
        "pt": "Portões trancados em Marelia não eram novidade. O que era novidade era alguém se importar o suficiente pra contratar um detetive de sonho pra descobrir quem trancava.",
        "en": "Portões trancados em Marelia não eram novidade. O que era novidade era alguém se importar o suficiente pra contratar um detetive de sonho pra descobrir quem trancava.",
        "es": "Portões trancados em Marelia não eram novidade. O que era novidade era alguém se importar o suficiente pra contratar um detetive de sonho pra descobrir quem trancava."
      },
      "narracao_final": {
        "pt": "O zelador ia ficar com o dinheiro e com a consciência. Era mais do que a maioria das pessoas de Marelia carregava.",
        "en": "O zelador ia ficar com o dinheiro e com a consciência. Era mais do que a maioria das pessoas de Marelia carregava.",
        "es": "O zelador ia ficar com o dinheiro e com a consciência. Era mais do que a maioria das pessoas de Marelia carregava."
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
        "nome": "A Mulher do Chapéu",
        "subtitulo": "Ela aparece toda quinta no beco. Ninguém sabe o nome."
      },
      "es": {
        "nome": "A Mulher do Chapéu",
        "subtitulo": "Ela aparece toda quinta no beco. Ninguém sabe o nome."
      }
    },
    "suspeitos": [
      {
        "id": "mulher_chapeu",
        "i18n": {
          "pt": {
            "nome": "A Mulher do Chapéu",
            "bio": "Espera 10 minutos no beco toda quinta. Inocente como isca."
          },
          "en": {
            "nome": "A Mulher do Chapéu",
            "bio": "Espera 10 minutos no beco toda quinta. Inocente como isca."
          },
          "es": {
            "nome": "A Mulher do Chapéu",
            "bio": "Espera 10 minutos no beco toda quinta. Inocente como isca."
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
            "bio": "Passa no mesmo horário toda semana. Só olha. Só calcula."
          },
          "en": {
            "nome": "Entregador",
            "bio": "Passa no mesmo horário toda semana. Só olha. Só calcula."
          },
          "es": {
            "nome": "Entregador",
            "bio": "Passa no mesmo horário toda semana. Só olha. Só calcula."
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
            "nome": "Beco Norte",
            "desc": "Onde ela espera. Toda quinta."
          },
          "es": {
            "nome": "Beco Norte",
            "desc": "Onde ela espera. Toda quinta."
          }
        },
        "pista_id": "p03a"
      },
      {
        "id": "correio",
        "puzzle": "anagrama",
        "i18n": {
          "pt": {
            "nome": "Rota do Entregador",
            "desc": "Passa no beco sem entregar nada."
          },
          "en": {
            "nome": "Rota do Entregador",
            "desc": "Passa no beco sem entregar nada."
          },
          "es": {
            "nome": "Rota do Entregador",
            "desc": "Passa no beco sem entregar nada."
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
            "desc": "As duas vítimas dos roubos."
          },
          "en": {
            "nome": "Lojas do Beco",
            "desc": "As duas vítimas dos roubos."
          },
          "es": {
            "nome": "Lojas do Beco",
            "desc": "As duas vítimas dos roubos."
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
            "desc": "Era só isso. Esperava o ônibus que sempre atrasava. Marelia inteira era culpada pelo horário do transporte público."
          },
          "en": {
            "titulo": "Ela esperava o ônibus",
            "desc": "Era só isso. Esperava o ônibus que sempre atrasava. Marelia inteira era culpada pelo horário do transporte público."
          },
          "es": {
            "titulo": "Ela esperava o ônibus",
            "desc": "Era só isso. Esperava o ônibus que sempre atrasava. Marelia inteira era culpada pelo horário do transporte público."
          }
        }
      },
      {
        "id": "p03b",
        "tipo": "rastro",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "O entregador passava no mesmo horário",
            "desc": "Não entregava nada no beco. Só olhava. Só calculava."
          },
          "en": {
            "titulo": "O entregador passava no mesmo horário",
            "desc": "Não entregava nada no beco. Só olhava. Só calculava."
          },
          "es": {
            "titulo": "O entregador passava no mesmo horário",
            "desc": "Não entregava nada no beco. Só olhava. Só calculava."
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
            "desc": "Os dois roubados tinham algo em comum: viravam as costas quando o entregador passava. Ele sabia exatamente quando virar."
          },
          "en": {
            "titulo": "Padrão dos roubos",
            "desc": "Os dois roubados tinham algo em comum: viravam as costas quando o entregador passava. Ele sabia exatamente quando virar."
          },
          "es": {
            "titulo": "Padrão dos roubos",
            "desc": "Os dois roubados tinham algo em comum: viravam as costas quando o entregador passava. Ele sabia exatamente quando virar."
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
            "pt": "tem uma mulher que aparece toda quinta, fica parada 10 minutos e vai embora",
            "en": "there is a woman who appears every thursday, stands 10 minutes and leaves",
            "es": "hay una mujer que aparece cada jueves"
          },
          "delay": 3000
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
            "es": "ella no sabe nada"
          },
          "delay": 2500
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "já avisei a empresa dele. anonimamente",
            "en": "I already told his company. anonymously",
            "es": "ya avisé a su empresa"
          },
          "delay": 4500
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "ela continua esperando o ônibus toda quinta. algumas coisas em marelia são imutáveis",
            "en": "she keeps waiting for the bus every thursday. some things never change",
            "es": "ella sigue esperando el bus"
          },
          "delay": 8000
        }
      ],
      "narracao_abertura": {
        "pt": "A mulher do chapéu não sabia que era isca. Às vezes as pessoas mais inocentes são as que mais trabalho dão, porque você precisa provar que são inocentes antes de chegar em quem não é.",
        "en": "A mulher do chapéu não sabia que era isca. Às vezes as pessoas mais inocentes são as que mais trabalho dão, porque você precisa provar que são inocentes antes de chegar em quem não é.",
        "es": "A mulher do chapéu não sabia que era isca. Às vezes as pessoas mais inocentes são as que mais trabalho dão, porque você precisa provar que são inocentes antes de chegar em quem não é."
      },
      "narracao_final": {
        "pt": "O entregador ia perder o emprego. A mulher do chapéu ia continuar sem saber que existiu por um momento no centro de tudo. Marelia era cheia de pessoas importantes que nunca iam descobrir que foram importantes.",
        "en": "O entregador ia perder o emprego. A mulher do chapéu ia continuar sem saber que existiu por um momento no centro de tudo. Marelia era cheia de pessoas importantes que nunca iam descobrir que foram importantes.",
        "es": "O entregador ia perder o emprego. A mulher do chapéu ia continuar sem saber que existiu por um momento no centro de tudo. Marelia era cheia de pessoas importantes que nunca iam descobrir que foram importantes."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_04",
    "desbloqueado": false,
    "reputacao_minima": 0,
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
        "nome": "Sangue no Asfalto",
        "subtitulo": "Uma mancha de sangue na frente do prédio. Jack não consegue parar de pensar."
      },
      "es": {
        "nome": "Sangue no Asfalto",
        "subtitulo": "Uma mancha de sangue na frente do prédio. Jack não consegue parar de pensar."
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
            "nome": "Morador do 3º Andar",
            "bio": "Briga doméstica frequente."
          },
          "es": {
            "nome": "Morador do 3º Andar",
            "bio": "Briga doméstica frequente."
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
            "nome": "Homem do Carro",
            "bio": "Mora no carro estacionado na rua."
          },
          "es": {
            "nome": "Homem do Carro",
            "bio": "Mora no carro estacionado na rua."
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
            "nome": "Frente do Prédio",
            "desc": "A mancha no asfalto. Já lavada."
          },
          "es": {
            "nome": "Frente do Prédio",
            "desc": "A mancha no asfalto. Já lavada."
          }
        },
        "pista_id": "p04a",
        "batalha": true
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
            "nome": "Beco Lateral",
            "desc": "O rastro vai até aqui e para."
          },
          "es": {
            "nome": "Beco Lateral",
            "desc": "O rastro vai até aqui e para."
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
            "desc": "3º andar. Ela atendeu com olho roxo."
          },
          "en": {
            "nome": "Porta da Vítima",
            "desc": "3º andar. Ela atendeu com olho roxo."
          },
          "es": {
            "nome": "Porta da Vítima",
            "desc": "3º andar. Ela atendeu com olho roxo."
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
            "titulo": "O rastro ia até o beco e parava",
            "desc": "Não porque parava de verdade: alguém tinha lavado o resto. Quem lava rastro de sangue às três da manhã não está protegendo a vítima."
          },
          "es": {
            "titulo": "O rastro ia até o beco e parava",
            "desc": "Não porque parava de verdade: alguém tinha lavado o resto. Quem lava rastro de sangue às três da manhã não está protegendo a vítima."
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
            "desc": "Ninguém foi ver. Marelia ensinava as pessoas a ficarem com a cabeça baixa."
          },
          "en": {
            "titulo": "Ela ouviu. Todo mundo ouviu",
            "desc": "Ninguém foi ver. Marelia ensinava as pessoas a ficarem com a cabeça baixa."
          },
          "es": {
            "titulo": "Ela ouviu. Todo mundo ouviu",
            "desc": "Ninguém foi ver. Marelia ensinava as pessoas a ficarem com a cabeça baixa."
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
            "desc": "Ela abriu a porta com olho roxo novo sobre olho roxo antigo e disse que estava tudo bem. Eu não entendia."
          },
          "en": {
            "titulo": "A vítima",
            "desc": "Ela abriu a porta com olho roxo novo sobre olho roxo antigo e disse que estava tudo bem. Eu não entendia."
          },
          "es": {
            "titulo": "A vítima",
            "desc": "Ela abriu a porta com olho roxo novo sobre olho roxo antigo e disse que estava tudo bem. Eu não entendia."
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
            "pt": "você desce pro corredor de manhã e o caso já está lá, vermelho escuro no asfalto, esperando",
            "en": "you go down the hallway and its already there dark red on the asphalt waiting",
            "es": "bajas al pasillo y ya está ahí rojo oscuro esperando"
          },
          "delay": 2500
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "eu podia ter ignorado. era o que a maioria fazia. mas eu sou burro desse jeito específico",
            "en": "I could have ignored it. most would. but I am stupid this specific way",
            "es": "podría haberlo ignorado. pero soy estúpido así"
          },
          "delay": 5500
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "eu sabia quem era. eu sabia onde morava. eu sabia que ela não ia registrar",
            "en": "I knew who it was. I knew she wouldnt report it",
            "es": "sabía quién era. sabía que no lo denunciaría"
          },
          "delay": 0
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "fui embora. e carreguei isso comigo. algumas resoluções não resolvem nada",
            "en": "I walked away. and carried it with me. some resolutions resolve nothing",
            "es": "me fui. y lo cargué conmigo"
          },
          "delay": 4000
        }
      ],
      "narracao_abertura": {
        "pt": "Às vezes o caso chega antes do cliente. Você desce pro corredor de manhã e o caso já está lá, vermelho escuro no asfalto, esperando.",
        "en": "Às vezes o caso chega antes do cliente. Você desce pro corredor de manhã e o caso já está lá, vermelho escuro no asfalto, esperando.",
        "es": "Às vezes o caso chega antes do cliente. Você desce pro corredor de manhã e o caso já está lá, vermelho escuro no asfalto, esperando."
      },
      "narracao_final": {
        "pt": "Não cobrei nada. Não tinha o que cobrar.",
        "en": "Não cobrei nada. Não tinha o que cobrar.",
        "es": "Não cobrei nada. Não tinha o que cobrar."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_05",
    "desbloqueado": false,
    "reputacao_minima": 0,
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
        "nome": "O Mensageiro Mudo",
        "subtitulo": "Kim recebeu uma foto. Alguém o seguiu. Alguém o fotografou de costas."
      },
      "es": {
        "nome": "O Mensageiro Mudo",
        "subtitulo": "Kim recebeu uma foto. Alguém o seguiu. Alguém o fotografou de costas."
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
            "nome": "Fotógrafo do Prédio",
            "bio": "Câmera nova demais pro aluguel que pagava."
          },
          "es": {
            "nome": "Fotógrafo do Prédio",
            "bio": "Câmera nova demais pro aluguel que pagava."
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
            "nome": "Ex-colega de Escola",
            "bio": "Rancor antigo. Motivo possível."
          },
          "es": {
            "nome": "Ex-colega de Escola",
            "bio": "Rancor antigo. Motivo possível."
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
            "nome": "Prédio do Kim",
            "desc": "A foto foi tirada daqui."
          },
          "es": {
            "nome": "Prédio do Kim",
            "desc": "A foto foi tirada daqui."
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
            "nome": "Estúdio do Fotógrafo",
            "desc": "Equipamento caro demais."
          },
          "es": {
            "nome": "Estúdio do Fotógrafo",
            "desc": "Equipamento caro demais."
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
            "desc": "De onde veio a encomenda."
          },
          "en": {
            "nome": "Correio Central",
            "desc": "De onde veio a encomenda."
          },
          "es": {
            "nome": "Correio Central",
            "desc": "De onde veio a encomenda."
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
            "desc": "Pro aluguel que ele pagava. A inconsistência mais importante não é o que as pessoas dizem, é o que as pessoas têm."
          },
          "en": {
            "titulo": "Câmera nova demais",
            "desc": "Pro aluguel que ele pagava. A inconsistência mais importante não é o que as pessoas dizem, é o que as pessoas têm."
          },
          "es": {
            "titulo": "Câmera nova demais",
            "desc": "Pro aluguel que ele pagava. A inconsistência mais importante não é o que as pessoas dizem, é o que as pessoas têm."
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
            "titulo": "Número desconhecido",
            "desc": "Usado uma vez. Uma transferência, uma instrução, uma foto. Quem usa número assim não planeja ser encontrado."
          },
          "es": {
            "titulo": "Número desconhecido",
            "desc": "Usado uma vez. Uma transferência, uma instrução, uma foto. Quem usa número assim não planeja ser encontrado."
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
            "desc": "DDD de ilha privada no Pacífico Sul. Ilhas privadas não contratam fotógrafos de Marelia por acidente."
          },
          "en": {
            "titulo": "DDD da ilha",
            "desc": "DDD de ilha privada no Pacífico Sul. Ilhas privadas não contratam fotógrafos de Marelia por acidente."
          },
          "es": {
            "titulo": "DDD da ilha",
            "desc": "DDD de ilha privada no Pacífico Sul. Ilhas privadas não contratam fotógrafos de Marelia por acidente."
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
            "es": "buenos días"
          },
          "delay": 1500
        },
        {
          "de": "kim",
          "i18n": {
            "pt": "alguém deixou um envelope debaixo da minha porta",
            "en": "someone left an envelope under my door",
            "es": "alguien dejó un sobre"
          },
          "delay": 3000
        },
        {
          "de": "kim",
          "i18n": {
            "pt": "tem uma foto minha de costas na rua",
            "en": "theres a photo of me from behind",
            "es": "hay una foto mía de espaldas"
          },
          "delay": 5000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "você tá em casa agora?",
            "en": "are you home?",
            "es": "estás en casa?"
          },
          "delay": 8000
        },
        {
          "de": "kim",
          "i18n": {
            "pt": "sim",
            "en": "yes",
            "es": "sí"
          },
          "delay": 9000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "fica lá",
            "en": "stay there",
            "es": "quédate ahí"
          },
          "delay": 9500
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
            "en": "photographer from your building. paid to follow you",
            "es": "fotógrafo de tu edificio"
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
            "en": "number that no longer exists. outside brazil",
            "es": "número que ya no existe"
          },
          "delay": 4000
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "ilha privada. pacífico sul",
            "en": "private island. south pacific",
            "es": "isla privada. pacífico sur"
          },
          "delay": 7000
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
            "pt": "isso não é aleatório",
            "en": "this is not random",
            "es": "esto no es aleatorio"
          },
          "delay": 12000
        },
        {
          "de": "kim",
          "i18n": {
            "pt": "eu sei jack. obrigado",
            "en": "I know jack. thank you",
            "es": "lo sé jack. gracias"
          },
          "delay": 14000
        }
      ],
      "narracao_abertura": {
        "pt": "Kim não pedia ajuda. Era constitucional nele, era estrutural, era parte do código. Quando ele mandou aquela mensagem eu entendi que era sério antes de entender o que era.",
        "en": "Kim não pedia ajuda. Era constitucional nele, era estrutural, era parte do código. Quando ele mandou aquela mensagem eu entendi que era sério antes de entender o que era.",
        "es": "Kim não pedia ajuda. Era constitucional nele, era estrutural, era parte do código. Quando ele mandou aquela mensagem eu entendi que era sério antes de entender o que era."
      },
      "narracao_final": {
        "pt": "Ele agradeceu. Kim não agradecia. Eu fui pra cama e não consegui dormir, não sei se foi pelo caso ou pelo jeito que ele disse obrigado, como se já soubesse que era só o começo.",
        "en": "Ele agradeceu. Kim não agradecia. Eu fui pra cama e não consegui dormir, não sei se foi pelo caso ou pelo jeito que ele disse obrigado, como se já soubesse que era só o começo.",
        "es": "Ele agradeceu. Kim não agradecia. Eu fui pra cama e não consegui dormir, não sei se foi pelo caso ou pelo jeito que ele disse obrigado, como se já soubesse que era só o começo."
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
    "reputacao_ganho": 200,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_07",
      "caso_08",
      "caso_09"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Três Testemunhas",
        "subtitulo": "Caso 6 de Marelia."
      },
      "en": {
        "nome": "Três Testemunhas",
        "subtitulo": "Case 6 of Marelia."
      },
      "es": {
        "nome": "Três Testemunhas",
        "subtitulo": "Caso 6 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_06_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_06_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_06_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_06_01",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_06_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_06_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 6.",
            "en": "[placeholder] Investigating case 6.",
            "es": "[placeholder] Investigando caso 6."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 6.",
        "en": "[narracao] Case 6.",
        "es": "[narracao] Caso 6."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": {
      "pt": "[placeholder] K.",
      "en": "[placeholder] K.",
      "es": "[placeholder] K."
    }
  },
  {
    "id": "caso_07",
    "desbloqueado": false,
    "reputacao_minima": 300,
    "reputacao_ganho": 200,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_08"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Ferreiro",
        "subtitulo": "Caso 7 de Marelia."
      },
      "en": {
        "nome": "O Ferreiro",
        "subtitulo": "Case 7 of Marelia."
      },
      "es": {
        "nome": "O Ferreiro",
        "subtitulo": "Caso 7 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_07_01",
        "batalha": true
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_07_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_07_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_07_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_07_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_07_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 7.",
            "en": "[placeholder] Investigating case 7.",
            "es": "[placeholder] Investigando caso 7."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 7.",
        "en": "[narracao] Case 7.",
        "es": "[narracao] Caso 7."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_08",
    "desbloqueado": false,
    "reputacao_minima": 350,
    "reputacao_ganho": 200,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_09"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Enfermeira",
        "subtitulo": "Caso 8 de Marelia."
      },
      "en": {
        "nome": "A Enfermeira",
        "subtitulo": "Case 8 of Marelia."
      },
      "es": {
        "nome": "A Enfermeira",
        "subtitulo": "Caso 8 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_08_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_08_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_08_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_08_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_08_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_08_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 8.",
            "en": "[placeholder] Investigating case 8.",
            "es": "[placeholder] Investigando caso 8."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 8.",
        "en": "[narracao] Case 8.",
        "es": "[narracao] Caso 8."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_09",
    "desbloqueado": false,
    "reputacao_minima": 400,
    "reputacao_ganho": 200,
    "dificuldade": 3,
    "desbloqueia": [
      "caso_10"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Contador",
        "subtitulo": "Caso 9 de Marelia."
      },
      "en": {
        "nome": "O Contador",
        "subtitulo": "Case 9 of Marelia."
      },
      "es": {
        "nome": "O Contador",
        "subtitulo": "Caso 9 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_09_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_09_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_09_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_09_01",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_09_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_09_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 9.",
            "en": "[placeholder] Investigating case 9.",
            "es": "[placeholder] Investigando caso 9."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 9.",
        "en": "[narracao] Case 9.",
        "es": "[narracao] Caso 9."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": {
      "pt": "[placeholder] K.",
      "en": "[placeholder] K.",
      "es": "[placeholder] K."
    }
  },
  {
    "id": "caso_10",
    "desbloqueado": false,
    "reputacao_minima": 450,
    "reputacao_ganho": 250,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_11",
      "caso_12"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Lista Incompleta",
        "subtitulo": "Caso 10 de Marelia."
      },
      "en": {
        "nome": "A Lista Incompleta",
        "subtitulo": "Case 10 of Marelia."
      },
      "es": {
        "nome": "A Lista Incompleta",
        "subtitulo": "Caso 10 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_10_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_10_02",
        "batalha": true
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_10_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_10_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_10_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_10_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 10.",
            "en": "[placeholder] Investigating case 10.",
            "es": "[placeholder] Investigando caso 10."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 10.",
        "en": "[narracao] Case 10.",
        "es": "[narracao] Caso 10."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_11",
    "desbloqueado": false,
    "reputacao_minima": 500,
    "reputacao_ganho": 300,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_12"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Dentro do Porto",
        "subtitulo": "Caso 11 de Marelia."
      },
      "en": {
        "nome": "Dentro do Porto",
        "subtitulo": "Case 11 of Marelia."
      },
      "es": {
        "nome": "Dentro do Porto",
        "subtitulo": "Caso 11 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_11_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_11_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_11_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_11_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_11_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_11_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 11.",
            "en": "[placeholder] Investigating case 11.",
            "es": "[placeholder] Investigando caso 11."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 11.",
        "en": "[narracao] Case 11.",
        "es": "[narracao] Caso 11."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_12",
    "desbloqueado": false,
    "reputacao_minima": 550,
    "reputacao_ganho": 300,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_13"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Fora da Lei",
        "subtitulo": "Caso 12 de Marelia."
      },
      "en": {
        "nome": "Fora da Lei",
        "subtitulo": "Case 12 of Marelia."
      },
      "es": {
        "nome": "Fora da Lei",
        "subtitulo": "Caso 12 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_12_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_12_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_12_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_12_01",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_12_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_12_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 12.",
            "en": "[placeholder] Investigating case 12.",
            "es": "[placeholder] Investigando caso 12."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 12.",
        "en": "[narracao] Case 12.",
        "es": "[narracao] Caso 12."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": {
      "pt": "[placeholder] K.",
      "en": "[placeholder] K.",
      "es": "[placeholder] K."
    }
  },
  {
    "id": "caso_13",
    "desbloqueado": false,
    "reputacao_minima": 600,
    "reputacao_ganho": 350,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_14",
      "caso_15",
      "caso_16"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Nome no Muro",
        "subtitulo": "Caso 13 de Marelia."
      },
      "en": {
        "nome": "O Nome no Muro",
        "subtitulo": "Case 13 of Marelia."
      },
      "es": {
        "nome": "O Nome no Muro",
        "subtitulo": "Caso 13 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_13_01",
        "batalha": true
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_13_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_13_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_13_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_13_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_13_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 13.",
            "en": "[placeholder] Investigating case 13.",
            "es": "[placeholder] Investigando caso 13."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 13.",
        "en": "[narracao] Case 13.",
        "es": "[narracao] Caso 13."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_14",
    "desbloqueado": false,
    "reputacao_minima": 650,
    "reputacao_ganho": 300,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_15"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Gravação",
        "subtitulo": "Caso 14 de Marelia."
      },
      "en": {
        "nome": "A Gravação",
        "subtitulo": "Case 14 of Marelia."
      },
      "es": {
        "nome": "A Gravação",
        "subtitulo": "Caso 14 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_14_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_14_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_14_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_14_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_14_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_14_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 14.",
            "en": "[placeholder] Investigating case 14.",
            "es": "[placeholder] Investigando caso 14."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 14.",
        "en": "[narracao] Case 14.",
        "es": "[narracao] Caso 14."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_15",
    "desbloqueado": false,
    "reputacao_minima": 700,
    "reputacao_ganho": 300,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_16"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Arquivo",
        "subtitulo": "Caso 15 de Marelia."
      },
      "en": {
        "nome": "O Arquivo",
        "subtitulo": "Case 15 of Marelia."
      },
      "es": {
        "nome": "O Arquivo",
        "subtitulo": "Caso 15 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_15_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_15_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_15_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_15_01",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_15_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_15_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 15.",
            "en": "[placeholder] Investigating case 15.",
            "es": "[placeholder] Investigando caso 15."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 15.",
        "en": "[narracao] Case 15.",
        "es": "[narracao] Caso 15."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": {
      "pt": "[placeholder] K.",
      "en": "[placeholder] K.",
      "es": "[placeholder] K."
    }
  },
  {
    "id": "caso_16",
    "desbloqueado": false,
    "reputacao_minima": 750,
    "reputacao_ganho": 300,
    "dificuldade": 4,
    "desbloqueia": [
      "caso_17"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "A Testemunha Protegida",
        "subtitulo": "Caso 16 de Marelia."
      },
      "en": {
        "nome": "A Testemunha Protegida",
        "subtitulo": "Case 16 of Marelia."
      },
      "es": {
        "nome": "A Testemunha Protegida",
        "subtitulo": "Caso 16 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_16_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_16_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_16_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_16_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_16_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_16_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 16.",
            "en": "[placeholder] Investigating case 16.",
            "es": "[placeholder] Investigando caso 16."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 16.",
        "en": "[narracao] Case 16.",
        "es": "[narracao] Caso 16."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_17",
    "desbloqueado": false,
    "reputacao_minima": 800,
    "reputacao_ganho": 500,
    "dificuldade": 5,
    "desbloqueia": [
      "caso_18",
      "caso_19"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Tudo Leva a Ele",
        "subtitulo": "Caso 17 de Marelia."
      },
      "en": {
        "nome": "Tudo Leva a Ele",
        "subtitulo": "Case 17 of Marelia."
      },
      "es": {
        "nome": "Tudo Leva a Ele",
        "subtitulo": "Caso 17 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_17_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_17_02",
        "batalha": true
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_17_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_17_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_17_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_17_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 17.",
            "en": "[placeholder] Investigating case 17.",
            "es": "[placeholder] Investigando caso 17."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 17.",
        "en": "[narracao] Case 17.",
        "es": "[narracao] Caso 17."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_18",
    "desbloqueado": false,
    "reputacao_minima": 850,
    "reputacao_ganho": 400,
    "dificuldade": 5,
    "desbloqueia": [
      "caso_19"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Confronto Direto",
        "subtitulo": "Caso 18 de Marelia."
      },
      "en": {
        "nome": "Confronto Direto",
        "subtitulo": "Case 18 of Marelia."
      },
      "es": {
        "nome": "Confronto Direto",
        "subtitulo": "Caso 18 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_18_01",
        "batalha": true
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_18_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_18_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_18_01",
        "tipo": "objeto",
        "fio": true,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_18_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_18_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 18.",
            "en": "[placeholder] Investigating case 18.",
            "es": "[placeholder] Investigando caso 18."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 18.",
        "en": "[narracao] Case 18.",
        "es": "[narracao] Caso 18."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": {
      "pt": "[placeholder] K.",
      "en": "[placeholder] K.",
      "es": "[placeholder] K."
    }
  },
  {
    "id": "caso_19",
    "desbloqueado": false,
    "reputacao_minima": 900,
    "reputacao_ganho": 400,
    "dificuldade": 5,
    "desbloqueia": [
      "caso_20"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Fuga Planejada",
        "subtitulo": "Caso 19 de Marelia."
      },
      "en": {
        "nome": "Fuga Planejada",
        "subtitulo": "Case 19 of Marelia."
      },
      "es": {
        "nome": "Fuga Planejada",
        "subtitulo": "Caso 19 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_19_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_19_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_19_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_19_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_19_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_19_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 19.",
            "en": "[placeholder] Investigating case 19.",
            "es": "[placeholder] Investigando caso 19."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 19.",
        "en": "[narracao] Case 19.",
        "es": "[narracao] Caso 19."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_20",
    "desbloqueado": false,
    "reputacao_minima": 950,
    "reputacao_ganho": 1000,
    "dificuldade": 5,
    "desbloqueia": [],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "PESADELO PARTICULAR",
        "subtitulo": "Caso 20 de Marelia."
      },
      "en": {
        "nome": "PESADELO PARTICULAR",
        "subtitulo": "Case 20 of Marelia."
      },
      "es": {
        "nome": "PESADELO PARTICULAR",
        "subtitulo": "Caso 20 de Marelia."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso A",
            "bio": "Placeholder."
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
            "bio": "Placeholder."
          },
          "es": {
            "nome": "Sospechoso B",
            "bio": "Placeholder."
          }
        },
        "culpado": false,
        "avatar": "👤"
      }
    ],
    "pistas_necessarias": 3,
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar A",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_20_01"
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
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar B",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_20_02"
      },
      {
        "id": "loc3",
        "puzzle": "stealth",
        "i18n": {
          "pt": {
            "nome": "Local C",
            "desc": "Placeholder."
          },
          "en": {
            "nome": "Place C",
            "desc": "Placeholder."
          },
          "es": {
            "nome": "Lugar C",
            "desc": "Placeholder."
          }
        },
        "pista_id": "pcaso_20_03"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_20_01",
        "tipo": "objeto",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue A",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista A",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_20_02",
        "tipo": "testemunho",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue B",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista B",
            "desc": "Placeholder."
          }
        }
      },
      {
        "id": "pcaso_20_03",
        "tipo": "documento",
        "fio": false,
        "i18n": {
          "pt": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          },
          "en": {
            "titulo": "Clue C",
            "desc": "Placeholder."
          },
          "es": {
            "titulo": "Pista C",
            "desc": "Placeholder."
          }
        }
      }
    ],
    "dialogo": {
      "abertura": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] Investigando caso 20.",
            "en": "[placeholder] Investigating case 20.",
            "es": "[placeholder] Investigando caso 20."
          },
          "delay": 0
        }
      ],
      "resolucao": [
        {
          "de": "jack",
          "i18n": {
            "pt": "[placeholder] resolvido.",
            "en": "[placeholder] solved.",
            "es": "[placeholder] resuelto."
          },
          "delay": 0
        }
      ],
      "narracao_abertura": {
        "pt": "[narracao] Caso 20.",
        "en": "[narracao] Case 20.",
        "es": "[narracao] Caso 20."
      },
      "narracao_final": {
        "pt": "[narracao] Fim.",
        "en": "[narracao] End.",
        "es": "[narracao] Fin."
      }
    },
    "pista_kronos": null
  }
]
