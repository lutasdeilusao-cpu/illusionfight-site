export const DIX_POR_ACAO = 10
export const DIX_LOGIN_DIARIO = 25
export const DIX_BONUS_LOCAL = 5

export function calcularFase(nascidoEm) {
  if (!nascidoEm) return 'ovo'
  const dias = Math.floor((Date.now() - new Date(nascidoEm).getTime()) / 86400000)
  if (dias <= 3) return 'ovo'
  if (dias <= 60) return 'filhote'
  if (dias <= 120) return 'jovem'
  if (dias <= 180) return 'adulto'
  if (dias <= 270) return 'veterano'
  if (dias <= 365) return 'anciao'
  return 'partida'
}

export const BADGES = {
  filhote: { id: 'criador_iniciante', label: 'Criador Iniciante', emoji: '🥚' },
  jovem: { id: 'cuidador_dedicado', label: 'Cuidador Dedicado', emoji: '🌱' },
  adulto: { id: 'companheiro_fiel', label: 'Companheiro Fiel', emoji: '⚔️' },
  veterano: { id: 'guardiao_experiente', label: 'Guardião Experiente', emoji: '🔥' },
  anciao: { id: 'mestre_cuidador', label: 'Mestre Cuidador', emoji: '👑' },
  partida: { id: 'lenda_de_marelia', label: 'Lenda de Marelia', emoji: '✨' },
}

export const TEXTOS_PARTIDA = {
  FOFO: 'foi a melhor coisa que já aconteceu comigo. obrigado. vou lembrar de você pra sempre.',
  AGRESSIVO: '...cuide-se. não porque eu me importo. cuide-se.',
  INDEPENDENTE: 'hora de ir. foi suficiente.',
  CARENTE: 'eu sabia que você não ia me abandonar. eu sabia.',
  FILOSOFO: 'doze meses é um piscar de olhos no universo. mas foi um piscar bonito.',
  COMICO: 'cara. que jornada. posso ir agora? tô com fome lá fora também.',
}
