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
  { id: 'voidling',    nome: 'Voidling',    tipo: 'CARENTE',      raridade: 'comum',    emoji: '👻' },
  { id: 'aquori',      nome: 'Aquori',      tipo: 'CARENTE',      raridade: 'incomum',  emoji: '💧' },
  { id: 'sinalo',      nome: 'Sinalo',      tipo: 'CARENTE',      raridade: 'raro',     emoji: '📡' },
  { id: 'grafiko',     nome: 'Grafiko',     tipo: 'CARENTE',      raridade: 'epico',    emoji: '🎨' },
  { id: 'sangueko',    nome: 'Sangueko',    tipo: 'CARENTE',      raridade: 'lendario', emoji: '🩸' },

  { id: 'igniko',      nome: 'Igniko',      tipo: 'AGRESSIVO',    raridade: 'comum',    emoji: '🔥' },
  { id: 'voidspawn',   nome: 'Voidspawn',   tipo: 'AGRESSIVO',    raridade: 'incomum',  emoji: '👾' },
  { id: 'kroniki',     nome: 'Kroniki',     tipo: 'AGRESSIVO',    raridade: 'raro',     emoji: '⏰' },
  { id: 'jaguaroki',   nome: 'Jaguaroki',   tipo: 'AGRESSIVO',    raridade: 'epico',    emoji: '🐆' },
  { id: 'fissuraki',   nome: 'Fissuraki',   tipo: 'AGRESSIVO',    raridade: 'lendario', emoji: '💥' },

  { id: 'lumiki',      nome: 'Lumiki',      tipo: 'FOFO',         raridade: 'comum',    emoji: '✨' },
  { id: 'ventro',      nome: 'Ventro',      tipo: 'FOFO',         raridade: 'incomum',  emoji: '🌬️' },
  { id: 'tucari',      nome: 'Tucari',      tipo: 'FOFO',         raridade: 'raro',     emoji: '🐦' },
  { id: 'pixeiro',     nome: 'Pixeiro',     tipo: 'FOFO',         raridade: 'epico',    emoji: '🐟' },
  { id: 'gamako',      nome: 'Gamako',      tipo: 'FOFO',         raridade: 'lendario', emoji: '🐸' },

  { id: 'terrako',     nome: 'Terrako',     tipo: 'INDEPENDENTE', raridade: 'comum',    emoji: '🌍' },
  { id: 'umbrio',      nome: 'Umbrio',      tipo: 'INDEPENDENTE', raridade: 'incomum',  emoji: '🌑' },
  { id: 'serpentara',  nome: 'Serpentara',  tipo: 'INDEPENDENTE', raridade: 'raro',     emoji: '🐍' },
  { id: 'oncara',      nome: 'Onçara',      tipo: 'INDEPENDENTE', raridade: 'epico',    emoji: '🐆' },
  { id: 'nulliki',     nome: 'Nulliki',     tipo: 'INDEPENDENTE', raridade: 'lendario', emoji: '⬛' },

  { id: 'harpiako',    nome: 'Harpiako',    tipo: 'FILOSOFO',     raridade: 'comum',    emoji: '🦅' },
  { id: 'anacori',     nome: 'Anacori',     tipo: 'FILOSOFO',     raridade: 'incomum',  emoji: '🌿' },
  { id: 'gosmacho',    nome: 'Gosmacho',    tipo: 'FILOSOFO',     raridade: 'raro',     emoji: '🐌' },
  { id: 'tempestari',  nome: 'Tempestari',  tipo: 'FILOSOFO',     raridade: 'epico',    emoji: '⛈️' },
  { id: 'totekko',     nome: 'Totekko',     tipo: 'FILOSOFO',     raridade: 'lendario', emoji: '🐢' },

  { id: 'capivaroki',  nome: 'Capivaroki',  tipo: 'COMICO',       raridade: 'comum',    emoji: '🦫' },
  { id: 'cameloko',    nome: 'Cameloko',    tipo: 'COMICO',       raridade: 'incomum',  emoji: '🐪' },
  { id: 'buziko',      nome: 'Buziko',      tipo: 'COMICO',       raridade: 'raro',     emoji: '🐝' },
  { id: 'conkrito',    nome: 'Conkrito',    tipo: 'COMICO',       raridade: 'epico',    emoji: '🐰' },
  { id: 'tatuki',      nome: 'Tatuki',      tipo: 'COMICO',       raridade: 'lendario', emoji: '🦔' },
]

// Anexa o sprite do Kroniki a todas as criaturas
export const CRIATURAS = CRIATURAS_BASE.map(c => ({
  ...c,
  ...KRONIKI_SPRITE,
}))
