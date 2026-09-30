// A SALA DOS FUNDOS de uma birosca (Isaias, 30/09/2026: "tá muito apertado...
// é melhor criar cômodos internos pras coisas do que deixar tudo apertado").
// REGRA: na sala da frente fica só o descanso; agiota, banca de aposta e
// informante vão pros fundos, "onde rola os negócios escusos". Vale pra toda
// birosca de bairro novo também.
//
// `portaFundos` vai no cômodo da frente (canto de cima à direita, livre do
// balcão padrão x108–352); `salaDosFundos` é o cômodo 1, com volta embaixo.
export const portaFundos = w => ({ x: w - 84, y: 30, w: 64, h: 24, para: 1, label: 'fundos' })

export function salaDosFundos(pois) {
  const w = 400, h = 300
  // até 3 pinos, espalhados na altura do meio (a mesa do carteado fica no centro de cima)
  const xs = pois.length === 1 ? [w / 2] : pois.length === 2 ? [80, 320] : [70, 200, 330]
  return {
    id: 'fundos',
    nome: 'games.gangues.cena.fundos_nome',
    world: { w, h }, spawn: { x: w / 2, y: h - 90 },
    voltaPara: 0,
    colliders: [
      { x: 0, y: 0, w, h: 30 }, { x: 0, y: 0, w: 14, h }, { x: w - 14, y: 0, w: 14, h }, { x: 0, y: h - 28, w, h: 28 },
      { x: 140, y: 60, w: 120, h: 50 }, // mesa do carteado
    ],
    cenario: [
      { tipo: 'mesa', x: w / 2, y: 85 }, { tipo: 'cofre', x: 350, y: 70 }, { tipo: 'caixote', x: 50, y: 80 },
    ],
    pois: pois.map((ref, i) => ({ ref, pos: { x: xs[i], y: pois.length === 3 && i === 1 ? 190 : 170 } })),
  }
}
