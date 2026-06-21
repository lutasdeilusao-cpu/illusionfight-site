import { distanciaHex, getCelulasAtaque, getVizinhos, encontrarCaminho } from '../../hexUtils'
import { getCasasMovimento, getChanceAcerto, resolverAtaque } from '../../combat'

function inimigoMaisProximo(personagem, inimigos) {
  let alvo = null, menorDist = Infinity
  for (const ini of inimigos) {
    if (!ini.vivo || !ini.posicao) continue
    const dist = distanciaHex(personagem.posicao, ini.posicao)
    if (dist < menorDist) { menorDist = dist; alvo = ini }
  }
  return alvo
}

function inimigoMaisFracoEmAlcance(personagem, inimigos, cols, rows, obstaculos) {
  const alcanceMax = personagem.tipoAtaque === 'melee' ? 1 : personagem.pdf
  const celulas = getCelulasAtaque(personagem.posicao.row, personagem.posicao.col, personagem.tipoAtaque, cols, rows, alcanceMax, obstaculos)
  let alvo = null, menorHP = Infinity
  for (const ini of inimigos) {
    if (!ini.vivo || !ini.posicao) continue
    const emAlcance = celulas.some(c => c.row === ini.posicao.row && c.col === ini.posicao.col)
    if (emAlcance && ini.hp < menorHP) { menorHP = ini.hp; alvo = ini }
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

function avancarUmaCasa(personagem, inimigos, cols, rows, obstaculos) {
  const vizinhos = getVizinhos(personagem.posicao.row, personagem.posicao.col, cols, rows)
  const alvo = inimigoMaisProximo(personagem, inimigos)
  if (!alvo) return null
  let melhor = null, menorDist = Infinity
  for (const viz of vizinhos) {
    const key = `${viz.row}_${viz.col}`
    const obs = obstaculos?.[key]
    if (obs && (obs.tipo === 1 || obs.tipo === 2)) continue
    const ocupada = inimigos.some(p => p.vivo && p.posicao?.row === viz.row && p.posicao?.col === viz.col)
    if (ocupada) continue
    const d = distanciaHex(viz, alvo.posicao)
    const distAtual = distanciaHex(personagem.posicao, alvo.posicao)
    if (d < distAtual && d < menorDist) { menorDist = d; melhor = viz }
  }
  return melhor
}

export function acaoFujona(personagem, inimigos, todosPersonagens, obstaculos, cols, rows, itensChao, fase = 'acao') {
  const logs = []

  if (fase === 'movimento') {
    const fuga = celulaMaisDistante(personagem, inimigos, cols, rows, obstaculos)
    if (fuga) {
      logs.push(`😰 ${personagem.nome} foge para (${fuga.row}, ${fuga.col})`)
      return { tipo: 'andar', detalhes: { row: fuga.row, col: fuga.col }, logs }
    }
    const avancar = avancarUmaCasa(personagem, inimigos, cols, rows, obstaculos)
    if (avancar) {
      logs.push(`😰 ${personagem.nome} está encurralado! Avança para (${avancar.row}, ${avancar.col})`)
      return { tipo: 'andar', detalhes: { row: avancar.row, col: avancar.col }, logs }
    }
    logs.push(`😰 ${personagem.nome} não tem para onde ir.`)
    return { tipo: 'finalizar', detalhes: {}, logs }
  }

  if (fase === 'acao') {
    const alvo = inimigoMaisFracoEmAlcance(personagem, inimigos, cols, rows, obstaculos)
    if (!alvo) {
      logs.push(`🚶 ${personagem.nome} não tem alvo em alcance após fugir.`)
      return { tipo: 'finalizar', detalhes: {}, logs }
    }
    const dist = distanciaHex(personagem.posicao, alvo.posicao)
    const chance = getChanceAcerto(personagem.dex, alvo.agi)
    const roll = Math.random()
    const acertou = roll <= chance || personagem.dex > alvo.agi
    if (acertou) {
      const resultado = resolverAtaque(personagem, alvo, Math.ceil(dist))
      logs.push(`🎯 ${personagem.nome} ataca ${alvo.nome} à distância após fugir.`)
      return { tipo: 'atacar', detalhes: { alvo, resultado, distancia: Math.ceil(dist), miss: false }, logs }
    }
    logs.push(`🎯 ${personagem.nome} tenta atacar ${alvo.nome} mas erra.`)
    return { tipo: 'atacar', detalhes: { alvo, resultado: null, distancia: Math.ceil(dist), miss: true }, logs }
  }

  logs.push(`${personagem.nome} — fase desconhecida: ${fase}`)
  return { tipo: 'finalizar', detalhes: {}, logs }
}
