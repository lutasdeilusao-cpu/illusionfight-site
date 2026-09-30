/* ══════════════════════════════════════════════════════════════
   FARM DA RINHA — o idle do Gangues (Isaias, 28/09/2026).
   O farm calculado com o app no fundo existe SÓ na Rinha infinita (POI com
   `rinhaInfinita` — a Rinha da Pista e a Rinha de Apostas da Feira): "o cara
   tem que ir até a rinha e deixar o personagem lá jogando". Em qualquer
   outro lugar o jogo segue AO VIVO no fundo, sem cálculo nenhum, até o
   celular deixar (ver components/cena/GanguesFarmAusente.jsx).

   Na Rinha, com o app no fundo, a tela é desmontada e na volta o que teria
   acontecido é CALCULADO: 1 luta a cada 5 minutos fora (GANGUES_RINHA_S_POR_LUTA),
   seja ela qual for — 20 minutos, 4 lutas. Cada luta sorteia um adversário
   novo pelo mesmo gerador da Rinha ao vivo (nível em volta da tropa, de 5
   abaixo a 2 acima do mais forte — niveisDaRinha) e é SIMULADA de verdade, rodada
   a rodada, no motor da Briga em Multidão (engine/ganguesBrigaMultidao.js):
   dá pra perder, o dano fica. Fora da tela é sempre ATAQUE NORMAL (sem
   talento, sem PM); só a poção de PV, se ligada, entra.
   • o ponto de saída mora no SAVE (storyProgress.__farmAusente): aba
     descartada pelo celular não perde a conta;
   • a luta que estava na tela quando o app foi pro fundo é a 1ª — segue do
     ponto exato onde parou (`lutaAoVivo`);
   • lutas que terminaram AO VIVO nos minutos antes da tela desmontar já
     contam dentro do ritmo (`lutasVivas`) — nada é contado duas vezes;
   • os minutos que não fecham 5 são a luta que estava NO MEIO quando o
     jogador voltou — NÃO CONTA (sem dano, poção nem prêmio);
   • no máximo +5 níveis por ausência (GANGUES_FARM_TETO_NIVEIS);
   • perdeu uma luta COM grana pra recuperação do bairro (30 na Pista) = a
     casa desconta, remenda a tropa e a roda segue (30/09/2026);
   • perdeu SEM grana = para ali, sem XP dessa luta, a tropa acorda na
     birosca DAQUELE bairro e TODO automático desliga.
   ══════════════════════════════════════════════════════════════ */
import { iniciarBrigaMultidao, iniciarBrigaMultidaoDeCombatentes, avancarRodadaMultidao } from './ganguesBrigaMultidao.js'
import { calcularApTotal, calcularPesosEParticipantes, calcularRecompensaCena } from './ganguesVictoryResolver.js'
import { gerarBandoRevezamento } from '../data/ganguesEncontros.js'
import { revezamentoNoTerritorio, destinoSocorroDerrota, custoRecuperacaoRinha } from '../data/cenas/cenaHelpers.js'
import { getGanguesLevelFromXp } from '../data/ganguesCharacters.js'
import { GANGUES_STORY_BATTLE_PARTY_MAX } from '../data/ganguesLoadout.js'
import { GANGUES_SUCATA_ID } from '../data/ganguesEquip.js'
import { GANGUES_ITENS_LISTA } from '../data/ganguesItens.js'
import { desligarAutomaticos } from '../hooks/useGanguesBrigaAutomatica.js'
import { lerAutoConfig, melhorPocao, POCAO_LIMIAR_PV } from '../hooks/useGanguesModoAuto.js'

/** 1 luta a cada 5 minutos fora, na Rinha (Isaias, 28/09/2026: "a cada
 *  cinco minutos rola uma batalha, seja ela qual for... se o cara ficar 20
 *  minutos, ele teve quatro batalhas"). */
export const GANGUES_RINHA_S_POR_LUTA = 5 * 60
/** Teto de níveis por ausência — "no máximo 5 levels" (Isaias). */
export const GANGUES_FARM_TETO_NIVEIS = 5
/** Rede de segurança de processamento (~8h fora) — o teto de nível
 *  costuma parar bem antes. */
const GANGUES_FARM_MAX_LUTAS = 100
const GANGUES_FARM_MAX_RODADAS = 80
// Mesma chance de sucata da vitória de rua de verdade (useGanguesVictoryResolution).
const GANGUES_FARM_SUCATA_CHANCE = 0.2

const nivelDe = m => getGanguesLevelFromXp(m?.xp_total ?? 0)
const remendar = m => ({ ...m, attributes: { ...m.attributes, pv_atual: null, pm_atual: null } })

/** A sessão de Rinha infinita desse storyTarget (null se não for). */
export const rinhaDoAlvo = alvo => (alvo?.rinha && alvo.cenaId && alvo.revezamento?.pool?.length ? alvo : null)

// Poção de PV DENTRO da luta calculada, rodada a rodada — a mesma regra do
// automático ao vivo (escolherAcaoAuto): alguém com PV ≤ 50% → o MAIS
// INTEIRO da tropa gasta a vez dele dando a poção de PV (1 por rodada). Quem
// usa item abre mão do ataque naquela rodada (personagensUsandoItem). A bolsa
// NÃO é tocada aqui: as poções ficam anotadas em `usos` e só saem da bolsa se
// a luta contar (terminou dentro do tempo fora — ver simularFarmAusente).
function pocaoDaRodada(estado, { store, config, usos }) {
  const usandoItem = {}
  if (!config.pocao) return { estado, usandoItem }
  const lista = estado.combatants.map(c => ({ ...c }))
  const vivos = lista.filter(c => c.side === 'player' && c.pv > 0 && c.pvMax > 0)
  const inv = store().inventario
  const itens = GANGUES_ITENS_LISTA.map(i => ({ ...i, quantidade: (inv[i.id] || 0) - (usos[i.id] || 0) }))
  const ferido = vivos.filter(c => c.pv / c.pvMax <= POCAO_LIMIAR_PV).sort((a, b) => a.pv / a.pvMax - b.pv / b.pvMax)[0]
  const maisInteiro = [...vivos].sort((a, b) => (b.pv - a.pv) || (b.pv / b.pvMax - a.pv / a.pvMax))[0]
  const pocao = ferido && maisInteiro && melhorPocao(itens, 'cura_pv', ferido.pvMax - ferido.pv)
  if (pocao) {
    usos[pocao.id] = (usos[pocao.id] || 0) + 1
    ferido.pv = Math.min(ferido.pvMax, ferido.pv + pocao.valor)
    usandoItem[maisInteiro.id] = true
  }
  return { estado: { ...estado, combatants: lista }, usandoItem }
}

// Simula a luta de verdade, rodada a rodada, até o fim — o MESMO motor de
// combate da Briga em Multidão (dá pra perder; o dano fica). No segundo
// plano é sempre ATAQUE NORMAL: nenhum talento, nenhum PM gasto (Isaias,
// 28/09/2026); só a poção de PV, se ligada. Devolve também as poções que
// usou (`usos`, ainda não tiradas da bolsa).
function rodarLuta(estadoInicial, { store, config }) {
  let estado = estadoInicial
  const usos = {}
  for (let i = 0; i < GANGUES_FARM_MAX_RODADAS && !estado.terminado; i++) {
    const r = pocaoDaRodada(estado, { store, config, usos })
    estado = avancarRodadaMultidao(r.estado, {}, {}, r.usandoItem)
  }
  return { outcome: estado.outcome || 'defeat', combatants: estado.combatants, usos }
}

// A luta contou: as poções que ela usou saem da bolsa de verdade.
function gastarPocoes(store, usos, resumo) {
  for (const [id, n] of Object.entries(usos)) {
    for (let k = 0; k < n; k++) if (store().usarItem(Number(id))) resumo.pocoes++
  }
}

/** A luta que estava NA TELA quando o app foi pro fundo (GanguesCombat
 *  registra aqui a cada render um leitor do estado vivo — combatentes com o
 *  PV/PM de agora, rodada, automático ligado). O embrulho da luta lê isso na
 *  hora de desmontar a tela, pra terminar a MESMA luta por cálculo. */
export const lutaAoVivo = { ler: null }

// Aplica o resultado de UMA luta calculada da Rinha no store, com as mesmas
// regras da tela de vitória de verdade (useGanguesVictoryResolution): dano,
// AP, álbum, grana/rep/itens do ponto, aposta (só a da 1ª luta da sessão) e
// sucata. Perdeu, nada dessa luta — e a sessão acaba ali (simularFarmRinha para).
function aplicarLuta({ store, cena, alvo, party, outcome, combatants, resumo }) {
  const s = store()
  resumo.lutas++
  s.aplicarDanoPersistente(combatants)
  if (outcome !== 'victory') return
  resumo.vitorias++
  const inimigos = combatants.filter(c => c.side === 'enemy')
  const pontosMaisForte = Math.max(1, ...party.map(m => ['A', 'H', 'D', 'PV', 'PM'].reduce((t, k) => t + (Number(m.attributes?.[k]) || 0), 0)))
  const apBruto = calcularApTotal({ victory: true, enemyCount: inimigos.length, cenaChefe: false, torre: false, inimigosAttrs: inimigos.map(c => c.attributes), pontosMaisForte, tamanhoTime: party.length, territorioId: alvo.territorioId })
  const { pesosPorId, nivelPorId } = calcularPesosEParticipantes({ victory: true, report: { combatants, contribuicoes: {} }, match: { playerTeam: party } })
  s.gainApForParticipants(Math.max(party.length, apBruto), pesosPorId, nivelPorId)
  s.registrarNoAlbum(inimigos.map(c => c.id))
  s.marcarPoiResolvido(cena.id, alvo.cenaPoiId, [])
  const { grana, rep, itens } = calcularRecompensaCena({ emCena: true, storyAlvo: alvo, enemyCount: inimigos.length })
  if (grana) s.ganharGrana(grana)
  if (rep) s.ganharRep(rep)
  itens.forEach(({ id, qtd }) => s.darItem(id, qtd))
  if (alvo.aposta > 0) s.ganharGrana(Math.round(alvo.aposta * (alvo.apostaMult || 2)))
  if (Math.random() < GANGUES_FARM_SUCATA_CHANCE) s.darItem(GANGUES_SUCATA_ID, 1)
}

/** O que aconteceu na Rinha com o app no fundo. `store` = useGanguesStore.getState
 *  (lido de novo a cada luta — as ações mudam o estado).
 *  • `alvo`: o storyTarget da sessão de Rinha (rinhaDoAlvo);
 *  • `lutaEmAndamento` ({ combatants, round }): a luta que estava na tela —
 *    é a 1ª, segue do ponto exato onde parou;
 *  • `lutasVivas`: lutas que já terminaram ao vivo no fundo (contam no ritmo).
 *  Devolve o resumo pra tela "Enquanto você tava fora". */
export function simularFarmRinha({ store, cena, segundos, enemiesData, alvo, lutaEmAndamento = null, ids: idsMarcados = null, lutasVivas = 0 }) {
  const s0 = store()
  const autoConfig = lerAutoConfig()
  const selecionados = s0.activeParty.filter(m => s0.roster.some(r => r.id === m.id))
  const ids = idsMarcados?.length
    ? idsMarcados.filter(id => s0.roster.some(r => r.id === id))
    : (selecionados.length ? selecionados : s0.roster).slice(0, GANGUES_STORY_BATTLE_PARTY_MAX).map(m => m.id)
  const nivel0 = Object.fromEntries(s0.roster.filter(m => ids.includes(m.id)).map(m => [m.id, nivelDe(m)]))
  const modo = s0.storyProgress?.__dificuldade || 'medio'
  const resumo = { meioNaoConta: false, lutas: 0, vitorias: 0, pocoes: 0, niveis: {}, teto: false }
  // Quantas lutas cabem no tempo fora, descontando as que já rolaram ao vivo.
  let lutas = Math.max(0, Math.floor(segundos / GANGUES_RINHA_S_POR_LUTA) - lutasVivas)
  let emAndamento = lutaEmAndamento
  for (let n = 0; alvo && n < GANGUES_FARM_MAX_LUTAS; n++) {
    if (lutas <= 0) { resumo.meioNaoConta = true; break }
    const party = store().roster.filter(m => ids.includes(m.id))
    if (party.some(m => nivelDe(m) - nivel0[m.id] >= GANGUES_FARM_TETO_NIVEIS)) { resumo.teto = true; break }
    if (!party.length) break
    let inicio
    if (emAndamento?.combatants?.length) {
      inicio = iniciarBrigaMultidaoDeCombatentes(emAndamento.combatants, emAndamento.round || 1)
      emAndamento = null
    } else {
      const bando = gerarBandoRevezamento({ ...revezamentoNoTerritorio(alvo.revezamento, alvo.territorioId, party), enemiesData, modo, playerTeam: party })
      if (!bando?.length) break
      // Luta nova da sessão: a casa remenda a tropa (igual à Rinha ao vivo).
      inicio = iniciarBrigaMultidao({ playerTeam: party.map(remendar), enemyTeam: bando })
    }
    const { outcome, combatants, usos } = rodarLuta(inicio, { store, config: autoConfig })
    lutas--
    gastarPocoes(store, usos, resumo)
    // A aposta (Feira) só vale na luta que já estava na tela — a 1ª da sessão.
    aplicarLuta({ store, cena, alvo: n === 0 && lutaEmAndamento ? alvo : { ...alvo, aposta: 0 }, party, outcome, combatants, resumo })
    // Perdeu com grana: a casa cobra a recuperação e a roda segue (igual à
    // Rinha ao vivo). Sem grana, acabou: mesmo socorro da derrota ao vivo —
    // birosca mais perto, recuperação cobrada.
    if (outcome !== 'victory') {
      const custo = custoRecuperacaoRinha(cena, store().cenaProgresso?.[cena.id])
      if (store().grana >= custo && store().gastarGrana(custo)) {
        store().restaurarPvPmTodos()
        resumo.remendos = (resumo.remendos || 0) + 1
        resumo.gastoRemendo = (resumo.gastoRemendo || 0) + custo
        continue
      }
      resumo.derrota = true
      desligarAutomaticos()
      const destino = destinoSocorroDerrota(cena, store().cenaProgresso?.[cena.id])
      if (destino) {
        store().socorroDerrota(cena.pois.find(p => p.id === destino.poiId)?.custoGrana || 10)
        store().salvarPosicaoCena(cena.id, destino.posicao)
      }
      break
    }
  }

  const fim = store()
  for (const m of fim.roster.filter(r => ids.includes(r.id))) {
    const ganho = nivelDe(m) - nivel0[m.id]
    if (ganho > 0) resumo.niveis[m.id] = { nome: m.sheet_name, de: nivel0[m.id], para: nivelDe(m) }
  }
  if (!resumo.teto) resumo.teto = Object.values(resumo.niveis).some(v => v.para - v.de >= GANGUES_FARM_TETO_NIVEIS)
  if (resumo.lutas) fim.saveParticipantProgress(ids)
  return resumo
}
