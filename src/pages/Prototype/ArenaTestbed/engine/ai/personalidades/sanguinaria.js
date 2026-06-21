import { distanciaHex, getCelulasAtaque, getVizinhos, encontrarCaminho } from '../../hexUtils'
import { resolverAtaque, getChanceAcerto, getCasasMovimento } from '../../combat'
import { getPoderesPorId } from '../../../data/poderes'

function melhorPoderParaAtaque(personagem, poderesIds) {
  const poderes = getPoderesPorId(poderesIds)
    .filter(p => p.gatilho === 'ataque' && personagem.mp >= p.custoMP)
  if (poderes.length === 0) return null
  return poderes.reduce((best, p) => {
    const fa = p.valorComparativo?.fa ?? 0
    return fa > (best.valorComparativo?.fa ?? 0) ? p : best
  })
}

function inimigoMaisProximo(personagem, inimigos) {
  let alvo = null, menorDist = Infinity
  for (const ini of inimigos) {
    if (!ini.vivo || !ini.posicao) continue
    const dist = distanciaHex(personagem.posicao, ini.posicao)
    if (dist < menorDist) { menorDist = dist; alvo = ini }
  }
  return alvo
}

function podeAtacarAlvo(personagem, alvo, cols, rows, obstaculos) {
  const alcanceMax = personagem.tipoAtaque === 'melee' ? 1 : personagem.pdf
  const celulas = getCelulasAtaque(personagem.posicao.row, personagem.posicao.col, personagem.tipoAtaque, cols, rows, alcanceMax, obstaculos)
  return celulas.some(c => c.row === alvo.posicao.row && c.col === alvo.posicao.col)
}

function resolverAtaqueIA(personagem, alvo, logs) {
  const dist = distanciaHex(personagem.posicao, alvo.posicao)
  const chance = getChanceAcerto(personagem.dex, alvo.agi)
  const roll = Math.random()
  const acertou = roll <= chance || personagem.dex > alvo.agi
  if (acertou) {
    const resultado = resolverAtaque(personagem, alvo, Math.ceil(dist))
    return { resultado, miss: false }
  }
  return { resultado: null, miss: true }
}

function calcularPassos(personagem, destino, todosPersonagens, obstaculos, cols, rows) {
  const ocupadas = new Set(
    todosPersonagens
      .filter(p => p.vivo && p.posicao && p.id !== personagem.id)
      .map(p => `${p.posicao.row}_${p.posicao.col}`)
  )
  const caminho = encontrarCaminho(
    personagem.posicao.row, personagem.posicao.col,
    destino.row, destino.col,
    cols, rows, obstaculos, ocupadas
  )
  if (!caminho || caminho.length <= 1) return null
  const casasMov = getCasasMovimento(personagem.agi, true)
  const passos = Math.min(casasMov, caminho.length - 1)
  const d = caminho[passos]
  const ocupada = todosPersonagens.some(p =>
    p.vivo && p.posicao && p.posicao.row === d.row && p.posicao.col === d.col && p.id !== personagem.id
  )
  return ocupada ? null : { row: d.row, col: d.col, passos }
}

export function acaoSanguinaria(personagem, inimigos, todosPersonagens, obstaculos, cols, rows, itensChao) {
  const logs = []
  let alvo = null, menorHP = Infinity
  for (const ini of inimigos) {
    if (!ini.vivo || !ini.posicao) continue
    if (ini.hp < menorHP) { menorHP = ini.hp; alvo = ini }
  }
  if (!alvo) return { tipo: 'finalizar', detalhes: {}, logs: ['Nenhum alvo encontrado.'] }

  if (podeAtacarAlvo(personagem, alvo, cols, rows, obstaculos)) {
    const poder = melhorPoderParaAtaque(personagem, personagem.poderesEscolhidos)
    if (poder) {
      logs.push(`⚡ ${personagem.nome} usará ${poder.chaveI18n} contra ${alvo.nome}!`)
    } else {
      logs.push(`⚔️ ${personagem.nome} ataca ${alvo.nome} (ataque comum)`)
    }
    const { resultado, miss } = resolverAtaqueIA(personagem, alvo, logs)
    const dist = distanciaHex(personagem.posicao, alvo.posicao)
    return { tipo: 'atacar', detalhes: { alvo, resultado, distancia: Math.ceil(dist), miss }, logs }
  }

  const passos = calcularPassos(personagem, alvo.posicao, todosPersonagens, obstaculos, cols, rows)
  if (passos) {
    logs.push(`🏃 ${personagem.nome} avança em direção a ${alvo.nome} (${passos.passos} passos)`)
    return { tipo: 'andar', detalhes: { row: passos.row, col: passos.col }, logs }
  }
  return { tipo: 'finalizar', detalhes: {}, logs: [`${personagem.nome} não conseguiu agir.`] }
}
