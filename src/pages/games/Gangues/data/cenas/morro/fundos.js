// Ilustrações em pixel art: mapa externo em 5 faixas de 568px e uma imagem por
// cômodo. A colisão continua em mundo.js e interiores.js.
import { comFundos } from '../pista/fundos.js'
import b1 from '../../../assets/backgrounds/morro-bloco-1.webp'
import b2 from '../../../assets/backgrounds/morro-bloco-2.webp'
import b3 from '../../../assets/backgrounds/morro-bloco-3.webp'
import b4 from '../../../assets/backgrounds/morro-bloco-4.webp'
import b5 from '../../../assets/backgrounds/morro-bloco-5.webp'
import birosca0 from '../../../assets/backgrounds/morro-int-birosca_0.webp'
import birosca1 from '../../../assets/backgrounds/morro-int-birosca_1.webp'
import oficina0 from '../../../assets/backgrounds/morro-int-oficina_0.webp'
import venda0 from '../../../assets/backgrounds/morro-int-venda_0.webp'
import creche0 from '../../../assets/backgrounds/morro-int-creche_0.webp'
import boca0 from '../../../assets/backgrounds/morro-int-boca_0.webp'
import boca1 from '../../../assets/backgrounds/morro-int-boca_1.webp'

export const FUNDO_MORRO = { blocos: [b1, b2, b3, b4, b5], blocoH: 568 }

export const FUNDO_INT_MORRO = {
  birosca: [birosca0, birosca1],
  oficina: [oficina0],
  venda: [venda0],
  creche: [creche0],
  boca: [boca0, boca1],
}

export { comFundos }
