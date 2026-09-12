// Biografias de recrutamento — texto de lore de cada um dos 30 personagens
// jogáveis, mostrado no botão "HISTÓRIA" da ficha de recrutamento (pedido
// do Isaias, set/2026). Chave = character_template_id, o MESMO id do
// catálogo (ldi_gangues_30_personagens_v1.json) e da tabela no GDD §7.
//
// PT-first de propósito (texto de lore extenso, escrito direto pelo
// Isaias) — sem chave i18n, ao contrário da UI ao redor (botão/título/
// fechar, esses sim em pt/en/es). Traduzir os 30 textos pra en/es é
// trabalho de tradução de verdade, não cabe nesta entrega; até lá, o
// botão mostra este texto em pt pra qualquer idioma (ver GanguesFichaBio.jsx).
//
// Fonte de verdade também documentada em docs/Games/Gangues/LDI_GANGUES_GDD.md §7.1
// — se mudar aqui, atualizar lá também (e vice-versa).
export const GANGUES_BIOGRAFIAS = {
  1: {
    quemE: 'Um brigador de rua que aprendeu cedo que, quando uma passagem fecha, alguém precisa ser o primeiro a atravessar.',
    historia: 'Trinca cresceu fazendo serviço pesado e carregando mudança, feira e sucata pela Pista. Ganhou o apelido depois de arrebentar uma porta para tirar três crianças de uma casa pegando fogo. Descobriu depois que a mesma força que salva também abre caminho numa briga.',
    porQueRecrutar: 'Trinca não recua quando a linha inimiga fecha. É o cara que entra primeiro para os outros conseguirem passar.',
  },
  2: {
    quemE: 'Um sujeito enorme, quieto e assustadoramente forte.',
    historia: 'Trabalhou anos quebrando parede, carregando concreto e desmontando construção clandestina. Quando o patrão desapareceu sem pagar uma equipe inteira, Marreta vendeu as próprias ferramentas para dividir o dinheiro com os outros trabalhadores. Desde então trabalha por conta e escolhe muito bem para quem empresta a força.',
    porQueRecrutar: 'Quando estratégia acaba e alguma coisa simplesmente precisa cair, Marreta resolve.',
  },
  3: {
    quemE: 'Uma lutadora rápida, fria e extremamente econômica nos movimentos.',
    historia: 'Fenda cresceu entre pequenos golpes e apostas de luta. Nunca foi a mais forte, então aprendeu a observar: distância, respiração, perna de apoio, mão dominante. Ela não procura dez oportunidades numa luta. Procura uma — a primeira.',
    porQueRecrutar: 'Fenda reconhece uma abertura antes que o adversário perceba que a deixou.',
  },
  4: {
    quemE: 'Um lutador veloz que odeia confronto prolongado.',
    historia: 'Foi criado trabalhando em barbearia e fazendo entrega pelas ruas estreitas de Marélia. Aprendeu a desaparecer por becos antes que problema virasse confusão. Quando começou a lutar, levou a mesma filosofia: entrar, resolver e sair antes de alguém entender o que aconteceu.',
    porQueRecrutar: 'Navalha é perfeito quando a gangue precisa derrubar alguém rápido antes que o resto do bando consiga reagir.',
  },
  5: {
    quemE: 'Um brigador que parece ficar mais perigoso quanto mais machucado fica.',
    historia: 'Touro cresceu numa família grande em que sempre era ele quem ficava para resolver o problema quando os outros já tinham ido embora. Virou segurança de festa, carregador e cobrador informal, mas nunca aceitou bater em quem não podia responder.',
    porQueRecrutar: 'Quando uma luta vira desastre e todo mundo começa a cair, Touro continua de pé.',
  },
  6: {
    quemE: 'Uma lutadora que entra em cada combate como se não existisse amanhã.',
    historia: 'Sangue sobreviveu a uma emboscada que derrubou todo o antigo grupo dela. Desde então desenvolveu uma relação quase doentia com risco: quanto pior a situação, mais tranquila ela fica. Não procura morrer — simplesmente parou de ter medo disso.',
    porQueRecrutar: 'É a pessoa que você coloca numa luta que todo mundo já considera perdida.',
  },
  7: {
    quemE: 'Uma combatente obsessiva por precisão.',
    historia: 'Mira passou anos trabalhando em barraca de tiro e jogos de habilidade em festas de bairro. Transformou coordenação e leitura corporal em método de combate. Ela estuda o adversário durante minutos se for preciso, esperando exatamente o movimento que quer.',
    porQueRecrutar: 'Mira não desperdiça ataque. Quando decide acertar alguma coisa, geralmente acerta o ponto que realmente importa.',
  },
  8: {
    quemE: 'Um lutador especializado em atacar de onde ninguém está olhando.',
    historia: 'Ponto sobreviveu como entregador, olheiro e atravessador entre bairros rivais. Aprendeu que ser invisível vale mais do que ser forte. Ele conhece o segundo exato em que uma pessoa deixa de prestar atenção em determinado ângulo.',
    porQueRecrutar: 'Ele transforma distração em arma e é excelente contra inimigos mais poderosos que dependem de controle do campo.',
  },
  9: {
    quemE: 'Uma veterana que guarda nomes melhor do que guarda dinheiro.',
    historia: 'Cicatriz perdeu gente demais para guerras que começaram por decisões de homens que nunca pisaram na rua onde o sangue caiu. Ela não esqueceu nenhum responsável. Passou anos ficando forte o bastante para cobrar cada dívida pessoalmente.',
    porQueRecrutar: 'É paciente, experiente e impossível de intimidar quando acredita que existe uma conta a ser acertada.',
  },
  10: {
    quemE: 'Um lutador que acredita que tudo volta.',
    historia: 'Troco foi pequeno estelionatário, apostador e cobrador até ser traído pelo próprio grupo e abandonado com uma dívida que não era dele. Pagou centavo por centavo. Depois começou a procurar quem tinha colocado seu nome naquela conta.',
    porQueRecrutar: 'Troco nunca esquece quem bateu primeiro — e costuma devolver com juros.',
  },
  11: {
    quemE: 'Um defensor enorme, calmo e quase impossível de deslocar.',
    historia: 'Muro trabalhou descarregando caminhão e fazendo segurança de comércio. Ficou conhecido quando segurou sozinho a entrada de uma viela durante uma confusão para impedir que a briga chegasse às casas dos moradores. Não venceu ninguém. Só não deixou ninguém passar.',
    porQueRecrutar: 'Toda gangue precisa de alguém capaz de dizer "daqui ninguém passa" e fazer isso ser verdade.',
  },
  12: {
    quemE: 'Um veterano pesado que luta como se tivesse sido construído no lugar.',
    historia: 'Passou a juventude na construção civil clandestina que ergueu boa parte dos puxadinhos de Marélia. Quedas, acidentes e anos carregando peso transformaram seu corpo numa muralha. É lento, mas aprendeu a nunca gastar movimento à toa.',
    porQueRecrutar: 'Concreto segura posições que outros personagens simplesmente não conseguiriam manter.',
  },
  13: {
    quemE: 'Uma lutadora que naturalmente coloca os outros atrás dela.',
    historia: 'Guarda sempre foi a irmã mais velha, a vizinha que buscava criança perdida e a primeira pessoa chamada quando havia confusão na rua. Nunca quis mandar em ninguém. Só desenvolveu o hábito de ficar entre o perigo e quem não consegue se defender.',
    porQueRecrutar: 'Ela não protege apenas a própria vida; protege a formação inteira da gangue.',
  },
  14: {
    quemE: 'Um defensor conhecido por entrar literalmente no caminho dos golpes.',
    historia: 'Ombro ganhou o apelido jogando bola nas quadras da Vila, onde ninguém conseguia tirá-lo de posição. Mais tarde começou a acompanhar amigos em trabalhos perigosos e percebeu que tinha talento para proteger gente usando o próprio corpo.',
    porQueRecrutar: 'Se alguém importante precisa chegar vivo ao fim da luta, Ombro é quem você coloca ao lado.',
  },
  15: {
    quemE: 'Um provocador profissional incapaz de ficar calado.',
    historia: 'Boca vendia qualquer coisa que coubesse numa sacola e conseguia discutir com cliente, guarda, rival e comerciante no mesmo minuto. Descobriu nas brigas que insultar o sujeito certo no momento certo pode controlar uma luta inteira.',
    porQueRecrutar: 'Boca faz o adversário esquecer o plano e atacar exatamente quem ele quer.',
  },
  16: {
    quemE: 'Uma lutadora especializada em parecer mais vulnerável do que realmente é.',
    historia: 'Isca cresceu sobrevivendo a golpes em que seu papel era atrair atenção enquanto outra pessoa fazia o trabalho. Quando abandonou essa vida, manteve a habilidade. Ela sabe exatamente que postura faz alguém pensar: "essa é a mais fácil".',
    porQueRecrutar: 'Inimigos atacam Isca porque acham que estão escolhendo o alvo certo. Normalmente descobrem tarde demais que foram escolhidos por ela.',
  },
  17: {
    quemE: 'Uma defensora paciente que prefere que o adversário tome a primeira decisão.',
    historia: 'Catraca passou anos lidando com gente agressiva em ônibus, festas e comércio. Aprendeu a nunca oferecer o primeiro golpe. Espera, observa e usa o movimento do próprio agressor contra ele.',
    porQueRecrutar: 'Contra inimigos impulsivos, lutar com Catraca é quase lutar contra si mesmo.',
  },
  18: {
    quemE: 'Um especialista em transformar pressão em contra-ataque.',
    historia: 'Rebote começou como parceiro de treino dos lutadores mais fortes do bairro. Passava horas apanhando porque ninguém queria enfrentar os grandões. Em vez de quebrá-lo, isso ensinou todos os padrões de ataque que existem numa briga de rua.',
    porQueRecrutar: 'Quanto mais previsível e agressivo o inimigo, mais perigoso Rebote se torna.',
  },
  19: {
    quemE: 'Um sobrevivente que aparentemente não sabe quando deveria ficar no chão.',
    historia: 'Ferro trabalhou desde criança em ferro-velho e oficina. Acidentes que teriam afastado muita gente só viraram histórias que ele conta rindo. Ele não é invulnerável; simplesmente desenvolveu uma tolerância absurda a continuar funcionando machucado.',
    porQueRecrutar: 'Ferro compra para a gangue aquilo que nenhuma loja vende: tempo.',
  },
  20: {
    quemE: 'Uma lutadora magra, dura e muito mais resistente do que a aparência sugere.',
    historia: 'Osso cresceu ouvindo que era pequena demais para tudo. Trabalho, briga, carregar peso, sobreviver sozinha. Aprendeu a responder da única maneira que respeitavam em Marélia: ficando em pé depois que quem duvidou já tinha caído.',
    porQueRecrutar: 'É uma sobrevivente nata e uma das últimas pessoas que você verá abandonar uma luta.',
  },
  21: {
    quemE: 'Uma mística explosiva cujo poder começa pequeno e cresce rapidamente.',
    historia: 'Brasa descobriu a afinidade com fogo trabalhando perto de fogão, carvão e metal quente. Durante muito tempo escondeu aquilo como truque. Quando percebeu que o fenômeno respondia às emoções dela, começou a aprender controle antes que alguém se machucasse.',
    porQueRecrutar: 'Se tiver tempo para crescer dentro da luta, Brasa transforma uma faísca em problema para o campo inteiro.',
  },
  22: {
    quemE: 'Um místico que entende o fogo pelo que sobra depois dele.',
    historia: 'Cinza perdeu a casa num incêndio e voltou no dia seguinte para ajudar os vizinhos a procurar o que ainda podia ser salvo. Foi entre as paredes queimadas que seu poder apareceu. Ao contrário de Brasa, ele não é explosivo: é paciente, silencioso e sufocante.',
    porQueRecrutar: 'Cinza domina batalhas longas. Ele não precisa queimar tudo de uma vez; só precisa garantir que o fogo nunca termine completamente.',
  },
  23: {
    quemE: 'Uma mística adaptável que raramente enfrenta força com força.',
    historia: 'Maré cresceu perto dos canais e áreas alagadas da Baixada. Aprendeu a respeitar água porque viu rua virar rio em questão de minutos. Seu estilo segue a mesma lógica: contorna, acumula, recua e volta maior.',
    porQueRecrutar: 'Maré é excelente quando o plano original falha, porque muda de ritmo sem perder eficiência.',
  },
  24: {
    quemE: 'Um místico cujo domínio da água é muito menos delicado do que o nome sugere.',
    historia: 'Chuva passou anos escondendo suas capacidades porque toda manifestação forte atraía atenção demais. O controle veio tarde, depois de vários acidentes e uma vida inteira aprendendo a se conter.',
    porQueRecrutar: 'Quando finalmente deixa de se conter, consegue alterar completamente o ritmo de uma batalha.',
  },
  25: {
    quemE: 'Uma mística ligada ao solo, à estabilidade e ao controle de espaço.',
    historia: 'Raiz cresceu numa família que ocupou e construiu a mesma área por gerações. Para ela, território não é linha num mapa: é memória. Seu poder apareceu defendendo justamente o terreno que sua família chamava de casa.',
    porQueRecrutar: 'Raiz transforma o lugar da luta em vantagem. Tirar terreno dela é tão difícil quanto tirá-la dele.',
  },
  26: {
    quemE: 'Um místico destrutivo que encontrou no chão a melhor maneira de atingir quem está acima.',
    historia: 'Racha trabalhou abrindo vala, quebrando piso e consertando tubulação. Começou percebendo pequenas vibrações através dos pés; depois descobriu que também conseguia devolvê-las.',
    porQueRecrutar: 'Excelente contra grupos e defesas rígidas. Racha não precisa atravessar uma formação quando pode quebrar o chão que sustenta todo mundo.',
  },
  27: {
    quemE: 'Um jovem místico inquieto que sente eletricidade antes mesmo de entender de onde ela vem.',
    historia: 'Faísca sempre soube quando uma tempestade estava chegando. O cabelo arrepiava, a pele formigava e aparelhos falhavam perto dele. Quando a eletricidade começou a responder de volta, percebeu que aquilo não era coincidência.',
    porQueRecrutar: 'Faísca é rápido, imprevisível e possui um potencial que claramente ainda está longe do limite.',
  },
  28: {
    quemE: 'Uma mística que representa tudo que Faísca ainda pode se tornar em força bruta.',
    historia: 'Trovão não teve a oportunidade de esconder o próprio dom. A primeira manifestação séria derrubou energia de uma rua inteira e colocou seu nome na boca de gente perigosa. Desde então vive mudando de lugar.',
    porQueRecrutar: 'Quando é necessário encerrar uma luta com violência e velocidade, poucos conseguem produzir o impacto de Trovão.',
  },
  29: {
    quemE: 'Uma figura misteriosa que domina percepção, confusão e desaparecimento.',
    historia: 'Pouca gente sabe de onde Névoa veio, e as versões não combinam. Camelô, golpista, artista, fugitivo — cada bairro conta uma história. Talvez todas sejam falsas. Isso provavelmente é intencional.',
    porQueRecrutar: 'Uma gangue que todos conseguem ver é fácil de enfrentar. Névoa faz o inimigo duvidar até de quem está na frente dele.',
  },
  30: {
    quemE: 'Uma mística capaz de transformar certeza em dúvida.',
    historia: 'Espelho passou a vida observando pessoas e copiando postura, voz e maneira de falar. O que começou como talento de imitação acabou despertando algo muito mais estranho: fazer outras pessoas enxergarem aquilo que esperavam enxergar.',
    porQueRecrutar: 'Espelho não precisa convencer o inimigo de uma mentira. Basta oferecer duas verdades e deixar que ele escolha a errada.',
  },
}

export function getGanguesBiografia(characterTemplateId) {
  return GANGUES_BIOGRAFIAS[Number(characterTemplateId)] || null
}
