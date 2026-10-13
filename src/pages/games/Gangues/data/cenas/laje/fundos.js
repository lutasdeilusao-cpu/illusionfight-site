// Ilustrações em pixel art: mapa externo em 5 faixas de 568px e uma imagem por
// cômodo. A colisão continua em mundo.js e interiores.js.
import { comFundos } from '../pista/fundos.js'
import b1 from '../../../assets/backgrounds/laje-bloco-1.webp'
import b2 from '../../../assets/backgrounds/laje-bloco-2.webp'
import b3 from '../../../assets/backgrounds/laje-bloco-3.webp'
import b4 from '../../../assets/backgrounds/laje-bloco-4.webp'
import b5 from '../../../assets/backgrounds/laje-bloco-5.webp'
import birosca0 from '../../../assets/backgrounds/laje-int-birosca_0.webp'
import birosca1 from '../../../assets/backgrounds/laje-int-birosca_1.webp'
import oficina0 from '../../../assets/backgrounds/laje-int-oficina_0.webp'
import loja0 from '../../../assets/backgrounds/laje-int-loja_0.webp'
import salacostura0 from '../../../assets/backgrounds/laje-int-sala_costura_0.webp'
import salacostura1 from '../../../assets/backgrounds/laje-int-sala_costura_1.webp'
import salacostura2 from '../../../assets/backgrounds/laje-int-sala_costura_2.webp'
import salacostura3 from '../../../assets/backgrounds/laje-int-sala_costura_3.webp'
import salacostura4 from '../../../assets/backgrounds/laje-int-sala_costura_4.webp'
import salacostura5 from '../../../assets/backgrounds/laje-int-sala_costura_5.webp'
import topo0 from '../../../assets/backgrounds/laje-int-topo_0.webp'
import topo1 from '../../../assets/backgrounds/laje-int-topo_1.webp'
import topo2 from '../../../assets/backgrounds/laje-int-topo_2.webp'

export const FUNDO_LAJE = { blocos: [b1, b2, b3, b4, b5], blocoH: 568 }

export const FUNDO_INT_LAJE = {
  birosca: [birosca0, birosca1],
  oficina: [oficina0],
  loja: [loja0],
  sala_costura: [salacostura0, salacostura1, salacostura2, salacostura3, salacostura4, salacostura5],
  topo: [topo0, topo1, topo2],
}

export { comFundos }
