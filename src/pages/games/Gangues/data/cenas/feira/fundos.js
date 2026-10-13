// Ilustrações em pixel art da Feira: mapa externo em 5 faixas de 568px e uma
// imagem por cômodo. A colisão continua em mundo.js e interiores.js.
import { comFundos } from '../pista/fundos.js'
import b1 from '../../../assets/backgrounds/feira-bloco-1.webp'
import b2 from '../../../assets/backgrounds/feira-bloco-2.webp'
import b3 from '../../../assets/backgrounds/feira-bloco-3.webp'
import b4 from '../../../assets/backgrounds/feira-bloco-4.webp'
import b5 from '../../../assets/backgrounds/feira-bloco-5.webp'
import pensao0 from '../../../assets/backgrounds/feira-int-pensao_0.webp'
import pensao1 from '../../../assets/backgrounds/feira-int-pensao_1.webp'
import pensao_20 from '../../../assets/backgrounds/feira-int-pensao_2_0.webp'
import radio0 from '../../../assets/backgrounds/feira-int-radio_0.webp'
import mercearia0 from '../../../assets/backgrounds/feira-int-mercearia_0.webp'
import serralheria0 from '../../../assets/backgrounds/feira-int-serralheria_0.webp'
import galeria0 from '../../../assets/backgrounds/feira-int-galeria_0.webp'
import galeria1 from '../../../assets/backgrounds/feira-int-galeria_1.webp'
import galeria2 from '../../../assets/backgrounds/feira-int-galeria_2.webp'
import mercadao0 from '../../../assets/backgrounds/feira-int-mercadao_0.webp'
import mercadao1 from '../../../assets/backgrounds/feira-int-mercadao_1.webp'
import mercadao2 from '../../../assets/backgrounds/feira-int-mercadao_2.webp'
import mercadao3 from '../../../assets/backgrounds/feira-int-mercadao_3.webp'
import mercadao4 from '../../../assets/backgrounds/feira-int-mercadao_4.webp'

export const FUNDO_FEIRA = { blocos: [b1, b2, b3, b4, b5], blocoH: 568 }

export const FUNDO_INT_FEIRA = {
  pensao: [pensao0, pensao1],
  pensao_2: [pensao_20],
  radio: [radio0],
  mercearia: [mercearia0],
  serralheria: [serralheria0],
  galeria: [galeria0, galeria1, galeria2],
  mercadao: [mercadao0, mercadao1, mercadao2, mercadao3, mercadao4],
}

export { comFundos }
