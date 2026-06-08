/**
 * Rótulos dos atributos das cartas do Top Trumps — i18n
 * Usado pelo componente TopTrumpsCard para exibir labels em pt/en/es.
 */
export const CARD_LABELS = {
  pt: {
    pm:   'PM',
    re:   'RE',
    vl:   'VL',
    nx:   'NX',
    fc:   'FC',
    eb:   'EB',
    pe:   'PE',
    rank: 'RANK',
  },
  en: {
    pm:   'MP',
    re:   'RES',
    vl:   'SPD',
    nx:   'SL',
    fc:   'CF',
    eb:   'BE',
    pe:   'EP',
    rank: 'RANK',
  },
  es: {
    pm:   'PM',
    re:   'RES',
    vl:   'VEL',
    nx:   'NX',
    fc:   'FC',
    eb:   'EB',
    pe:   'PE',
    rank: 'RANK',
  },
}

/**
 * Mapeia cada atributo do JSON para a chave do label e seu valor máximo.
 * rank_sdr não tem max fixo (escala inversa — menor é melhor).
 */
export const ATTR_META = [
  { key: 'poder_mental',    labelId: 'pm',   max: 100, cssKey: 'pm' },
  { key: 'resistencia',     labelId: 're',   max: 100, cssKey: 're' },
  { key: 'velocidade',      labelId: 'vl',   max: 100, cssKey: 'vl' },
  { key: 'nivel_xama',      labelId: 'nx',   max: 10,  cssKey: 'nx' },
  { key: 'fator_caos',      labelId: 'fc',   max: 100, cssKey: 'fc' },
  { key: 'energia_base',    labelId: 'eb',   max: 100, cssKey: 'eb' },
  { key: 'poder_explosivo', labelId: 'pe',   max: 100, cssKey: 'pe' },
]
