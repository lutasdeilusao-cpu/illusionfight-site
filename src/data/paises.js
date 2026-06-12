export const PAISES = [
  { code: 'BR', pt: 'Brasil', en: 'Brazil', es: 'Brasil' },
  { code: 'PT', pt: 'Portugal', en: 'Portugal', es: 'Portugal' },
  { code: 'US', pt: 'Estados Unidos', en: 'United States', es: 'Estados Unidos' },
  { code: 'MX', pt: 'México', en: 'Mexico', es: 'México' },
  { code: 'AR', pt: 'Argentina', en: 'Argentina', es: 'Argentina' },
  { code: 'CL', pt: 'Chile', en: 'Chile', es: 'Chile' },
  { code: 'CO', pt: 'Colômbia', en: 'Colombia', es: 'Colombia' },
  { code: 'PE', pt: 'Peru', en: 'Peru', es: 'Perú' },
  { code: 'UY', pt: 'Uruguai', en: 'Uruguay', es: 'Uruguay' },
  { code: 'PY', pt: 'Paraguai', en: 'Paraguay', es: 'Paraguay' },
  { code: 'BO', pt: 'Bolívia', en: 'Bolivia', es: 'Bolivia' },
  { code: 'EC', pt: 'Equador', en: 'Ecuador', es: 'Ecuador' },
  { code: 'VE', pt: 'Venezuela', en: 'Venezuela', es: 'Venezuela' },
  { code: 'ES', pt: 'Espanha', en: 'Spain', es: 'España' },
  { code: 'JP', pt: 'Japão', en: 'Japan', es: 'Japón' },
  { code: 'KR', pt: 'Coreia do Sul', en: 'South Korea', es: 'Corea del Sur' },
  { code: 'CA', pt: 'Canadá', en: 'Canada', es: 'Canadá' },
  { code: 'GB', pt: 'Reino Unido', en: 'United Kingdom', es: 'Reino Unido' },
  { code: 'FR', pt: 'França', en: 'France', es: 'Francia' },
  { code: 'DE', pt: 'Alemanha', en: 'Germany', es: 'Alemania' },
  { code: 'IT', pt: 'Itália', en: 'Italy', es: 'Italia' },
  { code: 'OTHER', pt: 'Outro', en: 'Other', es: 'Otro' },
]

export function getNomePais(code, locale = 'pt') {
  const p = PAISES.find(x => x.code === code)
  if (!p) return code || '—'
  return p[locale] || p.pt
}
