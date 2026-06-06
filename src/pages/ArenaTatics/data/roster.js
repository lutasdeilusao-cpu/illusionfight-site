/**
 * ROSTER — 20 Personagens Pré-definidos
 * Cada personagem tem um `id` numérico único.
 * O servidor randomiza 2 para cada novo usuário.
 */

export const ROSTER = [
  {
    id: 1, nome: 'Briguento', classe: 'karuak', elemental: 'fogo',
    atributos: { forca: 14, velocidade: 8, resistencia: 16, energia: 6, precisao: 7, tenacidade: 12 },
  },
  {
    id: 2, nome: 'Ligeiro', classe: 'moraki', elemental: 'vento',
    atributos: { forca: 10, velocidade: 18, resistencia: 7, energia: 12, precisao: 14, tenacidade: 5 },
  },
  {
    id: 3, nome: 'Setas', classe: 'tivara', elemental: 'agua',
    atributos: { forca: 8, velocidade: 13, resistencia: 7, energia: 15, precisao: 18, tenacidade: 6 },
  },
  {
    id: 4, nome: 'Terraqueo', classe: 'karuak', elemental: 'terra',
    atributos: { forca: 16, velocidade: 6, resistencia: 18, energia: 5, precisao: 6, tenacidade: 14 },
  },
  {
    id: 5, nome: 'Ventania', classe: 'moraki', elemental: 'fogo',
    atributos: { forca: 11, velocidade: 17, resistencia: 6, energia: 13, precisao: 13, tenacidade: 6 },
  },
  {
    id: 6, nome: 'Preciso', classe: 'tivara', elemental: 'eletrico',
    atributos: { forca: 7, velocidade: 14, resistencia: 6, energia: 16, precisao: 19, tenacidade: 5 },
  },
  {
    id: 7, nome: 'Muralha', classe: 'karuak', elemental: 'agua',
    atributos: { forca: 13, velocidade: 7, resistencia: 17, energia: 7, precisao: 7, tenacidade: 13 },
  },
  {
    id: 8, nome: 'Sombra', classe: 'moraki', elemental: 'trevas',
    atributos: { forca: 12, velocidade: 19, resistencia: 5, energia: 11, precisao: 15, tenacidade: 4 },
  },
  {
    id: 9, nome: 'Flecha', classe: 'tivara', elemental: 'fogo',
    atributos: { forca: 9, velocidade: 12, resistencia: 8, energia: 14, precisao: 17, tenacidade: 7 },
  },
  {
    id: 10, nome: 'Rochoso', classe: 'karuak', elemental: 'eletrico',
    atributos: { forca: 15, velocidade: 5, resistencia: 19, energia: 4, precisao: 5, tenacidade: 15 },
  },
  {
    id: 11, nome: 'Tornado', classe: 'moraki', elemental: 'agua',
    atributos: { forca: 9, velocidade: 20, resistencia: 4, energia: 14, precisao: 12, tenacidade: 4 },
  },
  {
    id: 12, nome: 'Alvo', classe: 'tivara', elemental: 'terra',
    atributos: { forca: 8, velocidade: 11, resistencia: 9, energia: 13, precisao: 20, tenacidade: 6 },
  },
  {
    id: 13, nome: 'Rastreador', classe: 'tivara', elemental: 'vento',
    atributos: { forca: 10, velocidade: 15, resistencia: 5, energia: 12, precisao: 16, tenacidade: 5 },
  },
  {
    id: 14, nome: 'Bastiao', classe: 'karuak', elemental: 'trevas',
    atributos: { forca: 17, velocidade: 4, resistencia: 15, energia: 8, precisao: 8, tenacidade: 16 },
  },
  {
    id: 15, nome: 'Esquivo', classe: 'moraki', elemental: 'eletrico',
    atributos: { forca: 8, velocidade: 20, resistencia: 6, energia: 10, precisao: 16, tenacidade: 3 },
  },
  {
    id: 16, nome: 'Cacador', classe: 'tivara', elemental: 'trevas',
    atributos: { forca: 11, velocidade: 10, resistencia: 7, energia: 15, precisao: 18, tenacidade: 6 },
  },
  {
    id: 17, nome: 'Granito', classe: 'karuak', elemental: 'vento',
    atributos: { forca: 18, velocidade: 3, resistencia: 20, energia: 3, precisao: 4, tenacidade: 17 },
  },
  {
    id: 18, nome: 'Soprano', classe: 'moraki', elemental: 'terra',
    atributos: { forca: 10, velocidade: 16, resistencia: 8, energia: 11, precisao: 10, tenacidade: 8 },
  },
  {
    id: 19, nome: 'Centelha', classe: 'tivara', elemental: 'eletrico',
    atributos: { forca: 6, velocidade: 17, resistencia: 4, energia: 18, precisao: 20, tenacidade: 3 },
  },
  {
    id: 20, nome: 'Bruto', classe: 'karuak', elemental: 'fogo',
    atributos: { forca: 20, velocidade: 2, resistencia: 18, energia: 2, precisao: 3, tenacidade: 18 },
  },
]

/**
 * Constrói objeto de personagem jogável a partir do roster
 */
export function construirPersonagem(rosterId, posX, posY, lado = 'aliado') {
  const t = ROSTER.find(r => r.id === rosterId)
  if (!t) return null
  const hp = 30 + t.atributos.resistencia * 3
  const energia = 10 + t.atributos.energia
  return {
    id: `${lado}_${rosterId}`,
    nome: t.nome,
    classe: t.classe,
    elemental: t.elemental,
    atributos: { ...t.atributos },
    hp, hpMax: hp,
    energia, energiaMax: energia,
    x: posX, y: posY,
    // Controle de turno por personagem
    jaMoveu: false,
    jaAtacou: false,
  }
}

/**
 * Cria time de inimigos (4) com posições próximas ao player
 */
export function getInimigosPadrao() {
  // Variedade de classes: moraki, karuak, tivara, moraki
  const ids = [2, 4, 9, 15] // Ligeiro, Terraqueo, Flecha, Esquivo
  return ids.map((id, i) => {
    const p = construirPersonagem(id, 4 + (i % 2) * 2, 2 + i * 2, 'inimigo')
    return { ...p, id: `enemy_${i}` }
  })
}
