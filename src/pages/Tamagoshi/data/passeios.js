export const PASSEIOS = [
  {
    id: 'marelia_centro',
    nome: 'Centro de Marelia',
    desc: 'as ruas de paralelepípedo molhado, os letreiros de neon',
    bonus: { CARENTE: 5, INDEPENDENTE: 3, FILOSOFO: 4 },
    emoji: '🏛️',
  },
  {
    id: 'terminal_rodoviario',
    nome: 'Terminal Rodoviário',
    desc: 'ônibus indo e vindo, gente apressada, histórias efêmeras',
    bonus: { CARENTE: 3, COMICO: 5, AGRESSIVO: 2 },
    emoji: '🚌',
  },
  {
    id: 'beco_risca_faca',
    nome: 'Beco da Risca Faca',
    desc: 'luz amarela, música distante, perigo familiar',
    bonus: { AGRESSIVO: 5, INDEPENDENTE: 4, COMICO: 3 },
    emoji: '🔪',
  },
  {
    id: 'orla_noturna',
    nome: 'Orla Noturna',
    desc: 'o vento salgado, as ondas quebrando, o céu infinito',
    bonus: { FILOSOFO: 5, FOFO: 3, CARENTE: 4 },
    emoji: '🌊',
  },
  {
    id: 'feira_livre',
    nome: 'Feira Livre',
    desc: 'barracas coloridas, cheiro de comida, gente falando alto',
    bonus: { FOFO: 5, COMICO: 4, AGRESSIVO: 3 },
    emoji: '🍎',
  },
  {
    id: 'rua_branca',
    nome: 'Rua Branca',
    desc: 'silêncio, névoa, um lugar que parece esquecido pelo tempo',
    bonus: { FILOSOFO: 4, INDEPENDENTE: 5, CARENTE: 2 },
    emoji: '🌫️',
  },
]

export function getPasseio(id) {
  return PASSEIOS.find(p => p.id === id) || PASSEIOS[0]
}
