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
        "nome": "A Primeira Noite",
        "subtitulo": "Osvaldo sumiu."
      },
      "es": {
        "nome": "A Primeira Noite",
        "subtitulo": "Osvaldo sumiu."
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
            "bio": "Dono do bar. Sabe de tudo."
          },
          "es": {
            "nome": "Osvaldo",
            "bio": "Dono do bar. Sabe de tudo."
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
            "nome": "O Homem do Terno",
            "bio": "Sempre de terno."
          },
          "es": {
            "nome": "O Homem do Terno",
            "bio": "Sempre de terno."
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
            "nome": "Beco da Estação",
            "desc": "Úmido. Escuro."
          },
          "es": {
            "nome": "Beco da Estação",
            "desc": "Úmido. Escuro."
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
            "nome": "Bar da Esquina",
            "desc": "Todo mundo passa."
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
            "nome": "Delegacia Central",
            "desc": "Arquivos empoeirados."
          },
          "es": {
            "nome": "Delegacia Central",
            "desc": "Arquivos empoeirados."
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
            "desc": "Viu tudo e não queria ter visto."
          },
          "en": {
            "titulo": "Relato do Zé do Bar",
            "desc": "Viu tudo e não queria ter visto."
          },
          "es": {
            "titulo": "Relato do Zé do Bar",
            "desc": "Viu tudo e não queria ter visto."
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
            "titulo": "Envelope sem Remetente",
            "desc": "Uma inicial: K. Guardei no bolso."
          },
          "es": {
            "titulo": "Envelope sem Remetente",
            "desc": "Uma inicial: K. Guardei no bolso."
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
        "en": "Osvaldo era o tipo de homem que a cidade esquece que precisa até o dia que ele não está mais lá.",
        "es": "Osvaldo era o tipo de homem que a cidade esquece que precisa até o dia que ele não está mais lá."
      },
      "narracao_final": {
        "pt": "Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele.",
        "en": "Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele.",
        "es": "Osvaldo sempre abriu portas pra gente. Agora alguém tinha aberto uma porta pra ele."
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
        "subtitulo": "Alguém trancava o portão toda noite."
      },
      "en": {
        "nome": "O Portão Fechado",
        "subtitulo": "Alguém trancava o portão toda noite."
      },
      "es": {
        "nome": "O Portão Fechado",
        "subtitulo": "Alguém trancava o portão toda noite."
      }
    },
    "suspeitos": [
      {
        "id": "zelador",
        "i18n": {
          "pt": {
            "nome": "Zelador",
            "bio": "Varre o mesmo trecho três vezes."
          },
          "en": {
            "nome": "Zelador",
            "bio": "Varre o mesmo trecho três vezes."
          },
          "es": {
            "nome": "Zelador",
            "bio": "Varre o mesmo trecho três vezes."
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
            "bio": "Histórico de vandalismo."
          },
          "en": {
            "nome": "Aluno Rico",
            "bio": "Histórico de vandalismo."
          },
          "es": {
            "nome": "Aluno Rico",
            "bio": "Histórico de vandalismo."
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
            "desc": "Trancado toda noite."
          },
          "en": {
            "nome": "Portão de Serviço",
            "desc": "Trancado toda noite."
          },
          "es": {
            "nome": "Portão de Serviço",
            "desc": "Trancado toda noite."
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
            "desc": "Onde ninguém olha."
          },
          "en": {
            "nome": "Depósito",
            "desc": "Onde ninguém olha."
          },
          "es": {
            "nome": "Depósito",
            "desc": "Onde ninguém olha."
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
            "desc": "Zelador pagou com dinheiro vivo."
          },
          "en": {
            "titulo": "Cadeado Novo",
            "desc": "Zelador pagou com dinheiro vivo."
          },
          "es": {
            "titulo": "Cadeado Novo",
            "desc": "Zelador pagou com dinheiro vivo."
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
            "desc": "Espécie. Sem nome."
          },
          "en": {
            "titulo": "Envelope de Dinheiro",
            "desc": "Espécie. Sem nome."
          },
          "es": {
            "titulo": "Envelope de Dinheiro",
            "desc": "Espécie. Sem nome."
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
            "pt": "pode chamar de Jack",
            "en": "call me jack",
            "es": "llámame jack"
          },
          "delay": 3000
        },
        {
          "de": "anonimo",
          "i18n": {
            "pt": "o portão da escola tá sendo trancado toda noite",
            "en": "the school gate locked every night",
            "es": "la reja cerrada cada noche"
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
            "en": "they dont know who",
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
            "en": "doesnt know. cash",
            "es": "no sabe. efectivo"
          },
          "delay": 3500
        },
        {
          "de": "jack",
          "i18n": {
            "pt": "tive uma conversa com ele",
            "en": "I had a conversation",
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
        "pt": "Portões trancados em Marelia não eram novidade.",
        "en": "Portões trancados em Marelia não eram novidade.",
        "es": "Portões trancados em Marelia não eram novidade."
      },
      "narracao_final": {
        "pt": "O zelador ia ficar com o dinheiro e com a consciência.",
        "en": "O zelador ia ficar com o dinheiro e com a consciência.",
        "es": "O zelador ia ficar com o dinheiro e com a consciência."
      }
    },
    "pista_kronos": null
  },
  {
    "id": "caso_03",
    "desbloqueado": false,
    "reputacao_minima": 100,
    "reputacao_ganho": 160,
    "dificuldade": 1,
    "desbloqueia": [
      "caso_04"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Sangue no Asfalto",
        "subtitulo": "Uma mancha de sangue na frente do prédio."
      },
      "en": {
        "nome": "Sangue no Asfalto",
        "subtitulo": "Uma mancha de sangue na frente do prédio."
      },
      "es": {
        "nome": "Sangue no Asfalto",
        "subtitulo": "Uma mancha de sangue na frente do prédio."
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
        "pista_id": "pcaso_03_1"
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
        "pista_id": "pcaso_03_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_03_1",
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
        "id": "pcaso_03_2",
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
            "pt": "[placeholder] Caso 3.",
            "en": "[PH] Case 3.",
            "es": "[PH] Caso 3."
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
        "pt": "Caso 3.",
        "en": "Case 3.",
        "es": "Caso 3."
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
    "id": "caso_04",
    "desbloqueado": false,
    "reputacao_minima": 150,
    "reputacao_ganho": 180,
    "dificuldade": 1,
    "desbloqueia": [
      "caso_05"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "O Mensageiro Mudo",
        "subtitulo": "Kim recebeu uma foto de costas."
      },
      "en": {
        "nome": "O Mensageiro Mudo",
        "subtitulo": "Kim recebeu uma foto de costas."
      },
      "es": {
        "nome": "O Mensageiro Mudo",
        "subtitulo": "Kim recebeu uma foto de costas."
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
        "pista_id": "pcaso_04_1"
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
        "pista_id": "pcaso_04_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_04_1",
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
        "id": "pcaso_04_2",
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
            "pt": "[placeholder] Caso 4.",
            "en": "[PH] Case 4.",
            "es": "[PH] Caso 4."
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
        "pt": "Caso 4.",
        "en": "Case 4.",
        "es": "Caso 4."
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
    "id": "caso_05",
    "desbloqueado": false,
    "reputacao_minima": 200,
    "reputacao_ganho": 200,
    "dificuldade": 2,
    "desbloqueia": [
      "caso_06"
    ],
    "thumbnail": "📋",
    "i18n": {
      "pt": {
        "nome": "Três Testemunhas",
        "subtitulo": "Três versões do mesmo acidente."
      },
      "en": {
        "nome": "Três Testemunhas",
        "subtitulo": "Três versões do mesmo acidente."
      },
      "es": {
        "nome": "Três Testemunhas",
        "subtitulo": "Três versões do mesmo acidente."
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
        "pista_id": "pcaso_05_1"
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
        "pista_id": "pcaso_05_2"
      }
    ],
    "pistas": [
      {
        "id": "pcaso_05_1",
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
        "id": "pcaso_05_2",
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
            "pt": "[placeholder] Caso 5.",
            "en": "[PH] Case 5.",
            "es": "[PH] Caso 5."
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
        "pt": "Caso 5.",
        "en": "Case 5.",
        "es": "Caso 5."
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
        "nome": "O Ferreiro",
        "subtitulo": "Ferreiro inconsciente na forja."
      },
      "es": {
        "nome": "O Ferreiro",
        "subtitulo": "Ferreiro inconsciente na forja."
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
        "nome": "A Enfermeira",
        "subtitulo": "Enfermeira some toda semana."
      },
      "es": {
        "nome": "A Enfermeira",
        "subtitulo": "Enfermeira some toda semana."
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
        "nome": "O Contador",
        "subtitulo": "Contador sumiu com os livros."
      },
      "es": {
        "nome": "O Contador",
        "subtitulo": "Contador sumiu com os livros."
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
        "nome": "A Lista Incompleta",
        "subtitulo": "Uma lista com seu nome."
      },
      "es": {
        "nome": "A Lista Incompleta",
        "subtitulo": "Uma lista com seu nome."
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
        "nome": "Dentro do Porto",
        "subtitulo": "Carga some do porto."
      },
      "es": {
        "nome": "Dentro do Porto",
        "subtitulo": "Carga some do porto."
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
        "nome": "Fora da Lei",
        "subtitulo": "Identidade clonada."
      },
      "es": {
        "nome": "Fora da Lei",
        "subtitulo": "Identidade clonada."
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
        "nome": "O Nome no Muro",
        "subtitulo": "Nome pichado nos muros."
      },
      "es": {
        "nome": "O Nome no Muro",
        "subtitulo": "Nome pichado nos muros."
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
        "nome": "A Gravação",
        "subtitulo": "Demo vazada antes do lançamento."
      },
      "es": {
        "nome": "A Gravação",
        "subtitulo": "Demo vazada antes do lançamento."
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
        "nome": "O Arquivo",
        "subtitulo": "Arquivo histórico queimado."
      },
      "es": {
        "nome": "O Arquivo",
        "subtitulo": "Arquivo histórico queimado."
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
