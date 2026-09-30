/* ══════════════════════════════════════════════════════════════
   CLUBE DA LUTA — regras (módulo independente, pasta clube/)
   A roda clandestina onde o endividado quita a dívida no braço: gauntlet
   de 3 rondas, sem AP e sem XP. Tudo que é número/regra do Clube mora
   aqui; o estado mora em ./ganguesClubeSlice.js e as telas em
   ./GanguesClube*.jsx. O resto do jogo só conhece o Clube por esses
   pontos de entrada:
   • a cena chama store.prepararEntradaClube() (oferecido pelo agiota)
   • o GanguesRoute monta o bando com gerarBandoClube()
   • o hook de vitória entrega o resultado da luta pra store.fecharRondaClube()
   A dívida em si é da agiotagem (storyProgress.__birosca, ver
   store/slices/ganguesBiroscaSlice.js) — o Clube só mexe nela.
   ══════════════════════════════════════════════════════════════ */
import { escalarInimigo, distribuirPontos, numerarRepetidos } from '../data/ganguesEncontros.js'

// Reputação mínima pra entrar "por vontade própria" (sem dívida). Quem já
// deve nunca é barrado — o Clube é a rota de escape dele (sem soft-lock).
export const GANGUES_REP_GATE_CLUBE = 40

export const GANGUES_CLUBE_RONDAS_TOTAL = 3
// Entrada: o agiota já te cura adiantado e fia 15× o preço do descanso.
export const GANGUES_CLUBE_ENTRADA_MULT = 15
// Prêmio da vitória: ver clubePremioDe (data/ganguesLoadout.js), por bairro.
// Venceu a ronda final: ganha o Chip Ígneo (item 22).
export const GANGUES_CLUBE_ITEM_PREMIO = 22

/** Pool do Clube — brigões de galpão (vapores e cobradores mais casca-grossa
 *  da Pista/Feira). Orçamento FIXO e alto (não escala com o jogador): é pra
 *  doer, o cara só cai aqui em último caso, endividado até o pescoço. */
const GANGUES_CLUBE_POOL = [1211, 1212, 1213, 1219, 1311, 1312, 1411, 1412]

// Gauntlet: 1 corpo fraco → 2 → 3 casca-grossa. O orçamento escala com o
// território de onde o jogador veio: a roda da Feira (26/50/80) é pro time
// que já passou da Pista (PLANO_FEIRA.md §1).
const GANGUES_CLUBE_RONDAS = {
  pista: { 1: { qtd: 1, budget: 7 }, 2: { qtd: 2, budget: 15 }, 3: { qtd: 3, budget: 26 } },
  feira: { 1: { qtd: 1, budget: 22 }, 2: { qtd: 2, budget: 42 }, 3: { qtd: 3, budget: 66 } },
  baixada: { 1: { qtd: 1, budget: 36 }, 2: { qtd: 2, budget: 70 }, 3: { qtd: 3, budget: 110 } },
  vila: { 1: { qtd: 1, budget: 49 }, 2: { qtd: 2, budget: 96 }, 3: { qtd: 3, budget: 150 } },
}

export function gerarBandoClube({ enemiesData, ronda = GANGUES_CLUBE_RONDAS_TOTAL, territorioId = 'pista' }) {
  if (!enemiesData?.length) return null
  const tabela = GANGUES_CLUBE_RONDAS[territorioId] || GANGUES_CLUBE_RONDAS.pista
  const cfg = tabela[ronda] || tabela[GANGUES_CLUBE_RONDAS_TOTAL]
  const partes = distribuirPontos(cfg.budget, cfg.qtd)
  const bag = []
  const sortear = () => {
    if (!bag.length) bag.push(...GANGUES_CLUBE_POOL)
    return bag.splice(Math.floor(Math.random() * bag.length), 1)[0]
  }
  const bando = partes.map(pontos => {
    const molde = enemiesData.find(e => e.id === sortear())
    return molde ? escalarInimigo(molde, pontos) : null
  }).filter(Boolean)
  if (!bando.length) return null
  numerarRepetidos(bando)
  return bando
}
