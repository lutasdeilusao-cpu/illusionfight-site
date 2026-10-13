// Luta tutorial: lenta, golpe por golpe, ensinando o sistema. Cada passo do roteiro
// é uma nota sozinha a cada meio compasso; a que tem `dica` PARA o tempo quando chega
// na hora certa e espera o toque, com a explicação na tela. Acabou o roteiro, a
// energia enche e o tutorial ensina o super (escolher o poder e tocar a virada).
// Depois disso vêm só golpes simples até ele cair.
export const ROTEIRO_TUTORIAL = [
  { tipo: 'soco', dica: 'ataque' },
  { tipo: 'soco' },
  { tipo: 'chute', dica: 'chute' },
  { tipo: 'soco' },
  { tipo: 'bloqueio', dica: 'defesa' },
  { tipo: 'bloqueio' },
  { tipo: 'cabecada', dica: 'cabecada' },
  { tipo: 'soco' },
  { tipo: 'bloqueio' },
  { tipo: 'chute' },
]
const DEPOIS = ['soco', 'bloqueio', 'chute', 'soco', 'cabecada', 'bloqueio']

// Notas da próxima frase (8 tempos): duas, nos tempos 2 e 6, uma de cada vez.
export function fraseTutorial(s, inicio, batida) {
  const notas = []
  for (const tempo of [2, 6]) {
    const passo = s.passoTut = (s.passoTut ?? -1) + 1
    const item = ROTEIRO_TUTORIAL[passo] || { tipo: DEPOIS[passo % DEPOIS.length] }
    notas.push({ tipo: item.tipo, dica: item.dica, hora: inicio + tempo * batida })
  }
  return notas
}

// O roteiro acabou (todas as notas guiadas já foram tocadas)?
export const roteiroAcabou = s => (s.passoTut ?? -1) >= ROTEIRO_TUTORIAL.length
