export const DUNGEONS = {
  onibus: {
    id: 'onibus', nome: 'O Ônibus', desc: 'um ônibus abandonado. dentro, avatares sem rosto.',
    inimigos: 5, inimigoHp: 4, inimigoDmg: 1,
    dropCap: 80, dropNotas: 0,
    desbloqueia: 'notas', // desbloqueia recurso notas
    desbloqueiaFlag: 'NOTAS_LIBERADO',
    proximaDungeon: 'rua',
  },
  rua: {
    id: 'rua', nome: 'A Rua de Marelia', desc: 'a rua que não termina. os passos ecoam.',
    inimigos: 8, inimigoHp: 6, inimigoDmg: 2,
    boss: { nome: 'Cobrador Fantasma', hp: 20, dmg: 3 },
    dropCap: 150, dropNotas: 5,
    desbloqueiaFlag: 'NINA_LIBERADO',
  },
}
