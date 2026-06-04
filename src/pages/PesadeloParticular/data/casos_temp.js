// PESADELO PARTICULAR — 20 casos com diálogos canônicos (GDD v1.0)
// Casos 01-02: completos. Casos 03-20: diálogos reais.

export const CASOS = [
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
          "bio": "Espera 10 minutos no beco toda quinta."
        },
        "en": {
          "nome": "A Mulher do Chapéu",
          "bio": "Espera 10 minutos no beco toda quinta."
        },
        "es": {
          "nome": "A Mulher do Chapéu",
          "bio": "Espera 10 minutos no beco toda quinta."
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
          "nome": "Entregador",
          "bio": "Passa no mesmo horário toda semana."
        },
        "es": {
          "nome": "Entregador",
          "bio": "Passa no mesmo horário toda semana."
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
          "nome": "Correio",
          "desc": "Rota do entregador."
        },
        "en": {
          "nome": "Correio",
          "desc": "Rota do entregador."
        },
        "es": {
          "nome": "Correio",
          "desc": "Rota do entregador."
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
          "nome": "Lojas do Beco",
          "desc": "As duas vítimas."
        },
        "es": {
          "nome": "Lojas do Beco",
          "desc": "As duas vítimas."
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
          "titulo": "Ela esperava o ônibus",
          "desc": "Era só isso. Marelia inteira era culpada pelo horário."
        },
        "es": {
          "titulo": "Ela esperava o ônibus",
          "desc": "Era só isso. Marelia inteira era culpada pelo horário."
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
          "titulo": "O entregador",
          "desc": "Não entregava nada no beco. Só olhava. Só calculava."
        },
        "es": {
          "titulo": "O entregador",
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
          "desc": "Os dois roubados viravam as costas quando o entregador passava."
        },
        "en": {
          "titulo": "Padrão dos roubos",
          "desc": "Os dois roubados viravam as costas quando o entregador passava."
        },
        "es": {
          "titulo": "Padrão dos roubos",
          "desc": "Os dois roubados viravam as costas quando o entregador passava."
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
          "desc": "3º andar. Ela atendeu."
        },
        "en": {
          "nome": "Porta da Vítima",
          "desc": "3º andar. Ela atendeu."
        },
        "es": {
          "nome": "Porta da Vítima",
          "desc": "3º andar. Ela atendeu."
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
          "desc": "Ninguém foi ver. Marelia ensinava as pessoas a ficarem com a cabeça baixa e eu não podia culpá-las."
        },
        "en": {
          "titulo": "Ela ouviu. Todo mundo ouviu",
          "desc": "Ninguém foi ver. Marelia ensinava as pessoas a ficarem com a cabeça baixa e eu não podia culpá-las."
        },
        "es": {
          "titulo": "Ela ouviu. Todo mundo ouviu",
          "desc": "Ninguém foi ver. Marelia ensinava as pessoas a ficarem com a cabeça baixa e eu não podia culpá-las."
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
          "titulo": "A vítima",
          "desc": "Ela abriu a porta com olho roxo novo em cima de olho roxo antigo e disse que estava tudo bem. Eu disse que sabia que não estava."
        },
        "es": {
          "titulo": "A vítima",
          "desc": "Ela abriu a porta com olho roxo novo em cima de olho roxo antigo e disse que estava tudo bem. Eu disse que sabia que não estava."
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
      "en": "Às vezes o caso chega antes do cliente. Às vezes você desce pro corredor de manhã e o caso já está lá, vermelho escuro no asfalto, esperando.",
      "es": "Às vezes o caso chega antes do cliente. Às vezes você desce pro corredor de manhã e o caso já está lá, vermelho escuro no asfalto, esperando."
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
          "desc": "De onde veio a encomenda do número."
        },
        "en": {
          "nome": "Correio Central",
          "desc": "De onde veio a encomenda do número."
        },
        "es": {
          "nome": "Correio Central",
          "desc": "De onde veio a encomenda do número."
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
          "titulo": "Câmera nova demais",
          "desc": "Pro aluguel que ele pagava. Às vezes a inconsistência mais importante não é o que as pessoas dizem: é o que as pessoas têm."
        },
        "es": {
          "titulo": "Câmera nova demais",
          "desc": "Pro aluguel que ele pagava. Às vezes a inconsistência mais importante não é o que as pessoas dizem: é o que as pessoas têm."
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
          "desc": "DDD de ilha privada no Pacífico Sul. Ilhas privadas no Pacífico Sul não contratam fotógrafos de Marelia por acidente."
        },
        "en": {
          "titulo": "DDD da ilha",
          "desc": "DDD de ilha privada no Pacífico Sul. Ilhas privadas no Pacífico Sul não contratam fotógrafos de Marelia por acidente."
        },
        "es": {
          "titulo": "DDD da ilha",
          "desc": "DDD de ilha privada no Pacífico Sul. Ilhas privadas no Pacífico Sul não contratam fotógrafos de Marelia por acidente."
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
      "en": "Kim não pedia ajuda. Era constitucional nele, era estrutural, era parte do código. Quando ele mandou aquela mensagem eu entendi que era sério antes de entender o que era.",
      "es": "Kim não pedia ajuda. Era constitucional nele, era estrutural, era parte do código. Quando ele mandou aquela mensagem eu entendi que era sério antes de entender o que era."
    },
    "narracao_final": {
      "pt": "Ele agradeceu. Kim não agradecia. Eu fui pra cama e não consegui dormir e não sei se foi por causa do caso ou por causa do jeito que ele disse obrigado, como se já soubesse que era só o começo.",
      "en": "Ele agradeceu. Kim não agradecia. Eu fui pra cama e não consegui dormir e não sei se foi por causa do caso ou por causa do jeito que ele disse obrigado, como se já soubesse que era só o começo.",
      "es": "Ele agradeceu. Kim não agradecia. Eu fui pra cama e não consegui dormir e não sei se foi por causa do caso ou por causa do jeito que ele disse obrigado, como se já soubesse que era só o começo."
    }
  },
  "pista_kronos": {
    "pt": "DDD de ilha privada. K.",
    "en": "Private island area code. K.",
    "es": "Código de isla privada. K."
  }
}
]