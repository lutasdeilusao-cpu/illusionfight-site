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

import ninkaIdle from '../../../assets/images/tamagoshi/02/ninka-idle.png'
import ninkaHungry from '../../../assets/images/tamagoshi/02/ninka-hungry.png'
import ninkaEnjoy from '../../../assets/images/tamagoshi/02/ninka-enjoy.png'
import ninkaHappy from '../../../assets/images/tamagoshi/02/ninka-happy.png'
import ninkaAbandoned from '../../../assets/images/tamagoshi/02/ninka-abandoned.png'
import ninkaAnger from '../../../assets/images/tamagoshi/02/ninka-angry.png'
import ninkaDirty from '../../../assets/images/tamagoshi/02/ninka-dirty.png'
import ninkaSick from '../../../assets/images/tamagoshi/02/ninka-sick.png'
import ninkaSleepy from '../../../assets/images/tamagoshi/02/ninka-sleepy.png'
import ninkaPresentation from '../../../assets/images/tamagoshi/02/ninka-presentation.png'

import kroumIdle from '../../../assets/images/tamagoshi/03/kroum-idle.png'
import kroumHungry from '../../../assets/images/tamagoshi/03/kroum-hungry.png'
import kroumEnjoy from '../../../assets/images/tamagoshi/03/kroum-enjoy.png'
import kroumHappy from '../../../assets/images/tamagoshi/03/kroum-happy.png'
import kroumAbandoned from '../../../assets/images/tamagoshi/03/kroum-abandoned.png'
import kroumAnger from '../../../assets/images/tamagoshi/03/kroum-anger.png'
import kroumDirty from '../../../assets/images/tamagoshi/03/kroum-dirty.png'
import kroumSick from '../../../assets/images/tamagoshi/03/kroum-sick.png'
import kroumSleepy from '../../../assets/images/tamagoshi/03/kroum-sleepy.png'
import kroumPresentation from '../../../assets/images/tamagoshi/03/kroum-presentation.png'

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

const NINKA_SPRITE = {
  imagem: ninkaIdle,
  gifs: {
    idle: ninkaIdle,
    comendo: ninkaHungry,
    satisfeito: ninkaEnjoy,
    feliz: ninkaHappy,
    abandonado: ninkaAbandoned,
    raiva: ninkaAnger,
    sujo: ninkaDirty,
    doente: ninkaSick,
    sonolento: ninkaSleepy,
    apresentacao: ninkaPresentation,
  },
}

const KROUM_SPRITE = {
  imagem: kroumIdle,
  gifs: {
    idle: kroumIdle,
    comendo: kroumHungry,
    satisfeito: kroumEnjoy,
    feliz: kroumHappy,
    abandonado: kroumAbandoned,
    raiva: kroumAnger,
    sujo: kroumDirty,
    doente: kroumSick,
    sonolento: kroumSleepy,
    apresentacao: kroumPresentation,
  },
}

// IDs numéricos — 1=Kroniki, 2=Ninka, 3=Kroum, ...
const CRIATURAS_BASE = [
  // ── Top 3: criaturas com sprite próprio ──
  { id: 1,  nome: 'Kroniki',     tipo: 'AGRESSIVO',    raridade: 'raro',     temporada: 1, emoji: '⏰' },
  { id: 2,  nome: 'Ninka',       tipo: 'INDEPENDENTE', raridade: 'raro',     temporada: 1, emoji: '🐉' },
  { id: 3,  nome: 'Kroum',       tipo: 'AGRESSIVO',    raridade: 'raro',     temporada: 1, emoji: '👹' },

  // ── Demais criaturas ──
  { id: 4,  nome: 'Voidling',    tipo: 'CARENTE',      raridade: 'comum',    temporada: 1, emoji: '👻' },
  { id: 5,  nome: 'Aquori',      tipo: 'CARENTE',      raridade: 'incomum',  temporada: 1, emoji: '💧' },
  { id: 6,  nome: 'Sinalo',      tipo: 'CARENTE',      raridade: 'raro',     temporada: 1, emoji: '📡' },
  { id: 7,  nome: 'Grafiko',     tipo: 'CARENTE',      raridade: 'epico',    temporada: 1, emoji: '🎨' },
  { id: 8,  nome: 'Sangueko',    tipo: 'CARENTE',      raridade: 'lendario', temporada: 1, emoji: '🩸' },
  { id: 9,  nome: 'Igniko',      tipo: 'AGRESSIVO',    raridade: 'comum',    temporada: 1, emoji: '🔥' },
  { id: 10, nome: 'Voidspawn',   tipo: 'AGRESSIVO',    raridade: 'incomum',  temporada: 1, emoji: '👾' },
  { id: 11, nome: 'Jaguaroki',   tipo: 'AGRESSIVO',    raridade: 'epico',    temporada: 1, emoji: '🐆' },
  { id: 12, nome: 'Fissuraki',   tipo: 'AGRESSIVO',    raridade: 'lendario', temporada: 1, emoji: '💥' },

  { id: 13, nome: 'Lumiki',      tipo: 'FOFO',         raridade: 'comum',    temporada: 2, emoji: '✨' },
  { id: 14, nome: 'Ventro',      tipo: 'FOFO',         raridade: 'incomum',  temporada: 2, emoji: '🌬️' },
  { id: 15, nome: 'Tucari',      tipo: 'FOFO',         raridade: 'raro',     temporada: 2, emoji: '🐦' },
  { id: 16, nome: 'Pixeiro',     tipo: 'FOFO',         raridade: 'epico',    temporada: 2, emoji: '🐟' },
  { id: 17, nome: 'Gamako',      tipo: 'FOFO',         raridade: 'lendario', temporada: 2, emoji: '🐸' },

  { id: 18, nome: 'Terrako',     tipo: 'INDEPENDENTE', raridade: 'comum',    temporada: 2, emoji: '🌍' },
  { id: 19, nome: 'Umbrio',      tipo: 'INDEPENDENTE', raridade: 'incomum',  temporada: 2, emoji: '🌑' },
  { id: 20, nome: 'Serpentara',  tipo: 'INDEPENDENTE', raridade: 'raro',     temporada: 2, emoji: '🐍' },
  { id: 21, nome: 'Onçara',      tipo: 'INDEPENDENTE', raridade: 'epico',    temporada: 2, emoji: '🐆' },
  { id: 22, nome: 'Nulliki',     tipo: 'INDEPENDENTE', raridade: 'lendario', temporada: 2, emoji: '⬛' },

  { id: 23, nome: 'Harpiako',    tipo: 'FILOSOFO',     raridade: 'comum',    temporada: 2, emoji: '🦅' },
  { id: 24, nome: 'Anacori',     tipo: 'FILOSOFO',     raridade: 'incomum',  temporada: 2, emoji: '🌿' },
  { id: 25, nome: 'Gosmacho',    tipo: 'FILOSOFO',     raridade: 'raro',     temporada: 2, emoji: '🐌' },
  { id: 26, nome: 'Tempestari',  tipo: 'FILOSOFO',     raridade: 'epico',    temporada: 2, emoji: '⛈️' },
  { id: 27, nome: 'Totekko',     tipo: 'FILOSOFO',     raridade: 'lendario', temporada: 2, emoji: '🐢' },

  { id: 28, nome: 'Capivaroki',  tipo: 'COMICO',       raridade: 'comum',    temporada: 2, emoji: '🦫' },
  { id: 29, nome: 'Cameloko',    tipo: 'COMICO',       raridade: 'incomum',  temporada: 2, emoji: '🐪' },
  { id: 30, nome: 'Buziko',      tipo: 'COMICO',       raridade: 'raro',     temporada: 2, emoji: '🐝' },
  { id: 31, nome: 'Conkrito',    tipo: 'COMICO',       raridade: 'epico',    temporada: 2, emoji: '🐰' },
  { id: 32, nome: 'Tatuki',      tipo: 'COMICO',       raridade: 'lendario', temporada: 2, emoji: '🦔' },
]

// Anexa o sprite próprio a cada criatura que tem, senão usa Kroniki como fallback
const SPRITE_MAP = {
  2: NINKA_SPRITE,
  3: KROUM_SPRITE,
}

export const CRIATURAS = CRIATURAS_BASE.map(c => ({
  ...c,
  ...(SPRITE_MAP[c.id] || KRONIKI_SPRITE),
}))
