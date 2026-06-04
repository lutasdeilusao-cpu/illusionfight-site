JACK DREAM BEER — GDD v3.0
Game Design Document Completo

1. CONCEITO
Título: Jack Dream Beer
Gênero: Idle Noir Investigativo
Inspirações: Candy Box 2 (idle base) + Carmen San Diego (investigação com pistas) + Chandler/Hammett (narração noir)
Jack dorme. No sonho, Marelia é noir, silenciosa e cheia de caso não resolvido. Jack é detetive. Tem um escritório que é um boteco porque no sonho detetive não paga aluguel. Cervejas acumulam sozinhas enquanto ele pensa. Quando um caso aparece, ele investiga — visita locais, coleta pistas, interroga suspeitos, resolve puzzles, confronta culpados. Quatro casos. Quatro cidades. E no fim, o culpado de tudo era a pessoa mais óbvia do mundo.

2. ESTRUTURA GERAL
Loop de gameplay
IDLE (cervejas acumulando)
    ↓
CASO NOVO (cliente aparece com problema)
    ↓
INVESTIGAÇÃO (visitar locais, coletar pistas, puzzles)
    ↓
ACUSAÇÃO (escolher culpado com evidências)
    ↓
CONFRONTO (dungeon final do caso)
    ↓
RESOLUÇÃO (narração noir + recompensa + próximo caso)
Os 4 Casos
#CasoCidadeClienteCulpado1A Oficina FechadaMareliaNinaCobrador Fantasma2O Carregamento SumidoAuranisKarimOperativo (traidor)3A Pista Sem RemetenteKarnazarNinguém — chega sozinhaKronos4Quem Sabotou o SonhoTodos os mundosO próprio Jack percebeKim

3. RECURSOS
RecursoÍconeComo obterPara que serveCervejas 🍺cervejas+1/s passivo + dropsComprar itens, pagar informantesNotas 💵notasDrops de dungeonItens premium, subornar suspeitosFragmentos 💎fragmentosDrops em Auranis/KarnazarMercado Negro e TiraPistas 🔍pistas[]InvestigaçãoResolver casos, fazer acusaçãoHP ❤️hpAtual/hpMaxBase 20Sobreviver dungeons

4. SISTEMA DE INVESTIGAÇÃO
Dossier
Ao aceitar um caso, Jack recebe um dossier com:

Nome do caso
Descrição do problema em narração noir
Lista de suspeitos (2-3 nomes com descrição vaga)
Lista de locais disponíveis para investigar (4-5)
Pistas coletadas até agora (começa vazio)

Visitar Locais
Cada local tem 1-2 pistas disponíveis. Ao visitar:

Jack narra o que vê (monólogo curto, voz dele)
Uma pista é revelada automaticamente
Às vezes a pista está danificada → ativa um puzzle antes de revelar
Às vezes o local está guardado → ativa dungeon pequena antes de entrar

Tipos de Pista
TipoComo apareceO que revelaTestemunhoNPC fala algo suspeitoComportamento de suspeitoObjetoItem encontrado no localConecta suspeito ao localDocumentoPapel/nota encontradaData, nome, endereçoRastroSinal físico no ambienteRota do culpadoAlibi falsoContradição em testemunhoElimina alibi de suspeito
Puzzles de Investigação
Reaproveitados do LDI:
PuzzleQuando ativaO que representaDecoderDocumento cifrado encontradoDecifrar mensagem codificadaStealth GridLocal vigiadoInfiltrar sem ser vistoSliding TilesFoto/documento destruídoReconstituir evidência rasgada
Acusação
Quando Jack acha que tem evidências suficientes (mínimo 4 pistas coletadas das 6-8 disponíveis), pode fazer a acusação:

Escolhe o suspeito culpado
O jogo verifica se as pistas coletadas apontam para ele
Acusação correta: confronto final (dungeon do caso)
Acusação errada: penalidade — culpado foge para local diferente, Jack perde 50🍺 e precisa coletar mais 2 pistas antes de acusar de novo. Narração: "errei. típico. pelo menos não cobrei adiantado."


5. OS 4 CASOS — DETALHAMENTO COMPLETO

CASO 1 — A Oficina Fechada
Cidade: Marelia
Cliente: Nina entra no boteco sem bater. Cara de quem não pede favor mas tá pedindo favor.
Narração de abertura:
"ela tinha cabelo rosa e cara de problema. entrou sem bater. eu tava no meu escritório, que é o boteco do Jazz porque no sonho eu sou detetive e aparentemente detetive não paga aluguel. 'osvaldo sumiu', ela disse. 'três dias. a oficina tá fechada.' eu olhei pra minha cerveja. depois pra ela. depois pra cerveja de novo. 'quanto você paga?' 'nada.' 'tô dentro.'"
Suspeitos:

Cobrador Fantasma — vigia de dívidas do bairro, visto perto da oficina
Dono do Cortiço — Osvaldo devia aluguel atrasado
Analista do Terminal — tinha negócio inacabado com Osvaldo

Locais para investigar (5):
LocalPista disponívelPuzzle?Dungeon?Oficina (porta dos fundos)Rastro: marcas de luta no chãoStealth Grid (entrar sem ser visto)—Barraca do PajéTestemunho: Pajé viu homem de capa levando Osvaldo——CortiçoObjeto: recibo de dívida no nome do Cobrador——TerminalDocumento: mensagem cifrada trocada entre Osvaldo e desconhecidoDecoder—Risca a FacaAlibi falso: segurança diz que Cobrador estava lá, mas horário não fechaDungeon pequena (entrar no clube)3 inimigos
Pistas totais: 6 (4 mínimo para acusar)
Culpado: Cobrador Fantasma
Confronto: Dungeon "O Ônibus" — Cobrador Fantasma como boss (20 HP)
Resolução: Osvaldo é liberado. Vira aliado permanente (+1 dano em todas as dungeons seguintes). Narração: "osvaldo não disse obrigado. mas fez uma manutenção na bengala de graça. no sonho isso conta como gratidão."

CASO 2 — O Carregamento Sumido
Cidade: Auranis
Cliente: Karim na pensão, nervoso. Carregamento de fragmentos sumiu no porto. O dono tá mandando ameaça.
Narração de abertura:
"auranis cheirava a sal e a negócio inacabado. karim me esperava na pensão com cara de quem não dormiu. 'o carregamento sumiu', ele disse. 'fragmentos. muito valor. o dono quer de volta ou quer sangue.' eu olhei pela janela pro porto. névoa. sempre névoa. 'tem suspeito?' 'tem três.' típico."
Suspeitos:

Operativo do Mercado Negro — sabia do carregamento, tinha acesso ao porto
Capitão do Porto Velho — controlava entrada e saída
Informante Anônimo — vendeu a rota do carregamento pra alguém

Locais para investigar (5):
LocalPista disponívelPuzzle?Dungeon?Porto VelhoRastro: container aberto com fragmentos esquecidosDungeon (5 inimigos)✅Mercado NegroTestemunho: Operativo esquivo, resposta vaga sobre fragmentos——Pensão Rua 7Documento: nota com coordenadas da DocaSliding Tiles (nota rasgada)—Doca AbandonadaObjeto: símbolo do Mercado Negro marcado na paredeSó à NOITE—Terminal AuranisAlibi falso: Operativo disse que estava aqui, mas registro diz outra coisaDecoder (registro cifrado)—
Pistas totais: 6
Culpado: Operativo (estava vendendo os fragmentos pra Torre Kronos)
Confronto: Dungeon "Doca Abandonada" — Operativo como boss (30 HP)
Resolução: Karim fica devendo um favor. Flag KARIM_CONFIA ativa. Narração: "o operativo caiu. os fragmentos voltaram pra karim. ele me ofereceu parte. eu recusei. no sonho eu tenho princípios. acordado é diferente."

CASO 3 — A Pista Sem Remetente
Cidade: Karnazar
Cliente: Ninguém. Jack acorda dentro do sonho com um envelope na mão. Sem nome. Sem endereço. Só uma coordenada.
Narração de abertura:
"karnazar. eu não lembro de ter vindo pra cá. tinha um envelope na minha mão quando acordei dentro do sonho. sem nome. sem endereço. coordenadas de um lugar que não devia existir. o frio não era do clima. era de outra coisa. eu fui investigar porque no sonho detetive não tem opção de não investigar."
Suspeitos:

Kronos — espírito que aparece na Torre, ligado às coordenadas
Viran — sabe mais do que conta, treina Jack sem explicar por quê
A Própria Pista — e se o remetente for o próprio Jack de outro sonho?

Locais para investigar (5):
LocalPista disponívelPuzzle?Dungeon?Dojô de ViranTestemunho: Viran reconhece o símbolo do envelope——Rua BrancaRastro: pegadas que somem no meio do caminhoDungeon (8 inimigos)✅O EscuroObjeto: segundo envelope, mesmo símbolo, data diferenteCena especial sem combate—Observatório (Tira)Documento: arquivo com nome de Kronos e as coordenadasSliding Tiles—Ilha Privada (entrada)Alibi impossível: Kronos estava em dois lugares ao mesmo tempoStealth Grid—
Pistas totais: 6
Culpado: Kronos — mas a revelação é que ele não mandou a pista. Ele também recebeu uma. De Jack.
Confronto: Torre Kronos — mecânica de fuga. Kronos aparece, diz uma frase, Jack é ejetado. Não tem vitória.
Resolução: Flag KRONOS_VIU. Medidor Primordial aparece. Narração: "ele não mandou o envelope. eu mandei. de algum lugar no sonho que eu ainda não fui. isso não faz sentido nenhum. karnazar inteira não faz sentido nenhum. fui tomar uma cerveja."

CASO 4 — Quem Sabotou o Sonho
Cidade: Todos os mundos revisitados
Cliente: Jack mesmo. Ele percebe que as três investigações anteriores tinham algo em comum — alguém sabia de cada caso antes dele. Alguém que estava presente em todos os lugares. Alguém que nunca pareceu suspeito porque estava na cara dura o tempo todo.
Narração de abertura:
"eu tinha resolvido três casos. osvaldo, o carregamento, o envelope. e só agora percebi: tinha alguém em todos eles. no boteco. no porto. na pensão. sempre lá. sempre me vendo trabalhar. sempre com aquela cara de quem acha que você tá perdendo tempo. eu precisava revisitar tudo. e dessa vez, eu sabia o que procurar."
Mecânica especial — Revisita:
Jack volta aos 3 mundos com um novo olhar. Em cada mundo, 2 locais têm pistas que antes não eram visíveis — porque Jack não estava procurando a coisa certa.
Locais revisitados (6 — 2 por mundo):
LocalPista novaO que revelaBoteco do Jazz (Marelia)Objeto: copo com impressão digital que não é de nenhum suspeitoKim estava lá quando Osvaldo foi levadoOficina (Marelia)Rastro: marca de bengala no chão — não é de JackKim entrou antes de JackPorto Velho (Auranis)Testemunho: estivador viu garçom de chapéu conversando com OperativoKim estava em AuranisPensão (Auranis)Documento: Karim tem anotação com nome "J" — não é JackKim visitou Karim antes do caso começarDojô de Viran (Karnazar)Alibi falso: Viran diz que Kim "passou por aqui faz tempo"Kim conhecia KarnazarO Escuro (Karnazar)Objeto: terceiro envelope — esse tem a letra de KimKim mandou as coordenadas
Pistas totais: 6. Todas apontam para Kim.
Acusação: Jack volta ao Boteco do Jazz. Kim está lá. Cara emburrada. Conta virada.
Interrogatório (cena especial sem dungeon):
"eu coloquei as pistas na mesa. uma por uma. kim olhou cada uma com aquela cara. depois olhou pra mim.
'e aí?' ele disse.
'era você', eu disse.
'era eu.'
'por quê?'
ele pegou o copo. bebeu devagar. colocou de volta.
'eu avisei', ele disse.
'avisei o quê?'
'que esse sonho ia dar problema.'
eu fiquei olhando pra ele. ele fez sinal pro barman. dois copos.
'senta', ele disse. 'vou te contar tudo.'"
Confronto: Dungeon final — "O Boteco do Jazz à Meia-Noite". Kim como boss. HP 100. 3 fases.

Fase 1 (100-66 HP): Kim desviando, não atacando, só falando "você não entendeu ainda"
Fase 2 (66-33 HP): Kim atacando de verdade, dano alto, "para. você vai se machucar"
Fase 3 (33-0 HP): Kim para de desviar. Fica parado. Deixa Jack acertar. "pronto. satisfeito?"

Resolução final:
"kim caiu. no sonho isso significa que eu venci. mas ele estava sorrindo. eu odeio quando ele faz isso.
'o que você estava fazendo?', eu perguntei.
'te preparando', ele disse.
'pra quê?'
ele não respondeu. o sonho começou a clarear. aquela luz de quando você vai acordar.
'kim—'
'acorda, jack.'
eu acordei. kim tava do meu lado mandando meme no whatsapp.
típico."

6. SISTEMAS ATIVOS
6.1 Idle Base

Cervejas acumulam +1/s passivo
Itens aumentam cervejas/s
Dungeons dropam cervejas e notas

6.2 Investigação (novo)

Dossier por caso com suspeitos e locais
Pistas coletadas em qualquer ordem
Mínimo 4 de 6-8 pistas para acusar
Acusação errada = penalidade + fuga do culpado
Puzzles ativados por pistas danificadas

6.3 Combate (horizontal)

Jack à esquerda, inimigos à direita
Animação: Jack avança pra direita ao atacar, recua ao tomar dano
Onomatopeias flutuantes: CRACK!/POW!/WHAM! no acerto, MISS! no erro, OOF!/ARGH! no dano
Dados automáticos a cada 1.2s

6.4 Dia/Noite

Botão 🌙/☀️ na StatusBar, cooldown 30s
Doca Abandonada só à noite
NPCs com saudações diferentes por período

6.5 Primordial

Medidor 0-10, visível após KRONOS_VIU
+1 por dungeon completada
Ao encher: próxima dungeon dobra dano, zera medidor

6.6 Aliados

Kim (20💵): reduz dano -1 — disponível até o Caso 4, onde ele vira suspeito
Nina (15💵): +50% drop de notas
Shuntaro (30💵): +2 dano, requer KRONOS_VIU

6.7 Puzzles (reaproveitados do LDI)

Decoder: documento cifrado
Stealth Grid: local vigiado
Sliding Tiles: evidência destruída


7. MUNDO — 4 CONTEXTOS
Marelia (Caso 1)
Cidade noir familiar. Ruas molhadas, postes amarelos, jazz saindo dos botecos. Todos os locais do GDD v2.1 presentes, agora com função investigativa além de loja.
Auranis (Caso 2)
Porto com névoa permanente. Cheiro de sal e negócio inacabado. Locais do GDD v2.1 com camada investigativa.
Karnazar (Caso 3)
Frio que entra nos ossos. Cidade que parece saber que você não devia estar lá. Locais do GDD v2.1.
Revisita — Caso 4
Os 3 mundos com nova camada de pistas invisíveis anteriormente. Mesmos locais, nova função. A cidade mudou porque Jack mudou.

8. NPCS — PAPÉIS NOIR
NPCPapel noirFunção no casoPajé YawanariInformante misteriosoTestemunha no Caso 1, aparece em O Escuro no Caso 3KimGarçom emburrado / Vilão finalPresente em todos os casos, culpado do Caso 4NinaCliente / ParceiraTraz o Caso 1, aliada nos demaisOsvaldoVítima do Caso 1 / Aliado permanenteLiberto no Caso 1, +1 dano permanenteLaraInformante pagaPistas no Caso 1 e 2 mediante cervejasKarimCliente do Caso 2Devendo favor após resoluçãoOperativoCulpado do Caso 2Traidor do Mercado NegroViranMentor silenciosoTreina Jack pro Caso 3, sabe mais do que contaTiraArquivo vivoEntrega documento crucial no Caso 3ShuntaroAliado de última horaAparece no Caso 3, sem explicação, sem desculpa

9. ITENS — SEM MUDANÇA ESTRUTURAL
28 itens do GDD v2.1 mantidos. Nomes e descrições podem ganhar verniz noir nas próximas versões.

10. NARRAÇÃO — VOZ DO JACK
Todas as transições, descobertas, acusações e resoluções são narradas em primeira pessoa pelo Jack. Tom: Chandler/Hammett com a voz do Jack do universo LDI — irônico, cansado, nunca genuinamente assustado, humor mesmo em situações sérias.
Exemplos de narração por momento:
MomentoExemploEntrar num local"a oficina cheirava a graxa e a três dias sem resposta."Encontrar pista"tinha uma marca no chão. alguém que usava bengala. eu uso bengala. mas eu não estava aqui."Puzzle ativa"o documento estava em pedaços. claro que estava."Acusação errada"errei. típico. pelo menos não cobrei adiantado."Boss derrotado"ele caiu. no sonho isso resolve alguma coisa. acordado eu sei que não resolve. mas no sonho sim."Kim como culpado"era ele o tempo todo. o meu melhor amigo. no meu próprio sonho. trabalhando contra mim. típico."

11. ARQUITETURA TÉCNICA
Novos arquivos necessários
src/pages/JackCandy/
├── data/
│   ├── casos.js          # 4 casos com suspeitos, locais, pistas, confronto
│   └── pistas.js         # Banco de pistas com tipo, texto, puzzle associado
├── screens/
│   ├── Dossier.jsx       # Tela do dossier ativo — suspeitos, pistas, acusar
│   ├── Investigacao.jsx  # Visitar local — narração + pista revelada + puzzle gate
│   └── Interrogatorio.jsx # Caso 4 — cena especial sem dungeon com Kim
└── components/
    └── PistaCard.jsx     # Card de pista individual com tipo e ícone
Novos campos no store
js{
  // existentes mantidos
  casoAtivo: null,          // id do caso em andamento
  pistasColetadas: [],      // pistas do caso atual
  suspeitos: [],            // suspeitos com status (ativo/eliminado/culpado)
  locaisVisitados: [],      // locais já visitados no caso atual
  acusacoesErradas: 0,      // contador de acusações erradas no caso atual
  casosResolvidos: [],      // ids dos casos já concluídos
}
Flags novas
jsCASO1_RESOLVIDO, CASO2_RESOLVIDO, CASO3_RESOLVIDO, CASO4_RESOLVIDO,
OSVALDO_ALIADO, KARIM_DEVE_FAVOR, KRONOS_VIU_CASO3, KIM_REVELADO

12. SEQUÊNCIA DE IMPLEMENTAÇÃO

Combate horizontal + animações + onomatopeias (task já definida — fazer primeiro)
Store: adicionar campos de investigação
casos.js e pistas.js com dados completos
Dossier.jsx — tela do caso ativo
Investigacao.jsx — visitar local e revelar pista
Gate de puzzle (Decoder, Stealth, Sliding Tiles) integrado à investigação
Sistema de acusação com validação de pistas
Caso 1 completo testado ponta a ponta
Caso 2, 3, 4 em sequência
Interrogatorio.jsx — cena especial do Kim
Dungeon do Kim (3 fases, HP 100)
Narração final + créditos


13. VERSÃO
JACK_VERSION: 3.0.0
Console: [JACK] versão carregada: 3.0.0

Esse é o documento. Valida e quando quiser começa a implementação pela task do combate horizontal que já está definida.You said: ja temso combate horizontal e ja ta lindo demais com as onomatopéias e tudo ma snão repcisa reescrever não ele ta eprfeito só não podemos perder o que temos de…ja temso combate horizontal e ja ta lindo demais com as onomatopéias e tudo ma snão repcisa reescrever não ele ta eprfeito só não podemos perder o que temos de dile game tbm é unificar essas duas experiencias03:57Claude responded: Exato.Exato. O idle não some — ele é a base que sustenta tudo.
A unificação é:
Idle rodando sempre em background — cervejas acumulando, HP regenerando, timer do dia/noite, tudo contínuo. Quando Jack está investigando, as cervejas continuam caindo. Quando está num puzzle, o idle não para. O jogador volta de uma investigação mais rico do que saiu.
Investigação consome recursos do idle — subornar um informante custa cervejas. Entrar num local vigiado sem fazer dungeon custa notas. Pagar Lara por uma pista custa cervejas. O idle alimenta a investigação.
Dungeons são o confronto dos casos mas também farm — o Ônibus Noturno infinito continua existindo pra quem quer farmar fora dos casos. As dungeons dos casos são narrativas. As dungeons livres são farm. Coexistem.
A estrutura de fases não muda — intro → vila → investigação → dungeon → resolução. O idle está presente em todas essas fases, não é uma tela separada.
Em código isso significa: os setInterval do idle continuam rodando em JackCandy.jsx independente de qual fase o store está. A investigação é só mais uma fase possível, como interior_npcId já é hoje.
Quer que eu monte a task de implementação do sistema de investigação já com essa premissa clara pro agent?