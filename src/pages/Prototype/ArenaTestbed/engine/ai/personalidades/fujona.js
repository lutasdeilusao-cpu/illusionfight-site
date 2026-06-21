import { distanciaHex, getCelulasAtaque, getVizinhos, encontrarCaminho } from '../../hexUtils'
import { getCasasMovimento, getChanceAcerto, resolverAtaque } from '../../combat'

function podeAtacarAlvo(personagem, alvo, cols, rows, obstaculos) {
  const alcanceMax = personagem.tipoAtaque === 'melee' ? 1 : personagem.pdf
  const celulas = getCelulasAtaque(personagem.posicao.row, personagem.posicao.col, personagem.tipoAtaque, cols, rows, alcanceMax, obstaculos)
  return celulas.some(c => c.row === alvo.posicao.row && c.col === alvo.posicao.col)
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

function celulaMaisDistante(personagem, inimigos, cols, rows, obstaculos) {
  const vizinhos = getVizinhos(personagem.posicao.row, personagem.posicao.col, cols, rows)
  const casasMov = getCasasMovimento(personagem.agi, true)
  let melhor = null, maiorDist = -1
  for (const viz of vizinhos) {
    const key = `${viz.row}_${viz.col}`
    const obs = obstaculos?.[key]
    if (obs && (obs.tipo === 1 || obs.tipo === 2)) continue
    const ocupada = inimigos.some(p => p.vivo && p.posicao?.row === viz.row && p.posicao?.col === viz.col)
    if (ocupada) continue
    let distMin = Infinity
    for (const ini of inimigos) {
      const d = distanciaHex(viz, ini.posicao)
      if (d < distMin) distMin = d
    }
    if (distMin > maiorDist) { maiorDist = distMin; melhor = viz }
  }
  return melhor
}

export function acaoFujona(personagem, inimigos, todosPersonagens, obstaculos, cols, rows, itensChao) {
  const logs = []
  const LIMIAR_FUGA = 0.4
  const hpPct = personagem.hp / personagem.hpMax
  const estaComMedo = hpPct < LIMIAR_FUGA

  if (estaComMedo) {
    const fuga = celulaMaisDistante(personagem, inimigos, cols, rows, obstaculos)
    if (fuga) {
      logs.push(`😰 ${personagem.nome} está com medo! Fugindo para (${fuga.row}, ${fuga.col})`)
      return { tipo: 'andar', detalhes: { row: fuga.row, col: fuga.col }, logs }
    }
  }

  const alvo = inimigoMaisProximo(personagem, inimigos)
  if (!alvo) return { tipo: 'finalizar', detalhes: {}, logs: ['Nenhum alvo encontrado.'] }

  const jaEmAlcance = podeAtacarAlvo(personagem, alvo, cols, rows, obstaculos)

  if (estaComMedo && jaEmAlcance) {
    const fuga = celulaMaisDistante(personagem, inimigos, cols, rows, obstaculos)
    if (fuga) {
      logs.push(`😰 ${personagem.nome} recua de ${alvo.nome}!`)
      return { tipo: 'andar', detalhes: { row: fuga.row, col: fuga.col }, logs }
    }
  }

  if (jaEmAlcance && !estaComMedo) {
    const dist = distanciaHex(personagem.posicao, alvo.posicao)
    const chance = getChanceAcerto(personagem.dex, alvo.agi)
    const roll = Math.random()
    const acertou = roll <= chance || personagem.dex > alvo.agi
    if (acertou) {
      const resultado = resolverAtaque(personagem, alvo, Math.ceil(dist))
      logs.push(`🤷 ${personagem.nome} ataca ${alvo.nome} relutantemente.`)
      return { tipo: 'atacar', detalhes: { alvo, resultado, distancia: Math.ceil(dist), miss: false }, logs }
    }
    logs.push(`🤷 ${personagem.nome} tentou atacar mas errou.`)
    return { tipo: 'atacar', detalhes: { alvo, resultado: null, distancia: Math.ceil(dist), miss: true }, logs }
  }

  const fuga = celulaMaisDistante(personagem, inimigos, cols, rows, obstaculos)
  if (fuga) {
    logs.push(`🚶 ${personagem.nome} mantém distância.`)
    return { tipo: 'andar', detalhes: { row: fuga.row, col: fuga.col }, logs }
  }

  return { tipo: 'finalizar', detalhes: {}, logs: [`${personagem.nome} não conseguiu agir.`] }
}
