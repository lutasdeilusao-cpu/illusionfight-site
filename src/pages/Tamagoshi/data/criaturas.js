import kronikiIdle from '../../../assets/images/tamagoshi/01/kroniki-idle.png'
import kronikiHungry from '../../../assets/images/tamagoshi/01/kroniki-hungry.png'
import kronikiEnjoy from '../../../assets/images/tamagoshi/01/kroniki-enjoy.png'
import kronikiHappy from '../../../assets/images/tamagoshi/01/kroniki-happy.png'
import kronikiAbandoned from '../../../assets/images/tamagoshi/01/kroniki-abandoned.png'
import kronikiAnger from '../../../assets/images/tamagoshi/01/kroniki-anger.png'
import kronikiDirty from '../../../assets/images/tamagoshi/01/kroniki-dirty.png'
import kronikiSick from '../../../assets/images/tamagoshi/01/kroniki-sick.png'
import kronikiSleepy from '../../../assets/images/tamagoshi/01/kroniki-sleepy.png'
import kronikiPresentation from '../../../assets/images/tamagoshi/01/kroniki-presentation.png'

const KRONIKI_SPRITE = {
  imagem: kronikiIdle,
  gifs: {
    idle: kronikiIdle,
    comendo: kronikiHungry,
    satisfeito: kronikiEnjoy,
    feliz: kronikiHappy,
    abandonado: kronikiAbandoned,
    raiva: kronikiAnger,
    sujo: kronikiDirty,
    doente: kronikiSick,
    sonolento: kronikiSleepy,
    apresentacao: kronikiPresentation,
  },
}

// Todas as criaturas usam o sprite do Kroniki temporariamente
// até cada uma receber sua arte individual
const CRIATURAS_BASE = [
  { id: 'voidling',    nome: 'Voidling',    tipo: 'CARENTE',      raridade: 'comum',    temporada: 1, emoji: '👻' },
  { id: 'aquori',      nome: 'Aquori',      tipo: 'CARENTE',      raridade: 'incomum',  temporada: 1, emoji: '💧' },
  { id: 'sinalo',      nome: 'Sinalo',      tipo: 'CARENTE',      raridade: 'raro',     temporada: 1, emoji: '📡' },
  { id: 'grafiko',     nome: 'Grafiko',     tipo: 'CARENTE',      raridade: 'epico',    temporada: 1, emoji: '🎨' },
  { id: 'sangueko',    nome: 'Sangueko',    tipo: 'CARENTE',      raridade: 'lendario', temporada: 1, emoji: '🩸' },

  { id: 'igniko',      nome: 'Igniko',      tipo: 'AGRESSIVO',    raridade: 'comum',    temporada: 1, emoji: '🔥' },
  { id: 'voidspawn',   nome: 'Voidspawn',   tipo: 'AGRESSIVO',    raridade: 'incomum',  temporada: 1, emoji: '👾' },
  { id: 'kroniki',     nome: 'Kroniki',     tipo: 'AGRESSIVO',    raridade: 'raro',     temporada: 1, emoji: '⏰' },
  { id: 'jaguaroki',   nome: 'Jaguaroki',   tipo: 'AGRESSIVO',    raridade: 'epico',    temporada: 1, emoji: '🐆' },
  { id: 'fissuraki',   nome: 'Fissuraki',   tipo: 'AGRESSIVO',    raridade: 'lendario', temporada: 1, emoji: '💥' },

  { id: 'lumiki',      nome: 'Lumiki',      tipo: 'FOFO',         raridade: 'comum',    temporada: 2, emoji: '✨' },
  { id: 'ventro',      nome: 'Ventro',      tipo: 'FOFO',         raridade: 'incomum',  temporada: 2, emoji: '🌬️' },
  { id: 'tucari',      nome: 'Tucari',      tipo: 'FOFO',         raridade: 'raro',     temporada: 2, emoji: '🐦' },
  { id: 'pixeiro',     nome: 'Pixeiro',     tipo: 'FOFO',         raridade: 'epico',    temporada: 2, emoji: '🐟' },
  { id: 'gamako',      nome: 'Gamako',      tipo: 'FOFO',         raridade: 'lendario', temporada: 2, emoji: '🐸' },

  { id: 'terrako',     nome: 'Terrako',     tipo: 'INDEPENDENTE', raridade: 'comum',    temporada: 2, emoji: '🌍' },
  { id: 'umbrio',      nome: 'Umbrio',      tipo: 'INDEPENDENTE', raridade: 'incomum',  temporada: 2, emoji: '🌑' },
  { id: 'serpentara',  nome: 'Serpentara',  tipo: 'INDEPENDENTE', raridade: 'raro',     temporada: 2, emoji: '🐍' },
  { id: 'oncara',      nome: 'Onçara',      tipo: 'INDEPENDENTE', raridade: 'epico',    temporada: 2, emoji: '🐆' },
  { id: 'nulliki',     nome: 'Nulliki',     tipo: 'INDEPENDENTE', raridade: 'lendario', temporada: 2, emoji: '⬛' },

  { id: 'harpiako',    nome: 'Harpiako',    tipo: 'FILOSOFO',     raridade: 'comum',    temporada: 2, emoji: '🦅' },
  { id: 'anacori',     nome: 'Anacori',     tipo: 'FILOSOFO',     raridade: 'incomum',  temporada: 2, emoji: '🌿' },
  { id: 'gosmacho',    nome: 'Gosmacho',    tipo: 'FILOSOFO',     raridade: 'raro',     temporada: 2, emoji: '🐌' },
  { id: 'tempestari',  nome: 'Tempestari',  tipo: 'FILOSOFO',     raridade: 'epico',    temporada: 2, emoji: '⛈️' },
  { id: 'totekko',     nome: 'Totekko',     tipo: 'FILOSOFO',     raridade: 'lendario', temporada: 2, emoji: '🐢' },

  { id: 'capivaroki',  nome: 'Capivaroki',  tipo: 'COMICO',       raridade: 'comum',    temporada: 2, emoji: '🦫' },
  { id: 'cameloko',    nome: 'Cameloko',    tipo: 'COMICO',       raridade: 'incomum',  temporada: 2, emoji: '🐪' },
  { id: 'buziko',      nome: 'Buziko',      tipo: 'COMICO',       raridade: 'raro',     temporada: 2, emoji: '🐝' },
  { id: 'conkrito',    nome: 'Conkrito',    tipo: 'COMICO',       raridade: 'epico',    temporada: 2, emoji: '🐰' },
  { id: 'tatuki',      nome: 'Tatuki',      tipo: 'COMICO',       raridade: 'lendario', temporada: 2, emoji: '🦔' },
]

// Anexa o sprite do Kroniki a todas as criaturas
export const CRIATURAS = CRIATURAS_BASE.map(c => ({
  ...c,
  ...KRONIKI_SPRITE,
}))
