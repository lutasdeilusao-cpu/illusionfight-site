// Ilustrações em pixel art: mapa externo em 5 faixas de 568px e uma imagem por
// cômodo. A colisão continua em mundo.js e interiores.js.
import { comFundos } from '../pista/fundos.js'
import b1 from '../../../assets/backgrounds/alto-bloco-1.webp'
import b2 from '../../../assets/backgrounds/alto-bloco-2.webp'
import b3 from '../../../assets/backgrounds/alto-bloco-3.webp'
import b4 from '../../../assets/backgrounds/alto-bloco-4.webp'
import b5 from '../../../assets/backgrounds/alto-bloco-5.webp'
import birosca0 from '../../../assets/backgrounds/alto-int-birosca_0.webp'
import birosca1 from '../../../assets/backgrounds/alto-int-birosca_1.webp'
import oficina0 from '../../../assets/backgrounds/alto-int-oficina_0.webp'
import emporio0 from '../../../assets/backgrounds/alto-int-emporio_0.webp'
import salacinco0 from '../../../assets/backgrounds/alto-int-sala_cinco_0.webp'
import escritorio0 from '../../../assets/backgrounds/alto-int-escritorio_0.webp'
import escritorio1 from '../../../assets/backgrounds/alto-int-escritorio_1.webp'
import escritorio2 from '../../../assets/backgrounds/alto-int-escritorio_2.webp'
import escritorio3 from '../../../assets/backgrounds/alto-int-escritorio_3.webp'

export const FUNDO_ALTO = { blocos: [b1, b2, b3, b4, b5], blocoH: 568 }

export const FUNDO_INT_ALTO = {
  birosca: [birosca0, birosca1],
  oficina: [oficina0],
  emporio: [emporio0],
  sala_cinco: [salacinco0],
  escritorio: [escritorio0, escritorio1, escritorio2, escritorio3],
}

export { comFundos }
