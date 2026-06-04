// Paletas por jogo
export const PALETTES = {
  jack: {
    bg: '#0a0a0a', bgGrad: '#0d0505', border: '#8B0000',
    accent: '#F5A623', accentDim: '#F5A62388',
    text: '#C8C8C8', textDim: '#666', textBright: '#F5A623',
    font: "'Share Tech Mono', monospace", logo: 'JACK DREAM BEER',
    logoColor: '#F5A623', logoSub: 'illusionfight.com',
    tagline: 'o sonho não tem regras.',
  },
  toptrumps: {
    bg: '#0a0f14', bgGrad: '#050d10', border: '#00B4D8',
    accent: '#F5A623', accentDim: '#00B4D888',
    text: '#C8C8C8', textDim: '#555', textBright: '#00B4D8',
    font: "'Share Tech Mono', monospace", logo: 'TOP TRUMPS LDI',
    logoColor: '#00B4D8', logoSub: 'illusionfight.com',
    tagline: 'a arena nunca dorme.',
  },
  quiz: {
    bg: '#0a0a0a', bgGrad: '#0a0505', border: '#F97316',
    accent: '#F97316', accentDim: '#F9731688',
    text: '#C8C8C8', textDim: '#666', textBright: '#F97316',
    font: "'Share Tech Mono', monospace", logo: 'QUIZ SDR',
    logoColor: '#F97316', logoSub: 'illusionfight.com',
    tagline: 'o conhecimento é sua arma.',
  },
  ldi: {
    bg: '#0a0a10', bgGrad: '#050510', border: '#A855F4',
    accent: '#A855F4', accentDim: '#A855F488',
    text: '#C8C8C8', textDim: '#555', textBright: '#A855F4',
    font: "'Share Tech Mono', monospace", logo: 'LENDAS DO LDI',
    logoColor: '#00B4D8', logoSub: 'illusionfight.com',
    tagline: 'bem-vindo às lutas de ilusão.',
  },
}

const FRASES = {
  jack: {
    dungeon: [
      'derrubei todos. no sonho isso era mais fácil.',
      'mais uma dungeon. menos um problema.',
      'no sonho eu sempre venço. sempre.',
    ],
    caso: [
      'caso encerrado. o próximo já está esperando.',
      'justiceiro de sonho. não paga as contas mas satisfaz.',
      'mais um culpado atrás das grades do subconsciente.',
    ],
    default: [
      'no sonho cada vitória conta. e conta dobrado.',
      'acordado eu perco. dormindo eu arraso.',
      'ninguém me vê vencer aqui. mas eu sei.',
    ],
  },
  toptrumps: {
    vitoria: [
      'a carta mais forte sempre vence. hoje era a minha.',
      'mais uma vitória. o ranking sobe.',
      'o oponente jogou bem. mas não o suficiente.',
    ],
    default: [
      'a arena não esquece ninguém.',
      'cada vitória te aproxima do topo.',
      'o SDR registra tudo. inclusive isso.',
    ],
  },
  quiz: {
    rank: [
      'você conhece esse universo melhor do que imagina.',
      'as respostas certas estavam em você o tempo todo.',
      'nota alta. orgulho baixo. do jeito certo.',
    ],
    default: [
      'quem sabe mais vence mais.',
      'cada pergunta respondida é um passo adiante.',
      'o conhecimento do universo LDI cresce.',
    ],
  },
  ldi: {
    default: [
      'você escreveu sua própria lenda.',
      'o mundo das ilusões nunca mais será o mesmo.',
      'entre a verdade e a ilusão, você escolheu lutar.',
    ],
  },
}

export function getFrase(game, context) {
  const pool = FRASES[game]?.[context] || FRASES[game]?.default || FRASES.jack.default
  return pool[Math.floor(Math.random() * pool.length)]
}
