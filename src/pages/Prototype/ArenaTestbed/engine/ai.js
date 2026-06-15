/**
 * AI — LDI Arena Testbed
 * IA básica para o protótipo: move em direção ao inimigo mais próximo, ataca se em alcance.
 */

import { distanciaHex, getVizinhos, getCelulasAtaque, encontrarCaminho } from './hexUtils'
import { resolverAtaque, rolarD6, getChanceAcerto, getCasasMovimento } from './combat'

/**
 * Decide a ação da IA para um personagem
 * @returns {{ tipo: 'andar'|'atacar'|'usar_item'|'finalizar', detalhes: object, log: string[] }}
 */
export function decidirAcaoIA(personagem, inimigos, todosPersonagens, obstaculos, cols, rows, itensChao, agiUmPraUm = false) {
  const logs = []
  const acoes = []

  // 1. Encontrar inimigo mais próximo
  let alvo = null
  let menorDist = Infinity

  for (const ini of inimigos) {
    if (!ini.vivo || !ini.posicao) continue
    const dist = distanciaHex(personagem.posicao, ini.posicao)
    if (dist < menorDist) {
      menorDist = dist
      alvo = ini
    }
  }

  if (!alvo) return { tipo: 'finalizar', detalhes: {}, logs: ['Nenhum alvo encontrado.'] }

  // 2. Verificar se pode atacar (alcance PDF = valor do atributo)
  const alcanceMax = personagem.tipoAtaque === 'melee' ? 1 : personagem.pdf
  const celulasAtaque = getCelulasAtaque(
    personagem.posicao.row, personagem.posicao.col,
    personagem.tipoAtaque, cols, rows,
    alcanceMax, obstaculos
  )

  const podeAtacar = celulasAtaque.some(c => c.row === alvo.posicao.row && c.col === alvo.posicao.col)

  if (podeAtacar) {
    // Calcular distância para o alvo
    const dist = celulasAtaque.find(
      c => c.row === alvo.posicao.row && c.col === alvo.posicao.col
    )?.distancia || 1

    // Chance de acerto
    const chance = getChanceAcerto(personagem.dex, alvo.agi)
    const roll = Math.random()

    if (roll <= chance || personagem.dex > alvo.agi) {
      const resultado = resolverAtaque(personagem, alvo, dist)
      return {
        tipo: 'atacar',
        detalhes: { alvo, resultado, distancia: dist },
        logs: [
          `[${personagem.nome}] Atacando ${alvo.nome} (distância ${dist})`,
          ...resultado.logs,
        ],
      }
    } else {
      logs.push(`[${personagem.nome}] Tentou atacar ${alvo.nome} mas errou! (chance: ${Math.round(chance * 100)}%)`)
      return { tipo: 'finalizar', detalhes: {}, logs }
    }
  }

  // 3. Mover em direção ao inimigo mais próximo
  const casasMov = getCasasMovimento(personagem.agi, agiUmPraUm)

  // BFS para encontrar caminho
  const caminho = encontrarCaminho(
    personagem.posicao.row, personagem.posicao.col,
    alvo.posicao.row, alvo.posicao.col,
    cols, rows, obstaculos
  )

  if (caminho && caminho.length > 1) {
    // Pega no máximo N passos
    const passos = Math.min(casasMov, caminho.length - 1)
    const destino = caminho[passos]

    // Verifica se a célula de destino está ocupada
    const ocupada = todosPersonagens.some(p =>
      p.vivo && p.posicao &&
      p.posicao.row === destino.row &&
      p.posicao.col === destino.col &&
      p.id !== personagem.id
    )

    if (!ocupada) {
      logs.push(`[${personagem.nome}] Moveu para (${destino.row}, ${destino.col}) (${passos} passos)`)
      return {
        tipo: 'andar',
        detalhes: { row: destino.row, col: destino.col, passos },
        logs,
      }
    }
  }

  // Se não conseguiu mover nem atacar, verifica itens no chão
  if (itensChao) {
    for (const [key, item] of Object.entries(itensChao)) {
      const [ir, ic] = key.split('_').map(Number)
      if (ir === personagem.posicao.row && ic === personagem.posicao.col) {
        return {
          tipo: 'usar_item',
          detalhes: { item, key },
          logs: [`[${personagem.nome}] Coletou ${item.tipo} do chão.`],
        }
      }
    }
  }

  return { tipo: 'finalizar', detalhes: {}, logs: [`[${personagem.nome}] Finalizou turno.`] }
}
